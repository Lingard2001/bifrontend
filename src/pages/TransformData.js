import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, IconButton, Chip, Divider, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Select, MenuItem, FormControl, InputLabel, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TablePagination, InputAdornment
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon, Transform as TransformIcon, DataObject as DataObjectIcon, FilterList as FilterIcon, Sort as SortIcon, Edit as EditIcon, Save as SaveIcon, Refresh as RefreshIcon, Visibility as VisibilityIcon, Settings as SettingsIcon, Close as CloseIcon, CloudUpload as CloudUploadIcon, TableView as TableViewIcon, Search as SearchIcon, Clear as ClearIcon, Storage as StorageIcon, Download as DownloadIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import DataSourceModal from '../components/DataSourceModal';

const TransformData = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [dataset, setDataset] = useState(null);
  const [transformedData, setTransformedData] = useState(null);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [sorting, setSorting] = useState({});
  const [previewRows, setPreviewRows] = useState(10);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(new Date());
  const [openDataSourceModal, setOpenDataSourceModal] = useState(false);
  
  // New state for modal
  const [modalDatasetName, setModalDatasetName] = useState('');
  const [modalFile, setModalFile] = useState(null);
  const [modalSqlData, setModalSqlData] = useState({
    server: 'localhost',
    port: '1433',
    database: 'master',
    username: 'sa',
    password: ''
  });
  const [uploading, setUploading] = useState(false);
  
  // Advanced table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Location state dan dataset ni olish
    if (location.state?.dataset) {
      setDataset(location.state.dataset);
      setTransformedData(location.state.dataset);
      
      // Modal state larni yangilash
      setModalDatasetName(location.state.dataset.name || '');
      if (location.state.dataset.source === 'CSV Fayl' || location.state.dataset.source === 'Excel Fayl') {
        setModalFile(null); // Yangi file uchun
      }
      if (location.state.dataset.source?.includes('SQL')) {
        setModalSqlData({
          server: 'localhost',
          port: '1433',
          database: 'master',
          username: 'sa',
          password: ''
        });
      }
    } else {
      navigate('/');
    }
  }, [location.state, navigate]);

  const handleBack = () => {
    navigate('/');
  };

  const handleSaveTransformedData = () => {
    if (transformedData) {
      const savedDatasets = JSON.parse(localStorage.getItem('bi-datasets') || '[]');
      const newDataset = {
        ...transformedData,
        _id: Date.now().toString(),
        name: `${transformedData.name} (Transformed)`,
        createdAt: new Date().toISOString()
      };
      const updatedDatasets = [...savedDatasets, newDataset];
      localStorage.setItem('bi-datasets', JSON.stringify(updatedDatasets));
      navigate('/', { state: { newDataset } });
    }
  };

  // File upload handler
  const handleFileUpload = (file, sourceType) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let newDataset;
        
        if (sourceType === 'CSV Fayl') {
          // CSV parsing
          const csvText = event.target.result;
          const lines = csvText.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          const rows = lines.slice(1).filter(line => line.trim()).map(line => {
            const values = line.split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });

          newDataset = {
            name: modalDatasetName || file.name.replace('.csv', ''),
            columns: headers,
            rows: rows,
            source: 'CSV Fayl',
            createdAt: new Date().toISOString()
          };
        } else if (sourceType === 'Excel Fayl') {
          // Excel parsing (simplified - in real app use xlsx library)
          newDataset = {
            name: modalDatasetName || file.name.replace('.xlsx', '').replace('.xls', ''),
            columns: ['Column1', 'Column2', 'Column3'], // Placeholder
            rows: [{ Column1: 'Data1', Column2: 'Data2', Column3: 'Data3' }], // Placeholder
            source: 'Excel Fayl',
            createdAt: new Date().toISOString()
          };
        }

        if (newDataset) {
          setDataset(newDataset);
          setTransformedData(newDataset);
          setModalDatasetName(newDataset.name);
          setOpenDataSourceModal(false);
          setLastUpdateTime(new Date());
        }
      } catch (error) {
        console.error('File parsing error:', error);
        alert('Fayl o\'qishda xatolik yuz berdi');
      }
    };
    
    reader.readAsText(file);
  };

  // SQL connection handler
  const handleSqlConnection = () => {
    if (!modalSqlData.server || !modalSqlData.database) {
      alert('Server va Database ma\'lumotlarini kiriting');
      return;
    }

    // Simulate SQL connection (in real app, make actual database connection)
    const newDataset = {
      name: modalDatasetName || 'SQL Dataset',
      columns: ['ID', 'Name', 'Value'], // Placeholder columns
      rows: [
        { ID: 1, Name: 'Item 1', Value: 100 },
        { ID: 2, Name: 'Item 2', Value: 200 },
        { ID: 3, Name: 'Item 3', Value: 300 }
      ], // Placeholder data
      source: dataset?.source || 'SQL Server',
      createdAt: new Date().toISOString()
    };

    setDataset(newDataset);
    setTransformedData(newDataset);
    setModalDatasetName(newDataset.name);
    setOpenDataSourceModal(false);
    setLastUpdateTime(new Date());
  };

  // Advanced table functions
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (columnName) => {
    if (sortField === columnName) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(columnName);
      setSortDirection('asc');
    }
  };

  const handleFilter = (columnName, value) => {
    setFilters(prev => ({
      ...prev,
      [columnName]: value
    }));
    setPage(0);
  };

  const clearFilters = () => {
    setFilters({});
    setSearchTerm('');
    setPage(0);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setPage(0);
  };

  // Process data for display
  const getProcessedData = () => {
    if (!transformedData?.rows) return [];

    let processed = [...transformedData.rows];

    // Search filter
    if (searchTerm) {
      processed = processed.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Column filters
    Object.entries(filters).forEach(([column, filterValue]) => {
      if (filterValue) {
        processed = processed.filter(row => 
          String(row[column] || '').toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    // Sorting
    if (sortField && sortDirection) {
      processed.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return processed;
  };

  const processedData = getProcessedData();
  const paginatedData = processedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getColumnType = (columnName) => {
    if (!dataset?.rows?.length) return 'unknown';
    
    const sampleValues = dataset.rows.slice(0, 10).map(row => row[columnName]);
    const numericCount = sampleValues.filter(val => !isNaN(parseFloat(val)) && val !== '').length;
    
    if (numericCount / sampleValues.length > 0.7) return 'numeric';
    return 'categorical';
  };

  const getColumnStats = (columnName) => {
    if (!dataset?.rows?.length) return null;
    
    const values = dataset.rows.map(row => row[columnName]).filter(val => val !== undefined && val !== null && val !== '');
    const type = getColumnType(columnName);
    
    if (type === 'numeric') {
      const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
      return {
        min: Math.min(...numericValues),
        max: Math.max(...numericValues),
        avg: numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length,
        count: numericValues.length
      };
    } else {
      const uniqueValues = [...new Set(values)];
      return {
        unique: uniqueValues.length,
        mostCommon: values.sort((a, b) => 
          values.filter(v => v === a).length - values.filter(v => v === b).length
        ).pop(),
        count: values.length
      };
    }
  };

  if (!dataset) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">Dataset topilmadi</Typography>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Orqaga qaytish
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh', p: 2 }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={handleBack} sx={{ color: '#1976d2' }}>
              <ArrowBackIcon />
            </IconButton>
            <TransformIcon sx={{ color: '#1976d2', fontSize: 32 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                Data Transformation
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {dataset.name} - Ma'lumotlarni tahrirlash va tozalash
              </Typography>
            </Box>
          </Box>
          
          {/* Header Actions */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setTransformedData(dataset);
                setSelectedColumns([]);
                setFilters({});
                setSorting({});
              }}
              startIcon={<RefreshIcon />}
              sx={{ 
                borderColor: '#666',
                color: '#666',
                '&:hover': { 
                  borderColor: '#333',
                  backgroundColor: 'rgba(0,0,0,0.04)'
                }
              }}
            >
              Bekor qilish
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveTransformedData}
              startIcon={<SaveIcon />}
              sx={{ 
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#45a049' }
              }}
            >
              Saqlash
            </Button>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={`${dataset.rows?.length || 0} qator`} color="primary" />
          <Chip label={`${dataset.columns?.length || 0} ustun`} color="secondary" />
          <Chip label="CSV" variant="outlined" />
        </Box>
      </Paper>

      <Grid container spacing={3} sx={{ 
        alignItems: 'flex-start'
      }}>
        {/* Data Preview Panel */}
        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 3, mr: '320px' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Ma'lumotlar ko'rinishi
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  select
                  label="Ko'rsatiladigan qatorlar"
                  value={rowsPerPage}
                  onChange={handleChangeRowsPerPage}
                  size="small"
                  sx={{ minWidth: 150 }}
                >
                  <MenuItem value={5}>5 qator</MenuItem>
                  <MenuItem value={10}>10 qator</MenuItem>
                  <MenuItem value={20}>20 qator</MenuItem>
                  <MenuItem value={50}>50 qator</MenuItem>
                </TextField>
              </Box>
            </Box>

            {/* Search and Filter Bar */}
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={8}>
                  <TextField
                    fullWidth
                    placeholder="Barcha ustunlarda qidirish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                      endAdornment: searchTerm && (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={clearSearch}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={clearFilters}
                      size="small"
                    >
                      Tozalash
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<DownloadIcon />}
                      onClick={() => alert('Export funksiyasi keyin qo\'shiladi')}
                      size="small"
                      sx={{ backgroundColor: '#2e7d32' }}
                    >
                      Export
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {transformedData ? (
              <>
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        {transformedData.columns?.map((column) => (
                          <TableCell 
                            key={column} 
                            sx={{ 
                              fontWeight: 'bold',
                              backgroundColor: '#f5f5f5',
                              cursor: 'pointer',
                              '&:hover': { backgroundColor: '#e0e0e0' }
                            }}
                            onClick={() => handleSort(column)}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {column}
                              {sortField === column && (
                                <SortIcon 
                                  sx={{ 
                                    fontSize: 16,
                                    transform: sortDirection === 'desc' ? 'rotate(180deg)' : 'none'
                                  }} 
                                />
                              )}
                            </Box>
                          </TableCell>
                        ))}
                      </TableRow>
                      <TableRow>
                        {transformedData.columns?.map((column) => (
                          <TableCell key={column} sx={{ backgroundColor: '#fafafa', py: 1 }}>
                            <TextField
                              size="small"
                              placeholder={`${column} bo'yicha filtrlash...`}
                              value={filters[column] || ''}
                              onChange={(e) => handleFilter(column, e.target.value)}
                              sx={{ 
                                '& .MuiInputBase-root': { 
                                  fontSize: '0.8rem',
                                  height: 32
                                }
                              }}
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedData.map((row, index) => (
                        <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                          {transformedData.columns?.map((column) => (
                            <TableCell key={column} sx={{ fontSize: '0.85rem', py: 1 }}>
                              {row[column] !== undefined ? String(row[column]) : ''}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                  component="div"
                  count={processedData.length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 20, 50]}
                  labelRowsPerPage="Qatorlar:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
                />
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <TransformIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                <Typography variant="body1" color="text.secondary">
                  Ma'lumotlar yuklangan
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Sidebar - Simple Info */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ 
            p: 3, 
            height: 'fit-content',
            position: 'fixed',
            top: 40,
            right: 20,
            width: '280px',
            maxHeight: 'calc(100vh - 40px)',
            overflow: 'auto',
            zIndex: 1000,
            backgroundColor: '#fff',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TransformIcon sx={{ color: '#1976d2' }} />
                {dataset?.name || 'Database'}
              </Typography>
              
              {/* Last Update Time */}
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {lastUpdateTime.toLocaleString('uz-UZ', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: false
                }).replace(/\//g, '-')}
              </Typography>
            </Box>
            
            <Divider sx={{ my: 2 }} />

            {/* Source Section */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle2" sx={{ color: '#666', fontWeight: 600 }}>
                  Source:
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    setOpenDataSourceModal(true);
                  }}
                  sx={{ 
                    color: '#1976d2',
                    '&:hover': { 
                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                      transform: 'scale(1.1)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <SettingsIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
              

            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Preview Modal */}
      <Dialog 
        open={showPreviewModal} 
        onClose={() => setShowPreviewModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6">To'liq ma'lumotlar ko'rinishi</Typography>
        </DialogTitle>
        <DialogContent>
          {transformedData && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    {transformedData.columns?.map((column) => (
                      <TableCell key={column} sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                        {column}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transformedData.rows?.map((row, index) => (
                    <TableRow key={index} hover>
                      {transformedData.columns?.map((column) => (
                        <TableCell key={column}>
                          {row[column] !== undefined ? String(row[column]) : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPreviewModal(false)}>
            Yopish
          </Button>
        </DialogActions>
      </Dialog>

      {/* Smart Data Source Modal - Auto-detects source type */}
      <Dialog
        open={openDataSourceModal}
        onClose={() => setOpenDataSourceModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{
          m: 0,
          p: 3,
          backgroundColor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <CloudUploadIcon sx={{ color: '#1976d2', fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Ma'lumot manbai qo'shish
          </Typography>
          <IconButton
            onClick={() => setOpenDataSourceModal(false)}
            sx={{ ml: 'auto', color: '#666' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          {/* Source Selection Button */}
          <Button 
            variant="outlined"
            startIcon={<StorageIcon />}
            sx={{ mb: 3, color: '#1976d2', borderColor: '#1976d2' }}
          >
            BOSHQA MANBAA TANLASH
          </Button>
          
          <Divider sx={{ mb: 3 }} />
          
          {/* Auto-detected Source Section */}
          {dataset?.source === 'CSV Fayl' && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                CSV Fayl yuklash
              </Typography>
              
              {/* Dataset Name Input */}
              <TextField
                fullWidth
                label="Dataset nomi"
                value={modalDatasetName}
                onChange={(e) => setModalDatasetName(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              {/* File Upload Area */}
              <Box sx={{
                border: '2px dashed #1976d2',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#e3f2fd'
                }
              }}>
                <input
                  accept=".csv"
                  style={{ display: 'none' }}
                  id="csv-file-input"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setModalFile(file);
                    }
                  }}
                />
                
                <label htmlFor="csv-file-input" style={{ cursor: 'pointer' }}>
                  <CloudUploadIcon sx={{ fontSize: 48, color: '#1976d2', mb: 1 }} />
                  <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    {modalFile ? modalFile.name : (dataset?.name || 'SALES DATASET(IN).CSV')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                    CSV fayl tanlang yoki bu yerga tashlang
                  </Typography>
                </label>
              </Box>
            </Box>
          )}

          {dataset?.source === 'Excel Fayl' && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Excel Fayl yuklash
              </Typography>
              
              <TextField
                fullWidth
                label="Dataset nomi"
                value={modalDatasetName}
                onChange={(e) => setModalDatasetName(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              <Box sx={{
                border: '2px dashed #4caf50',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                backgroundColor: '#f1f8e9',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#e8f5e8'
                }
              }}>
                <input
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  id="excel-file-input"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setModalFile(file);
                    }
                  }}
                />
                
                <label htmlFor="excel-file-input" style={{ cursor: 'pointer' }}>
                  <TableViewIcon sx={{ fontSize: 48, color: '#4caf50', mb: 1 }} />
                  <Typography variant="body1" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                    {modalFile ? modalFile.name : (dataset?.name || 'EXCEL_DATASET.xlsx')}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                    Excel fayl tanlang yoki bu yerga tashlang
                  </Typography>
                </label>
              </Box>
            </Box>
          )}

          {dataset?.source?.includes('SQL') && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                {dataset?.source} ulanish
              </Typography>
              
              <TextField
                fullWidth
                label="Dataset nomi"
                value={modalDatasetName}
                onChange={(e) => setModalDatasetName(e.target.value)}
                sx={{ mb: 3 }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Server/Host"
                    value={modalSqlData.server}
                    onChange={(e) => setModalSqlData({...modalSqlData, server: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Port"
                    value={modalSqlData.port}
                    onChange={(e) => setModalSqlData({...modalSqlData, port: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Database"
                    value={modalSqlData.database}
                    onChange={(e) => setModalSqlData({...modalSqlData, database: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={modalSqlData.username}
                    onChange={(e) => setModalSqlData({...modalSqlData, username: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={modalSqlData.password}
                    onChange={(e) => setModalSqlData({...modalSqlData, password: e.target.value})}
                    sx={{ mb: 2 }}
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Default case - show general interface */}
          {!dataset?.source && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                Ma'lumot manbai tanlang
              </Typography>
              
              <Typography variant="body1" color="text.secondary">
                Avval ma'lumot manbai turini tanlang
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button 
            onClick={() => setOpenDataSourceModal(false)} 
            variant="outlined"
            sx={{ 
              borderColor: '#1976d2', 
              color: '#1976d2',
              '&:hover': {
                borderColor: '#1565c0',
                backgroundColor: 'rgba(25, 118, 210, 0.04)'
              }
            }}
          >
            BEKOR QILISH
          </Button>
          <Button 
            variant="contained"
            startIcon={<CloudUploadIcon />}
            disabled={uploading}
            onClick={() => {
              // Agar faqat dataset nomi o'zgartirilsa
              if (modalDatasetName && modalDatasetName !== dataset?.name) {
                // Dataset nomini yangilash
                const updatedDataset = {
                  ...dataset,
                  name: modalDatasetName
                };
                setDataset(updatedDataset);
                setTransformedData(updatedDataset);
                setOpenDataSourceModal(false);
                setLastUpdateTime(new Date());
                return;
              }
              
              // Agar file yoki SQL ma'lumotlari o'zgartirilsa
              if (dataset?.source === 'CSV Fayl' && modalFile) {
                handleFileUpload(modalFile, 'CSV Fayl');
              } else if (dataset?.source === 'Excel Fayl' && modalFile) {
                handleFileUpload(modalFile, 'Excel Fayl');
              } else if (dataset?.source?.includes('SQL')) {
                handleSqlConnection();
              } else {
                alert('Iltimos, fayl tanlang yoki ma\'lumotlarni to\'ldiring');
              }
            }}
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': { backgroundColor: '#1565c0' }
            }}
          >
            {uploading ? 'YUKLANMOQDA...' : 'SAQLASH'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransformData;
