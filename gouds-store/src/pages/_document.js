import SettingServices from "@services/SettingServices";
import Document, { Html, Head, Main, NextScript } from "next/document";
import { FB_PIXEL_ID } from "../lib/fpixel";
class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);

    // Fetch general metadata from backend API
    const setting = await SettingServices.getStoreSeoSetting();

    return { ...initialProps, setting };
  }

  render() {
    const setting = this.props.setting;
    return (
      <Html lang="en">
        <Head>
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
          <link rel="icon" href={setting?.favicon || "/favicon.png"} />
          {/* Google Fonts - Poppins, Inter, Playfair Display */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Almarai:wght@400;700;800&family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Poppins:wght@300;400;500;600;700;800&display=swap"
            rel="stylesheet"
          />
          <meta
            property="og:title"
            content={
              setting?.meta_title ||
              "Gouds - Store | Pieces of love"
            }
          />
          <meta property="og:type" content="eCommerce Website" />
          <meta
            property="og:description"
            content={
              setting?.meta_description ||
              "Gouds - Store | Pieces of love"
            }
          />
          <meta
            name="keywords"
            content={setting?.meta_keywords || "Gouds - Store | Pieces of love"}
          />
          <meta
            property="og:url"
            content={
              setting?.meta_url || "https://gouds-eg.shop/"
            }
          />
          <meta
            property="og:image"
            content={
              setting?.meta_img ||
              "https://res.cloudinary.com/dj75l70ph/image/upload/v1741550944/undefined/Screenshot2025-03-09at10.08.59PM.png"
            }
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
