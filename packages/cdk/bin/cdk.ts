import 'source-map-support/register';
import { GuRoot } from '@guardian/cdk/lib/constructs/root';
import { EireneV2 } from '../lib/eirene-v2';

const app = new GuRoot();
new EireneV2(app, 'EireneV2-euwest-1-DEV', {
	stack: 'discussion',
	stage: 'CODE',
	env: { region: 'eu-west-1' },
});
new EireneV2(app, 'EireneV2-euwest-1-CODE', {
	stack: 'discussion',
	stage: 'CODE',
	env: { region: 'eu-west-1' },
});
new EireneV2(app, 'EireneV2-euwest-1-PROD', {
	stack: 'discussion',
	stage: 'PROD',
	env: { region: 'eu-west-1' },
});
