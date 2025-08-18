import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Close as CloseIcon,
  Label as LabelIcon,
  ShowChart as ShowChartIcon,
  Category as CategoryIcon,
  AspectRatio as AspectRatioIcon,
  Palette as PaletteIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

// Chart components
import BarChartComponent from './BarChartComponent';
import LineChartComponent from './LineChartComponent';
import PieChartComponent from './PieChartComponent';
import DataTableComponent from './DataTableComponent';

const VisualizationPropertiesModal = ({ open, onClose, visualization, onSave, datasets, relationships }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [properties, setProperties] = useState({
    chartType: 'bar',
    title: '',
    columnMapping: {},
    aggregation: { value: 'sum' },
    size: { width: 400, height: 300 },
    colors: {},
    options: {}
  });

  // Initialize properties when visualization changes
  useEffect(() => {
    if (visualization) {
      setProperties({
        title: visualization.config?.title || '',
        columnMapping: visualization.config?.columnMapping || {},
        aggregation: visualization.config?.aggregation || {},
        size: visualization.size || { width: 400, height: 300 },
        colors: visualization.config?.colors || {},
        options: visualization.config?.options || {}
      });
    } else {
      // Default properties when no visualization
      setProperties({
        title: '',
        columnMapping: {},
        aggregation: { value: 'sum' },
        size: { width: 400, height: 300 },
        colors: {},
        options: {}
      });
    }
    
  }, [visualization]);

  // Get available columns from all datasets
  const getAvailableColumns = () => {
    // Check if we have datasets
    if (!datasets || datasets.length === 0) {
      return [];
    }

    const allColumns = [];
    const seenColumns = new Set(); // Track seen column names to avoid duplicates

    // Process all datasets
    datasets.forEach(dataset => {
      if (!dataset) return;

      let columns = [];
      
      // Check if columns exist and convert to proper format
      if (dataset.columns && Array.isArray(dataset.columns)) {
        // If columns is array of strings, extract from data
        columns = dataset.columns.map(colName => {
          // Get sample values for type detection
          const sampleValues = getSampleValuesForColumn(dataset, colName);
          const detectedType = detectColumnType(sampleValues);
          
          return {
            name: colName,
            type: detectedType,
            datasetId: dataset._id || dataset.id,
            datasetName: dataset.name
          };
        });
      } else if (dataset.rows && dataset.rows.length > 0) {
        // If no columns but rows exist, extract from first row
        const firstRow = dataset.rows[0];
        columns = Object.keys(firstRow).map(colName => {
          // Get sample values for type detection
          const sampleValues = getSampleValuesForColumn(dataset, colName);
          const detectedType = detectColumnType(sampleValues);
          
          return {
            name: colName,
            type: detectedType,
            datasetId: dataset._id || dataset.id,
            datasetName: dataset.name
          };
        });
      }

      // Only add columns that haven't been seen before
      columns.forEach(col => {
        const uniqueKey = `${col.name}-${col.datasetId}`;
        if (!seenColumns.has(uniqueKey)) {
          seenColumns.add(uniqueKey);
          allColumns.push(col);
        }
      });
    });

    return allColumns;
  };

    // Get sample values for a specific column
  const getSampleValuesForColumn = (dataset, columnName) => {
    let dataRows = [];
    if (dataset.data && Array.isArray(dataset.data)) {
      dataRows = dataset.data;
    } else if (dataset.rows && Array.isArray(dataset.rows)) {
      dataRows = dataset.rows;
    }
    
    if (dataRows.length === 0) return [];
    
    // Take first 100 rows for type detection
    const sampleRows = dataRows.slice(0, 100);
    return sampleRows.map(row => row[columnName]).filter(val => val !== undefined && val !== null && val !== '');
  };

  // Apply aggregation to data
  const applyAggregation = (data, columnName, aggregationType) => {
    if (!columnName || !aggregationType) return data;
    
    const values = data.map(row => row[columnName]).filter(val => val !== undefined && val !== null && val !== '');
    
    if (values.length === 0) return data;
    
    let result;
    switch (aggregationType) {
      case 'sum':
        result = values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        break;
      case 'avg':
        const sum = values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        result = sum / values.length;
        break;
      case 'count':
        result = values.length;
        break;
      case 'min':
        result = Math.min(...values.map(val => parseFloat(val) || 0));
        break;
      case 'max':
        result = Math.max(...values.map(val => parseFloat(val) || 0));
        break;
      default:
        return data;
    }
    
    return result;
  };

  // Apply aggregation to array of values
  const applyAggregationToValues = (values, aggregationType) => {
    if (!values || values.length === 0) return 0;
    
    let result;
    switch (aggregationType) {
      case 'sum':
        result = values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        break;
      case 'avg':
        const sum = values.reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        result = sum / values.length;
        break;
      case 'count':
        result = values.length;
        break;
      case 'min':
        result = Math.min(...values.map(val => parseFloat(val) || 0));
        break;
      case 'max':
        result = Math.max(...values.map(val => parseFloat(val) || 0));
        break;
      default:
        return 0;
    }
    
    return result;
  };

  // Detect column type based on sample values
  const detectColumnType = (sampleValues) => {
    if (sampleValues.length === 0) return 'categorical';

    // Check for date patterns
    const datePatterns = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
      /^\d{4}\/\d{2}\/\d{2}$/, // YYYY/MM/DD
      /^\d{1,2}\/\d{1,2}\/\d{2,4}$/, // M/D/YY or M/D/YYYY
      /^\d{1,2}-\d{1,2}-\d{2,4}$/, // M-D-YY or M-D-YYYY
    ];

    const dateCount = sampleValues.filter(val => {
      const strVal = String(val);
      return datePatterns.some(pattern => pattern.test(strVal));
    }).length;

    const dateRatio = dateCount / sampleValues.length;
    if (dateRatio > 0.6) return 'date';

    // Check for numeric values
    const numericCount = sampleValues.filter(val => {
      const strVal = String(val);
      // Check if it's a pure number (no separators like - or /)
      if (strVal.includes('-') || strVal.includes('/')) return false;
      
      const num = parseFloat(val);
      return !isNaN(num) && isFinite(num) && String(num).length === strVal.length;
    }).length;

    const numericRatio = numericCount / sampleValues.length;
    if (numericRatio > 0.7) return 'numeric';

    // Default to categorical
    return 'categorical';
  };

  // Handle column mapping changes
  const handleColumnMapping = (field, value) => {
    
    setProperties(prev => {
      const newProperties = {
        ...prev,
        columnMapping: {
          ...prev.columnMapping,
          [field]: value
        }
      };
      
      return newProperties;
    });
  };

  // Handle aggregation changes
  const handleAggregationChange = (field, value) => {
    
    setProperties(prev => {
      const newProperties = {
        ...prev,
        aggregation: {
          ...prev.aggregation,
          [field]: value
        }
      };
      
      return newProperties;
    });
  };

  // Force re-render of preview when column mapping or aggregation changes
  useEffect(() => {
  }, [properties.columnMapping, properties.aggregation]);

  // Handle property changes
  const handlePropertyChange = (field, value) => {
    setProperties(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save
  const handleSave = () => {
    // Find the dataset that contains the mapped columns
    let targetDataset = null;
    if (properties.columnMapping && Object.keys(properties.columnMapping).length > 0) {
      for (const dataset of datasets) {
        if (dataset.columns && Array.isArray(dataset.columns)) {
          const hasRequiredColumns = Object.values(properties.columnMapping).every(colName => {
            if (!colName) return true;
            return dataset.columns.some(col => 
              col === colName || (typeof col === 'object' && col.name === colName)
            );
          });
          if (hasRequiredColumns) {
            targetDataset = dataset;
            break;
          }
        }
      }
    }
    
    const updatedVisualization = {
      ...visualization,
      datasetId: targetDataset?._id || visualization.datasetId,
      datasetName: targetDataset?.name || visualization.datasetName,
      config: {
        ...visualization.config,
        title: properties.title,
        columnMapping: properties.columnMapping,
        aggregation: properties.aggregation,
        colors: properties.colors,
        options: properties.options
      },
      size: properties.size
    };

    onSave(updatedVisualization);
    onClose();
  };

  // Generate sample data for preview from all datasets
  const generateSampleData = () => {
    console.log('generateSampleData called with:', { columnMapping: properties.columnMapping, datasets });
    
    if (!properties.columnMapping || Object.keys(properties.columnMapping).length === 0) {
      console.log('No column mapping configured');
      return [];
    }

    // Get column mapping keys and values
    const columnMappingKeys = Object.keys(properties.columnMapping);
    const columnMappingValues = Object.values(properties.columnMapping);
    console.log('Column mapping keys:', columnMappingKeys);
    console.log('Column mapping values:', columnMappingValues);

    // Special handling for table visual - check first
    if (visualization?.type === 'data-table' || visualization?.type === 'table') {
      const tableColumns = properties.columnMapping.columns;
      if (tableColumns && Array.isArray(tableColumns) && tableColumns.length > 0) {
        console.log('Table visual detected with columns:', tableColumns);
        
        // For table visual, we need to find which dataset each column belongs to
        const columnDatasetMap = {};
        console.log('Debugging column mapping:');
        console.log('Table columns to find:', tableColumns);
        console.log('Available datasets:', datasets.map(d => ({ name: d.name, columns: d.columns })));
        
        tableColumns.forEach(columnName => {
          console.log(`Looking for column: ${columnName}`);
          for (const dataset of datasets) {
            console.log(`Checking dataset: ${dataset.name}`);
            console.log(`Dataset columns:`, dataset.columns);
            
            if (dataset.columns && Array.isArray(dataset.columns)) {
              const foundColumn = dataset.columns.find(col => {
                console.log(`Comparing: ${col} with ${columnName}`);
                return col === columnName || (typeof col === 'object' && col.name === columnName);
              });
              
              if (foundColumn) {
                columnDatasetMap[columnName] = dataset;
                console.log(`Found column ${columnName} in dataset ${dataset.name}`);
                break;
              }
            }
          }
        });
        
        console.log('Column dataset mapping:', columnDatasetMap);
        
        // Create sample data by combining rows from relevant datasets
        const allTableRows = [];
        const maxRowsPerDataset = 50;
        
        for (const dataset of datasets) {
          if (!dataset.rows || !Array.isArray(dataset.rows)) continue;
          
          const relevantColumns = tableColumns.filter(col => 
            dataset.columns && dataset.columns.some(datasetCol => 
              datasetCol === col || (typeof datasetCol === 'object' && datasetCol.name === col)
            )
          );
          
          if (relevantColumns.length > 0) {
            const datasetRows = dataset.rows.slice(0, maxRowsPerDataset).map(row => {
              const tableRow = {};
              tableColumns.forEach(columnName => {
                if (row[columnName] !== undefined) {
                  tableRow[columnName] = row[columnName];
                } else {
                  // Try to find the value in other datasets or set empty
                  tableRow[columnName] = '';
                }
              });
              return tableRow;
            });
            
            allTableRows.push(...datasetRows);
          }
        }
        
        const tableData = {
          columns: tableColumns,
          rows: allTableRows.slice(0, 20) // Limit to 20 rows total
        };
        
        console.log('Final processed table data:', tableData);
        return tableData;
      } else {
        console.log('Table visual but no columns selected');
        return [];
      }
    }

    // For non-table visuals, find the best dataset automatically
    console.log('Finding best dataset for chart visualization...');
    
    // Find the primary dataset that contains the mapped columns
    let primaryDataset = null;
    for (const dataset of datasets) {
      if (!dataset) continue;
      
      let dataRows = [];
      if (dataset.data && Array.isArray(dataset.data)) {
        dataRows = dataset.data;
      } else if (dataset.rows && Array.isArray(dataset.rows)) {
        dataRows = dataset.rows;
      }
      
      if (dataRows.length > 0) {
        // Check if this dataset has the required columns
        const hasRequiredColumns = columnMappingValues.every(colName => {
          if (!colName) return true; // Skip empty mappings
          return dataRows[0] && dataRows[0][colName] !== undefined;
        });
        
        if (hasRequiredColumns) {
          primaryDataset = dataset;
          console.log('Found primary dataset:', dataset.name);
          break;
        }
      }
    }

    if (!primaryDataset) {
      console.log('No dataset found with all required columns');
      return [];
    }

    // Get data from primary dataset only
    let dataRows = [];
    if (primaryDataset.data && Array.isArray(primaryDataset.data)) {
      dataRows = primaryDataset.data;
    } else if (primaryDataset.rows && Array.isArray(primaryDataset.rows)) {
      dataRows = primaryDataset.rows;
    }

    if (dataRows.length === 0) {
      console.log('No data rows in primary dataset');
      return [];
    }

    // Take first 100 rows for preview to ensure all categories are included
    const sampleRows = dataRows.slice(0, 100);
    console.log('Sample rows from primary dataset:', sampleRows);
    
    let processedData;
    
    // Special processing for table visual
    if (visualization?.type === 'data-table' || visualization?.type === 'table') {
      const tableColumns = properties.columnMapping.columns;
      console.log('Table visual detected with columns:', tableColumns);
      
      // For table visual, we need to find which dataset each column belongs to
      const columnDatasetMap = {};
      tableColumns.forEach(columnName => {
        for (const dataset of datasets) {
          if (dataset.columns && dataset.columns.some(col => col.name === columnName)) {
            columnDatasetMap[columnName] = dataset;
            break;
          }
        }
      });
      
      // Create sample data by combining rows from relevant datasets
      const allTableRows = [];
      const maxRowsPerDataset = 10;
      
      for (const dataset of datasets) {
        if (!dataset.rows || !Array.isArray(dataset.rows)) continue;
        
        const relevantColumns = tableColumns.filter(col => 
          dataset.columns && dataset.columns.some(datasetCol => datasetCol.name === col)
        );
        
        if (relevantColumns.length > 0) {
          const datasetRows = dataset.rows.slice(0, maxRowsPerDataset).map(row => {
            const tableRow = {};
            tableColumns.forEach(columnName => {
              if (row[columnName] !== undefined) {
                tableRow[columnName] = row[columnName];
              } else {
                // Try to find the value in other datasets or set empty
                tableRow[columnName] = '';
              }
            });
            return tableRow;
          });
          
          allTableRows.push(...datasetRows);
        }
      }
      
      processedData = {
        columns: tableColumns,
        rows: allTableRows.slice(0, 100) // Limit to 100 rows total
      };
    } else {
      // Regular processing for charts
      processedData = sampleRows.map(row => {
        const sampleRow = {};
        columnMappingKeys.forEach(field => {
          const columnName = properties.columnMapping[field];
          console.log(`Processing field ${field} -> column ${columnName} for row:`, row);
          if (columnName && row[columnName] !== undefined) {
            sampleRow[columnName] = row[columnName];
            console.log(`Added ${columnName}: ${row[columnName]}`);
          } else {
            console.log(`Column ${columnName} not found in row or is undefined`);
          }
        });
        return sampleRow;
      });

      // Apply aggregation for pie chart if specified
      if (visualization?.type === 'pie-chart' && properties.aggregation && properties.aggregation.value && properties.aggregation.value !== 'none') {
        const aggregationType = properties.aggregation.value;
        const valueColumn = properties.columnMapping.value;
        const labelColumn = properties.columnMapping.label;
        
        if (valueColumn && labelColumn) {
          // Group by label and apply aggregation
          const groupedData = {};
          processedData.forEach(row => {
            const label = row[labelColumn];
            if (!groupedData[label]) {
              groupedData[label] = [];
            }
            groupedData[label].push(row[valueColumn]);
          });
          
          // Create new aggregated data structure
          const aggregatedData = [];
          Object.keys(groupedData).forEach(label => {
            const values = groupedData[label].filter(val => val !== undefined && val !== null && val !== '');
            const aggregatedValue = applyAggregationToValues(values, aggregationType);
            
            // Create one row per label with aggregated value
            aggregatedData.push({
              [labelColumn]: label,
              [`${valueColumn}_${aggregationType}`]: aggregatedValue
            });
          });
          
          // Replace processedData with aggregated data
          processedData = aggregatedData;
          
          console.log(`Applied ${aggregationType} by label ${labelColumn}:`, aggregatedData);
        }
      }
    }

    // Apply aggregation if specified
    if (properties.aggregation && properties.aggregation.value && properties.aggregation.value !== 'none') {
      const aggregationType = properties.aggregation.value;
      const valueColumn = properties.columnMapping.value;
      const categoryColumn = properties.columnMapping.category;
      
      if (valueColumn && aggregationType !== 'none') {
        if (categoryColumn) {
          // Group by category and apply aggregation
          const groupedData = {};
          processedData.forEach(row => {
            const category = row[categoryColumn];
            if (!groupedData[category]) {
              groupedData[category] = [];
            }
            groupedData[category].push(row[valueColumn]);
          });
          
          // Create new aggregated data structure
          const aggregatedData = [];
          Object.keys(groupedData).forEach(category => {
            const values = groupedData[category].filter(val => val !== undefined && val !== null && val !== '');
            const aggregatedValue = applyAggregationToValues(values, aggregationType);
            
            // Create one row per category with aggregated value
            aggregatedData.push({
              [categoryColumn]: category,
              [`${valueColumn}_${aggregationType}`]: aggregatedValue
            });
          });
          
          // Replace processedData with aggregated data
          processedData.length = 0;
          processedData.push(...aggregatedData);
          
          console.log(`Applied ${aggregationType} by category ${categoryColumn}:`, aggregatedData);
        } else {
          // Fallback: apply to all data
          const aggregatedValue = applyAggregation(processedData, valueColumn, aggregationType);
          if (typeof aggregatedValue === 'number') {
            processedData.forEach(row => {
              row[`${valueColumn}_${aggregationType}`] = aggregatedValue;
            });
          }
        }
      } else if (valueColumn && aggregationType === 'none') {
        // If aggregation is 'none', keep original data structure
        console.log(`No aggregation applied to ${valueColumn}, keeping original data`);
      }
    }

    console.log('Final processed sample data:', processedData);
    return processedData;
  };

  // Render visualization preview
  const renderVisualizationPreview = () => {
    const sampleData = generateSampleData();
    
    if (!sampleData || sampleData.length === 0) {
      return (
        <Box sx={{ 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 2
        }}>
          <Typography variant="body2" color="text.secondary">
            Ma'lumotlarni ko'rish uchun ustunlarni tanlang
          </Typography>
        </Box>
      );
    }

    // Create chart config for preview
    const chartConfig = {
      title: properties.title,
      columnMapping: properties.columnMapping,
      aggregation: properties.aggregation,
      size: properties.size,
      colors: properties.colors,
      options: properties.options
    };

    console.log('Chart config for preview:', chartConfig);
    console.log('Sample data for preview:', sampleData);

    // Determine visual type
    const visualType = visualization?.type || 'bar-chart';
    console.log('Using visual type:', visualType);

    // Render appropriate chart component
    switch (visualType) {
      case 'line-chart':
        return (
          <Box sx={{ width: '100%', height: '100%' }}>
            <LineChartComponent 
              data={sampleData} 
              title=""
              config={chartConfig}
            />
          </Box>
        );
      case 'bar-chart':
        return (
          <Box sx={{ width: '100%', height: '100%' }}>
            <BarChartComponent
              data={sampleData}
              title=""
              config={chartConfig}
            />
          </Box>
        );
      case 'pie-chart':
        return (
          <Box sx={{ width: '100%', height: '100%' }}>
            <PieChartComponent
              data={sampleData}
              title=""
              config={chartConfig}
            />
          </Box>
        );
      case 'data-table':
      case 'table':
        return (
          <Box sx={{ width: '100%', height: '100%' }}>
            <DataTableComponent
              data={sampleData}
              title=""
              config={chartConfig}
            />
          </Box>
        );
      default:
        return (
          <Box sx={{ width: '100%', height: '100%' }}>
            <BarChartComponent
              data={sampleData}
              title=""
              config={chartConfig}
            />
          </Box>
        );
    }
  };

  // Get required columns for each visualization type
  const getRequiredColumns = (visualType) => {
    // Use provided visualType or default to bar-chart
    const type = visualType || 'bar-chart';
    
    switch (type) {
        case 'bar-chart':
      case 'line-chart':
        return [
          { key: 'category', label: 'Category (Kategoriya)', required: true, type: 'single', allowedType: ['categorical', 'date'] },
          { key: 'value', label: 'Value (Qiymat)', required: true, type: 'single', allowedType: ['numeric'] },
          { key: 'series', label: 'Series (Qator)', required: false, type: 'single', allowedType: ['categorical'] }
        ];
      case 'pie-chart':
        return [
          { key: 'label', label: 'Label (Belgi)', required: true, type: 'single', allowedType: ['categorical'] },
          { key: 'value', label: 'Value (Qiymat)', required: true, type: 'single', allowedType: ['numeric'] },
          { key: 'series', label: 'Series (Qator)', required: false, type: 'single', allowedType: ['categorical'] }
        ];
      case 'data-table':
      case 'table':
        return [
          { key: 'columns', label: 'Ustunlar', required: true, type: 'table-columns', allowedType: ['any'] }
        ];
      default:
        return [
          { key: 'category', label: 'Category (Kategoriya)', required: true, type: 'single', allowedType: ['categorical', 'date'] },
          { key: 'value', label: 'Value (Qiymat)', required: true, type: 'single', allowedType: ['numeric'] },
          { key: 'series', label: 'Series (Qator)', required: false, type: 'single', allowedType: ['categorical'] }
        ];
    }
  };

  // Filter columns by allowed type
  const getFilteredColumns = (allowedType) => {
    const columns = getAvailableColumns();
    if (allowedType.includes('any')) return columns;
    return columns.filter(col => allowedType.includes(col.type));
  };

  // Render column mapping for specific visualization type
  const renderColumnMapping = () => {
    
    // Use visualization type or default to bar-chart
    const visualType = visualization?.type || 'bar-chart';
    const requiredColumns = getRequiredColumns(visualType);
    
    if (requiredColumns.length === 0) {
          return (
        <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
          <Typography variant="body2">
            Visual turi topilmadi: {visualType}
                      </Typography>
                    </Box>
                  );
    }
    
          return (
      <Grid container spacing={3}>
        {requiredColumns.map((column) => (
          <Grid item xs={12} key={column.key}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              {/* Column Selection */}
              <FormControl fullWidth size="medium" sx={{ minWidth: '200px', flex: 1 }}>
                <InputLabel>
                  {column.label} {column.required && '*'}
                </InputLabel>
                {column.type === 'table-columns' ? (
                  // Special UI for table columns - individual column selection
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Table uchun ustunlarni alohida tanlang:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                      {getFilteredColumns(column.allowedType).map((col) => {
                        const isSelected = properties.columnMapping[column.key]?.includes(col.name);
                    return (
                          <Chip
                            key={`${col.name}-${col.datasetId}`}
                            label={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip 
                                  label={col.type === 'numeric' ? 'sonli' : col.type === 'date' ? 'sana' : 'matn'} 
                                  size="small" 
                                  color={col.type === 'numeric' ? 'primary' : col.type === 'date' ? 'success' : 'secondary'}
                                  sx={{ fontSize: '0.6rem', height: '16px' }}
                                />
                                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                  {col.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                  {col.datasetName}
                                </Typography>
                              </Box>
                            }
                            onClick={() => {
                              const currentColumns = properties.columnMapping[column.key] || [];
                              if (isSelected) {
                                // Remove column
                                handleColumnMapping(column.key, currentColumns.filter(c => c !== col.name));
                              } else {
                                // Add column
                                handleColumnMapping(column.key, [...currentColumns, col.name]);
                              }
                            }}
                            color={isSelected ? 'primary' : 'default'}
                            variant={isSelected ? 'filled' : 'outlined'}
                            sx={{ 
                              cursor: 'pointer',
                              '&:hover': { opacity: 0.8 }
                            }}
                          />
                    );
                  })}
              </Box>
                    <Typography variant="caption" color="text.secondary">
                      Tanlangan ustunlar: {properties.columnMapping[column.key]?.length || 0}
                  </Typography>
              </Box>
                ) : column.type === 'multiple' ? (
                  <Select
                    multiple
                    value={properties.columnMapping[column.key] || []}
                    onChange={(e) => handleColumnMapping(column.key, e.target.value)}
                    label={`${column.label} ${column.required ? '*' : ''}`}
                    variant="outlined"
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} size="small" />
                        ))}
            </Box>
                    )}
                  >
                    {getFilteredColumns(column.allowedType).map(col => (
                      <MenuItem key={`${col.name}-${col.datasetId}`} value={col.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                                     <Chip 
                             label={col.type === 'numeric' ? 'sonli' : col.type === 'date' ? 'sana' : 'matn'} 
                             size="small" 
                             color={col.type === 'numeric' ? 'primary' : col.type === 'date' ? 'success' : 'secondary'}
                             sx={{ fontSize: '0.7rem', height: '20px' }}
                           />
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {col.name}
          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {col.datasetName}
              </Typography>
            </Box>
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                <Select
                  value={properties.columnMapping[column.key] || ''}
                  onChange={(e) => handleColumnMapping(column.key, e.target.value)}
                  label={`${column.label} ${column.required ? '*' : ''}`}
                  variant="outlined"
                                  >
                    <MenuItem value="">Ustun tanlang</MenuItem>
                    {getFilteredColumns(column.allowedType).map(col => (
                      <MenuItem key={`${col.name}-${col.datasetId}`} value={col.name}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                <Chip
                            label={col.type === 'numeric' ? 'sonli' : col.type === 'date' ? 'sana' : 'matn'} 
                  size="small"
                            color={col.type === 'numeric' ? 'primary' : col.type === 'date' ? 'success' : 'secondary'}
                            sx={{ fontSize: '0.7rem', height: '20px' }}
                          />
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {col.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {col.datasetName}
                        </Typography>
            </Box>
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </FormControl>

              {/* Aggregation for Value columns */}
              {column.key === 'value' && properties.columnMapping[column.key] && (
                <FormControl size="small" sx={{ minWidth: '120px' }}>
                  <InputLabel>Aggregation</InputLabel>
                  <Select
                    value={properties.aggregation[column.key] || 'none'}
                    onChange={(e) => handleAggregationChange(column.key, e.target.value)}
                    label="Aggregation"
                    variant="outlined"
                  >
                    <MenuItem value="none">Aggregation yo'q</MenuItem>
                    <MenuItem value="sum">Sum</MenuItem>
                    <MenuItem value="avg">Average</MenuItem>
                    <MenuItem value="count">Count</MenuItem>
                    <MenuItem value="min">Min</MenuItem>
                    <MenuItem value="max">Max</MenuItem>
                  </Select>
                </FormControl>
          )}
        </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (!visualization) return null;

  return (
      <Dialog 
        open={open} 
        onClose={onClose}
      maxWidth="98vw"
      fullWidth
      maxHeight="95vh"
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Visual xususiyatlari</Typography>
        <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

      <DialogContent sx={{ height: '80vh', p: 0 }}>
        <Box sx={{ display: 'flex', height: '100%' }}>
          {/* Left side - Properties */}
          <Box sx={{ flex: 0.8, p: 2, borderRight: 1, borderColor: 'divider' }}>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Asosiy" icon={<SettingsIcon />} />
              <Tab label="Ustunlar" icon={<LabelIcon />} />
              <Tab label="O'lchamlar" icon={<AspectRatioIcon />} />
              <Tab label="Ranglar" icon={<PaletteIcon />} />
            </Tabs>

            {/* Tab 0: Basic Properties */}
            {activeTab === 0 && (
              <Paper elevation={1} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <SettingsIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                        Asosiy xususiyatlar
                      </Typography>
                    </Box>
                    
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                        <TextField
                          fullWidth
                      size="small"
                          label="Sarlavha"
                          value={properties.title}
                          onChange={(e) => handlePropertyChange('title', e.target.value)}
                          variant="outlined"
                        />
                      </Grid>
                  
                    </Grid>
                  </Paper>
            )}

            {/* Tab 1: Column Mapping */}
            {activeTab === 1 && (
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <LabelIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                    Ustunlar
                      </Typography>
                    </Box>
                    
                {renderColumnMapping()}
                  </Paper>
            )}

            {/* Tab 2: Dimensions */}
            {activeTab === 2 && (
              <Paper elevation={1} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <AspectRatioIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                    O'lchamlar
                      </Typography>
                    </Box>
                    
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                        <TextField
                          fullWidth
                      size="small"
                      label="Kenglik"
                          type="number"
                      value={properties.size.width}
                      onChange={(e) => handlePropertyChange('size', { 
                        ...properties.size, 
                        width: e.target.value === '' ? '' : parseInt(e.target.value) || 400 
                      })}
                          variant="outlined"
                        />
                      </Grid>
                  <Grid item xs={6}>
                        <TextField
                          fullWidth
                      size="small"
                      label="Balandlik"
                          type="number"
                      value={properties.size.height}
                      onChange={(e) => handlePropertyChange('size', { 
                        ...properties.size, 
                        height: e.target.value === '' ? '' : parseInt(e.target.value) || 300 
                      })}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
            )}

            {/* Tab 3: Colors */}
            {activeTab === 3 && (
              <Paper elevation={1} sx={{ p: 2, borderRadius: 1, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PaletteIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                  <Typography variant="subtitle1" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                    Ranglar
                      </Typography>
                    </Box>

                <Typography variant="body2" color="text.secondary">
                  Chart ranglarini sozlash uchun ustunlarni tanlang
                </Typography>
                  </Paper>
            )}
            </Box>

          {/* Right side - Live Preview */}
          <Box sx={{ flex: 1.2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <VisibilityIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
              <Typography variant="subtitle1" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                Namuna ko'rinish
                </Typography>
              </Box>
              
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              overflow: 'hidden',
              border: 1,
              borderColor: 'divider',
              borderRadius: 1
            }}>
              <Box sx={{ 
                height: '100%', 
                p: 1,
                transform: 'scale(0.7)',
                transformOrigin: 'center center'
              }}>
                {renderVisualizationPreview()}
              </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Bekor qilish</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default VisualizationPropertiesModal; 