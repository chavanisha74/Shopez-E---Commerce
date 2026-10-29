import React from 'react';
import { Filter, RotateCcw } from 'lucide-react';

export default function ProductFilters({
  categories = [],
  filters,
  onFilterChange,
  onReset
}) {
  const sizesList = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '7', '8', '9', '10', '11'];
  const gendersList = ['All', 'Men', 'Women', 'Unisex'];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-6 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-slate-800 font-bold">
          <Filter className="w-4 h-4 text-blue-600" />
          <span>Filters</span>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-blue-600 flex items-center space-x-1 font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Categories */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Categories
        </h4>
        <div className="space-y-1 text-sm">
          <button
            onClick={() => onFilterChange('category', 'all')}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filters.category === 'all' || !filters.category
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => onFilterChange('category', cat.slug)}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                filters.category === cat.slug
                  ? 'bg-blue-50 text-blue-600 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="truncate">{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-[10px] text-slate-400">({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Gender
        </h4>
        <div className="grid grid-cols-2 gap-1.5">
          {gendersList.map((g) => (
            <button
              key={g}
              onClick={() => onFilterChange('gender', g === 'All' ? 'all' : g)}
              className={`py-1.5 px-2 text-xs font-medium rounded-lg border text-center transition-all ${
                (filters.gender === g || (g === 'All' && filters.gender === 'all'))
                  ? 'border-blue-600 bg-blue-50 text-blue-600 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Price Range (₹)
        </h4>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="w-1/2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Minimum Discount */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Min. Discount
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {[10, 20, 30, 50].map((d) => (
            <button
              key={d}
              onClick={() => onFilterChange('minDiscount', filters.minDiscount === String(d) ? '' : String(d))}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg border transition-all ${
                filters.minDiscount === String(d)
                  ? 'border-rose-500 bg-rose-50 text-rose-600 font-semibold'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {d}%+ Off
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Size
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {sizesList.map((s) => (
            <button
              key={s}
              onClick={() => onFilterChange('size', filters.size === s ? 'all' : s)}
              className={`w-9 h-9 flex items-center justify-center text-xs font-semibold rounded-lg border transition-all ${
                filters.size === s
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
