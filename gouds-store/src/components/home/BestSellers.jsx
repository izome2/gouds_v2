import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiShoppingCart, FiStar, FiHeart } from "react-icons/fi";
import { useCart } from "react-use-cart";
import { toast } from "react-toastify";
import useUtilsFunction from "@hooks/useUtilsFunction";

const BestSellers = ({ products = [] }) => {
  const { addItem, items } = useCart();
  const [likedItems, setLikedItems] = useState([]);
  const { showingTranslateValue } = useUtilsFunction();

  // Sample products if none provided
  const sampleProducts = [
    {
      _id: "1",
      title: "Classic Chocolate Chip",
      slug: "classic-chocolate-chip",
      image: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500",
      price: 4.99,
      originalPrice: 6.99,
      discount: 30,
      rating: 4.9,
      reviews: 245,
    },
    {
      _id: "2",
      title: "Double Chocolate Fudge",
      slug: "double-chocolate-fudge",
      image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500",
      price: 5.99,
      originalPrice: 7.99,
      discount: 25,
      rating: 4.8,
      reviews: 189,
    },
    {
      _id: "3",
      title: "Nutty Caramel Delight",
      slug: "nutty-caramel-delight",
      image: "https://images.unsplash.com/photo-1590841609987-4ac211afdde1?w=500",
      price: 6.49,
      originalPrice: 8.99,
      discount: 28,
      rating: 5.0,
      reviews: 312,
    },
    {
      _id: "4",
      title: "White Chocolate Dream",
      slug: "white-chocolate-dream",
      image: "https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=500",
      price: 5.49,
      originalPrice: 7.49,
      discount: 27,
      rating: 4.7,
      reviews: 156,
    },
  ];

  const displayProducts = products.length > 0 ? products.slice(0, 4) : sampleProducts;

  const getProductTitle = (product) => {
    return typeof product.title === 'object' 
      ? showingTranslateValue(product.title) 
      : product.title;
  };

  const getProductImage = (product) => {
    if (Array.isArray(product.image)) {
      return product.image[0] || product.image;
    }
    return product.image;
  };

  const getProductPrice = (product) => {
    return typeof product.price === 'object'
      ? Number(showingTranslateValue(product.price)) || 0
      : Number(product.price) || 0;
  };

  const getProductRating = (product) => {
    return typeof product.rating === 'object'
      ? Number(showingTranslateValue(product.rating)) || 0
      : Number(product.rating) || 0;
  };

  const getProductReviews = (product) => {
    return typeof product.reviews === 'object'
      ? Number(showingTranslateValue(product.reviews)) || 0
      : Number(product.reviews) || 0;
  };

  const getProductDiscount = (product) => {
    return typeof product.discount === 'object'
      ? Number(showingTranslateValue(product.discount)) || 0
      : Number(product.discount) || 0;
  };

  const handleAddToCart = (product) => {
    const title = getProductTitle(product);
    const price = getProductPrice(product);
    const image = getProductImage(product);
    
    const item = {
      id: product._id,
      name: title,
      price: price,
      image: image,
      quantity: 1,
    };
    addItem(item);
    toast.success(`${title} added to cart! 🍪`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const toggleLike = (productId) => {
    setLikedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isInCart = (productId) => {
    return items.some((item) => item.id === productId);
  };

  return (
    <section className="relative py-20 bg-white overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-cream-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-chocolate-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold">
            <span className="text-gradient-chocolate">Most Loved</span>
            <br />
            <span className="text-chocolate-800">Cookies</span>
          </h2>
          
          <p className="text-chocolate-600/80 text-lg max-w-2xl mx-auto font-sans">
            Handpicked favorites that keep our customers coming back for more
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayProducts.map((product, index) => (
            <div
              key={product._id}
              className="group relative card-melt bg-cream-50 rounded-3xl overflow-hidden border border-chocolate-100/50 hover:border-chocolate-200 transition-all duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Discount Badge */}
              {getProductDiscount(product) > 0 && (
                <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-gradient-to-r from-chocolate-500 to-chocolate-600 text-white text-xs font-bold rounded-full shadow-lg">
                  -{getProductDiscount(product)}%
                </div>
              )}

              {/* Like Button */}
              <button
                onClick={() => toggleLike(product._id)}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all duration-300"
                aria-label="Add to wishlist"
              >
                <FiHeart
                  className={`w-5 h-5 transition-all duration-300 ${
                    likedItems.includes(product._id)
                      ? "fill-chocolate-500 text-chocolate-500"
                      : "text-chocolate-400"
                  }`}
                />
              </button>

              {/* Product Image */}
              <Link href={`/product/${product.slug}`}>
                <div className="relative h-64 overflow-hidden bg-white rounded-t-3xl">
                  <Image
                    src={getProductImage(product)}
                    alt={getProductTitle(product)}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-chocolate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>

              {/* Product Info */}
              <div className="p-6 space-y-4">
                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(getProductRating(product))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-chocolate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-chocolate-600 font-medium">
                    {getProductRating(product).toFixed(1)} ({getProductReviews(product)})
                  </span>
                </div>

                {/* Title */}
                <Link href={`/product/${product.slug}`}>
                  <h3 className="font-serif text-xl font-semibold text-chocolate-800 group-hover:text-chocolate-600 transition-colors duration-300">
                    {getProductTitle(product)}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-2xl font-bold text-chocolate-700">
                    ${getProductPrice(product).toFixed(2)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-chocolate-400 line-through">
                      ${typeof product.originalPrice === 'object' ? Number(showingTranslateValue(product.originalPrice)).toFixed(2) : Number(product.originalPrice).toFixed(2)}
                    </span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isInCart(product._id)}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-serif font-semibold transition-all duration-300 ${
                    isInCart(product._id)
                      ? "bg-chocolate-100 text-chocolate-600 cursor-not-allowed"
                      : "btn-glossy text-white shadow-chocolate hover:shadow-chocolate-lg"
                  }`}
                >
                  <FiShoppingCart className="w-5 h-5" />
                  {isInCart(product._id) ? "In Cart" : "Add to Cart"}
                </button>
              </div>

              {/* Chocolate Drip Effect (visible on hover) */}
              <div className="absolute bottom-0 left-0 right-0 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  viewBox="0 0 400 40"
                  className="w-full h-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0,0 Q50,40 100,20 T200,20 T300,20 T400,20 L400,40 L0,40 Z"
                    fill="url(#miniChocolateGradient)"
                    opacity="0.3"
                  />
                  <defs>
                    <linearGradient id="miniChocolateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#7c5137" stopOpacity="0" />
                      <stop offset="100%" stopColor="#7c5137" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white border-2 border-chocolate-300 text-chocolate-700 font-serif font-semibold text-lg rounded-2xl hover:bg-chocolate-50 hover:border-chocolate-400 transition-all duration-300 shadow-lg hover:shadow-chocolate"
          >
            View All Cookies
            <svg
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Bottom Chocolate Melt */}
      <div className="absolute bottom-0 left-0 right-0 h-20">
        <svg
          viewBox="0 0 1200 120"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C150,80 350,20 500,60 C650,100 750,40 900,70 C1050,100 1150,50 1200,70 L1200,120 L0,120 Z"
            fill="#e6ddce"
          />
        </svg>
      </div>
    </section>
  );
};

export default BestSellers;
