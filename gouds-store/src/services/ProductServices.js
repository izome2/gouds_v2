import requests from "./httpServices";

const ProductServices = {
  getShowingProducts: async () => {
    return requests.get("/products/show");
  },
  getShowingStoreProducts: async ({ category = "", title = "", slug = "" }) => {
    return requests.get(
      `/products/store?category=${category}&title=${title}&slug=${slug}`
    );
  },
  getDiscountedProducts: async () => {
    return requests.get("/products/discount");
  },

  getProductBySlug: async (slug) => {
    return requests.get(`/products/${slug}`);
  },

  getMostLikedProducts: async (limit = 10) => {
    return requests.get(`/products/most-liked?limit=${limit}`);
  },

  toggleLike: async (productId, action) => {
    return requests.put(`/products/like/${productId}`, { action });
  },
};

export default ProductServices;
