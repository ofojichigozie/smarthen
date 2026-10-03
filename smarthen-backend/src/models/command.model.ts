import { Schema, model, Document } from 'mongoose';

export const COMMANDS = ['fan_on', 'fan_off', 'bulb_on', 'bulb_off', 'feed_dispense'] as const;

export type CommandType = (typeof COMMANDS)[number];

export interface ICommand extends Document {
  command: CommandType;
  issuedAt: Date;
  executedAt: Date | null;
  status: 'pending' | 'executed' | 'failed' | 'cancelled' | 'expired';
  source: 'auto' | 'manual';
}

const commandSchema = new Schema<ICommand>(
  {
    command: {
      type: String,
      required: true,
      enum: COMMANDS,
    },
    issuedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    executedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'executed', 'failed', 'cancelled', 'expired'],
      default: 'pending',
    },
    source: {
      type: String,
      required: true,
      enum: ['auto', 'manual'],
      default: 'manual',
    },
  },
  { timestamps: true }
);

const Command = model<ICommand>('Command', commandSchema);

export default Command;
