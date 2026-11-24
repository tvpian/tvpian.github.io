(() => {
  const chapter = document.querySelector('.research-notebook');
  if (!chapter) return;
  const tabs = [...chapter.querySelectorAll('[data-thread]')];
  const panels = [...chapter.querySelectorAll('[data-thread-panel]')];
  const nav = chapter.querySelector('.rn-tabs');
  const mobile = matchMedia('(max-width: 700px)');
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Research threads and shared platform');
  const setOrientation = () => nav.setAttribute('aria-orientation', mobile.matches ? 'horizontal' : 'vertical');
  setOrientation();
  mobile.addEventListener('change', setOrientation);
  for (const tab of tabs) {
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', tab.hash.slice(1));
  }
  for (const panel of panels) {
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabs.find(t => t.hash === '#' + panel.id).id);
    panel.tabIndex = 0;
  }
  function reveal(id, {update = false, scroll = false, focus = false} = {}) {
    const target = document.getElementById(id);
    const panel = target?.closest('[data-thread-panel]');
    if (!target || !chapter.contains(target) || (!panel && !target.matches('details'))) return false;
    if (panel) {
      for (const item of panels) item.hidden = item !== panel;
      for (const tab of tabs) {
        const selected = tab.hash === '#' + panel.id;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      }
    }
    chapter.classList.add('rn-enhanced');
    if (target.matches('details')) target.open = true;
    const reading = target.closest('.rn-reading-panel');
    if (reading && !reading.open) reading.showModal();
    if (update) history.pushState(null, '', '#' + id);
    if (scroll) (target.closest('.rn-reading-panel') ? target : chapter).scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
    if (focus) target.focus({preventScroll: true});
    return true;
  }
  chapter.addEventListener('click', event => {
    const tab = event.target.closest('[data-thread]');
    if (!tab || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    reveal(tab.hash.slice(1), {update: true, scroll: mobile.matches || chapter.querySelector('.rn-panels').getBoundingClientRect().top < 0});
  });
  nav.addEventListener('keydown', event => {
    const index = tabs.indexOf(event.target.closest('[data-thread]'));
    if (index < 0) return;
    let next;
    const forward = mobile.matches ? 'ArrowRight' : 'ArrowDown';
    const backward = mobile.matches ? 'ArrowLeft' : 'ArrowUp';
    if (event.key === forward) next = (index + 1) % tabs.length;
    if (event.key === backward) next = (index - 1 + tabs.length) % tabs.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = tabs.length - 1;
    if (next === undefined) return;
    event.preventDefault();
    tabs[next].focus();
    reveal(tabs[next].hash.slice(1));
  });
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]:not([data-thread])');
    if (!link || new URL(link.href).pathname !== location.pathname || !link.hash || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    if (reveal(link.hash.slice(1), {update: true, scroll: true})) event.preventDefault();
  });
  const fromHash = () => reveal(location.hash.slice(1));
  addEventListener('hashchange', fromHash);
  addEventListener('popstate', fromHash);
  reveal('continual-learning');
  fromHash();
  if (location.hash) requestAnimationFrame(() => {
    const target = document.getElementById(location.hash.slice(1));
    if (target && chapter.contains(target)) (target.closest('.rn-reading-panel') ? target : chapter).scrollIntoView({behavior: 'instant', block: 'start'});
  });
})();


