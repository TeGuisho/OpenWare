import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import { BrowserRouter, Routes, Route } from 'react-router';

import {Screen, Desktop} from './pages/index'
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/screen"element={<Screen/>}/>
        <Route path="/" element={<Desktop/>}/  >
      </Routes>
    </BrowserRouter>
  )
}

