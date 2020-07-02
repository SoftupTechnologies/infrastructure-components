export type SubnetProps = {
  cidr: string,
  az: string,
  mapPublicIpOnLaunch?: boolean,
  withNatGateway?: boolean,
  withBastionHost?: boolean,
}