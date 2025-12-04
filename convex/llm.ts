"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const sendMessage = action({
  args: {
    conversationId: v.id("conversations"),
    message: v.string(),
    modelProvider: v.string(),
    modelName: v.string(),
    useStreaming: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Add user message to conversation
    await ctx.runMutation(api.conversations.addMessage, {
      conversationId: args.conversationId,
      role: "user",
      content: args.message,
    });

    // Get conversation history for context
    const messages = await ctx.runQuery(api.conversations.getConversationMessages, {
      conversationId: args.conversationId,
    });

    // Get user settings for API keys and model settings
    const userSettings = await ctx.runQuery(api.settings.getUserSettings, {});
    const modelSettings = await ctx.runQuery(api.settings.getModelSettings, {
      modelProvider: args.modelProvider,
      modelName: args.modelName,
    });

    try {
      let response: string;
      
      switch (args.modelProvider) {
        case "openai":
          response = await generateOpenAIResponse(messages, args.modelName, userSettings, modelSettings);
          break;
        case "anthropic":
          response = await generateAnthropicResponse(messages, args.modelName, userSettings, modelSettings);
          break;
        case "google":
          response = await generateGoogleResponse(messages, args.modelName, userSettings, modelSettings);
          break;
        case "deepseek":
          response = await generateDeepSeekResponse(messages, args.modelName, userSettings, modelSettings);
          break;
        case "mistral":
          response = await generateMistralResponse(messages, args.modelName, userSettings, modelSettings);
          break;
        case "cohere":
          response = await generateCohereResponse(messages, args.modelName, userSettings, modelSettings);
          break;
        default:
          throw new Error(`Provider ${args.modelProvider} not supported`);
      }

      // Add assistant response to conversation
      await ctx.runMutation(api.conversations.addMessage, {
        conversationId: args.conversationId,
        role: "assistant",
        content: response,
        modelProvider: args.modelProvider,
        modelName: args.modelName,
      });

      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      
      // Add error message to conversation
      await ctx.runMutation(api.conversations.addMessage, {
        conversationId: args.conversationId,
        role: "assistant",
        content: `Error: ${errorMessage}`,
        modelProvider: args.modelProvider,
        modelName: args.modelName,
      });

      throw error;
    }
  },
});

async function generateOpenAIResponse(messages: any[], modelName: string, userSettings: any, modelSettings: any): Promise<string> {
  const OpenAI = (await import("openai")).default;
  
  // Use built-in Convex OpenAI if available, otherwise use user's API key
  const apiKey = process.env.CONVEX_OPENAI_API_KEY || userSettings?.openaiApiKey || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OpenAI API key not configured. Please add your API key in settings.");
  }

  const openai = new OpenAI({
    baseURL: process.env.CONVEX_OPENAI_BASE_URL || undefined,
    apiKey,
  });

  const formattedMessages = messages.map(msg => ({
    role: msg.role as "user" | "assistant" | "system",
    content: msg.content,
  }));

  // Add system prompt if configured
  if (modelSettings?.systemPrompt) {
    formattedMessages.unshift({
      role: "system",
      content: modelSettings.systemPrompt,
    });
  }

  const completion = await openai.chat.completions.create({
    model: modelName,
    messages: formattedMessages,
    max_tokens: modelSettings?.maxTokens || 2048,
    temperature: modelSettings?.temperature || 0.7,
    top_p: modelSettings?.topP || 1.0,
    frequency_penalty: modelSettings?.frequencyPenalty || 0.0,
    presence_penalty: modelSettings?.presencePenalty || 0.0,
  });

  return completion.choices[0]?.message?.content || "No response generated";
}

