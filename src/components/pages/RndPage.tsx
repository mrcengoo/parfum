import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { RndResult, GenderType } from '../../types';
import { PerfumerCard } from '../common/PerfumerCard';
import { CountryFlag } from '../common/CountryFlag';
import {
  Dna,
  Sparkles,
  FlaskConical,
  Award,
  Zap,
  PlusCircle,
  CheckCircle2,
  Layers,
  ChevronRight,
  TrendingUp,
  Tag,
  Coins,
  ShieldCheck,
  Users,
  Search,
  RotateCcw
} from 'lucide-react';

export const RndPage: React.FC = () => {
  const {
    rawMaterials,
    rndArchive,
    conductRnd,
    registerRndPerfume,
    playerCompany,
    playerPerfumer,
    perfumers,
    assignPerfumerToPlayerCompany,
    rawMaterialsMap
  } = useGame();

  const [selectedGender, setSelectedGender] = useState<GenderType>('UNISEX');
  const [selectedTopNotes, setSelectedTopNotes] = useState<string[]>(['bergamot', 'aldehitler']);
  const [selectedMidNotes, setSelectedMidNotes] = useState<string[]>(['yasemin', 'gul']);
  const [selectedBaseNotes, setSelectedBaseNotes] = useState<string[]>(['vanilya', 'sandal_agaci', 'misk']);
  const [currentResult, setCurrentResult] = useState<RndResult | null>(null);
  const [activeTabSub, setActiveTabSub] = useState<'lab' | 'perfumers'>('lab');

  // Serbest seçim: 3 sınırı kaldırıldı, kullanıcı dilediği kadar nota ekleyebilir
  const toggleTopNote = (id: string) => {
    if (selectedTopNotes.includes(id)) {
      if (selectedTopNotes.length > 1) setSelectedTopNotes(selectedTopNotes.filter((x) => x !== id));
    } else {
      setSelectedTopNotes([...selectedTopNotes, id]);
    }
  };

  const toggleMidNote = (id: string) => {
    if (selectedMidNotes.includes(id)) {
      if (selectedMidNotes.length > 1) setSelectedMidNotes(selectedMidNotes.filter((x) => x !== id));
    } else {
      setSelectedMidNotes([...selectedMidNotes, id]);
    }
  };

  const toggleBaseNote = (id: string) => {
    if (selectedBaseNotes.includes(id)) {
      if (selectedBaseNotes.length > 1) setSelectedBaseNotes(selectedBaseNotes.filter((x) => x !== id));
    } else {
      setSelectedBaseNotes([...selectedBaseNotes, id]);
    }
  };

  const handleSynthesize = () => {
    try {
      const result = conductRnd(selectedTopNotes, selectedMidNotes, selectedBaseNotes, selectedGender);
      setCurrentResult(result);
    } catch (e) {
      console.error(e);
    }
  };

  const getResultBadgeStyle = (level: string) => {
    switch (level) {
      case 'İMZA':
        return 'bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 font-black border-amber-300 shadow-lg shadow-amber-500/30 animate-pulse';
      case 'ÇOK İYİ':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40 font-bold';
      case 'İYİ':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40 font-bold';
      case 'ORTA':
        return 'bg-slate-700 text-slate-300 border-slate-600 font-semibold';
      case 'KÖTÜ':
      default:
        return 'bg-rose-950/40 text-rose-300 border-rose-500/40 font-bold';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">
            <Dna className="w-4 h-4" />
            ParfümATÖR AR-GE Laboratuvarı & Koku Tasarımı
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white">
            Yeni Formül & Parfüm İcat Merkezi
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            AromaLux Baş Parfümörü <strong>{playerPerfumer.name}</strong> ile notaları harmanlayın. 
            Sonuçlar; Nota Uyumu, Trend Uyumu, Özgünlük ve AR-GE Seviyesine göre değerlendirilir (<strong>KÖTÜ, ORTA, İYİ, ÇOK İYİ, İMZA</strong>).
          </p>
        </div>

        {/* Tab switch between Lab & 4 Perfumer Dossiers */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTabSub('lab')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTabSub === 'lab' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Dna className="w-3.5 h-3.5" />
            Koku Sentez Laboratuvarı
          </button>
          <button
            onClick={() => setActiveTabSub('perfumers')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTabSub === 'perfumers' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            4 ParfümATÖR Kadrosu
          </button>
        </div>
      </div>

      {activeTabSub === 'perfumers' ? (
        /* 4 PARFÜMATÖR CARDS SECTION (DATA-DRIVEN, IDENTICAL UI) */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Sektördeki 4 Resmi ParfümATÖR Profili
            </h3>
            <span className="text-xs text-slate-400">
              Mevcut Şirket Parfümörünüz: <strong className="text-purple-300">{playerPerfumer.name}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {perfumers.map((perf) => (
              <PerfumerCard
                key={perf.id}
                perfumer={perf}
                isAssignedToPlayer={playerCompany.perfumerId === perf.id}
                showAssignAction={true}
                onAssign={() => assignPerfumerToPlayerCompany(perf.id)}
              />
            ))}
          </div>
        </div>
      ) : (
        /* LAB & SYNTHESIZER */
        <>
          {/* Active Perfumer Notification Pill */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl p-1.5 rounded-xl bg-slate-950 border border-slate-800">
                {playerPerfumer.avatar || '👨‍🔬'}
              </span>
              <div>
                <div className="text-xs text-slate-400">Laboratuvarı Yöneten ParfümATÖR:</div>
                <div className="text-sm font-bold text-white">
                  {playerPerfumer.name} • <span className="text-purple-300 font-semibold">{playerPerfumer.role}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="text-slate-300">
                Tasarım Ücreti: <strong className="text-amber-300">{playerPerfumer.designFee.toLocaleString('tr-TR')} ₺</strong>
              </span>
              <span>•</span>
              <span className="text-slate-300">
                Satış Telifi: <strong className="text-purple-300">%{(playerPerfumer.royaltyRate * 100).toFixed(1)}</strong>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Note Selectors & Controls */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
              
              {/* Gender selection */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Hedef Parfüm Cinsiyeti:
                </span>
                <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(['KADIN', 'ERKEK', 'UNISEX'] as GenderType[]).map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGender(g)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${
                        selectedGender === g
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Notes Pill */}
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Koku Piramidi Nota Kompozisyonu (Sınırsız Seçim):
                </span>
                <span className="font-mono font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30">
                  Toplam {selectedTopNotes.length + selectedMidNotes.length + selectedBaseNotes.length} Nota Seçildi
                </span>
              </div>

              {/* 1. Top Notes */}
              <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> 1. Üst Notalar (Açılış · Serbest Seçim)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-amber-400 font-mono text-[11px] font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Seçilen: {selectedTopNotes.length} Nota
                    </span>
                    {selectedTopNotes.length > 1 && (
                      <button
                        onClick={() => setSelectedTopNotes(['bergamot'])}
                        className="text-[10px] text-slate-400 hover:text-rose-400 underline font-mono"
                      >
                        Sıfırla
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {rawMaterials.map((mat) => {
                    const isSelected = selectedTopNotes.includes(mat.id);
                    return (
                      <button
                        key={mat.id}
                        onClick={() => toggleTopNote(mat.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md font-bold'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <CountryFlag
                          countryCode={mat.countryCode}
                          country={mat.country}
                          fallbackEmoji={mat.flag}
                          size="xs"
                        />
                        <span>{mat.name}</span>
                        {isSelected && <span className="text-[10px] font-bold ml-0.5">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Middle Notes */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> 2. Orta / Kalp Notalar (Gövde · Serbest Seçim)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-rose-400 font-mono text-[11px] font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      Seçilen: {selectedMidNotes.length} Nota
                    </span>
                    {selectedMidNotes.length > 1 && (
                      <button
                        onClick={() => setSelectedMidNotes(['yasemin'])}
                        className="text-[10px] text-slate-400 hover:text-rose-400 underline font-mono"
                      >
                        Sıfırla
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {rawMaterials.map((mat) => {
                    const isSelected = selectedMidNotes.includes(mat.id);
                    return (
                      <button
                        key={mat.id}
                        onClick={() => toggleMidNote(mat.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          isSelected
                            ? 'bg-rose-500 text-white border-rose-400 shadow-md font-bold'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <CountryFlag
                          countryCode={mat.countryCode}
                          country={mat.country}
                          fallbackEmoji={mat.flag}
                          size="xs"
                        />
                        <span>{mat.name}</span>
                        {isSelected && <span className="text-[10px] font-bold ml-0.5">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Base Notes */}
              <div className="space-y-2.5 pt-4 border-t border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> 3. Alt / Dip Notalar (Kalıcılık · Serbest Seçim)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-indigo-400 font-mono text-[11px] font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      Seçilen: {selectedBaseNotes.length} Nota
                    </span>
                    {selectedBaseNotes.length > 1 && (
                      <button
                        onClick={() => setSelectedBaseNotes(['vanilya'])}
                        className="text-[10px] text-slate-400 hover:text-rose-400 underline font-mono"
                      >
                        Sıfırla
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {rawMaterials.map((mat) => {
                    const isSelected = selectedBaseNotes.includes(mat.id);
                    return (
                      <button
                        key={mat.id}
                        onClick={() => toggleBaseNote(mat.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-400 shadow-md font-bold'
                            : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <CountryFlag
                          countryCode={mat.countryCode}
                          country={mat.country}
                          fallbackEmoji={mat.flag}
                          size="xs"
                        />
                        <span>{mat.name}</span>
                        {isSelected && <span className="text-[10px] font-bold ml-0.5">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Synthesize Button with Design Fee Info */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleSynthesize}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-purple-600/20 transition-all flex items-center justify-center gap-2"
                >
                  <Dna className="w-5 h-5" />
                  {selectedTopNotes.length + selectedMidNotes.length + selectedBaseNotes.length} Nota ile ParfümATÖR'ü Çalıştır & Yeni Parfüm İcat Et ({playerPerfumer.designFee.toLocaleString('tr-TR')} ₺)
                </button>
              </div>

            </div>

            {/* Right Col: Synthesis Result Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  AR-GE İcat Sonucu
                </div>

                {currentResult ? (
                  <div className="space-y-4">
                    {/* Header with Title and Prominent ŞİRKET × PARFÜMATÖR info */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-purple-500/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${getResultBadgeStyle(currentResult.resultLevel)}`}>
                          {currentResult.resultLevel}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-amber-300 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {currentResult.gender}
                        </span>
                      </div>

                      <h3 className="text-xl font-serif font-bold text-white">
                        {currentResult.name}
                      </h3>

                      {/* Required Visible Brand Info: Şirket × Parfümör */}
                      <div className="text-xs font-semibold text-purple-300 bg-purple-950/30 p-2 rounded-xl border border-purple-500/20 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                        <span>{currentResult.companyName} × {currentResult.perfumerName}</span>
                      </div>

                      <p className="text-[11px] text-slate-400 pt-1">
                        {currentResult.notesSummary}
                      </p>
                    </div>

                    {/* Multi-Factor Evaluation Ratings */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">AR-GE Sonucu:</span>
                        <span className="font-bold text-white">{currentResult.resultLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Koku & Nota Uyumu:</span>
                        <span className="font-mono font-bold text-amber-300">%{currentResult.harmonyScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Piyasa Trend Uyumu:</span>
                        <span className="font-mono font-bold text-blue-300">%{currentResult.trendScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Formül Özgünlüğü:</span>
                        <span className="font-mono font-bold text-emerald-400">%{currentResult.originalityScore}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Genel Kalite Puanı:</span>
                        <span className="font-mono font-bold text-purple-300">%{currentResult.qualityScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Telif Kesintisi:</span>
                        <span className="font-mono font-bold text-slate-300">%{(currentResult.royaltyRate * 100).toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-slate-800">
                        <span className="text-slate-400">Tavsiye Satış Fiyatı:</span>
                        <span className="font-mono font-bold text-amber-300 text-sm">{currentResult.estimatedMarketPrice} ₺</span>
                      </div>
                    </div>

                    {/* İcat Edilen Reçete Detayı & Farklı Miktarlar */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <span>Formül Reçetesi ({currentResult.recipe.length} Farklı Hammadde)</span>
                        <span className="text-amber-400 font-mono">100 Şişe Gereksinimi</span>
                      </div>
                      <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                        {currentResult.recipe.map((r) => {
                          const mat = rawMaterialsMap.get(r.rawMaterialId);
                          return (
                            <div
                              key={r.rawMaterialId}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px]"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                {mat && (
                                  <CountryFlag
                                    countryCode={mat.countryCode}
                                    country={mat.country}
                                    fallbackEmoji={mat.flag}
                                    size="xs"
                                  />
                                )}
                                <span className="font-semibold text-slate-200 truncate">{mat?.name || r.rawMaterialId}</span>
                                <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                  {r.noteType === 'top' ? 'Üst' : r.noteType === 'middle' ? 'Orta' : 'Alt'}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-amber-300 ml-2 shrink-0">
                                {r.amount} adet
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add to Production Button */}
                    <button
                      onClick={() => registerRndPerfume(currentResult.id)}
                      disabled={currentResult.isAddedToProduction}
                      className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {currentResult.isAddedToProduction
                        ? 'Üretim Portföyüne Eklendi ✓'
                        : 'Üretim Portföyüne Ekle'}
                    </button>
                  </div>
                ) : (
                  <div className="bg-slate-950/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center space-y-2">
                    <Dna className="w-8 h-8 text-slate-600 mx-auto" />
                    <div className="text-xs font-semibold text-slate-400">Henüz sentez yapılmadı.</div>
                    <p className="text-[11px] text-slate-500">
                      Notaları seçip sentez butonuna basınız. İMZA parfüm için yüksek nota uyumu ve özgünlük gereklidir.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500">
                ParfümATÖR; nota sinerjisi ve pazar trendlerini harmanlayarak ürün seviyesini belirler.
              </div>
            </div>

          </div>

          {/* R&D ARCHIVE */}
          {rndArchive.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                AR-GE İcat Arşivi ({rndArchive.length} Formül)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {rndArchive.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2 text-xs"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${getResultBadgeStyle(item.resultLevel)}`}>
                        {item.resultLevel}
                      </span>
                      <span className="font-mono text-amber-300 font-bold">{item.estimatedMarketPrice} ₺</span>
                    </div>

                    <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                    <div className="text-purple-300 font-semibold text-[11px]">
                      {item.companyName} × {item.perfumerName}
                    </div>
                    <div className="text-slate-400 text-[11px]">{item.notesSummary}</div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-emerald-400 font-mono">Kalite: %{item.qualityScore}</span>
                      {!item.isAddedToProduction ? (
                        <button
                          onClick={() => registerRndPerfume(item.id)}
                          className="px-2.5 py-1 text-[11px] bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors"
                        >
                          Portföye Ekle
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[10px]">Portföyde ✓</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
};
