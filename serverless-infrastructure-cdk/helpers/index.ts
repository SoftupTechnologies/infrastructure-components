import * as cdk from '@aws-cdk/core';
import { Tags } from '../types/tags';

export const tagConstruct = (construct: cdk.Construct, tags: Tags = [] ): void => {
  tags.forEach((tag) => {
    cdk.Tag.add(construct, tag.key, tag.value);
  });
};