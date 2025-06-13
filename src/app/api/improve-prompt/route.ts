import { NextRequest, NextResponse } from "next/server";
import { MODEL_CONFIG_PROMPT_IMPROVEMENT } from "@/lib/constants";
import {
  getInferenceToken,
  checkTokenLimit,
  createInferenceClient,
  createStreamResponse,
  getInferenceOptions,
} from "@/lib/inference-utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { prompt, provider } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        {
          ok: false,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Get inference token
    const tokenResult = await getInferenceToken(request);
    if (tokenResult.error) {
      return NextResponse.json(
        {
          ok: false,
          openLogin: tokenResult.error.openLogin,
          message: tokenResult.error.message,
        },
        { status: tokenResult.error.status },
      );
    }

    let TOKENS_USED = prompt?.length || 0;

    let modelConfig = MODEL_CONFIG_PROMPT_IMPROVEMENT;

    // Check token limit
    if (provider !== "auto") {
      const tokenLimitError = checkTokenLimit(TOKENS_USED, modelConfig);
      if (tokenLimitError) {
        return NextResponse.json(tokenLimitError, { status: 400 });
      }
    }

    // Use streaming response
    return createStreamResponse(async (controller) => {
      const client = createInferenceClient(tokenResult);

      const messages = [
        {
          role: "system",
          content: `You are an expert prompt engineer capable of enhancing prompts for generating precise HTML website development requests aimed at building visually stunning, intuitive UI/UX designs and fully functional components. KEEP IT CONCISE AND LESS THAN 256 TOKENS. GIVE ME THE IMPROVED PROMPT ONLY, NOTHING ELSE. DO NOT ENCLOSE THE PROMPT IN DOUBLE QUOTATION MARKS.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ];

      const chatCompletion = client.chatCompletionStream(
        getInferenceOptions(modelConfig, messages, modelConfig.max_tokens),
      );

      const encoder = new TextEncoder();
      for await (const chunk of chatCompletion) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          controller.enqueue(encoder.encode(content));
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
