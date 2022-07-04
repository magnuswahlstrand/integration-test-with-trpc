import {describe, expect, it, test} from "vitest";
import stackOutput from "./output.json"
import {z} from "zod";

describe("sample", () => {
    it("should work", () => {
        expect(true).toBe(true);
    });
});

const createOrderEndpoint = stackOutput["dev-integration-test-with-trpc-MyStack"].CreateOrderEndpoint
const getEventsEndpoint = stackOutput["dev-integration-test-with-trpc-MyStack"].EventWriterFnEndpoint

async function createOrder(payload: any) {
    return fetch(createOrderEndpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
    }).then(r => r.json())
}

async function fetchCreatedEvents(payload: any) {
    return fetch(getEventsEndpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
    }).then(r => r.json())
}

const massiveEvent = {
    "version": "0",
    "id": "17793124-05d4-b198-2fde-7ededc63b103",
    "detail-type": "Object Created",
    "source": "aws.s3",
    "account": "111122223333",
    "time": "2021-11-12T00:00:00Z",
    "region": "ca-central-1",
    "resources": [
        "arn:aws:s3:::DOC-EXAMPLE-BUCKET1"
    ],
    "detail": {
        "version": "0",
        "bucket": {
            "name": "DOC-EXAMPLE-BUCKET1"
        },
        "object": {
            "key": "example-key",
            "size": 5,
            "etag": "b1946ac92492d2347c6235b4d2611184",
            "version-id": "IYV3p45BT0ac8hjHg1houSdS1a.Mro8e",
            "sequencer": "617f08299329d189"
        },
        "request-id": "N4N7GDK58NMKJ12R",
        "requester": "123456789012",
        "source-ip-address": "1.2.3.4",
        "reason": "PutObject"
    }
}


// Questions
// - Should I split this into two sections? 1 API call, 2 fetch published events?
test('createOrder returns an order, order.created event is published', async () => {
    const amount = 123

    // Act
    const resp = await createOrder({'amount': amount})

    // Assert
    const orderResponse = z.object({
            id: z.string().uuid(),
            amount: z.number(),
        }
    ).parse(resp)
    expect(orderResponse.id).toBeDefined()
    expect(orderResponse.amount).equals(amount)

    // Act
    const eventResp = await fetchCreatedEvents(massiveEvent)

    // Assert - This doesn't actually return events at the moment :-)
    // - How do I retry until success? It can take a while before events are published, and available in the fetchCreatedEvents call
    const eventResponse = z.object({
            id: z.literal('hej')
        }
    ).parse(eventResp)
})
