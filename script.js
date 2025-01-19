
const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');
const particles = [];
const mouse = {
    x: -100,
    y: -100,
    radius: 100
};
const clusterText = document.getElementById('clusterText');

function initParticles() {
    particles.length = 0;
    const numberOfParticles = (canvas.width * canvas.height) / 4000;

    for (let i = 0; i < numberOfParticles; i++) {
        const size = 4;
        const x = Math.random() * (canvas.width - size * 2) + size;
        const y = Math.random() * (canvas.height - size * 2) + size;
        particles.push(new Particle(x, y, size));
    }
}

function resizeCanvas() {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * pixelRatio);
    canvas.height = Math.floor(window.innerHeight * pixelRatio);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    initParticles();
}

class Particle {
    constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.baseX = x;
        this.baseY = y;
        this.collected = false;
        this.floatAngle = Math.random() * Math.PI * 2;
    }

    draw() {
        ctx.fillStyle = this.collected ? '#00ff00' : '#ffffff';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        this.floatAngle += 0.02;
        this.y += Math.sin(this.floatAngle) * 0.2;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const moveX = Math.cos(angle) * 5;
            const moveY = Math.sin(angle) * 5;
            this.x += moveX;
            this.y += moveY;
            if (distance < 5) {
                this.collected = true;
            }
        } else {
            this.x += (this.baseX - this.x) * 0.05;
            this.y += (this.baseY - this.y) * 0.05;
        }

        if (this.x - this.size < 0) this.x = this.size;
        if (this.x + this.size > canvas.width) this.x = canvas.width - this.size;
        if (this.y - this.size < 0) this.y = this.size;
        if (this.y + this.size > canvas.height) this.y = canvas.height - this.size;
    }
}

function connectParticles() {
    for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
            const dx = particles[a].x - particles[b].x;
            const dy = particles[a].y - particles[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particles[a].x, particles[a].y);
                ctx.lineTo(particles[b].x, particles[b].y);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }
}

function checkAllCollected() {
    const allCollected = particles.every(particle => particle.collected);
    if (allCollected) {
        showCompletionMessage();
        particles.forEach(particle => {
            particle.collected = false;
        });
    }
}

function showCompletionMessage() {
    const existingMessage = document.querySelector('.completion-message');
    if (existingMessage) return;

    if (clusterText) {
        clusterText.style.visibility = 'hidden';
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = 'completion-message';
    messageDiv.innerText = 'Любиш збирати всі факти до купи і гратися в дедукцію? Нуу.. молодець, без загадок я тебе не залишу.';
    document.body.appendChild(messageDiv);

    messageDiv.style.position = 'absolute';
    messageDiv.style.top = '50%';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translate(-50%, -50%)';
    messageDiv.style.color = '#ffffff';
    messageDiv.style.fontFamily = 'Arial, sans-serif';
    messageDiv.style.fontSize = '2rem';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.pointerEvents = 'none';

    setTimeout(() => {
        document.body.removeChild(messageDiv);

        if (clusterText) {
            clusterText.style.visibility = 'visible';
        }
    }, 5000);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(particle => {
        particle.update();
        particle.draw();
    });
    connectParticles();
    checkAllCollected();
    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', event => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    mouse.x = (touch.clientX - rect.left) * (canvas.width / rect.width);
    mouse.y = (touch.clientY - rect.top) * (canvas.height / rect.height);
});

canvas.addEventListener('touchend', () => {
    mouse.x = -100;
    mouse.y = -100;
});

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();
