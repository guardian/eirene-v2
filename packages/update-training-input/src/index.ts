
import { discussionApiClient } from "./clients/discussion";
import { getConfig } from "./config";

export const handler = async () => {
    const config = await getConfig();

    const date = new Date();
    date.setDate(date.getDate() - 1);

    const discussion = discussionApiClient(config);

    console.log(`Fetching comments for ${date.toISOString()}`);
    const comments = await discussion.getComments(date);
    console.log(`Fetched ${comments.length} comments`);
}