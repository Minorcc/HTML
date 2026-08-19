(function (global) {
    function getType(value) {
        if (value === null) return 'null';
        if (value === undefined) return 'undefined';
        if (Array.isArray(value)) return 'array';
        return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
    }

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function buildBurst(options) {
        var x = options.x || 0;
        var y = options.y || 0;
        var num = options.num || 40;
        var roundness = options.roundness || 0.25;
        var color = options.color || '#ffffff';
        var shape = options.shape || 'circle';
        var palette = options.palette || ['#ff4d6d', '#ff9f43', '#ffd166', '#7ae582', '#4cc9f0', '#80ed99', '#c77dff', '#ff87ab', '#f72585', '#38bdf8'];
        var particles = [];

        for (var i = 0; i < num; i += 1) {
            var angle = (Math.PI * 2 * i) / num;
            var baseSpeed = randomBetween(0.9, 2.8);
            var speedX = Math.cos(angle) * baseSpeed * (0.85 + Math.random() * roundness * 1.4);
            var speedY = Math.sin(angle) * baseSpeed * (0.85 + Math.random() * roundness * 1.4);

            if (shape === 'ellipse') {
                speedY *= 0.75;
            }

            if (shape === 'heart') {
                var t = (Math.PI * 2 * i) / num;
                var heartX = 16 * Math.pow(Math.sin(t), 3);
                var heartY = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
                speedX = heartX * 0.12 + randomBetween(-0.7, 0.7);
                speedY = heartY * 0.12 + randomBetween(-0.7, 0.7);
            }

            particles.push({
                x: x,
                y: y,
                vx: speedX,
                vy: speedY,
                color: color || palette[i % palette.length],
                life: 42 + Math.random() * 70,
                size: 1.2 + Math.random() * 2.2,
                alpha: 1
            });
        }

        return particles;
    }

    function createCircleFirework(params) {
        return buildBurst({
            x: params.x,
            y: params.y,
            num: params.num || 90,
            roundness: params.roundness || 0.25,
            color: params.color || '#ffffff',
            shape: 'circle'
        });
    }

    function createEllipseFirework(params) {
        return buildBurst({
            x: params.x,
            y: params.y,
            num: params.num || 90,
            roundness: params.roundness || 0.25,
            color: params.color || '#ffffff',
            shape: 'ellipse'
        });
    }

    function createHeartFirework(params) {
        return buildBurst({
            x: params.x,
            y: params.y,
            num: params.num || 100,
            roundness: params.roundness || 0.25,
            color: params.color || '#ff7aa2',
            shape: 'heart'
        });
    }

    function createCustomFirework(params) {
        var palette = ['#ff4d6d', '#ff9f43', '#ffd166', '#7ae582', '#4cc9f0', '#80ed99', '#c77dff', '#ff87ab', '#f72585', '#38bdf8'];
        var particles = buildBurst({
            x: params.x,
            y: params.y,
            num: params.num || 220,
            roundness: params.roundness || 1.2,
            color: params.color || '#ffffff',
            shape: 'circle',
            palette: palette
        });

        return particles.map(function (particle, index) {
            particle.color = palette[index % palette.length];
            particle.size = 1.1 + (index % 3) * 0.7;
            return particle;
        });
    }

    function createDoubleHeartFirework(params) {
        var left = buildBurst({
            x: params.x - 14,
            y: params.y,
            num: params.num || 120,
            roundness: params.roundness || 1.2,
            color: params.color || '#ff7aa2',
            shape: 'heart',
            palette: ['#ff4d6d', '#ff9f43', '#ffd166', '#7ae582', '#4cc9f0', '#c77dff', '#ff87ab']
        });
        var right = buildBurst({
            x: params.x + 14,
            y: params.y,
            num: params.num || 120,
            roundness: params.roundness || 1.2,
            color: params.color || '#ff9f43',
            shape: 'heart',
            palette: ['#ff9f43', '#f72585', '#4cc9f0', '#80ed99', '#ffd166', '#c77dff', '#7ae582']
        });

        return left.concat(right);
    }

    global.getType = getType;
    global.createCircleFirework = createCircleFirework;
    global.createEllipseFirework = createEllipseFirework;
    global.createHeartFirework = createHeartFirework;
    global.createCustomFirework = createCustomFirework;
    global.createDoubleHeartFirework = createDoubleHeartFirework;
})(window);
