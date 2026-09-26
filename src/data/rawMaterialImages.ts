export const RAW_MATERIAL_IMAGES: Record<string, string> = {
  vanilya: 'https://fimgs.net/mdimg/sastojci/m.74.jpg',
  safran: 'https://fimgs.net/mdimg/sastojci/m.55.jpg',
  meyan_koku: 'https://fimgs.net/mdimg/sastojci/m.195.jpg',
  vetiver: 'https://fimgs.net/mdimg/sastojci/m.2.jpg',
  bergamot: 'https://fimgs.net/mdimg/sastojci/m.75.jpg',
  yasemin: 'https://fimgs.net/mdimg/sastojci/m.14.jpg',
  misk: 'https://fimgs.net/mdimg/sastojci/m.4.jpg',
  sandal_agaci: 'https://fimgs.net/mdimg/sastojci/m.33.jpg',
  sedir_agaci: 'https://fimgs.net/mdimg/sastojci/m.41.jpg',
  paculi: 'https://fimgs.net/mdimg/sastojci/m.34.jpg',
  gul: 'https://fimgs.net/mdimg/sastojci/m.105.jpg',
  lavanta: 'https://fimgs.net/mdimg/sastojci/m.1.jpg',
  ambroksan: 'https://fimgs.net/mdimg/sastojci/m.563.jpg',
  kahve: 'https://fimgs.net/mdimg/sastojci/m.139.jpg',
  aci_badem: 'https://fimgs.net/mdimg/sastojci/m.130.jpg',
  pembe_biber: 'https://fimgs.net/mdimg/sastojci/m.91.jpg',
  portakal_cicegi: 'https://fimgs.net/mdimg/sastojci/m.16.jpg',
  karabiber: 'https://fimgs.net/mdimg/sastojci/m.158.jpg',
  sichuan_biberi: 'https://fimgs.net/mdimg/sastojci/m.213.jpg',
  ananas: 'https://fimgs.net/mdimg/sastojci/m.170.jpg',
  elma: 'https://fimgs.net/mdimg/sastojci/m.146.jpg',
  hus_agaci: 'https://fimgs.net/mdimg/sastojci/m.862.jpg',
  tütün_yapragi: 'https://fimgs.net/mdimg/sastojci/m.96.jpg',
  tonka_fasulyesi: 'https://fimgs.net/mdimg/sastojci/m.73.jpg',
  kakao: 'https://fimgs.net/mdimg/sastojci/m.135.jpg',
  aldehitler: 'https://fimgs.net/mdimg/sastojci/m.165.jpg',
  bakir: 'https://fimgs.net/mdimg/sastojci/m.458.jpg',
  greyfurt: 'https://fimgs.net/mdimg/sastojci/m.76.jpg',
  tarcin: 'https://fimgs.net/mdimg/sastojci/m.68.jpg',
  visne: 'https://fimgs.net/mdimg/sastojci/m.132.jpg',
  iris: 'https://fimgs.net/mdimg/sastojci/m.11.jpg',
  nane: 'https://fimgs.net/mdimg/sastojci/m.88.jpg'
};

export function getRawMaterialImage(id?: string): string | undefined {
  if (!id) return undefined;
  return RAW_MATERIAL_IMAGES[id];
}
