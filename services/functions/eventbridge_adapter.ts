import {EventBridgeClient, PutEventsCommand} from "@aws-sdk/client-eventbridge";

import {DynamoDBStreamEvent} from "aws-lambda";
import {DynamoDB} from "aws-sdk";

const client = new EventBridgeClient({
    region: "eu-west-1"
})

export const handler = async (req: DynamoDBStreamEvent) => {
    for (const record of req.Records) {
        if (!record.dynamodb?.NewImage) {
            continue
        }
        const orderEvent = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage)
        console.log("event with")
        console.log(orderEvent)
        await client.send(
            new PutEventsCommand({
                Entries: [
                    {
                        EventBusName: process.env.EVENT_BUS_NAME,
                        DetailType: "order.created",

                        Detail: JSON.stringify(orderEvent),
                        Source: "create_order_fn",
                    }
                ]
            })
        )
    }
};
