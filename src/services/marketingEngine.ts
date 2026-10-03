import { AdCampaign, AdSpecialist, Company, MarketOrder, OlfactoryFamilyGroup, Perfume, Perfumer, SalesRep } from '../types';
import { getPerfumerById } from '../data/perfumers';
import { pickRandom3Families, format3FamiliesLabel, getPerfumeFamilies } from '../data/rawMaterials';

export interface MarketCountryInfo {
  id: string;
  name: string;
  fullName: string;
  flag: string;
  bonusFamilies: OlfactoryFamilyGroup[]; // Random 3 Aile Bonusu (10 Aileden 3'ü)
  favoriteNotes: string[]; // Legacy compatibility (empty)
  favoriteStyle: string;
  vipClientNames: string[];
}

const COUNTRY_3_FAMILIES_STORAGE_KEY = 'parfum_borsasi_country_3_families_v2';

const ALL_20_COUNTRY_IDS = [
  'fransa', 'bae', 'abd', 'ingiltere', 'italya',
  'katar', 'japonya', 'almanya', 'isvicre', 'suudi_arabistan',
  'ispanya', 'guney_kore', 'cin', 'rusya', 'kanada',
  'brezilya', 'avustralya', 'singapur', 'kuveyt', 'turkiye'
];

function loadOrGenerateCountry3Families(): Record<string, OlfactoryFamilyGroup[]> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(COUNTRY_3_FAMILIES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          let updated = false;
          for (const cid of ALL_20_COUNTRY_IDS) {
            if (!Array.isArray(parsed[cid]) || parsed[cid].length !== 3) {
              parsed[cid] = pickRandom3Families();
              updated = true;
            }
          }
          if (updated) {
            window.localStorage.setItem(COUNTRY_3_FAMILIES_STORAGE_KEY, JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    }
  } catch (e) {
    // ignore storage errors
  }

  const generated: Record<string, OlfactoryFamilyGroup[]> = {};
  for (const cid of ALL_20_COUNTRY_IDS) {
    generated[cid] = pickRandom3Families();
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(COUNTRY_3_FAMILIES_STORAGE_KEY, JSON.stringify(generated));
    }
  } catch (e) {
    // ignore
  }
  return generated;
}

const initialCountryFamiliesMap = loadOrGenerateCountry3Families();

export const GLOBAL_MARKET_COUNTRIES: MarketCountryInfo[] = [
  // 1
  {
    id: 'fransa',
    name: 'Fransa',
    fullName: 'Fransa (Paris)',
    flag: '🇫🇷',
    bonusFamilies: initialCountryFamiliesMap.fransa || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.fransa),
    vipClientNames: ['Galeries Lafayette Haussmann', 'Champs-Élysées Maison de Parfum', 'Riviera Grand Parfumerie']
  },
  // 2
  {
    id: 'bae',
    name: 'Birleşik Arap Emirlikleri',
    fullName: 'Birleşik Arap Emirlikleri (Dubai)',
    flag: '🇦🇪',
    bonusFamilies: initialCountryFamiliesMap.bae || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.bae),
    vipClientNames: ['Dubai Mall Royal Fragrance Pavilion', 'Burj Al Arab VIP Boutique', 'Emirates Palace Scents']
  },
  // 3
  {
    id: 'abd',
    name: 'ABD',
    fullName: 'ABD (New York)',
    flag: '🇺🇸',
    bonusFamilies: initialCountryFamiliesMap.abd || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.abd),
    vipClientNames: ['Saks Fifth Avenue Luxury Retail', "Bloomingdale's 59th Street", 'Beverly Hills Rodeo Privé']
  },
  // 4
  {
    id: 'ingiltere',
    name: 'Birleşik Krallık',
    fullName: 'Birleşik Krallık (Londra)',
    flag: '🇬🇧',
    bonusFamilies: initialCountryFamiliesMap.ingiltere || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.ingiltere),
    vipClientNames: ['Harrods Knightsbridge Luxury Salon', 'Mayfair Prestige Fragrance Club', 'Selfridges Bond Street']
  },
  // 5
  {
    id: 'italya',
    name: 'İtalya',
    fullName: 'İtalya (Milano)',
    flag: '🇮🇹',
    bonusFamilies: initialCountryFamiliesMap.italya || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.italya),
    vipClientNames: ['Via Montenapoleone Luxury Hub', 'Milano Duomo Galleria', 'Roma Piazza di Spagna Atelier']
  },
  // 6
  {
    id: 'katar',
    name: 'Katar',
    fullName: 'Katar (Doha)',
    flag: '🇶🇦',
    bonusFamilies: initialCountryFamiliesMap.katar || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.katar),
    vipClientNames: ['The Pearl Qatar Royal Fragrances', 'Place Vendôme Doha Luxury', 'Al Hazm Imperial Scents']
  },
  // 7
  {
    id: 'japonya',
    name: 'Japonya',
    fullName: 'Japonya (Tokyo)',
    flag: '🇯🇵',
    bonusFamilies: initialCountryFamiliesMap.japonya || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.japonya),
    vipClientNames: ['Ginza Six Premium Fragrances', 'Isetan Shinjuku Salon de Parfum', 'Omotesando Niche Gallery']
  },
  // 8
  {
    id: 'almanya',
    name: 'Almanya',
    fullName: 'Almanya (Berlin)',
    flag: '🇩🇪',
    bonusFamilies: initialCountryFamiliesMap.almanya || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.almanya),
    vipClientNames: ['KaDeWe Berlin Department Store', 'Königsallee Düsseldorf Luxury', 'München Maximilian Boutique']
  },
  // 9
  {
    id: 'isvicre',
    name: 'İsviçre',
    fullName: 'İsviçre (Cenevre)',
    flag: '🇨🇭',
    bonusFamilies: initialCountryFamiliesMap.isvicre || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.isvicre),
    vipClientNames: ['Lake Geneva Duty Free Consortium', 'Zürich Bahnhofstrasse Privé', 'Gstaad Palace Fragrance']
  },
  // 10
  {
    id: 'suudi_arabistan',
    name: 'Suudi Arabistan',
    fullName: 'Suudi Arabistan (Riyad)',
    flag: '🇸🇦',
    bonusFamilies: initialCountryFamiliesMap.suudi_arabistan || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.suudi_arabistan),
    vipClientNames: ['Kingdom Centre Riyadh Royal Scents', 'Via Riyadh Ultra-Luxury Perfume Hall', 'Jeddah Red Sea Privé']
  },
  // 11
  {
    id: 'ispanya',
    name: 'İspanya',
    fullName: 'İspanya (Madrid)',
    flag: '🇪🇸',
    bonusFamilies: initialCountryFamiliesMap.ispanya || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.ispanya),
    vipClientNames: ['Salamanca Madrid Haute Parfumerie', 'Passeig de Gràcia Barcelona Atelier', 'Marbella Puerto Banús Luxury']
  },
  // 12
  {
    id: 'guney_kore',
    name: 'Güney Kore',
    fullName: 'Güney Kore (Seul)',
    flag: '🇰🇷',
    bonusFamilies: initialCountryFamiliesMap.guney_kore || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.guney_kore),
    vipClientNames: ['Cheongdam-dong Seoul Luxury Maison', 'Shinsegae Gangnam Prestige Hall', 'Hannam Niche Fragrance Lab']
  },
  // 13
  {
    id: 'cin',
    name: 'Çin',
    fullName: 'Çin (Şanghay)',
    flag: '🇨🇳',
    bonusFamilies: initialCountryFamiliesMap.cin || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.cin),
    vipClientNames: ['Plaza 66 Shanghai Luxury Pavilion', 'SKP Beijing Imperial Scents', 'The Bund Privé Collection']
  },
  // 14
  {
    id: 'rusya',
    name: 'Rusya',
    fullName: 'Rusya (Moskova)',
    flag: '🇷🇺',
    bonusFamilies: initialCountryFamiliesMap.rusya || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.rusya),
    vipClientNames: ['TSUM Moscow Haute Parfumerie', 'GUM Red Square Imperial Salon', 'Nevsky Palace St. Petersburg']
  },
  // 15
  {
    id: 'kanada',
    name: 'Kanada',
    fullName: 'Kanada (Toronto)',
    flag: '🇨🇦',
    bonusFamilies: initialCountryFamiliesMap.kanada || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.kanada),
    vipClientNames: ['Holt Renfrew Bloor Street Toronto', 'Yorkville Luxury Fragrance Gallery', 'Vancouver Alberni Privé']
  },
  // 16
  {
    id: 'brezilya',
    name: 'Brezilya',
    fullName: 'Brezilya (São Paulo)',
    flag: '🇧🇷',
    bonusFamilies: initialCountryFamiliesMap.brezilya || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.brezilya),
    vipClientNames: ['Shopping Cidade Jardim São Paulo', 'Iguatemi Jardins Luxury Salon', 'Ipanema Rio Prestige Scents']
  },
  // 17
  {
    id: 'avustralya',
    name: 'Avustralya',
    fullName: 'Avustralya (Sidney)',
    flag: '🇦🇺',
    bonusFamilies: initialCountryFamiliesMap.avustralya || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.avustralya),
    vipClientNames: ['Queen Victoria Building Sydney Privé', 'Collins Street Melbourne Maison', 'Double Bay Luxury Perfumes']
  },
  // 18
  {
    id: 'singapur',
    name: 'Singapur',
    fullName: 'Singapur (Marina Bay)',
    flag: '🇸🇬',
    bonusFamilies: initialCountryFamiliesMap.singapur || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.singapur),
    vipClientNames: ['Marina Bay Sands Royal Galleria', 'ION Orchard Haute Parfumerie', 'Raffles Arcade Niche Club']
  },
  // 19
  {
    id: 'kuveyt',
    name: 'Kuveyt',
    fullName: 'Kuveyt (Kuveyt)',
    flag: '🇰🇼',
    bonusFamilies: initialCountryFamiliesMap.kuveyt || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.kuveyt),
    vipClientNames: ['The Avenues Prestige Dome Kuwait', 'Al Hamra Luxury Fragrance Tower', 'Salhiya Royal Oud Boutique']
  },
  // 20
  {
    id: 'turkiye',
    name: 'Türkiye',
    fullName: 'Türkiye (İstanbul)',
    flag: '🇹🇷',
    bonusFamilies: initialCountryFamiliesMap.turkiye || pickRandom3Families(),
    favoriteNotes: [],
    favoriteStyle: format3FamiliesLabel(initialCountryFamiliesMap.turkiye),
    vipClientNames: ['Nişantaşı Abdi İpekçi Lüks Parfümeri', 'İstinyePark Prestige Maison', 'Boğaziçi Kraliyet Esans Sarayı']
  }
];

