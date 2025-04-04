const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

let stars = [];
let lastTime = 0;
const frameRate = 30;
const frameInterval = 1000 / frameRate;

// 初始化星星
function initStars() {
  const maxWidth = 1920;
  const maxHeight = 1080;
  
  canvas.width = Math.min(window.innerWidth, maxWidth);
  canvas.height = Math.min(window.innerHeight, maxHeight);
  
  // 根据屏幕尺寸调整星星密度
  const baseDensity = 150 / (maxWidth * maxHeight);
  const adjustedNumStars = Math.min(
    Math.floor(baseDensity * canvas.width * canvas.height),
    300
  );
  
  stars = Array.from({length: adjustedNumStars}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.5 + 0.2
  }));
}

// 绘制星星
function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";

  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

// 更新星星位置
function updateStars() {
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  });
}

// 动画循环
function animateStars(timestamp) {
  if (!lastTime) lastTime = timestamp;
  const delta = timestamp - lastTime;
  
  if (delta > frameInterval) {
    updateStars();
    drawStars();
    lastTime = timestamp - (delta % frameInterval);
  }
  
  requestAnimationFrame(animateStars);
}

// 初始化并启动
initStars();
animateStars();

// 响应式调整
window.addEventListener("resize", debounce(() => {
  initStars();
  drawStars();
}, 200));