import { NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/server";

const schema = z.object({
  email: z.string().email(),
  categories_interest: z.array(z.number()).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const supabase = createServiceClient();
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert(
        {
          email: data.email,
          categories_interest: data.categories_interest ?? [],
          unsubscribed_at: null,
        },
        { onConflict: "email" },
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
