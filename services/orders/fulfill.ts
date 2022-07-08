import {DynamoDB} from "aws-sdk";
import {APIGatewayProxyHandlerV2} from "aws-lambda";

const tableName = process.env.TABLE_NAME ?? ""


const dynamoDb = new DynamoDB.DocumentClient();

type FulfillOrderRequest = {
    id: string,
    fulfilled_by: string
}


export const handler: APIGatewayProxyHandlerV2 = async (req) => {

    const fulfillReq: FulfillOrderRequest = JSON.parse(req.body ?? "")
    console.log("received", fulfillReq)
    console.log("received", typeof fulfillReq)

    console.log("put")
    const now = new Date().toISOString()
    const updateParams = {
        TableName: tableName,
        Key: {
            id: fulfillReq.id,
        },
        UpdateExpression: `set fulfilled_by = :fulfilled_by, #st = :state, updated_at = :updated_at`,
        ExpressionAttributeValues: {
            ":state": "fulfilled",
            ":fulfilled_by": fulfillReq.fulfilled_by,
            ":updated_at": now,
            ":expected_state": "created",
        },
        ConditionExpression: `attribute_not_exists(fulfilled_by) and #st = :expected_state`,
        ExpressionAttributeNames: {
            "#st": "state"
        },
        ReturnValues: "ALL_NEW",
    };
    console.log(updateParams)


    const resp = await dynamoDb.update(updateParams).promise();

    return {
        statusCode: 200,
        body: JSON.stringify(resp.Attributes),
    }
};
