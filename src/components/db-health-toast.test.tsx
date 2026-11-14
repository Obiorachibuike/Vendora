// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";
import React from "react";

const toastMock = vi.hoisted(() => ({
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: toastMock,
}));

import { DbHealthToast } from "./db-health-toast";

const SHOWN_KEY = "vendora.db-health-toast.shown";

function mockFetchOnce(payload: unknown, init?: { ok?: boolean; status?: number }) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: init?.ok ?? true,
    status: init?.status ?? 200,
    json: async () => payload,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  window.sessionStorage.clear();
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("DbHealthToast", () => {
  it("toasts success when the database is connected", async () => {
    mockFetchOnce({ status: "ok" });
    render(React.createElement(DbHealthToast));
    await waitFor(() => expect(toastMock.success).toHaveBeenCalledTimes(1));
    expect(toastMock.success).toHaveBeenCalledWith(
      "Database connected",
      expect.objectContaining({ description: expect.any(String) }),
    );
    expect(toastMock.error).not.toHaveBeenCalled();
  });

  it("toasts an error when the database is unavailable", async () => {
    mockFetchOnce({ status: "db_unavailable" });
    render(React.createElement(DbHealthToast));
    await waitFor(() => expect(toastMock.error).toHaveBeenCalledTimes(1));
    expect(toastMock.error).toHaveBeenCalledWith(
      "Database disconnected",
      expect.objectContaining({ description: expect.any(String) }),
    );
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it("toasts a schema-specific error when migrations are missing", async () => {
    mockFetchOnce({ status: "schema_missing" });
    render(React.createElement(DbHealthToast));
    await waitFor(() => expect(toastMock.error).toHaveBeenCalledTimes(1));
    expect(toastMock.error).toHaveBeenCalledWith(
      "Database schema is out of date",
      expect.any(Object),
    );
  });

  it("shows only once per tab session", async () => {
    mockFetchOnce({ status: "ok" });
    const first = render(React.createElement(DbHealthToast));
    await waitFor(() => expect(toastMock.success).toHaveBeenCalledTimes(1));
    first.unmount();

    render(React.createElement(DbHealthToast));
    // Allow any effect to run; no second fetch, no second toast.
    await new Promise((r) => setTimeout(r, 20));
    expect(toastMock.success).toHaveBeenCalledTimes(1);
    expect(window.sessionStorage.getItem(SHOWN_KEY)).toBe("1");
  });

  it("surfaces a fetch failure instead of crashing", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    render(React.createElement(DbHealthToast));
    await waitFor(() => expect(toastMock.error).toHaveBeenCalledTimes(1));
    expect(toastMock.error).toHaveBeenCalledWith(
      "Couldn't check database status",
      expect.any(Object),
    );
  });
});
