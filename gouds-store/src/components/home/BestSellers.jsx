import { useState } from "react";
import Link from "next/link";
import { useCart } from "react-use-cart";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ExpandableProductCard from "@components/product/ExpandableProductCard";

const BestSellers = ({ products = [] }) => {
  const { items } = useCart();
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
    if (!product) return '';
    return typeof product.title === 'object' 
      ? showingTranslateValue(product.title) 
      : product.title;
  };

  const getProductImage = (product) => {
    if (!product) return '';
    if (Array.isArray(product.image)) {
      return product.image[0] || product.image;
    }
    return product.image;
  };

  const getProductPrice = (product) => {
    if (!product) return 0;
    const price = product?.prices?.price || product?.price;
    return typeof price === 'object'
      ? Number(showingTranslateValue(price)) || 0
      : Number(price) || 0;
  };

  const getProductDiscount = (product) => {
    if (!product) return 0;
    const discount = product?.prices?.discount || product?.discount;
    return typeof discount === 'object'
      ? Number(showingTranslateValue(discount)) || 0
      : Number(discount) || 0;
  };

  const toggleLike = (productId) => {
    setLikedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const isImagePNG = (imageUrl) => {
    if (!imageUrl) return false;
    const url = typeof imageUrl === 'string' ? imageUrl : imageUrl[0] || '';
    return url.toLowerCase().includes('.png') || url.toLowerCase().includes('png');
  };

  return (
    <section className="relative py-20 bg-white overflow-hidden">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-24">
          {displayProducts.map((product, index) => (
            <ExpandableProductCard
              key={product._id}
              product={product}
              index={index}
              getProductTitle={getProductTitle}
              getProductImage={getProductImage}
              getProductPrice={getProductPrice}
              getProductDiscount={getProductDiscount}
              isImagePNG={isImagePNG}
              likedItems={likedItems}
              toggleLike={toggleLike}
            />
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
