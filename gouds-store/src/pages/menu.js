import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useCart } from "react-use-cart";
import { FiShoppingCart, FiChevronLeft, FiChevronRight, FiX, FiMinus, FiPlus, FiHeart } from "react-icons/fi";
import { toast } from "react-toastify";

// --- Color cache to avoid re-sampling on every slide change ---
const crumbColorCache = {};

// --- Crumb component that samples colors from an image ---
const FlyingCrumbs = ({ imageSrc, isDesktop = false, slideKey }) => {
  const [crumbs, setCrumbs] = useState([]);
  const [visible, setVisible] = useState(false);

  // Delayed entrance: all crumbs scale from center at once
  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => setVisible(true), 350);
    return () => clearTimeout(timer);
  }, [slideKey]);

  useEffect(() => {
    if (!imageSrc) return;

    if (crumbColorCache[imageSrc]) {
      setCrumbs(generateCrumbPositions(crumbColorCache[imageSrc], isDesktop));
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const colors = [];
      for (let i = 0; i < 4; i++) {
        const sx = Math.floor(img.width * 0.2 + Math.random() * img.width * 0.6);
        const sy = Math.floor(img.height * 0.2 + Math.random() * img.height * 0.6);
        const pixel = ctx.getImageData(sx, sy, 1, 1).data;
        let color;
        if (pixel[3] < 100 || (pixel[0] > 230 && pixel[1] > 230 && pixel[2] > 230)) {
          const cx = Math.floor(img.width * 0.35 + Math.random() * img.width * 0.3);
          const cy = Math.floor(img.height * 0.35 + Math.random() * img.height * 0.3);
          const p2 = ctx.getImageData(cx, cy, 1, 1).data;
          color = `rgba(${p2[0]},${p2[1]},${p2[2]},0.85)`;
        } else {
          color = `rgba(${pixel[0]},${pixel[1]},${pixel[2]},0.85)`;
        }
        colors.push(color);
      }
      crumbColorCache[imageSrc] = colors;
      setCrumbs(generateCrumbPositions(colors, isDesktop));
    };
    img.src = imageSrc;
  }, [imageSrc, isDesktop]);

  if (crumbs.length === 0) return null;

  return (
    <>
      {/* Wrapper that scales all crumbs from center of image */}
      <div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.4)',
          opacity: visible ? 1 : 0,
          transition: visible ? 'transform 0.8s cubic-bezier(0.22, 0.61, 0.36, 1), opacity 0.6s ease' : 'none',
          transformOrigin: '50% 50%',
        }}
      >
        {crumbs.map((c) => (
          <div
            key={c.id}
            className="absolute pointer-events-none"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: c.size,
              height: c.size,
              backgroundColor: c.color,
              borderRadius: c.borderRadius,
              transform: `rotate(${c.rotation}deg)`,
              boxShadow: isDesktop ? `0 1px 4px rgba(0,0,0,0.08)` : `0 1px 3px rgba(0,0,0,0.1)`,
              animation: visible ? `crumbFloat${c.id} ${c.duration}s ease-in-out ${c.delay}s infinite alternate` : 'none',
            }}
          />
        ))}
      </div>
      <style jsx>{`
        @keyframes crumbFloat0 {
          0% { transform: rotate(${crumbs[0]?.rotation || 0}deg) translate(0, 0) scale(1); }
          100% { transform: rotate(${(crumbs[0]?.rotation || 0) + 12}deg) translate(2px, -3px) scale(1.05); }
        }
        @keyframes crumbFloat1 {
          0% { transform: rotate(${crumbs[1]?.rotation || 0}deg) translate(0, 0) scale(1); }
          100% { transform: rotate(${(crumbs[1]?.rotation || 0) - 10}deg) translate(-2px, -2px) scale(0.95); }
        }
        @keyframes crumbFloat2 {
          0% { transform: rotate(${crumbs[2]?.rotation || 0}deg) translate(0, 0) scale(0.97); }
          100% { transform: rotate(${(crumbs[2]?.rotation || 0) + 15}deg) translate(2px, 3px) scale(1.05); }
        }
        @keyframes crumbFloat3 {
          0% { transform: rotate(${crumbs[3]?.rotation || 0}deg) translate(0, 0) scale(1.02); }
          100% { transform: rotate(${(crumbs[3]?.rotation || 0) - 8}deg) translate(-2px, 2px) scale(0.95); }
        }
      `}</style>
    </>
  );
};

// Generate crumb positions (separated from color sampling)
function generateCrumbPositions(colors, isDesktop) {
  return colors.map((color, i) => {
    const angle = (i / 4) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
    const dist = 40 + Math.random() * 20;
    const x = 50 + Math.cos(angle) * dist;
    const y = 50 + Math.sin(angle) * dist;
    const baseSize = isDesktop ? 10 : 7;
    const sizeRange = isDesktop ? 8 : 5;
    const size = baseSize + Math.random() * sizeRange;
    const rotation = Math.random() * 360;
    const delay = Math.random() * 2;
    const duration = 2.5 + Math.random() * 1.5;
    const borderRadius = `${25 + Math.random() * 30}% ${30 + Math.random() * 25}% ${25 + Math.random() * 30}% ${30 + Math.random() * 25}%`;
    return { color, x, y, size, rotation, delay, duration, id: i, borderRadius };
  });
}
import Layout from "@layout/Layout";
import ProductServices from "@services/ProductServices";
import CategoryServices from "@services/CategoryServices";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useIsMobile from "@hooks/useIsMobile";
import ExpandableProductCard from "@components/product/ExpandableProductCard";

