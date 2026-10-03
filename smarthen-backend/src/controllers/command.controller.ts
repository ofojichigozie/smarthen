import { Request, Response, NextFunction } from 'express';
import {
  createCommand,
  getPendingCommands,
  executeCommand,
  getCommandHistory,
  deleteCommandById,
  deleteAllCommands,
} from '../services/command.service';
import { successify } from '../utils/response.util';

export const createCommandHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { command } = req.body;
    const newCommand = await createCommand(command, 'manual');
    successify(res, 'Command created successfully', newCommand, 201);
  } catch (error) {
    next(error);
  }
};

export const getCommandHistoryHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { limit = 20, skip = 0 } = req.query;
    const result = await getCommandHistory(Number(limit), Number(skip));
    successify(res, 'Command history retrieved', result, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteCommandHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const deleted = await deleteCommandById(id);
    successify(res, 'Command deleted successfully', { id: deleted._id }, 200);
  } catch (error) {
    next(error);
  }
};

export const deleteAllCommandsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await deleteAllCommands();
    successify(res, `${result.deletedCount} commands deleted successfully`, result, 200);
  } catch (error) {
    next(error);
  }
};

export const getPendingHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const commands = await getPendingCommands();
    successify(res, 'Pending commands retrieved', commands, 200);
  } catch (error) {
    next(error);
  }
};

export const executeCommandHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { commandId, status } = req.body;
    const command = await executeCommand(commandId, status);
    successify(res, 'Command executed successfully', command, 200);
  } catch (error) {
    next(error);
  }
};
