// ==========================================
// 1. ELEMENTOS Y CONFIGURACIÓN DEL CANVAS
// ==========================================
const btn = document.getElementById('sunflower-btn');
const startScreen = document.getElementById('start-screen');
const message = document.getElementById('message');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
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
let treeCenterX = canvas.width * 0.5;   // Centro horizontal inicial
let targetCenterX = canvas.width * 0.70; // Desplazamiento a la derecha para la carta
let currentCenterX = treeCenterX;

function drawFloor() {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height - 80);
  ctx.lineTo(canvas.width, canvas.height - 80);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ==========================================
// DIBUJO DE TULIPÁN (Blanco o Amarillo)
// ==========================================
function drawTulip(x, y, radius = 8, color = '#f4be18') {
  ctx.save();
  ctx.translate(x, y);

  // Color de los pétalos
  ctx.fillStyle = color;
  ctx.strokeStyle = '#d4a313'; // Borde suave para definir los pétalos
  ctx.lineWidth = 1;

  // Pétalo izquierdo
  ctx.beginPath();
  ctx.ellipse(-radius * 0.3, 0, radius * 0.45, radius * 0.85, -Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();

  // Pétalo derecho
  ctx.beginPath();
  ctx.ellipse(radius * 0.3, 0, radius * 0.45, radius * 0.85, Math.PI / 8, 0, Math.PI * 2);
  ctx.fill();

  // Pétalo central (al frente)
  ctx.beginPath();
  ctx.ellipse(0, radius * 0.1, radius * 0.4, radius * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// ==========================================
// 2. FÓRMULA MATEMÁTICA DEL CORAZÓN
// ==========================================
function inHeartShape(relX, relY) {
  const heartScale = 120; // Radio del corazón en píxeles
  const centerY = -240;   // Centro del corazón

  const hx = relX / heartScale;
  const hy = (centerY - relY) / heartScale; 

  const a = hx * hx + hy * hy - 1;
  return (a * a * a - hx * hx * hy * hy * hy) <= 0;
}

function generateHeartFlowers(count = 600) {
  const flowersArr = [];
  let added = 0;

  // Paleta de colores para tulipanes amarillos y blancos
  const tulipColors = ['#ffd700', '#ffd700', '#ff701d', '#fdfbf7'];

  while (added < count) {
    const rx = (Math.random() * 320) - 160;
    const ry = (Math.random() * 260) - 370;

    if (inHeartShape(rx, ry)) {
      // Elegimos color al azar (50% amarillos, 50% blancos)
      const randomColor = tulipColors[Math.floor(Math.random() * tulipColors.length)];

      flowersArr.push({
        relX: rx,
        relY: ry,
        size: 6 + Math.random() * 4,
        scale: 0,
        color: randomColor,
        delay: Math.random() * 50
      });
      added++;
    }
  }
  return flowersArr;
}

// ==========================================
// 3. ANIMACIÓN Y RENDERIZADO
// ==========================================
function startAnimation() {
  let progress = 0;
  const groundY = canvas.height - 80;

  // Ramas internas que sostienen la copa
  branches = [
    { relStartX: 0, relStartY: -60, relEndX: -50, relEndY: -130, width: 10, startProgress: 25 },
    { relStartX: 0, relStartY: -60, relEndX: 50, relEndY: -130, width: 10, startProgress: 25 },

    { relStartX: -30, relStartY: -100, relEndX: -90, relEndY: -200, width: 7, startProgress: 40 },
    { relStartX: 30, relStartY: -100, relEndX: 90, relEndY: -200, width: 7, startProgress: 40 },

    { relStartX: 0, relStartY: -120, relEndX: -60, relEndY: -280, width: 6, startProgress: 50 },
    { relStartX: 0, relStartY: -120, relEndX: 60, relEndY: -280, width: 6, startProgress: 50 },

    { relStartX: -60, relStartY: -280, relEndX: -25, relEndY: -330, width: 4, startProgress: 65 },
    { relStartX: 60, relStartY: -280, relEndX: 25, relEndY: -330, width: 4, startProgress: 65 }
  ];

  flowers = generateHeartFlowers(1000);

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawFloor();

    // Transición suave del árbol a la derecha
    if (progress > 120 && currentCenterX < targetCenterX) {
      currentCenterX += (targetCenterX - currentCenterX) * 0.03;
    }

    const startY = groundY;
    const trunkHeight = Math.min(progress * 2.5, 180);

    // 1. TRONCO
    ctx.beginPath();
    ctx.moveTo(currentCenterX, startY);
    ctx.quadraticCurveTo(
      currentCenterX - 6, startY - trunkHeight / 2,
      currentCenterX, startY - trunkHeight
    );
    ctx.strokeStyle = '#1b4d3e';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 2. RAMAS
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

    // 3. TULIPANES
    if (progress > 65) {
      flowers.forEach(f => {
        if (progress > 65 + f.delay) {
          if (f.scale < 1) f.scale += 0.05;

          const fx = currentCenterX + f.relX;
          const fy = startY + f.relY;

          drawTulip(fx, fy, f.size * f.scale, f.color);
        }
      });
    }

    // 4. MOSTRAR MENSAJE
    if (progress > 140) {
      message.classList.add('visible');
    }

    progress++;
    requestAnimationFrame(animate);
  }

  animate();
}