// ============================================
// BLAZOR DASH - Game Renderer
// Simplified and bulletproof version
// ============================================

let canvas = null;
let ctx = null;
let dotnetRef = null;
let isInitialized = false;

// Initialize canvas
export function init(canvasElement, dotnetObjectRef) {
    try {
        canvas = canvasElement;
        dotnetRef = dotnetObjectRef;

        if (!canvas) {
            throw new Error("Canvas element is null");
        }

        ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error("Could not get 2D context");
        }

        // Force canvas size
        canvas.width = 800;
        canvas.height = 600;

        // Setup event listeners
        window.addEventListener('keydown', handleKeyDown);
        canvas.addEventListener('click', handleClick);
        canvas.addEventListener('touchstart', handleTouch);

        isInitialized = true;
        
        // Draw initial "ready" state
        drawReady();
    } catch (error) {
        console.error("Init error:", error);
        drawError(error.message);
    }
}

// Render the game
export function render(stateJson) {
    try {
        if (!isInitialized || !ctx || !canvas) {
            drawError("Not initialized");
            return;
        }

        let state = null;

        // Parse JSON
        if (typeof stateJson === 'string') {
            state = JSON.parse(stateJson);
        } else if (typeof stateJson === 'object') {
            state = stateJson;
        }

        if (!state) {
            drawError("Invalid state");
            return;
        }

        // Clear
        ctx.fillStyle = '#e8f4f8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw ground
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 540);
        ctx.lineTo(800, 540);
        ctx.stroke();

        // Draw obstacles
        if (state.obstacles && Array.isArray(state.obstacles)) {
            ctx.fillStyle = '#ff6b6b';
            for (let i = 0; i < state.obstacles.length; i++) {
                const obs = state.obstacles[i];
                if (obs && obs.x !== undefined && obs.y !== undefined) {
                    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                }
            }
        }

        // Draw player
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(state.playerX || 100, state.playerY || 500, 40, 40);

        // Draw score
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + (state.score || 0), 20, 40);

        // Draw time
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('Time: ' + ((state.elapsedSeconds || 0).toFixed(1)) + 's', 780, 40);

        // Draw game over
        if (state.isGameOver) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(0, 0, 800, 600);
            
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 48px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', 400, 250);
            
            ctx.font = '24px Arial';
            ctx.fillText('Final Score: ' + (state.score || 0), 400, 320);
        }
    } catch (error) {
        console.error("Render error:", error);
        drawError(error.message);
    }
}

// Draw ready state
function drawReady() {
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, 800, 600);
    
    ctx.fillStyle = '#4ecdc4';
    ctx.font = 'bold 32px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎮 READY', 400, 300);
}

// Draw error
function drawError(msg) {
    if (!ctx || !canvas) return;
    
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(0, 0, 800, 600);
    
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ERROR', 400, 250);
    ctx.font = '16px Arial';
    ctx.fillText(msg, 400, 300);
}

// Handle keyboard input
function handleKeyDown(e) {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (dotnetRef) {
            dotnetRef.invokeMethodAsync('OnPlayerInput');
        }
    }
}

// Handle click
function handleClick(e) {
    if (dotnetRef) {
        dotnetRef.invokeMethodAsync('OnPlayerInput');
    }
}

// Handle touch
function handleTouch(e) {
    e.preventDefault();
    if (dotnetRef) {
        dotnetRef.invokeMethodAsync('OnPlayerInput');
    }
}

// Cleanup
export function cleanup() {
    window.removeEventListener('keydown', handleKeyDown);
    if (canvas) {
        canvas.removeEventListener('click', handleClick);
        canvas.removeEventListener('touchstart', handleTouch);
    }
    isInitialized = false;
}
