(() => {
  'use strict';
  if (!window.lottie || !window.IntersectionObserver) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const actors = [...document.querySelectorAll('[data-pebble]')];
  const states = new Map(), requests = new Map(), visible = new Set();
  const toggle = document.querySelector('[data-motion-toggle]');
  let paused = false;

  const mayPlay = state => !paused && !reduced.matches && !document.hidden && visible.has(state.button);
  function idle(state) {
    clearTimeout(state.timer);
    state.reacting = false;
    state.player.setSpeed(1);
    state.player.loop = true;
    state.player.playSegments([84, 444], true);
    if (!mayPlay(state)) state.player.goToAndStop(0, true);
    state.button.dataset.motion = mayPlay(state) ? 'idle' : 'paused';
  }
  const clamp = value => Math.max(0, Math.min(1, value));
  const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  const key = (value, frame) => ({t: frame, s: Array.isArray(value) ? value : [value], o: {x: [0], y: [0]}, i: {x: [1], y: [1]}});
  function blend(low, high, part) {
    if (Array.isArray(low)) return low.map((value, i) => blend(value, high[i], part));
    if (low && typeof low === 'object') {
      const result = {...low};
      for (const name of ['v', 'i', 'o']) if (low[name]) result[name] = blend(low[name], high[name], part);
      return result;
    }
    return low + (high - low) * part;
  }
  function illustration(state, from, to, event) {
    const data = JSON.parse(JSON.stringify(state.original));
    const preset = state.presets.families[state.button.dataset.pebble];
    function walk(node) {
      if (!node || typeof node !== 'object') return;
      if (node.webProgress) {
        const binding = node.webProgress, frames = [];
        for (let frame = 0; frame <= 444; frame += 6) {
          const progress = from + (to - from) * ease(frame / 60);
          let part = clamp((progress - binding.start) / Math.max(0.0001, binding.end - binding.start));
          if (binding.landing) {
            const was = from > binding.start ? 1 : 0, next = to > binding.start ? 1 : 0;
            const delay = to > from ? clamp((binding.start - from) / (to - from)) * 24 : 0;
            part = was + (next - was) * ease((frame - delay) / 36);
          }
          const value = blend(binding.low, binding.high, part);
          if (binding.wave && value.v) {
            const wave = Math.sin(frame * Math.PI / 90) * 2;
            value.v[0][1] += wave; value.v[2][1] -= wave;
            if (value.v.length === 6) { value.v[3][1] -= wave; value.v[5][1] += wave; }
          }
          frames.push(key(value, frame));
        }
        node.a = 1; node.k = frames;
        return;
      }
      for (const [name, child] of Object.entries(node)) if (name !== 'webProgress') walk(child);
      if (node.ks && node.nm) {
        const layers = event === 'goal' ? preset.layers : event === 'touch' ? {} : preset.ordinary_layers;
        if (layers[node.nm]) Object.assign(node.ks, JSON.parse(JSON.stringify(layers[node.nm])));
        if (event === 'correction') for (const channel of ['p', 'r', 's']) {
          const property = node.ks[channel];
          if (property?.a === 1 && Array.isArray(property.k)) {
            const rest = property.k.find(frame => frame.t === 84)?.s;
            if (rest) property.k.forEach(frame => { if (frame.t < 84) frame.s = JSON.parse(JSON.stringify(rest)); });
          }
        }
        if (event !== 'goal' && event !== 'touch' && ['Warm-white eye', 'Peaceful closed eye', 'Pleased eye curve'].includes(node.nm)) {
          const rest = node.nm === (state.button.dataset.pebble === 'quiet' ? 'Peaceful closed eye' : 'Warm-white eye');
          node.ks.o = {a: 0, k: rest ? 100 : 0};
        }
      }
    }
    walk(data);
    return data;
  }
  function clearConfetti(state) {
    if (!state.confetti) return;
    state.confetti.querySelectorAll('i').forEach(piece => piece.getAnimations().forEach(animation => animation.cancel()));
    state.confetti.remove(); state.confetti = null;
  }
  function celebrate(state) {
    clearConfetti(state);
    if (!mayPlay(state) || !state.panel) return;
    const box = document.createElement('span'); box.className = 'confetti'; box.setAttribute('aria-hidden', 'true');
    state.panel.append(box); state.confetti = box;
    const width = state.panel.clientWidth, height = state.stage.clientHeight;
    const colors = ['#24d5c2', '#fdd360', '#ac86d9', '#f18c88', '#35b58a'];
    // A local burst suits the small card better than the app's full-scene launch.
    for (let i = 0; i < 24; i++) {
      const seed = ((i * 73 + 19) % 137) / 137, piece = document.createElement('i');
      piece.style.backgroundColor = colors[i % colors.length]; box.append(piece);
      const vx = (seed - 0.5) * 250, vy = -95 - (i % 7) * 12;
      const frames = Array.from({length: 25}, (_, index) => {
        const t = index / 24 * 1.6, x = width * (0.45 + seed * 0.1) + vx * t;
        const y = height * 0.43 + vy * t + 130 * t * t;
        return {transform: `translate(${x}px,${y}px) rotate(${t * 200 + i * 29}deg) scaleY(${0.3 + Math.abs(Math.cos(t * 7 + seed * 6)) * 0.7})`, opacity: Math.min(1, t * 12) * clamp((1.6 - t) / 0.45)};
      });
      const animation = piece.animate(frames, {duration: 1600, delay: 70 + (i % 6) * 18, easing: 'linear', fill: 'both'});
      animation.finished.then(() => { piece.remove(); if (!box.childElementCount) box.remove(); }).catch(() => {});
    }
  }
  function readyControls(state) {
    if (!state.panel) return;
    const panel = state.panel, goal = Number(panel.dataset.goal);
    panel.querySelector('[data-delta="-1"]').disabled = state.value <= 0;
    panel.querySelector('[data-delta="1"]').disabled = state.value >= goal;
    panel.querySelector('[data-total]').textContent = state.number.format(state.value) + ' / ' + state.number.format(goal);
    panel.querySelector('progress').value = state.value;
    panel.querySelector('[data-goal-status]').textContent = state.value >= goal ? panel.dataset.goalLabel : '';
    panel.dataset.value = String(state.value);
  }
  function install(state, data, event, from, to) {
    const ticket = ++state.generation, stage = document.createElement('span');
    stage.className = 'pebble-stage'; stage.setAttribute('aria-hidden', 'true'); stage.hidden = true;
    state.button.append(stage);
    const player = lottie.loadAnimation({container: stage, renderer: 'svg', autoplay: false, loop: true,
      animationData: data, rendererSettings: {hideOnTransparent: true}});
    player.addEventListener('DOMLoaded', () => {
      if (ticket !== state.generation) { player.destroy(); stage.remove(); return; }
      state.player?.destroy(); state.stage?.remove();
      state.player = player; state.stage = stage; state.eyes = []; state.from = from; state.to = to;
      if (state.button.hasAttribute('data-gaze')) stage.querySelectorAll('.pebble-gaze-eye').forEach(eye => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.classList.add('pebble-gaze-shift');
        while (eye.firstChild) group.append(eye.firstChild);
        eye.append(group); state.eyes.push(group);
      });
      stage.querySelector('svg')?.setAttribute('aria-hidden', 'true'); stage.hidden = false;
      state.button.dataset.ready = 'true'; state.button.disabled = false; readyControls(state);
      if (event === 'idle') idle(state);
      else {
        state.reacting = true; state.button.dataset.motion = event;
        if (!mayPlay(state)) {
          player.goToAndStop(event === 'touch' ? 45 : 84, true);
          if (!visible.has(state.button) || document.hidden) state.button.dataset.motion = 'paused';
          if (event === 'touch') state.timer = setTimeout(() => idle(state), 650);
        } else {
          const preset = state.presets.families[state.button.dataset.pebble];
          const duration = event === 'goal' ? preset.duration_seconds : event === 'touch' ? 0.95 : event === 'correction' ? 0.3 : preset.ordinary_duration_seconds;
          player.loop = false; player.setSpeed(1.4 / duration); player.playSegments([0, 84], true);
          if (event === 'goal') celebrate(state);
        }
      }
    });
    player.addEventListener('complete', () => { if (state.player === player && state.reacting) idle(state); });
  }
  function react(state, event, to = state.to) {
    clearTimeout(state.timer); clearConfetti(state);
    if (state.button.hasAttribute('data-gaze')) resetGaze();
    const frame = state.player ? state.player.currentFrame + state.player.firstFrame : 84;
    const from = state.from + (state.to - state.from) * ease(frame / 60);
    install(state, illustration(state, reduced.matches || paused ? to : from, to, event), event, from, to);
  }
  const presets = fetch('/pebble/assets/characters/event-presets.json').then(response => {
    if (!response.ok) throw new Error('Character responses unavailable'); return response.json();
  });
  presets.catch(() => {});
  async function load(button) {
    if (states.has(button)) return states.get(button);
    const family = button.dataset.pebble;
    if (!requests.has(family)) requests.set(family, fetch('/pebble/assets/characters/' + family + '.json')
      .then(response => { if (!response.ok) throw new Error('Character unavailable'); return response.json(); }));
    try {
      const [original, responses] = await Promise.all([requests.get(family), presets]);
      if (states.has(button)) return states.get(button);
      const panel = button.closest('[data-demo]');
      const initial = panel ? 0 : ['reading', 'neutral'].includes(family) ? 0.2 : 0;
      const state = {button, original, presets: responses, panel, player: null, stage: button.querySelector('.pebble-stage'), reacting: false, eyes: [], value: 0,
        from: initial, to: initial, generation: 0, number: new Intl.NumberFormat(document.documentElement.lang)};
      states.set(button, state);
      install(state, illustration(state, initial, initial, 'idle'), 'idle', initial, initial);
      return state;
    } catch (_) {
      // The original still stays visible if a player or asset cannot load.
      requests.delete(family);
      return null;
    }
  }
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const button = entry.target;
      if (entry.isIntersecting) {
        visible.add(button);
        load(button).then(state => { if (state?.player && button.dataset.ready === 'true') idle(state); });
      } else {
        visible.delete(button);
        const state = states.get(button);
        if (state?.player) { clearTimeout(state.timer); clearConfetti(state); state.player.pause(); state.button.dataset.motion = 'paused'; }
      }
    }
  }, {threshold: 0.08});
  actors.forEach(button => {
    observer.observe(button); button.disabled = false;
    button.addEventListener('focus', () => load(button));
    button.addEventListener('click', async () => {
      const state = await load(button);
      if (state) react(state, 'touch', state.panel ? state.value / Number(state.panel.dataset.goal) : state.to);
    });
    const panel = button.closest('[data-demo]');
    panel?.querySelectorAll('[data-delta]').forEach(control => {
      if (Number(control.dataset.delta) > 0) control.disabled = false;
      control.addEventListener('focus', () => load(button));
      control.addEventListener('click', async () => {
        const state = await load(button); if (!state) return;
        const goal = Number(panel.dataset.goal), old = state.value;
        state.value = Math.max(0, Math.min(goal, old + Number(control.dataset.delta) * Number(panel.dataset.step)));
        if (old === state.value) return;
        readyControls(state);
        react(state, state.value < old ? 'correction' : state.value >= goal ? 'goal' : 'change', state.value / goal);
      });
    });
  });

  function moveEyes(x, y) {
    for (const state of states.values()) if (state.button.hasAttribute('data-gaze')) {
      state.eyes.forEach(eye => { eye.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`; });
    }
  }
  function resetGaze() { moveEyes(0, 0); }
  document.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || !finePointer.matches || paused || reduced.matches || document.hidden) return;
    const button = document.querySelector('[data-gaze]');
    if (!button || !visible.has(button)) return;
    const box = button.getBoundingClientRect();
    const x = Math.max(-12, Math.min(12, (event.clientX - box.left - box.width / 2) / Math.max(200, innerWidth * 0.45) * 12));
    const y = Math.max(-8, Math.min(8, (event.clientY - box.top - box.height * 0.62) / Math.max(200, innerHeight * 0.45) * 8));
    if (!states.get(button)?.reacting) moveEyes(x, y);
  }, {passive: true});
  document.documentElement.addEventListener('pointerleave', resetGaze);
  window.addEventListener('blur', resetGaze);
  function sync() {
    resetGaze();
    states.forEach(state => { clearConfetti(state); if (state.button.dataset.ready === 'true') idle(state); });
    if (toggle) {
      toggle.hidden = reduced.matches;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.setAttribute('aria-label', paused ? toggle.dataset.play : toggle.dataset.pause);
      toggle.title = toggle.getAttribute('aria-label');
    }
  }
  toggle?.addEventListener('click', () => { paused = !paused; sync(); });
  document.addEventListener('visibilitychange', sync);
  reduced.addEventListener('change', sync);
  finePointer.addEventListener('change', resetGaze);
  sync();
})();
