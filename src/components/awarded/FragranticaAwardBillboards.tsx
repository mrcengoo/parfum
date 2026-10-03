import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../../context/GameContext';
import { Perfume } from '../../types';
import {
  Trophy,
  Award,
  Sparkles,
  TrendingUp,
  Flame,
  Star,
  Eye,
  Zap,
  RotateCcw,
  Clock,
  ArrowRight,
  Vote,
  Heart,
  ChevronRight
} from 'lucide-react';

// Pre-generated High-Fidelity Luxury Fragrantica Posters matching reklomo.png
import imgBestsellerMen from '../../assets/images/award_bestseller_men_1790873829178.jpg';
import imgQualityWomen from '../../assets/images/award_quality_women_1790873845207.jpg';
import imgExpensiveMen from '../../assets/images/award_expensive_men_1790873865609.jpg';
import imgExpensiveWomen from '../../assets/images/award_expensive_women_1790873891065.jpg';
import imgExpensiveUnisex from '../../assets/images/award_expensive_unisex_1790873907377.jpg';
import imgBestsellerUnisex from '../../assets/images/award_bestseller_unisex_1790873921124.jpg';
import imgUpcomingOcean from '../../assets/images/award_upcoming_ocean_1790873941964.jpg';
import imgUpcomingBird from '../../assets/images/award_upcoming_bird_1790873958434.jpg';
import imgUpcomingViolet from '../../assets/images/award_upcoming_violet_1790873974855.jpg';

interface FragranticaAwardBillboardsProps {
  onSelectPerfume?: (perfume: Perfume) => void;
}

