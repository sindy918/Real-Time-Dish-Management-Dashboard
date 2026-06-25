import React from 'react';
import DishCard from './DishCard';

export default function DishGrid({ 
  dishes, 
  onToggle, 
  togglingDishes, 
  flashDishes 
}) {
  if (dishes.length === 0) {
    return (
      <div className="empty-state">
        <span className="empty-icon">🍳</span>
        <h3 className="empty-text">No dishes found matching your criteria.</h3>
      </div>
    );
  }

  return (
    <div className="dishes-grid">
      {dishes.map((dish) => (
        <DishCard
          key={dish.dish_id}
          dish={dish}
          onToggle={onToggle}
          isToggling={togglingDishes.has(dish.dish_id)}
          isFlash={flashDishes.has(dish.dish_id)}
        />
      ))}
    </div>
  );
}
