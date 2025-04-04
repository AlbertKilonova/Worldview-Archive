// 新增全局变量
let isSyncEnabled = true;
const timelineConnections = new Map();

// 增强的时间轴初始化
function initAllTimelines() {
  document.querySelectorAll('.timeline-container').forEach(container => {
    initTimelineScale(container);
    positionTimelineItems(container);
  });
  
  if (isSyncEnabled) {
    setupTimelineConnections();
  }
}

// 智能刻度计算
function initTimelineScale(container) {
  const scale = container.querySelector('.timeline-scale');
  const config = container.dataset;
  
  const getValue = (str) => {
    const num = str.match(/-?\d+/);
    return num ? parseInt(num[0]) : 0;
  };
  
  const min = getValue(config.min);
  const max = getValue(config.max);
  const range = max - min;
  
  // 自动计算最佳间隔
  let interval = parseInt(config.interval);
  if (range < 100) interval = 10;
  else if (range < 500) interval = 50;
  else interval = 100;
  
  scale.innerHTML = '';
  for (let val = min; val <= max; val += interval) {
    const percent = ((val - min) / range) * 100;
    const isMajor = val % (interval * 2) === 0;
    
    const marker = document.createElement('div');
    marker.className = isMajor ? 'major-marker' : 'marker';
    marker.style.left = `${percent}%`;
    
    if (isMajor) {
      const label = document.createElement('span');
      label.textContent = container.dataset.min.includes('N') 
        ? `N-${val}` 
        : val;
      marker.appendChild(label);
    }
    
    scale.appendChild(marker);
  }
}

// 事件定位增强
function positionTimelineItems(container) {
  const items = container.querySelectorAll('.timeline-item');
  const min = parseInt(container.dataset.min.replace(/\D/g, ''));
  const max = parseInt(container.dataset.max.replace(/\D/g, ''));
  const range = max - min;
  
  items.forEach(item => {
    const year = parseInt(item.dataset.year.replace(/\D/g, ''));
    const percent = ((year - min) / range) * 100;
    item.style.left = `${percent}%`;
    
    // 添加点击事件
    item.addEventListener('click', () => {
      showEventDetail(item.querySelector('.timeline-event'));
    });
  });
}

// 双轴联动系统
function setupTimelineConnections() {
  // 清除现有连接
  timelineConnections.forEach(conn => conn.remove());
  timelineConnections.clear();
  
  // 获取所有时间轴事件
  const timelines = Array.from(document.querySelectorAll('.timeline-container'));
  if (timelines.length < 2) return;
  
  const [earthTimeline, galaxyTimeline] = timelines;
  const earthEvents = earthTimeline.querySelectorAll('.timeline-item');
  const galaxyEvents = galaxyTimeline.querySelectorAll('.timeline-item');
  
  // 创建关联线
  earthEvents.forEach(earthEvent => {
    const earthYear = parseInt(earthEvent.dataset.year);
    const relatedEvents = findRelatedEvents(earthYear, galaxyEvents);
    
    relatedEvents.forEach(galaxyEvent => {
      const connection = document.createElement('div');
      connection.className = 'timeline-connection';
      
      const earthRect = earthEvent.getBoundingClientRect();
      const galaxyRect = galaxyEvent.getBoundingClientRect();
      
      const length = Math.sqrt(
        Math.pow(galaxyRect.left - earthRect.left, 2) + 
        Math.pow(galaxyRect.top - earthRect.top, 2)
      );
      
      const angle = Math.atan2(
        galaxyRect.top - earthRect.top,
        galaxyRect.left - earthRect.left
      );
      
      connection.style.width = `${length}px`;
      connection.style.transform = `rotate(${angle}rad)`;
      connection.style.left = `${earthRect.left + earthRect.width/2}px`;
      connection.style.top = `${earthRect.top + earthRect.height/2}px`;
      
      document.querySelector('.timelines-container').appendChild(connection);
      timelineConnections.set(`${earthEvent.dataset.year}-${galaxyEvent.dataset.year}`, connection);
    });
  });
}

