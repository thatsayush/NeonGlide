import { GameStateData, PowerUpsState } from '../types';

export class GameEngine {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    onStateChange: (state: GameStateData) => void;
    
    width = 800;
    height = 600;
    
    // Player
    player = { x: 200, y: 300, vy: 0, radius: 14, alive: true };
    
    // Entities
    pipes: { x: number, w: number, gapTop: number, gapBottom: number, passed: boolean }[] = [];
    coins: { x: number, y: number, r: number, collected: boolean, life: number }[] = [];
    powerUpItems: { x: number, y: number, type: keyof PowerUpsState, r: number, collected: boolean, life: number }[] = [];
    particles: { x: number, y: number, vx: number, vy: number, life: number, maxLife: number, color: string }[] = [];
    backgroundStars: { x: number, y: number, z: number }[] = [];
    
    // Game params
    started = false;
    baseSpeed = 5;
    gravity = 0.45;
    jumpPower = -8.5;
    frameCount = 0;
    
    score = 0;
    collectedCoins = 0;
    combo = 1;
    
    powerUpsTimer = { shield: 0, turbo: 0, slowmo: 0, magnet: 0 };
    MAX_POWERUP_TIME = 8000;
    
    reqId = 0;
    lastTime = 0;

    constructor(canvas: HTMLCanvasElement, onStateChange: (state: GameStateData) => void) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!;
        this.onStateChange = onStateChange;
        
        this.resize();
        window.addEventListener('resize', this.resize.bind(this));
        
        // Input
        const handleFlap = (e?: Event) => {
            if (e) e.preventDefault();
            this.flap();
        };
        
        this.canvas.addEventListener('mousedown', handleFlap);
        this.canvas.addEventListener('touchstart', handleFlap, { passive: false });
        
        window.addEventListener('keydown', (e) => {
           if (e.code === 'Space') this.flap();
        });
        
        for(let i=0; i<100; i++) {
           this.backgroundStars.push({
               x: Math.random() * this.width,
               y: Math.random() * this.height,
               z: Math.random() * 2 + 0.5
           });
        }
        
