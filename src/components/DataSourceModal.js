import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  TextField,
  IconButton,
  Chip,
  Divider,
  Alert,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@mui/material';
import {
  Close as CloseIcon,
  Storage as StorageIcon,
  TableChart as TableChartIcon,
  Upload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  TableView as TableViewIcon,
  Transform as TransformIcon,
  DataObject as DataObjectIcon
} from '@mui/icons-material';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

const DataSourceModal = ({ open, onClose, onDatasetUpload, onDatasetSelect }) => {
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState(null);
  const [connectionData, setConnectionData] = useState({});
  const [fileData, setFileData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [uploadedDataset, setUploadedDataset] = useState(null);

  const dataSources = [
    {
      id: 'csv',
      name: 'CSV Fayl',
      icon: <TableChartIcon sx={{ fontSize: 40, color: '#1976d2' }} />,
      description: 'Comma-separated values fayl',
      type: 'file',
      extensions: ['.csv']
    },
    {
      id: 'excel',
      name: 'Excel Fayl',
      icon: <TableViewIcon sx={{ fontSize: 40, color: '#4caf50' }} />,
      description: 'Microsoft Excel fayl (.xlsx, .xls)',
      type: 'file',
      extensions: ['.xlsx', '.xls']
    },
    {
      id: 'txt',
      name: 'Text Fayl',
      icon: <DescriptionIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      description: 'Oddiy text fayl',
      type: 'file',
      extensions: ['.txt']
    },
    {
      id: 'sqlserver',
      name: 'SQL Server',
      icon: <StorageIcon sx={{ fontSize: 40, color: '#e91e63' }} />,
      description: 'Microsoft SQL Server database',
      type: 'database',
      fields: ['server', 'database', 'username', 'password', 'port']
    },
    {
      id: 'oracle',
      name: 'Oracle Database',
      icon: <StorageIcon sx={{ fontSize: 40, color: '#f44336' }} />,
      description: 'Oracle Database server',
      type: 'database',
      fields: ['host', 'port', 'service', 'username', 'password']
    },
    {
      id: 'postgresql',
      name: 'PostgreSQL',
      icon: <StorageIcon sx={{ fontSize: 40, color: '#2196f3' }} />,
      description: 'PostgreSQL database server',
      type: 'database',
      fields: ['host', 'port', 'database', 'username', 'password']
    },
    {
      id: 'mysql',
      name: 'MySQL',
      icon: <StorageIcon sx={{ fontSize: 40, color: '#ff9800' }} />,
      description: 'MySQL database server',
      type: 'database',
      fields: ['host', 'port', 'database', 'username', 'password']
    },
    {
      id: 'mssql',
      name: 'MS SQL',
      icon: <StorageIcon sx={{ fontSize: 40, color: '#9c27b0' }} />,
      description: 'Microsoft SQL Server (ODBC)',
      type: 'database',
      fields: ['dsn', 'username', 'password']
    }
  ];

  const handleSourceSelect = (source) => {
    setSelectedSource(source);
    setConnectionData({});
    setFileData({});
    setError('');
  };

  const handleConnectionChange = (field, value) => {
    setConnectionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileData(prev => ({
        ...prev,
        file: file,
        fileName: file.name
      }));
    }
  };

  const handleUpload = async () => {
    if (!selectedSource) return;

    setUploading(true);
    setError('');

    try {
      if (selectedSource.type === 'file') {
        await handleFileUpload();
      } else if (selectedSource.type === 'database') {
        await handleDatabaseConnection();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async () => {
    const { file, datasetName } = fileData;
    
    if (!file || !datasetName) {
      throw new Error('Fayl va dataset nomi kerak');
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          let parsedData;
          
          if (selectedSource.id === 'csv') {
            const csv = event.target.result;
            parsedData = Papa.parse(csv, { header: true });
          } else if (selectedSource.id === 'txt') {
            // Text fayl uchun oddiy qatorlarga ajratish
            const lines = event.target.result.split('\n');
            const headers = lines[0].split('\t').filter(h => h.trim());
            const rows = lines.slice(1).map(line => {
              const values = line.split('\t');
              const row = {};
              headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
              });
              return row;
            }).filter(row => Object.values(row).some(v => v !== ''));
            
            parsedData = { data: rows, meta: { fields: headers } };
          } else if (selectedSource.id === 'excel') {
            const workbook = XLSX.read(event.target.result, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // Assuming the first row is headers and subsequent rows are data
            const headers = jsonData[0];
            const rows = jsonData.slice(1).map(row => {
              const dataRow = {};
              headers.forEach((header, index) => {
                dataRow[header] = row[index] || '';
              });
              return dataRow;
            });

            parsedData = { data: rows, meta: { fields: headers } };
          } else {
            throw new Error(`Fayl formati ${selectedSource.name} uchun qo'llab-quvvatlanmaydi`);
          }

          const columns = parsedData.meta.fields;
          const rows = parsedData.data.filter(row => 
            Object.values(row).some(v => v !== '')
          );

          const newDataset = {
            _id: Date.now().toString(),
            name: datasetName,
            source: selectedSource.name,
            columns,
            rows,
            createdAt: new Date().toISOString()
          };

          setUploadedDataset(newDataset);
          setShowChoiceModal(true);
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Fayl o\'qishda xatolik'));
      
      // Excel fayllar uchun ArrayBuffer, boshqalar uchun text
      if (selectedSource.id === 'excel') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handleDatabaseConnection = async () => {
    // Database connection uchun placeholder
    // Real implementation da bu yerda database connection va query execution bo'ladi
    throw new Error('Database connection hali implement qilinmagan');
  };

  const handleClose = () => {
    setSelectedSource(null);
    setConnectionData({});
    setFileData({});
    setError('');
    onClose();
  };

  const renderSourceSelection = () => (
    <Grid container spacing={2}>
      {dataSources.map((source) => (
        <Grid item xs={12} sm={6} md={4} key={source.id}>
          <Card 
            sx={{ 
              height: '100%',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
              }
            }}
          >
            <CardActionArea 
              onClick={() => handleSourceSelect(source)}
              sx={{ height: '100%', p: 2 }}
            >
              <CardContent sx={{ textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {source.icon}
                </Box>
                <Typography variant="h6" gutterBottom>
                  {source.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {source.description}
                </Typography>
                {source.type === 'file' && (
                  <Box sx={{ mt: 1 }}>
                    {source.extensions.map(ext => (
                      <Chip 
                        key={ext} 
                        label={ext} 
                        size="small" 
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                )}
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderFileUpload = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {selectedSource.name} yuklash
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Dataset nomi"
            value={fileData.datasetName || ''}
            onChange={(e) => setFileData(prev => ({ ...prev, datasetName: e.target.value }))}
            placeholder="Dataset nomini kiriting"
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12}>
          <input
            accept={selectedSource.id === 'excel' ? '.xlsx,.xls' : selectedSource.extensions.join(',')}
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              fullWidth
              startIcon={<UploadIcon />}
              sx={{ py: 2, borderStyle: 'dashed' }}
            >
              {fileData.fileName ? fileData.fileName : `${selectedSource.name} tanlang`}
            </Button>
          </label>
        </Grid>
      </Grid>
    </Box>
  );

  const renderDatabaseConnection = () => (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {selectedSource.name} ga ulanish
      </Typography>
      
      <Grid container spacing={2}>
        {selectedSource.fields.map((field) => (
          <Grid item xs={12} sm={6} key={field}>
            <TextField
              fullWidth
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              type={field === 'password' ? 'password' : 'text'}
              value={connectionData[field] || ''}
              onChange={(e) => handleConnectionChange(field, e.target.value)}
              placeholder={`${field} kiriting`}
              variant="outlined"
            />
          </Grid>
        ))}
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="SQL Query (ixtiyoriy)"
            multiline
            rows={3}
            value={connectionData.query || ''}
            onChange={(e) => handleConnectionChange('query', e.target.value)}
            placeholder="SELECT * FROM table_name"
            variant="outlined"
          />
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
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
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CloudUploadIcon sx={{ color: '#1976d2', fontSize: 28 }} />
          <Typography variant="h5">
            Ma'lumot manbai qo'shish
          </Typography>
        </Box>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {!selectedSource ? (
          renderSourceSelection()
        ) : (
          <Box>
            <Button 
              onClick={() => setSelectedSource(null)}
              startIcon={<StorageIcon />}
              sx={{ mb: 2 }}
            >
              Boshqa manbaa tanlash
            </Button>
            
            <Divider sx={{ mb: 2 }} />
            
            {selectedSource.type === 'file' && renderFileUpload()}
            {selectedSource.type === 'database' && renderDatabaseConnection()}
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      {selectedSource && (
        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Bekor qilish
          </Button>
          <Button 
            onClick={handleUpload}
            variant="contained"
            disabled={uploading}
            startIcon={uploading ? null : <UploadIcon />}
          >
            {uploading ? 'Yuklanmoqda...' : 'Yuklash'}
          </Button>
        </DialogActions>
      )}

      {/* Choice Modal */}
      <Dialog 
        open={showChoiceModal} 
        onClose={() => setShowChoiceModal(false)}
        maxWidth="lg"
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
          justifyContent: 'space-between',
          position: 'relative'
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold', 
              color: '#1976d2',
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center'
            }}
          >
            Ma'lumotlar muvaffaqiyatli yuklandi! 🎉
          </Typography>
          <IconButton
            onClick={() => setShowChoiceModal(false)}
            sx={{
              color: (theme) => theme.palette.grey[500],
              '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
              ml: 'auto'
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              <strong>{uploadedDataset?.name}</strong> dataseti muvaffaqiyatli yuklandi.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
              <Chip label={`${uploadedDataset?.rows?.length || 0} qator`} color="primary" />
              <Chip label={`${uploadedDataset?.columns?.length || 0} ustun`} color="secondary" />
              <Chip label={uploadedDataset?.source} variant="outlined" />
            </Box>
          </Box>

          {/* Data Preview */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ color: '#333', mb: 2 }}>
              Top 10 qator ko'rinishi:
            </Typography>
            
            <Box sx={{ 
              maxHeight: '300px', 
              overflow: 'auto', 
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              backgroundColor: '#fff'
            }}>
              <TableContainer>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      {uploadedDataset?.columns?.map((column, index) => (
                        <TableCell 
                          key={index} 
                          sx={{ 
                            fontWeight: 'bold', 
                            backgroundColor: '#f5f5f5',
                            fontSize: '0.8rem',
                            padding: '8px 4px'
                          }}
                        >
                          {column}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {uploadedDataset?.rows?.slice(0, 10).map((row, rowIndex) => (
                      <TableRow key={rowIndex} hover>
                        {uploadedDataset?.columns?.map((column, colIndex) => (
                          <TableCell 
                            key={colIndex}
                            sx={{ 
                              fontSize: '0.75rem',
                              padding: '4px',
                              maxWidth: '150px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {row[column] !== undefined ? String(row[column]) : ''}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          <Typography variant="h6" gutterBottom sx={{ color: '#666', textAlign: 'center', mb: 3 }}>
            Keyingi qadamni tanlang:
          </Typography>

          <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
            <Grid item xs={12} sm={5}>
              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={() => {
                  onDatasetUpload(uploadedDataset);
                  setShowChoiceModal(false);
                  handleClose();
                }}
                sx={{ 
                  py: 1.5,
                  backgroundColor: '#4caf50',
                  '&:hover': { backgroundColor: '#45a049' },
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}
                startIcon={<DataObjectIcon sx={{ fontSize: 20 }} />}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1rem' }}>
                    Dashboard ga yuklash
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                    Datasetni to'g'ridan-to'g'ri Dashboard ga yuklash va ishlatish
                  </Typography>
                </Box>
              </Button>
            </Grid>

            <Grid item xs={12} sm={5}>
              <Button
                variant="contained"
                size="small"
                fullWidth
                onClick={() => {
                  if (onDatasetSelect) {
                    onDatasetSelect(uploadedDataset);
                  } else {
                    setShowChoiceModal(false);
                    handleClose();
                    navigate('/transform-data', { state: { dataset: uploadedDataset } });
                  }
                }}
                sx={{ 
                  py: 1.5,
                  backgroundColor: '#ff9800',
                  '&:hover': { backgroundColor: '#f57c00' },
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                  boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
                }}
                startIcon={<TransformIcon sx={{ fontSize: 20 }} />}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5, fontSize: '1rem' }}>
                    Transform Data
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                    Ma'lumotlarni tahrirlash, tozalash va transformatsiya qilish
                  </Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default DataSourceModal;
