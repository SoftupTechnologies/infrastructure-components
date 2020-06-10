### Serverless - Reference Infrastructure

This repository contains the list of resources that are common for creating the infrastructure of the serverless application.
Every resource that is not coupled with a particular service should be added in the infrastructure repository.

#### VPC
TODO: Add here a diagram

#### S3
We use some common buckets such as:

- **{project-name}**-artifacts-**{environment}**: Store all artefacts created by different services.
- **{project-name}**-public-keys-**{environment}**: Store all public keys that are used to access via SSH the bastion host.

#### Bastion Host
In order to access services in private subnet, such as RDS, we would need a bastion host in public subnet that fetches keys from a private repository.


#### Steps when onboarding new project
Write detailed steps on how to onboard a new project to use the infrastructure