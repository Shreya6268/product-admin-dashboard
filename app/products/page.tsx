"use client";

import { FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getProducts,
  searchProducts,
  getProductsByCategory,
  getCategories,
  deleteProduct,
} from "@/lib/productApi";
import { Product } from "@/types/product";

import {
  getLocalProducts,
  getDeletedProductIds,
  deleteLocalProduct,
} from "@/lib/localProducts";

function ProductsPageContent() {
  const router = useRouter();
const searchParams = useSearchParams();
useEffect(() => {
  const token = localStorage.getItem("token");

  if (!token) {
    router.replace("/");
  }
}, [router]);



  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);
  const requestIdRef = useRef(0);

  const [page, setPage] = useState(() => {
  const value = Number(searchParams.get("page"));

  return Number.isInteger(value) && value >= 1 ? value : 1;
});

const [pageSize, setPageSize] = useState(() => {
  const value = Number(searchParams.get("pageSize"));

  return [10, 20, 50].includes(value) ? value : 10;
});
const [total, setTotal] = useState(0);


const [debouncedSearch, setDebouncedSearch] = useState("");
const [categories, setCategories] = useState<
  { slug: string; name: string; url: string }[]
>([]);


const [search, setSearch] = useState(
  () => searchParams.get("search") || ""
);

const [category, setCategory] = useState(
  () => searchParams.get("category") || ""
);

const [sortBy, setSortBy] = useState(() => {
  const value = searchParams.get("sortBy");

  return ["title", "price", "rating"].includes(value || "")
    ? value || ""
    : "";
});

const [order, setOrder] = useState(() => {
  const value = searchParams.get("order");

  return value === "desc" ? "desc" : "asc";
});


  const totalPages = Math.ceil(total / pageSize);
  const skip = (page - 1) * pageSize;


useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 500);

  return () => {
    clearTimeout(timer);
  };
}, [search]);


useEffect(() => {
  const params = new URLSearchParams();

  if (page > 1) {
    params.set("page", String(page));
  }

  if (pageSize !== 10) {
    params.set("pageSize", String(pageSize));
  }

  if (search.trim()) {
    params.set("search", search.trim());
  }

  if (category) {
    params.set("category", category);
  }

  if (sortBy) {
    params.set("sortBy", sortBy);
  }

  if (sortBy && order !== "asc") {
    params.set("order", order);
  }

  const queryString = params.toString();

  router.replace(
    queryString ? `/products?${queryString}` : "/products",
    { scroll: false }
  );
}, [
  page,
  pageSize,
  search,
  category,
  sortBy,
  order,
  router,
]);


useEffect(() => {
  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  fetchCategories();
}, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const requestId = ++requestIdRef.current;
      try {
        setLoading(true);
        setError("");

      let data;

if (debouncedSearch.trim()) {
  data = await searchProducts(debouncedSearch.trim(), pageSize, skip);
} else if (category) {
  data = await getProductsByCategory(
    category,
    pageSize,
    skip,
    sortBy,
    order
  );
} else {
  data = await getProducts(
    pageSize,
    skip,
    sortBy,
    order
  );
}


const localProducts = getLocalProducts();
const deletedIds = getDeletedProductIds();

const localProductIds = new Set(
  localProducts.map((product) => product.id)
);

const visibleApiProducts = data.products.filter(
  (product) =>
    !deletedIds.includes(product.id) &&
    !localProductIds.has(product.id)
);

if (requestId !== requestIdRef.current) {
  return;
}
setProducts([...localProducts, ...visibleApiProducts]);
setTotal(data.total + localProducts.length);
        const newTotalPages = Math.ceil(data.total / pageSize);

if (page > newTotalPages && newTotalPages > 0) {
  setPage(newTotalPages);
}
      } catch (error) {
  if (requestId !== requestIdRef.current) {
    return;
  }

  console.error(error);
  setError("Failed to load products.");
} finally {
  if (requestId === requestIdRef.current) {
    setLoading(false);
  }
}
    };

    fetchProducts();
}, [page, pageSize, skip, debouncedSearch, category, sortBy, order, retryCount]);

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };
  const handleDelete = async (id: number) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this product?"
  );

  if (!confirmed) {
    return;
  }

  try {
    await deleteProduct(id);

    deleteLocalProduct(id);

    setProducts((currentProducts) =>
      currentProducts.filter((product) => product.id !== id)
    );

    setTotal((currentTotal) => Math.max(0, currentTotal - 1));
  } catch {
    setError("Failed to delete product.");
  }
};

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="mx-auto max-w-7xl">
       <div className="mb-6 flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold text-gray-900">
      Product Admin Dashboard
    </h1>

    <p className="mt-2 text-gray-600">
      Manage your products
    </p>
  </div>

  <div className="flex items-center gap-3">
  <button
    type="button"
    onClick={() => router.push("/products/new")}
    className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
  >
    + New Product
  </button>

  <button
    type="button"
    onClick={() => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      router.replace("/");
    }}
    className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
  >
    Logout
  </button>
</div>
</div>
        <div className="mb-6">
  <input
    type="text"
    value={search}
    onChange={(event) => {
      setSearch(event.target.value);
      setPage(1);
    }}
    placeholder="Search products..."
   className="w-full rounded-lg border bg-white px-4 py-3 text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-blue-500"
  />
