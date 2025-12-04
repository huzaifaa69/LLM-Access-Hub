import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<"models" | "apiKeys" | "preferences">("models");
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    google: "",
    deepseek: "",
  });

  const allModels = useQuery(api.models.getAllModels);
  const updateModelConfig = useMutation(api.models.updateModelConfig);
  const saveApiKeys = useMutation(api.settings.saveApiKeys);
  const getUserSettings = useQuery(api.settings.getUserSettings);

  useEffect(() => {
    if (getUserSettings) {
      setApiKeys({
        openai: getUserSettings.openaiApiKey || "",
        anthropic: getUserSettings.anthropicApiKey || "",
        google: getUserSettings.googleApiKey || "",
        deepseek: getUserSettings.deepseekApiKey || "",
      });
    }
  }, [getUserSettings]);

  const handleModelToggle = async (modelId: string, isEnabled: boolean) => {
    try {
      await updateModelConfig({ modelId: modelId as any, isEnabled });
      toast.success(`Model ${isEnabled ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error("Failed to update model");
    }
  };

  const handleSaveApiKeys = async () => {
    try {
      await saveApiKeys(apiKeys);
      toast.success("API keys saved successfully");
    } catch (error) {
      toast.error("Failed to save API keys");
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'anthropic': return '🧠';
      case 'google': return '🔍';
      case 'deepseek': return '🚀';
      default: return '💬';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-64 border-r bg-gray-50 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab("models")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "models" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                }`}
              >
                🤖 Models
              </button>
              <button
                onClick={() => setActiveTab("apiKeys")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "apiKeys" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                }`}
              >
                🔑 API Keys
              </button>
              <button
                onClick={() => setActiveTab("preferences")}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeTab === "preferences" ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                }`}
              >
                ⚙️ Preferences
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[70vh]">
            {activeTab === "models" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Model Configuration</h3>
                <p className="text-gray-600 mb-6">Enable or disable AI models. Models requiring API keys will only work if you've configured them.</p>
                
                <div className="space-y-4">
                  {allModels?.map((model) => (
                    <div key={model._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getProviderIcon(model.provider)}</span>
                        <div>
                          <h4 className="font-medium">{model.displayName}</h4>
                          <p className="text-sm text-gray-600">{model.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">{model.category}</span>
                            {model.apiKeyRequired && (
                              <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                                API Key Required
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={model.isEnabled}
                          onChange={(e) => handleModelToggle(model._id, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "apiKeys" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">API Keys</h3>
                <p className="text-gray-600 mb-6">Configure API keys for different providers. Keys are stored securely and encrypted.</p>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🤖 OpenAI API Key
                    </label>
                    <input
                      type="password"
                      value={apiKeys.openai}
                      onChange={(e) => setApiKeys({ ...apiKeys, openai: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get your API key from platform.openai.com</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🧠 Anthropic API Key
                    </label>
                    <input
                      type="password"
                      value={apiKeys.anthropic}
                      onChange={(e) => setApiKeys({ ...apiKeys, anthropic: e.target.value })}
                      placeholder="sk-ant-..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get your API key from console.anthropic.com</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔍 Google AI API Key
                    </label>
                    <input
                      type="password"
                      value={apiKeys.google}
                      onChange={(e) => setApiKeys({ ...apiKeys, google: e.target.value })}
                      placeholder="AIza..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get your API key from aistudio.google.com</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🚀 DeepSeek API Key
                    </label>
                    <input
                      type="password"
                      value={apiKeys.deepseek}
                      onChange={(e) => setApiKeys({ ...apiKeys, deepseek: e.target.value })}
                      placeholder="sk-..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Get your API key from platform.deepseek.com</p>
                  </div>

                  <button
                    onClick={handleSaveApiKeys}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Save API Keys
                  </button>
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                <p className="text-gray-600 mb-6">Customize your experience with the LLM Access Hub.</p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Default Model Settings</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
                        <input
                          type="range"
                          min="0"
                          max="2"
                          step="0.1"
                          defaultValue="0.7"
                          className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Conservative</span>
                          <span>Creative</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Tokens</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                          <option value="1024">1,024</option>
                          <option value="2048" selected>2,048</option>
                          <option value="4096">4,096</option>
                          <option value="8192">8,192</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Interface</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        Enable streaming responses
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" defaultChecked className="mr-2" />
                        Show model names in messages
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" />
                        Auto-save conversations
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
