import React, { useEffect, useState } from 'react';
import './App.css';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom'
import Tasks from './pages/Tasks'
import Home from './pages/Home'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <title>TaskJar</title>
      </header>
      <Routes>
        <Route path="/" element={<Home />}/>  
        <Route path="/tasks" element={<Tasks />}/>
      </Routes>
    </div>
  );
} 

export default App;
