import { useState, useEffect } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import { useConfig } from '../hooks/useConfig';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { notify } from '../utils/notification';

export const SettingsPage = () => {
  const { config, loading, update } = useConfig();
  const [formData, setFormData] = useState({
    temperatureMin: 18,
    temperatureMax: 30,
    humidityMin: 40,
    humidityMax: 70,
    gasThreshold: 200,
    fanAutoMode: true,
    bulbAutoMode: true,
    buzzerEnabled: true,
  });
  const [feedingTimes, setFeedingTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        temperatureMin: config.temperatureMin,
        temperatureMax: config.temperatureMax,
        humidityMin: config.humidityMin,
        humidityMax: config.humidityMax,
        gasThreshold: config.gasThreshold,
        fanAutoMode: config.fanAutoMode,
        bulbAutoMode: config.bulbAutoMode,
        buzzerEnabled: config.buzzerEnabled,
      });
      setFeedingTimes(config.feedingTimes || []);
    }
  }, [config]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  const handleAddTime = () => {
    if (!newTime) {
      notify.warning('Please enter a time');
      return;
    }
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newTime)) {
      notify.error('Please enter a valid time in HH:mm format');
      return;
    }
    if (feedingTimes.includes(newTime)) {
      notify.warning('This time is already added');
      return;
    }
    setFeedingTimes((prev) => [...prev, newTime].sort());
    setNewTime('');
    notify.success(`Feeding time ${newTime} added`);
  };

  const handleRemoveTime = (time: string) => {
    setFeedingTimes((prev) => prev.filter((t) => t !== time));
    notify.info(`Feeding time ${time} removed`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await update({
        ...formData,
        feedingTimes,
      });
      notify.success('Settings saved successfully');
    } catch {
      // Error is handled by useConfig
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
        <Button onClick={handleSubmit} loading={isSaving}>
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thresholds */}
        <Card>
          <CardHeader>
            <CardTitle>Environmental Thresholds</CardTitle>
            <p className="text-sm text-neutral-500">Auto-control triggers based on these values</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Min Temperature"
                  name="temperatureMin"
                  type="number"
                  value={formData.temperatureMin}
                  onChange={handleInputChange}
                  step="0.5"
                />
                <Input
                  label="Max Temperature"
                  name="temperatureMax"
                  type="number"
                  value={formData.temperatureMax}
                  onChange={handleInputChange}
                  step="0.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Min Humidity"
                  name="humidityMin"
                  type="number"
                  value={formData.humidityMin}
                  onChange={handleInputChange}
                  step="1"
                />
                <Input
                  label="Max Humidity"
                  name="humidityMax"
                  type="number"
                  value={formData.humidityMax}
                  onChange={handleInputChange}
                  step="1"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Gas Threshold"
                  name="gasThreshold"
                  type="number"
                  value={formData.gasThreshold}
                  onChange={handleInputChange}
                  step="10"
                  hint="Gas level above this will trigger buzzer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Automation Toggles */}
        <Card>
          <CardHeader>
            <CardTitle>Automation Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="fanAutoMode"
                  checked={formData.fanAutoMode}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Auto Fan Control</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="bulbAutoMode"
                  checked={formData.bulbAutoMode}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Auto Bulb Control</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="buzzerEnabled"
                  checked={formData.buzzerEnabled}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="text-sm text-neutral-700">Buzzer Enabled</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Feeding Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Feeding Schedule</CardTitle>
            <p className="text-sm text-neutral-500">Feed will be dispensed at these times daily</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="HH:mm (e.g. 06:00)"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTime();
                  }
                }}
              />
              <Button variant="secondary" type="button" onClick={handleAddTime}>
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>

            {feedingTimes.length === 0 ? (
              <p className="text-sm text-neutral-400">No feeding times set</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {feedingTimes.map((time) => (
                  <div
                    key={time}
                    className="flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700"
                  >
                    {time}
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(time)}
                      className="text-primary-400 transition-colors hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hidden submit for enter key */}
        <button type="submit" className="hidden" />
      </form>
    </div>
  );
};
