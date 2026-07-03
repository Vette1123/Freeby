// ID generation for the Freeby domain tables.
//
// The starter uses Better-Auth's string IDs (text primary keys, no autoincrement).
// We match that for our own tables with prefixed, sortable, URL-friendly IDs
// generated from a timestamp + random base36 tail. Monotonic-ish and unguessable
// enough for a single-tenant-row model where every row is also scoped by userId.
import { randomBytes } from "node:crypto";

const EPOCH = 1_704_067_200_000; // 2024-01-01T00:00:00Z — keeps IDs short.

function timePart(now: number): string {
  return (now - EPOCH).toString(36);
}

function randPart(bytes = 8): string {
  return randomBytes(bytes).toString("hex");
}

/** Generate a prefixed, timestamp-led ID, e.g. `cli_m1abc2def`. */
export function newId(prefix: string): string {
  return `${prefix}_${timePart(Date.now())}${randPart(4)}`;
}

/** Convenience prefixes per table — keeps IDs self-describing in logs and URLs. */
export const ids = {
  client: () => newId("cli"),
  project: () => newId("prj"),
  timeEntry: () => newId("tim"),
  invoice: () => newId("inv"),
  invoiceItem: () => newId("itm"),
  subscription: () => newId("sub"),
};
