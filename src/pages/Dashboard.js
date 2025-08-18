import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, Typography, Grid, Card, CardContent, IconButton, Tooltip, Tabs, Tab, IconButton as MuiIconButton, Dialog, DialogTitle, DialogContent, DialogActions, Chip } from '@mui/material';
import { Analytics as AnalyticsIcon, Settings as SettingsIcon, Add as AddIcon, Close as CloseIcon, ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';
import { ReactFlow, Controls, Background, useReactFlow, Panel } from 'reactflow';
import { useLocation } from 'react-router-dom';
import 'reactflow/dist/style.css';

// Import components
import HeaderComponent from '../components/HeaderComponent';
import SidebarComponent from '../components/SidebarComponent';
import VisualizationsSidebar from '../components/VisualizationsSidebar';
import DatasetsSidebar from '../components/DatasetsSidebar';
import MiniSidebar from '../components/MiniSidebar';
import VisualizationPropertiesModal from '../components/VisualizationPropertiesModal';
import DataSourceModal from '../components/DataSourceModal';
import BarChartComponent from '../components/BarChartComponent';
import PieChartComponent from '../components/PieChartComponent';
import LineChartComponent from '../components/LineChartComponent';
import DataTableComponent from '../components/DataTableComponent';
import DraggableVisualization from '../components/DraggableVisualization';

function Dashboard() {
  const location = useLocation();
  const [datasets, setDatasets] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dataSourceModalOpen, setDataSourceModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [visualizationsSidebarOpen, setVisualizationsSidebarOpen] = useState(false);
  const [datasetsSidebarOpen, setDatasetsSidebarOpen] = useState(false);
  const [relationships, setRelationships] = useState([]);
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false);
  const [selectedVisualization, setSelectedVisualization] = useState(null);
  const [pages, setPages] = useState([
    { id: 'page1', name: 'Page 1', visualizations: [] }
  ]);
  const [currentPage, setCurrentPage] = useState('page1');
  const [deletePageModalOpen, setDeletePageModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);
  const [pageZoomLevels, setPageZoomLevels] = useState({});

  // Check for openDataSourceModal state from location
  useEffect(() => {
    if (location.state?.openDataSourceModal) {
      setDataSourceModalOpen(true);
      // Clear the state to prevent reopening
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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

  // localStorage dan pages ni o'qish
  const loadPagesFromStorage = () => {
    try {
      const savedPages = localStorage.getItem('bi-pages');
      if (savedPages) {
        return JSON.parse(savedPages);
      }
    } catch (error) {
      console.error('Error loading pages from localStorage:', error);
    }
    return [{ id: 'page1', name: 'Page 1', visualizations: [] }];
  };

  // localStorage ga pages ni saqlash
  const savePagesToStorage = (pagesToSave) => {
    try {
      localStorage.setItem('bi-pages', JSON.stringify(pagesToSave));
    } catch (error) {
      console.error('Error saving pages to localStorage:', error);
    }
  };

  // localStorage dan visualizations ni o'qish (eski versiya uchun)
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



  // localStorage dan relationships ni o'qish
  const loadRelationshipsFromStorage = () => {
    try {
      const savedRelationships = localStorage.getItem('bi-relationships');
      if (savedRelationships) {
        return JSON.parse(savedRelationships);
      }
    } catch (error) {
      console.error('Error loading relationships from localStorage:', error);
    }
    return [];
  };

  // localStorage ga relationships ni saqlash
  const saveRelationshipsToStorage = (relationshipsToSave) => {
    try {
      localStorage.setItem('bi-relationships', JSON.stringify(relationshipsToSave));
    } catch (error) {
      console.error('Error saving relationships to localStorage:', error);
    }
  };

  useEffect(() => {
    // Avval localStorage dan ma'lumotlarni o'qish
    const savedDatasets = loadDatasetsFromStorage();
    const savedSelected = loadSelectedFromStorage();
    const savedPages = loadPagesFromStorage();
    const savedRelationships = loadRelationshipsFromStorage();
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

    // Pages va relationships ni yuklash
    setPages(savedPages);
    setRelationships(savedRelationships);
    
    // Eski localStorage'dan visualizations ni yuklash (agar pages bo'sh bo'lsa)
    if (savedPages.length === 0 && savedVisualizations.length > 0) {
      const defaultPage = {
        id: 'page1',
        name: 'Page 1',
        visualizations: savedVisualizations
      };
      setPages([defaultPage]);
      setCurrentPage('page1');
    }
  }, []);

  useEffect(() => {
    if (dataSourceModalOpen) {
      setDataSourceModalOpen(false); // Ensure it's closed after opening
      setDataSourceModalOpen(true); // Re-open it
    }
  }, [dataSourceModalOpen]);

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
    const updatedPages = pages.map(page => ({
      ...page,
      visualizations: page.visualizations.filter(v => v.datasetId !== datasetId)
    }));
    setPages(updatedPages);
    savePagesToStorage(updatedPages);
  };

  const handleClearAllData = () => {
    setDatasets(demoDatasets);
    setSelected(demoDatasets[0]);
    
    // Barcha sahifalardan visualizations larni o'chirish
    const updatedPages = pages.map(page => ({
      ...page,
      visualizations: []
    }));
    setPages(updatedPages);
    savePagesToStorage(updatedPages);
    
    saveDatasetsToStorage(demoDatasets);
    saveSelectedToStorage(demoDatasets[0]);
  };

  const handleDataSourceClick = () => {
    setDataSourceModalOpen(true);
  };

  const handleDataSourceModalClose = () => {
    setDataSourceModalOpen(false);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleVisualizationsToggle = () => {
    setVisualizationsSidebarOpen(!visualizationsSidebarOpen);
  };

  const handleDatasetsToggle = () => {
    setDatasetsSidebarOpen(!datasetsSidebarOpen);
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
        width: 400, // Oldingi holiga qaytarildi
        height: 300, // Oldingi holiga qaytarildi
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

    // Joriy sahifaga visualization qo'shish
    const updatedPages = pages.map(page => {
      if (page.id === currentPage) {
        return {
          ...page,
          visualizations: [...page.visualizations, newVisualization]
        };
      }
      return page;
    });

    setPages(updatedPages);
    savePagesToStorage(updatedPages);
  };

  const handleDeleteVisualization = (visualizationId) => {
    const updatedPages = pages.map(page => {
      if (page.id === currentPage) {
        return {
          ...page,
          visualizations: page.visualizations.filter(v => v.id !== visualizationId)
        };
      }
      return page;
    });

    setPages(updatedPages);
    savePagesToStorage(updatedPages);
  };

  const handleEditVisualization = (visualization) => {
    setSelectedVisualization(visualization);
    setPropertiesModalOpen(true);
  };

  const handleSaveVisualization = (updatedVisualization) => {
    console.log('Saving visualization:', updatedVisualization);
    
    const updatedPages = pages.map(page => {
      if (page.id === currentPage) {
        return {
          ...page,
          visualizations: page.visualizations.map(v => 
            v.id === updatedVisualization.id ? updatedVisualization : v
          )
        };
      }
      return page;
    });
    
    setPages(updatedPages);
    savePagesToStorage(updatedPages);
    
    // Force re-render by updating the selected visualization
    if (selectedVisualization && selectedVisualization.id === updatedVisualization.id) {
      setSelectedVisualization(updatedVisualization);
    }
    
    // Close the modal
    setPropertiesModalOpen(false);
  };

  // Sahifa qo'shish
  const handleAddPage = () => {
    const newPageId = `page${pages.length + 1}`;
    const newPage = {
      id: newPageId,
      name: `Page ${pages.length + 1}`,
      visualizations: []
    };
    
    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    savePagesToStorage(updatedPages);
  };

  // Sahifa o'chirish modalini ochish
  const handleDeletePageClick = (pageId) => {
    setPageToDelete(pageId);
    setDeletePageModalOpen(true);
  };

  // Sahifa o'chirish
  const handleDeletePage = () => {
    if (!pageToDelete || pages.length <= 1) return; // Kamida 1 sahifa qolishi kerak
    
    const updatedPages = pages.filter(page => page.id !== pageToDelete);
    setPages(updatedPages);
    savePagesToStorage(updatedPages);
    
    // Agar o'chirilgan sahifa tanlangan bo'lsa, boshqa sahifaga o'tish
    if (currentPage === pageToDelete) {
      setCurrentPage(updatedPages[0].id);
    }
    
    // Modal'ni yopish
    setDeletePageModalOpen(false);
    setPageToDelete(null);
  };

  // Sahifaga o'tish
  const handlePageChange = (event, newPageId) => {
    setCurrentPage(newPageId);
  };

  // Zoom funksiyalari
  const handleZoomIn = (pageId) => {
    setPageZoomLevels(prev => ({
      ...prev,
      [pageId]: Math.min((prev[pageId] || 1) * 1.2, 3)
    }));
  };

  const handleZoomOut = (pageId) => {
    setPageZoomLevels(prev => ({
      ...prev,
      [pageId]: Math.max((prev[pageId] || 1) / 1.2, 0.3)
    }));
  };

  const handleZoomReset = (pageId) => {
    setPageZoomLevels(prev => ({
      ...prev,
      [pageId]: 0.7 // Default 70% zoom ga qaytarish
    }));
  };

  const getCurrentZoomLevel = (pageId) => {
    return pageZoomLevels[pageId] || 0.7; // Default 70% zoom
  };

  // Joriy sahifaning visual'larini olish
  const getCurrentPageVisualizations = () => {
    const currentPageData = pages.find(page => page.id === currentPage);
    return currentPageData ? currentPageData.visualizations : [];
  };

  const getChartData = (dataset, columnMapping = {}, chartType = 'bar-chart', aggregation = { value: 'none' }) => {
    console.log('getChartData called with:', { dataset, columnMapping, chartType, aggregation });
    
    if (!dataset || !dataset.columns || dataset.columns.length < 2) {
      console.log('Invalid dataset, returning empty array');
      return [];
    }
    
    console.log('Original dataset:', dataset);
    console.log('Column mapping:', columnMapping);
    console.log('Chart type:', chartType);
    console.log('Aggregation:', aggregation);
    
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
        let aggregationType = 'none';
        switch ((agg?.value || 'none')) {
          case 'sum':
            value = rec.sum;
            aggregationType = 'sum';
            break;
          case 'avg':
            value = rec.count > 0 ? rec.sum / rec.count : 0;
            aggregationType = 'avg';
            break;
          case 'count':
            value = rec.count;
            aggregationType = 'count';
            break;
          default:
            // none → take first value (or sum as fallback)
            value = rec.count > 0 ? rec.sum / rec.count : 0;
            aggregationType = 'none';
        }
        // Create aggregated column name if aggregation is applied
        const resultRow = {};
        resultRow[keyField] = key;
        if (aggregationType !== 'none') {
          resultRow[`${valueField}_${aggregationType}`] = value;
        } else {
          resultRow[valueField] = value;
        }
        result.push(resultRow);
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
            // Extract column names from column mapping objects
            const labelColName = typeof labelCol === 'string' ? labelCol : labelCol.name;
            const valueColName = typeof valueCol === 'string' ? valueCol : valueCol.name;
            
            if ((aggregation?.value || 'none') === 'none') {
              const chartData = processedRows.slice(0, 10).map(row => ({
                [labelColName]: row[labelColName] || 'Unknown',
                [valueColName]: row[valueColName] || 0
              }));
              console.log('Pie chart data (none):', chartData);
              return chartData;
            }
            const chartData = aggregateBy(processedRows, labelColName, valueColName, aggregation);
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
            // Extract column names from column mapping objects
            const categoryColName = typeof categoryCol === 'string' ? categoryCol : categoryCol.name;
            const barValueColName = typeof barValueCol === 'string' ? barValueCol : barValueCol.name;
            
            if ((aggregation?.value || 'none') === 'none') {
              const chartData = processedRows.slice(0, 10).map(row => ({
                name: row[categoryColName] || 'Unknown',
                value: row[barValueColName] || 0
              }));
              console.log('Bar chart data (none):', chartData);
              return chartData;
            }
            const chartData = aggregateBy(processedRows, categoryColName, barValueColName, aggregation);
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
            // Extract column names from column mapping objects
            const lineCategoryColName = typeof lineCategoryCol === 'string' ? lineCategoryCol : lineCategoryCol.name;
            const lineValueColName = typeof lineValueCol === 'string' ? lineValueCol : lineValueCol.name;
            
            if ((aggregation?.value || 'none') === 'none') {
              const chartData = processedRows.slice(0, 10).map(row => ({
                name: row[lineCategoryColName] || 'Unknown',
                value: row[lineValueColName] || 0
              }));
              console.log('Line chart data (none):', chartData);
              return chartData;
            }
            const chartData = aggregateBy(processedRows, lineCategoryColName, lineValueColName, aggregation);
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
    const config = {
      ...visualization.config,
      columnMapping: visualization.config?.columnMapping || {},
      aggregation: visualization.config?.aggregation || { value: 'none' }
    };
    const selectedDatasets = config.selectedDatasets || [visualization.datasetId];
    
    console.log('renderVisualization called with:', {
      visualization,
      config,
      selectedDatasets,
      datasets
    });
    
    // Find the dataset that this visualization belongs to
    // First try to find by datasetId, then by datasetName, then by columnMapping
    let visualizationDataset = null;
    
    if (visualization.datasetId) {
      visualizationDataset = datasets.find(d => d._id === visualization.datasetId);
    }
    
    if (!visualizationDataset && visualization.datasetName) {
      visualizationDataset = datasets.find(d => d.name === visualization.datasetName);
    }
    
    if (!visualizationDataset && config.columnMapping) {
      // Try to find dataset that contains the mapped columns
      for (const dataset of datasets) {
        if (dataset.columns && Array.isArray(dataset.columns)) {
          const hasRequiredColumns = Object.values(config.columnMapping).every(colName => {
            if (!colName) return true;
            return dataset.columns.some(col => 
              col === colName || (typeof col === 'object' && col.name === colName)
            );
          });
          if (hasRequiredColumns) {
            visualizationDataset = dataset;
            break;
          }
        }
      }
    }
    
    if (!visualizationDataset) {
      console.log('Visualization dataset not found, trying to use any available dataset');
      visualizationDataset = datasets[0]; // Use first available dataset as fallback
    }
    
    console.log('Visualization dataset found:', visualizationDataset);
    
    // Use the found dataset
    const primaryDataset = visualizationDataset;
    const columnMapping = config.columnMapping || {};
    
    console.log('Primary dataset:', primaryDataset);
    console.log('Column mapping:', columnMapping);
    console.log('Visualization type:', visualization.type);
    console.log('Aggregation config:', config.aggregation);
    
    // Generate chart data using the primary dataset
    const chartData = getChartData(primaryDataset, columnMapping, visualization.type, config.aggregation || { value: 'none' });
    
    console.log('Generated chart data:', chartData);

    // Chart container styling with all new properties
    const containerStyle = {
      width: visualization.size?.width || config.width || 400,
      height: visualization.size?.height || config.height || 300,
      minWidth: 'fit-content',
      minHeight: 'fit-content',
      backgroundColor: config.backgroundColor || '#ffffff',
      border: config.showBorder !== false ? `${config.borderWidth ?? 1}px solid ${config.borderColor || '#e0e0e0'}` : 'none',
      borderRadius: config.borderRadius ?? 3,
      padding: config.showTitle ? '8px 8px 6px 8px' : '6px',
      position: 'relative',
      boxShadow: config.showShadow !== false ? `${config.shadowOffsetX || 2}px ${config.shadowOffsetY || 2}px ${config.shadowBlur || 10}px ${config.shadowColor || '#000000'}20` : 'none',
      transition: 'all 0.3s ease',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      resize: 'both' // Chart'larni resize qilish mumkin
    };

    // Common title component
    const renderTitle = () => {
      if (!config.showTitle) return (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 0.25 }}>
          <IconButton size="small" onClick={() => handleEditVisualization(visualization)} sx={{ color: '#1976d2' }} title="Xususiyatlar">
            <SettingsIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDeleteVisualization(visualization.id)} sx={{ color: '#f44336', ml: 0.5 }} title="O'chirish">
            ×
          </IconButton>
        </Box>
      );
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.25 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              color: config.titleColor || '#333333',
              fontWeight: 600,
              fontSize: '0.875rem'
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
          ...primaryDataset,
          columns: columnsToDisplay,
          rows: chartData
        };
        return (
          <Box sx={containerStyle}>
            {renderTitle()}
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              flex: 1, 
              overflow: 'hidden', 
              p: 0.5,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'stretch'
            }}>
              <Box sx={{ width: '100%', height: '100%' }}>
                <DataTableComponent 
                  key={`${visualization.id}-${JSON.stringify(config.columnMapping?.columns)}`}
                  dataset={filteredDataset}
                  title=""
                  config={config}
                />
              </Box>
            </Box>
          </Box>
        );
      }
      case 'bar-chart':
        return (
          <Box sx={containerStyle}>
            {renderTitle()}
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              flex: 1, 
              overflow: 'hidden', 
              p: 0.5,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'stretch'
            }}>
              <Box sx={{ width: '100%', height: '100%' }}>
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
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              flex: 1, 
              overflow: 'hidden', 
              p: 0.5,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'stretch'
            }}>
              <Box sx={{ width: '100%', height: '100%' }}>
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
            <Box sx={{ 
              width: '100%', 
              height: '100%', 
              flex: 1, 
              overflow: 'hidden', 
              p: 0.5,
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'stretch'
            }}>
              <Box sx={{ width: '100%', height: '100%' }}>
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
        onDataSourceClick={handleDataSourceClick}
        onClearAllData={handleClearAllData}
        onSidebarToggle={handleSidebarToggle}
        onVisualizationsToggle={handleVisualizationsToggle}
        onDatasetsToggle={handleDatasetsToggle}
      />

      {/* Mini Sidebar */}
      <MiniSidebar />

      {/* Main Content */}
      <Box p={2} sx={{ pl: '60px', pt: '80px' }}>



        {/* Visualizations with React Flow */}
        {getCurrentPageVisualizations().length > 0 ? (
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: 'calc(100vh - 160px)', // Sahifalar uchun joy qoldirib, ozgina kattalashtirildi
            minWidth: '600px', // Chap tomondan bo'sh joyni yanada kamaytirish
            maxWidth: '90%', // O'ng tomondan ham cheklash
            backgroundColor: '#f8f9fa',
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            overflow: 'hidden',
            mb: '60px', // Sahifalar uchun pastdan joy (kichraytirildi)
            mx: 'auto' // Markazga joylashish
          }}>
            {/* Zoom Controls */}
            <Box sx={{ 
              position: 'absolute', 
              top: 10, 
              right: 10, 
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: 2,
              p: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <Chip 
                label={`${Math.round(getCurrentZoomLevel(currentPage) * 100)}%`}
                size="small"
                sx={{ 
                  backgroundColor: '#1976d2', 
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              <IconButton
                size="small"
                onClick={() => handleZoomOut(currentPage)}
                disabled={getCurrentZoomLevel(currentPage) <= 0.3}
                sx={{ color: '#666' }}
              >
                <ZoomOutIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleZoomReset(currentPage)}
                sx={{ color: '#666' }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>70%</Typography>
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleZoomIn(currentPage)}
                disabled={getCurrentZoomLevel(currentPage) >= 3}
                sx={{ color: '#666' }}
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* React Flow Container */}
            <Box sx={{ 
              width: '100%', 
              height: '100%',
              transform: `scale(${getCurrentZoomLevel(currentPage)})`,
              transformOrigin: 'top left',
              transition: 'transform 0.3s ease',
              overflow: 'visible',
              position: 'relative'
            }}>
              {getCurrentPageVisualizations().map((visualization, index) => (
                <DraggableVisualization
                  key={visualization.id}
                  visualization={visualization}
                  currentZoomLevel={getCurrentZoomLevel(currentPage)}
                  initialPosition={visualization.position || { 
                    x: (index % 3) * 420, // Oldingi holiga qaytarildi
                    y: Math.floor(index / 3) * 320  // Oldingi holiga qaytarildi
                  }}
                  onPositionChange={(vizId, newPosition) => {
                    const updatedPages = pages.map(page => {
                      if (page.id === currentPage) {
                        return {
                          ...page,
                          visualizations: page.visualizations.map(v => 
                            v.id === vizId ? { ...v, position: newPosition } : v
                          )
                        };
                      }
                      return page;
                    });
                    setPages(updatedPages);
                    savePagesToStorage(updatedPages);
                  }}
                  onSizeChange={(vizId, newSize) => {
                    console.log('🔄 Dashboard onSizeChange:', { vizId, newSize });
                    
                    // Minimum o'lchamlarni tekshirish
                    const minWidth = 300;
                    const minHeight = 200;
                    const adjustedSize = {
                      width: Math.max(newSize.width, minWidth),
                      height: Math.max(newSize.height, minHeight)
                    };
                    
                    const updatedPages = pages.map(page => {
                      if (page.id === currentPage) {
                        return {
                          ...page,
                          visualizations: page.visualizations.map(v => 
                            v.id === vizId ? { ...v, size: adjustedSize } : v
                          )
                        };
                      }
                      return page;
                    });
                    
                    console.log('📊 Updated Pages:', updatedPages);
                    
                    setPages(updatedPages);
                    savePagesToStorage(updatedPages);
                  }}
                >
                  {renderVisualization(visualization)}
                </DraggableVisualization>
              ))}
            </Box>
          </Box>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8, 
            backgroundColor: '#fff', 
            borderRadius: 2,
            border: '2px dashed #e0e0e0',
            mb: '60px' // Sahifalar uchun pastdan joy (kichraytirildi)
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {`${pages.find(p => p.id === currentPage)?.name || 'Page'} da hali hech qanday visualization qo'shilmagan`}
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

                {/* Sahifalar - Dashboard'ning eng pastida, fixed position bilan */}
        <Box sx={{ 
          position: 'fixed',
          bottom: 10,
          left: '80px',
          right: 10,
          backgroundColor: '#fff', 
          borderRadius: 1, 
          border: '1px solid #e0e0e0',
          p: 1,
          zIndex: 1000,
          boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Sahifalar ro'yxati - horizontal scroll bilan */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5, 
              flex: 1,
              overflowX: 'auto',
              '&::-webkit-scrollbar': {
                height: '4px'
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f1f1f1',
                borderRadius: '2px'
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#c1c1c1',
                borderRadius: '2px'
              },
              '&::-webkit-scrollbar-thumb:hover': {
                backgroundColor: '#a8a8a8'
              }
            }}>
              {pages.map((page) => (
                <Box
                  key={page.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 1.5,
                    py: 0.5,
                    backgroundColor: currentPage === page.id ? '#1976d2' : '#f5f5f5',
                    color: currentPage === page.id ? '#fff' : '#333',
                    borderRadius: 1,
                    cursor: 'pointer',
                    border: currentPage === page.id ? '1px solid #1976d2' : '1px solid transparent',
                    '&:hover': {
                      backgroundColor: currentPage === page.id ? '#1565c0' : '#e0e0e0'
                    },
                    minWidth: 'fit-content',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => setCurrentPage(page.id)}
                >
                  <Typography variant="caption" sx={{ fontWeight: 500, fontSize: '0.75rem' }}>
                    {page.name}
                  </Typography>
                  
                  {/* Close icon - faqat 1 dan ortiq sahifa bo'lsa */}
                  {pages.length > 1 && (
                    <MuiIconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePageClick(page.id);
                      }}
                      sx={{ 
                        p: 0.25, 
                        color: currentPage === page.id ? '#fff' : '#666',
                        '&:hover': { 
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          color: '#fff'
                        }
                      }}
                    >
                      <CloseIcon sx={{ fontSize: '0.875rem' }} />
                    </MuiIconButton>
                  )}
                </Box>
              ))}
            </Box>
            
            {/* Add Page button - + iconka bilan */}
            <MuiIconButton
              onClick={handleAddPage}
              sx={{
                backgroundColor: '#4caf50',
                color: '#fff',
                '&:hover': { backgroundColor: '#45a049' },
                width: 28,
                height: 28,
                flexShrink: 0
              }}
            >
              <AddIcon sx={{ fontSize: '1rem' }} />
            </MuiIconButton>
          </Box>
        </Box>
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

      {/* Datasets Sidebar */}
      <DatasetsSidebar
        open={datasetsSidebarOpen}
        onClose={() => setDatasetsSidebarOpen(false)}
        datasets={datasets}
        selectedDataset={selected}
        onDatasetSelect={handleDatasetSelect}
        onDeleteDataset={handleDeleteDataset}
      />


      {/* Visualization Properties Modal */}
      <VisualizationPropertiesModal
        open={propertiesModalOpen}
        onClose={() => setPropertiesModalOpen(false)}
        visualization={selectedVisualization}
        datasets={datasets}
        onSave={handleSaveVisualization}
      />

      {/* File Upload Modal */}
      <DataSourceModal
        open={dataSourceModalOpen}
        onClose={handleDataSourceModalClose}
        onDatasetUpload={handleDatasetUpload}
      />

      {/* Delete Page Confirmation Modal */}
      <Dialog
        open={deletePageModalOpen}
        onClose={() => setDeletePageModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
            🗑️ Sahifani o'chirish
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {`"${pages.find(p => p.id === pageToDelete)?.name || 'Page'}" sahifasini o'chirishni xohlaysizmi?`}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bu sahifadagi barcha visual'lar ham o'chiriladi va bu amalni qaytarib bo'lmaydi.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button
            onClick={() => setDeletePageModalOpen(false)}
            variant="outlined"
            color="primary"
          >
            Bekor qilish
          </Button>
          <Button
            onClick={handleDeletePage}
            variant="contained"
            color="error"
            startIcon={<CloseIcon />}
          >
            Sahifani o'chirish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Dashboard; 