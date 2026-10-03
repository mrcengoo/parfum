import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { Perfume } from '../../types';
import { FragranticaAwardBillboards } from '../awarded/FragranticaAwardBillboards';
import {
  Trophy,
  Award,
  Sparkles,
  Compass,
  ArrowRight,
  Zap,
  BookOpen,
  X,
  Layers
} from 'lucide-react';

export const AwardedPerfumesPage: React.FC = () => {
  const { rawMaterialsMap, setActiveTab } = useGame();
  const [inspectedPerfume, setInspectedPerfume] = useState<Perfume | null>(null);

  return (
    <div className="space-y-6 pb-20">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-purple-950/60 border border-amber-500/40 p-6 sm:p-7 rounded-3xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div className="space-y-1.5 z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Fragrantica Community Awards & Sektörel Şaheserler</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-serif text-white tracking-wide flex items-center gap-3">
            <span>Ödüllü Parfümler</span>
            <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
              HALL OF FAME
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Fragrantica ve uluslararası jürilerce ödüllendirilen dünya ikonları, en çok satanlar, en pahalı niş koleksiyonlar ve canlı güncellenen sezon vitrini.
          </p>
        </div>

        {/* Quick link button to Formülü Bul */}
        <div className="z-10 shrink-0">
          <button
            onClick={() => setActiveTab('find_formula')}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-500 hover:to-amber-500 text-white font-bold text-xs shadow-xl transition-all flex items-center gap-2 group"
          >
            <Compass className="w-4 h-4 text-amber-300 group-hover:rotate-45 transition-transform" />
            <span>Formülü Bul (Deşifre Masası) →</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 9 KARE FRAGRANTICA AWARDS & REKLAM PANOSU */}
      <FragranticaAwardBillboards onSelectPerfume={(p) => setInspectedPerfume(p)} />

      {/* INSPECTION MODAL FOR CLICKED BILLBOARD PERFUMES */}
      {inspectedPerfume && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setInspectedPerfume(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Perfume Identity */}
            <div className="flex gap-4 items-start">
              <img
                src={inspectedPerfume.image}
                alt={inspectedPerfume.name}
                className="w-24 h-24 rounded-2xl object-cover border border-slate-800 shadow-md shrink-0"
              />
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-amber-300 border border-slate-800">
                    {inspectedPerfume.gender}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-purple-300 border border-slate-800">
                    {inspectedPerfume.resultLevel || 'Nadir'} Seviye
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 text-emerald-400 border border-slate-800 font-bold">
                    %{inspectedPerfume.quality} Kalite
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
                  {inspectedPerfume.brand}
                </div>
                <h3 className="text-xl font-bold font-serif text-white truncate">
                  {inspectedPerfume.name}
                </h3>
                <div className="text-xs text-amber-400 font-mono font-bold">
                  Tavsiye Edilen Satış: {inspectedPerfume.suggestedRetailPrice} ₺
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              {inspectedPerfume.description}
            </p>

            {/* Pyramid Notes */}
            <div className="space-y-2 text-xs bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80">
              <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Koku Piramidi (Esans Formülü):</span>
              </div>
              <div className="space-y-1 text-[11px]">
                <div>
                  <span className="text-rose-400 font-bold">Üst Notalar: </span>
                  <span className="text-slate-300">
                    {inspectedPerfume.topNotes.map((id) => rawMaterialsMap.get(id)?.name || id).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-amber-400 font-bold">Orta Notalar: </span>
                  <span className="text-slate-300">
                    {inspectedPerfume.middleNotes.map((id) => rawMaterialsMap.get(id)?.name || id).join(', ')}
                  </span>
                </div>
                <div>
                  <span className="text-purple-400 font-bold">Alt Notalar: </span>
                  <span className="text-slate-300">
                    {inspectedPerfume.baseNotes.map((id) => rawMaterialsMap.get(id)?.name || id).join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setInspectedPerfume(null);
                  setActiveTab('production');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>Üretim Bölümünde Üret</span>
              </button>

              <button
                onClick={() => {
                  setInspectedPerfume(null);
                  setActiveTab('catalogue');
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <BookOpen className="w-4 h-4" />
                <span>Katalogda Gör</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
