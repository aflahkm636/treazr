import React, { useState, useEffect } from "react";

const ImageBanner = () => {
  const images = [
    "https://cdn.pixabay.com/photo/2015/08/20/11/40/datsun-897300_1280.jpg",
    "https://cdn.pixabay.com/photo/2016/07/30/15/44/toy-car-1557373_1280.jpg",
    "https://cdn.pixabay.com/photo/2021/03/10/10/22/model-car-6084175_1280.jpg",
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 2000); // every 2 seconds

    return () => clearInterval(interval); // cleanup
  }, [images.length]);

  return (
    <div>
      <img
        src={images[index]}
        alt="banner"
        className="w-full h-80 object-cover transition-opacity duration-500"
      />
    </div>
  );
};

export default ImageBanner;
