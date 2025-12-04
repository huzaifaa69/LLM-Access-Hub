import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ConversationList } from "./ConversationList";
import { ChatInterface } from "./ChatInterface";
import { ModelSelector } from "./ModelSelector";
import { SettingsModal } from "./SettingsModal";
import { ExportModal } from "./ExportModal";
import { ModelSettingsModal } from "./ModelSettingsModal";
import { toast } from "sonner";

export function LLMHub() {
  const [selectedConversationId, setSelectedConversationId] = useState<Id<"conversations"> | null>(null);
  const [selectedModel, setSelectedModel] = useState<{
    provider: string;
    name: string;
    displayName: string;
  } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [modelSettingsOpen, setModelSettingsOpen] = useState(false);

  const conversations = useQuery(api.conversations.getUserConversations);
  const availableModels = useQuery(api.models.getAvailableModels);
  const initializeModels = useMutation(api.models.initializeModels);

  // Initialize models on first load
  useEffect(() => {
    if (availableModels !== undefined && availableModels.length === 0) {
      initializeModels();
    }
  }, [availableModels, initializeModels]);

  // Set default model when available
  useEffect(() => {
    if (availableModels && availableModels.length > 0 && !selectedModel) {
      const defaultModel = availableModels[0];
      setSelectedModel({
        provider: defaultModel.provider,
        name: defaultModel.name,
        displayName: defaultModel.displayName,
      });
    }
  }, [availableModels, selectedModel]);

  const handleNewConversation = () => {
    setSelectedConversationId(null);
  };

  const handleConversationSelect = (conversationId: Id<"conversations">) => {
    setSelectedConversationId(conversationId);
  };

  const handleModelChange = (model: { provider: string; name: string; displayName: string }) => {
    setSelectedModel(model);
    // If we're in a conversation and change models, start a new conversation
    if (selectedConversationId) {
      setSelectedConversationId(null);
      toast.info(`Switched to ${model.displayName}. Starting new conversation.`);
    }
  };

  const handleExportConversation = () => {
    if (!selectedConversationId) {
      toast.error("No conversation selected to export");
      return;
    }
    setExportOpen(true);
  };

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden border-r bg-white`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Conversations</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSettingsOpen(true)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={handleNewConversation}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                New Chat
              </button>
            </div>
          </div>
          <ModelSelector
            models={availableModels || []}
            selectedModel={selectedModel}
            onModelChange={handleModelChange}
          />
        </div>
        <ConversationList
          conversations={conversations || []}
          selectedConversationId={selectedConversationId}
          onConversationSelect={handleConversationSelect}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {selectedModel && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">{selectedModel.displayName}</span>
                <button
                  onClick={() => setModelSettingsOpen(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Model Settings"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {selectedConversationId && (
              <button
                onClick={handleExportConversation}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Export Conversation"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            )}
            <div className="text-sm text-gray-500">
              {selectedConversationId ? 'Active Conversation' : 'New Conversation'}
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1">
          {selectedModel ? (
            <ChatInterface
              conversationId={selectedConversationId}
              selectedModel={selectedModel}
              onConversationCreated={setSelectedConversationId}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Loading models...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ExportModal 
        isOpen={exportOpen} 
        onClose={() => setExportOpen(false)} 
        conversationId={selectedConversationId}
      />
      <ModelSettingsModal
        isOpen={modelSettingsOpen}
        onClose={() => setModelSettingsOpen(false)}
        selectedModel={selectedModel}
      />
    </div>
  );
}