export function rerollAllCountries3Families(): void {
  const nextMap: Record<string, OlfactoryFamilyGroup[]> = {};
  for (const c of GLOBAL_MARKET_COUNTRIES) {
    const fams = pickRandom3Families();
    c.bonusFamilies = fams;
    c.favoriteStyle = format3FamiliesLabel(fams);
    nextMap[c.id] = fams;
  }
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(COUNTRY_3_FAMILIES_STORAGE_KEY, JSON.stringify(nextMap));
    }
  } catch (e) {
    // ignore
  }
}

export const COMPANY_DEFAULT_SALES_REPS: Record<string, SalesRep> = {
  // 1
  aromalux: {
    id: 'rep_cemre_soylu',
    name: 'Cemre Soylu',
    title: 'Avrupa Haute Parfumerie & Lüks Butikler Direktörü',
    avatar: '👩‍💼',
    persuasion: 58,
    level: 3,
    specialtyCountries: ['Fransa', 'İsviçre', 'Birleşik Krallık'],
    closedDeals: 4,
    bonusRevenueGenerated: 0
  },
  // 2
  scentora: {
    id: 'rep_tarik_mansur',
    name: 'Tarık El-Mansur',
    title: 'Körfez Sarayları & VIP Koleksiyonlar Direktörü',
    avatar: '🕴️',
    persuasion: 66,
    level: 4,
    specialtyCountries: ['Birleşik Arap Emirlikleri', 'Katar', 'Suudi Arabistan'],
    closedDeals: 6,
    bonusRevenueGenerated: 0
  },
  // 3
  parfuma: {
    id: 'rep_kaan_celik',
    name: 'Kaan Çelik',
    title: 'Kuzey Amerika & Küresel Zincir Mağazalar Direktörü',
    avatar: '👨‍💼',
    persuasion: 54,
    level: 2,
    specialtyCountries: ['ABD', 'Almanya', 'Kanada'],
    closedDeals: 5,
    bonusRevenueGenerated: 0
  },
  // 4
  aura_bella: {
    id: 'rep_leyla_benli',
    name: 'Leyla Benli',
    title: 'Milano-Tokyo Sanatsal Niş Dağıtım Direktörü',
    avatar: '🎩',
    persuasion: 62,
    level: 3,
    specialtyCountries: ['İtalya', 'Japonya', 'Fransa'],
    closedDeals: 5,
    bonusRevenueGenerated: 0
  }
};

export const TRANSFERABLE_SALES_REPS: (SalesRep & { hiringCost: number; bio: string })[] = [
  // 5
  {
    id: 'rep_victoria_laurent',
    name: 'Victoria Laurent',
    title: 'Eski Paris & Cenevre Kraliyet Müzakerecisi',
    avatar: '👑',
    persuasion: 78,
    level: 6,
    specialtyCountries: ['Fransa', 'İsviçre', 'İtalya'],
    closedDeals: 18,
    bonusRevenueGenerated: 0,
    hiringCost: 240000,
    bio: 'Paris ve Cenevre lüks moda evlerinde 12 yıl baş müzakereci olarak çalıştı. Avrupa siparişlerinde +%10 ülke uzmanlığı ve yüksek ikna primi sağlar.'
  },
  // 6
  {
    id: 'rep_zayd_al_rashid',
    name: 'Zayd Al-Rashid',
    title: 'Dubai, Doha & Riyad Ultra-VIP Saray Tedarikçisi',
    avatar: '🦅',
    persuasion: 82,
    level: 7,
    specialtyCountries: ['Birleşik Arap Emirlikleri', 'Katar', 'Suudi Arabistan'],
    closedDeals: 22,
    bonusRevenueGenerated: 0,
    hiringCost: 290000,
    bio: 'Körfez kraliyet aileleri ve özel salonlarıyla doğrudan bağlantılı. Orta Doğu pazarında rekor fiyata satış bağlar.'
  },
  // 7
  {
    id: 'rep_marcus_vance',
    name: 'Marcus Vance',
    title: 'Manhattan, Toronto & Tokyo Mega Departman Şefi',
    avatar: '🚀',
    persuasion: 75,
    level: 5,
    specialtyCountries: ['ABD', 'Kanada', 'Japonya'],
    closedDeals: 15,
    bonusRevenueGenerated: 0,
    hiringCost: 210000,
    bio: 'New York Saks Fifth, Toronto Holt Renfrew ve Tokyo Ginza zincirlerinde agresif büyüme uzmanı.'
  },
  // 8
  {
    id: 'rep_elena_rossi',
    name: 'Elena Rossi',
    title: 'Küresel Niş Parfümeri & Kırmızı Halı Elçisi',
    avatar: '💎',
    persuasion: 88,
    level: 8,
    specialtyCountries: ['İtalya', 'Fransa', 'ABD', 'Birleşik Arap Emirlikleri'],
    closedDeals: 30,
    bonusRevenueGenerated: 0,
    hiringCost: 420000,
    bio: 'Sektörün en yüksek ikna kabiliyetine sahip satış direktörlerinden biri. 4 ana pazarda +%10 ülke uzmanlığı sağlar.'
  },
  // 9
  {
    id: 'rep_jin_woo_kim',
    name: 'Jin-Woo Kim',
    title: 'Seul, Şanghay & Singapur Asya-Pasifik Lüks Direktörü',
    avatar: '🐉',
    persuasion: 80,
    level: 6,
    specialtyCountries: ['Güney Kore', 'Çin', 'Singapur'],
    closedDeals: 19,
    bonusRevenueGenerated: 0,
    hiringCost: 260000,
    bio: 'Asya-Pasifik mega alışveriş merkezlerinde lüks parfüm kontratlarını en yüksek kâr marjıyla bağlar.'
  },
  // 10
  {
    id: 'rep_aleksandr_orlov',
    name: 'Aleksandr Orlov',
    title: 'Moskova, Berlin & Londra İmparatorluk Galeri Direktörü',
    avatar: '🏛️',
    persuasion: 76,
    level: 5,
    specialtyCountries: ['Rusya', 'Almanya', 'Birleşik Krallık'],
    closedDeals: 16,
    bonusRevenueGenerated: 0,
    hiringCost: 215000,
    bio: 'TSUM Moskova, KaDeWe Berlin ve Harrods Londra VIP alım heyetleriyle özel anlaşmalar yürütür.'
  },
  // 11
  {
    id: 'rep_sofia_navarro',
    name: 'Sofía Navarro',
    title: 'Madrid, São Paulo & Milano Latin-Akdeniz Dağıtım Şefi',
    avatar: '🌹',
    persuasion: 74,
    level: 5,
    specialtyCountries: ['İspanya', 'Brezilya', 'İtalya'],
    closedDeals: 14,
    bonusRevenueGenerated: 0,
    hiringCost: 195000,
    bio: 'İspanya, Brezilya ve İtalya lüks parfümeri zincirlerinde yüksek hacimli ihracat kontratları uzmanlığına sahiptir.'
  },
  // 12
  {
    id: 'rep_faisal_al_sabah',
    name: 'Faisal Al-Sabah',
    title: 'Kuveyt, Riyad & Doha Körfez Konsorsiyum Başkanı',
    avatar: '🕌',
    persuasion: 85,
    level: 7,
    specialtyCountries: ['Kuveyt', 'Suudi Arabistan', 'Katar'],
    closedDeals: 25,
    bonusRevenueGenerated: 0,
    hiringCost: 330000,
    bio: 'Kuveyt, Suudi Arabistan ve Katar kraliyet koleksiyonerlerine özel yüksek fiyatlı parfüm satışı gerçekleştirir.'
  },
  // 13
  {
    id: 'rep_chloe_bouchard',
    name: 'Chloé Bouchard',
    title: 'Cenevre, Paris & Toronto Duty-Free Lüks Direktörü',
    avatar: '🦢',
    persuasion: 79,
    level: 6,
    specialtyCountries: ['İsviçre', 'Fransa', 'Kanada'],
    closedDeals: 17,
    bonusRevenueGenerated: 0,
    hiringCost: 245000,
    bio: 'Frankofon lüks pazarlarda ve İsviçre özel butiklerinde yüksek birim fiyat primi kazandırır.'
  },
  // 14
  {
    id: 'rep_li_wei_zhang',
    name: 'Li-Wei Zhang',
    title: 'Şanghay, Tokyo & Seul Doğu Asya VIP Distribütörü',
    avatar: '🏮',
    persuasion: 83,
    level: 7,
    specialtyCountries: ['Çin', 'Japonya', 'Güney Kore'],
    closedDeals: 23,
    bonusRevenueGenerated: 0,
    hiringCost: 305000,
    bio: 'Doğu Asya’nın 3 dev ekonomisinde lüks mağaza zincirlerine anında yüksek adetli satış yapar.'
  },
  // 15
  {
    id: 'rep_emre_karahan',
    name: 'Emre Karahan',
    title: 'İstanbul, Dubai & Bakü Avrasya Lüks Pazarlar Direktörü',
    avatar: '🦁',
    persuasion: 77,
    level: 6,
    specialtyCountries: ['Türkiye', 'Birleşik Arap Emirlikleri', 'Rusya'],
    closedDeals: 18,
    bonusRevenueGenerated: 0,
    hiringCost: 230000,
    bio: 'İstanbul Boğaziçi butikleri, Dubai ve Moskova lüks mağazaları arasında köprü kuran usta müzakereci.'
  },
  // 16
  {
    id: 'rep_lachlan_sinclair',
    name: 'Lachlan Sinclair',
    title: 'Sidney, Singapur & Londra Okyanusya-Kraliyet Şefi',
    avatar: '⚓',
    persuasion: 73,
    level: 5,
    specialtyCountries: ['Avustralya', 'Singapur', 'Birleşik Krallık'],
    closedDeals: 13,
    bonusRevenueGenerated: 0,
    hiringCost: 185000,
    bio: 'Avustralya, Singapur Marina Bay ve Londra Mayfair butiklerinde güçlü satış ağına sahiptir.'
  },
  // 17
  {
    id: 'rep_gabriela_costa',
    name: 'Gabriela Costa',
    title: 'São Paulo, New York & Madrid Amerika-İberya Elçisi',
    avatar: '🦋',
    persuasion: 81,
    level: 6,
    specialtyCountries: ['Brezilya', 'ABD', 'İspanya'],
    closedDeals: 20,
    bonusRevenueGenerated: 0,
    hiringCost: 270000,
    bio: 'Kuzey ve Güney Amerika ile İspanya pazarlarında yüksek ikna yüzdesiyle rekor ihracat anlaşmaları imzalar.'
  },
  // 18
  {
    id: 'rep_maximilian_voss',
    name: 'Maximilian Voss',
    title: 'Berlin, Cenevre & Moskova Orta Avrupa Ticaret Direktörü',
    avatar: '🦅',
    persuasion: 76,
    level: 5,
    specialtyCountries: ['Almanya', 'İsviçre', 'Rusya'],
    closedDeals: 16,
    bonusRevenueGenerated: 0,
    hiringCost: 220000,
    bio: 'Almanya, İsviçre ve Rusya lüks perakende gruplarında yüksek kârlı toptan ve VIP kontratlar bağlar.'
  },
  // 19
  {
    id: 'rep_amira_al_kuwaiti',
    name: 'Amira Al-Kuwaiti',
    title: 'Kuveyt, Katar & İstanbul Doğu Akdeniz-Körfez Elçisi',
    avatar: '🌙',
    persuasion: 84,
    level: 7,
    specialtyCountries: ['Kuveyt', 'Katar', 'Türkiye'],
    closedDeals: 24,
    bonusRevenueGenerated: 0,
    hiringCost: 315000,
    bio: 'Kuveyt, Doha ve İstanbul özel koleksiyonerlerine yapılan satışlarda yüksek fiyat farkı kazandırır.'
  },
  // 20
  {
    id: 'rep_jean_baptiste_roy',
    name: 'Jean-Baptiste Roy',
    title: 'Küresel 4 Kıta Ultra-Prestij Baş Satış İmparatoru',
    avatar: '🏆',
    persuasion: 91,
    level: 9,
    specialtyCountries: ['Fransa', 'ABD', 'Suudi Arabistan', 'Singapur'],
    closedDeals: 36,
    bonusRevenueGenerated: 0,
    hiringCost: 480000,
    bio: 'Sektörün zirvesindeki efsanevi baş satış direktörü. 91/100 ikna gücü ve 4 stratejik ülke uzmanlığıyla maksimum kâr sağlar.'
  }
];

