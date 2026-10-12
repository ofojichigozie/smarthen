import { createMCPClient, type MCPClient } from '@ai-sdk/mcp';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, isStepCount, convertToModelMessages, type UIMessage } from 'ai';
import { AppError } from '../middleware/error.middleware';
import { SYSTEM_INSTRUCTION } from '../prompts/system.prompt';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const WRITE_TOOLS = new Set(['send_command', 'update_config']);

const createClient = async (): Promise<MCPClient> => {
  if (!process.env.MCP_SERVER_URL) {
    throw new AppError('MCP_SERVER_URL is not configured', 500);
  }

  return createMCPClient({
    transport: {
      type: 'http',
      url: process.env.MCP_SERVER_URL,
      headers: {
        Authorization: `Bearer ${process.env.MCP_CLIENT_API_KEY}`,
      },
    },
  });
};

export const streamChat = async (messages: UIMessage[]) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new AppError('GEMINI_API_KEY is not configured', 500);
  }

  const mcpClient = await createClient();

  try {
    const mcpTools = await mcpClient.tools();

    const tools = Object.fromEntries(
      Object.entries(mcpTools).map(([name, mcpTool]) => [
        name,
        WRITE_TOOLS.has(name) ? { ...mcpTool, needsApproval: true } : mcpTool,
      ])
    );

    const result = streamText({
      model: google('gemini-3.8-flash'),
      instructions: SYSTEM_INSTRUCTION,
      tools,
      stopWhen: isStepCount(5),
      messages: await convertToModelMessages(messages),
      onEnd: async () => {
        await mcpClient.close();
      },
    });

    return result;
  } catch (error) {
    await mcpClient.close();
    throw error;
  }
};
