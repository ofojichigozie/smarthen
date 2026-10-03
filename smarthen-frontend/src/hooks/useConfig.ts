import { useState, useEffect, useCallback } from 'react';
import { Config } from '../types/models';
import { getConfig, updateConfig } from '../services/config.service';
import { UpdateConfigRequest } from '../types/request';
import { notify } from '../utils/notification';
import { getMessage } from '../utils/errors';

export const useConfig = () => {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getConfig();
      setConfig(data);
    } catch (error) {
      notify.error(getMessage(error, 'Failed to load configuration'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const update = async (data: UpdateConfigRequest) => {
    try {
      const updated = await updateConfig(data);
      setConfig(updated);
      notify.success('Configuration updated successfully');
      return updated;
    } catch (error) {
      notify.error(getMessage(error, 'Failed to update configuration'));
      throw error;
    }
  };

  return { config, loading, refetch: load, update };
};
