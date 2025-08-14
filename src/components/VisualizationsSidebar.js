import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  TableChart as TableChartIcon,
  Add as AddIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

const VisualizationsSidebar = ({ 
  open, 
  onClose, 
  onAddVisualization,
  selectedDataset 
}) => {
  const visualizationTypes = [
    {
      id: 'table',
      name: 'Data Table',
      description: 'Ma\'lumotlarni jadval ko\'rinishida ko\'rsatish',
      icon: <TableChartIcon />,
      color: '#1976d2'
    },
    {
      id: 'bar-chart',
      name: 'Bar Chart',
      description: 'Ma\'lumotlarni ustunlar ko\'rinishida ko\'rsatish',
      icon: <BarChartIcon />,
      color: '#2e7d32'
    },
    {
      id: 'line-chart',
      name: 'Line Chart',
      description: 'Ma\'lumotlarni chiziq ko\'rinishida ko\'rsatish',
      icon: <LineChartIcon />,
      color: '#ed6c02'
    },
    {
      id: 'pie-chart',
      name: 'Pie Chart',
      description: 'Ma\'lumotlarni doira ko\'rinishida ko\'rsatish',
      icon: <PieChartIcon />,
      color: '#9c27b0'
    }
  ];

  const handleAddVisualization = (visualType) => {
    if (selectedDataset) {
      onAddVisualization(visualType);
      onClose();
    }
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 350,
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e0e0e0'
        }
      }}
    >
      {/* Header */}
      <Box sx={{ 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: '#9c27b0',
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AnalyticsIcon />
          <Typography variant="h6">Visualizations</Typography>
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
        {/* Current Dataset Info */}
        {selectedDataset ? (
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            backgroundColor: '#e8f5e8', 
            borderRadius: 2,
            border: '1px solid #4caf50'
          }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
              Tanlangan Dataset: {selectedDataset.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {selectedDataset.rows.length} qator, {selectedDataset.columns.length} ustun
            </Typography>
            <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selectedDataset.columns.slice(0, 5).map((col, index) => (
                <Chip
                  key={index}
                  label={col}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.6rem', height: '20px' }}
                />
              ))}
              {selectedDataset.columns.length > 5 && (
                <Chip
                  label={`+${selectedDataset.columns.length - 5}`}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.6rem', height: '20px' }}
                />
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            backgroundColor: '#fff3cd', 
            borderRadius: 2,
            border: '1px solid #ffc107'
          }}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Avval dataset tanlang
            </Typography>
          </Box>
        )}

        {/* Visualization Types */}
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Visualization turlari
        </Typography>
        
        <List sx={{ p: 0 }}>
          {visualizationTypes.map((visualType) => (
            <ListItem key={visualType.id} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleAddVisualization(visualType)}
                disabled={!selectedDataset}
                sx={{
                  borderRadius: 2,
                  border: `1px solid ${visualType.color}20`,
                  backgroundColor: '#fff',
                  '&:hover': {
                    backgroundColor: `${visualType.color}08`,
                    borderColor: `${visualType.color}40`
                  },
                  '&:disabled': {
                    backgroundColor: '#f5f5f5',
                    borderColor: '#e0e0e0',
                    opacity: 0.6
                  }
                }}
              >
                <ListItemIcon sx={{ color: visualType.color }}>
                  {visualType.icon}
                </ListItemIcon>
                <ListItemText
                  primary={visualType.name}
                  secondary={visualType.description}
                  primaryTypographyProps={{
                    variant: 'subtitle2',
                    fontWeight: 600,
                    color: selectedDataset ? 'text.primary' : 'text.disabled'
                  }}
                  secondaryTypographyProps={{
                    variant: 'caption',
                    color: selectedDataset ? 'text.secondary' : 'text.disabled'
                  }}
                />
                <AddIcon sx={{ color: visualType.color, opacity: 0.7 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        {/* Tips */}
        <Box sx={{ mt: 4, p: 2, backgroundColor: '#e3f2fd', borderRadius: 2 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
            💡 Maslahat
          </Typography>
          <Typography variant="caption" color="text.secondary">
            • Bar Chart va Line Chart uchun raqamli ustunlar kerak
            • Pie Chart uchun kam sonli kategoriyalar yaxshi
            • Data Table barcha turdagi ma'lumotlarni ko'rsatadi
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default VisualizationsSidebar; 