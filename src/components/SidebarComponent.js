import React, { useState } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Tooltip,
  Collapse,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Dataset as DatasetIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

const SidebarComponent = ({ 
  open, 
  onClose, 
  datasets, 
  selectedDataset, 
  onDatasetSelect, 
  onDeleteDataset 
}) => {
  const [expandedDatasets, setExpandedDatasets] = useState(new Set());

  const handleDatasetExpand = (datasetId) => {
    const newExpanded = new Set(expandedDatasets);
    if (newExpanded.has(datasetId)) {
      newExpanded.delete(datasetId);
    } else {
      newExpanded.add(datasetId);
    }
    setExpandedDatasets(newExpanded);
  };

  const isExpanded = (datasetId) => expandedDatasets.has(datasetId);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 380,
          backgroundColor: '#f8f9fa',
          borderLeft: '1px solid #e0e0e0'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: '#1976d2',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DatasetIcon />
          <Typography variant="h6">Datasets</Typography>
        </Box>
        <IconButton 
          onClick={onClose} 
          sx={{ color: 'white' }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider />

      {/* Content */}
      <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
        {datasets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <DatasetIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Hali hech qanday dataset yuklanmagan
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {datasets.map((dataset, index) => (
              <Box key={dataset._id} sx={{ mb: 2 }}>
                {/* Dataset Item */}
                <ListItem
                  disablePadding
                  sx={{ mb: 1 }}
                >
                  <ListItemButton
                    onClick={() => onDatasetSelect(dataset)}
                    selected={selectedDataset?._id === dataset._id}
                    sx={{
                      borderRadius: 1,
                      backgroundColor: selectedDataset?._id === dataset._id ? '#e3f2fd' : 'transparent',
                      '&:hover': {
                        backgroundColor: selectedDataset?._id === dataset._id ? '#e3f2fd' : '#f5f5f5'
                      },
                      '&.Mui-selected': {
                        backgroundColor: '#e3f2fd',
                        '&:hover': {
                          backgroundColor: '#e3f2fd'
                        }
                      }
                    }}
                  >
                    <ListItemText
                      primary={dataset.name}
                      secondary={`${dataset.rows.length} qator, ${dataset.columns.length} ustun`}
                      primaryTypographyProps={{
                        variant: 'subtitle2',
                        fontWeight: selectedDataset?._id === dataset._id ? 600 : 400
                      }}
                      secondaryTypographyProps={{
                        variant: 'caption',
                        color: 'text.secondary'
                      }}
                    />
                    
                    {/* Expand/Collapse Button */}
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDatasetExpand(dataset._id);
                      }}
                      sx={{
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.1)'
                        }
                      }}
                    >
                      {isExpanded(dataset._id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>

                    {/* Delete Button */}
                    <Tooltip title="Dataset o'chirish">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteDataset(dataset._id);
                        }}
                        sx={{
                          color: '#f44336',
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.1)'
                          }
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItemButton>
                </ListItem>

                {/* Columns List - Collapsible */}
                <Collapse in={isExpanded(dataset._id)} timeout="auto" unmountOnExit>
                  <Box sx={{ pl: 3, pr: 2, pb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                      Ustunlar:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {dataset.columns.map((column, colIndex) => (
                        <Chip
                          key={colIndex}
                          label={column}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontSize: '0.7rem',
                            height: '24px',
                            backgroundColor: '#fff',
                            borderColor: '#e0e0e0',
                            '&:hover': {
                              backgroundColor: '#f5f5f5'
                            }
                          }}
                        />
                      ))}
                    </Box>
                    
                    {/* Sample Data Preview */}
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                        Namuna ma'lumotlar (birinchi 3 qator):
                      </Typography>
                      <Box sx={{ 
                        backgroundColor: '#fff', 
                        borderRadius: 1, 
                        p: 1, 
                        border: '1px solid #e0e0e0',
                        maxHeight: 120,
                        overflow: 'auto'
                      }}>
                        {dataset.rows.slice(0, 3).map((row, rowIndex) => (
                          <Box key={rowIndex} sx={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: 0.5, 
                            mb: 0.5,
                            fontSize: '0.7rem'
                          }}>
                            {dataset.columns.slice(0, 3).map((col, colIndex) => (
                              <Chip
                                key={colIndex}
                                label={`${col}: ${row[col] || 'N/A'}`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.6rem',
                                  height: '20px',
                                  backgroundColor: '#f8f9fa',
                                  borderColor: '#e0e0e0'
                                }}
                              />
                            ))}
                            {dataset.columns.length > 3 && (
                              <Chip
                                label={`+${dataset.columns.length - 3} ustun`}
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: '0.6rem',
                                  height: '20px',
                                  backgroundColor: '#e3f2fd',
                                  borderColor: '#1976d2',
                                  color: '#1976d2'
                                }}
                              />
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </List>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
          Jami: {datasets.length} dataset
        </Typography>
      </Box>
    </Drawer>
  );
};

export default SidebarComponent; 