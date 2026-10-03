import { Perfumer, OlfactoryFamilyGroup } from '../types';
import { pickRandom3Families, format3FamiliesLabel } from './rawMaterials';

function createPerfumerWith3Families(
  base: Omit<
    Perfumer,
    | 'logisticsBonus'
    | 'exportBonus'
    | 'wasteBonus'
    | 'wasteReduction'
    | 'speedBonus'
    | 'specialtyNotes'
    | 'bonusFamilies'
    | 'olfactoryFamily'
    | 'bio'
  >,
  initialFamilies?: OlfactoryFamilyGroup[]
): Perfumer {
  const bonusFamilies =
    initialFamilies && initialFamilies.length === 3 ? initialFamilies : pickRandom3Families();
  const famLabel = format3FamiliesLabel(bonusFamilies);

  return {
    ...base,
    bonusFamilies,
    olfactoryFamily: famLabel,
    logisticsBonus: 0,
    exportBonus: 0,
    wasteBonus: 0,
    wasteReduction: 0,
    speedBonus: 0,
    specialtyNotes: [],
    bio: `${base.name}, Koku Çarkı'ndaki 3 Aile Bonusuna (${famLabel}) sahiptir. Formülde bu 3 aileden hammadde kullanıldığında 1 Aile: +%8, 2 Aile: +%16, 3 Aile: +%24 ekstra satış fiyat farkı ve AR-GE uyumu kazandırır.`
  };
}

