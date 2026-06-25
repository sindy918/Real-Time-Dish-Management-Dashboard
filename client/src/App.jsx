import React, { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import Stats from './components/Stats';
import SearchFilter from './components/SearchFilter';
import DishGrid from './components/DishGrid';

const API_BASE_URL = 'http://localhost:5000';

export default function App() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Interactive states
  const [togglingDishes, setTogglingDishes] = useState(new Set());
  const [flashDishes, setFlashDishes] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);

  // 1. Fetch initial dishes
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/dishes`);
        if (!response.ok) {
          throw new Error('Failed to fetch dishes from server');
        }
        const data = await response.json();
        setDishes(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dishes:', err);
        setError('Could not connect to the backend server. Please check if the server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, []);

  // 2. Setup Socket.io connection for real-time synchronization
  useEffect(() => {
    const socket = io(API_BASE_URL);

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket.io connected to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket.io disconnected from server');
    });

    // Handle real-time dish status changes
    socket.on('dishUpdated', (updatedDish) => {
      console.log('Received real-time update:', updatedDish);
      
      // Update dish in local state
      setDishes((prevDishes) =>
        prevDishes.map((dish) =>
          dish.dish_id === updatedDish.dish_id ? updatedDish : dish
        )
      );

      // Trigger visual flash highlight
      setFlashDishes((prev) => {
        const next = new Set(prev);
        next.add(updatedDish.dish_id);
        return next;
      });

      // Clear flash highlight after 1.5 seconds
      setTimeout(() => {
        setFlashDishes((prev) => {
          const next = new Set(prev);
          next.delete(updatedDish.dish_id);
          return next;
        });
      }, 1500);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // 3. Handle status toggle with optimistic updates and fallback
  const handleToggle = async (dishId, currentStatus) => {
    // Prevent double submissions
    if (togglingDishes.has(dishId)) return;

    // A. Optimistic UI update: Immediately update state in UI
    setDishes((prevDishes) =>
      prevDishes.map((dish) =>
        dish.dish_id === dishId ? { ...dish, is_published: !currentStatus } : dish
      )
    );

    // Track that this dish is currently saving to the backend
    setTogglingDishes((prev) => {
      const next = new Set(prev);
      next.add(dishId);
      return next;
    });

    try {
      // B. Send PATCH request to backend
      const response = await fetch(`${API_BASE_URL}/api/dishes/${dishId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update dish status on the server');
      }

      // C. Success - we will wait for Socket.io or direct response to confirm.
      // (Optimistic update is already visible to the user)
      const updatedDish = await response.json();
      
      // Ensure local state matches server response just in case
      setDishes((prevDishes) =>
        prevDishes.map((dish) =>
          dish.dish_id === dishId ? updatedDish : dish
        )
      );
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Error updating status. Reverting changes.');

      // D. Rollback: If API fails, revert the state back to original
      setDishes((prevDishes) =>
        prevDishes.map((dish) =>
          dish.dish_id === dishId ? { ...dish, is_published: currentStatus } : dish
        )
      );
    } finally {
      // Done toggling
      setTogglingDishes((prev) => {
        const next = new Set(prev);
        next.delete(dishId);
        return next;
      });
    }
  };

  // 4. Calculate Stats
  const stats = useMemo(() => {
    const total = dishes.length;
    const published = dishes.filter((d) => d.is_published).length;
    const hidden = total - published;
    return { total, published, hidden };
  }, [dishes]);

  // 5. Filter and Search Dishes
  const filteredDishes = useMemo(() => {
    return dishes.filter((dish) => {
      const matchesSearch = dish.dish_name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterStatus === 'all' ||
        (filterStatus === 'published' && dish.is_published) ||
        (filterStatus === 'hidden' && !dish.is_published);

      return matchesSearch && matchesFilter;
    });
  }, [dishes, searchQuery, filterStatus]);

  return (
    <div className="app-container">
      {/* Dashboard Header */}
      <header className="dashboard-header">
        <div className="brand-section">
          <span className="brand-logo">🍳</span>
          <h1 className="brand-title">Dish Dashboard</h1>
        </div>
        
        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
          <span>{isConnected ? 'Real-Time Sync Active' : 'Disconnected'}</span>
        </div>
      </header>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '1rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          textAlign: 'center',
          fontWeight: '500'
        }}>
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div className="dashboard-loader">
          <div className="spinner"></div>
          <span className="loading-text">Loading delicious dishes...</span>
        </div>
      ) : (
        <>
          {/* Analytics Stats */}
          <Stats 
            total={stats.total} 
            published={stats.published} 
            hidden={stats.hidden} 
          />

          {/* Controls: Search and Filters */}
          <SearchFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
          />

          {/* Dishes Grid */}
          <DishGrid
            dishes={filteredDishes}
            onToggle={handleToggle}
            togglingDishes={togglingDishes}
            flashDishes={flashDishes}
          />
        </>
      )}
    </div>
  );
}
