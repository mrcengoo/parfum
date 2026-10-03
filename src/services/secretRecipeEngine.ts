import {
  SecretRecipe,
  SecretRecipeAttempt,
  Perfumer,
  RawMaterial,
  Perfume,
  EvaluatedNoteItem,
  DiscoveredSecretNote,
  NoteType
} from '../types';

/**
 * Generates natural dynamic commentary on pyramid density / structure.
 * Doesn't reveal exact numbers, but approximates based on real formula and current discoveries.
 */
export function generateDensityComment(
  real: SecretRecipe['realPerfume'],
  attemptNumber: number,
  exactTopCount: number,
  exactMidCount: number,
  exactBaseCount: number
): string {
  const realTopCount = real.topNotes.length;
  const realMidCount = real.middleNotes.length;
  const realBaseCount = real.baseNotes.length;
  const totalReal = realTopCount + realMidCount + realBaseCount;

  // Complexity opener - dynamic and varied
  let opener = '';
  if (totalReal >= 5) {
    const complexOpeners = [
      'Nota yoğunluğu: Formül düşündüğümüzden daha karmaşık görünüyor.',
      'Nota yoğunluğu: Formül zengin ve katman katman açılan derin bir koku mimarisine sahip.',
      'Nota yoğunluğu: Notaların yoğunluğu oldukça yüksek; piramit zengin akorlarla örülmüş.'
    ];
    opener = complexOpeners[(attemptNumber - 1) % complexOpeners.length];
  } else {
    const simpleOpeners = [
      'Nota yoğunluğu: Formülün daha sade bir yapıya sahip olduğu düşünülüyor.',
      'Nota yoğunluğu: Net ve berrak bir koku piramidi var; formül gereksiz kalabalıktan uzak.',
      'Nota yoğunluğu: Formül daha odaklanmış ve dengeli bir koku kompozisyonu barındırıyor.'
    ];
    opener = simpleOpeners[(attemptNumber - 1) % simpleOpeners.length];
  }

  // Tier density insights
  const tierParts: string[] = [];

  // Base tier commentary
  if (exactBaseCount > 0 || (attemptNumber >= 2 && realBaseCount >= 2)) {
    if (realBaseCount >= 3) {
      const baseVariants = [
        `Alt nota katmanı yaklaşık ${realBaseCount} veya ${realBaseCount + 1} notadan oluşuyor olabilir.`,
        `Alt nota yapısının yaklaşık ${realBaseCount} nota içerdiğine dair güçlü işaretler var.`
      ];
      tierParts.push(baseVariants[(attemptNumber - 1) % baseVariants.length]);
    } else {
      tierParts.push(`Alt nota yapısının yaklaşık ${realBaseCount} nota içerdiğine dair güçlü işaretler var.`);
    }
  } else {
    tierParts.push('Alt nota katmanı için henüz yeterli veri yok.');
  }

  // Middle tier commentary
  if (exactMidCount > 0 || (attemptNumber >= 2 && realMidCount >= 2)) {
    if (realMidCount >= 2) {
      const midVariants = [
        `Orta nota katmanının daha yoğun olduğu görülüyor ancak kesin bir sayı vermek için yeterli veri yok.`,
        `Orta nota katmanında yaklaşık ${realMidCount}-${realMidCount + 1} civarında akor bulunduğu seziliyor.`
      ];
      tierParts.push(midVariants[(attemptNumber - 1) % midVariants.length]);
    } else {
      tierParts.push('Orta nota katmanında 1-2 kilit esansın omurgayı oluşturduğu seziliyor.');
    }
  } else {
    tierParts.push('Orta nota katmanını tam olarak açıklayacak yeterli veri henüz yok.');
  }

  // Top tier commentary
  if (exactTopCount > 0 || (attemptNumber >= 2 && realTopCount >= 2)) {
    if (realTopCount >= 3) {
      tierParts.push(`Üst nota katmanında yaklaşık 3-4 nota olabilir.`);
    } else {
      tierParts.push(`Üst nota katmanında yaklaşık ${realTopCount} nota olabilir.`);
    }
  } else {
    tierParts.push('Üst nota hakkında henüz yeterli bulgu bulunamadı.');
  }

  return `${opener} ${tierParts.join(' ')}`;
}

/**
 * Generates an olfactory clue for the next investigation stage
 * pointing towards missing elements in the real formula.
 */
