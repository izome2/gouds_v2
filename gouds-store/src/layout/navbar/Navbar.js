import { useContext, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useCart } from "react-use-cart";
import { FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import useTranslation from "next-translate/useTranslation";

//internal import
import { getUserSession } from "@lib/auth";
import useGetSetting from "@hooks/useGetSetting";
import { handleLogEvent } from "src/lib/analytics";
import CartDrawer from "@components/drawer/CartDrawer";
import { SidebarContext } from "@context/SidebarContext";

const Navbar = () => {
  const { t, lang } = useTranslation("common");
  const [searchText, setSearchText] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleCartDrawer } = useContext(SidebarContext);
  const { totalItems } = useCart();
  const router = useRouter();

  const userInfo = getUserSession();
  const { storeCustomizationSetting } = useGetSetting();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchText) {
      router.push(`/search?query=${searchText}`, null, { scroll: false });
      setSearchText("");
      handleLogEvent("search", `searched ${searchText}`);
    } else {
      router.push(`/`, null, { scroll: false });
      setSearchText("");
    }
  };

  const navLinks = [
    { href: "/", label: t("Home") || "Home" },
    { href: "/menu", label: t("Menu") || "Menu" },
    { href: "/about-us", label: t("About") || "About" },
    { href: "/contact-us", label: t("Contact") || "Contact" },
  ];

  return (
    <>
      <CartDrawer />
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? "navbar-glass shadow-lg py-2"
            : "bg-transparent py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <div className="relative w-16 h-16 md:w-20 md:h-20 transition-transform duration-300 group-hover:scale-105">
                <Image
                  width={80}
                  height={80}
                  className="w-full h-full object-contain drop-shadow-md"
                  priority
                  src="/logo/Logo-3.png"
                  alt="Gouds Logo"
                />
              </div>
              <span className={`ml-2 font-display text-2xl font-bold hidden sm:block transition-colors duration-300 ${
                isScrolled ? "text-chocolate-600" : "text-chocolate-700"
              }`}>
                GOUDS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-5 py-2 font-serif font-medium text-sm tracking-wide transition-all duration-300 rounded-full link-underline ${
                    router.pathname === link.href
                      ? "text-chocolate-600 bg-chocolate-100/50"
                      : isScrolled
                      ? "text-chocolate-700 hover:text-chocolate-500 hover:bg-cream-200/50"
                      : "text-chocolate-800 hover:text-chocolate-600 hover:bg-white/30"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side - Cart & User */}
            <div className="flex items-center space-x-2">
              {/* Cart Button */}
              <button
                aria-label="Shopping Cart"
                onClick={toggleCartDrawer}
                className={`relative p-3 rounded-full transition-all duration-300 ${
                  isScrolled
                    ? "text-chocolate-600 hover:bg-chocolate-100"
                    : "text-chocolate-700 hover:bg-white/30"
                }`}
              >
                <FiShoppingCart className="w-6 h-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-gradient-to-r from-chocolate-500 to-chocolate-600 rounded-full shadow-md">
                    {totalItems}
                  </span>
                )}
              </button>

              {/* User Button */}
              <button
                className={`p-3 rounded-full transition-all duration-300 ${
                  isScrolled
                    ? "text-chocolate-600 hover:bg-chocolate-100"
                    : "text-chocolate-700 hover:bg-white/30"
                }`}
                aria-label="User Account"
              >
                {userInfo?.image ? (
                  <Link href="/user/dashboard" className="block">
                    <Image
                      width={28}
                      height={28}
                      src={userInfo?.image}
                      alt="user"
                      className="rounded-full ring-2 ring-chocolate-200"
                    />
                  </Link>
                ) : userInfo?.name ? (
                  <Link
                    href="/user/dashboard"
                    className="w-7 h-7 flex items-center justify-center bg-gradient-to-br from-chocolate-400 to-chocolate-600 text-white rounded-full font-serif font-bold text-sm"
                  >
                    {userInfo?.name[0]}
                  </Link>
                ) : (
                  <Link href="/auth/login">
                    <FiUser className="w-6 h-6" />
                  </Link>
                )}
              </button>

              {/* Mobile Menu Button */}
              <button
                className={`lg:hidden p-3 rounded-full transition-all duration-300 ${
                  isScrolled
                    ? "text-chocolate-600 hover:bg-chocolate-100"
                    : "text-chocolate-700 hover:bg-white/30"
                }`}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle Menu"
              >
                {isMobileMenuOpen ? (
                  <FiX className="w-6 h-6" />
                ) : (
                  <FiMenu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-500 ease-in-out ${
              isMobileMenuOpen ? "max-h-64 opacity-100 mt-4" : "max-h-0 opacity-0"
            }`}
          >
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl shadow-chocolate p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl font-serif font-medium transition-all duration-300 ${
                    router.pathname === link.href
                      ? "text-chocolate-600 bg-chocolate-100"
                      : "text-chocolate-700 hover:bg-cream-200"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default dynamic(() => Promise.resolve(Navbar), { ssr: false });
