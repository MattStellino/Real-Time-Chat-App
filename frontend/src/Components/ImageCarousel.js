import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'primereact/button';

const ImageCarousel = ({ images, currentIndex, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);

  // Update current index when prop changes
  useEffect(() => {
    setCurrentImageIndex(currentIndex);
  }, [currentIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft') {
      goToPrevious();
    } else if (e.key === 'ArrowRight') {
      goToNext();
    }
  }, [currentImageIndex, images.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!images || images.length === 0) return null;

  const currentImage = images[currentImageIndex];

  return (
    <div className="image-carousel-overlay" onClick={handleBackdropClick}>
      <div className="image-carousel-container">
        {/* Close button */}
        <Button
          icon="pi pi-times"
          className="image-carousel-close"
          onClick={onClose}
          aria-label="Close carousel"
        />

        {/* Navigation buttons */}
        {images.length > 1 && (
          <>
            <Button
              icon="pi pi-chevron-left"
              className="image-carousel-nav image-carousel-prev"
              onClick={goToPrevious}
              aria-label="Previous image"
            />
            <Button
              icon="pi pi-chevron-right"
              className="image-carousel-nav image-carousel-next"
              onClick={goToNext}
              aria-label="Next image"
            />
          </>
        )}

        {/* Main image */}
        <div className="image-carousel-main">
          <img
            src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${currentImage.url}`}
            alt={currentImage.filename || 'Chat image'}
            className="image-carousel-image"
          />
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="image-carousel-counter">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="image-carousel-thumbnails">
            {images.map((image, index) => (
              <img
                key={index}
                src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${image.url}`}
                alt={`Thumbnail ${index + 1}`}
                className={`image-carousel-thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => setCurrentImageIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCarousel;
