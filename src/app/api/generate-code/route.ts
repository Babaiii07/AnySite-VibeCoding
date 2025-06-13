import { NextRequest, NextResponse } from "next/server";
import { MODEL_CONFIG_CODE_GENERATION } from "@/lib/constants";
import {
  getInferenceToken,
  checkTokenLimit,
  createInferenceClient,
  createStreamResponse,
  getInferenceOptions,
} from "@/lib/inference-utils";

export const dynamic = "force-dynamic";
const NO_THINK_TAG = " /no_think";

export async function POST(request: NextRequest) {
  try {
    const { prompt, html, previousPrompt, colors, modelId } =
      await request.json();

    if (!prompt) {
      return NextResponse.json(
        {
          ok: false,
          message: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // Find the model config by modelId or use the first one as default
    const modelConfig = modelId
      ? MODEL_CONFIG_CODE_GENERATION.find((config) => config.id === modelId) ||
        MODEL_CONFIG_CODE_GENERATION[0]
      : MODEL_CONFIG_CODE_GENERATION[0];

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

    // Calculate the estimated number of tokens used, this is not accurate.
    let TOKENS_USED = prompt?.length || 0;
    if (previousPrompt) TOKENS_USED += previousPrompt.length;
    if (html) TOKENS_USED += html.length;

    // Check token limit
    const tokenLimitError = checkTokenLimit(TOKENS_USED, modelConfig);
    if (tokenLimitError) {
      return NextResponse.json(tokenLimitError, { status: 400 });
    }

    const actualNoThinkTag = modelConfig.default_enable_thinking
      ? NO_THINK_TAG
      : "";

    // Use streaming response
    return createStreamResponse(async (controller) => {
      const client = createInferenceClient(tokenResult);
      let completeResponse = "";

      const messages = [
        {
          role: "system",
          content: modelConfig.system_prompt,
        },
        ...(previousPrompt
          ? [
              {
                role: "user",
                content: previousPrompt,
              },
            ]
          : []),
        ...(html
          ? [
              {
                role: "assistant",
                content: `The current code is: ${html}.`,
              },
            ]
          : []),
        ...(colors && colors.length > 0
          ? [
              {
                role: "user",
                content: `Use the following color palette in your UI design: ${colors.join(", ")}`,
              },
            ]
          : []),
        {
          role: "user",
          content: prompt + actualNoThinkTag,
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
          completeResponse += content;
          if (completeResponse.includes("</html>")) {
            break;
          }
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