export const INITIAL_PERFUMERS: Perfumer[] = [
  // 1
  createPerfumerWith3Families({
    id: 'mert_aksoy',
    name: 'Mert Aksoy',
    role: 'Kıdemli Parfümör • 3 Aile Uzmanı',
    noteHarmony: 7,
    trendFit: 6,
    rdLevel: 7,
    qualityBonus: 8,
    designFee: 25000,
    royaltyRate: 0.03,
    avatarType: 'mert',
    favoredCountries: ['Fransa', 'İsviçre', 'Birleşik Krallık'],
    noteMasteryBonusRate: 0.24
  }),
  // 2
  createPerfumerWith3Families({
    id: 'arda_sisman',
    name: 'Arda Şişman',
    role: 'Baş Burun • 3 Aile Uzmanı',
    noteHarmony: 8,
    trendFit: 6,
    rdLevel: 7,
    qualityBonus: 10,
    designFee: 28000,
    royaltyRate: 0.03,
    avatarType: 'arda',
    favoredCountries: ['Birleşik Arap Emirlikleri', 'Katar', 'Suudi Arabistan'],
    noteMasteryBonusRate: 0.24
  }),
  // 3
  createPerfumerWith3Families({
    id: 'ece_yalin',
    name: 'Ece Yalın',
    role: 'İnovasyon Parfümörü • 3 Aile Uzmanı',
    noteHarmony: 6,
    trendFit: 9,
    rdLevel: 7,
    qualityBonus: 9,
    designFee: 26000,
    royaltyRate: 0.025,
    avatarType: 'ece',
    favoredCountries: ['ABD', 'Almanya', 'Kanada'],
    noteMasteryBonusRate: 0.24
  }),
  // 4
  createPerfumerWith3Families({
    id: 'selin_arman',
    name: 'Selin Arman',
    role: 'Baş Simyager • 3 Aile Uzmanı',
    noteHarmony: 8,
    trendFit: 8,
    rdLevel: 9,
    qualityBonus: 12,
    designFee: 32000,
    royaltyRate: 0.035,
    avatarType: 'selin',
    favoredCountries: ['İtalya', 'Japonya', 'Fransa'],
    noteMasteryBonusRate: 0.24
  }),
  // 5
  createPerfumerWith3Families({
    id: 'jean_luc_morel',
    name: 'Jean-Luc Morel',
    role: 'Grasse Efsanevi Burun • 3 Aile Uzmanı',
    noteHarmony: 9,
    trendFit: 8,
    rdLevel: 9,
    qualityBonus: 14,
    designFee: 40000,
    royaltyRate: 0.04,
    avatarType: 'mert',
    favoredCountries: ['Fransa', 'Birleşik Krallık', 'İsviçre', 'ABD'],
    noteMasteryBonusRate: 0.24
  }),
  // 6
  createPerfumerWith3Families({
    id: 'zahra_al_hashimi',
    name: 'Zahra Al-Hashimi',
    role: 'Kraliyet Oud Simyacısı • 3 Aile Uzmanı',
    noteHarmony: 10,
    trendFit: 9,
    rdLevel: 9,
    qualityBonus: 15,
    designFee: 45000,
    royaltyRate: 0.045,
    avatarType: 'selin',
    favoredCountries: ['Birleşik Arap Emirlikleri', 'Katar', 'Kuveyt', 'Suudi Arabistan'],
    noteMasteryBonusRate: 0.24
  }),
  // 7
  createPerfumerWith3Families({
    id: 'matteo_conti',
    name: 'Matteo Conti',
    role: 'Milano Akdeniz Kompozitörü • 3 Aile Uzmanı',
    noteHarmony: 8,
    trendFit: 8,
    rdLevel: 8,
    qualityBonus: 11,
    designFee: 30000,
    royaltyRate: 0.03,
    avatarType: 'arda',
    favoredCountries: ['İtalya', 'İspanya', 'Fransa'],
    noteMasteryBonusRate: 0.24
  }),
  // 8
  createPerfumerWith3Families({
    id: 'haruka_takahashi',
    name: 'Haruka Takahashi',
    role: 'Tokyo Moleküler Koku Mimarı • 3 Aile Uzmanı',
    noteHarmony: 9,
    trendFit: 9,
    rdLevel: 8,
    qualityBonus: 13,
    designFee: 35000,
    royaltyRate: 0.035,
    avatarType: 'ece',
    favoredCountries: ['Japonya', 'Güney Kore', 'Singapur'],
    noteMasteryBonusRate: 0.24
  }),
  // 9
  createPerfumerWith3Families({
    id: 'claire_dubois',
    name: 'Claire Dubois',
    role: 'Paris Haute Couture Parfümörü • 3 Aile Uzmanı',
    noteHarmony: 9,
    trendFit: 7,
    rdLevel: 8,
    qualityBonus: 12,
    designFee: 34000,
    royaltyRate: 0.035,
    avatarType: 'selin',
    favoredCountries: ['Fransa', 'İsviçre', 'Kanada'],
    noteMasteryBonusRate: 0.24
  }),
  // 10
  createPerfumerWith3Families({
    id: 'carlos_mendoza',
    name: 'Carlos Mendoza',
    role: 'İberya & Latin Botanik Uzmanı • 3 Aile Uzmanı',
    noteHarmony: 7,
    trendFit: 8,
    rdLevel: 7,
    qualityBonus: 10,
    designFee: 27000,
    royaltyRate: 0.03,
    avatarType: 'mert',
    favoredCountries: ['İspanya', 'Brezilya', 'ABD'],
    noteMasteryBonusRate: 0.24
  }),
  // 11
  createPerfumerWith3Families({
    id: 'tariq_bin_zayed',
    name: 'Tariq Bin Zayed',
    role: 'Körfez Amber & Tütsü Üstadı • 3 Aile Uzmanı',
    noteHarmony: 9,
    trendFit: 8,
    rdLevel: 9,
    qualityBonus: 14,
    designFee: 38000,
    royaltyRate: 0.04,
    avatarType: 'arda',
    favoredCountries: ['Suudi Arabistan', 'Kuveyt', 'Birleşik Arap Emirlikleri'],
    noteMasteryBonusRate: 0.24
  }),
  // 12
  createPerfumerWith3Families({
    id: 'nikolai_volkov',
    name: 'Nikolai Volkov',
    role: 'Kuzey Deri & Reçine Simyacısı • 3 Aile Uzmanı',
    noteHarmony: 8,
    trendFit: 7,
    rdLevel: 8,
    qualityBonus: 11,
    designFee: 29000,
    royaltyRate: 0.03,
    avatarType: 'mert',
    favoredCountries: ['Rusya', 'Almanya', 'Birleşik Krallık'],
    noteMasteryBonusRate: 0.24
  }),
  // 13
  createPerfumerWith3Families({
    id: 'mei_lin_chen',
    name: 'Mei-Lin Chen',
    role: 'Şanghay İpek & Çay Notaları Uzmanı • 3 Aile Uzmanı',
    noteHarmony: 8,
    trendFit: 9,
    rdLevel: 8,
    qualityBonus: 12,
    designFee: 33000,
    royaltyRate: 0.035,
    avatarType: 'ece',
    favoredCountries: ['Çin', 'Singapur', 'Japonya'],
    noteMasteryBonusRate: 0.24
  }),
  // 14
  createPerfumerWith3Families({
    id: 'sebastian_krueger',
    name: 'Sebastian Krüger',
    role: 'Berlin Avangard Sentetik Burun • 3 Aile Uzmanı',
    noteHarmony: 7,
    trendFit: 9,
    rdLevel: 8,
    qualityBonus: 11,
    designFee: 31000,
    royaltyRate: 0.03,
    avatarType: 'arda',
    favoredCountries: ['Almanya', 'İsviçre', 'Avustralya'],
    noteMasteryBonusRate: 0.24
  }),
  // 15
  createPerfumerWith3Families({
    id: 'isabella_valenti',
    name: 'Isabella Valenti',
    role: 'Floransa İris & Çiçek Özleri Ustası • 3 Aile Uzmanı',
    noteHarmony: 9,
    trendFit: 8,
    rdLevel: 9,
    qualityBonus: 13,
    designFee: 36000,
    royaltyRate: 0.035,
    avatarType: 'selin',
    favoredCountries: ['İtalya', 'Fransa', 'Brezilya'],
    noteMasteryBonusRate: 0.24
  }),
  // 16
  createPerfumerWith3Families({
    id: 'ji_hoon_park',
    name: 'Ji-Hoon Park',
    role: 'Seul K-Prestij Trend Tasarımcısı • 3 Aile Uzmanı',
    noteHarmony: 8,
    trendFit: 10,
    rdLevel: 8,
    qualityBonus: 12,
    designFee: 34000,
    royaltyRate: 0.035,
    avatarType: 'mert',
    favoredCountries: ['Güney Kore', 'Japonya', 'ABD'],
    noteMasteryBonusRate: 0.24
  }),
  // 17
  createPerfumerWith3Families({
    id: 'leyla_korkmaz',
    name: 'Leyla Korkmaz',
    role: 'İstanbul Isparta Gülü & Baharat Ustası • 3 Aile Uzmanı',
    noteHarmony: 9,
    trendFit: 8,
    rdLevel: 8,
    qualityBonus: 12,
    designFee: 29000,
    royaltyRate: 0.03,
    avatarType: 'ece',
    favoredCountries: ['Türkiye', 'Katar', 'Fransa'],
    noteMasteryBonusRate: 0.24
  }),
  // 18
  createPerfumerWith3Families({
    id: 'oliver_kensington',
    name: 'Oliver Kensington',
    role: 'Londra Aristokratik Fougère Burun • 3 Aile Uzmanı',
    noteHarmony: 8,
    trendFit: 8,
    rdLevel: 9,
    qualityBonus: 13,
    designFee: 37000,
    royaltyRate: 0.035,
    avatarType: 'arda',
    favoredCountries: ['Birleşik Krallık', 'Kanada', 'Avustralya'],
    noteMasteryBonusRate: 0.24
  }),
  // 19
  createPerfumerWith3Families({
    id: 'camila_silva',
    name: 'Camila Silva',
    role: 'Amazon Egzotik Reçine & Tonka Uzmanı • 3 Aile Uzmanı',
    noteHarmony: 8,
    trendFit: 9,
    rdLevel: 7,
    qualityBonus: 10,
    designFee: 27000,
    royaltyRate: 0.025,
    avatarType: 'selin',
    favoredCountries: ['Brezilya', 'ABD', 'İspanya'],
    noteMasteryBonusRate: 0.24
  }),
  // 20
  createPerfumerWith3Families({
    id: 'henri_de_montfort',
    name: 'Henri de Montfort',
    role: 'Cenevre İmparatorluk Baş Simyageri • 3 Aile Uzmanı',
    noteHarmony: 10,
    trendFit: 9,
    rdLevel: 10,
    qualityBonus: 16,
    designFee: 48000,
    royaltyRate: 0.045,
    avatarType: 'mert',
    favoredCountries: ['İsviçre', 'Fransa', 'Birleşik Arap Emirlikleri', 'Singapur'],
    noteMasteryBonusRate: 0.24
  })
];

export function randomizePerfumer3Families(perfumer: Perfumer): Perfumer {
  const bonusFamilies = pickRandom3Families();
  const famLabel = format3FamiliesLabel(bonusFamilies);
  return {
    ...perfumer,
    bonusFamilies,
    olfactoryFamily: famLabel,
    logisticsBonus: 0,
    exportBonus: 0,
    wasteBonus: 0,
    wasteReduction: 0,
    speedBonus: 0,
    specialtyNotes: [],
    noteMasteryBonusRate: 0.24,
    bio: `${perfumer.name}, Koku Çarkı'ndaki 3 Aile Bonusuna (${famLabel}) sahiptir. Formülde bu 3 aileden hammadde kullanıldığında 1 Aile: +%8, 2 Aile: +%16, 3 Aile: +%24 ekstra satış fiyat farkı ve AR-GE uyumu kazandırır.`
  };
}

export function getPerfumerById(id?: string): Perfumer {
  return INITIAL_PERFUMERS.find((p) => p.id === id) || INITIAL_PERFUMERS[0];
}
