import { ExplorerBox, Subscriber } from '@/types';

export enum Direction {
  incoming = 'incoming',
  outgoing = 'outgoing',
  inner = 'inner',
}

const exchanges: any = {
  '0008cd0384508d46e79ab13e44a0f7a5eab9da9c2d84c0da6daff9f351e91cea0aee4481': {
    address: '9hU5VUSUAmhEsTehBKDGFaFQSJx574UPoCquKBq59Ushv5XYgAu',
    label: 'Kucoin-4',
  },
  '0008cd03fc36384c6b70249e300670be0aeca716c063013b43b642b5a44a0147fcf552f9': {
    address: '9iNt6wfxSc3DSaBVp22E7g993dwKUCvbGdHoEjxF8SRqj35oXvT',
    label: 'Kucoin-3',
  },
  '0008cd027304abbaebe8bb3a9e963dfa9fa4964d7d001e6a1bd225eadc84048ae49b627c': {
    address: '9fPiW45mZwoTxSwTLLXaZcdekqi72emebENmScyTGsjryzrntUe',
    label: 'Coinex-2',
  },
  '0008cd03db3ac4dccd3546c949e23a2c1f49cd2bb2559c298d6babd451e7469c57e92507': {
    address: '9i8Mci4ufn8iBQhzohh4V3XM3PjiJbxuDG1hctouwV4fjW5vBi3',
    label: 'Kucoin-2',
  },
  '0008cd033a7be635051a74c8d8fcd62a66b3f3b539a256453df6e0c988824ea5f5c01aac': {
    address: '9guZaxPoe4jecHi6ZxtMotKUL4AzpomFf3xqXsFSuTyZoLbmUBr',
    label: 'Kucoin-1',
  },
  '0008cd03f3f44c9e80e2cedc1a2909631a3adea8866ee32187f74d0912387359b0ff36a2': {
    address: '9iKFBBrryPhBYVGDKHuZQW7SuLfuTdUJtTPzecbQ5pQQzD4VykC',
    label: 'Gate.io',
  },
  '0008cd02aa0499fd16621cc40b45cd5f80ef882cbfaf9404f1a80872f244f207b3911a95': {
    address: '9fowPvQ2GXdmhD2bN54EL9dRnio3kBQGyrD3fkbHwuTXD6z1wBU',
    label: 'Coinex-1',
  },
};

export default function transactionClassifier(
  inputs: ExplorerBox[],
  outputs: ExplorerBox[],
  subscriber: Subscriber
): Direction {
  const isInInputs = inputs.find((box) => {
    return subscriber.ergoTree === box.ergoTree;
  });

  const isInnerAddressInInputs = inputs.find((box) => {
    return subscriber.ergoTree !== box.ergoTree && !!exchanges[box.ergoTree];
  });

  const isInnerAddressInOutputs = outputs.find((box) => {
    return subscriber.ergoTree !== box.ergoTree && !!exchanges[box.ergoTree];
  });

  if (isInnerAddressInInputs && isInnerAddressInOutputs) {
    return Direction.inner;
  }

  if (isInInputs) return Direction.outgoing;

  return Direction.incoming;
}
