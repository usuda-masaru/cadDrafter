import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';

const EngineerTools = () => {
  const { addShape, currentProperties } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  
  // Engineering-specific shapes and templates
  const engineerShapes = [
    { id: 'flowchart-start', name: '開始/終了', icon: '⭕', description: 'フローチャート開始・終了' },
    { id: 'flowchart-process', name: '処理', icon: '□', description: 'フローチャート処理' },
    { id: 'flowchart-decision', name: '判定', icon: '◆', description: 'フローチャート判定' },
    { id: 'flowchart-data', name: 'データ', icon: '⬛', description: 'フローチャートデータ' },
    { id: 'uml-class', name: 'クラス', icon: '📋', description: 'UMLクラス図' },
    { id: 'uml-actor', name: 'アクター', icon: '👤', description: 'UMLアクター' },
    { id: 'uml-usecase', name: 'ユースケース', icon: '⚪', description: 'UMLユースケース' },
    { id: 'network-server', name: 'サーバー', icon: '🖥️', description: 'ネットワークサーバー' },
    { id: 'network-database', name: 'データベース', icon: '🗃️', description: 'データベース' },
    { id: 'network-cloud', name: 'クラウド', icon: '☁️', description: 'クラウドサービス' },
    { id: 'circuit-resistor', name: '抵抗', icon: '⚡', description: '電気回路抵抗' },
    { id: 'circuit-capacitor', name: 'コンデンサ', icon: '🔋', description: '電気回路コンデンサ' },
  ];
  
  const handleAddEngineerShape = (shapeType) => {
    const baseShape = {
      x: 100,
      y: 100,
      width: 100,
      height: 60,
      ...currentProperties
    };
    
    switch (shapeType) {
      case 'flowchart-start':
        addShape({
          ...baseShape,
          type: 'circle',
          width: 80,
          height: 80,
          fill: '#e8f5e8',
          stroke: '#2e7d32',
          text: '開始'
        });
        break;
        
      case 'flowchart-process':
        addShape({
          ...baseShape,
          type: 'rectangle',
          fill: '#e3f2fd',
          stroke: '#1976d2',
          text: '処理'
        });
        break;
        
      case 'flowchart-decision':
        addShape({
          ...baseShape,
          type: 'diamond',
          fill: '#fff3e0',
          stroke: '#f57c00',
          text: '判定'
        });
        break;
        
      case 'flowchart-data':
        addShape({
          ...baseShape,
          type: 'rectangle',
          fill: '#f3e5f5',
          stroke: '#7b1fa2',
          text: 'データ'
        });
        break;
        
      case 'uml-class':
        addShape({
          ...baseShape,
          type: 'rectangle',
          height: 120,
          fill: '#fff',
          stroke: '#000',
          text: 'クラス名\n----------\n属性\n----------\nメソッド'
        });
        break;
        
      case 'uml-actor':
        addShape({
          ...baseShape,
          type: 'text',
          width: 60,
          height: 80,
          text: '👤\nアクター',
          fontSize: 24,
          fill: '#fff',
          stroke: '#000'
        });
        break;
        
      case 'uml-usecase':
        addShape({
          ...baseShape,
          type: 'circle',
          width: 120,
          height: 80,
          fill: '#e8f5e8',
          stroke: '#2e7d32',
          text: 'ユースケース'
        });
        break;
        
      case 'network-server':
        addShape({
          ...baseShape,
          type: 'rectangle',
          fill: '#e3f2fd',
          stroke: '#1976d2',
          text: '🖥️\nサーバー'
        });
        break;
        
      case 'network-database':
        addShape({
          ...baseShape,
          type: 'circle',
          width: 100,
          height: 80,
          fill: '#f3e5f5',
          stroke: '#7b1fa2',
          text: '🗃️\nDB'
        });
        break;
        
      case 'network-cloud':
        addShape({
          ...baseShape,
          type: 'rectangle',
          width: 120,
          height: 80,
          fill: '#e0f2f1',
          stroke: '#00796b',
          text: '☁️\nクラウド'
        });
        break;
        
      case 'circuit-resistor':
        addShape({
          ...baseShape,
          type: 'rectangle',
          width: 80,
          height: 20,
          fill: '#fff8e1',
          stroke: '#f57f17',
          text: '⚡ R'
        });
        break;
        
      case 'circuit-capacitor':
        addShape({
          ...baseShape,
          type: 'rectangle',
          width: 60,
          height: 40,
          fill: '#fff8e1',
          stroke: '#f57f17',
          text: '🔋 C'
        });
        break;
        
      default:
        break;
    }
  };
  
  const templates = [
    { id: 'basic-flowchart', name: 'フローチャート', description: '基本的なフローチャートテンプレート' },
    { id: 'uml-class-diagram', name: 'UMLクラス図', description: 'UMLクラス図テンプレート' },
    { id: 'network-diagram', name: 'ネットワーク図', description: 'ネットワーク構成図テンプレート' },
    { id: 'circuit-diagram', name: '回路図', description: '電気回路図テンプレート' },
  ];
  
  const handleLoadTemplate = (templateId) => {
    let templateShapes = [];
    
    switch (templateId) {
      case 'basic-flowchart':
        templateShapes = [
          { type: 'circle', x: 200, y: 50, width: 80, height: 80, fill: '#e8f5e8', stroke: '#2e7d32', text: '開始' },
          { type: 'rectangle', x: 180, y: 180, width: 120, height: 60, fill: '#e3f2fd', stroke: '#1976d2', text: '処理1' },
          { type: 'diamond', x: 180, y: 300, width: 120, height: 80, fill: '#fff3e0', stroke: '#f57c00', text: '判定' },
          { type: 'rectangle', x: 180, y: 450, width: 120, height: 60, fill: '#e3f2fd', stroke: '#1976d2', text: '処理2' },
          { type: 'circle', x: 200, y: 580, width: 80, height: 80, fill: '#ffebee', stroke: '#d32f2f', text: '終了' }
        ];
        break;
        
      case 'uml-class-diagram':
        templateShapes = [
          { type: 'rectangle', x: 100, y: 100, width: 150, height: 120, fill: '#fff', stroke: '#000', text: 'User\n----------\n+ id: int\n+ name: string\n----------\n+ save(): void' },
          { type: 'rectangle', x: 350, y: 100, width: 150, height: 120, fill: '#fff', stroke: '#000', text: 'Order\n----------\n+ id: int\n+ amount: float\n----------\n+ calculate(): float' }
        ];
        break;
        
      case 'network-diagram':
        templateShapes = [
          { type: 'rectangle', x: 100, y: 100, width: 100, height: 60, fill: '#e3f2fd', stroke: '#1976d2', text: '🖥️\nWebサーバー' },
          { type: 'rectangle', x: 300, y: 100, width: 100, height: 60, fill: '#e3f2fd', stroke: '#1976d2', text: '🖥️\nAPサーバー' },
          { type: 'circle', x: 475, y: 100, width: 100, height: 80, fill: '#f3e5f5', stroke: '#7b1fa2', text: '🗃️\nDB' },
          { type: 'rectangle', x: 200, y: 250, width: 120, height: 80, fill: '#e0f2f1', stroke: '#00796b', text: '☁️\nクラウド' }
        ];
        break;
        
      case 'circuit-diagram':
        templateShapes = [
          { type: 'rectangle', x: 100, y: 200, width: 80, height: 20, fill: '#fff8e1', stroke: '#f57f17', text: '⚡ R1' },
          { type: 'rectangle', x: 250, y: 200, width: 60, height: 40, fill: '#fff8e1', stroke: '#f57f17', text: '🔋 C1' },
          { type: 'line', x: 50, y: 210, width: 50, height: 0, stroke: '#000', strokeWidth: 2 },
          { type: 'line', x: 180, y: 210, width: 70, height: 0, stroke: '#000', strokeWidth: 2 }
        ];
        break;
        
      default:
        return;
    }
    
    templateShapes.forEach(shape => {
      addShape({ ...shape, ...currentProperties });
    });
  };
  
  if (!isVisible) {
    return (
      <div style={{ position: 'fixed', top: '50%', right: '16px', transform: 'translateY(-50%)', zIndex: 1000 }}>
        <button
          onClick={() => setIsVisible(true)}
          style={{
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            fontSize: '18px'
          }}
          title="エンジニアツールを表示"
        >
          ⚙️
        </button>
      </div>
    );
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      right: '16px',
      transform: 'translateY(-50%)',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      padding: '16px',
      width: '300px',
      maxHeight: '70vh',
      overflowY: 'auto',
      zIndex: 1000
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#2c3e50' }}>エンジニアツール</h3>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '18px',
            color: '#7f8c8d'
          }}
        >
          ✕
        </button>
      </div>
      
      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 12px 0', color: '#34495e' }}>専門図形</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {engineerShapes.map(shape => (
            <div
              key={shape.id}
              onClick={() => handleAddEngineerShape(shape.id)}
              style={{
                padding: '8px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '12px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e9ecef'}
              onMouseLeave={(e) => e.target.style.background = '#f8f9fa'}
              title={shape.description}
            >
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{shape.icon}</div>
              <div>{shape.name}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 style={{ margin: '0 0 12px 0', color: '#34495e' }}>テンプレート</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {templates.map(template => (
            <div
              key={template.id}
              onClick={() => handleLoadTemplate(template.id)}
              style={{
                padding: '12px',
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e9ecef'}
              onMouseLeave={(e) => e.target.style.background = '#f8f9fa'}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{template.name}</div>
              <div style={{ fontSize: '12px', color: '#6c757d' }}>{template.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EngineerTools;