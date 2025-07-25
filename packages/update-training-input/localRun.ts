import { handler } from "./src";

process.env.STAGE = "DEV";
process.env.AWS_REGION = "eu-west-1";
process.env.AWS_PROFILE = "discussion";

void (async () => {
    await handler()
})();