import api from "./axios";
import { Product, ProductsResponse } from "@/types/product";

export const getProducts = async (
  limit: number,
  skip: number,
  sortBy?: string,
  order?: string
): Promise<ProductsResponse> => {
  const response = await api.get<ProductsResponse>("/products", {
    params: {
      limit,
      skip,
      sortBy,
      order,
    },
  });

  return response.data;
};

export const searchProducts = async (
  query: string,
  limit: number,
  skip: number,
  delay?: number
): Promise<ProductsResponse> => {
  const response = await api.get<ProductsResponse>("/products/search", {
    params: {
      q: query,
      limit,
      skip,
      delay,
    },
  });

  return response.data;
};

export const getProductsByCategory = async (
  category: string,
  limit: number,
  skip: number,
  sortBy?: string,
  order?: string
): Promise<ProductsResponse> => {
  const response = await api.get<ProductsResponse>(
    `/products/category/${category}`,
    {
      params: {
        limit,
        skip,
        sortBy,
        order,
      },
    }
  );

  return response.data;
};

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>("/products/categories");

  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await api.get<Product>(`/products/${id}`);

  return response.data;
};
export const createProduct = async (
  product: {
    title: string;
    price: number;
    stock: number;
    category: string;
    description: string;
  }
): Promise<Product> => {
  const response = await api.post<Product>("/products/add", product);

  return response.data;
};
export const updateProduct = async (
  id: number,
  product: {
    title: string;
    price: number;
    stock: number;
    category: string;
    description: string;
  }
): Promise<Product> => {
  const response = await api.put<Product>(`/products/${id}`, product);
  return response.data;
};
export const deleteProduct = async (id: number): Promise<Product> => {
  const response = await api.delete<Product>(`/products/${id}`);
  return response.data;
};
