import * as cdk from '@aws-cdk/core';
import * as ssm from '@aws-cdk/aws-ssm';

import { Envs } from '../../types/envs';

interface ParemeterStoreProps {
  parameterName: string;
  value: string | {
    projectName?: string;
    clientName?: string;
    env?: Envs;
  }
}

export class ParameterStore extends cdk.Construct {
  public parameter: ssm.StringParameter;

  constructor(scope: cdk.Construct, id: string, props: ParemeterStoreProps) {
    super(scope, id);

    this.parameter = new ssm.StringParameter(this, 'StackVariables', {
      allowedPattern: '.*',
      parameterName: props.parameterName,
      stringValue: typeof props.value === 'string' ? props.value : JSON.stringify(props.value),
      tier: ssm.ParameterTier.STANDARD,
    });
  }
};