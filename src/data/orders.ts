import { MarketOrder } from '../types';

export const INITIAL_ORDERS: MarketOrder[] = [
  {
    id: 'ord_us_001',
    country: 'ABD (New York)',
    countryFlag: '🇺🇸',
    clientName: 'Saks Fifth Luxury Retail',
    productId: 'baccarat_rouge_540',
    productName: 'Rouge 540 Crystal',
    requestedQuantity: 200,
    remainingQuantity: 200,
    pricePerUnit: 580,
    createdAt: Date.now() - 3600000,
    expiresAt: Date.now() + 86400000 * 2, // 2 days
    status: 'active'
  },
  {
    id: 'ord_fr_002',
    country: 'Fransa (Paris)',
    countryFlag: '🇫🇷',
    clientName: 'Galeries Lafayette Haussmann',
    productId: 'chanel_no_5',
    productName: 'No. 5 L\'Élixir',
    requestedQuantity: 150,
    remainingQuantity: 150,
    pricePerUnit: 410,
    createdAt: Date.now() - 1800000,
    expiresAt: Date.now() + 86400000 * 3,
    status: 'active'
  },
  {
    id: 'ord_ae_003',
    country: 'Birleşik Arap Emirlikleri (Dubai)',
    countryFlag: '🇦🇪',
    clientName: 'Dubai Mall Perfumery Club',
    productId: 'tobacco_vanille',
    productName: 'Tobacco Vanille Reserve',
    requestedQuantity: 250,
    remainingQuantity: 250,
    pricePerUnit: 510,
    createdAt: Date.now() - 7200000,
    expiresAt: Date.now() + 86400000 * 1.5,
    status: 'active'
  },
  {
    id: 'ord_gb_004',
    country: 'Birleşik Krallık (Londra)',
    countryFlag: '🇬🇧',
    clientName: 'Harrods Knightsbridge Boutique',
    productId: 'creed_aventus',
    productName: 'Aventus Imperial',
    requestedQuantity: 180,
    remainingQuantity: 180,
    pricePerUnit: 540,
    createdAt: Date.now() - 5400000,
    expiresAt: Date.now() + 86400000 * 2.5,
    status: 'active'
  },
  {
    id: 'ord_jp_005',
    country: 'Japonya (Tokyo)',
    countryFlag: '🇯🇵',
    clientName: 'Ginza Six Premium Fragrances',
    productId: 'black_opium',
    productName: 'Black Opium Nuit',
    requestedQuantity: 120,
    remainingQuantity: 120,
    pricePerUnit: 390,
    createdAt: Date.now() - 900000,
    expiresAt: Date.now() + 86400000 * 4,
    status: 'active'
  },
  {
    id: 'ord_de_006',
    country: 'Almanya (Berlin)',
    countryFlag: '🇩🇪',
    clientName: 'KaDeWe Department Store',
    productId: 'dior_sauvage',
    productName: 'Sauvage Sauvage',
    requestedQuantity: 300,
    remainingQuantity: 300,
    pricePerUnit: 400,
    createdAt: Date.now() - 2500000,
    expiresAt: Date.now() + 86400000 * 2,
    status: 'active'
  }
];
