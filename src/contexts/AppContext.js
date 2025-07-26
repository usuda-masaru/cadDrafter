import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AppContext = createContext();

// Action types
const ACTIONS = {
  SET_TOOL: 'SET_TOOL',
  ADD_SHAPE: 'ADD_SHAPE',
  UPDATE_SHAPE: 'UPDATE_SHAPE',
  UPDATE_MULTIPLE_SHAPES: 'UPDATE_MULTIPLE_SHAPES',
  DELETE_SHAPE: 'DELETE_SHAPE',
  SELECT_SHAPE: 'SELECT_SHAPE',
  SELECT_MULTIPLE_SHAPES: 'SELECT_MULTIPLE_SHAPES',
  ADD_TO_SELECTION: 'ADD_TO_SELECTION',
  CLEAR_SELECTION: 'CLEAR_SELECTION',
  SET_CANVAS_SIZE: 'SET_CANVAS_SIZE',
  SET_ZOOM: 'SET_ZOOM',
  SET_PAN: 'SET_PAN',
  ADD_LAYER: 'ADD_LAYER',
  SELECT_LAYER: 'SELECT_LAYER',
  TOGGLE_LAYER_VISIBILITY: 'TOGGLE_LAYER_VISIBILITY',
  TOGGLE_LAYER_LOCK: 'TOGGLE_LAYER_LOCK',
  SET_PROPERTIES: 'SET_PROPERTIES',
  LOAD_DIAGRAM: 'LOAD_DIAGRAM',
  RESET_DIAGRAM: 'RESET_DIAGRAM',
  SET_CLIPBOARD: 'SET_CLIPBOARD',
  GROUP_SHAPES: 'GROUP_SHAPES',
  UNGROUP_SHAPES: 'UNGROUP_SHAPES',
  UNDO: 'UNDO',
  REDO: 'REDO'
};

// Initial state
const initialState = {
  // Tool state
  currentTool: 'select',
  
  // Canvas state
  canvasSize: { width: 1200, height: 800 },
  zoom: 1,
  pan: { x: 0, y: 0 },
  
  // Shapes
  shapes: [],
  selectedShapeIds: [],
  groups: [],
  clipboard: null,
  
  // Layers
  layers: [
    { id: 'layer-1', name: 'Layer 1', visible: true, locked: false }
  ],
  currentLayerId: 'layer-1',
  
  // Properties
  currentProperties: {
    fill: '#ffffff',
    stroke: '#000000',
    strokeWidth: 2,
    opacity: 1,
    fontSize: 16,
    fontFamily: 'Arial',
    text: ''
  },
  
  // History for undo/redo
  history: [],
  historyIndex: -1
};

