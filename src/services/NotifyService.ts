/* eslint max-classes-per-file: 0 */ // --> OFF
import { ERGODEX_CONTRACT_TREE } from '@/helpers/constants';
import { mergeBoxes } from '@/helpers/mergeBoxes';
import tokenDict from '@/helpers/tokenDict';
import transactionClassifier, {
  Direction,
} from '@/helpers/transactionClassifier';
import { ExplorerBox, NodeTransaction } from '@/types';

import { fetchBoxById } from './explorerApi';
import twitterAPI from './twitterAPI';

const NANO = 1000000000;

function formatString(str = '') {
  if (str.length > 8) {
    const formatted = `${str.substring(0, 4)}...${str.substring(
      str.length - 4,
      str.length
    )}`;
    return formatted;
  }

  return str;
}

enum EventType {
  confirmed = 'confirmed',
  unconfirmed = 'unconfirmed',
}

enum HandlerType {
  TelegramBot = 'TelegramBot',
  Webhook = 'Webhook',
}

type Subscriber = {
  webhook?: string;
  ergoTree: string;
  trackAddress: string;
  triggerType: EventType;
  handlerType: HandlerType;
  userId: string;
  label?: string;
};

export class NotifyService {
  event: EventType;

  subscriber: Subscriber;

  transaction: Pick<NodeTransaction, 'id' | 'outputs' | 'inputs'>;

  constructor(args: {
    event: EventType;
    subscriber: Subscriber;
    transaction: Pick<NodeTransaction, 'id' | 'outputs' | 'inputs'>;
  }) {
    this.event = args.event;
    this.subscriber = args.subscriber;
    this.transaction = args.transaction;
  }

  async call(): Promise<any> {
    console.log(this);
    if (this.event !== this.subscriber.triggerType) {
      return;
    }

    let handler: NotifyService;

    if (this.subscriber.ergoTree === ERGODEX_CONTRACT_TREE) {
      handler = new ErgoDexHandler(this);
    } else {
      handler = new WebhookHandler(this);
    }

    await handler.call();
  }
}

class ErgoDexHandler extends NotifyService {
  async call(): Promise<any> {
    const { outputs, id, inputs } = this.transaction;

    // not sure wtf is that, skip
    if (
      outputs.length !== 4 ||
      inputs.length !== 2 ||
      !inputs[1] ||
      !outputs[1]
    )
      return;

    let soldBox: ExplorerBox;
    const receivedBox = outputs[1];
    try {
      /* eslint no-await-in-loop: 0, no-restricted-syntax: 0 */ // --> OFF
      soldBox = await fetchBoxById(inputs[1].boxId);
    } catch (e) {
      console.error("can't find box", e);
      return;
    }
    // console.log({ soldBox });
    if (soldBox.assets[0]) {
      // selling token for ERG
      if (receivedBox.assets[0]) return;
      const tokenData = tokenDict[soldBox.assets[0].tokenId];

      if (!tokenData) return; // unknown token

      if (tokenData.name === 'SigUSD') {
        if (soldBox.assets[0].amount / 10 ** tokenData.decimals <= 1200) return;
        console.log('selling sig for erg');
        const message = [
          `📈 1 Erg = $${(
            soldBox.assets[0].amount /
            10 ** tokenData.decimals /
            (receivedBox.value / NANO)
          ).toFixed(2)}`,
          `Someone has just bought ${receivedBox.value / NANO} $ERG with ${
            soldBox.assets[0].amount / 10 ** tokenData.decimals
          } SigUSD on Spectrum.`,
          `https://explorer.ergoplatform.com/en/transactions/${id}`,
          '#Ergo',
          '(Automated with @kaching_ergo)',
        ].join('\n');

        console.log(message);
        await twitterAPI.v2.tweet(message);
      } else {
        if (receivedBox.value / NANO <= 800) return;
        console.log('selling token for erg');
        const message = [
          `Someone has just sold his bag of ${
            soldBox.assets[0].amount / 10 ** tokenData.decimals
          } ${tokenData.twitter || tokenData.name} for ${
            receivedBox.value / NANO
          } $ERG on Spectrum`,
          `https://explorer.ergoplatform.com/en/transactions/${id}`,
          '#Ergo',
          '(Automated with @kaching_ergo)',
        ].join('\n');
        console.log(message);

        await twitterAPI.v2.tweet(message);
      }
    } else {
      // buying token with ERG
      if (!receivedBox.assets[0]) return;
      const tokenData = tokenDict[receivedBox.assets[0].tokenId];
      if (!tokenData) return; // unknown token TODO: fetch;

      if (tokenData.name === 'SigUSD') {
        if (receivedBox.assets[0].amount / 10 ** tokenData.decimals <= 1200)
          return;
        console.log('buying sig with erg');
        const message = [
          `🔻 1 Erg = $${(
            receivedBox.assets[0].amount /
            10 ** tokenData.decimals /
            (soldBox.value / NANO)
          ).toFixed(2)}`,
          `${soldBox.value / NANO} $ERG was swapped for ${
            receivedBox.assets[0].amount / 10 ** tokenData.decimals
          } SigUSD on Spectrum.`,
          `https://explorer.ergoplatform.com/en/transactions/${id}`,
          '#Ergo',
          '(Automated with @kaching_ergo)',
        ].join('\n');

        console.log(message);
        await twitterAPI.v2.tweet(message);
      } else {
        if (soldBox.value / NANO <= 800) return;
        console.log('buying token with erg');
        const message = [
          `Someone has just YOLO'd in ${
            tokenData.twitter || tokenData.name
          } token with ${soldBox.value / NANO} $ERG on Spectrum. Bullish!`,
          `https://explorer.ergoplatform.com/en/transactions/${id}`,
          '#Ergo',
          '(Automated with @kaching_ergo)',
        ].join('\n');

        console.log(message);
        await twitterAPI.v2.tweet(message);
      }
    }
  }
}

