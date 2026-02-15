import Link from "next/link";
import Image from "next/image";
import { FiArrowRight, FiPlay } from "react-icons/fi";

const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-cream-pattern">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cream-100/80 via-cream-200/60 to-cream-300/80" />
        
        {/* Floating Chocolate Drips */}
        <svg
          className="absolute top-0 left-0 w-full h-32 chocolate-drip"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0 C100,20 200,0 300,30 C400,60 500,20 600,40 C700,60 800,30 900,50 C1000,70 1100,40 1200,60 L1200,0 L0,0 Z"
            fill="url(#chocolateGradient)"
            opacity="0.15"
          />
          <defs>
            <linearGradient id="chocolateGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6a432e" />
              <stop offset="50%" stopColor="#7c5137" />
              <stop offset="100%" stopColor="#8b5f43" />
            </linearGradient>
          </defs>
        </svg>

        {/* Decorative Circles */}
        <div className="absolute top-20 left-10 w-64 h-64 bg-chocolate-200/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-chocolate-300/15 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-cream-400/30 rounded-full blur-2xl animate-float-fast" />
      </div>

      {/* Main Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 min-h-screen flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Side - Text Content */}
          <div className="text-center lg:text-left space-y-8 animate-slide-up">
            {/* Main Heading */}
            <div className="space-y-4">
              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="text-gradient-chocolate">Freshly Baked.</span>
                <br />
                <span className="text-chocolate-800">Deeply Addictive.</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-chocolate-600/80 font-sans max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Indulge in our handcrafted cookies, made with premium chocolate 
                and baked fresh daily. Every bite is a moment of pure happiness.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/menu"
                className="group inline-flex items-center justify-center px-8 py-4 btn-glossy text-white font-serif font-semibold text-lg rounded-2xl shadow-chocolate"
              >
                Order Cookies
                <FiArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              
              <button className="inline-flex items-center justify-center px-8 py-4 bg-white/60 backdrop-blur-sm text-chocolate-700 font-serif font-semibold text-lg rounded-2xl border-2 border-chocolate-200 hover:bg-white hover:border-chocolate-300 transition-all duration-300 hover:shadow-lg">
                <FiPlay className="mr-2 w-5 h-5" />
                Watch Story
              </button>
            </div>

            {/* Features Badges */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl border border-chocolate-100/50">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-chocolate-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="3" width="15" height="13"></rect>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                  <circle cx="5.5" cy="18.5" r="2.5"></circle>
                  <circle cx="18.5" cy="18.5" r="2.5"></circle>
                </svg>
                <span className="text-sm font-medium text-chocolate-700">Free Delivery</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl border border-chocolate-100/50">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-chocolate-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
                <span className="text-sm font-medium text-chocolate-700">Premium Quality</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-xl border border-chocolate-100/50">
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-chocolate-500" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span className="text-sm font-medium text-chocolate-700">Made with Love</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 justify-center lg:justify-start pt-4">
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-chocolate-700">50K+</p>
                <p className="text-chocolate-500 font-sans text-sm">Happy Customers</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-chocolate-700">4.9</p>
                <p className="text-chocolate-500 font-sans text-sm">Rating</p>
              </div>
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-chocolate-700">20+</p>
                <p className="text-chocolate-500 font-sans text-sm">Cookie Flavors</p>
              </div>
            </div>
          </div>

          {/* Right Side - Cookie Image */}
          <div className="relative flex items-center justify-center lg:justify-end animate-fade-in">
            {/* Background Glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-80 h-80 sm:w-96 sm:h-96 lg:w-[500px] lg:h-[500px] bg-gradient-to-br from-chocolate-200/40 via-cream-300/30 to-chocolate-100/40 rounded-full blur-3xl" />
            </div>
            
            {/* Cookie Image Container */}
            <div className="relative hero-image-float">
              {/* Ring Decoration */}
              <div className="absolute -inset-8 border-2 border-dashed border-chocolate-200/40 rounded-full animate-spin" style={{ animationDuration: '30s' }} />
              
              {/* Main Image */}
              <div className="relative w-72 h-72 sm:w-96 sm:h-96 lg:w-[450px] lg:h-[450px]">
                <div className="absolute inset-0 bg-gradient-to-br from-chocolate-300/20 to-transparent rounded-full" />
                <Image
                  src="/hero-cookie.png"
                  alt="Delicious Chocolate Chip Cookies"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
                
                {/* Floating Badge */}
                <div className="absolute -right-4 top-1/4 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg animate-float-slow">
                  <p className="font-display text-2xl">🍪</p>
                  <p className="text-chocolate-700 font-serif font-bold text-sm">Fresh Daily</p>
                </div>
                
                {/* Price Badge */}
                <div className="absolute -left-4 bottom-1/4 bg-gradient-to-br from-chocolate-500 to-chocolate-600 text-white rounded-2xl p-4 shadow-lg animate-float-medium">
                  <p className="font-sans text-xs opacity-80">Starting from</p>
                  <p dir="ltr" className="font-display text-xl font-bold"><span className="currency-ar">ج.م</span> 5</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-24 sm:h-32"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C200,120 400,0 600,60 C800,120 1000,0 1200,60 L1200,120 L0,120 Z"
            fill="#ffffff"
            opacity="0.6"
          />
          <path
            d="M0,80 C200,120 400,40 600,80 C800,120 1000,40 1200,80 L1200,120 L0,120 Z"
            fill="#ffffff"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;