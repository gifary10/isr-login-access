// Physics system for nodes and lines
const physics = { 
  nodes: [], 
  lines: [], 
  stiffness: 0.02, 
  repulsion: 30, 
  friction: 0.93, 
  maxSpeed: 4,
  animationId: null
};

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function updatePhysics() {
  // Reset acceleration
  physics.nodes.forEach(node => { 
    node.ax = 0; 
    node.ay = 0; 
  });

  // Spring forces
  physics.lines.forEach(line => {
    const dx = line.node2.x - line.node1.x;
    const dy = line.node2.y - line.node1.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const force = (dist - line.length) * physics.stiffness;
    
    line.node1.ax += dx / dist * force;
    line.node1.ay += dy / dist * force;
    line.node2.ax -= dx / dist * force;
    line.node2.ay -= dy / dist * force;
  });

  // Repulsion forces
  for (let i = 0; i < physics.nodes.length; i++) {
    for (let j = i + 1; j < physics.nodes.length; j++) {
      const node1 = physics.nodes[i];
      const node2 = physics.nodes[j];
      const dx = node2.x - node1.x;
      const dy = node2.y - node1.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = (node1.size + node2.size) * 2;
      
      if (dist < minDist) {
        const force = physics.repulsion / (dist * dist + 0.1);
        node1.ax -= dx / dist * force;
        node1.ay -= dy / dist * force;
        node2.ax += dx / dist * force;
        node2.ay += dy / dist * force;
      }
    }
  }

  // Update velocity and position
  physics.nodes.forEach(node => {
    node.vx = (node.vx + node.ax) * physics.friction;
    node.vy = (node.vy + node.ay) * physics.friction;
    
    // Limit speed
    const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
    if (speed > physics.maxSpeed) {
      node.vx = node.vx / speed * physics.maxSpeed;
      node.vy = node.vy / speed * physics.maxSpeed;
    }
    
    // Update position with boundary checks
    node.x += node.vx;
    node.y += node.vy;
    const radius = node.size / 2;
    node.x = Math.max(radius, Math.min(window.innerWidth - radius, node.x));
    node.y = Math.max(radius, Math.min(window.innerHeight - radius, node.y));
    
    // Update DOM
    node.element.style.left = `${node.x - radius}px`;
    node.element.style.top = `${node.y - radius}px`;
  });

  updateLines();
  physics.animationId = requestAnimationFrame(updatePhysics);
}

function updateLines() {
  physics.lines.forEach(line => {
    const x1 = line.node1.x, y1 = line.node1.y;
    const x2 = line.node2.x, y2 = line.node2.y;
    const dx = x2 - x1, dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    line.element.style.width = `${dist}px`;
    line.element.style.left = `${x1}px`;
    line.element.style.top = `${y1}px`;
    line.element.style.transform = `rotate(${angle}deg)`;
    
    const tension = Math.min(1, Math.abs(dist - line.length) / 50);
    line.element.style.opacity = 0.6 - tension * 0.3;
  });
}