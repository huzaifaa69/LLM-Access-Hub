import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface ModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: {
    provider: string;
    name: string;
    displayName: string;
  } | null;
}

export function ModelSettingsModal({ isOpen, onClose, selectedModel }: ModelSettingsModalProps) {
  const [settings, setSettings] = useState({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 1.0,
    frequencyPenalty: 0.0,
    presencePenalty: 0.0,
    systemPrompt: "",
  });

  const saveModelSettings = useMutation(api.settings.saveModelSettings);
  const getUserSettings = useQuery(api.settings.getUserSettings);

  const handleSave = async () => {
    if (!selectedModel) return;
    
    try {
      await saveModelSettings({
        modelProvider: selectedModel.provider,
        modelName: selectedModel.name,
        settings,
      });
      toast.success("Model settings saved");
      onClose();
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  if (!isOpen || !selectedModel) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Model Settings - {selectedModel.displayName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Temperature: {settings.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Focused (0.0)</span>
              <span>Balanced (1.0)</span>
              <span>Creative (2.0)</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Controls randomness. Lower values make responses more focused and deterministic.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Tokens
            </label>
            <select
              value={settings.maxTokens}
              onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value={512}>512 tokens</option>
              <option value={1024}>1,024 tokens</option>
              <option value={2048}>2,048 tokens</option>
              <option value={4096}>4,096 tokens</option>
              <option value={8192}>8,192 tokens</option>
            </select>
            <p className="text-xs text-gray-600 mt-1">
              Maximum number of tokens to generate in the response.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Top P: {settings.topP}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.topP}
              onChange={(e) => setSettings({ ...settings, topP: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-600 mt-1">
              Controls diversity via nucleus sampling. 1.0 means no restrictions.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Frequency Penalty: {settings.frequencyPenalty}
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={settings.frequencyPenalty}
                onChange={(e) => setSettings({ ...settings, frequencyPenalty: parseFloat(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-600 mt-1">
                Reduces repetition of frequent tokens.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Presence Penalty: {settings.presencePenalty}
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={settings.presencePenalty}
                onChange={(e) => setSettings({ ...settings, presencePenalty: parseFloat(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-600 mt-1">
                Encourages talking about new topics.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              System Prompt (Optional)
            </label>
            <textarea
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              placeholder="Enter a system prompt to customize the model's behavior..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none"
            />
            <p className="text-xs text-gray-600 mt-1">
              Custom instructions that will be prepended to every conversation.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
