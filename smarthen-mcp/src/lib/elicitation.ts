import type { ServerContext } from '@modelcontextprotocol/server';

// ---------------------------------------------------------------------------
// Outcomes
// ---------------------------------------------------------------------------

export type ElicitationOutcome =
  | { outcome: 'accepted' }
  | { outcome: 'declined' }
  | { outcome: 'cancelled' }
  | { outcome: 'unsupported' };

// ---------------------------------------------------------------------------
// elicitConfirmation
//
// Asks the client to confirm an action before it's executed.
//
// The requestedSchema is a restricted JSON Schema (not Zod) — the MCP spec
// limits form elicitation to primitive types (string, number, boolean, enum).
// ---------------------------------------------------------------------------

export const elicitConfirmation = async (
  ctx: ServerContext,
  message: string,
): Promise<ElicitationOutcome> => {
  try {
    const result = await ctx.mcpReq.elicitInput({
      mode: 'form',
      message,
      requestedSchema: {
        type: 'object',
        properties: {
          confirm: {
            type: 'boolean',
            title: 'Confirm',
            description: 'Check this box to approve the action',
          },
        },
        required: ['confirm'],
      },
    });

    if (result.action === 'accept' && result.content?.confirm === true) {
      return { outcome: 'accepted' };
    }

    if (result.action === 'cancel') {
      return { outcome: 'cancelled' };
    }

    return { outcome: 'declined' };
  } catch (error) {
    // SDK throws when the client doesn't advertise elicitation capability.
    // We treat that as "unsupported" so the tool can refuse to execute.
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('elicitation') || message.includes('capability')) {
      return { outcome: 'unsupported' };
    }
    throw error;
  }
};
