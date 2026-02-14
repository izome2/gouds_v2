import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { FiShoppingCart, FiHeart, FiPlus, FiMinus, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
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
        originalRects.current[key] = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          pageTop: rect.top + window.scrollY,
          pageLeft: rect.left + window.scrollX,
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
        fontSize: '1.25rem',
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
          height: 50,
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
        fontSize: '1.25rem',
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
            className="bg-white shadow-lg rounded-3xl border-2 border-gray-200 overflow-hidden"
            style={bgStyles}
          >
            {/* Decorative Wave - always visible, scales with bg */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
              <svg
                viewBox="0 0 300 400"
                className="absolute right-0 bottom-0 w-full h-full"
                preserveAspectRatio="none"
                style={!isOnRightSide ? { transform: 'scaleX(-1)' } : {}}
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
                ${!isImagePNG(currentImage) ? 'border-2 border-chocolate-500 rounded-2xl p-2 bg-white shadow-xl' : ''}
                ${imageTransition ? (transitionDirection === 'next' ? 'opacity-0 translate-x-4' : 'opacity-0 -translate-x-4') : 'opacity-100 translate-x-0'}
              `}>
                <Image
                  src={currentImage}
                  alt={getProductTitle(product)}
                  fill
                  className={`drop-shadow-2xl ${
                    isImagePNG(currentImage) ? 'object-contain' : 'object-cover rounded-2xl'
                  }`}
                />
              </div>
              {/* Discount Badge */}
              {getProductDiscount(product) > 0 && (
                <div className="absolute top-2 left-2 z-20 bg-chocolate-500 text-white font-bold rounded-full shadow-lg px-3 py-1.5 text-xs">
                  -{getProductDiscount(product)}% OFF
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
                          ? 'border-2 border-chocolate-500 shadow-lg shadow-chocolate-200'
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
            className="flex items-center gap-2 justify-center pointer-events-none"
            style={priceStyles}
          >
            <span className="font-display font-bold text-chocolate-700 text-3xl">
              ${getProductPrice(product).toFixed(2)}
            </span>
            {(() => {
              const currentPrice = getProductPrice(product);
              const originalPrice = product?.prices?.originalPrice || product?.originalPrice;
              const originalPriceValue = typeof originalPrice === 'object' 
                ? Number(showingTranslateValue(originalPrice)) 
                : Number(originalPrice);
              
              return originalPriceValue > currentPrice ? (
                <span className="text-gray-400 line-through text-sm">
                  ${originalPriceValue.toFixed(2)}
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
                className="w-full h-full flex items-center justify-center gap-2 font-serif font-semibold bg-[#f7f1ed] hover:bg-[#eedfd4] text-chocolate-700 rounded-xl border-2 border-chocolate-300 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <FiShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            ) : (
              <div className="w-full h-full flex items-center justify-between rounded-xl border-2 border-chocolate-200 bg-chocolate-50 px-2">
                <button
                  onClick={(e) => handleUpdateQuantity(e, false)}
                  className="flex items-center justify-center w-10 h-10 bg-white hover:bg-chocolate-100 text-chocolate-700 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FiMinus className="w-5 h-5" />
                </button>
                <span className="font-display font-bold text-chocolate-800 text-2xl flex-1 text-center">
                  {cartQuantity}
                </span>
                <button
                  onClick={(e) => handleUpdateQuantity(e, true)}
                  className="flex items-center justify-center w-10 h-10 bg-chocolate-600 hover:bg-chocolate-700 text-white rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <FiPlus className="w-5 h-5" />
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
          className="group relative cursor-pointer pt-32"
        >
          {/* Floating Image */}
          <div 
            ref={imageRef}
            className="absolute -top-1 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-chocolate-200/30 to-chocolate-400/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <div className={`
              relative w-48 h-48 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500
              ${!isImagePNG(getProductImage(product)) ? 'border-2 border-chocolate-500 rounded-2xl p-2 bg-white shadow-xl' : ''}
            `}>
              <Image
                src={getProductImage(product)}
                alt={getProductTitle(product)}
                fill
                className={`drop-shadow-2xl ${
                  isImagePNG(getProductImage(product)) ? 'object-contain' : 'object-cover rounded-2xl'
                }`}
              />
            </div>
            {getProductDiscount(product) > 0 && (
              <div className="absolute z-20 bg-chocolate-500 text-white font-bold rounded-full shadow-lg top-4 left-4 px-3 py-1.5 text-xs">
                -{getProductDiscount(product)}% OFF
              </div>
            )}
          </div>

          {/* Card Background */}
          <div 
            ref={bgRef}
            className="relative bg-white overflow-hidden shadow-lg rounded-3xl border-2 border-gray-200 hover:border-chocolate-400 hover:shadow-2xl pt-24 pb-6 transition-all duration-300"
          >
            {/* Decorative Wave */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0">
              <svg
                viewBox="0 0 300 400"
                className="absolute right-0 bottom-0 w-full h-full"
                preserveAspectRatio="none"
                style={index % 4 < 2 ? { transform: 'scaleX(-1)' } : {}}
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

            {/* Content */}
            <div className="relative z-10 px-6 space-y-3">
              {/* Like Button */}
              <button
                onClick={(e) => { e.stopPropagation(); toggleLike(product._id); }}
                className="absolute top-4 right-4 p-2.5 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-110 transition-all duration-300 z-20"
              >
                <FiHeart
                  className={`transition-all duration-300 w-5 h-5 ${
                    likedItems.includes(product._id)
                      ? "fill-red-500 text-red-500 scale-110"
                      : "text-gray-400"
                  }`}
                />
              </button>

              {/* Title */}
              <h3 
                ref={titleRef}
                className="text-xl text-center font-serif font-bold text-chocolate-800 group-hover:text-chocolate-600 min-h-[3.5rem] flex items-center justify-center transition-colors duration-300"
              >
                {getProductTitle(product)}
              </h3>

              {/* Price */}
              <div ref={priceRef} className="flex items-center gap-2 justify-center">
                <span className="font-display font-bold text-chocolate-700 text-3xl">
                  ${getProductPrice(product).toFixed(2)}
                </span>
                {(() => {
                  const currentPrice = getProductPrice(product);
                  const originalPrice = product?.prices?.originalPrice || product?.originalPrice;
                  const originalPriceValue = typeof originalPrice === 'object' 
                    ? Number(showingTranslateValue(originalPrice)) 
                    : Number(originalPrice);
                  
                  return originalPriceValue > currentPrice ? (
                    <span className="text-gray-400 line-through text-sm">
                      ${originalPriceValue.toFixed(2)}
                    </span>
                  ) : null;
                })()}
              </div>

              {/* Button */}
              <div className="pt-2" onClick={(e) => e.stopPropagation()}>
              <div ref={buttonRef}>
                {!isInCart ? (
                  <button
                    onClick={handleAddToCart}
                    className="w-full h-14 px-6 flex items-center justify-center gap-2 font-serif font-semibold bg-[#f7f1ed] hover:bg-[#eedfd4] text-chocolate-700 rounded-xl border-2 border-chocolate-300 shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                ) : (
                  <div className="h-14 px-2 flex items-center justify-between rounded-xl border-2 border-chocolate-200 bg-chocolate-50">
                    <button
                      onClick={(e) => handleUpdateQuantity(e, false)}
                      className="w-10 h-10 flex items-center justify-center bg-white hover:bg-chocolate-100 text-chocolate-700 rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <FiMinus className="w-5 h-5" />
                    </button>
                    <span className="font-display font-bold text-chocolate-800 text-2xl flex-1 text-center">
                      {cartQuantity}
                    </span>
                    <button
                      onClick={(e) => handleUpdateQuantity(e, true)}
                      className="w-10 h-10 flex items-center justify-center bg-chocolate-600 hover:bg-chocolate-700 text-white rounded-lg font-bold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <FiPlus className="w-5 h-5" />
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

export default ExpandableProductCard;
