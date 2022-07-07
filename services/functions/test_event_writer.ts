import {EventBridgeHandler} from "aws-lambda";
import {DynamoDB} from "aws-sdk";
import {z} from "zod";
import {EventBridgeEvent} from "../model";

const dynamoDb = new DynamoDB.DocumentClient();

type Detail = {
    id: string
}

type Resp = {
    id: string
}

const tableName = process.env.DYNAMODB_TABLE_NAME ?? ""

export const handler: EventBridgeHandler<string, Detail, Resp> = async (evt: unknown) => {
    if (typeof evt !== "object" || !evt) {
        throw "invalid event received"
    }
    console.log("BEFORE")
    console.log(evt)


    const req = EventBridgeEvent.passthrough().parse(evt);

    console.log("AFTER")

    const fullEvent = {
        ...evt,
        eventId: `${req["detail-type"]}#${req.detail.id}`,
        // expiresAt: Date.now() + 1000 * 60 * 15,
        expiresAt: Date.now() - 1000 * 3 * 2,
    }

    console.log(fullEvent)

    const putParams = {
        TableName: tableName,
        Item: fullEvent
    };

    const ret = await dynamoDb.put(putParams).promise();

    return {id: "hej"};
};
