


# Inspired by

* [Integration Testing Serverless](https://www.youtube.com/watch?v=s8tO-ymVQPg&list=PLDIu7GWCCNTLdyHlcpeQ8nbE6xt7YKpOY&index=3&t=2412s) by [Akos Krivachy](https://twitter.com/akoskrivachy)

npx sst deploy --outputs-file outputs.json


# How to send put events

https://youtu.be/iMsPztMiFIk?t=2433


https://github.com/spezam/eventbridge-cli


If I have "source":"aws.lambda", the messages get ingored silently (or sent to the default event bus?)
```
{
    "FailedEntryCount": 1,
    "Entries": [
        {
            "ErrorCode": "NotAuthorizedForSourceException",
            "ErrorMessage": "Not authorized for the source."
        }
    ]
}
```

Get routed to the default message bus! Hard to discover.

```
eventbridge-cli
npx sst deploy --outputs-file services/test/output.json
```

https://stackoverflow.com/questions/38213668/promise-retry-design-patterns


describe.concurrent
