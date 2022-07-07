import {v4 as uuid} from 'uuid';
import {DynamoDB} from "aws-sdk";
import {APIGatewayProxyHandlerV2} from "aws-lambda";

const tableName = process.env.TABLE_NAME ?? ""

const dynamoDb = new DynamoDB.DocumentClient();

type CreateOrderRequest = {
    amount: number;
}

export const handler: APIGatewayProxyHandlerV2 = async (req) => {

    const orderReq: CreateOrderRequest = JSON.parse(req.body ?? "")
    console.log("received", orderReq)
    console.log("received", typeof orderReq)


    const order = {
        id: uuid(),
        amount: orderReq.amount,
        state: "created"
    }

    console.log("put")
    console.log(order)
    const putParams = {
        TableName: tableName,
        Item: order
    };


    await dynamoDb.put(putParams).promise();

    // await client.send(
    //     new PutEventsCommand({
    //         Entries: [
    //             {
    //                 EventBusName: process.env.EVENT_BUS_NAME,
    //                 DetailType: "order.created",
    //
    //                 Detail: JSON.stringify(order),
    //                 Source: "create_order_fn",
    //             }
    //         ]
    //     })
    // )

    return order
};
