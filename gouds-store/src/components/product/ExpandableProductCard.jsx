import { useState, useRef, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { FiShoppingCart, FiHeart, FiPlus, FiMinus, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useCart } from "react-use-cart";
import { toast } from "react-toastify";
import useUtilsFunction from "@hooks/useUtilsFunction";
import useIsMobile from "@hooks/useIsMobile";

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
  const isMobile = useIsMobile();
  
  // Wave direction: mobile 2-col → even index (left col) flipped; desktop 4-col → first 2 (indices 0,1) flipped
  const isWaveFlipped = isMobile ? (index % 2 === 0) : (index % 4 < 2);
  
  // Animation states
  const [animationState, setAnimationState] = useState("idle"); // idle, expanding, expanded, collapsing
  const [isOnRightSide, setIsOnRightSide] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageTransition, setImageTransition] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState('next');
  
  // Styles for each animated element
  const [containerStyles, setContainerStyles] = useState({});
  const [imageStyles, setImageStyles] = useState({});
  const [titleStyles, setTitleStyles] = useState({});
  const [priceStyles, setPriceStyles] = useState({});
  const [buttonStyles, setButtonStyles] = useState({});
  const [bgStyles, setBgStyles] = useState({});
  const [descStyles, setDescStyles] = useState({});
  
  // Refs for each element
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const titleRef = useRef(null);
  const priceRef = useRef(null);
  const buttonRef = useRef(null);
  const bgRef = useRef(null);
  const descRef = useRef(null);
  const placeholderRef = useRef(null);
  
  // Original positions
  const originalRects = useRef({});
  const scrollYRef = useRef(0);

  // iOS-style timing function
  const iosEasing = 'cubic-bezier(0.32, 0.72, 0, 1)';
  const duration = 550; // iOS typical duration

  // Get final expanded dimensions
  const getExpandedDimensions = useCallback(() => {
    const isVertical = window.innerWidth < 1024;
    const width = isVertical ? window.innerWidth * 0.95 : Math.min(window.innerWidth * 0.95, 900);
    const height = isVertical ? window.innerHeight * 0.92 : Math.min(window.innerHeight * 0.9, 600);
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    return { width, height, left, top, isVertical };
  }, []);

  // Save original positions of all elements
  const saveOriginalPositions = useCallback(() => {
    scrollYRef.current = window.scrollY;
    
    const elements = {
      container: containerRef.current,
      image: imageRef.current,
      title: titleRef.current,
      price: priceRef.current,
      button: buttonRef.current,
      bg: bgRef.current,
      desc: descRef.current,
    };

    Object.keys(elements).forEach(key => {
      if (elements[key]) {
        const rect = elements[key].getBoundingClientRect();
        const computed = getComputedStyle(elements[key]);
        originalRects.current[key] = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          pageTop: rect.top + window.scrollY,
          pageLeft: rect.left + window.scrollX,
          fontSize: computed.fontSize,
        };
      }
    });
  }, []);

  // Handle expansion
  const handleExpand = useCallback(() => {
    if (!containerRef.current || animationState !== "idle") return;
    
    saveOriginalPositions();
    
    // Determine side
    const containerRect = originalRects.current.container;
    const screenCenterX = window.innerWidth / 2;
    const cardCenterX = containerRect.left + containerRect.width / 2;
    const rightSide = cardCenterX > screenCenterX;
    setIsOnRightSide(rightSide);
    
    const expanded = getExpandedDimensions();
    const isMobile = window.innerWidth < 768;
    const isVertical = expanded.isVertical;
    
    // Set all elements to their current positions (FIRST)
    setContainerStyles({
      position: 'fixed',
      top: containerRect.top,
      left: containerRect.left,
      width: containerRect.width,
      height: containerRect.height,
      zIndex: 9999,
      transition: 'none',
    });
    
    const imgRect = originalRects.current.image;
    if (imgRect) {
      setImageStyles({
        position: 'fixed',
        top: imgRect.top,
        left: imgRect.left,
        width: imgRect.width,
        height: imgRect.height,
        zIndex: 10000,
        transition: 'none',
      });
    }
    
    const titleRect = originalRects.current.title;
    if (titleRect) {
      setTitleStyles({
        position: 'fixed',
        top: titleRect.top,
        left: titleRect.left,
        width: titleRect.width,
        height: titleRect.height,
        fontSize: titleRect.fontSize || '1rem',
        zIndex: 10000,
        transition: 'none',
      });
    }
    
    const priceRect = originalRects.current.price;
    if (priceRect) {
      setPriceStyles({
        position: 'fixed',
        top: priceRect.top,
        left: priceRect.left,
        width: priceRect.width,
        zIndex: 10000,
        transition: 'none',
      });
    }
    
    const btnRect = originalRects.current.button;
    if (btnRect) {
      setButtonStyles({
        position: 'fixed',
        top: btnRect.top,
        left: btnRect.left,
        width: btnRect.width,
        height: btnRect.height,
        zIndex: 10000,
        transition: 'none',
      });
    }
    
    const bgRect = originalRects.current.bg;
    if (bgRect) {
      setBgStyles({
        position: 'fixed',
        top: bgRect.top,
        left: bgRect.left,
        width: bgRect.width,
        height: bgRect.height,
        zIndex: 9998,
        transition: 'none',
      });
    }
    
    // Description starts from title position, invisible
    const descRect = originalRects.current.desc || originalRects.current.title;
    if (descRect) {
      setDescStyles({
        position: 'fixed',
        top: descRect.top,
        left: descRect.left,
        width: descRect.width,
        height: 0,
        opacity: 0,
        zIndex: 10000,
        transition: 'none',
      });
    }
    
    setAnimationState("expanding");
    document.body.style.overflow = "hidden";
    
    // Animate to final positions (LAST)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const transition = `all ${duration}ms ${iosEasing}`;
        
        // Container (background card)
        setContainerStyles({
          position: 'fixed',
          top: expanded.top,
          left: expanded.left,
          width: expanded.width,
          height: expanded.height,
          zIndex: 9999,
          transition,
        });
        
        // Background - covers full expanded area
        setBgStyles({
          position: 'fixed',
          top: expanded.top,
          left: expanded.left,
          width: expanded.width,
          height: expanded.height,
          zIndex: 9998,
          transition,
        });
        
        // Image - move to center of half (or top for vertical)
        const imageSize = isVertical ? Math.min(expanded.width * 0.6, expanded.height * 0.38) : 320;
        const halfWidth = expanded.width / 2;
        const multipleImages = Array.isArray(product?.image) && product.image.length > 1;
        const thumbnailSpace = (isVertical && multipleImages) ? 50 : 0;
        
        let imageLeft, imageTop;
        if (isVertical) {
          // Vertical: image centered, pushed down a bit
          imageLeft = expanded.left + (expanded.width - imageSize) / 2;
          imageTop = expanded.top + 40;
        } else {
          imageLeft = rightSide 
            ? expanded.left + halfWidth + (halfWidth - imageSize) / 2
            : expanded.left + (halfWidth - imageSize) / 2;
          imageTop = expanded.top + (expanded.height - imageSize) / 2;
        }
        
        setImageStyles({
          position: 'fixed',
          top: imageTop,
          left: imageLeft,
          width: imageSize,
          height: imageSize,
          zIndex: 10000,
          transition,
        });
        
        // Content positioning
        let contentLeft, contentTop, contentWidth;
        if (isVertical) {
          // Vertical: content below image + thumbnails, full width with padding
          contentLeft = expanded.left + 24;
          contentTop = imageTop + imageSize + thumbnailSpace + 55;
          contentWidth = expanded.width - 48;
        } else {
          contentLeft = rightSide ? expanded.left + 48 : expanded.left + halfWidth + 48;
          contentTop = expanded.top + 50;
          contentWidth = halfWidth - 96;
        }
        
        // Calculate layout positions
        // Measure actual title height at expanded width/fontSize
        const tempTitle = document.createElement('h3');
        tempTitle.style.cssText = `
          position:fixed;visibility:hidden;top:-9999px;
          width:${contentWidth}px;
          font-size:${isVertical ? '1.5rem' : '1.875rem'};
          font-weight:bold;text-align:center;
          font-family:ui-serif,Georgia,Cambria,"Times New Roman",Times,serif;
          line-height:1.3;
        `;
        tempTitle.textContent = getProductTitle(product);
        document.body.appendChild(tempTitle);
        const actualTitleHeight = tempTitle.getBoundingClientRect().height;
        document.body.removeChild(tempTitle);

        const priceTop = expanded.top + expanded.height - (isVertical ? 120 : 160);
        const buttonTop = expanded.top + expanded.height - (isVertical ? 70 : 100);
        const descGap = isVertical ? 10 : 16;
        const descTop = contentTop + actualTitleHeight + descGap;
        const descAvailableHeight = priceTop - descTop - 16;

        setTitleStyles({
          position: 'fixed',
          top: contentTop,
          left: contentLeft,
          width: contentWidth,
          height: 'auto',
          fontSize: isVertical ? '1.5rem' : '1.875rem',
          zIndex: 10000,
          transition,
        });
        
        // Price - above button
        setPriceStyles({
          position: 'fixed',
          top: priceTop,
          left: contentLeft,
          width: contentWidth,
          zIndex: 10000,
          transition,
        });
        
        // Button - at bottom of content area
        setButtonStyles({
          position: 'fixed',
          top: buttonTop,
          left: contentLeft,
          width: contentWidth,
          height: btnRect.height,
          zIndex: 10000,
          transition,
        });
        
        // Description - between title and price, with exact height
        setDescStyles({
          position: 'fixed',
          top: descTop,
          left: contentLeft,
          width: contentWidth,
          height: descAvailableHeight,
          opacity: 1,
          zIndex: 10000,
          transition: `all ${duration}ms ${iosEasing} 10ms`,
        });
        
        setTimeout(() => {
          setAnimationState("expanded");
        }, duration);
      });
    });
  }, [animationState, getExpandedDimensions, saveOriginalPositions]);

  // Handle collapse
  const handleCollapse = useCallback(() => {
    if (animationState !== "expanded") return;
    
    setAnimationState("collapsing");
    
    const transition = `all ${duration}ms ${iosEasing}`;
    const currentScroll = window.scrollY;
    
    // Return all elements to original positions
    const containerRect = originalRects.current.container;
    if (containerRect) {
      const targetTop = containerRect.pageTop - currentScroll;
      setContainerStyles({
        position: 'fixed',
        top: targetTop,
        left: containerRect.left,
        width: containerRect.width,
        height: containerRect.height,
        zIndex: 9999,
        transition,
      });
    }
    
    const bgRect = originalRects.current.bg;
    if (bgRect) {
      const targetTop = bgRect.pageTop - currentScroll;
      setBgStyles({
        position: 'fixed',
        top: targetTop,
        left: bgRect.left,
        width: bgRect.width,
        height: bgRect.height,
        zIndex: 9998,
        transition,
      });
    }
    
    const imgRect = originalRects.current.image;
    if (imgRect) {
      const targetTop = imgRect.pageTop - currentScroll;
      setImageStyles({
        position: 'fixed',
        top: targetTop,
        left: imgRect.left,
        width: imgRect.width,
        height: imgRect.height,
        zIndex: 10000,
        transition,
      });
    }
    
    const titleRect = originalRects.current.title;
    if (titleRect) {
      const targetTop = titleRect.pageTop - currentScroll;
      setTitleStyles({
        position: 'fixed',
        top: targetTop,
        left: titleRect.left,
        width: titleRect.width,
        height: titleRect.height,
        fontSize: titleRect.fontSize || '1rem',
        zIndex: 10000,
        transition,
      });
    }
    
    const priceRect = originalRects.current.price;
    if (priceRect) {
      const targetTop = priceRect.pageTop - currentScroll;
      setPriceStyles({
        position: 'fixed',
        top: targetTop,
        left: priceRect.left,
        width: priceRect.width,
        zIndex: 10000,
        transition,
      });
    }
    
    const btnRect = originalRects.current.button;
    if (btnRect) {
      const targetTop = btnRect.pageTop - currentScroll;
      setButtonStyles({
        position: 'fixed',
        top: targetTop,
        left: btnRect.left,
        width: btnRect.width,
        height: btnRect.height,
        zIndex: 10000,
        transition,
      });
    }
    
    // Description returns to title position and fades out
    const descRect = originalRects.current.desc || originalRects.current.title;
    if (descRect) {
      const targetTop = descRect.pageTop - currentScroll;
      setDescStyles({
        position: 'fixed',
        top: targetTop,
        left: descRect.left,
        width: descRect.width,
        height: 0,
        opacity: 0,
        zIndex: 10000,
        transition: `all 300ms ${iosEasing}`, // faster fade-out
      });
    }
    
    setTimeout(() => {
      setContainerStyles({});
      setImageStyles({});
      setTitleStyles({});
      setPriceStyles({});
      setButtonStyles({});
      setBgStyles({});
      setDescStyles({});
      setSelectedImageIndex(0);
      setAnimationState("idle");
      document.body.style.overflow = "";
    }, duration);
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

  const getProductDescription = () => {
    if (!product?.description) return "Delicious handcrafted cookie made with the finest ingredients. Made with premium quality ingredients for the perfect taste.";
    return typeof product.description === 'object'
      ? showingTranslateValue(product.description)
      : product.description;
  };

  const getProductBulletPoints = () => {
    if (!product?.bulletPoints || !Array.isArray(product.bulletPoints)) return [];
    return product.bulletPoints
      .map((bp) => (typeof bp === 'object' ? showingTranslateValue(bp) : bp))
      .filter((bp) => bp && bp.trim());
  };

  if (!product) return null;

  // All product images
  const productImages = Array.isArray(product?.image) ? product.image : [product?.image].filter(Boolean);
  const hasMultipleImages = productImages.length > 1;
  const currentImage = productImages[selectedImageIndex] || getProductImage(product);

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    setTransitionDirection('prev');
    setImageTransition(true);
    setTimeout(() => {
      setSelectedImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
      setImageTransition(false);
    }, 200);
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    setTransitionDirection('next');
    setImageTransition(true);
    setTimeout(() => {
      setSelectedImageIndex((prev) => (prev + 1) % productImages.length);
      setImageTransition(false);
    }, 200);
  };

  return (
    <>
      {/* Placeholder to maintain grid layout when card is animating */}
      {isAnimating && originalRects.current.container && (
        <div 
          ref={placeholderRef}
          style={{ 
            width: originalRects.current.container.width,
            height: originalRects.current.container.height,
            visibility: 'hidden',
          }}
        />
      )}

      {/* Backdrop */}
      {isAnimating && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9997]"
          style={{
            opacity: animationState === "collapsing" ? 0 : 1,
            transition: `opacity ${duration}ms ${iosEasing}`,
          }}
          onClick={handleCollapse}
        />
      )}

      {/* Floating animated elements - only during animation */}
      {isAnimating && (
        <>
          {/* Floating Background */}
          <div 
            ref={bgRef}
            className="bg-white rounded-2xl sm:rounded-3xl border-2 border-[#ebdcce] overflow-hidden"
            style={{...bgStyles, boxShadow: '0 4px 8px -2px #8b54351a, 0 2px 4px -2px #a671401a'}}
          >
            {/* Decorative Wave - always visible, scales with bg */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Main wave - bottom right */}
              <svg
                viewBox="0 0 300 400"
                className="absolute right-0 bottom-0 w-full h-full"
                preserveAspectRatio="none"
                style={!isOnRightSide ? { transform: 'scaleX(-1)' } : {}}
              >
                <path
                  d="M 300,0 L 300,160 C 280,200 250,240 210,280 C 170,320 120,360 60,390 C 40,400 20,408 0,412 L 0,450 L 350,450 L 350,0 Z"
                  fill="#d4a574"
                  opacity="0.28"
                />
                <path
                  d="M 300,0 L 300,190 C 275,230 240,270 195,310 C 150,350 95,385 35,405 C 20,410 10,414 0,416 L 0,450 L 350,450 L 350,0 Z"
                  fill="#c89968"
                  opacity="0.18"
                />
              </svg>
              {/* Secondary wave - opposite top corner (smaller) */}
              <svg
                viewBox="0 0 300 400"
                className={`absolute top-0 w-2/5 h-2/5 ${!isOnRightSide ? 'right-0' : 'left-0'}`}
                preserveAspectRatio="none"
                style={!isOnRightSide ? { transform: 'scaleX(-1) rotate(180deg)' } : { transform: 'rotate(180deg)' }}
              >
                <path
                  d="M 300,0 L 300,160 C 280,200 250,240 210,280 C 170,320 120,360 60,390 C 40,400 20,408 0,412 L 0,450 L 350,450 L 350,0 Z"
                  fill="#d4a574"
                  opacity="0.15"
                />
                <path
                  d="M 300,0 L 300,190 C 275,230 240,270 195,310 C 150,350 95,385 35,405 C 20,410 10,414 0,416 L 0,450 L 350,450 L 350,0 Z"
                  fill="#c89968"
                  opacity="0.1"
                />
              </svg>
            </div>
          </div>

          {/* Floating Image */}
          <div 
            ref={imageRef}
            style={{...imageStyles, pointerEvents: isFullyExpanded ? 'auto' : 'none'}}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-br from-chocolate-200/30 to-chocolate-400/30 rounded-full blur-2xl" />
              <div className={`
                relative w-full h-full transition-all duration-200
                ${!isImagePNG(currentImage) ? 'border-2 border-[#b38c74] rounded-2xl p-1 sm:p-2 bg-white shadow-md sm:shadow-xl' : ''}
                ${imageTransition ? (transitionDirection === 'next' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4') : 'opacity-100 translate-x-0'}
              `}>
                <Image
                  src={currentImage}
                  alt={getProductTitle(product)}
                  fill
                  className={`drop-shadow-lg sm:drop-shadow-2xl ${
                    isImagePNG(currentImage) ? 'object-contain' : 'object-cover rounded-2xl'
                  }`}
                />
              </div>
              {/* Discount Badge */}
              {getProductDiscount(product) > 0 && (
                <div className="absolute z-20 bg-chocolate-500 text-white font-bold rounded-full shadow-sm sm:shadow-lg top-2 left-2 sm:top-4 sm:left-4 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs">
                  -{Math.round(getProductDiscount(product))}% OFF
                </div>
              )}
              {/* Navigation Arrows - only when expanded and multiple images */}
              {isFullyExpanded && hasMultipleImages && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute -left-12 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg hover:scale-110 transition-all duration-200 z-30 animate-fadeIn"
                  >
                    <FiChevronLeft className="w-5 h-5 text-chocolate-700" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute -right-12 top-1/2 -translate-y-1/2 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg hover:scale-110 transition-all duration-200 z-30 animate-fadeIn"
                  >
                    <FiChevronRight className="w-5 h-5 text-chocolate-700" />
                  </button>
                </>
              )}
            </div>
            {/* Thumbnail previews below image */}
            {isFullyExpanded && hasMultipleImages && (
              <div className="overflow-x-auto max-w-full px-2 mt-3 animate-fadeIn">
                <div className="flex items-center justify-center gap-3 py-2">
                {productImages.map((img, idx) => {
                  const isPng = isImagePNG(img);
                  return (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (idx !== selectedImageIndex) {
                          setTransitionDirection(idx > selectedImageIndex ? 'next' : 'prev');
                          setImageTransition(true);
                          setTimeout(() => {
                            setSelectedImageIndex(idx);
                            setImageTransition(false);
                          }, 200);
                        }
                      }}
                      className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden hover:scale-110 transition-all duration-200 ${
                        !isPng && idx === selectedImageIndex
                          ? 'border-2 border-[#b38c74] shadow-lg shadow-chocolate-200'
                          : !isPng
                          ? 'border-2 shadow-md hover:border-chocolate-300'
                          : ''
                      }`}
                      style={!isPng && idx !== selectedImageIndex ? { borderColor: '#c9a58a' } : {}}
                    >
                      <Image
                        src={img}
                        alt={`${getProductTitle(product)} ${idx + 1}`}
                        fill
                        className={isPng ? 'object-contain' : 'object-cover'}
                      />
                    </button>
                  );
                })}
                </div>
              </div>
            )}
          </div>

          {/* Floating Title */}
          <h3 
            ref={titleRef}
            className="text-center font-serif font-bold text-chocolate-800 pointer-events-none flex items-center justify-center"
            style={titleStyles}
          >
            {getProductTitle(product)}
          </h3>

          {/* Floating Price */}
          <div 
            ref={priceRef}
            className="flex items-center gap-1 sm:gap-2 justify-center pointer-events-none"
            style={priceStyles}
          >
            <span dir="ltr" className="font-display font-bold text-chocolate-700 text-xl sm:text-3xl">
              <span className="currency-ar">ج.م</span> {Math.round(getProductPrice(product))}
            </span>
            {(() => {
              const currentPrice = getProductPrice(product);
              const originalPrice = product?.prices?.originalPrice || product?.originalPrice;
              const originalPriceValue = typeof originalPrice === 'object' 
                ? Number(showingTranslateValue(originalPrice)) 
                : Number(originalPrice);
              
              return originalPriceValue > currentPrice ? (
                <span dir="ltr" className="text-gray-400 text-sm">
                  <span className="currency-ar">ج.م</span> <span className="line-through">{Math.round(originalPriceValue)}</span>
                </span>
              ) : null;
            })()}
          </div>

          {/* Floating Button */}
          <div 
            ref={buttonRef}
            style={{...buttonStyles, pointerEvents: 'auto'}}
            onClick={(e) => e.stopPropagation()}
          >
            {!isInCart ? (
              <button
                onClick={handleAddToCart}
                className="w-full h-full flex items-center justify-center gap-1 sm:gap-2 font-serif font-semibold text-xs sm:text-base bg-[#f7f1ed] hover:bg-[#eedfd4] text-chocolate-700 rounded-xl border-2 border-chocolate-300 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                Add to Cart
              </button>
            ) : (
              <div className="w-full h-full flex items-center justify-between rounded-xl border-2 border-chocolate-200 bg-chocolate-50 px-1 sm:px-2">
                <button
                  onClick={(e) => handleUpdateQuantity(e, false)}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-white hover:bg-chocolate-100 text-chocolate-700 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FiMinus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <span className="font-display font-bold text-chocolate-800 text-lg sm:text-2xl flex-1 text-center">
                  {cartQuantity}
                </span>
                <button
                  onClick={(e) => handleUpdateQuantity(e, true)}
                  className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-chocolate-600 hover:bg-chocolate-700 text-white rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Close button - only when fully expanded */}
          {isFullyExpanded && (
            <button
              onClick={handleCollapse}
              className="fixed p-2 md:p-3 bg-white/90 hover:bg-white rounded-full shadow-lg hover:scale-110 animate-fadeIn"
              style={{
                top: containerStyles.top + 16,
                right: window.innerWidth - (containerStyles.left + containerStyles.width) + 16,
                zIndex: 10001,
              }}
            >
              <FiX className="w-5 h-5 md:w-6 md:h-6 text-chocolate-700" />
            </button>
          )}

          {/* Floating Description */}
          <div 
            ref={descRef}
            className="font-sans text-chocolate-600 pointer-events-auto overflow-hidden"
            style={descStyles}
          >
            {/* Description Label - centered */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="flex-1 h-px bg-gradient-to-r from-transparent to-chocolate-300" />
              <h4 className="text-xs font-bold text-chocolate-500 uppercase tracking-[0.2em] whitespace-nowrap">Description</h4>
              <span className="flex-1 h-px bg-gradient-to-l from-transparent to-chocolate-300" />
            </div>
            {/* Scrollable content area with fade */}
            <div 
              className="overflow-y-auto pr-1 relative"
              style={{
                height: descStyles.height ? `calc(${typeof descStyles.height === 'number' ? descStyles.height + 'px' : descStyles.height} - 32px)` : 'auto',
                maskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 80%, transparent 100%)',
              }}
            >
              {/* Main paragraph */}
              <p className="text-sm leading-relaxed mb-3">{getProductDescription()}</p>
              {/* Bullet Points */}
              {getProductBulletPoints().length > 0 && (
                <ul className="space-y-2">
                  {getProductBulletPoints().map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 px-3 py-2 rounded-lg text-sm leading-relaxed text-chocolate-700"
                      style={{ backgroundColor: 'rgba(139, 90, 43, 0.08)' }}
                    >
                      <span 
                        className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: '#8b5a2b' }}
                      />
                      {point}
                    </li>
                  ))}
                </ul>
              )}
              {/* Bottom padding for fade area */}
              <div className="h-6" />
            </div>
          </div>
        </>
      )}

      {/* Original Card - visible when NOT animating */}
      {!isAnimating && (
        <div
          ref={containerRef}
          onClick={handleExpand}
          className="group relative cursor-pointer pt-20 sm:pt-32"
        >
          {/* Floating Image */}
          <div 
            ref={imageRef}
            className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-chocolate-200/30 to-chocolate-400/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <div className={`
              relative w-28 h-28 sm:w-48 sm:h-48 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500
              ${!isImagePNG(getProductImage(product)) ? 'border-2 border-[#b38c74] rounded-2xl p-1 sm:p-2 bg-white shadow-md sm:shadow-xl' : ''}
            `}>
              <Image
                src={getProductImage(product)}
                alt={getProductTitle(product)}
                fill
                className={`drop-shadow-lg sm:drop-shadow-2xl ${
                  isImagePNG(getProductImage(product)) ? 'object-contain' : 'object-cover rounded-2xl'
                }`}
              />
            </div>
            {getProductDiscount(product) > 0 && (
              <div className="absolute z-20 bg-chocolate-500 text-white font-bold rounded-full shadow-sm sm:shadow-lg top-2 left-2 sm:top-4 sm:left-4 px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs">
                -{Math.round(getProductDiscount(product))}% OFF
              </div>
            )}
          </div>

          {/* Card Background */}
          <div 
            ref={bgRef}
            className="relative bg-white overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-[#eedccb] pt-14 sm:pt-24 pb-4 sm:pb-6 transition-all duration-300"
            style={{ boxShadow: '0 4px 8px -2px #8b54351a, 0 2px 4px -2px #a671401a' }}
            onMouseEnter={(e) => { if (window.innerWidth >= 640) e.currentTarget.style.boxShadow = '0 10px 15px -3px #8b54354f, 0 4px 6px -4px #a67140cf'; }}
            onMouseLeave={(e) => { if (window.innerWidth >= 640) e.currentTarget.style.boxShadow = '0 4px 8px -2px #8b54351a, 0 2px 4px -2px #a671401a'; }}
          >
            {/* Decorative Wave */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
              {/* Main wave - bottom right */}
              <svg
                viewBox="0 0 300 400"
                className="absolute right-0 bottom-0 w-full h-full"
                preserveAspectRatio="none"
                style={isWaveFlipped ? { transform: 'scaleX(-1)' } : {}}
              >
                <path
                  d="M 300,0 L 300,160 C 280,200 250,240 210,280 C 170,320 120,360 60,390 C 40,400 20,408 0,412 L 0,450 L 350,450 L 350,0 Z"
                  fill="#d4a574"
                  opacity="0.28"
                />
                <path
                  d="M 300,0 L 300,190 C 275,230 240,270 195,310 C 150,350 95,385 35,405 C 20,410 10,414 0,416 L 0,450 L 350,450 L 350,0 Z"
                  fill="#c89968"
                  opacity="0.18"
                />
              </svg>
              {/* Secondary wave - opposite top corner (smaller) */}
              <svg
                viewBox="0 0 300 400"
                className={`absolute top-0 w-2/5 h-2/5 ${isWaveFlipped ? 'right-0' : 'left-0'}`}
                preserveAspectRatio="none"
                style={isWaveFlipped ? { transform: 'scaleX(-1) rotate(180deg)' } : { transform: 'rotate(180deg)' }}
              >
                <path
                  d="M 300,0 L 300,160 C 280,200 250,240 210,280 C 170,320 120,360 60,390 C 40,400 20,408 0,412 L 0,450 L 350,450 L 350,0 Z"
                  fill="#d4a574"
                  opacity="0.15"
                />
                <path
                  d="M 300,0 L 300,190 C 275,230 240,270 195,310 C 150,350 95,385 35,405 C 20,410 10,414 0,416 L 0,450 L 350,450 L 350,0 Z"
                  fill="#c89968"
                  opacity="0.1"
                />
              </svg>
            </div>

            {/* Content */}
            <div className="relative z-10 px-3 sm:px-6 space-y-2 sm:space-y-3">
              {/* Title */}
              <h3 
                ref={titleRef}
                className="text-base sm:text-xl text-center font-serif font-bold text-chocolate-800 group-hover:text-chocolate-600 min-h-[2.5rem] sm:min-h-[3.5rem] flex items-center justify-center transition-colors duration-300 line-clamp-2"
              >
                {getProductTitle(product)}
              </h3>

              {/* Price with Like Button */}
              <div className="relative">
                <div ref={priceRef} className="flex items-center gap-1 sm:gap-2 justify-center">
                  <span dir="ltr" className="font-display font-bold text-chocolate-700 text-xl sm:text-3xl">
                    <span className="currency-ar">ج.م</span> {Math.round(getProductPrice(product))}
                  </span>
                  {(() => {
                    const currentPrice = getProductPrice(product);
                    const originalPrice = product?.prices?.originalPrice || product?.originalPrice;
                    const originalPriceValue = typeof originalPrice === 'object' 
                      ? Number(showingTranslateValue(originalPrice)) 
                      : Number(originalPrice);
                    
                    return originalPriceValue > currentPrice ? (
                      <span dir="ltr" className="text-gray-400 text-sm">
                        <span className="currency-ar">ج.م</span> <span className="line-through">{Math.round(originalPriceValue)}</span>
                      </span>
                    ) : null;
                  })()}
                </div>
                
                {/* Like Button with Badge - positioned on the right */}
                <div className="absolute top-1/2 -translate-y-1/2 -right-1 sm:right-0 animate-fadeIn">
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(product._id); }}
                    className="relative p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300"
                  >
                    <FiHeart
                      className={`transition-all duration-300 w-4 h-4 sm:w-5 sm:h-5 ${
                        likedItems.includes(product._id)
                          ? "fill-red-500 text-red-500 scale-110"
                          : "text-gray-400"
                      }`}
                    />
                    {/* Likes Count Badge */}
                    {product.likes > 0 && (
                      <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-50 bg-white text-[#616161] text-[8px] sm:text-[10px] font-bold px-1 py-0.5 rounded-full shadow-md border border-gray-200 min-w-[16px] sm:min-w-[18px] text-center">
                        {product.likes}
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Button */}
              <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <div ref={buttonRef}>
                {!isInCart ? (
                  <button
                    onClick={handleAddToCart}
                    className="w-full h-11 sm:h-14 px-3 sm:px-6 flex items-center justify-center gap-1 sm:gap-2 font-serif font-semibold text-xs sm:text-base bg-[#f7f1ed] hover:bg-[#eedfd4] text-chocolate-700 rounded-xl border-2 border-chocolate-300 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <FiShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                    Add to Cart
                  </button>
                ) : (
                  <div className="h-11 sm:h-14 px-1 sm:px-2 flex items-center justify-between rounded-xl border-2 border-chocolate-200 bg-chocolate-50">
                    <button
                      onClick={(e) => handleUpdateQuantity(e, false)}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-white hover:bg-chocolate-100 text-chocolate-700 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <FiMinus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <span className="font-display font-bold text-chocolate-800 text-lg sm:text-2xl flex-1 text-center">
                      {cartQuantity}
                    </span>
                    <button
                      onClick={(e) => handleUpdateQuantity(e, true)}
                      className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-chocolate-600 hover:bg-chocolate-700 text-white rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <FiPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </div>
                )}
              </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(ExpandableProductCard, (prevProps, nextProps) => {
  return (
    prevProps.product._id === nextProps.product._id &&
    prevProps.index === nextProps.index &&
    prevProps.likedItems.includes(prevProps.product._id) === nextProps.likedItems.includes(nextProps.product._id)
  );
});
