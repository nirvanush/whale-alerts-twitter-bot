/* eslint max-classes-per-file: 0 */ // --> OFF
import { mergeBoxes } from '@/helpers/mergeBoxes';
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
    if (this.event !== this.subscriber.triggerType) {
      return;
    }

    const handler = new WebhookHandler(this);

    await handler.call();
  }
}

class WebhookHandler extends NotifyService {
  async call(): Promise<any> {
    const { ergoTree, trackAddress, label } = this.subscriber;
    const { outputs, id, inputs } = this.transaction;

    const outputBoxes = outputs.filter((o: any) => o.ergoTree === ergoTree);
    const name = label || formatString(trackAddress);

    if (!outputBoxes.length) return;
    const explorerInputs: ExplorerBox[] = [];

    for (const input of inputs) {
      let data: ExplorerBox;
      try {
        /* eslint no-await-in-loop: 0, no-restricted-syntax: 0 */ // --> OFF
        data = await fetchBoxById(input.boxId);
        explorerInputs.push(data);
      } catch (e) {
        console.error("can't find box", e);
      }
    }

    const txDirection: Direction = transactionClassifier(
      explorerInputs,
      this.subscriber
    );

    if (txDirection === Direction.incoming) {
      // deposit transaction
      const sumBox = mergeBoxes(outputBoxes);
      if (sumBox.value / NANO < 4000) return;

      await twitterAPI.v2.tweet(
        [
          '🐋  Whale Alert 🐋',
          `${
            sumBox.value / NANO
          } ERG was *deposited* on ${name} exchange 👀 👀 👀`,
          `https://explorer.ergoplatform.com/en/transactions/${id}`,
          '(Powered by @kaching_ergo notifications service)',
        ].join('\n')
      );
    } else {
      // withdrawal transaction
      const sumBox = mergeBoxes(
        outputs.filter((o) => o.ergoTree !== this.subscriber.ergoTree)
      );

      if (sumBox.value / NANO < 4000) return;

      await twitterAPI.v2.tweet(
        [
          '🐋  Whale Alert 🐋',
          `${
            sumBox.value / NANO
          } ERG was *withdrawn* from ${name} exchange 👀 👀 👀`,
          ``,
          `https://explorer.ergoplatform.com/en/transactions/${id}`,
          '(Powered by @kaching_ergo notifications service)',
        ].join('\n')
      );
    }
  }
}
