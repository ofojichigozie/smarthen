import { useState, useEffect, useCallback } from 'react';
import { Command } from '../types/models';
import {
  getCommandHistory,
  createCommand,
  deleteCommand,
  deleteAllCommands,
} from '../services/command.service';
import { getSocket } from '../services/socket.service';
import { notify } from '../utils/notification';
import { getMessage } from '../utils/errors';

export const useCommands = (limit = 20) => {
  const [commands, setCommands] = useState<Command[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCommands = useCallback(
    async (skip: number) => {
      try {
        setLoading(true);
        const data = await getCommandHistory(limit, skip);
        setCommands(data.items);
        setTotal(data.pagination.total);
      } catch (error) {
        notify.error(getMessage(error, 'Failed to load command history'));
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    void fetchCommands(0);
  }, [fetchCommands]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('commandUpdated', (payload: Command) => {
      setCommands((prev) => prev.map((cmd) => (cmd._id === payload._id ? payload : cmd)));
    });

    return () => {
      socket.off('commandUpdated');
    };
  }, []);

  const sendCommand = async (command: string) => {
    try {
      const result = await createCommand(command);
      setCommands((prev) => [result, ...prev]);
      setTotal((prev) => prev + 1);
      notify.success('Command sent successfully');
      return result;
    } catch (error) {
      notify.error(getMessage(error, 'Failed to send command'));
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteCommand(id);
      setCommands((prev) => prev.filter((cmd) => cmd._id !== id));
      setTotal((prev) => prev - 1);
      notify.success('Command deleted');
    } catch (error) {
      notify.error(getMessage(error, 'Failed to delete command'));
    }
  };

  const removeAll = async () => {
    try {
      const result = await deleteAllCommands();
      setCommands([]);
      setTotal(0);
      notify.success(`${result.deletedCount} commands deleted successfully`);
    } catch (error) {
      notify.error(getMessage(error, 'Failed to delete all commands'));
    }
  };

  return {
    commands,
    total,
    loading,
    fetchCommands,
    sendCommand,
    remove,
    removeAll,
  };
};
