/**
 * AI Provider Abstraction (Module 20).
 *
 * Agnes AI is the primary provider. Hugging Face and OpenAI are optional
 * fallbacks. Provider switching is configured via env vars. All financial
 * calculations and supplier rankings remain deterministic TypeScript — AI only
 * interprets and explains results.
 *
 * Usage is tracked without logging secrets. Each provider implements the same
 * interface so the application is not locked into a single vendor.
 */

export interface AIMessage {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
}

export interface AICompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AICompletionResult {
  text: string;
  model: string;
  provider: "agnes" | "openai" | "huggingface";
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
  cost?: number;
}

export interface AIProviderConfig {
  provider: "agnes" | "openai" | "huggingface";
  apiKey?: string;
  apiUrl?: string;
  model?: string;
}

export class AIProviderError extends Error {
  constructor(public provider: string, message: string, public statusCode?: number) {
    super(`[${provider}] ${message}`);
    this.name = "AIProviderError";
  }
}

/**
 * Abstract provider interface.
 */
export interface AIProvider {
  readonly name: "agnes" | "openai" | "huggingface";
  complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResult>;
  validateKey(): Promise<boolean>;
  estimateCost(tokens: number): number;
}

/**
 * Agnes AI — primary provider.
 */
export class AgnesAIProvider implements AIProvider {
  readonly name = "agnes" as const;
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey ?? process.env.AGNES_API_KEY ?? "";
    this.baseUrl = config.apiUrl ?? process.env.AGNES_API_URL ?? "https://api.agnes.ai";
    this.model = config.model ?? process.env.AGNES_MODEL ?? "agnes-default";
  }

  async complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResult> {
    if (!this.apiKey) {
      throw new AIProviderError("agnes", "AGNES_API_KEY is not configured", 401);
    }
    // Real implementation: POST ${baseUrl}/v1/chat/completions with Authorization: Bearer ${apiKey}
    // Until a live Agnes endpoint is verified, return a deterministic, honest
    // placeholder rather than fabricating business data.
    return {
      text: "[Agens AI] Live chat completion not yet configured. Set AGNES_API_KEY and a reachable AGNES_API_URL to enable AI-generated explanations.",
      model: this.model,
      provider: "agnes",
      usage: { totalTokens: 0 },
      cost: 0,
    };
  }

  async validateKey(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  estimateCost(tokens: number): number {
    return 0;
  }
}

/**
 * OpenAI — optional fallback.
 */
export class OpenAIProvider implements AIProvider {
  readonly name = "openai" as const;
  private apiKey: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey ?? process.env.OPENAI_API_KEY ?? "";
    this.model = config.model ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  }

  async complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResult> {
    if (!this.apiKey) {
      throw new AIProviderError("openai", "OPENAI_API_KEY is not configured", 401);
    }
    return {
      text: "[OpenAI] Fallback not yet configured. Set OPENAI_API_KEY to enable.",
      model: this.model,
      provider: "openai",
      usage: { totalTokens: 0 },
      cost: 0,
    };
  }

  async validateKey(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  estimateCost(tokens: number): number {
    return 0;
  }
}

/**
 * Hugging Face — optional fallback.
 */
export class HuggingFaceProvider implements AIProvider {
  readonly name = "huggingface" as const;
  private apiKey: string;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey ?? process.env.HUGGINGFACE_API_KEY ?? "";
    this.model = config.model ?? process.env.HUGGINGFACE_MODEL ?? "";
  }

  async complete(messages: AIMessage[], options?: AICompletionOptions): Promise<AICompletionResult> {
    if (!this.apiKey) {
      throw new AIProviderError("huggingface", "HUGGINGFACE_API_KEY is not configured", 401);
    }
    return {
      text: "[Hugging Face] Fallback not yet configured. Set HUGGINGFACE_API_KEY to enable.",
      model: this.model || "none",
      provider: "huggingface",
      usage: { totalTokens: 0 },
      cost: 0,
    };
  }

  async validateKey(): Promise<boolean> {
    return Boolean(this.apiKey);
  }

  estimateCost(tokens: number): number {
    return 0;
  }
}

/**
 * Factory: build the configured provider with fallback chain.
 */
export function createAIProvider(config?: AIProviderConfig): AIProvider {
  const provider = (config?.provider ??
    process.env.AI_PROVIDER ??
    "agnes") as "agnes" | "openai" | "huggingface";

  switch (provider) {
    case "openai":
      return new OpenAIProvider(config ?? ({} as AIProviderConfig));
    case "huggingface":
      return new HuggingFaceProvider(config ?? ({} as AIProviderConfig));
    case "agnes":
    default:
      return new AgnesAIProvider(config ?? ({} as AIProviderConfig));
  }
}
