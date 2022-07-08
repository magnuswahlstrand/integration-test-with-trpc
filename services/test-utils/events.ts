import {DynamoDB} from "aws-sdk";
import stackOutput from "../output.json"

const dynamoDb = new DynamoDB.DocumentClient({
    region: "eu-west-1",
});

const testEventsTable = stackOutput["dev-integration-test-with-trpc-MyStack"].TestEventTable

export const getPublishedEvent = async (eventType: string, entityId: string) => {
    const getParams = {
        TableName: testEventsTable,
        Key: {
            PK: `${eventType}#${entityId}`,
        },
    };

    const ret = await dynamoDb.get(getParams).promise()

    const item = ret.Item
    if (!item) {
        throw 'event not found'
    }

    return {
        "type": item["event"]["detail-type"],
        "detail": item["event"]["detail"],
    }
}
