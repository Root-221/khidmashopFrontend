import { NextResponse } from "next/server";
import type { AssistantMessage } from "@/types/assistant";
import { buildAssistantReply } from "@/lib/assistant";

type ChatRequestBody = {
  message?: string;
  history?: Array<Pick<AssistantMessage, "role" | "content">>;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as ChatRequestBody | null;
  const message = body?.message?.trim();

  if (!message) {
    return NextResponse.json(
      { message: "Le message est requis." },
      { status: 400 },
    );
  }

  const reply = await buildAssistantReply(message, body?.history ?? []);

  return NextResponse.json(reply);
}
