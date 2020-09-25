import * as cdk from '@aws-cdk/core';
import * as cognito from '@aws-cdk/aws-cognito';
import { Envs } from '../../types/envs';
import { Duration } from '@aws-cdk/core';
import { OAuthScope, ProviderAttribute, UserPoolClientIdentityProvider } from '@aws-cdk/aws-cognito';

interface UserPoolProps {
  projectName: string;
  productName: string;
  clientName: string;
  clientUrls: string[];
  facebookAppId: string;
  facebookAppSecret: string;
  env: Envs;
}

export class UserPoolService extends cdk.Construct {
  public readonly pool: cognito.UserPool;
  public readonly userPoolArn: string;
  public readonly userPoolName: string;
  public readonly userPoolId: string;
  public readonly userPoolClientId: string;
  public readonly userPoolClientName: string;
  public readonly identityProviderFacebook: cognito.UserPoolIdentityProviderFacebook;


  constructor(scope: cdk.Construct, id: string, props: UserPoolProps) {
    super(scope, id);

    const { projectName, env, productName, clientUrls, facebookAppId, facebookAppSecret } = props;

    const userPool = new cognito.UserPool(this, 'UserPoolService', {
      userPoolName: `${projectName}-user-pool-${env}`,
      selfSignUpEnabled: true,
      userVerification: {
        emailSubject: `Verify your email for ${productName}!`,
        emailBody: `Hello {username}, Thanks for signing up to ${productName}! Your verification code is {####}`,
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
        'isAdmin': new cognito.BooleanAttribute({ mutable: true }),
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

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPoolClientName: `${projectName}-user-pool-client-${env}`,
      userPool,
      generateSecret: false,
      supportedIdentityProviders: [UserPoolClientIdentityProvider.FACEBOOK],
      authFlows: {
        adminUserPassword: true,
        userSrp: true,
        userPassword: true,
        refreshToken: true,
      },
      oAuth: {
        callbackUrls: clientUrls,
        logoutUrls: clientUrls,
        scopes: [OAuthScope.EMAIL, OAuthScope.PROFILE, OAuthScope.OPENID],
        flows: { implicitCodeGrant: true },
      }
    });

    const identityProviderFacebook = new cognito.UserPoolIdentityProviderFacebook(this, 'FacebookSignIn', {
      userPool,
      apiVersion: 'v8.0',
      clientId: facebookAppId,
      clientSecret: facebookAppSecret,
      attributeMapping: {
        preferredUsername: ProviderAttribute.FACEBOOK_EMAIL,
        email: ProviderAttribute.FACEBOOK_EMAIL,
      },
      scopes: ['public_profile', 'email']
    })

    this.pool = userPool;
    this.userPoolName = `${projectName}-user-pool-${env}`;
    this.userPoolId = userPool.userPoolId;
    this.userPoolArn = userPool.userPoolArn;

    this.userPoolClientId = userPoolClient.userPoolClientId;
    this.userPoolClientName = userPoolClient.userPoolClientName;

    this.identityProviderFacebook = identityProviderFacebook;
  }
}
