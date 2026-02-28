import { NextResponse } from "next/server"

/**
 * Stub API route for assessment submissions.
 * The client (assessment/page.tsx) posts here but handles failures silently.
 * This stub returns 200 to avoid 404 log noise.
 * In a real app this would persist data to a database.
 */
export async function POST() {
    return NextResponse.json({ ok: true })
}
