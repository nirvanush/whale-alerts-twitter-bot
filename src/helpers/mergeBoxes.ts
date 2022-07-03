/* eslint no-param-reassign: 0 */
import { Asset, UtxoBox } from '../types';

export function mergeBoxes(utxos: UtxoBox[]) {
  const firstBox: UtxoBox = JSON.parse(JSON.stringify(utxos[0]));

  for (let i = 1; i < utxos.length; i += 1) {
    firstBox.value += utxos[i]?.value || 0;
    if (utxos[i] && utxos[i]?.assets.length) {
      firstBox.assets = firstBox.assets.concat(utxos[i]?.assets as Asset[]);
    }
  }

  const summedAssets = firstBox.assets.reduce<Record<string, number>>(
    (mapped, token) => {
      mapped[token.tokenId] = mapped[token.tokenId] || 0;
      mapped[token.tokenId] += token.amount;
      return mapped;
    },
    {}
  );

  firstBox.assets = Object.keys(summedAssets).map((key) => {
    return { tokenId: key, amount: summedAssets[key] } as Asset;
  });

  return firstBox;
}
