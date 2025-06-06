import React from 'react';
import './BannerScroller.css';

const images = [
  'https://via.placeholder.com/300x150?text=Banner+1',
  'https://via.placeholder.com/300x150?text=Banner+2',
  'https://via.placeholder.com/300x150?text=Banner+3',
  'https://via.placeholder.com/300x150?text=Banner+4',
  'https://via.placeholder.com/300x150?text=Banner+5',
  'https://via.placeholder.com/300x150?text=Banner+6',
];

const BannerScroller = () => {
  return (
    <div className="banner-container">
      <div className="banner-track-wrapper">
        <div className="banner-track">
          {[...images, ...images].map((src, index) => (
            <div className="banner-card" key={index}>
              <img src={src} alt={`banner-${index}`} className="banner-img" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannerScroller;
