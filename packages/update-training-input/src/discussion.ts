import type { BinaryLike } from 'node:crypto';
import { createHmac } from 'node:crypto';
import z from 'zod';

type DiscussionAPIClientConfig = {
	discussionApiUrl: string;
	discussionApiKey: string;
};

type DiscussionComment = {
	status: string;
	body: string;
};

const Comment = z.object({
	status: z.string(),
	body: z.string(),
});
type Comment = z.infer<typeof Comment>;

const GetCommentResponse = z.object({
	comments: z.array(Comment),
});

const calculateHmac = (key: string, content: BinaryLike): string => {
	const hmac = createHmac('sha256', key);
	hmac.update(content);
	return hmac.digest('base64');
};

export const discussionApiClient = (config: DiscussionAPIClientConfig) => {
	const get = async (uri: string): Promise<Response> => {
		const now = new Date();
		const url = new URL(`${config.discussionApiUrl}${uri}`);

		const hmacInput = ['GET', '', '', now.toUTCString(), url.pathname].join(
			'\n',
		);
		const hmac = calculateHmac(config.discussionApiKey, hmacInput);

		return fetch(`${config.discussionApiUrl}${uri}`, {
			method: 'GET',
			headers: {
				Authorization: `HMAC ${hmac}`,
				Date: now.toUTCString(),
			},
		});
	};

	const getComments = async (date: Date): Promise<DiscussionComment[]> => {
		const start = new Date();
		start.setHours(1, 0, 0, 0);

		const end = new Date(date);
		end.setHours(24, 59, 59, 999);

		console.log(
			`Fetching comments between ${start.toISOString()} to ${end.toISOString()}`,
		);

		let page = 1;
		const queryParamers = new URLSearchParams({
			sinceTimestamp: start.getTime().toString(),
			beforeTimestamp: end.getTime().toString(),
			page: page.toString(),
		});

		const comments: DiscussionComment[] = [];

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- we want to loop until we have no more comments
		while (true) {
			const response = await get(
				`/moderation/comments?${queryParamers.toString()}`,
			);
			const data = GetCommentResponse.parse(await response.json());
			comments.push(...data.comments);

			page++;
			queryParamers.set('page', page.toString());

			if (data.comments.length === 0) {
				break;
			}
		}

		return comments;
	};

	return {
		getComments,
	};
};