const INITIAL_LOAD = 10;
const LOAD_MORE = 8;

const Menu = ({ popularProducts = [], allProducts = [], categories = [] }) => {
  const { addItem, items, updateItemQuantity, removeItem } = useCart();
  const [likedItems, setLikedItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeSlide, setActiveSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('right');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [heroModalProduct, setHeroModalProduct] = useState(null);
  const [heroModalVisible, setHeroModalVisible] = useState(false);
  const [heroModalImageIndex, setHeroModalImageIndex] = useState(0);
  const [mobileScrollDirection, setMobileScrollDirection] = useState('forward'); // for auto-scroll
  const { showingTranslateValue, currency } = useUtilsFunction();
  const scrollRef = useRef(null);
  const categoryScrollRef = useRef(null);
  const autoPlayRef = useRef(null);
  const loadMoreRef = useRef(null);
  const isMobile = useIsMobile();

  // --- Infinite scroll state ---
  const [visibleCount, setVisibleCount] = useState(INITIAL_LOAD);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load liked items from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('likedProducts');
      if (stored) setLikedItems(JSON.parse(stored));
    } catch (e) {}
  }, []);

  // Reset visible count when category changes
  useEffect(() => {
    setVisibleCount(INITIAL_LOAD);
  }, [activeCategory]);

  // --- Helper functions (memoized to prevent child re-renders) ---
  const getProductTitle = useCallback((product) => {
    if (!product) return "";
    return typeof product.title === "object"
      ? showingTranslateValue(product.title)
      : product.title;
  }, [showingTranslateValue]);

  const getProductImage = useCallback((product) => {
    if (!product) return "";
    if (Array.isArray(product.image)) {
      return product.image[0] || product.image;
    }
    return product.image;
  }, []);

  const getProductPrice = useCallback((product) => {
    if (!product) return 0;
    const price = product?.prices?.price || product?.price;
    return typeof price === "object"
      ? Number(showingTranslateValue(price)) || 0
      : Number(price) || 0;
  }, [showingTranslateValue]);

  const getProductDiscount = useCallback((product) => {
    if (!product) return 0;
    const discount = product?.prices?.discount || product?.discount;
    return typeof discount === "object"
      ? Number(showingTranslateValue(discount)) || 0
      : Number(discount) || 0;
  }, [showingTranslateValue]);

  const getProductDescription = useCallback((product) => {
    if (!product) return "";
    const desc = product?.description;
    if (!desc) return "";
    return typeof desc === "object"
      ? showingTranslateValue(desc)
      : desc;
  }, [showingTranslateValue]);

  const isImagePNG = useCallback((imageUrl) => {
    if (!imageUrl) return false;
    const url = typeof imageUrl === "string" ? imageUrl : imageUrl[0] || "";
    return url.toLowerCase().includes(".png") || url.toLowerCase().includes("png");
  }, []);

  const toggleLike = useCallback((productId) => {
    setLikedItems((prev) => {
      const isLiked = prev.includes(productId);
      const updated = isLiked
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];
      // Persist to localStorage
      try { localStorage.setItem('likedProducts', JSON.stringify(updated)); } catch (e) {}
      // Call API (fire-and-forget)
      ProductServices.toggleLike(productId, isLiked ? 'unlike' : 'like').catch(() => {});
      return updated;
    });
  }, []);

  // --- Category click ---
  const handleCategoryFilter = (categoryId) => {
    setActiveCategory(categoryId);
  };

  // --- Filtered products (memoized) ---
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return allProducts;
    return allProducts.filter((product) => {
      const cats = product.categories || [];
      const catId = product.category?._id || product.category;
      return cats.includes(activeCategory) || catId === activeCategory;
    });
  }, [activeCategory, allProducts]);

  // --- Visible products for infinite scroll ---
  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  // --- Intersection Observer for infinite scroll ---
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          setIsLoadingMore(true);
          // Small delay for smooth loading animation
          setTimeout(() => {
            setVisibleCount((prev) => Math.min(prev + LOAD_MORE, filteredProducts.length));
            setIsLoadingMore(false);
          }, 400);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, filteredProducts.length]);

  // --- Add to cart from horizontal widget ---
  const handleQuickAdd = (product) => {
    const isInCart = items.find((item) => item.id === product._id);
    if (isInCart) {
      toast.info("Already in cart!");
      return;
    }
    const newItem = {
      id: product._id,
      title: getProductTitle(product),
      image: getProductImage(product),
      price: getProductPrice(product),
      slug: product.slug,
      quantity: 1,
    };
    addItem(newItem);
    toast.success("Added to cart!");
  };

  // --- Horizontal scroll helpers ---
  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -260, behavior: "smooth" });
  };
  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 260, behavior: "smooth" });
  };

  // --- Auto-scroll for mobile hero carousel ---
  useEffect(() => {
    if (isMobile !== true || !scrollRef.current) return;

    const autoScrollInterval = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;

      const { scrollLeft, scrollWidth, clientWidth } = container;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
      const isAtStart = scrollLeft <= 10;

      if (mobileScrollDirection === 'forward') {
        if (isAtEnd) {
          setMobileScrollDirection('backward');
          container.scrollBy({ left: -260, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: 260, behavior: 'smooth' });
        }
      } else {
        if (isAtStart) {
          setMobileScrollDirection('forward');
          container.scrollBy({ left: 260, behavior: 'smooth' });
        } else {
          container.scrollBy({ left: -260, behavior: 'smooth' });
        }
      }
    }, 5000);

    return () => clearInterval(autoScrollInterval);
  }, [isMobile, mobileScrollDirection]);

  // --- Desktop hero slider helpers (instant, no lock) ---
  const changeSlide = useCallback((index, direction) => {
    setSlideDirection(direction);
    setIsTransitioning(true);
    // Immediate change after brief fade
    requestAnimationFrame(() => {
      setTimeout(() => {
        setActiveSlide(index);
        setIsTransitioning(false);
      }, 200);
    });
  }, []);

  const heroProduct = popularProducts[activeSlide] || popularProducts[0];

  const handleNextSlide = useCallback(() => {
    const next = (activeSlide + 1) % popularProducts.length;
    changeSlide(next, 'right');
    resetAutoPlay();
  }, [activeSlide, popularProducts.length, changeSlide]);

  const handlePrevSlide = useCallback(() => {
    const prev = (activeSlide - 1 + popularProducts.length) % popularProducts.length;
    changeSlide(prev, 'left');
    resetAutoPlay();
  }, [activeSlide, popularProducts.length, changeSlide]);

  const handleDotClick = useCallback((i) => {
    const direction = i > activeSlide ? 'right' : 'left';
    changeSlide(i, direction);
    resetAutoPlay();
  }, [activeSlide, changeSlide]);

  // --- Auto-play every 5 seconds (desktop only) ---
  useEffect(() => {
    if (isMobile !== false || popularProducts.length <= 1) return;
    autoPlayRef.current = setInterval(() => {
      setSlideDirection('right');
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % popularProducts.length);
        setIsTransitioning(false);
      }, 200);
    }, 5000);
    return () => clearInterval(autoPlayRef.current);
  }, [popularProducts.length]);

  // Reset auto-play on manual interaction
  const resetAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setSlideDirection('right');
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % popularProducts.length);
        setIsTransitioning(false);
      }, 200);
    }, 5000);
  }, [popularProducts.length]);

  // --- Open hero product modal ---
  const openHeroModal = useCallback((product) => {
    setHeroModalProduct(product);
    setHeroModalImageIndex(0);
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setHeroModalVisible(true);
      });
    });
  }, []);

  const closeHeroModal = useCallback(() => {
    setHeroModalVisible(false);
    setTimeout(() => {
      setHeroModalProduct(null);
      document.body.style.overflow = '';
    }, 400);
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && heroModalProduct) closeHeroModal();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [heroModalProduct, closeHeroModal]);

  // --- Get category name ---
  const getCategoryName = (cat) => {
    if (!cat?.name) return "";
    return typeof cat.name === "object"
      ? showingTranslateValue(cat.name)
      : cat.name;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-[#FDFBF7] via-[#F9F5EE] to-[#F5F0E7]">
        {/* ============ MOST ORDERED ============ */}
        <section className="pt-24 pb-4 lg:pb-6 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">

            {/* ---- Desktop Hero Slider (lg+) ---- */}
            {isMobile === false && heroProduct && (
              <div>
                {/* Outer wrapper for floating elements */}
                <div className="relative pt-28 pb-8">

                  {/* Floating Image - top left corner of the card */}
                  <div
                    className="absolute z-30"
                    style={{
                      left: '12%',
                      top: '-8px',
                      transform: isTransitioning
                        ? `translateX(${slideDirection === 'right' ? '-15px' : '15px'})`
                        : 'translateX(0)',
                      opacity: isTransitioning ? 0 : 1,
                      transition: 'transform 0.25s ease, opacity 0.2s ease',
                    }}
                  >
                    <div className="relative w-72 h-72 flex items-center justify-center">
                      <FlyingCrumbs imageSrc={getProductImage(heroProduct)} isDesktop slideKey={activeSlide} />
                      <div className={`relative w-56 h-56 z-10 ${
                        !isImagePNG(getProductImage(heroProduct)) ? 'rounded-2xl overflow-hidden border border-chocolate-100' : ''
                      }`}>
                        <Image
                          src={getProductImage(heroProduct)}
                          alt={getProductTitle(heroProduct)}
                          fill
                          className={`drop-shadow-2xl ${isImagePNG(getProductImage(heroProduct)) ? "object-contain" : "object-cover rounded-2xl"}`}
                          sizes="224px"
                          key={heroProduct._id}
                          priority
                        />
                      </div>
                    </div>
                  </div>

                  {/* Floating Discount Badge - above text area */}
                  {getProductDiscount(heroProduct) > 0 && (
                    <div
                      className="absolute z-40"
                      style={{
                        left: '12%',
                        width: '288px',
                        top: '235px',
                        display: 'flex',
                        justifyContent: 'center',
                        transform: isTransitioning
                          ? `translateX(${slideDirection === 'right' ? '-15px' : '15px'})`
                          : 'translateX(0)',
                        opacity: isTransitioning ? 0 : 1,
                        transition: 'transform 0.25s ease, opacity 0.2s ease',
                      }}
                    >
                      <div className="inline-flex items-baseline gap-1 bg-white rounded-lg shadow-md border border-chocolate-200 px-3 py-1.5">
                        <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.1rem', fontWeight: 800, color: '#B8860B' }}>
                          {Math.round(getProductDiscount(heroProduct))}%
                        </span>
                        <span className="text-chocolate-600 text-xs font-medium">
                          Off Now
                        </span>
                      </div>
                    </div>
                  )}

                  {/* The Card - contains only text content, 80% width */}
                  <div
                    className="relative shadow-lg overflow-visible mx-auto"
                    style={{
                      background: "linear-gradient(135deg, #FDF8F3 0%, #F5EDE3 60%, #EDE4D8 100%)",
                      borderRadius: '24px 60px 24px 60px',
                      border: '1px solid rgba(180, 160, 130, 0.15)',
                      maxWidth: '80%',
                    }}
                  >
                    {/* Left Arrow - on card left edge */}
                    <button
                      onClick={handlePrevSlide}
                      className="absolute top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-xl border border-chocolate-200 text-chocolate-600 hover:bg-chocolate-50 hover:scale-110 transition-all"
                      style={{ left: '-24px' }}
                    >
                      <FiChevronLeft className="w-6 h-6" />
                    </button>

                    {/* Right Arrow - on card right edge */}
                    <button
                      onClick={handleNextSlide}
                      className="absolute top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-full shadow-xl border border-chocolate-200 text-chocolate-600 hover:bg-chocolate-50 hover:scale-110 transition-all"
                      style={{ right: '-24px' }}
                    >
                      <FiChevronRight className="w-6 h-6" />
                    </button>
                    {/* Content - pushed right to make room for floating image */}
                    <div
                      className="h-[280px] flex items-center cursor-pointer"
                      style={{ borderRadius: '24px 60px 24px 60px', overflow: 'hidden' }}
                      onClick={() => openHeroModal(heroProduct)}
                    >
                      <div
                        className="flex-1 flex flex-col justify-center gap-3 py-8 pr-14"
                        style={{
                          paddingLeft: '350px',
                          transform: isTransitioning
                            ? `translateX(${slideDirection === 'right' ? '-15px' : '15px'})`
                            : 'translateX(0)',
                          opacity: isTransitioning ? 0 : 1,
                          transition: 'transform 0.25s ease, opacity 0.2s ease',
                        }}
                      >
                        <h3 className="font-serif font-bold text-4xl text-chocolate-800 leading-snug line-clamp-2">
                          {getProductTitle(heroProduct)}
                        </h3>
                        <p className={`text-base leading-relaxed line-clamp-3 max-w-lg ${getProductDescription(heroProduct) ? 'text-chocolate-500' : 'invisible'}`}>
                          {getProductDescription(heroProduct) || 'placeholder'}
                        </p>
                        <button
                          onClick={(e) => { e.stopPropagation(); openHeroModal(heroProduct); }}
                          className="mt-3 inline-flex items-center gap-2 px-7 py-2.5 bg-chocolate-50 hover:bg-chocolate-100 text-chocolate-700 rounded-xl text-lg font-semibold transition-colors duration-200 border border-chocolate-200 w-fit"
                        >
                          <FiShoppingCart className="w-5 h-5" />
                          Order Now
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dot indicators - below the card */}
                  <div className="flex justify-center mt-4">
                    <div className="inline-flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 shadow-sm border border-chocolate-100">
                      {popularProducts.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handleDotClick(i)}
                          className={`rounded-full transition-all duration-300 ${
                            i === activeSlide
                              ? 'bg-chocolate-600 w-4 h-1.5'
                              : 'bg-chocolate-300 hover:bg-chocolate-400 w-1.5 h-1.5'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---- Mobile Horizontal Scroll (below lg) ---- */}
            {isMobile !== false && (
            <div className="lg:hidden relative group">
              {/* Left Arrow */}
              <button
                onClick={scrollLeft}
                className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-chocolate-200 text-chocolate-600 hover:bg-chocolate-50 transition-all"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>

              {/* Right Arrow */}
              <button
                onClick={scrollRight}
                className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg border border-chocolate-200 text-chocolate-600 hover:bg-chocolate-50 transition-all"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>

              <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {popularProducts.map((product) => (
                  <div
                    key={product._id}
                    className="flex-shrink-0 snap-center w-[calc(100vw-5rem)] sm:w-[320px] rounded-2xl border border-chocolate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-visible relative"
                    style={{ background: "linear-gradient(135deg, #FDF8F3 0%, #F5EDE3 100%)" }}
                  >
                    <div className="relative flex items-stretch gap-2 p-4 pr-3 min-h-[170px]">
                      {/* Left: Image area with crumbs */}
                      <div className="relative w-32 flex-shrink-0 flex items-center justify-center">
                        <FlyingCrumbs imageSrc={getProductImage(product)} />
                        <div className={`relative w-28 h-32 z-10 ${
                          !isImagePNG(getProductImage(product)) ? 'rounded-xl overflow-hidden border border-chocolate-100' : ''
                        }`}>
                          <Image
                            src={getProductImage(product)}
                            alt={getProductTitle(product)}
                            fill
                            className={`drop-shadow-xl ${isImagePNG(getProductImage(product)) ? "object-contain" : "object-cover rounded-xl"}`}
                            sizes="112px"
                          />
                        </div>
                      </div>

                      {/* Right: Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center gap-1 pb-10">
                        {getProductDiscount(product) > 0 && (
                          <div className="flex items-baseline gap-1.5">
                            <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.5rem', fontWeight: 800, color: '#B8860B' }}>
                              {Math.round(getProductDiscount(product))}%
                            </span>
                            <span className="text-chocolate-600 text-sm font-medium">
                              Off Now
                            </span>
                          </div>
                        )}
                        <h3 className="font-serif font-bold text-lg text-chocolate-800 line-clamp-2 leading-snug">
                          {getProductTitle(product)}
                        </h3>
                      </div>

                      {/* Order Now - pinned bottom right */}
                      <button
                        onClick={() => openHeroModal(product)}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 px-4 py-2 bg-chocolate-50 hover:bg-chocolate-100 text-chocolate-700 rounded-lg text-sm font-semibold transition-colors duration-200 border border-chocolate-200"
                      >
                        <FiShoppingCart className="w-4 h-4" />
                        Order Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

          </div>
        </section>

        {/* ============ CATEGORY PILLS ============ */}
        <section className="px-4 sm:px-6 lg:px-8 pb-4">
          <div className="max-w-7xl mx-auto">
            <div className="relative">
              {/* Left fade */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-[#faf7f2] via-[#faf7f2]/50 to-transparent" />
              {/* Right fade */}
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-[#faf7f2] via-[#faf7f2]/50 to-transparent" />
              <div
                ref={categoryScrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-4"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
              {/* All pill */}
              <button
                onClick={() => handleCategoryFilter("all")}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-serif font-semibold transition-all duration-300 border ${
                  activeCategory === "all"
                    ? "bg-chocolate-600 text-white border-chocolate-600 shadow-md"
                    : "bg-white text-chocolate-600 border-chocolate-200 hover:border-chocolate-400 hover:bg-chocolate-50"
                }`}
              >
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleCategoryFilter(cat._id)}
                className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-serif font-semibold transition-all duration-300 whitespace-nowrap border ${
                  activeCategory === cat._id
                    ? "bg-chocolate-600 text-white border-chocolate-600 shadow-md"
                    : "bg-white text-chocolate-600 border-chocolate-200 hover:border-chocolate-400 hover:bg-chocolate-50"
                }`}
              >
                {getCategoryName(cat)}
              </button>
            ))}
          </div>
          </div>
          </div>
        </section>

        {/* ============ ALL PRODUCTS GRID ============ */}
        <section className="px-4 sm:px-6 lg:px-8 pb-32">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-serif font-bold text-lg text-chocolate-800">
                {activeCategory === "all" ? "All Products" : "Filtered Products"}
              </h2>
              <span className="text-sm text-chocolate-500 font-medium">
                {filteredProducts.length} items
              </span>
            </div>

            {/* Products Grid - 2 columns mobile, 4 columns desktop */}
            {filteredProducts.length > 0 ? (
              <>
                {/* Mobile: staggered 2-column layout */}
                <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mt-10">
                  {visibleProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className="animate-fadeInUp"
                      style={{ animationDelay: `${index >= (visibleCount - LOAD_MORE) ? (index % LOAD_MORE) * 60 : 0}ms`, animationFillMode: 'backwards' }}
                    >
                      <ExpandableProductCard
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
                    </div>
                  ))}
                </div>
                {/* Mobile staggered columns */}
                <div className="sm:hidden flex gap-3 mt-10">
                  {/* Right column (even indices) - stays at top */}
                  <div className="flex-1 flex flex-col gap-8">
                    {visibleProducts.filter((_, i) => i % 2 === 0).map((product, i) => {
                      const origIndex = i * 2;
                      return (
                        <div
                          key={product._id}
                          className="animate-fadeInUp"
                          style={{ animationDelay: `${origIndex >= (visibleCount - LOAD_MORE) ? (origIndex % LOAD_MORE) * 60 : 0}ms`, animationFillMode: 'backwards' }}
                        >
                          <ExpandableProductCard
                            product={product}
                            index={origIndex}
                            getProductTitle={getProductTitle}
                            getProductImage={getProductImage}
                            getProductPrice={getProductPrice}
                            getProductDiscount={getProductDiscount}
                            isImagePNG={isImagePNG}
                            likedItems={likedItems}
                            toggleLike={toggleLike}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {/* Right column (odd indices) - shifted down */}
                  <div className="flex-1 flex flex-col gap-8" style={{ marginTop: '110px' }}>
                    {visibleProducts.filter((_, i) => i % 2 === 1).map((product, i) => {
                      const origIndex = i * 2 + 1;
                      return (
                        <div
                          key={product._id}
                          className="animate-fadeInUp"
                          style={{ animationDelay: `${origIndex >= (visibleCount - LOAD_MORE) ? (origIndex % LOAD_MORE) * 60 : 0}ms`, animationFillMode: 'backwards' }}
                        >
                          <ExpandableProductCard
                            product={product}
                            index={origIndex}
                            getProductTitle={getProductTitle}
                            getProductImage={getProductImage}
                            getProductPrice={getProductPrice}
                            getProductDiscount={getProductDiscount}
                            isImagePNG={isImagePNG}
                            likedItems={likedItems}
                            toggleLike={toggleLike}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Load more sentinel */}
                {hasMore && (
                  <div ref={loadMoreRef} className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-chocolate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-chocolate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-chocolate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-chocolate-100 rounded-full flex items-center justify-center mb-4">
                  <FiShoppingCart className="w-8 h-8 text-chocolate-400" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-chocolate-700 mb-1">
                  No products found
                </h3>
                <p className="text-chocolate-500 text-sm">
                  Try selecting a different category
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ===== Hero Product Modal (fade-up) ===== */}
      {heroModalProduct && (() => {
        const product = heroModalProduct;
        const productImages = Array.isArray(product?.image) ? product.image : [product?.image].filter(Boolean);
        const hasMultipleImages = productImages.length > 1;
        const currentModalImage = productImages[heroModalImageIndex] || getProductImage(product);
        const isInCart = items.some((item) => item.id === product._id);
        const cartQuantity = items.find((item) => item.id === product._id)?.quantity || 0;
        const desc = getProductDescription(product);
        const discount = getProductDiscount(product);
        const price = getProductPrice(product);
        const originalPrice = product?.prices?.originalPrice || product?.originalPrice;
        const originalPriceValue = typeof originalPrice === 'object' ? Number(showingTranslateValue(originalPrice)) : Number(originalPrice);

        const handleModalAddToCart = () => {
          addItem({
            id: product._id,
            name: getProductTitle(product),
            price: price,
            image: getProductImage(product),
            quantity: 1,
          });
          toast.success(`${getProductTitle(product)} added to cart!`, { position: "bottom-right", autoClose: 2000 });
        };

        const handleModalUpdateQty = (increment) => {
          const cartItem = items.find(item => item.id === product._id);
          if (!cartItem) return;
          if (increment) {
            addItem({ id: product._id, name: getProductTitle(product), price, image: getProductImage(product), quantity: 1 });
          } else {
            if (cartItem.quantity > 1) updateItemQuantity(product._id, cartItem.quantity - 1);
            else removeItem(product._id);
          }
        };

        return (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9997] bg-black/60 backdrop-blur-sm"
              style={{
                opacity: heroModalVisible ? 1 : 0,
                transition: 'opacity 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
              }}
              onClick={closeHeroModal}
            />

            {/* Modal — uses same absolute-position layout as ExpandableProductCard expanded state */}
            {(() => {
              // Calculate dimensions exactly like ExpandableProductCard.getExpandedDimensions
              const vw = typeof window !== 'undefined' ? window.innerWidth : 1024;
              const vh = typeof window !== 'undefined' ? window.innerHeight : 768;
              const isVertical = vw < 1024;
              const modalW = isVertical ? vw * 0.95 : Math.min(vw * 0.95, 900);
              const modalH = isVertical ? vh * 0.92 : Math.min(vh * 0.9, 600);

              // Image sizing — same as ExpandableProductCard
              const imageSize = isVertical ? Math.min(modalW * 0.6, modalH * 0.38) : 320;
              const halfWidth = modalW / 2;
              const thumbnailSpace = (isVertical && hasMultipleImages) ? 50 : 0;

              // Image position (relative to modal)
              let imgLeft, imgTop;
              if (isVertical) {
                imgLeft = (modalW - imageSize) / 2;
                imgTop = 40;
              } else {
                // Image on right half
                imgLeft = halfWidth + (halfWidth - imageSize) / 2;
                imgTop = (modalH - imageSize) / 2;
              }

              // Content position (relative to modal)
              let contentLeft, contentTop, contentWidth;
              if (isVertical) {
                contentLeft = 24;
                contentTop = imgTop + imageSize + thumbnailSpace + 55;
                contentWidth = modalW - 48;
              } else {
                // Content on left half
                contentLeft = 48;
                contentTop = 50;
                contentWidth = halfWidth - 96;
              }

              const priceTop = isVertical ? modalH - 120 : modalH - 160;
              const buttonTop = isVertical ? modalH - 70 : modalH - 100;

              // Measure actual title height at expanded width/fontSize (same as ExpandableProductCard)
              const titleText = getProductTitle(product);
              const titleFontSize = isVertical ? '1.5rem' : '1.875rem';
              let titleHeight = 40; // fallback
              if (typeof document !== 'undefined') {
                const tempTitle = document.createElement('h3');
                tempTitle.style.cssText = `
                  position:fixed;visibility:hidden;top:-9999px;
                  width:${contentWidth}px;
                  font-size:${titleFontSize};
                  font-weight:bold;text-align:center;
                  font-family:ui-serif,Georgia,Cambria,"Times New Roman",Times,serif;
                  line-height:1.3;
                `;
                tempTitle.textContent = titleText;
                document.body.appendChild(tempTitle);
                titleHeight = tempTitle.getBoundingClientRect().height;
                document.body.removeChild(tempTitle);
              }
              const descGap = isVertical ? 10 : 16;
              const descTop = contentTop + titleHeight + descGap;
              const descAvailableHeight = Math.max(0, priceTop - descTop - 16);

              return (
                <div
                  className="fixed z-[9999] left-1/2 top-1/2"
                  style={{
                    transform: heroModalVisible
                      ? 'translate(-50%, -50%) translateY(0)'
                      : 'translate(-50%, -50%) translateY(60px)',
                    opacity: heroModalVisible ? 1 : 0,
                    transition: 'transform 0.45s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.35s ease',
                    width: modalW,
                    height: modalH,
                  }}
                >
                  {/* Background card */}
                  <div className="absolute inset-0 bg-white rounded-3xl border border-[#eedccb] overflow-hidden" style={{ boxShadow: '0 10px 15px -3px #8b54354f, 0 4px 6px -4px #a67140cf' }}>
                    {/* Decorative Waves */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                      {/* Main wave - bottom right */}
                      <svg viewBox="0 0 300 400" className="absolute right-0 bottom-0 w-full h-full" preserveAspectRatio="none">
                        <path d="M 300,0 L 300,160 C 280,200 250,240 210,280 C 170,320 120,360 60,390 C 40,400 20,408 0,412 L 0,450 L 350,450 L 350,0 Z" fill="#d4a574" opacity="0.28" />
                        <path d="M 300,0 L 300,190 C 275,230 240,270 195,310 C 150,350 95,385 35,405 C 20,410 10,414 0,416 L 0,450 L 350,450 L 350,0 Z" fill="#c89968" opacity="0.18" />
                      </svg>
                      {/* Secondary wave - top left (smaller) */}
                      <svg viewBox="0 0 300 400" className="absolute left-0 top-0 w-2/5 h-2/5" preserveAspectRatio="none" style={{ transform: 'rotate(180deg)' }}>
                        <path d="M 300,0 L 300,160 C 280,200 250,240 210,280 C 170,320 120,360 60,390 C 40,400 20,408 0,412 L 0,450 L 350,450 L 350,0 Z" fill="#d4a574" opacity="0.15" />
                        <path d="M 300,0 L 300,210 C 270,250 235,290 190,330 C 145,370 90,400 30,415 C 15,418 5,420 0,421 L 0,450 L 350,450 L 350,0 Z" fill="#c89968" opacity="0.1" />
                      </svg>
                    </div>
                  </div>

                  {/* Close button */}
                  <button
                    onClick={closeHeroModal}
                    className="absolute z-50 p-2 md:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg hover:scale-110 transition-all duration-200"
                    style={{ top: 16, right: 16 }}
                  >
                    <FiX className="w-5 h-5 md:w-6 md:h-6 text-chocolate-700" />
                  </button>

                  {/* Floating Image */}
                  <div
                    className="absolute z-10"
                    style={{ top: imgTop, left: imgLeft, width: imageSize, height: imageSize }}
                  >
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 bg-gradient-to-br from-chocolate-200/30 to-chocolate-400/30 rounded-full blur-2xl" />
                      <div className={`relative w-full h-full ${
                        !isImagePNG(currentModalImage) ? 'border-2 border-chocolate-500 rounded-2xl p-2 bg-white shadow-xl' : ''
                      }`}>
                        <Image
                          src={currentModalImage}
                          alt={getProductTitle(product)}
                          fill
                          className={`drop-shadow-2xl ${isImagePNG(currentModalImage) ? 'object-contain' : 'object-cover rounded-2xl'}`}
                          sizes={`${imageSize}px`}
                        />
                      </div>
                      {/* Discount Badge */}
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 z-20 bg-chocolate-500 text-white font-bold rounded-full shadow-lg px-3 py-1.5 text-xs">
                          -{Math.round(discount)}% OFF
                        </div>
                      )}
                      {/* Image Nav Arrows */}
                      {hasMultipleImages && (
                        <>
                          <button
                            onClick={() => setHeroModalImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length)}
                            className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg hover:scale-110 transition-all z-30"
                          >
                            <FiChevronLeft className="w-5 h-5 text-chocolate-700" />
                          </button>
                          <button
                            onClick={() => setHeroModalImageIndex((prev) => (prev + 1) % productImages.length)}
                            className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg hover:scale-110 transition-all z-30"
                          >
                            <FiChevronRight className="w-5 h-5 text-chocolate-700" />
                          </button>
                        </>
                      )}
                    </div>
                    {/* Thumbnails below image */}
                    {hasMultipleImages && (
                      <div className="overflow-x-auto max-w-full px-2 mt-3">
                        <div className="flex items-center justify-center gap-3 py-2">
                          {productImages.map((img, idx) => (
                            <button
                              key={idx}
                              onClick={() => setHeroModalImageIndex(idx)}
                              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden hover:scale-110 transition-all duration-200 ${
                                idx === heroModalImageIndex
                                  ? 'border-2 border-chocolate-500 shadow-lg shadow-chocolate-200'
                                  : 'border-2 shadow-md hover:border-chocolate-300'
                              }`}
                              style={idx !== heroModalImageIndex ? { borderColor: '#c9a58a' } : {}}
                            >
                              <Image src={img} alt={`${idx + 1}`} fill className={isImagePNG(img) ? 'object-contain' : 'object-cover'} />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Floating Title */}
                  <h3
                    className="absolute z-10 text-center font-serif font-bold text-chocolate-800 flex items-center justify-center"
                    style={{
                      top: contentTop,
                      left: contentLeft,
                      width: contentWidth,
                      fontSize: isVertical ? '1.5rem' : '1.875rem',
                      lineHeight: 1.3,
                    }}
                  >
                    {getProductTitle(product)}
                  </h3>

                  {/* Floating Description */}
                  <div
                    className="absolute z-10 font-sans text-chocolate-600 overflow-hidden"
                    style={{
                      top: descTop,
                      left: contentLeft,
                      width: contentWidth,
                      height: descAvailableHeight,
                    }}
                  >
                    {desc && (
                      <>
                        <div className="flex items-center justify-center gap-3 mb-3">
                          <span className="flex-1 h-px bg-gradient-to-r from-transparent to-chocolate-300" />
                          <h4 className="text-xs font-bold text-chocolate-500 uppercase tracking-[0.2em] whitespace-nowrap">Description</h4>
                          <span className="flex-1 h-px bg-gradient-to-l from-transparent to-chocolate-300" />
                        </div>
                        <div
                          className="overflow-y-auto pr-1"
                          style={{
                            height: `calc(100% - 32px)`,
                            maskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
                          }}
                        >
                          <p className="text-sm leading-relaxed">{desc}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Floating Price */}
                  <div
                    className="absolute z-10 flex items-center gap-2 justify-center"
                    style={{ top: priceTop, left: contentLeft, width: contentWidth }}
                  >
                    <span dir="ltr" className="font-display font-bold text-chocolate-700 text-3xl">
                      <span className="currency-ar">ج.م</span> {Math.round(price)}
                    </span>
                    {originalPriceValue > price && (
                      <span dir="ltr" className="text-gray-400 text-sm"><span className="currency-ar">ج.م</span> <span className="line-through">{Math.round(originalPriceValue)}</span></span>
                    )}
                  </div>

                  {/* Floating Button */}
                  <div
                    className="absolute z-10"
                    style={{ top: buttonTop, left: contentLeft, width: contentWidth, height: 50 }}
                  >
                    {!isInCart ? (
                      <button
                        onClick={handleModalAddToCart}
                        className="w-full h-full flex items-center justify-center gap-2 font-serif font-semibold bg-[#f7f1ed] hover:bg-[#eedfd4] text-chocolate-700 rounded-xl border-2 border-chocolate-300 shadow-md hover:shadow-lg transition-all duration-300"
                      >
                        <FiShoppingCart className="w-5 h-5" />
                        Add to Cart
                      </button>
                    ) : (
                      <div className="w-full h-full flex items-center justify-between rounded-xl border-2 border-chocolate-200 bg-chocolate-50 px-2">
                        <button
                          onClick={() => handleModalUpdateQty(false)}
                          className="flex items-center justify-center w-10 h-10 bg-white hover:bg-chocolate-100 text-chocolate-700 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <FiMinus className="w-5 h-5" />
                        </button>
                        <span className="font-display font-bold text-chocolate-800 text-2xl flex-1 text-center">
                          {cartQuantity}
                        </span>
                        <button
                          onClick={() => handleModalUpdateQty(true)}
                          className="flex items-center justify-center w-10 h-10 bg-chocolate-600 hover:bg-chocolate-700 text-white rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          <FiPlus className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </>
        );
      })()}
    </Layout>
  );
};

