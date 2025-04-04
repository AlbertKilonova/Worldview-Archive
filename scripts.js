// 侧边栏展开/收起
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('open');
}

// 读取 JSON 数据并生成内容
async function loadContent() {
  const response = await fetch('data.json');
  const data = await response.json();

  const sidebar = document.getElementById('sidebar');
  const content = document.getElementById('content');

  // 生成侧边栏菜单
  sidebar.innerHTML = `<ul>${
    data.sections.map(section => 
      `<li><a href="#${section.id}">${section.title}</a></li>`
    ).join('')
  }</ul>`;

  // 生成公告轮播
  if (data.announcements?.length) setupAnnouncementCarousel(data.announcements);

  // 生成内容区块
  data.sections.forEach((section, index) => {
    if (section.id === 'timeline') {
      content.insertAdjacentHTML('beforeend', `
        <section class="window" id="${section.id}" style="animation-delay: ${index * 0.2}s">
          <h2>${section.title}</h2>
          <div class="timelines-container">${
            section.timelines.map(timeline => `
              <div class="timeline-wrapper">
                <h3>${timeline.name} (${timeline.unit})</h3>
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
        </section>`);
    } else {
      content.insertAdjacentHTML('beforeend', `
        <section class="window" id="${section.id}" style="animation-delay: ${index * 0.2}s">
          <h2>${section.title}</h2>
          <p>${section.content}</p>
        </section>`);
    }
  });

  // 初始化时间轴
  initAllTimelines();
  setupIntersectionObserver();
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
  window.addEventListener('resize', initAllTimelines);
});