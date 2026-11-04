(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  document.getElementById('year').textContent = new Date().getFullYear();

  // ---------- Palmeiras (SVG gerado, cada folha balança) ----------
  const svg = document.getElementById('palms');
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs) => { const n = document.createElementNS(NS, tag); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; };

  function palm(x, baseY, h, lean, color, opacity) {
    const g = el('g', { class: 'palm', fill: color, stroke: color, opacity });
    const tx = x + lean, ty = baseY - h;
    const wb = h * 0.028, wt = h * 0.014;
    // tronco levemente curvo e afinando
    g.appendChild(el('path', {
      d: `M${x - wb} ${baseY} Q${x + lean * 0.15 - wb} ${baseY - h * 0.5} ${tx - wt} ${ty}
          L${tx + wt} ${ty} Q${x + lean * 0.15 + wb} ${baseY - h * 0.5} ${x + wb} ${baseY} Z`,
      stroke: 'none'
    }));
    const crown = el('g', { class: 'crown' });
    crown.style.transformOrigin = `${tx}px ${ty}px`;
    crown.style.animationDelay = `${rand(-7, 0)}s`;
    const n = 11;
    const f2 = v => v.toFixed(1);
    for (let i = 0; i < n; i++) {
      // leque de -175° a -5°, folhas arqueando e caindo nas pontas
      const a = -Math.PI * 0.97 + (i / (n - 1)) * Math.PI * 0.94 + rand(-0.1, 0.1);
      const L = h * rand(0.3, 0.4);
      const droop = L * rand(0.75, 1.15) * (0.6 + Math.abs(Math.cos(a)) * 0.5);
      const pt = t => [tx + Math.cos(a) * L * t, ty + Math.sin(a) * L * t + droop * t * t];
      const f = el('g', { class: 'frond' });
      f.style.transformOrigin = `${tx}px ${ty}px`;
      f.style.animationDelay = `${rand(-4, 0)}s`;
      f.style.animationDuration = `${rand(3.2, 5.2)}s`;
      let d = `M${tx} ${ty}`;
      for (let t = 0.05; t <= 1.001; t += 0.05) { const [px, py] = pt(t); d += ` L${f2(px)} ${f2(py)}`; }
      f.appendChild(el('path', { d, fill: 'none', 'stroke-width': h * 0.005, 'stroke-linecap': 'round' }));
      // folíolos: triângulos finos pendurados pela gravidade
      let leaf = '';
      for (let t = 0.08; t < 0.99; t += 0.022) {
        const [px, py] = pt(t), [qx, qy] = pt(t + 0.01);
        const dx = qx - px, dy = qy - py, len = Math.hypot(dx, dy) || 1;
        const ux = dx / len, uy = dy / len;
        const ll = L * 0.3 * Math.pow(Math.sin(Math.PI * Math.min(0.98, t * 0.95 + 0.04)), 0.8) * rand(0.8, 1.1);
        const w = L * 0.011;
        for (const side of [1, -1]) {
          let nx = -uy * side * 0.55 + ux * 0.35, ny = ux * side * 0.55 + uy * 0.35 + 0.75;
          const nl = Math.hypot(nx, ny); nx /= nl; ny /= nl;
          const k = side * Math.sign(ux || 1) > 0 ? 1 : 0.7;
          leaf += `M${f2(px - ux * w)} ${f2(py - uy * w)} L${f2(px + ux * w)} ${f2(py + uy * w)} L${f2(px + nx * ll * k)} ${f2(py + ny * ll * k)}Z `;
        }
      }
      f.appendChild(el('path', { d: leaf, stroke: 'none' }));
      crown.appendChild(f);
    }
    crown.appendChild(el('circle', { cx: tx, cy: ty + h * 0.004, r: h * 0.022, stroke: 'none' }));
    g.appendChild(crown);
    return g;
  }

  function drawPalms() {
    const W = innerWidth, H = innerHeight;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.replaceChildren();
    const base = H + 4;
    const narrow = W < 700;
    const k = narrow ? 0.85 : 1;
    // [x relativo, altura relativa, inclinação, camada]
    const layout = [
      [0.06, 0.55, 18, 'far'], [0.2, 0.6, -10, 'far'], [0.27, 0.68, 22, 'mid'],
      [0.87, 0.5, -16, 'far'], [0.11, 0.86, 40, 'near'], [0.9, 0.84, -30, 'near'],
      [0.99, 0.62, -12, 'mid']
    ];
    const colors = { far: ['--palm-far', 0.55], mid: ['--palm-mid', 0.8], near: ['--palm-near', 0.95] };
    const css = getComputedStyle(document.documentElement);
    const visible = narrow ? layout.filter(([rx]) => rx < 0.08 || rx > 0.85 || rx === 0.11) : layout;
    for (const [rx, rh, lean, layer] of visible) {
      let x = rx * W;
      if (narrow) x = rx < 0.5 ? rx * W * 0.55 : W - (1 - rx) * W * 0.55;
      const [c, o] = colors[layer];
      svg.appendChild(palm(x, base, rh * H * k, lean * (H / 900), css.getPropertyValue(c).trim(), o));
    }
  }
  drawPalms();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(drawPalms, 150); });

  // ---------- Nuvens, pássaros, partículas ----------
  const clouds = document.getElementById('clouds');
  for (let i = 0; i < 9; i++) {
    const c = document.createElement('div');
    c.className = 'cloud';
    c.style.top = `${rand(40, 82)}%`;
    c.style.width = `${rand(18, 45)}vw`;
    c.style.height = `${rand(2, 6)}px`;
    c.style.animationDuration = `${rand(40, 90)}s`;
    c.style.animationDelay = `${rand(-90, 0)}s`;
    clouds.appendChild(c);
  }
  const birds = document.getElementById('birds');
  for (let i = 0; i < 4; i++) {
    const b = document.createElement('div');
    b.className = 'bird';
    b.style.top = `${rand(48, 64)}%`;
    b.style.left = '0';
    b.style.animationDuration = `${rand(24, 34)}s`;
    b.style.animationDelay = `${-i * 1.2 + rand(-1, 0)}s`;
    const s = rand(0.7, 1.1);
    b.style.width = `${22 * s}px`; b.style.height = `${10 * s}px`;
    b.innerHTML = '<svg viewBox="0 0 22 10"><path d="M0 2 Q5 0 11 7 Q17 0 22 2 Q16 2 11 9 Q6 2 0 2Z" fill="#7a4570"/></svg>';
    b.firstChild.style.animationDelay = `${rand(-0.4, 0)}s`;
    birds.appendChild(b);
  }
  // ---------- Aviões puxando faixa ----------
  const planeSvg = `<svg class="plane" viewBox="0 0 80 32">
    <path d="M24 15h22l-4 8h-10z" fill="#7a3f86"/>
    <path d="M8 15c0-3.5 4-5 10-5l42 1.5L70 3h6l-4 10 2 2-8 2-48 3c-6 0-10-1.5-10-5z" fill="#fff4ea"/>
    <path d="M14 15.4 66 14v2.2L14 18z" fill="#ff3fa4"/>
    <path d="M70 3h6l-1.6 4h-6z" fill="#ff3fa4"/>
    <path d="M62 13.2h14l-2 2.4H64z" fill="#d9c2d8"/>
    <path d="M17 11.2 28 10.6l2.4 3.6-12.4.6z" fill="#2ff3e0"/>
    <path d="M30.5 20.5 31.5 25" stroke="#3a1745" stroke-width="1.2"/>
    <circle cx="31.6" cy="26" r="1.8" fill="#3a1745"/>
    <circle cx="7.4" cy="15" r="2.2" fill="#3a1745"/>
    <ellipse class="prop" cx="6" cy="15" rx="1.1" ry="9" fill="rgba(58,23,69,.55)"/>
  </svg>`;
  const ropeSvg = '<svg class="rope" viewBox="0 0 30 12" preserveAspectRatio="none"><path d="M0 5Q15 10 30 5" fill="none" stroke="rgba(58,23,69,.75)" stroke-width="1"/></svg>';
  // [frase, cor da faixa, altura na tela, escala, opacidade, sentido, atraso inicial em s]
  const flights = [
    ['Ah te manca né meu!', 'b1', 11, 0.9, 1, 'left', 0.8],
    ['Eai seus aliguinigenas estratosféricos', 'b2', 57, 1, 1, 'right', 7],
    ['Quem não seguir é chinelão...', 'b3', 80, 0.85, 0.92, 'left', 13],
    ['Bah o armandinho é o terror né meu', 'b4', 33, 0.95, 1, 'right', 19]
  ];
  if (!reduce) {
    const planes = document.getElementById('planes');
    for (const [text, color, top, s, o, dir, delay] of flights) {
      const f = document.createElement('div');
      f.className = `flight ${dir}`;
      f.style.top = `${top}%`;
      f.innerHTML = `<div class="ride" style="--s:${s};--o:${o};animation-delay:${rand(-3, 0)}s">${planeSvg}${ropeSvg}<div class="banner ${color}"></div></div>`;
      f.querySelector('.banner').textContent = text;
      planes.appendChild(f);
      const fly = () => {
        // velocidade constante: leitura confortável no celular, um pouco mais rápido em telas largas
        const W = innerWidth, w = f.offsetWidth + 30;
        const speed = 55 + W * 0.016;
        const [from, to] = dir === 'left' ? [W + 30, -w] : [-w, W + 30];
        f.classList.add('on');
        f.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }],
          { duration: (W + w + 30) / speed * 1000, easing: 'linear', fill: 'both' })
          .onfinish = () => { f.classList.remove('on'); setTimeout(fly, rand(4, 9) * 1000); };
      };
      setTimeout(fly, delay * 1000);
    }
  }

  const sparks = document.getElementById('sparks');
  for (let i = 0; i < 26; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.style.left = `${rand(0, 100)}%`;
    const sz = rand(2, 5);
    s.style.width = s.style.height = `${sz}px`;
    s.style.setProperty('--dx', `${rand(-60, 60)}px`);
    s.style.animationDuration = `${rand(10, 22)}s`;
    s.style.animationDelay = `${rand(-22, 0)}s`;
    sparks.appendChild(s);
  }

  // ---------- Texto digitado ----------
  const phrases = ['Bem-vindo ao canal 🌴', 'Conteúdo, gameplay e resenha', 'Segue lá 🔥'];
  const typed = document.getElementById('typed');
  if (reduce) typed.textContent = phrases[0];
  else {
    let p = 0, i = 0, del = false;
    (function tick() {
      const w = phrases[p];
      typed.textContent = w.slice(0, i);
      if (!del && i < w.length) i++;
      else if (!del) { del = true; return setTimeout(tick, 1800); }
      else if (i > 0) i--;
      else { del = false; p = (p + 1) % phrases.length; }
      setTimeout(tick, del ? 35 : 70);
    })();
  }

  // ---------- Tilt 3D na foto + parallax ----------
  if (!reduce) {
    const frame = document.getElementById('frame');
    const setTilt = (nx, ny) => {
      frame.style.transform = `rotateX(${(-ny * 10).toFixed(2)}deg) rotateY(${(nx * 12).toFixed(2)}deg)`;
      frame.style.setProperty('--gx', `${50 + nx * 50}%`);
      frame.style.setProperty('--gy', `${50 + ny * 50}%`);
      svg.style.transform = `translate(${(-nx * 10).toFixed(1)}px, ${(-ny * 6).toFixed(1)}px)`;
    };
    addEventListener('pointermove', e => setTilt(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5));
    document.addEventListener('pointerleave', () => setTilt(0, 0));
    addEventListener('deviceorientation', e => {
      if (e.gamma == null) return;
      setTilt(Math.max(-0.5, Math.min(0.5, e.gamma / 60)), Math.max(-0.5, Math.min(0.5, (e.beta - 40) / 60)));
    });
  }
})();
