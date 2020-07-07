import * as cdk from '@aws-cdk/core';
import { Tags } from '../types/tags';

type defaultTagsArgs = {
  projectName: string;
  clientName: string;
  env: string;
}

export const tagConstruct = (construct: cdk.Construct, tags: Tags = [] ): void => {
  tags.forEach((tag) => {
    cdk.Tag.add(construct, tag.key, tag.value);
  });
};

export const defaultTags = (props: defaultTagsArgs) => [
  {
    key: 'cost-center',
    value: props.clientName,
  },
  {
    key: 'project',
    value: props.projectName,
  },
  {
    key: 'environment',
    value: props.env,
  }
]