import memoize from 'memoizee';
import fetch from 'node-fetch';

import { ExplorerBox } from '@/types';

const PATH = 'https://ergo-explorer-cdn.getblok.io/api/v1';

async function confirmed(id: string) {
  const response = await fetch(`${PATH}/transactions/${id}`);
  const data = await response.json();

  return data;
}

export const fetchConfirmedTransactionById = memoize(confirmed);

export async function box(id: string): Promise<ExplorerBox> {
  console.log('fetching box', id);

  const response = await fetch(`${PATH}/boxes/${id}`);
  const data = await response.json();

  return data as ExplorerBox;
}

export const fetchBoxById = memoize(box, {
  promise: true,
});
