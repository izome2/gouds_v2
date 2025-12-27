const { default: Image } = require("next/image");
const { useEffect, useState } = require("react");

const fallbackImage =
  "https://res.cloudinary.com/ahossain/image/upload/v1655097002/placeholder_kvepfp.png";

const ImageWithFallback = ({
  fallback = fallbackImage,
  alt,
  src,
  width = 100, // Set default width
  height = 100, // Set default height
  ...props
}) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    setError(null);
  }, [src]);

  return (
    <div className="overflow-hidden rounded-lg"> {/* Apply rounded corners here */}
      <Image
        alt={alt}
        onError={setError}
        src={error ? fallbackImage : src}
        {...props}
        width={width}
        height={height}
        className="object-cover w-full h-full transition duration-150 ease-linear transform group-hover:scale-105"
      />
    </div>
  );
};

export default ImageWithFallback;