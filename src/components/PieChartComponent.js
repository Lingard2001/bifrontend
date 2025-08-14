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

  return (
    <Box sx={{ 
      width: '100%', 
      height: '100%',
      backgroundColor: backgroundColor,
      borderRadius: 2,
      p: 1
    }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
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
          {showLegend && <Legend />}
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PieChartComponent; 