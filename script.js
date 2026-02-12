const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const yearTag = document.getElementById('year');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const dogMessages = [
  'Scout is wagging through every keystroke you make.',
  'Pixel keeps chasing the cursor anytime you pause.',
  'Byte promises not to chew on your carefully chosen words.',
  'Scout just fetched a fresh squeaky toy labeled “Send”.',
  'Pixel is practicing polite sits for your reply.',
  'Byte sniffed out a typo and wagged approvingly when you fixed it.',
  'Scout spins in circles each time you fill another field.',
  'Pixel loves seeing friendly greetings in the message box.',
  'Byte thinks your story smells like success already.'
];

const dogHints = [
  'Paw tip: a quick intro helps Scout remember who to greet.',
  'Fun fact: Pixel counts keystrokes as belly rubs.',
  'Need help ideas? Byte gladly fetches more context about your project.',
  'Short sentences make it easier for the pack to share with me.'
];

const zipElements = {
  button: document.querySelector('.zip-button'),
  indicator: document.querySelector('.zip-indicator'),
  safeZone: document.querySelector('.zip-safe-zone'),
  status: document.getElementById('zip-status'),
  level: document.getElementById('zip-level'),
  best: document.getElementById('zip-best')
};

const stackElements = {
  button: document.querySelector('.stack-button'),
  canvas: document.getElementById('stack-canvas'),
  status: document.getElementById('stack-status'),
  score: document.getElementById('stack-score'),
  best: document.getElementById('stack-best')
};

if (navToggle && navLinks) {
  navToggle.setAttribute('aria-expanded', 'false');

  const closeMenu = () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    document.body.classList.toggle('nav-open', isOpen);
  });

  navLinks.querySelectorAll('a').forEach((link) =>
    link.addEventListener('click', () => {
      closeMenu();
    })
  );
}

const FORM_ENDPOINT = 'https://formspree.io/f/mrbyyzno';

if (contactForm) {
  contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (formStatus) {
      formStatus.textContent = 'Sending...';
    }

    const payload = {
      name: contactForm.name.value.trim(),
      email: contactForm.email.value.trim(),
      message: contactForm.message.value.trim()
    };

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      contactForm.reset();
      if (formStatus) {
        formStatus.textContent = 'Thanks! I’ll reply soon.';
      }
    } catch (error) {
      console.error(error);
      if (formStatus) {
        formStatus.textContent = 'Something went wrong. Please try again.';
      }
    }
  });
}

if (yearTag) {
  yearTag.textContent = new Date().getFullYear();
}

const attachReveal = () => {
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    document.querySelectorAll('[data-animate], [data-animate-group]').forEach((el) => {
      el.classList.add('is-visible');
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: '0px 0px -10%',
      threshold: 0.2
    }
  );

  const prepElement = (el) => {
    el.classList.add('reveal');
    observer.observe(el);
  };

  document.querySelectorAll('[data-animate]').forEach((el) => {
    prepElement(el);
  });

  document.querySelectorAll('[data-animate-group]').forEach((group) => {
    const selectors = (group.dataset.animateGroup || '')
      .split(',')
      .map((selector) => selector.trim())
      .filter(Boolean);

    const effect = group.dataset.animate || 'up';

    selectors.forEach((selector) => {
      group.querySelectorAll(selector).forEach((child, index) => {
        if (!child.dataset.animate) {
          child.dataset.animate = effect;
        }
        child.style.setProperty('--reveal-delay', `${index * 80}ms`);
        prepElement(child);
      });
    });
  });
};

