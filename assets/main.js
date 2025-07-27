document.addEventListener('DOMContentLoaded', initSplash, { once: true });

function initSplash() {
  const splashContainer = document.getElementById('splashContainer');
  const nodeCount = window.innerWidth < 768 ? 20 : 22;
  const colors = ['#4285f4', '#34a853', '#ea4335', '#fbbc05'];
  const logo = document.getElementById('logo');

  logo.onerror = function() {
    this.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZjNTYxOSIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IlBvcHBpbnMiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPklTUjwvdGV4dD48L3N2Zz4=';
  };

  // Create nodes
  for (let i = 0; i < nodeCount; i++) {
    const node = document.createElement('div');
    node.className = 'network-node';
    const size = Math.random() * 10 + 5;
    node.style.width = `${size}px`;
    node.style.height = `${size}px`;
    const x = Math.random() * window.innerWidth;
    const y = Math.random() * window.innerHeight;
    node.style.backgroundColor = colors[i % 4];
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    splashContainer.appendChild(node);
    physics.nodes.push({ 
      element: node, 
      x, 
      y, 
      vx: 0, 
      vy: 0, 
      size,
      ax: 0,
      ay: 0
    });
  }

  // Create connections
  const maxConnections = window.innerWidth < 768 ? 2 : 3;
  physics.nodes.forEach((node, i) => {
    const connections = Math.floor(Math.random() * 2) + 1;
    const sortedNodes = [...physics.nodes]
      .map((other, j) => ({ index: j, dist: distance(node, other) }))
      .sort((a, b) => a.dist - b.dist);
    
    for (let j = 1; j <= Math.min(connections, maxConnections); j++) {
      if (sortedNodes[j] && sortedNodes[j].index !== i) {
        const line = document.createElement('div');
        line.className = 'network-line';
        splashContainer.appendChild(line);
        physics.lines.push({
          element: line,
          node1: node,
          node2: physics.nodes[sortedNodes[j].index],
          length: sortedNodes[j].dist * 0.8
        });
      }
    }
  });

  // Animation timeline
  const masterTL = anime.timeline({ 
    easing: 'easeOutExpo',
    duration: 800
  });

  masterTL
    .add({
      targets: '.network-node',
      opacity: [0, 0.6],
      scale: [0, 1],
      translateY: () => [anime.random(-20, 20), 0],
      translateX: () => [anime.random(-20, 20), 0],
      duration: 1000,
      delay: anime.stagger(30, { from: 'center' }),
      easing: 'easeOutElastic(1, .8)',
      complete: () => {
        updatePhysics();
      }
    })
    .add({
      targets: '.network-line',
      opacity: [0, 0.6],
      duration: 700,
      delay: anime.stagger(15),
      easing: 'easeOutExpo',
      begin: updateLines
    }, '-=800')
    .add({
      targets: '#logo',
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      easing: 'easeOutBack(1.2)',
      complete: function() {
        anime({
          targets: '#logo',
          translateY: [
            {value: -5, duration: 1800, easing: 'easeInOutSine'},
            {value: 5, duration: 1800, easing: 'easeInOutSine'},
            {value: 0, duration: 1800, easing: 'easeInOutSine'}
          ],
          loop: true
        });
      }
    }, '-=400')
    .add({
      targets: '.app-title',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutQuad'
    }, '-=300')
    .add({
      targets: '.progress-container',
      scaleX: [0, 1],
      opacity: [0, 1],
      duration: 500,
      easing: 'easeOutQuad'
    }, '-=300')
    .add({
      targets: '#progressBar',
      width: ['0%', '100%'],
      duration: 1800,
      easing: 'linear',
      complete: function() {
        anime.remove('#logo');
        cancelAnimationFrame(physics.animationId);
        
        const exitTL = anime.timeline({
          easing: 'easeInOutQuad',
          complete: function() {
            window.location.href = 'index.html';
          }
        });
        
        exitTL
          .add({
            targets: '.network-node',
            translateY: () => anime.random(-100, 100),
            translateX: () => anime.random(-100, 100),
            opacity: 0,
            scale: 0,
            duration: 600,
            delay: anime.stagger(20)
          })
          .add({
            targets: '.network-line',
            opacity: 0,
            duration: 400
          }, '-=400')
          .add({
            targets: '.splash-container > *:not(.network-node):not(.network-line)',
            opacity: 0,
            translateY: -20,
            duration: 400
          }, '-=300');
      }
    }, '-=100');
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}