class WebhookHandler extends NotifyService {
  async call(): Promise<any> {
    const { ergoTree, trackAddress, label } = this.subscriber;
    const { outputs, id, inputs } = this.transaction;

    const outputBoxes = outputs.filter((o: any) => o.ergoTree === ergoTree);
    const name = label || formatString(trackAddress);

    if (!outputBoxes.length) {
      // console.log('No outputBox', outputs);
      return;
    }
    const explorerInputs: ExplorerBox[] = [];

    for (const input of inputs) {
      let data: ExplorerBox;
      try {
        /* eslint no-await-in-loop: 0, no-restricted-syntax: 0 */ // --> OFF
        data = await fetchBoxById(input.boxId);
        if (!data.assets)
          throw new Error('box not fetched someting went wrong');
        explorerInputs.push(data);
      } catch (e) {
        console.error("can't find box", e);
      }
    }

    if (explorerInputs.length !== inputs.length) {
      console.log('Not all boxes fetched, can not make a decision');
      return;
    }

    const txDirection: Direction = transactionClassifier(
      explorerInputs,
      outputs,
      this.subscriber
    );

    if (txDirection === Direction.internal) {
      console.log('Internal tx');
    } else if (txDirection === Direction.incoming) {
      // deposit transaction
      console.log('Incoming tx');
      const sumBox = mergeBoxes(outputBoxes);

      if (sumBox.value / NANO < 8500) {
        console.log('Not exciting enough', sumBox.value / NANO);
        return;
      }

      console.log(
        'Holly sh*t!!!',
        Direction.incoming,
        sumBox.value / NANO,
        name
      );
      await twitterAPI.v2.tweet(
        [
          '🐋  Whale Alert 🐋',
          `${
            sumBox.value / NANO
          } ERG was *deposited* on ${name} exchange 👀 👀 👀`,
          `https://explorer.ergoplatform.com/en/transactions/${id}`,
          '#Ergo $ERG',
          '(Automated with @kaching_ergo)',
        ].join('\n')
      );
    } else {
      // withdrawal transaction
      console.log('withdrawal tx');
      const sumBox = mergeBoxes(
        outputs.filter((o) => o.ergoTree !== this.subscriber.ergoTree)
      );

      if (sumBox.value / NANO < 4000) {
        console.log(
          'Not exciting enough',
          Direction.outgoing,
          sumBox.value / NANO,
          name
        );
        return;
      }

      console.log('Holly sh*t!!!');
      await twitterAPI.v2.tweet(
        [
          '🐋  Whale Alert 🐋',
          `${
            sumBox.value / NANO
          } ERG was *withdrawn* from ${name} exchange 👀 👀 👀`,
          ``,
          `https://explorer.ergoplatform.com/en/transactions/${id}`,
          '#Ergo $ERG',
          '(Automated with @kaching_ergo)',
        ].join('\n')
      );
    }
  }
}
