import readline from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Helper to load .env dynamically so updates in .agents/.env take effect immediately
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../.env');

function reloadEnv() {
  if (fs.existsSync(envPath)) {
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [key, ...vals] = trimmed.split('=');
        if (key && vals.length > 0) {
          const val = vals.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = val;
        }
      }
    } catch (err) {
      process.stderr.write(`Warning: Failed reading .env: ${err.message}\n`);
    }
  }
}
reloadEnv();

const TOOLS = [
  {
    name: 'openai_chat_completion',
    description: 'Send a prompt or instructions to the AI model (e.g. gpt-6-astra, gpt-5-6-sol, gpt-5-5, gpt-4o) and return the AI response.',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'The user prompt or query to send to the model.'
        },
        model: {
          type: 'string',
          description: 'The model identifier to use (default: gpt-6-astra, or gpt-5-6-sol, gpt-5-6-terra, gpt-5-5, etc.).'
        },
        system_prompt: {
          type: 'string',
          description: 'Optional system message to guide the model behavior.'
        },
        temperature: {
          type: 'number',
          description: 'Sampling temperature between 0.0 and 2.0 (default: 0.7).'
        }
      },
      required: ['prompt']
    }
  },
  {
    name: 'openai_list_models',
    description: 'Retrieve the list of models accessible with your API key.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

function sanitizeModelName(model) {
  if (!model) return 'gpt-6-astra';
  const clean = model.trim().toLowerCase().replace(/\s+/g, '-');
  if (clean === 'all-models' || clean === 'all') return 'gpt-6-astra';
  if (clean.includes('astra')) return 'gpt-6-astra';
  return clean;
}

async function callCodexResponsesEndpoint(endpoint, apiKey, selectedModel, prompt, system_prompt) {
  const inputItems = [];
  if (system_prompt) {
    inputItems.push({ role: 'system', content: system_prompt });
  }
  inputItems.push({ role: 'user', content: prompt });

  const payload = {
    model: selectedModel,
    input: inputItems
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  if (!res.ok) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `API Error (${res.status}): ${text}`
        }
      ]
    };
  }

  // Parse SSE Stream or JSON
  let reply = '';
  for (const line of text.split('\n')) {
    if (line.startsWith('data: ')) {
      const dataStr = line.slice(6).trim();
      if (!dataStr || dataStr === '[DONE]') continue;
      try {
        const obj = JSON.parse(dataStr);
        if (obj.delta?.text) reply += obj.delta.text;
        else if (obj.delta?.content) reply += obj.delta.content;
        else if (obj.item?.content) {
          for (const c of obj.item.content) {
            if (c.text) reply += c.text;
          }
        } else if (obj.response?.output_text) {
          reply = obj.response.output_text;
        }
      } catch {
        // non-json sse line
      }
    }
  }

  if (!reply) {
    try {
      const parsed = JSON.parse(text);
      reply = parsed.choices?.[0]?.message?.content || parsed.response || parsed.output || parsed.text || text;
    } catch {
      reply = text;
    }
  }

  return {
    content: [
      {
        type: 'text',
        text: `[Model: ${selectedModel}]\n\n${reply.trim()}`
      }
    ]
  };
}

async function callStandardOpenAIEndpoint(endpoint, apiKey, selectedModel, prompt, system_prompt, temperature) {
  const messages = [];
  if (system_prompt) {
    messages.push({ role: 'system', content: system_prompt });
  }
  messages.push({ role: 'user', content: prompt });

  const payload = {
    model: selectedModel,
    messages,
    temperature
  };

  if (selectedModel.startsWith('o1') || selectedModel.startsWith('o3')) {
    delete payload.temperature;
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `OpenAI API Error (${res.status}): ${data?.error?.message || JSON.stringify(data)}`
        }
      ]
    };
  }

  const reply = data.choices?.[0]?.message?.content || 'No response content returned.';
  return {
    content: [
      {
        type: 'text',
        text: `[Model: ${data.model || selectedModel}]\n\n${reply.trim()}`
      }
    ]
  };
}

