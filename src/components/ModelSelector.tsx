import { useState } from "react";

interface Model {
  _id: string;
  provider: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  isEnabled: boolean;
  apiKeyRequired: boolean;
  pricing?: {
    inputTokens: number;
    outputTokens: number;
    currency: string;
  };
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: {
    provider: string;
    name: string;
    displayName: string;
  } | null;
  onModelChange: (model: { provider: string; name: string; displayName: string }) => void;
}

export function ModelSelector({ models, selectedModel, onModelChange }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const enabledModels = models.filter(model => model.isEnabled);

  const handleModelSelect = (model: Model) => {
    onModelChange({
      provider: model.provider,
      name: model.name,
      displayName: model.displayName,
    });
    setIsOpen(false);
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'openai': return '🤖';
      case 'anthropic': return '🧠';
      case 'google': return '🔍';
      case 'deepseek': return '🚀';
      case 'mistral': return '🌟';
      case 'cohere': return '🔮';
      default: return '💬';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'chat': return 'bg-blue-100 text-blue-600';
      case 'code': return 'bg-green-100 text-green-600';
      case 'creative': return 'bg-purple-100 text-purple-600';
      case 'reasoning': return 'bg-orange-100 text-orange-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const formatPrice = (price: number) => {
    return price < 1 ? `$${price.toFixed(3)}` : `$${price.toFixed(2)}`;
  };

  const groupedModels = enabledModels.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, Model[]>);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 text-left bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {selectedModel && (
            <>
              <span className="text-lg">{getProviderIcon(selectedModel.provider)}</span>
              <span className="font-medium text-gray-900">{selectedModel.displayName}</span>
            </>
          )}
          {!selectedModel && (
            <span className="text-gray-500">Select a model</span>
          )}
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
          {Object.keys(groupedModels).length === 0 ? (
            <div className="p-3 text-gray-500 text-sm">No models available</div>
          ) : (
            Object.entries(groupedModels).map(([provider, providerModels]) => (
              <div key={provider}>
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getProviderIcon(provider)}</span>
                    <span className="font-medium text-gray-700 capitalize">{provider}</span>
                  </div>
                </div>
                {providerModels.map((model) => (
                  <button
                    key={model._id}
                    onClick={() => handleModelSelect(model)}
                    className="w-full p-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">{model.displayName}</span>
                      {selectedModel?.name === model.name && (
                        <span className="text-blue-600 text-sm">✓</span>
                      )}
                      {model.apiKeyRequired && (
                        <span className="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded">
                          API Key Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(model.category)}`}>
                          {model.category}
                        </span>
                      </div>
                      {model.pricing && (
                        <div className="text-xs text-gray-500">
                          {formatPrice(model.pricing.inputTokens)}/{formatPrice(model.pricing.outputTokens)} per 1K tokens
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
