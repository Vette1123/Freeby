import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Auth endpoints touch the DB, sign cookies/tokens, and must never be cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const { POST, GET } = toNextJsHandler(auth);
