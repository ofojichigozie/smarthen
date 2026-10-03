import { useState, useEffect } from 'react';
import { Fan, Lightbulb, Wheat, RefreshCw, Trash2 } from 'lucide-react';
import { useCommands } from '../hooks/useCommands';
import { useLatestReading } from '../hooks/useLatestReading';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Loader } from '../components/ui/Loader';
import { Pagination } from '../components/ui/Pagination';

export const ControlsPage = () => {
  const limit = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const skip = currentPage * limit;

  const { commands, total, loading, fetchCommands, sendCommand, remove, removeAll } =
    useCommands(limit);
  const { reading, refetch: refetchReading } = useLatestReading();

  const [commandLoading, setCommandLoading] = useState<string | null>(null);

  useEffect(() => {
    void fetchCommands(skip);
  }, [skip, fetchCommands]);

  const handleCommand = async (command: string, _label: string) => {
    setCommandLoading(command);
    try {
      await sendCommand(command);
      await refetchReading();
      await fetchCommands(skip); // refresh current page
    } finally {
      setCommandLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this command?')) {
      await remove(id);
    }
  };

  const handleDeleteAll = async () => {
    if (confirm('Are you sure you want to delete ALL commands? This cannot be undone.')) {
      await removeAll();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  const getCurrentState = (type: 'fan' | 'bulb') => {
    if (!reading) return 'Unknown';
    if (type === 'fan') return reading.fanState ? 'On' : 'Off';
    return reading.bulbState ? 'On' : 'Off';
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      executed: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      cancelled: 'bg-neutral-100 text-neutral-600',
      expired: 'bg-orange-100 text-orange-700',
    };
    const badge = styles[status as keyof typeof styles] || styles.pending;
    return (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getSourceBadge = (source: string) => {
    const styles = {
      manual: 'bg-blue-100 text-blue-700',
      auto: 'bg-purple-100 text-purple-700',
    };
    const badge = styles[source as keyof typeof styles] || styles.manual;
    return (
      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${badge}`}>
        {source.charAt(0).toUpperCase() + source.slice(1)}
      </span>
    );
  };

  const getCommandLabel = (command: string) => {
    const labels: Record<string, string> = {
      fan_on: 'Fan On',
      fan_off: 'Fan Off',
      bulb_on: 'Bulb On',
      bulb_off: 'Bulb Off',
      feed_dispense: 'Feed Dispense',
    };
    return labels[command] || command;
  };

  if (loading && commands.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Manual Controls</h1>
        <Button variant="outline" size="sm" onClick={() => fetchCommands(skip)}>
          <RefreshCw className="h-4 w-4" />
          Refresh Status
        </Button>
      </div>

      {/* Current Device Status - moved to top */}
      {reading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-neutral-500">
              Current Device Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
              <div>
                <p className="text-xs text-neutral-500">Temperature</p>
                <p className="font-medium">{reading.temperature}°C</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Humidity</p>
                <p className="font-medium">{reading.humidity}%</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Gas Level</p>
                <p className="font-medium">{reading.gasLevel}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Fan</p>
                <p className="font-medium">{reading.fanState ? 'On' : 'Off'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Bulb</p>
                <p className="font-medium">{reading.bulbState ? 'On' : 'Off'}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Buzzer</p>
                <p className="font-medium">{reading.buzzerState ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Control Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Fan Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fan className="h-5 w-5 text-primary-600" />
              Fan Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Current Status</span>
              <span
                className={`font-medium ${
                  getCurrentState('fan') === 'On' ? 'text-green-600' : 'text-neutral-600'
                }`}
              >
                {getCurrentState('fan')}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                loading={commandLoading === 'fan_on'}
                onClick={() => handleCommand('fan_on', 'Fan On')}
              >
                Turn On
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                loading={commandLoading === 'fan_off'}
                onClick={() => handleCommand('fan_off', 'Fan Off')}
              >
                Turn Off
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bulb Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Bulb Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-500">Current Status</span>
              <span
                className={`font-medium ${
                  getCurrentState('bulb') === 'On' ? 'text-yellow-600' : 'text-neutral-600'
                }`}
              >
                {getCurrentState('bulb')}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                loading={commandLoading === 'bulb_on'}
                onClick={() => handleCommand('bulb_on', 'Bulb On')}
              >
                Turn On
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                loading={commandLoading === 'bulb_off'}
                onClick={() => handleCommand('bulb_off', 'Bulb Off')}
              >
                Turn Off
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feed Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wheat className="h-5 w-5 text-orange-500" />
              Feed Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-neutral-500">
              Manually dispense feed into the feeder container.
            </p>
            <Button
              variant="primary"
              size="md"
              fullWidth
              loading={commandLoading === 'feed_dispense'}
              onClick={() => handleCommand('feed_dispense', 'Feed Dispense')}
            >
              Dispense Feed
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Command History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-900">Command History</h2>
          {commands.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleDeleteAll}>
              <Trash2 className="h-4 w-4" />
              Delete All
            </Button>
          )}
        </div>

        {commands.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-neutral-500">
              No commands have been issued yet.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Time
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Command
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Source
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Status
                    </th>
                    <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white">
                  {commands.map((command) => (
                    <tr key={command._id} className="hover:bg-neutral-50">
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-neutral-900">
                        {new Date(command.issuedAt).toLocaleString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm text-neutral-900">
                        {getCommandLabel(command.command)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm">
                        {getSourceBadge(command.source)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-sm">
                        {getStatusBadge(command.status)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-3 text-right">
                        <button
                          onClick={() => handleDelete(command._id)}
                          className="text-neutral-400 transition-colors hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={total}
              pageSize={limit}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  );
};