export const FragranticaAwardBillboards: React.FC<FragranticaAwardBillboardsProps> = ({
  onSelectPerfume
}) => {
  const { perfumes, companies, playerCompany, setActiveTab } = useGame();

  // Dynamic slot 7 rotation state (changes every 6 seconds)
  const [rotatingSlot7Index, setRotatingSlot7Index] = useState(0);
  // Dynamic slot 9 rotation state (changes every 8 seconds)
  const [rotatingSlot9Index, setRotatingSlot9Index] = useState(0);
  // Live votes counter for dynamic card
  const [liveVotes, setLiveVotes] = useState(14850);

  // Interval timers for the dynamic / rotating cards
  useEffect(() => {
    const timer7 = setInterval(() => {
      setRotatingSlot7Index((prev) => (prev + 1) % 4);
      setLiveVotes((prev) => prev + Math.floor(Math.random() * 8) + 1);
    }, 6000);

    const timer9 = setInterval(() => {
      setRotatingSlot9Index((prev) => (prev + 1) % 3);
    }, 8000);

    return () => {
      clearInterval(timer7);
      clearInterval(timer9);
    };
  }, []);

  // Calculate sector sales for each perfume
  const salesMap = useMemo(() => {
    const map = new Map<string, number>();
    companies.forEach((c) => {
      Object.entries(c.productStorage).forEach(([pid, item]) => {
        const current = map.get(pid) || 0;
        map.set(pid, current + (item.totalSold || 0));
      });
    });
    // Add player sales
    Object.entries(playerCompany.productStorage).forEach(([pid, item]) => {
      const current = map.get(pid) || 0;
      map.set(pid, current + (item.totalSold || 0));
    });
    return map;
  }, [companies, playerCompany]);

  // 1. KARE: Oyun içinde en çok satan erkek parfümü
  const bestSellerMen = useMemo(() => {
    const men = perfumes.filter((p) => p.gender === 'ERKEK');
    if (men.length === 0) return null;
    return [...men].sort((a, b) => {
      const soldA = salesMap.get(a.id) || 0;
      const soldB = salesMap.get(b.id) || 0;
      if (soldB !== soldA) return soldB - soldA;
      return b.quality - a.quality;
    })[0];
  }, [perfumes, salesMap]);

  // 2. KARE: En kaliteli kadın parfümü
  const highestQualityWomen = useMemo(() => {
    const women = perfumes.filter((p) => p.gender === 'KADIN');
    if (women.length === 0) return null;
    return [...women].sort((a, b) => {
      if (b.quality !== a.quality) return b.quality - a.quality;
      return b.suggestedRetailPrice - a.suggestedRetailPrice;
    })[0];
  }, [perfumes]);

  // 3. KARE: En pahalı erkek parfümü
  const mostExpensiveMen = useMemo(() => {
    const men = perfumes.filter((p) => p.gender === 'ERKEK');
    if (men.length === 0) return null;
    return [...men].sort((a, b) => b.suggestedRetailPrice - a.suggestedRetailPrice)[0];
  }, [perfumes]);

  // 4. KARE: En pahalı kadın parfümü
  const mostExpensiveWomen = useMemo(() => {
    const women = perfumes.filter((p) => p.gender === 'KADIN');
    if (women.length === 0) return null;
    return [...women].sort((a, b) => b.suggestedRetailPrice - a.suggestedRetailPrice)[0];
  }, [perfumes]);

  // 5. KARE: En pahalı unisex parfümü
  const mostExpensiveUnisex = useMemo(() => {
    const unisex = perfumes.filter((p) => p.gender === 'UNISEX');
    if (unisex.length === 0) return null;
    return [...unisex].sort((a, b) => b.suggestedRetailPrice - a.suggestedRetailPrice)[0];
  }, [perfumes]);

  // 6. KARE: En çok satan unisex parfümü
  const bestSellerUnisex = useMemo(() => {
    const unisex = perfumes.filter((p) => p.gender === 'UNISEX');
    if (unisex.length === 0) return null;
    return [...unisex].sort((a, b) => {
      const soldA = salesMap.get(a.id) || 0;
      const soldB = salesMap.get(b.id) || 0;
      if (soldB !== soldA) return soldB - soldA;
      return b.quality - a.quality;
    })[0];
  }, [perfumes, salesMap]);

  // 7. KARE (Dinamik / Boş 1): Sezonun Yükselen Yıldızları Aday Listesi (Canlı döner)
  const dynamicNominees = useMemo(() => {
    return perfumes.slice(4, 9);
  }, [perfumes]);
  const currentNominee = dynamicNominees[rotatingSlot7Index % dynamicNominees.length] || perfumes[0];

  // 8. KARE (Dinamik / Boş 2): AromaLux Şirketinizin En Yeni İcat Parfümü (veya boş inovasyon yuvası)
  const playerLatestPerfume = useMemo(() => {
    const playerPerfumes = perfumes.filter(
      (p) => p.producerCompanyId === playerCompany.id || p.companyId === playerCompany.id || p.sourceType === 'AR-GE'
    );
    return playerPerfumes[playerPerfumes.length - 1] || null;
  }, [perfumes, playerCompany.id]);

  // 9. KARE (Dinamik / Boş 3): Fragrantica Editörün Seçkisi (Canlı periyodik döner)
  const curatedEditorPicks = useMemo(() => {
    return perfumes.filter((p) => p.quality >= 90).slice(0, 4);
  }, [perfumes]);
  const currentEditorPick = curatedEditorPicks[rotatingSlot9Index % curatedEditorPicks.length] || perfumes[1];

  const handleCardClick = (p: Perfume | null) => {
    if (p && onSelectPerfume) {
      onSelectPerfume(p);
    } else if (p) {
      setActiveTab('catalogue');
    }
  };

  return (
    <div className="space-y-5">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px] font-black shadow-md shadow-red-600/30">
              FR
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-red-400 uppercase">
              FRAGRANTICA COMMUNITY AWARDS & REKLAM PANOSU
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-serif text-white tracking-wide">
            Yılın Zirvedeki Parfümleri & Ödül Vitrini (9 Kare)
          </h3>
          <p className="text-xs text-slate-400">
            Sektörün en çok satanları, en kaliteli ve en pahalı niş şaheserleri ile canlı güncellenen sezon reklamları.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold">Canlı Veritabanı Senkronize</span>
        </div>
      </div>

      {/* 3x3 (9 KARE) BILLBOARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* ======================================================== */}
        {/* KARE 1: OYUN İÇİNDE EN ÇOK SATAN ERKEK PARFÜMÜ REKLAMI */}
        {/* ======================================================== */}
        <div
          onClick={() => handleCardClick(bestSellerMen)}
          className="group relative rounded-3xl overflow-hidden border border-slate-800 hover:border-amber-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer bg-slate-950 flex flex-col justify-between min-h-[260px]"
        >
          {/* Background Image with left gradient mask */}
          <div className="absolute inset-0 z-0">
            <img
              src={imgBestsellerMen}
              alt="En Çok Satan Erkek Parfümü"
              className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          {/* Top Fragrantica Badge & Typography */}
          <div className="relative z-10 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-red-600/50">
                FR
              </span>
              <div className="text-[10px] font-black tracking-widest text-slate-200 uppercase font-sans">
                FRAGRANTICA <span className="text-amber-400">9th AWARDS</span>
              </div>
            </div>

            <div className="pt-1">
              <div className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white drop-shadow-md">
                2025
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
                🏆 BEST-SELLER FOR MEN
              </div>
            </div>

            {/* Perfume Identity */}
            {bestSellerMen && (
              <div className="pt-2 max-w-[65%] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  {bestSellerMen.brand}
                </div>
                <div className="text-sm sm:text-base font-black text-white leading-tight truncate group-hover:text-amber-300 transition-colors">
                  {bestSellerMen.name}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    🔥 {salesMap.get(bestSellerMen.id) || 1240} Şişe Satıldı
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Banner Glassmorphism Bar */}
          <div className="relative z-10 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>9th Community Awards</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400">Yılın En Çok Satan Erkek Parfümü</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* KARE 2: EN KALİTELİ KADIN PARFÜMÜ REKLAMI */}
        {/* ======================================================== */}
        <div
          onClick={() => handleCardClick(highestQualityWomen)}
          className="group relative rounded-3xl overflow-hidden border border-slate-800 hover:border-rose-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-rose-500/10 cursor-pointer bg-slate-950 flex flex-col justify-between min-h-[260px]"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={imgQualityWomen}
              alt="En Kaliteli Kadın Parfümü"
              className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="relative z-10 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-red-600/50">
                FR
              </span>
              <div className="text-[10px] font-black tracking-widest text-slate-200 uppercase font-sans">
                FRAGRANTICA <span className="text-rose-400">8th AWARDS</span>
              </div>
            </div>

            <div className="pt-1">
              <div className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white drop-shadow-md">
                AWARDS 2024
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-rose-400 font-mono">
                👑 GRAND PRIX D'EXCELLENCE FÉMININE
              </div>
            </div>

            {highestQualityWomen && (
              <div className="pt-2 max-w-[65%] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  {highestQualityWomen.brand}
                </div>
                <div className="text-sm sm:text-base font-black text-white leading-tight truncate group-hover:text-rose-300 transition-colors">
                  {highestQualityWomen.name}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    ✨ %{highestQualityWomen.quality} Kusursuz Kalite Skoru
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>8th Community Awards</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400">En Kaliteli Kadın Parfümü</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* KARE 3: EN PAHALI ERKEK PARFÜMÜ REKLAMI */}
        {/* ======================================================== */}
        <div
          onClick={() => handleCardClick(mostExpensiveMen)}
          className="group relative rounded-3xl overflow-hidden border border-slate-800 hover:border-blue-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 cursor-pointer bg-slate-950 flex flex-col justify-between min-h-[260px]"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={imgExpensiveMen}
              alt="En Pahalı Erkek Parfümü"
              className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="relative z-10 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-red-600/50">
                FR
              </span>
              <div className="text-[10px] font-black tracking-widest text-slate-200 uppercase font-sans">
                FRAGRANTICA <span className="text-blue-400">7th AWARDS</span>
              </div>
            </div>

            <div className="pt-1">
              <div className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white drop-shadow-md">
                2023 LUXE
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-blue-400 font-mono">
                💎 MOST EXPENSIVE MEN'S SCENT
              </div>
            </div>

            {mostExpensiveMen && (
              <div className="pt-2 max-w-[65%] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  {mostExpensiveMen.brand}
                </div>
                <div className="text-sm sm:text-base font-black text-white leading-tight truncate group-hover:text-blue-300 transition-colors">
                  {mostExpensiveMen.name}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    💰 {mostExpensiveMen.suggestedRetailPrice} ₺ (Sektör Tavanı)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>7th Community Awards</span>
              <span className="text-slate-600">•</span>
              <span className="text-blue-400">En Pahalı Erkek Parfümü</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* KARE 4: EN PAHALI KADIN PARFÜMÜ REKLAMI */}
        {/* ======================================================== */}
        <div
          onClick={() => handleCardClick(mostExpensiveWomen)}
          className="group relative rounded-3xl overflow-hidden border border-slate-800 hover:border-purple-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-500/10 cursor-pointer bg-slate-950 flex flex-col justify-between min-h-[260px]"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={imgExpensiveWomen}
              alt="En Pahalı Kadın Parfümü"
              className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="relative z-10 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-red-600/50">
                FR
              </span>
              <div className="text-[10px] font-black tracking-widest text-slate-200 uppercase font-sans">
                FRAGRANTICA <span className="text-purple-400">6th AWARDS</span>
              </div>
            </div>

            <div className="pt-1">
              <div className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white drop-shadow-md">
                IMPERIAL 2022
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-purple-400 font-mono">
                👑 HAUTE LUXE FÉMININE
              </div>
            </div>

            {mostExpensiveWomen && (
              <div className="pt-2 max-w-[65%] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  {mostExpensiveWomen.brand}
                </div>
                <div className="text-sm sm:text-base font-black text-white leading-tight truncate group-hover:text-purple-300 transition-colors">
                  {mostExpensiveWomen.name}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    💎 {mostExpensiveWomen.suggestedRetailPrice} ₺ / Şişe
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>6th Community Awards</span>
              <span className="text-slate-600">•</span>
              <span className="text-purple-400">En Pahalı Kadın Parfümü</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* KARE 5: EN PAHALI UNISEX PARFÜMÜ REKLAMI */}
        {/* ======================================================== */}
        <div
          onClick={() => handleCardClick(mostExpensiveUnisex)}
          className="group relative rounded-3xl overflow-hidden border border-slate-800 hover:border-amber-400/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-400/10 cursor-pointer bg-slate-950 flex flex-col justify-between min-h-[260px]"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={imgExpensiveUnisex}
              alt="En Pahalı Unisex Parfümü"
              className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="relative z-10 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-red-600/50">
                FR
              </span>
              <div className="text-[10px] font-black tracking-widest text-slate-200 uppercase font-sans">
                FRAGRANTICA <span className="text-amber-400">5th AWARDS</span>
              </div>
            </div>

            <div className="pt-1">
              <div className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white drop-shadow-md">
                2021 ROYAL
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
                🏺 CROWN JEWEL NICHE UNISEX
              </div>
            </div>

            {mostExpensiveUnisex && (
              <div className="pt-2 max-w-[65%] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  {mostExpensiveUnisex.brand}
                </div>
                <div className="text-sm sm:text-base font-black text-white leading-tight truncate group-hover:text-amber-300 transition-colors">
                  {mostExpensiveUnisex.name}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    👑 {mostExpensiveUnisex.suggestedRetailPrice} ₺ (Nadir Koleksiyon)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>5th Community Awards</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400">En Pahalı Unisex Parfümü</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* KARE 6: EN ÇOK SATAN UNISEX PARFÜMÜ REKLAMI */}
        {/* ======================================================== */}
        <div
          onClick={() => handleCardClick(bestSellerUnisex)}
          className="group relative rounded-3xl overflow-hidden border border-slate-800 hover:border-teal-500/60 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 cursor-pointer bg-slate-950 flex flex-col justify-between min-h-[260px]"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={imgBestsellerUnisex}
              alt="En Çok Satan Unisex Parfümü"
              className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="relative z-10 p-5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-red-600/50">
                FR
              </span>
              <div className="text-[10px] font-black tracking-widest text-slate-200 uppercase font-sans">
                FRAGRANTICA <span className="text-teal-400">4th AWARDS</span>
              </div>
            </div>

            <div className="pt-1">
              <div className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white drop-shadow-md">
                VIRAL 2020
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-teal-400 font-mono">
                🌍 GLOBAL PHENOMENON UNISEX
              </div>
            </div>

            {bestSellerUnisex && (
              <div className="pt-2 max-w-[65%] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  {bestSellerUnisex.brand}
                </div>
                <div className="text-sm sm:text-base font-black text-white leading-tight truncate group-hover:text-teal-300 transition-colors">
                  {bestSellerUnisex.name}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/40">
                    🔥 {salesMap.get(bestSellerUnisex.id) || 1650} Şişe Satış Hacmi
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>4th Community Awards</span>
              <span className="text-slate-600">•</span>
              <span className="text-teal-400">En Çok Satan Unisex Parfümü</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* KARE 7: DİNAMİK / BOŞ 1: GELECEK SEZON ADAYI (CANLI OYLAMA) */}
        {/* ======================================================== */}
        <div
          onClick={() => handleCardClick(currentNominee)}
          className="group relative rounded-3xl overflow-hidden border border-cyan-500/30 hover:border-cyan-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer bg-slate-950 flex flex-col justify-between min-h-[260px]"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={imgUpcomingOcean}
              alt="Gelecek Sezon Adayı"
              className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="relative z-10 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-red-600/50">
                  FR
                </span>
                <div className="text-[10px] font-black tracking-widest text-slate-200 uppercase font-sans">
                  FRAGRANTICA <span className="text-cyan-400">NEXT-GEN SPOT</span>
                </div>
              </div>

              {/* Dynamic Live Tag */}
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                CANLI DEĞİŞEN
              </span>
            </div>

            <div className="pt-1">
              <div className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white drop-shadow-md">
                VOTE 2026
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 font-mono">
                🌊 HALK OYLAMASI AÇIK (YÜKSELEN YILDIZ)
              </div>
            </div>

            {currentNominee && (
              <div className="pt-2 max-w-[65%] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  Canlı Aday: {currentNominee.brand}
                </div>
                <div className="text-sm sm:text-base font-black text-white leading-tight truncate group-hover:text-cyan-300 transition-colors">
                  {currentNominee.name}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    🗳️ {liveVotes.toLocaleString()} Topluluk Oyu (Artıyor)
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>Sezon Adaylığı</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400">Canlı Değişen Oylama Vitrini</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* KARE 8: DİNAMİK / BOŞ 2: AROMALUX ŞİRKET İNOVASYON YUVASI */}
        {/* ======================================================== */}
        <div
          onClick={() => {
            if (playerLatestPerfume) {
              handleCardClick(playerLatestPerfume);
            } else {
              setActiveTab('rnd');
            }
          }}
          className="group relative rounded-3xl overflow-hidden border border-amber-500/40 hover:border-amber-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer bg-slate-950 flex flex-col justify-between min-h-[260px]"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={imgUpcomingBird}
              alt="AromaLux İnovasyon Yuvası"
              className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="relative z-10 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-red-600/50">
                  FR
                </span>
                <div className="text-[10px] font-black tracking-widest text-slate-200 uppercase font-sans">
                  FRAGRANTICA <span className="text-amber-300">INNOVATION SPOT</span>
                </div>
              </div>

              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                👑 ŞİRKETİNİZ
              </span>
            </div>

            <div className="pt-1">
              <div className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white drop-shadow-md">
                AROMALUX
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-amber-400 font-mono">
                ✨ YILIN ATILIM YAPAN ŞİRKET İCADI
              </div>
            </div>

            {playerLatestPerfume ? (
              <div className="pt-2 max-w-[65%] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold">
                  Sizin En Yeni Eseriniz
                </div>
                <div className="text-sm sm:text-base font-black text-white leading-tight truncate group-hover:text-amber-300 transition-colors">
                  {playerLatestPerfume.name}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    🔬 %{playerLatestPerfume.quality} Kalite • {playerLatestPerfume.suggestedRetailPrice} ₺
                  </span>
                </div>
              </div>
            ) : (
              <div className="pt-2 max-w-[70%] space-y-1">
                <div className="text-[11px] text-amber-300 font-bold">
                  İnovasyon Yuvası Hazır Bekliyor
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  AR-GE Laboratuvarında icat edeceğiniz yeni parfüm otomatik olarak buraya yerleşip sektöre tanıtılacaktır.
                </p>
                <div className="pt-1">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 inline-flex items-center gap-1">
                    <Zap className="w-3 h-3" /> İcat Etmek İçin Tıkla
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>AromaLux İnovasyon</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400">Şirketinizin Gelecek Vadeden Çıkışı</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

        {/* ======================================================== */}
        {/* KARE 9: DİNAMİK / BOŞ 3: FRAGRANTICA EDİTÖRÜN SEÇKİSİ */}
        {/* ======================================================== */}
        <div
          onClick={() => handleCardClick(currentEditorPick)}
          className="group relative rounded-3xl overflow-hidden border border-violet-500/30 hover:border-violet-400 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-violet-500/10 cursor-pointer bg-slate-950 flex flex-col justify-between min-h-[260px]"
        >
          <div className="absolute inset-0 z-0">
            <img
              src={imgUpcomingViolet}
              alt="Editörün Seçkisi"
              className="w-full h-full object-cover object-right group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          <div className="relative z-10 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-white text-xs font-black shadow-md shadow-red-600/50">
                  FR
                </span>
                <div className="text-[10px] font-black tracking-widest text-slate-200 uppercase font-sans">
                  FRAGRANTICA <span className="text-violet-400">CURATED PICK</span>
                </div>
              </div>

              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40 flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                DİNAMİK SEÇKİ
              </span>
            </div>

            <div className="pt-1">
              <div className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-white drop-shadow-md">
                EDITORS' PICK
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-violet-400 font-mono">
                💜 SEKTÖREL GİZLİ MÜCEVHERLER
              </div>
            </div>

            {currentEditorPick && (
              <div className="pt-2 max-w-[65%] space-y-1">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
                  {currentEditorPick.brand}
                </div>
                <div className="text-sm sm:text-base font-black text-white leading-tight truncate group-hover:text-violet-300 transition-colors">
                  {currentEditorPick.name}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/40">
                    ⭐ Kalite: %{currentEditorPick.quality} • {currentEditorPick.suggestedRetailPrice} ₺
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative z-10 bg-slate-950/85 backdrop-blur-md px-4 py-2.5 border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
              <span>Haftalık Seçki</span>
              <span className="text-slate-600">•</span>
              <span className="text-violet-400">Fragrantica Editör Önerisi</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
          </div>
        </div>

      </div>

    </div>
  );
};
