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
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  AccountTree as AccountTreeIcon
} from '@mui/icons-material';

const ReactFlowDataModelBuilder = ({
  datasets,
  relationships,
  onRelationshipCreate,
  onRelationshipDelete,
  onRelationshipToggle
}) => {
  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Convert datasets to nodes
  const createNodesFromDatasets = useCallback(() => {
    const newNodes = datasets.map((dataset, index) => ({
      id: dataset._id,
      type: 'datasetNode',
      position: { x: (index % 3) * 350, y: Math.floor(index / 3) * 400 },
      data: { dataset },
      draggable: true,
      selectable: true
    }));
    setNodes(newNodes);
  }, [datasets, setNodes]);

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
    createNodesFromDatasets();
  }, [createNodesFromDatasets]);

  useEffect(() => {
    createEdgesFromRelationships();
  }, [createEdgesFromRelationships]);

  // Handle edge connection (new relationship)
  const onConnect = useCallback((params) => {
    console.log('🔗 New connection:', params);
    
    // Find source and target datasets
    const sourceNode = nodes.find(n => n.id === params.source);
    const targetNode = nodes.find(n => n.id === params.target);
    
    if (!sourceNode || !targetNode) return;
    
    // Create new relationship
    const newRelationship = {
      id: Date.now().toString(),
      sourceDataset: params.source,
      sourceColumn: params.sourceHandle || 'id',
      targetDataset: params.target,
      targetColumn: params.targetHandle || 'id',
      relationshipType: 'one-to-many',
      createdAt: new Date().toISOString(),
      visible: true
    };
    
    console.log('✅ Creating relationship:', newRelationship);
    onRelationshipCreate(newRelationship);
  }, [nodes, onRelationshipCreate]);

  // Handle edge click (toggle visibility)
  const onEdgeClick = useCallback((event, edge) => {
    const relationship = edge.data.relationship;
    if (relationship) {
      onRelationshipToggle(relationship.id);
    }
  }, [onRelationshipToggle]);

  // Handle edge double click (delete)
  const onEdgeDoubleClick = useCallback((event, edge) => {
    const relationship = edge.data.relationship;
    if (relationship) {
      onRelationshipDelete(relationship.id);
    }
  }, [onRelationshipDelete]);

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

  // Custom Dataset Node
  const DatasetNode = ({ data }) => {
    const { dataset } = data;
    
    return (
      <Paper
        elevation={3}
        sx={{
          p: 2,
          minWidth: 280,
          maxWidth: 280,
          maxHeight: 350,
          backgroundColor: '#fff',
          border: '2px solid #e0e0e0',
          borderRadius: 2,
          '&:hover': {
            borderColor: '#1976d2',
            boxShadow: 4
          }
        }}
      >
        {/* Dataset Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          mb: 1.5,
          pb: 1,
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
            {dataset.name}
          </Typography>
          <Chip
            label={`${dataset.rows.length} rows`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Columns */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 250, overflow: 'auto' }}>
          {dataset.columns.map((column) => {
            const isUnique = dataset.rows.every((row, index) => 
              dataset.rows.findIndex(r => r[column] === row[column]) === index
            );
            
            return (
              <Box
                key={column}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 0.75,
                  borderRadius: 1,
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e0e0e0',
                  '&:hover': {
                    backgroundColor: '#e3f2fd',
                    borderColor: '#1976d2'
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.8rem', flex: 1 }}>
                  {column}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Chip
                    label={getColumnType(dataset, column)}
                    size="small"
                    sx={{ 
                      backgroundColor: getColumnTypeColor(getColumnType(dataset, column)),
                      color: 'white',
                      fontSize: '0.55rem',
                      height: '16px'
                    }}
                  />
                  {isUnique && (
                    <Chip
                      label="PK"
                      size="small"
                      sx={{ 
                        backgroundColor: '#4caf50',
                        color: 'white',
                        fontSize: '0.55rem',
                        height: '16px'
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Paper>
    );
  };

  // Helper functions
  const getColumnType = (dataset, column) => {
    if (!dataset.rows || dataset.rows.length === 0) return 'unknown';
    
    const sampleValues = dataset.rows.slice(0, 10).map(row => row[column]);
    const hasNumbers = sampleValues.some(val => !isNaN(Number(val)) && val !== '');
    const hasDates = sampleValues.some(val => 
      typeof val === 'string' && 
      /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(val)
    );
    
    if (hasDates) return 'date';
    if (hasNumbers) return 'numeric';
    return 'text';
  };

  const getColumnTypeColor = (type) => {
    switch (type) {
      case 'numeric': return '#2196f3';
      case 'date': return '#ff9800';
      case 'text': return '#4caf50';
      default: return '#666';
    }
  };

  // Node types
  const nodeTypes = useMemo(() => ({
    datasetNode: DatasetNode
  }), []);

  // Edge types
  const edgeTypes = useMemo(() => ({}), []);

  return (
    <Box sx={{ height: '80vh', width: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        onEdgeDoubleClick={onEdgeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        attributionPosition="bottom-left"
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </Box>
  );
};

export default ReactFlowDataModelBuilder;
