let canvas = null;
let ctx = null;
let dotnetRef = null;
let customCharacterData = null;

export function init(canvasElement, dotnetObjectRef) {
    canvas = canvasElement;
    dotnetRef = dotnetObjectRef;
    ctx = canvas ? canvas.getContext('2d') : null;

    if (canvas) {
        canvas.width = 800;
        canvas.height = 600;
    }
    
    // Load custom character from localStorage
    loadCustomCharacter();
    
    // Set up keyboard listeners
    window.addEventListener('keydown', e => {
        if ((e.code === 'Space' || e.code === 'ArrowUp') && dotnetRef) {
            e.preventDefault();
            dotnetRef.invokeMethodAsync('OnPlayerInput');
        }
    });

    if (canvas) {
        canvas.addEventListener('click', () => {
            if (dotnetRef) dotnetRef.invokeMethodAsync('OnPlayerInput');
        });
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (dotnetRef) dotnetRef.invokeMethodAsync('OnPlayerInput');
        });
    }
    
    // Listen for custom character update events (from same window)
    window.addEventListener('characterUpdated', () => {
        console.log('Character updated event received');
        loadCustomCharacter();
        // Force a re-render by triggering a small delay
        setTimeout(() => {
            if (dotnetRef) {
                // Character will be reloaded on next render
            }
        }, 100);
    });
    
    // Also listen for storage changes (when character is saved in another tab)
    window.addEventListener('storage', (e) => {
        if (e.key === 'customCharacter') {
            console.log('Storage event received for customCharacter');
            loadCustomCharacter();
        }
    });
    
    // Poll for character updates every second (fallback)
    setInterval(() => {
        loadCustomCharacter();
    }, 1000);
}

function loadCustomCharacter() {
    try {
        const saved = localStorage.getItem('customCharacter');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Validate the data structure
            if (parsed && (parsed.width || Array.isArray(parsed))) {
                customCharacterData = parsed;
                console.log('Custom character loaded successfully');
            } else {
                console.warn('Invalid character data format');
                customCharacterData = null;
            }
        } else {
            customCharacterData = null;
        }
    } catch (e) {
        console.error('Error loading custom character:', e);
        customCharacterData = null;
    }
}

// Set up keyboard listeners (moved outside loadCustomCharacter)
if (typeof window !== 'undefined') {
    window.addEventListener('keydown', e => {
        if ((e.code === 'Space' || e.code === 'ArrowUp') && dotnetRef) {
            e.preventDefault();
            dotnetRef.invokeMethodAsync('OnPlayerInput');
        }
    });

    if (canvas) {
        canvas.addEventListener('click', () => {
            if (dotnetRef) dotnetRef.invokeMethodAsync('OnPlayerInput');
        });
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (dotnetRef) dotnetRef.invokeMethodAsync('OnPlayerInput');
        });
    }
}

function normalizeState(stateJson) {
    const state = typeof stateJson === 'string' ? JSON.parse(stateJson) : stateJson;
    if (!state) return null;

    // Support both PascalCase and camelCase (now using camelCase from C#)
    const pick = (obj, pascal, camel) => obj[camel] ?? obj[pascal] ?? 0;

    return {
        score: pick(state, 'Score', 'score'),
        elapsedSeconds: pick(state, 'ElapsedSeconds', 'elapsedSeconds'),
        isGameOver: pick(state, 'IsGameOver', 'isGameOver') ?? false,
        player: {
            x: pick(state, 'PlayerX', 'playerX'),
            y: pick(state, 'PlayerY', 'playerY'),
            width: pick(state, 'PlayerWidth', 'playerWidth'),
            height: pick(state, 'PlayerHeight', 'playerHeight')
        },
        obstacles: (state.obstacles ?? state.Obstacles ?? [])
    };
}

