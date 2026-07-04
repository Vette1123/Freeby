"use client";
// Thin typed wrapper over React 19's useOptimistic for list pages. Each list
// (clients, projects, invoices, timer entries) renders from server-fetched
// rows. When a mutation fires we apply a local op inside the same transition
// that runs the server action; the action's revalidatePath then flows fresh
// props down and React reconciles the optimistic state away automatically.
//
// Each item MUST have a string `id`. Operations are described by a small
// discriminated union so each list page doesn't reimplement a reducer.
import { useOptimistic } from "react";

export type OptimisticOp<T> =
  | { op: "add"; data: T }
  | { op: "update"; id: string; data: Partial<T> }
  | { op: "delete"; id: string };

/** Pure reducer — exported so it can be unit-tested in isolation. */
export function optimisticReducer<T extends { id: string }>(
  state: T[],
  action: OptimisticOp<T>,
): T[] {
  switch (action.op) {
    case "add":
      return [action.data, ...state];
    case "update":
      return state.map((it) =>
        it.id === action.id ? { ...it, ...action.data } : it,
      );
    case "delete":
      return state.filter((it) => it.id !== action.id);
    default:
      return state;
  }
}

export function useOptimisticList<T extends { id: string }>(
  realItems: T[],
) {
  const [items, updateOptimistic] = useOptimistic(realItems, optimisticReducer<T>);
  return { items, updateOptimistic };
}
