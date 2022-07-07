import {EventBridgeClient, PutEventsCommand} from "@aws-sdk/client-eventbridge";
import {z} from "zod";
import {OrderType} from "../model";
import {v4 as uuid} from 'uuid';

const client = new EventBridgeClient({
    region: "eu-west-1"
})

const CreateOrderRequest = z.object({
    amount: z.number(),
});

export const handler = async (req: any) => {
    console.log(req.body)
    const createReq = CreateOrderRequest.parse(JSON.parse(req.body))

    const order: OrderType = {
        id: uuid(),
        amount: createReq.amount,
    }

    console.log(process.env.EVENT_BUS_NAME)
    await client.send(
        new PutEventsCommand({
            Entries: [
                {
                    EventBusName: process.env.EVENT_BUS_NAME,
                    Detail: JSON.stringify(order),
                    DetailType: "order.created",
                    Source: "create_order",
                }
            ]
        })
    )

    return order
};
