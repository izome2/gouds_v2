import {
    Cookie,
    Star,
    Heart,
    Sparkles,
    Gift,
    PartyPopper,
    Gem,
    Cake,
} from "lucide-react";
import Link from "next/link";
const Hero = () => {
    return (
        <section className="relative h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-orange-100 to-amber-200">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-10 left-10 animate-float-slow opacity-10">
                    <Cookie size={120} className="text-amber-700" />
                </div>
                <div className="absolute top-1/4 right-20 animate-float-medium opacity-10">
                    <Star size={80} className="text-amber-600" />
                </div>
                <div className="absolute bottom-20 left-1/4 animate-float-fast opacity-10">
                    <Heart size={100} className="text-amber-500" />
                </div>
                <div className="absolute top-1/3 left-1/2 animate-float-medium opacity-10">
                    <Sparkles size={90} className="text-amber-600" />
                </div>
                <div className="absolute bottom-10 right-1/3 animate-float-slow opacity-10">
                    <Gift size={70} className="text-amber-400" />
                </div>
                <div className="absolute top-1/2 left-1/4 animate-float-medium opacity-10">
                    <Cookie size={100} className="text-amber-700" />
                </div>
                <div className="absolute top-1/4 right-1/4 animate-float-slow opacity-10">
                    <PartyPopper size={80} className="text-amber-600" />
                </div>
                <div className="absolute bottom-1/3 left-1/2 animate-float-medium opacity-10">
                    <Star size={70} className="text-amber-500" />
                </div>
                <div className="absolute top-1/2 right-1/4 animate-float-slow opacity-10">
                    <Gem size={80} className="text-amber-600" />
                </div>
                <div className="absolute bottom-1/4 left-1/3 animate-float-medium opacity-10">
                    <Cake size={100} className="text-amber-500" />
                </div>
            </div>

            {/* Main content */}
            <div className="relative h-full flex flex-col items-center justify-center px-4">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <p className="text-xl md:text-2xl text-amber-700 font-light tracking-wider">
                            Welcome to
                        </p>
                        <h1 className="relative font-serif italic text-5xl md:text-8xl font-bold text-amber-900">
                            <span className="relative inline-block">
                                GOUDS
                                <div className="absolute -bottom-2 left-0 w-full h-1 bg-amber-500 transform -skew-x-12"></div>
                            </span>
                        </h1>
                    </div>

                    <div className="space-y-4">
                        <p className="text-2xl md:text-4xl text-amber-800 font-light tracking-wide">
                            PIECES OF LOVE
                        </p>
                        <p className="text-lg md:text-xl text-amber-700 font-light">
                            100% Egyptian brand
                        </p>
                    </div>

                    <Link
                        href="/menu"
                        className="inline-block mt-8 px-8 py-4 bg-amber-900 text-amber-50 rounded-full
                       text-lg font-medium tracking-wide transition-all duration-300
                       hover:bg-amber-800 hover:shadow-lg hover:shadow-amber-900/20
                       transform hover:-translate-y-1"
                    >
                        Order Now
                    </Link>
                </div>

                {/* <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <a
              href="#menu"
              className="block p-2 text-amber-900 transition-transform duration-300 hover:-translate-y-1"
            >
              <ChevronDown size={32} />
            </a>
          </div> */}
            </div>
        </section>
    );
};

export default Hero;