document.addEventListener('DOMContentLoaded', function() {
  // Canvas elements
  const canvas = document.getElementById('drawingCanvas');
  const ctx = canvas.getContext('2d');
  
  // Control elements
  const colorPicker = document.getElementById('colorPicker');
  const brushSize = document.getElementById('brushSize');
  const clearBtn = document.getElementById('clearBtn');
  const saveBtn = document.getElementById('saveBtn');
  
  // Drawing state
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  
  // Initialize canvas with white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Drawing functions
  function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
  
  function draw(e) {
    if (!isDrawing) return;
    
    ctx.strokeStyle = colorPicker.value;
    ctx.lineWidth = brushSize.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    
    [lastX, lastY] = [e.offsetX, e.offsetY];
  }
  
  function stopDrawing() {
    isDrawing = false;
  }
  
  // Clear canvas function
  function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  
  // Save artwork function
  function saveArtwork() {
    const link = document.createElement('a');
    link.download = 'my-artwork.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }
  
  // Event listeners for drawing
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseout', stopDrawing);
  
  // Event listeners for controls
  clearBtn.addEventListener('click', clearCanvas);
  saveBtn.addEventListener('click', saveArtwork);
});