async function generateAnthropicResponse(messages: any[], modelName: string, userSettings: any, modelSettings: any): Promise<string> {
  const apiKey = userSettings?.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Anthropic API key not configured. Please add ANTHROPIC_API_KEY to your environment variables or configure it in settings.");
  }

  const formattedMessages = messages
    .filter(msg => msg.role !== "system")
    .map(msg => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

  const requestBody: any = {
    model: modelName,
    max_tokens: modelSettings?.maxTokens || 2048,
    messages: formattedMessages,
    temperature: modelSettings?.temperature || 0.7,
    top_p: modelSettings?.topP || 1.0,
  };

  // Add system prompt if configured
  if (modelSettings?.systemPrompt) {
    requestBody.system = modelSettings.systemPrompt;
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  return data.content[0]?.text || "No response generated";
}

async function generateGoogleResponse(messages: any[], modelName: string, userSettings: any, modelSettings: any): Promise<string> {
  const apiKey = userSettings?.googleApiKey || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error("Google API key not configured. Please add GOOGLE_API_KEY to your environment variables or configure it in settings.");
  }

  const formattedMessages = messages.map(msg => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  // Add system prompt if configured
  if (modelSettings?.systemPrompt) {
    formattedMessages.unshift({
      role: "user",
      parts: [{ text: `System: ${modelSettings.systemPrompt}` }],
    });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: formattedMessages,
        generationConfig: {
          maxOutputTokens: modelSettings?.maxTokens || 2048,
          temperature: modelSettings?.temperature || 0.7,
          topP: modelSettings?.topP || 1.0,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google API error: ${error}`);
  }

  const data = await response.json();
  return data.candidates[0]?.content?.parts[0]?.text || "No response generated";
}

async function generateDeepSeekResponse(messages: any[], modelName: string, userSettings: any, modelSettings: any): Promise<string> {
  const apiKey = userSettings?.deepseekApiKey || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error("DeepSeek API key not configured. Please add DEEPSEEK_API_KEY to your environment variables or configure it in settings.");
  }

  const formattedMessages = messages.map(msg => ({
    role: msg.role as "user" | "assistant" | "system",
    content: msg.content,
  }));

  // Add system prompt if configured
  if (modelSettings?.systemPrompt) {
    formattedMessages.unshift({
      role: "system",
      content: modelSettings.systemPrompt,
    });
  }

  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: formattedMessages,
      max_tokens: modelSettings?.maxTokens || 2048,
      temperature: modelSettings?.temperature || 0.7,
      top_p: modelSettings?.topP || 1.0,
      frequency_penalty: modelSettings?.frequencyPenalty || 0.0,
      presence_penalty: modelSettings?.presencePenalty || 0.0,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response generated";
}

async function generateMistralResponse(messages: any[], modelName: string, userSettings: any, modelSettings: any): Promise<string> {
  const apiKey = userSettings?.mistralApiKey || process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error("Mistral API key not configured. Please add MISTRAL_API_KEY to your environment variables or configure it in settings.");
  }

  const formattedMessages = messages.map(msg => ({
    role: msg.role as "user" | "assistant" | "system",
    content: msg.content,
  }));

  // Add system prompt if configured
  if (modelSettings?.systemPrompt) {
    formattedMessages.unshift({
      role: "system",
      content: modelSettings.systemPrompt,
    });
  }

  const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      messages: formattedMessages,
      max_tokens: modelSettings?.maxTokens || 2048,
      temperature: modelSettings?.temperature || 0.7,
      top_p: modelSettings?.topP || 1.0,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Mistral API error: ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response generated";
}

async function generateCohereResponse(messages: any[], modelName: string, userSettings: any, modelSettings: any): Promise<string> {
  const apiKey = userSettings?.cohereApiKey || process.env.COHERE_API_KEY;
  if (!apiKey) {
    throw new Error("Cohere API key not configured. Please add COHERE_API_KEY to your environment variables or configure it in settings.");
  }

  // Convert messages to Cohere format
  const chatHistory = messages.slice(0, -1).map(msg => ({
    role: msg.role === "assistant" ? "CHATBOT" : "USER",
    message: msg.content,
  }));

  const lastMessage = messages[messages.length - 1];
  let prompt = lastMessage.content;

  // Add system prompt if configured
  if (modelSettings?.systemPrompt) {
    prompt = `${modelSettings.systemPrompt}\n\n${prompt}`;
  }

  const response = await fetch("https://api.cohere.ai/v1/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelName,
      message: prompt,
      chat_history: chatHistory,
      max_tokens: modelSettings?.maxTokens || 2048,
      temperature: modelSettings?.temperature || 0.7,
      p: modelSettings?.topP || 1.0,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Cohere API error: ${error}`);
  }

  const data = await response.json();
  return data.text || "No response generated";
}
