import {describe, expect, it} from "vitest";
import stackOutput from "./output.json"
import {DynamoDB} from "aws-sdk";
import {EventBridgeEvent, Order} from "../model";

const dynamoDb = new DynamoDB.DocumentClient({
    region: "eu-west-1",
});

const createOrderEndpoint = stackOutput["dev-integration-test-with-trpc-MyStack"].CreateOrderEndpoint
const testEventsTable = stackOutput["dev-integration-test-with-trpc-MyStack"].TestEventTable

async function createOrder(payload: any) {
    return fetch(createOrderEndpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
    }).then(r => r.json())
}


const getTestEvent = async (eventType: string, eventId: string) => {
    const getParams = {
        TableName: testEventsTable,
        Key: {
            eventId: `${eventType}#${eventId}`,
        },
    };

    const ret = await dynamoDb.get(getParams).promise()

    const item = ret.Item
    if (!item) {
        throw 'order not found'
    }

    return item;
}


async function waitFor<T>(fn: () => Promise<T>, max_retries = 3, delay = 100) {
    for (let i = 0; i < max_retries; i++) {
        try {
            return await fn()
        } catch (e) {
            await new Promise((r) => setTimeout(r, delay));
        }
    }
    throw `max number of retries (${max_retries}) reached`
}

describe('create order flow', async () => {
    const amount = 123

    const resp = await createOrder({'amount': amount})
    const orderResponse = Order.parse(resp)

    it('endpoint returns an order with ID', () => {
        expect(orderResponse.id).toBeDefined()
        expect(orderResponse.amount).equals(amount)
    })

    await new Promise((r) => setTimeout(r, 2000));
    const evt = await waitFor(
        () => getTestEvent("order.created", orderResponse.id)
    )

    const event = EventBridgeEvent.parse(evt)
    it('event order.created is published', () => {
        expect(event["detail-type"]).equals("order.created")
        expect(event.detail.id).equals(orderResponse.id)
    })
})