export function render(stateJson) {
    if (!canvas || !ctx) return;

    try {
        const state = normalizeState(stateJson);
        if (!state) return;

        // Background
        ctx.fillStyle = '#e8f4f8';
        ctx.fillRect(0, 0, 800, 600);

        // Ground (aligned with GROUND_Y = 500 from C#)
        const groundY = 500;
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(800, groundY);
        ctx.stroke();

        // Obstacles
        ctx.fillStyle = '#ff6b6b';
        if (Array.isArray(state.obstacles)) {
            for (const obs of state.obstacles) {
                if (!obs) continue;
                // Support both PascalCase and camelCase
                const x = obs.x ?? obs.X ?? 0;
                const y = obs.y ?? obs.Y ?? 0;
                const width = obs.width ?? obs.Width ?? 0;
                const height = obs.height ?? obs.Height ?? 0;
                if (width > 0 && height > 0) {
                    ctx.fillRect(x, y, width, height);
                }
            }
        }

        // Player - render custom character or default square
        if (state.player && state.player.width > 0 && state.player.height > 0) {
            // Check if we have valid custom character data
            const hasCustomChar = customCharacterData && 
                ((customCharacterData.width && customCharacterData.height && customCharacterData.data) || 
                 Array.isArray(customCharacterData));
            
            if (hasCustomChar) {
                renderCustomCharacter(state.player.x, state.player.y, state.player.width, state.player.height);
            } else {
                // Default square
                ctx.fillStyle = '#4ecdc4';
                ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
            }
        }

        // Score
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${state.score ?? 0}`, 20, 40);

        // Time
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        const time = state.elapsedSeconds ?? 0;
        ctx.fillText(`Time: ${time.toFixed(1)}s`, 780, 40);

        // Game over
        if (state.isGameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, 800, 600);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', 400, 250);
            ctx.font = '24px Arial';
            ctx.fillText(`Final Score: ${state.score}`, 400, 320);
        }
    } catch (e) {
        console.error('Render error', e);
    }
}

function renderCustomCharacter(x, y, width, height) {
    if (!customCharacterData || !ctx) return;
    
    try {
        // Support both old cell-based format and new pixel-based format
        let imageData = null;
        let charWidth = 40;
        let charHeight = 40;
        
        if (customCharacterData.width && customCharacterData.height && customCharacterData.data) {
            // New pixel-based format (40x40)
            charWidth = customCharacterData.width;
            charHeight = customCharacterData.height;
            
            // Validate data length
            const expectedLength = charWidth * charHeight * 4; // RGBA
            if (customCharacterData.data.length !== expectedLength) {
                console.warn(`Invalid character data length: expected ${expectedLength}, got ${customCharacterData.data.length}`);
                return;
            }
            
            imageData = new ImageData(
                new Uint8ClampedArray(customCharacterData.data),
                charWidth,
                charHeight
            );
        } else if (Array.isArray(customCharacterData)) {
            // Old cell-based format (for backwards compatibility - 80x80)
            const cellSize = 40;
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = cellSize * 2;
            tempCanvas.height = cellSize * 2;
            const tempCtx = tempCanvas.getContext('2d');
            
            if (!tempCtx) return;
            
            tempCtx.fillStyle = 'transparent';
            tempCtx.fillRect(0, 0, cellSize * 2, cellSize * 2);
            
            customCharacterData.forEach(cell => {
                if (cell.data) {
                    const cellImageData = new ImageData(
                        new Uint8ClampedArray(cell.data),
                        cellSize,
                        cellSize
                    );
                    tempCtx.putImageData(
                        cellImageData,
                        cell.col * cellSize,
                        cell.row * cellSize
                    );
                }
            });
            
            // Scale down from 80x80 to 40x40
            const scaledCanvas = document.createElement('canvas');
            scaledCanvas.width = 40;
            scaledCanvas.height = 40;
            const scaledCtx = scaledCanvas.getContext('2d');
            if (scaledCtx) {
                scaledCtx.drawImage(tempCanvas, 0, 0, 40, 40);
                ctx.drawImage(scaledCanvas, x, y, width, height);
            }
            return;
        } else {
            console.warn('Invalid character data format');
            return; // Invalid format
        }
        
        // Create a temporary canvas to render the character
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = charWidth;
        tempCanvas.height = charHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        if (!tempCtx) return;
        
        // Put the image data on the temp canvas
        tempCtx.putImageData(imageData, 0, 0);
        
        // Draw the scaled character to the game canvas
        ctx.drawImage(tempCanvas, x, y, width, height);
    } catch (e) {
        console.error('Error rendering custom character:', e);
        // Fallback to default square
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(x, y, width, height);
    }
}

export function refreshCharacter() {
    loadCustomCharacter();
}

export function cleanup() {
    // Cleanup
}
