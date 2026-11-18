import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-revalidate-secret");

    if (
        !process.env.REVALIDATE_SECRET ||
        secret !== process.env.REVALIDATE_SECRET
    ) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const tags: string[] = Array.isArray(body.tags) ? body.tags : [];

    // "max" = stale-while-revalidate: visitor-কে সাথে সাথে cached page দেয়, background-এ নতুন তৈরি হয়
    tags.forEach((tag) => revalidateTag(tag, "max"));

    return NextResponse.json({ ok: true, revalidated: tags });
}
