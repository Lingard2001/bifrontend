import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import { 
  CloudUpload as UploadIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  ClearAll as ClearAllIcon,
  Analytics as AnalyticsIcon,
  Dataset as DatasetIcon
} from '@mui/icons-material';

const HeaderComponent = ({ onDataSourceClick, onClearAllData, onSidebarToggle, onVisualizationsToggle, onDatasetsToggle }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDataSourceClick = () => {
    onDataSourceClick();
    handleMenuClose();
  };

  const handleClearAllData = () => {
    if (window.confirm('Barcha ma\'lumotlarni o\'chirishni xohlaysizmi? Bu amalni qaytarib bo\'lmaydi.')) {
      onClearAllData();
    }
    handleMenuClose();
  };

  return (
    <AppBar position="fixed" sx={{ backgroundColor: '#1976d2', zIndex: 1200 }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
          BI Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Visualizations Button */}
          <Tooltip title="Visualizations qo'shish">
            <Button
              color="inherit"
              onClick={onVisualizationsToggle}
              startIcon={<AnalyticsIcon />}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                },
                textTransform: 'none',
                fontWeight: 500
              }}
            >
              Visualizations
            </Button>
          </Tooltip>

          {/* Sidebar Toggle Button */}
          <Tooltip title="Datasetlar ro'yxatini ko'rsatish">
            <IconButton
              color="inherit"
              onClick={onSidebarToggle}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          {/* Datasets Sidebar Toggle Button */}
          {onDatasetsToggle && (
            <Tooltip title="Datasetlar panelini ko'rsatish">
              <IconButton
                color="inherit"
                onClick={onDatasetsToggle}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)'
                  }
                }}
              >
                <DatasetIcon />
              </IconButton>
            </Tooltip>
          )}

          {/* Data Source Button */}
          <Button
            color="inherit"
            onClick={handleDataSourceClick}
            startIcon={<UploadIcon />}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              },
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Data Source
          </Button>

          {/* More Options Menu */}
          <IconButton
            color="inherit"
            onClick={handleMenuClick}
            sx={{ 
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <MoreVertIcon />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                borderRadius: 2
              }
            }}
          >
            <MenuItem onClick={handleDataSourceClick}>
              <ListItemIcon>
                <AddIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Upload Dataset</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleClearAllData}>
              <ListItemIcon>
                <ClearAllIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Clear All Data</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default HeaderComponent; 