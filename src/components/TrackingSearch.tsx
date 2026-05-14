"use client"
import { useState } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { searchPackage } from '@/app/actions/searchPackage';

export function TrackingSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const result = await searchPackage(query);
      if (result.error) {
        setError(result.error);
        setLoading(false);
      } else if (result.trackingNumber) {
        router.push(`/track/${result.trackingNumber}`);
      }
    } catch (err) {
      setError('Une erreur est survenue.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto mt-8">
      <form onSubmit={handleSearch} className="relative shadow-xl shadow-primary/10 rounded-2xl bg-white border border-slate-200 p-2 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="N° de suivi, email ou téléphone..."
            className="w-full pl-12 pr-4 py-3 bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400 text-lg"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading || !query.trim()}
          className="btn btn-primary px-8 py-3 rounded-xl shadow-md sm:w-auto w-full flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Suivre <ArrowRight className="ml-2 w-5 h-5" /></>}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mt-3 font-medium text-center">{error}</p>}
    </div>
  );
}
