import {z} from "zod";

export const Order = z.object({
    id: z.string().uuid(),
    amount: z.number(),
});

export type OrderType = z.infer<typeof Order>;