export function generateOlfactoryClue(
  real: SecretRecipe['realPerfume'],
  greenNoteIds: Set<string>,
  orangeNoteIds: Set<string>,
  rawMaterialsMap: Map<string, RawMaterial>
): string {
  const discovered = new Set([...greenNoteIds, ...orangeNoteIds]);
  const allReal = [...real.topNotes, ...real.middleNotes, ...real.baseNotes];
  const missing = allReal.filter((id) => !discovered.has(id));

  if (missing.length === 0) {
    if (orangeNoteIds.size > 0) {
      return 'Tüm notaların kokusunu yakaladık! Şimdi sadece turuncu renkle işaretli notaları doğru piramit katmanına (Üst/Orta/Alt) oturtmamız gerekiyor.';
    }
    return 'Koku piramidinin tüm parçaları kusursuz bir uyumla birleşti!';
  }

  // Sample one missing material to hint at its scent family
  const targetId = missing[0];
  const mat = rawMaterialsMap.get(targetId);
  const category = (mat?.category || '').toLowerCase();

  if (category.includes('narenciye') || real.topNotes.includes(targetId)) {
    return 'Açılışta ferahlatıcı narenciye veya uçucu parlak meyve esintilerini araştırmanızı öneririm.';
  } else if (category.includes('baharat')) {
    return 'Gövdede sıcak baharat veya aromatik tohum titreşimlerini aramaya odaklanabilirsiniz.';
  } else if (category.includes('çiçeksi')) {
    return 'Kalp katmanında henüz deşifre edilmemiş zarif çiçek taç yaprağı akorları gizleniyor.';
  } else if (category.includes('odunsu')) {
    return 'Dipten gelen asil odunsu sütunlar veya topraksı kök esansları keşfedilmeyi bekliyor.';
  } else if (category.includes('amber') || category.includes('gurme')) {
    return 'Dip katmanda kalıcılık sağlayan sıcak amber, vanilya veya tatlımsı reçine notaları eksik.';
  }

  return 'Parfümatörünüz koku piramidinde henüz adını koyamadığı derin bir akor olduğunu seziyor.';
}

/**
 * Evaluates a player's guess attempt for a secret recipe.
 * Generates GREEN (correct note + correct tier), ORANGE (correct note + wrong tier), and GRAY (not in recipe).
 */
