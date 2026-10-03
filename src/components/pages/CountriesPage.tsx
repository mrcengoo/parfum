import React, { useState, useMemo, useEffect } from 'react';
import { useGame } from '../../context/GameContext';
import { getPerfumerById } from '../../data/perfumers';
import { getFamilyMeta } from '../../data/rawMaterials';
import {
  AD_CAMPAIGN_PACKAGES,
  COMPETITIVE_TACTICS,
  COMPETITIVE_TACTIC_COOLDOWN_MS,
  COMPANY_DEFAULT_COUNTRY_BONUSES,
  GLOBAL_MARKET_COUNTRIES,
  calculateAdCampaignPower,
  getCompanyAdSpecialist,
  getCompanySalesRep,
  getCompanySynergyCountries,
  getCountryFlag,
  getCountrySynergyDetails,
  getPerfumeFame,
  isPerfumePopularInCountry,
  normalizeCountryName
} from '../../services/marketingEngine';
import {
  Globe2,
  Zap,
  Megaphone,
  UserCheck,
  Flame,
  Sparkles,
  Crown,
  Building2,
  Coins,
  Award,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Swords,
  ShieldAlert
} from 'lucide-react';

const COUNTRY_RICH_PROFILES: Record<
  string,
  {
    region: string;
    purchasingPower: string;
    marketTrait: string;
    preferredBottleVolume: string;
    synergyTip: string;
  }
