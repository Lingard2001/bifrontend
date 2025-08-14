import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  CardHeader,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Dataset as DatasetIcon,
  ViewColumn as ViewColumnIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MiniSidebar from '../components/MiniSidebar';
import HeaderComponent from '../components/HeaderComponent';
import DatasetsSidebar from '../components/DatasetsSidebar';

const DataView = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [columnFilters, setColumnFilters] = useState({});


  // Load datasets from localStorage
  useEffect(() => {
    const loadDatasetsFromStorage = () => {
      try {
        const savedDatasets = localStorage.getItem('bi-datasets');
        if (savedDatasets) {
          const parsedDatasets = JSON.parse(savedDatasets);
          setDatasets(parsedDatasets);
          if (parsedDatasets.length > 0) {
            setSelectedDataset(parsedDatasets[0]);
            setFilteredData(parsedDatasets[0].rows);
          }
        }
      } catch (error) {
        console.error('Error loading datasets from localStorage:', error);
      }
    };

    loadDatasetsFromStorage();
  }, []);

  // Update filtered data when dataset changes
  useEffect(() => {
    if (selectedDataset) {
      setFilteredData(selectedDataset.rows);
      setPage(0);
      setSearchTerm('');
      setSortColumn('');
      setSortDirection('asc');
      setColumnFilters({});
    }
  }, [selectedDataset]);

  // Apply filters and search
  useEffect(() => {
    if (!selectedDataset) return;

    let filtered = [...selectedDataset.rows];

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row => 
        Object.values(row).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        filtered = filtered.filter(row => 
          String(row[column]).toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        
        if (aVal === bVal) return 0;
        
        const comparison = aVal < bVal ? -1 : 1;
        return sortDirection === 'asc' ? comparison : -comparison;
      });
    }

    setFilteredData(filtered);
    setPage(0);
  }, [selectedDataset, searchTerm, sortColumn, sortDirection, columnFilters]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleColumnFilter = (column, value) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleExportData = () => {
    if (!selectedDataset) return;

    const csvContent = [
      selectedDataset.columns.join(','),
      ...filteredData.map(row => 
        selectedDataset.columns.map(col => 
          JSON.stringify(row[col] || '')
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDataset.name}_export.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDatasetSelect = (dataset) => {
    setSelectedDataset(dataset);
  };

  const renderDatasetInfo = () => {
    if (!selectedDataset) return null;

    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader
              title="Dataset ma'lumotlari"
              titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
              avatar={<DatasetIcon sx={{ color: '#1976d2', fontSize: 32 }} />}
            />
            <CardContent>
              <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
                {selectedDataset.name}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip 
                  icon={<ViewColumnIcon />} 
                  label={`${selectedDataset.rows.length} qator`} 
                  size="large" 
                  color="primary"
                />
                <Chip 
                  icon={<ViewColumnIcon />} 
                  label={`${selectedDataset.columns.length} ustun`} 
                  size="large" 
                  color="secondary"
                />
              </Box>
              
              <Typography variant="body2" color="text.secondary">
                Ko'rsatilmoqda: {filteredData.length} qator
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardHeader
              title="Filtrlar va qidiruv"
              titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
              avatar={<FilterIcon sx={{ color: '#ed6c02', fontSize: 32 }} />}
            />
            <CardContent>
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
                }}
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={() => {
                    setSearchTerm('');
                    setColumnFilters({});
                    setSortColumn('');
                    setSortDirection('asc');
                  }}
                  size="small"
                >
                  Tozalash
                </Button>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportData}
                  size="small"
                >
                  Export
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderDataTable = () => {
    if (!selectedDataset) return null;

    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    return (
      <Card elevation={3}>
        <CardHeader
          title="Ma'lumotlar jadvali"
          titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
          avatar={<ViewColumnIcon sx={{ color: '#2e7d32', fontSize: 32 }} />}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip 
                label={`${filteredData.length} qator`} 
                color="info" 
                variant="outlined"
              />
            </Box>
          }
        />
        <CardContent>
          <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {selectedDataset.columns.map((column) => (
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
                        {sortColumn === column && (
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
                  {selectedDataset.columns.map((column) => (
                    <TableCell key={column} sx={{ backgroundColor: '#fafafa', py: 1 }}>
                      <TextField
                        size="small"
                        placeholder={`${column} bo'yicha filtrlash...`}
                        value={columnFilters[column] || ''}
                        onChange={(e) => handleColumnFilter(column, e.target.value)}
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
                  <TableRow key={startIndex + index} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                    {selectedDataset.columns.map((column) => (
                      <TableCell key={column} sx={{ fontSize: '0.85rem', py: 1 }}>
                        {row[column] !== undefined ? String(row[column]) : ''}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="Qatorlar soni:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} / ${count}`}
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <HeaderComponent 
        onUploadClick={() => navigate('/')} 
        onClearAllData={() => {}}
        onSidebarToggle={() => {}}
        onVisualizationsToggle={() => navigate('/')}
      />

      {/* Mini Sidebar */}
      <MiniSidebar />

      {/* Content */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 3, 
        pl: '80px', 
        pr: '300px', 
        pt: '80px'
      }}>
        {selectedDataset ? (
          <>
            {/* Dataset Info */}
            {renderDatasetInfo()}
            
            {/* Data Table */}
            {renderDataTable()}
          </>
        ) : (
          <Card elevation={3} sx={{ 
            p: 4, 
            textAlign: 'center',
            mr: '300px'
          }}>
            <InfoIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Dataset topilmadi
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Ma'lumotlarni ko'rish uchun avval dataset yuklang
            </Typography>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
            >
              Dashboard ga qaytish
            </Button>
          </Card>
        )}
      </Box>

      {/* Datasets Sidebar - Always Visible */}
      <DatasetsSidebar
        open={true}
        onClose={() => {}} // No close functionality needed
        datasets={datasets}
        selectedDataset={selectedDataset}
        onDatasetSelect={handleDatasetSelect}
        alwaysVisible={true}
      />
    </Box>
  );
};

export default DataView; 