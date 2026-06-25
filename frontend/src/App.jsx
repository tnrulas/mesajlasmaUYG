import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ACCESS_TOKEN } from './services/constants'
import Login from './pages/login'
import Register from './pages/register'
import Home from './pages/home'
import ProtectedRoute from './components/protectedRoute'
import Mesajlasma from './components/mesajolustur'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Input } from '@progress/kendo-react-inputs';
import '@progress/kendo-theme-default/dist/all.css';

const App = () => {

  const isAuthenticated = !!localStorage.getItem(ACCESS_TOKEN)

  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route
          path='/home'
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path='/home/chat/:conversationId'
          element={
            <ProtectedRoute>
              <Mesajlasma />
            </ProtectedRoute>
          }
        />
        <Route
          path='/'
          element={
            <Login />
          }
        />
        <Route
          path='/kayit'
          element={
            <Register />
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App