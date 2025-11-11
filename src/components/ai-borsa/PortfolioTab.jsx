import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  PlusCircle,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#84cc16'];

const PortfolioTab = ({
  portfoyData,
  userPortfoy,
  hisseler,
  userPortfoyMetrics,
  yeniHisseKod,
  setYeniHisseKod,
  yeniHisseMiktar,
  setYeniHisseMiktar,
  yeniHisseMaliyet,
  setYeniHisseMaliyet,
  onAddHolding,
  onDeleteHolding,
}) => (
  <div className="space-y-8">
    <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-purple-300">AI Önerilen Optimize Portföy</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-3xl p-6 shadow-xl border border-blue-600/50 flex items-center space-x-4">
          <TrendingUp className="w-8 h-8 text-blue-300" />
          <div>
            <div className="text-sm text-blue-200">Beklenen Yıllık Getiri</div>
            <div className="text-4xl font-extrabold">%{portfoyData.beklenenGetiri}</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-3xl p-6 shadow-xl border border-purple-600/50 flex items-center space-x-4">
          <Brain className="w-8 h-8 text-purple-300" />
          <div>
            <div className="text-sm text-purple-200">Optimize Sharpe Oranı</div>
            <div className="text-4xl font-extrabold">{portfoyData.sharpeOrani}</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-pink-700 to-pink-900 rounded-3xl p-6 shadow-xl border border-pink-600/50 flex items-center space-x-4">
          <TrendingDown className="w-8 h-8 text-pink-300" />
          <div>
            <div className="text-sm text-pink-200">Max. Düşüş (Sim.)</div>
            <div className="text-4xl font-extrabold">{portfoyData.maxDusus}%</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-700 to-orange-900 rounded-3xl p-6 shadow-xl border border-orange-600/50 flex items-center space-x-4">
          <Activity className="w-8 h-8 text-orange-300" />
          <div>
            <div className="text-sm text-orange-200">Çeşitlilik (Sektör)</div>
            <div className="text-4xl font-extrabold">{portfoyData.sektorSayisi}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-300">Dağılım Grafiği</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={portfoyData.dagitim}
                dataKey="agirlik"
                nameKey="kod"
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={60}
                paddingAngle={5}
                labelLine={false}
                label={({ kod, agirlik }) => `${kod} ${(agirlik * 100).toFixed(1)}%`}
              >
                {portfoyData.dagitim.map((entry, index) => (
                  <Cell key={entry.kod} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${(value * 100).toFixed(2)}%`}
                labelFormatter={(label) => `Hisse: ${label}`}
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
          <h3 className="text-xl font-semibold mb-4 text-blue-300">Önerilen Hisseler</h3>
          <div className="h-[300px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-700/80 backdrop-blur-sm">
                <tr>
                  <th className="p-3 text-left">Kod</th>
                  <th className="p-3 text-left hidden sm:table-cell">Sektör</th>
                  <th className="p-3 text-right">Ağırlık (%)</th>
                </tr>
              </thead>
              <tbody>
                {portfoyData.dagitim.map((hisse) => (
                  <tr key={hisse.kod} className="border-t border-slate-700 hover:bg-slate-700/50 transition">
                    <td className="p-3 font-semibold text-blue-400">{hisse.kod}</td>
                    <td className="p-3 text-slate-400 hidden sm:table-cell">{hisse.sektor}</td>
                    <td className="p-3 text-right font-bold text-green-400">{(hisse.agirlik * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 text-green-300">Kendi Portföyünüzü Takip Edin</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-700 rounded-2xl p-4 shadow-md">
          <div className="text-sm text-slate-300">Toplam Piyasa Değeri</div>
          <div className="text-2xl font-bold text-blue-300">₺{userPortfoyMetrics.toplamDeger}</div>
        </div>
        <div className="bg-slate-700 rounded-2xl p-4 shadow-md">
          <div className="text-sm text-slate-300">Toplam Maliyet</div>
          <div className="text-2xl font-bold text-slate-200">₺{userPortfoyMetrics.toplamMaliyet}</div>
        </div>
        <div className="bg-slate-700 rounded-2xl p-4 shadow-md">
          <div className="text-sm text-slate-300">Kar/Zarar</div>
          <div
            className={`text-2xl font-bold ${
              Number(userPortfoyMetrics.karZarar) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            {userPortfoyMetrics.karZarar}₺
          </div>
        </div>
        <div className="bg-slate-700 rounded-2xl p-4 shadow-md">
          <div className="text-sm text-slate-300">Getiri (%)</div>
          <div
            className={`text-2xl font-bold ${
              Number(userPortfoyMetrics.getiriYuzdesi) >= 0 ? 'text-green-400' : 'text-red-400'
            }`}
          >
            %{userPortfoyMetrics.getiriYuzdesi}
          </div>
        </div>
      </div>

      <form
        onSubmit={onAddHolding}
        className="grid grid-cols-4 gap-4 p-4 mb-8 bg-slate-700/50 rounded-xl"
      >
        <select
          value={yeniHisseKod}
          onChange={(event) => setYeniHisseKod(event.target.value)}
          className="col-span-4 sm:col-span-1 bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white"
        >
          {hisseler.map((hisse) => (
            <option key={hisse.kod} value={hisse.kod}>
              {hisse.kod}
            </option>
          ))}
        </select>

        <input
          type="number"
          step="1"
          min="1"
          placeholder="Miktar (Adet)"
          value={yeniHisseMiktar}
          onChange={(event) => setYeniHisseMiktar(event.target.value)}
          required
          className="col-span-2 sm:col-span-1 bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400"
        />

        <input
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Maliyet (₺)"
          value={yeniHisseMaliyet}
          onChange={(event) => setYeniHisseMaliyet(event.target.value)}
          required
          className="col-span-2 sm:col-span-1 bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-white placeholder-slate-400"
        />

        <button
          type="submit"
          className="col-span-4 sm:col-span-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Hisse Ekle</span>
        </button>
      </form>

      <h3 className="text-xl font-semibold mb-4 text-blue-300">Varlıklarınız</h3>
      <div className="h-[300px] overflow-y-auto border border-slate-700 rounded-xl">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-700/80 backdrop-blur-sm">
            <tr>
              <th className="p-3 text-left">Kod</th>
              <th className="p-3 text-right">Miktar</th>
              <th className="p-3 text-right">Maliyet (₺)</th>
              <th className="p-3 text-right hidden sm:table-cell">Güncel Fiyat (₺)</th>
              <th className="p-3 text-right">K/Z (%)</th>
              <th className="p-3 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {userPortfoy.map((holding) => {
              const stock = hisseler.find((item) => item.kod === holding.kod);
              if (!stock) {
                return null;
              }

              const mevcutDeger = holding.miktar * stock.fiyat;
              const maliyetToplami = holding.miktar * holding.maliyet;
              const karZararYuzdesi = ((mevcutDeger / maliyetToplami) - 1) * 100;

              return (
                <tr key={holding.id} className="border-t border-slate-700 hover:bg-slate-700/50 transition">
                  <td className="p-3 font-semibold text-blue-400">{holding.kod}</td>
                  <td className="p-3 text-right text-slate-300">{holding.miktar}</td>
                  <td className="p-3 text-right text-yellow-400">{holding.maliyet.toFixed(2)}</td>
                  <td className="p-3 text-right hidden sm:table-cell text-green-400">{stock.fiyat.toFixed(2)}</td>
                  <td className={`p-3 text-right font-bold ${karZararYuzdesi >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    %{karZararYuzdesi.toFixed(2)}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => onDeleteHolding(holding.id)}
                      className="text-red-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-5 h-5 mx-auto" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>

    <div className="bg-slate-800/70 rounded-3xl p-6 shadow-2xl border border-slate-700 flex items-start space-x-4">
      <AlertCircle className="w-8 h-8 text-yellow-400 mt-1 flex-shrink-0" />
      <div>
        <h3 className="text-xl font-semibold text-yellow-300">Yatırım Notu</h3>
        <p className="text-slate-400 mt-1">
          Bu portföy, yüksek getiri potansiyelini (Sharpe oranı {portfoyData.sharpeOrani}) sektörel çeşitlilikle birleştirerek
          risk-getiri optimizasyonu sağlamaktadır. Simülasyon verileri kullanılmıştır, gerçek piyasa koşulları farklılık
          gösterebilir.
        </p>
      </div>
    </div>
  </div>
);

export default PortfolioTab;
