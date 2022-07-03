import { ExplorerBox, Subscriber } from '@/types';

export enum Direction {
  incoming = 'incoming',
  outgoing = 'outgoing',
}

export default function transactionClassifier(
  inputs: ExplorerBox[],
  subscriber: Subscriber
): Direction {
  const isInInputs = inputs.find((box) => {
    return subscriber.ergoTree === box.ergoTree;
  });

  if (isInInputs) return Direction.outgoing;

  return Direction.incoming;
}
