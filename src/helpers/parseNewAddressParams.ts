import { Address } from '@coinbarn/ergo-ts';

export type ParamsRow = {
  address: string;
  label?: string;
  ergoTree: string;
};

export function parseNewAddressParams(str: string): ParamsRow[] {
  const paramsRows = str.split('\n');
  const params: ParamsRow[] = [];

  paramsRows.forEach((row: string) => {
    const addressParam: string[] = row.split(',');

    let address: Address;
    try {
      const candidate = addressParam[0]?.trim() || '';
      address = new Address(candidate);
    } catch (e) {
      return;
    }
    if (!address.isValid()) {
      return;
    }

    if (addressParam.length === 1) {
      params.push({
        label: undefined,
        address: address.address,
        ergoTree: address.ergoTree,
      });
    } else if (addressParam.length === 2 && !!addressParam[1]?.trim()) {
      params.push({
        label: addressParam[1]?.trim(),
        address: address.address,
        ergoTree: address.ergoTree,
      });
    }
  });

  return params;
}
