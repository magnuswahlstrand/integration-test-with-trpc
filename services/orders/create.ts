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


    const now = new Date().toISOString()
    const order = {
        id: uuid(),
        amount: orderReq.amount,
        state: "created",
        created_at: now,
        updated_at: now
    }

    console.log("put")
    console.log(order)
    const putParams = {
        TableName: tableName,
        Item: order
    };


    await dynamoDb.put(putParams).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(order),
    }
};
