import {EventBridgeClient, PutEventsCommand} from "@aws-sdk/client-eventbridge";

import {DynamoDBStreamEvent} from "aws-lambda";
import {DynamoDB} from "aws-sdk";

const client = new EventBridgeClient({
    region: "eu-west-1"
})


const HANDLED_ORDER_STATES = {
    "created": "order.created",
    "fulfilled": "order.fulfilled"
}


export const handler = async (req: DynamoDBStreamEvent) => {
    for (const record of req.Records) {
        if (!record.dynamodb?.NewImage) {
            continue
        }
        const orderEvent = DynamoDB.Converter.unmarshall(record.dynamodb.NewImage)

        const state: string = orderEvent['state'] ?? ""
        if (state != "created" && state != "fulfilled") {
            continue
        }
        let eventType = HANDLED_ORDER_STATES[state]

        console.log("event with")
        console.log(orderEvent)
        console.log("publishing", eventType)

        await client.send(
            new PutEventsCommand({
                Entries: [
                    {
                        EventBusName: process.env.EVENT_BUS_NAME,
                        DetailType: eventType,

                        Detail: JSON.stringify(orderEvent),
                        Source: "publish_order_fn",
                    }
                ]
            })
        )
    }
};
