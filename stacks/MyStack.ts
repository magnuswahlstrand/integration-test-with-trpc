import {EventBus, Function, StackContext, Table} from "@serverless-stack/resources";

export function MyStack({stack}: StackContext) {
    const bus = new EventBus(stack, "EventBus", {})

    const createOrder = new Function(stack, "CreateOrderFn", {
        handler: "functions/create_order.handler",
        environment: {
            EVENT_BUS_NAME: bus.eventBusName
        },
        permissions: [bus],
        url: true
    });


    // Integration test resources
    const testTable = new Table(stack, 'IntegrationTestEvents', {
        fields: {
            eventId: "string",
        },
        primaryIndex: {partitionKey: "eventId"},
        timeToLiveAttribute: "expiresAt",
    })

    const eventWriterFn = new Function(stack, "IntegrationEventWriterFn", {
        handler: "functions/test_event_writer.handler",
        environment: {
            DYNAMODB_TABLE_NAME: testTable.tableName,
            EXPIRY_TIME_MINUTES: '15'
        },
        permissions: [testTable],
        url: true
    })

    bus.addRules(stack, {
        "catchAll": {
            pattern: {detailType: ["order.created"]},
            targets: {
                IntegrationTestFn: eventWriterFn,
            },
        }
    })

    stack.addOutputs({
        CreateOrderEndpoint: createOrder.url ?? "",
        EventWriterFnEndpoint: eventWriterFn.url ?? "",
        EventBusName: bus.eventBusName,
    });
}
