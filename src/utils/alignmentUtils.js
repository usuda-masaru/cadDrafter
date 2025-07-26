// Alignment and distribution utilities

export const alignShapes = (shapes, alignType) => {
  if (shapes.length < 2) return [];
  
  const updates = [];
  
  switch (alignType) {
    case 'left':
      const leftMost = Math.min(...shapes.map(s => s.x));
      shapes.forEach(shape => {
        updates.push({ id: shape.id, updates: { x: leftMost } });
      });
      break;
      
    case 'right':
      const rightMost = Math.max(...shapes.map(s => s.x + s.width));
      shapes.forEach(shape => {
        updates.push({ id: shape.id, updates: { x: rightMost - shape.width } });
      });
      break;
      
    case 'top':
      const topMost = Math.min(...shapes.map(s => s.y));
      shapes.forEach(shape => {
        updates.push({ id: shape.id, updates: { y: topMost } });
      });
      break;
      
    case 'bottom':
      const bottomMost = Math.max(...shapes.map(s => s.y + s.height));
      shapes.forEach(shape => {
        updates.push({ id: shape.id, updates: { y: bottomMost - shape.height } });
      });
      break;
      
    case 'center-horizontal':
      const avgCenterX = shapes.reduce((sum, s) => sum + s.x + s.width / 2, 0) / shapes.length;
      shapes.forEach(shape => {
        updates.push({ id: shape.id, updates: { x: avgCenterX - shape.width / 2 } });
      });
      break;
      
    case 'center-vertical':
      const avgCenterY = shapes.reduce((sum, s) => sum + s.y + s.height / 2, 0) / shapes.length;
      shapes.forEach(shape => {
        updates.push({ id: shape.id, updates: { y: avgCenterY - shape.height / 2 } });
      });
      break;
      
    default:
      break;
  }
  
  return updates;
};

export const distributeShapes = (shapes, distributeType) => {
  if (shapes.length < 3) return [];
  
  const updates = [];
  
  switch (distributeType) {
    case 'horizontal':
      // Sort by x position
      const sortedByX = [...shapes].sort((a, b) => a.x - b.x);
      const leftMost = sortedByX[0].x;
      const rightMost = sortedByX[sortedByX.length - 1].x + sortedByX[sortedByX.length - 1].width;
      const totalWidth = sortedByX.reduce((sum, s) => sum + s.width, 0);
      const spacing = (rightMost - leftMost - totalWidth) / (shapes.length - 1);
      
      let currentX = leftMost;
      sortedByX.forEach((shape, index) => {
        if (index > 0 && index < sortedByX.length - 1) {
          updates.push({ id: shape.id, updates: { x: currentX } });
        }
        currentX += shape.width + spacing;
      });
      break;
      
    case 'vertical':
      // Sort by y position
      const sortedByY = [...shapes].sort((a, b) => a.y - b.y);
      const topMost = sortedByY[0].y;
      const bottomMost = sortedByY[sortedByY.length - 1].y + sortedByY[sortedByY.length - 1].height;
      const totalHeight = sortedByY.reduce((sum, s) => sum + s.height, 0);
      const spacingY = (bottomMost - topMost - totalHeight) / (shapes.length - 1);
      
      let currentY = topMost;
      sortedByY.forEach((shape, index) => {
        if (index > 0 && index < sortedByY.length - 1) {
          updates.push({ id: shape.id, updates: { y: currentY } });
        }
        currentY += shape.height + spacingY;
      });
      break;
      
    case 'horizontal-spacing':
      // Equal spacing between shapes horizontally
      const sortedHSpacing = [...shapes].sort((a, b) => a.x - b.x);
      const totalWidthHSpacing = sortedHSpacing.reduce((sum, s) => sum + s.width, 0);
      const availableWidth = sortedHSpacing[sortedHSpacing.length - 1].x + 
                           sortedHSpacing[sortedHSpacing.length - 1].width - 
                           sortedHSpacing[0].x;
      const gapWidth = (availableWidth - totalWidthHSpacing) / (shapes.length - 1);
      
      let posX = sortedHSpacing[0].x;
      sortedHSpacing.forEach((shape, index) => {
        if (index > 0) {
          updates.push({ id: shape.id, updates: { x: posX } });
        }
        posX += shape.width + gapWidth;
      });
      break;
      
    case 'vertical-spacing':
      // Equal spacing between shapes vertically
      const sortedVSpacing = [...shapes].sort((a, b) => a.y - b.y);
      const totalHeightVSpacing = sortedVSpacing.reduce((sum, s) => sum + s.height, 0);
      const availableHeight = sortedVSpacing[sortedVSpacing.length - 1].y + 
                            sortedVSpacing[sortedVSpacing.length - 1].height - 
                            sortedVSpacing[0].y;
      const gapHeight = (availableHeight - totalHeightVSpacing) / (shapes.length - 1);
      
      let posY = sortedVSpacing[0].y;
      sortedVSpacing.forEach((shape, index) => {
        if (index > 0) {
          updates.push({ id: shape.id, updates: { y: posY } });
        }
        posY += shape.height + gapHeight;
      });
      break;
      
    default:
      break;
  }
  
  return updates;
};