const initDogPlayground = () => {
  if (!contactForm) {
    return;
  }

  const playground = contactForm.querySelector('.dog-playground');
  if (!playground) {
    return;
  }

  const cards = playground.querySelectorAll('.dog-card');
  if (!cards.length) {
    return;
  }

  const hintField = playground.querySelector('.dog-hint');
  let messageIndex = 0;
  let hintIndex = 0;

  const refreshDogs = () => {
    cards.forEach((card, offset) => {
      const line = card.querySelector('.dog-line');
      if (!line) {
        return;
      }

      const nextMessage = dogMessages[(messageIndex + offset) % dogMessages.length];
      line.textContent = nextMessage;
      card.classList.add('is-barking');

      const handleAnimationEnd = (event) => {
        if (event.animationName === 'dogHop') {
          card.classList.remove('is-barking');
        }
      };

      card.addEventListener('animationend', handleAnimationEnd, { once: true });
    });

    messageIndex = (messageIndex + cards.length) % dogMessages.length;
    if (hintField) {
      hintField.textContent = dogHints[hintIndex];
      hintIndex = (hintIndex + 1) % dogHints.length;
    }
  };

  contactForm.addEventListener('input', () => {
    refreshDogs();
  });

  contactForm.addEventListener(
    'focusin',
    () => {
      refreshDogs();
    },
    { once: true }
  );
};

const initZipGame = () => {
  if (!zipElements.button || !zipElements.indicator || !zipElements.safeZone) {
    return;
  }

  const state = {
    active: false,
    progress: 0,
    direction: 1,
    speed: 0.7,
    safeStart: 25,
    safeWidth: 40,
    level: 1,
    best: 0,
    rafId: null,
    lastTime: 0
  };

  const updateSafeZone = () => {
    const width = Math.max(45 - (state.level - 1) * 4, 15);
    const start = Math.random() * (100 - width);
    state.safeWidth = width;
    state.safeStart = start;
    zipElements.safeZone.style.left = `${start}%`;
    zipElements.safeZone.style.width = `${width}%`;
  };

  const stopLoop = () => {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  };

  const loop = (timestamp) => {
    if (!state.active) {
      return;
    }
    if (!state.lastTime) {
      state.lastTime = timestamp;
    }
    const delta = timestamp - state.lastTime;
    state.lastTime = timestamp;

    const speedMultiplier = Math.min(1.8, 1 + (state.level - 1) * 0.08);
    state.progress += state.direction * state.speed * (delta / 16) * speedMultiplier;

    if (state.progress >= 100) {
      state.progress = 100;
      state.direction = -1;
    } else if (state.progress <= 0) {
      state.progress = 0;
      state.direction = 1;
    }

    zipElements.indicator.style.left = `${state.progress}%`;
    state.rafId = requestAnimationFrame(loop);
  };

  const completeRun = () => {
    state.active = false;
    stopLoop();
    zipElements.button.textContent = 'Start Zip Run';
    zipElements.button.disabled = false;

    const indicatorCenter = state.progress;
    const zoneStart = state.safeStart;
    const zoneEnd = state.safeStart + state.safeWidth;

    if (indicatorCenter >= zoneStart && indicatorCenter <= zoneEnd) {
      state.level += 1;
      state.best = Math.max(state.best, state.level - 1);
      if (zipElements.status) {
        zipElements.status.textContent = `Clean zip! Level ${state.level}.`;
      }
    } else {
      if (zipElements.status) {
        zipElements.status.textContent = 'Missed the glow — back to level 1.';
      }
      state.level = 1;
    }

    if (zipElements.level) {
      zipElements.level.textContent = state.level;
    }
    if (zipElements.best) {
      zipElements.best.textContent = state.best;
    }
  };

  const handleToggle = () => {
    if (!state.active) {
      state.active = true;
      state.progress = 0;
      state.direction = 1;
      state.lastTime = 0;
      zipElements.button.textContent = 'Stop at Glow';
      if (zipElements.status) {
        zipElements.status.textContent = 'Aim for the highlighted zone.';
      }
      updateSafeZone();
      stopLoop();
      state.rafId = requestAnimationFrame(loop);
    } else {
      completeRun();
    }
  };

  zipElements.button.addEventListener('click', handleToggle);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.active) {
      completeRun();
    }
  });
};

