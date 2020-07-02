import * as cdk from '@aws-cdk/core';
import { Secret } from '@aws-cdk/aws-secretsmanager';

interface SecretsManagerProps {
  secretName: string,
  secretValue: {
    [key: string]: any,
  },
}

export class SecretsManager extends cdk.Construct {
  public readonly secret: Secret

  constructor(scope: cdk.Construct, id: string, props: SecretsManagerProps) {
    super(scope, id);

    this.secret = new Secret(this, `${props.secretName}-sm`, {
      secretName: props.secretName,
      generateSecretString: {
        secretStringTemplate: JSON.stringify(props.secretValue),
        generateStringKey: 'secret',
      }
    });
  }
}