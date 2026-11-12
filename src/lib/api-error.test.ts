import { describe, expect, it } from "vitest";
import { userMessage, zodErrorMessage } from "./api-error";
import { registerSchema } from "./validations";

/** Build a drizzle-style DrizzleQueryError: top-level Error with the real driver error on `cause`. */
function drizzleQueryError(cause: unknown): Error {
  const err = new Error(
    'Failed query: insert into "users" ...\nparams: 1,email@example.com',
    { cause },
  );
  err.name = "DrizzleQueryError";
  return err;
}

describe("userMessage", () => {
  it("classifies a nested (drizzle-wrapped) missing-table error as a schema problem", () => {
    const pg = Object.assign(new Error('relation "users" does not exist'), {
      code: "42P01",
    });
    expect(userMessage(drizzleQueryError(pg), "fallback")).toBe(
      "The database schema is out of date. Please run the migrations.",
    );
  });

  it("classifies a nested unique-violation as a duplicate record", () => {
    const pg = Object.assign(new Error("duplicate key value violates unique constraint"), {
      code: "23505",
    });
    expect(userMessage(drizzleQueryError(pg), "fallback")).toBe(
      "That record already exists.",
    );
  });

  it("classifies a nested connection error as unreachable database", () => {
    const pg = Object.assign(new Error("connect ECONNREFUSED 10.0.0.1:5432"), {
      code: "ECONNREFUSED",
    });
    expect(userMessage(drizzleQueryError(pg), "fallback")).toBe(
      "We couldn't reach the database. Please try again in a moment.",
    );
  });

  it("classifies a DNS failure nested in the chain as unreachable database", () => {
    const pg = new Error("getaddrinfo EAI_AGAIN db.example.com");
    expect(userMessage(drizzleQueryError(pg), "fallback")).toBe(
      "We couldn't reach the database. Please try again in a moment.",
    );
  });

  it("classifies too-many-connections (SQLSTATE 53300) as unreachable/retryable", () => {
    const pg = Object.assign(new Error("remaining connection slots are reserved"), {
      code: "53300",
    });
    expect(userMessage(drizzleQueryError(pg), "fallback")).toBe(
      "We couldn't reach the database. Please try again in a moment.",
    );
  });

  it("classifies bad database credentials as a configuration problem", () => {
    const pg = Object.assign(new Error("password authentication failed for user \"vendora\""), {
      code: "28P01",
    });
    expect(userMessage(drizzleQueryError(pg), "fallback")).toBe(
      "A server configuration problem prevented this action. Please contact support.",
    );
  });

  it("finds ECONNREFUSED on a Node 22 AggregateError (autoSelectFamily)", () => {
    // Shape produced by pg/undici on modern Node: AggregateError with per-address errors.
    const inner = [
      Object.assign(new Error("connect ECONNREFUSED ::1:5432"), { code: "ECONNREFUSED" }),
      Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:5432"), { code: "ECONNREFUSED" }),
    ];
    const agg = Object.assign(new AggregateError(inner, ""), { code: "ECONNREFUSED" });
    expect(userMessage(drizzleQueryError(agg), "fallback")).toBe(
      "We couldn't reach the database. Please try again in a moment.",
    );
  });

  it("finds codes carried only by the inner AggregateError errors", () => {
    const inner = [
      Object.assign(new Error("connect ECONNREFUSED 127.0.0.1:5432"), { code: "ECONNREFUSED" }),
    ];
    const agg = new AggregateError(inner, "connection attempts failed"); // no own code
    expect(userMessage(drizzleQueryError(agg), "fallback")).toBe(
      "We couldn't reach the database. Please try again in a moment.",
    );
  });

  it("classifies a plain AggregateError message via regex", () => {
    const agg = new AggregateError(
      [new Error("getaddrinfo EAI_AGAIN db.example.com")],
      "",
    );
    expect(userMessage(drizzleQueryError(agg), "fallback")).toBe(
      "We couldn't reach the database. Please try again in a moment.",
    );
  });

  it("classifies a referenced-record failure", () => {
    const pg = Object.assign(new Error("insert or update on table violates foreign key constraint"), {
      code: "23503",
    });
    expect(userMessage(drizzleQueryError(pg), "fallback")).toBe(
      "A referenced record was not found. Refresh and try again.",
    );
  });

  it("looks through multiple levels of nesting", () => {
    const pg = Object.assign(new Error("column does not exist"), { code: "42703" });
    const level1 = drizzleQueryError(pg);
    const level2 = new Error("wrapper", { cause: level1 });
    expect(userMessage(level2, "fallback")).toBe(
      "The database schema is out of date. Please run the migrations.",
    );
  });

  it("still classifies plain (unwrapped) errors carrying a code", () => {
    const err = Object.assign(new Error("not null violation"), { code: "23502" });
    expect(userMessage(err, "fallback")).toBe("A required field was missing.");
  });

  it("returns the fallback for unrecognized errors", () => {
    expect(userMessage(new Error("something odd happened"), "fallback")).toBe(
      "fallback",
    );
    expect(userMessage(null, "fallback")).toBe("fallback");
    expect(userMessage(undefined, "fallback")).toBe("fallback");
    expect(userMessage("a string error", "fallback")).toBe("fallback");
  });

  it("survives circular cause chains", () => {
    const err: Error & { cause?: unknown } = new Error("boom");
    err.cause = err;
    expect(userMessage(err, "fallback")).toBe("fallback");
  });
});

describe("zodErrorMessage", () => {
  it("flattens field errors into a readable string", () => {
    const parsed = registerSchema.safeParse({
      name: "J",
      email: "not-an-email",
      password: "weak",
      country: "",
      currency: "",
      acceptTerms: false,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const message = zodErrorMessage(parsed.error);
      expect(typeof message).toBe("string");
      expect(message).toContain("email");
      expect(message).toContain("password");
      expect(message.length).toBeGreaterThan(0);
    }
  });
});
