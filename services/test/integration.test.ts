import {describe, expect, it, test} from "vitest";
import stackOutput from "./output.json"

import {DynamoDB} from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient({
    region: "eu-west-1",
});

const createOrderEndpoint = stackOutput["dev-integration-test-with-trpc-MyStack"].CreateOrderEndpoint
const fulfillOrderEndpoint = stackOutput["dev-integration-test-with-trpc-MyStack"].FulfillOrderEndpoint
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


async function createOrder(amount: number): Promise<{ id: string; amount: number }> {
    return fetch(createOrderEndpoint, {
        method: 'POST',
        body: JSON.stringify({amount: amount}),
    }).then(r => r.json())
}

async function fulfillOrder(id: string, fulfilled_by: string): Promise<{ id: string; fulfilled_by: string }> {
    return fetch(fulfillOrderEndpoint, {
        method: 'POST',
        body: JSON.stringify({id: id, fulfilled_by: fulfilled_by}),
    }).then(r => r.json())
}


const getTestEvent = async (eventType: string, entityId: string) => {
    const getParams = {
        TableName: testEventsTable,
        Key: {
            PK: `${eventType}#${entityId}`,
        },
    };

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
    test.concurrent('create', async () => {
        const amount = 123

        const order = await createOrder(amount)


        it('returns an order with ID', () => {
            expect(order.id).toBeDefined()
            expect(order.amount).toBe(amount)

            expect(order).toEqual(
                expect.objectContaining({
                    id: expect.any(String),
                    amount: amount,
                })
            );
        })

        it('event is published: "order.created"', async () => {
            console.log("looking for", order.id)
            const evt = await waitFor(() =>
                getTestEvent("order.created", order.id),
            )

            expect(evt.type).toBe("order.created")
            expect(evt.detail["id"]).toBe(order.id)
            const expected_object = expect.objectContaining({
                type: "order.created",
                detail: expect.objectContaining({
                    id: order.id
                }),
            })

            expect(evt).toEqual(expected_object);
        })
    })

    test.concurrent('fulfill', async () => {
        const amount = 123

        const order = await createOrder(amount)
        const fulfilled = await fulfillOrder(order.id, "magnus")

        it('returns an id and fulfilled_by', () => {
            expect(fulfilled.id).toBe(order.id)
            expect(fulfilled.fulfilled_by).toBe("magnus")
        })

        it('event is published: "order.created"', async () => {
            const event = await waitForTestEvent("order.created", order.id)

            expect(event.type).toBe("order.created")
            expect(event.detail["id"]).toBe(order.id)
        })

        it('event is published: "order.fulfilled"', async () => {
            const event = await waitForTestEvent("order.fulfilled", order.id)

            expect(event.type).toBe("order.fulfilled")
            expect(event.detail["id"]).toBe(order.id)
        })
    })
})
