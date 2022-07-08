import {EventBus, Function, StackContext, Table} from "@serverless-stack/resources";

export function MyStack({stack}: StackContext) {
    const bus = new EventBus(stack, "EventBus", {})


    const eventBridgeAdapter = new Function(stack, "EventBridgeAdapter", {
        handler: "orders/eventbridgeAdapter.handler",
        environment: {
            EVENT_BUS_NAME: bus.eventBusName
        },
        permissions: [bus],
    });

    const orderTable = new Table(stack, 'OrderTable', {
        fields: {
            id: "string",
        },
        primaryIndex: {partitionKey: "id"},
        consumers: {adapter: eventBridgeAdapter},
        stream: true
    })

    const createOrder = new Function(stack, "CreateOrderFn", {
        handler: "orders/create.handler",
        environment: {
            TABLE_NAME: orderTable.tableName,
        },
        permissions: [orderTable],
        url: true
    });

    const fulfillOrder = new Function(stack, "FulfillOrderFn", {
        handler: "orders/fulfill.handler",
        environment: {
            TABLE_NAME: orderTable.tableName,
        },
        permissions: [orderTable],
        url: true
    });


    /* Integration test resources */
    const testTable = new Table(stack, 'IntegrationTestEvents', {
        fields: {
            PK: "string",
        },
        primaryIndex: {partitionKey: "PK"},
    })

    const eventWriterFn = new Function(stack, "IntegrationEventWriterFn", {
        handler: "test-utils/integrationTestWriter.handler",
        environment: {
            TABLE_NAME: testTable.tableName,
        },
        permissions: [testTable],
    })

    bus.addRules(stack, {
        "catchAll": {
            pattern: {
                detail: {id: [{exists: true}]}
            },
            targets: {
                IntegrationTestFn: eventWriterFn,
            },
        }
    })
    stack.addOutputs({
        CreateOrderEndpoint: createOrder.url ?? "",
        FulfillOrderEndpoint: fulfillOrder.url ?? "",
        EventBusName: bus.eventBusName,
        TestEventTable: testTable.tableName,
    });
}
