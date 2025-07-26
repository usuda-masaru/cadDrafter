import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import Canvas from './components/Canvas';
import RightPanel from './components/RightPanel';
import EngineerTools from './components/EngineerTools';
import AlignmentToolbar from './components/AlignmentToolbar';
import { AppProvider } from './contexts/AppContext';

function App() {
  return (
    <AppProvider>
      <div className="app">
        <Header />
        <AlignmentToolbar />
        <main className="main-content">
          <LeftPanel />
          <Canvas />
          <RightPanel />
        </main>
        <EngineerTools />
      </div>
    </AppProvider>
  );
}

export default App;