(() => {
  const root = document.querySelector('.research-notebook');
  if (!root) return;
  const initialHash = location.hash;
  const alignEntry = () => requestAnimationFrame(() => {
    if (location.hash !== initialHash) return;
    const target = document.getElementById(initialHash.slice(1));
    if (target && root.contains(target)) (target.closest('.rn-reading-panel') ? target : root).scrollIntoView({behavior: 'instant', block: 'start'});
  });
  if (document.readyState === 'complete') alignEntry();
  else addEventListener('load', alignEntry, {once: true});
  root.querySelector('[data-load-research-video]')?.addEventListener('click', event => {
    const figure = event.currentTarget.closest('figure');
    const host = figure.querySelector('.rn-video-host');
    host.replaceChildren(figure.querySelector('template').content.cloneNode(true));
    const video = host.querySelector('video');
    video.focus();
    video.play().catch(() => {});
  });
  const pauseHiddenMedia = () => root.querySelectorAll('.rn-panel[hidden] video, .rn-reading-panel:not([open]) video').forEach(video => video.pause());
  new MutationObserver(pauseHiddenMedia).observe(root, {attributes: true, attributeFilter: ['hidden', 'open'], subtree: true});
  function closeDisclosure(disclosure) {
    const summary = disclosure.querySelector(':scope > summary');
    disclosure.open = false;
    summary.focus({preventScroll: true});
    const bounds = summary.getBoundingClientRect();
    if (bounds.top < 24 || bounds.bottom > innerHeight - 24) {
      summary.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center'});
    }
  }
  root.querySelectorAll('details').forEach(disclosure => {
    const summary = disclosure.querySelector(':scope > summary');
    if (!summary) return;
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'rn-close-disclosure';
    close.textContent = disclosure.classList.contains('rn-platform') ? 'Close platform' : 'Close';
    close.setAttribute('aria-label', 'Close ' + summary.textContent.trim());
    close.addEventListener('click', () => closeDisclosure(disclosure));
    disclosure.append(close);
  });
  root.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const open = event.target.closest('details[open]');
    if (!open) return;
    event.preventDefault();
    closeDisclosure(open);
  });
})();





(() => {
  const root = document.querySelector('.research-notebook');
  if (!root) return;
  root.querySelectorAll('[data-open-reading]').forEach(button => {
    const dialog = document.getElementById(button.dataset.openReading);
    button.addEventListener('click', () => dialog.showModal());
  });
  root.querySelectorAll('.rn-reading-panel').forEach(dialog => {
    dialog.querySelector('[data-close-reading]').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
  });
})();