> = {
  Fransa: {
    region: 'Batı Avrupa • Paris Haute Parfumerie',
    purchasingPower: 'Çok Yüksek (Prestij & Sanatsal Değer Odaklı)',
    marketTrait:
      'Dünya parfümerisinin kalbi. Zarif çiçeksi (Gül, İris, Yasemin) ve narenciye-şipre uyumlarına en yüksek prestij primini öder.',
    preferredBottleVolume: '35 – 85 Şişe / Sipariş',
    synergyTip:
      'Hem Reklamcı hem Satış Temsilcisinde Fransa uzmanlığı olduğunda Paris moda haftası lansmanları rekor şöhret ve fiyat primi getirir.'
  },
  'Birleşik Arap Emirlikleri': {
    region: 'Orta Doğu & Körfez • Dubai Kraliyet Pazarı',
    purchasingPower: 'Ultra Lüks (En Yüksek Birim Fiyat & VIP Alım)',
    marketTrait:
      'Oud, Safran, Amber, Tütsü ve Deri içeren yoğun oryantal parfümlere servet öder. Kraliyet sarayları ve VIP butikler yüksek adetli alım yapar.',
    preferredBottleVolume: '45 – 110 Şişe / Sipariş',
    synergyTip:
      'BAE ortak sinerjisi açıkken yapılan Gala reklamları anında yüksek bütçeli Dubai kraliyet siparişleri doğurur.'
  },
  ABD: {
    region: 'Kuzey Amerika • New York & Beverly Hills',
    purchasingPower: 'Yüksek Hacimli Mega Departman Zincirleri',
    marketTrait:
      'Modern, tatlı, odunsu ve meyvemsi-gurme (Ambroksan, Vanilya, Ananas, Tonka) kokular dev mağaza zincirlerinde çok hızlı tükenir.',
    preferredBottleVolume: '50 – 120 Şişe / Sipariş',
    synergyTip:
      'Billboard reklamları ve ABD sinerjisi birleştiğinde yüksek şişe adetli konsorsiyum siparişleri gelir.'
  },
  'Birleşik Krallık': {
    region: 'Kuzeybatı Avrupa • Londra Mayfair & Knightsbridge',
    purchasingPower: 'Yüksek (Aristokratik & Klasik Niş Koleksiyonlar)',
    marketTrait:
      'Vetiver, Deri, Tütün Yaprağı, Bergamot ve Lavanta içeren sofistike, kalıcı ve karakterli parfümleri tercih eder.',
    preferredBottleVolume: '35 – 80 Şişe / Sipariş',
    synergyTip:
      'Londra özel salonlarında Satış Temsilcisi ikna kabiliyeti ve ülke uzmanlığı birim fiyatı hızla yukarı taşır.'
  },
  İtalya: {
    region: 'Güney Avrupa • Milano & Roma Moda Koridoru',
    purchasingPower: 'Yüksek (Akdeniz Zarafeti & Gurme Tasarımlar)',
    marketTrait:
      'Bergamot, Limon, Greyfurt gibi parlak Akdeniz narenciyeleri ile İris, Bal ve Tarçın harmanlarına büyük ilgi gösterir.',
    preferredBottleVolume: '35 – 85 Şişe / Sipariş',
    synergyTip:
      'Milano moda evlerinde Reklamcı + Temsilci İtalya sinerjisi parfüm şöhretini çok hızlı büyütür.'
  },
  Katar: {
    region: 'Orta Doğu & Körfez • Doha İncisi Lüks Salonları',
    purchasingPower: 'Ultra Lüks (Extrait de Parfum & Altın Seriler)',
    marketTrait:
      'Oud, Safran, Kakule, Amber ve Misk ağırlıklı ağırbaşlı ve kalıcı kokulara çok yüksek birim fiyat öder.',
    preferredBottleVolume: '40 – 95 Şişe / Sipariş',
    synergyTip:
      'Katar sinerjisi ile yapılan tanıtımlar Körfez pazarındaki kalıcı ülke bonusunuzu iki kat hızlı artırır.'
  },
  Japonya: {
    region: 'Doğu Asya • Tokyo Ginza & Omotesando',
    purchasingPower: 'Yüksek (Minimalist, Zarif & Doğal Esanslar)',
    marketTrait:
      'Yeşil Çay, Osmanthus, Liçi, Deniz Notaları ve Sedir Ağacı gibi ferah, temiz ve sanatsal kokular en çok satanlar arasındadır.',
    preferredBottleVolume: '40 – 90 Şişe / Sipariş',
    synergyTip:
      'Tokyo pazarında popüler notalı bir parfümle yapılan reklam kampanyası pazar payını hızla liderliğe taşır.'
  },
  Almanya: {
    region: 'Orta Avrupa • Berlin, Münih & Düsseldorf',
    purchasingPower: 'Yüksek & İstikrarlı (Modern Aromatik & Kalıcı)',
    marketTrait:
      'Vetiver, Karabiber, Ambroksan, Greyfurt ve Sedir içeren dinamik, net ve yüksek performanslı parfümlere düzenli sipariş verir.',
    preferredBottleVolume: '40 – 90 Şişe / Sipariş',
    synergyTip:
      'Almanya uzmanlığı olan Temsilci ve Reklamcı ikilisi Avrupa dağıtım ağında düzenli yüksek kâr marjı sağlar.'
  },
  İsviçre: {
    region: 'Orta Avrupa • Cenevre & Zürih Ultra-Lüks Butikler',
    purchasingPower: 'Çok Yüksek (Nadir Çiçekler & Saf Miskler)',
    marketTrait:
      'İris, Sandal Ağacı, Gül, Sümbülteber ve Yeşil Çay gibi en pahalı ve nadir hammaddelerle üretilen butik serileri ödüllendirir.',
    preferredBottleVolume: '30 – 75 Şişe / Sipariş',
    synergyTip:
      'Cenevre butiklerinde yüksek şöhretli parfümler + İsviçre sinerjisi rekor şişe başına kâr bırakır.'
  },
  'Suudi Arabistan': {
    region: 'Orta Doğu & Körfez • Riyad & Cidde Kraliyet Pazarı',
    purchasingPower: 'Ultra Lüks (Kraliyet Koleksiyonları & Yüksek Adet)',
    marketTrait:
      'Oud, Amber, Safran, Tütsü ve Gül içeren görkemli oryantal ve reçineli parfümlere en yüksek bütçeyi ayırır.',
    preferredBottleVolume: '45 – 115 Şişe / Sipariş',
    synergyTip:
      'Riyad pazarında Reklamcı ve Satış Temsilcisi sinerjisiyle yapılan lansmanlar yüksek kârlı VIP siparişler açar.'
  },
  İspanya: {
    region: 'Güneybatı Avrupa • Madrid, Barselona & Marbella',
    purchasingPower: 'Yüksek (Akdeniz Güneşi & Çiçeksi-Baharatlı)',
    marketTrait:
      'Portakal Çiçeği, Mandalina, Yasemin, Tarçın ve Deri notalarının sıcak Akdeniz uyumu lüks mağazalarda çok popülerdir.',
    preferredBottleVolume: '35 – 85 Şişe / Sipariş',
    synergyTip:
      'İspanya uzmanlığına sahip ekip ile yapılan kampanyalar Güney Avrupa pazar payınızı hızla büyütür.'
  },
  'Güney Kore': {
    region: 'Doğu Asya • Seul Gangnam & Cheongdam Lüks Merkezi',
    purchasingPower: 'Çok Yüksek (Trend Belirleyici K-Luxury Pazarı)',
    marketTrait:
      'Şeftali, Liçi, Beyaz Misk, Yeşil Çay ve Sedir Ağacı içeren zarif, modern ve sofistike tasarımlara yoğun talep gösterir.',
    preferredBottleVolume: '40 – 95 Şişe / Sipariş',
    synergyTip:
      'Seul pazarında dijital fenomen ve billboard kampanyaları parfüm şöhretini çok hızlı yükseltir.'
  },
  Çin: {
    region: 'Doğu Asya • Şanghay & Pekin Имparatorluk Pavilyonları',
    purchasingPower: 'Dev Hacimli Lüks Tüketim & VIP Butikler',
    marketTrait:
      'Osmanthus, Yeşil Çay, Gül, Sandal Ağacı ve Kehribar gibi soylu ve dengeli koku ailelerine yüksek sadakat gösterir.',
    preferredBottleVolume: '50 – 120 Şişe / Sipariş',
    synergyTip:
      'Çin sinerjisi aktifken yapılan tanıtımlar yüksek şişe adetli mega mağaza siparişleri getirir.'
  },
  Rusya: {
    region: 'Doğu Avrupa & Avrasya • Moskova & St. Petersburg',
    purchasingPower: 'Çok Yüksek (İmparatorluk Lüksü & Yoğun Silaj)',
    marketTrait:
      'Deri, Kehribar, İris, Paçuli, Vanilya ve Konyak/Rom akorlarını andıran zengin, sıcak ve kalıcı kış kokularını tercih eder.',
    preferredBottleVolume: '40 – 90 Şişe / Sipariş',
    synergyTip:
      'Moskova TSUM ve GUM galerilerinde temsilci ikna gücü birim satış fiyatını zirveye taşır.'
  },
  Kanada: {
    region: 'Kuzey Amerika • Toronto, Montreal & Vancouver',
    purchasingPower: 'Yüksek (Doğal Odunsu & Temiz Niş Koleksiyonlar)',
    marketTrait:
      'Sedir Ağacı, Çam/Reçine, Vanilya, Bergamot ve Lavanta içeren Kuzey doğasından ilham alan modern parfümleri ödüllendirir.',
    preferredBottleVolume: '35 – 85 Şişe / Sipariş',
    synergyTip:
      'Kanada pazarında 3 Aile Bonusu eşleşmesiyle yapılan satışlar istikrarlı döviz geliri sağlar.'
  },
  Brezilya: {
    region: 'Güney Amerika • São Paulo & Rio de Janeiro',
    purchasingPower: 'Yüksek & Dinamik (Tropikal, Meyvemsi & Tonka)',
    marketTrait:
      'Tonka Fasulyesi, Hindistan Cevizi, Ananas, Çarkıfelek/Meyve ve Misk içeren enerjik ve cazibeli parfümler rekor kırar.',
    preferredBottleVolume: '40 – 95 Şişe / Sipariş',
    synergyTip:
      'Brezilya uzmanlığı olan Reklamcı ve Temsilci ikilisi Güney Amerika kıtasında rakipsiz satış hızı yakalar.'
  },
  Avustralya: {
    region: 'Okyanusya • Sidney & Melbourne Lüks Sahil Metropolleri',
    purchasingPower: 'Yüksek (Akuatik, Narenciye & Avustralya Sandalı)',
    marketTrait:
      'Deniz Notaları, Greyfurt, Limon, Okaliptüs/Yeşil ve Sandal Ağacı içeren ferah ama kalıcı parfümlere yüksek talep vardır.',
    preferredBottleVolume: '35 – 80 Şişe / Sipariş',
    synergyTip:
      'Sidney ve Melbourne butiklerinde akuatik-odunsu aile eşleşmesi +%30 tam ülke bonusu kazandırır.'
  },
  Singapur: {
    region: 'Güneydoğu Asya • Marina Bay & Orchard Ultra-Prestij',
    purchasingPower: 'Ultra Yüksek (Asya Finans & Lüks Turizm Merkezi)',
    marketTrait:
      'Orkide, Beyaz Çay, Oud, Bergamot ve Ambroksan içeren hem ferah hem ultra-lüks niş koleksiyonların merkezidir.',
    preferredBottleVolume: '40 – 95 Şişe / Sipariş',
    synergyTip:
      'Singapur Marina Bay galaları tüm Asya-Pasifik bölgesinde marka prestijinizi katlar.'
  },
  Kuveyt: {
    region: 'Orta Doğu & Körfez • Kuveyt Kraliyet & Niş Salonları',
    purchasingPower: 'Ultra Lüks (Özel Harman Oud & Baharat Koleksiyonları)',
    marketTrait:
      'Kamboçya Oudu, Taif Gülü, Safran, Kakule ve Misk harmanlarında dünyanın en seçici ve en yüksek ödeme yapan pazarlarındandır.',
    preferredBottleVolume: '40 – 100 Şişe / Sipariş',
    synergyTip:
      'Kuveyt sinerjisi ve 3 Aile uyumu birleştiğinde şişe başına rekor ihracat kârı elde edilir.'
  },
  Türkiye: {
    region: 'Avrasya & Doğu Akdeniz • İstanbul Boğaziçi & Nişantaşı',
    purchasingPower: 'Yüksek (Isparta Gülü, Doğu Baharatları & Modern Lüks)',
    marketTrait:
      'Gül, İncir, Bergamot, Amber, Sedir ve Baharat notalarını harmanlayan Doğu-Batı sentezi imza parfümlere büyük ilgi gösterir.',
    preferredBottleVolume: '35 – 90 Şişe / Sipariş',
    synergyTip:
      'İstanbul lüks butiklerinde yerel ve küresel sinerji ile yüksek adetli prestij siparişleri bağlanır.'
  }
};

