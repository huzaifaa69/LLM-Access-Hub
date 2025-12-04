import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Initialize default model configurations
export const initializeModels = mutation({
  args: {},
  handler: async (ctx) => {
    const existingModels = await ctx.db.query("modelConfigs").collect();
    if (existingModels.length > 0) return;

    const defaultModels = [
      // OpenAI Models (built-in support)
      {
        provider: "openai",
        name: "gpt-4.1-nano",
        displayName: "GPT-4.1 Nano",
        description: "Fast and efficient model for general tasks",
        maxTokens: 4096,
        supportsStreaming: true,
        isEnabled: true,
        apiKeyRequired: false,
        category: "chat",
        pricing: { inputTokens: 0.15, outputTokens: 0.60, currency: "USD" },
      },
      {
        provider: "openai",
        name: "gpt-4o-mini",
        displayName: "GPT-4o Mini",
        description: "Optimized model for quick responses",
        maxTokens: 8192,
        supportsStreaming: true,
        isEnabled: true,
        apiKeyRequired: false,
        category: "chat",
        pricing: { inputTokens: 0.15, outputTokens: 0.60, currency: "USD" },
      },
      {
        provider: "openai",
        name: "gpt-4o",
        displayName: "GPT-4o",
        description: "Most capable OpenAI model",
        maxTokens: 8192,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 5.00, outputTokens: 15.00, currency: "USD" },
      },
      {
        provider: "openai",
        name: "gpt-4-turbo",
        displayName: "GPT-4 Turbo",
        description: "High-performance model with large context",
        maxTokens: 4096,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 10.00, outputTokens: 30.00, currency: "USD" },
      },
      {
        provider: "openai",
        name: "o1-preview",
        displayName: "o1 Preview",
        description: "Advanced reasoning model for complex problems",
        maxTokens: 32768,
        supportsStreaming: false,
        isEnabled: false,
        apiKeyRequired: true,
        category: "reasoning",
        pricing: { inputTokens: 15.00, outputTokens: 60.00, currency: "USD" },
      },
      {
        provider: "openai",
        name: "o1-mini",
        displayName: "o1 Mini",
        description: "Faster reasoning model for coding and math",
        maxTokens: 65536,
        supportsStreaming: false,
        isEnabled: false,
        apiKeyRequired: true,
        category: "reasoning",
        pricing: { inputTokens: 3.00, outputTokens: 12.00, currency: "USD" },
      },
      // Anthropic Claude Models
      {
        provider: "anthropic",
        name: "claude-3-5-sonnet-20241022",
        displayName: "Claude 3.5 Sonnet",
        description: "Most intelligent Claude model",
        maxTokens: 8192,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 3.00, outputTokens: 15.00, currency: "USD" },
      },
      {
        provider: "anthropic",
        name: "claude-3-5-haiku-20241022",
        displayName: "Claude 3.5 Haiku",
        description: "Fast and efficient Claude model",
        maxTokens: 4096,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 0.25, outputTokens: 1.25, currency: "USD" },
      },
      {
        provider: "anthropic",
        name: "claude-3-opus-20240229",
        displayName: "Claude 3 Opus",
        description: "Most powerful Claude model for complex tasks",
        maxTokens: 4096,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 15.00, outputTokens: 75.00, currency: "USD" },
      },
      // Google Gemini Models
      {
        provider: "google",
        name: "gemini-1.5-pro",
        displayName: "Gemini 1.5 Pro",
        description: "Google's most capable model with long context",
        maxTokens: 8192,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 1.25, outputTokens: 5.00, currency: "USD" },
      },
      {
        provider: "google",
        name: "gemini-1.5-flash",
        displayName: "Gemini 1.5 Flash",
        description: "Fast and efficient Gemini model",
        maxTokens: 8192,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 0.075, outputTokens: 0.30, currency: "USD" },
      },
      {
        provider: "google",
        name: "gemini-2.0-flash-exp",
        displayName: "Gemini 2.0 Flash (Experimental)",
        description: "Latest experimental Gemini model",
        maxTokens: 8192,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 0.075, outputTokens: 0.30, currency: "USD" },
      },
      // DeepSeek Models
      {
        provider: "deepseek",
        name: "deepseek-chat",
        displayName: "DeepSeek Chat",
        description: "DeepSeek's general purpose chat model",
        maxTokens: 4096,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 0.14, outputTokens: 0.28, currency: "USD" },
      },
      {
        provider: "deepseek",
        name: "deepseek-coder",
        displayName: "DeepSeek Coder",
        description: "Specialized model for coding tasks",
        maxTokens: 4096,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "code",
        pricing: { inputTokens: 0.14, outputTokens: 0.28, currency: "USD" },
      },
      {
        provider: "deepseek",
        name: "deepseek-reasoner",
        displayName: "DeepSeek Reasoner",
        description: "Advanced reasoning model for complex problems",
        maxTokens: 4096,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "reasoning",
        pricing: { inputTokens: 0.55, outputTokens: 2.19, currency: "USD" },
      },
      // Mistral Models
      {
        provider: "mistral",
        name: "mistral-large-latest",
        displayName: "Mistral Large",
        description: "Mistral's most capable model",
        maxTokens: 8192,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 2.00, outputTokens: 6.00, currency: "USD" },
      },
      {
        provider: "mistral",
        name: "mistral-small-latest",
        displayName: "Mistral Small",
        description: "Efficient model for most tasks",
        maxTokens: 8192,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 0.20, outputTokens: 0.60, currency: "USD" },
      },
      // Cohere Models
      {
        provider: "cohere",
        name: "command-r-plus",
        displayName: "Command R+",
        description: "Cohere's most capable model",
        maxTokens: 4096,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 2.50, outputTokens: 10.00, currency: "USD" },
      },
      {
        provider: "cohere",
        name: "command-r",
        displayName: "Command R",
        description: "Balanced performance and efficiency",
        maxTokens: 4096,
        supportsStreaming: true,
        isEnabled: false,
        apiKeyRequired: true,
        category: "chat",
        pricing: { inputTokens: 0.50, outputTokens: 1.50, currency: "USD" },
      },
    ];

    for (const model of defaultModels) {
      await ctx.db.insert("modelConfigs", model);
    }
  },
});

export const getAvailableModels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("modelConfigs")
      .withIndex("by_enabled", (q) => q.eq("isEnabled", true))
      .collect();
  },
});

export const getAllModels = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("modelConfigs").collect();
  },
});

export const getModelsByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("modelConfigs")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
  },
});

export const updateModelConfig = mutation({
  args: {
    modelId: v.id("modelConfigs"),
    isEnabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.modelId, {
      isEnabled: args.isEnabled,
    });
  },
});