        this.reset();
        this.start();
    }
    
    resize() {
        // Find parent container to match size exactly
        const parent = this.canvas.parentElement;
        if (parent) {
            this.canvas.width = parent.clientWidth;
            this.canvas.height = parent.clientHeight;
        }
        this.width = this.canvas.width;
        this.height = this.canvas.height;
    }
    
    reset() {
        this.player = { x: this.width * 0.25, y: this.height / 2, vy: 0, radius: 14, alive: true };
        this.pipes = [];
        this.coins = [];
        this.powerUpItems = [];
        this.particles = [];
        this.score = 0;
        this.collectedCoins = 0;
        this.combo = 1;
        this.frameCount = 0;
        this.powerUpsTimer = { shield: 0, turbo: 0, slowmo: 0, magnet: 0 };
        this.started = false;
        this.notify();
    }

    start() {
        if (!this.reqId) {
            this.reqId = requestAnimationFrame(this.update.bind(this));
        }
    }
    
    stop() {
        if (this.reqId) {
            cancelAnimationFrame(this.reqId);
            this.reqId = 0;
        }
    }
    
    destroy() {
        this.stop();
        window.removeEventListener('resize', this.resize.bind(this));
        // Remove other listeners if needed, mostly handled by unmount
    }

    flap() {
        if (!this.player.alive) return;
        
        if (!this.started) {
            this.started = true;
            this.player.vy = this.jumpPower;
            return;
        }
        
        this.player.vy = this.jumpPower;
        
        // Spawn exhaust particles
        for(let i=0; i<8; i++) {
            this.spawnParticle(
                this.player.x - 10, 
                this.player.y + (Math.random() * 10 - 5), 
                -Math.random() * 3 - 1, 
                (Math.random() - 0.5) * 4, 
                '#06b6d4', 
                0.8
            );
        }
    }
    
    spawnParticle(x: number, y: number, vx: number, vy: number, color: string, life = 1.0) {
        this.particles.push({ x, y, vx, vy, life, maxLife: life, color });
    }
    
    handleDeath() {
        this.player.alive = false;
        // Big explosion
        for(let j=0; j<40; j++) {
            this.spawnParticle(
                this.player.x, this.player.y, 
                (Math.random() - 0.5) * 15, 
                (Math.random() - 0.5) * 15, 
                ['#ef4444', '#f97316', '#eab308'][Math.floor(Math.random()*3)],
                1.5 + Math.random()
            );
        }
    }
    
    spawnPipe() {
        const gapSize = Math.max(160, 220 - (this.score * 0.5)); // gets slightly harder
        const margin = 100;
        const gapTop = margin + Math.random() * (this.height - 2 * margin - gapSize);
        const gapBottom = gapTop + gapSize;
        
        this.pipes.push({ x: this.width, w: 70, gapTop, gapBottom, passed: false });
        
        // Probabilities based on items
        const r = Math.random();
        if (r < 0.5) {
            // Spawn Coins
            const numCoins = Math.floor(Math.random() * 3) + 2;
            for(let i=0; i<numCoins; i++) {
                this.coins.push({ 
                    x: this.width + 35 + i * 40, 
                    y: gapTop + gapSize/2 + Math.sin(i) * 20, 
                    r: 10, 
                    life: 0,
                    collected: false 
                });
            }
        } else if (r < 0.65) {
            // Spawn PowerUp
            const types: (keyof PowerUpsState)[] = ['shield', 'turbo', 'slowmo', 'magnet'];
            const t = types[Math.floor(Math.random() * types.length)];
            this.powerUpItems.push({ 
                x: this.width + 35, 
                y: gapTop + gapSize/2, 
                type: t, 
                r: 14, 
                life: 0,
                collected: false 
            });
        }
    }

    notify() {
        this.onStateChange({
            score: this.score,
            coins: this.collectedCoins,
            powerUps: {
                shield: (this.powerUpsTimer.shield / this.MAX_POWERUP_TIME) * 100,
                turbo: (this.powerUpsTimer.turbo / this.MAX_POWERUP_TIME) * 100,
                slowmo: (this.powerUpsTimer.slowmo / this.MAX_POWERUP_TIME) * 100,
                magnet: (this.powerUpsTimer.magnet / this.MAX_POWERUP_TIME) * 100,
            },
            altitude: Math.max(0, this.height - this.player.y) * 1.5,
            velocity: this.player.vy,
            fuel: this.player.alive ? 100 : 0, 
            gameOver: !this.player.alive && this.started,
            gameStarted: this.started
        });
    }

    update(time: number) {
        this.reqId = requestAnimationFrame(this.update.bind(this));
        
        // Setup dt
        if (!this.lastTime) this.lastTime = time;
        const dtStr = time - this.lastTime;
        const dt = Math.min(dtStr, 32); // cap dt to prevent huge jumps if tab was inactive
        this.lastTime = time;
        
        const timeScale = dt / 16.66; // scale relative to 60fps
        
        // Render step
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        if (!this.started) {
            this.drawDecorations(timeScale);
            this.drawPlayer();
            // gentle float logic while waiting
            this.player.y = this.height / 2 + Math.sin(time / 300) * 15;
            return;
        }
        
        this.frameCount += timeScale;
        
        // --- LOGIC ---
        
        // Powerups decay
        let currentSpeed = this.baseSpeed;
        if (this.powerUpsTimer.turbo > 0) currentSpeed = this.baseSpeed * 2.5;
        if (this.powerUpsTimer.slowmo > 0) currentSpeed = this.baseSpeed * 0.5;
        
        for (const k of Object.keys(this.powerUpsTimer) as (keyof PowerUpsState)[]) {
            if (this.powerUpsTimer[k] > 0) {
                this.powerUpsTimer[k] -= dt;
                if (this.powerUpsTimer[k] < 0) this.powerUpsTimer[k] = 0;
            }
        }
        
        const frameSpeed = currentSpeed * timeScale;
        
        // Physics update
        if (this.player.alive) {
            let currentGrav = this.gravity;
            if (this.powerUpsTimer.slowmo > 0) currentGrav *= 0.6;
            
            if (this.powerUpsTimer.turbo > 0) {
                // Auto pilot to center smoothly
                this.player.y += (this.height / 2 - this.player.y) * 0.05 * timeScale;
                this.player.vy = 0;
            } else {
                this.player.vy += currentGrav * timeScale;
                this.player.y += this.player.vy * timeScale;
            }
            
            // Bounds check
            if (this.player.y - this.player.radius > this.height || this.player.y + this.player.radius < 0) {
                if (this.powerUpsTimer.turbo <= 0) {
                    this.handleDeath();
                }
            }
        } else {
            // Dead logic - fall off screen
            this.player.vy += this.gravity * timeScale;
            this.player.y += this.player.vy * timeScale;
            this.player.x -= frameSpeed * 0.5;
        }
        
        // Spawning
        const spawnInterval = Math.max(50, Math.floor(120 / (currentSpeed / this.baseSpeed)));
        if (this.frameCount >= spawnInterval && this.player.alive) {
            this.spawnPipe();
            this.frameCount = 0;
        }
        
        // Entities Update & Draw
        this.drawDecorations(frameSpeed);
        
        // Move pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const p = this.pipes[i];
            // Only move if alive or slow death
            if (this.player.alive || p.x > -p.w) {
                p.x -= frameSpeed;
            }
            
            // Score
            if (!p.passed && this.player.x > p.x + p.w && this.player.alive) {
                p.passed = true;
                this.score += 10;
            }
            
            // Collision checks
            if (this.player.alive && this.powerUpsTimer.turbo <= 0) {
                // simple AABB
                if (this.player.x + this.player.radius * 0.8 > p.x && this.player.x - this.player.radius * 0.8 < p.x + p.w) {
                    if (this.player.y - this.player.radius * 0.8 < p.gapTop || this.player.y + this.player.radius * 0.8 > p.gapBottom) {
                        if (this.powerUpsTimer.shield > 0) {
                            this.powerUpsTimer.shield = 0;
                            p.passed = true;
                            // Shield break effect
                            for(let j=0; j<30; j++) this.spawnParticle(this.player.x, this.player.y, (Math.random()-0.5)*10, (Math.random()-0.5)*10, '#a855f7');
                            // Shake 
                            this.ctx.translate(Math.random()*10 - 5, Math.random()*10 - 5);
                        } else {
                            this.handleDeath();
                        }
                    }
                }
            }
            
            this.drawPipe(p);
            
            if (p.x + p.w < -100) this.pipes.splice(i, 1);
        }
        
        // Move items
        for (let i = this.coins.length - 1; i >= 0; i--) {
            const c = this.coins[i];
            c.x -= frameSpeed;
            c.life += dt;
            
            if (this.player.alive) {
                if (this.powerUpsTimer.magnet > 0) {
                    const dx = this.player.x - c.x;
                    const dy = this.player.y - c.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist < 350) {
                        c.x += (dx / dist) * 12 * timeScale;
                        c.y += (dy / dist) * 12 * timeScale;
                    }
                }
                
                const dx = this.player.x - c.x;
                const dy = this.player.y - c.y;
                if (Math.hypot(dx, dy) < this.player.radius + c.r + 5) {
                    this.collectedCoins++;
                    this.score += 5;
                    this.coins.splice(i, 1);
                    for(let j=0; j<8; j++) this.spawnParticle(c.x, c.y, (Math.random()-0.5)*6, (Math.random()-0.5)*6, '#facc15');
                    continue;
                }
            }
            
            this.drawCoin(c);
            if (c.x + c.r < -50) this.coins.splice(i, 1);
        }
        
        for (let i = this.powerUpItems.length - 1; i >= 0; i--) {
            const pu = this.powerUpItems[i];
            pu.x -= frameSpeed;
            pu.life += dt;
            
            if (this.player.alive) {
                const dx = this.player.x - pu.x;
                const dy = this.player.y - pu.y;
                if (Math.hypot(dx, dy) < this.player.radius + pu.r + 5) {
                    this.powerUpsTimer[pu.type] = this.MAX_POWERUP_TIME;
                    this.powerUpItems.splice(i, 1);
                    const colorMap = { shield: '#a855f7', turbo: '#f97316', slowmo: '#22d3ee', magnet: '#4ade80' };
                    for(let j=0; j<20; j++) this.spawnParticle(pu.x, pu.y, (Math.random()-0.5)*8, (Math.random()-0.5)*8, colorMap[pu.type]);
                    continue;
                }
            }
            
            this.drawPowerUp(pu);
            if (pu.x + pu.r < -50) this.powerUpItems.splice(i, 1);
        }
        
        // Particles Update
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const pt = this.particles[i];
            pt.x += pt.vx * timeScale;
            pt.y += pt.vy * timeScale;
            pt.life -= 0.03 * timeScale;
            
            this.ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
            this.ctx.fillStyle = pt.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = pt.color;
            this.ctx.beginPath();
            this.ctx.arc(pt.x, pt.y, 2 + pt.life * 2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1.0;
            this.ctx.shadowBlur = 0;
            
            if (pt.life <= 0) this.particles.splice(i, 1);
        }
        
        // Turbo Trail Effect
        if (this.powerUpsTimer.turbo > 0 && this.player.alive && Math.random() < 0.5) {
            this.spawnParticle(this.player.x - 20, this.player.y + (Math.random()*10 - 5), -Math.random()*15 - 5, 0, '#f97316', 0.5);
            this.spawnParticle(this.player.x - 20, this.player.y + (Math.random()*10 - 5), -Math.random()*15 - 5, 0, '#eab308', 0.5);
        }
        
        this.ctx.setTransform(1, 0, 0, 1, 0, 0); // reset shake if any
        
        this.drawPlayer();
        
        // Debounce notify to not crash React
        if (Math.random() < 0.2 || !this.player.alive) {
            this.notify();
        }
    }
    
    // --- DRAWING ---
    
    drawDecorations(speed: number) {
        // Speed lines if turbo
        if (this.powerUpsTimer.turbo > 0) {
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = 'rgba(249, 115, 22, 0.4)';
            this.ctx.beginPath();
            for(let i=0; i<10; i++) {
                const y = Math.random() * this.height;
                const x = Math.random() * this.width;
                const l = Math.random() * 200 + 50;
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x - l, y);
            }
            this.ctx.stroke();
        }
        
        // Parallax stars
        this.ctx.fillStyle = 'white';
        for(const s of this.backgroundStars) {
            s.x -= speed * (s.z * 0.1);
            if (s.x < 0) {
                s.x = this.width;
                s.y = Math.random() * this.height;
            }
            this.ctx.globalAlpha = s.z * 0.3;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, s.z, 0, Math.PI*2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1.0;
    }
    
    drawPipe(p: any) {
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#06b6d4';
        
        const gradTop = this.ctx.createLinearGradient(p.x, 0, p.x + p.w, 0);
        gradTop.addColorStop(0, 'rgba(6,182,212,0.1)');
        gradTop.addColorStop(0.5, 'rgba(6,182,212,0.4)');
        gradTop.addColorStop(1, 'rgba(6,182,212,0.1)');
        
        this.ctx.fillStyle = gradTop;
        this.ctx.strokeStyle = '#22d3ee';
        this.ctx.lineWidth = 2;
        
        // Top pipe
        this.ctx.fillRect(p.x, 0, p.w, p.gapTop);
        this.ctx.strokeRect(p.x, 0, p.w, p.gapTop);

        // Cap Top pipe
        this.ctx.fillStyle = '#06b6d4';
        this.ctx.fillRect(p.x - 5, p.gapTop - 15, p.w + 10, 15);
        
        // Bottom pipe
        this.ctx.fillStyle = gradTop;
        this.ctx.fillRect(p.x, p.gapBottom, p.w, this.height - p.gapBottom);
        this.ctx.strokeRect(p.x, p.gapBottom, p.w, this.height - p.gapBottom);
        
        // Cap Bottom pipe
        this.ctx.fillStyle = '#06b6d4';
        this.ctx.fillRect(p.x - 5, p.gapBottom, p.w + 10, 15);
        
        this.ctx.shadowBlur = 0;
    }
    
    drawCoin(c: any) {
        this.ctx.save();
        this.ctx.translate(c.x, c.y);
        this.ctx.rotate(c.life * 0.005);
        
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#facc15';
        
        this.ctx.fillStyle = '#fef08a';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -c.r);
        this.ctx.lineTo(c.r, 0);
        this.ctx.lineTo(0, c.r);
        this.ctx.lineTo(-c.r, 0);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#eab308';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawPowerUp(pu: any) {
        this.ctx.save();
        this.ctx.translate(pu.x, pu.y);
        
        const floatY = Math.sin(pu.life * 0.005) * 5;
        this.ctx.translate(0, floatY);
        
        const colors = {
            shield: '#a855f7',
            turbo: '#f97316',
            slowmo: '#22d3ee',
            magnet: '#4ade80'
        };
        const col = colors[pu.type as keyof typeof colors];
        
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = col;
        
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, pu.r, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = col;
        this.ctx.lineWidth = 4;
        this.ctx.stroke();
        
        // center dot
        this.ctx.fillStyle = col;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, pu.r * 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawPlayer() {
        this.ctx.save();
        this.ctx.translate(this.player.x, this.player.y);
        
        // tilt based on velocity, clamp it
        let angle = this.player.vy * 0.05;
        if (angle > Math.PI / 4) angle = Math.PI / 4;
        if (angle < -Math.PI / 4) angle = -Math.PI / 4;
        
        // Turbo overrides angle
        if (this.powerUpsTimer.turbo > 0) angle = 0;
        // Dead overrides angle
        if (!this.player.alive) angle += this.frameCount * 0.1;
        
        this.ctx.rotate(angle);
        
        // Visual effects from powerups
        let mainColor = '#fff';
        let glowColor = '#06b6d4'; // default cyan glow
        
        if (this.powerUpsTimer.shield > 0) glowColor = '#a855f7';
        if (this.powerUpsTimer.turbo > 0) glowColor = '#f97316';
        if (this.powerUpsTimer.slowmo > 0) glowColor = '#22d3ee';
        
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = glowColor;
        
        // Shield Bubble
        if (this.powerUpsTimer.shield > 0 && this.player.alive) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.player.radius * 1.8, 0, Math.PI*2);
            this.ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            this.ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
            this.ctx.fill();
        }
        
        // Player Ship Shape (Futuristic Jet)
        this.ctx.fillStyle = mainColor;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.radius * 1.5, 0); // nose
        this.ctx.lineTo(-this.player.radius, -this.player.radius * 0.8); // top wing
        this.ctx.lineTo(-this.player.radius * 0.5, 0); // back center
        this.ctx.lineTo(-this.player.radius, this.player.radius * 0.8); // bottom wing
        this.ctx.closePath();
        this.ctx.fill();
        
        // Core engine light
        this.ctx.fillStyle = glowColor;
        this.ctx.beginPath();
        this.ctx.arc(-this.player.radius * 0.2, 0, 4, 0, Math.PI*2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
}
