import React from 'react';
import { useApp } from '../contexts/AppContext';

const RightPanel = () => {
  const { 
    selectedShape, 
    currentProperties, 
    setProperties, 
    updateShape 
  } = useApp();
  
  const handlePropertyChange = (property, value) => {
    if (selectedShape) {
      // Update the selected shape
      updateShape(selectedShape.id, { [property]: value });
    } else {
      // Update default properties for new shapes
      setProperties({ [property]: value });
    }
  };
  
  const activeProperties = selectedShape || currentProperties;
  
  return (
    <aside className="right-panel">
      <div className="panel-section">
        <h3>プロパティ</h3>
        <div className="property-panel">
          {/* Fill Color */}
          <div className="property-group">
            <label>塗りつぶし色:</label>
            <input
              type="color"
              value={activeProperties.fill || '#ffffff'}
              onChange={(e) => handlePropertyChange('fill', e.target.value)}
            />
          </div>
          
          {/* Stroke Color */}
          <div className="property-group">
            <label>枠線色:</label>
            <input
              type="color"
              value={activeProperties.stroke || '#000000'}
              onChange={(e) => handlePropertyChange('stroke', e.target.value)}
            />
          </div>
          
          {/* Stroke Width */}
          <div className="property-group">
            <label>線幅:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={activeProperties.strokeWidth || 2}
              onChange={(e) => handlePropertyChange('strokeWidth', parseInt(e.target.value))}
            />
            <span className="property-value">{activeProperties.strokeWidth || 2}px</span>
          </div>
          
          {/* Opacity */}
          <div className="property-group">
            <label>透明度:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={Math.round((activeProperties.opacity || 1) * 100)}
              onChange={(e) => handlePropertyChange('opacity', parseInt(e.target.value) / 100)}
            />
            <span className="property-value">{Math.round((activeProperties.opacity || 1) * 100)}%</span>
          </div>
          
          {/* Position and Size (for selected shape) */}
          {selectedShape && (
            <>
              <div className="property-group">
                <label>X座標:</label>
                <input
                  type="number"
                  value={Math.round(selectedShape.x || 0)}
                  onChange={(e) => handlePropertyChange('x', parseInt(e.target.value))}
                />
              </div>
              
              <div className="property-group">
                <label>Y座標:</label>
                <input
                  type="number"
                  value={Math.round(selectedShape.y || 0)}
                  onChange={(e) => handlePropertyChange('y', parseInt(e.target.value))}
                />
              </div>
              
              <div className="property-group">
                <label>幅:</label>
                <input
                  type="number"
                  value={Math.round(selectedShape.width || 0)}
                  onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
                />
              </div>
              
              <div className="property-group">
                <label>高さ:</label>
                <input
                  type="number"
                  value={Math.round(selectedShape.height || 0)}
                  onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
                />
              </div>
            </>
          )}
          
          {/* Text Properties (for text shapes) */}
          {(selectedShape?.type === 'text' || (!selectedShape && currentProperties.text !== undefined)) && (
            <>
              <div className="property-group">
                <label>テキスト:</label>
                <input
                  type="text"
                  value={activeProperties.text || ''}
                  onChange={(e) => handlePropertyChange('text', e.target.value)}
                  placeholder="テキストを入力..."
                />
              </div>
              
              <div className="property-group">
                <label>フォントサイズ:</label>
                <input
                  type="range"
                  min="8"
                  max="72"
                  value={activeProperties.fontSize || 16}
                  onChange={(e) => handlePropertyChange('fontSize', parseInt(e.target.value))}
                />
                <span className="property-value">{activeProperties.fontSize || 16}px</span>
              </div>
              
              <div className="property-group">
                <label>フォント:</label>
                <select
                  value={activeProperties.fontFamily || 'Arial'}
                  onChange={(e) => handlePropertyChange('fontFamily', e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    border: '1px solid #ddd', 
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Georgia">Georgia</option>
                </select>
              </div>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default RightPanel;