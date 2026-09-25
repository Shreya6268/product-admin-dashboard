"use client";
import { FormEvent, useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { createProduct } from "@/lib/productApi";
import { saveLocalProduct } from "@/lib/localProducts";

export default function NewProductPage() {
  const router = useRouter();
  useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.replace("/");
    return;
  }
}, [router]);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (loading) return;

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

    setLoading(true);

    try {
      const data = await createProduct({
  title: title.trim(),
  price: Number(price),
  stock: Number(stock),
  category: category.trim(),
  description: description.trim(),
});

saveLocalProduct(data);

console.log("Created product:", data);
router.push("/products");


    } catch (error) {
      setError("Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          onClick={() => router.push("/products")}
          className="mb-6 rounded-lg bg-white px-4 py-2 font-medium text-gray-700 shadow hover:bg-gray-50"
        >
          ← Back to Products
        </button>

        <div className="rounded-xl bg-white p-6 shadow">
          <h1 className="text-3xl font-bold text-gray-900">
            Add New Product
          </h1>

          <p className="mt-2 text-gray-600">
            Enter the product information below.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Enter product title"
                className="w-full rounded-lg border px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Category
              </label>

              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Enter category"
                className="w-full rounded-lg border px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Price
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Stock
                </label>

                <input
                  type="number"
                  min="0"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Enter product description"
                rows={5}
                className="w-full rounded-lg border px-4 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}