// Helper function to save history
function saveHistory(state, newState) {
  const stateToSave = {
    shapes: state.shapes,
    selectedShapeIds: state.selectedShapeIds,
    groups: state.groups
  };
  
  const newHistory = state.history.slice(0, state.historyIndex + 1);
  newHistory.push(stateToSave);
  
  // Keep only last 50 history entries
  if (newHistory.length > 50) {
    newHistory.shift();
  }
  
  return {
    ...newState,
    history: newHistory,
    historyIndex: newHistory.length - 1
  };
}

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_TOOL:
      return {
        ...state,
        currentTool: action.payload,
        selectedShapeId: null
      };
      
    case ACTIONS.ADD_SHAPE:
      const newShape = { 
        ...action.payload, 
        id: action.payload.id || uuidv4(),
        startConnectedTo: action.payload.startConnectedTo || null,
        startAnchor: action.payload.startAnchor || null,
        endConnectedTo: action.payload.endConnectedTo || null,
        endAnchor: action.payload.endAnchor || null
      };
      // Check if shape with same ID already exists
      const existingShapeIndex = state.shapes.findIndex(s => s.id === newShape.id);
      if (existingShapeIndex >= 0) {
        newShape.id = uuidv4();
      }
      
      const newStateWithShape = {
        ...state,
        shapes: [...state.shapes, newShape]
      };
      
      return saveHistory(state, newStateWithShape);
      
    case ACTIONS.UPDATE_SHAPE:
      const updatedShapeState = {
        ...state,
        shapes: state.shapes.map(shape =>
          shape.id === action.payload.id
            ? { ...shape, ...action.payload.updates }
            : shape
        )
      };
      
      return saveHistory(state, updatedShapeState);
      
    case ACTIONS.UPDATE_MULTIPLE_SHAPES:
      const updates = action.payload; // Array of { id, updates }
      const updatedMultipleShapesState = {
        ...state,
        shapes: state.shapes.map(shape => {
          const update = updates.find(u => u.id === shape.id);
          return update ? { ...shape, ...update.updates } : shape;
        })
      };
      
      return saveHistory(state, updatedMultipleShapesState);
      
    case ACTIONS.DELETE_SHAPE:
      const deletedShapeState = {
        ...state,
        shapes: state.shapes.filter(shape => shape.id !== action.payload),
        selectedShapeIds: state.selectedShapeIds.filter(id => id !== action.payload)
      };
      
      return saveHistory(state, deletedShapeState);
      
    case ACTIONS.SELECT_SHAPE:
      return {
        ...state,
        selectedShapeIds: [action.payload],
        currentTool: 'select'
      };
      
    case ACTIONS.SELECT_MULTIPLE_SHAPES:
      console.log('SELECT_MULTIPLE_SHAPES action:', action.payload);
      return {
        ...state,
        selectedShapeIds: action.payload,
        currentTool: 'select'
      };
      
    case ACTIONS.ADD_TO_SELECTION:
      return {
        ...state,
        selectedShapeIds: [...state.selectedShapeIds, action.payload],
        currentTool: 'select'
      };
      
    case ACTIONS.CLEAR_SELECTION:
      console.log('CLEAR_SELECTION action called');
      return {
        ...state,
        selectedShapeIds: []
      };
      
    case ACTIONS.SET_CANVAS_SIZE:
      return {
        ...state,
        canvasSize: action.payload
      };
      
    case ACTIONS.SET_ZOOM:
      return {
        ...state,
        zoom: Math.max(0.1, Math.min(5, action.payload))
      };
      
    case ACTIONS.SET_PAN:
      return {
        ...state,
        pan: action.payload
      };
      
    case ACTIONS.ADD_LAYER:
      const newLayer = {
        id: `layer-${Date.now()}`,
        name: action.payload.name || `Layer ${state.layers.length + 1}`,
        visible: true,
        locked: false
      };
      return {
        ...state,
        layers: [...state.layers, newLayer],
        currentLayerId: newLayer.id
      };
      
    case ACTIONS.SELECT_LAYER:
      return {
        ...state,
        currentLayerId: action.payload
      };
      
    case ACTIONS.TOGGLE_LAYER_VISIBILITY:
      return {
        ...state,
        layers: state.layers.map(layer =>
          layer.id === action.payload
            ? { ...layer, visible: !layer.visible }
            : layer
        )
      };
      
    case ACTIONS.TOGGLE_LAYER_LOCK:
      return {
        ...state,
        layers: state.layers.map(layer =>
          layer.id === action.payload
            ? { ...layer, locked: !layer.locked }
            : layer
        )
      };
      
    case ACTIONS.SET_PROPERTIES:
      return {
        ...state,
        currentProperties: { ...state.currentProperties, ...action.payload }
      };
      
    case ACTIONS.LOAD_DIAGRAM:
      return {
        ...state,
        ...action.payload
      };
      
    case ACTIONS.RESET_DIAGRAM:
      return {
        ...initialState
      };
      
    case ACTIONS.SET_CLIPBOARD:
      return {
        ...state,
        clipboard: action.payload
      };
      
    case ACTIONS.GROUP_SHAPES:
      return {
        ...state,
        groups: [...state.groups, action.payload]
      };
      
    case ACTIONS.UNGROUP_SHAPES:
      const ungroupedState = {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload)
      };
      
      return saveHistory(state, ungroupedState);
      
    case ACTIONS.UNDO:
      if (state.historyIndex > 0) {
        const previousState = state.history[state.historyIndex - 1];
        return {
          ...state,
          shapes: previousState.shapes,
          selectedShapeIds: previousState.selectedShapeIds,
          groups: previousState.groups,
          historyIndex: state.historyIndex - 1
        };
      }
      return state;
      
    case ACTIONS.REDO:
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        return {
          ...state,
          shapes: nextState.shapes,
          selectedShapeIds: nextState.selectedShapeIds,
          groups: nextState.groups,
          historyIndex: state.historyIndex + 1
        };
      }
      return state;
      
    default:
      return state;
  }
}

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Action creators
  const setTool = useCallback((tool) => {
    dispatch({ type: ACTIONS.SET_TOOL, payload: tool });
  }, []);
  
  const addShape = useCallback((shape) => {
    dispatch({ type: ACTIONS.ADD_SHAPE, payload: shape });
  }, []);
  
  const updateShape = useCallback((id, updates) => {
    dispatch({ type: ACTIONS.UPDATE_SHAPE, payload: { id, updates } });
  }, []);
  
  const updateMultipleShapes = useCallback((updates) => {
    dispatch({ type: ACTIONS.UPDATE_MULTIPLE_SHAPES, payload: updates });
  }, []);
  
  const deleteShape = useCallback((id) => {
    dispatch({ type: ACTIONS.DELETE_SHAPE, payload: id });
  }, []);
  
  const selectShape = useCallback((id) => {
    dispatch({ type: ACTIONS.SELECT_SHAPE, payload: id });
  }, []);
  
  const selectMultipleShapes = useCallback((ids) => {
    dispatch({ type: ACTIONS.SELECT_MULTIPLE_SHAPES, payload: ids });
  }, []);
  
  const addToSelection = useCallback((id) => {
    dispatch({ type: ACTIONS.ADD_TO_SELECTION, payload: id });
  }, []);
  
  const clearSelection = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_SELECTION });
  }, []);
  
  const setCanvasSize = useCallback((size) => {
    dispatch({ type: ACTIONS.SET_CANVAS_SIZE, payload: size });
  }, []);
  
  const setZoom = useCallback((zoom) => {
    dispatch({ type: ACTIONS.SET_ZOOM, payload: zoom });
  }, []);
  
  const setPan = useCallback((pan) => {
    dispatch({ type: ACTIONS.SET_PAN, payload: pan });
  }, []);
  
  const addLayer = useCallback((name) => {
    dispatch({ type: ACTIONS.ADD_LAYER, payload: { name } });
  }, []);
  
  const selectLayer = useCallback((id) => {
    dispatch({ type: ACTIONS.SELECT_LAYER, payload: id });
  }, []);
  
  const toggleLayerVisibility = useCallback((id) => {
    dispatch({ type: ACTIONS.TOGGLE_LAYER_VISIBILITY, payload: id });
  }, []);
  
  const toggleLayerLock = useCallback((id) => {
    dispatch({ type: ACTIONS.TOGGLE_LAYER_LOCK, payload: id });
  }, []);
  
  const setProperties = useCallback((properties) => {
    dispatch({ type: ACTIONS.SET_PROPERTIES, payload: properties });
  }, []);
  
  const loadDiagram = useCallback((data) => {
    dispatch({ type: ACTIONS.LOAD_DIAGRAM, payload: data });
  }, []);
  
  const resetDiagram = useCallback(() => {
    dispatch({ type: ACTIONS.RESET_DIAGRAM });
  }, []);
  
  const setClipboard = useCallback((shapes) => {
    dispatch({ type: ACTIONS.SET_CLIPBOARD, payload: shapes });
  }, []);
  
  const groupShapes = useCallback((shapeIds) => {
    const group = {
      id: uuidv4(),
      shapeIds,
      createdAt: Date.now()
    };
    dispatch({ type: ACTIONS.GROUP_SHAPES, payload: group });
    return group.id;
  }, []);
  
  const ungroupShapes = useCallback((groupId) => {
    dispatch({ type: ACTIONS.UNGROUP_SHAPES, payload: groupId });
  }, []);
  
  const undo = useCallback(() => {
    dispatch({ type: ACTIONS.UNDO });
  }, []);
  
  const redo = useCallback(() => {
    dispatch({ type: ACTIONS.REDO });
  }, []);
  
  // Get selected shapes
  const selectedShapes = state.shapes.filter(shape => state.selectedShapeIds.includes(shape.id));
  const selectedShape = selectedShapes.length === 1 ? selectedShapes[0] : null;
  
  // Get current layer
  const currentLayer = state.layers.find(layer => layer.id === state.currentLayerId);
  
  const contextValue = {
    // State
    ...state,
    selectedShapes,
    selectedShape,
    currentLayer,
    
    // Actions
    setTool,
    addShape,
    updateShape,
    updateMultipleShapes,
    deleteShape,
    selectShape,
    selectMultipleShapes,
    addToSelection,
    clearSelection,
    setCanvasSize,
    setZoom,
    setPan,
    addLayer,
    selectLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    setProperties,
    loadDiagram,
    resetDiagram,
    setClipboard,
    groupShapes,
    ungroupShapes,
    undo,
    redo
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}