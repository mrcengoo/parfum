import { RawMaterial, PricePoint, NoteType, OlfactoryFamilyGroup } from '../types';
import { RAW_MATERIAL_IMAGES } from './rawMaterialImages';

export interface OlfactoryFamilyMeta {
  id: OlfactoryFamilyGroup;
  name: OlfactoryFamilyGroup;
  emoji: string;
  colorClass: string;
  badgeClass: string;
  wheelHex: string;
  tiersLabel: string;
  description: string;
}

export const OLFACTORY_FAMILIES_10: OlfactoryFamilyMeta[] = [
  {
    id: 'Narenciye',
    name: 'Narenciye',
    emoji: '🍋',
    colorClass: 'text-yellow-300',
    badgeClass: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40',
    wheelHex: '#eab308',
    tiersLabel: 'Üst Nota',
    description: 'Ferahlatıcı, ışıltılı ve enerjik narenciye kabuğu esansları (Üst Nota).'
  },
  {
    id: 'Meyvemsi',
    name: 'Meyvemsi',
    emoji: '🍑',
    colorClass: 'text-rose-300',
    badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40',
    wheelHex: '#e11d48',
    tiersLabel: 'Üst & Orta Nota',
    description: 'Sulu, egzotik, tatlı-mayhoş kırmızı ve tropikal meyve özleri (Üst & Orta Nota).'
  },
  {
    id: 'Yeşilimsi',
    name: 'Yeşilimsi',
    emoji: '🌿',
    colorClass: 'text-emerald-300',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
    wheelHex: '#22c55e',
    tiersLabel: 'Üst & Orta Nota',
    description: 'Aromatik otlar, yapraklar, çay ve deniz tuzu ferahlığı (Üst & Orta Nota).'
  },
  {
    id: 'Baharatlı',
    name: 'Baharatlı',
    emoji: '🌶️',
    colorClass: 'text-orange-300',
    badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/40',
    wheelHex: '#ea580c',
    tiersLabel: 'Üst & Orta Nota',
    description: 'Sıcak ve serin baharat tohumları, safran, tarçın ve biber akorları (Üst & Orta Nota).'
  },
  {
    id: 'Çiçeksi',
    name: 'Çiçeksi',
    emoji: '🌸',
    colorClass: 'text-pink-300',
    badgeClass: 'bg-pink-500/15 text-pink-300 border-pink-500/40',
    wheelHex: '#ec4899',
    tiersLabel: 'Orta Nota',
    description: 'Parfümün kalbini oluşturan gül, yasemin, sümbülteber ve beyaz çiçekler (Orta Nota).'
  },
  {
    id: 'Pudramsı',
    name: 'Pudramsı',
    emoji: '☁️',
    colorClass: 'text-violet-300',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/40',
    wheelHex: '#8b5cf6',
    tiersLabel: 'Orta & Alt Nota',
    description: 'İpeksi süsen (iris), aldehitler, menekşe ve temiz beyaz misk akorları (Orta & Alt Nota).'
  },
  {
    id: 'Tatlımsı',
    name: 'Tatlımsı',
    emoji: '🍯',
    colorClass: 'text-fuchsia-300',
    badgeClass: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40',
    wheelHex: '#d946ef',
    tiersLabel: 'Orta & Alt Nota',
    description: 'Vanilya, tonka, kahve, kakao, bal, karamel ve gurme tatlı notalar (Orta & Alt Nota).'
  },
  {
    id: 'Odunsu',
    name: 'Odunsu',
    emoji: '🪵',
    colorClass: 'text-amber-300',
    badgeClass: 'bg-amber-600/20 text-amber-200 border-amber-500/40',
    wheelHex: '#b45309',
    tiersLabel: 'Orta & Alt Nota',
    description: 'Ud, sandal, sedir, vetiver, paçuli ve modern odunsu moleküller (Orta & Alt Nota).'
  },
  {
    id: 'Amber',
    name: 'Amber',
    emoji: '🟠',
    colorClass: 'text-amber-400',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-400/40',
    wheelHex: '#d97706',
    tiersLabel: 'Orta & Alt Nota',
    description: 'Kehribar, tütsü, mür, labdanum ve kutsal reçine akorları (Orta & Alt Nota).'
  },
  {
    id: 'Deri',
    name: 'Deri',
    emoji: '🟤',
    colorClass: 'text-stone-300',
    badgeClass: 'bg-stone-500/20 text-stone-200 border-stone-400/40',
    wheelHex: '#78716c',
    tiersLabel: 'Alt Nota',
    description: 'Süet deri, huş katranı, ardıç katranı ve derin hayvansal dip notalar (Alt Nota).'
  }
];

function makePriceHistory(basePrice: number): PricePoint[] {
  const now = Date.now();
  return [
    { timestamp: now - 120000, price: Math.round(basePrice * 0.97 * 10) / 10 },
    { timestamp: now - 90000, price: Math.round(basePrice * 0.985 * 10) / 10 },
    { timestamp: now - 60000, price: Math.round(basePrice * 1.01 * 10) / 10 },
    { timestamp: now - 30000, price: Math.round(basePrice * 0.995 * 10) / 10 },
    { timestamp: now, price: basePrice }
  ];
}

