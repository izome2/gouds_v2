import { useState, useRef, useCallback, memo } from "react";
import Image from "next/image";
import { FiInstagram, FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiHeart, FiMessageCircle } from "react-icons/fi";

// Separate VideoCard component to prevent re-renders
const VideoCard = memo(function VideoCard({ post, isPlaying, onTogglePlay, isLiked, onToggleLike }) {
  const videoRef = useRef(null);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      onTogglePlay(post.id, true);
    } else {
      video.pause();
      onTogglePlay(post.id, false);
    }
  }, [post.id, onTogglePlay]);

  const handleLikeClick = useCallback((e) => {
    e.stopPropagation();
    onToggleLike(post.id);
  }, [post.id, onToggleLike]);

  return (
    <div
      className="group relative rounded-xl overflow-hidden shadow-2xl cursor-pointer select-none"
      style={{ aspectRatio: '9/16' }}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Video */}
      <video
        ref={videoRef}
        src={post.videoUrl}
        loop
        playsInline
        preload="metadata"
        controlsList="nodownload"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full object-cover"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

      {/* Play/Pause Overlay - Center */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 pointer-events-none ${
          isPlaying ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <FiPlay className="w-7 h-7 text-white ml-1" />
        </div>
      </div>

      {/* Bottom Right Actions - Like, Comment */}
      <div className="absolute right-3 bottom-3 flex flex-col items-center gap-2">
        {/* Like Button */}
        <button
          onClick={handleLikeClick}
          className="flex flex-col items-center gap-0.5"
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
            isLiked ? 'bg-red-500' : 'bg-black/30 backdrop-blur-sm hover:bg-black/50'
          }`}>
            <FiHeart className={`w-5 h-5 transition-all duration-300 ${
              isLiked ? 'text-white fill-white' : 'text-white'
            }`} />
          </div>
          <span className="text-white text-[10px] font-medium">{(post.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-0.5"
        >
          <div className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center hover:bg-black/50 transition-all duration-300">
            <FiMessageCircle className="w-5 h-5 text-white" />
          </div>
          <span className="text-white text-[10px] font-medium">{post.comments}</span>
        </button>
      </div>

      {/* Bottom Left - Avatar & Username */}
      <div className="absolute bottom-3 left-3 right-16 flex items-end gap-2">
        {/* Avatar - Logo */}
        <a
          href="https://instagram.com/gouds_2024"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 p-[2px]">
            <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center">
              <Image
                src="/logo/Logo-3.png"
                alt="Gouds"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
          </div>
        </a>

        {/* Username & Caption */}
        <div className="flex-1 min-w-0">
          <a
            href="https://instagram.com/gouds_2024"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-bold text-white text-xs hover:underline"
          >
            gouds_2024
          </a>
          <p className="text-white/90 text-[10px] mt-0.5 line-clamp-2">
            {post.caption}
          </p>
        </div>
      </div>
    </div>
  );
});

const InstagramFeed = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playingVideos, setPlayingVideos] = useState({});
  const [likedVideos, setLikedVideos] = useState({});

  // Videos from public/videos folder
  const instagramPosts = [
    {
      id: 1,
      videoUrl: "/videos/reel1.mp4",
      caption: "Fresh dark chocolate cookies",
      likes: 2453,
      comments: 89,
    },
    {
      id: 2,
      videoUrl: "/videos/reel2.mp4",
      caption: "Our secret recipe - Premium Belgian chocolate",
      likes: 3127,
      comments: 124,
    },
    {
      id: 3,
      videoUrl: "/videos/reel3.mp4",
      caption: "Salted caramel with chocolate",
      likes: 1892,
      comments: 67,
    },
  ];

  const handleTogglePlay = useCallback((postId, playing) => {
    setPlayingVideos(prev => ({ ...prev, [postId]: playing }));
  }, []);

  const handleToggleLike = useCallback((postId) => {
    setLikedVideos(prev => ({ ...prev, [postId]: !prev[postId] }));
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % instagramPosts.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + instagramPosts.length) % instagramPosts.length);
  };

  return (
    <section className="relative py-24 bg-gradient-to-b from-cream-50 to-white overflow-hidden">
      {/* Top Wave - matches CustomerReviews bottom wave */}
      <div className="absolute top-0 left-0 right-0 h-16 transform rotate-180">
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

      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-chocolate-100/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-pink-100/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            <span className="text-chocolate-800">From Our Kitchen</span>
            <br />
            <span className="text-gradient-chocolate">To Your Screen</span>
          </h2>

          <p className="text-chocolate-600/80 text-lg max-w-2xl mx-auto font-sans">
            Watch how we make the most delicious cookies with love and care
          </p>
        </div>

        {/* Videos Grid - Desktop */}
        <div className="hidden lg:flex lg:justify-center lg:gap-8">
          {instagramPosts.map((post) => (
            <div key={post.id} className="w-80">
              <VideoCard
                post={post}
                isPlaying={!!playingVideos[post.id]}
                onTogglePlay={handleTogglePlay}
                isLiked={!!likedVideos[post.id]}
                onToggleLike={handleToggleLike}
              />
            </div>
          ))}
        </div>

        {/* Videos Carousel - Mobile & Tablet */}
        <div className="lg:hidden relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 -translate-x-2"
            aria-label="Previous post"
          >
            <FiChevronLeft className="w-6 h-6 text-chocolate-700" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 translate-x-2"
            aria-label="Next post"
          >
            <FiChevronRight className="w-6 h-6 text-chocolate-700" />
          </button>

          {/* Carousel Container */}
          <div className="overflow-hidden mx-6">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {instagramPosts.map((post) => (
                <div key={post.id} className="w-full flex-shrink-0 px-4 flex justify-center">
                  <div className="w-80">
                    <VideoCard
                      post={post}
                      isPlaying={!!playingVideos[post.id]}
                      onTogglePlay={handleTogglePlay}
                      isLiked={!!likedVideos[post.id]}
                      onToggleLike={handleToggleLike}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Navigation */}
          <div className="flex justify-center gap-2 mt-6">
            {instagramPosts.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? "bg-gradient-to-r from-pink-500 to-purple-600 w-8"
                    : "bg-chocolate-200 hover:bg-chocolate-300"
                }`}
                aria-label={`Go to post ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Follow CTA */}
        <div className="text-center mt-16">
          <a
            href="https://instagram.com/gouds_2024"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-serif font-semibold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            <FiInstagram className="w-6 h-6" />
            <span>Follow @gouds_2024 on Instagram</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default InstagramFeed;