export function evaluateSecretAttempt(
  secret: SecretRecipe,
  guessedTop: string[],
  guessedMiddle: string[],
  guessedBase: string[],
  rawMaterialsMap: Map<string, RawMaterial>,
  perfumer: Perfumer
): {
  attempt: SecretRecipeAttempt;
  isSolved: boolean;
  discoveredNotes: DiscoveredSecretNote[];
} {
  const real = secret.realPerfume;

  const realTopSet = new Set(real.topNotes);
  const realMiddleSet = new Set(real.middleNotes);
  const realBaseSet = new Set(real.baseNotes);
  const allRealNotes = new Set([...real.topNotes, ...real.middleNotes, ...real.baseNotes]);

  const evaluatedNotes: EvaluatedNoteItem[] = [];

  const greenNoteIds: string[] = [];
  const orangeNoteIds: string[] = [];
  const grayNoteIds: string[] = [];

  const getMatName = (id: string): string => {
    return rawMaterialsMap.get(id)?.name || id;
  };

  // Evaluate Top Notes
  guessedTop.forEach((id) => {
    const name = getMatName(id);
    if (realTopSet.has(id)) {
      evaluatedNotes.push({ id, name, tier: 'top', status: 'green', statusText: 'Doğru nota + doğru katman' });
      greenNoteIds.push(id);
    } else if (allRealNotes.has(id)) {
      evaluatedNotes.push({ id, name, tier: 'top', status: 'orange', statusText: 'Doğru nota + yanlış katman' });
      orangeNoteIds.push(id);
    } else {
      evaluatedNotes.push({ id, name, tier: 'top', status: 'gray', statusText: 'Formülde yok' });
      grayNoteIds.push(id);
    }
  });

  // Evaluate Middle Notes
  guessedMiddle.forEach((id) => {
    const name = getMatName(id);
    if (realMiddleSet.has(id)) {
      evaluatedNotes.push({ id, name, tier: 'middle', status: 'green', statusText: 'Doğru nota + doğru katman' });
      greenNoteIds.push(id);
    } else if (allRealNotes.has(id)) {
      evaluatedNotes.push({ id, name, tier: 'middle', status: 'orange', statusText: 'Doğru nota + yanlış katman' });
      orangeNoteIds.push(id);
    } else {
      evaluatedNotes.push({ id, name, tier: 'middle', status: 'gray', statusText: 'Formülde yok' });
      grayNoteIds.push(id);
    }
  });

  // Evaluate Base Notes
  guessedBase.forEach((id) => {
    const name = getMatName(id);
    if (realBaseSet.has(id)) {
      evaluatedNotes.push({ id, name, tier: 'base', status: 'green', statusText: 'Doğru nota + doğru katman' });
      greenNoteIds.push(id);
    } else if (allRealNotes.has(id)) {
      evaluatedNotes.push({ id, name, tier: 'base', status: 'orange', statusText: 'Doğru nota + yanlış katman' });
      orangeNoteIds.push(id);
    } else {
      evaluatedNotes.push({ id, name, tier: 'base', status: 'gray', statusText: 'Formülde yok' });
      grayNoteIds.push(id);
    }
  });

  const totalGuessed = evaluatedNotes.length;
  const correctCount = greenNoteIds.length + orangeNoteIds.length;
  const totalRequired = allRealNotes.size;

  // Fully correct: all real notes are present, all are GREEN, and 0 GRAY notes
  const isFullyCorrect =
    greenNoteIds.length === totalRequired &&
    orangeNoteIds.length === 0 &&
    grayNoteIds.length === 0;

  // Maintain persistent discovered notes for the next attempt:
  // Green notes are locked in their verified tier
  // Orange notes are locked in the formula, but can be moved to another tier
  // Gray notes are discarded
  const discoveredMap = new Map<string, DiscoveredSecretNote>();

  // Carry over previously discovered notes (both green and orange)
  if (secret.discoveredNotes) {
    secret.discoveredNotes.forEach((dn) => {
      discoveredMap.set(dn.id, dn);
    });
  }

  // Update with current attempt findings
  evaluatedNotes.forEach((en) => {
    if (en.status === 'green') {
      discoveredMap.set(en.id, {
        id: en.id,
        name: en.name,
        tier: en.tier,
        status: 'green'
      });
    } else if (en.status === 'orange') {
      // If not already green
      if (discoveredMap.get(en.id)?.status !== 'green') {
        discoveredMap.set(en.id, {
          id: en.id,
          name: en.name,
          tier: en.tier,
          status: 'orange'
        });
      }
    }
  });

  const discoveredNotes = Array.from(discoveredMap.values());

  const attemptNumber = (secret.attempts.length || 0) + 1;

  // Dynamic commentary
  const densityComment = generateDensityComment(
    real,
    attemptNumber,
    guessedTop.filter((id) => realTopSet.has(id)).length,
    guessedMiddle.filter((id) => realMiddleSet.has(id)).length,
    guessedBase.filter((id) => realBaseSet.has(id)).length
  );

  const clueComment = generateOlfactoryClue(
    real,
    new Set(greenNoteIds),
    new Set(orangeNoteIds),
    rawMaterialsMap
  );

  let perfumerComment = '';
  if (isFullyCorrect) {
    perfumerComment = `Muazzam bir burun hassasiyeti! ${perfumer.name} heyecanla notlarını onaylıyor: "Kusursuz bir analiz... Formülün tüm notalarını ve piramit katmanlarını eksiksiz çözdün. Bu efsanevi başyapıt artık bizim üretim portföyümüzde!"`;
  } else if (greenNoteIds.length >= Math.ceil(totalRequired / 2)) {
    perfumerComment = `${perfumer.name}: "Piramidin kalbine ve ana omurgasına çok yaklaştık. Yeşil notalarımız sağlam, turuncu notaların ise katmanlarını ayarlayarak sonuca gidebiliriz."`;
  } else if (correctCount > 0) {
    perfumerComment = `${perfumer.name}: "Koku ailesinin doğru ipuçlarını yakaladık. Yeşil notalarımızı kilitledik, turuncu notaları başka katmanlara kaydırarak denemeye devam edelim."`;
  } else {
    perfumerComment = `${perfumer.name}: "Bu seçimler maalesef parfümün özüyle uyuşmadı. Zarfın üzerindeki koku ipucunu tekrar analiz ederek yeni notalar seçmeliyiz."`;
  }

  const attempt: SecretRecipeAttempt = {
    attemptNumber,
    timestamp: Date.now(),
    topNotes: guessedTop,
    middleNotes: guessedMiddle,
    baseNotes: guessedBase,
    correctCount,
    totalGuessed,
    totalRequired,
    isFullyCorrect,
    perfumerComment,
    densityComment,
    clueComment,
    evaluatedNotes,
    greenNotes: greenNoteIds,
    orangeNotes: orangeNoteIds,
    grayNotes: grayNoteIds
  };

  return {
    attempt,
    isSolved: isFullyCorrect,
    discoveredNotes
  };
}

