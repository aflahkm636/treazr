import React, { useState, useEffect } from "react";

const ImageBanner = () => {
  const images = [
    "https://cdn.pixabay.com/photo/2015/08/20/11/40/datsun-897300_1280.jpg",
    "https://cdn.pixabay.com/photo/2016/07/30/15/44/toy-car-1557373_1280.jpg",
    "https://cdn.pixabay.com/photo/2021/03/10/10/22/model-car-6084175_1280.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextIndex((currentIndex + 1) % images.length);
      setIsTransitioning(true);
      
      // Reset after transition completes
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setIsTransitioning(false);
      }, 1000); // Match this with your CSS transition duration
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex, images.length, nextIndex]);

  return (
    <div className="relative w-full h-64 overflow-hidden">
      {/* Current Image */}
      <img
        src={images[currentIndex]}
        alt="banner"
        className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      />
      
      {/* Next Image (loading during transition) */}
      <img
        src={images[nextIndex]}
        alt="banner"
        className={`absolute w-full h-full object-cover transition-opacity duration-1000 ${
          isTransitioning ? "opacity-100" : "opacity-0"
        }`}
      />
      
     
    </div>
  );
};

export default ImageBanner;