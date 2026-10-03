import { Perfume } from '../types';

// Orijinal ve Fragrantica parfümleri kaldırıldı.
// Tüm şirketler (oyuncu ve botlar) üretime sıfırdan başlar; yalnızca AR-GE Laboratuvarında icat edilen
// veya Formülü Bul (Gizli Reçete) masasında deşifre edilen parfümler üretilebilir.
export const INITIAL_PERFUMES: Perfume[] = [];
