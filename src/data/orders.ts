import { MarketOrder } from '../types';

// Oyuncular ve botlar üretime sıfırdan başladığı için başlangıçta hazır Orijinal/Fragrantica siparişi bulunmaz.
// AR-GE ve Gizli Reçete (Secret) ile parfümler icat edildikçe dinamik küresel siparişler otomatik oluşur.
export const INITIAL_ORDERS: MarketOrder[] = [];
