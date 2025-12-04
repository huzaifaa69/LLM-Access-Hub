import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: Id<"conversations"> | null;
}

export function ExportModal({ isOpen, onClose, conversationId }: ExportModalProps) {
  const [format, setFormat] = useState<"json" | "markdown" | "text">("markdown");
  const [includeMetadata, setIncludeMetadata] = useState(true);

  const conversation = useQuery(
    api.conversations.getConversation,
    conversationId ? { conversationId } : "skip"
  );
  const messages = useQuery(
    api.conversations.getConversationMessages,
    conversationId ? { conversationId } : "skip"
  );

  const exportConversation = () => {
    if (!conversation || !messages) return;

    let content = "";
    const timestamp = new Date().toISOString();

    switch (format) {
      case "json":
        content = JSON.stringify({
          conversation,
          messages,
          exportedAt: timestamp,
        }, null, 2);
        break;

      case "markdown":
        content = `# ${conversation.title}\n\n`;
        if (includeMetadata) {
          content += `**Model:** ${conversation.modelProvider} - ${conversation.modelName}\n`;
          content += `**Created:** ${new Date(conversation.createdAt).toLocaleString()}\n`;
          content += `**Exported:** ${new Date().toLocaleString()}\n\n`;
          content += "---\n\n";
        }
        
        messages.forEach((msg) => {
          const role = msg.role === "user" ? "**You**" : "**Assistant**";
          const time = includeMetadata ? ` _(${new Date(msg.timestamp).toLocaleTimeString()})_` : "";
          content += `${role}${time}:\n${msg.content}\n\n`;
        });
        break;

      case "text":
        content = `${conversation.title}\n${"=".repeat(conversation.title.length)}\n\n`;
        if (includeMetadata) {
          content += `Model: ${conversation.modelProvider} - ${conversation.modelName}\n`;
          content += `Created: ${new Date(conversation.createdAt).toLocaleString()}\n`;
          content += `Exported: ${new Date().toLocaleString()}\n\n`;
        }
        
        messages.forEach((msg) => {
          const role = msg.role === "user" ? "You" : "Assistant";
          const time = includeMetadata ? ` (${new Date(msg.timestamp).toLocaleTimeString()})` : "";
          content += `${role}${time}:\n${msg.content}\n\n`;
        });
        break;
    }

    // Create and download file
    const blob = new Blob([content], { type: getContentType() });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, "_")}.${getFileExtension()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Conversation exported successfully");
    onClose();
  };

  const getContentType = () => {
    switch (format) {
      case "json": return "application/json";
      case "markdown": return "text/markdown";
      case "text": return "text/plain";
    }
  };

  const getFileExtension = () => {
    switch (format) {
      case "json": return "json";
      case "markdown": return "md";
      case "text": return "txt";
    }
  };

  if (!isOpen || !conversationId) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Export Conversation</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="markdown"
                  checked={format === "markdown"}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="mr-2"
                />
                <span className="flex items-center gap-2">
                  📝 Markdown (.md)
                  <span className="text-xs text-gray-500">- Best for sharing</span>
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="json"
                  checked={format === "json"}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="mr-2"
                />
                <span className="flex items-center gap-2">
                  🔧 JSON (.json)
                  <span className="text-xs text-gray-500">- For developers</span>
                </span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="text"
                  checked={format === "text"}
                  onChange={(e) => setFormat(e.target.value as any)}
                  className="mr-2"
                />
                <span className="flex items-center gap-2">
                  📄 Plain Text (.txt)
                  <span className="text-xs text-gray-500">- Simple format</span>
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="mr-2"
              />
              Include metadata (timestamps, model info)
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={exportConversation}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
