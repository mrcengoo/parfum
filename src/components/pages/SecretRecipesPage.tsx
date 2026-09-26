import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { SecretRecipe } from '../../types';
import { NoteImage } from '../common/NoteImage';
import { CountryFlag } from '../common/CountryFlag';
import { SecretRecipeDeductionLab } from '../rnd/SecretRecipeDeductionLab';
import {
  FileLock2,
  Lock,
  Sparkles,
  Unlock,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  FlaskConical,
  Award,
  Layers,
  Search,
  EyeOff
} from 'lucide-react';

export const SecretRecipesPage: React.FC = () => {
  const {
    secretRecipes,
    buySecretRecipe,
    playerCompany,
    playerPerfumer,
    rawMaterialsMap,
    setActiveTab
  } = useGame();

  const [activeSecretId, setActiveSecretId] = useState<string | null>(null);

  const activeSecret = secretRecipes.find((s) => s.id === activeSecretId) || null;

  const handleSelectSecret = (secret: SecretRecipe) => {
    setActiveSecretId(activeSecretId === secret.id ? null : secret.id);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Page Header */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/30 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <FileLock2 className="w-4 h-4" />
            Çok Gizli İstihbarat & Parfüm Arşivi
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <span>Gizli Reçeteler (Secret Recipes)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
              TOP SECRET
            </span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Parfümeri dünyasının gizemli başyapıtları sarı zarflarda saklanıyor. Kimlikleri, markaları ve cinsiyetleri gizlenmiştir. 
            Zarfı satın alarak Parfümatörünüzün <strong>3 tahmin hakkı</strong> rehberliğinde formülü çözün ve efsaneyi şirketinize kazandırın!
          </p>
        </div>

        <div className="bg-slate-950/90 px-4 py-3 rounded-2xl border border-amber-500/30 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 font-bold">
            🟨
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Kasa Bakiyeniz</div>
            <div className="text-base font-bold font-mono text-amber-300">
              {playerCompany.cash.toLocaleString('tr-TR')} ₺
            </div>
          </div>
        </div>
      </div>

      {/* Secret Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {secretRecipes.map((secret, index) => {
          const isPurchased = secret.isPurchased;
          const isSolved = secret.status === 'solved';
          const isFailed = secret.status === 'failed';
          const isSelected = activeSecretId === secret.id;

          return (
            <div
              key={secret.id}
              className={`relative overflow-hidden rounded-3xl border transition-all duration-300 flex flex-col justify-between ${
                isSolved
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-emerald-950/30 shadow-xl'
                  : isFailed
                  ? 'bg-rose-950/20 border-rose-500/40 opacity-80'
                  : isPurchased
                  ? 'bg-slate-900 border-amber-500/50 shadow-amber-950/20 shadow-xl'
                  : 'bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border-amber-600/40 hover:border-amber-400/70 hover:shadow-amber-500/10 shadow-lg'
              }`}
            >
              {/* TOP SECRET VINTAGE ENVELOPE STAMP HEADER */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl select-none">🟨</span>
                    <div>
                      <span className="text-[10px] font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {isSolved ? 'ÇÖZÜLDÜ ✓' : isFailed ? 'KİLİTLENDİ ✕' : 'TOP SECRET'}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-slate-400 font-bold">
                    DOSYA #{index + 1}
                  </span>
                </div>

                {/* SARI ZARF VISUAL CARD */}
                {!isSolved ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-yellow-600/10 to-amber-900/20 border-2 border-dashed border-amber-500/40 text-center relative overflow-hidden group">
                    <div className="absolute top-2 right-2 text-rose-500/60 font-black text-xs font-mono rotate-12 uppercase tracking-widest border border-rose-500/40 px-1.5 py-0.5 rounded">
                      GİZLİDİR
                    </div>

                    <div className="w-16 h-12 mx-auto mb-2 flex items-center justify-center bg-amber-500/20 rounded-xl border border-amber-500/40 shadow-inner">
                      {isPurchased ? (
                        <Unlock className="w-6 h-6 text-amber-300" />
                      ) : (
                        <Lock className="w-6 h-6 text-amber-400" />
                      )}
                    </div>

                    <h3 className="text-base font-bold font-mono tracking-wider text-amber-200 uppercase">
                      {secret.codeName}
                    </h3>

                    {/* REDACTED METADATA BARS (Name, Brand, Gender completely hidden) */}
                    <div className="mt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <EyeOff className="w-3.5 h-3.5 text-amber-400/80" />
                        <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono select-none">
                          █████████
                        </span>
                      </span>
                      <span>•</span>
                      <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono select-none">
                        ██████
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-amber-500/20">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">Tahmin Hakkı:</span>
                        <span className="font-mono font-bold text-amber-300">
                          {secret.attemptsLeft} / 3 Kalan
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* REVEALED PERFUME CARD WHEN SOLVED */
                  <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-3">
                    <div className="flex gap-3">
                      <img
                        src={secret.realPerfume.image}
                        alt={secret.realPerfume.name}
                        className="w-16 h-16 rounded-xl object-cover border border-emerald-500/50 shadow-md shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                            {secret.realPerfume.gender}
                          </span>
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                            {secret.realPerfume.qualityLevel}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white truncate font-serif">
                          {secret.realPerfume.name}
                        </h3>
                        <div className="text-xs text-emerald-400 font-semibold truncate">
                          {secret.realPerfume.brand}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-emerald-500/20">
                      {secret.realPerfume.description}
                    </p>
                  </div>
                )}

                {/* PARFÜMATÖRÜN KOKU İPUCU (HINT) */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Lightbulb className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{playerPerfumer.name} Koku İpucu:</span>
                  </div>
                  <p className="text-[11px] text-slate-300 italic leading-relaxed pl-5">
                    "{secret.hint}"
                  </p>
                </div>

                {/* ATTEMPTS PREVIEW */}
                {secret.attempts.length > 0 && !isSolved && (
                  <div className="space-y-1 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                      <span>Son Deneme Raporu:</span>
                      <span className="text-amber-400 font-mono">
                        {secret.attempts.length}. Tahmin
                      </span>
                    </div>
                    <p className="text-[11px] text-purple-300 italic leading-relaxed">
                      "{secret.attempts[secret.attempts.length - 1].perfumerComment}"
                    </p>
                  </div>
                )}
              </div>

              {/* CARD FOOTER ACTIONS */}
              <div className="p-6 pt-0">
                {!isPurchased ? (
                  <button
                    onClick={() => buySecretRecipe(secret.id)}
                    disabled={playerCompany.cash < secret.purchasePrice}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    Zarfı Aç & Satın Al ({secret.purchasePrice.toLocaleString('tr-TR')} ₺)
                  </button>
                ) : isSolved ? (
                  <button
                    onClick={() => setActiveTab('production')}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Üretim Portföyünde Gör
                  </button>
                ) : isFailed ? (
                  <div className="text-center py-2 text-xs font-semibold text-rose-400 bg-rose-950/40 rounded-xl border border-rose-500/30">
                    3 Tahmin Hakkı Tükendi
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectSecret(secret)}
                    className={`w-full py-3 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-purple-600/30'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                    }`}
                  >
                    <FlaskConical className="w-4 h-4" />
                    {isSelected ? 'Laboratuvar Aşağıda Açık ↓' : `Formülü Çöz (${secret.attemptsLeft} Hak Kaldı)`}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DEDUCTION LABORATORY (WHEN A SECRET IS SELECTED FOR GUESSING) */}
      {activeSecret && activeSecret.isPurchased && (
        <SecretRecipeDeductionLab
          secret={activeSecret}
          onClose={() => setActiveSecretId(null)}
          onTransferToFormulaLab={() => setActiveTab('rnd')}
        />
      )}

    </div>
  );
};
