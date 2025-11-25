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

        // Ground
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 540);
        ctx.lineTo(800, 540);
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

        // Player - ensure valid dimensions
        if (state.player && state.player.width > 0 && state.player.height > 0) {
            ctx.fillStyle = '#4ecdc4';
            ctx.fillRect(state.player.x, state.player.y, state.player.width, state.player.height);
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

export function cleanup() {
    // Cleanup
}
