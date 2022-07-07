import {EventBridgeClient, PutEventsCommand} from "@aws-sdk/client-eventbridge";
import {v4 as uuid} from 'uuid';

const client = new EventBridgeClient({
    region: "eu-west-1"
})

type FulfillOrderRequest = {
    id: string,
    fulfilled_by: string
}

export const handler = async (req: FulfillOrderRequest) => {
    const order = {
        id: uuid(),
        fulfilled_by: req.fulfilled_by
    }

    await client.send(
        new PutEventsCommand({
            Entries: [
                {
                    EventBusName: process.env.EVENT_BUS_NAME,
                    DetailType: "order.fulfilled",

                    Detail: JSON.stringify(order),
                    Source: "fulfill_order_fn",
                }
            ]
        })
    )

    return order
};
