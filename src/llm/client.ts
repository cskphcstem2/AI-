import { DELEGATES } from "@/content/delegates";
import type { AiDelegateId, DelegateProfile } from "@/types/game";

export interface LlmRequest {
  purpose: "chair" | "aide" | "secretariat" | "delegate" | "judge";
  delegateId?: AiDelegateId;
  instructions: string;
  input: string;
  temperature?: number;
}

export interface LlmClient {
  id: "mock" | "openai-compatible";
  complete(request: LlmRequest): Promise<string>;
}

export function buildDelegateSystemPrompt(delegate: DelegateProfile): string {
  return [
    `你是模擬聯合國訓練中的${delegate.countryZh}代表。`,
    `說話風格：${delegate.style}`,
    `核心利益：${delegate.interests.join("；")}`,
    `紅線：${delegate.redLines.join("；")}`,
    "不可承諾越過紅線的方案。不可代替玩家決定肯尼亞的立場。",
    "用繁體中文，120 字以內。這是教學模擬的簡化立場，不是政府聲明。",
    "若引用數字，必須註明它是訓練摘要，並提醒核對原文。",
  ].join("\n");
}

export function createLlmClient(env: {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
}): LlmClient {
  if (env.baseUrl && env.apiKey) {
    return new OpenAiCompatibleClient(env.baseUrl, env.apiKey, env.model || "gpt-4o-mini");
  }
  return new MockLlmClient();
}

class MockLlmClient implements LlmClient {
  id = "mock" as const;

  complete(request: LlmRequest): Promise<string> {
    const delegate = request.delegateId ? DELEGATES[request.delegateId] : undefined;
    const who = delegate ? `${delegate.placard}代表` : "訓練引擎";
    return Promise.resolve(
      `${who}維持既定立場。目前對局使用內建規則，以守住紅線、連署與表決；此接口預留給日後改寫語氣，不改寫結果。`,
    );
  }
}

class OpenAiCompatibleClient implements LlmClient {
  id = "openai-compatible" as const;
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly model: string;

  constructor(baseUrl: string, apiKey: string, model: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(request: LlmRequest): Promise<string> {
    const response = await fetch(`${this.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: request.temperature ?? 0.4,
        messages: [
          { role: "system", content: request.instructions },
          { role: "user", content: request.input },
        ],
      }),
    });
    if (!response.ok) {
      throw new Error(`語言模型接口回應 ${response.status}`);
    }
    const payload = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) throw new Error("語言模型沒有返回文字");
    return text;
  }
}

export function llmEnvFromImportMeta(env: ImportMetaEnv): {
  baseUrl?: string;
  apiKey?: string;
  model?: string;
} {
  return {
    baseUrl: env.VITE_LLM_BASE_URL,
    apiKey: env.VITE_LLM_API_KEY,
    model: env.VITE_LLM_MODEL,
  };
}
