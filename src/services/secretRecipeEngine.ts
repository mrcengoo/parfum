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
 * Converts a solved secret recipe into a fully usable Perfume in player's production catalogue.
 */
export function convertSecretToPerfume(secret: SecretRecipe, companyId: string, perfumer: Perfumer): Perfume {
  const real = secret.realPerfume;
  return {
    id: real.id,
    name: real.name,
    brand: real.brand,
    companyId,
    companyName: 'AromaLux',
    perfumerId: perfumer.id,
    perfumerName: perfumer.name,
    gender: real.gender,
    sourceType: 'SECRET',
    quality: real.qualityScore,
    originality: 92,
    noteHarmony: 94,
    trendFit: 92,
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
    description: `${real.brand} efsanesi "${real.name}" (${secret.codeName}). Oyuncunun AR-GE laboratuvarında araştırılarak portföye kazandırıldı. ${real.description}`,
    designFee: 0,
    royaltyRate: 0,
    createdAt: Date.now()
  };
}
