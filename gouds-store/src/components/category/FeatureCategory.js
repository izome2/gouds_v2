import Image from "next/image";
import { useRouter } from "next/router";
import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { IoChevronForwardSharp, IoSparkles } from "react-icons/io5";

//internal import
import CategoryServices from "@services/CategoryServices";
import CMSkeleton from "@components/preloader/CMSkeleton";
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";
import CategoryCard from "./CategoryCard";

const FeatureCategory = () => {
  const router = useRouter();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();

  const {
    data,
    error,
    isLoading: loading,
  } = useQuery({
    queryKey: ["category"],
    queryFn: async () => await CategoryServices.getShowingCategory(),
  });

  // console.log("category", data);

  const handleCategoryClick = (id, categoryName) => {
    const category_name = categoryName
      .toLowerCase()
      .replace(/[^A-Z0-9]+/gi, "-");
    const url = `/search?category=${category_name}&_id=${id}`;
    router.push(url);
    setIsLoading(!isLoading);
  };

  // دالة للحصول على النص من الترجمة
  const getTranslatedText = (nameObj) => {
    if (typeof nameObj === 'string') return nameObj;
    if (typeof nameObj === 'object' && nameObj) {
      return nameObj.en || nameObj.ar || Object.values(nameObj)[0] || '';
    }
    return '';
  };

  // ترتيب الفئات بحيث يظهر Limited Edition أولاً
  const sortedCategories = data?.[0]?.children
    ? [...data[0].children].sort((a, b) => {
      const aName = getTranslatedText(a?.name)?.toLowerCase();
      const bName = getTranslatedText(b?.name)?.toLowerCase();

      if (aName === 'limited edition') return -1;
      if (bName === 'limited edition') return 1;
      return 0;
    })
    : [];

  return (
    <>
      {loading ? (
        <CMSkeleton count={10} height={20} error={error} loading={loading} />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-[#F5F1EB] via-[#E6DECF] to-[#DDD4C0] relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-32 bg-[#7D5036]/5 rounded-full blur-xl"></div>
            <div className="absolute top-40 right-20 w-48 h-48 bg-[#B8860B]/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-[#8B4513]/5 rounded-full blur-xl"></div>
          </div>

          <main className="container mx-auto px-6 py-12 relative z-10">
            <section className="text-center mb-16">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-white/30 backdrop-blur-sm rounded-full">
                <IoSparkles className="text-[#B8860B] text-lg" />
                <span className="text-[#7D5036] text-sm font-medium">Discover Our Categories</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-[#7D5036] mb-4 leading-tight">
                Explore Our
                <span className="bg-gradient-to-r from-[#B8860B] to-[#CD853F] bg-clip-text text-transparent"> Delicious </span>
                Categories
              </h1>

              <p className="text-[#8B6F47] text-lg max-w-2xl mx-auto leading-relaxed">
                From premium desserts to artisanal treats, discover the perfect category for your cravings
              </p>

              {/* Decorative line */}
              <div className="flex items-center justify-center mt-8 mb-12">
                <div className="h-px bg-gradient-to-r from-transparent via-[#7D5036]/30 to-transparent w-32"></div>
                <div className="mx-4 w-2 h-2 bg-[#B8860B] rounded-full"></div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#7D5036]/30 to-transparent w-32"></div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                {sortedCategories.map((category, i) => {
                  const categoryName = getTranslatedText(category?.name);
                  const isLimitedEdition = categoryName?.toLowerCase() === 'limited edition';

                  return (
                    <div key={category._id} className="group relative">
                      {/* New Label for Limited Edition */}
                      {isLimitedEdition && (
                        <div className="absolute -top-4 -right-4 z-20 bg-gradient-to-r from-[#FF6B35] to-[#FF8E53] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-bounce">
                          <span className="flex items-center gap-1.5">
                            <IoSparkles className="text-sm" />
                            NEW ARRIVAL
                          </span>
                        </div>
                      )}

                      <CategoryCard
                        id={category._id}
                        icon={category.icon}
                        title={categoryName}
                        description={getTranslatedText(category.description)}
                        isNew={isLimitedEdition}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Empty state */}
              {sortedCategories.length === 0 && (
                <div className="text-center py-20">
                  <div className="w-32 h-32 mx-auto mb-6 bg-[#7D5036]/10 rounded-full flex items-center justify-center">
                    <IoSparkles className="text-4xl text-[#7D5036]/40" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#7D5036] mb-2">No Categories Found</h3>
                  <p className="text-[#8B6F47]">Categories will appear here once they are available.</p>
                </div>
              )}
            </section>

            {/* Bottom CTA Section */}
            <section className="text-center mt-20 py-16 bg-white/20 backdrop-blur-sm rounded-3xl border border-white/30">
              <h2 className="text-2xl font-bold text-[#7D5036] mb-4">
                Can't find what you're looking for?
              </h2>
              <p className="text-[#8B6F47] mb-6 max-w-md mx-auto">
                Explore all our products or get in touch with our team for personalized recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-6 py-3 bg-[#7D5036] text-white rounded-xl font-semibold hover:bg-[#6A4430] transform hover:scale-105 transition-all duration-200 shadow-lg">
                  Browse All Products
                </button>
                <button className="px-6 py-3 bg-white text-[#7D5036] border-2 border-[#7D5036] rounded-xl font-semibold hover:bg-[#7D5036] hover:text-white transform hover:scale-105 transition-all duration-200">
                  Contact Us
                </button>
              </div>
            </section>
          </main>
        </div>
      )}
    </>
  );
};

export default FeatureCategory;