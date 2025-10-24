/**
 * Starfield Background with Shooting Stars and Aries Constellation
 * 
 * Usage:
 * 1. Add a canvas element to your HTML: <canvas id="starfield"></canvas>
 * 2. Include this script: <script src="starfield-background.js"></script>
 * 3. Initialize: StarfieldBackground.init('starfield');
 * 
 * Optional configuration:
 * StarfieldBackground.init('starfield', {
 *   starCount: 150,
 *   shootingStarChance: 0.003,
 *   showAries: true,
 *   ariesInterval: 300
 * });
 */

const StarfieldBackground = (function() {
    // Private variables
    let starCanvas, starCtx, stars = [], starCount = 150;
    let shootingStars = [];
    let ariesConstellation = null;
    let ariesTimer = 0;
    let config = {
        starCount: 150,
        shootingStarChance: 0.003,
        showAries: true,
        ariesInterval: 300
    };

    // Aries constellation pattern (4 main stars in distinctive angular shape)
    const ariesPattern = [
        { x: 0, y: 40 },      // Hamal (Alpha Arietis) - brightest, bottom left
        { x: 50, y: 0 },      // Sheratan (Beta Arietis) - top middle
        { x: 100, y: 30 },    // Mesarthim (Gamma Arietis) - right middle  
        { x: 120, y: 70 }     // 41 Arietis - bottom right
    ];

    function initStarfield(canvasId, options = {}) {
        // Merge custom options with defaults
        config = { ...config, ...options };
        starCount = config.starCount;

        starCanvas = document.getElementById(canvasId);
        if (!starCanvas) {
            console.error(`Canvas element with id '${canvasId}' not found`);
            return;
        }
        
        starCtx = starCanvas.getContext('2d');
        resizeStarfield();
        window.addEventListener('resize', resizeStarfield);
        
        // Create stars
        stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x: Math.random() * starCanvas.width,
                y: Math.random() * starCanvas.height,
                r: Math.random() * 1.6 + 0.4,
                alpha: Math.random() * 0.8 + 0.2,
                blink: Math.random() * 0.02 + 0.005,
                blinkOutChance: 0.0005 // Small chance per frame to blink out
            });
        }
        
        requestAnimationFrame(drawStars);
    }

    function createShootingStar() {
        const side = Math.floor(Math.random() * 4); // Which edge to start from
        let x, y, vx, vy;
        
        // Start from random edge and shoot across
        if (side === 0) { // Top
            x = Math.random() * starCanvas.width;
            y = 0;
            vx = (Math.random() - 0.5) * 8;
            vy = Math.random() * 6 + 4;
        } else if (side === 1) { // Right
            x = starCanvas.width;
            y = Math.random() * starCanvas.height;
            vx = -(Math.random() * 6 + 4);
            vy = (Math.random() - 0.5) * 8;
        } else if (side === 2) { // Bottom
            x = Math.random() * starCanvas.width;
            y = starCanvas.height;
            vx = (Math.random() - 0.5) * 8;
            vy = -(Math.random() * 6 + 4);
        } else { // Left
            x = 0;
            y = Math.random() * starCanvas.height;
            vx = Math.random() * 6 + 4;
            vy = (Math.random() - 0.5) * 8;
        }
        
        shootingStars.push({
            x, y, vx, vy,
            length: Math.random() * 60 + 40,
            alpha: 1,
            decay: 0.015
        });
    }

    function resizeStarfield() {
        if (!starCanvas) return;
        const dpr = window.devicePixelRatio || 1;
        starCanvas.width = Math.floor(window.innerWidth * dpr);
        starCanvas.height = Math.floor(window.innerHeight * dpr);
        starCanvas.style.width = window.innerWidth + 'px';
        starCanvas.style.height = window.innerHeight + 'px';
        starCtx && starCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function drawStars() {
        if (!starCtx) return;
        
        // Clear canvas
        starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
        starCtx.fillStyle = '#000';
        starCtx.fillRect(0, 0, starCanvas.width, starCanvas.height);

        // Aries constellation management
        if (config.showAries) {
            ariesTimer++;
            if (!ariesConstellation && ariesTimer > config.ariesInterval && Math.random() < 0.01) {
                // Create Aries constellation at random position
                const offsetX = Math.random() * (starCanvas.width - 200) + 100;
                const offsetY = Math.random() * (starCanvas.height - 150) + 75;
                const scale = Math.random() * 0.5 + 1; // Random size variation
                
                ariesConstellation = {
                    offsetX, offsetY, scale,
                    alpha: 0,
                    fadeIn: true,
                    duration: 0,
                    maxDuration: Math.random() * 300 + 400 // How long it stays visible
                };
                ariesTimer = 0;
            }
            
            // Update and draw Aries constellation
            if (ariesConstellation) {
                ariesConstellation.duration++;
                
                // Fade in
                if (ariesConstellation.fadeIn) {
                    ariesConstellation.alpha += 0.02;
                    if (ariesConstellation.alpha >= 1) {
                        ariesConstellation.alpha = 1;
                        ariesConstellation.fadeIn = false;
                    }
                }
                
                // Blinking effect while visible
                if (!ariesConstellation.fadeIn && ariesConstellation.duration < ariesConstellation.maxDuration) {
                    ariesConstellation.alpha += (Math.random() - 0.5) * 0.1;
                    ariesConstellation.alpha = Math.max(0.5, Math.min(1, ariesConstellation.alpha));
                }
                
                // Fade out
                if (ariesConstellation.duration >= ariesConstellation.maxDuration) {
                    ariesConstellation.alpha -= 0.015;
                    if (ariesConstellation.alpha <= 0) {
                        ariesConstellation = null;
                    }
                }
                
                // Draw constellation if visible
                if (ariesConstellation) {
                    const { offsetX, offsetY, scale, alpha } = ariesConstellation;
                    
                    // Draw stars at constellation points
                    ariesPattern.forEach(point => {
                        const px = offsetX + point.x * scale;
                        const py = offsetY + point.y * scale;
                        
                        const grad = starCtx.createRadialGradient(px, py, 0, px, py, 4 * scale);
                        grad.addColorStop(0, `rgba(255,200,150,${alpha})`);
                        grad.addColorStop(0.3, `rgba(255,220,180,${alpha * 0.7})`);
                        grad.addColorStop(1, `rgba(255,200,100,0)`);
                        
                        starCtx.beginPath();
                        starCtx.fillStyle = grad;
                        starCtx.arc(px, py, 3 * scale, 0, Math.PI * 2);
                        starCtx.fill();
                    });
                    
                    // Draw connecting lines
                    starCtx.strokeStyle = `rgba(255,220,180,${alpha * 0.4})`;
                    starCtx.lineWidth = 1;
                    starCtx.beginPath();
                    ariesPattern.forEach((point, i) => {
                        const px = offsetX + point.x * scale;
                        const py = offsetY + point.y * scale;
                        if (i === 0) {
                            starCtx.moveTo(px, py);
                        } else {
                            starCtx.lineTo(px, py);
                        }
                    });
                    starCtx.stroke();
                }
            }
        }

        // Occasionally create a shooting star
        if (Math.random() < config.shootingStarChance) {
            createShootingStar();
        }

        // Draw and update shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            const ss = shootingStars[i];
            
            // Update position
            ss.x += ss.vx;
            ss.y += ss.vy;
            ss.alpha -= ss.decay;
            
            // Remove if faded or off screen
            if (ss.alpha <= 0 || ss.x < -100 || ss.x > starCanvas.width + 100 || 
                ss.y < -100 || ss.y > starCanvas.height + 100) {
                shootingStars.splice(i, 1);
                continue;
            }
            
            // Draw shooting star with trail
            const grad = starCtx.createLinearGradient(
                ss.x, ss.y, 
                ss.x - ss.vx * (ss.length / Math.sqrt(ss.vx*ss.vx + ss.vy*ss.vy)), 
                ss.y - ss.vy * (ss.length / Math.sqrt(ss.vx*ss.vx + ss.vy*ss.vy))
            );
            grad.addColorStop(0, `rgba(255,255,255,${ss.alpha})`);
            grad.addColorStop(0.3, `rgba(200,220,255,${ss.alpha * 0.6})`);
            grad.addColorStop(1, `rgba(100,150,255,0)`);
            
            starCtx.strokeStyle = grad;
            starCtx.lineWidth = 2;
            starCtx.lineCap = 'round';
            starCtx.beginPath();
            starCtx.moveTo(ss.x, ss.y);
            starCtx.lineTo(
                ss.x - ss.vx * (ss.length / Math.sqrt(ss.vx*ss.vx + ss.vy*ss.vy)), 
                ss.y - ss.vy * (ss.length / Math.sqrt(ss.vx*ss.vx + ss.vy*ss.vy))
            );
            starCtx.stroke();
        }

        // Draw regular stars
        for (let i = 0; i < stars.length; i++) {
            const s = stars[i];
            
            // Occasionally blink out and respawn star
            if (Math.random() < s.blinkOutChance) {
                s.x = Math.random() * starCanvas.width;
                s.y = Math.random() * starCanvas.height;
                s.r = Math.random() * 1.6 + 0.4;
                s.alpha = Math.random() * 0.3; // Start dim when appearing
            }
            
            s.alpha += (Math.random() - 0.5) * s.blink * 2; // Increased twinkle intensity
            s.alpha = Math.max(0.05, Math.min(1, s.alpha));

            // glow
            const grad = starCtx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 6);
            grad.addColorStop(0, `rgba(160,220,255,${s.alpha})`);
            grad.addColorStop(0.2, `rgba(120,180,255,${s.alpha * 0.7})`);
            grad.addColorStop(0.6, `rgba(90,120,255,${s.alpha * 0.12})`);
            grad.addColorStop(1, `rgba(0,0,0,0)`);

            starCtx.beginPath();
            starCtx.fillStyle = grad;
            starCtx.arc(s.x, s.y, s.r * 2, 0, Math.PI * 2);
            starCtx.fill();
        }
        
        requestAnimationFrame(drawStars);
    }

    // Public API
    return {
        init: initStarfield,
        
        // Allow external configuration changes
        setStarCount: function(count) {
            config.starCount = count;
        },
        
        setShootingStarChance: function(chance) {
            config.shootingStarChance = chance;
        },
        
        enableAries: function(enabled) {
            config.showAries = enabled;
        }
    };
})();

// Auto-initialize if a canvas with id "starfield" exists
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const autoCanvas = document.getElementById('starfield');
        if (autoCanvas && !autoCanvas.dataset.noAutoInit) {
            StarfieldBackground.init('starfield');
        }
    });
}
