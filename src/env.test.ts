import { describe, it, expect } from "vitest";

describe("env", () => {
  it("parses required vars and exposes them typed", async () => {
    process.env.DATABASE_URL = "postgresql://x";
    process.env.BETTER_AUTH_SECRET = "0123456789abcdef0123456789abcdef";
    process.env.BETTER_AUTH_URL = "http://localhost:3000";
    process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
    process.env.EMAIL_FROM = "test@example.com";
    const { env } = await import("./env");
    expect(env.DATABASE_URL).toBe("postgresql://x");
    expect(env.EMAIL_FROM).toBe("test@example.com");
  });
});
