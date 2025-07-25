import {
	GetSecretValueCommand,
	SecretsManagerClient,
} from '@aws-sdk/client-secrets-manager';

export type Config = {
	stage: string;
	discussionApiUrl: string;
	discussionApiKey: string;
	s3Bucket?: string;
};

const isDefinedOrThrow = <T>(value: T | undefined, message: string): T => {
	if (value === undefined) {
		throw new Error(message);
	}
	return value;
};

export const getConfig = async (): Promise<Config> => {
	const stage = isDefinedOrThrow(
		process.env.STAGE,
		'Missing STAGE environment variable',
	);
	const s3Bucket = isDefinedOrThrow(
		process.env.S3_BUCKET,
		'Missing S3_BUCKET environment variable',
	);

	const secretName = `/discussion/${stage}/eirene-v2/discussionApiKey`;
	const secretsManager = new SecretsManagerClient();
	const secret = await secretsManager.send(
		new GetSecretValueCommand({
			SecretId: secretName,
		}),
	);

	const discussionApiKey = isDefinedOrThrow(
		secret.SecretString,
		`Could not parse secret "${secretName}" as a string`,
	);

	return {
		stage,
		discussionApiUrl:
			stage === 'PROD'
				? 'https://discussion.guardianapis.com/discussion-api'
				: 'https://discussion.code.dev-guardianapis.com/discussion-api',
		discussionApiKey,
		s3Bucket,
	};
};
