import React, { useState } from 'react';
import { Card, Typography, TextField, Grid, Button } from '@mui/material';
import Papa from 'papaparse';

const FileUploadComponent = ({ onDatasetUpload }) => {
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
        setFile(null);
        setDatasetName('');
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('CSV parse error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card sx={{ mb: 3, p: 2 }}>
      <Typography variant="h6" gutterBottom>Upload CSV Dataset</Typography>
      
      {/* Upload Section */}
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Dataset Name"
            value={datasetName}
            onChange={(e) => setDatasetName(e.target.value)}
            placeholder="Enter dataset name"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="csv-file"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="csv-file">
            <Button variant="outlined" component="span" fullWidth>
              Choose CSV File
            </Button>
          </label>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={!file || !datasetName || uploading}
            fullWidth
          >
            {uploading ? 'Uploading...' : 'Upload Dataset'}
          </Button>
        </Grid>
      </Grid>
      
      {file && (
        <Typography variant="body2" sx={{ mt: 1, color: 'green' }}>
          Selected: {file.name}
        </Typography>
      )}
    </Card>
  );
};

export default FileUploadComponent; 