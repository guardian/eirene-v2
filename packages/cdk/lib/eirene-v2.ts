import type { GuStackProps } from '@guardian/cdk/lib/constructs/core';
import { GuStack } from '@guardian/cdk/lib/constructs/core';
import { GuLambdaFunction } from '@guardian/cdk/lib/constructs/lambda';
import type { App } from 'aws-cdk-lib';
import { Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';

export class EireneV2 extends GuStack {
	constructor(scope: App, id: string, props: GuStackProps) {
		super(scope, id, props);

		const app = 'eirene-v2';

		const bucket = new Bucket(this, 'EireneV2Bucket', {
			bucketName: `gu-eirene-v2-${this.stage.toLowerCase()}`,
		});

		// Lambda function not needed in DEV as it is run locally
		if (this.stage !== 'DEV') {
			const lambda = new GuLambdaFunction(this, 'EireneV2Lambda', {
				app,
				functionName: `update-training-input-${this.stage}`,
				fileName: `${app}.zip`,
				runtime: Runtime.NODEJS_22_X,
				handler: 'index.handler',
				environment: {
					STAGE: this.stage,
					S3_BUCKET: bucket.bucketName,
				},
			});

			bucket.grantReadWrite(lambda);
		}

		const dataAccessRole = new Role(this, 'EireneV2DataAccessRole', {
			assumedBy: new ServicePrincipal('comprehend.amazonaws.com'),
			roleName: `EireneV2DataAccessRole-${this.stage}`,
		});
		bucket.grantRead(dataAccessRole);

		// new CfnFlywheel(this, 'EireneV2Flywheel', {
		// 	flywheelName: `${app}-${this.stage}`,
		// 	dataAccessRoleArn: dataAccessRole.roleArn,
		// 	dataLakeS3Uri: bucket.bucketArn,
		// 	modelType: 'DOCUMENT_CLASSIFIER',
		// 	taskConfig: {
		// 		documentClassificationConfig: {
		// 			mode: 'MULTI_CLASS',
		// 		},
		// 		languageCode: 'en',
		// 	}
		// });
	}
}