// 查找关联事件
function findRelatedEvents(year, events) {
  // 简单实现：查找±10年范围内的事件
  return Array.from(events).filter(event => {
    const eventYear = parseInt(event.dataset.year.replace(/\D/g, ''));
    return Math.abs(eventYear - year) <= 10;
  });
}

// 缩放控制
function zoomAllTimelines(delta) {
  document.querySelectorAll('.timeline-container').forEach(container => {
    const min = parseInt(container.dataset.min.replace(/\D/g, ''));
    const max = parseInt(container.dataset.max.replace(/\D/g, ''));
    
    const newMin = min - delta;
    const newMax = max + delta;
    
    if (newMax - newMin < 50) return;
    
    container.dataset.min = container.dataset.min.includes('GSC') 
      ? `GSC-${newMin}` : newMin;
    container.dataset.max = container.dataset.max.includes('GSC') 
      ? `GSC-${newMax}` : newMax;
    
    initTimelineScale(container);
    positionTimelineItems(container);
  });
  
  if (isSyncEnabled) setupTimelineConnections();
}

// 双轴联动切换
function toggleSync() {
  isSyncEnabled = !isSyncEnabled;
  document.querySelector('.sync-toggle').classList.toggle('active', isSyncEnabled);
  
  if (isSyncEnabled) {
    setupTimelineConnections();
  } else {
    timelineConnections.forEach(conn => conn.remove());
    timelineConnections.clear();
  }
}

// 事件详情展示
function showEventDetail(eventElement) {
  // 实现详情弹窗逻辑
  console.log('Showing details for:', eventElement.querySelector('p').textContent);
}

// 侧边栏展开/收起
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const mask = document.querySelector('.sidebar-mask');
  sidebar.classList.toggle('open');
  mask.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
}

// 搜索功能
function searchContent() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  if (!query) return;

  const results = [];
  document.querySelectorAll('.window').forEach(section => {
    const text = section.innerText.toLowerCase();
    if (text.includes(query)) {
      results.push(section);
      section.style.backgroundColor = 'rgba(100,200,255,0.2)';
      setTimeout(() => section.scrollIntoView({behavior: 'smooth'}), 300);
    }
  });
  
  if (results.length === 0) {
    alert('未找到相关结果');
  }
}

// 读取 JSON 数据并生成内容
async function loadContent() {
  const loading = document.getElementById('loading');
  loading.style.display = 'flex';
  
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error('网络响应异常');
    const data = await response.json();

    const sidebar = document.getElementById('sidebar');
    const content = document.getElementById('content');

    // 生成侧边栏菜单
    sidebar.innerHTML = `<ul>${
      data.sections.map(section => 
        `<li><a href="#${section.id}" onclick="toggleSidebar()">${section.title}</a></li>`
      ).join('')
    }</ul>`;

    // 生成公告轮播
    if (data.announcements?.length) setupAnnouncementCarousel(data.announcements);

    // 生成内容区块
    content.innerHTML = data.sections.map((section, index) => {
      if (section.id === 'timeline') {
        return `
          <section class="window" id="${section.id}" style="animation-delay: ${index * 0.2}s">
            <h2>${section.title}</h2>
            <div class="timelines-container">${
              section.timelines.map(timeline => `
                <div class="timeline-wrapper">
                  <h3>${timeline.name} (${timeline.unit})</h3>
                  <div class="timeline-controls">
                    <button onclick="zoomTimeline(this.parentElement.nextElementSibling, -100)">-</button>
                    <button onclick="zoomTimeline(this.parentElement.nextElementSibling, 100)">+</button>
                  </div>
                  <div class="timeline-container"
                       data-min="${timeline.config.minYear}"
                       data-max="${timeline.config.maxYear}"
                       data-interval="${timeline.config.scaleInterval}"
                       data-major-interval="${timeline.config.majorScaleInterval}">
                    <div class="timeline-scale"></div>
                    <div class="timeline-track">${
                      timeline.events.map((event, i) => `
                        <div class="timeline-item" 
                             style="animation-delay: ${i * 0.1}s"
                             data-year="${event.year}">
                          <div class="timeline-event">
                            <span class="timeline-year">${event.year}</span>
                            <p>${event.event}</p>
                          </div>
                        </div>`
                      ).join('')
                    }</div>
                  </div>
                </div>`
              ).join('')
            }</div>
          </section>`;
      } else {
        return `
          <section class="window" id="${section.id}" style="animation-delay: ${index * 0.2}s">
            <h2>${section.title}</h2>
            <p>${section.content}</p>
          </section>`;
      }
    }).join('');

    // 初始化时间轴
    initAllTimelines();
    setupIntersectionObserver();

  } catch (error) {
    console.error('加载失败:', error);
    content.innerHTML = `
      <div class="error-window">
        <h2>数据加载失败</h2>
        <p>${error.message}</p>
        <button onclick="location.reload()">重新加载</button>
      </div>`;
  } finally {
    loading.style.display = 'none';
  }
}

