(function () {
    function createParticle() {
        var particle = document.createElement('particule');
        var colorSet = ['#ffe9c5', '#fff', '#f8d7da', '#f9f1d0', '#b4f2e1', '#eb6383'];
        var angle = Math.random() * Math.PI * 2;
        var distance = 70 + Math.random() * 180;
        var tx = Math.cos(angle) * distance;
        var ty = Math.sin(angle) * distance;

        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.background = colorSet[Math.floor(Math.random() * colorSet.length)];
        particle.style.setProperty('--tx', tx + 'px');
        particle.style.setProperty('--ty', ty + 'px');
        particle.style.animationDelay = (Math.random() * 150) + 'ms';

        document.body.appendChild(particle);
        setTimeout(function () {
            particle.remove();
        }, 1800);
    }

    function spawnBurst() {
        for (var i = 0; i < 26; i += 1) {
            createParticle();
        }
    }

    function initText() {
        var heading = document.querySelector('[data-splitting]');
        if (!heading) return;

        if (heading.dataset.splittingDone !== 'true') {
            if (window.Splitting && typeof window.Splitting.split === 'function') {
                window.Splitting.split(heading);
            }
        }
    }

    document.addEventListener('DOMContentLoaded', function () {
        initText();
        setTimeout(spawnBurst, 900);
        setInterval(spawnBurst, 2200);
    });
})();
