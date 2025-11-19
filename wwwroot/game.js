/**
 * BlazorDash Game Canvas Renderer
 * Handles all rendering operations via JavaScript interop with Blazor
 */

let canvas = null;
let ctx = null;
let dotnetRef = null;
let gameRunning = false;
let lastFrameTime = 0;

/**
 * Initialize the game canvas and set up event listeners
 */
export function init(canvasElement, dotnetObjectRef) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    dotnetRef = dotnetObjectRef;

    // Set canvas size (responsive)
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Keyboard controls
    window.addEventListener('keydown', onKeyDown);

    // Touch controls for mobile
    canvas.addEventListener('touchstart', onTouchStart);
    canvas.addEventListener('click', onCanvasClick);

    gameRunning = true;
    requestAnimationFrame(gameLoop);
}

/**
 * Resize canvas to fit container
 */
function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = Math.min(800, rect.width - 20);
    canvas.height = 600;
}

/**
 * Main game loop - calls render() each frame
 */
function gameLoop(timestamp) {
    if (!gameRunning) return;

    const deltaTime = lastFrameTime ? (timestamp - lastFrameTime) / 1000 : 0.016;
    lastFrameTime = timestamp;

    // Render the current game state (sent from Blazor)
    render();

    requestAnimationFrame(gameLoop);
}

/**
 * Render the game state
 * Called by Blazor to draw the current game state
 */
export function render(stateJson) {
    if (!canvas || !ctx) return;

    // Parse game state
    let state = null;
    if (typeof stateJson === 'string') {
        state = JSON.parse(stateJson);
    } else if (typeof stateJson === 'object') {
        state = stateJson;
    } else {
        return;
    }

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#e8f4f8';
    ctx.fillRect(0, 0, width, height);

    // Draw ground line
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, state.playerY + state.playerHeight);
    ctx.lineTo(width, state.playerY + state.playerHeight);
    ctx.stroke();

    // Draw obstacles
    ctx.fillStyle = '#ff6b6b';
    for (const obstacle of state.obstacles) {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    // Draw player
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(state.playerX, state.playerY, state.playerWidth, state.playerHeight);

    // Draw score
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${state.score}`, 20, 40);

    // Draw game over message if applicable
    if (state.isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', width / 2, height / 2 - 40);

        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${state.score}`, width / 2, height / 2 + 20);
    }

    // Draw time elapsed (for debugging)
    ctx.fillStyle = '#666';
    ctx.font = '14px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(`Time: ${state.elapsedSeconds.toFixed(1)}s`, width - 20, 40);
}

/**
 * Handle keyboard input
 */
function onKeyDown(event) {
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
        if (dotnetRef) {
            dotnetRef.invokeMethodAsync('OnPlayerInput');
        }
    }
}

/**
 * Handle touch input (mobile)
 */
function onTouchStart(event) {
    event.preventDefault();
    if (dotnetRef) {
        dotnetRef.invokeMethodAsync('OnPlayerInput');
    }
}

/**
 * Handle mouse click input
 */
function onCanvasClick(event) {
    if (dotnetRef) {
        dotnetRef.invokeMethodAsync('OnPlayerInput');
    }
}

/**
 * Cleanup function to stop the game loop
 */
export function cleanup() {
    gameRunning = false;
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('resize', resizeCanvas);
    if (canvas) {
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('click', onCanvasClick);
    }
}
