// Connection and anchor point utilities

export const getAnchorPoints = (shape) => {
  const { x, y, width, height, type } = shape;
  
  // Basic anchor points for all shapes (N, S, E, W)
  const anchors = [
    { id: 'n', x: x + width / 2, y: y, position: 'north' },
    { id: 's', x: x + width / 2, y: y + height, position: 'south' },
    { id: 'e', x: x + width, y: y + height / 2, position: 'east' },
    { id: 'w', x: x, y: y + height / 2, position: 'west' }
  ];
  
  // Add corner anchors for rectangles and diamonds
  if (type === 'rectangle' || type === 'diamond') {
    anchors.push(
      { id: 'nw', x: x, y: y, position: 'northwest' },
      { id: 'ne', x: x + width, y: y, position: 'northeast' },
      { id: 'sw', x: x, y: y + height, position: 'southwest' },
      { id: 'se', x: x + width, y: y + height, position: 'southeast' }
    );
  }
  
  return anchors;
};

export const findNearestAnchor = (point, shape, threshold = 20) => {
  const anchors = getAnchorPoints(shape);
  let nearestAnchor = null;
  let minDistance = threshold;
  
  anchors.forEach(anchor => {
    const distance = Math.sqrt(
      Math.pow(point.x - anchor.x, 2) + 
      Math.pow(point.y - anchor.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestAnchor = anchor;
    }
  });
  
  return nearestAnchor;
};

export const updateConnectedLines = (shape, lines) => {
  return lines.map(line => {
    let updated = false;
    const updates = { ...line };
    
    // Check if line start is connected to this shape
    if (line.startConnectedTo === shape.id) {
      const anchor = getAnchorPoints(shape).find(a => a.id === line.startAnchor);
      if (anchor) {
        updates.x = anchor.x;
        updates.y = anchor.y;
        updated = true;
      }
    }
    
    // Check if line end is connected to this shape
    if (line.endConnectedTo === shape.id) {
      const anchor = getAnchorPoints(shape).find(a => a.id === line.endAnchor);
      if (anchor) {
        updates.width = anchor.x - line.x;
        updates.height = anchor.y - line.y;
        updated = true;
      }
    }
    
    return updated ? updates : line;
  });
};

export const getConnectionPoint = (line) => {
  // Get the end point of the line
  return {
    x: line.x + (line.width || 0),
    y: line.y + (line.height || 0)
  };
};

export const isLineConnected = (line) => {
  return line.startConnectedTo || line.endConnectedTo;
};