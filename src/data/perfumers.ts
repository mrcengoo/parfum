import { Perfumer } from '../types';

export const INITIAL_PERFUMERS: Perfumer[] = [
  {
    id: 'mert_aksoy',
    name: 'Mert Aksoy',
    role: 'Kıdemli Parfümör & Burun',
    noteHarmony: 4,
    trendFit: 3,
    rdLevel: 6,
    logisticsBonus: 0.03, // +%3 Tasarruf
    exportBonus: 0.04,    // +%4 Gelir
    wasteBonus: 0.03,     // +%3 Tasarruf
    designFee: 8000,      // 8.000 TL
    royaltyRate: 0.03,    // %3
    avatarType: 'mert',
    bio: 'Grasse Parfümeri Enstitüsü mezunu. İhracat bağlantıları ve dengeli koku maserasyonu konularında uzman.'
  },
  {
    id: 'arda_sisman',
    name: 'Arda Şişman',
    role: 'Usta Parfümör & Notalar Direktörü',
    noteHarmony: 6,
    trendFit: 3,
    rdLevel: 5,
    logisticsBonus: 0.04, // +%4 Tasarruf
    exportBonus: 0.02,    // +%2 Gelir
    wasteBonus: 0.02,     // +%2 Tasarruf
    designFee: 5000,      // 5.000 TL
    royaltyRate: 0.02,    // %2
    avatarType: 'arda',
    bio: 'Klasik Fransız ekolünü modern koku akorlarıyla birleştiren, olağanüstü nota uyumu yakalayan deneyimli burun.'
  },
  {
    id: 'ece_yalin',
    name: 'Ece Yalın',
    role: 'Trend & İnovasyon Parfümörü',
    noteHarmony: 3,
    trendFit: 6,
    rdLevel: 5,
    logisticsBonus: 0.02, // +%2 Tasarruf
    exportBonus: 0.03,    // +%3 Gelir
    wasteBonus: 0.05,     // +%5 Tasarruf
    designFee: 6000,      // 6.000 TL
    royaltyRate: 0.025,   // %2.5
    avatarType: 'ece',
    bio: 'Global pazar trendlerini kokusal taleplere dönüştürme ve üretim firesini minimize etme uzmanı.'
  },
  {
    id: 'selin_arman',
    name: 'Selin Arman',
    role: 'Baş Simyager & Niş Tasarımcı',
    noteHarmony: 5,
    trendFit: 5,
    rdLevel: 8,
    logisticsBonus: 0.02, // +%2 Tasarruf
    exportBonus: 0.06,    // +%6 Gelir
    wasteBonus: 0.02,     // +%2 Tasarruf
    designFee: 10000,     // 10.000 TL
    royaltyRate: 0.04,    // %4
    avatarType: 'selin',
    bio: 'Yüksek AR-GE vizyonu ve uluslararası lüks ihracat ağıyla benzersiz imza parfümler yaratma yeteneği.'
  }
];

export function getPerfumerById(id?: string): Perfumer {
  return INITIAL_PERFUMERS.find((p) => p.id === id) || INITIAL_PERFUMERS[0];
}
