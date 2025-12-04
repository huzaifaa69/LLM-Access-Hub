import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return settings;
  },
});

export const saveApiKeys = mutation({
  args: {
    openai: v.optional(v.string()),
    anthropic: v.optional(v.string()),
    google: v.optional(v.string()),
    deepseek: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingSettings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const settingsData = {
      userId,
      openaiApiKey: args.openai || "",
      anthropicApiKey: args.anthropic || "",
      googleApiKey: args.google || "",
      deepseekApiKey: args.deepseek || "",
      updatedAt: Date.now(),
    };

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, settingsData);
    } else {
      await ctx.db.insert("userSettings", {
        ...settingsData,
        createdAt: Date.now(),
      });
    }
  },
});

export const saveModelSettings = mutation({
  args: {
    modelProvider: v.string(),
    modelName: v.string(),
    settings: v.object({
      temperature: v.number(),
      maxTokens: v.number(),
      topP: v.number(),
      frequencyPenalty: v.number(),
      presencePenalty: v.number(),
      systemPrompt: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existingSettings = await ctx.db
      .query("modelSettings")
      .withIndex("by_user_model", (q) => 
        q.eq("userId", userId)
         .eq("modelProvider", args.modelProvider)
         .eq("modelName", args.modelName)
      )
      .unique();

    const settingsData = {
      userId,
      modelProvider: args.modelProvider,
      modelName: args.modelName,
      ...args.settings,
      updatedAt: Date.now(),
    };

    if (existingSettings) {
      await ctx.db.patch(existingSettings._id, settingsData);
    } else {
      await ctx.db.insert("modelSettings", {
        ...settingsData,
        createdAt: Date.now(),
      });
    }
  },
});

export const getModelSettings = query({
  args: {
    modelProvider: v.string(),
    modelName: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    return await ctx.db
      .query("modelSettings")
      .withIndex("by_user_model", (q) => 
        q.eq("userId", userId)
         .eq("modelProvider", args.modelProvider)
         .eq("modelName", args.modelName)
      )
      .unique();
  },
});
