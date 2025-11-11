import React from 'react';
import { Activity, Loader2 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from 'recharts';

const SimulationTab = ({
  formatCurrency,
  formatPercent,
  formatCompactCurrency,
  simulationTarget,
  setSimulationTarget,
  simulationCapital,
  setSimulationCapital,
  simulationDays,
  setSimulationDays,
  simulationRuns,
  setSimulationRuns,
  simulationError,
  simulationResult,
  simulationTimeSeries,
  simulationDistribution,
  isSimulating,
  onRunSimulation,
}) => (
  <div className="space-y-8">
    <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold text-purple-300 mb-4 flex items-center gap-3">
        <Activity className="w-6 h-6" />
        <span>Portföy Getiri Simülasyonu</span>
      </h2>
      <p className="text-slate-300 text-sm leading-relaxed">
        Monte Carlo simülasyonları ile seçtiğiniz portföyün olası değer dağılımını ücretsiz Firebase entegrasyonundan
        beslenen varsayılan verilerle modelleyin. Parametreleri değiştirerek risk ve getiri profilinin nasıl evrildiğini
        inceleyebilirsiniz.
      </p>

      <form onSubmit={onRunSimulation} className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <label className="flex flex-col space-y-2">
          <span className="text-sm text-slate-300 font-medium">Simüle Edilecek Portföy</span>
          <select
            value={simulationTarget}
            onChange={(event) => setSimulationTarget(event.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-blue-500 focus:border-blue-500"
            disabled={isSimulating}
          >
            <option value="optimized">AI Optimize Portföy</option>
            <option value="user">Kendi Portföyüm</option>
          </select>
        </label>

        <label className="flex flex-col space-y-2">
          <span className="text-sm text-slate-300 font-medium">Başlangıç Sermayesi (₺)</span>
          <input
            type="number"
            min="1000"
            step="1000"
            value={simulationCapital}
            onChange={(event) => setSimulationCapital(event.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-blue-500 focus:border-blue-500"
            disabled={isSimulating}
          />
        </label>

        <label className="flex flex-col space-y-2">
          <span className="text-sm text-slate-300 font-medium">Simülasyon Süresi (Gün)</span>
          <input
            type="number"
            min="30"
            max="730"
            step="10"
            value={simulationDays}
            onChange={(event) => setSimulationDays(event.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-blue-500 focus:border-blue-500"
            disabled={isSimulating}
          />
        </label>

        <label className="flex flex-col space-y-2">
          <span className="text-sm text-slate-300 font-medium">Senaryo Sayısı</span>
          <input
            type="number"
            min="100"
            max="5000"
            step="100"
            value={simulationRuns}
            onChange={(event) => setSimulationRuns(event.target.value)}
            className="bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:ring-blue-500 focus:border-blue-500"
            disabled={isSimulating}
          />
        </label>

        <div className="md:col-span-2 lg:col-span-4 flex justify-end">
          <button
            type="submit"
            className={`px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition duration-200 ${
              isSimulating
                ? 'bg-slate-600 text-slate-300 cursor-wait'
                : 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30'
            }`}
            disabled={isSimulating}
          >
            {isSimulating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Simülasyon Çalışıyor…</span>
              </>
            ) : (
              <>
                <Activity className="w-5 h-5" />
                <span>Simülasyonu Başlat</span>
              </>
            )}
          </button>
        </div>
      </form>

      {simulationError && (
        <div className="mt-4 p-4 rounded-xl border border-rose-500/40 bg-rose-900/40 text-rose-200 text-sm">
          {simulationError}
        </div>
      )}
    </div>

    {simulationResult && (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-6 shadow-xl border border-purple-500/40">
            <div className="text-sm text-purple-200">Beklenen Nihai Değer</div>
            <div className="text-3xl font-extrabold text-purple-100">
              {formatCurrency(simulationResult.summary.expectedFinalValue)}
            </div>
            <div className="text-sm text-purple-200 mt-1">
              {formatPercent(simulationResult.summary.expectedReturnPct)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 shadow-xl border border-blue-500/40">
            <div className="text-sm text-blue-200">Medyan Sonuç</div>
            <div className="text-3xl font-extrabold text-blue-100">
              {formatCurrency(simulationResult.summary.medianFinalValue)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 rounded-3xl p-6 shadow-xl border border-emerald-500/40">
            <div className="text-sm text-emerald-200">Olumlu Senaryo (90. Persentil)</div>
            <div className="text-3xl font-extrabold text-emerald-100">
              {formatCurrency(simulationResult.summary.bestCase)}
            </div>
            <div className="text-sm text-emerald-200 mt-1">
              {formatPercent(simulationResult.summary.bestReturnPct)}
            </div>
          </div>
          <div className="bg-gradient-to-br from-rose-700 to-rose-900 rounded-3xl p-6 shadow-xl border border-rose-500/40">
            <div className="text-sm text-rose-200">Olumsuz Senaryo (10. Persentil)</div>
            <div className="text-3xl font-extrabold text-rose-100">
              {formatCurrency(simulationResult.summary.worstCase)}
            </div>
            <div className="text-sm text-rose-200 mt-1">
              {formatPercent(simulationResult.summary.worstReturnPct)}
            </div>
            <div className="text-xs text-rose-200 mt-3">
              Kayıp olasılığı: {(simulationResult.summary.probabilityOfLoss * 100).toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-purple-300">Zaman İçinde Değer Bantları</h3>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={simulationTimeSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" label={{ value: 'Gün', position: 'bottom', fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `₺${formatCompactCurrency(value)}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  formatter={(value, name) => [formatCurrency(value), name]}
                  labelFormatter={(value) => `Gün ${value}`}
                />
                <Legend />
                <Area type="monotone" dataKey="high" name="90. persentil" stroke="#10b981" fill="#10b981" fillOpacity={0.12} strokeWidth={2} />
                <Area type="monotone" dataKey="low" name="10. persentil" stroke="#ef4444" fill="#ef4444" fillOpacity={0.12} strokeWidth={2} />
                <Area type="monotone" dataKey="mean" name="Ortalama" stroke="#f59e0b" fillOpacity={0} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="median" name="Medyan" stroke="#60a5fa" fillOpacity={0} strokeWidth={3} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
            <h3 className="text-xl font-semibold mb-4 text-purple-300">Son Değer Dağılımı</h3>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={simulationDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="midpoint" stroke="#9ca3af" tickFormatter={(value) => `₺${formatCompactCurrency(value)}`} />
                <YAxis stroke="#9ca3af" tickFormatter={(value) => `${value}%`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
                  formatter={(value, name, { payload }) => [`${value.toFixed(1)}%`, `${name} (₺${formatCompactCurrency(payload.midpoint)})`]}
                />
                <Legend />
                <Bar dataKey="probability" name="Olasılık" fill="#a855f7" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </>
    )}
  </div>
);

export default SimulationTab;