async function callOpenAIChat({ prompt, model, system_prompt, temperature = 0.7 }) {
  reloadEnv();
  const apiKey = process.env.OPENAI_API_KEY;
  let baseUrl = process.env.OPENAI_BASE_URL;

  // Auto-detect Kie.ai API key vs OpenAI API key
  if (!baseUrl) {
    if (apiKey && !apiKey.startsWith('sk-')) {
      baseUrl = 'https://api.kie.ai/codex/v1/responses';
    } else {
      baseUrl = 'https://api.openai.com/v1/chat/completions';
    }
  }

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: 'Error: OPENAI_API_KEY is not configured. Please set your OPENAI_API_KEY in d:\\AERT\\.agents\\.env.'
        }
      ]
    };
  }

  const selectedModel = sanitizeModelName(model || process.env.OPENAI_DEFAULT_MODEL);

  try {
    if (baseUrl.includes('/responses')) {
      return await callCodexResponsesEndpoint(baseUrl, apiKey, selectedModel, prompt, system_prompt);
    } else {
      let endpoint = baseUrl.trim();
      if (!endpoint.endsWith('/chat/completions')) {
        endpoint = endpoint.replace(/\/+$/, '') + '/chat/completions';
      }
      return await callStandardOpenAIEndpoint(endpoint, apiKey, selectedModel, prompt, system_prompt, temperature);
    }
  } catch (err) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Failed to connect to AI API (${baseUrl}): ${err.message}`
        }
      ]
    };
  }
}

async function listOpenAIModels() {
  reloadEnv();
  const apiKey = process.env.OPENAI_API_KEY;
  let baseUrl = process.env.OPENAI_BASE_URL || '';

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: 'Error: OPENAI_API_KEY is not configured in d:\\AERT\\.agents\\.env.'
        }
      ]
    };
  }

  const isKie = baseUrl.includes('kie.ai') || !apiKey.startsWith('sk-');
  const modelsUrl = isKie ? 'https://api.kie.ai/codex/v1/models' : 'https://api.openai.com/v1/models';

  try {
    const res = await fetch(modelsUrl, {
      headers: {
        Authorization: `Bearer ${apiKey.trim()}`
      }
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        isError: true,
        content: [{ type: 'text', text: `API Error: ${data?.error?.message || data?.msg || JSON.stringify(data)}` }]
      };
    }

    const modelList = data.data || [];
    const modelsMeta = data.models || [];

    const lines = modelList.map(m => {
      const meta = modelsMeta.find(x => x.slug === m.id);
      const desc = meta?.description ? ` — ${meta.description}` : '';
      return `- **${m.id}**${desc}`;
    });

    return {
      content: [
        {
          type: 'text',
          text: `### Available Models (${modelList.length}):\n\n` + lines.join('\n')
        }
      ]
    };
  } catch (err) {
    return {
      isError: true,
      content: [{ type: 'text', text: `Failed to list models: ${err.message}` }]
    };
  }
}

// Stdio JSON-RPC MCP Server Loop
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

function send(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let request;
  try {
    request = JSON.parse(trimmed);
  } catch {
    return;
  }

  const { id, method, params } = request;

  switch (method) {
    case 'initialize':
      send({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'openai-bridge',
            version: '1.0.0'
          }
        }
      });
      break;

    case 'notifications/initialized':
      break;

    case 'ping':
      send({ jsonrpc: '2.0', id, result: {} });
      break;

    case 'tools/list':
      send({
        jsonrpc: '2.0',
        id,
        result: {
          tools: TOOLS
        }
      });
      break;

    case 'tools/call': {
      const toolName = params?.name;
      const args = params?.arguments || {};

      let result;
      if (toolName === 'openai_chat_completion') {
        result = await callOpenAIChat(args);
      } else if (toolName === 'openai_list_models') {
        result = await listOpenAIModels();
      } else {
        result = {
          isError: true,
          content: [{ type: 'text', text: `Unknown tool: ${toolName}` }]
        };
      }

      send({
        jsonrpc: '2.0',
        id,
        result
      });
      break;
    }

    default:
      if (id !== undefined) {
        send({
          jsonrpc: '2.0',
          id,
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        });
      }
      break;
  }
});
