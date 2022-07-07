import {describe, expect, it} from "vitest";
import stackOutput from "./output.json"

import {DynamoDB} from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient({
    region: "eu-west-1",
});

const createOrderEndpoint = stackOutput["dev-integration-test-with-trpc-MyStack"].CreateOrderEndpoint
const testEventsTable = stackOutput["dev-integration-test-with-trpc-MyStack"].TestEventTable

async function waitFor<T>(fn: () => Promise<T>, max_retries = 10, delay = 200) {
    for (let i = 0; i < max_retries; i++) {
        try {
            return await fn()
        } catch (e) {
            await new Promise((r) => setTimeout(r, delay));
        }
    }
    return Promise.reject<T>(`max number of retries (${max_retries}) reached`)
}


async function createOrder(payload: any): Promise<{ id: string; amount: number }> {
    return fetch(createOrderEndpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
    }).then(r => r.json())
}


const getTestEvent = async (eventType: string, entityId: string) => {
    const getParams = {
        TableName: testEventsTable,
        Key: {
            PK: `${eventType}#${entityId}`,
        },
    };

    console.log(getParams)

    const ret = await dynamoDb.get(getParams).promise()

    const item = ret.Item
    if (!item) {
        throw 'event not found'
    }

    return {
        "type": item["event"]["detail-type"],
        "detail": item["event"]["detail"],
    }
}

const waitForTestEvent = async (eventType, eventId) =>
    await waitFor(() =>
        getTestEvent(eventType, eventId)
    )

describe("orders", () => {

    describe.concurrent('create order', async () => {
        const amount = 123

        const order = await createOrder({'amount': amount})


        it('returns an order with ID', () => {
            expect(order.id).toBeDefined()
            expect(order.amount).equals(amount)
        })

        it('"order.created" event is published', async () => {
            console.log("looking for", order.id)
            const evt = await waitFor(() =>
                getTestEvent("order.created", order.id),
            )

            expect(evt.type).equals("order.created")
            expect(evt.detail["id"]).equals(order.id)
        })
    })

    // describe.concurrent('fulfill order', async () => {
    //     const amount = 123
    //
    //     const order = await createOrder({'amount': amount})
    //
    //     it.concurrent('"order.created" event is published', async () => {
    //         const event = await waitForTestEvent("order.created", order.id)
    //
    //         expect(event.type).equals("order.created")
    //         expect(event.detail["id"]).equals(order.id)
    //     })
    //
    //     it.concurrent('"order.fulfilled" event is published', async () => {
    //         const event = await waitForTestEvent("order.created", order.id)
    //
    //         expect(event.type).equals("order.created")
    //         expect(event.detail["id"]).equals(order.id)
    //     })
    // })
})
