
import Head from "next/head";
import { ToastContainer } from "react-toastify";

//internal import

import Navbar from "@layout/navbar/Navbar";
import Footer from "@layout/footer/Footer";
import MobileFooter from "@layout/footer/MobileFooter";
import FacebookPixel from "@components/FacebookPixel";

const Layout = ({ title, description, children }) => {
  return (
    <>
      <ToastContainer />
      <div className="font-sans">
        <Head>
          <title>
            {title
              ? `Gouds | ${title}`
              : "Gouds | PIECES OF LOVE"}
          </title>
          {description && <meta name="description" content={description} />}
          <link ref="icon" href="/favicon.png" />
        </Head>
        {/* <NavBarTop /> */}
        <Navbar />
        <main className="bg-cream-50 min-h-screen">{children}</main>
        
        {/* Desktop Footer */}
        <div className="hidden lg:block">
          <Footer />
        </div>
        
        {/* Mobile Footer Navigation */}
        <MobileFooter />
        
        <FacebookPixel />
      </div>
    </>
  );
};

export default Layout;
