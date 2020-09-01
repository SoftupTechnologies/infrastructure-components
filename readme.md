### Serverless - Reference Infrastructure

This repository contains the list of resources that are common for creating the infrastructure of an application. Components like a VPC (Virtual Private Cloud), subnets, server instances, database services like RDS (Relational Database Service), authentication with AWS Cognito etc...
We will describe each component in upcomming steps. 

- [Setup](#setup)
  - [AWS cli setup](#aws-cli-setup)
  - [AWS cdk installation](#aws-cdk-installation)
- [Components](#components)
  - [Vpc](#vpc)
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


## Components

### Vpc

### Rds

### Secrets manager

### Bastion Host

### Artifacts Bucket

### Client application bucket

### Cognito user pool

### Parameter store

## Usage

## Creating a simple stack example




