import React, { useState, useRef, useEffect } from 'react';
import { Box } from '@mui/material';

const DraggableVisualization = ({ 
  children, 
  visualization, 
  onPositionChange,
  onSizeChange,
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 400, height: 300 },
  currentZoomLevel = 1
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(visualization.size || { width: 400, height: 300 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Update size when visualization changes
  useEffect(() => {
    if (visualization.size && visualization.size !== size) {
      setSize(visualization.size);
    }
  }, [visualization.size, size]);

  // Drag handlers
  const handleMouseDown = (e) => {
    // Agar button, input yoki select bo'lsa, drag qilmaslik
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('select')) {
      return;
    }

    setIsDragging(true);
    
    const rect = containerRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const parentRect = containerRef.current?.parentElement?.getBoundingClientRect();
    if (!parentRect) return;

    // Zoom scale'ni hisobga olish
    const scaleFactor = 1 / currentZoomLevel;

    const newX = (e.clientX - parentRect.left - dragOffset.x) * scaleFactor;
    const newY = (e.clientY - parentRect.top - dragOffset.y) * scaleFactor;

    // Chegaralarni olib tashlash - visual hamma joyga borishi mumkin
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(visualization.id, position);
    }
  };

  // Mouse leave container
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      onPositionChange(visualization.id, position);
    }
  };

  // Global mouse events for better drag handling
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (isDragging) {
        const parentRect = containerRef.current?.parentElement?.getBoundingClientRect();
        if (!parentRect) return;

        // Zoom scale'ni hisobga olish
        const scaleFactor = 1 / currentZoomLevel;

        const newX = (e.clientX - parentRect.left - dragOffset.x) * scaleFactor;
        const newY = (e.clientY - parentRect.top - dragOffset.y) * scaleFactor;

        setPosition({ x: newX, y: newY });
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onPositionChange(visualization.id, position);
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragOffset, onPositionChange, visualization.id, position]);

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: `${size.width}px`,
        height: `${size.height}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isDragging ? 1000 : 1,
        userSelect: 'none',
        '&:hover': {
          cursor: 'grab'
        }
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Content - Visual va title bitta div'da */}
      {children}
    </Box>
  );
};

export default DraggableVisualization;