export const getServerSideProps = async (context) => {
  const { cookies } = context.req;

  try {
    const [productData, allProductsData, categoryData, mostLikedData] = await Promise.all([
      ProductServices.getShowingStoreProducts({
        category: "",
        title: "",
      }),
      ProductServices.getShowingProducts(),
      CategoryServices.getShowingCategory(),
      ProductServices.getMostLikedProducts(10),
    ]);

    // Most liked products for hero slider (fallback to popular)
    const mostLiked = mostLikedData
      ? JSON.parse(JSON.stringify(mostLikedData))
      : [];

    const popularProducts = mostLiked.length > 0
      ? mostLiked
      : productData?.popularProducts
        ? JSON.parse(JSON.stringify(productData.popularProducts))
        : [];

    // All products for the grid
    const allProducts = allProductsData
      ? JSON.parse(JSON.stringify(allProductsData))
      : popularProducts;

    // Extract category children
    const categories = categoryData?.[0]?.children
      ? JSON.parse(JSON.stringify(categoryData[0].children))
      : [];

    return {
      props: {
        cookies: cookies || null,
        popularProducts: popularProducts.slice(0, 10),
        allProducts,
        categories,
      },
    };
  } catch (error) {
    console.error("Menu SSR error:", error);
    return {
      props: {
        cookies: cookies || null,
        popularProducts: [],
        allProducts: [],
        categories: [],
      },
    };
  }
};

export default Menu;
