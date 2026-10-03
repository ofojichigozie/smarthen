import { useState, useEffect, useCallback } from 'react';
import { Reading } from '../types/models';
import { getLatestReading } from '../services/reading.service';
import { getSocket } from '../services/socket.service';
import { notify } from '../utils/notification';
import { getMessage } from '../utils/errors';

export const useLatestReading = () => {
  const [reading, setReading] = useState<Reading | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getLatestReading();
      setReading(data);
    } catch (error) {
      notify.error(getMessage(error, 'Failed to fetch latest reading'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const socket = getSocket();
    socket.on('newReading', (payload: Reading) => {
      setReading(payload);
    });

    return () => {
      socket.off('newReading');
    };
  }, [load]);

  return { reading, loading, refetch: load };
};
