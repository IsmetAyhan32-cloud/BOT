import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const FundamentalAnalysisTab = ({ seciliHisse, setSeciliHisse, hisseler, temelAnaliz }) => {
  if (!temelAnaliz) {
    return null;
  }

  const aktifHisse = hisseler.find((hisse) => hisse.kod === seciliHisse);

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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 shadow-xl border border-blue-600/50">
          <div className="text-sm text-blue-200">Fiyat/Kazanç (F/K)</div>
          <div className="text-4xl font-extrabold">{temelAnaliz.fk}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-6 shadow-xl border border-purple-600/50">
          <div className="text-sm text-purple-200">PD/Defter Değeri</div>
          <div className="text-4xl font-extrabold">{temelAnaliz.pd}</div>
        </div>
        <div className="bg-gradient-to-br from-pink-700 to-pink-900 rounded-3xl p-6 shadow-xl border border-pink-600/50">
          <div className="text-sm text-pink-200">Özsermaye Karlılığı (ROE)</div>
          <div className="text-4xl font-extrabold">%{temelAnaliz.roe}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-700 to-orange-900 rounded-3xl p-6 shadow-xl border border-orange-600/50">
          <div className="text-sm text-orange-200">Net Kar Marjı</div>
          <div className="text-4xl font-extrabold">%{temelAnaliz.karMarji.toFixed(1)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-300">Çeyreksel Satış ve Kar (Milyon ₺)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={temelAnaliz.ceyrekSatis}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="ceyrek" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Legend />
              <Bar dataKey="satis" fill="#3b82f6" name="Satışlar" radius={[10, 10, 0, 0]} />
              <Bar dataKey="kar" fill="#10b981" name="Net Kar" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col space-y-6">
          <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700 flex-grow">
            <h3 className="text-xl font-semibold mb-4 text-blue-300">Analist Tavsiyeleri</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg p-2 rounded-lg bg-green-900/40 border-l-4 border-green-400">
                <span>Al</span>
                <span className="text-green-400 font-bold">{temelAnaliz.analistTavsiye.al}</span>
              </div>
              <div className="flex justify-between items-center text-lg p-2 rounded-lg bg-yellow-900/40 border-l-4 border-yellow-400">
                <span>Tut</span>
                <span className="text-yellow-400 font-bold">{temelAnaliz.analistTavsiye.tut}</span>
              </div>
              <div className="flex justify-between items-center text-lg p-2 rounded-lg bg-red-900/40 border-l-4 border-red-400">
                <span>Sat</span>
                <span className="text-red-400 font-bold">{temelAnaliz.analistTavsiye.sat}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-700 to-purple-800 rounded-3xl p-6 shadow-2xl border border-blue-600/50">
            <h3 className="text-xl font-semibold mb-4 text-blue-300">Ortalama Hedef Fiyat</h3>
            <div className="text-center">
              <div className="text-5xl font-extrabold text-blue-300 mb-2">₺{temelAnaliz.hedefFiyat.toFixed(2)}</div>
              {aktifHisse && (
                <div className="text-green-400 text-lg font-semibold">
                  +{((temelAnaliz.hedefFiyat / aktifHisse.fiyat - 1) * 100).toFixed(1)}% Potansiyel
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundamentalAnalysisTab;