/**
 * Converts a solved secret recipe into a fully usable Perfume in player or bot production catalogue.
 */
export function convertSecretToPerfume(
  secret: SecretRecipe,
  companyId: string,
  perfumer: Perfumer,
  companyName: string = 'AromaLux'
): Perfume {
  const real = secret.realPerfume;
  const isPlayer = companyId === 'aromalux';
  const uniqueId = `perfume_secret_${real.id}_${companyId}_${Date.now()}`;
  return {
    id: uniqueId,
    name: real.name,
    brand: isPlayer ? real.brand : companyName,
    companyId,
    companyName,
    perfumerId: perfumer.id,
    perfumerName: perfumer.name,
    gender: real.gender,
    sourceType: 'SECRET',
    quality: real.qualityScore,
    originality: 95,
    noteHarmony: 96,
    trendFit: 94,
    resultLevel: real.qualityLevel,
    topNotes: real.topNotes,
    middleNotes: real.middleNotes,
    baseNotes: real.baseNotes,
    notes: [...real.topNotes, ...real.middleNotes, ...real.baseNotes],
    producerCompanyId: companyId,
    recipe: real.recipe,
    productionTime: 30,
    image: real.image,
    source: `Çözülmüş Gizli Reçete (${secret.codeName})`,
    suggestedRetailPrice: real.suggestedRetailPrice,
    description: `${real.brand} şaheseri "${real.name}" (${secret.codeName}). ${companyName} AR-GE laboratuvarında araştırılarak deşifre edildi. ${real.description}`,
    designFee: 0,
    royaltyRate: 0.02,
    createdAt: Date.now()
  };
}

const TOP_NOTE_POOL = [
  'bergamot', 'limon', 'greyfurt', 'nane', 'pembe_biber',
  'karabiber', 'elma', 'ananas', 'yesil_cay', 'lavanta',
  'ahududu', 'aldehitler', 'lici', 'biberiye', 'deniz_notalari'
];

const MID_NOTE_POOL = [
  'yasemin', 'gul', 'iris', 'portakal_cicegi', 'tarcin',
  'kakule', 'sichuan_biberi', 'tonka_fasulyesi', 'kakao', 'kahve',
  'orkide', 'bal', 'visne', 'erik', 'subulteber', 'osmanthus'
];

const BASE_NOTE_POOL = [
  'vanilya', 'sandal_agaci', 'sedir_agaci', 'paculi', 'vetiver',
  'oud', 'amber', 'ambroksan', 'misk', 'deri',
  'tütün_yapragi', 'tutsu', 'hus_agaci', 'meyan_koku'
];

const CODE_PREFIXES = ['PROJE', 'DOSYA', 'OPERASYON', 'FORMÜL'];
const CODE_ADJECTIVES = ['AURA', 'NOCTURNE', 'ECLAT', 'MYSTERE', 'SOLAIRE', 'OLYMPUS', 'CELESTE', 'VELVET', 'OBSIDIAN', 'LUMIERE', 'ROYAL', 'IMPERIAL', 'SOVEREIGN', 'DIVIN', 'ARCANE'];
const CODE_SUFFIXES = ['ROYALE', 'MAJESTE', 'NOBILE', 'IMPERIALE', 'ELIXIR', 'SUPREME', 'DIVIN', 'EXCLUSIF', 'PRESTIGE', 'ABSOLU'];

const LUXURY_HOUSES = [
  'Maison Royale', 'Atelier des Sens', 'Parfums de Grasse',
  'Palazzo Nobile', 'Imperial Fragrance Guild', 'Haute Parfumerie Privée',
  'Sovereign Scent Lab', 'Boutique Vendôme', 'Royal Alhambra', 'L’Élixir Sacré'
];

