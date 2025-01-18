const canvas = document.getElementById('background');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const particles = [];
const mouse = {
    x: canvas.width / 2, // Центрування при відкритті
    y: canvas.height / 2,
    radius: 100
};

const clusterText = document.getElementById('clusterText');

// Adjust for touch events
canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect(); // Для точного позиціювання
    mouse.x = touch.clientX - rect.left;
    mouse.y = touch.clientY - rect.top;
});

canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

let allCollected = false;

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
        this.y += Math.sin(this.floatAngle) * 0.5;

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

        // Ensure particles stay within canvas bounds
        if (this.x - this.size < 0) this.x = this.size;
        if (this.x + this.size > canvas.width) this.x = canvas.width - this.size;
        if (this.y - this.size < 0) this.y = this.size;
        if (this.y + this.size > canvas.height) this.y = canvas.height - this.size;
    }
}

function initParticles() {
    particles.length = 0;
    const numberOfParticles = (canvas.width * canvas.height) / 4000;

    for (let i = 0; i < numberOfParticles; i++) {
        const size = 4;
        const x = Math.random() * (canvas.width - 20) + 10; // Додано відступи
        const y = Math.random() * (canvas.height - 20) + 10;
        particles.push(new Particle(x, y, size));
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
    allCollected = particles.every(particle => particle.collected);
    if (allCollected) {
        showCompletionMessage();
        particles.forEach(particle => particle.collected = false);
    }
}

function showCompletionMessage() {
    if (clusterText) {
        clusterText.style.display = 'none';
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
            clusterText.style.display = 'block';
        }
    }, 5000);
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((particle) => {
        particle.update();
        particle.draw();
    });
    connectParticles();
    checkAllCollected();
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
});

initParticles();
animate();
