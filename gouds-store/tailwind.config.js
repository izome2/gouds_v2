const colors = require("tailwindcss/colors");
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/layout/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    fontFamily: {
      sans: ["Inter", "sans-serif"],
      serif: ["Poppins", "sans-serif"],
      display: ["Playfair Display", "serif"],
      DejaVu: ["DejaVu Sans", "Arial", "sans-serif"],
    },
    extend: {
      colors: {
        // Chocolate Brown palette
        chocolate: {
          50: "#f7f1ed",
          100: "#efe3db",
          200: "#dfc7b7",
          300: "#c9a58a",
          400: "#a67c5b",
          500: "#7c5137", // Base color
          600: "#6a432e",
          700: "#5a3826",
          800: "#4a2d1f",
          900: "#3d2419",
        },
        // Cream palette
        cream: {
          50: "#fdfcfa",
          100: "#f9f6f1",
          200: "#f0e8db",
          300: "#e6ddce", // Base color
          400: "#d9cdbb",
          500: "#c9b9a3",
          600: "#b5a38a",
          700: "#9c8a72",
          800: "#7d6e5b",
          900: "#5e5344",
        },
        emerald: {
          50: "#f5e9e2",
          100: "#e8d0c4",
          200: "#d3a98d",
          300: "#bf8256",
          400: "#a75f2a",
          500: "#7b3306",
          600: "#6c2e05",
          700: "#5c2704",
          800: "#4d2104",
          900: "#3f1a03",
        }
      },
      height: {
        header: "560px",
      },
      backgroundImage: {
        "page-header": "url('/page-header-bg.jpg')",
        "contact-header": "url('/page-header-bg-2.jpg')",
        subscribe: "url('/subscribe-bg.jpg')",
        "app-download": "url('/app-download.jpg')",
        cta: "url('/cta-bg.png')",
        "cta-1": "url('/cta/cta-bg-1.png')",
        "cta-2": "url('/cta/cta-bg-2.png')",
        "cta-3": "url('/cta/cta-bg-3.png')",
        "cream-gradient": "linear-gradient(135deg, #f0e8db 0%, #e6ddce 50%, #d9cdbb 100%)",
        "chocolate-gradient": "linear-gradient(135deg, #6a432e 0%, #7c5137 50%, #8b5f43 100%)",
      },
      animation: {
        'float-slow': 'float 8s ease-in-out infinite',
        'float-medium': 'float 6s ease-in-out infinite',
        'float-fast': 'float 4s ease-in-out infinite',
        'drip': 'drip 3s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.8s ease-out',
        'fade-in': 'fadeIn 1s ease-out',
        'fadeInUp': 'fadeInUp 0.5s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        drip: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(10px)', opacity: '0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },
      boxShadow: {
        'chocolate': '0 10px 40px -10px rgba(124, 81, 55, 0.3)',
        'chocolate-lg': '0 20px 60px -15px rgba(124, 81, 55, 0.4)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
};
