import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Divider,
  Zoom,
  Button
} from '@mui/material';
import {
  DragIndicator as DragIcon,
  Link as LinkIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  VisibilityOff as HideIcon
} from '@mui/icons-material';

const DragDropRelationshipBuilder = ({ 
  datasets, 
  relationships, 
  onRelationshipCreate, 
  onRelationshipDelete,
  onRelationshipToggle 
}) => {
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [hoveredRelationship, setHoveredRelationship] = useState(null);
  const [draggedDataset, setDraggedDataset] = useState(null);
  const [datasetPositions, setDatasetPositions] = useState({});
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [showRelationshipList, setShowRelationshipList] = useState(false);
  const [relationshipModal, setRelationshipModal] = useState({
    open: false,
    sourceColumn: null,
    sourceDataset: null,
    targetColumn: null,
    targetDataset: null
  });
  const canvasRef = useRef(null);
  const datasetRefs = useRef({});
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Auto zoom when datasets change
  useEffect(() => {
    if (datasets.length > 0) {
      // Small delay to ensure canvas is rendered
      const timer = setTimeout(() => {
        handleAutoZoom();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [datasets.length]);

  // Auto zoom when dataset positions change significantly
  useEffect(() => {
    if (datasets.length > 0 && Object.keys(datasetPositions).length > 0) {
      // Debounce auto zoom to avoid excessive calls
      const timer = setTimeout(() => {
        handleAutoZoom();
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [datasetPositions, datasets.length]);

  // Handle drag start
  const handleDragStart = (e, column, dataset) => {
    console.log('🔍 handleDragStart called:', { column, dataset: dataset.name });
    console.log('🔍 Event details:', { 
      target: e.target.tagName, 
      currentTarget: e.currentTarget.tagName,
      type: e.type 
    });
    
    // Set dragged column for relationship creation
    setDraggedColumn({ column, dataset });
    e.dataTransfer.effectAllowed = 'link';
    e.dataTransfer.setData('text/plain', JSON.stringify({ column, dataset }));
    
    console.log('✅ draggedColumn set:', { column, dataset: dataset.name });
    console.log('✅ dataTransfer set:', e.dataTransfer.getData('text/plain'));
    
    // Don't set dragOffset for column drag - only for dataset drag
    // This prevents dataset from moving when dragging columns
  };

  // Handle drag over
  const handleDragOver = (e, column, dataset) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'link';
    
    // Only update if it's a different column or dataset
    const newDragOver = { column, dataset };
    if (JSON.stringify(dragOverColumn) !== JSON.stringify(newDragOver)) {
      setDragOverColumn(newDragOver);
      console.log('🔍 DragOver:', { column, dataset: dataset.name });
      
      // Visual feedback for valid drop target
      if (draggedColumn && draggedColumn.dataset._id !== dataset._id) {
        console.log('🎯 Valid drop target detected!');
      }
    }
  };

  // Handle drop
  const handleDrop = (e, targetColumn, targetDataset) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🔍 handleDrop called:', { targetColumn, targetDataset: targetDataset.name });
    console.log('🔍 draggedColumn:', draggedColumn);
    console.log('🔍 Event details:', { 
      target: e.target.tagName, 
      currentTarget: e.currentTarget.tagName,
      type: e.type,
      dataTransfer: e.dataTransfer.getData('text/plain')
    });
    
    if (!draggedColumn || !targetColumn) {
      console.log('❌ Missing draggedColumn or targetColumn');
      return;
    }
    
    // Prevent self-relationships
    if (draggedColumn.dataset._id === targetDataset._id && 
        draggedColumn.column === targetColumn) {
      console.log('❌ Self-relationship prevented');
      return;
    }
    
    // Check if relationship already exists
    const exists = relationships.some(r => 
      (r.sourceDataset === draggedColumn.dataset._id && 
       r.sourceColumn === draggedColumn.column &&
       r.targetDataset === targetDataset._id && 
       r.targetColumn === targetColumn) ||
      (r.sourceDataset === targetDataset._id && 
       r.sourceColumn === targetColumn &&
       r.targetDataset === draggedColumn.dataset._id && 
       r.targetColumn === draggedColumn.column)
    );
    
    if (exists) {
      console.log('❌ Relationship already exists');
      return;
    }
    
    console.log('✅ Opening relationship modal...');
    console.log('🔗 From:', `${draggedColumn.dataset.name}.${draggedColumn.column}`);
    console.log('🔗 To:', `${targetDataset.name}.${targetColumn}`);
    
    // Open relationship modal instead of creating directly
    setRelationshipModal({
      open: true,
      sourceColumn: draggedColumn.column,
      sourceDataset: draggedColumn.dataset,
      targetColumn: targetColumn,
      targetDataset: targetDataset
    });
    
    // Clear drag states
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // Handle drag end
  const handleDragEnd = () => {
    console.log('🔍 handleDragEnd called');
    console.log('🔍 draggedColumn at dragEnd:', draggedColumn);
    
    // Re-enable dataset drag for all datasets
    const datasetElements = document.querySelectorAll('[data-dataset-id]');
    datasetElements.forEach(element => {
      element.setAttribute('draggable', 'true');
      // Also re-enable header drag
      const headerElement = element.querySelector('[draggable]');
      if (headerElement) {
        headerElement.setAttribute('draggable', 'true');
      }
    });
    
    // Don't clear draggedColumn here - let handleDrop handle it
    // setDraggedColumn(null);
    setDragOverColumn(null);
  };

  // Get relationship type label
  const getRelationshipTypeLabel = (type) => {
    switch (type) {
      case 'one-to-one': return '1:1';
      case 'one-to-many': return '1:N';
      case 'many-to-one': return 'N:1';
      case 'many-to-many': return 'N:N';
      default: return type;
    }
  };

  // Get relationship color
  const getRelationshipColor = (type) => {
    switch (type) {
      case 'one-to-one': return '#4caf50';
      case 'one-to-many': return '#2196f3';
      case 'many-to-one': return '#ff9800';
      case 'many-to-many': return '#f44336';
      default: return '#666';
    }
  };

  // Set dataset ref for positioning
  const setDatasetRef = (datasetId, ref) => {
    if (ref) {
      datasetRefs.current[datasetId] = ref;
    }
  };

  // Handle dataset drag start
  const handleDatasetDragStart = (e, dataset) => {
    setDraggedDataset(dataset);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'dataset', dataset }));
    
    // Calculate drag offset (mouse position relative to box)
    const boxRect = e.currentTarget.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    
    if (canvasRect) {
      const offsetX = e.clientX - boxRect.left;
      const offsetY = e.clientY - boxRect.top;
      
      setDragOffset({ x: offsetX, y: offsetY });
    }
  };

  // Handle dataset drag end
  const handleDatasetDragEnd = () => {
    setDraggedDataset(null);
    setDragOffset({ x: 0, y: 0 }); // Reset offset
  };

  // Handle dataset drop
  const handleDatasetDrop = (e, targetDataset) => {
    e.preventDefault();
    
    if (!draggedDataset || draggedDataset._id === targetDataset._id) return;
    
    // Calculate new position based on drop location
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Apply drag offset and account for zoom/pan
    const adjustedOffsetX = dragOffset.x / zoomLevel;
    const adjustedOffsetY = dragOffset.y / zoomLevel;
    
    const dropX = (e.clientX - canvasRect.left - panOffset.x) / zoomLevel - adjustedOffsetX;
    const dropY = (e.clientY - canvasRect.top - panOffset.y) / zoomLevel - adjustedOffsetY;
    
    setDatasetPositions(prev => ({
      ...prev,
      [draggedDataset._id]: { x: dropX, y: dropY }
    }));
    
    setDraggedDataset(null);
    setDragOffset({ x: 0, y: 0 }); // Reset offset
  };

  // Handle canvas drop (when dropping on empty space)
  const handleCanvasDrop = (e) => {
    e.preventDefault();
    
    if (!draggedDataset) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Apply drag offset and account for zoom/pan
    const adjustedOffsetX = dragOffset.x / zoomLevel;
    const adjustedOffsetY = dragOffset.y / zoomLevel;
    
    const dropX = (e.clientX - canvasRect.left - panOffset.x) / zoomLevel - adjustedOffsetX;
    const dropY = (e.clientY - canvasRect.top - panOffset.y) / zoomLevel - adjustedOffsetY;
    
    setDatasetPositions(prev => ({
      ...prev,
      [draggedDataset._id]: { x: dropX, y: dropY }
    }));
    
    setDraggedDataset(null);
    setDragOffset({ x: 0, y: 0 }); // Reset offset
  };

  // Zoom functions
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3)); // Max 3x zoom
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.3)); // Min 0.3x zoom
  };

  const handleZoomReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Auto zoom to fit all datasets
  const handleAutoZoom = () => {
    if (datasets.length === 0) return;
    
    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;
    
    // Calculate bounding box of all datasets
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    datasets.forEach((dataset, index) => {
      const position = datasetPositions[dataset._id] || { 
        x: (index % 3) * 320, 
        y: Math.floor(index / 3) * 520 
      };
      
      // Dataset box dimensions (including maxWidth and maxHeight)
      const boxWidth = 300; // maxWidth
      const boxHeight = 500; // maxHeight
      
      minX = Math.min(minX, position.x);
      minY = Math.min(minY, position.y);
      maxX = Math.max(maxX, position.x + boxWidth);
      maxY = Math.max(maxY, position.y + boxHeight);
    });
    
    // Add padding for better visibility
    const padding = 80;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    // Calculate required zoom and pan
    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    const canvasWidth = canvasRect.width - 120; // Account for padding
    const canvasHeight = canvasRect.height - 120;
    
    // Calculate zoom level to fit content
    const zoomX = canvasWidth / contentWidth;
    const zoomY = canvasHeight / contentHeight;
    const newZoomLevel = Math.min(zoomX, zoomY, 1); // Don't zoom in beyond 100%
    
    // Ensure minimum zoom level for readability
    const finalZoomLevel = Math.max(newZoomLevel, 0.2);
    
    // Calculate pan offset to center content
    const newPanOffsetX = (canvasWidth - contentWidth * finalZoomLevel) / 2 - minX * finalZoomLevel;
    const newPanOffsetY = (canvasHeight - contentHeight * finalZoomLevel) / 2 - minY * finalZoomLevel;
    
    setZoomLevel(finalZoomLevel);
    setPanOffset({ x: newPanOffsetX, y: newPanOffsetY });
  };

  // Pan functions
  const handleMouseDown = (e) => {
    // Only handle pan on canvas, not on dataset boxes
    if (e.target === canvasRef.current || e.target.closest('[data-canvas]')) {
      if (e.button === 1 || e.button === 2) return; // Middle or right click
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (!isPanning) return;
    
    const deltaX = e.clientX - lastPanPoint.x;
    const deltaY = e.clientY - lastPanPoint.y;
    
    setPanOffset(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
    
    setLastPanPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoomLevel(prev => Math.max(0.3, Math.min(3, prev * delta)));
    } else {
      // Pan with wheel
      setPanOffset(prev => ({
        x: prev.x - e.deltaX,
        y: prev.y - e.deltaY
      }));
    }
  };

  // Check if column is unique (potential primary key)
  const isColumnUnique = (dataset, column) => {
    if (!dataset || !dataset.rows) return false;
    const uniqueValues = new Set(dataset.rows.map(row => row[column]));
    return uniqueValues.size === dataset.rows.length;
  };

  // Detect relationship type between two columns
  const detectRelationshipType = (sourceDatasetId, sourceColumn, targetDatasetId, targetColumn) => {
    if (!sourceDatasetId || !sourceColumn || !targetDatasetId || !targetColumn) return null;
    
    const sourceDataset = datasets.find(d => d._id === sourceDatasetId);
    const targetDataset = datasets.find(d => d._id === targetDatasetId);
    
    if (!sourceDataset || !targetDataset) return null;
    
    // Get unique values for both columns
    const sourceValues = [...new Set(sourceDataset.rows.map(row => row[sourceColumn]))];
    const targetValues = [...new Set(targetDataset.rows.map(row => row[targetColumn]))];
    
    // Check if source column has unique values (potential primary key)
    const sourceIsUnique = sourceValues.length === sourceDataset.rows.length;
    
    // Check if target column has unique values (potential primary key)
    const targetIsUnique = targetValues.length === targetDataset.rows.length;
    
    // Determine relationship type
    if (sourceIsUnique && !targetIsUnique) {
      return 'one-to-many'; // Source is unique, target is not
    } else if (!sourceIsUnique && targetIsUnique) {
      return 'many-to-one'; // Source is not unique, target is unique
    } else if (sourceIsUnique && targetIsUnique) {
      return 'one-to-one'; // Both are unique
    } else {
      return 'many-to-many'; // Neither is unique
    }
  };

  // Get column type
  const getColumnType = (dataset, column) => {
    if (!dataset || !dataset.rows || dataset.rows.length === 0) return 'unknown';
    
    const sampleValues = dataset.rows.slice(0, 100).map(row => row[column]);
    const validValues = sampleValues.filter(val => val !== undefined && val !== null && val !== '');
    
    if (validValues.length === 0) return 'unknown';
    
    // Check for numeric values
    const numericCount = validValues.filter(val => !isNaN(parseFloat(val)) && isFinite(parseFloat(val))).length;
    if (numericCount / validValues.length > 0.7) return 'numeric';
    
    // Check for date patterns
    const datePatterns = [/^\d{4}-\d{2}-\d{2}$/, /^\d{2}\/\d{2}\/\d{4}$/];
    const dateCount = validValues.filter(val => 
      datePatterns.some(pattern => pattern.test(String(val)))
    ).length;
    if (dateCount / validValues.length > 0.6) return 'date';
    
    return 'categorical';
  };

  // Get column type color
  const getColumnTypeColor = (type) => {
    switch (type) {
      case 'numeric': return '#2196f3';
      case 'date': return '#4caf50';
      case 'categorical': return '#ff9800';
      default: return '#666';
    }
  };

  // Render dataset card
  const renderDatasetCard = (dataset) => (
    <Paper
      key={dataset._id}
      ref={(ref) => setDatasetRef(dataset._id, ref)}
      data-dataset-id={dataset._id}
      elevation={3}
      sx={{
        p: 1.5,
        mb: 1.5,
        minWidth: 240,
        maxWidth: 300,
        maxHeight: 500,
        backgroundColor: '#fff',
        border: '2px solid #e0e0e0',
        borderRadius: 2,
        overflow: 'auto',
        position: 'relative',
        transition: draggedDataset?._id === dataset._id ? 'none' : 'all 0.3s ease',
        '&:hover': {
          borderColor: '#1976d2',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }
      }}
    >
      {/* Dataset Header */}
      <Box 
        draggable={!draggedColumn} // Disable dataset drag when column is being dragged
        onDragStart={(e) => {
          // Only allow dataset drag if no column is being dragged
          if (!draggedColumn) {
            handleDatasetDragStart(e, dataset);
          } else {
            e.preventDefault(); // Prevent dataset drag when column is being dragged
          }
        }}
        onDragEnd={handleDatasetDragEnd}
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          mb: 1.5,
          cursor: 'move',
          p: 0.5,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: '#f5f5f5'
          }
        }}
      >
        <DragIcon sx={{ 
          color: '#1976d2', 
          fontSize: 16, 
          cursor: 'grab',
          '&:active': { cursor: 'grabbing' }
        }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1976d2', fontSize: '0.9rem' }}>
          {dataset.name}
        </Typography>
        <Chip 
          label={`${dataset.rows.length}q, ${dataset.columns.length}u`}
          size="small"
          variant="outlined"
          sx={{ ml: 'auto', fontSize: '0.7rem', height: '20px' }}
        />
      </Box>

      {/* Columns */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        {dataset.columns.map((column) => {
          const isUnique = isColumnUnique(dataset, column);
          const columnType = getColumnType(dataset, column);
          const columnTypeColor = getColumnTypeColor(columnType);
          
          return (
            <Box
              key={column}
              draggable
              onDragStart={(e) => {
                console.log('🎯 Column dragStart event triggered:', column);
                e.stopPropagation(); // Prevent event bubbling to dataset
                e.preventDefault(); // Prevent default drag behavior
                
                // Completely disable dataset drag for this dataset
                const datasetElement = e.currentTarget.closest('[data-dataset-id]');
                if (datasetElement) {
                  datasetElement.setAttribute('draggable', 'false');
                  // Also disable the header drag
                  const headerElement = datasetElement.querySelector('[draggable]');
                  if (headerElement) {
                    headerElement.setAttribute('draggable', 'false');
                  }
                }
                
                handleDragStart(e, column, dataset);
              }}
              onDragEnd={(e) => {
                console.log('🎯 Column dragEnd event triggered:', column);
                handleDragEnd(e);
              }}
              onDragOver={(e) => {
                console.log('🎯 Column dragOver event triggered:', column);
                handleDragOver(e, column, dataset);
              }}
              onDrop={(e) => {
                console.log('🎯 Column drop event triggered:', column);
                console.log('🎯 Drop event details:', e);
                console.log('🎯 Drop target:', e.target);
                console.log('🎯 Drop currentTarget:', e.currentTarget);
                console.log('🎯 Event type:', e.type);
                console.log('🎯 Event bubbles:', e.bubbles);
                console.log('🎯 Event cancelable:', e.cancelable);
                console.log('🎯 draggedColumn at drop:', draggedColumn);
                console.log('🎯 Dataset at drop:', dataset.name);
                e.preventDefault();
                e.stopPropagation();
                handleDrop(e, column, dataset);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                p: 0.75,
                borderRadius: 1,
                backgroundColor: dragOverColumn?.column === column && 
                               dragOverColumn?.dataset._id === dataset._id 
                               ? '#e3f2fd' : 'transparent',
                border: dragOverColumn?.column === column && 
                       dragOverColumn?.dataset._id === dataset._id 
                       ? '2px dashed #1976f3' : '1px solid #e0e0e0',
                cursor: 'grab',
                transition: 'all 0.2s ease',
                minHeight: '32px',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                  borderColor: '#1976d2'
                },
                '&:active': {
                  cursor: 'grabbing'
                }
              }}
            >
              <DragIcon sx={{ color: '#666', fontSize: 14 }} />
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                  {column}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                  <Chip
                    label={columnType}
                    size="small"
                    sx={{ 
                      backgroundColor: columnTypeColor,
                      color: 'white',
                      fontSize: '0.55rem',
                      height: '14px'
                    }}
                  />
                  {isUnique && (
                    <Chip
                      label="PK"
                      size="small"
                      sx={{ 
                        backgroundColor: '#4caf50',
                        color: 'white',
                        fontSize: '0.55rem',
                        height: '14px'
                      }}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );



  return (
    <Box sx={{ p: 1 }}>




      {/* Canvas */}
      <Box
        ref={canvasRef}
        data-canvas="true"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          console.log('🎯 Canvas drop event triggered');
          console.log('🎯 Canvas drop event details:', e);
          handleCanvasDrop(e);
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        sx={{
          position: 'relative',
          minHeight: '600px',
          backgroundColor: '#f8f9fa',
          border: '2px dashed #e0e0e0',
          borderRadius: 2,
          p: 3,
          overflow: 'hidden',
          cursor: isPanning ? 'grabbing' : 'grab',
          userSelect: 'none'
        }}
      >
        {/* Zoom Controls - Top Right Corner */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 1000,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
            p: 1,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <IconButton
              onClick={handleZoomOut}
              size="small"
              sx={{ 
                backgroundColor: '#f5f5f5',
                '&:hover': { backgroundColor: '#e0e0e0' },
                width: 28,
                height: 28
              }}
            >
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>-</Typography>
            </IconButton>
            
            <Typography variant="body2" sx={{ 
              minWidth: '40px', 
              textAlign: 'center',
              fontWeight: 600,
              color: '#1976d2',
              fontSize: '0.75rem'
            }}>
              {Math.round(zoomLevel * 100)}%
            </Typography>
            
            <IconButton
              onClick={handleZoomIn}
              size="small"
              sx={{ 
                backgroundColor: '#f5f5f5',
                '&:hover': { backgroundColor: '#e0e0e0' },
                width: 28,
                height: 28
              }}
            >
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 'bold' }}>+</Typography>
            </IconButton>
            
            <IconButton
              onClick={handleZoomReset}
              size="small"
              sx={{ 
                backgroundColor: '#e3f2fd',
                color: '#1976d2',
                '&:hover': { backgroundColor: '#bbdefb' },
                width: 28,
                height: 28
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Reset</Typography>
            </IconButton>
            
            <IconButton
              onClick={handleAutoZoom}
              size="small"
              sx={{ 
                backgroundColor: '#4caf50',
                color: 'white',
                '&:hover': { backgroundColor: '#45a049' },
                width: 28,
                height: 28
              }}
            >
              <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 'bold' }}>Fit All</Typography>
            </IconButton>
          </Box>
        </Box>

        {/* Relationship List Toggle - Top Left Corner */}
        <Box
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 1000
          }}
        >
          <IconButton
            onClick={() => setShowRelationshipList(!showRelationshipList)}
            size="small"
            sx={{ 
              backgroundColor: showRelationshipList ? '#1976d2' : '#f5f5f5',
              color: showRelationshipList ? 'white' : '#666',
              '&:hover': { 
                backgroundColor: showRelationshipList ? '#1565c0' : '#e0e0e0' 
              },
              width: 32,
              height: 32,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <LinkIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>

        {/* Relationship List Panel */}
        {showRelationshipList && (
          <Box
            sx={{
              position: 'absolute',
              top: 50,
              left: 10,
              zIndex: 1000,
              backgroundColor: 'rgba(255, 255, 255, 0.98)',
              borderRadius: 2,
              p: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: '1px solid #e0e0e0',
              minWidth: 300,
              maxHeight: 400,
              overflow: 'auto'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LinkIcon sx={{ color: '#1976d2', fontSize: 18 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#1976d2' }}>
                Relationships ({relationships.length})
              </Typography>
            </Box>
            
            {relationships.length === 0 ? (
              <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                Hali hech qanday bog'lanish yaratilmagan
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {relationships.map((relationship) => {
                  const sourceDataset = datasets.find(d => d._id === relationship.sourceDataset);
                  const targetDataset = datasets.find(d => d._id === relationship.targetDataset);
                  
                  return (
                    <Paper
                      key={relationship.id}
                      elevation={1}
                      sx={{
                        p: 1.5,
                        border: `2px solid ${getRelationshipColor(relationship.relationshipType)}`,
                        borderRadius: 1,
                        backgroundColor: '#fafafa'
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={getRelationshipTypeLabel(relationship.relationshipType)}
                          size="small"
                          sx={{
                            backgroundColor: getRelationshipColor(relationship.relationshipType),
                            color: 'white',
                            fontSize: '0.6rem',
                            height: '18px'
                          }}
                        />
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                          {new Date(relationship.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                        <strong>{sourceDataset?.name}.{relationship.sourceColumn}</strong>
                        <span style={{ color: '#666' }}> → </span>
                        <strong>{targetDataset?.name}.{relationship.targetColumn}</strong>
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => onRelationshipToggle(relationship.id)}
                          sx={{ 
                            width: 20, 
                            height: 20,
                            backgroundColor: relationship.visible !== false ? '#4caf50' : '#f44336',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: relationship.visible !== false ? '#45a049' : '#d32f2f'
                            }
                          }}
                        >
                          {relationship.visible !== false ? <ViewIcon fontSize="small" /> : <HideIcon fontSize="small" />}
                        </IconButton>
                        
                        <IconButton
                          size="small"
                          onClick={() => onRelationshipDelete(relationship.id)}
                          sx={{ 
                            width: 20, 
                            height: 20,
                            backgroundColor: '#f44336',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#d32f2f'
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Box>
        )}
        {/* SVG Canvas for Relationship Lines */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'auto',
            zIndex: 1,
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
            transformOrigin: '0 0'
          }}
        >
          {relationships.map((relationship) => {
            const sourceDataset = datasets.find(d => d._id === relationship.sourceDataset);
            const targetDataset = datasets.find(d => d._id === relationship.targetDataset);
            
            if (!sourceDataset || !targetDataset) return null;
            
            const sourceRef = datasetRefs.current[relationship.sourceDataset];
            const targetRef = datasetRefs.current[relationship.targetDataset];
            
            if (!sourceRef || !targetRef) return null;
            
            const sourceRect = sourceRef.getBoundingClientRect();
            const targetRect = targetRef.getBoundingClientRect();
            const canvasRect = canvasRef.current?.getBoundingClientRect();
            
            if (!canvasRect) return null;
            
            // Calculate positions relative to canvas
            const sourceX = sourceRect.left - canvasRect.left + sourceRect.width / 2;
            const sourceY = sourceRect.top - canvasRect.top + sourceRect.height / 2;
            const targetX = targetRect.left - canvasRect.left + targetRect.width / 2;
            const targetY = targetRect.top - canvasRect.top + targetRect.height / 2;
            
            // Calculate line path
            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;
            
            return (
              <g key={relationship.id}>
                {/* Main connection line */}
                <line
                  x1={sourceX}
                  y1={sourceY}
                  x2={targetX}
                  y2={targetY}
                  stroke={getRelationshipColor(relationship.relationshipType)}
                  strokeWidth="3"
                  strokeDasharray={relationship.visible !== false ? "none" : "5,5"}
                  opacity={hoveredRelationship === relationship.id ? 1 : 0.8}
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredRelationship(relationship.id)}
                  onMouseLeave={() => setHoveredRelationship(null)}
                  onClick={() => {
                    // Toggle relationship visibility
                    onRelationshipToggle(relationship.id);
                  }}
                />
                
                {/* Arrow head */}
                <polygon
                  points={`${targetX - 8},${targetY - 4} ${targetX},${targetY} ${targetX - 8},${targetY + 4}`}
                  fill={getRelationshipColor(relationship.relationshipType)}
                  opacity={hoveredRelationship === relationship.id ? 1 : 0.8}
                />
                
                {/* Relationship type label */}
                <rect
                  x={midX - 25}
                  y={midY - 15}
                  width="50"
                  height="30"
                  fill="white"
                  stroke={getRelationshipColor(relationship.relationshipType)}
                  strokeWidth="2"
                  rx="5"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    // Delete relationship
                    onRelationshipDelete(relationship.id);
                  }}
                />
                <text
                  x={midX}
                  y={midY + 5}
                  textAnchor="middle"
                  fontSize="12"
                  fontWeight="bold"
                  fill={getRelationshipColor(relationship.relationshipType)}
                  style={{ cursor: 'pointer', pointerEvents: 'none' }}
                >
                  {getRelationshipTypeLabel(relationship.relationshipType)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Datasets - Absolute Positioning for Drag & Move */}
        <Box sx={{ 
          position: 'relative',
          zIndex: 2,
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
          transformOrigin: '0 0'
        }}>
          {datasets.map((dataset, index) => {
            // Default grid positions if no custom position
            const defaultX = (index % 3) * 320; // 3 columns with gap
            const defaultY = Math.floor(index / 3) * 520; // 520px height with gap
            
            const position = datasetPositions[dataset._id] || { x: defaultX, y: defaultY };
            
            return (
              <Box
                key={dataset._id}
                onMouseDown={(e) => e.stopPropagation()}
                sx={{
                  position: 'absolute',
                  left: position.x,
                  top: position.y,
                  zIndex: draggedDataset?._id === dataset._id ? 1000 : 2
                }}
              >
                {renderDatasetCard(dataset)}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* Drag Feedback */}
      {draggedColumn && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 2,
              backgroundColor: '#1976f3',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              {draggedColumn.dataset.name}.{draggedColumn.column} →
            </Typography>
            <Typography variant="caption">
              Bog'lanish yaratish uchun boshqa ustunga tashlang
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Dataset Drag Feedback */}
      {draggedDataset && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Paper
            elevation={8}
            sx={{
              p: 2,
              backgroundColor: '#ff9800',
              color: 'white',
              borderRadius: 2
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 600 }}>
              🗂️ {draggedDataset.name} →
            </Typography>
            <Typography variant="caption">
              Dataset'ni boshqa joyga ko'chirish uchun tashlang
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Relationship Modal */}
      {relationshipModal.open && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setRelationshipModal({ ...relationshipModal, open: false })}
        >
          <Paper
            elevation={8}
            sx={{
              p: 3,
              minWidth: 400,
              maxWidth: 500,
              backgroundColor: 'white',
              borderRadius: 2
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LinkIcon sx={{ color: '#1976d2', fontSize: 24 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
                Bog'lanish yaratish
              </Typography>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Bog'lanish ma'lumotlari:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={relationshipModal.sourceDataset?.name}
                  size="small"
                  sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {relationshipModal.sourceColumn}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#666' }}>
                ↓
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                <Chip
                  label={relationshipModal.targetDataset?.name}
                  size="small"
                  sx={{ backgroundColor: '#e3f2fd', color: '#1976d2' }}
                />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {relationshipModal.targetColumn}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                Bog'lanish turi:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {[
                  { value: 'one-to-many', label: '1:N', color: '#2196f3' },
                  { value: 'many-to-one', label: 'N:1', color: '#ff9800' },
                  { value: 'one-to-one', label: '1:1', color: '#4caf50' },
                  { value: 'many-to-many', label: 'N:N', color: '#f44336' }
                ].map((type) => (
                  <Chip
                    key={type.value}
                    label={type.label}
                    size="medium"
                    sx={{
                      backgroundColor: type.color,
                      color: 'white',
                      fontWeight: 600,
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 }
                    }}
                    onClick={() => {
                      // Create relationship with selected type
                      const newRelationship = {
                        id: Date.now().toString(),
                        sourceDataset: relationshipModal.sourceDataset._id,
                        sourceColumn: relationshipModal.sourceColumn,
                        targetDataset: relationshipModal.targetDataset._id,
                        targetColumn: relationshipModal.targetColumn,
                        relationshipType: type.value,
                        createdAt: new Date().toISOString(),
                        visible: true
                      };
                      
                      onRelationshipCreate(newRelationship);
                      setRelationshipModal({ ...relationshipModal, open: false });
                    }}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={() => setRelationshipModal({ ...relationshipModal, open: false })}
              >
                Bekor qilish
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default DragDropRelationshipBuilder;
