import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, Grid, Card, CardContent, IconButton, Tooltip } from '@mui/material';
import { Analytics as AnalyticsIcon, Settings as SettingsIcon } from '@mui/icons-material';

// Import components
import HeaderComponent from '../components/HeaderComponent';
import SidebarComponent from '../components/SidebarComponent';
import VisualizationsSidebar from '../components/VisualizationsSidebar';
import MiniSidebar from '../components/MiniSidebar';
import VisualizationPropertiesModal from '../components/VisualizationPropertiesModal';
import FileUploadModal from '../components/FileUploadModal';
import BarChartComponent from '../components/BarChartComponent';
import PieChartComponent from '../components/PieChartComponent';
import LineChartComponent from '../components/LineChartComponent';
import DataTableComponent from '../components/DataTableComponent';

function Dashboard() {
  const [datasets, setDatasets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visualizationsSidebarOpen, setVisualizationsSidebarOpen] = useState(false);
  const [visualizations, setVisualizations] = useState([]);
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState(null);

  // Demo data
  const demoDatasets = [
    {
      _id: '1',
      name: 'Sales Data 2024',
      columns: ['Month', 'Sales', 'Profit', 'Region'],
      rows: [
        { Month: 'January', Sales: 12000, Profit: 3000, Region: 'North' },
        { Month: 'February', Sales: 15000, Profit: 4000, Region: 'North' },
        { Month: 'March', Sales: 18000, Profit: 5000, Region: 'South' },
        { Month: 'April', Sales: 14000, Profit: 3500, Region: 'South' },
        { Month: 'May', Sales: 22000, Profit: 6000, Region: 'East' },
        { Month: 'June', Sales: 25000, Profit: 7000, Region: 'East' }
      ]
    },
    {
      _id: '2',
      name: 'Customer Analytics',
      columns: ['Age', 'Income', 'Spending', 'Category'],
      rows: [
        { Age: '18-25', Income: 30000, Spending: 5000, Category: 'Student' },
        { Age: '26-35', Income: 60000, Spending: 12000, Category: 'Professional' },
        { Age: '36-45', Income: 80000, Spending: 18000, Category: 'Manager' },
        { Age: '46-55', Income: 90000, Spending: 22000, Category: 'Executive' },
        { Age: '56+', Income: 70000, Spending: 15000, Category: 'Retired' }
      ]
    }
  ];

  // localStorage dan ma'lumotlarni o'qish
  const loadDatasetsFromStorage = () => {
    try {
      const savedDatasets = localStorage.getItem('bi-datasets');
      if (savedDatasets) {
        return JSON.parse(savedDatasets);
      }
    } catch (error) {
      console.error('Error loading datasets from localStorage:', error);
    }
    return null;
  };

  // localStorage ga ma'lumotlarni saqlash
  const saveDatasetsToStorage = (datasetsToSave) => {
    try {
      localStorage.setItem('bi-datasets', JSON.stringify(datasetsToSave));
    } catch (error) {
      console.error('Error saving datasets to localStorage:', error);
    }
  };

  // localStorage dan selected dataset ni o'qish
  const loadSelectedFromStorage = () => {
    try {
      const savedSelected = localStorage.getItem('bi-selected-dataset');
      if (savedSelected) {
        return JSON.parse(savedSelected);
      }
    } catch (error) {
      console.error('Error loading selected dataset from localStorage:', error);
    }
    return null;
  };

  // localStorage ga selected dataset ni saqlash
  const saveSelectedToStorage = (selectedDataset) => {
    try {
      if (selectedDataset) {
        localStorage.setItem('bi-selected-dataset', JSON.stringify(selectedDataset));
      } else {
        localStorage.removeItem('bi-selected-dataset');
      }
    } catch (error) {
      console.error('Error saving selected dataset to localStorage:', error);
    }
  };

  // localStorage dan visualizations ni o'qish
  const loadVisualizationsFromStorage = () => {
    try {
      const savedVisualizations = localStorage.getItem('bi-visualizations');
      if (savedVisualizations) {
        return JSON.parse(savedVisualizations);
      }
    } catch (error) {
      console.error('Error loading visualizations from localStorage:', error);
    }
    return [];
  };

  // localStorage ga visualizations ni saqlash
  const saveVisualizationsToStorage = (visualizationsToSave) => {
    try {
      localStorage.setItem('bi-visualizations', JSON.stringify(visualizationsToSave));
    } catch (error) {
      console.error('Error saving visualizations to localStorage:', error);
    }
  };

  useEffect(() => {
    // Avval localStorage dan ma'lumotlarni o'qish
    const savedDatasets = loadDatasetsFromStorage();
    const savedSelected = loadSelectedFromStorage();
    const savedVisualizations = loadVisualizationsFromStorage();

    if (savedDatasets && savedDatasets.length > 0) {
      // Agar localStorage da ma'lumotlar bo'lsa, ularni ishlatish
      setDatasets(savedDatasets);
      if (savedSelected && savedDatasets.find(d => d._id === savedSelected._id)) {
        setSelected(savedSelected);
      } else {
        setSelected(savedDatasets[0]);
      }
    } else {
      // Agar localStorage da ma'lumotlar bo'lmasa, demo ma'lumotlarni ishlatish
      setDatasets(demoDatasets);
      setSelected(demoDatasets[0]);
    }

    // Visualizations ni yuklash
    setVisualizations(savedVisualizations);
  }, []);

  const handleDatasetUpload = (newDataset) => {
    const updatedDatasets = [newDataset, ...datasets];
    setDatasets(updatedDatasets);
    setSelected(newDataset);
    
    // localStorage ga saqlash
    saveDatasetsToStorage(updatedDatasets);
    saveSelectedToStorage(newDataset);
  };

  const handleDatasetSelect = (dataset) => {
    setSelected(dataset);
    saveSelectedToStorage(dataset);
  };



  const handleDeleteDataset = (datasetId) => {
    const updatedDatasets = datasets.filter(dataset => dataset._id !== datasetId);
    setDatasets(updatedDatasets);
    saveDatasetsToStorage(updatedDatasets);
    
    // Agar o'chirilgan dataset tanlangan bo'lsa, uni ham o'chirish
    if (selected?._id === datasetId) {
      setSelected(updatedDatasets[0] || null);
      saveSelectedToStorage(updatedDatasets[0] || null);
    }

    // O'chirilgan dataset ga tegishli visualizations larni ham o'chirish
    const updatedVisualizations = visualizations.filter(v => v.datasetId !== datasetId);
    setVisualizations(updatedVisualizations);
    saveVisualizationsToStorage(updatedVisualizations);
  };

  const handleClearAllData = () => {
    setDatasets(demoDatasets);
    setSelected(demoDatasets[0]);
    setVisualizations([]);
    saveDatasetsToStorage(demoDatasets);
    saveSelectedToStorage(demoDatasets[0]);
    saveVisualizationsToStorage([]);
  };

  const handleUploadClick = () => {
    setUploadModalOpen(true);
  };

  const handleUploadModalClose = () => {
    setUploadModalOpen(false);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleVisualizationsToggle = () => {
    setVisualizationsSidebarOpen(!visualizationsSidebarOpen);
  };

  const handleAddVisualization = (visualType) => {
    if (!selected) return;

    const newVisualization = {
      id: Date.now().toString(),
      type: visualType.id,
      name: visualType.name,
      datasetId: selected._id,
      datasetName: selected.name,
      config: {
        title: visualType.name,
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
        selectedColumns: [],
        columnMapping: {},
        chartType: 'auto'
      },
      createdAt: new Date().toISOString()
    };

    const updatedVisualizations = [...visualizations, newVisualization];
    setVisualizations(updatedVisualizations);
    saveVisualizationsToStorage(updatedVisualizations);
  };

  const handleDeleteVisualization = (visualizationId) => {
    const updatedVisualizations = visualizations.filter(v => v.id !== visualizationId);
    setVisualizations(updatedVisualizations);
    saveVisualizationsToStorage(updatedVisualizations);
  };

  const handleEditVisualization = (visualization) => {
    setSelectedVisualization(visualization);
    setPropertiesModalOpen(true);
  };

  const handleSaveVisualization = (updatedVisualization) => {
    console.log('Saving visualization:', updatedVisualization);
    
    const updatedVisualizations = visualizations.map(v => 
      v.id === updatedVisualization.id ? updatedVisualization : v
    );
    
    setVisualizations(updatedVisualizations);
    saveVisualizationsToStorage(updatedVisualizations);
    
    // Force re-render by updating the selected visualization
    if (selectedVisualization && selectedVisualization.id === updatedVisualization.id) {
      setSelectedVisualization(updatedVisualization);
    }
    
    // Close the modal
    setPropertiesModalOpen(false);
  };

  const getChartData = (dataset, columnMapping = {}, chartType = 'bar-chart', aggregations = { value: 'none' }) => {
    if (!dataset || !dataset.columns || dataset.columns.length < 2) return [];
    
    console.log('Original dataset:', dataset);
    console.log('Column mapping:', columnMapping);
    console.log('Chart type:', chartType);
    console.log('Aggregations:', aggregations);
    
    // CSV dan o'qilgan ma'lumotlarni raqamga o'tkazish
    const processedRows = dataset.rows.map(row => {
      const processedRow = {};
      dataset.columns.forEach(col => {
        const value = row[col];
        // Agar qiymat raqam bo'lsa, uni raqamga o'tkazish
        if (value !== '' && !isNaN(value) && value !== null) {
          processedRow[col] = parseFloat(value);
        } else {
          processedRow[col] = value;
        }
      });
      return processedRow;
    });

    console.log('Processed rows:', processedRows);

    const aggregateBy = (rows, keyField, valueField, agg) => {
      if (!rows || rows.length === 0) return [];
      const map = new Map();
      for (const r of rows) {
        const key = r[keyField] ?? 'Unknown';
        const val = typeof r[valueField] === 'number' ? r[valueField] : 0;
        if (!map.has(key)) {
          map.set(key, { sum: 0, count: 0 });
        }
        const rec = map.get(key);
        rec.sum += val;
        rec.count += 1;
      }
      const result = [];
      for (const [key, rec] of map.entries()) {
        let value = 0;
        switch ((agg?.value || 'none')) {
          case 'sum':
            value = rec.sum;
            break;
          case 'avg':
            value = rec.count > 0 ? rec.sum / rec.count : 0;
            break;
          case 'count':
            value = rec.count;
            break;
          default:
            // none → take first value (or sum as fallback)
            value = rec.count > 0 ? rec.sum / rec.count : 0;
        }
        result.push({ name: key, value });
      }
      return result;
    };
    
    // Column mapping asosida chart data yaratish
    switch (chartType) {
      case 'pie-chart':
        {
          const labelCol = columnMapping.label;
          const valueCol = columnMapping.value;
          if (labelCol && valueCol) {
            if ((aggregations?.value || 'none') === 'none') {
              const chartData = processedRows.slice(0, 10).map(row => ({
                name: row[labelCol] || 'Unknown',
                value: row[valueCol] || 0
              }));
              console.log('Pie chart data (none):', chartData);
              return chartData;
            }
            const chartData = aggregateBy(processedRows, labelCol, valueCol, aggregations);
            console.log('Pie chart data (agg):', chartData);
            return chartData;
          }
        }
        break;
        
      case 'bar-chart':
        {
          const categoryCol = columnMapping.category;
          const barValueCol = columnMapping.value;
          if (categoryCol && barValueCol) {
            if ((aggregations?.value || 'none') === 'none') {
              const chartData = processedRows.slice(0, 10).map(row => ({
                name: row[categoryCol] || 'Unknown',
                value: row[barValueCol] || 0
              }));
              console.log('Bar chart data (none):', chartData);
              return chartData;
            }
            const chartData = aggregateBy(processedRows, categoryCol, barValueCol, aggregations);
            console.log('Bar chart data (agg):', chartData);
            return chartData;
          }
        }
        break;
        
      case 'line-chart':
        {
          const lineCategoryCol = columnMapping.category;
          const lineValueCol = columnMapping.value;
          if (lineCategoryCol && lineValueCol) {
            if ((aggregations?.value || 'none') === 'none') {
              const chartData = processedRows.slice(0, 10).map(row => ({
                name: row[lineCategoryCol] || 'Unknown',
                value: row[lineValueCol] || 0
              }));
              console.log('Line chart data (none):', chartData);
              return chartData;
            }
            const chartData = aggregateBy(processedRows, lineCategoryCol, lineValueCol, aggregations);
            console.log('Line chart data (agg):', chartData);
            return chartData;
          }
        }
        break;
        
      case 'data-table':
      case 'table':
        // Faqat tanlangan ustunlar bo‘yicha yangi massiv qaytarish
        if (columnMapping.columns && Array.isArray(columnMapping.columns) && columnMapping.columns.length > 0) {
          return processedRows.map(row => {
            const filteredRow = {};
            columnMapping.columns.forEach(col => {
              filteredRow[col] = row[col];
            });
            return filteredRow;
          });
        }
        // Agar tanlanmagan bo‘lsa, bo'sh qaytaramiz (jadval bo'sh ko'rinadi)
        return [];
    }
    
    // Fallback: eski usul (selectedColumns)
    if (columnMapping.selectedColumns && columnMapping.selectedColumns.length > 0) {
      const columnsToUse = columnMapping.selectedColumns;
      
      // Raqamli ustunlarni topish
      const numericColumns = columnsToUse.filter(col => 
        processedRows.some(row => typeof row[col] === 'number')
      );
      
      console.log('Numeric columns found (fallback):', numericColumns);
      
      if (numericColumns.length === 0) return [];
      
      const firstNumericCol = numericColumns[0];
      const labelCol = columnsToUse.find(col => col !== firstNumericCol);
      
      const chartData = processedRows.slice(0, 10).map(row => ({
        name: row[labelCol] || 'Unknown',
        value: row[firstNumericCol] || 0
      }));
      
      console.log('Fallback chart data:', chartData);
      return chartData;
    }
    
    return [];
  };

  const renderVisualization = (visualization) => {
    const dataset = datasets.find(d => d._id === visualization.datasetId);
    if (!dataset) return null;

    const config = visualization.config || {};
    // Yangi column mapping yoki eski selectedColumns ni ishlatish
    const columnMapping = config.columnMapping || {};
    const chartData = getChartData(dataset, columnMapping, visualization.type, config.aggregations || { value: 'none' });

    // Chart container styling with all new properties
    const containerStyle = {
      width: config.width || 400,
      height: config.height || 300,
      backgroundColor: config.backgroundColor || '#ffffff',
      border: config.showBorder !== false ? `${config.borderWidth ?? 2}px solid ${config.borderColor || '#e0e0e0'}` : 'none',
      borderRadius: config.borderRadius ?? 5,
      padding: config.showTitle ? '20px 20px 12px 20px' : '12px',
      position: 'relative',
      boxShadow: config.showShadow !== false ? `${config.shadowOffsetX || 4}px ${config.shadowOffsetY || 4}px ${config.shadowBlur || 20}px ${config.shadowColor || '#000000'}40` : 'none',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'visible'
    };

    // Common title component
    const renderTitle = () => {
      if (!config.showTitle) return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
          <IconButton size="small" onClick={() => handleEditVisualization(visualization)} sx={{ color: '#1976d2' }} title="Xususiyatlar">
            <SettingsIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteVisualization(visualization.id)} sx={{ color: '#f44336', ml: 0.5 }} title="O'chirish">
            ×
          </IconButton>
        </Box>
      );
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: config.titleColor || '#333333',
              fontWeight: 600
            }}
          >
            {config.title || visualization.name}
          </Typography>
          <Box>
            <IconButton size="small" onClick={() => handleEditVisualization(visualization)} sx={{ color: '#1976d2' }} title="Xususiyatlar">
              <SettingsIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => handleDeleteVisualization(visualization.id)} sx={{ color: '#f44336', ml: 0.5 }} title="O'chirish">
              ×
            </IconButton>
          </Box>
        </Box>
      );
    };

    switch (visualization.type) {
      case 'data-table':
      case 'table': {
        // Faqat tanlangan ustunlar uchun dataset yaratish
        const columnsToDisplay = (config.columnMapping && Array.isArray(config.columnMapping.columns) && config.columnMapping.columns.length > 0)
          ? config.columnMapping.columns
          : [];
        const filteredDataset = {
          ...dataset,
          columns: columnsToDisplay,
          rows: chartData
        };
        return (
          <Box sx={containerStyle}>
            {renderTitle()}
            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
              <DataTableComponent 
                key={`${visualization.id}-${JSON.stringify(config.columnMapping?.columns)}`}
                dataset={filteredDataset}
                title=""
                config={config}
              />
            </Box>
          </Box>
        );
      }
      case 'bar-chart':
        return (
          <Box sx={containerStyle}>
            {renderTitle()}
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <BarChartComponent 
                  key={`${visualization.id}-${JSON.stringify(config)}`}
                  data={chartData} 
                  title=""
                  config={config}
                />
              </Box>
            </Box>
          </Box>
        );
      case 'line-chart':
        return (
          <Box sx={containerStyle}>
            {renderTitle()}
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <LineChartComponent 
                  key={`${visualization.id}-${JSON.stringify(config)}`}
                  data={chartData} 
                  title=""
                  config={config}
                />
              </Box>
            </Box>
          </Box>
        );
      case 'pie-chart':
        return (
          <Box sx={containerStyle}>
            {renderTitle()}
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex' }}>
              <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                <PieChartComponent 
                  key={`${visualization.id}-${JSON.stringify(config)}`}
                  data={chartData} 
                  title=""
                  config={config}
                />
              </Box>
            </Box>
          </Box>
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <HeaderComponent 
        onUploadClick={handleUploadClick} 
        onClearAllData={handleClearAllData}
        onSidebarToggle={handleSidebarToggle}
        onVisualizationsToggle={handleVisualizationsToggle}
      />

      {/* Mini Sidebar */}
      <MiniSidebar />

      {/* Main Content */}
      <Box p={4} sx={{ pl: '80px', pt: '80px' }}>
        {/* Current Dataset Info */}
        {selected && (
          <Card sx={{ mb: 3, p: 2, backgroundColor: '#e3f2fd' }}>
            <Typography variant="h6" gutterBottom>
              Hozirgi Dataset: {selected.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selected.rows.length} qator, {selected.columns.length} ustun
            </Typography>
          </Card>
        )}

        {/* Visualizations */}
        {visualizations.length > 0 ? (
          <Grid container spacing={3}>
            {visualizations.map((visualization) => (
              <Grid item xs={12} md={6} lg={4} key={visualization.id}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CardContent sx={{ p: 2 }}>
                    {renderVisualization(visualization)}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8, 
            backgroundColor: '#fff', 
            borderRadius: 2,
            border: '2px dashed #e0e0e0'
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Hali hech qanday visualization qo'shilmagan
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Header da "Visualizations" tugmasini bosing va yangi visualization qo'shing
            </Typography>
            <Button
              variant="contained"
              startIcon={<AnalyticsIcon />}
              onClick={handleVisualizationsToggle}
              sx={{ backgroundColor: '#9c27b0' }}
            >
              Visualization qo'shish
            </Button>
          </Box>
        )}
      </Box>

      {/* Sidebar */}
      <SidebarComponent
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        datasets={datasets}
        selectedDataset={selected}
        onDatasetSelect={handleDatasetSelect}
        onDeleteDataset={handleDeleteDataset}
      />

      {/* Visualizations Sidebar */}
      <VisualizationsSidebar
        open={visualizationsSidebarOpen}
        onClose={() => setVisualizationsSidebarOpen(false)}
        onAddVisualization={handleAddVisualization}
        selectedDataset={selected}
      />



      {/* Visualization Properties Modal */}
      <VisualizationPropertiesModal
        open={propertiesModalOpen}
        onClose={() => setPropertiesModalOpen(false)}
        visualization={selectedVisualization}
        dataset={selectedVisualization ? datasets.find(d => d._id === selectedVisualization.datasetId) : null}
        onSave={handleSaveVisualization}
        onDelete={handleDeleteVisualization}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        open={uploadModalOpen}
        onClose={handleUploadModalClose}
        onDatasetUpload={handleDatasetUpload}
      />
    </Box>
  );
}

export default Dashboard; 