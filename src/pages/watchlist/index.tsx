import { Link } from 'react-router-dom';
import { Star, Trash2, Plus } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '@/hooks/useAlerts';
import { useCompanies } from '@/hooks/useStocks';
import { useState, useMemo } from 'react';

export default function WatchlistPage() {
  const { data: favorites, isLoading } = useFavorites();
  const { data: companies } = useCompanies();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const [showAdd, setShowAdd] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState('');

  const favoriteSymbols = useMemo(
    () => new Set(favorites?.map((f) => f.company) ?? []),
    [favorites],
  );

  const availableCompanies = useMemo(
    () => companies?.filter((c) => !favoriteSymbols.has(c.company)) ?? [],
    [companies, favoriteSymbols],
  );

  const handleAdd = () => {
    if (!selectedCompany) return;
    addFavorite.mutate(selectedCompany, {
      onSuccess: () => {
        setSelectedCompany('');
        setShowAdd(false);
      },
    });
  };

  const handleRemove = (id: string) => {
    removeFavorite.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Watchlist</h1>
          <p className="text-sm text-gray-500">Stocks you are monitoring</p>
        </div>
        <Button onClick={() => setShowAdd(!showAdd)} size="sm">
          <Plus className="h-4 w-4" />
          Add Stock
        </Button>
      </div>

      {/* Add Stock Form */}
      {showAdd && (
        <Card>
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1">
              <label className="block text-sm font-medium text-gray-700">Select Stock</label>
              <select
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Choose a stock...</option>
                {availableCompanies.map((c) => (
                  <option key={c._id} value={c.company}>
                    {c.company} - {c.fullName}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={handleAdd} loading={addFavorite.isPending} disabled={!selectedCompany}>
              Add
            </Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Watchlist Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-200" />
          ))}
        </div>
      ) : favorites && favorites.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => {
            const company = companies?.find((c) => c.company === fav.company);
            return (
              <Card key={fav._id} className="group relative">
                <Link to={`/stock/${fav.company}`} className="block">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                        <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{fav.company}</p>
                        <p className="text-xs text-gray-500">
                          {company?.fullName ?? 'Loading...'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <span>{company?.marketSegment ?? '--'}</span>
                    <span>|</span>
                    <span>{company?.country ?? '--'}</span>
                  </div>
                </Link>
                <button
                  onClick={() => handleRemove(fav._id)}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 opacity-0 transition-opacity hover:bg-loss-bg hover:text-loss group-hover:opacity-100"
                  title="Remove from watchlist"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="text-center">
          <div className="py-12">
            <Star className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">No stocks in watchlist</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add stocks to your watchlist to keep an eye on them.
            </p>
            <Button className="mt-4" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" />
              Add Your First Stock
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
