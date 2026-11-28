(() => {
  const chapter = document.querySelector('.research-notebook');
  if (!chapter) return;
  const tabs = [...chapter.querySelectorAll('[data-thread]')];
  const panels = [...chapter.querySelectorAll('[data-thread-panel]')];
  const nav = chapter.querySelector('.rn-tabs');
  const mobile = matchMedia('(max-width: 767px)');
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
  function reveal(id, {update = false, scroll = false, focus = false, readPanel = false} = {}) {
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
    if (scroll) (target.closest('.rn-reading-panel') ? target : readPanel && panel ? panel : chapter).scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start'});
    if (focus) target.focus({preventScroll: true});
    return true;
  }
  chapter.addEventListener('click', event => {
    const tab = event.target.closest('[data-thread]');
    if (!tab || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    reveal(tab.hash.slice(1), {update: true, scroll: mobile.matches || chapter.querySelector('.rn-panels').getBoundingClientRect().top < 0, readPanel: mobile.matches, focus: mobile.matches});
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
    if (target && chapter.contains(target)) (target.closest('.rn-reading-panel') ? target : readPanel && panel ? panel : chapter).scrollIntoView({behavior: 'instant', block: 'start'});
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
    const labels = [...figure.querySelectorAll('.ra-labels > span')];
    const staticLabels = labels.map(label => label.textContent);
    const kind = figure.dataset.rnAnimation;
    const cycle = ['prediction','correction'].includes(kind) ? 14000 : 12000;
    const button = figure.querySelector('[data-pause-motion]');
    button.hidden = false;

    function show(key, opacity) { nodes[key].style.opacity = clamp(opacity); }
    function move(key, x, y) { nodes[key].setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})`); }
    function trace(key, progress) {
      nodes[key].style.strokeDasharray = '1';
      nodes[key].style.strokeDashoffset = 1 - clamp(progress);
    }
    function flow(key, time, start, end, fade = 1) {
      const route = routes[key], progress = smooth(ramp(time, start, end));
      route.path.style.strokeDasharray = '1';
      route.path.style.strokeDashoffset = 1 - progress;
      route.path.style.opacity = fade * (progress > 0 ? .85 : 0);
      const pos = route.path.getPointAtLength(route.length * progress);
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
    function phase(texts, active = []) {
      labels.forEach((label, index) => {
        if (label.textContent !== texts[index]) label.textContent = texts[index];
        const mark = active.includes(index);
        if (label.hasAttribute('data-active') !== mark) label.toggleAttribute('data-active', mark);
      });
    }

    function render(milliseconds, still = false) {
      const t = still ? 9.4 : (milliseconds % cycle)/1000;
      const fade = 1 - smooth(ramp(t,kind==='correction'?12:10.1,kind==='correction'?13.2:11.2));
      if (kind === 'correction') {
        const attempt = smooth(ramp(t,.4,1.9));
        const correct = smooth(ramp(t,2.5,4.3));
        let tip = t<2.5 ? quadratic([187,116],[215,102],[247,154],attempt) : quadratic([247,154],[266,117],[308,154],correct);
        tip = point(tip, [187,116], smooth(ramp(t,12,13.3)));
        arm('correction-arm', tip);
        show('stop', ramp(t,1.7,2) * (1-ramp(t,3,3.4)));
        show('human-cursor', ramp(t,2.1,2.4) * (1-ramp(t,4.3,4.8)));
        move('human-cursor', tip[0]+3,tip[1]+7);
        trace('correction-trace', correct); show('correction-trace', fade);
        flow('capture',t,4.4,5.5,fade);
        trace('recorded-path',ramp(t,5,5.8)); show('recorded-path',fade);
        show('review-check',ramp(t,5.7,6.2)*fade);
        flow('train',t,6.3,7.5,fade*(1-ramp(t,8.95,9.5))); show('new-policy',ramp(t,7.4,7.9)*fade);
        flow('return',t,8,9.3,fade*(1-ramp(t,9.2,9.7)));
        const tests=ramp(t,9.1,9.75)*fade;
        show('policy-card',(1-ramp(t,9,9.5))+(1-fade)*ramp(t,9,9.5));
        show('skill-tests',still?1:tests);
        if(still) show('policy-card',0);
        phase([t<2?'Policy attempt':t<4.6?'Human takeover':'Correction captured',t<5.7?'Review the correction':'Correction reviewed',t<7.9?'Train the next policy':t<9.4?'Return to rollout':'Test both skills'],[t<4.6?0:t<6.3?1:2]);
      } else if (kind === 'grounding') {
        const cue=ramp(t,1.05,1.55), patch=smooth(ramp(t,5.25,6.05));
        const baselineFade=1-ramp(t,4.45,5.15);
        const options=ramp(t,6.8,7.35)*fade;
        flow('encode',t,.35,1.6,fade);
        show('feature-blue',cue*(1-patch)*fade);
        show('feature-patched',patch*.85*fade);
        show('readout',ramp(t,1.55,2.1)*baselineFade*fade);
        show('patch',ramp(t,4.75,5.25)*fade);
        move('patch',0,patch*12);
        show('baseline',baselineFade+(1-fade)*(1-baselineFade));
        show('baseline-choice',ramp(t,3.2,3.85));
        flow('baseline-action',t,2.45,3.45,baselineFade);
        const y=118+smooth(ramp(t,3.05,3.75))*27;
        nodes['choice-gripper'].setAttribute('d',`M702 82V${y} M684 ${y+33}V${y}H720V${y+33}`);
        show('outcomes',options);
        flow('patch-out',t,6,6.5,fade);
        flow('unchanged',t,6.5,7.35,fade);
        flow('changed',t,6.5,7.35,fade);
        phase(['“Pick blue”',t<1.75?'Probe the features':t<4.65?'Probe reads blue':t<6.05?'Swap the internal cue':'Cue changed to orange',t<3.65?'Watch the choice':t<4.9?'Baseline: blue':t<6.8?'What changes?':'Two possible outcomes'],[t<1.5?0:t<2.45||t>=4.65&&t<6.05?1:2]);
      } else if (kind === 'prediction') {
        const second = t >= 7, local = second ? t-7 : t;
        const strength = 1-smooth(ramp(local,5.9,6.7));
        const future = smooth(ramp(local,1.45,3.05)), dx = second ? 0 : 60, dy = second ? -72 : 0;
        nodes['future-trace'].setAttribute('d',`M451 172.5l${dx} ${dy}`);
        nodes['inferred-vector'].setAttribute('transform',second?'rotate(-90 740 151)':'');
        flow('predict',local,.4,1.35,strength);
        show('predict-head',ramp(local,1.15,1.35)*strength);
        move('future-object',dx*future,dy*future);
        show('future-object',ramp(local,1.1,1.5)*strength);
        trace('future-trace',future); show('future-trace',ramp(local,1.5,1.8)*strength);
        flow('from-present',local,3.15,4.25,strength); flow('from-future',local,3.15,4.25,strength);
        show('inferred-vector',ramp(local,4.15,4.45)*strength);
        phase(['Same starting scene',local<1.45?'Possible future':second?'Box moves up':'Box moves right',local<4.25?'Infer an action':local<5.15?(second?'Move up':'Move right'):'Would it work?'],[local<.9?0:local<3.15?1:2]);
        if(still){
          move('future-object',60,0); show('future-object',1);
          nodes['future-trace'].setAttribute('d','M451 172.5h60'); trace('future-trace',1); show('future-trace',.7);
          nodes['inferred-vector'].removeAttribute('transform'); show('inferred-vector',1);
          flow('predict',2,.4,1.35); flow('from-present',5,3.15,4.25); flow('from-future',5,3.15,4.25);
        }
      } else if (kind === 'understanding') {
        const gesture=smooth(ramp(t,3.3,4.4))*(1-smooth(ramp(t,10.1,11.4)));
        const reach=smooth(ramp(t,6.1,8.1))*(1-smooth(ramp(t,10.1,11.4)));
        const [elbowX,elbowY]=point([331,155],[350,133],gesture);
        const [handX,handY]=point([324,178],[380,150],gesture);
        nodes['pose-limb'].setAttribute('d',`M310 124L${elbowX} ${elbowY}L${handX} ${handY}`);
        move('pointer-tip',handX-380,handY-150); show('pointer-tip',ramp(t,3.35,4.35)*fade);
        show('ambiguity',ramp(t,.65,1.35)*(1-ramp(t,4.85,5.25)));
        show('intended-object',ramp(t,4.8,5.3)*fade);
        flow('gesture',t,4.4,5.2,fade);
        flow('intent',t,5.25,6.1,fade);
        arm('intent-arm',point([622,105],[503,156],reach));
        phase([t<3.3?'Speech alone':'Speech + pointing',t<.65?'Two objects':t<5?'Either one fits':'One target',t<6.1?'Robot waits':'Robot reaches'],[t<.85||t>=3.3&&t<4.4?0:t<6.1?1:2]);
      } else if (kind === 'platform') {
        flow('command-real',t,.6,2.2,fade);flow('command-twin',t,.6,2.2,fade);
        show('control-port',.25+.75*ramp(t,.4,.8)*fade);
        const reach=smooth(ramp(t,2.2,4.7))*(1-smooth(ramp(t,10.1,11.4)));
        arm('platform-real',point([212,109],[262,154],reach));
        arm('platform-twin',point([688,109],[638,154],reach));
        flow('record-real',t,5,6.7,fade);flow('record-twin',t,5,6.7,fade);
        show('record-port',ramp(t,6.2,6.8)*fade);show('platform-review',ramp(t,7,7.7)*fade);
        phase(['Physical robot',t<2.2?'Send the commands':t<5?'Shared controls':t<7?'Collect recordings':'Review both runs','Digital twin'],t>=2.2&&t<5?[0,2]:[1]);
      }
      if (still) phase(staticLabels);
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
