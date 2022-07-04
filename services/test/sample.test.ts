import { describe, it, expect, test } from "vitest";
import stackOutput from "./output.json"

describe("sample", () => {
  it("should work", () => {
    expect(true).toBe(true);
  });
});

const testEndpoint = stackOutput["dev-integration-test-with-trpc-MyStack"].CreateOrderEndpoint

async function makeRequest() {
  return fetch(testEndpoint).then(r => r.json())
}

test('makeRequest returns new stock id', async () => {
  // toEqual returns a promise now, so you HAVE to await it

  await expect(makeRequest()).resolves.toEqual({ id: 1 }) // jest API
})
