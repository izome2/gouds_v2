import Image from "next/image";
import { useRouter } from "next/router";
import { useContext, useState } from "react";
import {
  IoChevronDownOutline,
  IoChevronForwardOutline,
  IoRemoveSharp,
  IoSparkles,
  IoArrowForwardOutline
} from "react-icons/io5";

//internal import
import { SidebarContext } from "@context/SidebarContext";
import useUtilsFunction from "@hooks/useUtilsFunction";

const CategoryCard = ({ title, icon, nested, id, description, isNew = false }) => {
  const router = useRouter();
  const { closeCategoryDrawer, isLoading, setIsLoading } =
    useContext(SidebarContext);
  const { showingTranslateValue } = useUtilsFunction();

  // react hook
  const [show, setShow] = useState(false);
  const [showSubCategory, setShowSubCategory] = useState({
    id: "",
    show: false,
  });

  // handle show category
  const showCategory = (id, categoryName) => {
    const name = categoryName.toLowerCase().replace(/[^A-Z0-9]+/gi, "-");

    setShow(!show);
    router.push(`/search?category=${name}&_id=${id}`);
    closeCategoryDrawer();
    setIsLoading(!isLoading);
  };

  // handle sub nested category
  const handleSubNestedCategory = (id, categoryName) => {
    const name = categoryName.toLowerCase().replace(/[^A-Z0-9]+/gi, "-");

    setShowSubCategory({ id: id, show: showSubCategory.show ? false : true });
    router.push(`/search?category=${name}&_id=${id}`);
    closeCategoryDrawer();
    setIsLoading(!isLoading);
  };

  const handleSubCategory = (id, categoryName) => {
    const name = categoryName.toLowerCase().replace(/[^A-Z0-9]+/gi, "-");

    router.push(`/search?category=${name}&_id=${id}`);
    closeCategoryDrawer();
    setIsLoading(!isLoading);
  };

  return (
    <div
      onClick={() => showCategory(id, title)}
      className={`
        cursor-pointer relative overflow-hidden
        ${isNew
          ? 'bg-white border-2 border-orange-300 shadow-2xl'
          : 'bg-white border border-gray-200 shadow-lg hover:shadow-2xl'
        }
        rounded-3xl transform transition-all duration-700 ease-out
        hover:scale-105 hover:-translate-y-2
        group
      `}
    >
      {/* Premium gradient overlay for new items */}
      {isNew && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-transparent to-orange-50 rounded-3xl"></div>
      )}

      {/* Image Section - Fixed Square Design */}
      <div className="relative w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-3xl" style={{ aspectRatio: '1' }}>
        <div className="absolute inset-4">
          {icon ? (
            <Image
              className="w-full h-full object-contain rounded-lg"
              src={icon}
              alt={title}
              width={300}
              height={300}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg">
              <IoSparkles className="text-6xl text-gray-400" />
            </div>
          )}
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-t-3xl"></div>

        {/* Category badge */}
        <div className={`
          absolute top-4 left-4 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md
          ${isNew
            ? 'bg-white text-orange-500 border border-orange-200'
            : 'bg-white text-amber-700 border border-gray-200'
          }
          opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0
        `}>
          Category
        </div>
      </div>

      {/* Content Section - Clean and Professional */}
      <div className="p-6 space-y-4">
        {/* Title with professional typography */}
        <div className="space-y-2">
          <h3 className={`
            text-xl font-bold leading-tight transition-colors duration-300
            ${isNew
              ? 'text-gray-800 group-hover:text-orange-500'
              : 'text-gray-800 group-hover:text-amber-700'
            }
          `}>
            {title}
          </h3>

          {/* Subtle underline */}
          <div className={`
            h-0.5 w-0 transition-all duration-500 group-hover:w-12
            ${isNew
              ? 'bg-gradient-to-r from-orange-400 to-orange-500'
              : 'bg-gradient-to-r from-amber-600 to-yellow-600'
            }
          `}></div>
        </div>

        {/* Description with better readability */}
        {description && (
          <p
            className="text-gray-600 text-sm leading-relaxed overflow-hidden"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {description}
          </p>
        )}

        {/* Professional action button */}
        <div className="pt-2">
          <div className={`
            inline-flex items-center gap-2 text-sm font-semibold transition-all duration-300
            ${isNew
              ? 'text-orange-500 group-hover:gap-3'
              : 'text-amber-700 group-hover:gap-3'
            }
          `}>
            <span>Explore Collection</span>
            <IoArrowForwardOutline className="text-sm transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Premium bottom accent */}
      <div className={`
        absolute bottom-0 left-0 h-1 w-0 transition-all duration-700 group-hover:w-full
        ${isNew
          ? 'bg-gradient-to-r from-orange-400 via-orange-500 to-orange-400'
          : 'bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-600'
        }
      `}></div>

      {/* Corner glow effect for new items */}
      {isNew && (
        <>
          <div className="absolute top-3 right-3 w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <div className="absolute top-3 right-3 w-2 h-2 bg-orange-400 rounded-full animate-ping"></div>
        </>
      )}

      {/* Elegant shadow enhancement */}
      <div className={`
        absolute inset-0 rounded-3xl pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100
        ${isNew
          ? 'shadow-2xl shadow-orange-200'
          : 'shadow-2xl shadow-amber-200'
        }
      `}></div>
    </div>
  );
};

export default CategoryCard;