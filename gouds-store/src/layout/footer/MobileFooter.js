import Link from "next/link";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useCart } from "react-use-cart";
import { 
  FiHome, 
  FiGrid, 
  FiShoppingCart, 
  FiHeart, 
  FiUser 
} from "react-icons/fi";
import { SidebarContext } from "@context/SidebarContext";
import { getUserSession } from "@lib/auth";

const MobileFooter = () => {
  const router = useRouter();
  const { totalItems } = useCart();
  const { toggleCartDrawer } = useContext(SidebarContext);
  const userInfo = getUserSession();

  const navItems = [
    {
      icon: FiHome,
      label: "Home",
      href: "/",
      isActive: router.pathname === "/",
    },
    {
      icon: FiGrid,
      label: "Menu",
      href: "/menu",
      isActive: router.pathname === "/menu" || router.pathname.startsWith("/product"),
    },
    {
      icon: FiShoppingCart,
      label: "Cart",
      href: null,
      onClick: toggleCartDrawer,
      badge: totalItems,
      isActive: false,
    },
    {
      icon: FiHeart,
      label: "Wishlist",
      href: "/user/wishlist",
      isActive: router.pathname === "/user/wishlist",
    },
    {
      icon: FiUser,
      label: "Account",
      href: userInfo ? "/user/dashboard" : "/auth/login",
      isActive: router.pathname.startsWith("/user"),
    },
  ];

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the fixed footer */}
      <div className="h-20 lg:hidden" />

      {/* Mobile Footer Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        {/* Glassmorphism Background */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-lg border-t border-chocolate-200/50 shadow-2xl" />

        {/* Decorative Top Border */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-chocolate-400 to-transparent" />

        {/* Navigation Items */}
        <div className="relative max-w-md mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isCart = item.label === "Cart";

              if (item.onClick) {
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="relative flex flex-col items-center justify-center p-2 group outline-none"
                    aria-label={item.label}
                  >
                    {/* Cart Special Styling */}
                    <div className={`relative flex items-center justify-center w-12 h-12 -mt-6 rounded-2xl shadow-lg transition-all duration-300 transform group-active:scale-95 ${
                      isCart 
                        ? "bg-gradient-to-br from-chocolate-500 to-chocolate-600 text-white" 
                        : "bg-cream-100"
                    }`}>
                      <Icon className="w-6 h-6" />
                      
                      {/* Badge */}
                      {item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md animate-pulse">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      )}
                    </div>
                    
                    <span className={`mt-1 text-xs font-serif font-medium transition-colors duration-300 ${
                      isCart ? "text-chocolate-600" : "text-chocolate-500"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <Link
                  key={index}
                  href={item.href}
                  className={`relative flex flex-col items-center justify-center p-2 group outline-none transition-all duration-300 ${
                    item.isActive ? "scale-105" : ""
                  }`}
                  aria-label={item.label}
                >
                  {/* Icon Container */}
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 ${
                    item.isActive 
                      ? "bg-chocolate-100 text-chocolate-600" 
                      : "text-chocolate-400 group-hover:text-chocolate-600 group-hover:bg-cream-100"
                  }`}>
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${
                      item.isActive ? "scale-110" : "group-hover:scale-110"
                    }`} />
                    
                    {/* Active Indicator Dot */}
                    {item.isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-chocolate-500 rounded-full" />
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={`mt-0.5 text-xs font-serif font-medium transition-colors duration-300 ${
                    item.isActive ? "text-chocolate-600" : "text-chocolate-400 group-hover:text-chocolate-600"
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Safe Area for iPhone */}
        <div className="h-safe-area-inset-bottom bg-white/90" />
      </nav>
    </>
  );
};

export default MobileFooter;
