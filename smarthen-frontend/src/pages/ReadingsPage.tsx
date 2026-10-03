import { useState, useEffect } from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { useReadings } from '../hooks/useReadings';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Loader } from '../components/ui/Loader';
import { Pagination } from '../components/ui/Pagination';

export const ReadingsPage = () => {
  const limit = 10;
  const [currentPage, setCurrentPage] = useState(0);
  const skip = currentPage * limit;

  const { readings, total, loading, fetchReadings, remove, removeAll } = useReadings(limit);

  useEffect(() => {
    void fetchReadings(skip);
  }, [skip, fetchReadings]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reading?')) {
      await remove(id);
    }
  };

  const handleDeleteAll = async () => {
    if (confirm('Are you sure you want to delete ALL readings? This cannot be undone.')) {
      await removeAll();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil(total / limit) || 1;

  if (loading && readings.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">Readings History</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchReadings(skip)}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          {readings.length > 0 && (
            <Button variant="danger" size="sm" onClick={handleDeleteAll}>
              <Trash2 className="h-4 w-4" />
              Delete All
            </Button>
          )}
        </div>
      </div>

      {readings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-neutral-500">
            No readings available yet. Waiting for device data...
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
                    Temp (°C)
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Humidity (%)
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Gas
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Fan
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Bulb
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Buzzer
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 bg-white">
                {readings.map((reading) => (
                  <tr key={reading._id} className="hover:bg-neutral-50">
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-neutral-900">
                      {new Date(reading.timestamp).toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-neutral-900">
                      {reading.temperature}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-neutral-900">
                      {reading.humidity}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm text-neutral-900">
                      {reading.gasLevel}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          reading.fanState
                            ? 'bg-green-100 text-green-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {reading.fanState ? 'On' : 'Off'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          reading.bulbState
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {reading.bulbState ? 'On' : 'Off'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          reading.buzzerState
                            ? 'bg-red-100 text-red-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {reading.buzzerState ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <button
                        onClick={() => handleDelete(reading._id)}
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
  );
};
