import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DataModel from './pages/DataModel';
import DataView from './pages/DataView';
import TransformData from './pages/TransformData';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/data-model" element={<DataModel />} />
        <Route path="/data-view" element={<DataView />} />
        <Route path="/transform-data" element={<TransformData />} />
      </Routes>
    </Router>
  );
}

export default App;
