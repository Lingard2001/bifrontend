import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import DataModel from './pages/DataModel';
import DataView from './pages/DataView';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/data-model" element={<DataModel />} />
        <Route path="/data-view" element={<DataView />} />
      </Routes>
    </Router>
  );
}

export default App;
