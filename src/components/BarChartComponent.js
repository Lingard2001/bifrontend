import React from 'react';
import { Box, Typography } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const BarChartComponent = ({ data, title = "Bar Chart", config = {} }) => {
  console.log('BarChart received data:', data);
  console.log('BarChart received config:', config);
  
  // Debug data structure
  if (data && data.length > 0) {
    console.log('First row keys:', Object.keys(data[0]));
    console.log('First row values:', Object.values(data[0]));
    console.log('Config columnMapping:', config.columnMapping);
    console.log('Config aggregation:', config.aggregation);
  }
  
  // Default config values
  const {
    backgroundColor = '#ffffff',
    dataColor = '#1976d2',
    showGrid = true,
    showLegend = true
  } = config;

  if (!data || data.length === 0) {
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

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      backgroundColor: backgroundColor,
      borderRadius: 2,
      p: 1
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
          <XAxis 
            dataKey={config.columnMapping?.category || "Subcategory"} 
            tick={{ fontSize: 12, fill: '#333' }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#333' }}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: backgroundColor,
              border: '1px solid #e0e0e0',
              borderRadius: 4
            }}
          />
          {showLegend && <Legend />}
          <Bar 
            dataKey={(() => {
              // Check if aggregation is applied and find the correct dataKey
              if (config.aggregation?.value && config.aggregation.value !== 'none') {
                const baseColumn = config.columnMapping?.value || 'Cost';
                const aggType = config.aggregation.value;
                const aggColumn = `${baseColumn}_${aggType}`;
                
                // Check if aggregated column exists in data
                if (data && data.length > 0 && data[0][aggColumn] !== undefined) {
                  return aggColumn;
                }
              }
              return config.columnMapping?.value || "Cost";
            })()} 
            fill={dataColor}
            radius={[4, 4, 0, 0]}
            stroke={dataColor}
            strokeWidth={1}
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChartComponent; 