export const COMPANY_DEFAULT_AD_SPECIALISTS: Record<string, AdSpecialist> = {
  // 1
  aromalux: {
    id: 'ad_bora_akin',
    name: 'Bora Akın',
    title: 'Paris & Cenevre Lüks Moda Medya ve Reklam Direktörü',
    avatar: '🎬',
    adPower: 60,
    level: 3,
    specialtyCountries: ['Fransa', 'İsviçre', 'İtalya'],
    campaignsLaunched: 3,
    totalFameGenerated: 8
  },
  // 2
  scentora: {
    id: 'ad_yasemin_alnoor',
    name: 'Yasemin Al-Noor',
    title: 'Dubai & Doha Kraliyet PR ve Küresel Tanıtım Direktörü',
    avatar: '🌟',
    adPower: 64,
    level: 4,
    specialtyCountries: ['Birleşik Arap Emirlikleri', 'Katar', 'Suudi Arabistan'],
    campaignsLaunched: 4,
    totalFameGenerated: 11
  },
  // 3
  parfuma: {
    id: 'ad_deniz_sozer',
    name: 'Deniz Sözer',
    title: 'New York & Berlin Dijital Kampanya ve Billboard Direktörü',
    avatar: '📢',
    adPower: 57,
    level: 2,
    specialtyCountries: ['ABD', 'Almanya', 'Kanada'],
    campaignsLaunched: 3,
    totalFameGenerated: 7
  },
  // 4
  aura_bella: {
    id: 'ad_sarp_vural',
    name: 'Sarp Vural',
    title: 'Milano & Tokyo Kreatif Sanat ve Lansman Direktörü',
    avatar: '🎨',
    adPower: 62,
    level: 3,
    specialtyCountries: ['İtalya', 'Japonya', 'Birleşik Krallık'],
    campaignsLaunched: 4,
    totalFameGenerated: 10
  }
};

