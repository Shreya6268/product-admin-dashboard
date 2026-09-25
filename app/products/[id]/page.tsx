"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProduct } from "@/lib/productApi";
import { Product } from "../../../types/product";

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/");
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const id = Number(params.id);

        if (!Number.isInteger(id) || id <= 0) {
          setError("Product not found.");
          return;
        }

        const data = await getProduct(id);

        setProduct(data);
      } catch (error) {
        console.error("Failed to load product:", error);
        setError("Product not found.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading product...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="rounded-lg bg-white p-8 text-center shadow">
          <h1 className="text-2xl font-bold text-gray-900">
            Product Not Found
          </h1>

          <p className="mt-2 text-gray-500">
            The product you are looking for does not exist.
          </p>

          <button
            type="button"
            onClick={() => router.push("/products")}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
          >
            Back to Products
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <button
        type="button"
        onClick={() => router.push("/products")}
        className="mb-6 rounded-lg bg-white px-4 py-2 font-medium text-gray-700 shadow hover:bg-gray-50"
      >
        ← Back to Products
      </button>

      <div className="mx-auto max-w-5xl rounded-xl bg-white p-6 shadow">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
  <img
    src={product.images[0] || product.thumbnail}
    alt={product.title}
    className="h-96 w-full rounded-xl object-cover"
  />

  <div className="mt-4 flex gap-3 overflow-x-auto">
    {product.images.map((image, index) => (
      <img
        key={index}
        src={image}
        alt={`${product.title} ${index + 1}`}
        className="h-20 w-20 flex-shrink-0 rounded-lg border object-cover"
      />
    ))}
  </div>
</div>

          <div>
            <p className="text-sm font-medium uppercase text-blue-600">
              {product.category}
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              {product.title}
            </h1>

            <p className="mt-4 text-gray-600">
              {product.description}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-xl font-bold text-gray-900">
                  ${product.price}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Rating</p>
                <p className="text-xl font-bold text-gray-900">
                  ⭐ {product.rating}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Stock</p>
                <p className="text-xl font-bold text-gray-900">
                  {product.stock}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Brand</p>
                <p className="text-xl font-bold text-gray-900">
                  {product.brand || "N/A"}
                </p>
              </div>
            </div>

<div className="mt-10 border-t pt-8">
  <h2 className="text-2xl font-bold text-gray-900">
    Reviews
  </h2>

  {product.reviews && product.reviews.length > 0 ? (
    <div className="mt-6 space-y-4">
      {product.reviews.map((review, index) => (
        <div
          key={index}
          className="rounded-lg border border-gray-200 p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-semibold text-gray-900">
              {review.reviewerName}
            </h3>

            <span className="text-sm text-gray-600">
              ⭐ {review.rating}/5
            </span>
          </div>

          <p className="mt-2 text-gray-600">
            {review.comment}
          </p>

          <p className="mt-2 text-xs text-gray-400">
            {new Date(review.date).toLocaleDateString()}
          </p>
        </div>
      ))}
    </div>
  ) : (
    <p className="mt-4 text-gray-500">
      No reviews available.
    </p>
  )}
</div>

          </div>
        </div>
      </div>
    </main>
  );
}