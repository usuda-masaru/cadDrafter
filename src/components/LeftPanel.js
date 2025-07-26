import React from 'react';
import { useApp } from '../contexts/AppContext';

const LeftPanel = () => {
  const { 
    setTool, 
    currentTool, 
    layers, 
    currentLayerId, 
    selectLayer, 
    toggleLayerVisibility, 
    toggleLayerLock, 
    addLayer 
  } = useApp();
  
  const shapes = [
    { id: 'rectangle', name: '矩形', icon: '□' },
    { id: 'circle', name: '円', icon: '○' },
    { id: 'triangle', name: '三角形', icon: '△' },
    { id: 'diamond', name: '菱形', icon: '◆' },
    { id: 'arrow', name: '矢印', icon: '→' },
    { id: 'line', name: '直線', icon: '─' },
    { id: 'text', name: 'テキスト', icon: 'T' }
  ];
  
  const handleShapeClick = (shapeId) => {
    setTool(shapeId);
  };
  
  const handleAddLayer = () => {
    const name = prompt('レイヤー名を入力してください:');
    if (name) {
      addLayer(name);
    }
  };
  
  return (
    <aside className="left-panel">
      <div className="panel-section">
        <h3>図形ライブラリ</h3>
        <div className="shape-library">
          {shapes.map(shape => (
            <div
              key={shape.id}
              className={`shape-item ${currentTool === shape.id ? 'active' : ''}`}
              onClick={() => handleShapeClick(shape.id)}
            >
              <span className="shape-icon">{shape.icon}</span>
              <span>{shape.name}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="panel-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3>レイヤー</h3>
          <button 
            className="tool-button" 
            onClick={handleAddLayer}
            style={{ padding: '4px 8px', fontSize: '12px' }}
            title="レイヤーを追加"
          >
            +
          </button>
        </div>
        <div className="layer-list">
          {layers.map(layer => (
            <div
              key={layer.id}
              className={`layer-item ${currentLayerId === layer.id ? 'active' : ''}`}
              onClick={() => selectLayer(layer.id)}
            >
              <span className="layer-name">{layer.name}</span>
              <div className="layer-controls">
                <button
                  className="layer-control-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerVisibility(layer.id);
                  }}
                  title={layer.visible ? '非表示にする' : '表示する'}
                >
                  {layer.visible ? '👁' : '👁‍🗨'}
                </button>
                <button
                  className="layer-control-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLayerLock(layer.id);
                  }}
                  title={layer.locked ? 'ロック解除' : 'ロック'}
                >
                  {layer.locked ? '🔒' : '🔓'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default LeftPanel;