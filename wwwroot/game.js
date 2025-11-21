let canvas = null;
let ctx = null;
let dotnetRef = null;

export function init(canvasElement, dotnetObjectRef) {
    canvas = canvasElement;
    dotnetRef = dotnetObjectRef;
    ctx = canvas ? canvas.getContext('2d') : null;
    
    if (canvas) {
        canvas.width = 800;
        canvas.height = 600;
    }
    
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

export function render(stateJson) {
    if (!canvas || !ctx) return;
    
    try {
        let state = typeof stateJson === 'string' ? JSON.parse(stateJson) : stateJson;
        if (!state) return;
        
        // Background
        ctx.fillStyle = '#e8f4f8';
        ctx.fillRect(0, 0, 800, 600);
        
        // Ground
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 540);
        ctx.lineTo(800, 540);
        ctx.stroke();
        
        // Obstacles
        ctx.fillStyle = '#ff6b6b';
        if (state.obstacles && Array.isArray(state.obstacles)) {
            for (const obs of state.obstacles) {
                if (obs) ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
            }
        }
        
        // Player
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(state.playerX, state.playerY, state.playerWidth, state.playerHeight);
        
        // Score
        ctx.fillStyle = '#333';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${state.score}`, 20, 40);
        
        // Time
        ctx.fillStyle = '#666';
        ctx.font = '14px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(`Time: ${(state.elapsedSeconds || 0).toFixed(1)}s`, 780, 40);
        
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
        // Silently fail
    }
}

export function cleanup() {
    // Cleanup
}
