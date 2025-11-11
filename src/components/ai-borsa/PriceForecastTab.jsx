import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';

const ForecastTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900/90 p-4 rounded-lg shadow-xl border border-slate-700 text-sm">
        <p className="font-bold text-blue-400">Gün {data.gun}</p>
        <p>
          Tahmin: <span className="text-blue-300 font-medium">₺{data.tahmin}</span>
        </p>
        <p>
          Min Aralığı: <span className="text-red-400 font-medium">₺{data.min}</span>
        </p>
        <p>
          Max Aralığı: <span className="text-green-400 font-medium">₺{data.max}</span>
        </p>
      </div>
    );
  }
  return null;
};

const PriceForecastTab = ({ seciliHisse, setSeciliHisse, hisseler, fiyatTahmini }) => {
  if (!fiyatTahmini) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
        <label className="block text-xl font-semibold mb-4 text-blue-300">Hisse Seçin</label>
        <select
          value={seciliHisse}
          onChange={(event) => setSeciliHisse(event.target.value)}
          className="w-full md:w-96 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-blue-500 focus:border-blue-500 transition"
        >
          {hisseler.map((hisse) => (
            <option key={hisse.kod} value={hisse.kod}>
              {hisse.kod} - {hisse.sektor}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 shadow-xl border border-blue-600/50">
          <div className="text-sm text-blue-200">Güncel Fiyat</div>
          <div className="text-4xl font-extrabold">₺{fiyatTahmini.guncel}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-6 shadow-xl border border-purple-600/50">
          <div className="text-sm text-purple-200">Tahmin Hata Payı (MAE)</div>
          <div className="text-4xl font-extrabold">{fiyatTahmini.mae}</div>
        </div>
        <div className="bg-gradient-to-br from-pink-700 to-pink-900 rounded-3xl p-6 shadow-xl border border-pink-600/50">
          <div className="text-sm text-pink-200">Model Doğruluğu (R² Skoru)</div>
          <div className="text-4xl font-extrabold">{fiyatTahmini.rSquare}</div>
        </div>
      </div>

      <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
        <h3 className="text-xl font-semibold mb-4 text-blue-300">7 Günlük AI Fiyat Tahmini ve Güven Aralığı</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={fiyatTahmini.tahminler} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="gun" stroke="#9ca3af" label={{ value: 'Günler', position: 'bottom', fill: '#9ca3af' }} />
            <YAxis stroke="#9ca3af" domain={['auto', 'auto']} />
            <Tooltip content={<ForecastTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="min" stroke="#ef4444" fill="url(#colorMin)" strokeWidth={0} />
            <Area type="monotone" dataKey="max" stroke="#10b981" fill="url(#colorMax)" strokeWidth={0} />
            <Line type="monotone" dataKey="tahmin" stroke="#3b82f6" strokeWidth={4} name="AI Tahmini" dot={{ r: 6 }} />
            <defs>
              <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PriceForecastTab;
