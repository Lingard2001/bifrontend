import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Grid,
  Slider,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputAdornment
} from '@mui/material';
import {
  Close as CloseIcon,
  Settings as SettingsIcon,
  Title as TitleIcon,
  AspectRatio as AspectRatioIcon,
  ViewModule as ViewModuleIcon,
  ColorLens as ColorLensIcon,
  Tune as TuneIcon,
  Label as LabelIcon,
  ShowChart as ShowChartIcon,
  Category as CategoryIcon,
  TrendingUp as TrendingUpIcon,
  FilterDrama as ShadowIcon
} from '@mui/icons-material';

const VisualizationPropertiesModal = ({
  open,
  onClose,
  visualization,
  dataset,
  onSave,
  onDelete
}) => {
  const [properties, setProperties] = useState({
    title: '',
    width: 400,
    height: 300,
    backgroundColor: '#ffffff',
    borderColor: '#e0e0e0',
    titleColor: '#333333',
    dataColor: '#1976d2',
    showTitle: true,
    showBorder: true,
    showGrid: true,
    showLegend: true,
    chartType: 'auto',
    columnMapping: {},
    showShadow: true,
    borderRadius: 5,
    borderWidth: 2,
    shadowBlur: 20,
    shadowOffsetX: 4,
    shadowOffsetY: 4,
    shadowColor: '#000000',
    aggregations: { value: 'none' }
  });

  // Debug: Log initial properties
  console.log('Initial properties state:', properties);

  // Debug: Log property changes
  useEffect(() => {
    console.log('Properties updated:', properties);
  }, [properties]);

  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [activeColorField, setActiveColorField] = useState('');

  useEffect(() => {
    if (visualization && visualization.config) {
      setProperties({
        title: visualization.config.title || visualization.name,
        width: visualization.config.width || 400,
        height: visualization.config.height || 300,
        backgroundColor: visualization.config.backgroundColor || '#ffffff',
        borderColor: visualization.config.borderColor || '#e0e0e0',
        titleColor: visualization.config.titleColor || '#333333',
        dataColor: visualization.config.dataColor || '#1976d2',
        showTitle: visualization.config.showTitle !== false,
        showBorder: visualization.config.showBorder !== false,
        showGrid: visualization.config.showGrid !== false,
        showLegend: visualization.config.showLegend !== false,
        chartType: visualization.config.chartType || 'auto',
        columnMapping: visualization.config.columnMapping || {},
        showShadow: visualization.config.showShadow !== false,
        borderRadius: visualization.config.borderRadius ?? 5,
        borderWidth: visualization.config.borderWidth ?? 2,
        shadowBlur: visualization.config.shadowBlur || 20,
        shadowOffsetX: visualization.config.shadowOffsetX || 4,
        shadowOffsetY: visualization.config.shadowOffsetY || 4,
        shadowColor: visualization.config.shadowColor || '#000000',
        aggregations: visualization.config.aggregations || { value: 'none' }
      });
    }
  }, [visualization]);

  const handlePropertyChange = (field, value) => {
    console.log(`Property changed: ${field} = ${value}`);
    setProperties(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorChange = (field, color) => {
    handlePropertyChange(field, color);
    setColorPickerOpen(false);
    setActiveColorField('');
  };

  const handleSave = () => {
    const updatedVisualization = {
      ...visualization,
      config: {
        ...properties,
        borderColor: properties.borderColor,
        borderWidth: properties.borderWidth,
        borderRadius: properties.borderRadius,
        showBorder: properties.showBorder,
        showShadow: properties.showShadow,
        shadowBlur: properties.shadowBlur,
        shadowOffsetX: properties.shadowOffsetX,
        shadowOffsetY: properties.shadowOffsetY,
        shadowColor: properties.shadowColor,
        columnMapping: properties.columnMapping,
        aggregations: properties.aggregations
      }
    };
    onSave(updatedVisualization);
    onClose();
  };

  const getAvailableColumns = () => {
    console.log("[DEBUG] Dataset:", dataset);
    if (!dataset) return [];
    console.log("[DEBUG] Dataset columns:", dataset.columns);
    
    return dataset.columns.map(col => ({
      name: col,
      type: typeof dataset.rows[0]?.[col] === 'number' ? 'numeric' : 'categorical'
    }));
  };

  const getChartTypeOptions = () => {
    const baseType = visualization?.type || 'bar-chart';
    
    switch (baseType) {
      case 'bar-chart':
        return [
          { value: 'auto', label: 'Avtomatik' },
          { value: 'vertical', label: 'Vertikal ustunlar' },
          { value: 'horizontal', label: 'Gorizontal ustunlar' },
          { value: 'grouped', label: 'Guruhlangan ustunlar' }
        ];
      case 'line-chart':
        return [
          { value: 'auto', label: 'Avtomatik' },
          { value: 'smooth', label: 'Silliq chiziq' },
          { value: 'stepped', label: 'Qadamli chiziq' },
          { value: 'area', label: 'Maydon chiziq' }
        ];
      case 'pie-chart':
        return [
          { value: 'auto', label: 'Avtomatik' },
          { value: 'donut', label: 'Donut chart' },
          { value: 'exploded', label: 'Ajratilgan bo\'laklar' }
        ];
      default:
        return [{ value: 'auto', label: 'Avtomatik' }];
    }
  };

  // Column mapping uchun required fields
  const getRequiredFields = () => {
    const chartType = visualization?.type || 'bar-chart';
    
    switch (chartType) {
      case 'pie-chart':
        return [
          { key: 'label', label: 'Label (Nomi)', icon: <LabelIcon />, required: true, description: 'Pie chart bo\'laklarining nomlari', type: 'single', allowedType: 'categorical' },
          { key: 'value', label: 'Value (Qiymat)', icon: <ShowChartIcon />, required: true, description: 'Pie chart bo\'laklarining qiymatlari', type: 'single', allowedType: 'numeric' }
        ];
      case 'bar-chart':
        return [
          { key: 'category', label: 'Category (Kategoriya)', icon: <CategoryIcon />, required: true, description: 'Bar chart ustunlarining nomlari', type: 'single', allowedType: 'categorical' },
          { key: 'value', label: 'Value (Qiymat)', icon: <ShowChartIcon />, required: true, description: 'Bar chart ustunlarining balandligi', type: 'single', allowedType: 'numeric' },
          { key: 'group', label: 'Group (Guruh)', icon: <TrendingUpIcon />, required: false, description: 'Bar chart guruhlari (ixtiyoriy)', type: 'single', allowedType: 'categorical' }
        ];
      case 'line-chart':
        return [
          { key: 'category', label: 'Category (Kategoriya)', icon: <CategoryIcon />, required: true, description: 'Line chart nuqtalarining nomlari', type: 'single', allowedType: 'categorical' },
          { key: 'value', label: 'Value (Qiymat)', icon: <ShowChartIcon />, required: true, description: 'Line chart nuqtalarining qiymatlari', type: 'single', allowedType: 'numeric' },
          { key: 'series', label: 'Series (Qator)', icon: <TrendingUpIcon />, required: false, description: 'Line chart qatorlari (ixtiyoriy)', type: 'single', allowedType: 'categorical' }
        ];
      case 'data-table':
      case 'table':
        return [
          { key: 'columns', label: 'Columns (Ustunlar)', icon: <CategoryIcon />, required: true, description: 'Jadvalda ko\'rsatiladigan ustunlar (bir nechtasini tanlang)', type: 'multiple', allowedType: 'any' }
        ];
      default:
        return [];
    }
  };

  // Column mapping ni yangilash
  const handleColumnMapping = (fieldKey, columnName, isMultiple = false) => {
    const newMapping = { ...properties.columnMapping };
    
    if (isMultiple) {
      // Multiple selection uchun
      if (!newMapping[fieldKey]) {
        newMapping[fieldKey] = [];
      }
      
      if (columnName === '') {
        // Clear all
        newMapping[fieldKey] = [];
      } else if (newMapping[fieldKey].includes(columnName)) {
        // Remove column if already selected
        newMapping[fieldKey] = newMapping[fieldKey].filter(col => col !== columnName);
      } else {
        // Add column
        newMapping[fieldKey] = [...newMapping[fieldKey], columnName];
      }
    } else {
      // Single selection uchun (eski usul)
      if (columnName === '') {
        delete newMapping[fieldKey];
      } else {
        newMapping[fieldKey] = columnName;
      }
    }
    
    handlePropertyChange('columnMapping', newMapping);
  };

  // Column mapping ni ko'rsatish
  const renderColumnMapping = () => {
    const requiredFields = getRequiredFields();
    const availableColumns = getAvailableColumns();
    console.log("[DEBUG] availableColumns:", availableColumns);
    console.log("[DEBUG] requiredFields:", requiredFields);
    console.log("[DEBUG] properties.columnMapping:", properties.columnMapping);
    
    return (
      <Grid item xs={12}>
        <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <TuneIcon sx={{ color: '#d32f2f', fontSize: 24 }} />
            <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 600 }}>
              Ustunlar joylashuvi
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Har bir ustunni chart da qayerga qo'yish kerakligini belgilang
          </Typography>

          {/* AGAR availableColumns bo'sh bo'lsa, xabar chiqsin */}
          {availableColumns.length === 0 ? (
            <Box sx={{ p: 2, backgroundColor: '#fff3e0', borderRadius: 2, border: '1px solid #ffd180', textAlign: 'center' }}>
              <Typography variant="body2" color="error">
                Ustunlar topilmadi. Datasetda ustunlar mavjudligiga ishonch hosil qiling.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {requiredFields.map((field) => {
                const validColumns = field.allowedType && field.allowedType !== 'any'
                  ? availableColumns.filter(c => c.type === field.allowedType)
                  : availableColumns;

                return (
                  <Grid item xs={12} md={6} key={field.key}>
                    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Box sx={{ color: field.required ? '#d32f2f' : '#666' }}>
                          {field.icon}
                        </Box>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 600,
                          color: field.required ? '#d32f2f' : '#333'
                        }}>
                          {field.label}
                          {field.required && <span style={{ color: '#d32f2f' }}> *</span>}
                        </Typography>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        {field.description}
                      </Typography>

                      {field.type === 'multiple' ? (
                        // Multiple selection uchun checkbox lar (faqat validColumns)
                        <Box>
                          <Box sx={{ mb: 2 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleColumnMapping(field.key, '', true)}
                              sx={{ fontSize: '0.7rem', mb: 1 }}
                            >
                              Barchasini tozalash
                            </Button>
                          </Box>
                          
                          <Box sx={{ 
                            maxHeight: '200px', 
                            overflow: 'auto',
                            border: '1px solid #e0e0e0',
                            borderRadius: 1,
                            p: 1
                          }}>
                            {validColumns.map((column) => {
                              const isSelected = properties.columnMapping[field.key]?.includes(column.name) || false;
                              return (
                                <Box
                                  key={column.name}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 0.5,
                                    cursor: 'pointer',
                                    borderRadius: 1,
                                    '&:hover': { backgroundColor: '#f5f5f5' },
                                    backgroundColor: isSelected ? '#e3f2fd' : 'transparent'
                                  }}
                                  onClick={() => handleColumnMapping(field.key, column.name, true)}
                                >
                                  <Box
                                    sx={{
                                      width: 16,
                                      height: 16,
                                      border: '2px solid #ccc',
                                      borderRadius: 2,
                                      backgroundColor: isSelected ? '#1976d2' : 'transparent',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      color: 'white',
                                      fontSize: '10px',
                                      fontWeight: 'bold'
                                    }}
                                  >
                                    {isSelected && '✓'}
                                  </Box>
                                  <Chip 
                                    label={column.type === 'numeric' ? 'Son' : 'Matn'} 
                                    size="small" 
                                    color={column.type === 'numeric' ? 'primary' : 'secondary'}
                                    sx={{ fontSize: '0.6rem', height: '18px' }}
                                  />
                                  <Typography variant="body2" sx={{ flex: 1 }}>
                                    {column.name}
                                  </Typography>
                                </Box>
                              );
                            })}
                          </Box>
                        </Box>
                      ) : (
                        // Single selection uchun dropdown (faqat validColumns)
                        <>
                          <FormControl fullWidth size="small">
                            <InputLabel>
                              {field.allowedType === 'numeric' ? 'Sonli ustun tanlang' : field.allowedType === 'categorical' ? 'Matnli ustun tanlang' : 'Ustun tanlang'}
                            </InputLabel>
                            <Select
                              value={properties.columnMapping[field.key] || ''}
                              onChange={(e) => handleColumnMapping(field.key, e.target.value, false)}
                              label={field.allowedType === 'numeric' ? 'Sonli ustun tanlang' : field.allowedType === 'categorical' ? 'Matnli ustun tanlang' : 'Ustun tanlang'}
                              variant="outlined"
                            >
                              <MenuItem value="">
                                <em>Ustun tanlanmagan</em>
                              </MenuItem>
                              {validColumns.map((column) => (
                                <MenuItem key={column.name} value={column.name}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip 
                                      label={column.type === 'numeric' ? 'Son' : 'Matn'} 
                                      size="small" 
                                      color={column.type === 'numeric' ? 'primary' : 'secondary'}
                                      sx={{ fontSize: '0.7rem', height: '20px' }}
                                    />
                                    {column.name}
                                  </Box>
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          {/* Aggregation selector for numeric value field */}
                          {field.key === 'value' && field.allowedType === 'numeric' && (
                            <Box sx={{ mt: 1.5 }}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Aggregation</InputLabel>
                                <Select
                                  value={properties.aggregations?.value || 'none'}
                                  label="Aggregation"
                                  onChange={(e) => setProperties(prev => ({ ...prev, aggregations: { ...(prev.aggregations || {}), value: e.target.value } }))}
                                >
                                  <MenuItem value="none">Hech biri</MenuItem>
                                  <MenuItem value="sum">Sum</MenuItem>
                                  <MenuItem value="avg">Avg</MenuItem>
                                  <MenuItem value="count">Count</MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                          )}
                        </>
                      )}

                      {properties.columnMapping[field.key] && (
                        <Box sx={{ mt: 1, p: 1, backgroundColor: '#f0f8ff', borderRadius: 1, border: '1px solid #e3f2fd' }}>
                          <Typography variant="caption" color="primary" sx={{ fontWeight: 500 }}>
                            Tanlangan: {
                              Array.isArray(properties.columnMapping[field.key]) 
                                ? properties.columnMapping[field.key].join(', ') 
                                : properties.columnMapping[field.key]
                            }
                          </Typography>
                        </Box>
                      )}
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}

          {/* Column Mapping Summary */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: '#666' }}>
              Ustunlar joylashuvi:
            </Typography>
            <List dense sx={{ py: 0 }}>
              {requiredFields.map((field) => (
                <ListItem key={field.key} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {field.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="body2">
                        <strong>{field.label}:</strong> {
                          Array.isArray(properties.columnMapping[field.key]) 
                            ? properties.columnMapping[field.key].join(', ') || 'Tanlanmagan'
                            : properties.columnMapping[field.key] || 'Tanlanmagan'
                        }
                      </Typography>
                    }
                    secondary={field.description}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Grid>
    );
  };

  // Real-time visualization preview
  const renderVisualizationPreview = () => {
    const baseType = visualization?.type || 'bar-chart';
    const subType = properties.chartType || 'auto';
    const requiredFields = getRequiredFields();
    
    // Check if required fields are mapped
    const hasRequiredFields = requiredFields
      .filter(field => field.required)
      .every(field => properties.columnMapping[field.key]);

    if (!hasRequiredFields) {
      return (
        <Box sx={{ 
          width: '100%', 
          height: properties.height,
          backgroundColor: '#f5f5f5',
          border: '2px dashed #ccc',
          borderRadius: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Chart ko'rinishi
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center">
            Ustunlar joylashuvini to'ldiring
          </Typography>
        </Box>
      );
    }

    // Generate sample data based on column mapping
    const generateSampleData = () => {
      if (!dataset || !dataset.rows.length) return [];
      
      const sampleRows = dataset.rows.slice(0, 5); // First 5 rows
      
      switch (baseType) {
        case 'pie-chart':
          const labelCol = properties.columnMapping.label;
          const valueCol = properties.columnMapping.value;
          if (labelCol && valueCol) {
            return sampleRows.map(row => ({
              name: row[labelCol],
              value: parseFloat(row[valueCol]) || 0
            }));
          }
          break;
          
        case 'bar-chart':
          const categoryCol = properties.columnMapping.category;
          const barValueCol = properties.columnMapping.value;
          if (categoryCol && barValueCol) {
            return sampleRows.map(row => ({
              name: row[categoryCol],
              value: parseFloat(row[barValueCol]) || 0
            }));
          }
          break;
          
        case 'line-chart':
          const lineCategoryCol = properties.columnMapping.category;
          const lineValueCol = properties.columnMapping.value;
          if (lineCategoryCol && lineValueCol) {
            return sampleRows.map(row => ({
              name: row[lineCategoryCol],
              value: parseFloat(row[lineValueCol]) || 0
            }));
          }
          break;
          
        case 'data-table':
        case 'table':
          const columns = properties.columnMapping.columns;
          if (columns && Array.isArray(columns)) {
            return sampleRows.map(row => {
              const tableRow = {};
              columns.forEach(col => {
                tableRow[col] = row[col];
              });
              return tableRow;
            });
          }
          break;
        default:
          return [];
      }
      
      return [];
    };

    const sampleData = generateSampleData();

    // Real-time chart preview with actual chart components
    const renderChartPreview = () => {
      if (sampleData.length === 0) return null;

      const previewInnerHeight = Math.max(100, (properties?.height ?? 300) - (properties?.showTitle ? 60 : 20));
      const labelSpace = 24; // reserved space for bottom labels so they don't get clipped
      const chartStyle = {
        width: '100%',
        height: previewInnerHeight,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      };

      switch (baseType) {
        case 'pie-chart':
          return (
            <Box sx={{ ...chartStyle, gap: 2 }}>
              <Box sx={{ 
                width: Math.min(previewInnerHeight, properties.width) * 0.6, 
                height: Math.min(previewInnerHeight, properties.width) * 0.6, 
                borderRadius: '50%',
                background: `conic-gradient(
                  ${properties.dataColor} 0deg 120deg,
                  ${properties.dataColor}80 120deg 240deg,
                  ${properties.dataColor}40 240deg 360deg
                )`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: properties.showBorder ? `2px solid ${properties.borderColor}` : 'none',
                boxShadow: properties.showShadow ? `${properties.shadowOffsetX || 2}px ${properties.shadowOffsetY || 2}px ${properties.shadowBlur || 8}px ${properties.shadowColor || '#000000'}30` : 'none'
              }}>
                <Box sx={{ 
                  width: Math.min(previewInnerHeight, properties.width) * 0.3, 
                  height: Math.min(previewInnerHeight, properties.width) * 0.3, 
                  borderRadius: '50%',
                  backgroundColor: properties.backgroundColor,
                  border: properties.showBorder ? `1px solid ${properties.borderColor}` : 'none'
                }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {sampleData.slice(0, 4).map((item, idx) => (
                  <Chip 
                    key={idx} 
                    size="small" 
                    variant="outlined" 
                    label={`${item.name}: ${item.value}`}
                    sx={{ 
                      backgroundColor: properties.backgroundColor,
                      borderColor: properties.borderColor,
                      color: properties.titleColor
                    }}
                  />
                ))}
              </Box>
            </Box>
          );
          
        case 'bar-chart':
          return (
            <Box sx={{ ...chartStyle, flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'end', gap: 6, height: previewInnerHeight - labelSpace }}>
                {sampleData.slice(0, 4).map((item, index) => {
                  const maxVal = Math.max(...sampleData.map(d => d.value || 0)) || 1;
                  const barHeight = Math.max(8, (item.value || 0) / maxVal * ((previewInnerHeight - labelSpace) - 12));
                  return (
                    <Box key={index} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        sx={{
                          width: 24,
                          height: `${barHeight}px`,
                          backgroundColor: properties.dataColor,
                          borderRadius: properties.borderRadius ? `${properties.borderRadius}px ${properties.borderRadius}px 0 0` : '4px 4px 0 0',
                          border: properties.showBorder ? `1px solid ${properties.borderColor}` : 'none',
                          boxShadow: properties.showShadow ? `${properties.shadowOffsetX || 1}px ${properties.shadowOffsetY || 1}px ${properties.shadowBlur || 4}px ${properties.shadowColor || '#000000'}30` : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                      <Typography variant="caption" sx={{ mt: 0.5, color: properties.titleColor }}>
                        {item.value}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', px: 2, height: labelSpace, alignItems: 'center' }}>
                {sampleData.slice(0, 4).map((item, index) => (
                  <Typography key={index} variant="caption" sx={{ color: properties.titleColor }}>
                    {item.name}
                  </Typography>
                ))}
              </Box>
            </Box>
          );
          
        case 'line-chart':
          return (
            <Box sx={{ ...chartStyle, flexDirection: 'column' }}>
              <Box sx={{ width: '100%', height: previewInnerHeight - labelSpace, position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 200 100">
                  <polyline
                    fill="none"
                    stroke={properties.dataColor}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sampleData.slice(0, 4).map((item, index) => {
                      const maxVal = Math.max(...sampleData.map(d => d.value || 0)) || 1;
                      const y = 80 - ((item.value || 0) / maxVal) * 60;
                      const x = 20 + index * 50;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                  {sampleData.slice(0, 4).map((item, index) => {
                    const maxVal = Math.max(...sampleData.map(d => d.value || 0)) || 1;
                    const y = 80 - ((item.value || 0) / maxVal) * 60;
                    const x = 20 + index * 50;
                    return (
                      <g key={index}>
                        <circle 
                          cx={x} 
                          cy={y} 
                          r="4" 
                          fill={properties.dataColor} 
                          stroke={properties.backgroundColor} 
                          strokeWidth="2"
                          style={{ filter: properties.showShadow ? `drop-shadow(${properties.shadowOffsetX || 2}px ${properties.shadowOffsetY || 2}px ${properties.shadowBlur || 2}px ${properties.shadowColor || '#000000'}30)` : 'none' }}
                        />
                        <text x={x} y={y - 6} textAnchor="middle" fontSize="8" fill={properties.titleColor}>{item.value}</text>
                      </g>
                    );
                  })}
                </svg>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', px: 2, height: labelSpace, alignItems: 'center' }}>
                {sampleData.slice(0, 4).map((item, index) => (
                  <Typography key={index} variant="caption" sx={{ color: properties.titleColor }}>
                    {item.name}
                  </Typography>
                ))}
              </Box>
            </Box>
          );
          
        case 'data-table':
        case 'table':
          return (
            <Box sx={{ width: '100%', p: 1, mt: properties.showTitle ? 4 : 0 }}>
              <TableContainer 
                component={Paper} 
                sx={{ 
                  maxHeight: 160,
                  border: properties.showBorder ? `1px solid ${properties.borderColor}` : 'none',
                  borderRadius: properties.borderRadius,
                  boxShadow: properties.showShadow ? `${properties.shadowOffsetX || 2}px ${properties.shadowOffsetY || 2}px ${properties.shadowBlur || 8}px ${properties.shadowColor || '#000000'}30` : 'none',
                  overflow: 'hidden'
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {(properties.columnMapping.columns || []).map((col) => (
                        <TableCell key={col} sx={{
                          fontWeight: 'bold',
                          backgroundColor: properties.dataColor,
                          color: '#fff',
                          fontSize: '0.75rem',
                          py: 0.5,
                          borderBottom: properties.showBorder ? `1px solid ${properties.borderColor}` : 'none'
                        }}>
                          {col}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sampleData.slice(0, 4).map((row, rIdx) => (
                      <TableRow key={rIdx} sx={{ 
                        backgroundColor: rIdx % 2 === 0 ? properties.backgroundColor : '#f8f9fa',
                        '&:hover': { backgroundColor: '#e3f2fd' }
                      }}>
                        {(properties.columnMapping.columns || []).map((col, cIdx) => (
                          <TableCell key={cIdx} sx={{ 
                            fontSize: '0.72rem', 
                            py: 0.5,
                            color: properties.titleColor,
                            borderBottom: properties.showBorder ? `1px solid ${properties.borderColor}40` : 'none'
                          }}>
                            {row[col] !== undefined ? row[col] : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          );
          
        default:
          return null;
      }
    };

    return (
      <Box sx={{ 
        width: properties.width,
        height: properties.height,
        maxHeight: '100%',
        backgroundColor: properties.backgroundColor,
        border: properties.showBorder ? `${properties.borderWidth ?? 2}px solid ${properties.borderColor}` : 'none',
        borderRadius: properties.borderRadius,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: properties.showShadow ? `${properties.shadowOffsetX || 4}px ${properties.shadowOffsetY || 4}px ${properties.shadowBlur || 20}px ${properties.shadowColor || '#000000'}40` : 'none',
        transition: 'all 0.3s ease',
        overflow: 'auto',
        flexShrink: 0,
        transform: 'scale(1)',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: properties.showShadow ? `${(properties.shadowOffsetX || 4) + 2}px ${(properties.shadowOffsetY || 4) + 2}px ${(properties.shadowBlur || 20) + 5}px ${properties.shadowColor || '#000000'}60` : 'none'
        }
      }}>
        {properties.showTitle && (
          <Typography
            variant="h6"
            sx={{
              color: properties.titleColor,
              position: 'absolute',
              top: 20,
              left: 20,
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            {properties.title || 'Chart nomi'}
          </Typography>
        )}
        
        {/* Real-time Chart Preview */}
        {renderChartPreview()}
        
        {/* Chart Info */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: 20, 
          left: 20, 
          right: 20,
          textAlign: 'center'
        }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            {properties.width} × {properties.height}px
          </Typography>
          
          {/* Shadow Info */}
          {properties.showShadow && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem' }}>
                Soya: {properties.shadowOffsetX || 4}px X, {properties.shadowOffsetY || 4}px Y, {properties.shadowBlur || 20}px
              </Typography>
            </Box>
          )}
          
          {/* Sample Data Info */}
          {sampleData.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, justifyContent: 'center' }}>
              {sampleData.slice(0, 3).map((item, index) => (
                <Chip
                  key={index}
                  label={`${item.name || item.value}: ${item.value || '...'}`}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: '0.6rem', 
                    height: '18px',
                    backgroundColor: properties.backgroundColor,
                    borderColor: properties.borderColor
                  }}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>
    );
  };

  const renderColorPicker = (field, label, currentColor) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ minWidth: 140 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
      </Box>
      <Box
        sx={{
          width: 40,
          height: 40,
          backgroundColor: currentColor,
          border: '2px solid #e0e0e0',
          borderRadius: 2,
          cursor: 'pointer',
          '&:hover': { borderColor: '#1976d2' },
          transition: 'all 0.2s ease'
        }}
        onClick={() => {
          setActiveColorField(field);
          setColorPickerOpen(true);
        }}
        title="Palitradan tanlash"
      />
      <input
        type="color"
        value={currentColor}
        onChange={(e) => handlePropertyChange(field, e.target.value)}
        style={{ width: 44, height: 40, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer' }}
        title="Rang tanlash"
      />
      <TextField
        label="Hex"
        value={currentColor}
        onChange={(e) => handlePropertyChange(field, e.target.value)}
        size="small"
        sx={{ width: 140 }}
        inputProps={{ maxLength: 7 }}
      />
    </Box>
  );

  if (!visualization || !dataset) return null;

  const chartTypeOptions = getChartTypeOptions();
  const requiredFields = getRequiredFields();

  return (
    <>
      <Dialog 
        open={open} 
        onClose={onClose}
        maxWidth={false}
        fullWidth={false}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            width: '95vw',
            maxWidth: '95vw',
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 3, 
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <SettingsIcon sx={{ color: '#1976d2', fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: '#1976d2' }}>
                {visualization.name} - Xususiyatlar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Dataset: {dataset.name} | {dataset.rows.length} qator, {dataset.columns.length} ustun
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="large" sx={{ color: '#666' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: 'flex', height: '70vh' }}>
            {/* Left Side - Properties */}
            <Box sx={{ flex: 1, p: 3, overflow: 'auto', minWidth: 0 }}>
              <Grid container spacing={4}>
                
                {/* GROUP 1: Basic Properties */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <TitleIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600 }}>
                        Asosiy xususiyatlar
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Sarlavha"
                          value={properties.title}
                          onChange={(e) => handlePropertyChange('title', e.target.value)}
                          size="medium"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth size="medium">
                          <InputLabel>Chart turi</InputLabel>
                          <Select
                            value={properties.chartType}
                            onChange={(e) => handlePropertyChange('chartType', e.target.value)}
                            label="Chart turi"
                            variant="outlined"
                          >
                            {chartTypeOptions.map(option => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* GROUP 2: Column Mapping */}
                {renderColumnMapping()}

                {/* GROUP 3: Dimensions */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <AspectRatioIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                        O'lchamlar
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={4}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Kenglik (px)"
                          type="number"
                          value={properties.width}
                          onChange={(e) => handlePropertyChange('width', Number(e.target.value))}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">px</InputAdornment>,
                            inputProps: { min: 100, step: 1 }
                          }}
                          size="medium"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Balandlik (px)"
                          type="number"
                          value={properties.height}
                          onChange={(e) => handlePropertyChange('height', Number(e.target.value))}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">px</InputAdornment>,
                            inputProps: { min: 200, max: 600, step: 10 }
                          }}
                          size="medium"
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* GROUP 4: Colors */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <ColorLensIcon sx={{ color: '#9c27b0', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 600 }}>
                        Ranglar
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        {renderColorPicker('backgroundColor', 'Orqa fon rangi', properties.backgroundColor)}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {renderColorPicker('borderColor', 'Chegara rangi', properties.borderColor)}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {renderColorPicker('titleColor', 'Sarlavha rangi', properties.titleColor)}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {renderColorPicker('dataColor', "Ma'lumotlar rangi", properties.dataColor)}
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* GROUP 5: Shadow Settings */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <ShadowIcon sx={{ color: '#607d8b', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ color: '#607d8b', fontWeight: 600 }}>
                        Soya sozlamalari
                      </Typography>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={properties.showShadow !== false}
                              onChange={(e) => handlePropertyChange('showShadow', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Soyani ko'rsatish"
                          sx={{ '& .MuiFormControlLabel-label': { fontWeight: 500 } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        {renderColorPicker('shadowColor', 'Soya rangi', properties.shadowColor)}
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" sx={{ mb: 2, color: '#666', fontWeight: 600 }}>
                          Soya sozlamalari:
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Soya qalinligi (px)"
                          value={properties.shadowBlur ?? 20}
                          onChange={(e) => handlePropertyChange('shadowBlur', Number(e.target.value))}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">px</InputAdornment>,
                            inputProps: { min: 0, max: 50, step: 1 }
                          }}
                          size="medium"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="X yo'nalish (px)"
                          value={properties.shadowOffsetX ?? 4}
                          onChange={(e) => handlePropertyChange('shadowOffsetX', Number(e.target.value))}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">px</InputAdornment>,
                            inputProps: { min: -20, max: 20, step: 1 }
                          }}
                          size="medium"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Y yo'nalish (px)"
                          value={properties.shadowOffsetY ?? 4}
                          onChange={(e) => handlePropertyChange('shadowOffsetY', Number(e.target.value))}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">px</InputAdornment>,
                            inputProps: { min: -20, max: 20, step: 1 }
                          }}
                          size="medium"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            <strong>Hozirgi soya:</strong> {properties.shadowOffsetX || 4}px X, {properties.shadowOffsetY || 4}px Y, {properties.shadowBlur || 20}px qalinlik, {properties.shadowColor || '#000000'} rang
                          </Typography>
                          {/* Visual Shadow Preview */}
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2, 
                            mt: 1,
                            p: 1,
                            backgroundColor: '#fff',
                            borderRadius: 1,
                            border: '1px solid #ddd'
                          }}>
                            <Box sx={{ 
                              width: 40, 
                              height: 40, 
                              backgroundColor: '#fff',
                              borderRadius: 1,
                              border: '1px solid #ccc',
                              boxShadow: properties.showShadow ? `${properties.shadowOffsetX || 4}px ${properties.shadowOffsetY || 4}px ${properties.shadowBlur || 20}px ${properties.shadowColor || '#000000'}40` : 'none'
                            }} />
                            <Typography variant="caption" color="text.secondary">
                              Soya ko'rinishi
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* GROUP 6: Display Options */}
                <Grid item xs={12}>
                  <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <ViewModuleIcon sx={{ color: '#ed6c02', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ color: '#ed6c02', fontWeight: 600 }}>
                        Ko'rsatish imkoniyatlari
                      </Typography>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={properties.showBorder}
                              onChange={(e) => handlePropertyChange('showBorder', e.target.checked)}
                              color="primary"
                            />
                          }
                          label="Chegarani ko'rsatish"
                          sx={{ '& .MuiFormControlLabel-label': { fontWeight: 500 } }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Chegara radius (px)"
                          value={properties.borderRadius ?? 5}
                          onChange={(e) => handlePropertyChange('borderRadius', Number(e.target.value))}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">px</InputAdornment>,
                            inputProps: { min: 0, max: 20, step: 1 }
                          }}
                          size="medium"
                          variant="outlined"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Chegara qalinligi (px)"
                          value={properties.borderWidth ?? 2}
                          onChange={(e) => handlePropertyChange('borderWidth', Number(e.target.value))}
                          InputProps={{
                            endAdornment: <InputAdornment position="end">px</InputAdornment>,
                            inputProps: { min: 0, max: 10, step: 1 }
                          }}
                          size="medium"
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

                        {/* Right Side - Live Preview */}
            <Box sx={{ flex: 1, p: 3, borderLeft: '1px solid #e0e0e0', backgroundColor: '#fafafa', minWidth: 0 }}>
              {/* Preview Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                <Box sx={{ 
                  width: 8, 
                  height: 8, 
                  borderRadius: '50%', 
                  backgroundColor: '#4caf50',
                  animation: 'pulse 2s infinite',
                  '@keyframes pulse': {
                    '0%': { opacity: 1 },
                    '50%': { opacity: 0.5 },
                    '100%': { opacity: 1 }
                  }
                }} />
                <Typography variant="subtitle2" sx={{ color: '#1976d2', fontWeight: 600 }}>
                  Live Preview - Real-time ko'rinish
                </Typography>
              </Box>
              
              {/* Chart ko'rinishi (scrollable area, content can exceed panel width) */}
              <Box sx={{ width: '100%', overflow: 'auto' }}>
                <Box key={JSON.stringify(properties)} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%' }}>
                {renderVisualizationPreview()}
              </Box>
              </Box>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2, borderTop: '2px solid #e0e0e0' }}>
          {onDelete && (
            <Button
              color="error"
              variant="outlined"
              size="large"
              onClick={() => {
                onDelete(visualization.id);
                onClose();
              }}
              sx={{ px: 3 }}
            >
              O'chirish
            </Button>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Button onClick={onClose} variant="outlined" size="large" sx={{ px: 3 }}>
            Bekor qilish
          </Button>
          <Button onClick={handleSave} variant="contained" size="large" sx={{ 
            backgroundColor: '#1976d2',
            px: 4,
            '&:hover': { backgroundColor: '#1565c0' }
          }}>
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>

      {/* Color Picker Modal */}
      <Dialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0'
        }}>
          Rang tanlash
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box>
            <Typography variant="body1" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
              {activeColorField === 'backgroundColor' && 'Orqa fon rangi'}
              {activeColorField === 'borderColor' && 'Chegara rangi'}
              {activeColorField === 'titleColor' && 'Sarlavha rangi'}
              {activeColorField === 'dataColor' && 'Ma\'lumotlar rangi'}
            </Typography>
            
            {/* Color Palette */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
              {[
                '#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#d32f2f',
                '#ffffff', '#f5f5f5', '#e0e0e0', '#333333', '#666666',
                '#ff9800', '#4caf50', '#2196f3', '#e91e63', '#795548',
                '#607d8b', '#ff5722', '#00bcd4', '#8bc34a', '#ffc107'
              ].map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 50,
                    height: 50,
                    backgroundColor: color,
                    border: '3px solid #e0e0e0',
                    borderRadius: 2,
                    cursor: 'pointer',
                    '&:hover': { 
                      borderColor: '#1976d2',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => handleColorChange(activeColorField, color)}
                />
              ))}
            </Box>

            <TextField
              fullWidth
              label="Maxsus rang (hex kod)"
              value={properties[activeColorField]}
              onChange={(e) => handlePropertyChange(activeColorField, e.target.value)}
              placeholder="#000000"
              variant="outlined"
              size="medium"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setColorPickerOpen(false)} variant="outlined">
            Yopish
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default VisualizationPropertiesModal; 