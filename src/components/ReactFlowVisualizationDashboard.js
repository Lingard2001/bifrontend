import React, { useCallback, useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
  MarkerType,
  Panel,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  TextField
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  ShowChart as LineChartIcon,
  PieChart as PieChartIcon,
  TableChart as TableChartIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

// Chart Components
import BarChartComponent from './BarChartComponent';
import LineChartComponent from './LineChartComponent';
import PieChartComponent from './PieChartComponent';
import DataTableComponent from './DataTableComponent';

const ReactFlowVisualizationDashboard = ({
  datasets,
  relationships,
  visualizations,
  onVisualizationCreate,
  onVisualizationUpdate,
  onVisualizationDelete
}) => {
  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  
  // UI states
  const [selectedNode, setSelectedNode] = useState(null);
  const [propertiesModalOpen, setPropertiesModalOpen] = useState(false);
  const [newVisualization, setNewVisualization] = useState({
    type: 'bar',
    title: '',
    selectedDatasets: [],
    columnMapping: {}
  });

  // Convert visualizations to nodes
  const createNodesFromVisualizations = useCallback(() => {
    const newNodes = visualizations.map((viz, index) => ({
      id: viz.id,
      type: 'visualizationNode',
      position: viz.position || { x: (index % 3) * 400, y: Math.floor(index / 3) * 500 },
      data: { visualization: viz, datasets },
      draggable: true,
      selectable: true
    }));
    setNodes(newNodes);
  }, [visualizations, datasets, setNodes]);

  // Convert relationships to edges
  const createEdgesFromRelationships = useCallback(() => {
    const newEdges = relationships.map((relationship) => ({
      id: relationship.id,
      source: relationship.sourceDataset,
      target: relationship.targetDataset,
      sourceHandle: relationship.sourceColumn,
      targetHandle: relationship.targetColumn,
      type: 'relationshipEdge',
      data: { relationship },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: getRelationshipColor(relationship.relationshipType)
      },
      style: {
        stroke: getRelationshipColor(relationship.relationshipType),
        strokeWidth: 2,
        strokeDasharray: relationship.visible ? 'none' : '5,5'
      },
      animated: relationship.visible
    }));
    setEdges(newEdges);
  }, [relationships, setEdges]);

  // Initialize nodes and edges
  useEffect(() => {
    createNodesFromVisualizations();
  }, [createNodesFromVisualizations]);

  useEffect(() => {
    createEdgesFromRelationships();
  }, [createEdgesFromRelationships]);

  // Handle node drag end (save position)
  const onNodeDragStop = useCallback((event, node) => {
    const updatedViz = visualizations.find(v => v.id === node.id);
    if (updatedViz) {
      onVisualizationUpdate({
        ...updatedViz,
        position: node.position
      });
    }
  }, [visualizations, onVisualizationUpdate]);

  // Handle node click (open properties)
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setPropertiesModalOpen(true);
  }, []);

  // Handle node double click (delete)
  const onNodeDoubleClick = useCallback((event, node) => {
    onVisualizationDelete(node.id);
  }, [onVisualizationDelete]);

  // Get relationship color
  const getRelationshipColor = (type) => {
    switch (type) {
      case 'one-to-one': return '#4caf50';
      case 'one-to-many': return '#2196f3';
      case 'many-to-one': return '#ff9800';
      case 'many-to-many': return '#f44336';
      default: return '#666';
    }
  };

  // Get chart type icon
  const getChartTypeIcon = (type) => {
    switch (type) {
      case 'bar': return <BarChartIcon />;
      case 'line': return <LineChartIcon />;
      case 'pie': return <PieChartIcon />;
      case 'table': return <TableChartIcon />;
      default: return <BarChartIcon />;
    }
  };

  // Get chart type color
  const getChartTypeColor = (type) => {
    switch (type) {
      case 'bar': return '#2196f3';
      case 'line': return '#4caf50';
      case 'pie': return '#ff9800';
      case 'table': return '#9c27b0';
      default: return '#666';
    }
  };

  // Render chart component
  const renderChart = (visualization) => {
    const { type, columnMapping, selectedDatasets } = visualization;
    
    // Check if selectedDatasets exists and has data
    if (!selectedDatasets || selectedDatasets.length === 0) {
      return <Typography>No dataset selected</Typography>;
    }
    
    // Get primary dataset
    const primaryDataset = datasets.find(d => d._id === selectedDatasets[0]);
    if (!primaryDataset) return <Typography>No dataset selected</Typography>;

    // Check if columnMapping exists
    if (!columnMapping || !columnMapping.label || !columnMapping.value) {
      return <Typography>Please configure columns</Typography>;
    }
    
    // Prepare chart data
    const chartData = primaryDataset.rows.slice(0, 10).map(row => ({
      label: row[columnMapping.label] || 'Unknown',
      value: parseFloat(row[columnMapping.value]) || 0
    }));

    switch (type) {
      case 'bar':
        return <BarChartComponent data={chartData} />;
      case 'line':
        return <LineChartComponent data={chartData} />;
      case 'pie':
        return <PieChartComponent data={chartData} />;
      case 'table':
        return <DataTableComponent data={chartData} />;
      default:
        return <Typography>Unknown chart type</Typography>;
    }
  };

  // Custom Visualization Node
  const VisualizationNode = ({ data }) => {
    const { visualization, datasets } = data;
    
    return (
      <Paper
        elevation={3}
        sx={{
          p: 2,
          minWidth: 350,
          maxWidth: 350,
          minHeight: 300,
          maxHeight: 400,
          backgroundColor: '#fff',
          border: '2px solid #e0e0e0',
          borderRadius: 2,
          '&:hover': {
            borderColor: '#1976d2',
            boxShadow: 4
          }
        }}
      >
        {/* Visualization Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 1.5,
          pb: 1,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ 
              color: getChartTypeColor(visualization.type),
              display: 'flex',
              alignItems: 'center'
            }}>
              {getChartTypeIcon(visualization.type)}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
              {visualization.title || 'Untitled'}
            </Typography>
          </Box>
          <Chip
            label={visualization.type}
            size="small"
            sx={{ 
              backgroundColor: getChartTypeColor(visualization.type),
              color: 'white',
              fontSize: '0.7rem'
            }}
          />
        </Box>

        {/* Dataset Info */}
        {visualization.selectedDatasets && visualization.selectedDatasets.length > 0 && (
          <Box sx={{ mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              📊 Datasets:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {visualization.selectedDatasets.map(datasetId => {
                const dataset = datasets.find(d => d._id === datasetId);
                return dataset ? (
                  <Chip
                    key={datasetId}
                    label={dataset.name}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.6rem', height: '20px' }}
                  />
                ) : null;
              })}
            </Box>
          </Box>
        )}

        {/* Chart Content */}
        <Box sx={{ 
          height: 200, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: 1,
          border: '1px solid #e0e0e0'
        }}>
          {renderChart(visualization)}
        </Box>

        {/* Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 1.5,
          pt: 1,
          borderTop: '1px solid #e0e0e0'
        }}>
          <Typography variant="caption" color="text.secondary">
            💡 Click to edit, double-click to delete
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <IconButton size="small" onClick={() => setSelectedNode(data)}>
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Paper>
    );
  };

  // Node types
  const nodeTypes = useMemo(() => ({
    visualizationNode: VisualizationNode
  }), []);

  // Edge types
  const edgeTypes = useMemo(() => ({}), []);

  // Handle add visualization
  const handleAddVisualization = () => {
    const newViz = {
      id: Date.now().toString(),
      type: newVisualization.type,
      title: newVisualization.title || `New ${newVisualization.type} Chart`,
      selectedDatasets: newVisualization.selectedDatasets,
      columnMapping: newVisualization.columnMapping,
      position: { x: 100, y: 100 },
      createdAt: new Date().toISOString()
    };
    
    onVisualizationCreate(newViz);
    setPropertiesModalOpen(false);
    setNewVisualization({
      type: 'bar',
      title: '',
      selectedDatasets: [],
      columnMapping: {}
    });
  };

  return (
    <Box sx={{ height: '80vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap />
        
        {/* Instructions Panel */}
        <Panel position="top-left">
          <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.9)' }}>
            <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              <DashboardIcon color="primary" />
              React Flow Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              💡 Drag visualization nodes to reposition them
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              🎯 Click node to edit properties, double-click to delete
            </Typography>
            <Typography variant="body2" color="text.secondary">
              🔧 Use mouse wheel to zoom, drag to pan
            </Typography>
          </Paper>
        </Panel>

        {/* Add Visualization Panel */}
        <Panel position="top-right">
          <Paper elevation={3} sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.9)' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Add Visualization
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setPropertiesModalOpen(true)}
              sx={{ mb: 1 }}
              fullWidth
            >
              New Chart
            </Button>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2">
                📊 Visualizations: {visualizations.length}
              </Typography>
              <Typography variant="body2">
                🔗 Relationships: {relationships.length}
              </Typography>
              <Typography variant="body2">
                📍 Nodes: {nodes.length}
              </Typography>
            </Box>
          </Paper>
        </Panel>
      </ReactFlow>

      {/* Properties Modal */}
      <Dialog 
        open={propertiesModalOpen} 
        onClose={() => setPropertiesModalOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedNode ? 'Edit Visualization' : 'New Visualization'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* Chart Type */}
            <FormControl fullWidth>
              <InputLabel>Chart Type</InputLabel>
              <Select
                value={newVisualization.type}
                onChange={(e) => setNewVisualization({
                  ...newVisualization,
                  type: e.target.value
                })}
                label="Chart Type"
              >
                <MenuItem value="bar">Bar Chart</MenuItem>
                <MenuItem value="line">Line Chart</MenuItem>
                <MenuItem value="pie">Pie Chart</MenuItem>
                <MenuItem value="table">Data Table</MenuItem>
              </Select>
            </FormControl>

            {/* Title */}
            <TextField
              label="Title"
              value={newVisualization.title}
              onChange={(e) => setNewVisualization({
                ...newVisualization,
                title: e.target.value
              })}
              fullWidth
            />

            {/* Dataset Selection */}
            <FormControl fullWidth>
              <InputLabel>Select Dataset</InputLabel>
              <Select
                value={newVisualization.selectedDatasets[0] || ''}
                onChange={(e) => setNewVisualization({
                  ...newVisualization,
                  selectedDatasets: [e.target.value]
                })}
                label="Select Dataset"
              >
                {datasets.map((dataset) => (
                  <MenuItem key={dataset._id} value={dataset._id}>
                    {dataset.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Column Mapping */}
            {newVisualization.selectedDatasets[0] && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Label Column</InputLabel>
                  <Select
                    value={newVisualization.columnMapping.label || ''}
                    onChange={(e) => setNewVisualization({
                      ...newVisualization,
                      columnMapping: {
                        ...newVisualization.columnMapping,
                        label: e.target.value
                      }
                    })}
                    label="Label Column"
                  >
                    {datasets.find(d => d._id === newVisualization.selectedDatasets[0])?.columns.map((column) => (
                      <MenuItem key={column} value={column}>
                        {column}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Value Column</InputLabel>
                  <Select
                    value={newVisualization.columnMapping.value || ''}
                    onChange={(e) => setNewVisualization({
                      ...newVisualization,
                      columnMapping: {
                        ...newVisualization.columnMapping,
                        value: e.target.value
                      }
                    })}
                    label="Value Column"
                  >
                    {datasets.find(d => d._id === newVisualization.selectedDatasets[0])?.columns.map((column) => (
                      <MenuItem key={column} value={column}>
                        {column}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPropertiesModalOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddVisualization} 
            variant="contained"
            disabled={!newVisualization.selectedDatasets[0] || !newVisualization.columnMapping.label || !newVisualization.columnMapping.value}
          >
            {selectedNode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReactFlowVisualizationDashboard;
