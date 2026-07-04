import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { optimisticReducer } from "@/hooks/use-optimistic-list";
import { useAsyncAction } from "@/hooks/use-async-action";
import type { ActionResult } from "@/lib/actions";

type Item = { id: string; name: string };

describe("optimisticReducer (pure)", () => {
  const base: Item[] = [
    { id: "1", name: "Acme" },
    { id: "2", name: "Globex" },
  ];

  it("prepends an added item", () => {
    const next = optimisticReducer(base, {
      op: "add",
      data: { id: "3", name: "New" },
    });
    expect(next[0].id).toBe("3");
    expect(next).toHaveLength(3);
  });

  it("patches an item by id, leaves others untouched", () => {
    const next = optimisticReducer(base, {
      op: "update",
      id: "1",
      data: { name: "Acme Inc." },
    });
    expect(next[0]).toEqual({ id: "1", name: "Acme Inc." });
    expect(next[1]).toEqual({ id: "2", name: "Globex" });
  });

  it("removes an item by id", () => {
    const next = optimisticReducer(base, { op: "delete", id: "1" });
    expect(next).toHaveLength(1);
    expect(next[0].id).toBe("2");
  });

  it("is a no-op for an unknown id (same items, new ref)", () => {
    const next = optimisticReducer(base, { op: "delete", id: "nope" });
    expect(next).toEqual(base);
    expect(next).toHaveLength(2);
  });
});

describe("useAsyncAction", () => {
  it("resolves the action result and surfaces success", async () => {
    let calledWith: string | undefined;
    const { result } = renderHook(() =>
      useAsyncAction({
        successMessage: "Done.",
        onSuccess: (m) => (calledWith = m),
      }),
    );

    let resolved: ActionResult<{ id: string }> | undefined;
    await act(async () => {
      resolved = await result.current.run(async () => ({
        ok: true as const,
        data: { id: "x" },
      }));
    });
    expect(resolved!.ok).toBe(true);
    expect(calledWith).toBe("Done.");
  });

  it("runs onOptimistic inside the transition", async () => {
    let optimisticRan = false;
    const { result } = renderHook(() =>
      useAsyncAction({
        onOptimistic: () => (optimisticRan = true),
        onError: () => {},
      }),
    );

    await act(async () => {
      await result.current.run(async () => ({ ok: true, data: undefined }));
    });
    expect(optimisticRan).toBe(true);
  });

  it("surfaces errors and returns the failed result", async () => {
    let errorMsg: string | undefined;
    const { result } = renderHook(() =>
      useAsyncAction({ onError: (e) => (errorMsg = e) }),
    );

    let resolved: ActionResult | undefined;
    await act(async () => {
      resolved = await result.current.run(async () => ({
        ok: false as const,
        error: "Boom.",
      }));
    });
    expect(resolved!.ok).toBe(false);
    expect(errorMsg).toBe("Boom.");
  });

  it("recovers when the action throws", async () => {
    let errorMsg: string | undefined;
    const { result } = renderHook(() =>
      useAsyncAction({ onError: (e) => (errorMsg = e) }),
    );

    let resolved: ActionResult | undefined;
    await act(async () => {
      resolved = await result.current.run(async () => {
        throw new Error("network");
      });
    });
    expect(resolved!.ok).toBe(false);
    expect(errorMsg).toBe("Something went wrong. Please try again.");
  });

  it("resets isPending to false after the action completes", async () => {
    const { result } = renderHook(() =>
      useAsyncAction({ onError: () => {} }),
    );
    expect(result.current.isPending).toBe(false);
    await act(async () => {
      await result.current.run(async () => ({ ok: true, data: undefined }));
    });
    expect(result.current.isPending).toBe(false);
  });
});
