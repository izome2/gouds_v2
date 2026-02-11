import { useState, useEffect } from "react";
import Image from "next/image";
import { FiStar, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const CustomerReviews = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const reviews = [
    {
      id: 1,
      name: "Sarah Ahmed",
      role: "Cookie Enthusiast",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      rating: 5,
      review: "Absolutely divine! The chocolate chip cookies are the best I've ever tasted. Fresh, warm, and perfectly balanced sweetness.",
      date: "2 days ago",
    },
    {
      id: 2,
      name: "Mohamed Hassan",
      role: "Regular Customer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
      rating: 5,
      review: "I ordered for a family gathering and everyone was impressed! The delivery was fast and cookies arrived warm. Highly recommended! 🍪",
      date: "1 week ago",
    },
    {
      id: 3,
      name: "Laila Ibrahim",
      role: "Sweet Tooth",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      rating: 5,
      review: "The quality is outstanding! You can taste the premium chocolate in every bite. Worth every penny. My new favorite treat!",
      date: "2 weeks ago",
    },
    {
      id: 4,
      name: "Omar Khaled",
      role: "Food Blogger",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
      rating: 5,
      review: "As a food blogger, I'm very picky. Gouds exceeded all expectations! Fresh ingredients, perfect texture, amazing taste. 10/10! ⭐",
      date: "3 weeks ago",
    },
    {
      id: 5,
      name: "Nour Mahmoud",
      role: "Happy Mom",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
      rating: 5,
      review: "My kids absolutely love these cookies! Finally found a treat that's delicious and made with quality ingredients. Thank you Gouds! 💕",
      date: "1 month ago",
    },
    {
      id: 6,
      name: "Ahmed Youssef",
      role: "Corporate Client",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      rating: 5,
      review: "Ordered for our office meeting. Everyone loved them! Professional packaging, excellent taste. Will definitely order again!",
      date: "1 month ago",
    },
  ];

  const itemsPerView = 3;
  const totalSlides = Math.ceil(reviews.length / itemsPerView);

  useEffect(() => {
    if (!isPaused) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalSlides);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isPaused, totalSlides]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const getVisibleReviews = () => {
    const start = currentIndex * itemsPerView;
    return reviews.slice(start, start + itemsPerView);
  };

  return (
    <section className="relative py-24 bg-gradient-to-br from-cream-100 via-cream-200/50 to-cream-100 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Wave - matches WhyChooseUs bottom wave */}
        <div className="absolute top-0 left-0 right-0 h-20">
          <svg
            viewBox="0 0 1200 120"
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 C200,80 400,20 600,60 C800,100 1000,30 1200,70 L1200,0 L0,0 Z"
              fill="#e6ddce"
            />
          </svg>
        </div>

        {/* Floating Circles */}
        <div className="absolute top-20 -left-20 w-80 h-80 bg-chocolate-300/10 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-chocolate-200/10 rounded-full blur-3xl animate-float-medium" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 bg-cream-400/20 rounded-full blur-3xl animate-float-fast" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-chocolate-800">What Our</span>
            <br />
            <span className="text-gradient-chocolate">Customers Say</span>
          </h2>

          <p className="text-chocolate-600/80 text-lg max-w-2xl mx-auto font-sans">
            Don't just take our word for it - hear from our happy customers
          </p>
        </div>

        {/* Reviews Grid */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Desktop Grid View */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-8">
            {getVisibleReviews().map((review, index) => (
              <div
                key={review.id}
                className="group bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-chocolate-100/50 hover:border-chocolate-200 hover:bg-white/90 transition-all duration-500 hover:shadow-chocolate card-melt animate-slide-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Rating Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-chocolate-200"
                      }`}
                    />
                  ))}
                </div>

                {/* Review Text */}
                <p className="text-chocolate-700 text-base lg:text-lg font-sans leading-relaxed mb-6 min-h-[120px]">
                  "{review.review}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-chocolate-100">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-chocolate-200 group-hover:ring-chocolate-300 transition-all duration-300">
                    <Image
                      src={review.image}
                      alt={review.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-serif font-semibold text-chocolate-800">
                      {review.name}
                    </h4>
                    <p className="text-sm text-chocolate-500">{review.role}</p>
                  </div>
                  <span className="ml-auto text-xs text-chocolate-400">
                    {review.date}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet Single Card View */}
          <div className="lg:hidden">
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {reviews.map((review) => (
                  <div key={review.id} className="w-full flex-shrink-0 px-4">
                    <div className="bg-white/70 backdrop-blur-lg rounded-3xl p-8 border border-chocolate-100/50 shadow-lg">
                      <div className="flex gap-1 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`w-5 h-5 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-chocolate-200"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-chocolate-700 text-lg font-sans leading-relaxed mb-6">
                        "{review.review}"
                      </p>
                      <div className="flex items-center gap-4 pt-4 border-t border-chocolate-100">
                        <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-chocolate-200">
                          <Image
                            src={review.image}
                            alt={review.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="font-serif font-semibold text-chocolate-800">
                            {review.name}
                          </h4>
                          <p className="text-sm text-chocolate-500">{review.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={prevSlide}
              className="p-3 bg-white/80 backdrop-blur-sm rounded-full border border-chocolate-200 text-chocolate-600 hover:bg-white hover:border-chocolate-300 hover:text-chocolate-700 transition-all duration-300 shadow-md hover:shadow-lg"
              aria-label="Previous reviews"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex gap-2">
              {[...Array(totalSlides)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "w-8 bg-chocolate-500"
                      : "w-2 bg-chocolate-300 hover:bg-chocolate-400"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="p-3 bg-white/80 backdrop-blur-sm rounded-full border border-chocolate-200 text-chocolate-600 hover:bg-white hover:border-chocolate-300 hover:text-chocolate-700 transition-all duration-300 shadow-md hover:shadow-lg"
              aria-label="Next reviews"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: "800ms" }}>
          {[
            { number: "50K+", label: "Happy Customers" },
            { number: "4.9", label: "Average Rating" },
            { number: "98%", label: "Would Recommend" },
            { number: "15K+", label: "5-Star Reviews" },
          ].map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-chocolate-100/50 hover:bg-white/80 transition-all duration-300"
            >
              <p className="font-display text-3xl md:text-4xl font-bold text-chocolate-700 mb-1">
                {stat.number}
              </p>
              <p className="text-chocolate-600 text-sm font-serif">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-16">
        <svg
          viewBox="0 0 1200 120"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C200,100 400,40 600,80 C800,120 1000,50 1200,90 L1200,120 L0,120 Z"
            fill="#e6ddce"
          />
        </svg>
      </div>
    </section>
  );
};

export default CustomerReviews;
