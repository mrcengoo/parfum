import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Perfume, ProductionBatchSize } from '../../types';
import { checkRecipeRequirements, getProductionDuration } from '../../services/productionEngine';
import { CountdownTimer } from '../common/CountdownTimer';
import { NoteImage } from '../common/NoteImage';
import {
  Factory,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Layers,
  Sparkles,
  AlertCircle,
  FlaskConical,
  Coins,
  ChevronRight,
  ShieldAlert,
  Award
} from 'lucide-react';

export const ProductionPage: React.FC = () => {
  const {
    perfumes,
    perfumesMap,
    playerCompany,
    playerPerfumer,
    rawMaterialsMap,
    startProductionJob,
    instantCompleteProduction,
    setActiveTab
  } = useGame();

  const [selectedBatchSize, setSelectedBatchSize] = useState<ProductionBatchSize>(100);
  const isCurrentlyProducing = Boolean(playerCompany.activeProduction);

  const batchOptions: ProductionBatchSize[] = [1, 5, 10, 50, 100];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Factory className="w-4 h-4" />
            AromaLux Parfüm İmalathanesi
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
            Parfüm Üretim Laboratuvarı & Tesisleri
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Baş Parfümör <strong>{playerPerfumer.name}</strong> denetiminde; 1, 5, 10, 50 veya 100 adetlik esnek partiler halinde 
            üretim gerçekleştirebilirsiniz. Reçeteler ve süreler seçilen miktara göre otomatik ölçeklenir.
          </p>
        </div>

        {/* Batch Size Selector (1, 5, 10, 50, 100 ADET) */}
        <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
          <div className="text-[10px] text-slate-400 uppercase font-bold px-2 mb-1.5 flex items-center justify-between">
            <span>Üretilecek Miktar:</span>
            <span className="text-amber-400 font-mono">Süre: {getProductionDuration(selectedBatchSize)} sn</span>
          </div>
          <div className="flex items-center gap-1.5">
            {batchOptions.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedBatchSize(size)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                  selectedBatchSize === size
                    ? 'bg-amber-500 text-slate-950 shadow-md font-mono'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800 font-mono'
                }`}
              >
                {size} ADET
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVE PRODUCTION PROGRESS CARD */}
      {playerCompany.activeProduction && (
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/40 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <FlaskConical className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Maserasyon & Şişeleme Sürüyor
                </div>
                <h3 className="text-lg font-bold text-white">
                  {playerCompany.activeProduction.perfumeName}
                </h3>
                <div className="text-xs text-slate-400">
                  Üretilen: <strong className="text-white font-mono">{playerCompany.activeProduction.batchSize} ŞİŞE</strong> | Tahmini Birim Maliyet: {playerCompany.activeProduction.costBreakdown.unitCost} ₺
                </div>

                {/* Formül Notaları Fragrantica Görselleri */}
                {(() => {
                  const producingPerfume = perfumesMap.get(playerCompany.activeProduction.perfumeId);
                  if (!producingPerfume) return null;
                  return (
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase">Formül Notaları:</span>
                      {producingPerfume.recipe.map((r) => {
                        const mat = rawMaterialsMap.get(r.rawMaterialId);
                        return (
                          <div
                            key={r.rawMaterialId}
                            className="flex items-center gap-1 bg-slate-950/80 px-1.5 py-0.5 rounded-lg border border-slate-800 text-[10px]"
                            title={mat?.name || r.rawMaterialId}
                          >
                            <NoteImage
                              id={r.rawMaterialId}
                              src={mat?.image}
                              name={mat?.name}
                              fallbackEmoji="🌿"
                              size="xs"
                            />
                            <span className="text-slate-300 font-medium">{mat?.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>

            <button
              onClick={instantCompleteProduction}
              title="Test amaçlı üretimi hemen bitir"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-all self-start sm:self-auto"
            >
              <Zap className="w-4 h-4" />
              Test: Hemen Tamamla
            </button>
          </div>

          <div className="bg-slate-950/90 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
              <span className="flex items-center gap-1 font-semibold">
                <Clock className="w-4 h-4 text-emerald-400" />
                Kalan Üretim Süresi ({playerCompany.activeProduction.duration} saniye)
              </span>
              <span className="font-mono text-emerald-400 font-bold">Laboratuvar Aktif</span>
            </div>
            <CountdownTimer
              startTime={playerCompany.activeProduction.startTime}
              endTime={playerCompany.activeProduction.endTime}
            />
          </div>
        </div>
      )}

      {/* PERFUMES RECIPE CATALOGUE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {perfumes.map((perfume) => {
          const reqCheck = checkRecipeRequirements(
            perfume,
            playerCompany,
            rawMaterialsMap,
            selectedBatchSize
          );

          const isMissingAny = !reqCheck.canProduce;
          const isRnd = perfume.sourceType === 'AR-GE';

          return (
            <div
              key={perfume.id}
              className={`bg-slate-900/80 border rounded-3xl p-6 shadow-xl flex flex-col justify-between transition-all duration-200 ${
                isCurrentlyProducing
                  ? 'border-slate-800 opacity-80'
                  : reqCheck.canProduce
                  ? 'border-emerald-500/40 hover:border-emerald-500/70 shadow-emerald-950/20'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Top: Image, Name, Brand, Gender, ORİJİNAL vs AR-GE */}
              <div>
                <div className="flex gap-4">
                  <img
                    src={perfume.image}
                    alt={perfume.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-700 shadow-md shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      {/* CİNSİYET (KADIN, ERKEK, UNISEX) */}
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 font-mono">
                        {perfume.gender}
                      </span>

                      {/* ORİJİNAL vs AR-GE vs SECRET ETİKETİ */}
                      <span
                        className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                          perfume.sourceType === 'SECRET'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                            : isRnd
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}
                      >
                        {perfume.sourceType || 'ORİJİNAL'}
                      </span>

                      {perfume.resultLevel && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            perfume.resultLevel === 'Efsanevi'
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-black'
                              : perfume.resultLevel === 'Nadir'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                              : perfume.resultLevel === 'Kaliteli'
                              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                              : perfume.resultLevel === 'Standart'
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : perfume.resultLevel === 'Sıradan'
                              ? 'bg-slate-800 text-slate-300 border-slate-700'
                              : 'bg-rose-950/30 text-rose-300 border-rose-500/40'
                          }`}
                        >
                          {perfume.resultLevel}
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-white truncate">
                      {perfume.name}
                    </h3>

                    {/* AR-GE ise ŞİRKET × PARFÜMATÖR belirgin gösterilir */}
                    <div className="text-xs font-semibold text-amber-400 truncate mt-0.5">
                      {isRnd ? (
                        <span className="text-purple-300 font-bold">
                          {perfume.companyName || 'AromaLux'} × {perfume.perfumerName || playerPerfumer.name}
                        </span>
                      ) : (
                        <span>{perfume.brand}</span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {perfume.description}
                    </p>
                  </div>
                </div>

                {/* Recipe Requirements Checklist for chosen batch */}
                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300 uppercase tracking-wider">
                    <span>Reçete Gereksinimi ({perfume.recipe.length} Nota)</span>
                    <span className="text-[11px] text-amber-400 font-mono lowercase">
                      {selectedBatchSize} adet için gereken
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                    {reqCheck.items.map((item) => {
                      const mat = rawMaterialsMap.get(item.rawMaterialId);
                      return (
                        <div
                          key={item.rawMaterialId}
                          className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                            item.sufficient
                              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                              : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate min-w-0">
                            {item.sufficient ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            )}
                            <NoteImage
                              id={item.rawMaterialId}
                              src={mat?.image}
                              name={item.name}
                              fallbackEmoji="🌿"
                              size="xs"
                            />
                            <span className="font-semibold truncate">{item.name}</span>
                          </div>

                          <div className="font-mono text-[11px] shrink-0 ml-2">
                            <span className={item.sufficient ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {item.available}
                            </span>
                            <span className="text-slate-500"> / {item.required}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Batch Cost & Time Calculation Summary */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{selectedBatchSize} Adet Toplam Maliyet:</span>
                    <span className="font-mono font-bold text-white">
                      {reqCheck.costBreakdown.totalCost.toLocaleString('tr-TR')} ₺
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Birim Şişe Maliyeti:</span>
                    <span className="font-mono font-bold text-amber-300">
                      {reqCheck.costBreakdown.unitCost} ₺ / adet
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Üretim Süresi:</span>
                    <span className="font-mono font-bold text-emerald-400">
                      {reqCheck.duration} Saniye
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Action Button */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                {isCurrentlyProducing ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-800 text-slate-500 font-bold text-xs rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    Başka Bir Üretim Sürüyor
                  </button>
                ) : reqCheck.canProduce ? (
                  <button
                    onClick={() => startProductionJob(perfume.id, selectedBatchSize)}
                    className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Factory className="w-4 h-4" />
                    {selectedBatchSize} ADET Üretimi Başlat ({reqCheck.duration} sn)
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-800/80 text-rose-400 font-bold text-xs rounded-xl border border-rose-900/40 cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    Yetersiz Hammadde Stoğu
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