// Core 37 existing raw materials (preserving exact IDs) + mapped to 10 Families & Üst/Orta/Alt Note Tier
const CORE_RAW_MATERIALS: RawMaterial[] = [
  {
    id: 'vanilya',
    name: 'Vanilya (Madagaskar Bourbon)',
    country: 'Madagaskar',
    countryCode: 'MG',
    flag: '🇲🇬',
    price: 135,
    basePrice: 135,
    exchangeStock: 4500,
    producerCompany: 'Madagascar Bourbon Co.',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 438,
    productionTime: 438,
    supply: 68,
    demand: 82,
    familyGroup: 'Tatlımsı',
    noteTier: 'base',
    category: 'Tatlımsı - Gurme',
    description: 'Madagaskar ovalarından toplanan, yoğun ve kadifemsi koku profiline sahip doğal bourbon vanilyası (Alt Nota).',
    priceHistory: makePriceHistory(135)
  },
  {
    id: 'safran',
    name: 'Safran (İran Altını)',
    country: 'İran',
    countryCode: 'IR',
    flag: '🇮🇷',
    price: 420,
    basePrice: 420,
    exchangeStock: 1200,
    producerCompany: 'Khorasan Golden Spices',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 227,
    productionTime: 227,
    supply: 35,
    demand: 90,
    familyGroup: 'Baharatlı',
    noteTier: 'middle',
    category: 'Baharatlı - Deri',
    description: 'Dünyanın en değerli baharatı; sıcak, metalik ve deri çağrışımlı benzersiz lüks orta nota.',
    priceHistory: makePriceHistory(420)
  },
  {
    id: 'meyan_koku',
    name: 'Meyan Kökü',
    country: 'Türkiye',
    countryCode: 'TR',
    flag: '🇹🇷',
    price: 90,
    basePrice: 90,
    exchangeStock: 6800,
    producerCompany: 'Anadolu Bitkisel A.Ş.',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 262,
    productionTime: 262,
    supply: 80,
    demand: 55,
    familyGroup: 'Tatlımsı',
    noteTier: 'base',
    category: 'Tatlımsı - Odunsu',
    description: 'Güneydoğu Anadolu nehir yataklarından hasat edilen zengin anasonik tatlılıkta meyan kökü (Alt Nota).',
    priceHistory: makePriceHistory(90)
  },
  {
    id: 'vetiver',
    name: 'Vetiver (Haiti)',
    country: 'Haiti',
    countryCode: 'HT',
    flag: '🇭🇹',
    price: 210,
    basePrice: 210,
    exchangeStock: 2800,
    producerCompany: 'Les Cayes Essence Ltd.',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 486,
    productionTime: 486,
    supply: 50,
    demand: 75,
    familyGroup: 'Odunsu',
    noteTier: 'base',
    category: 'Odunsu - Yeşilimsi',
    description: 'Haiti kökenli nemli toprak, tütsü ve duman nüanslarına sahip derin vetiver kökü ekstresi (Alt Nota).',
    priceHistory: makePriceHistory(210)
  },
  {
    id: 'bergamot',
    name: 'Bergamot (Kalabriyen)',
    country: 'İtalya',
    countryCode: 'IT',
    flag: '🇮🇹',
    price: 115,
    basePrice: 115,
    exchangeStock: 5200,
    producerCompany: 'Reggio Calabria Citrus',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 195,
    productionTime: 195,
    supply: 75,
    demand: 80,
    familyGroup: 'Narenciye',
    noteTier: 'top',
    category: 'Narenciye - Ferah',
    description: 'Akdeniz güneşinde olgunlaşan ışıltılı, ferahlatıcı ve canlandırıcı bergamot kabuğu yağı (Üst Nota).',
    priceHistory: makePriceHistory(115)
  },
  {
    id: 'yasemin',
    name: 'Yasemin (Grasse)',
    country: 'Fransa',
    countryCode: 'FR',
    flag: '🇫🇷',
    price: 360,
    basePrice: 360,
    exchangeStock: 1600,
    producerCompany: 'Grasse Fleur Aromatics',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 310,
    productionTime: 310,
    supply: 40,
    demand: 88,
    familyGroup: 'Çiçeksi',
    noteTier: 'middle',
    category: 'Çiçeksi - Beyaz Çiçek',
    description: 'Şafak vakti elle toplanan, sarhoş edici ve zengin çiçeksi karakterli Grasse yasemin absolütü (Orta Nota).',
    priceHistory: makePriceHistory(360)
  },
  {
    id: 'misk',
    name: 'Beyaz Misk',
    country: 'İsviçre',
    countryCode: 'CH',
    flag: '🇨🇭',
    price: 185,
    basePrice: 185,
    exchangeStock: 3900,
    producerCompany: 'Helvetia Synthetics',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 180,
    productionTime: 180,
    supply: 60,
    demand: 85,
    familyGroup: 'Pudramsı',
    noteTier: 'base',
    category: 'Pudramsı - Temiz Misk',
    description: 'Temiz, pudramsı ve kalıcı sabitsi hissiyat veren yüksek saflıkta beyaz misk (Alt Nota).',
    priceHistory: makePriceHistory(185)
  },
  {
    id: 'sandal_agaci',
    name: 'Sandal Ağacı (Mysore)',
    country: 'Hindistan',
    countryCode: 'IN',
    flag: '🇮🇳',
    price: 310,
    basePrice: 310,
    exchangeStock: 2100,
    producerCompany: 'Mysore Woods Corp.',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 375,
    productionTime: 375,
    supply: 45,
    demand: 84,
    familyGroup: 'Odunsu',
    noteTier: 'base',
    category: 'Odunsu - Kremsi',
    description: 'Kremsi, yumuşak ve manevi derinliğe sahip klasik Mysore sandal ağacı yağı (Alt Nota).',
    priceHistory: makePriceHistory(310)
  },
  {
    id: 'sedir_agaci',
    name: 'Sedir (Atlas Sedir Ağacı)',
    country: 'Fas',
    countryCode: 'MA',
    flag: '🇲🇦',
    price: 155,
    basePrice: 155,
    exchangeStock: 4800,
    producerCompany: 'Atlas Cèdre Botanicals',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 240,
    productionTime: 240,
    supply: 70,
    demand: 65,
    familyGroup: 'Odunsu',
    noteTier: 'base',
    category: 'Odunsu - Reçineli',
    description: 'Kuru, asil kalem talaşı ve reçinemsi odun dokusuna sahip berrak sedir özü (Alt Nota).',
    priceHistory: makePriceHistory(155)
  },
  {
    id: 'paculi',
    name: 'Paçuli (Endonezya)',
    country: 'Endonezya',
    countryCode: 'ID',
    flag: '🇮🇩',
    price: 175,
    basePrice: 175,
    exchangeStock: 3600,
    producerCompany: 'Sumatra Flora Distillers',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 395,
    productionTime: 395,
    supply: 58,
    demand: 76,
    familyGroup: 'Odunsu',
    noteTier: 'base',
    category: 'Odunsu - Topraksı',
    description: 'Fermente edilmiş yapraklardan damıtılan karanlık, topraksı ve oryantal paçuli esansı (Alt Nota).',
    priceHistory: makePriceHistory(175)
  },
  {
    id: 'gul',
    name: 'Şam Gülü (Mayıs Gülü)',
    country: 'Fransa',
    countryCode: 'FR',
    flag: '🇫🇷',
    price: 295,
    basePrice: 295,
    exchangeStock: 2200,
    producerCompany: 'Provence Rose Extracts',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 285,
    productionTime: 285,
    supply: 48,
    demand: 82,
    familyGroup: 'Çiçeksi',
    noteTier: 'middle',
    category: 'Çiçeksi - Kraliyet Gülü',
    description: 'Rosa damascena ve centifolia taç yapraklarından elde edilen balımsı, zengin gül esansı (Orta Nota).',
    priceHistory: makePriceHistory(295)
  },
  {
    id: 'lavanta',
    name: 'Lavanta (Fransız)',
    country: 'Fransa',
    countryCode: 'FR',
    flag: '🇫🇷',
    price: 125,
    basePrice: 125,
    exchangeStock: 5000,
    producerCompany: 'Haute-Provence Herbals',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 215,
    productionTime: 215,
    supply: 72,
    demand: 68,
    familyGroup: 'Yeşilimsi',
    noteTier: 'middle',
    category: 'Yeşilimsi - Aromatik',
    description: 'Yüksek irtifa Provence dağlarından toplanan taze, yatıştırıcı ve aromatik lavanta yağı (Orta Nota).',
    priceHistory: makePriceHistory(125)
  },
  {
    id: 'ambroksan',
    name: 'Ambroksan',
    country: 'Almanya',
    countryCode: 'DE',
    flag: '🇩🇪',
    price: 240,
    basePrice: 240,
    exchangeStock: 3200,
    producerCompany: 'Bavaria Fine Aromas',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 205,
    productionTime: 205,
    supply: 52,
    demand: 89,
    familyGroup: 'Amber',
    noteTier: 'base',
    category: 'Amber - Odunsu',
    description: 'Modern parfümerinin omurgası; mineralik, tensel ve kehribarımsı sıcak molekül (Alt Nota).',
    priceHistory: makePriceHistory(240)
  },
  {
    id: 'kahve',
    name: 'Kahve (Kavrulmuş Arabica)',
    country: 'Kolombiya',
    countryCode: 'CO',
    flag: '🇨🇴',
    price: 140,
    basePrice: 140,
    exchangeStock: 4100,
    producerCompany: 'Andean Roast Co.',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 460,
    productionTime: 460,
    supply: 65,
    demand: 79,
    familyGroup: 'Tatlımsı',
    noteTier: 'middle',
    category: 'Tatlımsı - Kavruk Gurme',
    description: 'Derin kavrulmuş Arabica çekirdeklerinden elde edilen koyu, enerjik ve bağımlılık yaratan koku (Orta Nota).',
    priceHistory: makePriceHistory(140)
  },
  {
    id: 'aci_badem',
    name: 'Acı Badem',
    country: 'Fas',
    countryCode: 'MA',
    flag: '🇲🇦',
    price: 195,
    basePrice: 195,
    exchangeStock: 2600,
    producerCompany: 'Marrakech Nut Oils',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 250,
    productionTime: 250,
    supply: 54,
    demand: 72,
    familyGroup: 'Tatlımsı',
    noteTier: 'middle',
    category: 'Tatlımsı - Pudramsı',
    description: 'Badem kabuklarından distile edilen marzipan andıran zengin ve gurme nüans (Orta Nota).',
    priceHistory: makePriceHistory(195)
  },
  {
    id: 'pembe_biber',
    name: 'Pembe Biber',
    country: 'Brezilya',
    countryCode: 'BR',
    flag: '🇧🇷',
    price: 160,
    basePrice: 160,
    exchangeStock: 3500,
    producerCompany: 'Amazonia Spices',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 445,
    productionTime: 445,
    supply: 62,
    demand: 74,
    familyGroup: 'Baharatlı',
    noteTier: 'top',
    category: 'Baharatlı - Meyvemsi',
    description: 'Meyvemsi, ışıltılı ve keskin olmayan tatlımsı pembe tane biber özütü (Üst Nota).',
    priceHistory: makePriceHistory(160)
  },
  {
    id: 'portakal_cicegi',
    name: 'Portakal Çiçeği',
    country: 'İspanya',
    countryCode: 'ES',
    flag: '🇪🇸',
    price: 215,
    basePrice: 215,
    exchangeStock: 3100,
    producerCompany: 'Sevilla Neroli Distilleries',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 235,
    productionTime: 235,
    supply: 56,
    demand: 78,
    familyGroup: 'Çiçeksi',
    noteTier: 'middle',
    category: 'Çiçeksi - Narenciye',
    description: 'Akdeniz portakal ağaçlarının beyaz çiçeklerinden gelen tatlı ve neşeli çiçeksi koku (Orta Nota).',
    priceHistory: makePriceHistory(215)
  },
  {
    id: 'karabiber',
    name: 'Karabiber (Malabar)',
    country: 'Hindistan',
    countryCode: 'IN',
    flag: '🇮🇳',
    price: 110,
    basePrice: 110,
    exchangeStock: 5600,
    producerCompany: 'Malabar Pepper Co.',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 360,
    productionTime: 360,
    supply: 76,
    demand: 64,
    familyGroup: 'Baharatlı',
    noteTier: 'top',
    category: 'Baharatlı - Odunsu',
    description: 'Keskin, kuru ve dinamik baharatlı sıcaklık veren Malabar karabiber yağı (Üst Nota).',
    priceHistory: makePriceHistory(110)
  },
  {
    id: 'sichuan_biberi',
    name: 'Sichuan Biberi',
    country: 'Çin',
    countryCode: 'CN',
    flag: '🇨🇳',
    price: 170,
    basePrice: 170,
    exchangeStock: 2900,
    producerCompany: 'Chengdu Botanics Ltd.',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 410,
    productionTime: 410,
    supply: 52,
    demand: 70,
    familyGroup: 'Baharatlı',
    noteTier: 'top',
    category: 'Baharatlı - Narenciye',
    description: 'Uyuşturucu narenciyeli kıvılcım ve hafif metalik baharatlı titreşim (Üst Nota).',
    priceHistory: makePriceHistory(170)
  },
  {
    id: 'ananas',
    name: 'Ananas (Tropikal)',
    country: 'Kosta Rika',
    countryCode: 'CR',
    flag: '🇨🇷',
    price: 130,
    basePrice: 130,
    exchangeStock: 4200,
    producerCompany: 'Pura Vida Frutas',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 470,
    productionTime: 470,
    supply: 66,
    demand: 83,
    familyGroup: 'Meyvemsi',
    noteTier: 'top',
    category: 'Meyvemsi - Tatlımsı',
    description: 'Sulu, tatlı ve mayhoş tropik ananas akoru; enerjik ve ferahlatıcı (Üst Nota).',
    priceHistory: makePriceHistory(130)
  },
  {
    id: 'elma',
    name: 'Elma (Yeşil Granny Smith)',
    country: 'Türkiye',
    countryCode: 'TR',
    flag: '🇹🇷',
    price: 95,
    basePrice: 95,
    exchangeStock: 6400,
    producerCompany: 'Isparta Bahçeleri',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 220,
    productionTime: 220,
    supply: 82,
    demand: 60,
    familyGroup: 'Meyvemsi',
    noteTier: 'top',
    category: 'Meyvemsi - Yeşilimsi',
    description: 'Gevrek, sulu ve canlı yeşil elma üst notası.',
    priceHistory: makePriceHistory(95)
  },
  {
    id: 'hus_agaci',
    name: 'Huş Katranı (Huş Ağacı)',
    country: 'Rusya',
    countryCode: 'RU',
    flag: '🇷🇺',
    price: 180,
    basePrice: 180,
    exchangeStock: 3100,
    producerCompany: 'Siberian Boreal Oils',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 330,
    productionTime: 330,
    supply: 55,
    demand: 77,
    familyGroup: 'Deri',
    noteTier: 'base',
    category: 'Deri - Odunsu',
    description: 'Tütsülenmiş deri, odun ateşi ve maskülen duman efektli huş ağacı katranı (Alt Nota).',
    priceHistory: makePriceHistory(180)
  },
  {
    id: 'tütün_yapragi',
    name: 'Tütün Yaprağı (Küba)',
    country: 'Küba',
    countryCode: 'CU',
    flag: '🇨🇺',
    price: 260,
    basePrice: 260,
    exchangeStock: 2500,
    producerCompany: 'Habana Vuelta Abajo Tabacos',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 480,
    productionTime: 480,
    supply: 44,
    demand: 86,
    familyGroup: 'Odunsu',
    noteTier: 'middle',
    category: 'Odunsu - Tatlımsı',
    description: 'Kurutulmuş puro tütün yapraklarının balımsı, sıcak ve odunsu zenginliği (Orta Nota).',
    priceHistory: makePriceHistory(260)
  },
  {
    id: 'tonka_fasulyesi',
    name: 'Tonka Fasulyesi',
    country: 'Venezuela',
    countryCode: 'VE',
    flag: '🇻🇪',
    price: 220,
    basePrice: 220,
    exchangeStock: 2700,
    producerCompany: 'Orinoco Bio-Aroma',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 450,
    productionTime: 450,
    supply: 50,
    demand: 80,
    familyGroup: 'Tatlımsı',
    noteTier: 'base',
    category: 'Tatlımsı - Amber',
    description: 'Kumarin zengini, vanilyayı andıran fakat badem ve sıcak amber nüansları taşıyan lüks tohum (Alt Nota).',
    priceHistory: makePriceHistory(220)
  },
  {
    id: 'kakao',
    name: 'Kakao (Ekvador Çekirdeği)',
    country: 'Ekvador',
    countryCode: 'EC',
    flag: '🇪🇨',
    price: 165,
    basePrice: 165,
    exchangeStock: 3300,
    producerCompany: 'Arriba Nacional Cacao',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 430,
    productionTime: 430,
    supply: 58,
    demand: 75,
    familyGroup: 'Tatlımsı',
    noteTier: 'middle',
    category: 'Tatlımsı - Odunsu',
    description: 'Saf bitter çikolata ve kuru meyve aromalarına sahip kıymetli kakao ekstraktı (Orta Nota).',
    priceHistory: makePriceHistory(165)
  },
  {
    id: 'aldehitler',
    name: 'Aldehit (Sentetik C-11)',
    country: 'Fransa',
    countryCode: 'FR',
    flag: '🇫🇷',
    price: 150,
    basePrice: 150,
    exchangeStock: 3800,
    producerCompany: 'Paris Lab Synthèse',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 185,
    productionTime: 185,
    supply: 65,
    demand: 71,
    familyGroup: 'Pudramsı',
    noteTier: 'middle',
    category: 'Pudramsı - Çiçeksi',
    description: 'Şampanya köpüğü gibi patlayan, buzlu ve sabunsu klasik Fransız aldehitleri (Orta Nota).',
    priceHistory: makePriceHistory(150)
  },
  {
    id: 'bakir',
    name: 'Bakır (Metalik Ozon Akoru)',
    country: 'Şili',
    countryCode: 'CL',
    flag: '🇨🇱',
    price: 165,
    basePrice: 165,
    exchangeStock: 2900,
    producerCompany: 'Andes Mineral Aromatics',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 272,
    productionTime: 272,
    supply: 55,
    demand: 68,
    familyGroup: 'Yeşilimsi',
    noteTier: 'top',
    category: 'Yeşilimsi - Ozonik',
    description: 'Modern niş parfümeride soğuk buharlı metal, ozonik kıvılcım ve mineralik canlılık hissi veren akor (Üst Nota).',
    priceHistory: makePriceHistory(165)
  },
  {
    id: 'greyfurt',
    name: 'Greyfurt (Florida)',
    country: 'Amerika Birleşik Devletleri',
    countryCode: 'US',
    flag: '🇺🇸',
    price: 120,
    basePrice: 120,
    exchangeStock: 4800,
    producerCompany: 'Florida Citrus Grove Ltd.',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 230,
    productionTime: 230,
    supply: 70,
    demand: 80,
    familyGroup: 'Narenciye',
    noteTier: 'top',
    category: 'Narenciye - Ferah',
    description: 'Acımsı, sulu ve canlı narenciye tazeliği; modern parfümerinin ışıltılı açılış notası (Üst Nota).',
    priceHistory: makePriceHistory(120)
  },
  {
    id: 'tarcin',
    name: 'Tarçın (Seylan)',
    country: 'Sri Lanka',
    countryCode: 'LK',
    flag: '🇱🇰',
    price: 230,
    basePrice: 230,
    exchangeStock: 2400,
    producerCompany: 'Ceylon Royal Spices',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 380,
    productionTime: 380,
    supply: 45,
    demand: 85,
    familyGroup: 'Baharatlı',
    noteTier: 'middle',
    category: 'Baharatlı - Tatlımsı',
    description: 'Seylan adasının en saf kabuklarından damıtılan sıcak, tatlımsı ve odunsu lüks baharat esansı (Orta Nota).',
    priceHistory: makePriceHistory(230)
  },
  {
    id: 'visne',
    name: 'Kiraz / Kara Vişne',
    country: 'Türkiye',
    countryCode: 'TR',
    flag: '🇹🇷',
    price: 175,
    basePrice: 175,
    exchangeStock: 3200,
    producerCompany: 'Anatolia Cherry Distillers',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 210,
    productionTime: 210,
    supply: 60,
    demand: 88,
    familyGroup: 'Meyvemsi',
    noteTier: 'middle',
    category: 'Meyvemsi - Tatlımsı',
    description: 'Derin bordo, tatlı-mayhoş ve likör çağrışımlı baştan çıkarıcı zengin vişne ve kiraz akoru (Orta Nota).',
    priceHistory: makePriceHistory(175)
  },
  {
    id: 'iris',
    name: 'Süsen (İris / Floransa Orris)',
    country: 'İtalya',
    countryCode: 'IT',
    flag: '🇮🇹',
    price: 460,
    basePrice: 460,
    exchangeStock: 950,
    producerCompany: 'Firenze Nobile Iris',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 260,
    productionTime: 260,
    supply: 30,
    demand: 94,
    familyGroup: 'Pudramsı',
    noteTier: 'middle',
    category: 'Pudramsı - Çiçeksi',
    description: 'Toskana tepelerinde 3 yıl kurutulup damıtılan, dünyanın en pahalı ve asil pudramsı süsen çiçeği (Orta Nota).',
    priceHistory: makePriceHistory(460)
  },
  {
    id: 'nane',
    name: 'Nane (Mitcham)',
    country: 'Birleşik Krallık',
    countryCode: 'GB',
    flag: '🇬🇧',
    price: 105,
    basePrice: 105,
    exchangeStock: 5400,
    producerCompany: 'Mitcham Mint Botanicals',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 200,
    productionTime: 200,
    supply: 75,
    demand: 65,
    familyGroup: 'Yeşilimsi',
    noteTier: 'top',
    category: 'Yeşilimsi - Ferah',
    description: 'İngiliz kır bahçelerinden toplanan buzlu, aromatik ve keskin ferahlatıcı doğal yeşil nane özü (Üst Nota).',
    priceHistory: makePriceHistory(105)
  },
  {
    id: 'lici',
    name: 'Liçi (Egzotik Meyve)',
    country: 'Madagaskar',
    countryCode: 'MG',
    flag: '🇲🇬',
    price: 160,
    basePrice: 160,
    exchangeStock: 3200,
    producerCompany: 'Antananarivo Exotic Fruits',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 230,
    productionTime: 230,
    supply: 55,
    demand: 85,
    familyGroup: 'Meyvemsi',
    noteTier: 'top',
    category: 'Meyvemsi - Çiçeksi',
    description: 'Sulu, tatlı ve hafif mayhoş nüanslarıyla modern niş parfümlerin gözdesi tropikal liçi özü (Üst Nota).',
    priceHistory: makePriceHistory(160)
  },
  {
    id: 'deniz_notalari',
    name: 'Deniz Tuzu Akoru',
    country: 'İtalya',
    countryCode: 'IT',
    flag: '🇮🇹',
    price: 110,
    basePrice: 110,
    exchangeStock: 5600,
    producerCompany: 'Capri Marine Aromas',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 180,
    productionTime: 180,
    supply: 80,
    demand: 78,
    familyGroup: 'Yeşilimsi',
    noteTier: 'top',
    category: 'Yeşilimsi - Deniz Tuzu',
    description: 'Akdeniz fırtınasının dalgalarından esinlenen tuzlu, iyotlu ve saf mavi okyanus ferahlığı (Üst Nota).',
    priceHistory: makePriceHistory(110)
  },
  {
    id: 'biberiye',
    name: 'Biberiye (Akdeniz)',
    country: 'İspanya',
    countryCode: 'ES',
    flag: '🇪🇸',
    price: 95,
    basePrice: 95,
    exchangeStock: 6000,
    producerCompany: 'Andalusia Herbals',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 190,
    productionTime: 190,
    supply: 75,
    demand: 60,
    familyGroup: 'Yeşilimsi',
    noteTier: 'top',
    category: 'Yeşilimsi - Odunsu',
    description: 'Güneşle kuruyan keskin, çamsı ve canlandırıcı doğal yabani biberiye yaprağı distilatı (Üst Nota).',
    priceHistory: makePriceHistory(95)
  },
  {
    id: 'tutsu',
    name: 'Tütsü (Umman Buhuru)',
    country: 'Umman',
    countryCode: 'OM',
    flag: '🇴🇲',
    price: 280,
    basePrice: 280,
    exchangeStock: 1800,
    producerCompany: 'Dhofar Frankincense Royalty',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 320,
    productionTime: 320,
    supply: 40,
    demand: 92,
    familyGroup: 'Amber',
    noteTier: 'base',
    category: 'Amber - Dumanlı Reçine',
    description: 'Dhofar çöllerindeki kutsal ağaçlardan toplanan gümüşi reçine; tapınak tütsüsü ve derin manevi duman (Alt Nota).',
    priceHistory: makePriceHistory(280)
  },
  {
    id: 'kakule',
    name: 'Kakule (Yeşil Guatemala)',
    country: 'Guatemala',
    countryCode: 'GT',
    flag: '🇬🇹',
    price: 220,
    basePrice: 220,
    exchangeStock: 2600,
    producerCompany: 'Alta Verapaz Cardamom Co.',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 290,
    productionTime: 290,
    supply: 50,
    demand: 82,
    familyGroup: 'Baharatlı',
    noteTier: 'top',
    category: 'Baharatlı - Yeşilimsi',
    description: 'Okaliptüsü andıran serinletici ama baharatlı, zarif ve aristokratik yeşil kakule tohumları (Üst Nota).',
    priceHistory: makePriceHistory(220)
  },
  {
    id: 'deri',
    name: 'Deri Akoru (Toskana Süet)',
    country: 'İtalya',
    countryCode: 'IT',
    flag: '🇮🇹',
    price: 270,
    basePrice: 270,
    exchangeStock: 1900,
    producerCompany: 'Firenze Cuoio Antico',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 310,
    productionTime: 310,
    supply: 45,
    demand: 88,
    familyGroup: 'Deri',
    noteTier: 'base',
    category: 'Deri - Hayvansal',
    description: 'Floransa atölyelerinin kadifemsi süet ve sıcak deri kokusu; zengin, maskülen ve şehvetli tensel tabaka (Alt Nota).',
    priceHistory: makePriceHistory(270)
  },
  {
    id: 'oud',
    name: 'Ud Ağacı (Kraliyet Oud)',
    country: 'Kamboçya',
    countryCode: 'KH',
    flag: '🇰🇭',
    price: 480,
    basePrice: 480,
    exchangeStock: 800,
    producerCompany: 'Angkor Royal Agarwood',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 420,
    productionTime: 420,
    supply: 25,
    demand: 96,
    familyGroup: 'Odunsu',
    noteTier: 'base',
    category: 'Odunsu - Amber',
    description: 'Yüzyıllık Aquilaria ağaçlarının reçinesinden damıtılan sıvı altın; koyu ve görkemli oryantal şaheser (Alt Nota).',
    priceHistory: makePriceHistory(480)
  },
  {
    id: 'amber',
    name: 'Kehribar (Amber)',
    country: 'İspanya',
    countryCode: 'ES',
    flag: '🇪🇸',
    price: 290,
    basePrice: 290,
    exchangeStock: 2100,
    producerCompany: 'Iberia Labdanum Resin',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 270,
    productionTime: 270,
    supply: 45,
    demand: 90,
    familyGroup: 'Amber',
    noteTier: 'base',
    category: 'Amber - Tatlımsı',
    description: 'Balımsı, reçineli ve altın sarısı sıcacık kehribar (amber) akoru; tenle bütünleşen zamansız lüks koku temeli (Alt Nota).',
    priceHistory: makePriceHistory(290)
  },
  {
    id: 'orkide',
    name: 'Orkide (Akor)',
    country: 'Kosta Rika',
    countryCode: 'CR',
    flag: '🇨🇷',
    price: 260,
    basePrice: 260,
    exchangeStock: 2400,
    producerCompany: 'Monteverde Rain Flora',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 280,
    productionTime: 280,
    supply: 50,
    demand: 80,
    familyGroup: 'Çiçeksi',
    noteTier: 'middle',
    category: 'Çiçeksi - Tatlımsı',
    description: 'Yağmur ormanlarının gece açan karanlık orkide çiçeği; egzotik ve baştan çıkarıcı orta nota.',
    priceHistory: makePriceHistory(260)
  },
  {
    id: 'limon',
    name: 'Limon (Sicilya)',
    country: 'İtalya',
    countryCode: 'IT',
    flag: '🇮🇹',
    price: 85,
    basePrice: 85,
    exchangeStock: 6500,
    producerCompany: 'Palermo Citrus Groves',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 160,
    productionTime: 160,
    supply: 85,
    demand: 70,
    familyGroup: 'Narenciye',
    noteTier: 'top',
    category: 'Narenciye - Ferah',
    description: 'Güneşle yıkanmış Sicilya bahçelerinin sulu, parlak ve enerji saçan canlı limon kabuğu esansı (Üst Nota).',
    priceHistory: makePriceHistory(85)
  },
  {
    id: 'bal',
    name: 'Bal (Organik Çiçek Balı)',
    country: 'Türkiye',
    countryCode: 'TR',
    flag: '🇹🇷',
    price: 140,
    basePrice: 140,
    exchangeStock: 4200,
    producerCompany: 'Toros Dağları Arıcılık',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 220,
    productionTime: 220,
    supply: 65,
    demand: 84,
    familyGroup: 'Tatlımsı',
    noteTier: 'middle',
    category: 'Tatlımsı - Amber',
    description: 'Toros yaylalarının binbir çiçeğinden toplanan altın sarısı, zengin ve tatlı gurme bal damlası (Orta Nota).',
    priceHistory: makePriceHistory(140)
  },
  {
    id: 'osmanthus',
    name: 'Osmantus (Çin Çiçeği)',
    country: 'Çin',
    countryCode: 'CN',
    flag: '🇨🇳',
    price: 310,
    basePrice: 310,
    exchangeStock: 1700,
    producerCompany: 'Guilin Golden Blossom',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 330,
    productionTime: 330,
    supply: 40,
    demand: 87,
    familyGroup: 'Çiçeksi',
    noteTier: 'middle',
    category: 'Çiçeksi - Meyvemsi',
    description: 'Kayısı ve şeftaliyi andıran meyvemsi deri nüanslarına sahip Doğu Asya osmantus çiçeği (Orta Nota).',
    priceHistory: makePriceHistory(310)
  },
  {
    id: 'subulteber',
    name: 'Tüberoz (Grasse Sümbülteberi)',
    country: 'Fransa',
    countryCode: 'FR',
    flag: '🇫🇷',
    price: 380,
    basePrice: 380,
    exchangeStock: 1400,
    producerCompany: 'Grasse Tubéreuse Royale',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 340,
    productionTime: 340,
    supply: 35,
    demand: 92,
    familyGroup: 'Çiçeksi',
    noteTier: 'middle',
    category: 'Çiçeksi - Tatlımsı',
    description: 'Parfümerinin en baştan çıkarıcı ve kremsi beyaz çiçeği; narkotik ve baş döndürücü tüberoz (Orta Nota).',
    priceHistory: makePriceHistory(380)
  },
  {
    id: 'erik',
    name: 'Erik (Koyu Mürdüm)',
    country: 'Fransa',
    countryCode: 'FR',
    flag: '🇫🇷',
    price: 150,
    basePrice: 150,
    exchangeStock: 3800,
    producerCompany: 'Agen Pruneau Parfumerie',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 210,
    productionTime: 210,
    supply: 60,
    demand: 80,
    familyGroup: 'Meyvemsi',
    noteTier: 'middle',
    category: 'Meyvemsi - Tatlımsı',
    description: 'Kadifemsi, zengin ve tatlı likör çağrışımlı koyu mürdüm eriği özü (Orta Nota).',
    priceHistory: makePriceHistory(150)
  },
  {
    id: 'yesil_cay',
    name: 'Yeşil Çay (Kyoto)',
    country: 'Japonya',
    countryCode: 'JP',
    flag: '🇯🇵',
    price: 130,
    basePrice: 130,
    exchangeStock: 4600,
    producerCompany: 'Uji Matcha Botanical',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 220,
    productionTime: 220,
    supply: 70,
    demand: 75,
    familyGroup: 'Yeşilimsi',
    noteTier: 'top',
    category: 'Yeşilimsi - Ferah Çay',
    description: 'Zen bahçelerinin sükunetini taşıyan tazeleyici, otsu ve arındırıcı Japon yeşil çay yaprakları (Üst Nota).',
    priceHistory: makePriceHistory(130)
  },
  {
    id: 'ahududu',
    name: 'Ahududu (Yabani)',
    country: 'Polonya',
    countryCode: 'PL',
    flag: '🇵🇱',
    price: 165,
    basePrice: 165,
    exchangeStock: 3400,
    producerCompany: 'Mazovia Wild Berries',
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime: 215,
    productionTime: 215,
    supply: 55,
    demand: 86,
    familyGroup: 'Meyvemsi',
    noteTier: 'top',
    category: 'Meyvemsi - Tatlımsı',
    description: 'Ormanlık alanlardan toplanan canlı, mayhoş ve ışıltılı yabani kırmızı ahududu taneleri (Üst Nota).',
    priceHistory: makePriceHistory(165)
  }
];

