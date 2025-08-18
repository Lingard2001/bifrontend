import React from 'react';
import { Box, Typography } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PieChartComponent = ({ data, title = "Pie Chart", config = {} }) => {
  console.log('PieChart received data:', data);
  console.log('PieChart received config:', config);
  
  // Default config values
  const {
    backgroundColor = '#ffffff',
    dataColor = '#1976d2',
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

  // Generate colors for pie slices
  const COLORS = [
    dataColor,
    '#2e7d32',
    '#ed6c02',
    '#9c27b0',
    '#d32f2f',
    '#ff9800',
    '#4caf50',
    '#2196f3',
    '#e91e63',
    '#795548'
  ];

  // Dynamically determine the data keys from the first data item
  const firstDataItem = data[0];
  
  // Use columnMapping from config if available, otherwise try to detect from data
  let labelKey, valueKey;
  
  if (config.columnMapping && config.columnMapping.label && config.columnMapping.value) {
    // Use the configured column mapping
    labelKey = config.columnMapping.label;
    
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
    
    console.log('Using configured column mapping:', { labelKey, valueKey });
  } else {
    // Fallback: try to detect from data structure
    const keys = Object.keys(firstDataItem);
    labelKey = keys[0]; // First key is usually label
    valueKey = keys[1]; // Second key is usually value
    console.log('Fallback: detected keys from data:', { labelKey, valueKey, keys });
  }
  
  console.log('Final keys for pie chart:', { labelKey, valueKey, firstDataItem });

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      backgroundColor: backgroundColor,
      borderRadius: 2,
      p: 0.5
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 10 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => {
              // Faqat katta slice'larda label ko'rsatish (5% dan yuqori)
              if (percent > 0.05) {
                return `${name} ${(percent * 100).toFixed(0)}%`;
              }
              return '';
            }}
            outerRadius="90%"
            innerRadius="30%"
            fill="#8884d8"
            dataKey={valueKey}
            nameKey={labelKey}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke={backgroundColor}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: backgroundColor,
              border: '1px solid #e0e0e0',
              borderRadius: 4
            }}
          />
          {showLegend && (
            <Legend 
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: '10px',
                fontSize: '12px'
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PieChartComponent; 