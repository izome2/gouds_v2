import Link from "next/link";
import Image from "next/image";
import { 
  FiPhone, 
  FiMail, 
  FiMapPin, 
  FiInstagram, 
  FiFacebook, 
  FiTwitter, 
  FiHeart
} from "react-icons/fi";

const Footer = () => {
  const footerLinks = {
    menu: [
      { name: "All Cookies", href: "/menu" },
      { name: "Best Sellers", href: "/menu?category=bestsellers" },
      { name: "Gift Boxes", href: "/menu?category=gifts" },
    ],
    company: [
      { name: "About Us", href: "/about-us" },
      { name: "Contact", href: "/contact-us" },
      { name: "Blog", href: "/blog" },
    ],
    support: [
      { name: "FAQs", href: "/faq" },
      { name: "Shipping", href: "/shipping" },
      { name: "Track Order", href: "/track-order" },
    ],
  };

  const socialLinks = [
    { icon: FiInstagram, href: "https://instagram.com/gouds", label: "Instagram" },
    { icon: FiFacebook, href: "https://facebook.com/gouds", label: "Facebook" },
    { icon: FiTwitter, href: "https://twitter.com/gouds", label: "Twitter" },
  ];

  return (
    <footer className="bg-chocolate-800 border-t-4 border-chocolate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center mb-4">
              <Image
                src="/logo/Logo-3.png"
                alt="Gouds"
                width={48}
                height={48}
                className="object-contain"
              />
              <span className="ml-2 font-display text-xl font-bold text-cream-100">
                GOUDS
              </span>
            </Link>
            
            <p className="text-cream-200/70 text-sm mb-6 max-w-xs">
              Handcrafted cookies made with love and premium ingredients.
            </p>

            {/* Contact Info */}
            <div className="space-y-2 mb-6">
              <a href="tel:+201234567890" className="flex items-center gap-2 text-cream-200/80 hover:text-white text-sm transition-colors">
                <FiPhone className="w-4 h-4" />
                <span>+20 123 456 7890</span>
              </a>
              <a href="mailto:hello@gouds.com" className="flex items-center gap-2 text-cream-200/80 hover:text-white text-sm transition-colors">
                <FiMail className="w-4 h-4" />
                <span>hello@gouds.com</span>
              </a>
              <div className="flex items-center gap-2 text-cream-200/80 text-sm">
                <FiMapPin className="w-4 h-4" />
                <span>Cairo, Egypt</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="w-9 h-9 flex items-center justify-center bg-chocolate-700 hover:bg-cream-100 text-cream-200 hover:text-chocolate-700 rounded-lg transition-all"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Menu Links */}
          <div>
            <h4 className="font-serif font-semibold text-cream-100 text-sm mb-4">
              Menu
            </h4>
            <ul className="space-y-2">
              {footerLinks.menu.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-cream-200/70 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-serif font-semibold text-cream-100 text-sm mb-4">
              Company
            </h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-cream-200/70 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-serif font-semibold text-cream-100 text-sm mb-4">
              Support
            </h4>
            <ul className="space-y-2">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-cream-200/70 hover:text-white text-sm transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-chocolate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-cream-300/60 text-xs text-center sm:text-left">
            © {new Date().getFullYear()} Gouds. Made with{" "}
            <FiHeart className="inline w-3 h-3 text-red-400" />{" "}
            in Egypt
          </p>

          {/* Legal Links */}
          <div className="flex items-center gap-4 text-xs">
            <Link href="/privacy-policy" className="text-cream-300/60 hover:text-white transition-colors">
              Privacy
            </Link>
            <Link href="/terms-and-conditions" className="text-cream-300/60 hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/cookie-policy" className="text-cream-300/60 hover:text-white transition-colors">
              Cookies
            </Link>
          </div>

          {/* Payment Icons */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-5 bg-white/10 rounded flex items-center justify-center">
              <span className="text-cream-200 text-[10px] font-semibold">VISA</span>
            </div>
            <div className="w-8 h-5 bg-white/10 rounded flex items-center justify-center">
              <span className="text-cream-200 text-[10px] font-semibold">MC</span>
            </div>
            <div className="w-9 h-5 bg-white/10 rounded flex items-center justify-center">
              <span className="text-cream-200 text-[10px] font-semibold">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
