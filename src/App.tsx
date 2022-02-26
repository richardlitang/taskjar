import React, { useEffect, useState } from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'
import Tasks from './pages/Tasks'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <title>TaskJar</title>
      </header>
      <Routes>
        <Route path="/" element={<Home />}/>  
        <Route path="/tasks" element={<Tasks />}/>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  );
} 

export default App;
