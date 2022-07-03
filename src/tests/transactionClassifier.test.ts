import transactionClassifier, {
  Direction,
} from '../helpers/transactionClassifier';
import depositKucoinTx from './stubs/depositKucoinTx';
import internalKucoinTx from './stubs/internalKucoinTx';
import withdrawalKucoinTx from './stubs/withdrawalKucoinTx';

describe('TransactionClassifier', () => {
  it('detects internal transactions', () => {
    const type = transactionClassifier(
      internalKucoinTx.inputs,
      internalKucoinTx.outputs,
      {
        label: 'Kucoin',
        ergoTree:
          '0008cd03fc36384c6b70249e300670be0aeca716c063013b43b642b5a44a0147fcf552f9',
        handlerType: 'Webhook',
        triggerType: 'confirmed',
        trackAddress: '9iNt6wfxSc3DSaBVp22E7g993dwKUCvbGdHoEjxF8SRqj35oXvT',
        userId: '32423',
      }
    );

    expect(type).toBe(Direction.internal);
  });

  it('detects withdrawal transactions', () => {
    const type = transactionClassifier(
      withdrawalKucoinTx.inputs,
      withdrawalKucoinTx.outputs,
      {
        label: 'Kucoin',
        ergoTree:
          '0008cd0384508d46e79ab13e44a0f7a5eab9da9c2d84c0da6daff9f351e91cea0aee4481',
        handlerType: 'Webhook',
        triggerType: 'confirmed',
        trackAddress: '9hU5VUSUAmhEsTehBKDGFaFQSJx574UPoCquKBq59Ushv5XYgAu',
        userId: '32423',
      }
    );

    expect(type).toBe(Direction.outgoing);
  });

  it('detects deposit transactions', () => {
    const type = transactionClassifier(
      depositKucoinTx.inputs,
      depositKucoinTx.outputs,
      {
        label: 'Kucoin',
        ergoTree:
          '0008cd0384508d46e79ab13e44a0f7a5eab9da9c2d84c0da6daff9f351e91cea0aee4481',
        handlerType: 'Webhook',
        triggerType: 'confirmed',
        trackAddress: '9hU5VUSUAmhEsTehBKDGFaFQSJx574UPoCquKBq59Ushv5XYgAu',
        userId: '32423',
      }
    );

    expect(type).toBe(Direction.incoming);
  });
});