</div>
<div className="mb-6">
  <select
    value={category}
    onChange={(event) => {
      setCategory(event.target.value);
      setPage(1);
    }}
    className="w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">All Categories</option>

    {categories.map((item) => (
  <option key={item.slug} value={item.slug}>
    {item.name}
  </option>
))}
  </select>
</div>

<div className="mb-6 flex flex-col gap-4 sm:flex-row">
  <select
    value={sortBy}
    onChange={(event) => {
      setSortBy(event.target.value);
      setPage(1);
    }}
    className="w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="">Sort by</option>
    <option value="title">Title</option>
    <option value="price">Price</option>
    <option value="rating">Rating</option>
  </select>

  <select
    value={order}
    onChange={(event) => {
      setOrder(event.target.value);
      setPage(1);
    }}
   className="w-full rounded-lg border bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
  >
    <option value="asc">Ascending</option>
    <option value="desc">Descending</option>
  </select>
</div>

        {loading && (
          <div className="rounded-lg bg-white p-6 text-center shadow">
            Loading products...
          </div>
        )}

        {error && (
  <div className="rounded-lg bg-red-50 p-6 text-center">
    <p className="text-red-600">
      {error}
    </p>

    <button
      type="button"
      onClick={() => {
        setError("");
        setLoading(true);
       setRetryCount((count) => count + 1);
      }}
      className="mt-4 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
    >
      Retry
    </button>
  </div>
)}

        {!loading && !error && (
  <>
    {products.length === 0 ? (
      <div className="rounded-lg bg-white p-10 text-center shadow">
        <h2 className="text-xl font-semibold text-gray-900">
          No products found
        </h2>

        <p className="mt-2 text-gray-500">
          Try changing your search or filter.
        </p>
      </div>
    ) : (
      <>
        <div className="hidden overflow-x-auto rounded-lg bg-white shadow md:block">

            
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                      Stock
                    </th>
                   <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
  Actions
</th> 
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr key={product.id}>
                     


                     <td className="px-6 py-4">
  <div className="flex items-center gap-4">
    <img
      src={product.thumbnail}
      alt={product.title}
      className="h-12 w-12 rounded-lg object-cover"
    />

    <button
      type="button"
      onClick={() => router.push(`/products/${product.id}`)}
      className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
    >
      {product.title}
    </button>
  </div>
</td>

                      <td className="px-6 py-4 text-gray-600">
                        {product.category}
                      </td>

                      <td className="px-6 py-4 font-medium text-gray-900">
                        ${product.price}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        ⭐ {product.rating}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {product.stock}
                      </td>
                     <td className="px-6 py-4">
  <div className="flex gap-2">
    <button
      type="button"
      onClick={() => router.push(`/products/${product.id}/edit`)}
      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
    >
      Edit
    </button>

    <button
      type="button"
      onClick={() => handleDelete(product.id)}
      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
    >
      Delete
    </button>
  </div>
</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-4 md:hidden">
  {products.map((product) => (
    <div
      key={product.id}
      className="rounded-lg bg-white p-4 shadow"
    >
      <div className="flex items-center gap-4">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-16 w-16 rounded-lg object-cover"
        />

        <div className="min-w-0">
          <h2 className="truncate font-semibold text-gray-900">
            {product.title}
          </h2>

          <p className="text-sm text-gray-500">
            {product.category}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">Price</p>
          <p className="font-semibold text-gray-900">
            ${product.price}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Rating</p>
          <p className="font-semibold text-gray-900">
            ⭐ {product.rating}
          </p>
        </div>

        <div>
          <p className="text-gray-500">Stock</p>
          <p className="font-semibold text-gray-900">
            {product.stock}
          </p>
        </div>

        <div>
          <p className="text-gray-500">ID</p>
          <p className="font-semibold text-gray-900">
            #{product.id}
          </p>
        </div>
      </div>
    </div>
  ))}
</div>

            <div className="mt-4 flex flex-col gap-4 rounded-lg bg-white p-4 shadow sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium">
                  {total === 0 ? 0 : skip + 1}
                </span>
                {"–"}
                <span className="font-medium">
                  {Math.min(skip + pageSize, total)}
                </span>{" "}
                of <span className="font-medium">{total}</span>
              </div>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="pageSize"
                  className="text-sm text-gray-600"
                >
                  Page size:
                </label>

                <select
                  id="pageSize"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                   className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>

                <button
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>

               <div className="flex items-center gap-1">
  {Array.from({ length: totalPages }, (_, index) => index + 1).map(
    (pageNumber) => (
      <button
        key={pageNumber}
        type="button"
        onClick={() => setPage(pageNumber)}
        className={`rounded-lg px-3 py-2 text-sm font-medium ${
          page === pageNumber
            ? "bg-blue-600 text-white"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        {pageNumber}
      </button>
    )
  )}
</div>

                <button
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page === totalPages}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
                   </>
        )}
      </>
    )}
  </div>
</main>
  );
}
 

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gray-100 p-6">
          <p className="text-gray-600">Loading products...</p>
        </main>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}