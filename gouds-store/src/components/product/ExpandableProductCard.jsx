import { useState, useRef, useEffect, useCallback, useLayoutEffect } from "react";
import Image from "next/image";
import { FiShoppingCart, FiHeart, FiPlus, FiMinus, FiX } from "react-icons/fi";
import { useCart } from "react-use-cart";
import { toast } from "react-toastify";
import useUtilsFunction from "@hooks/useUtilsFunction";

const ExpandableProductCard = ({
  product,
  index,
  getProductTitle,
  getProductImage,
  getProductPrice,
  getProductDiscount,
  isImagePNG,
  likedItems,
  toggleLike,
}) => {
  const { addItem, items, updateItemQuantity, removeItem } = useCart();
  const { showingTranslateValue } = useUtilsFunction();
  
  // Animation states
  const [animationState, setAnimationState] = useState("idle"); // idle, expanding, expanded, collapsing
  const [isOnRightSide, setIsOnRightSide] = useState(false);
  const [cardStyles, setCardStyles] = useState({});
  
  const cardRef = useRef(null);
  const placeholderRef = useRef(null);
  const originalRectRef = useRef(null);
  const scrollYRef = useRef(0); // Save scroll position when expanding

  // Get final expanded dimensions
  const getExpandedDimensions = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    const width = isMobile ? window.innerWidth * 0.95 : Math.min(window.innerWidth * 0.95, 900);
    const height = isMobile ? window.innerHeight * 0.9 : Math.min(window.innerHeight * 0.9, 600);
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    return { width, height, left, top };
  }, []);

  // Handle expansion - FLIP animation
  const handleExpand = useCallback(() => {
    if (!cardRef.current || animationState !== "idle") return;
    
    // FIRST: Get current position and save scroll
    const rect = cardRef.current.getBoundingClientRect();
    // Convert DOMRect to plain object with all values
    originalRectRef.current = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      right: rect.right,
      bottom: rect.bottom,
      // Save the absolute position on page (not viewport)
      pageTop: rect.top + window.scrollY,
      pageLeft: rect.left + window.scrollX,
    };
    scrollYRef.current = window.scrollY;
    
    // Determine side
    const screenCenterX = window.innerWidth / 2;
    const cardCenterX = rect.left + rect.width / 2;
    setIsOnRightSide(cardCenterX > screenCenterX);
    
    // Set initial fixed position (same as current position)
    setCardStyles({
      position: 'fixed',
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      zIndex: 9999,
    });
    
    setAnimationState("expanding");
    document.body.style.overflow = "hidden";
    
    // LAST & INVERT & PLAY: Animate to final position
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const expanded = getExpandedDimensions();
        setCardStyles({
          position: 'fixed',
          top: expanded.top,
          left: expanded.left,
          width: expanded.width,
          height: expanded.height,
          zIndex: 9999,
        });
        
        setTimeout(() => {
          setAnimationState("expanded");
        }, 500);
      });
    });
  }, [animationState, getExpandedDimensions]);

  // Handle collapse - reverse FLIP
  const handleCollapse = useCallback(() => {
    if (animationState !== "expanded") return;
    
    setAnimationState("collapsing");
    
    // Calculate target position based on original absolute position
    const originalRect = originalRectRef.current;
    if (originalRect) {
      // Calculate viewport position from saved absolute position
      const targetTop = originalRect.pageTop - scrollYRef.current;
      
      setCardStyles({
        position: 'fixed',
        top: targetTop,
        left: originalRect.left,
        width: originalRect.width,
        height: originalRect.height,
        zIndex: 9999,
      });
    }
    
    setTimeout(() => {
      setCardStyles({});
      setAnimationState("idle");
      document.body.style.overflow = "";
    }, 500);
  }, [animationState]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && (animationState === "expanded" || animationState === "expanding")) {
        handleCollapse();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [animationState, handleCollapse]);

  // Cart functions
  const handleAddToCart = (e) => {
    e?.stopPropagation();
    const title = getProductTitle(product);
    const price = getProductPrice(product);
    const image = getProductImage(product);
    
    addItem({
      id: product._id,
      name: title,
      price: price,
      image: image,
      quantity: 1,
    });
    toast.success(`${title} added to cart! 🍪`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const handleUpdateQuantity = (e, increment) => {
    e?.stopPropagation();
    const cartItem = items.find(item => item.id === product._id);
    if (!cartItem) return;

    if (increment) {
      addItem({
        id: product._id,
        name: getProductTitle(product),
        price: getProductPrice(product),
        image: getProductImage(product),
        quantity: 1,
      });
    } else {
      if (cartItem.quantity > 1) {
        updateItemQuantity(product._id, cartItem.quantity - 1);
      } else {
        removeItem(product._id);
      }
    }
  };

  const isInCart = items.some((item) => item.id === product._id);
  const cartQuantity = items.find((item) => item.id === product._id)?.quantity || 0;
  const isAnimating = animationState !== "idle";
  const isFullyExpanded = animationState === "expanded";
  // Use expanded layout only during expanding and expanded states, NOT during collapsing
  const useExpandedLayout = animationState === "expanding" || animationState === "expanded";

  const getProductDescription = () => {
    if (!product?.description) return "Delicious handcrafted cookie made with the finest ingredients. Made with premium quality ingredients for the perfect taste.";
    return typeof product.description === 'object'
      ? showingTranslateValue(product.description)
      : product.description;
  };

  return (
    <>
      {/* Placeholder to maintain grid layout when card is animating */}
      {isAnimating && originalRectRef.current && (
        <div 
          ref={placeholderRef}
          style={{ 
            width: originalRectRef.current.width,
            height: originalRectRef.current.height,
            visibility: 'hidden',
          }}
        />
      )}

      {/* Backdrop */}
      {isAnimating && (
        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-500 ${
            animationState === "collapsing" ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleCollapse}
        />
      )}

      {/* The actual card */}
      <div
        ref={cardRef}
        onClick={!isAnimating ? handleExpand : undefined}
        className="group relative cursor-pointer"
        style={{
          ...cardStyles,
          // Always keep pt-32 equivalent padding when not expanded
          paddingTop: !useExpandedLayout ? '8rem' : 0,
          transition: isAnimating ? 'all 0.5s cubic-bezier(0.32, 0.72, 0, 1)' : 'none',
        }}
      >
        {/* Close button - only when expanded */}
        {isFullyExpanded && (
          <button
            onClick={handleCollapse}
            className="absolute top-4 right-4 z-50 p-3 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          >
            <FiX className="w-6 h-6 text-chocolate-700" />
          </button>
        )}

        {/* Floating Image Section - OUTSIDE the card, floats above it */}
        {!useExpandedLayout && (
          <div 
            className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none"
          >
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-chocolate-200/30 to-chocolate-400/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />

            {/* Product Image */}
            <div className={`
              relative transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
              w-48 h-48 group-hover:scale-110 group-hover:-rotate-6
              ${!isImagePNG(getProductImage(product)) ? 'border-2 border-chocolate-500 rounded-2xl p-2 bg-white shadow-xl' : ''}
            `}>
              <Image
                src={getProductImage(product)}
                alt={getProductTitle(product)}
                fill
                className={`object-contain drop-shadow-2xl relative z-10 ${
                  !isImagePNG(getProductImage(product)) ? 'rounded-2xl' : ''
                }`}
              />
            </div>

            {/* Discount Badge */}
            {getProductDiscount(product) > 0 && (
              <div className="absolute z-20 bg-chocolate-500 text-white font-bold rounded-full shadow-lg top-4 left-4 px-3 py-1.5 text-xs">
                -{getProductDiscount(product)}% OFF
              </div>
            )}
          </div>
        )}

        {/* Main Card Container */}
        <div 
          className={`
            relative bg-white overflow-hidden shadow-lg rounded-3xl
            transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
            ${useExpandedLayout 
              ? 'h-full' 
              : 'border-2 border-gray-200 hover:border-chocolate-400 hover:shadow-2xl pt-24 pb-6'
            }
          `}
        >
          {/* Layout container for expanded state */}
          <div className={`
            ${useExpandedLayout ? 'h-full flex' + (isOnRightSide ? ' flex-row-reverse' : ' flex-row') : ''}
          `}>
            
            {/* Image Section - INSIDE card only when expanded */}
            {useExpandedLayout && (
              <div 
                className="relative w-1/2 h-full flex items-center justify-center bg-gradient-to-br from-chocolate-100 via-cream-50 to-chocolate-200"
              >
                {/* Background glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-chocolate-200/30 to-chocolate-400/30 rounded-full blur-3xl" />

                {/* Decorative Wave - inside image section when expanded */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                  <svg
                    viewBox="0 0 100 100"
                    className={`absolute ${isOnRightSide ? "left-0" : "right-0"} top-0 w-full h-full`}
                    preserveAspectRatio="none"
                    style={{
                      opacity: isFullyExpanded ? 1 : 0,
                      transition: 'opacity 0.5s ease-out',
                    }}
                  >
                    <path
                      d={isOnRightSide 
                        ? "M 0,0 L 0,100 L 100,100 L 100,30 C 80,35 60,45 45,60 C 30,75 20,85 0,100 Z"
                        : "M 100,0 L 100,100 L 0,100 L 0,30 C 20,35 40,45 55,60 C 70,75 80,85 100,100 Z"
                      }
                      fill="#d4a574"
                      opacity="0.3"
                    />
                    <path
                      d={isOnRightSide
                        ? "M 0,0 L 0,100 L 100,100 L 100,50 C 75,55 55,65 40,78 C 25,88 15,95 0,100 Z"
                        : "M 100,0 L 100,100 L 0,100 L 0,50 C 25,55 45,65 60,78 C 75,88 85,95 100,100 Z"
                      }
                      fill="#c89968"
                      opacity="0.2"
                    />
                  </svg>
                </div>

                {/* Product Image */}
                <div className={`
                  relative transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
                  w-64 h-64 md:w-80 md:h-80
                  ${!isImagePNG(getProductImage(product)) ? 'border-2 border-chocolate-500 rounded-2xl p-2 bg-white shadow-xl' : ''}
                `}>
                  <Image
                    src={getProductImage(product)}
                    alt={getProductTitle(product)}
                    fill
                    className={`object-contain drop-shadow-2xl relative z-10 ${
                      !isImagePNG(getProductImage(product)) ? 'rounded-2xl' : ''
                    }`}
                  />
                </div>

                {/* Discount Badge */}
                {getProductDiscount(product) > 0 && (
                  <div className="absolute z-20 bg-chocolate-500 text-white font-bold rounded-full shadow-lg top-6 left-6 px-4 py-2 text-sm transition-all duration-500">
                    -{getProductDiscount(product)}% OFF
                  </div>
                )}
              </div>
            )}

            {/* Decorative Wave - only when NOT expanded */}
            {!useExpandedLayout && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0">
                <svg
                  viewBox="0 0 300 400"
                  className="absolute right-0 bottom-0 w-full h-full"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M 300,0 L 300,200 C 260,230 230,260 200,300 C 170,340 140,370 100,390 C 70,405 40,415 0,420 L 0,450 L 350,450 L 350,0 Z"
                    fill="#d4a574"
                    opacity="0.25"
                  />
                  <path
                    d="M 300,0 L 300,220 C 265,250 235,280 205,320 C 175,360 145,385 105,400 C 75,410 45,418 10,422 L 10,450 L 350,450 L 350,0 Z"
                    fill="#c89968"
                    opacity="0.15"
                  />
                </svg>
              </div>
            )}

            {/* Content Section */}
            <div className={`
              relative z-10 flex flex-col
              ${useExpandedLayout 
                ? 'w-1/2 h-full justify-center p-8 md:p-12' 
                : 'w-full'
              }
            `}
            style={{
              transition: 'none',
            }}>
              {/* Like Button */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(product._id); }}
                className={`
                  absolute z-20 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300
                  ${useExpandedLayout 
                    ? 'top-6 right-16 p-3 bg-chocolate-50 hover:bg-chocolate-100' 
                    : 'top-4 right-4 p-2.5'
                  }
                `}
                aria-label="Add to wishlist"
              >
                <FiHeart
                  className={`transition-all duration-300 ${
                    likedItems.includes(product._id)
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-gray-400"
                  } ${useExpandedLayout ? 'w-6 h-6' : 'w-5 h-5'}`}
                />
              </button>

              {/* Product Info */}
              <div className={`${useExpandedLayout ? 'space-y-4' : 'px-6 space-y-3'}`}>
                {/* Title */}
                <h3 className={`
                  font-serif font-bold text-chocolate-800
                  ${useExpandedLayout 
                    ? 'text-3xl md:text-4xl text-left' 
                    : 'text-xl text-center group-hover:text-chocolate-600 min-h-[3.5rem] flex items-center justify-center'
                  }
                `}
                style={{
                  transition: 'none',
                }}>
                  {getProductTitle(product)}
                </h3>

                {/* Description - always rendered to reserve space, visible only when expanded */}
                {useExpandedLayout && (
                  <p 
                    className="text-chocolate-600 text-base md:text-lg leading-relaxed line-clamp-4"
                    style={{
                      opacity: isFullyExpanded ? 1 : 0,
                      transition: 'opacity 0.4s ease-out',
                    }}
                  >
                    {getProductDescription()}
                  </p>
                )}

                {/* Price */}
                <div className={`flex items-center gap-2 ${useExpandedLayout ? 'justify-start' : 'justify-center'}`}>
                  <span className={`font-display font-bold text-chocolate-700 ${useExpandedLayout ? 'text-4xl md:text-5xl' : 'text-3xl'}`}
                    style={{
                      transition: 'none',
                    }}>
                    ${getProductPrice(product).toFixed(2)}
                  </span>
                  {(() => {
                    const currentPrice = getProductPrice(product);
                    const originalPrice = product?.prices?.originalPrice || product?.originalPrice;
                    const originalPriceValue = typeof originalPrice === 'object' 
                      ? Number(showingTranslateValue(originalPrice)) 
                      : Number(originalPrice);
                    
                    return originalPriceValue > currentPrice ? (
                      <span className={`text-gray-400 line-through ${useExpandedLayout ? 'text-xl' : 'text-sm'}`}>
                        ${originalPriceValue.toFixed(2)}
                      </span>
                    ) : null;
                  })()}
                </div>

                {/* Add to Cart / Quantity Control */}
                <div className={`${useExpandedLayout ? 'pt-4 mt-auto' : 'pt-2'}`} onClick={(e) => e.stopPropagation()}>
                  {!isInCart ? (
                    <button
                      onClick={handleAddToCart}
                      className={`
                        w-full flex items-center justify-center gap-2 font-serif font-semibold shadow-md hover:shadow-lg
                        ${useExpandedLayout 
                          ? 'h-16 px-8 bg-chocolate-600 hover:bg-chocolate-700 text-white rounded-2xl text-lg hover:scale-[1.02]' 
                          : 'h-14 px-6 bg-[#f7f1ed] hover:bg-[#eedfd4] text-chocolate-700 rounded-xl border-2 border-chocolate-300'
                        }
                      `}
                      style={{
                        transition: useExpandedLayout ? 'transform 0.2s, box-shadow 0.2s' : 'all 0.3s',
                      }}
                    >
                      <FiShoppingCart className={useExpandedLayout ? 'w-6 h-6' : 'w-5 h-5'} />
                      Add to Cart
                    </button>
                  ) : (
                    <div className={`
                      flex items-center justify-between rounded-xl border-2 border-chocolate-200 bg-chocolate-50
                      ${useExpandedLayout ? 'h-16 px-4 rounded-2xl' : 'h-14 px-2'}
                    `}>
                      <button
                        onClick={(e) => handleUpdateQuantity(e, false)}
                        className={`
                          flex items-center justify-center bg-white hover:bg-chocolate-100 text-chocolate-700 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg
                          ${useExpandedLayout ? 'w-14 h-12 rounded-xl' : 'w-10 h-10'}
                        `}
                      >
                        <FiMinus className={useExpandedLayout ? 'w-6 h-6' : 'w-5 h-5'} />
                      </button>
                      <span className={`font-display font-bold text-chocolate-800 text-center flex-1 ${useExpandedLayout ? 'text-3xl' : 'text-2xl'}`}>
                        {cartQuantity}
                      </span>
                      <button
                        onClick={(e) => handleUpdateQuantity(e, true)}
                        className={`
                          flex items-center justify-center bg-chocolate-600 hover:bg-chocolate-700 text-white rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg
                          ${useExpandedLayout ? 'w-14 h-12 rounded-xl' : 'w-10 h-10'}
                        `}
                      >
                        <FiPlus className={useExpandedLayout ? 'w-6 h-6' : 'w-5 h-5'} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframes for description animation */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ExpandableProductCard;
