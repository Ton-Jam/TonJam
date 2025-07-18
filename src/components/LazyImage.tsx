import React, { useState, useEffect } from "react";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({ src, alt, className, style, onClick }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => setLoaded(true);
  }, [src]);

  return (
    <>
      {!loaded && (
        <div className={`lazy-placeholder ${className}`} style={style} />
      )}
      {loaded && (
        <img src={src} alt={alt} className={className} style={style} onClick={onClick} />
      )}
    </>
  );
};

export default LazyImage;