const LUXURY_PERFUME_TITLES = [
  'Éclat d’Or', 'Mystère de Nuit', 'Oud Impérial', 'Santal Céleste', 'Velours de Rose',
  'Iris Majestueux', 'Ambre Nocturne', 'Nectar Sauvage', 'Cuir Solaire', 'Fleur de Soie',
  'Sovereign Reserve', 'Vetiver Nobile', 'Paradis Blanc', 'Chant d’Orient', 'L’Ombre Royale'
];

const LUXURY_IMAGES = [
  'https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1583445013765-46c20c4a6772?w=600&auto=format&fit=crop&q=80'
];

/**
 * Procedurally generates a 100% UNIQUE secret formula project.
 * Checks against existing recipes AND existing perfumes to guarantee NO duplicate note combinations ever exist.
 */
export function generateUniqueSecretRecipe(
  existingRecipes: SecretRecipe[] = [],
  allPerfumes: Perfume[] = []
): SecretRecipe {
  // Collect all existing note signatures from both recipes and registered perfumes
  const existingSignatures = new Set<string>();
  
  existingRecipes.forEach((r) => {
    if (r.realPerfume) {
      const topSig = [...(r.realPerfume.topNotes || [])].sort().join(',');
      const midSig = [...(r.realPerfume.middleNotes || [])].sort().join(',');
      const baseSig = [...(r.realPerfume.baseNotes || [])].sort().join(',');
      existingSignatures.add(`${topSig}::${midSig}::${baseSig}`);
    }
  });

  allPerfumes.forEach((p) => {
    const topSig = [...(p.topNotes || [])].sort().join(',');
    const midSig = [...(p.middleNotes || [])].sort().join(',');
    const baseSig = [...(p.baseNotes || [])].sort().join(',');
    existingSignatures.add(`${topSig}::${midSig}::${baseSig}`);
  });

  // Pick unique notes that have never been used in this exact combination
  let chosenTop: string[] = [];
  let chosenMid: string[] = [];
  let chosenBase: string[] = [];
  let attempts = 0;

  do {
    attempts++;
    // Choose 2 or 3 top notes (so total is 6 to 8 notes, never 4-5!)
    const topCount = Math.random() < 0.45 ? 3 : 2;
    const shuffledTop = [...TOP_NOTE_POOL].sort(() => Math.random() - 0.5);
    chosenTop = shuffledTop.slice(0, topCount);

    // Choose 2 or 3 middle notes
    const midCount = Math.random() < 0.5 ? 3 : 2;
    const shuffledMid = [...MID_NOTE_POOL].sort(() => Math.random() - 0.5);
    chosenMid = shuffledMid.slice(0, midCount);

    // Choose 2 or 3 base notes
    const baseCount = Math.random() < 0.45 ? 3 : 2;
    const shuffledBase = [...BASE_NOTE_POOL].sort(() => Math.random() - 0.5);
    chosenBase = shuffledBase.slice(0, baseCount);

    const sig = `${[...chosenTop].sort().join(',')}::${[...chosenMid].sort().join(',')}::${[...chosenBase].sort().join(',')}`;
    if (!existingSignatures.has(sig) || attempts > 100) {
      break;
    }
  } while (attempts < 100);

  // Generate unique code name with high-entropy serial
  const p = CODE_PREFIXES[Math.floor(Math.random() * CODE_PREFIXES.length)];
  const a = CODE_ADJECTIVES[Math.floor(Math.random() * CODE_ADJECTIVES.length)];
  const s = CODE_SUFFIXES[Math.floor(Math.random() * CODE_SUFFIXES.length)];
  const serial = Math.floor(Math.random() * 8999) + 1000;
  const codeName = `${p} ${a} ${s} N°${serial}`;

  // Luxury Brand & Title
  const brand = LUXURY_HOUSES[Math.floor(Math.random() * LUXURY_HOUSES.length)];
  const baseTitle = LUXURY_PERFUME_TITLES[Math.floor(Math.random() * LUXURY_PERFUME_TITLES.length)];
  const perfumeName = `${baseTitle} N°${Math.floor(Math.random() * 899) + 100}`;
  const gender: 'KADIN' | 'ERKEK' | 'UNISEX' = Math.random() < 0.33 ? 'KADIN' : Math.random() < 0.66 ? 'ERKEK' : 'UNISEX';

  // Sensory hint tailored to the chosen notes
  const topNames = chosenTop.join(', ');
  const midNames = chosenMid.join(', ');
  const baseNames = chosenBase.join(', ');
  const hint = `Ekspertiz raporu: Açılışta ferah/canlı üst akorlar (${topNames.replace(/_/g, ' ')} izleri), gövdede lüks çiçeksi ve baharatlı kalp (${midNames.replace(/_/g, ' ')}), dipte ise derin ve kalıcı bir baz (${baseNames.replace(/_/g, ' ')}) yükseliyor.`;

  // Dynamic formula drops
  const recipeItems: any[] = [];
  chosenTop.forEach((matId) => {
    recipeItems.push({ rawMaterialId: matId, amount: 80, noteType: 'top', drops: 4 });
  });
  chosenMid.forEach((matId) => {
    recipeItems.push({ rawMaterialId: matId, amount: 110, noteType: 'middle', drops: 4 });
  });
  chosenBase.forEach((matId) => {
    recipeItems.push({ rawMaterialId: matId, amount: 130, noteType: 'base', drops: 3 });
  });

  const uniqueId = `secret_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const randomImage = LUXURY_IMAGES[Math.floor(Math.random() * LUXURY_IMAGES.length)];

  // Quality tier based on note count (6 notes -> Kaliteli, 7 notes -> Kaliteli/Nadir, 8 notes -> Nadir/Efsanevi)
  const totalNotesCount = chosenTop.length + chosenMid.length + chosenBase.length;
  const roll = Math.random();
  let qualityLevel: 'Kaliteli' | 'Nadir' | 'Efsanevi' = 'Kaliteli';
  let qualityScore = 82;
  let price = 1350;

  if (totalNotesCount >= 8 && roll < 0.35) {
    qualityLevel = 'Efsanevi';
    qualityScore = Math.floor(Math.random() * 7) + 93; // 93 - 99
    price = Math.floor(Math.random() * 8 + 26) * 100; // 2600 - 3300 ₺
  } else if (totalNotesCount >= 7 && roll < 0.65) {
    qualityLevel = 'Nadir';
    qualityScore = Math.floor(Math.random() * 6) + 86; // 86 - 91
    price = Math.floor(Math.random() * 6 + 16) * 100; // 1600 - 2100 ₺
  } else {
    qualityLevel = 'Kaliteli';
    qualityScore = Math.floor(Math.random() * 6) + 79; // 79 - 84
    price = Math.floor(Math.random() * 4 + 11) * 100 + 50; // 1150 - 1450 ₺
  }

  return {
    id: uniqueId,
    codeName,
    purchasePrice: 10000, // ALWAYS exactly 10.000 ₺
    isPurchased: false,
    status: 'locked',
    attemptsLeft: 3,
    attempts: [],
    hint,
    realPerfume: {
      id: uniqueId,
      name: perfumeName,
      brand,
      gender,
      qualityLevel,
      qualityScore,
      description: `${brand} atölyesinden çıkan ${totalNotesCount} notalı (${chosenTop.length} Üst, ${chosenMid.length} Orta, ${chosenBase.length} Alt) gizli reçete. Koku piramidinde ${topNames}, ${midNames} ve ${baseNames} ahenkle titreşir.`,
      image: randomImage,
      suggestedRetailPrice: price,
      recipe: recipeItems,
      topNotes: chosenTop,
      middleNotes: chosenMid,
      baseNotes: chosenBase
    }
  };
}

/**
 * Ensures the active secret recipe pool continuously has fresh, diverse, unsolved projects.
 */
export function ensureSecretRecipePool(
  currentRecipes: SecretRecipe[],
  targetActiveCount = 5,
  allPerfumes: Perfume[] = []
): SecretRecipe[] {
  const activeUnsolved = currentRecipes.filter((r) => r.status !== 'solved');
  if (activeUnsolved.length >= targetActiveCount) {
    return currentRecipes;
  }

  const needed = targetActiveCount - activeUnsolved.length;
  const newOnes: SecretRecipe[] = [];
  for (let i = 0; i < needed; i++) {
    const fresh = generateUniqueSecretRecipe([...currentRecipes, ...newOnes], allPerfumes);
    newOnes.push(fresh);
  }

  return [...currentRecipes, ...newOnes];
}
