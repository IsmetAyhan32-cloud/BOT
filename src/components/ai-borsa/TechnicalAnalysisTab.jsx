import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const TechnicalAnalysisTab = ({ seciliHisse, setSeciliHisse, hisseler, teknikAnaliz, araciKurumlar }) => {
  if (!teknikAnaliz) {
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

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 shadow-xl border border-blue-600/50">
          <div className="text-sm text-blue-200">RSI (14)</div>
          <div
            className={`text-4xl font-extrabold ${
              teknikAnaliz.rsi > 70 ? 'text-red-400' : teknikAnaliz.rsi < 30 ? 'text-green-400' : 'text-blue-400'
            }`}
          >
            {teknikAnaliz.rsi}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-6 shadow-xl border border-purple-600/50">
          <div className="text-sm text-purple-200">MACD (Fark)</div>
          <div
            className={`text-4xl font-extrabold ${
              teknikAnaliz.macd.macd > teknikAnaliz.macd.signal ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {teknikAnaliz.macd.macd}
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-700 to-green-900 rounded-3xl p-6 shadow-xl border border-green-600/50">
          <div className="text-sm text-green-200">Destek Seviyesi</div>
          <div className="text-4xl font-extrabold">₺{teknikAnaliz.destek.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-3xl p-6 shadow-xl border border-red-600/50">
          <div className="text-sm text-red-200">Direnç Seviyesi</div>
          <div className="text-4xl font-extrabold">₺{teknikAnaliz.direnc.toFixed(2)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-300">Fiyat Grafiği (Son 60 Gün)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={teknikAnaliz.gunlukFiyatlar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="gun" stroke="#9ca3af" label={{ value: 'Gün', position: 'bottom', fill: '#9ca3af' }} />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Line type="monotone" dataKey="fiyat" stroke="#3b82f6" strokeWidth={2} name="Fiyat (₺)" />
              <Line
                type="monotone"
                dataKey={() => teknikAnaliz.bollinger.orta}
                stroke="#f59e0b"
                strokeWidth={1}
                strokeDasharray="5 5"
                name="Ortalama"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-300">Aracı Kurum Dağılımı (Sim.)</h3>
          <div className="h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-700/80 backdrop-blur-sm">
                <tr>
                  <th className="p-3 text-left">Kurum</th>
                  <th className="p-3 text-right">Alış %</th>
                  <th className="p-3 text-right">Satış %</th>
                  <th className="p-3 text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {araciKurumlar.map((kurum) => (
                  <tr key={kurum.kurum} className="border-t border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="p-3">{kurum.kurum}</td>
                    <td className="p-3 text-right text-green-400">{kurum.alis}%</td>
                    <td className="p-3 text-right text-red-400">{kurum.satis}%</td>
                    <td className={`p-3 text-right font-medium ${kurum.net > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {kurum.net > 0 ? '+' : ''}
                      {kurum.net}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TechnicalAnalysisTab;
