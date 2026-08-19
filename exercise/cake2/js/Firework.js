(function (global) {
    function Firework() {
        this.ctx = null;
        this.status = 0;
        this.num = 80;
        this.roundness = 0.25;
        this.fireworkType = createCircleFirework;
        this.delay = 0;
        this.particles = [];
        this.beforeBalst = {
            x: 0,
            y: 0,
            r: 3,
            color: '#FFFFFF',
            life: 0,
            animate: {},
            base: {},
            setAnimate: function (animate) {
                this.animate = animate || {};
            },
            setR: function (r) {
                this.r = r;
            },
            setColor: function (color) {
                this.color = color;
            },
            setLife: function (life) {
                this.life = life;
            },
            setBase: function () {
                this.base = deepCopy(this.animate.quiescence || { x: 0, y: 0 });
                this.x = this.base.x;
                this.y = this.base.y;
            },
            update: function () {
                var move = this.animate.move || {};
                var translate = this.animate.translate || {};

                if (!this.animate.quiescence) {
                    return;
                }

                this.x += move.vx || 0;
                this.y += move.vy || 0;

                if (move && typeof move.vx === 'number') {
                    move.vx += translate.ax || 0;
                }
                if (move && typeof move.vy === 'number') {
                    move.vy += translate.ay || 0;
                }
            },
            draw: function (ctx) {
                if (!ctx) return;
                ctx.beginPath();
                ctx.fillStyle = this.color;
                ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
                ctx.fill();
            }
        };
    }

    Firework.getInstance = function () {
        return new Firework();
    };

    Firework.prototype.getBeforeBalst = function () {
        return this.beforeBalst;
    };

    Firework.prototype.setCtx = function (ctx) {
        this.ctx = ctx;
    };

    Firework.prototype.setStatus = function (status) {
        this.status = status;
    };

    Firework.prototype.getStatus = function () {
        return this.status;
    };

    Firework.prototype.setNum = function (num) {
        this.num = num;
    };

    Firework.prototype.setRoundness = function (roundness) {
        this.roundness = roundness;
    };

    Firework.prototype.setFireworkType = function (type) {
        this.fireworkType = type || createCircleFirework;
    };

    Firework.prototype.setDelay = function (delay) {
        this.delay = delay;
    };

    Firework.prototype.setR = function (r) {
        this.beforeBalst.setR(r);
    };

    Firework.prototype.setColor = function (color) {
        this.beforeBalst.setColor(color);
    };

    Firework.prototype.setLife = function (life) {
        this.beforeBalst.setLife(life);
    };

    Firework.prototype.setBase = function () {
        this.beforeBalst.setBase();
    };

    Firework.prototype.draw = function () {
        if (!this.ctx) return;

        if (this.status === 1) {
            this.beforeBalst.draw(this.ctx);
            return;
        }

        if (this.status === 2 || this.status === 3 || this.status === 4) {
            this.particles.forEach(function (particle) {
                this.ctx.beginPath();
                this.ctx.fillStyle = particle.color;
                this.ctx.globalAlpha = Math.max(0, particle.alpha);
                this.ctx.arc(particle.x, particle.y, particle.size || 2, 0, Math.PI * 2);
                this.ctx.fill();
            }, this);
            this.ctx.globalAlpha = 1;
        }
    };

    Firework.prototype.update = function () {
        if (this.status === 1) {
            if (this.delay > 0) {
                this.delay -= 1;
                return;
            }

            this.beforeBalst.update();
            this.beforeBalst.life -= 1;

            if (this.beforeBalst.life <= 0) {
                this.explode();
            }
            return;
        }

        if (this.status === 2) {
            this.particles.forEach(function (particle) {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.vy += 0.045;
                particle.life -= 1;
                particle.alpha = Math.max(0, particle.life / 80);
            });

            this.particles = this.particles.filter(function (particle) {
                return particle.life > 0 && particle.alpha > 0;
            });

            if (this.particles.length === 0) {
                this.status = 5;
            }
        }
    };

    Firework.prototype.explode = function () {
        var burst = this.fireworkType({
            x: this.beforeBalst.x,
            y: this.beforeBalst.y,
            num: this.num,
            roundness: this.roundness,
            color: this.beforeBalst.color
        });

        this.particles = burst.map(function (particle) {
            return {
                x: particle.x,
                y: particle.y,
                vx: particle.vx,
                vy: particle.vy,
                size: particle.size || 2,
                color: particle.color || this.beforeBalst.color,
                life: particle.life || 45,
                alpha: particle.alpha || 1
            };
        }, this);

        this.status = 2;
    };

    global.Firework = Firework;
})(window);
