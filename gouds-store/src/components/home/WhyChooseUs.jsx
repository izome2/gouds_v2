import { FiClock, FiAward, FiTruck, FiHeart } from "react-icons/fi";

const WhyChooseUs = () => {
  const features = [
    {
      icon: FiClock,
      title: "Baked Fresh Daily",
      description: "Every cookie is baked fresh each morning using traditional recipes that guarantee unmatched taste and quality.",
      gradient: "from-chocolate-400 to-chocolate-600",
      bgColor: "bg-chocolate-50",
      iconBg: "bg-gradient-to-br from-chocolate-400 to-chocolate-600",
    },
    {
      icon: FiAward,
      title: "Premium Belgian Chocolate",
      description: "We use only the finest Belgian chocolate and premium ingredients sourced from around the world.",
      gradient: "from-chocolate-500 to-chocolate-700",
      bgColor: "bg-cream-100",
      iconBg: "bg-gradient-to-br from-chocolate-500 to-chocolate-700",
    },
    {
      icon: FiTruck,
      title: "Delivered Warm",
      description: "Special insulated packaging ensures your cookies arrive warm and fresh, just like they came out of the oven.",
      gradient: "from-chocolate-400 to-chocolate-600",
      bgColor: "bg-chocolate-50",
      iconBg: "bg-gradient-to-br from-chocolate-400 to-chocolate-600",
    },
    {
      icon: FiHeart,
      title: "Zero Preservatives",
      description: "All natural ingredients with no artificial preservatives, colors, or flavors. Just pure deliciousness.",
      gradient: "from-chocolate-500 to-chocolate-700",
      bgColor: "bg-cream-100",
      iconBg: "bg-gradient-to-br from-chocolate-500 to-chocolate-700",
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-white via-cream-100/50 to-white overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Wave - matches BestSellers bottom wave */}
        <div className="absolute top-0 left-0 right-0 h-20">
          <svg
            viewBox="0 0 1200 120"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 C150,80 350,20 500,60 C650,100 750,40 900,70 C1050,100 1150,50 1200,70 L1200,0 L0,0 Z"
              fill="#e6ddce"
            />
          </svg>
        </div>

        {/* Decorative Circles */}
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-chocolate-200/20 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-cream-300/30 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 bg-chocolate-100/20 rounded-full blur-3xl animate-float-fast" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-chocolate-800">What Makes Us</span>
            <br />
            <span className="text-gradient-chocolate">Special</span>
          </h2>

          <p className="text-chocolate-600/80 text-lg max-w-2xl mx-auto font-sans">
            We're not just another cookie shop. Here's what sets us apart from the rest
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group relative bg-white rounded-3xl p-8 lg:p-10 border border-chocolate-100/50 hover:border-chocolate-200 transition-all duration-500 hover:shadow-chocolate-lg animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Background Glow on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-chocolate-50/50 to-cream-100/50 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Content */}
                <div className="relative space-y-4">
                  {/* Icon Container */}
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-chocolate-400 to-chocolate-600 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Title */}
                  <h3 className="font-display text-2xl lg:text-3xl font-bold text-chocolate-800 group-hover:text-chocolate-600 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-chocolate-600/80 text-base lg:text-lg font-sans leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Decorative Element */}
                  <div className="pt-4">
                    <div className="w-12 h-1 bg-gradient-to-r from-chocolate-400 to-transparent rounded-full group-hover:w-24 transition-all duration-500" />
                  </div>
                </div>

                {/* Corner Decoration */}
                <div className="absolute top-6 right-6 w-20 h-20 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                  <Icon className="w-full h-full text-chocolate-600" />
                </div>

                {/* Bottom Drip Effect (visible on hover) */}
                <div className="absolute bottom-0 left-0 right-0 h-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden rounded-b-3xl">
                  <svg
                    viewBox="0 0 400 24"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0,8 Q50,24 100,12 T200,12 T300,12 T400,12 L400,24 L0,24 Z"
                      fill="url(#cardDripGradient)"
                      opacity="0.2"
                    />
                    <defs>
                      <linearGradient id="cardDripGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#7c5137" stopOpacity="0" />
                        <stop offset="100%" stopColor="#7c5137" stopOpacity="0.8" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center animate-fade-in" style={{ animationDelay: "600ms" }}>
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 bg-gradient-to-br from-chocolate-500 to-chocolate-700 rounded-3xl shadow-chocolate-lg">
            <div className="text-white text-center sm:text-left">
              <p className="font-display text-2xl font-bold">Ready to taste the difference?</p>
              <p className="text-chocolate-100 text-sm mt-1">Join 50,000+ happy customers</p>
            </div>
            <a
              href="/menu"
              className="px-8 py-3 bg-white text-chocolate-700 font-serif font-semibold rounded-2xl hover:bg-cream-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 whitespace-nowrap"
            >
              Order Now
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Chocolate Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-20">
        <svg
          viewBox="0 0 1200 120"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,40 C200,80 400,20 600,60 C800,100 1000,30 1200,70 L1200,120 L0,120 Z"
            fill="#e6ddce"
          />
        </svg>
      </div>
    </section>
  );
};

export default WhyChooseUs;
