import {describe, expect, it, test} from "vitest";
import waitForExpect from "wait-for-expect"
import stackOutput from "../output.json"
import {getPublishedEvent} from "../test-utils/events"

waitForExpect.defaults.timeout = 2000;

const createOrderEndpoint = stackOutput["dev-integration-test-with-trpc-MyStack"].CreateOrderEndpoint
const fulfillOrderEndpoint = stackOutput["dev-integration-test-with-trpc-MyStack"].FulfillOrderEndpoint

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

        await waitForExpect(async () => {
            console.log("looking for", order.id)
            const evt = await getPublishedEvent("order.created", order.id)

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

        it('event is published: "order.created"', async () => {
            console.log("looking for", order.id)
            const evt = await waitFor(() =>
                getPublishedEvent("order.created", order.id),
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
            await waitForExpect(async () => {
                const event = await getPublishedEvent("order.created", order.id)

                expect(event.type).toBe("order.created")
                expect(event.detail["id"]).toBe(order.id)
            })
        })

        it('event is published: "order.fulfilled"', async () => {
            await waitForExpect(async () => {
                const event = await getPublishedEvent("order.fulfilled", order.id)

                expect(event.type).toBe("order.fulfilled")
                expect(event.detail["id"]).toBe(order.id)
            })
        })
    })
})