export const TRANSFERABLE_AD_SPECIALISTS: (AdSpecialist & { hiringCost: number; bio: string })[] = [
  // 5
  {
    id: 'ad_chloe_moreau',
    name: 'Chloé Moreau',
    title: 'Eski Paris & Milano Haute Couture Kreatif Direktörü',
    avatar: '✨',
    adPower: 80,
    level: 6,
    specialtyCountries: ['Fransa', 'İtalya', 'İsviçre'],
    campaignsLaunched: 19,
    totalFameGenerated: 46,
    hiringCost: 220000,
    bio: 'Avrupa moda başkentlerinde viral parfüm lansmanlarının mimarı. Satış temsilcinizle aynı ülkede eşleştiğinde süper reklam ve satış sinerjisi üretir.'
  },
  // 6
  {
    id: 'ad_faris_almaktoum',
    name: 'Faris Al-Maktoum',
    title: 'Körfez Sarayları & Londra Ultra-Lüks Gala Stratejisti',
    avatar: '🦅',
    adPower: 84,
    level: 7,
    specialtyCountries: ['Birleşik Arap Emirlikleri', 'Katar', 'Suudi Arabistan'],
    campaignsLaunched: 24,
    totalFameGenerated: 58,
    hiringCost: 275000,
    bio: 'Dubai, Doha ve Riyad sosyetesinde düzenlediği lansman galalarıyla parfüm şöhretini ve ülke reklam gücünü zirveye taşır.'
  },
  // 7
  {
    id: 'ad_liam_sterling',
    name: 'Liam Sterling',
    title: 'Times Square, Toronto & Tokyo Mega-Medya Efsanesi',
    avatar: '🚀',
    adPower: 77,
    level: 5,
    specialtyCountries: ['ABD', 'Kanada', 'Japonya'],
    campaignsLaunched: 16,
    totalFameGenerated: 39,
    hiringCost: 195000,
    bio: 'ABD, Kanada ve Japonya metropollerinde dev ekran kampanyalarıyla tanınır. Eşleşen ülkelerde satış hacmini katlar.'
  },
  // 8
  {
    id: 'ad_sofia_lorenz',
    name: 'Sofia Lorenz',
    title: 'Küresel Kırmızı Halı & 4 Ülke Süper-Lansman İmparatoriçesi',
    avatar: '👑',
    adPower: 90,
    level: 8,
    specialtyCountries: ['Fransa', 'ABD', 'Birleşik Arap Emirlikleri', 'İtalya'],
    campaignsLaunched: 34,
    totalFameGenerated: 85,
    hiringCost: 390000,
    bio: 'Dünyanın en güçlü reklam direktörlerinden biri. 4 dev pazarda uzmanlığı sayesinde satış temsilcileriyle maksimum ülke sinerjisi yakalar.'
  },
  // 9
  {
    id: 'ad_min_ji_seo',
    name: 'Min-Ji Seo',
    title: 'Seul, Şanghay & Singapur K-Luxury Viral Medya Direktörü',
    avatar: '💫',
    adPower: 82,
    level: 6,
    specialtyCountries: ['Güney Kore', 'Çin', 'Singapur'],
    campaignsLaunched: 21,
    totalFameGenerated: 52,
    hiringCost: 255000,
    bio: 'Asya metropollerinde ünlü ikonlarla yürüttüğü kampanyalar sayesinde parfüm şöhretini rekor hızda büyütür.'
  },
  // 10
  {
    id: 'ad_dmitri_romanov',
    name: 'Dmitri Romanov',
    title: 'Moskova, Berlin & Londra Aristokrat Medya Stratejisti',
    avatar: '🎭',
    adPower: 76,
    level: 5,
    specialtyCountries: ['Rusya', 'Almanya', 'Birleşik Krallık'],
    campaignsLaunched: 15,
    totalFameGenerated: 37,
    hiringCost: 205000,
    bio: 'Rusya, Almanya ve İngiltere lüks dergi ve gala organizasyonlarında +%8 ülke reklam uzmanlığı sağlar.'
  },
  // 11
  {
    id: 'ad_valeria_ortega',
    name: 'Valeria Ortega',
    title: 'Madrid, São Paulo & Milano Moda Haftası PR Direktörü',
    avatar: '💃',
    adPower: 75,
    level: 5,
    specialtyCountries: ['İspanya', 'Brezilya', 'İtalya'],
    campaignsLaunched: 14,
    totalFameGenerated: 35,
    hiringCost: 190000,
    bio: 'İspanya, Brezilya ve İtalya televizyon ve moda bültenlerinde yüksek etkileşimli parfüm lansmanları yönetir.'
  },
  // 12
  {
    id: 'ad_nawaf_al_sabah',
    name: 'Nawaf Al-Sabah',
    title: 'Kuveyt, Riyad & Doha Kraliyet Gala Organizatörü',
    avatar: '💎',
    adPower: 86,
    level: 7,
    specialtyCountries: ['Kuveyt', 'Suudi Arabistan', 'Katar'],
    campaignsLaunched: 26,
    totalFameGenerated: 64,
    hiringCost: 325000,
    bio: 'Körfez ülkelerindeki VIP lansmanlarda en yüksek şöhret ve kalıcı ülke prestiji artışını kazandırır.'
  },
  // 13
  {
    id: 'ad_celine_vanderbilt',
    name: 'Céline Vanderbilt',
    title: 'Cenevre, Paris & Toronto Ultra-Prestij Marka Mimarı',
    avatar: '🦢',
    adPower: 79,
    level: 6,
    specialtyCountries: ['İsviçre', 'Fransa', 'Kanada'],
    campaignsLaunched: 18,
    totalFameGenerated: 44,
    hiringCost: 235000,
    bio: 'İsviçre, Fransa ve Kanada yüksek sosyetesine yönelik prestij kampanyalarında uzmanlaşmıştır.'
  },
  // 14
  {
    id: 'ad_hao_ran_liu',
    name: 'Hao-Ran Liu',
    title: 'Şanghay, Tokyo & Seul Dijital Lüks Ekosistem Şefi',
    avatar: '🏮',
    adPower: 83,
    level: 7,
    specialtyCountries: ['Çin', 'Japonya', 'Güney Kore'],
    campaignsLaunched: 23,
    totalFameGenerated: 56,
    hiringCost: 295000,
    bio: 'Çin, Japonya ve Güney Kore’de milyonlarca lüks tüketiciye ulaşan mega-billboard kampanyaları kurgular.'
  },
  // 15
  {
    id: 'ad_defne_saruhan',
    name: 'Defne Saruhan',
    title: 'İstanbul, Dubai & Moskova Boğaziçi-Körfez PR Direktörü',
    avatar: '🌟',
    adPower: 78,
    level: 6,
    specialtyCountries: ['Türkiye', 'Birleşik Arap Emirlikleri', 'Rusya'],
    campaignsLaunched: 18,
    totalFameGenerated: 43,
    hiringCost: 225000,
    bio: 'İstanbul saray galaları, Dubai ve Moskova lüks etkinliklerinde güçlü reklam ve satış sinerjisi oluşturur.'
  },
  // 16
  {
    id: 'ad_sienna_montgomery',
    name: 'Sienna Montgomery',
    title: 'Sidney, Singapur & Londra Kraliyet Cemiyeti PR Şefi',
    avatar: '🌊',
    adPower: 74,
    level: 5,
    specialtyCountries: ['Avustralya', 'Singapur', 'Birleşik Krallık'],
    campaignsLaunched: 14,
    totalFameGenerated: 33,
    hiringCost: 180000,
    bio: 'Avustralya, Singapur ve İngiltere lüks yaşam tarzı medyasında parfümlerinize prestij kazandırır.'
  },
  // 17
  {
    id: 'ad_lucas_moreira',
    name: 'Lucas Moreira',
    title: 'São Paulo, New York & Madrid Kreatif Kampanya Direktörü',
    avatar: '🔥',
    adPower: 81,
    level: 6,
    specialtyCountries: ['Brezilya', 'ABD', 'İspanya'],
    campaignsLaunched: 20,
    totalFameGenerated: 49,
    hiringCost: 265000,
    bio: 'Amerika kıtası ve İspanya pazarlarında parfüm bilinirliğini ve VIP sipariş akışını hızlandırır.'
  },
  // 18
  {
    id: 'ad_lukas_lindemann',
    name: 'Lukas Lindemann',
    title: 'Berlin, Cenevre & Moskova Kıta Avrupası Medya Direktörü',
    avatar: '🎬',
    adPower: 77,
    level: 5,
    specialtyCountries: ['Almanya', 'İsviçre', 'Rusya'],
    campaignsLaunched: 16,
    totalFameGenerated: 40,
    hiringCost: 210000,
    bio: 'Orta ve Doğu Avrupa lüks moda dergilerinde yüksek dönüşümlü reklam kampanyaları yönetir.'
  },
  // 19
  {
    id: 'ad_layla_al_thani',
    name: 'Layla Al-Thani',
    title: 'Kuveyt, Katar & İstanbul Saray davetleri Kreatif Elçisi',
    avatar: '🌙',
    adPower: 85,
    level: 7,
    specialtyCountries: ['Kuveyt', 'Katar', 'Türkiye'],
    campaignsLaunched: 25,
    totalFameGenerated: 61,
    hiringCost: 310000,
    bio: 'Kuveyt, Katar ve Türkiye pazarlarında yaptığı her tanıtımla yüksek şöhret ve ülke bonusu kazandırır.'
  },
  // 20
  {
    id: 'ad_alessandro_visconti',
    name: 'Alessandro Visconti',
    title: 'Küresel 4 Kıta Haute Parfumerie Baş Medya İmparatoru',
    avatar: '🏆',
    adPower: 92,
    level: 9,
    specialtyCountries: ['Fransa', 'ABD', 'Suudi Arabistan', 'Singapur'],
    campaignsLaunched: 38,
    totalFameGenerated: 95,
    hiringCost: 460000,
    bio: '92/100 Reklam Gücü ile sektörün zirvesindeki kreatif direktör. 4 dev ülkede maksimum reklam ve satış sinerjisi açar.'
  }
];

export const COMPANY_DEFAULT_COUNTRY_BONUSES: Record<string, Record<string, number>> = {
  aromalux: {},
  scentora: {},
  parfuma: {},
  aura_bella: {}
};

const STAFF_BONUSES_STORAGE_KEY = 'parfum_borsasi_staff_bonuses_v1';

export function pickRandom3CountryNames(guaranteedCountry?: string): string[] {
  const allNames = GLOBAL_MARKET_COUNTRIES.map((c) => c.name);
  const picked: string[] = [];
  if (guaranteedCountry && allNames.includes(guaranteedCountry)) {
    picked.push(guaranteedCountry);
  }
  const pool = allNames.filter((n) => !picked.includes(n));
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  while (picked.length < 3 && pool.length > 0) {
    picked.push(pool.pop()!);
  }
  return picked;
}

