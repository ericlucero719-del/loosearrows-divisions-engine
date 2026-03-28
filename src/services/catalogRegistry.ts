import { NormalizedProduct } from './catalogLoader';

const catalog = new Map<string, NormalizedProduct[]>();

export function saveCatalog(storeId: string, products: NormalizedProduct[]): NormalizedProduct[] {
  catalog.set(storeId, products);
  return products;
}

export function getCatalog(storeId: string): NormalizedProduct[] {
  return catalog.get(storeId) ?? [];
}
