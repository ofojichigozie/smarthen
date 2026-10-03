import { useState, useEffect, useCallback } from 'react';
import { Reading } from '../types/models';
import { getReadingsHistory, deleteReading, deleteAllReadings } from '../services/reading.service';
import { getSocket } from '../services/socket.service';
import { notify } from '../utils/notification';
import { getMessage } from '../utils/errors';

export const useReadings = (limit = 20) => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchReadings = useCallback(
    async (skip: number) => {
      try {
        setLoading(true);
        const data = await getReadingsHistory({ limit, skip });
        setReadings(data.items);
        setTotal(data.pagination.total);
      } catch (error) {
        notify.error(getMessage(error, 'Failed to load readings'));
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    void fetchReadings(0);
  }, [fetchReadings]);

  useEffect(() => {
    const socket = getSocket();
    socket.on('newReading', (payload: Reading) => {
      setReadings((prev) => [payload, ...prev].slice(0, limit));
      setTotal((prev) => prev + 1);
    });

    return () => {
      socket.off('newReading');
    };
  }, [limit]);

  const remove = async (id: string) => {
    try {
      await deleteReading(id);
      setReadings((prev) => prev.filter((r) => r._id !== id));
      setTotal((prev) => prev - 1);
      notify.success('Reading deleted');
    } catch (error) {
      notify.error(getMessage(error, 'Failed to delete reading'));
    }
  };

  const removeAll = async () => {
    try {
      const result = await deleteAllReadings();
      setReadings([]);
      setTotal(0);
      notify.success(`${result.deletedCount} readings deleted successfully`);
    } catch (error) {
      notify.error(getMessage(error, 'Failed to delete all readings'));
    }
  };

  return {
    readings,
    total,
    loading,
    fetchReadings,
    remove,
    removeAll,
  };
};
