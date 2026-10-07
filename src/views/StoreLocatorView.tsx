import React, { useState } from 'react';
import { MapPin, Phone, Clock, Scissors, Award, Navigation, Check, Search } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { STORE_LOCATIONS } from '../data/mockData';

export const StoreLocatorView: React.FC = () => {
  const { stores: contextStores } = useShop();
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [storeSearch, setStoreSearch] = useState('');

  const allStores = contextStores && contextStores.length > 0 ? contextStores : STORE_LOCATIONS;

  const filteredStores = allStores.filter((store) => {
    if (selectedCity !== 'all' && store.city.toLowerCase() !== selectedCity.toLowerCase()) {
      return false;
    }
    if (storeSearch.trim()) {
      const q = storeSearch.toLowerCase();
      const matchName = store.name.toLowerCase().includes(q);
      const matchAddr = store.address.toLowerCase().includes(q);
      const matchCity = store.city.toLowerCase().includes(q);
      const matchArea = (store.area || '').toLowerCase().includes(q);
      if (!matchName && !matchAddr && !matchCity && !matchArea) return false;
    }
    return true;
  });

  const cityCounts = {
    all: allStores.length,
    dhaka: allStores.filter((s) => s.city.toLowerCase() === 'dhaka').length,
    chittagong: allStores.filter((s) => s.city.toLowerCase() === 'chittagong').length,
    sylhet: allStores.filter((s) => s.city.toLowerCase() === 'sylhet').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#9A7B38] font-bold">
          Atelier Flagships & Boutiques
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 mt-1">
          FIND YOUR NEAREST ATELIER
        </h1>
        <p className="text-xs sm:text-sm text-neutral-600 mt-3 leading-relaxed">
          Step into any of our flagship destinations across Bangladesh for private sartorial
          consultations, bespoke fabric selections, and on-site master tailoring.
        </p>

        {/* Search & City Filter Pills */}
        <div className="mt-6 max-w-md mx-auto">
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
            <input
              type="text"
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
              placeholder="Search by neighborhood, street, or boutique name..."
              className="w-full bg-white border border-neutral-300 pl-9 pr-4 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="flex justify-center flex-wrap gap-2">
            {[
              { id: 'all', label: `All Boutiques (${cityCounts.all})` },
              { id: 'dhaka', label: `Dhaka (${cityCounts.dhaka})` },
              { id: 'chittagong', label: `Chittagong (${cityCounts.chittagong})` },
              { id: 'sylhet', label: `Sylhet (${cityCounts.sylhet})` }
            ].map((city) => (
              <button
                key={city.id}
                onClick={() => setSelectedCity(city.id)}
                className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  selectedCity === city.id
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {city.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Boutique Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStores.map((store) => (
          <div
            key={store.id}
            className="border border-neutral-200 bg-white p-6 flex flex-col justify-between hover:border-neutral-400 transition-colors shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-[#9A7B38] font-bold">
                  {store.city} Flagship
                </span>
                <span className="text-[11px] text-green-700 font-bold bg-green-50 px-2 py-0.5">
                  Open Today
                </span>
              </div>

              <h3 className="font-serif text-xl font-bold text-neutral-900 mt-2">
                {store.name}
              </h3>

              <div className="mt-4 space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                  <a href={`tel:${store.phone}`} className="hover:text-black font-mono">
                    {store.phone}
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
                  <span>{store.hours} (7 Days Open)</span>
                </div>
              </div>

              {/* In-store services */}
              <div className="mt-6 pt-4 border-t border-neutral-100">
                <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-bold block mb-2">
                  Atelier Services
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {store.services?.map((srv: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 font-medium"
                    >
                      {srv}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-100 flex items-center justify-between">
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(
                  `Zippy ${store.name} ${store.address}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-bold uppercase tracking-wider text-neutral-900 hover:text-[#9A7B38] flex items-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </a>

              <span className="text-[11px] text-neutral-400">Walk-ins Welcome</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
