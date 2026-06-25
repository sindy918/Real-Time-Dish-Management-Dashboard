import React from 'react';

export default function DishCard({ dish, onToggle, isToggling, isFlash }) {
  const { dish_id, dish_name, image_url, is_published } = dish;

  const handleToggleChange = () => {
    onToggle(dish_id, is_published);
  };

  return (
    <div className={`dish-card ${isFlash ? 'flash-update' : ''}`}>
      <span className={`card-badge ${is_published ? 'published' : 'hidden'}`}>
        {is_published ? 'Published' : 'Hidden'}
      </span>
      
      <div className="dish-image-wrapper">
        <img 
          src={image_url} 
          alt={dish_name} 
          className="dish-image"
          onError={(e) => {
            // Fallback image if Unsplash fails to load
            e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop';
          }}
        />
      </div>

      <div className="dish-details">
        <div className="dish-header-info">
          <span className="dish-id">ID: {dish_id}</span>
          <h3 className="dish-name" title={dish_name}>{dish_name}</h3>
        </div>

        <div className="dish-action-row">
          <span className="status-label-text">
            {is_published ? 'Visible in menu' : 'Hidden from menu'}
          </span>
          <label className={`switch ${isToggling ? 'loading' : ''}`}>
            <input 
              type="checkbox" 
              checked={is_published}
              onChange={handleToggleChange}
              disabled={isToggling}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>
    </div>
  );
}