interface WheelRawMaterialSeed {
  id: string;
  name: string;
  familyGroup: OlfactoryFamilyGroup;
  noteTier: NoteType;
  category: string;
  country: string;
  countryCode: string;
  flag: string;
  price: number;
  producerCompany: string;
  description: string;
}

// All remaining raw materials from the Koku Çarkı (10 Aile Grubu & Üst/Orta/Alt Nota Ayrımı)
const WHEEL_RAW_MATERIALS_SEEDS: WheelRawMaterialSeed[] = [
  // ==================== 1. NARENCİYE (Üst Nota) ====================
  { id: 'kan_portakali', name: 'Kan Portakalı', familyGroup: 'Narenciye', noteTier: 'top', category: 'Narenciye - Meyvemsi', country: 'İtalya', countryCode: 'IT', flag: '🇮🇹', price: 118, producerCompany: 'Etna Rosso Agrumi', description: 'Etna yanardağı eteklerinde yetişen yakut kırmızı, tatlı-ekşi kan portakalı esansı (Üst Nota).' },
  { id: 'kumkuat', name: 'Kumkuat', familyGroup: 'Narenciye', noteTier: 'top', category: 'Narenciye - Tatlımsı', country: 'Çin', countryCode: 'CN', flag: '🇨🇳', price: 125, producerCompany: 'Canton Golden Citrus', description: 'Kabuğuyla birlikte sıkılan minyatür altın portakal; canlı ve aromatik narenciye açılışı (Üst Nota).' },
  { id: 'mandalina', name: 'Mandalina (Bodrum & Sicilya)', familyGroup: 'Narenciye', noteTier: 'top', category: 'Narenciye - Tatlımsı', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 95, producerCompany: 'Bodrum Narenciye Kooperatifi', description: 'Ege kıyılarının neşeli, tatlı ve güneşli yeşil-sarı mandalina kabuğu yağı (Üst Nota).' },
  { id: 'misket_limonu', name: 'Misket Limonu (Lime)', familyGroup: 'Narenciye', noteTier: 'top', category: 'Narenciye - Yeşilimsi', country: 'Meksika', countryCode: 'MX', flag: '🇲🇽', price: 105, producerCompany: 'Veracruz Verde Lime', description: 'Karayip esintili keskin, köpüklü ve zümrüt yeşili misket limonu distilatı (Üst Nota).' },
  { id: 'portakal', name: 'Portakal (Valensiya)', familyGroup: 'Narenciye', noteTier: 'top', category: 'Narenciye - Tatlımsı', country: 'İspanya', countryCode: 'ES', flag: '🇪🇸', price: 90, producerCompany: 'Valencia Sol Citrus', description: 'Sulu, sıcak ve neşe veren klasik Akdeniz tatlı portakal kabuğu özü (Üst Nota).' },
  { id: 'sitron', name: 'Sitron (Ağaç Kavunu)', familyGroup: 'Narenciye', noteTier: 'top', category: 'Narenciye - Odunsu', country: 'İtalya', countryCode: 'IT', flag: '🇮🇹', price: 132, producerCompany: 'Amalfi Cedro Nobile', description: 'Antik Akdeniz mirası kalın kabuklu sitron; kuru, odunsu ve aristokratik narenciye (Üst Nota).' },
  { id: 'tangerin', name: 'Tangerin', familyGroup: 'Narenciye', noteTier: 'top', category: 'Narenciye - Meyvemsi', country: 'Fas', countryCode: 'MA', flag: '🇲🇦', price: 108, producerCompany: 'Tangier Grove Extracts', description: 'Tanca bahçelerinden toplanan parlak turuncu, balımsı ve enerjik tangerin yağı (Üst Nota).' },
  { id: 'yuzu', name: 'Yuzu (Japon Narenciyesi)', familyGroup: 'Narenciye', noteTier: 'top', category: 'Narenciye - Yeşilimsi', country: 'Japonya', countryCode: 'JP', flag: '🇯🇵', price: 195, producerCompany: 'Shikoku Yuzu Craft', description: 'Greyfurt ve mandalina arasında egzotik, zen ferahlığı sunan nadir Japon yuzu meyvesi (Üst Nota).' },

  // ==================== 2. MEYVEMSİ (Üst & Orta Nota) ====================
  // Üst Notalar
  { id: 'armut', name: 'Armut (Anjou)', familyGroup: 'Meyvemsi', noteTier: 'top', category: 'Meyvemsi - Çiçeksi', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 115, producerCompany: 'Loire Verger Arômes', description: 'Sulu, kristal berraklığında ve zarif tatlılıkta Fransız Anjou armudu akoru (Üst Nota).' },
  { id: 'cilek', name: 'Çilek (Yabani Dağ Çileği)', familyGroup: 'Meyvemsi', noteTier: 'top', category: 'Meyvemsi - Tatlımsı', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 135, producerCompany: 'Périgord Fraise Bois', description: 'Orman açıklıklarında yetişen kokulu, neşeli ve kırmızı dağ çileği esansı (Üst Nota).' },
  { id: 'frenk_uzumu', name: 'Frenk Üzümü (Cassis)', familyGroup: 'Meyvemsi', noteTier: 'top', category: 'Meyvemsi - Yeşilimsi', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 185, producerCompany: 'Bourgogne Cassis Prestige', description: 'Burgunya bağlarından toplanan keskin, yeşil-meyvemsi ve sofistike siyah frenk üzümü tomurcuğu (Üst Nota).' },
  { id: 'karpuz', name: 'Karpuz', familyGroup: 'Meyvemsi', noteTier: 'top', category: 'Meyvemsi - Ferah', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 92, producerCompany: 'Dicle Meyve Özleri', description: 'Yaz sıcağında serinletici, sulu ve ozonik kırmızı karpuz akoru (Üst Nota).' },
  { id: 'kavun', name: 'Kavun (Charentais)', familyGroup: 'Meyvemsi', noteTier: 'top', category: 'Meyvemsi - Tatlımsı', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 105, producerCompany: 'Cavaillon Melon Arômes', description: 'Provence güneşinde olgunlaşmış bal kokulu, kremsi ve sulu kavun notası (Üst Nota).' },
  { id: 'ravent', name: 'Ravent (Rhubarb)', familyGroup: 'Meyvemsi', noteTier: 'top', category: 'Meyvemsi - Yeşilimsi', country: 'Birleşik Krallık', countryCode: 'GB', flag: '🇬🇧', price: 158, producerCompany: 'Yorkshire Botanical Extracts', description: 'Ekşi, çıtır yeşil saplı ve çarpıcı modern niş parfüm açılışı sağlayan ravent (Üst Nota).' },
  // Orta Notalar
  { id: 'ayva', name: 'Ayva (Altın Anadolu)', familyGroup: 'Meyvemsi', noteTier: 'middle', category: 'Meyvemsi - Baharatlı', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 128, producerCompany: 'Sakarya Botanik A.Ş.', description: 'Gül ve elma çağrışımlı, hafif buruk ve asil altın ayva kalp notası (Orta Nota).' },
  { id: 'bogurtlen', name: 'Böğürtlen', familyGroup: 'Meyvemsi', noteTier: 'middle', category: 'Meyvemsi - Odunsu', country: 'Birleşik Krallık', countryCode: 'GB', flag: '🇬🇧', price: 148, producerCompany: 'Cotswold Berry Oils', description: 'Koyu mor, misk çalılıklarını andıran derin ve tatlı-mayhoş yabani böğürtlen (Orta Nota).' },
  { id: 'incir', name: 'İncir (Ege Sütlü İnciri)', familyGroup: 'Meyvemsi', noteTier: 'middle', category: 'Meyvemsi - Odunsu', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 172, producerCompany: 'Aydın İncir Esansları', description: 'Güneşte ısınmış sütlü incir meyvesi; kremsi, yeşil ve Akdeniz sıcaklığı dolu (Orta Nota).' },
  { id: 'kayisi', name: 'Kayısı (Malatya Gün Kurusu)', familyGroup: 'Meyvemsi', noteTier: 'middle', category: 'Meyvemsi - Pudramsı', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 138, producerCompany: 'Fırat Vadisi Aromatik', description: 'Kadifemsi dokulu, osmantus çiçeğiyle uyumlu altın kayısı nektarı (Orta Nota).' },
  { id: 'mango', name: 'Mango (Alphonso)', familyGroup: 'Meyvemsi', noteTier: 'middle', category: 'Meyvemsi - Tatlımsı', country: 'Hindistan', countryCode: 'IN', flag: '🇮🇳', price: 155, producerCompany: 'Ratnagiri Tropical Extracts', description: 'Tropikal güneşin en zengin meyvesi; yoğun, kremsi ve egzotik Alphonso mangosu (Orta Nota).' },
  { id: 'seftali', name: 'Şeftali (Beyaz Kadife)', familyGroup: 'Meyvemsi', noteTier: 'middle', category: 'Meyvemsi - Çiçeksi', country: 'İtalya', countryCode: 'IT', flag: '🇮🇹', price: 142, producerCompany: 'Romagna Pesca Flora', description: 'Şipre ve çiçeksi parfümlere ten sıcaklığı katan kadife kabuklu beyaz şeftali (Orta Nota).' },

  // ==================== 3. YEŞİLİMSİ (Üst & Orta Nota) ====================
  // Üst Notalar
  { id: 'adacayi', name: 'Adaçayı (Anadolu)', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Aromatik', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 112, producerCompany: 'Ege Herbal Distillers', description: 'Gümüş yapraklı, kafurlu ve arındırıcı Akdeniz adaçayı esansı (Üst Nota).' },
  { id: 'ardic', name: 'Ardıç Meyvesi (Juniper)', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Odunsu', country: 'Hırvatistan', countryCode: 'HR', flag: '🇭🇷', price: 145, producerCompany: 'Dalmatia Pine & Berry', description: 'Kristal berraklığında, cin tonik ferahlığı ve çamsı serinlik veren ardıç tohumu (Üst Nota).' },
  { id: 'bambu', name: 'Bambu', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Odunsu', country: 'Japonya', countryCode: 'JP', flag: '🇯🇵', price: 128, producerCompany: 'Arashiyama Green Lab', description: 'Yağmur sonrası bambu ormanlarının sulu, dingin ve minimalist yeşil notası (Üst Nota).' },
  { id: 'calone', name: 'Calone (Deniz Meltemi)', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Sucul', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 190, producerCompany: 'Grasse Marine Molecules', description: 'Okyanus rüzgarı, kavunsu ferahlık ve istiridye kabuğu esintisi taşıyan ikonik sucul molekül (Üst Nota).' },
  { id: 'domates_yapragi', name: 'Domates Yaprağı', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Aromatik', country: 'İtalya', countryCode: 'IT', flag: '🇮🇹', price: 136, producerCompany: 'Toscana Orto Botanico', description: 'Güneşli İtalyan bahçelerinde ezilmiş taze domates yaprağının canlı, baharatlı-yeşil kokusu (Üst Nota).' },
  { id: 'feslegen', name: 'Fesleğen (Kraliyet Reyhanı)', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Baharatlı', country: 'İtalya', countryCode: 'IT', flag: '🇮🇹', price: 115, producerCompany: 'Liguria Verde Essenze', description: 'Cenova kıyılarından toplanan tatlı-anasonik ve ferahlatıcı taze fesleğen yaprağı (Üst Nota).' },
  { id: 'galbanum', name: 'Galbanum (Kasnı Otu Reçinesi)', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Reçineli', country: 'İran', countryCode: 'IR', flag: '🇮🇷', price: 245, producerCompany: 'Zagros Green Resins', description: 'Parfümerinin en yoğun zümrüt yeşili notası; ezilmiş kökler ve bahar ormanı patlaması (Üst Nota).' },
  { id: 'kekik', name: 'Kekik (Dağ Kekiği)', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Baharatlı', country: 'Yunanistan', countryCode: 'GR', flag: '🇬🇷', price: 98, producerCompany: 'Olympus Herbal Oils', description: 'Kayalık yamaçlarda güneşle kavrulan sıcak, otsu ve antiseptik dağ kekiği yağı (Üst Nota).' },
  { id: 'melekotu', name: 'Melekotu (Angelica)', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Pudramsı', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 275, producerCompany: 'Auvergne Racines Nobles', description: 'Topraksı, biberimsi ve bitkisel misk derinliği sunan yüksek niş melekotu tohumu (Üst Nota).' },
  { id: 'mercankosk', name: 'Mercanköşk (Marjoram)', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Aromatik', country: 'Mısır', countryCode: 'EG', flag: '🇪🇬', price: 108, producerCompany: 'Nile Delta Herbs', description: 'Yumuşak kafurlu, sıcak otsu ve klasik fujer parfümlerine derinlik katan mercanköşk (Üst Nota).' },
  { id: 'ozon_akoru', name: 'Ozon Akoru', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Ferah Hava', country: 'İsviçre', countryCode: 'CH', flag: '🇨🇭', price: 162, producerCompany: 'Alpine Air Synthetics', description: 'Yüksek dağ zirvelerindeki yıldırım sonrası temiz, elektrikli ve soğuk gökyüzü ferahlığı (Üst Nota).' },
  { id: 'petigrain', name: 'Petigrain (Turunç Yaprağı)', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Narenciye', country: 'Paraguay', countryCode: 'PY', flag: '🇵🇾', price: 118, producerCompany: 'Asunción Citrus Leaf Co.', description: 'Acı portakal ağacının körpe dal ve yapraklarından damıtılan odunsu-yeşil kolonya klasiği (Üst Nota).' },
  { id: 'tarhun', name: 'Tarhun (Estragon)', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Baharatlı', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 134, producerCompany: 'Provence Estragon Lab', description: 'İnce anasonik, tatlı-otsu ve sofistike Fransız tarhun yaprağı esansı (Üst Nota).' },
  { id: 'yeni_kesilmis_cim', name: 'Yeni Kesilmiş Çim', familyGroup: 'Yeşilimsi', noteTier: 'top', category: 'Yeşilimsi - Çiğ Yeşil', country: 'Birleşik Krallık', countryCode: 'GB', flag: '🇬🇧', price: 120, producerCompany: 'Sussex Meadow Aromas', description: 'Sabah çiyi üzerinde yeni biçilmiş yemyeşil çimenlerin canlandırıcı doğal kokusu (Üst Nota).' },
  // Orta Notalar
  { id: 'davana', name: 'Davana', familyGroup: 'Yeşilimsi', noteTier: 'middle', category: 'Yeşilimsi - Meyvemsi', country: 'Hindistan', countryCode: 'IN', flag: '🇮🇳', price: 235, producerCompany: 'Mysore Botanicals', description: 'Kuru meyve, şarap ve sıcak ot nüansları taşıyan bukalemun karakterli egzotik Hint otu (Orta Nota).' },
  { id: 'deniz_yosunu', name: 'Deniz Yosunu (Laminaria)', familyGroup: 'Yeşilimsi', noteTier: 'middle', category: 'Yeşilimsi - Okyanus', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 178, producerCompany: 'Bretagne Algues Parfums', description: 'Atlantik kıyılarından toplanan koyu yeşil, mineralik ve iyotlu okyanus yosunu absolütü (Orta Nota).' },
  { id: 'incir_yapragi', name: 'İncir Yaprağı', familyGroup: 'Yeşilimsi', noteTier: 'middle', category: 'Yeşilimsi - Odunsu', country: 'Yunanistan', countryCode: 'GR', flag: '🇬🇷', price: 165, producerCompany: 'Aegean Fig Grove', description: 'Kırıldığında akan beyaz incir sütü ve gölgeli yeşil yaprakların ikonik Akdeniz kokusu (Orta Nota).' },
  { id: 'menekse_yapragi', name: 'Menekşe Yaprağı', familyGroup: 'Yeşilimsi', noteTier: 'middle', category: 'Yeşilimsi - Pudramsı', country: 'Mısır', countryCode: 'EG', flag: '🇪🇬', price: 290, producerCompany: 'Faiyum Violet Leaf Co.', description: 'Nemli toprak, salatalık ferahlığı ve metalik yeşil zarafet sunan asil menekşe yaprağı absolütü (Orta Nota).' },
  { id: 'misk_adacayi', name: 'Misk Adaçayı (Clary Sage)', familyGroup: 'Yeşilimsi', noteTier: 'middle', category: 'Yeşilimsi - Amber', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 152, producerCompany: 'Drôme Aromatiques', description: 'Amberimsi, çay ve lavanta nüanslarıyla parfüm kalbini yumuşatan misk adaçayı (Orta Nota).' },
  { id: 'papatya', name: 'Papatya (Mavi Roma Papatyası)', familyGroup: 'Yeşilimsi', noteTier: 'middle', category: 'Yeşilimsi - Çiçeksi', country: 'İtalya', countryCode: 'IT', flag: '🇮🇹', price: 215, producerCompany: 'Lazio Camomilla Nobile', description: 'Elmayı andıran tatlı-otsu, dinginleştirici ve altın sarısı Roma papatyası yağı (Orta Nota).' },
  { id: 'kuru_ot', name: 'Kuru Ot (Biçilmiş Saman)', familyGroup: 'Yeşilimsi', noteTier: 'middle', category: 'Yeşilimsi - Tatlımsı', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 142, producerCompany: 'Cévennes Foin Absolue', description: 'Güneşte kurutulmuş ekinlerin sıcak kumarin, tütün ve bal çağrışımlı pastoral kokusu (Orta Nota).' },

  // ==================== 4. BAHARATLI (Üst & Orta Nota) ====================
  // Üst Notalar
  { id: 'anason', name: 'Anason (Çeşme Anasonu)', familyGroup: 'Baharatlı', noteTier: 'top', category: 'Baharatlı - Tatlımsı', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 108, producerCompany: 'Çeşme Aromatik Tohum', description: 'Tatlı, ferah ve meyan köküyle mükemmel uyum sağlayan Ege anason tohumu (Üst Nota).' },
  { id: 'kisnis_tohumu', name: 'Kişniş Tohumu', familyGroup: 'Baharatlı', noteTier: 'top', category: 'Baharatlı - Yeşilimsi', country: 'Fas', countryCode: 'MA', flag: '🇲🇦', price: 115, producerCompany: 'Casablanca Spice Traders', description: 'Ezildiğinde narenciye ve odunsu-baharatlı ışıltı yayan aromatik kişniş tohumu (Üst Nota).' },
  { id: 'yildiz_anason', name: 'Yıldız Anason (Badyan)', familyGroup: 'Baharatlı', noteTier: 'top', category: 'Baharatlı - Tatlımsı', country: 'Vietnam', countryCode: 'VN', flag: '🇻🇳', price: 138, producerCompany: 'Lạng Sơn Star Spice', description: 'Sekiz köşeli yıldız formunda, egzotik ve kristalimsi baharat ferahlığı (Üst Nota).' },
  { id: 'zencefil', name: 'Zencefil (Taze Kök)', familyGroup: 'Baharatlı', noteTier: 'top', category: 'Baharatlı - Narenciye', country: 'Nijerya', countryCode: 'NG', flag: '🇳🇬', price: 145, producerCompany: 'Kaduna Ginger Extracts', description: 'Limonsu, yakıcı ve enerji patlaması yaratan taze zencefil kökü distilatı (Üst Nota).' },
  // Orta Notalar
  { id: 'karanfil', name: 'Karanfil (Zanzibar Tomurcuğu)', familyGroup: 'Baharatlı', noteTier: 'middle', category: 'Baharatlı - Amber', country: 'Tanzanya', countryCode: 'TZ', flag: '🇹🇿', price: 165, producerCompany: 'Zanzibar Clove Royalty', description: 'Sıcak, öjenol zengini ve oryantal kompozisyonlara derinlik katan karanfil tomurcuğu (Orta Nota).' },
  { id: 'kimyon', name: 'Kimyon', familyGroup: 'Baharatlı', noteTier: 'middle', category: 'Baharatlı - Deri', country: 'Hindistan', countryCode: 'IN', flag: '🇮🇳', price: 122, producerCompany: 'Rajasthan Spice Mills', description: 'Tensel, sıcak, topraksı ve cesur niş parfümlere hayvanî çekicilik katan kimyon (Orta Nota).' },
  { id: 'muskat', name: 'Muskat (Küçük Hindistan Cevizi)', familyGroup: 'Baharatlı', noteTier: 'middle', category: 'Baharatlı - Odunsu', country: 'Endonezya', countryCode: 'ID', flag: '🇮🇩', price: 175, producerCompany: 'Banda Islands Nutmeg', description: 'Baharat Adaları’ndan gelen odunsu, sıcak ve kremsi-baharatlı muskat cevizi yağı (Orta Nota).' },
  { id: 'yenibahar', name: 'Yenibahar (Pimento)', familyGroup: 'Baharatlı', noteTier: 'middle', category: 'Baharatlı - Tatlımsı', country: 'Jamaika', countryCode: 'JM', flag: '🇯🇲', price: 168, producerCompany: 'Kingston Allspice Co.', description: 'Tarçın, karanfil ve muskatın tek meyvede birleştiği Karayip yenibahar özütü (Orta Nota).' },

  // ==================== 5. ÇİÇEKSİ (Orta Nota) ====================
  { id: 'neroli', name: 'Neroli (Tunus Portakal Çiçeği Yağı)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Narenciye', country: 'Tunus', countryCode: 'TN', flag: '🇹🇳', price: 320, producerCompany: 'Nabeul Fleur d’Oranger', description: 'Buhar distilasyonuyla elde edilen ışıltılı, temiz ve asil Tunus neroli esansı (Orta Nota).' },
  { id: 'campaka', name: 'Çampaka (Altın Manolya)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Amber', country: 'Hindistan', countryCode: 'IN', flag: '🇮🇳', price: 350, producerCompany: 'Tamil Nadu Sacred Blooms', description: 'Tapınak bahçelerinin kutsal turuncu çiçeği; çay, kayısı ve tütsü nüanslı lüks absolüt (Orta Nota).' },
  { id: 'frangipani', name: 'Frangipani (Plumeria)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Tatlımsı', country: 'Endonezya', countryCode: 'ID', flag: '🇮🇩', price: 285, producerCompany: 'Bali Island Blossoms', description: 'Bali adasının kremsi, güneşli, badem ve tropik meyve esintili egzotik çiçeği (Orta Nota).' },
  { id: 'frezya', name: 'Frezya', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Yeşilimsi', country: 'Hollanda', countryCode: 'NL', flag: '🇳🇱', price: 175, producerCompany: 'Aalsmeer Flora Labs', description: 'Kristal berraklığında, hafif biberimsi ve bahar sabahı tazeliği taşıyan frezya çiçeği (Orta Nota).' },
  { id: 'gardenya', name: 'Gardenya (Tahiti & Grasse)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Kremsi', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 315, producerCompany: 'Côte d’Azur White Florals', description: 'Kadifemsi beyaz yapraklı, hindistan cevizi ve yeşil mantar nüanslı baş döndürücü gardenya (Orta Nota).' },
  { id: 'hanimeli', name: 'Hanımeli', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Tatlımsı', country: 'Birleşik Krallık', countryCode: 'GB', flag: '🇬🇧', price: 188, producerCompany: 'Kentish Garden Extracts', description: 'Yaz akşamlarında nektar damlatan balımsı, yasemin ve portakal çiçeği dokulu hanımeli (Orta Nota).' },
  { id: 'hedione', name: 'Hedione (Işıltılı Yasemin Molekülü)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Ferah', country: 'İsviçre', countryCode: 'CH', flag: '🇨🇭', price: 210, producerCompany: 'Genève Aroma Science', description: 'Parfüme havadar bir ışıltı, yayılım (sillage) ve şeffaf yasemin zarafeti katan molekül (Orta Nota).' },
  { id: 'jonquil', name: 'Jonquil (Fulya / Yabani Nergis)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Yeşilimsi', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 295, producerCompany: 'Lozère Narcisse Co.', description: 'Güneşli sarı taç yapraklarından gelen balımsı, yeşil ve hafif hayvansal bahar çiçeği (Orta Nota).' },
  { id: 'kadife_cicegi', name: 'Kadife Çiçeği (Tagetes)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Meyvemsi', country: 'Meksika', countryCode: 'MX', flag: '🇲🇽', price: 165, producerCompany: 'Oaxaca Marigold Oils', description: 'Elma, çarkıfelek meyvesi ve aromatik ot nüansları taşıyan altın turuncu kadife çiçeği (Orta Nota).' },
  { id: 'karanfil_cicegi', name: 'Karanfil Çiçeği (Carnation)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Baharatlı', country: 'İspanya', countryCode: 'ES', flag: '🇪🇸', price: 225, producerCompany: 'Andalucía Clavel Absolue', description: 'Klasik parfümerinin pudramsı ve baharatlı-çiçeksi asalet simgesi kırmızı karanfil çiçeği (Orta Nota).' },
  { id: 'kasimpati', name: 'Kasımpatı (Krizantem)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Yeşilimsi', country: 'Japonya', countryCode: 'JP', flag: '🇯🇵', price: 198, producerCompany: 'Kyoto Imperial Flora', description: 'Sonbahar bahçelerinin serin, kafurlu, yeşil-çiçeksi ve asil imparatorluk çiçeği (Orta Nota).' },
  { id: 'leylak', name: 'Leylak (Mor Bahar Leylağı)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Pudramsı', country: 'Bulgaristan', countryCode: 'BG', flag: '🇧🇬', price: 190, producerCompany: 'Balkan Blossom Labs', description: 'Nisan yağmurları sonrası açan bademimsi, pudramsı ve romantik mor leylak salkımları (Orta Nota).' },
  { id: 'lotus', name: 'Lotus (Mavi Nilüfer)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Sucul', country: 'Tayland', countryCode: 'TH', flag: '🇹🇭', price: 245, producerCompany: 'Siam Sacred Lotus', description: 'Durgun tapınak sularında açan sucul, şeffaf, mistik ve sakinleştirici lotus çiçeği (Orta Nota).' },
  { id: 'manolya', name: 'Manolya', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Narenciye', country: 'Çin', countryCode: 'CN', flag: '🇨🇳', price: 265, producerCompany: 'Yunnan Magnolia Craft', description: 'Limonumsu ferahlıkla başlayan, kremsi ve şampanya zarafetinde beyaz manolya çiçeği (Orta Nota).' },
  { id: 'mimoza', name: 'Mimoza (Altın Akasya)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Pudramsı', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 275, producerCompany: 'Tanneron Mimosa d’Or', description: 'Fransız Rivierası’nı sarıya boyayan pudramsı, balımsı ve badem dokulu mimoza puf çiçekleri (Orta Nota).' },
  { id: 'morsalkim', name: 'Morsalkım (Wisteria)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Tatlımsı', country: 'Japonya', countryCode: 'JP', flag: '🇯🇵', price: 220, producerCompany: 'Ashikaga Fuji Blooms', description: 'Salkım salkım dökülen mor çiçeklerin havadar, tatlı-baharatlı ve şiirsel kokusu (Orta Nota).' },
  { id: 'muge', name: 'Müge (İnci Çiçeği)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Yeşilimsi', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 240, producerCompany: 'Nantes Muguet de Mai', description: '1 Mayıs bahar uğuru; bembeyaz çan çiçeklerinin çiğli, yeşil ve masum zarafeti (Orta Nota).' },
  { id: 'nergis', name: 'Nergis (Fransız Dağ Nergisi)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Yeşilimsi', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 335, producerCompany: 'Aubrac Narcisse Sauvage', description: 'Yüksek yaylalardan toplanan yoğun yeşil, balımsı ve hipnotik doğal nergis absolütü (Orta Nota).' },
  { id: 'sambac_yasemini', name: 'Sambac Yasemini (Arap Yasemini)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Tatlımsı', country: 'Hindistan', countryCode: 'IN', flag: '🇮🇳', price: 345, producerCompany: 'Madurai Jasmine Absolutes', description: 'Grasse yaseminine göre daha meyvemsi, portakal çiçeği ve misk dokulu egzotik gece yasemini (Orta Nota).' },
  { id: 'sardunya', name: 'Sardunya (Mısır Itırı)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Yeşilimsi', country: 'Mısır', countryCode: 'EG', flag: '🇪🇬', price: 168, producerCompany: 'Nile Rose Geranium', description: 'Gül, nane ve limon yaprağı nüanslarını birleştiren, maskülen ve feminen kalp notası (Orta Nota).' },
  { id: 'sumbul', name: 'Sümbül (Mavi Bahar Sümbülü)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Yeşilimsi', country: 'Hollanda', countryCode: 'NL', flag: '🇳🇱', price: 230, producerCompany: 'Keukenhof Bulb Extracts', description: 'Canlı, çiğ yeşil saplı ve baş döndürücü bahar bahçesi kokulu mavi sümbül (Orta Nota).' },
  { id: 'sakayik', name: 'Şakayık (Peony)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Meyvemsi', country: 'Çin', countryCode: 'CN', flag: '🇨🇳', price: 225, producerCompany: 'Luoyang Royal Peony', description: 'Gül ve liçi meyvesini andıran, çiğli, taze ve ipeksi pembe şakayık yaprakları (Orta Nota).' },
  { id: 'turk_gulu', name: 'Türk Gülü (Isparta Rosa Damascena)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Baharatlı', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 390, producerCompany: 'Isparta Gülbirlik Özel Koleksiyon', description: 'Dünya parfümerisinin tacı; Isparta yaylalarından toplanan balımsı, baharatlı ve kırmızı Türk gülü yağı (Orta Nota).' },
  { id: 'ylang_ylang', name: 'Ylang-Ylang (Komor Adaları)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Tatlımsı', country: 'Komorlar', countryCode: 'KM', flag: '🇰🇲', price: 280, producerCompany: 'Moroni Fleurs des Îles', description: 'Çiçeklerin çiçeği; muz, yasemin ve güneş kremi sıcaklığı taşıyan egzotik sarı çiçek (Orta Nota).' },
  { id: 'zambak', name: 'Zambak (Kazablanka Beyaz Zambak)', familyGroup: 'Çiçeksi', noteTier: 'middle', category: 'Çiçeksi - Baharatlı', country: 'Fas', countryCode: 'MA', flag: '🇲🇦', price: 260, producerCompany: 'Rabat White Lily Co.', description: 'Vanilyamsı, mumsu ve hafif karanfil baharatı taşıyan görkemli beyaz zambak (Orta Nota).' },

  // ==================== 6. PUDRAMSI (Orta & Alt Nota) ====================
  // Orta Notalar
  { id: 'heliotrop', name: 'Heliotrop (Badem Çiçeği)', familyGroup: 'Pudramsı', noteTier: 'middle', category: 'Pudramsı - Tatlımsı', country: 'Peru', countryCode: 'PE', flag: '🇵🇪', price: 210, producerCompany: 'Lima Purple Flora', description: 'Vanilya, badem ezmesi ve kiraz çiçeğini andıran yumuşak pudramsı mor çiçek (Orta Nota).' },
  { id: 'menekse_cicegi', name: 'Menekşe Çiçeği (Parma)', familyGroup: 'Pudramsı', noteTier: 'middle', category: 'Pudramsı - Çiçeksi', country: 'İtalya', countryCode: 'IT', flag: '🇮🇹', price: 265, producerCompany: 'Parma Violetta Ducale', description: 'İyonon zengini, nostaljik, tatlı-pudramsı ve odunsu zarafet taşıyan mor menekşe (Orta Nota).' },
  // Alt Notalar
  { id: 'ambrette', name: 'Ambrette (Miskamber Tohumu)', familyGroup: 'Pudramsı', noteTier: 'base', category: 'Pudramsı - Misk', country: 'Hindistan', countryCode: 'IN', flag: '🇮🇳', price: 370, producerCompany: 'Deccan Botanical Musk', description: 'Doğadaki en nadide bitkisel misk tohumu; armut, kehribar ve temiz ten sıcaklığı (Alt Nota).' },
  { id: 'cashmeran', name: 'Cashmeran', familyGroup: 'Pudramsı', noteTier: 'base', category: 'Pudramsı - Odunsu', country: 'İsviçre', countryCode: 'CH', flag: '🇨🇭', price: 235, producerCompany: 'Zürich Fine Molecules', description: 'Kaşmir şal dokunuşu gibi kadifemsi, miskli, baharatlı ve pudramsı-odunsu dip nota (Alt Nota).' },
  { id: 'galaxolide', name: 'Galaxolide', familyGroup: 'Pudramsı', noteTier: 'base', category: 'Pudramsı - Temiz Misk', country: 'Amerika Birleşik Devletleri', countryCode: 'US', flag: '🇺🇸', price: 165, producerCompany: 'New Jersey Aroma Labs', description: 'Berrak, çiçeksi-pudramsı ve yeni yıkanmış ipek çarşaf temizliği veren misk molekülü (Alt Nota).' },
  { id: 'habanolide', name: 'Habanolide', familyGroup: 'Pudramsı', noteTier: 'base', category: 'Pudramsı - Metalik Misk', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 195, producerCompany: 'Lyon Synthèse Noble', description: 'Sıcak ütü buharı, balmumu ve zarif pudramsı kalıcılık sağlayan lüks makrosiklik misk (Alt Nota).' },
  { id: 'pirinc_pudrasi', name: 'Pirinç Pudrası Akoru', familyGroup: 'Pudramsı', noteTier: 'base', category: 'Pudramsı - Tatlımsı', country: 'Japonya', countryCode: 'JP', flag: '🇯🇵', price: 175, producerCompany: 'Kanazawa Silk & Rice', description: 'Buharda pişmiş yasemin pirinci ve ipeksi kozmetik pudra zarafeti sunan yumuşak akor (Alt Nota).' },
  { id: 'susen_koku', name: 'Süsen Kökü (Orris Butter)', familyGroup: 'Pudramsı', noteTier: 'base', category: 'Pudramsı - Odunsu', country: 'İtalya', countryCode: 'IT', flag: '🇮🇹', price: 490, producerCompany: 'Chianti Iris Rizoma', description: 'Yıllarca dinlendirilmiş süsen rizomlarından elde edilen kremsi, menekşe-pudra dokulu dip nota (Alt Nota).' },
  { id: 'talk_akoru', name: 'Talk Akoru', familyGroup: 'Pudramsı', noteTier: 'base', category: 'Pudramsı - Sabunsu', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 145, producerCompany: 'Paris Poudre Parfumerie', description: 'Bebeksi temizlik, vanilyalı pudra pufu ve nostaljik berber dükkanı ferahlığı (Alt Nota).' },

  // ==================== 7. TATLIMSI (Orta & Alt Nota) ====================
  // Orta Notalar
  { id: 'hindistan_cevizi', name: 'Hindistan Cevizi', familyGroup: 'Tatlımsı', noteTier: 'middle', category: 'Tatlımsı - Meyvemsi', country: 'Filipinler', countryCode: 'PH', flag: '🇵🇭', price: 135, producerCompany: 'Palawan Coconut Oils', description: 'Kremsi, sütlü ve egzotik plaj esintisi taşıyan tropikal hindistan cevizi özü (Orta Nota).' },
  { id: 'kuru_meyve_akoru', name: 'Kuru Meyve Akoru', familyGroup: 'Tatlımsı', noteTier: 'middle', category: 'Tatlımsı - Baharatlı', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 158, producerCompany: 'Anadolu Kuru Meyve Esans', description: 'Hurma, kuru incir ve kuru üzümün konyak fıçılarında dinlenmiş zengin ve sıcak akoru (Orta Nota).' },
  { id: 'olmez_cicek', name: 'Ölmez Çiçek (Immortelle)', familyGroup: 'Tatlımsı', noteTier: 'middle', category: 'Tatlımsı - Baharatlı', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 295, producerCompany: 'Corse Immortelle Maquis', description: 'Korsika makiliklerinden toplanan akçaağaç şurubu, köri ve karamelize bal kokulu altın çiçek (Orta Nota).' },
  { id: 'pamuk_seker', name: 'Pamuk Şeker', familyGroup: 'Tatlımsı', noteTier: 'middle', category: 'Tatlımsı - Meyvemsi', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 130, producerCompany: 'Gourmandise de Paris', description: 'Havadar, karamelize çilek ve vanilya bulutu hissi veren neşeli gurme kalp notası (Orta Nota).' },
  { id: 'patlamis_misir', name: 'Patlamış Mısır (Tereyağlı)', familyGroup: 'Tatlımsı', noteTier: 'middle', category: 'Tatlımsı - Kavruk Gurme', country: 'Amerika Birleşik Devletleri', countryCode: 'US', flag: '🇺🇸', price: 142, producerCompany: 'Midwest Gourmand Notes', description: 'Kavrulmuş tahıl, sıcak tereyağı ve tuzlu karamel kontrastı yaratan modern gurme akor (Orta Nota).' },
  { id: 'rom_akoru', name: 'Rom Akoru (Koyu Karayip Romu)', familyGroup: 'Tatlımsı', noteTier: 'middle', category: 'Tatlımsı - Odunsu', country: 'Barbados', countryCode: 'BB', flag: '🇧🇧', price: 195, producerCompany: 'Bridgetown Cask Aromas', description: 'Meşe fıçılarda yıllanmış şeker kamışı romunun boozy, karamelize ve baş döndürücü sıcaklığı (Orta Nota).' },
  { id: 'sut_akoru', name: 'Süt Akoru (Sıcak Krema)', familyGroup: 'Tatlımsı', noteTier: 'middle', category: 'Tatlımsı - Pudramsı', country: 'İsviçre', countryCode: 'CH', flag: '🇨🇭', price: 150, producerCompany: 'Gruyère Lactonic Labs', description: 'Sandal ağacı ve çiçekleri kadife gibi saran laktonik, kremsi ve yatıştırıcı süt buharı (Orta Nota).' },
  { id: 'seker_pamugu_hamuru', name: 'Şeker Pamuğu Hamuru (Marshmallow)', familyGroup: 'Tatlımsı', noteTier: 'middle', category: 'Tatlımsı - Pudramsı', country: 'İtalya', countryCode: 'IT', flag: '🇮🇹', price: 148, producerCompany: 'Milano Dolcezza Lab', description: 'Portakal çiçeği ve vanilyayla birleştiğinde bağımlılık yaratan puf şekerleme akoru (Orta Nota).' },
  { id: 'tatli_badem', name: 'Tatlı Badem', familyGroup: 'Tatlımsı', noteTier: 'middle', category: 'Tatlımsı - Çiçeksi', country: 'İspanya', countryCode: 'ES', flag: '🇪🇸', price: 162, producerCompany: 'Alicante Almendra Dulce', description: 'Yumuşak, sütlü badem şekeri ve heliotrop uyumlu zarif gurme orta nota.' },
  // Alt Notalar
  { id: 'akcaagac_surubu', name: 'Akçaağaç Şurubu (Maple)', familyGroup: 'Tatlımsı', noteTier: 'base', category: 'Tatlımsı - Odunsu', country: 'Kanada', countryCode: 'CA', flag: '🇨🇦', price: 175, producerCompany: 'Québec Érable Doré', description: 'Koyu kehribar rengi, odunsu-karamelize ve yoğun kalıcılık veren Kanada akçaağaç özü (Alt Nota).' },
  { id: 'benzoin', name: 'Benzoin (Siam Aselbent Reçinesi)', familyGroup: 'Tatlımsı', noteTier: 'base', category: 'Tatlımsı - Amber', country: 'Laos', countryCode: 'LA', flag: '🇱🇦', price: 245, producerCompany: 'Luang Prabang Benzoin', description: 'Vanilya dondurması ve sıcak reçine kokulu, parfümün ömrünü uzatan asil Siam benzoini (Alt Nota).' },
  { id: 'butterscotch', name: 'Butterscotch (Tereyağlı Karamel)', familyGroup: 'Tatlımsı', noteTier: 'base', category: 'Tatlımsı - Gurme', country: 'Birleşik Krallık', countryCode: 'GB', flag: '🇬🇧', price: 155, producerCompany: 'Edinburgh Toffee Aromas', description: 'Esmer şeker ve tereyağının ağır ateşte erimesiyle oluşan zengin gurme dip nota (Alt Nota).' },
  { id: 'esmer_seker', name: 'Esmer Şeker (Demerara)', familyGroup: 'Tatlımsı', noteTier: 'base', category: 'Tatlımsı - Amber', country: 'Brezilya', countryCode: 'BR', flag: '🇧🇷', price: 125, producerCompany: 'Bahia Cane Extracts', description: 'Melas zengini, hafif dumanlı ve sıcak şeker kamışı kristalleri (Alt Nota).' },
  { id: 'etil_maltol', name: 'Etil Maltol', familyGroup: 'Tatlımsı', noteTier: 'base', category: 'Tatlımsı - Meyvemsi', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 180, producerCompany: 'Grasse Gourmand Molecules', description: 'Modern gurme parfümeriyi başlatan karamelize şeker ve fırınlanmış meyve molekülü (Alt Nota).' },
  { id: 'karamel', name: 'Karamel (Tuzlu Fransız Karameli)', familyGroup: 'Tatlımsı', noteTier: 'base', category: 'Tatlımsı - Gurme', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 148, producerCompany: 'Bretagne Caramel Arômes', description: 'Altın rengi erimiş şeker ve deniz tuzu dokunuşlu baştan çıkarıcı dip nota (Alt Nota).' },
  { id: 'kestane', name: 'Kestane (Közlenmiş Marron Glacé)', familyGroup: 'Tatlımsı', noteTier: 'base', category: 'Tatlımsı - Odunsu', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 168, producerCompany: 'Bursa Uludağ Botanik', description: 'Kış şöminesi başında közlenmiş kestane ve vanilyalı kestane şekeri sıcaklığı (Alt Nota).' },
  { id: 'peru_balsami', name: 'Peru Balsamı', familyGroup: 'Tatlımsı', noteTier: 'base', category: 'Tatlımsı - Amber', country: 'El Salvador', countryCode: 'SV', flag: '🇸🇻', price: 230, producerCompany: 'Sonsonate Balsam Coast', description: 'Vanilya, tarçın ve sıcak reçine kokulu koyu renkli doğal balsam; muazzam fiksatif (Alt Nota).' },
  { id: 'pralin', name: 'Pralin (Kavrulmuş Fındık & Şeker)', familyGroup: 'Tatlımsı', noteTier: 'base', category: 'Tatlımsı - Odunsu', country: 'Belçika', countryCode: 'BE', flag: '🇧🇪', price: 172, producerCompany: 'Bruxelles Chocolatier Notes', description: 'Karamelize fındık, badem ve sütlü çikolata dolgulu lüks Belçika pralin akoru (Alt Nota).' },

  // ==================== 8. ODUNSU (Orta & Alt Nota) ====================
  // Orta Notalar
  { id: 'cam', name: 'Çam (Sibirya & Kazdağı Çamı)', familyGroup: 'Odunsu', noteTier: 'middle', category: 'Odunsu - Yeşilimsi', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 118, producerCompany: 'Kazdağı Orman Ürünleri', description: 'Reçineli çam iğneleri ve serin orman havası taşıyan canlandırıcı odunsu kalp notası (Orta Nota).' },
  { id: 'gul_agaci', name: 'Gül Ağacı (Brezilya Bois de Rose)', familyGroup: 'Odunsu', noteTier: 'middle', category: 'Odunsu - Çiçeksi', country: 'Brezilya', countryCode: 'BR', flag: '🇧🇷', price: 240, producerCompany: 'Manaus Rosewood Co.', description: 'Linalool zengini; pembe gül, kakule ve kremsi sıcak odun dokusunu birleştiren zarif ağaç (Orta Nota).' },
  { id: 'selvi', name: 'Selvi (Toskana Servi Ağacı)', familyGroup: 'Odunsu', noteTier: 'middle', category: 'Odunsu - Yeşilimsi', country: 'İtalya', countryCode: 'IT', flag: '🇮🇹', price: 150, producerCompany: 'Siena Cipresso Oils', description: 'Akdeniz tepelerindeki asil servi ağaçlarının aromatik, reçineli ve dumanlı-yeşil odun kokusu (Orta Nota).' },
  // Alt Notalar
  { id: 'akigalawood', name: 'Akigalawood', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Baharatlı', country: 'İsviçre', countryCode: 'CH', flag: '🇨🇭', price: 340, producerCompany: 'Givaudan Biotech Reserve', description: 'Paçulinin biyoteknolojiyle işlenmesiyle elde edilen biberimsi, ud ve asil odun molekülü (Alt Nota).' },
  { id: 'amberwood', name: 'Amberwood', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Amber', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 265, producerCompany: 'Grasse Boisé Synthèse', description: 'Kuru sedir ağacı ile sıcak altın kehribarın modern, güçlü ve yayılımı yüksek birleşimi (Alt Nota).' },
  { id: 'guaiac_agaci', name: 'Guaiac Ağacı (Palo Santo Akrabası)', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Dumanlı', country: 'Paraguay', countryCode: 'PY', flag: '🇵🇾', price: 225, producerCompany: 'Gran Chaco Guaiac Wood', description: 'Tütsülenmiş çay, gül ve kamp ateşi dumanı taşıyan yoğun ve gizemli Güney Amerika ağacı (Alt Nota).' },
  { id: 'iso_e_super', name: 'Iso E Super', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Pudramsı', country: 'Amerika Birleşik Devletleri', countryCode: 'US', flag: '🇺🇸', price: 195, producerCompany: 'IFF Aroma Molecules', description: 'Tenle bütünleşip kadifemsi sedir ve feromon etkisi yaratan efsanevi şeffaf odun molekülü (Alt Nota).' },
  { id: 'javanol', name: 'Javanol (Ultra Kremsi Sandal)', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Tatlımsı', country: 'İsviçre', countryCode: 'CH', flag: '🇨🇭', price: 280, producerCompany: 'Helvetia Sandalwood Lab', description: 'Sıvı metal parlaklığında, gül ve greyfurt nüanslı olağanüstü kalıcı modern sandal ağacı molekülü (Alt Nota).' },
  { id: 'kasmir_agaci', name: 'Kaşmir Ağacı (Cashmere Wood)', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Tatlımsı', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 245, producerCompany: 'Paris Boisé Cashmere', description: 'Amber, vanilya ve yumuşak miskle sarılmış sıcak ve lüks kaşmir ağacı akoru (Alt Nota).' },
  { id: 'kaya_yosunu', name: 'Kaya Yosunu (Meşe Yosunu / Oakmoss)', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Yeşilimsi', country: 'Kuzey Makedonya', countryCode: 'MK', flag: '🇲🇰', price: 260, producerCompany: 'Balkan Forest Moss Co.', description: 'Şipre ve fujer parfümlerinin vazgeçilmez temeli; nemli orman zemini, deri ve koyu yosun (Alt Nota).' },
  { id: 'kust_koku', name: 'Kust Kökü (Costus)', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Deri', country: 'Hindistan', countryCode: 'IN', flag: '🇮🇳', price: 295, producerCompany: 'Himalaya Root Distillers', description: 'Himalaya eteklerinden toplanan sıcak, tensel, eski ahşap ve tütsü nüanslı nadir kök (Alt Nota).' },
  { id: 'norlimbanol', name: 'Norlimbanol', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Amber', country: 'İsviçre', countryCode: 'CH', flag: '🇨🇭', price: 310, producerCompany: 'Geneva Extreme Woods', description: 'Kemik kadar kuru, keskin sedir, paçuli ve tütsü gücü veren ultra kalıcı niş odun molekülü (Alt Nota).' },
  { id: 'palo_santo', name: 'Palo Santo (Kutsal Ağaç)', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Amber', country: 'Ekvador', countryCode: 'EC', flag: '🇪🇨', price: 275, producerCompany: 'Guayaquil Sacred Wood', description: 'İnka şamanlarının kutsal ağacı; nane, çam, limon ve tatlı tütsü dumanı içeren mistik odun (Alt Nota).' },
  { id: 'suruklenmis_odun', name: 'Sürüklenmiş Odun (Driftwood)', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Deniz Tuzu', country: 'Portekiz', countryCode: 'PT', flag: '🇵🇹', price: 185, producerCompany: 'Atlantic Coast Woods', description: 'Okyanus dalgaları ve tuzlu güneşle ağarmış kıyı kütüklerinin mineralik-odunsu kokusu (Alt Nota).' },
  { id: 'tik_agaci', name: 'Tik Ağacı (Teakwood)', familyGroup: 'Odunsu', noteTier: 'base', category: 'Odunsu - Baharatlı', country: 'Myanmar', countryCode: 'MM', flag: '🇲🇲', price: 215, producerCompany: 'Mandalay Royal Teak', description: 'Lüks yat güverteleri ve baharat sandıklarını andıran yağlı, sıcak ve asil tik ağacı (Alt Nota).' },

  // ==================== 9. AMBER (Orta & Alt Nota) ====================
  // Orta Notalar
  { id: 'elemi', name: 'Elemi Reçinesi', familyGroup: 'Amber', noteTier: 'middle', category: 'Amber - Narenciye', country: 'Filipinler', countryCode: 'PH', flag: '🇵🇭', price: 185, producerCompany: 'Manila Canarium Resins', description: 'Limonlu, pembe biberimsi ve tütsülü; üst notalarla dip reçineleri birbirine bağlayan taze reçine (Orta Nota).' },
  { id: 'koknar_recinesi', name: 'Köknar Reçinesi', familyGroup: 'Amber', noteTier: 'middle', category: 'Amber - Yeşilimsi', country: 'Kanada', countryCode: 'CA', flag: '🇨🇦', price: 175, producerCompany: 'Boreal Fir Extracts', description: 'Karlı kuzey ormanlarındaki köknar ağaçlarından sızan çamsı, reçineli ve tatlımsı öz (Orta Nota).' },
  { id: 'sakiz_agaci', name: 'Sakız Ağacı (Çeşme & Sakız Adası Mastik)', familyGroup: 'Amber', noteTier: 'middle', category: 'Amber - Yeşilimsi', country: 'Yunanistan', countryCode: 'GR', flag: '🇬🇷', price: 290, producerCompany: 'Chios Mastic Growers', description: 'Ege’nin kristal damla sakızı; çamsı, ferah, balzamik ve asil reçine kalp notası (Orta Nota).' },
  // Alt Notalar
  { id: 'ambergris_akoru', name: 'Ambergris Akoru (Akamber)', familyGroup: 'Amber', noteTier: 'base', category: 'Amber - Deniz Tuzu', country: 'Yeni Zelanda', countryCode: 'NZ', flag: '🇳🇿', price: 450, producerCompany: 'Tasman Sea Ambergris Lab', description: 'Okyanus tuzu, güneşle ısınmış ten ve tatlı-hayvansal derinlik sunan kraliyet akamber akoru (Alt Nota).' },
  { id: 'cistus', name: 'Cistus (Laden Çiçeği)', familyGroup: 'Amber', noteTier: 'base', category: 'Amber - Çiçeksi', country: 'İspanya', countryCode: 'ES', flag: '🇪🇸', price: 255, producerCompany: 'Andalusia Cistus Ladanifer', description: 'Akdeniz güneşinde kavrulan laden çalılarının sıcak, balımsı ve otsu-amber özü (Alt Nota).' },
  { id: 'gunluk', name: 'Günlük (Anadolu Sığla Yağı)', familyGroup: 'Amber', noteTier: 'base', category: 'Amber - Tatlımsı', country: 'Türkiye', countryCode: 'TR', flag: '🇹🇷', price: 310, producerCompany: 'Köyceğiz Sığla Ormanları', description: 'Yalnızca Güneybatı Anadolu’da yetişen endemik sığla ağacının tarçınımsı, sıcak ve büyüleyici balsamı (Alt Nota).' },
  { id: 'kopal_recinesi', name: 'Kopal Reçinesi', familyGroup: 'Amber', noteTier: 'base', category: 'Amber - Odunsu', country: 'Meksika', countryCode: 'MX', flag: '🇲🇽', price: 235, producerCompany: 'Yucatán Sacred Copal', description: 'Antik Maya tapınaklarında yakılan altın sarısı, çam ve limon nüanslı kutsal tütsü reçinesi (Alt Nota).' },
  { id: 'koknar_balsami', name: 'Köknar Balsamı (Fir Balsam)', familyGroup: 'Amber', noteTier: 'base', category: 'Amber - Odunsu', country: 'Kanada', countryCode: 'CA', flag: '🇨🇦', price: 225, producerCompany: 'Laurentian Balsam Co.', description: 'Reçineli, reçel gibi tatlımsı ve kış ormanı sıcaklığı veren koyu köknar balsamı absolütü (Alt Nota).' },
  { id: 'labdanum', name: 'Labdanum (Koyu Laden Reçinesi)', familyGroup: 'Amber', noteTier: 'base', category: 'Amber - Deri', country: 'İspanya', countryCode: 'ES', flag: '🇪🇸', price: 275, producerCompany: 'Sevilla Labdanum Royalty', description: 'Kehribar (Amber) akorunun ana omurgası; deri, erik, bal ve duman nüanslı zengin reçine (Alt Nota).' },
  { id: 'mur', name: 'Mür (Somali Kızıl Moka Reçinesi)', familyGroup: 'Amber', noteTier: 'base', category: 'Amber - Baharatlı', country: 'Somali', countryCode: 'SO', flag: '🇸🇴', price: 320, producerCompany: 'Horn of Africa Myrrh', description: 'Antik çağlardan beri krallara sunulan meyan kökümsü, sıcak, gizemli ve meditatif mür reçinesi (Alt Nota).' },
  { id: 'opoponaks', name: 'Opoponaks (Tatlı Mür)', familyGroup: 'Amber', noteTier: 'base', category: 'Amber - Tatlımsı', country: 'Etiyopya', countryCode: 'ET', flag: '🇪🇹', price: 295, producerCompany: 'Addis Sweet Resins', description: 'Klasik mürden daha sıcak, karamelize, balzamik ve lavanta-amber uyumlu kraliyet reçinesi (Alt Nota).' },
  { id: 'styraks', name: 'Styraks (Kara Günlük Reçinesi)', familyGroup: 'Amber', noteTier: 'base', category: 'Amber - Deri', country: 'Honduras', countryCode: 'HN', flag: '🇭🇳', price: 260, producerCompany: 'Copán Liquidambar', description: 'Çiçeksi, deri ve dumanlı-tarçın nüanslarıyla oryantal parfümlere omurga veren reçine (Alt Nota).' },

  // ==================== 10. DERİ (Alt Nota) ====================
  { id: 'cade', name: 'Cade (Ardıç Katranı)', familyGroup: 'Deri', noteTier: 'base', category: 'Deri - Odunsu', country: 'İspanya', countryCode: 'ES', flag: '🇪🇸', price: 230, producerCompany: 'Pyrenees Juniper Tar', description: 'Yanan ardıç odunlarından elde edilen yoğun dumanlı, kamp ateşi ve vahşi deri notası (Alt Nota).' },
  { id: 'civet_akoru', name: 'Civet Akoru (Misk Kedisi Akoru)', familyGroup: 'Deri', noteTier: 'base', category: 'Deri - Çiçeksi', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 340, producerCompany: 'Grasse Animalic Synthèse', description: 'Etik sentetik olarak üretilen; yasemin ve gül parfümlerine şehvetli, kadifemsi derinlik katan klasik akor (Alt Nota).' },
  { id: 'hyraceum', name: 'Hyraceum (Afrika Taşı)', familyGroup: 'Deri', noteTier: 'base', category: 'Deri - Amber', country: 'Güney Afrika', countryCode: 'ZA', flag: '🇿🇦', price: 390, producerCompany: 'Cederberg Cape Essences', description: 'Yüzyıllar boyunca taşlaşmış doğal organik reçine; misk, deri, tütün ve ud derinliği (Alt Nota).' },
  { id: 'kastoreum', name: 'Kastoreum Akoru', familyGroup: 'Deri', noteTier: 'base', category: 'Deri - Dumanlı', country: 'Kanada', countryCode: 'CA', flag: '🇨🇦', price: 310, producerCompany: 'Ontario Vintage Leather Lab', description: 'Klasik Rus derisi akorlarının kalbi; sıcak, dumanlı, vanilya ve siyah deri eldiven kokusu (Alt Nota).' },
  { id: 'truf_mantari', name: 'Trüf Mantarı (Siyah Périgord)', familyGroup: 'Deri', noteTier: 'base', category: 'Deri - Topraksı', country: 'Fransa', countryCode: 'FR', flag: '🇫🇷', price: 440, producerCompany: 'Dordogne Truffe Noire', description: 'Orkide ve paçuliyle efsanevi uyum yakalayan karanlık, topraksı, gurme-deri lüks trüf mantarı (Alt Nota).' }
];

function buildWheelRawMaterial(seed: WheelRawMaterialSeed, index: number): RawMaterial {
  const shippingTime = 175 + ((index * 29) % 260);
  const supply = Math.max(25, Math.min(85, Math.round(95 - seed.price / 7)));
  const demand = Math.max(58, Math.min(96, Math.round(52 + seed.price / 9)));
  const exchangeStock = Math.max(900, Math.round(6200 - seed.price * 10));

  return {
    id: seed.id,
    name: seed.name,
    country: seed.country,
    countryCode: seed.countryCode,
    flag: seed.flag,
    price: seed.price,
    basePrice: seed.price,
    exchangeStock,
    producerCompany: seed.producerCompany,
    taxRate: 0.20,
    logisticsRate: 0.15,
    wasteRate: 0.25,
    shippingTime,
    productionTime: shippingTime,
    supply,
    demand,
    familyGroup: seed.familyGroup,
    noteTier: seed.noteTier,
    category: seed.category,
    description: seed.description,
    priceHistory: makePriceHistory(seed.price)
  };
}

const RAW_MATERIALS_DATA: RawMaterial[] = [
  ...CORE_RAW_MATERIALS,
  ...WHEEL_RAW_MATERIALS_SEEDS.map((seed, idx) => buildWheelRawMaterial(seed, idx))
];

export const INITIAL_RAW_MATERIALS: RawMaterial[] = RAW_MATERIALS_DATA.map((mat) => ({
  ...mat,
  image: RAW_MATERIAL_IMAGES[mat.id]
}));

export function getNoteTierLabel(tier?: NoteType): string {
  if (tier === 'top') return 'Üst Nota';
  if (tier === 'middle') return 'Orta Nota';
  if (tier === 'base') return 'Alt Nota';
  return 'Orta Nota';
}

export function getNoteTierShortLabel(tier?: NoteType): string {
  if (tier === 'top') return 'Üst';
  if (tier === 'middle') return 'Orta';
  if (tier === 'base') return 'Alt';
  return 'Orta';
}

export function getNoteTierBadgeStyle(tier?: NoteType): string {
  if (tier === 'top') return 'bg-sky-500/15 text-sky-300 border-sky-500/40';
  if (tier === 'middle') return 'bg-pink-500/15 text-pink-300 border-pink-500/40';
  return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
}

const RAW_MATERIAL_FAMILY_MAP = new Map<string, OlfactoryFamilyGroup>(
  INITIAL_RAW_MATERIALS.map((m) => [m.id, m.familyGroup || 'Çiçeksi'])
);

export function getRawMaterialFamily(materialId: string): OlfactoryFamilyGroup {
  return RAW_MATERIAL_FAMILY_MAP.get(materialId) || 'Çiçeksi';
}

export function getPerfumeFamilies(noteIds: string[]): OlfactoryFamilyGroup[] {
  const set = new Set<OlfactoryFamilyGroup>();
  for (const id of noteIds) {
    const fam = RAW_MATERIAL_FAMILY_MAP.get(id);
    if (fam) set.add(fam);
  }
  return Array.from(set);
}

export function pickRandom3Families(): OlfactoryFamilyGroup[] {
  const pool = OLFACTORY_FAMILIES_10.map((f) => f.id);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 3);
}

export function format3FamiliesLabel(families?: OlfactoryFamilyGroup[]): string {
  if (!families || families.length === 0) return 'Çiçeksi · Odunsu · Amber';
  return families
    .map((f) => {
      const meta = getFamilyMeta(f);
      return `${meta.emoji} ${meta.name}`;
    })
    .join(' · ');
}

export function getFamilyMeta(family?: OlfactoryFamilyGroup): OlfactoryFamilyMeta {
  return (
    OLFACTORY_FAMILIES_10.find((f) => f.id === family) ||
    OLFACTORY_FAMILIES_10[4] // default Çiçeksi
  );
}

export function getFlagEmoji(countryCode?: string): string {
  if (!countryCode) return '🌐';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export function formatCountryDisplay(material: { country: string; countryCode?: string; flag?: string }): string {
  return material.country;
}

export function formatCountryNameWithCode(material: { country: string; countryCode?: string }): string {
  return material.country;
}

export function formatDurationToMinutesAndSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m} dk ${s.toString().padStart(2, '0')} sn`;
}

export function formatNoteCategory(category?: string): string {
  if (!category) return 'Genel Nota';
  return category
    .replace(/\s*&\s*|\s*\/\s*|\s*,\s*/g, ' - ')
    .replace(/\s*·\s*/g, ' - ')
    .trim();
}

export function getMaterialYearlyHistory(material: RawMaterial): PricePoint[] {
  const currentPrice = material.price;
  const base = material.basePrice || currentPrice;
  return [
    { timestamp: Date.now() - 365 * 86400000, price: Math.round(base * 0.82 * 10) / 10, label: '12 ay önce' },
    { timestamp: Date.now() - 270 * 86400000, price: Math.round(base * 0.91 * 10) / 10, label: '9 ay önce' },
    { timestamp: Date.now() - 180 * 86400000, price: Math.round(base * 0.87 * 10) / 10, label: '6 ay önce' },
    { timestamp: Date.now() - 90 * 86400000, price: Math.round(base * 1.03 * 10) / 10, label: '3 ay önce' },
    { timestamp: Date.now(), price: currentPrice, label: 'Bugün' }
  ];
}
