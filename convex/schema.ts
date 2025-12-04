import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  conversations: defineTable({
    userId: v.id("users"),
    title: v.string(),
    modelProvider: v.string(),
    modelName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_updated", ["userId", "updatedAt"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
    content: v.string(),
    timestamp: v.number(),
    modelProvider: v.optional(v.string()),
    modelName: v.optional(v.string()),
    tokenCount: v.optional(v.number()),
    isStreaming: v.optional(v.boolean()),
  })
    .index("by_conversation", ["conversationId", "timestamp"]),

  modelConfigs: defineTable({
    provider: v.string(),
    name: v.string(),
    displayName: v.string(),
    description: v.string(),
    maxTokens: v.number(),
    supportsStreaming: v.boolean(),
    isEnabled: v.boolean(),
    apiKeyRequired: v.boolean(),
    category: v.string(), // "chat", "code", "creative", etc.
    pricing: v.optional(v.object({
      inputTokens: v.number(),
      outputTokens: v.number(),
      currency: v.string(),
    })),
  })
    .index("by_provider", ["provider"])
    .index("by_enabled", ["isEnabled"])
    .index("by_category", ["category"]),

  userSettings: defineTable({
    userId: v.id("users"),
    openaiApiKey: v.optional(v.string()),
    anthropicApiKey: v.optional(v.string()),
    googleApiKey: v.optional(v.string()),
    deepseekApiKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),

  modelSettings: defineTable({
    userId: v.id("users"),
    modelProvider: v.string(),
    modelName: v.string(),
    temperature: v.number(),
    maxTokens: v.number(),
    topP: v.number(),
    frequencyPenalty: v.number(),
    presencePenalty: v.number(),
    systemPrompt: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_model", ["userId", "modelProvider", "modelName"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
