import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';
import { getAnchorPoints, findNearestAnchor, updateConnectedLines } from '../utils/connectionUtils';
import { v4 as uuidv4 } from 'uuid';

const Canvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState({ x: 0, y: 0 });
  const [currentShape, setCurrentShape] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingShapeId, setEditingShapeId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0 });
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuShapeId, setContextMenuShapeId] = useState(null);
  const [hoveredAnchor, setHoveredAnchor] = useState(null);
  const [hoveredShapeId, setHoveredShapeId] = useState(null);
  const [connectingLine, setConnectingLine] = useState(null);
  const [rightClickStart, setRightClickStart] = useState(null);
  const [wasSelecting, setWasSelecting] = useState(false);
  
  const {
    currentTool,
    shapes,
    selectedShape,
    selectedShapes,
    selectedShapeIds,
    currentProperties,
    zoom,
    pan,
    canvasSize,
    addShape,
    selectShape,
    selectMultipleShapes,
    addToSelection,
    clearSelection,
    updateShape,
    updateMultipleShapes,
    deleteShape,
    setTool,
    setZoom,
    setPan,
    setCanvasSize,
    clipboard,
    setClipboard,
    groupShapes,
    ungroupShapes,
    groups,
    undo,
    redo
  } = useApp();
  
  // Get canvas coordinates from mouse event
  const getCanvasCoordinates = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom
    };
  }, [zoom, pan]);
  
  // Check if point is inside shape
  const isPointInShape = useCallback((point, shape) => {
    const { x, y } = point;
    const { x: sx, y: sy, width, height, type } = shape;
    
    switch (type) {
      case 'rectangle':
      case 'text':
        return x >= sx && x <= sx + width && y >= sy && y <= sy + height;
      case 'circle':
        const centerX = sx + width / 2;
        const centerY = sy + height / 2;
        const radius = Math.min(width, height) / 2;
        const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        return distance <= radius;
      case 'triangle':
        // Simple bounding box check for triangle
        return x >= sx && x <= sx + width && y >= sy && y <= sy + height;
      case 'diamond':
        // Simple bounding box check for diamond
        return x >= sx && x <= sx + width && y >= sy && y <= sy + height;
      case 'line':
        // Check if point is near the line (within 5px tolerance)
        const tolerance = 5;
        const lineLength = Math.sqrt(Math.pow(width, 2) + Math.pow(height, 2));
        if (lineLength === 0) return false;
        
        const dotProduct = ((x - sx) * width + (y - sy) * height) / Math.pow(lineLength, 2);
        const projX = sx + dotProduct * width;
        const projY = sy + dotProduct * height;
        const lineDistance = Math.sqrt(Math.pow(x - projX, 2) + Math.pow(y - projY, 2));
        
        return lineDistance <= tolerance && dotProduct >= 0 && dotProduct <= 1;
      case 'arrow':
        // Simple bounding box check for arrow
        return x >= sx && x <= sx + width && y >= sy && y <= sy + height;
      default:
        return false;
    }
  }, []);
  
  // Find shape at point
  const findShapeAtPoint = useCallback((point) => {
    // Check shapes in reverse order (top to bottom)
    for (let i = shapes.length - 1; i >= 0; i--) {
      if (isPointInShape(point, shapes[i])) {
        return shapes[i];
      }
    }
    return null;
  }, [shapes, isPointInShape]);
  
  // Get resize handle at point
  const getResizeHandleAtPoint = useCallback((point, shape) => {
    if (!shape) return null;
    
    const handleSize = 8;
    const tolerance = 4;
    const { x, y, width, height } = shape;
    
    const handles = [
      { type: 'nw', x: x - handleSize/2, y: y - handleSize/2 },
      { type: 'ne', x: x + width - handleSize/2, y: y - handleSize/2 },
      { type: 'sw', x: x - handleSize/2, y: y + height - handleSize/2 },
      { type: 'se', x: x + width - handleSize/2, y: y + height - handleSize/2 },
      { type: 'n', x: x + width/2 - handleSize/2, y: y - handleSize/2 },
      { type: 's', x: x + width/2 - handleSize/2, y: y + height - handleSize/2 },
      { type: 'w', x: x - handleSize/2, y: y + height/2 - handleSize/2 },
      { type: 'e', x: x + width - handleSize/2, y: y + height/2 - handleSize/2 }
    ];
    
    for (const handle of handles) {
      if (point.x >= handle.x - tolerance && 
          point.x <= handle.x + handleSize + tolerance &&
          point.y >= handle.y - tolerance && 
          point.y <= handle.y + handleSize + tolerance) {
        return handle.type;
      }
    }
    
    return null;
  }, []);
  
  // Find shapes within rectangle
  const findShapesInRect = useCallback((rect) => {
    const { x, y, width, height } = rect;
    const left = Math.min(x, x + width);
    const right = Math.max(x, x + width);
    const top = Math.min(y, y + height);
    const bottom = Math.max(y, y + height);
    
    return shapes.filter(shape => {
      const shapeLeft = shape.x;
      const shapeRight = shape.x + (shape.width || 0);
      const shapeTop = shape.y;
      const shapeBottom = shape.y + (shape.height || 0);
      
      // Check if shape is completely within selection rectangle
      return shapeLeft >= left && shapeRight <= right && 
             shapeTop >= top && shapeBottom <= bottom;
    });
  }, [shapes]);
  
  // Handle context menu
  const handleContextMenu = useCallback((e) => {
    e.preventDefault();
    
    // If we're in the middle of selecting, don't show context menu
    if (isSelecting) {
      return;
    }
    
    // If we just finished selecting, don't show context menu
    if (wasSelecting) {
      setWasSelecting(false);
      return;
    }
    
    const point = getCanvasCoordinates(e);
    const shape = findShapeAtPoint(point);
    
    if (shape) {
      setShowContextMenu(true);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setContextMenuShapeId(shape.id);
      selectShape(shape.id);
      // Switch to select tool when right-clicking on a shape
      if (currentTool !== 'select') {
        setTool('select');
      }
    } else {
      // Right-click on empty space - switch to select tool and show general context menu
      if (currentTool !== 'select') {
        setTool('select');
      }
      setShowContextMenu(true);
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setContextMenuShapeId(null);
      clearSelection();
    }
  }, [getCanvasCoordinates, findShapeAtPoint, selectShape, currentTool, setTool, clearSelection, isSelecting, wasSelecting]);
  
  // Handle context menu actions
  const handleContextMenuAction = useCallback((action) => {
    switch (action) {
      case 'edit':
        if (contextMenuShapeId) {
          const shape = shapes.find(s => s.id === contextMenuShapeId);
          if (shape) {
            setIsEditingText(true);
            setEditingShapeId(shape.id);
            setEditingText(shape.text || '');
            
            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            setTextInputPosition({
              x: rect.left + shape.x * zoom + pan.x,
              y: rect.top + shape.y * zoom + pan.y
            });
          }
        }
        break;
      case 'delete':
        if (contextMenuShapeId) {
          deleteShape(contextMenuShapeId);
        }
        break;
      case 'copy':
        if (selectedShapes.length > 0) {
          setClipboard(selectedShapes.map(shape => ({ ...shape })));
        }
        break;
      case 'paste':
        if (clipboard && clipboard.length > 0) {
          // Get mouse position for pasting at cursor location
          const canvas = canvasRef.current;
          const rect = canvas.getBoundingClientRect();
          const mouseX = (contextMenuPosition.x - rect.left - pan.x) / zoom;
          const mouseY = (contextMenuPosition.y - rect.top - pan.y) / zoom;
          
          // Calculate center of copied shapes
          let minX = Infinity, minY = Infinity;
          clipboard.forEach(shape => {
            minX = Math.min(minX, shape.x);
            minY = Math.min(minY, shape.y);
          });
          
          // Paste shapes centered at mouse position
          const newShapeIds = [];
          clipboard.forEach(shape => {
            const newId = uuidv4(); // Generate a new unique ID
            const newShape = {
              ...shape,
              id: newId,
              x: mouseX + (shape.x - minX),
              y: mouseY + (shape.y - minY)
            };
            addShape(newShape);
            newShapeIds.push(newId);
          });
          
          // Select the newly pasted shapes after a short delay to ensure they're added
          setTimeout(() => {
            selectMultipleShapes(newShapeIds);
          }, 0);
        }
        break;
      case 'duplicate':
        if (contextMenuShapeId) {
          const shape = shapes.find(s => s.id === contextMenuShapeId);
          if (shape) {
            addShape({
              ...shape,
              x: shape.x + 20,
              y: shape.y + 20
            });
          }
        }
        break;
      default:
        break;
    }
    setShowContextMenu(false);
  }, [contextMenuShapeId, selectedShapes, shapes, deleteShape, addShape, zoom, pan, setClipboard, clipboard, contextMenuPosition, selectMultipleShapes]);
  
  // Handle mouse down
  const handleMouseDown = useCallback((e) => {
    // Close context menu if open
    if (showContextMenu) {
      setShowContextMenu(false);
    }
    
    const point = getCanvasCoordinates(e);
    
    // Handle right mouse button for range selection and shape manipulation
    if (e.button === 2) {
      // Switch to select tool for right-click operations
      if (currentTool !== 'select') {
        setTool('select');
      }
      
      const shape = findShapeAtPoint(point);
      setRightClickStart({ x: e.clientX, y: e.clientY, point, shape });
      
      if (shape) {
        // Right-click on a shape - enable dragging and resizing
        // Check if shape is already selected
        if (selectedShapeIds.includes(shape.id)) {
          // If multiple shapes are selected, move all of them
          if (selectedShapes.length > 1) {
            setIsDragging(true);
            setDragOffset({
              x: point.x - shape.x,
              y: point.y - shape.y
            });
          } else {
            // Single shape selected - check for resize handle
            const handle = getResizeHandleAtPoint(point, shape);
            if (handle) {
              setIsResizing(true);
              setResizeHandle(handle);
            } else {
              setIsDragging(true);
              setDragOffset({
                x: point.x - shape.x,
                y: point.y - shape.y
              });
            }
          }
        } else {
          // Select new shape and enable dragging
          if (e.ctrlKey || e.metaKey) {
            // Add to selection
            addToSelection(shape.id);
          } else {
            // Replace selection
            selectShape(shape.id);
          }
          
          setIsDragging(true);
          setDragOffset({
            x: point.x - shape.x,
            y: point.y - shape.y
          });
        }
        return;
      } else {
        // Start range selection with right-click on empty space
        // Use the same logic as left-click range selection
        if (!e.ctrlKey && !e.metaKey) {
          clearSelection();
        }
        setIsSelecting(true);
        setSelectionRect({
          x: point.x,
          y: point.y,
          width: 0,
          height: 0
        });
        return;
      }
    }
    
    if (e.button !== 0) return; // Only handle left mouse button for other operations
    
    if (e.ctrlKey || e.metaKey) {
      // Start panning
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    if (currentTool === 'select') {
      const shape = findShapeAtPoint(point);
      if (shape) {
        // Check if shape is already selected
        if (selectedShapeIds.includes(shape.id)) {
          // If multiple shapes are selected, move all of them
          if (selectedShapes.length > 1) {
            setIsDragging(true);
            setDragOffset({
              x: point.x - shape.x,
              y: point.y - shape.y
            });
          } else {
            // Single shape selected - check for resize handle
            const handle = getResizeHandleAtPoint(point, shape);
            if (handle) {
              setIsResizing(true);
              setResizeHandle(handle);
            } else {
              setIsDragging(true);
              setDragOffset({
                x: point.x - shape.x,
                y: point.y - shape.y
              });
            }
          }
        } else {
          // Select new shape
          if (e.ctrlKey || e.metaKey) {
            // Add to selection
            addToSelection(shape.id);
          } else {
            // Replace selection
            selectShape(shape.id);
          }
          
          setIsDragging(true);
          setDragOffset({
            x: point.x - shape.x,
            y: point.y - shape.y
          });
        }
      } else {
        // Start selection rectangle
        if (!e.ctrlKey && !e.metaKey) {
          clearSelection();
        }
        setIsSelecting(true);
        setSelectionRect({
          x: point.x,
          y: point.y,
          width: 0,
          height: 0
        });
      }
    } else {
      // Start drawing
      setIsDrawing(true);
      setStartPoint(point);
      
      if (currentTool === 'text') {
        // For text, create immediately
        const newShape = {
          type: 'text',
          x: point.x,
          y: point.y,
          width: 100,
          height: 30,
          text: 'テキスト',
          ...currentProperties
        };
        addShape(newShape);
      } else {
        // For other shapes, create a preview
        let startAnchor = null;
        let startShapeId = null;
        
        // Check for anchor points when starting lines/arrows
        if (currentTool === 'line' || currentTool === 'arrow') {
          for (const shape of shapes) {
            if (shape.type !== 'line' && shape.type !== 'arrow') {
              const anchor = findNearestAnchor(point, shape);
              if (anchor) {
                startAnchor = anchor;
                startShapeId = shape.id;
                break;
              }
            }
          }
        }
        
        const newShape = {
          type: currentTool,
          x: startAnchor ? startAnchor.x : point.x,
          y: startAnchor ? startAnchor.y : point.y,
          width: 0,
          height: 0,
          startConnectedTo: startShapeId,
          startAnchor: startAnchor?.id || null,
          ...currentProperties
        };
        setCurrentShape(newShape);
        if (startAnchor) {
          setStartPoint({ x: startAnchor.x, y: startAnchor.y });
        }
      }
    }
  }, [currentTool, getCanvasCoordinates, findShapeAtPoint, selectShape, selectMultipleShapes, addToSelection, clearSelection, currentProperties, addShape, getResizeHandleAtPoint, selectedShapeIds, selectedShapes, showContextMenu, shapes]);
  
  // Handle mouse move
  const handleMouseMove = useCallback((e) => {
    const point = getCanvasCoordinates(e);
    
    // Update cursor based on hover state
    const canvas = canvasRef.current;
    if (canvas && currentTool === 'select') {
      const shape = findShapeAtPoint(point);
      if (shape) {
        const handle = getResizeHandleAtPoint(point, shape);
        if (handle) {
          // Set cursor for resize handles
          const cursorMap = {
            'nw': 'nw-resize',
            'ne': 'ne-resize',
            'sw': 'sw-resize',
            'se': 'se-resize',
            'n': 'n-resize',
            's': 's-resize',
            'w': 'w-resize',
            'e': 'e-resize'
          };
          canvas.style.cursor = cursorMap[handle];
        } else {
          canvas.style.cursor = 'move';
        }
      } else {
        canvas.style.cursor = 'default';
      }
    }
    
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan({
        x: pan.x + deltaX,
        y: pan.y + deltaY
      });
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }
    
    if (isDragging && selectedShapes.length > 0) {
      // Drag selected shapes
      if (selectedShapes.length === 1) {
        // Single shape - use normal drag logic
        const shape = selectedShapes[0];
        const newX = point.x - dragOffset.x;
        const newY = point.y - dragOffset.y;
        
        updateShape(shape.id, {
          x: newX,
          y: newY
        });
        
        // Update connected lines
        const connectedLines = shapes.filter(s => 
          (s.type === 'line' || s.type === 'arrow') &&
          (s.startConnectedTo === shape.id || s.endConnectedTo === shape.id)
        );
        
        connectedLines.forEach(line => {
          const updates = {};
          
          if (line.startConnectedTo === shape.id && line.startAnchor) {
            const anchor = getAnchorPoints({ ...shape, x: newX, y: newY }).find(a => a.id === line.startAnchor);
            if (anchor) {
              updates.x = anchor.x;
              updates.y = anchor.y;
            }
          }
          
          if (line.endConnectedTo === shape.id && line.endAnchor) {
            const anchor = getAnchorPoints({ ...shape, x: newX, y: newY }).find(a => a.id === line.endAnchor);
            if (anchor) {
              updates.width = anchor.x - line.x;
              updates.height = anchor.y - line.y;
            }
          }
          
          if (Object.keys(updates).length > 0) {
            updateShape(line.id, updates);
          }
        });
      } else {
        // Multiple shapes - move all relative to first selected shape
        const primaryShape = selectedShapes[0];
        const deltaX = (point.x - dragOffset.x) - primaryShape.x;
        const deltaY = (point.y - dragOffset.y) - primaryShape.y;
        
        selectedShapes.forEach(shape => {
          updateShape(shape.id, {
            x: shape.x + deltaX,
            y: shape.y + deltaY
          });
        });
      }
    } else if (isSelecting && selectionRect) {
      // Update selection rectangle
      setSelectionRect({
        x: selectionRect.x,
        y: selectionRect.y,
        width: point.x - selectionRect.x,
        height: point.y - selectionRect.y
      });
    } else if (isResizing && selectedShape && resizeHandle) {
      // Resize selected shape
      const { x, y, width, height } = selectedShape;
      let newProps = {};
      
      switch (resizeHandle) {
        case 'nw':
          newProps = {
            x: point.x,
            y: point.y,
            width: width + (x - point.x),
            height: height + (y - point.y)
          };
          break;
        case 'ne':
          newProps = {
            y: point.y,
            width: point.x - x,
            height: height + (y - point.y)
          };
          break;
        case 'sw':
          newProps = {
            x: point.x,
            width: width + (x - point.x),
            height: point.y - y
          };
          break;
        case 'se':
          newProps = {
            width: point.x - x,
            height: point.y - y
          };
          break;
        case 'n':
          newProps = {
            y: point.y,
            height: height + (y - point.y)
          };
          break;
        case 's':
          newProps = {
            height: point.y - y
          };
          break;
        case 'w':
          newProps = {
            x: point.x,
            width: width + (x - point.x)
          };
          break;
        case 'e':
          newProps = {
            width: point.x - x
          };
          break;
      }
      
      // Ensure minimum size
      if (newProps.width !== undefined && newProps.width < 10) newProps.width = 10;
      if (newProps.height !== undefined && newProps.height < 10) newProps.height = 10;
      
      updateShape(selectedShape.id, newProps);
    } else if (isDrawing && currentShape) {
      // Update current shape being drawn
      const width = point.x - startPoint.x;
      const height = point.y - startPoint.y;
      
      if (currentTool === 'line' || currentTool === 'arrow') {
        // Check for anchor point at end position
        let endAnchor = null;
        let endShapeId = null;
        
        for (const shape of shapes) {
          if (shape.type !== 'line' && shape.type !== 'arrow') {
            const anchor = findNearestAnchor(point, shape);
            if (anchor) {
              endAnchor = anchor;
              endShapeId = shape.id;
              break;
            }
          }
        }
        
        if (endAnchor) {
          setCurrentShape({
            ...currentShape,
            width: endAnchor.x - currentShape.x,
            height: endAnchor.y - currentShape.y,
            endConnectedTo: endShapeId,
            endAnchor: endAnchor.id
          });
          setHoveredAnchor(endAnchor);
          setHoveredShapeId(endShapeId);
        } else {
          setCurrentShape({
            ...currentShape,
            width: width,
            height: height,
            endConnectedTo: null,
            endAnchor: null
          });
          setHoveredAnchor(null);
          setHoveredShapeId(null);
        }
      } else if (currentTool === 'circle') {
        // For circles, use the larger dimension as diameter
        const diameter = Math.max(Math.abs(width), Math.abs(height));
        setCurrentShape({
          ...currentShape,
          width: diameter,
          height: diameter
        });
      } else {
        // For rectangles, triangles, diamonds
        setCurrentShape({
          ...currentShape,
          width: Math.abs(width),
          height: Math.abs(height),
          x: Math.min(startPoint.x, point.x),
          y: Math.min(startPoint.y, point.y)
        });
      }
    }
  }, [isPanning, isDragging, isResizing, isSelecting, isDrawing, currentShape, selectedShape, selectedShapes, selectionRect, getCanvasCoordinates, pan, setPan, lastPanPoint, updateShape, dragOffset, startPoint, currentTool, resizeHandle, findShapeAtPoint, getResizeHandleAtPoint]);
  
  // Handle mouse up
  const handleMouseUp = useCallback((e) => {
    console.log('Mouse up - Button:', e.button, 'isSelecting:', isSelecting, 'selectionRect:', selectionRect);
    
    if (isPanning) {
      setIsPanning(false);
    } else if (isDragging) {
      setIsDragging(false);
    } else if (isResizing) {
      setIsResizing(false);
      setResizeHandle(null);
    } else if (isSelecting && selectionRect) {
      // Complete selection - works for both left and right mouse button
      console.log('Completing selection on mouse up');
      const shapesInRect = findShapesInRect(selectionRect);
      console.log('Found shapes in rect:', shapesInRect.length);
      
      if (shapesInRect.length > 0) {
        const newShapeIds = shapesInRect.map(shape => shape.id);
        
        // Use the same logic as left-click: if Ctrl/Cmd is held, add to selection, otherwise replace
        if (e.ctrlKey || e.metaKey) {
          // Combine existing selection with new shapes, avoiding duplicates
          const combinedIds = [...new Set([...selectedShapeIds, ...newShapeIds])];
          console.log('Selecting shapes (with Ctrl):', combinedIds);
          selectMultipleShapes(combinedIds);
        } else {
          // Normal selection replacement
          console.log('Selecting shapes (replace):', newShapeIds);
          selectMultipleShapes(newShapeIds);
        }
      }
      setIsSelecting(false);
      setSelectionRect(null);
      // Set flag to prevent context menu from showing immediately after selection
      if (e.button === 2) {
        setWasSelecting(true);
      }
    } else if (isDrawing && currentShape) {
      // Add the shape if it has meaningful dimensions
      if (currentShape.width > 5 || currentShape.height > 5) {
        addShape(currentShape);
      }
      setIsDrawing(false);
      setCurrentShape(null);
    }
    
    // Handle right-click context menu after mouse up
    if (e.button === 2 && rightClickStart) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - rightClickStart.x, 2) + 
        Math.pow(e.clientY - rightClickStart.y, 2)
      );
      
      console.log('Right-click context menu check - Distance:', distance, 'Was selecting:', isSelecting);
      
      // If the mouse didn't move much and we weren't dragging/resizing/selecting, show context menu
      if (distance < 5 && !isDragging && !isResizing && !isSelecting) {
        const { point, shape } = rightClickStart;
        if (shape) {
          setShowContextMenu(true);
          setContextMenuPosition({ x: e.clientX, y: e.clientY });
          setContextMenuShapeId(shape.id);
          selectShape(shape.id);
        } else {
          setShowContextMenu(true);
          setContextMenuPosition({ x: e.clientX, y: e.clientY });
          setContextMenuShapeId(null);
        }
      }
      setRightClickStart(null);
    }
  }, [isPanning, isDragging, isResizing, isSelecting, isDrawing, currentShape, selectionRect, addShape, findShapesInRect, selectMultipleShapes, rightClickStart, selectShape]);
  
  // Handle wheel for zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(zoom * zoomFactor);
  }, [zoom, setZoom]);
  
  // Handle zoom buttons
  const handleZoomIn = () => setZoom(zoom * 1.2);
  const handleZoomOut = () => setZoom(zoom / 1.2);
  const handleZoomReset = () => setZoom(1);
  
  // Handle double click for text editing
  const handleDoubleClick = useCallback((e) => {
    if (currentTool !== 'select') return;
    
    const point = getCanvasCoordinates(e);
    const shape = findShapeAtPoint(point);
    
    if (shape) {
      setIsEditingText(true);
      setEditingShapeId(shape.id);
      setEditingText(shape.text || '');
      
      // Position the text input at the center of the shape
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      let textX, textY;
      if (shape.type === 'line' || shape.type === 'arrow') {
        // For lines, position at the midpoint
        textX = rect.left + (shape.x + shape.width / 2) * zoom + pan.x;
        textY = rect.top + (shape.y + shape.height / 2) * zoom + pan.y;
      } else {
        // For other shapes, position at the center
        textX = rect.left + (shape.x + shape.width / 2) * zoom + pan.x;
        textY = rect.top + (shape.y + shape.height / 2) * zoom + pan.y;
      }
      
      setTextInputPosition({
        x: textX - 50, // Offset to center the input
        y: textY - 12
      });
    }
  }, [currentTool, getCanvasCoordinates, findShapeAtPoint, zoom, pan]);
  
  // Handle text input completion
  const handleTextInputComplete = useCallback(() => {
    if (editingShapeId) {
      updateShape(editingShapeId, { text: editingText });
    }
    setIsEditingText(false);
    setEditingShapeId(null);
    setEditingText('');
  }, [editingShapeId, editingText, updateShape]);
  
  // Handle text input cancel
  const handleTextInputCancel = useCallback(() => {
    setIsEditingText(false);
    setEditingShapeId(null);
    setEditingText('');
  }, []);
  
  // Draw shape on canvas
  const drawShape = useCallback((ctx, shape) => {
    const { type, x, y, width, height, fill, stroke, strokeWidth, opacity, text, fontSize, fontFamily } = shape;
    
    ctx.save();
    ctx.globalAlpha = opacity || 1;
    ctx.fillStyle = fill || '#ffffff';
    ctx.strokeStyle = stroke || '#000000';
    ctx.lineWidth = strokeWidth || 2;
    
    switch (type) {
      case 'rectangle':
        ctx.fillRect(x, y, width, height);
        ctx.strokeRect(x, y, width, height);
        break;
        
      case 'circle':
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radius = Math.min(width, height) / 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'triangle':
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x + width, y + height);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'diamond':
        ctx.beginPath();
        ctx.moveTo(x + width / 2, y);
        ctx.lineTo(x + width, y + height / 2);
        ctx.lineTo(x + width / 2, y + height);
        ctx.lineTo(x, y + height / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        break;
        
      case 'line':
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
        break;
        
      case 'arrow':
        const arrowHeadLength = 10;
        const angle = Math.atan2(height, width);
        
        // Draw line
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y + height);
        ctx.stroke();
        
        // Draw arrowhead
        ctx.beginPath();
        ctx.moveTo(x + width, y + height);
        ctx.lineTo(
          x + width - arrowHeadLength * Math.cos(angle - Math.PI / 6),
          y + height - arrowHeadLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x + width, y + height);
        ctx.lineTo(
          x + width - arrowHeadLength * Math.cos(angle + Math.PI / 6),
          y + height - arrowHeadLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        break;
        
      case 'text':
        ctx.font = `${fontSize || 16}px ${fontFamily || 'Arial'}`;
        ctx.fillStyle = stroke || '#000000';
        ctx.textBaseline = 'top';
        ctx.fillText(text || '', x, y);
        break;
    }
    
    // Draw text inside shapes (except for line types)
    if (text && type !== 'line' && type !== 'arrow' && type !== 'text') {
      ctx.font = `${fontSize || 14}px ${fontFamily || 'Arial'}`;
      ctx.fillStyle = stroke || '#000000';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Split text into lines
      const lines = text.split('\n');
      const lineHeight = fontSize || 14;
      const totalHeight = lines.length * lineHeight;
      
      lines.forEach((line, index) => {
        const textX = x + width / 2;
        const textY = y + height / 2 - totalHeight / 2 + (index + 0.5) * lineHeight;
        ctx.fillText(line, textX, textY);
      });
    }
    
    ctx.restore();
  }, []);
  
  // Draw anchor points
  const drawAnchorPoints = useCallback((ctx, shape) => {
    const anchors = getAnchorPoints(shape);
    
    ctx.save();
    ctx.fillStyle = '#3498db';
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 1;
    
    anchors.forEach(anchor => {
      const isHovered = hoveredAnchor && 
                       hoveredAnchor.x === anchor.x && 
                       hoveredAnchor.y === anchor.y;
      
      ctx.beginPath();
      ctx.arc(anchor.x, anchor.y, isHovered ? 6 : 4, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
    });
    
    ctx.restore();
  }, [hoveredAnchor]);
  
  // Draw selection handles
  const drawSelectionHandles = useCallback((ctx, shape) => {
    const { x, y, width, height } = shape;
    const handleSize = 8;
    
    ctx.save();
    ctx.fillStyle = '#3498db';
    ctx.strokeStyle = '#2980b9';
    ctx.lineWidth = 1;
    
    // Draw selection outline
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 1, y - 1, width + 2, height + 2);
    ctx.setLineDash([]);
    
    // All handles (corners and edges)
    const handles = [
      { x: x - handleSize/2, y: y - handleSize/2 }, // NW
      { x: x + width - handleSize/2, y: y - handleSize/2 }, // NE
      { x: x - handleSize/2, y: y + height - handleSize/2 }, // SW
      { x: x + width - handleSize/2, y: y + height - handleSize/2 }, // SE
      { x: x + width/2 - handleSize/2, y: y - handleSize/2 }, // N
      { x: x + width/2 - handleSize/2, y: y + height - handleSize/2 }, // S
      { x: x - handleSize/2, y: y + height/2 - handleSize/2 }, // W
      { x: x + width - handleSize/2, y: y + height/2 - handleSize/2 }, // E
    ];
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 1;
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
    
    ctx.restore();
  }, []);
  
  // Draw selection rectangle
  const drawSelectionRect = useCallback((ctx, rect) => {
    if (!rect) return;
    
    const { x, y, width, height } = rect;
    
    ctx.save();
    ctx.strokeStyle = '#3498db';
    ctx.fillStyle = 'rgba(52, 152, 219, 0.1)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    
    // Draw rectangle
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
    
    ctx.restore();
  }, []);
  
  // Draw multiple selection handles
  const drawMultipleSelectionHandles = useCallback((ctx, shapes) => {
    if (shapes.length <= 1) return;
    
    // Calculate bounding box of all selected shapes
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    shapes.forEach(shape => {
      minX = Math.min(minX, shape.x);
      minY = Math.min(minY, shape.y);
      maxX = Math.max(maxX, shape.x + shape.width);
      maxY = Math.max(maxY, shape.y + shape.height);
    });
    
    const boundingBox = {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
    
    // Draw bounding box outline
    ctx.save();
    ctx.setLineDash([10, 5]);
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.strokeRect(boundingBox.x - 2, boundingBox.y - 2, boundingBox.width + 4, boundingBox.height + 4);
    ctx.restore();
    
    // Draw corner handles for group
    const handleSize = 10;
    const handles = [
      { x: boundingBox.x - handleSize/2, y: boundingBox.y - handleSize/2 },
      { x: boundingBox.x + boundingBox.width - handleSize/2, y: boundingBox.y - handleSize/2 },
      { x: boundingBox.x - handleSize/2, y: boundingBox.y + boundingBox.height - handleSize/2 },
      { x: boundingBox.x + boundingBox.width - handleSize/2, y: boundingBox.y + boundingBox.height - handleSize/2 }
    ];
    
    ctx.save();
    ctx.fillStyle = '#e74c3c';
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 1;
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
    
    ctx.restore();
  }, []);
  
  // Main draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply zoom and pan
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);
    
    // Draw grid
    ctx.strokeStyle = '#f0f0f0';
    ctx.lineWidth = 1;
    const gridSize = 20;
    
    for (let x = 0; x <= canvasSize.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize.height);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvasSize.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize.width, y);
      ctx.stroke();
    }
    
    // Draw shapes
    shapes.forEach(shape => {
      drawShape(ctx, shape);
    });
    
    
    // Draw anchor points when drawing lines/arrows
    if ((currentTool === 'line' || currentTool === 'arrow') && isDrawing) {
      shapes.forEach(shape => {
        if (shape.type !== 'line' && shape.type !== 'arrow') {
          drawAnchorPoints(ctx, shape);
        }
      });
    }
    
    // Draw current shape being drawn
    if (currentShape) {
      drawShape(ctx, currentShape);
    }
    
    // Draw selection handles
    if (selectedShapes.length === 1) {
      drawSelectionHandles(ctx, selectedShapes[0]);
    } else if (selectedShapes.length > 1) {
      drawMultipleSelectionHandles(ctx, selectedShapes);
    }
    
    // Draw selection rectangle
    if (selectionRect) {
      drawSelectionRect(ctx, selectionRect);
    }
    
    ctx.restore();
  }, [shapes, currentShape, selectedShapes, selectionRect, zoom, pan, canvasSize, drawShape, drawSelectionHandles, drawMultipleSelectionHandles, drawSelectionRect, drawAnchorPoints, currentTool, isDrawing]);
  
  // Set up canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const container = canvas.parentElement;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      setCanvasSize({ width: rect.width, height: rect.height });
    }
  }, [setCanvasSize]);
  
  // Redraw canvas when state changes
  useEffect(() => {
    draw();
  }, [draw]);
  
  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isEditingText) return; // Don't handle keys while editing text
      
      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          if (selectedShapeIds.length > 0) {
            selectedShapeIds.forEach(id => deleteShape(id));
            clearSelection();
          }
          break;
        case 'Escape':
          clearSelection();
          if (showContextMenu) {
            setShowContextMenu(false);
          }
          break;
        case 'a':
        case 'A':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            selectMultipleShapes(shapes.map(shape => shape.id));
          }
          break;
        case 'c':
        case 'C':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (selectedShapes.length > 0) {
              setClipboard(selectedShapes.map(shape => ({ ...shape })));
            }
          }
          break;
        case 'v':
        case 'V':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (clipboard && clipboard.length > 0) {
              // Get center of canvas viewport for keyboard paste
              const canvas = canvasRef.current;
              const rect = canvas.getBoundingClientRect();
              const centerX = (rect.width / 2 - pan.x) / zoom;
              const centerY = (rect.height / 2 - pan.y) / zoom;
              
              // Calculate center of copied shapes
              let minX = Infinity, minY = Infinity;
              clipboard.forEach(shape => {
                minX = Math.min(minX, shape.x);
                minY = Math.min(minY, shape.y);
              });
              
              // Paste shapes centered at viewport center
              const newShapeIds = [];
              clipboard.forEach(shape => {
                const newShape = {
                  ...shape,
                  x: centerX + (shape.x - minX),
                  y: centerY + (shape.y - minY)
                };
                addShape(newShape);
                newShapeIds.push(newShape.id);
              });
              
              // Select the newly pasted shapes
              selectMultipleShapes(newShapeIds);
            }
          }
          break;
        case 'g':
        case 'G':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (selectedShapeIds.length > 1) {
              groupShapes(selectedShapeIds);
            }
          }
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
          }
          break;
        case 'y':
        case 'Y':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            redo();
          }
          break;
        default:
          break;
      }
    };
    
    const handleClickOutside = (e) => {
      if (showContextMenu) {
        setShowContextMenu(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [selectedShapeIds, selectedShapes, deleteShape, clearSelection, selectMultipleShapes, shapes, isEditingText, showContextMenu, setClipboard, clipboard, addShape, groupShapes, undo, redo]);
  
  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const container = canvas.parentElement;
        const rect = container.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setCanvasSize]);
  
  return (
    <div className="canvas-container">
      <div className="canvas-wrapper">
        <canvas
          ref={canvasRef}
          className="main-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onDoubleClick={handleDoubleClick}
          onContextMenu={handleContextMenu}
          onWheel={handleWheel}
          style={{ cursor: currentTool === 'select' ? 'default' : 'crosshair' }}
        />
        
        <div className="canvas-controls">
          <button onClick={handleZoomOut} disabled={zoom <= 0.1}>
            -
          </button>
          <span className="zoom-level" onClick={handleZoomReset}>
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={handleZoomIn} disabled={zoom >= 5}>
            +
          </button>
        </div>
        
        {/* Text editing textarea */}
        {isEditingText && (
          <textarea
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            onBlur={handleTextInputComplete}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleTextInputComplete();
              } else if (e.key === 'Escape') {
                handleTextInputCancel();
              }
            }}
            style={{
              position: 'absolute',
              left: textInputPosition.x,
              top: textInputPosition.y,
              fontSize: '14px',
              padding: '8px',
              border: '2px solid #3498db',
              borderRadius: '4px',
              backgroundColor: 'white',
              zIndex: 1000,
              minWidth: '100px',
              minHeight: '24px',
              fontFamily: 'Arial, sans-serif',
              resize: 'both',
              outline: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              overflow: 'hidden'
            }}
            autoFocus
            rows={1}
          />
        )}
        
        {/* Context Menu */}
        {showContextMenu && (
          <div
            style={{
              position: 'fixed',
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
              backgroundColor: 'white',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              padding: '4px 0',
              zIndex: 1001,
              minWidth: '120px'
            }}
          >
            {contextMenuShapeId ? (
              // Context menu for shapes
              <>
                <div
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => handleContextMenuAction('edit')}
                >
                  テキストを編集
                </div>
                <div
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => handleContextMenuAction('copy')}
                >
                  コピー (Ctrl+C)
                </div>
                <div
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => handleContextMenuAction('paste')}
                >
                  ペースト (Ctrl+V)
                </div>
                <div
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => handleContextMenuAction('duplicate')}
                >
                  複製
                </div>
                <div
                  style={{
                    height: '1px',
                    backgroundColor: '#eee',
                    margin: '4px 0'
                  }}
                />
                <div
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#e74c3c'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => handleContextMenuAction('delete')}
                >
                  削除
                </div>
              </>
            ) : (
              // Context menu for empty space
              <>
                <div
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#333'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => handleContextMenuAction('paste')}
                >
                  ペースト (Ctrl+V)
                </div>
                <div
                  style={{
                    height: '1px',
                    backgroundColor: '#eee',
                    margin: '4px 0'
                  }}
                />
                <div
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    color: '#666'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  onClick={() => {
                    selectMultipleShapes(shapes.map(shape => shape.id));
                    setShowContextMenu(false);
                  }}
                >
                  すべて選択 (Ctrl+A)
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;