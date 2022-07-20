import { SQSEvent, SQSHandler } from "aws-lambda";

export const handler: SQSHandler = (event: SQSEvent) => {
  // SQS may invoke with multiple messages
  for (const message of event.Records) {
      const bodyData = JSON.parse(message.body);
  
      console.log(bodyData);
  }
}
