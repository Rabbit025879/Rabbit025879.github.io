/*************************
 * Interactive skills network
 * Lays out skill nodes in a circle around a central hub, draws a
 * connecting line to each, and shows details for the selected node
 * (or an overview when the hub itself is selected).
 *************************/
const skillDefs = [
  { tag: 'Core', title: 'Robotics & Control', hue: 'purple', items: ['ROS / ROS2', 'Navigation2', 'Control Theory'], desc: 'The center of gravity — designing how a robot senses its state and decides what to do next, from low-level control loops to full navigation stacks.' },
  { tag: 'Perception', title: 'Sensing & Vision', hue: 'cyan', items: ['Computer Vision', 'CMOS-MEMS', 'Sensor Fusion'], desc: 'Giving machines accurate awareness of the world — camera-based perception and custom MEMS sensors that extend what a system can physically measure.' },
  { tag: 'Firmware', title: 'Embedded Systems', hue: 'purple', items: ['STM32', 'C / C++', 'Real-Time Systems'], desc: 'The layer where software meets hardware in real time — firmware that has to be correct, fast, and predictable under real-world constraints.' },
  { tag: 'Simulation', title: 'Modeling & Analysis', hue: 'cyan', items: ['COMSOL', 'MATLAB', 'LTspice'], desc: 'Testing ideas before they cost money — physical and circuit-level simulation used to validate sensor and control designs ahead of fabrication.' },
  { tag: 'Design', title: 'Mechanical & CAD', hue: 'purple', items: ['AutoCAD', 'Inventor', 'Mechatronics'], desc: 'Where the physical form takes shape — mechanical design and CAD work that turns a concept into a buildable, testable system.' },
  { tag: 'Platform', title: 'Software & Tooling', hue: 'cyan', items: ['Docker', 'Git', 'Linux'], desc: 'The connective tissue that keeps a team’s work reproducible — version control, containerization, and Linux-based development environments.' },
];

const overview = {
  tag: 'Overview', hue: 'purple', title: 'One engineer, many systems.',
  desc: 'Every project I build touches more than one of these disciplines at once. Click a node to see how each piece fits into the whole.',
  items: ['Robotics', 'AI', 'Embedded', 'Mechanical'],
};

const network = document.getElementById('skills-network');
const svg = document.getElementById('skills-lines');
const hub = document.getElementById('skills-hub');
const detail = document.getElementById('skills-detail');

if (network && svg && hub && detail) {
  const radius = 38;
  const angleStep = 360 / skillDefs.length;

  const nodes = skillDefs.map((def, i) => {
    const angleDeg = -90 + i * angleStep;
    const rad = (angleDeg * Math.PI) / 180;
    const x = 50 + radius * Math.cos(rad);
    const y = 50 + radius * Math.sin(rad);

    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '50');
    line.setAttribute('y1', '50');
    line.setAttribute('x2', String(x));
    line.setAttribute('y2', String(y));
    line.setAttribute('stroke', 'oklch(0.5 0.05 290 / 0.3)');
    line.setAttribute('stroke-width', '0.8');
    svg.appendChild(line);

    const node = document.createElement('div');
    node.className = 'node';
    node.innerHTML = `<div class="node-tag">${def.tag}</div><div class="node-title">${def.title}</div>`;
    node.style.left = `${x}%`;
    node.style.top = `${y}%`;
    network.appendChild(node);

    return { def, line, node };
  });

  function renderDetail(data) {
    detail.innerHTML = `
      <div class="skills-detail-tag hue-${data.hue}">${data.tag}</div>
      <div class="skills-detail-title">${data.title}</div>
      <p class="skills-detail-desc">${data.desc}</p>
      <div class="skills-detail-items">${data.items.map((item) => `<span>${item}</span>`).join('')}</div>
      <div class="skills-detail-hint">Click a node to explore each system →</div>
    `;
  }

  function select(index) {
    nodes.forEach(({ def, line, node }, i) => {
      const active = i === index;
      node.classList.toggle('active', active);
      node.classList.toggle('hue-purple', def.hue === 'purple');
      node.classList.toggle('hue-cyan', def.hue === 'cyan');
      line.setAttribute('stroke', active ? `var(--${def.hue})` : 'oklch(0.5 0.05 290 / 0.3)');
      line.setAttribute('stroke-width', active ? '1.6' : '0.8');
    });
    renderDetail(index === -1 ? overview : skillDefs[index]);
  }

  nodes.forEach(({ node }, i) => node.addEventListener('click', () => select(i)));
  hub.addEventListener('click', () => select(-1));

  select(-1);
}
