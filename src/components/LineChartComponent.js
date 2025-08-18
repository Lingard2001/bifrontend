import React from 'react';
import { Box, Typography } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

const LineChartComponent = ({ data, title = "Line Chart", config = {} }) => {
  console.log('LineChart received data:', data);
  console.log('LineChart received config:', config);
  
  // Default config values
  const {
    backgroundColor = '#ffffff',
    dataColor = '#1976d2',
    showGrid = true,
    showLegend = true,
    width = 400,
    height = 300
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

  // Dynamically determine the data keys from the first data item
  const firstDataItem = data[0];
  
  // Use columnMapping from config if available, otherwise try to detect from data
  let categoryKey, valueKey;
  
  if (config.columnMapping && config.columnMapping.category && config.columnMapping.value) {
    // Use the configured column mapping
    categoryKey = config.columnMapping.category;
    
    // Check if we have aggregation and look for aggregated column name
    if (config.aggregation && config.aggregation.value && config.aggregation.value !== 'none') {
      const aggregatedKey = `${config.columnMapping.value}_${config.aggregation.value}`;
      // Check if aggregated key exists in data
      if (firstDataItem[aggregatedKey] !== undefined) {
        valueKey = aggregatedKey;
        console.log('Using aggregated column:', valueKey);
      } else {
        valueKey = config.columnMapping.value;
        console.log('Aggregated column not found, using original:', valueKey);
      }
    } else {
      valueKey = config.columnMapping.value;
      console.log('No aggregation, using original column:', valueKey);
    }
    
    console.log('Using configured column mapping:', { categoryKey, valueKey });
  } else {
    // Fallback: try to detect from data structure
    const keys = Object.keys(firstDataItem);
    categoryKey = keys[0]; // First key is usually category
    valueKey = keys[1];    // Second key is usually value
    console.log('Fallback: detected keys from data:', { categoryKey, valueKey, keys });
  }
  
  console.log('Final keys for chart:', { categoryKey, valueKey, firstDataItem });

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      backgroundColor: backgroundColor,
      borderRadius: 2,
      p: 1
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />}
          <XAxis 
            dataKey={categoryKey} 
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
          <Line 
            type="monotone"
            dataKey={valueKey}
            stroke={dataColor}
            strokeWidth={3}
            fill={dataColor}
            fillOpacity={0.1}
            dot={{ fill: dataColor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: dataColor, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChartComponent; 