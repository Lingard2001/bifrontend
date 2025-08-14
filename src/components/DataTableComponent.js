import React from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Box } from '@mui/material';

const DataTableComponent = ({ dataset, title = "Data Table", config = {} }) => {
  // Default config values
  const {
    backgroundColor = '#ffffff',
    dataColor = '#1976d2',
    showGrid = true,
    width = 400,
    height = 300
  } = config;

  // Get selected columns from config, or use all columns if none selected
  const selectedColumns = config.columnMapping?.columns || dataset?.columns || [];
  const columnsToDisplay = selectedColumns.length > 0 ? selectedColumns : (dataset?.columns || []);

  if (!dataset || !dataset.rows || dataset.rows.length === 0) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: backgroundColor,
        borderRadius: 2
      }}>
        <Typography variant="body2" color="text.secondary">
          Ma'lumotlar mavjud emas
        </Typography>
      </Box>
    );
  }

  // If no columns selected, render blank container
  if (selectedColumns.length === 0) {
    return (
      <Box sx={{ 
        width: '100%', 
        height: '100%',
        backgroundColor: backgroundColor,
        borderRadius: 2
      }} />
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      backgroundColor: backgroundColor,
      borderRadius: 2,
      overflow: 'hidden'
    }}>
      <TableContainer sx={{ 
        maxHeight: '100%', 
        overflow: 'auto',
        backgroundColor: backgroundColor
      }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columnsToDisplay.map((column, index) => (
                <TableCell 
                  key={index} 
                  sx={{ 
                    fontWeight: 'bold', 
                    backgroundColor: dataColor,
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    padding: '8px 4px'
                  }}
                >
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {dataset.rows.slice(0, 20).map((row, rowIndex) => (
              <TableRow 
                key={rowIndex} 
                sx={{ 
                  '&:hover': { backgroundColor: '#f5f5f5' },
                  backgroundColor: rowIndex % 2 === 0 ? backgroundColor : '#f8f9fa'
                }}
              >
                  {columnsToDisplay.map((column, colIndex) => (
                  <TableCell 
                    key={colIndex}
                    sx={{ 
                      fontSize: '0.75rem',
                      padding: '4px',
                      borderBottom: showGrid ? '1px solid #e0e0e0' : 'none'
                    }}
                  >
                    {row[column] !== undefined ? row[column] : ''}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ 
        p: 1, 
        textAlign: 'right',
        backgroundColor: '#f8f9fa',
        borderTop: '1px solid #e0e0e0'
      }}>
        <Typography variant="caption" color="text.secondary">
          {Math.min(dataset.rows.length, 20)} / {dataset.rows.length} qator, {columnsToDisplay.length} ustun ko'rsatilmoqda
        </Typography>
      </Box>
    </Box>
  );
};

export default DataTableComponent; 