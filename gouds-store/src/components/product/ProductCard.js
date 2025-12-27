import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { IoAdd, IoBagAddSharp, IoRemove } from "react-icons/io5";
import { useCart } from "react-use-cart";

//internal import

import Price from "@components/common/Price";
import Stock from "@components/common/Stock";
import { notifyError } from "@utils/toast";
import useAddToCart from "@hooks/useAddToCart";
import useGetSetting from "@hooks/useGetSetting";
import Discount from "@components/common/Discount";
import useUtilsFunction from "@hooks/useUtilsFunction";
import ProductModal from "@components/modal/ProductModal";
import ImageWithFallback from "@components/common/ImageWithFallBack";
import { handleLogEvent } from "src/lib/analytics";

const ProductCard = ({ product, attributes }) => {
  const [modalOpen, setModalOpen] = useState(false);

  const { items, addItem, updateItemQuantity, inCart } = useCart();
  const { handleIncreaseQuantity } = useAddToCart();
  const { globalSetting } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  const currency = globalSetting?.default_currency || "$";

  // console.log('attributes in product cart',attributes)

  const handleAddItem = (p) => {
    if (p.stock < 1) return notifyError("Insufficient stock!");

    if (p?.variants?.length > 0) {
      setModalOpen(!modalOpen);
      return;
    }
    const { slug, variants, categories, description, ...updatedProduct } =
      product;
    const newItem = {
      ...updatedProduct,
      title: showingTranslateValue(p?.title),
      id: p._id,
      variant: p.prices,
      price: p.prices.price,
      originalPrice: product.prices?.originalPrice,
    };
    addItem(newItem);
  };

  const handleModalOpen = (event, id) => {
    setModalOpen(event);
  };

  return (
    <>
      {modalOpen && (
        <ProductModal
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          product={product}
          currency={currency}
          attributes={attributes}
        />
      )}

      <div className="bg-white rounded-lg shadow-md p-2 hover:shadow-lg transition-shadow flex flex-row items-center">
        {/* Image on the left */}
        <div
          onClick={() => {
            handleModalOpen(!modalOpen, product._id);
            handleLogEvent(
              "product",
              `opened ${showingTranslateValue(product?.title)} product modal`
            );
          }}
          className="relative w-28 h-28 flex-shrink-0 cursor-pointer"
        >
          {product.image[0] ? (
            <ImageWithFallback src={product.image[0]} alt="product" className="rounded-lg object-cover w-full h-full" />
          ) : (
            <Image
              src="https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png"
              fill
              style={{ objectFit: "cover" }}
              alt="product"
              className="rounded-lg"
            />
          )}
        </div>

        {/* Product details on the right */}
        <div className="flex flex-col flex-grow px-4">
          {/* Product Name */}
          <h2 className="text-heading text-lg font-medium text-emerald-600 truncate"
            onClick={() => {
              handleModalOpen(!modalOpen, product._id);
              handleLogEvent(
                "product",
                `opened ${showingTranslateValue(product?.title)} product modal`
              );
            }}
          >
            {showingTranslateValue(product?.title)}
          </h2>

          {/* Product Description */}
          <p className="text-gray-600 text-sm mt-1"

            onClick={() => {
              handleModalOpen(!modalOpen, product._id);
              handleLogEvent(
                "product",
                `opened ${showingTranslateValue(product?.title)} product modal`
              );
            }}>
            {/* just 40 char from */}
            {showingTranslateValue(product?.description)?.substring(0, 60)}
            ...
          </p>

          <div className="flex flex-row items-center justify-between mt-auto">
            {/* Price */}
            <div className="text-heading text-sm sm:text-base lg:text-lg font-semibold">
              {/* if product has variants */}
              {product?.variants.length > 0 && (
                <div className="flex flex-row items-center">
                  <small className="text-sm font-light text-gray-400 mr-1 ">
                    price when select
                  </small>

                </div>
              )}

              {product?.variants.length == 0 && (
                <Price
                  card
                  product={product}
                  currency={currency}
                  price={
                    product?.isCombination
                      ? product?.variants[0]?.price
                      : product?.prices?.price
                  }
                  originalPrice={
                    product?.isCombination
                      ? product?.variants[0]?.originalPrice
                      : product?.prices?.originalPrice
                  }
                />
              )}
            </div>
            {/* Add to Cart Button */}
            <div className="mt-2">
              {inCart(product._id) ? (
                items.map(
                  (item) =>
                    item.id === product._id && (
                      <div
                        key={item.id}
                        className="h-9 flex items-center bg-emerald-500 text-white rounded px-2"
                      >
                        <button onClick={() => updateItemQuantity(item.id, item.quantity - 1)}>
                          <IoRemove className="text-dark text-base" />
                        </button>
                        <p className="text-sm px-2 font-semibold">{item.quantity}</p>
                        <button onClick={() => (item?.variants?.length > 0 ? handleAddItem(item) : handleIncreaseQuantity(item))}>
                          <IoAdd className="text-dark text-base" />
                        </button>
                      </div>
                    )
                )
              ) : (
                <button
                  onClick={() => handleAddItem(product)}
                  className="h-9 w-9 flex items-center justify-center border border-gray-200 rounded text-emerald-500 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                >
                  <IoBagAddSharp className="text-xl" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default dynamic(() => Promise.resolve(ProductCard), { ssr: false });
