let characterCanvas = null;
let characterCtx = null;
let previewCanvas = null;
let previewCtx = null;
let currentColor = '#4ecdc4';
let isDrawing = false;
let cellSize = 40; // Single 40x40 canvas for character

export function init(canvasElement, previewElement, defaultColor) {
    characterCanvas = canvasElement;
    characterCtx = characterCanvas ? characterCanvas.getContext('2d') : null;
    previewCanvas = previewElement;
    previewCtx = previewCanvas ? previewCanvas.getContext('2d') : null;
    currentColor = defaultColor || '#4ecdc4';

    if (characterCanvas && characterCtx) {
        // Ensure canvas is properly sized
        if (characterCanvas.width !== 40) characterCanvas.width = 40;
        if (characterCanvas.height !== 40) characterCanvas.height = 40;
        
        // Draw grid
        drawGrid();
        
        // Set up event listeners
        characterCanvas.addEventListener('mousedown', startDraw);
        characterCanvas.addEventListener('mousemove', draw);
        characterCanvas.addEventListener('mouseup', stopDraw);
        characterCanvas.addEventListener('mouseleave', stopDraw);
        characterCanvas.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            erase(e);
        });
        
        // Touch support
        characterCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startDraw({ clientX: touch.clientX, clientY: touch.clientY, button: 0 });
        });
        characterCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            draw({ clientX: touch.clientX, clientY: touch.clientY });
        });
        characterCanvas.addEventListener('touchend', stopDraw);
    }
}

function drawGrid() {
    if (!characterCtx) return;
    
    // Clear canvas
    characterCtx.fillStyle = '#fff';
    characterCtx.fillRect(0, 0, 40, 40);
    
    // Draw border
    characterCtx.strokeStyle = '#ddd';
    characterCtx.lineWidth = 1;
    characterCtx.strokeRect(0, 0, 40, 40);
}

function getCanvasCoordinates(e) {
    if (!characterCanvas) return { x: 0, y: 0 };
    
    const rect = characterCanvas.getBoundingClientRect();
    const scaleX = characterCanvas.width / rect.width;
    const scaleY = characterCanvas.height / rect.height;
    
    const x = (e.clientX || e.offsetX || 0) - rect.left;
    const y = (e.clientY || e.offsetY || 0) - rect.top;
    
    return {
        x: x * scaleX,
        y: y * scaleY
    };
}

function getCell(x, y) {
    const col = Math.floor(x / cellSize);
    const row = Math.floor(y / cellSize);
    return { col, row };
}

function startDraw(e) {
    isDrawing = true;
    const coords = getCanvasCoordinates(e);
    
    if (e.button === 2 || (e.buttons === 2)) {
        erasePixel(coords.x, coords.y);
    } else {
        drawPixel(coords.x, coords.y);
    }
}

function draw(e) {
    if (!isDrawing || !characterCtx) return;
    
    const coords = getCanvasCoordinates(e);
    drawPixel(coords.x, coords.y);
}

function drawAtCell(cell) {
    if (!characterCtx) return;
    if (cell.col < 0 || cell.col >= 1 || cell.row < 0 || cell.row >= 1) return;
    
    // Fill the cell
    characterCtx.fillStyle = currentColor;
    characterCtx.fillRect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize);
    
    // Redraw grid lines
    drawGridLines();
    
    updatePreview();
}

function drawPixel(x, y) {
    if (!characterCtx) return;
    if (x < 0 || x >= 40 || y < 0 || y >= 40) return;
    
    // Draw with brush size for easier drawing
    const size = brushSize;
    const px = Math.floor(x) - Math.floor(size / 2);
    const py = Math.floor(y) - Math.floor(size / 2);
    
    characterCtx.fillStyle = currentColor;
    characterCtx.fillRect(
        Math.max(0, px), 
        Math.max(0, py), 
        Math.min(size, 40 - Math.max(0, px)), 
        Math.min(size, 40 - Math.max(0, py))
    );
    
    // Redraw grid lines
    drawGridLines();
    
    updatePreview();
}

function erase(e) {
    if (!characterCtx) return;
    
    const coords = getCanvasCoordinates(e);
    erasePixel(coords.x, coords.y);
}

