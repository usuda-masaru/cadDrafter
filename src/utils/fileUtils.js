// File save and load utilities

export const saveToFile = (data, filename = 'diagram.json') => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const loadFromFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        resolve(data);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Error reading file'));
    reader.readAsText(file);
  });
};

export const exportToSVG = (shapes, canvasSize) => {
  let svg = `<svg width="${canvasSize.width}" height="${canvasSize.height}" xmlns="http://www.w3.org/2000/svg">`;
  
  shapes.forEach(shape => {
    const { type, x, y, width, height, fill, stroke, strokeWidth, opacity, text, fontSize, fontFamily } = shape;
    
    const shapeStyle = `fill="${fill || '#ffffff'}" stroke="${stroke || '#000000'}" stroke-width="${strokeWidth || 2}" opacity="${opacity || 1}"`;
    
    switch (type) {
      case 'rectangle':
        svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" ${shapeStyle} />`;
        break;
        
      case 'circle':
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        const radius = Math.min(width, height) / 2;
        svg += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" ${shapeStyle} />`;
        break;
        
      case 'triangle':
        const points = `${x + width / 2},${y} ${x},${y + height} ${x + width},${y + height}`;
        svg += `<polygon points="${points}" ${shapeStyle} />`;
        break;
        
      case 'diamond':
        const diamondPoints = `${x + width / 2},${y} ${x + width},${y + height / 2} ${x + width / 2},${y + height} ${x},${y + height / 2}`;
        svg += `<polygon points="${diamondPoints}" ${shapeStyle} />`;
        break;
        
      case 'line':
        svg += `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y + height}" ${shapeStyle} />`;
        break;
        
      case 'arrow':
        const arrowHeadLength = 10;
        const angle = Math.atan2(height, width);
        const arrowHead1X = x + width - arrowHeadLength * Math.cos(angle - Math.PI / 6);
        const arrowHead1Y = y + height - arrowHeadLength * Math.sin(angle - Math.PI / 6);
        const arrowHead2X = x + width - arrowHeadLength * Math.cos(angle + Math.PI / 6);
        const arrowHead2Y = y + height - arrowHeadLength * Math.sin(angle + Math.PI / 6);
        
        svg += `<line x1="${x}" y1="${y}" x2="${x + width}" y2="${y + height}" ${shapeStyle} />`;
        svg += `<line x1="${x + width}" y1="${y + height}" x2="${arrowHead1X}" y2="${arrowHead1Y}" ${shapeStyle} />`;
        svg += `<line x1="${x + width}" y1="${y + height}" x2="${arrowHead2X}" y2="${arrowHead2Y}" ${shapeStyle} />`;
        break;
        
      case 'text':
        svg += `<text x="${x}" y="${y}" font-size="${fontSize || 16}" font-family="${fontFamily || 'Arial'}" fill="${stroke || '#000000'}" opacity="${opacity || 1}">${text || ''}</text>`;
        break;
    }
  });
  
  svg += '</svg>';
  return svg;
};

export const exportToPNG = (canvas) => {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'diagram.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      resolve();
    });
  });
};

export const validateDiagramData = (data) => {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check required properties
  const requiredProps = ['shapes', 'layers', 'canvasSize'];
  for (const prop of requiredProps) {
    if (!data.hasOwnProperty(prop)) {
      return false;
    }
  }
  
  // Validate shapes array
  if (!Array.isArray(data.shapes)) {
    return false;
  }
  
  // Validate each shape
  for (const shape of data.shapes) {
    if (!shape.type || !shape.hasOwnProperty('x') || !shape.hasOwnProperty('y')) {
      return false;
    }
  }
  
  // Validate layers array
  if (!Array.isArray(data.layers)) {
    return false;
  }
  
  // Validate canvas size
  if (!data.canvasSize || !data.canvasSize.width || !data.canvasSize.height) {
    return false;
  }
  
  return true;
};