(function () {
    // 烟花脚本：管理画布尺寸、粒子动画、自动播放和手动播放按钮。
    const canvas = document.getElementById('fireworks-demo');
    const playButton = document.getElementById('fireworks-play-btn');

    if (!canvas) {
        console.warn('fireworks-demo canvas not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    let particles = [];
    let lastTriggeredHour = null;

    // 按设备像素比调整画布，保证高分屏上的烟花清晰。
    function resizeCanvas() {
        const ratio = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * ratio;
        canvas.height = window.innerHeight * ratio;
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    }

    // 返回指定范围内的随机数。
    function random(min, max) {
        return Math.random() * (max - min) + min;
    }

    // 将十六进制颜色转换为 Canvas 使用的 rgba 字符串。
    function hexToRgba(hex, alpha) {
        const clean = hex.replace('#', '');
        const value = clean.length === 3 ?
            clean.split('').map(ch => ch + ch).join('') :
            clean;
        const num = Number.parseInt(value, 16);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // 创建缓慢消散、带幽灵感的烟花粒子。
    function createGhostBurst(x, y) {
        const colors = ['#8ecae6', '#bdb2ff', '#ffffff', '#a0f0ff', '#c7f9cc'];
        const count = 75;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + random(-0.3, 0.3);
            const speed = random(0.8, 4.0);
            particles.push({
                x,
                y,
                prevX: x,
                prevY: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.4,
                life: random(55, 130),
                maxLife: 130,
                size: random(2.5, 5.5),
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 0.25,
                gravity: 0.018,
                type: 'ghost',
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    // 创建高亮闪烁、爆发速度较快的烟花粒子。
    function createStrobeBurst(x, y) {
        const colors = ['#ffffff', '#ffd166', '#8ecae6', '#ff7b7b', '#bdb2ff', '#ff9ff3'];
        const count = 80;
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count + random(-0.1, 0.1);
            const speed = random(2.0, 7.5);
            particles.push({
                x,
                y,
                prevX: x,
                prevY: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: random(24, 50),
                maxLife: 50,
                size: random(2.5, 5.0),
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1,
                gravity: 0.11,
                type: 'strobe',
                twinkle: Math.random() * Math.PI * 2
            });
        }
    }

    // 创建带长尾轨迹的马尾烟花粒子。
    function createHorsetailBurst(x, y) {
        const colors = ['#8ecae6', '#ffd166', '#bdb2ff', '#ffffff', '#ff7b7b', '#7bed9f'];
        const mainColor = colors[Math.floor(Math.random() * colors.length)];
        const count1 = 55;
        const count2 = 50;

        for (let i = 0; i < count1; i++) {
            particles.push({
                x: x + random(-16, 16),
                y: y + random(6, 28),
                prevX: x,
                prevY: y,
                vx: random(-2.5, 2.5),
                vy: random(-9.0, -4.5),
                life: random(38, 76),
                maxLife: 76,
                size: random(2.5, 5.5),
                color: mainColor,
                alpha: 1,
                gravity: 0.045,
                type: 'horsetail',
                trail: 0.85
            });
        }

        for (let i = 0; i < count2; i++) {
            const angle = (Math.PI * 2 * i) / count2 + random(-0.08, 0.08);
            const speed = random(1.8, 6.2);
            particles.push({
                x,
                y,
                prevX: x,
                prevY: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.7,
                life: random(40, 70),
                maxLife: 70,
                size: random(2.0, 4.2),
                color: mainColor,
                alpha: 1,
                gravity: 0.075,
                type: 'horsetail'
            });
        }
    }

    // 打乱烟花类型，避免每次播放顺序完全相同。
    function shuffleArray(arr) {
        const list = [...arr];
        for (let i = list.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [list[i], list[j]] = [list[j], list[i]];
        }
        return list;
    }

    // 依次发射一组不同类型的烟花。
    function triggerSequence() {
        particles = [];
        const sequence = shuffleArray(['ghost', 'strobe', 'horsetail']);
        let index = 0;

        function launchNext() {
            if (index >= sequence.length) return;

            const type = sequence[index];
            const x = random(window.innerWidth * 0.15, window.innerWidth * 0.85);
            const y = random(window.innerHeight * 0.15, window.innerHeight * 0.7);

            if (type === 'ghost') {
                createGhostBurst(x, y);
            } else if (type === 'strobe') {
                createStrobeBurst(x, y);
            } else {
                createHorsetailBurst(x, y);
            }

            index += 1;
            if (index < sequence.length) {
                setTimeout(launchNext, 400);
            }
        }

        launchNext();
    }

    // 连续播放五组烟花，用于按钮点击和整点自动播放。
    function playFireworksSequence() {
        let playCount = 0;
        const maxPlays = 5;

        function playFireworks() {
            if (playCount < maxPlays) {
                triggerSequence();
                playCount++;
                // 每次间隔1.9-2.5秒，让效果更自然
                const delay = 1900 + Math.random() * 600;
                setTimeout(playFireworks, delay);
            }
        }

        playFireworks();
    }

    // 每帧检查整点，确保同一小时只自动触发一次。
    function checkAutoPlayByHour() {
        const now = new Date();
        const hour = now.getHours();
        const minute = now.getMinutes();
        const second = now.getSeconds();

        if (minute === 0 && second === 0 && lastTriggeredHour !== hour) {
            lastTriggeredHour = hour;
            playFireworksSequence()
        }

        if (minute !== 0 || second !== 0) {
            lastTriggeredHour = null;
        }
    }

    // 更新所有粒子的位置、重力、寿命和透明度。
    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.prevX = p.x;
            p.prevY = p.y;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.life -= 1;

            if (p.type === 'ghost') {
                const ratio = p.life / p.maxLife;
                p.alpha = Math.max(0.05, ratio * 0.7 + 0.2 + Math.sin(p.twinkle + p.life * 0.1) * 0.1);
            } else if (p.type === 'strobe') {
                const phase = Math.floor((p.maxLife - p.life) / 4) % 3;
                p.alpha = phase === 0 || phase === 2 ? 1 : 0.15;
            } else if (p.type === 'horsetail') {
                p.alpha = Math.max(0, (p.life / p.maxLife) * 0.92 + 0.08);
            } else {
                p.alpha = Math.max(0, p.life / p.maxLife);
            }

            if (p.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    // 将当前粒子绘制到烟花画布上。
    function renderParticles() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.globalCompositeOperation = 'source-over';

        for (const p of particles) {
            if (p.type === 'horsetail') {
                ctx.beginPath();
                ctx.moveTo(p.prevX, p.prevY);
                ctx.lineTo(p.x, p.y);
                ctx.strokeStyle = hexToRgba(p.color, Math.max(0.2, p.alpha * 0.85));
                ctx.lineWidth = Math.max(1.5, p.size * 0.85);
                ctx.shadowBlur = 6;
                ctx.shadowColor = p.color;
                ctx.stroke();
                ctx.shadowBlur = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
                ctx.fillStyle = hexToRgba('#ffffff', p.alpha * 0.6);
                ctx.fill();
                continue;
            }

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(p.color, p.alpha);
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (p.type === 'ghost') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 1.8, 0, Math.PI * 2);
                ctx.fillStyle = hexToRgba(p.color, p.alpha * 0.12);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
                ctx.fillStyle = hexToRgba('#ffffff', p.alpha * 0.5);
                ctx.fill();
            }

            if (p.type === 'strobe' && p.alpha > 0.5) {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 2.0, 0, Math.PI * 2);
                ctx.fillStyle = hexToRgba(p.color, p.alpha * 0.2);
                ctx.fill();

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
                ctx.fillStyle = hexToRgba('#ffffff', p.alpha * 0.7);
                ctx.fill();
            }
        }

        ctx.globalCompositeOperation = 'source-over';
        ctx.shadowBlur = 0;
    }

    // Canvas 动画主循环：检查自动播放、更新粒子并持续渲染。
    function loop() {
        checkAutoPlayByHour();
        updateParticles();
        renderParticles();
        requestAnimationFrame(loop);
    }
    //烟花播放次数
    // if (playButton) {
    //     playButton.addEventListener('click', () => {
    //         let playCount = 0;
    //         const maxPlays = 5;

    //         function playFireworks() {
    //             if (playCount < maxPlays) {
    //                 triggerSequence();
    //                 playCount++;
    //                 // 每次间隔1.2-1.8秒，让效果更自然
    //                 const delay = 1900 + Math.random() * 600;
    //                 setTimeout(playFireworks, delay);
    //             }
    //         }

    //         playFireworks();
    //     });
    // }
    // 点击按钮手动播放五组烟花。
    if (playButton) {
        playButton.addEventListener('click', playFireworksSequence);
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    requestAnimationFrame(loop);
})();
