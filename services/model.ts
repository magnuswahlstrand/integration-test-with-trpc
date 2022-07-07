import {z} from "zod";

export const Order = z.object({
    id: z.string().uuid(),
    amount: z.number(),
});

export type OrderType = z.infer<typeof Order>;

export const EventBridgeEvent = z.object({
    "detail-type": z.string(),
    detail: z.object({
        id: z.string().uuid()
    }),
})

export type EventBridgeEventType = z.infer<typeof Order>;
