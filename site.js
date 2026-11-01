const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.style.opacity=1;e.target.style.transform='none';o.unobserve(e.target)}}),{threshold:.08});document.querySelectorAll('.project,.fit article,.case-section').forEach(e=>{e.style.opacity=0;e.style.transform='translateY(18px)';e.style.transition='opacity .65s, transform .65s';o.observe(e)});

const backToTop=document.createElement('a');backToTop.className='back-to-top';backToTop.href='#top';backToTop.setAttribute('aria-label','回到顶部');backToTop.innerHTML='<span aria-hidden="true">↑</span>';backToTop.addEventListener('click',event=>{event.preventDefault();window.scrollTo({top:0,behavior:'smooth'})});document.body.appendChild(backToTop);const syncBackToTop=()=>backToTop.classList.toggle('show',window.scrollY>480);window.addEventListener('scroll',syncBackToTop,{passive:true});syncBackToTop();

// Each project color grows from the point of activation before navigation.
(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const curtain = document.createElement('div');
  curtain.className = 'page-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.innerHTML = '<span class="page-curtain-mark">ziru</span>';
  document.body.appendChild(curtain);

  const projectColors = {
    'snowbar.html': '#c8e3ee',
    'perfect-fit.html': '#e5dbed',
    'longshu.html': '#ffc7b6',
    'xingzhi.html': '#d4f0d9'
  };
  let leaving = false;
  let navigationTimer;

  if (!reducedMotion.matches) {
    document.body.classList.add('page-arriving');
    requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('page-arriving')));
  }

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || (link.target && link.target !== '_self') ||
        link.hasAttribute('download')) return;

    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin ||
        (url.pathname === location.pathname && url.hash) ||
        !/(?:index|snowbar|perfect-fit|longshu|xingzhi|figma1)\.html$/.test(url.pathname)) return;
    if (leaving) {
      event.preventDefault();
      return;
    }
    if (reducedMotion.matches) return;
    event.preventDefault();
    leaving = true;

    const sourceCard = link.closest('.work-card')?.querySelector('.work-image');
    const projectFile = url.pathname.split('/').pop();
    const sourceColor = sourceCard && getComputedStyle(sourceCard).backgroundColor;
    const color = sourceColor && sourceColor !== 'rgba(0, 0, 0, 0)'
      ? sourceColor
      : projectColors[projectFile] || projectColors[document.body.dataset.project + '.html'] || '#eef3f6';
    const rect = link.getBoundingClientRect();
    const keyboardActivation = event.detail === 0;
    const x = keyboardActivation ? rect.left + rect.width / 2 : event.clientX;
    const y = keyboardActivation ? rect.top + rect.height / 2 : event.clientY;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) + 2;

    curtain.style.setProperty('--origin-x', `${x}px`);
    curtain.style.setProperty('--origin-y', `${y}px`);
    curtain.style.setProperty('--end-radius', `${radius}px`);
    curtain.style.setProperty('--transition-color', color);
    document.body.setAttribute('aria-busy', 'true');
    requestAnimationFrame(() => document.body.classList.add('page-leaving'));
    navigationTimer = setTimeout(() => location.assign(url.href), 680);
  });

  window.addEventListener('pageshow', () => {
    clearTimeout(navigationTimer);
    leaving = false;
    document.body.classList.remove('page-leaving');
    document.body.removeAttribute('aria-busy');
  });
})();
