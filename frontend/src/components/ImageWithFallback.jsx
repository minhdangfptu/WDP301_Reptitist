import React, { useState } from 'react';
import '../css/ImageWithFallback.css';

const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackSrc = '/default-avatar.png', 
  className = '', 
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src || fallbackSrc);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
    }
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      onError={handleError}
      className={`image-with-fallback ${className}`}
      {...props}
    />
  );
};

export default ImageWithFallback; 