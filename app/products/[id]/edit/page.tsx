"use client";

import { FormEvent, useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";


import { getProduct, updateProduct } from "@/lib/productApi";
import { updateLocalProduct } from "@/lib/localProducts";
export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.replace("/");
    return;
  }
}, [router]);

  const id = Number(params.id);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const product = await getProduct(id);

        setTitle(product.title);
        setPrice(String(product.price));
        setStock(String(product.stock));
        setCategory(product.category);
        setDescription(product.description);
      } catch {
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);
const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  if (saving) {
    return;
  }

  setError("");

  if (!title.trim()) {
    setError("Product title is required.");
    return;
  }

  if (!category.trim()) {
    setError("Category is required.");
    return;
  }

  if (!price || Number(price) <= 0) {
    setError("Price must be greater than 0.");
    return;
  }

  if (!stock || Number(stock) < 0) {
    setError("Stock cannot be negative.");
    return;
  }

  setSaving(true);

  try {
    const updatedProduct = await updateProduct(id, {
  title: title.trim(),
  price: Number(price),
  stock: Number(stock),
  category: category.trim(),
  description: description.trim(),
});

updateLocalProduct(updatedProduct);

router.push("/products");
  } catch {
    setError("Failed to update product.");
  } finally {
    setSaving(false);
  }
};
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <p>Loading product...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <p className="text-red-600">{error}</p>

        <button
          type="button"
          onClick={() => router.push("/products")}
          className="mt-4 rounded-lg bg-gray-800 px-4 py-2 text-white"
        >
          Back to Products
        </button>
      </main>
    );
  }

  return (
  <main className="min-h-screen bg-gray-100 p-6">
    <div className="mx-auto max-w-2xl">
      <div className="rounded-lg bg-white p-6 shadow">
        <h1 className="text-2xl font-bold text-gray-900">
          Edit Product
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category
            </label>

            <input
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="w-full rounded-lg border p-3"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Price
              </label>

              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Stock
              </label>

              <input
                type="number"
                min="0"
                value={stock}
                onChange={(event) => setStock(event.target.value)}
                className="w-full rounded-lg border p-3"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Description
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={5}
              className="w-full rounded-lg border p-3"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/products")}
              className="rounded-lg border px-4 py-2 font-medium"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  </main>
);
}