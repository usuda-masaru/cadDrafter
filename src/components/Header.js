import React, { useRef } from 'react';
import { useApp } from '../contexts/AppContext';
import { saveToFile, loadFromFile, exportToSVG, exportToPNG, validateDiagramData } from '../utils/fileUtils';

const Header = () => {
  const { 
    currentTool, 
    setTool, 
    resetDiagram, 
    shapes, 
    layers, 
    canvasSize, 
    currentProperties,
    loadDiagram 
  } = useApp();
  
  const fileInputRef = useRef(null);
  
  const tools = [
    { id: 'select', name: '選択', icon: '↖' },
    { id: 'rectangle', name: '矩形', icon: '□' },
    { id: 'circle', name: '円', icon: '○' },
    { id: 'triangle', name: '三角形', icon: '△' },
    { id: 'diamond', name: '菱形', icon: '◆' },
    { id: 'arrow', name: '矢印', icon: '→' },
    { id: 'line', name: '直線', icon: '─' },
    { id: 'text', name: 'テキスト', icon: 'T' }
  ];
  
  const handleSave = () => {
    const diagramData = {
      shapes,
      layers,
      canvasSize,
      currentProperties,
      version: '1.0.0',
      timestamp: new Date().toISOString()
    };
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `diagram-${timestamp}.json`;
    
    saveToFile(diagramData, filename);
  };
  
  const handleLoad = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileLoad = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
      const data = await loadFromFile(file);
      
      if (!validateDiagramData(data)) {
        alert('無効なファイル形式です。');
        return;
      }
      
      if (window.confirm('現在の図を破棄して新しい図を読み込みますか？')) {
        loadDiagram(data);
      }
    } catch (error) {
      alert('ファイルの読み込みに失敗しました: ' + error.message);
    }
    
    // Reset file input
    event.target.value = '';
  };
  
  const handleExport = () => {
    const exportOptions = [
      { label: 'SVG形式でエクスポート', value: 'svg' },
      { label: 'PNG形式でエクスポート', value: 'png' }
    ];
    
    const choice = window.prompt(
      'エクスポート形式を選択してください:\n1. SVG\n2. PNG\n\n数字を入力してください (1 または 2):',
      '1'
    );
    
    if (choice === '1') {
      const svgContent = exportToSVG(shapes, canvasSize);
      const blob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = 'diagram.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (choice === '2') {
      // For PNG export, we need access to the canvas
      const canvas = document.querySelector('.main-canvas');
      if (canvas) {
        exportToPNG(canvas);
      } else {
        alert('キャンバスが見つかりません。');
      }
    }
  };
  
  const handleNew = () => {
    if (window.confirm('新しい図を作成しますか？現在の作業は失われます。')) {
      resetDiagram();
    }
  };
  
  return (
    <header className="header">
      <div className="toolbar">
        <div className="toolbar-section">
          {tools.map(tool => (
            <button
              key={tool.id}
              className={`tool-button ${currentTool === tool.id ? 'active' : ''}`}
              onClick={() => setTool(tool.id)}
              title={tool.name}
            >
              <span className="icon">{tool.icon}</span>
            </button>
          ))}
        </div>
        
        <div className="toolbar-section">
          <button className="tool-button" onClick={handleNew} title="新規作成">
            <span className="icon">📄</span>
          </button>
          <button className="tool-button" onClick={handleSave} title="保存">
            <span className="icon">💾</span>
          </button>
          <button className="tool-button" onClick={handleLoad} title="読み込み">
            <span className="icon">📁</span>
          </button>
          <button className="tool-button" onClick={handleExport} title="エクスポート">
            <span className="icon">📤</span>
          </button>
        </div>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileLoad}
        style={{ display: 'none' }}
      />
    </header>
  );
};

export default Header;