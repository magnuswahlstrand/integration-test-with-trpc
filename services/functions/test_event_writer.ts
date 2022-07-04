import {EventBridgeHandler} from "aws-lambda";

type Detail = {
    id: string
}

type Resp = {
    id: string
}

export const handler: EventBridgeHandler<string, Detail, Resp> = async (detailType, detail) => {
    const result: Resp = {id: "hej"}
    console.log(detail, detailType)
    return result;
};
