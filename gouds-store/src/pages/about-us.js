import React from "react";
import Image from "next/image";

//internal import
import Layout from "@layout/Layout";
import useGetSetting from "@hooks/useGetSetting";
import PageHeader from "@components/header/PageHeader";
import CMSkeleton from "@components/preloader/CMSkeleton";
import useUtilsFunction from "@hooks/useUtilsFunction";

const AboutUs = () => {
  const { storeCustomizationSetting, loading, error } = useGetSetting();
  const { showingTranslateValue } = useUtilsFunction();

  return (
    <Layout title="About Us" description="This is about us page">
      <PageHeader
        headerBg={storeCustomizationSetting?.about_us?.header_bg}
        title={showingTranslateValue(
          storeCustomizationSetting?.about_us?.title
        )}
      />

      <div className="bg-white">
        <div className="max-w-screen-2xl mx-auto lg:py-20 py-10 px-4 sm:px-10">
          <div className="grid grid-flow-row lg:grid-cols-2 gap-4 lg:gap-16 items-center">
            <div className="">
              <h3 className="text-xl lg:text-3xl mb-2 font-serif font-semibold">
                {/* {t("common:about-section-title")} */}

                <CMSkeleton
                  count={1}
                  height={50}
                  loading={loading}
                  data={storeCustomizationSetting?.about_us?.top_title}
                />
              </h3>
              <div className="mt-3 text-base opacity-90 leading-7">
                <p>
                  <CMSkeleton
                    count={5}
                    height={20}
                    loading={loading}
                    data={storeCustomizationSetting?.about_us?.top_description}
                  />
                </p>
              </div>
              <div className="grid md:grid-cols-2 gap-6 lg:grid-cols-2 xl:gap-6 mt-8">
                <div className="p-8 bg-indigo-50 shadow-sm rounded-lg">
                  {loading ? (
                    <CMSkeleton
                      count={8}
                      height={20}
                      error={error}
                      loading={loading}
                    />
                  ) : (
                    <>
                      <span className="text-3xl block font-extrabold font-serif mb-4 text-gray-800">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us?.card_two_title
                        )}
                      </span>
                      <h4 className="text-lg font-serif font-bold mb-1">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us?.card_two_sub
                        )}
                      </h4>
                      <p className="mb-0 opacity-90 leading-7">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us
                            ?.card_two_description
                        )}
                      </p>
                    </>
                  )}
                </div>
                <div className="p-8 bg-indigo-50 shadow-sm rounded-lg">
                  {loading ? (
                    <CMSkeleton
                      count={8}
                      height={20}
                      error={error}
                      loading={loading}
                    />
                  ) : (
                    <>
                      <span className="text-3xl block font-extrabold font-serif mb-4 text-gray-800">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us?.card_one_title
                        )}
                      </span>
                      <h4 className="text-lg font-serif font-bold mb-1">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us?.card_one_sub
                        )}
                      </h4>
                      <p className="mb-0 opacity-90 leading-7">
                        {showingTranslateValue(
                          storeCustomizationSetting?.about_us
                            ?.card_one_description
                        )}
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-10 lg:mt-0">
              <img
                width={920}
                height={750}
                src={
                  storeCustomizationSetting?.about_us?.content_right_img ||
                  "/about-us.jpg"
                }
                alt="logo"
              />
            </div>
          </div>
          <div className="mt-10 lg:mt-16 text-base opacity-90 leading-7">
            <p>
              <CMSkeleton
                count={5}
                height={20}
                loading={loading}
                data={
                  storeCustomizationSetting?.about_us?.middle_description_one
                }
              />
            </p>

            <p>
              <CMSkeleton
                count={8}
                height={20}
                error={error}
                loading={loading}
                data={
                  storeCustomizationSetting?.about_us?.middle_description_two
                }
              />
            </p>
          </div>
          <div className="mt-10 lg:mt-12 flex flex-col sm:grid gap-4">
            <Image
              width={1920}
              height={570}
              src={
                storeCustomizationSetting?.about_us?.content_middle_Img ||
                "/about-banner.jpg"
              }
              alt="logo"
              className="block rounded-lg"
            />
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default AboutUs;
