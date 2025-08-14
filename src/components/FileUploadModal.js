import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button, 
  Grid, 
  Typography,
  Box,
  IconButton
} from '@mui/material';
import { Close as CloseIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import Papa from 'papaparse';

const FileUploadModal = ({ open, onClose, onDatasetUpload }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [datasetName, setDatasetName] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || !datasetName) return;
    setUploading(true);

    try {
      // CSV faylni parse qilish
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target.result;
        const parsed = Papa.parse(csv, { header: true });
        const columns = parsed.meta.fields;
        const rows = parsed.data.filter(row => Object.values(row).some(v => v !== ''));

        const newDataset = {
          _id: Date.now().toString(),
          name: datasetName,
          columns,
          rows: rows.slice(0, 20) // faqat birinchi 20 qator
        };

        onDatasetUpload(newDataset);
        handleClose();
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('CSV parse error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setDatasetName('');
    setUploading(false);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }
      }}
    >
      <DialogTitle sx={{ 
        m: 0, 
        p: 2, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <UploadIcon sx={{ color: '#1976d2' }} />
          <Typography variant="h6">Upload CSV Dataset</Typography>
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
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Dataset Name"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              placeholder="Enter dataset name"
              variant="outlined"
              size="medium"
            />
          </Grid>
          
          <Grid item xs={12}>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="csv-file-modal"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="csv-file-modal">
              <Button
                variant="outlined"
                component="span"
                fullWidth
                size="large"
                startIcon={<UploadIcon />}
                sx={{ 
                  py: 2,
                  borderStyle: 'dashed',
                  borderWidth: 2,
                  '&:hover': {
                    borderStyle: 'solid',
                    borderWidth: 2
                  }
                }}
              >
                {file ? `Selected: ${file.name}` : 'Choose CSV File'}
              </Button>
            </label>
          </Grid>

          {file && (
            <Grid item xs={12}>
              <Box sx={{ 
                p: 2, 
                backgroundColor: '#e8f5e8', 
                borderRadius: 1,
                border: '1px solid #4caf50'
              }}>
                <Typography variant="body2" color="success.main">
                  ✓ File selected: {file.name}
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!file || !datasetName || uploading}
          startIcon={uploading ? null : <UploadIcon />}
          sx={{ minWidth: 120 }}
        >
          {uploading ? 'Uploading...' : 'Upload Dataset'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUploadModal; 