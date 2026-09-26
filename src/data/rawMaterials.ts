import { RawMaterial, PricePoint } from '../types';
import { RAW_MATERIAL_IMAGES } from './rawMaterialImages';

const RAW_MATERIALS_DATA: RawMaterial[] = [
  {
    id: 'vanilya',
    name: 'Vanilya',
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
    shippingTime: 438, // 7 dk 18 sn
    productionTime: 438,
    supply: 68,
    demand: 82,
    category: 'Gurme & Tatlı',
    description: 'Madagaskar ovalarından toplanan, yoğun ve kadifemsi koku profiline sahip doğal bourbon vanilyası.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 131 },
      { timestamp: Date.now() - 90000, price: 133 },
      { timestamp: Date.now() - 60000, price: 132 },
      { timestamp: Date.now() - 30000, price: 134.5 },
      { timestamp: Date.now(), price: 135 }
    ]
  },
  {
    id: 'safran',
    name: 'Safran',
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
    shippingTime: 227, // 3 dk 47 sn
    productionTime: 227,
    supply: 35,
    demand: 90,
    category: 'Baharat',
    description: 'Dünyanın en değerli baharatı; sıcak, metalik ve deri çağrışımlı benzersiz lüks nota.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 412 },
      { timestamp: Date.now() - 90000, price: 415 },
      { timestamp: Date.now() - 60000, price: 418 },
      { timestamp: Date.now() - 30000, price: 419 },
      { timestamp: Date.now(), price: 420 }
    ]
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
    shippingTime: 262, // 4 dk 22 sn
    productionTime: 262,
    supply: 80,
    demand: 55,
    category: 'Tatlı & Odunsu',
    description: 'Güneydoğu Anadolu nehir yataklarından hasat edilen zengin anasonik tatlılıkta meyan kökü.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 92 },
      { timestamp: Date.now() - 90000, price: 91 },
      { timestamp: Date.now() - 60000, price: 90.5 },
      { timestamp: Date.now() - 30000, price: 89.5 },
      { timestamp: Date.now(), price: 90 }
    ]
  },
  {
    id: 'vetiver',
    name: 'Vetiver',
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
    shippingTime: 486, // 8 dk 06 sn
    productionTime: 486,
    supply: 50,
    demand: 75,
    category: 'Topraksı & Yeşil',
    description: 'Haiti kökenli nemli toprak, tütsü ve duman nüanslarına sahip derin vetiver kökü ekstresi.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 205 },
      { timestamp: Date.now() - 90000, price: 207 },
      { timestamp: Date.now() - 60000, price: 208.5 },
      { timestamp: Date.now() - 30000, price: 209 },
      { timestamp: Date.now(), price: 210 }
    ]
  },
  {
    id: 'bergamot',
    name: 'Kalabriyen Bergamot',
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
    shippingTime: 195, // 3 dk 15 sn
    productionTime: 195,
    supply: 75,
    demand: 80,
    category: 'Narenciye',
    description: 'Akdeniz güneşinde olgunlaşan ışıltılı, ferahlatıcı ve canlandırıcı bergamot kabuğu yağı.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 112 },
      { timestamp: Date.now() - 90000, price: 113.5 },
      { timestamp: Date.now() - 60000, price: 114 },
      { timestamp: Date.now() - 30000, price: 115.5 },
      { timestamp: Date.now(), price: 115 }
    ]
  },
  {
    id: 'yasemin',
    name: 'Grasse Yasemini',
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
    shippingTime: 310, // 5 dk 10 sn
    productionTime: 310,
    supply: 40,
    demand: 88,
    category: 'Çiçeksi',
    description: 'Şafak vakti elle toplanan, sarhoş edici ve zengin çiçeksi karakterli Grasse yasemin absolütü.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 352 },
      { timestamp: Date.now() - 90000, price: 356 },
      { timestamp: Date.now() - 60000, price: 358 },
      { timestamp: Date.now() - 30000, price: 361 },
      { timestamp: Date.now(), price: 360 }
    ]
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
    shippingTime: 180, // 3 dk 00 sn
    productionTime: 180,
    supply: 60,
    demand: 85,
    category: 'Misk & Hayvansal',
    description: 'Temiz, pudramsı ve kalıcı sabitsi hissiyat veren yüksek saflıkta sentetik beyaz misk.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 180 },
      { timestamp: Date.now() - 90000, price: 182 },
      { timestamp: Date.now() - 60000, price: 183.5 },
      { timestamp: Date.now() - 30000, price: 184 },
      { timestamp: Date.now(), price: 185 }
    ]
  },
  {
    id: 'sandal_agaci',
    name: 'Sandal Ağacı',
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
    shippingTime: 375, // 6 dk 15 sn
    productionTime: 375,
    supply: 45,
    demand: 84,
    category: 'Odunsu',
    description: 'Kremsi, yumuşak ve manevi derinliğe sahip klasik Mysore sandal ağacı yağı.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 304 },
      { timestamp: Date.now() - 90000, price: 307 },
      { timestamp: Date.now() - 60000, price: 309 },
      { timestamp: Date.now() - 30000, price: 311 },
      { timestamp: Date.now(), price: 310 }
    ]
  },
  {
    id: 'sedir_agaci',
    name: 'Atlas Sedir Ağacı',
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
    shippingTime: 240, // 4 dk 00 sn
    productionTime: 240,
    supply: 70,
    demand: 65,
    category: 'Odunsu',
    description: 'Kuru, asil kalem talaşı ve reçinemsi odun dokusuna sahip berrak sedir özü.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 152 },
      { timestamp: Date.now() - 90000, price: 154 },
      { timestamp: Date.now() - 60000, price: 156 },
      { timestamp: Date.now() - 30000, price: 155 },
      { timestamp: Date.now(), price: 155 }
    ]
  },
  {
    id: 'paculi',
    name: 'Endonezya Paçuli',
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
    shippingTime: 395, // 6 dk 35 sn
    productionTime: 395,
    supply: 58,
    demand: 76,
    category: 'Topraksı & Odunsu',
    description: 'Fermente edilmiş yapraklardan damıtılan karanlık, topraksı ve oryantal paçuli esansı.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 172 },
      { timestamp: Date.now() - 90000, price: 173 },
      { timestamp: Date.now() - 60000, price: 176 },
      { timestamp: Date.now() - 30000, price: 175.5 },
      { timestamp: Date.now(), price: 175 }
    ]
  },
  {
    id: 'gul',
    name: 'Mayıs Gülü',
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
    shippingTime: 285, // 4 dk 45 sn
    productionTime: 285,
    supply: 48,
    demand: 82,
    category: 'Çiçeksi',
    description: 'Rosa centifolia taç yapraklarından elde edilen balımsı, zengin ve aristokratik gül esansı.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 290 },
      { timestamp: Date.now() - 90000, price: 292 },
      { timestamp: Date.now() - 60000, price: 296 },
      { timestamp: Date.now() - 30000, price: 294 },
      { timestamp: Date.now(), price: 295 }
    ]
  },
  {
    id: 'lavanta',
    name: 'Fransız Lavantası',
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
    shippingTime: 215, // 3 dk 35 sn
    productionTime: 215,
    supply: 72,
    demand: 68,
    category: 'Aromatik',
    description: 'Yüksek irtifa Provence dağlarından toplanan taze, yatıştırıcı ve aromatik lavanta yağı.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 128 },
      { timestamp: Date.now() - 90000, price: 126 },
      { timestamp: Date.now() - 60000, price: 125.5 },
      { timestamp: Date.now() - 30000, price: 124 },
      { timestamp: Date.now(), price: 125 }
    ]
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
    shippingTime: 205, // 3 dk 25 sn
    productionTime: 205,
    supply: 52,
    demand: 89,
    category: 'Amber & Odunsu',
    description: 'Modern parfümerinin omurgası; mineralik, tensel ve kehribarımsı sıcak molekül.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 232 },
      { timestamp: Date.now() - 90000, price: 236 },
      { timestamp: Date.now() - 60000, price: 238 },
      { timestamp: Date.now() - 30000, price: 241 },
      { timestamp: Date.now(), price: 240 }
    ]
  },
  {
    id: 'kahve',
    name: 'Kavrulmuş Kahve',
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
    shippingTime: 460, // 7 dk 40 sn
    productionTime: 460,
    supply: 65,
    demand: 79,
    category: 'Gurme & Kavruk',
    description: 'Derin kavrulmuş Arabica çekirdeklerinden elde edilen koyu, enerjik ve bağımlılık yaratan koku.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 138 },
      { timestamp: Date.now() - 90000, price: 139 },
      { timestamp: Date.now() - 60000, price: 142 },
      { timestamp: Date.now() - 30000, price: 141 },
      { timestamp: Date.now(), price: 140 }
    ]
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
    shippingTime: 250, // 4 dk 10 sn
    productionTime: 250,
    supply: 54,
    demand: 72,
    category: 'Gurme & Fındıksı',
    description: 'Badem kabuklarından distile edilen marzipan andıran zengin ve gurme nüans.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 190 },
      { timestamp: Date.now() - 90000, price: 192 },
      { timestamp: Date.now() - 60000, price: 194 },
      { timestamp: Date.now() - 30000, price: 196 },
      { timestamp: Date.now(), price: 195 }
    ]
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
    shippingTime: 445, // 7 dk 25 sn
    productionTime: 445,
    supply: 62,
    demand: 74,
    category: 'Baharat',
    description: 'Meyvemsi, ışıltılı ve keskin olmayan tatlımsı pembe tane biber özütü.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 158 },
      { timestamp: Date.now() - 90000, price: 159 },
      { timestamp: Date.now() - 60000, price: 162 },
      { timestamp: Date.now() - 30000, price: 161 },
      { timestamp: Date.now(), price: 160 }
    ]
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
    shippingTime: 235, // 3 dk 55 sn
    productionTime: 235,
    supply: 56,
    demand: 78,
    category: 'Çiçeksi & Narenciye',
    description: 'Akdeniz portakal ağaçlarının beyaz çiçeklerinden gelen tatlı ve neşeli çiçeksi koku.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 210 },
      { timestamp: Date.now() - 90000, price: 212 },
      { timestamp: Date.now() - 60000, price: 216 },
      { timestamp: Date.now() - 30000, price: 214 },
      { timestamp: Date.now(), price: 215 }
    ]
  },
  {
    id: 'karabiber',
    name: 'Karabiber',
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
    shippingTime: 360, // 6 dk 00 sn
    productionTime: 360,
    supply: 76,
    demand: 64,
    category: 'Baharat',
    description: 'Keskin, kuru ve dinamik baharatlı sıcaklık veren Malabar karabiber yağı.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 112 },
      { timestamp: Date.now() - 90000, price: 111 },
      { timestamp: Date.now() - 60000, price: 110 },
      { timestamp: Date.now() - 30000, price: 109.5 },
      { timestamp: Date.now(), price: 110 }
    ]
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
    shippingTime: 410, // 6 dk 50 sn
    productionTime: 410,
    supply: 52,
    demand: 70,
    category: 'Baharat',
    description: 'Uyuşturucu narenciyeli kıvılcım ve hafif metalik baharatlı titreşim.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 166 },
      { timestamp: Date.now() - 90000, price: 168 },
      { timestamp: Date.now() - 60000, price: 171 },
      { timestamp: Date.now() - 30000, price: 169 },
      { timestamp: Date.now(), price: 170 }
    ]
  },
  {
    id: 'ananas',
    name: 'Tropikal Ananas',
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
    shippingTime: 470, // 7 dk 50 sn
    productionTime: 470,
    supply: 66,
    demand: 83,
    category: 'Meyvemsi',
    description: 'Sulu, tatlı ve mayhoş tropik ananas akoru; enerjik ve ferahlatıcı.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 126 },
      { timestamp: Date.now() - 90000, price: 128 },
      { timestamp: Date.now() - 60000, price: 131 },
      { timestamp: Date.now() - 30000, price: 129.5 },
      { timestamp: Date.now(), price: 130 }
    ]
  },
  {
    id: 'elma',
    name: 'Yeşil Elma',
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
    shippingTime: 220, // 3 dk 40 sn
    productionTime: 220,
    supply: 82,
    demand: 60,
    category: 'Meyvemsi',
    description: 'Gevrek, sulu ve canlı yeşil granny smith elma notası.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 98 },
      { timestamp: Date.now() - 90000, price: 96 },
      { timestamp: Date.now() - 60000, price: 95.5 },
      { timestamp: Date.now() - 30000, price: 94.5 },
      { timestamp: Date.now(), price: 95 }
    ]
  },
  {
    id: 'hus_agaci',
    name: 'Huş Ağacı Katranı',
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
    shippingTime: 330, // 5 dk 30 sn
    productionTime: 330,
    supply: 55,
    demand: 77,
    category: 'Deri & Dumanlı',
    description: 'Tütsülenmiş deri, odun ateşi ve maskülen duman efektli huş ağacı distilatı.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 176 },
      { timestamp: Date.now() - 90000, price: 178 },
      { timestamp: Date.now() - 60000, price: 181 },
      { timestamp: Date.now() - 30000, price: 179 },
      { timestamp: Date.now(), price: 180 }
    ]
  },
  {
    id: 'tütün_yapragi',
    name: 'Küba Tütün Yaprağı',
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
    shippingTime: 480, // 8 dk 00 sn
    productionTime: 480,
    supply: 44,
    demand: 86,
    category: 'Tütün & Reçine',
    description: 'Kurutulmuş puro tütün yapraklarının balımsı, sıcak ve odunsu zenginliği.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 252 },
      { timestamp: Date.now() - 90000, price: 255 },
      { timestamp: Date.now() - 60000, price: 258 },
      { timestamp: Date.now() - 30000, price: 262 },
      { timestamp: Date.now(), price: 260 }
    ]
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
    shippingTime: 450, // 7 dk 30 sn
    productionTime: 450,
    supply: 50,
    demand: 80,
    category: 'Gurme & Balzamik',
    description: 'Kumarin zengini, vanilyayı andıran fakat badem ve saman nüansları taşıyan lüks tohum.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 215 },
      { timestamp: Date.now() - 90000, price: 218 },
      { timestamp: Date.now() - 60000, price: 221 },
      { timestamp: Date.now() - 30000, price: 219.5 },
      { timestamp: Date.now(), price: 220 }
    ]
  },
  {
    id: 'kakao',
    name: 'Kakao Çekirdeği',
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
    shippingTime: 430, // 7 dk 10 sn
    productionTime: 430,
    supply: 58,
    demand: 75,
    category: 'Gurme & Çikolata',
    description: 'Saf bitter çikolata ve kuru meyve aromalarına sahip kıymetli kakao ekstraktı.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 162 },
      { timestamp: Date.now() - 90000, price: 164 },
      { timestamp: Date.now() - 60000, price: 166 },
      { timestamp: Date.now() - 30000, price: 165 },
      { timestamp: Date.now(), price: 165 }
    ]
  },
  {
    id: 'aldehitler',
    name: 'Sentetik Aldehitler C-11',
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
    shippingTime: 185, // 3 dk 05 sn
    productionTime: 185,
    supply: 65,
    demand: 71,
    category: 'Sentetik & Sabunsu',
    description: 'Şampanya köpüğü gibi patlayan, buzlu narenciyeli ve sabunsu klasik Fransız aldehitleri.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 148 },
      { timestamp: Date.now() - 90000, price: 149 },
      { timestamp: Date.now() - 60000, price: 151 },
      { timestamp: Date.now() - 30000, price: 150.5 },
      { timestamp: Date.now(), price: 150 }
    ]
  },
  {
    id: 'bakir',
    name: 'Bakır (Metalik Akor)',
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
    shippingTime: 272, // 4 dk 32 sn
    productionTime: 272,
    supply: 55,
    demand: 68,
    category: 'Metalik · Madensel · Fütüristik',
    description: 'Modern niş parfümeride soğuk buharlı metal, ozonik kıvılcım ve mineralik canlılık hissi veren avangart bakır akoru.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 160 },
      { timestamp: Date.now() - 90000, price: 162 },
      { timestamp: Date.now() - 60000, price: 163 },
      { timestamp: Date.now() - 30000, price: 166 },
      { timestamp: Date.now(), price: 165 }
    ]
  },
  {
    id: 'greyfurt',
    name: 'Florida Greyfurtu',
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
    category: 'Narenciye',
    description: 'Acımsı, sulu ve canlı narenciye tazeliği; modern parfümerinin ışıltılı ve enerjik açılış notası.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 118 },
      { timestamp: Date.now() - 90000, price: 119 },
      { timestamp: Date.now() - 60000, price: 121 },
      { timestamp: Date.now() - 30000, price: 120.5 },
      { timestamp: Date.now(), price: 120 }
    ]
  },
  {
    id: 'tarcin',
    name: 'Seylan Tarçını',
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
    category: 'Baharat & Sıcak',
    description: 'Seylan adasının en saf kabuklarından damıtılan sıcak, tatlımsı ve odunsu lüks baharat esansı.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 225 },
      { timestamp: Date.now() - 90000, price: 228 },
      { timestamp: Date.now() - 60000, price: 231 },
      { timestamp: Date.now() - 30000, price: 229 },
      { timestamp: Date.now(), price: 230 }
    ]
  },
  {
    id: 'visne',
    name: 'Kara Kiraz / Vişne',
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
    category: 'Meyvemsi & Gurme',
    description: 'Derin bordo, tatlı-mayhoş ve likör çağrışımlı baştan çıkarıcı zengin vişne ve kiraz akoru.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 170 },
      { timestamp: Date.now() - 90000, price: 172 },
      { timestamp: Date.now() - 60000, price: 176 },
      { timestamp: Date.now() - 30000, price: 174 },
      { timestamp: Date.now(), price: 175 }
    ]
  },
  {
    id: 'iris',
    name: 'Floransa İrisi (Orris)',
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
    category: 'Çiçeksi & Pudramsı',
    description: 'Toskana tepelerinde 3 yıl kurutulup damıtılan, dünyanın en pahalı ve asil pudramsı çiçeksi orris kökü.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 450 },
      { timestamp: Date.now() - 90000, price: 455 },
      { timestamp: Date.now() - 60000, price: 462 },
      { timestamp: Date.now() - 30000, price: 458 },
      { timestamp: Date.now(), price: 460 }
    ]
  },
  {
    id: 'nane',
    name: 'Mitcham Nanesi',
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
    category: 'Aromatik & Ferah',
    description: 'İngiliz kır bahçelerinden toplanan buzlu, aromatik ve keskin ferahlatıcı doğal yeşil nane özü.',
    priceHistory: [
      { timestamp: Date.now() - 120000, price: 108 },
      { timestamp: Date.now() - 90000, price: 106 },
      { timestamp: Date.now() - 60000, price: 105 },
      { timestamp: Date.now() - 30000, price: 104.5 },
      { timestamp: Date.now(), price: 105 }
    ]
  }
];

export const INITIAL_RAW_MATERIALS: RawMaterial[] = RAW_MATERIALS_DATA.map((mat) => ({
  ...mat,
  image: RAW_MATERIAL_IMAGES[mat.id]
}));

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
    .replace(/\s*&\s*|\s*\/\s*|\s*,\s*/g, ' · ')
    .replace(/\s*·\s*/g, ' · ')
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
