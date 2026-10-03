import Command, { CommandType } from '../models/command.model';
import { AppError } from '../middleware/error.middleware';

const EXPIRY_HOURS = 1;

type CommandGroup = 'fan' | 'bulb' | 'feeder';

const GROUP_COMMANDS: Record<CommandGroup, CommandType[]> = {
  fan: ['fan_on', 'fan_off'],
  bulb: ['bulb_on', 'bulb_off'],
  feeder: ['feed_dispense'],
};

const getCommandGroup = (command: CommandType): CommandGroup => {
  if (command.startsWith('fan_')) return 'fan';
  if (command.startsWith('bulb_')) return 'bulb';
  return 'feeder';
};

export const createCommand = async (command: CommandType, source: 'manual' | 'auto' = 'manual') => {
  await Command.updateMany(
    { status: 'pending', command: { $in: GROUP_COMMANDS[getCommandGroup(command)] } },
    { status: 'cancelled' }
  );

  return Command.create({
    command,
    source,
    status: 'pending',
    issuedAt: new Date(),
  });
};

export const getPendingCommands = async () => {
  const expiryCutoff = new Date(Date.now() - EXPIRY_HOURS * 60 * 60 * 1000);

  await Command.updateMany(
    { status: 'pending', issuedAt: { $lt: expiryCutoff } },
    { status: 'expired' }
  );

  const pending = await Command.find({ status: 'pending' }).sort({ issuedAt: 1 }).lean();
  const latestByGroup = new Map<CommandGroup, (typeof pending)[number]>();

  for (const command of pending) {
    const group = getCommandGroup(command.command);
    const existing = latestByGroup.get(group);
    if (!existing || command.issuedAt > existing.issuedAt) {
      latestByGroup.set(group, command);
    }
  }

  const keepIds = new Set([...latestByGroup.values()].map((cmd) => cmd._id.toString()));
  const cancelIds = pending.filter((cmd) => !keepIds.has(cmd._id.toString())).map((cmd) => cmd._id);

  if (cancelIds.length > 0) {
    await Command.updateMany({ _id: { $in: cancelIds } }, { status: 'cancelled' });
  }

  return [...latestByGroup.values()].sort((a, b) => a.issuedAt.getTime() - b.issuedAt.getTime());
};

export const executeCommand = async (commandId: string, status: 'executed' | 'failed') => {
  const command = await Command.findById(commandId);
  if (!command) {
    throw new AppError('Command not found', 404);
  }

  if (command.status !== 'pending') {
    throw new AppError('Command already processed', 400);
  }

  command.status = status;
  command.executedAt = new Date();
  await command.save();

  return command;
};

export const getCommandHistory = async (limit: number = 20, skip: number = 0) => {
  const [items, total] = await Promise.all([
    Command.find().sort({ issuedAt: -1 }).skip(skip).limit(limit).lean(),
    Command.countDocuments(),
  ]);

  const totalPages = Math.ceil(total / limit);
  const page = Math.floor(skip / limit) + 1;

  return {
    items,
    pagination: {
      total,
      page,
      totalPages,
      limit,
      skip,
    },
  };
};

export const deleteCommandById = async (commandId: string) => {
  const command = await Command.findById(commandId);
  if (!command) {
    throw new AppError('Command not found', 404);
  }

  await command.deleteOne();
  return command;
};

export const deleteAllCommands = async () => {
  const result = await Command.deleteMany({});
  return {
    deletedCount: result.deletedCount,
  };
};
