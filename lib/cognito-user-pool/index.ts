import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import { Envs } from '../../types/envs';

const { Duration } = cdk;

interface UserPoolProps {
  projectName: string;
  clientName: string;
  env: Envs;
}

export class UserPoolService extends cdk.Construct {
  public readonly userPoolName: string;
  public readonly userPoolId: string;
  public readonly userPool: cognito.UserPool;

  constructor(scope: cdk.Construct, id: string, props: UserPoolProps) {
    super(scope, id);

    const { projectName, env } = props;

    this.userPool = new cognito.UserPool(this, 'UserPoolService', {
      userPoolName: `${projectName}-user-pool-${env}`,
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: `Verify your email for ${projectName}!`,
        emailBody: `Hello {username}, Thanks for signing up to ${projectName}! Your verification code is {####}`,
        emailStyle: cognito.VerificationEmailStyle.CODE,
      },
      signInAliases: {
        username: true,
        email: true,
      },
      autoVerify: { email: true},
      standardAttributes: {
        fullname: {
          required: true,
          mutable: true,
        },
        email: {
          required: true,
          mutable: true,
        }
      },
      customAttributes: {
        'role': new cognito.StringAttribute({ mutable: true }),
        'isTeacher': new cognito.BooleanAttribute({ mutable: true }),
        'isStudent': new cognito.BooleanAttribute({ mutable: true }),
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: true,
        tempPasswordValidity: Duration.days(30),
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });
    this.userPoolName = this.userPool.userPoolProviderName;
    this.userPoolId = this.userPool.userPoolId;
  }
}
