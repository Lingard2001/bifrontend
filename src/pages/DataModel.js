import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  ListItemSecondaryAction
} from '@mui/material';
import {
  AccountTree as AccountTreeIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MiniSidebar from '../components/MiniSidebar';
import HeaderComponent from '../components/HeaderComponent';
import DatasetsSidebar from '../components/DatasetsSidebar';

const DataModel = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [relationships, setRelationships] = useState([]);
  const [relationshipModalOpen, setRelationshipModalOpen] = useState(false);
  const [newRelationship, setNewRelationship] = useState({
    sourceDataset: '',
    sourceColumn: '',
    targetDataset: '',
    targetColumn: '',
    relationshipType: 'one-to-many'
  });

  // Smart relationship type detection
  const detectRelationshipType = (sourceDatasetId, sourceColumn, targetDatasetId, targetColumn) => {
    if (!sourceDatasetId || !sourceColumn || !targetDatasetId || !targetColumn) return null;
    
    const sourceDataset = datasets.find(d => d._id === sourceDatasetId);
    const targetDataset = datasets.find(d => d._id === targetDatasetId);
    
    if (!sourceDataset || !targetDataset) return null;
    
    // Get unique values for both columns
    const sourceValues = [...new Set(sourceDataset.rows.map(row => row[sourceColumn]))];
    const targetValues = [...new Set(targetDataset.rows.map(row => row[targetColumn]))];
    
    // Check if source column has unique values (potential primary key)
    const sourceIsUnique = sourceValues.length === sourceDataset.rows.length;
    
    // Check if target column has unique values (potential primary key)
    const targetIsUnique = targetValues.length === targetDataset.rows.length;
    
    // Determine relationship type
    if (sourceIsUnique && !targetIsUnique) {
      return 'one-to-many'; // Source is unique, target is not
    } else if (!sourceIsUnique && targetIsUnique) {
      return 'many-to-one'; // Source is not unique, target is unique
    } else if (sourceIsUnique && targetIsUnique) {
      return 'one-to-one'; // Both are unique
    } else {
      return 'many-to-many'; // Neither is unique
    }
  };

  // Check if relationship can be created
  const canCreateRelationship = () => {
    if (!newRelationship.sourceDataset || !newRelationship.sourceColumn || 
        !newRelationship.targetDataset || !newRelationship.targetColumn) {
      return false;
    }
    
    // Prevent self-relationships
    if (newRelationship.sourceDataset === newRelationship.targetDataset) {
      return false;
    }
    
    // Check if relationship already exists
    const exists = relationships.some(r => 
      (r.sourceDataset === newRelationship.sourceDataset && 
       r.sourceColumn === newRelationship.sourceColumn &&
       r.targetDataset === newRelationship.targetDataset && 
       r.targetColumn === newRelationship.targetColumn) ||
      (r.sourceDataset === newRelationship.targetDataset && 
       r.sourceColumn === newRelationship.targetColumn &&
       r.targetDataset === newRelationship.sourceDataset && 
       r.targetColumn === newRelationship.sourceColumn)
    );
    
    if (exists) return false;
    
    // Check if there are any matching values between the columns
    const sourceDataset = datasets.find(d => d._id === newRelationship.sourceDataset);
    const targetDataset = datasets.find(d => d._id === newRelationship.targetDataset);
    
    if (!sourceDataset || !targetDataset) return false;
    
    // Get unique values from both columns
    const sourceValues = new Set(sourceDataset.rows.map(row => String(row[newRelationship.sourceColumn])));
    const targetValues = new Set(targetDataset.rows.map(row => String(row[newRelationship.targetColumn])));
    
    // Check if there's at least one matching value
    let hasMatchingValues = false;
    for (const sourceValue of sourceValues) {
      if (targetValues.has(sourceValue)) {
        hasMatchingValues = true;
        break;
      }
    }
    
    return hasMatchingValues;
  };


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
          }
        }
      } catch (error) {
        console.error('Error loading datasets from localStorage:', error);
      }
    };

    loadDatasetsFromStorage();
  }, []);

  const handleDatasetSelect = (dataset) => {
    setSelectedDataset(dataset);
  };

  // Load relationships from localStorage
  useEffect(() => {
    const loadRelationshipsFromStorage = () => {
      try {
        const savedRelationships = localStorage.getItem('bi-relationships');
        if (savedRelationships) {
          setRelationships(JSON.parse(savedRelationships));
        }
      } catch (error) {
        console.error('Error loading relationships from localStorage:', error);
      }
    };

    loadRelationshipsFromStorage();
  }, []);

  const saveRelationshipsToStorage = (relationshipsToSave) => {
    try {
      localStorage.setItem('bi-relationships', JSON.stringify(relationshipsToSave));
    } catch (error) {
      console.error('Error saving relationships to localStorage:', error);
    }
  };

  const handleAddRelationship = () => {
    if (newRelationship.sourceDataset && newRelationship.sourceColumn && 
        newRelationship.targetDataset && newRelationship.targetColumn) {
      const relationship = {
        id: Date.now().toString(),
        ...newRelationship,
        createdAt: new Date().toISOString()
      };
      
      const updatedRelationships = [...relationships, relationship];
      setRelationships(updatedRelationships);
      saveRelationshipsToStorage(updatedRelationships);
      
      setNewRelationship({
        sourceDataset: '',
        sourceColumn: '',
        targetDataset: '',
        targetColumn: '',
        relationshipType: 'one-to-many'
      });
      setRelationshipModalOpen(false);
    }
  };

  const handleDeleteRelationship = (relationshipId) => {
    const updatedRelationships = relationships.filter(r => r.id !== relationshipId);
    setRelationships(updatedRelationships);
    saveRelationshipsToStorage(updatedRelationships);
  };

  const getRelationshipTypeLabel = (type) => {
    switch (type) {
      case 'one-to-one':
        return '1:1';
      case 'one-to-many':
        return '1:N';
      case 'many-to-one':
        return 'N:1';
      case 'many-to-many':
        return 'N:N';
      default:
        return type;
    }
  };







  const renderRelationshipsSection = () => {
    return (
      <Card elevation={3}>
        <CardHeader
          title="Datasetlar orasidagi bog'lanishlar"
          titleTypographyProps={{ variant: 'h5', fontWeight: 'bold' }}
          avatar={<AccountTreeIcon sx={{ color: '#ff9800', fontSize: 32 }} />}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setRelationshipModalOpen(true)}
              sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
            >
              Bog'lanish qo'shish
            </Button>
          }
        />
        <CardContent>
          {relationships.length > 0 ? (
            <List>
              {relationships.map((relationship) => {
                const sourceDataset = datasets.find(d => d._id === relationship.sourceDataset);
                const targetDataset = datasets.find(d => d._id === relationship.targetDataset);
                
                return (
                  <ListItem
                    key={relationship.id}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 1,
                      backgroundColor: '#fafafa'
                    }}
                  >
                    <ListItemIcon>
                      <LinkIcon sx={{ color: '#ff9800' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {sourceDataset?.name || 'Unknown'} → {targetDataset?.name || 'Unknown'}
                          </Typography>
                          <Chip
                            label={getRelationshipTypeLabel(relationship.relationshipType)}
                            size="small"
                            color="warning"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Manba:</strong> {sourceDataset?.name || 'Unknown'}.{relationship.sourceColumn}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Maqsad:</strong> {targetDataset?.name || 'Unknown'}.{relationship.targetColumn}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteRelationship(relationship.id)}
                        sx={{ color: '#f44336' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AccountTreeIcon sx={{ fontSize: 64, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Hali hech qanday bog'lanish qo'shilmagan
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Datasetlar orasida bog'lanish yaratish uchun "Bog'lanish qo'shish" tugmasini bosing
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setRelationshipModalOpen(true)}
                sx={{ backgroundColor: '#ff9800', '&:hover': { backgroundColor: '#f57c00' } }}
              >
                Bog'lanish qo'shish
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderRelationshipModal = () => {
    const detectedType = detectRelationshipType(
      newRelationship.sourceDataset, 
      newRelationship.sourceColumn, 
      newRelationship.targetDataset, 
      newRelationship.targetColumn
    );
    
    const canCreate = canCreateRelationship();
    
    return (
      <Dialog
        open={relationshipModalOpen}
        onClose={() => setRelationshipModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)', 
          color: 'white',
          textAlign: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <LinkIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Yangi bog'lanish qo'shish
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 4, pb: 2 }}>
          {/* Smart Relationship Detection Info */}
          {detectedType && (
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              backgroundColor: '#e3f2fd', 
              borderRadius: 2, 
              border: '1px solid #2196f3',
              textAlign: 'center'
            }}>
              <Typography variant="subtitle1" sx={{ color: '#1976d2', fontWeight: 600, mb: 1 }}>
                🧠 Avtomatik aniqlangan bog'lanish turi
              </Typography>
              <Chip 
                label={getRelationshipTypeLabel(detectedType)} 
                color="primary" 
                variant="outlined"
                sx={{ fontSize: '1rem', fontWeight: 600 }}
              />
              <Typography variant="body2" sx={{ color: '#1976d2', mt: 1 }}>
                {detectedType === 'one-to-many' && 'Manba ustun noyob, maqsad ustun takrorlanuvchi'}
                {detectedType === 'many-to-one' && 'Manba ustun takrorlanuvchi, maqsad ustun noyob'}
                {detectedType === 'one-to-one' && 'Ikkala ustun ham noyob'}
                {detectedType === 'many-to-many' && 'Ikkala ustun ham takrorlanuvchi'}
              </Typography>
            </Box>
          )}

          {/* Relationship Creation Form */}
          <Grid container spacing={4}>
            {/* Source Dataset */}
            <Grid item xs={12} md={8}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#666', fontWeight: 600, fontSize: '1rem' }}>
                  📊 Manba dataset
                </InputLabel>
                <Select
                  value={newRelationship.sourceDataset}
                  onChange={(e) => setNewRelationship({
                    ...newRelationship,
                    sourceDataset: e.target.value,
                    sourceColumn: ''
                  })}
                  label="📊 Manba dataset"
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1rem',
                      minHeight: '60px',
                      padding: '12px 16px',
                      backgroundColor: '#fafafa',
                      width: '100%',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        '& fieldset': { borderColor: '#ff9800', borderWidth: 2 }
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#fff',
                        '& fieldset': { borderColor: '#ff9800', borderWidth: 3 }
                      }
                    },
                    '& .MuiSelect-select': {
                      padding: '12px 16px',
                      fontSize: '1rem',
                      fontWeight: 500
                    }
                  }}
                >
                  {datasets.map((dataset) => (
                    <MenuItem key={dataset._id} value={dataset._id} sx={{ fontSize: '1rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          backgroundColor: '#ff9800' 
                        }} />
                        {dataset.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Source Column */}
            <Grid item xs={12} md={8}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#666', fontWeight: 600, fontSize: '1rem' }}>
                  🔗 Manba ustun
                </InputLabel>
                <Select
                  value={newRelationship.sourceColumn}
                  onChange={(e) => setNewRelationship({
                    ...newRelationship,
                    sourceColumn: e.target.value
                  })}
                  label="🔗 Manba ustun"
                  disabled={!newRelationship.sourceDataset}
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1rem',
                      minHeight: '60px',
                      padding: '12px 16px',
                      backgroundColor: '#fafafa',
                      width: '100%',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        '& fieldset': { borderColor: '#ff9800', borderWidth: 2 }
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#fff',
                        '& fieldset': { borderColor: '#ff9800', borderWidth: 3 }
                      }
                    },
                    '& .MuiSelect-select': {
                      padding: '12px 16px',
                      fontSize: '1rem',
                      fontWeight: 500
                    }
                  }}
                >
                  {newRelationship.sourceDataset && datasets.find(d => d._id === newRelationship.sourceDataset)?.columns.map((column) => (
                    <MenuItem key={column} value={column} sx={{ fontSize: '1rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: '#666' 
                        }} />
                        {column}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Target Dataset */}
            <Grid item xs={12} md={8}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#666', fontWeight: 600, fontSize: '1rem' }}>
                  🎯 Maqsad dataset
                </InputLabel>
                <Select
                  value={newRelationship.targetDataset}
                  onChange={(e) => setNewRelationship({
                    ...newRelationship,
                    targetDataset: e.target.value,
                    targetColumn: ''
                  })}
                  label="🎯 Maqsad dataset"
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1rem',
                      minHeight: '60px',
                      padding: '12px 16px',
                      backgroundColor: '#fafafa',
                      width: '100%',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        '& fieldset': { borderColor: '#ff9800', borderWidth: 2 }
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#fff',
                        '& fieldset': { borderColor: '#ff9800', borderWidth: 3 }
                      }
                    },
                    '& .MuiSelect-select': {
                      padding: '12px 16px',
                      fontSize: '1rem',
                      fontWeight: 500
                    }
                  }}
                >
                  {datasets.map((dataset) => (
                    <MenuItem key={dataset._id} value={dataset._id} sx={{ fontSize: '1rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 10, 
                          height: 10, 
                          borderRadius: '50%', 
                          backgroundColor: '#2196f3' 
                        }} />
                        {dataset.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Target Column */}
            <Grid item xs={12} md={8}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#666', fontWeight: 600, fontSize: '1rem' }}>
                  🔗 Maqsad ustun
                </InputLabel>
                <Select
                  value={newRelationship.targetColumn}
                  onChange={(e) => setNewRelationship({
                    ...newRelationship,
                    targetColumn: e.target.value
                  })}
                  label="🔗 Maqsad ustun"
                  disabled={!newRelationship.targetDataset}
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1rem',
                      minHeight: '60px',
                      padding: '12px 16px',
                      backgroundColor: '#fafafa',
                      width: '100%',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        '& fieldset': { borderColor: '#ff9800', borderWidth: 2 }
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#fff',
                        '& fieldset': { borderColor: '#ff9800', borderWidth: 3 }
                      }
                    },
                    '& .MuiSelect-select': {
                      padding: '12px 16px',
                      fontSize: '1rem',
                      fontWeight: 500
                    }
                  }}
                >
                  {newRelationship.targetDataset && datasets.find(d => d._id === newRelationship.targetDataset)?.columns.map((column) => (
                    <MenuItem key={column} value={column} sx={{ fontSize: '1rem' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          backgroundColor: '#666' 
                        }} />
                        {column}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Relationship Type */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: '#666', fontWeight: 600, fontSize: '1rem' }}>
                  🔗 Bog'lanish turi
                </InputLabel>
                <Select
                  value={newRelationship.relationshipType}
                  onChange={(e) => setNewRelationship({
                    ...newRelationship,
                    relationshipType: e.target.value
                  })}
                  label="🔗 Bog'lanish turi"
                  size="large"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1rem',
                      minHeight: '60px',
                      padding: '12px 16px',
                      backgroundColor: '#fafafa',
                      width: '100%',
                      '&:hover': {
                        backgroundColor: '#f5f5f5',
                        '& fieldset': { borderColor: '#ff9800', borderWidth: 2 }
                      },
                      '&.Mui-focused': {
                        backgroundColor: '#fff',
                        '& fieldset': { borderColor: '#ff9800', borderWidth: 3 }
                      }
                    },
                    '& .MuiSelect-select': {
                      padding: '12px 16px',
                      fontSize: '1rem',
                      fontWeight: 500
                    }
                  }}
                >
                  <MenuItem value="one-to-one" sx={{ fontSize: '1rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="1:1" size="small" color="success" />
                      1:1 (Birga bir)
                    </Box>
                  </MenuItem>
                  <MenuItem value="one-to-many" sx={{ fontSize: '1rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="1:N" size="small" color="primary" />
                      1:N (Birga ko'p)
                    </Box>
                  </MenuItem>
                  <MenuItem value="many-to-one" sx={{ fontSize: '1rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="N:1" size="small" color="warning" />
                      N:1 (Ko'pga bir)
                    </Box>
                  </MenuItem>
                  <MenuItem value="many-to-many" sx={{ fontSize: '1rem' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label="N:N" size="small" color="error" />
                      N:N (Ko'pga ko'p)
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Real-time Column Value Previews */}
          {(newRelationship.sourceDataset && newRelationship.sourceColumn) && (
            <Box sx={{ mt: 4, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
              <Typography variant="h6" sx={{ color: '#495057', fontWeight: 600, mb: 2 }}>
                📊 Manba ustun qiymatlari ({newRelationship.sourceColumn})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 120, overflow: 'auto' }}>
                {(() => {
                  const sourceDataset = datasets.find(d => d._id === newRelationship.sourceDataset);
                  if (!sourceDataset) return null;
                  
                  const values = [...new Set(sourceDataset.rows.map(row => row[newRelationship.sourceColumn]))];
                  const isUnique = values.length === sourceDataset.rows.length;
                  
                  return (
                    <>
                      <Chip 
                        label={`${values.length} ta noyob qiymat`} 
                        color={isUnique ? "success" : "warning"} 
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                      {values.slice(0, 10).map((value, index) => (
                        <Chip
                          key={index}
                          label={String(value)}
                          size="small"
                          variant="outlined"
                          sx={{ backgroundColor: '#fff' }}
                        />
                      ))}
                      {values.length > 10 && (
                        <Chip
                          label={`+${values.length - 10} ta boshqa`}
                          size="small"
                          variant="outlined"
                          sx={{ backgroundColor: '#fff', fontStyle: 'italic' }}
                        />
                      )}
                    </>
                  );
                })()}
              </Box>
            </Box>
          )}

          {(newRelationship.targetDataset && newRelationship.targetColumn) && (
            <Box sx={{ mt: 3, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
              <Typography variant="h6" sx={{ color: '#495057', fontWeight: 600, mb: 2 }}>
                🎯 Maqsad ustun qiymatlari ({newRelationship.targetColumn})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 120, overflow: 'auto' }}>
                {(() => {
                  const targetDataset = datasets.find(d => d._id === newRelationship.targetDataset);
                  if (!targetDataset) return null;
                  
                  const values = [...new Set(targetDataset.rows.map(row => row[newRelationship.targetColumn]))];
                  const isUnique = values.length === targetDataset.rows.length;
                  
                  return (
                    <>
                      <Chip 
                        label={`${values.length} ta noyob qiymat`} 
                        color={isUnique ? "success" : "warning"} 
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                      {values.slice(0, 10).map((value, index) => (
                        <Chip
                          key={index}
                          label={String(value)}
                          size="small"
                          variant="outlined"
                          sx={{ backgroundColor: '#fff' }}
                        />
                      ))}
                      {values.length > 10 && (
                        <Chip
                          label={`+${values.length - 10} ta boshqa`}
                          size="small"
                          variant="outlined"
                          sx={{ backgroundColor: '#fff', fontStyle: 'italic' }}
                        />
                      )}
                    </>
                  );
                })()}
              </Box>
            </Box>
          )}

          {/* Matching Values Indicator */}
          {(newRelationship.sourceDataset && newRelationship.sourceColumn && 
            newRelationship.targetDataset && newRelationship.targetColumn &&
            newRelationship.sourceDataset !== newRelationship.targetDataset) && (
            <Box sx={{ 
              mt: 3, 
              p: 3, 
              backgroundColor: '#e8f5e8', 
              borderRadius: 2, 
              border: '1px solid #4caf50'
            }}>
              <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600, mb: 2, textAlign: 'center' }}>
                🔗 Mos keladigan qiymatlar
              </Typography>
              {(() => {
                const sourceDataset = datasets.find(d => d._id === newRelationship.sourceDataset);
                const targetDataset = datasets.find(d => d._id === newRelationship.targetDataset);
                
                if (!sourceDataset || !targetDataset) return null;
                
                const sourceValues = new Set(sourceDataset.rows.map(row => String(row[newRelationship.sourceColumn])));
                const targetValues = new Set(targetDataset.rows.map(row => String(row[newRelationship.targetColumn])));
                
                let matchingValues = [];
                for (const sourceValue of sourceValues) {
                  if (targetValues.has(sourceValue)) {
                    matchingValues.push(sourceValue);
                  }
                }
                
                if (matchingValues.length === 0) {
                  return (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body1" sx={{ color: '#d32f2f', fontWeight: 500 }}>
                        ❌ Mos keladigan qiymat yo'q - bog'lanish yaratib bo'lmaydi
                      </Typography>
                    </Box>
                  );
                }
                
                return (
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      <Chip 
                        label={`${matchingValues.length} ta mos keladigan qiymat`} 
                        color="success" 
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: '1rem' }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', maxHeight: 120, overflow: 'auto' }}>
                      {matchingValues.slice(0, 15).map((value, index) => (
                        <Chip
                          key={index}
                          label={String(value)}
                          size="small"
                          color="success"
                          sx={{ backgroundColor: '#e8f5e8', borderColor: '#4caf50' }}
                        />
                      ))}
                      {matchingValues.length > 15 && (
                        <Chip
                          label={`+${matchingValues.length - 15} ta boshqa`}
                          size="small"
                          variant="outlined"
                          sx={{ backgroundColor: '#fff', fontStyle: 'italic' }}
                        />
                      )}
                    </Box>
                  </Box>
                );
              })()}
            </Box>
          )}

          {(newRelationship.targetDataset && newRelationship.targetColumn) && (
            <Box sx={{ mt: 3, p: 3, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e9ecef' }}>
              <Typography variant="h6" sx={{ color: '#495057', fontWeight: 600, mb: 2 }}>
                🎯 Maqsad ustun qiymatlari ({newRelationship.targetColumn})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 120, overflow: 'auto' }}>
                {(() => {
                  const targetDataset = datasets.find(d => d._id === newRelationship.targetDataset);
                  if (!targetDataset) return null;
                  
                  const values = [...new Set(targetDataset.rows.map(row => row[newRelationship.targetColumn]))];
                  const isUnique = values.length === targetDataset.rows.length;
                  
                  return (
                    <>
                      <Chip 
                        label={`${values.length} ta noyob qiymat`} 
                        color={isUnique ? "success" : "warning"} 
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                      {values.slice(0, 10).map((value, index) => (
                        <Chip
                          key={index}
                          label={String(value)}
                          size="small"
                          variant="outlined"
                          sx={{ backgroundColor: '#fff' }}
                        />
                      ))}
                      {values.length > 10 && (
                        <Chip
                          label={`+${values.length - 10} ta boshqa`}
                          size="small"
                          variant="outlined"
                          sx={{ backgroundColor: '#fff', fontStyle: 'italic' }}
                        />
                      )}
                    </>
                  );
                })()}
              </Box>
            </Box>
          )}

          {/* Validation Messages */}
          {!canCreate && (newRelationship.sourceDataset || newRelationship.targetDataset) && (
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              backgroundColor: '#ffebee', 
              borderRadius: 2, 
              border: '1px solid #f44336'
            }}>
              <Typography variant="body2" sx={{ color: '#d32f2f', textAlign: 'center' }}>
                ⚠️ Bu bog'lanish yaratilmaydi. Sababi:
                {newRelationship.sourceDataset === newRelationship.targetDataset && ' Dataset o\'ziga o\'zi bilan bog\'lanmaydi'}
                {relationships.some(r => 
                  (r.sourceDataset === newRelationship.sourceDataset && 
                   r.sourceColumn === newRelationship.sourceColumn &&
                   r.targetDataset === newRelationship.targetDataset && 
                   r.targetColumn === newRelationship.targetColumn) ||
                  (r.sourceDataset === newRelationship.targetDataset && 
                   r.sourceColumn === newRelationship.targetColumn &&
                   r.targetDataset === newRelationship.sourceDataset && 
                   r.targetColumn === newRelationship.sourceColumn)
                ) && ' Bu bog\'lanish allaqachon mavjud'}
                {(() => {
                  if (newRelationship.sourceDataset && newRelationship.sourceColumn && 
                      newRelationship.targetDataset && newRelationship.targetColumn &&
                      newRelationship.sourceDataset !== newRelationship.targetDataset) {
                    
                    const sourceDataset = datasets.find(d => d._id === newRelationship.sourceDataset);
                    const targetDataset = datasets.find(d => d._id === newRelationship.targetDataset);
                    
                    if (sourceDataset && targetDataset) {
                      const sourceValues = new Set(sourceDataset.rows.map(row => String(row[newRelationship.sourceColumn])));
                      const targetValues = new Set(targetDataset.rows.map(row => String(row[newRelationship.targetColumn])));
                      
                      let matchingCount = 0;
                      for (const sourceValue of sourceValues) {
                        if (targetValues.has(sourceValue)) {
                          matchingCount++;
                        }
                      }
                      
                      if (matchingCount === 0) {
                        return ' Ustunlar orasida mos keladigan qiymat yo\'q';
                      }
                    }
                  }
                  return '';
                })()}
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setRelationshipModalOpen(false)}
            variant="outlined"
            sx={{ 
              borderColor: '#666', 
              color: '#666',
              '&:hover': { borderColor: '#333', backgroundColor: '#f5f5f5' }
            }}
          >
            Bekor qilish
          </Button>
          
          <Button
            onClick={handleAddRelationship}
            variant="contained"
            disabled={!canCreate}
            sx={{ 
              background: canCreate ? 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)' : '#ccc',
              '&:hover': canCreate ? { 
                background: 'linear-gradient(135deg, #f57c00 0%, #e65100 100%)' 
              } : {},
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: 'none'
            }}
          >
            {canCreate ? '✅ Bog\'lanish qo\'shish' : '❌ Qo\'shib bo\'lmaydi'}
          </Button>
        </DialogActions>
      </Dialog>
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
        {/* Relationships */}
        {renderRelationshipsSection()}
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

      {/* Relationship Modal */}
      {renderRelationshipModal()}
    </Box>
  );
};

export default DataModel; 