const initStackTower = () => {
  const canvas = stackElements.canvas;
  if (!canvas || !stackElements.button) {
    return;
  }

  const ctx = canvas.getContext('2d');
  const height = canvas.height;
  const width = canvas.width;
  const blockHeight = 18;
  const colors = ['#f4d8c6', '#f3b694', '#e88d67', '#f2c879', '#ed9c5d'];

  const state = {
    playing: false,
    blocks: [],
    activeBlock: null,
    direction: 1,
    speed: 2.5,
    score: 0,
    best: 0,
    rafId: null
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, width, height);

    state.blocks.forEach((block) => {
      ctx.fillStyle = block.color;
      ctx.fillRect(block.x, block.y, block.width, blockHeight);
    });

    if (state.activeBlock) {
      ctx.fillStyle = state.activeBlock.color;
      ctx.fillRect(state.activeBlock.x, state.activeBlock.y, state.activeBlock.width, blockHeight);
    }
  };

  const stopLoop = () => {
    if (state.rafId) {
      cancelAnimationFrame(state.rafId);
      state.rafId = null;
    }
  };

  const loop = () => {
    if (!state.playing || !state.activeBlock) {
      draw();
      return;
    }

    state.activeBlock.x += state.direction * state.speed;
    if (state.activeBlock.x <= 0) {
      state.activeBlock.x = 0;
      state.direction = 1;
    } else if (state.activeBlock.x + state.activeBlock.width >= width) {
      state.activeBlock.x = width - state.activeBlock.width;
      state.direction = -1;
    }

    draw();
    state.rafId = requestAnimationFrame(loop);
  };

  const resetGame = () => {
    state.blocks = [
      {
        x: width / 2 - 100,
        y: height - blockHeight,
        width: 200,
        color: colors[0]
      }
    ];
    state.activeBlock = null;
    state.score = 0;
    state.speed = 2.5;
    if (stackElements.score) {
      stackElements.score.textContent = '0';
    }
    if (stackElements.best) {
      stackElements.best.textContent = state.best;
    }
    if (stackElements.status) {
      stackElements.status.textContent = 'Press drop to place the moving block.';
    }
  };

  const spawnBlock = () => {
    const lastBlock = state.blocks[state.blocks.length - 1];
    state.activeBlock = {
      x: 0,
      y: lastBlock.y - blockHeight,
      width: lastBlock.width,
      color: colors[(state.blocks.length + 1) % colors.length]
    };
    state.direction = 1;
    draw();
  };

  const handleDrop = () => {
    if (!state.playing || !state.activeBlock) {
      return;
    }

    const lastBlock = state.blocks[state.blocks.length - 1];
    const overlapStart = Math.max(state.activeBlock.x, lastBlock.x);
    const overlapEnd = Math.min(
      state.activeBlock.x + state.activeBlock.width,
      lastBlock.x + lastBlock.width
    );
    const overlapWidth = overlapEnd - overlapStart;

    if (overlapWidth <= 5) {
      if (stackElements.status) {
        stackElements.status.textContent = 'Tower toppled! Tap start to try again.';
      }
      state.playing = false;
      state.activeBlock = null;
      stopLoop();
      stackElements.button.textContent = 'Start Stacking';
      return;
    }

    state.blocks.push({
      x: overlapStart,
      y: state.activeBlock.y,
      width: overlapWidth,
      color: state.activeBlock.color
    });
    state.activeBlock = null;
    state.score += 1;
    state.best = Math.max(state.best, state.score);
    if (stackElements.score) {
      stackElements.score.textContent = state.score;
    }
    if (stackElements.best) {
      stackElements.best.textContent = state.best;
    }
    if (stackElements.status) {
      stackElements.status.textContent = 'Nice drop! Keep stacking.';
    }
    state.speed = Math.min(5, state.speed + 0.15);
    spawnBlock();
  };

  const startGame = () => {
    resetGame();
    state.playing = true;
    stackElements.button.textContent = 'Drop Block (Space/Click)';
    if (stackElements.status) {
      stackElements.status.textContent = 'Wait for alignment and drop!';
    }
    spawnBlock();
    stopLoop();
    state.rafId = requestAnimationFrame(loop);
  };

  stackElements.button.addEventListener('click', () => {
    if (!state.playing) {
      startGame();
    } else {
      handleDrop();
    }
  });

  stackElements.canvas.addEventListener('click', () => {
    handleDrop();
  });

  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'Enter') {
      event.preventDefault();
      handleDrop();
    }
  });

  resetGame();
  draw();
};

window.addEventListener('DOMContentLoaded', () => {
  attachReveal();
  initDogPlayground();
  initZipGame();
  initStackTower();
});
