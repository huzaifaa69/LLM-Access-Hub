import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface Conversation {
  _id: Id<"conversations">;
  title: string;
  modelProvider: string;
  modelName: string;
  updatedAt: number;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: Id<"conversations"> | null;
  onConversationSelect: (conversationId: Id<"conversations">) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onConversationSelect,
}: ConversationListProps) {
  const deleteConversation = useMutation(api.conversations.deleteConversation);

  const handleDelete = async (conversationId: Id<"conversations">, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteConversation({ conversationId });
      toast.success("Conversation deleted");
      if (selectedConversationId === conversationId) {
        onConversationSelect(null as any);
      }
    } catch (error) {
      toast.error("Failed to delete conversation");
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai':
        return '🤖';
      case 'anthropic':
        return '🧠';
      case 'google':
        return '🔍';
      case 'deepseek':
        return '🚀';
      default:
        return '💬';
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p className="text-sm">No conversations yet</p>
          <p className="text-xs mt-1">Start a new chat to begin</p>
        </div>
      ) : (
        <div className="p-2">
          {conversations.map((conversation) => (
            <button
              key={conversation._id}
              onClick={() => onConversationSelect(conversation._id)}
              className={`w-full p-3 text-left rounded-lg mb-2 transition-colors group ${
                selectedConversationId === conversation._id
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50 border border-transparent'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm">{getProviderIcon(conversation.modelProvider)}</span>
                    <span className="text-xs text-gray-500 truncate">
                      {conversation.modelName}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 truncate text-sm">
                    {conversation.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(conversation.updatedAt)}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDelete(conversation._id, e)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all ml-2"
                >
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