function erasePixel(x, y) {
    if (!characterCtx) return;
    if (x < 0 || x >= 40 || y < 0 || y >= 40) return;
    
    // Erase with brush size
    const size = brushSize;
    const px = Math.floor(x) - Math.floor(size / 2);
    const py = Math.floor(y) - Math.floor(size / 2);
    
    characterCtx.fillStyle = '#fff';
    characterCtx.fillRect(
        Math.max(0, px), 
        Math.max(0, py), 
        Math.min(size, 40 - Math.max(0, px)), 
        Math.min(size, 40 - Math.max(0, py))
    );
    
    // Redraw grid lines
    drawGridLines();
    
    updatePreview();
}

function eraseAtCell(cell) {
    if (!characterCtx) return;
    if (cell.col < 0 || cell.col >= 1 || cell.row < 0 || cell.row >= 1) return;
    
    // Clear the entire cell
    characterCtx.fillStyle = '#fff';
    characterCtx.fillRect(cell.col * cellSize, cell.row * cellSize, cellSize, cellSize);
    
    // Redraw grid lines
    drawGridLines();
    
    updatePreview();
}

function drawGridLines() {
    if (!characterCtx) return;
    
    characterCtx.strokeStyle = '#ddd';
    characterCtx.lineWidth = 1;
    characterCtx.strokeRect(0, 0, 40, 40);
}

function stopDraw() {
    isDrawing = false;
}

export function clearCanvas() {
    if (characterCtx) {
        characterCtx.fillStyle = '#fff';
        characterCtx.fillRect(0, 0, 40, 40);
        drawGrid();
        updatePreview();
    }
}

export function loadDefault() {
    clearCanvas();
    // Draw a simple default character (fill the canvas)
    if (characterCtx) {
        characterCtx.fillStyle = currentColor;
        characterCtx.fillRect(0, 0, 40, 40);
        drawGridLines();
        updatePreview();
    }
}

// Add brush size option for easier drawing
let brushSize = 2; // pixels

export function setBrushSize(size) {
    brushSize = Math.max(1, Math.min(5, size));
}

export function getCharacterData() {
    if (!characterCanvas || !characterCtx) return null;
    
    // Get the entire canvas image data (pixel-by-pixel)
    const imageData = characterCtx.getImageData(0, 0, 40, 40);
    
    // Convert to a simple format for storage
    return JSON.stringify({
        width: 40,
        height: 40,
        data: Array.from(imageData.data)
    });
}

export function loadCharacterData(dataJson) {
    if (!characterCtx || !dataJson) return;
    
    try {
        const data = JSON.parse(dataJson);
        
        // Support both old cell-based format and new pixel-based format
        if (data.width && data.height && data.data) {
            // New pixel-based format
            clearCanvas();
            const imageData = new ImageData(
                new Uint8ClampedArray(data.data),
                data.width,
                data.height
            );
            characterCtx.putImageData(imageData, 0, 0);
            drawGridLines();
            updatePreview();
        } else if (Array.isArray(data)) {
            // Old cell-based format (for backwards compatibility - convert 80x80 to 40x40)
            clearCanvas();
            // Create a temporary canvas to handle old format
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = 80;
            tempCanvas.height = 80;
            const tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) return;
            
            data.forEach(cell => {
                if (cell.data) {
                    const imageData = new ImageData(
                        new Uint8ClampedArray(cell.data),
                        40,
                        40
                    );
                    tempCtx.putImageData(
                        imageData,
                        cell.col * 40,
                        cell.row * 40
                    );
                }
            });
            
            // Scale down from 80x80 to 40x40
            characterCtx.drawImage(tempCanvas, 0, 0, 40, 40);
            drawGridLines();
            updatePreview();
        }
    } catch (e) {
        console.error('Error loading character data:', e);
    }
}

export function updatePreview() {
    if (!previewCanvas || !previewCtx || !characterCanvas) return;
    
    // Copy the character canvas to preview (same size)
    previewCtx.clearRect(0, 0, 40, 40);
    previewCtx.drawImage(characterCanvas, 0, 0);
}

export function setColor(color) {
    currentColor = color;
}

