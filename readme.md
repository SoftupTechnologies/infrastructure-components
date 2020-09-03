### Serverless - Reference Infrastructure

This repository contains the list of resources that are common for creating the infrastructure of an application. Components like a VPC (Virtual Private Cloud), subnets, server instances, database services like RDS (Relational Database Service), authentication with AWS Cognito etc...
We will describe each component in upcomming steps. 

- [Setup](#setup)
  - [AWS cli setup](#aws-cli-setup)
  - [AWS cdk installation](#aws-cdk-installation)
- [Components](#components)
  - [Vpc](#vpc)
    - [Properties](#properties)
  - [Rds](#rds)
    - [Properties](#properties-1)
  - [Secrets manager](#secrets-manager)
    - [Properties](#properties-2)
  - [Bastion Host](#bastion-host)
    - [Properties](#properties-3)
  - [Artifacts Bucket](#artifacts-bucket)
    - [Properties](#properties-4)
  - [Client application bucket](#client-application-bucket)
    - [Properties](#properties-5)
  - [Cognito user pool](#cognito-user-pool)
  - [Parameter store](#parameter-store)
- [Usage](#usage)
- [Creating a simple stack example](#creating-a-simple-stack-example)

## Setup

Setup section will include the environment preparation that we need to work with this boilerplate. Things like **aws cli**, and **aws cdk** which is a development kit that we will use to generate our resources and logic between infrastructure components. The output from **aws cdk** is a cloudformation template that is deployed to aws.

### AWS cli setup

To set up **aws cli** you need to follow the download instructions based on what system you have.
In this [link](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) you will find the intructions to install the v2 of **aws cli**. This version is recomended from AWS

To configure the **aws cli** we need the **access key id** and **access secret key id** from our user in aws account. These keys can provided from the account owner through IAM service or if you are the account owner you can create a user and generate a pair of keys.

In the terminal run:

`aws configure`

Fill in the information with the access key id and access secret key id, the default region that you want to aws cli to use and set the output as `json`
This creates the default profile to interact with aws resources through cli. To check the profile configuration and credentials run:

`cat ~/.aws/config`

`cat ~/.aws/credentials`

### AWS cdk installation

To install **aws cdk** globally run:

`npm install -g aws-cdk`

To deploy the resources in aws the configured IAM user should have permissions in the specific resources, or be an admin that has access in all the resources. Ideally the user set up to use aws cdk should have limited permissions only on the resources that are needed.

This boilerplate is developed using *Typescript* so the setup will be using the *Typescript* language.

Create a directory:

`mkdir my-cdk-app`

`cd my-cdk-app`

And run:

`cdk init app --language typescript`

The cdk cli will generate the environment we need to develop the components.
If you have a specific profile name in your aws configuration, rather than the **default** one, you must set the AWS_PROFILE variable before executing aws cdk commands.

`export AWS_PROFILE=[PROFILE NAME]`

To create the toolkit that will manage the resources in cloudformation run:

`cdk bootstrap`

This creates a toolkit which cdk uses to make stack diffs and other duties.

Other commands:

`yarn watch` to always transpile the TS to JS and check for errors.

`cdk diff` to see the changes in resources before deploying the stack.

`cdk deploy` deploys the stack to cloudformation (Will ask for confirmation).

`cdk deploy --require-approval never` to skip the confirmation.

`cdk destroy` to delete the created cloudformation stack (Will ask for confirmation).

`cdk destroy --force` to skip the confirmation.

## Components

All the components are found int the `/lib` folder in our cdk project. All the components are called in the main `/lib` file which the cli has created for us, in our case is `/lib/serverless-infrastructure-cdk-stack.ts`.

We will add our components inside this block of code:

```
import * as cdk from '@aws-cdk/core';

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);
  }
}
```

These are the main props that we have on our stack. Based on **project name**, **client name** and *environment* we can compose our resource namings. The **region** prop is needed in the stack to get some common variables provided from aws cdk which are based on stack variables on **CloudFormation**.

```
interface StackProps {
  projectName: string,
  clientName: string,
  region: string,
  env: Envs,
}
```

The entrypoint of our cdk app is inside `/bin` folder. Inside `/bin/serverless-infrastructure-cdk.d.ts` we call our composed stacks:

```
import * as cdk from '@aws-cdk/core';
import { ServerlessInfrastructureCdkStack } from '../lib/serverless-infrastructure-cdk-stack';
import { Envs } from '../types/envs'

const app = new cdk.App();
new ServerlessInfrastructureCdkStack(app, 'Test', {
  projectName: 'my-cool-infrastructure',
  clientName: 'my-cool-client',
  env: Envs.DEV,
  region: aws-region-here, // eu-centra-1, us-central-1 etc..
});
```

This generates the stack with all our resources.

### Vpc

Path: `/lib/vpc/index.ts`

Exports: `MyVpc`

Required construct packages: `@aws-cdk/aws-ec2`

The custom construct **MyVpc** wraps a common configuration for creating a vpc by just giving it some basic requirements, like vpc CIDR block and number of public subnets you need in the vpc.

Calling the **MyVpc** class in the main stack:

```
import * as cdk from '@aws-cdk/core';
import { MyVpc } from './vpc';

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);

    const { vpc } = new MyVpc(this, 'MyAwesomeVpc', {
      vpcCidr: '10.0.0.0/16',
      publicSubnetsNo: 2,
      maxAzs: 2,
      privateSubnetsNo: 1,
    });
  }
}
```

This will create a vpc with 2 AZs (Availabilaty zones), 2 public subnets and 1 subnet for each AZ.

#### Properties

Name | Type | Required | Default value | Description
-----|------|----------|---------------|-------------
vpcCidr | string | true | undefined | The CIDR block of addresses available in vpc.
maxAzs | number | false | undefined | Number of Availability Zones (AZ) for the vpc.
publicSubnetsNo | number | true | undefined | Public subnet number per AZ.
privateSubnetsNo | number | false | undefined | Private subnet number per AZ.
isolatedSubnetsNo | number | false | undefined | Isolated subnet number per AZ.

### Rds

Path: `/lib/rds/index.ts`

Exports: `RdsInfrastructure`

Required construct packages: `@aws-cdk/aws-ec2`, `@aws-cdk/aws-rds`

This construct creates a RDS database instance with your desired database engine that AWS supports. The instance by default will accept connections only from the ip ranges of the vpc. To allow extra ingress trafic in your database you need to pass an array of **Security groups**.

You can configure the database placement in the vpc by setting one of these two props: `publicAccessible` or `dbSubnets`. The first one will add the RDS instance in the public subnet of your vpc.

Calling the **RdsInfrastructure** class in the main stack:

```
import * as cdk from '@aws-cdk/core';
import { RdsInfrastructure } from './rds';

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);

    const { vpc } = new MyVpc(this, 'MyAwesomeVpc', {
      vpcCidr: '10.0.0.0/16',
      publicSubnetsNo: 2,
      maxAzs: 2,
      privateSubnetsNo: 1,
    });

    // props include the projectName, clientName and env

    const db = new RdsInfrastructure(this, 'MyCoolDbService', {
      ...props,
      dbMasterUserName: 'coolUsername',
      vpc,
      databaseName: 'coolDatabase',
      publicAccessible: true,
      dbAllocatedStorage: 10,
      dbBackupRetention: 30,
    });
  }
}
```

This will create a database instance with Postgres engine and place it in our public subnets group. Since we dont define a password for our database, it will automatically generate one and store it in **Secrets Manager service** in AWS.

#### Properties

Name | Type | Required | Default | Description
-----|------|----------|---------|---------------------
projectName | string | true | undefined | The project name, which is used to compose different names and defining keys.
env | Envs { dev, stage, prod } | true | undefined | The environment, which is used to set different properties and compose different names and keys.
clientName | string | true | undefined | The client name, which is used to compose different names and defining keys.
dbMasterUserName | string | true | undefined | Database username.
dbMasterUserPassword | string | false | undefined | Database password. If not set it will be generated automatically and will be stored in **Secrets Manager**
vpc | ec2.Vpc | true | undefined | The Vpc in which the database will be set.
databaseName | string | true | undefined | Name of the database that will be created.
ingressSgs | ec2.SecurityGroup[] | false | undefined | Extra security groups for the database to accept connections beside the vpc ip range.
dbPort | number | false | 5432 | Database port.
dbEngine | rds.IInstanceEngine | false | POSTGRES | Database engine.
dbSubnets | ec2.ISubnet[] | false | undefined | Subnets to place the database (sets vpcPlacement property for rds).
publicAccessible | boolean | false | undefined | Places the database in public subnets group (sets vpcPlacement property for rds).
dbInstanceType | ec2.InstanceType | false | T2 MICRO | Database server instance type.
dbAllocatedStorage | number | false | Envs.PROD => 20, Envs.DEV => 5 | Disk storage.
dbBackupRetention | number | false | 10 | Number of days for RDS service to store the database snapshots.
multiAz | boolean | false | false | Specifies if the RDS will be highly available or not.

### Secrets manager

Path: `/lib/secrets-manager/index.ts`

Exports: `SecretsManager`

Required construct packages: `@aws-cdk/aws-secretsmanager`

This construct stores a json object in secrets manager and also generate a secret value.

```
import * as cdk from '@aws-cdk/core';
import { SecretsManager } from './secrets-manager';

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);

    const secret = new SecretsManager(this, 'SuperSecretData', {
      secretName: superSecret,
      secretValue: {
        a: 1,
        b: 2,
      }
    });
  }
}
```

#### Properties

Name | Type | Required | Default | Description
-----|------|----------|---------|------------
secretName | string | true | undefined | Secret name to identify it in Secrets Manager service.
secretValue | json | true | undefined | Secret value.

### Bastion Host

Path: `/lib/bastion-host/index.ts`

Exports: `BastionHostServices`

Required construct packages: `@aws-cdk/aws-ec2`, `@aws-cdk/aws-s3`, `@aws-cdk/aws-iam`, `@aws-cdk/aws-s3-assets`

Bastion host (BH) will serve us as a tunnel to access instances or databases which are in the private subnets. The BH we have constructed is composed by an ec2 instance and s3 bucket. The bucket serves to store the users' public keys in the format **name.pub**. The instance polls the bucket every 3 minutes to check if there are new keys or removed keys and based on this it creates new users or removes existing ones. The instance logic is on a shell script (`/lib/bastion-host/user_data.sh`) which is loaded as [**user data**](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/user-data.html), and executed at instance creation time. The ec2 instance uses an **Amazon Linux 2 AMI**. To access the s3 bucket we have created a role for our instance which allows it to interact with the s3 bucket and also put logs in [**CloudWatch**](https://aws.amazon.com/cloudwatch/).

```
import * as cdk from '@aws-cdk/core';
import { MyVpc } from './vpc';
import { BastionHostServices } from './bastion-host';
import { Envs } from '../types/envs';

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);

    const { vpc } = new MyVpc(this, 'MyAwesomeVpc', {
      vpcCidr: '10.0.0.0/16',
      publicSubnetsNo: 2,
      maxAzs: 2,
      privateSubnetsNo: 1,
    });

    const bastionHost = new BastionHostServices(this, 'BastionHost', {
      ...props,
      vpc,
      subnets: [vpc.publicSubnets[0]],
      instanceName: 'my-instance',
      keyName: 'my-instance-key.pem',
    });

    // We create a database in vpc private subnets and attach the bastion host security group to the database instance so it can accept connections from the bastion host.

    const db = new RdsInfrastructure(this, 'MyCoolDbService', {
      ...props,
      dbMasterUserName: 'coolUsername',
      vpc,
      databaseName: 'coolDatabase',
      dbAllocatedStorage: 10,
      dbBackupRetention: 30,
      dbSubnets: vpc.privateSubnets,
      ingressSgs: [bastionHost.bastionHostSecurityGroup]
    });
  }
}
```

After the stack is created you can go on the s3 bucket and upload your public key `name.pub`. After 3 minutes you can access the instance `ssh name@instance-public-ip-or-dns`.

To use the aws cli to upload the pub key you can run:

`aws s3 cp ~/.ssh/id_rsa.pub s3://created-bucket-name/public-keys/name.pub`. It must have the **public-keys** prefix when you upload it since that is where the instance looks for keys.

If you don't have a public key, you can follow the steps [here](https://www.ssh.com/ssh/keygen/), how to generate one.

#### Properties

Name | Type | Required | Default | Description
-----|------|----------|---------|------------
projectName | string | true | undefined | Project name
clientName | string | true | undefined | Client name
env | Envs { dev, stage, prod } | true | undefined | Environment
subnets | ec2.ISubnet[] | true | undefined | Subnets in which the bastion host is placed.
vpc | ec2.Vpc | true | undefined | Vpc in which the bastion host is created.
instanceName | string | true | undefined | Bastion host instance name. The given name will be composed with projectName, clientName and env. Ex: **`${projectName}-${instanceName}-bastion-host-${env}`**.
instanceType | ec2.InstanceType | false | T2 MICRO | Bastion host instance type.
keyName | string | false | undefined | Name of the private key which is used for creating the instance in the case you want to access the instance as a master user.

### Artifacts Bucket

Path: `/lib/artifacts-bucket/index.ts`

Exports: `ArtifactsBucket`

Required construct packages: `@aws-cdk/aws-s3`

This construct will create a private bucket to store our service artifacts, backups, or other sensitive data.

```
import * as cdk from '@aws-cdk/core';
import { ArtifactsBucket } from './artifacts-bucket';

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);

    const artifactsBucket = new ArtifactsBucket(this, 'ArtifactStorage', {
      artifactBucketName: 'artifact-bucket',
      tags: [{
        key: 'Name',
        value: 'Service Artifacts'
      }]
    });
  }
}
```
#### Properties

Name | Type | Required | Default | Description
-----|------|----------|---------|------------
artifactBucketName | string | true | undefined | Bucket name.
tags | Tags { key: string, value: string }[] | false | undefined | Tags to add in the resource (Bucket).

### Client application bucket

Path: `/lib/clientapp-bucket/index.ts`

Exports: `ClientAppInfrastructure`

Required construct packages: `@aws-cdk/aws-s3`

This construct creates a s3 bucket configured as a static website host which serves the content through a [CloudFront](https://aws.amazon.com/cloudfront/) distribution.

```
import * as cdk from '@aws-cdk/core';
import { ClientAppInfrastructure } from './clientapp-bucket';

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);

    const clientApp = new ClientAppInfrastructure(this, 'ClientApp', {
      clientAppBucketName: 'web-app-1'
    });
  }
}
```

#### Properties

Name | Type | Required | Default | Description
-----|------|----------|---------|------------
clientAppBucketName | string | true | undefined | Bucket name.

### Cognito user pool

### Parameter store

## Usage

## Creating a simple stack example




