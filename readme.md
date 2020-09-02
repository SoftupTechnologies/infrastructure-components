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
  - [Secrets manager](#secrets-manager)
  - [Bastion Host](#bastion-host)
  - [Artifacts Bucket](#artifacts-bucket)
  - [Client application bucket](#client-application-bucket)
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

The custom construct **MyVpc** wraps a common configuration for creating a vpc by just giving it some basic requirements, like vpc CIDR block and number of public subnets you need in the vpc.

Calling the **MyVpc** class in the main stack:

```
import * as cdk from '@aws-cdk/core';
import { MyVpc } from './vpc';

export class ServerlessInfrastructureCdkStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props: StackProps) {
    super(scope, id);

    const vpc = new MyVpc(this, 'MyAwesomeVpc', {
      vpcCidr: 10.0.0.0/16,
      publicSubnetsNo: 2,
      maxAzs: 2,
      privateSubnetsNo: 1,
    })
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

### Secrets manager

### Bastion Host

### Artifacts Bucket

### Client application bucket

### Cognito user pool

### Parameter store

## Usage

## Creating a simple stack example




