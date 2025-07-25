import { discussionApiClient } from './discussion';
import { getConfig } from './config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export const handler = async () => {
	const config = await getConfig();

	const date = new Date();
	date.setDate(date.getDate() - 1);

	const discussion = discussionApiClient(config);
	const s3 = new S3Client();

	console.log(`Fetching comments for ${date.toISOString()}`);
	const comments = await discussion.getComments(date);
	console.log(`Fetched ${comments.length} comments`);

	console.log('Generating CSV...');
	const csv = comments
		.map((comment) => `${comment.body},${comment.status}`)
		.join('\n');

	await s3.send(
		new PutObjectCommand({
			Bucket: config.s3Bucket,
			Body: csv,
			Key: `${config.stage}/${date.toISOString().split('T')[0]}.csv`,
		}),
	);

	console.log(
		`Uploaded CSV to s3://${config.s3Bucket}/${config.stage}/${date.toISOString().split('T')[0]}.csv`,
	);
};
