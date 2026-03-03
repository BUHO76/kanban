import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KanbanBoard from './pages/KanbanBoard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useAuthStore } from './stores/authStore';
import './index.css';

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={
          token ? <Navigate to="/dashboard" /> : <Login />
        } />
        <Route path="/register" element={
          token ? <Navigate to="/dashboard" /> : <Register />
        } />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects/:projectId/kanban" element={<KanbanBoard />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;