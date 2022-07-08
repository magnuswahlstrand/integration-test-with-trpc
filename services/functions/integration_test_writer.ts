import {EventBridgeHandler} from "aws-lambda";
import {DynamoDB} from "aws-sdk";

const tableName = process.env.TABLE_NAME ?? ""

const dynamoDb = new DynamoDB.DocumentClient();

type OrderEvent = {
    id: string
    amount: number
}

type eventTypes = "order.created" | "order.fulfilled"
type events = OrderEvent

export const handler: EventBridgeHandler<eventTypes, events, void> = async (evt) => {
    // e.g. order.created#a42db13b-5ea0-46f3-8903-93eee711c8fd
    const PK = `${evt["detail-type"]}#${evt.detail.id}`

    const putParams = {
        TableName: tableName,
        Item: {
            PK: PK,
            event: evt,
        }
    };

    await dynamoDb.put(putParams).promise();
};
