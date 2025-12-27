import React from "react";
import { Helmet } from "react-helmet";

const PageTitle = ({ title, description }) => {
  return (
    <Helmet>
      <title>
        {" "}
        {title
          ? `${title} |  Admin Dashboard`
          : "Gouds | Admin Dashboard"}
      </title>
      <meta
        name="description"
        content={
          description
            ? ` ${description} `
            : "Gouds :  Admin Dashboard"
        }
      />
    </Helmet>
  );
};

export default PageTitle;
