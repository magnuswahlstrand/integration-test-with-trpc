import {EventBridgeClient, PutEventsCommand} from "@aws-sdk/client-eventbridge";
import {z} from "zod";

const client = new EventBridgeClient({
    region: "eu-west-1"
})


const CreateOrder = z.object({
    id: z.string().uuid(),
    amount: z.number(),
});

export const handler = async (req: any) => {
    const order = CreateOrder.parse(req)

    console.log(process.env.EVENT_BUS_NAME)
    // console.log(process.env)
    await client.send(
        new PutEventsCommand({
            Entries: [
                {
                    EventBusName: process.env.EVENT_BUS_NAME,
                    Detail: JSON.stringify(order),
                    DetailType: "order.created",
                    Source: "aws.lambda",
                }
            ]
        })
    )
    console.log(JSON.stringify(
        new PutEventsCommand({
            Entries: [
                {
                    EventBusName: process.env.EVENT_BUS_NAME,
                    Detail: JSON.stringify(order),
                    DetailType: "order.created",
                    Source: "aws.lambda",
                }
            ]
        })
    ))

    return order
};
