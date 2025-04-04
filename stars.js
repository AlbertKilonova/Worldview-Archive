const canvas = document.getElementById("starCanvas");
const ctx = canvas.getContext("2d");

let stars = [];
const numStars = 150;

// 初始化星星
function initStars() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = [];

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.2
    });
  }
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

// 在animateStars函数前添加帧率控制
let lastTime = 0;
const frameRate = 30; // 目标帧率
const frameInterval = 1000 / frameRate;

function animateStars(timestamp) {
  if (timestamp - lastTime > frameInterval) {
    updateStars();
    drawStars();
    lastTime = timestamp;
  }
  requestAnimationFrame(animateStars);
}

// 修改initStars以优化大屏幕性能
function initStars() {
  canvas.width = Math.min(window.innerWidth, 1920); // 限制最大宽度
  canvas.height = Math.min(window.innerHeight, 1080); // 限制最大高度
  
  // 根据屏幕大小调整星星数量
  const density = (canvas.width * canvas.height) / (1920 * 1080);
  const adjustedNumStars = Math.min(numStars * density, 300);
  
  stars = [];
  for (let i = 0; i < adjustedNumStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2,
      speed: Math.random() * 0.5 + 0.2
    });
  }
}

// 动画循环
function animateStars() {
  updateStars();
  drawStars();
  requestAnimationFrame(animateStars);
}

// 监听窗口变化，调整画布
window.addEventListener("resize", initStars);

// 初始化并启动动画
initStars();
animateStars();