import { NextRequest, NextResponse } from "next/server";
import { InferenceClient } from "@huggingface/inference";
import sha256 from "crypto-js/sha256";
import HmacSHA256 from "crypto-js/hmac-sha256";
import Base64 from "crypto-js/enc-base64";
import { evaluateLoginBypass } from "@/lib/runtime";

// Create a shared TextEncoder instance to be reused
const sharedEncoder = new TextEncoder();

export interface ModelConfig {
  id: string;
  max_tokens: number;
  max_input_tokens: number;
  system_prompt?: string;
  default_enable_thinking?: boolean;
}

export function generateFingerprintFromHeaders(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  console.log("[Request IP] ", forwarded, realIp);
  const ipFingerprint = forwarded || realIp || "unknown";
  const userAgent = request.headers.get("user-agent") || "";
  const accept = request.headers.get("accept") || "";
  const language = request.headers.get("accept-language") || "";
  const encoding = request.headers.get("accept-encoding") || "";
  const dnt = request.headers.get("dnt") || "";
  const fingerprint = sha256(
    `${ipFingerprint}-${userAgent}-${accept}-${language}-${encoding}-${dnt}`,
  );
  return Base64.stringify(HmacSHA256(fingerprint, "parthib-anysite"));
}

export async function getInferenceToken(request: NextRequest): Promise<{
  token: string;
  bypassToken?: string;
  error?: { message: string; status: number; openLogin?: boolean };
}> {
  const fingerprint = generateFingerprintFromHeaders(request);
  const canBypass = evaluateLoginBypass(fingerprint);
  if (canBypass) {
    return {
      token: "",
      bypassToken: process.env.NOVITA_API_TOKEN,
    };
  }

  const hf_token =
    request.cookies.get("hf_token")?.value || process.env.DEFAULT_HF_TOKEN;
  if (!hf_token) {
    return {
      token: "",
      error: {
        message: "Log In to continue using the service",
        status: 401,
        openLogin: true,
      },
    };
  }
  let token = hf_token || "";
  return { token };
}

export function checkTokenLimit(tokensUsed: number, modelConfig: ModelConfig) {
  if (tokensUsed >= modelConfig.max_input_tokens) {
    return {
      ok: false,
      openSelectProvider: true,
      message: `Context is too long. ${modelConfig.id} allow ${modelConfig.max_input_tokens} max input tokens.`,
    };
  }
  return null;
}

export function createInferenceClient({
  token,
  bypassToken,
}: {
  token: string;
  bypassToken?: string;
}): InferenceClient {
  const inferenceEndpointUrl = process.env.INFERENCE_ENDPOINT_URL;

  if (inferenceEndpointUrl) {
    return new InferenceClient(token || bypassToken, {
      endpointUrl: inferenceEndpointUrl,
    });
  }

  return new InferenceClient(token || bypassToken);
}

export function createStreamResponse(
  handler: (
    controller: ReadableStreamDefaultController<Uint8Array>,
  ) => Promise<void>,
) {
  const stream = new ReadableStream({
    async start(controller) {
      try {
        await handler(controller);
        controller.close();
      } catch (error) {
        if (
          (error as Error).message.includes(
            "exceeded your monthly included credits",
          )
        ) {
          controller.enqueue(
            sharedEncoder.encode(
              JSON.stringify({
                type: "error",
                message: (error as Error).message,
              }),
            ),
          );
        } else {
          controller.enqueue(
            sharedEncoder.encode(
              JSON.stringify({
                type: "error",
                message:
                  (error as Error).message ||
                  "An error occurred while processing your request.",
              }),
            ),
          );
        }
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/plain",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export function getInferenceOptions(
  modelConfig: ModelConfig,
  messages: any[],
  tokenLimit: number,
) {
  const inferenceEndpointUrl = process.env.INFERENCE_ENDPOINT_URL;

  const options: any = {
    model: modelConfig.id,
    messages,
    max_tokens: tokenLimit || modelConfig.max_tokens,
  };

  if (!inferenceEndpointUrl) {
    options.provider = "novita";
  }

  return options;
}
