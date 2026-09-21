const btn = document.getElementById('sunflower-btn');
const startScreen = document.getElementById('start-screen');
const message = document.getElementById('message');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let isMobile = window.innerWidth < 768;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  isMobile = window.innerWidth < 768;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

btn.addEventListener('click', () => {
  startScreen.classList.add('hidden');
  message.classList.remove('hidden');
  startAnimation();
});

let flowers = [];
let branches = [];

function drawFloor() {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 40);
  ctx.lineTo(canvas.width, canvas.height - 40);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTulip(x, y, radius = 8, color = '#f4be18') {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = '#d4a313';
  ctx.lineWidth = 0.8;

  ctx.beginPath();
  ctx.ellipse(-radius * 0.3, 0, radius * 0.45, radius * 0.85, -Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(radius * 0.3, 0, radius * 0.45, radius * 0.85, Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, radius * 0.1, radius * 0.4, radius * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function inHeartShape(relX, relY, scale) {
  const centerY = -220 * (scale / 120);
  const hx = relX / scale;
  const hy = (centerY - relY) / scale; 

  const a = hx * hx + hy * hy - 1;
  return (a * a * a - hx * hx * hy * hy * hy) <= 0;
}

function generateHeartFlowers(count = 550, scale = 120) {
  const flowersArr = [];
  let added = 0;
  const tulipColors = ['#f4be18', '#ffd700', '#ffffff', '#fdfbf7'];

  const bound = scale * 1.4;

  while (added < count) {
    const rx = (Math.random() * bound * 2) - bound;
    const ry = (Math.random() * bound * 2) - (bound * 2.2);

    if (inHeartShape(rx, ry, scale)) {
      const randomColor = tulipColors[Math.floor(Math.random() * tulipColors.length)];

      flowersArr.push({
        relX: rx,
        relY: ry,
        size: (4 + Math.random() * 3.5) * (scale / 120),
        scale: 0,
        color: randomColor,
        delay: Math.random() * 50
      });
      added++;
    }
  }
  return flowersArr;
}

function startAnimation() {
  let progress = 0;
  const groundY = canvas.height - 40;

  // Ajustes de escala según la pantalla
  const scale = isMobile ? Math.min(canvas.width * 0.22, 85) : 120;
  const startCenterX = canvas.width * 0.5;
  const targetCenterX = isMobile ? canvas.width * 0.5 : canvas.width * 0.70;
  let currentCenterX = startCenterX;

  const branchFactor = scale / 120;

  branches = [
    { relStartX: 0, relStartY: -40 * branchFactor, relEndX: -40 * branchFactor, relEndY: -100 * branchFactor, width: 8, startProgress: 25 },
    { relStartX: 0, relStartY: -40 * branchFactor, relEndX: 40 * branchFactor, relEndY: -100 * branchFactor, width: 8, startProgress: 25 },

    { relStartX: -25 * branchFactor, relStartY: -80 * branchFactor, relEndX: -70 * branchFactor, relEndY: -160 * branchFactor, width: 6, startProgress: 40 },
    { relStartX: 25 * branchFactor, relStartY: -80 * branchFactor, relEndX: 70 * branchFactor, relEndY: -160 * branchFactor, width: 6, startProgress: 40 },

    { relStartX: 0, relStartY: -100 * branchFactor, relEndX: -45 * branchFactor, relEndY: -220 * branchFactor, width: 5, startProgress: 50 },
    { relStartX: 0, relStartY: -100 * branchFactor, relEndX: 45 * branchFactor, relEndY: -220 * branchFactor, width: 5, startProgress: 50 }
  ];

  flowers = generateHeartFlowers(550, scale);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFloor();

    if (!isMobile && progress > 120 && currentCenterX < targetCenterX) {
      currentCenterX += (targetCenterX - currentCenterX) * 0.03;
    }

    const startY = groundY;
    const trunkHeight = Math.min(progress * 2, 140 * branchFactor);

    // DIBUJAR TRONCO
    ctx.beginPath();
    ctx.moveTo(currentCenterX, startY);
    ctx.quadraticCurveTo(
      currentCenterX - 4, startY - trunkHeight / 2,
      currentCenterX, startY - trunkHeight
    );
    ctx.strokeStyle = '#1b4d3e';
    ctx.lineWidth = 20 * branchFactor;
    ctx.lineCap = 'round';
    ctx.stroke();

    // DIBUJAR RAMAS
    branches.forEach(b => {
      if (progress > b.startProgress) {
        const bProg = Math.min((progress - b.startProgress) / 35, 1);

        const sx = currentCenterX + b.relStartX;
        const sy = startY + b.relStartY;
        const ex = sx + (b.relEndX - b.relStartX) * bProg;
        const ey = sy + (b.relEndY - b.relStartY) * bProg;

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(ex, ey);
        ctx.strokeStyle = '#1b4d3e';
        ctx.lineWidth = b.width;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    });

    // DIBUJAR TULIPANES
    if (progress > 60) {
      flowers.forEach(f => {
        if (progress > 60 + f.delay) {
          if (f.scale < 1) f.scale += 0.05;

          const fx = currentCenterX + f.relX;
          const fy = startY + f.relY;

          drawTulip(fx, fy, f.size * f.scale, f.color);
        }
      });
    }

    // MOSTRAR MENSAJE
    if (progress > 120) {
      message.classList.add('visible');
    }

    progress++;
    requestAnimationFrame(animate);
  }

  animate();
}
