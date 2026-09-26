import { SecretRecipe } from '../types';

export const INITIAL_SECRET_RECIPES: SecretRecipe[] = [
  {
    id: 'secret_terre_hermes',
    codeName: 'PROJE TERRA NOBILE',
    purchasePrice: 32000,
    isPurchased: false,
    status: 'locked',
    attemptsLeft: 3,
    attempts: [],
    hint: 'Bu reçetede narenciyenin acımsı ferahlığını ve hemen ardından gelen sıcak biberli toprak minerallerini alıyorum. Güneşin vurduğu narenciye bahçeleri, çakmaktaşı tozu ve kuru sedir ağacı kokusu yükseliyor...',
    realPerfume: {
      id: 'secret_terre_hermes',
      name: "Terre d'Hermès",
      brand: 'Hermès',
      gender: 'ERKEK',
      qualityLevel: 'Nadir',
      qualityScore: 88,
      description: 'Yerin ve göğün buluşması; acı greyfurt ve bergamot tazeliğiyle harmanlanan karabiber ve köklü vetiver-sedir odunları.',
      image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80',
      suggestedRetailPrice: 420,
      topNotes: ['greyfurt', 'bergamot'],
      middleNotes: ['karabiber'],
      baseNotes: ['sedir_agaci', 'vetiver'],
      recipe: [
        { rawMaterialId: 'greyfurt', amount: 80, noteType: 'top' },
        { rawMaterialId: 'bergamot', amount: 70, noteType: 'top' },
        { rawMaterialId: 'karabiber', amount: 95, noteType: 'middle' },
        { rawMaterialId: 'sedir_agaci', amount: 130, noteType: 'base' },
        { rawMaterialId: 'vetiver', amount: 110, noteType: 'base' }
      ]
    }
  },
  {
    id: 'secret_la_vie_est_belle',
    codeName: 'PROJE BELLE ÉLIXIR',
    purchasePrice: 26000,
    isPurchased: false,
    status: 'locked',
    attemptsLeft: 3,
    attempts: [],
    hint: 'Pudramsı asil bir çiçek kalbi seziyorum. Ağırbaşlı orris kökü ve beyaz çiçekler, dipte kadifemsi vanilya ve koyu paçuli tatlılığıyla sarılmış. Hayatın neşesini anlatan gurme bir aura var...',
    realPerfume: {
      id: 'secret_la_vie_est_belle',
      name: 'La Vie Est Belle',
      brand: 'Lancôme',
      gender: 'KADIN',
      qualityLevel: 'Kaliteli',
      qualityScore: 84,
      description: 'Gülümsemenin kristalize hali; taze meyve açılışı, asil Floransa irisi ve zarif yasemin, yoğun vanilya-paçuli tabakası.',
      image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
      suggestedRetailPrice: 390,
      topNotes: ['elma'],
      middleNotes: ['iris', 'yasemin'],
      baseNotes: ['vanilya', 'paculi'],
      recipe: [
        { rawMaterialId: 'elma', amount: 85, noteType: 'top' },
        { rawMaterialId: 'iris', amount: 120, noteType: 'middle' },
        { rawMaterialId: 'yasemin', amount: 95, noteType: 'middle' },
        { rawMaterialId: 'vanilya', amount: 135, noteType: 'base' },
        { rawMaterialId: 'paculi', amount: 105, noteType: 'base' }
      ]
    }
  },
  {
    id: 'secret_bleu_de_chanel',
    codeName: 'PROJE BLEU ROYALE',
    purchasePrice: 35000,
    isPurchased: false,
    status: 'locked',
    attemptsLeft: 3,
    attempts: [],
    hint: 'Açılışta buzlu narenciye ve ferahlatıcı nane kıvılcımı çarpıyor. Gövdede canlı pembe biber ve Sichuan titreşimi, dipte ise asil sedir ve amberimsi minerallerin modern maskülen izi var...',
    realPerfume: {
      id: 'secret_bleu_de_chanel',
      name: 'Bleu de Chanel',
      brand: 'Chanel',
      gender: 'ERKEK',
      qualityLevel: 'Nadir',
      qualityScore: 89,
      description: 'Özgürlüğün mavi manifestosu; taze nane ve sulu greyfurt ile parlayan aromatik baharatlar ve kalıcı odunsu ambroksan zarafeti.',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80',
      suggestedRetailPrice: 450,
      topNotes: ['greyfurt', 'nane'],
      middleNotes: ['pembe_biber', 'sichuan_biberi'],
      baseNotes: ['sedir_agaci', 'ambroksan'],
      recipe: [
        { rawMaterialId: 'greyfurt', amount: 85, noteType: 'top' },
        { rawMaterialId: 'nane', amount: 65, noteType: 'top' },
        { rawMaterialId: 'pembe_biber', amount: 75, noteType: 'middle' },
        { rawMaterialId: 'sichuan_biberi', amount: 90, noteType: 'middle' },
        { rawMaterialId: 'sedir_agaci', amount: 110, noteType: 'base' },
        { rawMaterialId: 'ambroksan', amount: 140, noteType: 'base' }
      ]
    }
  },
  {
    id: 'secret_angels_share',
    codeName: 'PROJE ANGELIC RESERVE',
    purchasePrice: 38000,
    isPurchased: false,
    status: 'locked',
    attemptsLeft: 3,
    attempts: [],
    hint: 'Meşe fıçılarda yıllanmış sıcak likör ve tatlı baharat esintisi alıyorum. Seylan tarçını ve tonka fasulyesi, balımsı kakao ve zengin vanilyayla eriyor. Baş döndürücü lüks bir centilmen meclisi kokusu...',
    realPerfume: {
      id: 'secret_angels_share',
      name: "Angels' Share",
      brand: 'By Kilian',
      gender: 'UNISEX',
      qualityLevel: 'Nadir',
      qualityScore: 89,
      description: 'Konyak mahzenlerinden yükselen meleklerin payı; Seylan tarçını, tonka fasulyesi, çikolatamsı kakao ve kremamsı sandal ağacı.',
      image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&auto=format&fit=crop&q=80',
      suggestedRetailPrice: 480,
      topNotes: ['tarcin'],
      middleNotes: ['tonka_fasulyesi', 'kakao'],
      baseNotes: ['vanilya', 'sandal_agaci'],
      recipe: [
        { rawMaterialId: 'tarcin', amount: 95, noteType: 'top' },
        { rawMaterialId: 'tonka_fasulyesi', amount: 125, noteType: 'middle' },
        { rawMaterialId: 'kakao', amount: 105, noteType: 'middle' },
        { rawMaterialId: 'vanilya', amount: 145, noteType: 'base' },
        { rawMaterialId: 'sandal_agaci', amount: 115, noteType: 'base' }
      ]
    }
  },
  {
    id: 'secret_lost_cherry',
    codeName: 'PROJE CERISE NOIRE',
    purchasePrice: 34000,
    isPurchased: false,
    status: 'locked',
    attemptsLeft: 3,
    attempts: [],
    hint: 'Karanlık ve sulu bir meyve baştan çıkarıcılığı var. Likörlü olgun vişne ile acı bademin yasak uyumu; ardından gül yaprakları ve sıcak tonka-vanilya tabakası geliyor...',
    realPerfume: {
      id: 'secret_lost_cherry',
      name: 'Lost Cherry',
      brand: 'Tom Ford',
      gender: 'UNISEX',
      qualityLevel: 'Kaliteli',
      qualityScore: 86,
      description: 'Olgun kara vişnenin parlak likörle yıkanmış tadı; kavrulmuş acı badem, kadife gül yaprakları ve tatlı tonka-vanilya sarmalı.',
      image: 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=600&auto=format&fit=crop&q=80',
      suggestedRetailPrice: 470,
      topNotes: ['visne', 'aci_badem'],
      middleNotes: ['gul', 'yasemin'],
      baseNotes: ['tonka_fasulyesi', 'vanilya'],
      recipe: [
        { rawMaterialId: 'visne', amount: 115, noteType: 'top' },
        { rawMaterialId: 'aci_badem', amount: 80, noteType: 'top' },
        { rawMaterialId: 'gul', amount: 90, noteType: 'middle' },
        { rawMaterialId: 'yasemin', amount: 85, noteType: 'middle' },
        { rawMaterialId: 'tonka_fasulyesi', amount: 125, noteType: 'base' },
        { rawMaterialId: 'vanilya', amount: 130, noteType: 'base' }
      ]
    }
  }
];
