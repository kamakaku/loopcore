import React from 'react';
import { useTranslation } from 'react-i18next';
import { Code, Copy } from 'lucide-react';

export default function ApiDocs() {
  const { t } = useTranslation();
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const endpoints = [
    {
      method: 'GET',
      path: '/api/v1/loops',
      description: 'List all loops',
      scopes: ['loops:read'],
      example: {
        request: 'curl -X GET "https://api.loopcore.app/v1/loops" \\\n  -H "Authorization: Bearer YOUR_API_KEY"',
        response: `{
  "data": [
    {
      "id": "123",
      "title": "Homepage Design",
      "type": "figma",
      "createdAt": "2024-02-20T12:00:00Z"
    }
  ]
}`
      }
    },
    {
      method: 'POST',
      path: '/api/v1/loops',
      description: 'Create a new loop',
      scopes: ['loops:write'],
      example: {
        request: `curl -X POST "https://api.loopcore.app/v1/loops" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "New Design",
    "type": "url",
    "content": "https://example.com"
  }'`,
        response: `{
  "data": {
    "id": "456",
    "title": "New Design",
    "type": "url",
    "content": "https://example.com",
    "createdAt": "2024-02-20T12:00:00Z"
  }
}`
      }
    }
  ];

  const handleCopy = async (text: string, endpoint: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(endpoint);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {t('settings.integrations.api.documentation')}
        </h3>
        <p className="text-sm text-gray-500">
          {t('settings.integrations.api.docsDescription')}
        </p>
      </div>

      <div className="space-y-6">
        {endpoints.map((endpoint) => (
          <div
            key={`${endpoint.method}-${endpoint.path}`}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    endpoint.method === 'GET'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {endpoint.path}
                  </code>
                </div>
                <div className="flex items-center space-x-2">
                  {endpoint.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{endpoint.description}</p>
            </div>

            <div className="p-4 bg-gray-50">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Example Request</h4>
                    <button
                      onClick={() => handleCopy(endpoint.example.request, `${endpoint.method}-${endpoint.path}-request`)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {copiedEndpoint === `${endpoint.method}-${endpoint.path}-request` ? (
                        <span className="text-xs text-green-600">Copied!</span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{endpoint.example.request}</code>
                  </pre>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700">Example Response</h4>
                    <button
                      onClick={() => handleCopy(endpoint.example.response, `${endpoint.method}-${endpoint.path}-response`)}
                      className="p-1 text-gray-500 hover:text-gray-700"
                    >
                      {copiedEndpoint === `${endpoint.method}-${endpoint.path}-response` ? (
                        <span className="text-xs text-green-600">Copied!</span>
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                    <code>{endpoint.example.response}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}