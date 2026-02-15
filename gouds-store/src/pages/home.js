import { SidebarContext } from "@context/SidebarContext";
import { useContext, useEffect } from "react";
import { useRouter } from "next/router";

//internal import
import Layout from "@layout/Layout";
import Banner from "@components/banner/Banner";
import useGetSetting from "@hooks/useGetSetting";
import CardTwo from "@components/cta-card/CardTwo";
import OfferCard from "@components/offer/OfferCard";
import StickyCart from "@components/cart/StickyCart";
import Loading from "@components/preloader/Loading";
import ProductServices from "@services/ProductServices";
import ProductCard from "@components/product/ProductCard";
import MainCarousel from "@components/carousel/MainCarousel";
import FeatureCategory from "@components/category/FeatureCategory";
import AttributeServices from "@services/AttributeServices";
import CMSkeleton from "@components/preloader/CMSkeleton";
import Hero from '@components/home/Hero'
import BestSellers from '@components/home/BestSellers'
import WhyChooseUs from '@components/home/WhyChooseUs'
import CustomerReviews from '@components/home/CustomerReviews'
import InstagramFeed from '@components/home/InstagramFeed'

const Home = ({ popularProducts, discountProducts, attributes }) => {
  const router = useRouter();
  const { isLoading, setIsLoading } = useContext(SidebarContext);
  const { loading, error, storeCustomizationSetting } = useGetSetting();

  useEffect(() => {
    if (router.asPath === "/home") {
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, [router]);

  return (
    <>
      {isLoading ? (
        <Loading loading={isLoading} />
      ) : (
        <Layout>
          <Hero />
          <BestSellers products={popularProducts} />
          <WhyChooseUs />
          <CustomerReviews />
          <InstagramFeed />
        </Layout>
      )}
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { cookies } = context.req;
  const { query, _id } = context.query;

  const [data, attributes] = await Promise.all([
    ProductServices.getShowingStoreProducts({
      category: _id ? _id : "",
      title: query ? query : "",
    }),

    AttributeServices.getShowingAttributes(),
  ]);

  // Serialize data to remove undefined values (replace with null)
  const serializedAttributes = attributes ? JSON.parse(JSON.stringify(attributes)) : [];
  const serializedPopularProducts = data?.popularProducts ? JSON.parse(JSON.stringify(data.popularProducts)) : [];
  const serializedDiscountProducts = data?.discountedProducts ? JSON.parse(JSON.stringify(data.discountedProducts)) : [];

  return {
    props: {
      attributes: serializedAttributes,
      cookies: cookies || null,
      popularProducts: serializedPopularProducts,
      discountProducts: serializedDiscountProducts,
    },
  };
};

export default Home;