/* Conceptual timelines. No values in these illustrations are experimental data. */
(() => {
  const root = document.querySelector('.research-notebook');
  if (!root) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));
  const ramp = (time, start, end) => clamp((time - start) / (end - start));
  const smooth = value => value * value * (3 - 2 * value);
  const lerp = (a, b, value) => a + (b - a) * value;
  const point = (a, b, value) => [lerp(a[0], b[0], value), lerp(a[1], b[1], value)];
  const quadratic = (a,b,c,value) => point(point(a,b,value),point(b,c,value),value);
  const cycle = 12000;
  let userPaused = false;

  function createScene(figure) {
    const nodes = Object.fromEntries([...figure.querySelectorAll('[data-an]')].map(node => [node.dataset.an, node]));
    const arms = Object.fromEntries([...figure.querySelectorAll('[data-arm]')].map(node => [node.dataset.arm, {
      node, base: node.dataset.base.split(',').map(Number), link: node.querySelector('[data-link]'),
      elbow: node.querySelector('[data-elbow]'), wrist: node.querySelector('[data-wrist]'), grip: node.querySelector('[data-grip]')
    }]));
    const routes = Object.fromEntries([...figure.querySelectorAll('[data-route]')].map(path => [path.dataset.route, {
      path, length: path.getTotalLength(), dot: figure.querySelector(`[data-dot="${path.dataset.route}"]`)
    }]));
    const phaseNode = figure.querySelector('[data-phase]');
    const staticPhase = phaseNode.textContent;
    const labels = [...figure.querySelectorAll('.ra-labels > span')];
    const button = figure.querySelector('[data-pause-motion]');
    button.hidden = false;

    function show(key, opacity) { nodes[key].style.opacity = clamp(opacity); }
    function move(key, x, y) { nodes[key].setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`); }
    function trace(key, progress) {
      nodes[key].style.strokeDasharray = '1';
      nodes[key].style.strokeDashoffset = 1 - clamp(progress);
    }
    function flow(key, time, start, end, fade = 1) {
      const route = routes[key], progress = ramp(time, start, end);
      route.path.style.strokeDasharray = '1';
      route.path.style.strokeDashoffset = 1 - progress;
      route.path.style.opacity = fade * (progress > 0 ? .85 : 0);
      const pos = route.path.getPointAtLength(route.length * smooth(progress));
      route.dot.setAttribute('cx', pos.x);
      route.dot.setAttribute('cy', pos.y);
      route.dot.style.opacity = progress > 0 && progress < 1 ? fade : 0;
    }
    function arm(key, tip) {
      const item = arms[key], [x, y] = item.base, [tx, ty] = tip;
      const wx = tx, wy = ty - 24, l1 = 112, l2 = 122;
      const dx = wx - x, dy = wy - y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const angle = Math.atan2(dy, dx) + (dx >= 0 ? -1 : 1) * Math.acos(Math.max(-1, Math.min(1, (l1*l1 + distance*distance - l2*l2)/(2*l1*distance))));
      const ex = x + l1 * Math.cos(angle), ey = y + l1 * Math.sin(angle);
      item.link.setAttribute('d', `M${x} ${y}L${ex.toFixed(2)} ${ey.toFixed(2)}L${wx.toFixed(2)} ${wy.toFixed(2)}`);
      item.elbow.setAttribute('cx', ex); item.elbow.setAttribute('cy', ey);
      item.wrist.setAttribute('cx', wx); item.wrist.setAttribute('cy', wy);
      item.grip.setAttribute('d', `M${tx} ${ty-24}V${ty-13} M${tx-10} ${ty}V${ty-13}H${tx+10}V${ty}`);
    }
    function phase(text, active) {
      if (phaseNode.textContent !== text) phaseNode.textContent = text;
      labels.forEach((label, index) => label.toggleAttribute('data-active', index === active));
    }

    function render(milliseconds, still = false) {
      const t = still ? 9400/1000 : (milliseconds % cycle)/1000;
      const fade = 1 - smooth(ramp(t, 10.1, 11.2));
      const kind = figure.dataset.rnAnimation;
      if (kind === 'correction') {
        const attempt = smooth(ramp(t,.4,1.9));
        const correct = smooth(ramp(t,2.5,4.3));
        let tip = t<2.5 ? quadratic([187,116],[215,102],[247,154],attempt) : quadratic([247,154],[266,117],[308,154],correct);
        tip = point(tip, [187,116], smooth(ramp(t,10,11.3)));
        arm('correction-arm', tip);
        show('stop', ramp(t,1.7,2) * (1-ramp(t,3,3.4)));
        show('human-cursor', ramp(t,2.1,2.4) * (1-ramp(t,4.3,4.8)));
        move('human-cursor', tip[0]+3,tip[1]+7);
        trace('correction-trace', correct); show('correction-trace', fade);
        flow('capture',t,4.4,5.5,fade);
        trace('recorded-path',ramp(t,5,5.8)); show('recorded-path',fade);
        show('review-check',ramp(t,5.7,6.2)*fade);
        flow('train',t,6.3,7.5,fade); show('new-policy',ramp(t,7.4,7.9)*fade);
        flow('return',t,8,9.3,fade);
        phase(t<2.2?'A policy attempt reaches its limit.':t<4.6?'A person supplies the corrected segment.':t<6.3?'Record the correction and review it.':t<9.5?'Use the reviewed correction in the next training cycle.':'A correction becomes experience for the next rollout.',t<4.6?0:t<6.3?1:2);
      } else if (kind === 'grounding') {
        const patch = smooth(ramp(t,5,5.7))*(1-smooth(ramp(t,10.1,11.2)));
        flow('encode',t,.5,1.6,fade);
        show('feature-blue',ramp(t,1.3,2)*(1-patch)*fade);
        show('feature-patched',patch*.85);
        show('readout',ramp(t,2.2,2.8)*fade);
        show('patch',ramp(t,4.5,4.9)*fade);
        flow('act',t,2.6,4,fade);
        show('choice',ramp(t,3.8,4.3)*fade);
        const reach = smooth(ramp(t,3.5,4.5))*(1-smooth(ramp(t,10.1,11.2)));
        const y=123+reach*16;
        nodes['choice-gripper'].setAttribute('d',`M817 83V${y} M801 ${y+28}V${y}H833V${y+28}`);
        phase(t<2.2?'The instruction changes the internal representation.':t<4.5?'A probe can read out the word-object association.':t<6.3?'Change the representation and test its effect on action.':'Encoded information need not determine the chosen action.',t<2.2?0:t<6.3?1:2);
      } else if (kind === 'prediction') {
        flow('predict',t,.5,2,fade);
        const future = smooth(ramp(t,2,4.2));
        move('future-object',-140*(1-future),0);
        show('future-object',ramp(t,1.7,2.1)*fade);
        trace('future-trace',future);show('future-trace',ramp(t,2,2.4)*fade);
        flow('inverse-left',t,4.7,6,fade);flow('inverse-right',t,4.7,6,fade);
        show('inferred-vector',ramp(t,5.8,6.5)*fade);
        phase(t<2?'Start from the observed scene.':t<4.7?'Predict how the scene could change.':t<7?'Infer a candidate action from the two states.':'Prediction and inferred action still need execution tests.',t<2?0:t<4.7?1:2);
      } else if (kind === 'understanding') {
        flow('speech',t,.5,2.2,fade);
        flow('gesture',t,1.2,2.9,fade);
        flow('pose',t,1.8,3.5,fade);
        move('gesture',Math.sin(Math.PI*ramp(t,.8,2.4))*7,0);
        show('pose-limb',.35+.65*ramp(t,1.7,2.5));
        show('intent-ring',ramp(t,3,3.8)*fade);
        flow('intent',t,4,5.2,fade);
        show('intended-object',ramp(t,4.7,5.3)*fade);
        const reach=smooth(ramp(t,5.1,7.3))*(1-smooth(ramp(t,10.1,11.4)));
        arm('intent-arm',point([690,112],[751,149],reach));
        phase(t<3.5?'Different human cues contribute complementary evidence.':t<5.2?'Ground those cues in an intended target.':'Connect the intended target to a physical response.',t<3.5?0:t<5.2?1:2);
      } else if (kind === 'platform') {
        flow('command-real',t,.6,2.2,fade);flow('command-twin',t,.6,2.2,fade);
        show('control-port',.25+.75*ramp(t,.4,.8)*fade);
        const reach=smooth(ramp(t,2.2,4.7))*(1-smooth(ramp(t,10.1,11.4)));
        arm('platform-real',point([212,109],[262,154],reach));
        arm('platform-twin',point([688,109],[638,154],reach));
        flow('record-real',t,5,6.7,fade);flow('record-twin',t,5,6.7,fade);
        show('record-port',ramp(t,6.2,6.8)*fade);show('platform-review',ramp(t,7,7.7)*fade);
        phase(t<2.2?'A common interface sends commands to either backend.':t<5?'Run the experiment in the physical or simulated setting.':t<7.5?'Bring recordings back through the same review interfaces.':'Shared controls and review, with separate backends.',t<2.2?1:t<5?0:1);
      }
      if (still) { phaseNode.textContent=staticPhase;labels.forEach(label=>label.removeAttribute('data-active')); }
      figure.dataset.motionPhase = still ? 'static' : String(Math.floor(t));
    }
    const scene = {figure, button, render, elapsed:0, inView:false, selected:false, last:0, frame:0};
    scene.tick = now => {
      if (!scene.playing) return;
      if (scene.last) scene.elapsed += Math.min(now-scene.last,80);
      scene.last=now;render(scene.elapsed);
      scene.frame=requestAnimationFrame(scene.tick);
    };
    scene.update = () => {
      const selected=!figure.closest('.rn-panel').hidden;
      if(selected&&!scene.selected) scene.elapsed=0;
      scene.selected=selected;
      const playing=selected&&scene.inView&&!document.hidden&&!root.querySelector('dialog[open]')&&!userPaused&&!reduced.matches;
      if(playing!==scene.playing){
        scene.playing=playing;cancelAnimationFrame(scene.frame);scene.last=0;
        if(playing)scene.frame=requestAnimationFrame(scene.tick);
      }
      if(reduced.matches)render(9400,true);
      if(button.hidden!==reduced.matches)button.hidden=reduced.matches;
      button.textContent=userPaused?'Resume motion':'Pause motion';
      button.setAttribute('aria-pressed',String(userPaused));
      button.setAttribute('aria-label',`${userPaused?'Resume':'Pause'} ${figure.querySelector('title').textContent.toLowerCase()} animation`);
    };
    button.addEventListener('click',()=>{userPaused=!userPaused;scenes.forEach(item=>item.update());});
    render(9400,true);
    return scene;
  }
  const scenes=[...root.querySelectorAll('.ra-scene')].map(createScene);
  const refresh=()=>scenes.forEach(scene=>scene.update());
  const observer=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{const scene=scenes.find(item=>item.figure===entry.target);scene.inView=entry.isIntersecting;scene.update();});
  },{threshold:.18});
  scenes.forEach(scene=>observer.observe(scene.figure));
  new MutationObserver(refresh).observe(root,{subtree:true,attributes:true,attributeFilter:['hidden','open']});
  document.addEventListener('visibilitychange',refresh);
  reduced.addEventListener('change',refresh);
  refresh();
})();
