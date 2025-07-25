import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { EireneV2 } from './eirene-v2';

describe('The EireneV2 stack', () => {
	it('matches the snapshot', () => {
		const app = new App();
		const stack = new EireneV2(app, 'EireneV2', {
			stack: 'discussion',
			stage: 'TEST',
		});
		const template = Template.fromStack(stack);
		expect(template.toJSON()).toMatchSnapshot();
	});
});
