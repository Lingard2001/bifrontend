import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Chip,
  Divider,
  Button,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Dataset as DatasetIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const DatasetsSidebar = ({ open, onClose, datasets, selectedDataset, onDatasetSelect, onDeleteDataset }) => {
  const handleDatasetSelect = (dataset) => {
    onDatasetSelect(dataset);
    onClose();
  };

  const handleDeleteDataset = (dataset) => {
    if (window.confirm(`"${dataset.name}" datasetini o'chirishni xohlaysizmi?`)) {
      onDeleteDataset(dataset._id);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          backgroundColor: '#f8f9fa',
          borderLeft: '1px solid #e0e0e0'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Datasetlar
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {datasets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <DatasetIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Hali dataset qo'shilmagan
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {datasets.map((dataset) => (
              <ListItem
                key={dataset._id}
                sx={{
                  mb: 1,
                  backgroundColor: selectedDataset?._id === dataset._id ? '#e3f2fd' : '#fff',
                  borderRadius: 2,
                  border: selectedDataset?._id === dataset._id ? '2px solid #1976d2' : '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: selectedDataset?._id === dataset._id ? '#e3f2fd' : '#f5f5f5'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  {selectedDataset?._id === dataset._id ? (
                    <CheckCircleIcon sx={{ color: '#1976d2' }} />
                  ) : (
                    <DatasetIcon sx={{ color: '#666' }} />
                  )}
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {dataset.name}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Chip 
                        label={`${dataset.rows?.length || 0} qator`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, fontSize: '0.7rem' }}
                      />
                      <Chip 
                        label={`${dataset.columns?.length || 0} ustun`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    </Box>
                  }
                  sx={{ flex: 1 }}
                />

                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Datasetni tanlash">
                    <Button
                      size="small"
                      variant={selectedDataset?._id === dataset._id ? "contained" : "outlined"}
                      onClick={() => handleDatasetSelect(dataset)}
                      sx={{ 
                        minWidth: 'auto',
                        px: 1,
                        py: 0.5,
                        fontSize: '0.7rem'
                      }}
                    >
                      {selectedDataset?._id === dataset._id ? 'Tanlangan' : 'Tanlash'}
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Datasetni o'chirish">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteDataset(dataset)}
                      sx={{ 
                        color: '#d32f2f',
                        '&:hover': { backgroundColor: '#ffebee' }
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Drawer>
  );
};

export default DatasetsSidebar; 