export function rerollAllStaffBonuses(): {
  salesRepsByCompany: Record<string, SalesRep>;
  adSpecialistsByCompany: Record<string, AdSpecialist>;
} {
  const companyIds = ['aromalux', 'scentora', 'parfuma', 'aura_bella'];
  const savedPayload: {
    companyReps: Record<string, { specialtyCountries: string[]; persuasion: number }>;
    companyAds: Record<string, { specialtyCountries: string[]; adPower: number }>;
    transferReps: Record<string, { specialtyCountries: string[]; persuasion: number }>;
    transferAds: Record<string, { specialtyCountries: string[]; adPower: number }>;
  } = {
    companyReps: {},
    companyAds: {},
    transferReps: {},
    transferAds: {}
  };

  for (const cid of companyIds) {
    const rep = COMPANY_DEFAULT_SALES_REPS[cid];
    const ad = COMPANY_DEFAULT_AD_SPECIALISTS[cid];
    if (rep && ad) {
      const repCountries = pickRandom3CountryNames();
      // Guarantee at least 1 shared country between company's default Ad Specialist & Sales Rep for active synergy
      const adCountries = pickRandom3CountryNames(repCountries[0]);
      const repPersuasion = 56 + Math.floor(Math.random() * 14); // 56 - 69
      const adPower = 58 + Math.floor(Math.random() * 14); // 58 - 71

      rep.specialtyCountries = repCountries;
      rep.persuasion = repPersuasion;
      ad.specialtyCountries = adCountries;
      ad.adPower = adPower;

      savedPayload.companyReps[cid] = { specialtyCountries: repCountries, persuasion: repPersuasion };
      savedPayload.companyAds[cid] = { specialtyCountries: adCountries, adPower };
    }
  }

  for (const tRep of TRANSFERABLE_SALES_REPS) {
    const countries = pickRandom3CountryNames();
    const persuasion = 72 + Math.floor(Math.random() * 20); // 72 - 91
    tRep.specialtyCountries = countries;
    tRep.persuasion = persuasion;
    tRep.hiringCost = Math.round((160000 + (persuasion - 70) * 14500) / 5000) * 5000;
    tRep.bio = `${countries.join(', ')} lüks parfümeri zincirlerinde yüksek hacimli ihracat kontratları bağlar. Satışlarda +%\${Math.round(persuasion * 0.28)} ikna primi ve uzman ülkelerde +%10 ülke bonusu kazandırır.`.replace(
      '\\${Math.round(persuasion * 0.28)}',
      String(Math.round(persuasion * 0.28))
    );
    savedPayload.transferReps[tRep.id] = { specialtyCountries: countries, persuasion };
  }

  for (const tAd of TRANSFERABLE_AD_SPECIALISTS) {
    const countries = pickRandom3CountryNames();
    const adPower = 73 + Math.floor(Math.random() * 20); // 73 - 92
    tAd.specialtyCountries = countries;
    tAd.adPower = adPower;
    tAd.hiringCost = Math.round((165000 + (adPower - 70) * 13500) / 5000) * 5000;
    tAd.bio = `${countries.join(', ')} pazarlarında viral lansman ve gala kampanyaları yönetir. Uzman ülkelerde +%8 reklam/satış bonusu ve temsilcinizle eşleştiğinde ⚡ +%35 Sinerji Gücü açar.`;
    savedPayload.transferAds[tAd.id] = { specialtyCountries: countries, adPower };
  }

  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(STAFF_BONUSES_STORAGE_KEY, JSON.stringify(savedPayload));
    }
  } catch (e) {
    // ignore
  }

  return {
    salesRepsByCompany: COMPANY_DEFAULT_SALES_REPS,
    adSpecialistsByCompany: COMPANY_DEFAULT_AD_SPECIALISTS
  };
}

// Initialize or restore staff randomized bonuses on module load
(function initStaffBonusesFromStorage() {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(STAFF_BONUSES_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.companyReps && parsed.transferReps) {
          for (const [cid, data] of Object.entries<any>(parsed.companyReps)) {
            if (COMPANY_DEFAULT_SALES_REPS[cid] && Array.isArray(data.specialtyCountries)) {
              COMPANY_DEFAULT_SALES_REPS[cid].specialtyCountries = data.specialtyCountries;
              if (typeof data.persuasion === 'number') {
                COMPANY_DEFAULT_SALES_REPS[cid].persuasion = data.persuasion;
              }
            }
          }
          for (const [cid, data] of Object.entries<any>(parsed.companyAds || {})) {
            if (COMPANY_DEFAULT_AD_SPECIALISTS[cid] && Array.isArray(data.specialtyCountries)) {
              COMPANY_DEFAULT_AD_SPECIALISTS[cid].specialtyCountries = data.specialtyCountries;
              if (typeof data.adPower === 'number') {
                COMPANY_DEFAULT_AD_SPECIALISTS[cid].adPower = data.adPower;
              }
            }
          }
          for (const tRep of TRANSFERABLE_SALES_REPS) {
            const d = parsed.transferReps[tRep.id];
            if (d && Array.isArray(d.specialtyCountries)) {
              tRep.specialtyCountries = d.specialtyCountries;
              if (typeof d.persuasion === 'number') tRep.persuasion = d.persuasion;
            }
          }
          for (const tAd of TRANSFERABLE_AD_SPECIALISTS) {
            const d = parsed.transferAds?.[tAd.id];
            if (d && Array.isArray(d.specialtyCountries)) {
              tAd.specialtyCountries = d.specialtyCountries;
              if (typeof d.adPower === 'number') tAd.adPower = d.adPower;
            }
          }
          return;
        }
      }
    }
  } catch (e) {
    // ignore
  }
})();

export interface AdCampaignPackage {
  tier: 'influencer' | 'billboard' | 'gala';
  title: string;
  subtitle: string;
  badge: string;
  cost: number;
  fameBoost: number;
  countryBonusRate: number;
  permanentCountryGain: number;
  durationMinutes: number;
  spawnsVipOrder: boolean;
}

export const AD_CAMPAIGN_PACKAGES: AdCampaignPackage[] = [
  {
    tier: 'influencer',
    title: 'Sosyal Medya & Fenomen Kampanyası',
    subtitle: 'Ülkenin en ünlü parfüm kritikleri ve moda fenomenleriyle viral tanıtım',
    badge: '📱 Dijital Viral',
    cost: 60000,
    fameBoost: 2,
    countryBonusRate: 0.12, // +%12 ülke satış primi
    permanentCountryGain: 0.01, // +%1 kalıcı ülke prestiji
    durationMinutes: 6,
    spawnsVipOrder: false
  },
  {
    tier: 'billboard',
    title: 'Metropol Billboard & Moda Dergisi Kapak',
    subtitle: 'Başkent meydanlarında dev ekranlar ve Vogue / GQ özel koku eki',
    badge: '🏙️ Prestij Medya',
    cost: 150000,
    fameBoost: 4,
    countryBonusRate: 0.22, // +%22 ülke satış primi
    permanentCountryGain: 0.02, // +%2 kalıcı ülke prestiji
    durationMinutes: 10,
    spawnsVipOrder: true
  },
  {
    tier: 'gala',
    title: 'Kraliyet & Kırmızı Halı Lansman Galası',
    subtitle: 'Ünlü yıldızlar, diplomatlar ve lüks mağaza zincirleriyle ultra-VIP lansman gecesi',
    badge: '👑 Ultra-VIP Gala',
    cost: 320000,
    fameBoost: 7,
    countryBonusRate: 0.35, // +%35 ülke satış primi
    permanentCountryGain: 0.03, // +%3 kalıcı ülke prestiji
    durationMinutes: 15,
    spawnsVipOrder: true
  }
];

/**
 * Normalize country string from order (e.g. "Fransa (Paris)" -> "Fransa")
 */
export function normalizeCountryName(rawCountry: string): string {
  if (!rawCountry) return 'Fransa';
  for (const c of GLOBAL_MARKET_COUNTRIES) {
    if (rawCountry.toLowerCase().includes(c.name.toLowerCase())) {
      return c.name;
    }
  }
  return rawCountry.split('(')[0].trim();
}

export function getCountryFlag(countryName: string): string {
  const norm = normalizeCountryName(countryName);
  const found = GLOBAL_MARKET_COUNTRIES.find((c) => c.name === norm);
  return found?.flag || '🌍';
}

/**
 * Compute a perfume's Fame (Şöhret: 0 - 100)
 * Starts low and grows gradually through sales & targeted advertising campaigns!
 */
export function getPerfumeFame(perfume: Perfume): number {
  if (typeof perfume.fame === 'number' && !isNaN(perfume.fame)) {
    return Math.min(100, Math.max(0, Math.round(perfume.fame * 10) / 10));
  }
  // Low, realistic starting fame so perfumes build up reputation slowly over time
  if (perfume.sourceType === 'ORİJİNAL') {
    return Math.min(20, Math.max(10, Math.round((perfume.quality || 80) * 0.18)));
  }
  if (perfume.sourceType === 'SECRET') {
    return 10;
  }
  // Brand new AR-GE invention starts with 4-8 fame and grows step by step
  return Math.min(8, Math.max(4, Math.round((perfume.quality || 70) * 0.08)));
}

/**
 * Determine the top 2-3 countries where a perfume is naturally most popular based on its notes!
 */