export const CountriesPage: React.FC = () => {
  const {
    companies,
    playerCompany,
    perfumes,
    rawMaterialsMap,
    launchAdCampaign,
    executeCompetitiveTactic,
    rerollCountryFamilies,
    rerollPerfumerFamilies,
    rerollStaffBonuses,
    setActiveTab
  } = useGame();

  const [inspectedCompanyId, setInspectedCompanyId] = useState<string>(playerCompany.id);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState<string>('all');
  const [quickAdCountry, setQuickAdCountry] = useState<string | null>(null);
  const [quickAdPerfumeId, setQuickAdPerfumeId] = useState<string>('');
  const [tacticCountry, setTacticCountry] = useState<string>('Fransa');
  const [showTacticsPanel, setShowTacticsPanel] = useState<boolean>(false);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  const rivalCompanies = useMemo(
    () => companies.filter((c) => c.id !== playerCompany.id),
    [companies, playerCompany.id]
  );
  const [tacticRivalId, setTacticRivalId] = useState<string>(
    () => companies.find((c) => c.id !== playerCompany.id)?.id || 'scentora'
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setNowTick(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const tacticCooldownRemainingSec = useMemo(() => {
    const lastUsed = playerCompany.lastCompetitiveTacticAt || 0;
    if (!lastUsed) return 0;
    const diff = COMPETITIVE_TACTIC_COOLDOWN_MS - (nowTick - lastUsed);
    return diff > 0 ? Math.ceil(diff / 1000) : 0;
  }, [playerCompany.lastCompetitiveTacticAt, nowTick]);

  const inspectedCompany = useMemo(() => {
    return companies.find((c) => c.id === inspectedCompanyId) || playerCompany;
  }, [companies, inspectedCompanyId, playerCompany]);

  const companyPerfumes = useMemo(() => {
    const list = perfumes.filter(
      (p) =>
        p.companyId === inspectedCompany.id ||
        p.producerCompanyId === inspectedCompany.id ||
        (inspectedCompany.productStorage[p.id]?.quantity || 0) > 0
    );
    return list.length > 0 ? list : perfumes.slice(0, 6);
  }, [perfumes, inspectedCompany]);

  const activePerfumeForQuickAd = useMemo(() => {
    return (
      companyPerfumes.find((p) => p.id === quickAdPerfumeId) ||
      companyPerfumes[0] ||
      perfumes[0]
    );
  }, [companyPerfumes, quickAdPerfumeId, perfumes]);

  const adSpecialist = useMemo(() => getCompanyAdSpecialist(inspectedCompany), [inspectedCompany]);
  const salesRep = useMemo(() => getCompanySalesRep(inspectedCompany), [inspectedCompany]);
  const inspectedPerfumer = useMemo(
    () => getPerfumerById(inspectedCompany.perfumerId),
    [inspectedCompany.perfumerId]
  );
  const synergyCountries = useMemo(
    () => getCompanySynergyCountries(inspectedCompany),
    [inspectedCompany]
  );

  // Build detailed breakdown for each of the 9 countries
  const countryRows = useMemo(() => {
    const now = Date.now();
    const countryMap =
      inspectedCompany.countryBonuses ||
      COMPANY_DEFAULT_COUNTRY_BONUSES[inspectedCompany.id] ||
      {};
    const activeAds = (inspectedCompany.activeCampaigns || []).filter((c) => c.expiresAt > now);

    return GLOBAL_MARKET_COUNTRIES.map((country) => {
      const cName = country.name;
      const permBonusPct = Math.round((countryMap[cName] || 0) * 100);
      const activeAd = activeAds.find((a) => normalizeCountryName(a.targetCountry) === cName);
      const activeAdBonusPct = activeAd ? Math.round(activeAd.countryBonusRate * 100) : 0;

      const syn = getCountrySynergyDetails(inspectedCompany, cName);
      const adSpecBonusPct = Math.round(syn.adSpecialistCountryBonusRate * 100); // +%8
      const salesRepBonusPct = Math.round(syn.salesRepCountryBonusRate * 100); // +%10
      const synergySalesBonusPct = Math.round(syn.synergySalesPowerBonusRate * 100); // +%15..+%24
      const persuasionBasePct = Math.round((salesRep.persuasion || 55) * 0.28);

      const exclusiveExpiresAt = inspectedCompany.exclusiveCountryDeals?.[cName] || 0;
      const exclusiveRemainingSec =
        exclusiveExpiresAt > nowTick ? Math.ceil((exclusiveExpiresAt - nowTick) / 1000) : 0;
      const exclusiveBonusPct = exclusiveRemainingSec > 0 ? 8 : 0;

      const penaltyExpiresAt = inspectedCompany.countryPenalties?.[cName] || 0;
      const penaltyRemainingSec =
        penaltyExpiresAt > nowTick ? Math.ceil((penaltyExpiresAt - nowTick) / 1000) : 0;
      const penaltyPct = penaltyRemainingSec > 0 ? -6 : 0;

      // Perfumer Random 3 Family Bonus overlap with this Country's Random 3 Family Bonuses
      const countryFamilies = country.bonusFamilies || ['Narenciye', 'Çiçeksi', 'Odunsu'];
      const perfumerFamilies = inspectedPerfumer.bonusFamilies || ['Narenciye', 'Çiçeksi', 'Odunsu'];
      const perfumerMatchedFamilies = perfumerFamilies.filter((fam) =>
        countryFamilies.includes(fam)
      );
      const perfumerMaxFamilyBonusPct = perfumerMatchedFamilies.length * 8; // 1 Aile: +%8, 2 Aile: +%16, 3 Aile: +%24

      // Total country-specific bonus (excluding perfume fame & family bonus which depend on the perfume)
      const totalCountryPowerPct =
        permBonusPct +
        activeAdBonusPct +
        adSpecBonusPct +
        salesRepBonusPct +
        synergySalesBonusPct +
        persuasionBasePct +
        exclusiveBonusPct +
        penaltyPct;

      // With a popular perfume (+18%) + Country 3-Family Harmony (+30%) + Perfumer 3-Family Mastery (+24%)
      const maxWithPopularPerfumePct =
        totalCountryPowerPct + 18 + 30 + perfumerMaxFamilyBonusPct;

      // Perfumes naturally popular in this country
      const popularCompanyPerfumes = companyPerfumes.filter((p) =>
        isPerfumePopularInCountry(p, cName)
      );
      const popularAllPerfumes = perfumes
        .filter((p) => isPerfumePopularInCountry(p, cName))
        .sort((a, b) => getPerfumeFame(b) - getPerfumeFame(a));

      // All 4 companies' status in this country
      const allCompaniesInCountry = companies.map((comp) => {
        const compSyn = getCountrySynergyDetails(comp, cName);
        const cMap = comp.countryBonuses || COMPANY_DEFAULT_COUNTRY_BONUSES[comp.id] || {};
        const cPerm = Math.round((cMap[cName] || 0) * 100);
        const cAd = (comp.activeCampaigns || []).find(
          (a) => a.expiresAt > now && normalizeCountryName(a.targetCountry) === cName
        );
        const cAdPct = cAd ? Math.round(cAd.countryBonusRate * 100) : 0;
        const cTotal =
          cPerm +
          cAdPct +
          Math.round(compSyn.totalCountrySynergyRate * 100);
        return {
          companyId: comp.id,
          companyName: comp.name,
          companyLogo: comp.logo,
          isPlayer: comp.isPlayer,
          hasSynergy: compSyn.hasSynergy,
          isAdSpec: compSyn.isAdSpecialty,
          isSalesSpec: compSyn.isSalesSpecialty,
          permPct: cPerm,
          adPct: cAdPct,
          totalBonusPct: cTotal
        };
      });

      const richProfile = COUNTRY_RICH_PROFILES[cName] || {
        region: 'Küresel Lüks Parfüm Pazarı',
        purchasingPower: 'Yüksek',
        marketTrait: country.favoriteStyle,
        preferredBottleVolume: '35 – 85 Şişe',
        synergyTip: 'Reklamcı ve Satış Temsilcisi aynı ülkede eşleştiğinde ekstra sinerji verir.'
      };

      return {
        country,
        richProfile,
        permBonusPct,
        activeAd,
        activeAdBonusPct,
        syn,
        adSpecBonusPct,
        salesRepBonusPct,
        synergySalesBonusPct,
        persuasionBasePct,
        exclusiveRemainingSec,
        exclusiveBonusPct,
        penaltyRemainingSec,
        penaltyPct,
        countryFamilies,
        perfumerMatchedFamilies,
        perfumerMaxFamilyBonusPct,
        totalCountryPowerPct,
        maxWithPopularPerfumePct,
        popularCompanyPerfumes,
        popularAllPerfumes,
        allCompaniesInCountry
      };
    });
  }, [inspectedCompany, salesRep, inspectedPerfumer, companyPerfumes, perfumes, companies, nowTick]);

  // Active strategic effects across all companies (with live countdown)
  const activeStrategicEffects = useMemo(() => {
    const list: {
      id: string;
      countryName: string;
      flag: string;
      companyName: string;
      companyLogo: string;
      type: 'vip_showcase' | 'rival_pressure';
      label: string;
      remainingSec: number;
    }[] = [];

    for (const comp of companies) {
      if (comp.exclusiveCountryDeals) {
        for (const [cName, exp] of Object.entries(comp.exclusiveCountryDeals)) {
          if (exp > nowTick) {
            list.push({
              id: `vip_${comp.id}_${cName}`,
              countryName: cName,
              flag: getCountryFlag(cName),
              companyName: comp.name,
              companyLogo: comp.logo,
              type: 'vip_showcase',
              label: '🏛️ +%8 VIP Vitrin Avantajı',
              remainingSec: Math.ceil((exp - nowTick) / 1000)
            });
          }
        }
      }
      if (comp.countryPenalties) {
        for (const [cName, exp] of Object.entries(comp.countryPenalties)) {
          if (exp > nowTick) {
            list.push({
              id: `pen_${comp.id}_${cName}`,
              countryName: cName,
              flag: getCountryFlag(cName),
              companyName: comp.name,
              companyLogo: comp.logo,
              type: 'rival_pressure',
              label: '📰 -%6 Geçici Fiyat & Öncelik Baskısı',
              remainingSec: Math.ceil((exp - nowTick) / 1000)
            });
          }
        }
      }
    }
    return list;
  }, [companies, nowTick]);

  const visibleCountryRows = useMemo(() => {
    if (selectedCountryFilter === 'all') return countryRows;
    if (selectedCountryFilter === 'synergy') {
      return countryRows.filter((r) => r.syn.hasSynergy);
    }
    return countryRows.filter((r) => r.country.name === selectedCountryFilter);
  }, [countryRows, selectedCountryFilter]);

  return (
    <div className="space-y-7 pb-16">
      {/* HEADER BANNER */}
      <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Globe2 className="w-4 h-4" />
            Küresel Ülke Rehberi, Koku Karakteristikleri & Bonus Sistemi
          </div>
          <h2 className="text-xl lg:text-2xl font-bold font-serif text-white flex items-center gap-2.5 flex-wrap">
            <span>🌍 20 Ülkenin Özellikleri, Random 3 Aile Bonusları &amp; Tüm Satış/Reklam Sinerjileri</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
            Her ülkenin sevdiği parfüm notalarını, müşteri alım gücünü, <strong>Kalıcı Ülke Bonuslarını</strong>, <strong>📢 Reklamcı Uzmanlığını (+%8)</strong>, <strong>🎯 Satış Temsilcisi Uzmanlığını (+%10)</strong> ve ikisi aynı ülkede buluştuğunda devreye giren <strong>⚡ Ortak Ülke Reklam + Satış Gücü Sinerjisini</strong> tek ekranda inceleyin.
          </p>
        </div>

        {/* Company Selector to inspect any of the 4 companies */}
        <div className="flex flex-col sm:items-end gap-2 shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Bonusları İncelenen Şirket:
          </div>
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            {companies.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setInspectedCompanyId(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  inspectedCompany.id === c.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <span>{c.logo}</span>
                <span>{c.name}</span>
                {c.isPlayer && (
                  <span className="text-[9px] px-1 rounded bg-slate-950 text-amber-300 font-mono">
                    Siz
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ACTIVE COMPANY TEAM & SYNERGY OVERVIEW BAR */}
      <div className="bg-gradient-to-r from-amber-950/35 via-slate-900 to-emerald-950/35 border border-amber-500/40 rounded-3xl p-5 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
          <div className="lg:col-span-4 flex items-center gap-3.5 border-b lg:border-b-0 lg:border-r border-slate-800 pb-3 lg:pb-0 lg:pr-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0">
              {adSpecialist.avatar}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-amber-400">
                📢 {inspectedCompany.name} Reklamcısı (Reklam Yapar)
              </div>
              <div className="text-sm font-bold text-white">
                {adSpecialist.name} — Reklam Gücü: {adSpecialist.adPower}/100
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {adSpecialist.specialtyCountries.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-200 font-bold"
                  >
                    📢 {getCountryFlag(c)} {c} (+%8)
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex items-center gap-3.5 border-b lg:border-b-0 lg:border-r border-slate-800 pb-3 lg:pb-0 lg:pr-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-2xl shrink-0">
              {salesRep.avatar}
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-indigo-400">
                🗣️ {inspectedCompany.name} Satış Temsilcisi (Satış Yapar)
              </div>
              <div className="text-sm font-bold text-white">
                {salesRep.name} — İkna Gücü: {salesRep.persuasion}/100 (+%{Math.round(salesRep.persuasion * 0.28)})
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {salesRep.specialtyCountries.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-200 font-bold"
                  >
                    🎯 {getCountryFlag(c)} {c} (+%10)
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-1.5">
            <div className="text-[10px] font-bold uppercase text-emerald-300 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>⚡ Ortak Ülke Sinerjisi (Reklamcı + Temsilci Aynı Ülke):</span>
            </div>
            {synergyCountries.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {synergyCountries.map((cName) => {
                  const det = getCountrySynergyDetails(inspectedCompany, cName);
                  return (
                    <span
                      key={cName}
                      className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/60 text-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>⚡ {getCountryFlag(cName)} {cName}</span>
                      <span className="font-mono text-amber-300">
                        (+%{Math.round(det.totalCountrySynergyRate * 100)} Ekip Gücü)
                      </span>
                    </span>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">
                Ortak ülke yok. Reklamcı ve Temsilci kartlarından aynı ülkeye sahip uzmanları eşleştirin!
              </div>
            )}
            <div className="text-[10px] text-slate-400">
              Ortak ülkelerde <strong>Reklam Gücü +%35</strong> ve <strong>Satış Fiyatı +%{Math.round(((adSpecialist.adPower + salesRep.persuasion) / 2) * 0.25)}</strong> ekstra sinerji kazanır!
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 0.5: 🤝 DENGELİ STRATEJİK PAZAR & VİTRİN HAMLELERİ (30 DK BEKLEME SÜRELİ) */}
      <div className="bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">
              <Swords className="w-3.5 h-3.5" />
              Centilmence Rekabet &amp; Pazar Konumlandırma (5 Dk Etki • 30 Dakikada Bir)
            </div>
            <h3 className="text-base lg:text-lg font-bold font-serif text-white flex items-center gap-2 flex-wrap">
              <span>🤝 Stratejik Pazar &amp; Vitrin Hamleleri</span>
              {tacticCooldownRemainingSec > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs">
                  ⏳ Bekleme Süresi: {Math.floor(tacticCooldownRemainingSec / 60)} dk{' '}
                  {tacticCooldownRemainingSec % 60} sn
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs">
                  ✅ Hamle Hazır (30 Dk Limitli)
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 max-w-3xl">
              <strong>Geçici etkiler 5 dakika</strong> (VIP Vitrin +%8, Rakip Baskısı -%6), <strong>Kalıcı Ülke Bonusu (+%1/+%2) ve Şöhret (+1.5⭐) etkileri ise kalıcı</strong> olarak sürer. <strong>30 dakikada sadece 1 kez</strong> uygulanabilir.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowTacticsPanel((prev) => !prev)}
            className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all shrink-0 cursor-pointer"
          >
            {showTacticsPanel ? '▲ Strateji Panelini Gizle' : '▼ Stratejik Hamleleri Aç (4 Seçenek)'}
          </button>
        </div>

        {/* LIVE ACTIVE STRATEGIC EFFECTS TRACKER BAR */}
        {activeStrategicEffects.length > 0 && (
          <div className="bg-slate-950/90 border border-indigo-500/30 rounded-2xl p-3 space-y-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 flex items-center justify-between">
              <span>📡 Şu Anda Aktif Olan Geçici Stratejik Etkiler (5 Dakikalık Canlı Sayaç):</span>
              <span className="font-mono text-emerald-400">{activeStrategicEffects.length} Aktif Etki</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeStrategicEffects.map((eff) => (
                <div
                  key={eff.id}
                  className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 ${
                    eff.type === 'vip_showcase'
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-500/15 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <span className="font-bold">
                    {eff.flag} {eff.countryName} • {eff.companyLogo} {eff.companyName}:
                  </span>
                  <span>{eff.label}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-white font-bold">
                    ⏳ {Math.floor(eff.remainingSec / 60)}dk {eff.remainingSec % 60}sn
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showTacticsPanel && (
          <div className="pt-3 border-t border-slate-800 space-y-4">
            {/* Target Country & Target Rival Selectors */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 border border-slate-800 p-3 rounded-2xl">
              <div className="text-xs text-slate-300">
                Hedef ülkeyi ve rekabet edeceğiniz şirketi seçin (Her hamleden sonra <strong>30 dakika</strong> dinlenme süresi başlar, etki <strong>5 dakika</strong> sürer):
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    1. Hedef Ülke:
                  </label>
                  <select
                    value={tacticCountry}
                    onChange={(e) => setTacticCountry(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-bold text-white"
                  >
                    {GLOBAL_MARKET_COUNTRIES.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.flag} {c.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                    2. Rakip Şirket:
                  </label>
                  <select
                    value={tacticRivalId}
                    onChange={(e) => setTacticRivalId(e.target.value)}
                    className="bg-slate-900 border border-indigo-500/40 rounded-xl px-3 py-1.5 text-xs font-bold text-indigo-200"
                  >
                    {rivalCompanies.map((rc) => (
                      <option key={rc.id} value={rc.id}>
                        {rc.logo} {rc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 4 Balanced Tactic Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {COMPETITIVE_TACTICS.map((tactic) => {
                const isOnCooldown = tacticCooldownRemainingSec > 0;
                const canAfford = playerCompany.cash >= tactic.cost && !isOnCooldown;
                const targetRival =
                  companies.find((c) => c.id === tacticRivalId) || rivalCompanies[0];
                const isRivalPenalizedHere = Boolean(
                  targetRival?.countryPenalties &&
                    (targetRival.countryPenalties[tacticCountry] || 0) > nowTick
                );

                return (
                  <div
                    key={tactic.id}
                    className="bg-slate-950/90 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition-all"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold">
                          {tactic.badge}
                        </span>
                        <span className="font-mono text-xs font-bold text-amber-400">
                          {tactic.cost.toLocaleString('tr-TR')} ₺
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white">{tactic.title}</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {tactic.description}
                      </p>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-emerald-300 font-semibold leading-relaxed">
                        🎯 <strong>Dengeli Etki:</strong> {tactic.effectSummary}
                      </div>
                    </div>

                    <div className="pt-2 space-y-1.5">
                      {isRivalPenalizedHere && (
                        <div className="text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1 flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>
                            {getCountryFlag(tacticCountry)} {tacticCountry} pazarında geçici vitrin üstünlüğünüz aktif.
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        disabled={!canAfford || !targetRival}
                        onClick={() => {
                          if (targetRival) {
                            executeCompetitiveTactic(tactic.id, tacticCountry, targetRival.id);
                          }
                        }}
                        className={`w-full py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          canAfford
                            ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
                            : 'bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        {isOnCooldown ? (
                          <span>
                            ⏳ Bekleme Süresi ({Math.floor(tacticCooldownRemainingSec / 60)}dk{' '}
                            {tacticCooldownRemainingSec % 60}sn)
                          </span>
                        ) : (
                          <>
                            <Swords className="w-3.5 h-3.5" />
                            <span>
                              {getCountryFlag(tacticCountry)} {tacticCountry} Hamlesi Uygula
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 1: 9 ÜLKE TOPLU BONUS VE ÖZELLİK KARŞILAŞTIRMA TABLOSU */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>20 Ülkenin Random 3 Koku Ailesi Bonusları &amp; {inspectedCompany.name} Karşılaştırma Tablosu</span>
            </h3>
            <p className="text-xs text-slate-400">
              Her ülke 10 ana koku ailesinden <strong>Random 3 Aile Bonusu (1 Aile: +%10 • 2 Aile: +%20 • 3 Aile: +%30)</strong> verir:
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={rerollCountryFamilies}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
            >
              🎲 20 Ülkeye Yeni Random 3 Aile Ata
            </button>
            <button
              type="button"
              onClick={rerollPerfumerFamilies}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer shadow-md"
            >
              🎲 20 Parfümatöre Yeni 3 Aile Ata
            </button>
            <button
              type="button"
              onClick={rerollStaffBonuses}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md"
            >
              🎲 20 Reklamcı &amp; 20 Temsilci Bonusunu Karıştır
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse font-sans">
            <thead>
              <tr className="bg-slate-950/95 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800 font-mono">
                <th className="py-3.5 px-4">Ülke &amp; Pazar</th>
                <th className="py-3.5 px-3">🎡 Ülkenin Random 3 Aile Bonusu (+%10 / +%20 / +%30)</th>
                <th className="py-3.5 px-3 text-center">🧪 Parfümatör 3 Aile Uyumu</th>
                <th className="py-3.5 px-3 text-center">🌍 Kalıcı Ülke</th>
                <th className="py-3.5 px-3 text-center">📢 Aktif Reklam</th>
                <th className="py-3.5 px-3 text-center">📢 Reklamcı / 🎯 Temsilci</th>
                <th className="py-3.5 px-3 text-center">⚡ Ortak Sinerji</th>
                <th className="py-3.5 px-4 text-right">Toplam Satış Gücü</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {countryRows.map((row) => (
                <tr
                  key={row.country.id}
                  className={`transition-colors ${
                    row.syn.hasSynergy
                      ? 'bg-emerald-950/15 hover:bg-emerald-950/30'
                      : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{row.country.flag}</span>
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                          <span>{row.country.fullName}</span>
                          {row.syn.hasSynergy && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-slate-950 font-mono text-[9px] font-black">
                              ⚡ SİNERJİ
                            </span>
                          )}
                          {row.exclusiveRemainingSec > 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/30 border border-indigo-400/50 text-indigo-200 font-mono text-[9px] font-bold">
                              🏛️ +%8 VİTRİN ({row.exclusiveRemainingSec}s)
                            </span>
                          )}
                          {row.penaltyRemainingSec > 0 && (
                            <span className="px-1.5 py-0.2 rounded bg-rose-500/25 border border-rose-400/50 text-rose-200 font-mono text-[9px] font-bold">
                              📰 -%6 BASKI ({row.penaltyRemainingSec}s)
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">{row.richProfile.region}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1.5 mb-1">
                      {row.countryFamilies.map((fam) => {
                        const meta = getFamilyMeta(fam);
                        const isPerfumerMatch = row.perfumerMatchedFamilies.includes(fam);
                        return (
                          <span
                            key={fam}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] border font-bold ${
                              isPerfumerMatch
                                ? 'bg-purple-500/25 border-purple-400 text-purple-100 ring-1 ring-purple-400/40'
                                : meta.badgeClass
                            }`}
                          >
                            <span>{meta.emoji}</span>
                            <span>{meta.name}</span>
                            <span className="font-mono opacity-90">+%10</span>
                          </span>
                        );
                      })}
                    </div>
                    <div className="text-[9px] text-emerald-400 font-mono font-bold">
                      🎡 1 Aile: +%10 • 2 Aile: +%20 • 3 Aile: +%30 Ekstra Fiyat
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center font-mono">
                    {row.perfumerMatchedFamilies.length > 0 ? (
                      <div className="space-y-0.5">
                        <span className="inline-block px-2 py-0.5 rounded-lg font-bold text-[10px] border bg-purple-500/20 border-purple-400/60 text-purple-200">
                          🧪 +%{row.perfumerMaxFamilyBonusPct} Aile Farkı
                        </span>
                        <div className="text-[9px] text-slate-400">
                          {inspectedPerfumer.name} ({row.perfumerMatchedFamilies.length}/3 ortak aile)
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-500 text-[10px]">Ortak Aile Yok</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center font-mono">
                    {row.permBonusPct > 0 ? (
                      <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                        +%{row.permBonusPct}
                      </span>
                    ) : (
                      <span className="text-slate-600">%0</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center font-mono">
                    {row.activeAdBonusPct > 0 ? (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold">
                        📢 +%{row.activeAdBonusPct}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center font-mono">
                    <div className="flex flex-col items-center gap-1">
                      {row.syn.isAdSpecialty && (
                        <span className="px-2 py-0.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[10px]">
                          📢 +%{row.adSpecBonusPct}
                        </span>
                      )}
                      {row.syn.isSalesSpecialty && (
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold text-[10px]">
                          🎯 +%{row.salesRepBonusPct}
                        </span>
                      )}
                      {!row.syn.isAdSpecialty && !row.syn.isSalesSpecialty && (
                        <span className="text-slate-600">—</span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center font-mono">
                    {row.syn.hasSynergy ? (
                      <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/25 to-emerald-500/25 border border-emerald-400/60 text-emerald-300 font-black">
                        ⚡ +%{row.synergySalesBonusPct}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-[10px]">Eşleşme Yok</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right font-mono">
                    <div className="font-bold text-emerald-400 text-xs">
                      +%{row.totalCountryPowerPct} Baz Bonus
                    </div>
                    <div className="text-[10px] text-rose-300">
                      🔥 Popüler Parfümle: +%{row.maxWithPopularPerfumePct}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: FILTER & DETAILED 9 COUNTRY CARDS */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h3 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <span>Ülkelerin Detaylı Koku Karakteristikleri, VIP Alıcıları & Bonus Kartları</span>
            </h3>
            <p className="text-xs text-slate-400">
              Her ülkenin sevdiği esans notalarını, o ülkede popüler olan parfümlerinizi ve 4 şirketin ülke rekabetini inceleyin:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => setSelectedCountryFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCountryFilter === 'all'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌐 Tüm Ülkeler ({GLOBAL_MARKET_COUNTRIES.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCountryFilter('synergy')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedCountryFilter === 'synergy'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-emerald-300 hover:bg-slate-800'
              }`}
            >
              ⚡ Sinerji Ülkeleriniz ({synergyCountries.length})
            </button>
            {GLOBAL_MARKET_COUNTRIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCountryFilter(c.name)}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  selectedCountryFilter === c.name
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{c.flag}</span>
                <span>{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detailed Country Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {visibleCountryRows.map((row) => {
            const { country, richProfile, syn } = row;
            const isQuickAdOpen = quickAdCountry === country.name;

            return (
              <div
                key={country.id}
                className={`rounded-3xl border p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all ${
                  syn.hasSynergy
                    ? 'bg-gradient-to-b from-emerald-950/30 via-slate-900 to-slate-950 border-emerald-500/50 ring-1 ring-emerald-500/20'
                    : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Header */}
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3.5">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl p-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                        {country.flag}
                      </span>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-base font-bold text-white">{country.fullName}</h4>
                          {syn.hasSynergy && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono text-[9px] font-black">
                              ⚡ REKLAM+SATIŞ SİNERJİSİ
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] font-semibold text-amber-300 mt-0.5">
                          {country.favoriteStyle}
                        </div>
                        <div className="text-[10px] text-slate-400">{richProfile.region}</div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">
                        Toplam Güç
                      </span>
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-black mt-0.5">
                        +%{row.totalCountryPowerPct}
                      </span>
                    </div>
                  </div>

                  {/* Country Market Trait & Purchasing Power */}
                  <div className="bg-slate-950/90 border border-slate-800/90 rounded-2xl p-3 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Alım Gücü:</span>
                      <span className="font-bold text-amber-300">{richProfile.purchasingPower}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Sipariş Hacmi:</span>
                      <span className="font-mono font-bold text-indigo-300">
                        {richProfile.preferredBottleVolume}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed pt-1 border-t border-slate-800/80">
                      {richProfile.marketTrait}
                    </p>
                  </div>

                  {/* Complete Bonus Breakdown Box */}
                  <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-3.5 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center justify-between">
                      <span>💰 {inspectedCompany.name} — {country.name} Bonus Dökümü</span>
                      <span className="font-mono text-emerald-400">
                        Popülerle: +%{row.maxWithPopularPerfumePct}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">🌍 Kalıcı Ülke:</span>
                        <span className="font-mono font-bold text-emerald-400">
                          +%{row.permBonusPct}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">📢 Aktif Reklam:</span>
                        <span className="font-mono font-bold text-amber-300">
                          +%{row.activeAdBonusPct}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">📢 Reklamcı Uzm.:</span>
                        <span className="font-mono font-bold text-amber-300">
                          {syn.isAdSpecialty ? `+%${row.adSpecBonusPct}` : '%0'}
                        </span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="text-slate-400">🎯 Temsilci Uzm.:</span>
                        <span className="font-mono font-bold text-indigo-300">
                          {syn.isSalesSpecialty ? `+%${row.salesRepBonusPct}` : '%0'}
                        </span>
                      </div>
                    </div>

                    {/* Ortak Ülke Sinerjisi Satırı */}
                    <div
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        syn.hasSynergy
                          ? 'bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border-emerald-400/50 text-white'
                          : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Zap
                          className={`w-4 h-4 shrink-0 ${
                            syn.hasSynergy ? 'text-amber-300' : 'text-slate-600'
                          }`}
                        />
                        <div>
                          <div className="font-bold text-[11px]">
                            ⚡ Reklamcı + Satış Temsilcisi Ortak Ülke Sinerjisi
                          </div>
                          <div className="text-[10px] opacity-80">
                            {syn.hasSynergy
                              ? `${adSpecialist.name} & ${salesRep.name} bu ülkede eşleşiyor!`
                              : 'Eşleşme yok (İkisinde aynı ülke olduğunda açılır)'}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`font-mono font-black text-xs shrink-0 ${
                          syn.hasSynergy ? 'text-emerald-300' : 'text-slate-600'
                        }`}
                      >
                        {syn.hasSynergy ? `+%${row.synergySalesBonusPct} Satış & +%35 Reklam` : 'Pasif'}
                      </span>
                    </div>
                  </div>

                  {/* Country Random 3 Family Bonuses */}
                  <div>
                    <div className="text-[10px] font-bold uppercase text-amber-300 mb-1.5 flex items-center justify-between">
                      <span>🎡 Bu Ülkenin Random 3 Koku Ailesi Bonusu (+%10 / +%20 / +%30):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {row.countryFamilies.map((fam) => {
                        const meta = getFamilyMeta(fam);
                        const isPerfumerMatch = row.perfumerMatchedFamilies.includes(fam);
                        return (
                          <div
                            key={fam}
                            className={`px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold ${
                              isPerfumerMatch
                                ? 'bg-purple-500/25 border-purple-400 text-purple-100'
                                : meta.badgeClass
                            }`}
                          >
                            <span className="text-sm">{meta.emoji}</span>
                            <span>{meta.name}</span>
                            <span className="font-mono text-[10px] opacity-90">+%10</span>
                            {isPerfumerMatch && (
                              <span className="text-[9px] px-1 rounded bg-purple-400 text-slate-950 font-black">
                                🧪 USTA ORTAK
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Popular Perfumes in this Country */}
                  <div>
                    <div className="text-[10px] font-bold uppercase text-rose-300 mb-1.5 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-rose-400" />
                      <span>Bu Ülkede En Popüler Parfümler (+%18 Fiyat & Hacim Bonusu):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {row.popularAllPerfumes.slice(0, 5).map((p) => {
                        const isOwned =
                          p.companyId === inspectedCompany.id ||
                          p.producerCompanyId === inspectedCompany.id;
                        return (
                          <span
                            key={p.id}
                            className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 ${
                              isOwned
                                ? 'bg-rose-500/20 border-rose-400/50 text-white'
                                : 'bg-slate-950 border-slate-800 text-slate-300'
                            }`}
                          >
                            <span>🔥 {p.name}</span>
                            <span className="text-amber-300 font-mono">⭐{getPerfumeFame(p)}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* VIP Buyers & Luxury Boutiques in this Country */}
                  <div>
                    <div className="text-[10px] font-bold uppercase text-indigo-300 mb-1">
                      🏛️ Ülkedeki VIP Alıcılar & Lüks Mağaza Zincirleri:
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {country.vipClientNames.map((client) => (
                        <span
                          key={client}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800/80 text-slate-300"
                        >
                          • {client}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 4 Companies Competition Mini Bar */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                      🏆 4 Şirketin {country.name} Ülke Bonusu & Sinerji Rekabeti:
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {row.allCompaniesInCountry.map((compSt) => (
                        <div
                          key={compSt.companyId}
                          className={`px-2.5 py-1.5 rounded-xl border flex items-center justify-between text-[11px] ${
                            compSt.hasSynergy
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-1 truncate">
                            <span>{compSt.companyLogo}</span>
                            <span className="font-bold truncate">{compSt.companyName}</span>
                            {compSt.hasSynergy && (
                              <span title="Ortak Ülke Sinerjisi Aktif" className="text-[10px]">
                                ⚡
                              </span>
                            )}
                          </div>
                          <span className="font-mono font-bold text-amber-300 shrink-0">
                            +%{compSt.totalBonusPct}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Launch Ad Campaign in this Country */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  {!isQuickAdOpen ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuickAdCountry(country.name);
                        if (!quickAdPerfumeId && companyPerfumes[0]) {
                          setQuickAdPerfumeId(companyPerfumes[0].id);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500 hover:to-orange-500 text-amber-300 hover:text-slate-950 border border-amber-500/40 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Megaphone className="w-3.5 h-3.5" />
                      <span>
                        📢 Reklamcı {getCompanyAdSpecialist(playerCompany).name} ile {country.name}'da Reklam Yap
                      </span>
                    </button>
                  ) : (
                    <div className="bg-slate-950 border border-amber-500/50 rounded-2xl p-3 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-300">
                          📢 {country.flag} {country.name} Hızlı Reklam Başlat
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuickAdCountry(null)}
                          className="text-xs text-slate-400 hover:text-white cursor-pointer"
                        >
                          ✕ Kapat
                        </button>
                      </div>

                      <select
                        value={activePerfumeForQuickAd?.id || ''}
                        onChange={(e) => setQuickAdPerfumeId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white font-semibold"
                      >
                        {companyPerfumes.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (⭐ Şöhret: {getPerfumeFame(p)}/100)
                          </option>
                        ))}
                      </select>

                      <div className="grid grid-cols-3 gap-1.5">
                        {AD_CAMPAIGN_PACKAGES.map((pkg) => {
                          const calc = calculateAdCampaignPower(playerCompany, country.name, pkg);
                          const canAfford = playerCompany.cash >= pkg.cost;
                          return (
                            <button
                              key={pkg.tier}
                              type="button"
                              disabled={!canAfford || !activePerfumeForQuickAd}
                              onClick={() => {
                                if (activePerfumeForQuickAd) {
                                  launchAdCampaign(
                                    activePerfumeForQuickAd.id,
                                    country.name,
                                    pkg.tier
                                  );
                                  setQuickAdCountry(null);
                                }
                              }}
                              className={`p-2 rounded-xl border text-left transition-all cursor-pointer ${
                                canAfford
                                  ? 'bg-slate-900 hover:bg-amber-500/20 border-amber-500/40 text-white'
                                  : 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <div className="text-[10px] font-bold text-amber-300 truncate">
                                {pkg.badge}
                              </div>
                              <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                                +{calc.effectiveFameBoost}⭐ • +%{Math.round(calc.effectiveCountryBonusRate * 100)}
                              </div>
                              <div className="text-[10px] font-mono font-bold text-rose-300 mt-0.5">
                                {(pkg.cost / 1000).toFixed(0)}B ₺
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
