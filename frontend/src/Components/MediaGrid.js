import React, { useState } from 'react';
import { formatDate, formatFileSize } from '../lib/chatUtils';

const MediaGrid = ({ items, type, onOpenItem }) => {
  const [lightboxImage, setLightboxImage] = useState(null);

  if (!items || items.length === 0) {
    return (
      <div className="media-grid-empty">
        <div className="empty-icon">
          {type === 'photo' && <i className="pi pi-image"></i>}
          {type === 'video' && <i className="pi pi-video"></i>}
          {type === 'file' && <i className="pi pi-file"></i>}
        </div>
        <p className="empty-text">
          {type === 'photo' && 'No photos shared yet'}
          {type === 'video' && 'No videos shared yet'}
          {type === 'file' && 'No files shared yet'}
        </p>
      </div>
    );
  }

  const handleItemClick = (item) => {
    if (type === 'photo') {
      setLightboxImage(item);
    } else if (type === 'video') {
      onOpenItem && onOpenItem(item);
    } else {
      // Download file
      const link = document.createElement('a');
      link.href = item.url;
      link.download = item.name;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  return (
    <div className="media-grid-container">
      <div className="media-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className="media-item"
            onClick={() => handleItemClick(item)}
          >
            {type === 'photo' && (
              <div className="media-photo">
                <img
                  src={item.thumbUrl || item.url}
                  alt={item.name}
                  loading="lazy"
                />
                <div className="media-overlay">
                  <i className="pi pi-eye"></i>
                </div>
              </div>
            )}

            {type === 'video' && (
              <div className="media-video">
                <img
                  src={item.thumbUrl || item.url}
                  alt={item.name}
                  loading="lazy"
                />
                <div className="media-overlay">
                  <i className="pi pi-play"></i>
                </div>
                <div className="video-duration">
                  {/* You could add duration here if available */}
                </div>
              </div>
            )}

            {type === 'file' && (
              <div className="media-file">
                <div className="file-icon">
                  <i className="pi pi-file"></i>
                </div>
                <div className="file-info">
                  <div className="file-name" title={item.name}>
                    {item.name}
                  </div>
                  <div className="file-size">
                    {formatFileSize(item.size)}
                  </div>
                </div>
                <div className="download-icon">
                  <i className="pi pi-download"></i>
                </div>
              </div>
            )}

            <div className="media-meta">
              <span className="media-date">
                {formatDate(item.createdAt)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox for images */}
      {lightboxImage && (
        <div className="lightbox" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <i className="pi pi-times"></i>
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name}
              className="lightbox-image"
            />
            <div className="lightbox-info">
              <h3>{lightboxImage.name}</h3>
              <p>{formatDate(lightboxImage.createdAt)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Video modal */}
      {type === 'video' && (
        <div className="video-modal" style={{ display: 'none' }}>
          <video controls>
            <source src="" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
    </div>
  );
};

export default MediaGrid;