// 时间轴缩放功能
function zoomTimeline(container, years) {
  const min = parseInt(container.dataset.min.replace(/\D/g, ''));
  const max = parseInt(container.dataset.max.replace(/\D/g, ''));
  const newMin = min + years;
  const newMax = max - years;
  
  if (newMax - newMin < 50) return; // 限制最小范围
  
  container.dataset.min = container.dataset.min.includes('GSC') 
    ? `GSC-${newMin}` : newMin;
  container.dataset.max = container.dataset.max.includes('GSC') 
    ? `GSC-${newMax}` : newMax;
    
  initTimelineScale(container);
  positionTimelineItems(container);
}

// 公告轮播功能
function setupAnnouncementCarousel(announcements) {
  const carousel = document.createElement('div');
  carousel.className = 'announcement-carousel';
  carousel.innerHTML = announcements.map((text, i) => `
    <div class="announcement-item ${i === 0 ? 'active' : ''}">${text}</div>`
  ).join('');

  const box = document.createElement('div');
  box.className = 'announcement-box';
  box.appendChild(carousel);
  document.querySelector('.header').appendChild(box);

  let current = 0;
  setInterval(() => {
    const items = document.querySelectorAll('.announcement-item');
    items[current].classList.remove('active');
    current = (current + 1) % items.length;
    items[current].classList.add('active');
  }, 4000);
}

// 时间轴初始化
function initAllTimelines() {
  document.querySelectorAll('.timeline-container').forEach(container => {
    initTimelineScale(container);
    positionTimelineItems(container);
  });
}

function initTimelineScale(container) {
  const scale = container.querySelector('.timeline-scale');
  const config = container.dataset;
  
  const getValue = (str) => parseInt(str.replace(/\D/g, '')) || 0;
  const min = getValue(config.min);
  const max = getValue(config.max);
  const total = max - min;
  
  scale.innerHTML = '';
  for (let val = min; val <= max; val += parseInt(config.interval)) {
    const percent = ((val - min) / total) * 100;
    const isMajor = val % parseInt(config.majorInterval) === 0;
    const marker = document.createElement('div');
    marker.className = isMajor ? 'major-marker' : 'marker';
    marker.style.left = `${percent}%`;
    if (isMajor) marker.innerHTML = `<span>${val}</span>`;
    scale.appendChild(marker);
  }
}

function positionTimelineItems(container) {
  const items = container.querySelectorAll('.timeline-item');
  const min = parseInt(container.dataset.min.replace(/\D/g, ''));
  const max = parseInt(container.dataset.max.replace(/\D/g, ''));
  
  items.forEach(item => {
    const year = parseInt(item.dataset.year.replace(/\D/g, ''));
    const percent = ((year - min) / (max - min)) * 100;
    item.style.left = `${percent}%`;
  });
}

// 交互动画
function setupIntersectionObserver() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('show');
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.window, .timeline-item').forEach(el => observer.observe(el));
}

// 启动
document.addEventListener('DOMContentLoaded', () => {
  loadContent();
  
  // 返回顶部按钮显示/隐藏
  window.addEventListener('scroll', () => {
    const btn = document.querySelector('.back-to-top');
    btn.style.display = window.scrollY > 10 ? 'block' : 'none';
  });
});

// 防抖函数
function debounce(func, delay) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, arguments), delay);
  };
}
window.addEventListener('resize', debounce(initAllTimelines, 200));