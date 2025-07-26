import React from 'react';
import { useApp } from '../contexts/AppContext';
import { alignShapes, distributeShapes } from '../utils/alignmentUtils';

const AlignmentToolbar = () => {
  const { selectedShapes, updateMultipleShapes, groupShapes, ungroupShapes, groups } = useApp();
  
  const canAlign = selectedShapes.length >= 2;
  const canDistribute = selectedShapes.length >= 3;
  const canGroup = selectedShapes.length >= 2;
  
  // Check if any selected shapes are part of a group
  const selectedShapeIds = selectedShapes.map(s => s.id);
  const canUngroup = groups.some(group => 
    group.shapeIds.some(shapeId => selectedShapeIds.includes(shapeId))
  );
  
  const handleAlign = (alignType) => {
    if (!canAlign) return;
    const updates = alignShapes(selectedShapes, alignType);
    if (updates.length > 0) {
      updateMultipleShapes(updates);
    }
  };
  
  const handleDistribute = (distributeType) => {
    if (!canDistribute) return;
    const updates = distributeShapes(selectedShapes, distributeType);
    if (updates.length > 0) {
      updateMultipleShapes(updates);
    }
  };
  
  const handleGroup = () => {
    if (!canGroup) return;
    const shapeIds = selectedShapes.map(s => s.id);
    groupShapes(shapeIds);
  };
  
  const handleUngroup = () => {
    if (!canUngroup) return;
    // Find groups that contain any of the selected shapes
    const groupsToUngroup = groups.filter(group => 
      group.shapeIds.some(shapeId => selectedShapeIds.includes(shapeId))
    );
    
    groupsToUngroup.forEach(group => {
      ungroupShapes(group.id);
    });
  };
  
  const alignmentButtons = [
    { type: 'left', title: '左揃え', icon: '⬅️' },
    { type: 'center-horizontal', title: '水平中央揃え', icon: '↔️' },
    { type: 'right', title: '右揃え', icon: '➡️' },
    { type: 'top', title: '上揃え', icon: '⬆️' },
    { type: 'center-vertical', title: '垂直中央揃え', icon: '↕️' },
    { type: 'bottom', title: '下揃え', icon: '⬇️' }
  ];
  
  const distributionButtons = [
    { type: 'horizontal-spacing', title: '水平等間隔', icon: '↔️' },
    { type: 'vertical-spacing', title: '垂直等間隔', icon: '↕️' }
  ];
  
  const groupButtons = [
    { type: 'group', title: 'グループ化', icon: '📦', handler: handleGroup, enabled: canGroup },
    { type: 'ungroup', title: 'グループ解除', icon: '📤', handler: handleUngroup, enabled: canUngroup }
  ];
  
  if (selectedShapes.length < 2) {
    return null;
  }
  
  return (
    <div style={{
      position: 'fixed',
      top: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      padding: '8px',
      display: 'flex',
      gap: '8px',
      zIndex: 100
    }}>
      <div style={{ 
        display: 'flex', 
        gap: '4px',
        borderRight: '1px solid #eee',
        paddingRight: '8px'
      }}>
        <span style={{ 
          fontSize: '12px', 
          color: '#666', 
          alignSelf: 'center',
          marginRight: '4px'
        }}>
          整列:
        </span>
        {alignmentButtons.map(btn => (
          <button
            key={btn.type}
            onClick={() => handleAlign(btn.type)}
            disabled={!canAlign}
            title={btn.title}
            style={{
              background: canAlign ? '#f0f0f0' : '#fafafa',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '32px',
              height: '32px',
              cursor: canAlign ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: canAlign ? 1 : 0.5,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (canAlign) e.target.style.background = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              if (canAlign) e.target.style.background = '#f0f0f0';
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>
      
      {canDistribute && (
        <div style={{ 
          display: 'flex', 
          gap: '4px',
          borderRight: '1px solid #eee',
          paddingRight: '8px'
        }}>
          <span style={{ 
            fontSize: '12px', 
            color: '#666', 
            alignSelf: 'center',
            marginRight: '4px'
          }}>
            分布:
          </span>
          {distributionButtons.map(btn => (
            <button
              key={btn.type}
              onClick={() => handleDistribute(btn.type)}
              title={btn.title}
              style={{
                background: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#e0e0e0'}
              onMouseLeave={(e) => e.target.style.background = '#f0f0f0'}
            >
              {btn.icon}
            </button>
          ))}
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        gap: '4px'
      }}>
        <span style={{ 
          fontSize: '12px', 
          color: '#666', 
          alignSelf: 'center',
          marginRight: '4px'
        }}>
          グループ:
        </span>
        {groupButtons.map(btn => (
          <button
            key={btn.type}
            onClick={btn.handler}
            disabled={!btn.enabled}
            title={btn.title}
            style={{
              background: btn.enabled ? '#f0f0f0' : '#fafafa',
              border: '1px solid #ddd',
              borderRadius: '4px',
              width: '32px',
              height: '32px',
              cursor: btn.enabled ? 'pointer' : 'not-allowed',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: btn.enabled ? 1 : 0.5,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (btn.enabled) e.target.style.background = '#e0e0e0';
            }}
            onMouseLeave={(e) => {
              if (btn.enabled) e.target.style.background = '#f0f0f0';
            }}
          >
            {btn.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AlignmentToolbar;