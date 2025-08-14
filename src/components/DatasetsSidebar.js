import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Dataset as DatasetIcon,
  TableChart as TableChartIcon,
  ViewColumn as ViewColumnIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const SIDEBAR_WIDTH_PX = 280;

const DatasetsSidebar = ({ open, onClose, datasets, selectedDataset, onDatasetSelect, alwaysVisible = false }) => {
  const [expandedDatasets, setExpandedDatasets] = useState(new Set());
  const getColumnType = (columnName, dataset) => {
    if (!dataset || !dataset.rows || dataset.rows.length === 0) return 'unknown';
    
    const sampleValues = dataset.rows.slice(0, 10).map(row => row[columnName]);
    const numericCount = sampleValues.filter(val => !isNaN(parseFloat(val)) && val !== '').length;
    const totalCount = sampleValues.filter(val => val !== undefined && val !== null && val !== '').length;
    
    if (totalCount === 0) return 'unknown';
    const numericRatio = numericCount / totalCount;
    
    if (numericRatio > 0.7) return 'numeric';
    return 'categorical';
  };

  const getDatasetStats = (dataset) => {
    if (!dataset || !dataset.rows) return { numeric: 0, categorical: 0 };
    
    const numericColumns = dataset.columns.filter(col => 
      getColumnType(col, dataset) === 'numeric'
    );
    const categoricalColumns = dataset.columns.filter(col => 
      getColumnType(col, dataset) === 'categorical'
    );
    
    return {
      numeric: numericColumns.length,
      categorical: categoricalColumns.length
    };
  };

  const handleDatasetExpand = (datasetId) => {
    const newExpanded = new Set(expandedDatasets);
    if (newExpanded.has(datasetId)) {
      newExpanded.delete(datasetId);
    } else {
      newExpanded.add(datasetId);
    }
    setExpandedDatasets(newExpanded);
  };

  const getColumnTypeColor = (columnType) => {
    switch (columnType) {
      case 'numeric':
        return '#1976d2';
      case 'categorical':
        return '#9c27b0';
      default:
        return '#666';
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{
        width: SIDEBAR_WIDTH_PX,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH_PX,
          boxSizing: 'border-box',
          borderLeft: '1px solid #e0e0e0',
          position: 'fixed',
          top: '64px', // below AppBar
          height: 'calc(100vh - 64px)',
          backgroundColor: '#fafafa'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        backgroundColor: '#1976d2', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: alwaysVisible ? 'center' : 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DatasetIcon />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Datasetlar
          </Typography>
        </Box>
        {!alwaysVisible && (
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {datasets.length > 0 ? (
          <List>
            {datasets.map((dataset, index) => {
              const stats = getDatasetStats(dataset);
              const isSelected = selectedDataset && selectedDataset._id === dataset._id;
              const isExpanded = expandedDatasets.has(dataset._id);
              
              return (
                <React.Fragment key={dataset._id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => onDatasetSelect(dataset)}
                      selected={isSelected}
                      sx={{
                        '&.Mui-selected': {
                          backgroundColor: 'rgba(25,118,210,0.1)',
                          '&:hover': {
                            backgroundColor: 'rgba(25,118,210,0.15)'
                          }
                        },
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.04)'
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Typography variant="body2" sx={{ 
                            fontWeight: isSelected ? 600 : 500,
                            color: isSelected ? '#1976d2' : '#333',
                            fontSize: '0.9rem'
                          }}>
                            {dataset.name}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                icon={<TableChartIcon />} 
                                label={`${dataset.rows.length} qator`} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 24 }}
                              />
                              <Chip 
                                icon={<ViewColumnIcon />} 
                                label={`${dataset.columns.length} ustun`} 
                                size="small" 
                                color="secondary"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 24 }}
                              />
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip 
                                label={`${stats.numeric} sonli`} 
                                size="small" 
                                variant="outlined"
                                color="primary"
                                sx={{ fontSize: '0.65rem', height: 20 }}
                              />
                              <Chip 
                                label={`${stats.categorical} matnli`} 
                                size="small" 
                                variant="outlined"
                                color="secondary"
                                sx={{ fontSize: '0.65rem', height: 20 }}
                              />
                            </Box>
                          </Box>
                        }
                        sx={{ 
                          '& .MuiListItemText-secondary': { 
                            marginTop: 0,
                            '& .MuiBox-root': { marginTop: 0 }
                          }
                        }}
                      />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDatasetExpand(dataset._id);
                        }}
                        size="small"
                        sx={{ 
                          color: '#666',
                          '&:hover': { color: '#1976d2' }
                        }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </ListItemButton>
                  </ListItem>
                  
                  {/* Columns List */}
                  {isExpanded && (
                    <Box sx={{ pl: 4, pr: 2, pb: 1 }}>
                      <Typography variant="caption" sx={{ 
                        color: '#666', 
                        fontWeight: 600, 
                        display: 'block', 
                        mb: 1,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        fontSize: '0.7rem'
                      }}>
                        Ustunlar:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        {dataset.columns.map((column, colIndex) => {
                          const columnType = getColumnType(column, dataset);
                          return (
                            <Box
                              key={colIndex}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                p: 0.5,
                                borderRadius: 1,
                                backgroundColor: 'rgba(0,0,0,0.02)',
                                border: '1px solid rgba(0,0,0,0.05)'
                              }}
                            >
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  backgroundColor: getColumnTypeColor(columnType),
                                  flexShrink: 0
                                }}
                              />
                              <Typography variant="body2" sx={{ 
                                fontSize: '0.75rem',
                                color: '#333',
                                fontWeight: 500,
                                flex: 1
                              }}>
                                {column}
                              </Typography>
                              <Chip
                                label={columnType === 'numeric' ? 'sonli' : 'matnli'}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.6rem',
                                  height: 18,
                                  '& .MuiChip-label': { px: 0.5 },
                                  borderColor: getColumnTypeColor(columnType),
                                  color: getColumnTypeColor(columnType)
                                }}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                  
                  {index < datasets.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </List>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <DatasetIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Datasetlar topilmadi
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avval dataset yuklang
            </Typography>
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0', backgroundColor: '#f5f5f5' }}>
        <Typography variant="body2" color="text.secondary" align="center">
          Jami: {datasets.length} dataset
        </Typography>
      </Box>
    </Drawer>
  );
};

export default DatasetsSidebar; 