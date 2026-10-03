import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useLatestReading } from '../hooks/useLatestReading';
import { useReadings } from '../hooks/useReadings';
import { useConfig } from '../hooks/useConfig';
import { Card, CardContent } from '../components/ui/Card';
import { Loader } from '../components/ui/Loader';
import { Button } from '../components/ui/Button';
import {
  Thermometer,
  Droplet,
  Wind,
  Fan,
  Lightbulb,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';

export const DashboardPage = () => {
  const { reading, loading: readingLoading, refetch } = useLatestReading();
  const { readings, loading: historyLoading } = useReadings(50);
  const { config, loading: configLoading } = useConfig();

  const isLoading = readingLoading || configLoading || historyLoading;

  // Prepare chart data (last 50 readings, sorted ascending)
  const chartData = useMemo(() => {
    return [...readings]
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .map((r) => ({
        time: new Date(r.timestamp).toLocaleTimeString(),
        temperature: r.temperature,
        humidity: r.humidity,
        gasLevel: r.gasLevel,
      }));
  }, [readings]);

  if (isLoading && !reading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  const deviceStatus = config?.deviceOnline ? 'Online' : 'Offline';
  const lastSeen = config?.deviceLastSeen
    ? new Date(config.deviceLastSeen).toLocaleString()
    : 'Never';

  return (
    <div className="space-y-6">
      {/* Header with status badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              config?.deviceOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {config?.deviceOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
            {deviceStatus}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400">Last seen: {lastSeen}</span>
          <Button variant="outline" size="sm" onClick={refetch}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Latest Reading Section */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-sm font-medium text-neutral-500">Latest Reading</h2>
          {reading && (
            <span className="text-xs text-neutral-400">
              · {new Date(reading.timestamp).toLocaleString()}
            </span>
          )}
        </div>

        {reading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                  <Thermometer className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Temperature</p>
                  <p className="text-xl font-bold">{reading.temperature}°C</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3">
                <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                  <Droplet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Humidity</p>
                  <p className="text-xl font-bold">{reading.humidity}%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3">
                <div className="rounded-full bg-purple-100 p-2 text-purple-600">
                  <Wind className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Gas Level</p>
                  <p className="text-xl font-bold">{reading.gasLevel}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3">
                <div
                  className={`rounded-full p-2 ${
                    reading.fanState
                      ? 'bg-green-100 text-green-600'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  <Fan className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Fan</p>
                  <p className="text-xl font-bold">{reading.fanState ? 'On' : 'Off'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3">
                <div
                  className={`rounded-full p-2 ${
                    reading.bulbState
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Bulb</p>
                  <p className="text-xl font-bold">{reading.bulbState ? 'On' : 'Off'}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center gap-3">
                <div
                  className={`rounded-full p-2 ${
                    reading.buzzerState
                      ? 'bg-red-100 text-red-600'
                      : 'bg-neutral-100 text-neutral-400'
                  }`}
                >
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-neutral-500">Buzzer</p>
                  <p className="text-xl font-bold">{reading.buzzerState ? 'Active' : 'Inactive'}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-neutral-500">
              No sensor data available yet. Waiting for device...
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chart Section */}
      {chartData.length > 0 ? (
        <Card>
          <CardContent className="pt-4">
            <h3 className="mb-4 text-sm font-medium text-neutral-500">
              Sensor Trends (last {chartData.length} readings)
            </h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="temperature"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    name="Temp (°C)"
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="humidity"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    name="Humidity (%)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="gasLevel"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                    name="Gas Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-neutral-400">
            Not enough data to display chart.
          </CardContent>
        </Card>
      )}
    </div>
  );
};
