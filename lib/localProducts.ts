import { Product } from "@/types/product";

const STORAGE_KEY = "localProducts";

export const getLocalProducts = (): Product[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const savedProducts = localStorage.getItem(STORAGE_KEY);

  if (!savedProducts) {
    return [];
  }

  return JSON.parse(savedProducts);
};

export const saveLocalProduct = (product: Product): void => {
  const products = getLocalProducts();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...products, product])
  );
};

export const updateLocalProduct = (updatedProduct: Product): void => {
  const products = getLocalProducts();

  const productExists = products.some(
    (product) => product.id === updatedProduct.id
  );

  const updatedProducts = productExists
    ? products.map((product) =>
        product.id === updatedProduct.id ? updatedProduct : product
      )
    : [...products, updatedProduct];

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedProducts)
  );
};
const DELETED_KEY = "deletedProductIds";

export const getDeletedProductIds = (): number[] => {
  if (typeof window === "undefined") {
    return [];
  }

  const savedIds = localStorage.getItem(DELETED_KEY);

  if (!savedIds) {
    return [];
  }

  return JSON.parse(savedIds);
};

export const deleteLocalProduct = (id: number): void => {
  const products = getLocalProducts();

  const updatedProducts = products.filter(
    (product) => product.id !== id
  );

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updatedProducts)
  );

  const deletedIds = getDeletedProductIds();

  if (!deletedIds.includes(id)) {
    localStorage.setItem(
      DELETED_KEY,
      JSON.stringify([...deletedIds, id])
    );
  }
};