export function getPerfumePopularCountries(perfume: Perfume): string[] {
  if (perfume.popularCountries && perfume.popularCountries.length > 0) {
    return perfume.popularCountries;
  }

  const allNotes = [
    ...(perfume.topNotes || []),
    ...(perfume.middleNotes || []),
    ...(perfume.baseNotes || []),
    ...(perfume.notes || []),
    ...(perfume.recipe || []).map((r) => r.rawMaterialId)
  ];
  const perfumeFamilies = getPerfumeFamilies(allNotes);

  const scores = GLOBAL_MARKET_COUNTRIES.map((country) => {
    let score = 0;
    for (const fam of perfumeFamilies) {
      if ((country.bonusFamilies || []).includes(fam)) {
        score += 18;
      }
    }
    // Deterministic tie-breaker using perfume id hash
    let hash = 0;
    const str = `${perfume.id}_${country.id}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash * 31 + str.charCodeAt(i)) % 1000;
    }
    score += (hash % 9);
    return { countryName: country.name, score };
  });

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, 3).map((s) => s.countryName);
}

export function isPerfumePopularInCountry(perfume: Perfume, orderCountry: string): boolean {
  const normCountry = normalizeCountryName(orderCountry);
  const popCountries = getPerfumePopularCountries(perfume);
  return popCountries.includes(normCountry);
}

export function getCompanySalesRep(company: Company): SalesRep {
  return company.salesRep || COMPANY_DEFAULT_SALES_REPS[company.id] || COMPANY_DEFAULT_SALES_REPS.aromalux;
}

export function getCompanyAdSpecialist(company: Company): AdSpecialist {
  return (
    company.adSpecialist ||
    COMPANY_DEFAULT_AD_SPECIALISTS[company.id] ||
    COMPANY_DEFAULT_AD_SPECIALISTS.aromalux
  );
}

/**
 * Returns the list of countries where BOTH the company's Reklamcı (AdSpecialist)
 * AND Satış Temsilcisi (SalesRep) have country expertise!
 * In these matched countries, "Ortak Ülke Sinerjisi: Reklam Gücü + Satış Gücü" is unlocked!
 */
export function getCompanySynergyCountries(company: Company): string[] {
  const rep = getCompanySalesRep(company);
  const adSpec = getCompanyAdSpecialist(company);
  const repCountries = rep.specialtyCountries.map((c) => normalizeCountryName(c));
  const adCountries = adSpec.specialtyCountries.map((c) => normalizeCountryName(c));
  return adCountries.filter((c) => repCountries.includes(c));
}

export interface CountrySynergyDetails {
  countryName: string;
  isAdSpecialty: boolean;
  isSalesSpecialty: boolean;
  hasSynergy: boolean; // Reklamcı ve Satış Temsilcisinde aynı ülke var mı?
  adPowerScore: number;
  salesPowerScore: number;
  adSpecialistCountryBonusRate: number; // Reklamcının o ülkedeki uzmanlık bonusu (+%10)
  salesRepCountryBonusRate: number; // Satış Temsilcisinin o ülkedeki uzmanlık bonusu (+%10)
  synergyAdPowerBonusRate: number; // Ortak ülkede ekstra Reklam Gücü çarpanı (+%15 kampanya bonusu & +%50 şöhret)
  synergySalesPowerBonusRate: number; // Ortak ülkede ekstra Satış Gücü fiyat primi (+%16..+%24)
  totalCountrySynergyRate: number; // O ülkede Reklamcı + Temsilci + Sinerji toplam ülke gücü
}

export function getCountrySynergyDetails(company: Company, targetCountry: string): CountrySynergyDetails {
  const normCountry = normalizeCountryName(targetCountry);
  const rep = getCompanySalesRep(company);
  const adSpec = getCompanyAdSpecialist(company);

  const isSalesSpecialty = rep.specialtyCountries.some((c) => normalizeCountryName(c) === normCountry);
  const isAdSpecialty = adSpec.specialtyCountries.some((c) => normalizeCountryName(c) === normCountry);
  const hasSynergy = isSalesSpecialty && isAdSpecialty;

  const adPowerScore = adSpec.adPower || 60;
  const salesPowerScore = rep.persuasion || 58;

  const adSpecialistCountryBonusRate = isAdSpecialty ? 0.08 : 0;
  const salesRepCountryBonusRate = isSalesSpecialty ? 0.10 : 0;

  // Eğer Reklamcı ve Satış Temsilcisinde aynı ülke varsa: O ülkede ekstra Reklam Gücü + Satış Gücü doğar!
  const synergyAdPowerBonusRate = hasSynergy ? 0.15 : 0;
  const synergySalesPowerBonusRate = hasSynergy
    ? Math.round(((adPowerScore + salesPowerScore) / 2) * 0.25) / 100 // örn: 60+60 ort 60 * 0.25 = +%15 ekstra sinerji satış gücü!
    : 0;

  const totalCountrySynergyRate =
    Math.round(
      (adSpecialistCountryBonusRate +
        salesRepCountryBonusRate +
        synergySalesPowerBonusRate) *
        100
    ) / 100;

  return {
    countryName: normCountry,
    isAdSpecialty,
    isSalesSpecialty,
    hasSynergy,
    adPowerScore,
    salesPowerScore,
    adSpecialistCountryBonusRate,
    salesRepCountryBonusRate,
    synergyAdPowerBonusRate,
    synergySalesPowerBonusRate,
    totalCountrySynergyRate
  };
}

/**
 * Calculates effective campaign outcomes when a company's Reklamcı Card launches an ad in targetCountry
 */
export function calculateAdCampaignPower(
  company: Company,
  targetCountry: string,
  pkg: AdCampaignPackage
): {
  effectiveFameBoost: number;
  effectiveCountryBonusRate: number;
  effectivePermanentGain: number;
  hasSynergy: boolean;
  isAdSpecialty: boolean;
  adSpecialist: AdSpecialist;
} {
  const adSpec = getCompanyAdSpecialist(company);
  const synergy = getCountrySynergyDetails(company, targetCountry);

  // Reklamcının Reklam Gücü (1-100) kampanyanın etkisini artırır
  const powerMultiplier = 1 + (adSpec.adPower - 50) * 0.005 + (synergy.isAdSpecialty ? 0.15 : 0) + (synergy.hasSynergy ? 0.35 : 0);

  const effectiveFameBoost = Math.max(
    1,
    Math.round(pkg.fameBoost * powerMultiplier * 10) / 10
  );

  const effectiveCountryBonusRate =
    Math.round(
      (pkg.countryBonusRate +
        (synergy.isAdSpecialty ? 0.06 : 0) +
        (synergy.hasSynergy ? 0.14 : 0) +
        Math.max(0, (adSpec.adPower - 50) * 0.002)) *
        100
    ) / 100;

  const effectivePermanentGain =
    Math.round(
      (pkg.permanentCountryGain * (synergy.hasSynergy ? 2 : synergy.isAdSpecialty ? 1.5 : 1)) * 100
    ) / 100;

  return {
    effectiveFameBoost,
    effectiveCountryBonusRate,
    effectivePermanentGain,
    hasSynergy: synergy.hasSynergy,
    isAdSpecialty: synergy.isAdSpecialty,
    adSpecialist: adSpec
  };
}

export const COMPETITIVE_TACTIC_COOLDOWN_MS = 30 * 60 * 1000; // 30 dakika bekleme süresi (sürekli yapılamaz)

export interface CompetitiveTacticPackage {
  id: 'counter_ad' | 'country_embargo' | 'price_dumping' | 'supply_squeeze';
  title: string;
  badge: string;
  cost: number;
  durationMs: number;
  rivalFameDrop: number;
  rivalPricePenaltyRate: number;
  rivalSalesBlockChance: number;
  playerBonusGain: number;
  description: string;
  effectSummary: string;
}

export const COMPETITIVE_TACTICS: CompetitiveTacticPackage[] = [
  {
    id: 'counter_ad',
    title: '📰 Prestij PR & Karşı-Tanıtım',
    badge: 'Hafif Medya Üstünlüğü',
    cost: 160000,
    durationMs: 300000, // 5 dk geçici etki
    rivalFameDrop: 1.5,
    rivalPricePenaltyRate: 0.06,
    rivalSalesBlockChance: 0.15,
    playerBonusGain: 0.01,
    description:
      'Hedef ülkedeki moda dergilerinde özel kıyaslama bültenleri yayınlatır. Rakibin marka algısını hafifçe gölgelerken sizin parfümünüzü öne çıkarır.',
    effectSummary:
      'Sizin Şöhretiniz +1.5⭐ • Rakip Şöhreti -1.5⭐ • Rakibe 5 dk -%6 Fiyat Baskısı • Ülke Bonusunuz +%1'
  },
  {
    id: 'country_embargo',
    title: '🏛️ VIP Vitrin & Başköşe Anlaşması',
    badge: 'Öncelikli Raf Avantajı',
    cost: 240000,
    durationMs: 300000, // 5 dk geçici etki
    rivalFameDrop: 1,
    rivalPricePenaltyRate: 0.07,
    rivalSalesBlockChance: 0.20,
    playerBonusGain: 0.02,
    description:
      'Seçilen ülkedeki lüks mağazalarda en görünür vitrinleri kiralayarak müşterilerin ilk sizin şişelerinize yönelmesini sağlar.',
    effectSummary:
      'Size 5 dk +%8 VIP Vitrin Fiyat Primi • Rakip Sipariş Hızında -%18 Yavaşlama • Ülke Bonusunuz +%2'
  },
  {
    id: 'price_dumping',
    title: '🏷️ Sezonluk Kampanya & İskonto',
    badge: 'Kademeli Pazar Payı',
    cost: 140000,
    durationMs: 300000, // 5 dk geçici etki
    rivalFameDrop: 1,
    rivalPricePenaltyRate: 0.05,
    rivalSalesBlockChance: 0.15,
    playerBonusGain: 0.02,
    description:
      'Hedef ülkedeki butik zincirlerine sezonluk alım teşviki sunar. Rakibin ülke bonusunu sadece -%1 aşındırıp sizin ülke bonusunuzu +%2 artırır.',
    effectSummary:
      'Rakip Kalıcı Ülke Bonusu -%1 • Sizin Kalıcı Ülke Bonusunuz +%2 • Rakip Fiyatına 5 dk -%6 Baskı'
  },
  {
    id: 'supply_squeeze',
    title: '🌸 Öncelikli Hasat & Esans Alımı',
    badge: 'Tedarik Önceliği',
    cost: 185000,
    durationMs: 300000, // 5 dk geçici etki
    rivalFameDrop: 1,
    rivalPricePenaltyRate: 0.06,
    rivalSalesBlockChance: 0.15,
    playerBonusGain: 0.01,
    description:
      'Ülkenin sevdiği esans üreticileriyle öncelikli alım anlaşması yaparak piyasadaki hammadde fiyatlarını hafifçe (+%10) yukarı taşır.',
    effectSummary:
      'Ülke Notalarında +%10 Fiyat Artışı • Sizin Ülke Bonusunuz +%1 • Rakibe 5 dk Hafif Tedarik Baskısı'
  }
];

export interface PerfumerCountryNoteHarmonyDetails {
  perfumerName: string;
  olfactoryFamily: string;
  matchedCountryNotes: string[]; // Ülkenin sevdiği notalardan parfümde bulunanlar
  countryNoteHarmonyBonusRate: number; // Ülkenin sevdiği nota uyumu ekstra satış fiyat farkı (örn: +0.07 .. +0.32)
  matchedPerfumerNotes: string[]; // Parfümatörün uzmanlık notalarından parfümde bulunanlar
  isPerfumerFavoredCountry: boolean; // Satış yapılan ülke parfümatörün favori/uzman ülkesi mi?
  perfumerNoteMasteryBonusRate: number; // Parfümatör nota uzmanlığı ekstra satış fiyat farkı (örn: +0.08 .. +0.26)
  totalNoteAndPerfumerHarmonyRate: number; // Toplam Nota Uyumu + Parfümatör Uzmanlığı ekstra fiyat farkı
}

/**
 * Calculates how well a perfume's Olfactory Families (from the 10 Koku Çarkı families) match:
 * 1) The target country's Random 3 Family Bonus (1 Aile: +%10, 2 Aile: +%20, 3 Aile: +%30)
 * 2) The perfumer's Random 3 Family Bonus (1 Aile: +%8, 2 Aile: +%16, 3 Aile: +%24)
 */
export function calculatePerfumerAndCountryNoteHarmony(
  perfume?: Perfume,
  orderCountry?: string,
  perfumer?: Perfumer,
  company?: Company
): PerfumerCountryNoteHarmonyDetails {
  const effectivePerfumer =
    perfumer || getPerfumerById(perfume?.perfumerId || company?.perfumerId);
  const normCountry = orderCountry ? normalizeCountryName(orderCountry) : '';
  const countryInfo = normCountry
    ? GLOBAL_MARKET_COUNTRIES.find((c) => c.name === normCountry)
    : undefined;

  const rawNotes = perfume
    ? Array.from(
        new Set([
          ...(perfume.topNotes || []),
          ...(perfume.middleNotes || []),
          ...(perfume.baseNotes || []),
          ...(perfume.notes || []),
          ...(perfume.recipe || []).map((r) => r.rawMaterialId)
        ])
      ).filter(Boolean)
    : [];

  const perfumeFamilies = getPerfumeFamilies(rawNotes);

  // 1. Ülkenin Random 3 Aile Bonusu (1 Aile: +%10, 2 Aile: +%20, 3 Aile: +%30)
  const countryFamilies = countryInfo?.bonusFamilies || [];
  const matchedCountryNotes = perfumeFamilies.filter((fam) =>
    countryFamilies.includes(fam)
  );

  let countryNoteHarmonyBonusRate = 0;
  if (countryInfo && perfumeFamilies.length > 0) {
    if (matchedCountryNotes.length >= 3) {
      countryNoteHarmonyBonusRate = 0.30; // 3 Aile eşleşmesi: +%30
    } else if (matchedCountryNotes.length === 2) {
      countryNoteHarmonyBonusRate = 0.20; // 2 Aile eşleşmesi: +%20
    } else if (matchedCountryNotes.length === 1) {
      countryNoteHarmonyBonusRate = 0.10; // 1 Aile eşleşmesi: +%10
    } else {
      countryNoteHarmonyBonusRate = 0; // Eski ceza kaldırıldı
    }
  }

  // 2. Parfümatörün Random 3 Aile Bonusu (1 Aile: +%8, 2 Aile: +%16, 3 Aile: +%24)
  const perfumerFamilies = effectivePerfumer.bonusFamilies || [];
  const matchedPerfumerNotes = perfumeFamilies.filter((fam) =>
    perfumerFamilies.includes(fam)
  );
  const isPerfumerFavoredCountry = Boolean(
    countryInfo &&
      perfumerFamilies.some((fam) => countryFamilies.includes(fam))
  );

  let perfumerNoteMasteryBonusRate = 0;
  if (matchedPerfumerNotes.length >= 3) {
    perfumerNoteMasteryBonusRate = 0.24; // 3 Aile: +%24
  } else if (matchedPerfumerNotes.length === 2) {
    perfumerNoteMasteryBonusRate = 0.16; // 2 Aile: +%16
  } else if (matchedPerfumerNotes.length === 1) {
    perfumerNoteMasteryBonusRate = 0.08; // 1 Aile: +%8
  }

  const totalNoteAndPerfumerHarmonyRate =
    Math.round((countryNoteHarmonyBonusRate + perfumerNoteMasteryBonusRate) * 100) / 100;

  return {
    perfumerName: effectivePerfumer.name,
    olfactoryFamily: format3FamiliesLabel(perfumerFamilies),
    matchedCountryNotes,
    countryNoteHarmonyBonusRate,
    matchedPerfumerNotes,
    isPerfumerFavoredCountry,
    perfumerNoteMasteryBonusRate,
    totalNoteAndPerfumerHarmonyRate
  };
}

export interface SaleMarketingBreakdown {
  fameScore: number;
  fameBonusRate: number; // örn: 0.18 (+%18)
  persuasionScore: number;
  persuasionBonusRate: number; // örn: 0.17 (+%17)
  repSpecialtyBonusRate: number; // örn: 0.10 (+%10)
  isRepSpecialtyCountry: boolean;
  adPowerScore: number;
  adSpecialistBonusRate: number; // Reklamcının ülke uzmanlığı bonusu (+%8)
  isAdSpecialtyCountry: boolean;
  hasCountrySynergy: boolean; // Reklamcı + Satış Temsilcisi aynı ülkede eşleşiyor mu?
  synergySalesPowerBonusRate: number; // Ortak ülkedeki Reklam Gücü + Satış Gücü sinerji bonusu (+%15..+%22)
  regionalPopularityBonusRate: number; // örn: 0.18 (+%18)
  isPopularInCountry: boolean;
  companyCountryBonusRate: number; // örn: 0.15 (+%15)
  activeAdBonusRate: number; // örn: 0.28 (+%28)
  perfumerExportBonusRate: number; // örn: 0.04 (+%4)
  perfumerName: string;
  perfumerOlfactoryFamily: string; // örn: 'Baharatlı – Odunsu & Kraliyet Oryantal'
  matchedCountryNotes: string[]; // Ülkenin sevdiği notalarla eşleşen notalar
  countryNoteHarmonyBonusRate: number; // Ülke sevdiği nota uyumu ekstra satış fiyat farkı (+%7 .. +%30)
  matchedPerfumerNotes: string[]; // Parfümatörün uzmanlık notalarıyla eşleşen notalar
  isPerfumerFavoredCountry: boolean;
  perfumerNoteMasteryBonusRate: number; // Parfümatör nota uzmanlığı ekstra satış fiyat farkı (+%8 .. +%26)
  exclusiveDealBonusRate?: number; // örn: 0.08 (+%8 VIP Vitrin Primi)
  rivalPenaltyRate?: number; // örn: -0.06 (-%6 Rakip Baskısı)
  totalBonusRate: number; // toplam ekstra oran, örn: 0.65 (+%65)
  finalUnitPrice: number;
  bonusPerUnit: number;
}

/**
 * Calculates the full realistic price & demand multiplier from:
 * 1. Parfüm Şöhreti (Fame)
 * 2. Satış Temsilcisi İkna/Satış Gücü & Ülke Uzmanlığı
 * 3. Reklamcı Kartı Ülke Bonusu & ORTAK ÜLKE SİNERJİSİ (Reklamcı + Satış Temsilcisi aynı ülke -> Reklam Gücü + Satış Gücü!)
 * 4. Parfümün O Ülkedeki Popülerliği (Regional Popularity)
 * 5. Şirketin Ülke Bonusu & Aktif Reklam Kampanyası
 * 6. ParfümATÖR İhracat Bonusu + Parfümatör Nota Uzmanlığı (Baharatlı-Odunsu vb.) + Ülke Sevdiği Nota Uyumu Ekstra Satış Fiyat Farkı!
 * 7. VIP Vitrin (+%8) & Rakip Baskısı (-%6)
 */
export function calculateSaleMarketingBonuses(
  baseUnitPrice: number,
  company: Company,
  perfume?: Perfume,
  orderCountry?: string,
  perfumer?: Perfumer
): SaleMarketingBreakdown {
  const now = Date.now();
  const normCountry = orderCountry ? normalizeCountryName(orderCountry) : '';
  const effectivePerfumer =
    perfumer || getPerfumerById(perfume?.perfumerId || company.perfumerId);

  // 1. Perfume Fame Bonus (0-100 fame -> up to +32% price premium)
  const fameScore = perfume ? getPerfumeFame(perfume) : 12;
  const fameBonusRate = Math.round(fameScore * 0.32) / 100;

  // 2. Sales Rep Persuasion Bonus (1-100 persuasion -> up to +28% price premium)
  const salesRep = getCompanySalesRep(company);
  const persuasionScore = salesRep.persuasion || 55;
  const persuasionBonusRate = Math.round(persuasionScore * 0.28) / 100;

  // 3. Reklamcı + Satış Temsilcisi Ülke Uzmanlığı & Ortak Ülke Sinerjisi (Reklam Gücü + Satış Gücü)
  const synergy = normCountry
    ? getCountrySynergyDetails(company, normCountry)
    : {
        isAdSpecialty: false,
        isSalesSpecialty: false,
        hasSynergy: false,
        adPowerScore: getCompanyAdSpecialist(company).adPower || 60,
        salesPowerScore: persuasionScore,
        adSpecialistCountryBonusRate: 0,
        salesRepCountryBonusRate: 0,
        synergyAdPowerBonusRate: 0,
        synergySalesPowerBonusRate: 0,
        totalCountrySynergyRate: 0
      };

  const isRepSpecialtyCountry = synergy.isSalesSpecialty;
  const repSpecialtyBonusRate = synergy.salesRepCountryBonusRate;
  const isAdSpecialtyCountry = synergy.isAdSpecialty;
  const adSpecialistBonusRate = synergy.adSpecialistCountryBonusRate;
  const hasCountrySynergy = synergy.hasSynergy;
  const synergySalesPowerBonusRate = synergy.synergySalesPowerBonusRate;

  // 4. Regional Popularity Bonus (+18% if this perfume is popular in target country!)
  const isPopularInCountry = Boolean(perfume && normCountry && isPerfumePopularInCountry(perfume, normCountry));
  const regionalPopularityBonusRate = isPopularInCountry ? 0.18 : 0;

  // 5. Company Permanent Country Bonus
  const countryMap = company.countryBonuses || COMPANY_DEFAULT_COUNTRY_BONUSES[company.id] || {};
  const companyCountryBonusRate = normCountry ? (countryMap[normCountry] || 0) : 0;

  // 6. Active Advertising Campaign Bonus (for this country or this perfume)
  const activeCampaigns = (company.activeCampaigns || []).filter((c) => c.expiresAt > now);
  let activeAdBonusRate = 0;
  for (const camp of activeCampaigns) {
    const matchesCountry = normCountry && normalizeCountryName(camp.targetCountry) === normCountry;
    const matchesPerfume = perfume && camp.perfumeId === perfume.id;
    if (matchesCountry && matchesPerfume) {
      activeAdBonusRate = Math.max(activeAdBonusRate, camp.countryBonusRate);
    } else if (matchesCountry || matchesPerfume) {
      activeAdBonusRate = Math.max(activeAdBonusRate, Math.round(camp.countryBonusRate * 0.65 * 100) / 100);
    }
  }

  // 7. Perfumer Export Bonus & Perfumer Note Mastery + Country Favorite Note Harmony
  const perfumerExportBonusRate = effectivePerfumer?.exportBonus || 0;
  const noteHarmonyDetails = calculatePerfumerAndCountryNoteHarmony(
    perfume,
    normCountry,
    effectivePerfumer,
    company
  );
  const countryNoteHarmonyBonusRate = noteHarmonyDetails.countryNoteHarmonyBonusRate;
  const perfumerNoteMasteryBonusRate = noteHarmonyDetails.perfumerNoteMasteryBonusRate;

  // 8. VIP Exclusive Country Showcase (+8%) & Mild Rival Competitive Pressure (-6%)
  const hasExclusiveDeal = Boolean(
    normCountry && company.exclusiveCountryDeals && (company.exclusiveCountryDeals[normCountry] || 0) > now
  );
  const exclusiveDealBonusRate = hasExclusiveDeal ? 0.08 : 0;

  const hasRivalPenalty = Boolean(
    normCountry && company.countryPenalties && (company.countryPenalties[normCountry] || 0) > now
  );
  const rivalPenaltyRate = hasRivalPenalty ? -0.06 : 0;

  const totalBonusRate = Math.max(
    -0.30,
    Math.round(
      (fameBonusRate +
        persuasionBonusRate +
        repSpecialtyBonusRate +
        adSpecialistBonusRate +
        synergySalesPowerBonusRate +
        regionalPopularityBonusRate +
        companyCountryBonusRate +
        activeAdBonusRate +
        perfumerExportBonusRate +
        countryNoteHarmonyBonusRate +
        perfumerNoteMasteryBonusRate +
        exclusiveDealBonusRate +
        rivalPenaltyRate) *
        100
    ) / 100
  );

  const finalUnitPrice = Math.max(100, Math.round(baseUnitPrice * (1 + totalBonusRate)));
  const bonusPerUnit = Math.max(0, finalUnitPrice - baseUnitPrice);

  return {
    fameScore,
    fameBonusRate,
    persuasionScore,
    persuasionBonusRate,
    repSpecialtyBonusRate,
    isRepSpecialtyCountry,
    adPowerScore: synergy.adPowerScore,
    adSpecialistBonusRate,
    isAdSpecialtyCountry,
    hasCountrySynergy,
    synergySalesPowerBonusRate,
    regionalPopularityBonusRate,
    isPopularInCountry,
    companyCountryBonusRate,
    activeAdBonusRate,
    perfumerExportBonusRate,
    perfumerName: noteHarmonyDetails.perfumerName,
    perfumerOlfactoryFamily: noteHarmonyDetails.olfactoryFamily,
    matchedCountryNotes: noteHarmonyDetails.matchedCountryNotes,
    countryNoteHarmonyBonusRate,
    matchedPerfumerNotes: noteHarmonyDetails.matchedPerfumerNotes,
    isPerfumerFavoredCountry: noteHarmonyDetails.isPerfumerFavoredCountry,
    perfumerNoteMasteryBonusRate,
    exclusiveDealBonusRate,
    rivalPenaltyRate,
    totalBonusRate,
    finalUnitPrice,
    bonusPerUnit
  };
}

/**
 * Generates a high-value targeted international order when a major ad campaign is launched
 */
export function createCampaignDrivenOrder(
  company: Company,
  perfume: Perfume,
  targetCountryName: string,
  tier: 'influencer' | 'billboard' | 'gala'
): MarketOrder {
  const normCountry = normalizeCountryName(targetCountryName);
  const countryInfo =
    GLOBAL_MARKET_COUNTRIES.find((c) => c.name === normCountry) || GLOBAL_MARKET_COUNTRIES[0];
  const clientName =
    countryInfo.vipClientNames[Math.floor(Math.random() * countryInfo.vipClientNames.length)];

  const baseQty = tier === 'gala' ? 95 : tier === 'billboard' ? 60 : 35;
  const qty = baseQty + Math.floor(Math.random() * 25);
  const basePrice = perfume.suggestedRetailPrice || 1450;
  const premiumMultiplier = tier === 'gala' ? 1.28 : tier === 'billboard' ? 1.18 : 1.10;
  const unitPrice = Math.round(basePrice * premiumMultiplier);

  return {
    id: `ord_ad_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    country: countryInfo.fullName,
    countryFlag: countryInfo.flag,
    clientName: `${clientName} (Reklam Talebi)`,
    orderType: 'single',
    orderCategory: tier === 'gala' ? '👑 VIP Lansman Özel Siparişi' : '📢 Reklam Kampanyası Siparişi',
    productId: perfume.id,
    productName: perfume.name,
    requestedQuantity: qty,
    remainingQuantity: qty,
    pricePerUnit: unitPrice,
    totalOrderValue: qty * unitPrice,
    createdAt: Date.now(),
    expiresAt: Date.now() + 86400000 * 3,
    status: 'active'
  };
}
