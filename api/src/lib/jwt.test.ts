import { describe, expect, it } from "vitest";
import { signAuthToken, verifyAuthToken } from "./jwt";

describe("auth tokens", () => {
  const secret = "test-secret";

  it("round-trips the user id through sign and verify", async () => {
    const token = await signAuthToken("user-123", secret);
    expect(await verifyAuthToken(token, secret)).toBe("user-123");
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await signAuthToken("user-123", secret);
    expect(await verifyAuthToken(token, "other-secret")).toBeNull();
  });

  it("rejects a malformed token", async () => {
    expect(await verifyAuthToken("not-a-jwt", secret)).toBeNull();
  });
});
