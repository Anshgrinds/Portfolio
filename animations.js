/**
 * Ansh Jha Portfolio — High-Performance GSAP & Three.js Engine
 * Lightweight, GPU-safe 3D ambient particle constellation + silky GSAP ScrollTrigger orchestration
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Three.js 3D Background with WebGL safety checks
  if (typeof THREE !== 'undefined') {
    initThreeJSHero();
  }

  // 2. Initialize GSAP & ScrollTrigger Animations
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    initGSAPAnimations();
    initMagneticButtons();
  }
});

/* ==========================================================================
   1. THREE.JS INTERACTIVE 3D HERO CONSTELLATION & PARTICLE FIELD
   ========================================================================== */
function initThreeJSHero() {
  const canvas = document.getElementById('hero-three-canvas');
  const heroSection = document.getElementById('home');
  if (!canvas || !heroSection) return;

  // Safe dimension calculation
  let width = Math.max(heroSection.clientWidth || window.innerWidth, 320);
  let height = Math.max(heroSection.clientHeight || window.innerHeight, 320);

  // WebGL Renderer with graceful fallbacks
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.warn('WebGL not supported or disabled:', err);
    return;
  }

  // Cap pixel ratio to 1.5 to prevent high-DPI GPU exhaustion
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 24;

  // Programmatic circular glow dot texture (zero external network requests)
  function createGlowDotTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(16, 185, 129, 0.9)');
    grad.addColorStop(0.65, 'rgba(56, 189, 248, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(c);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  const particleTexture = createGlowDotTexture();

  // Constellation Particles
  const particleCount = 220;
  const positions = new Float32Array(particleCount * 3);
  const basePositions = [];
  const colors = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  const emerald = new THREE.Color(0x10b981);
  const cyan = new THREE.Color(0x38bdf8);
  const slate = new THREE.Color(0x71717a);

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 44;
    const y = (Math.random() - 0.5) * 26;
    const z = (Math.random() - 0.5) * 18 - 4;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    basePositions.push({ x, y, z });

    // Color distribution: emerald accents, cool slate, subtle cyan highlights
    const rnd = Math.random();
    let col;
    if (rnd < 0.45) {
      col = emerald;
    } else if (rnd < 0.75) {
      col = slate;
    } else {
      col = cyan;
    }

    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    scales[i] = Math.random() * 0.4 + 0.6;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.6,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // Subtle Constellation Connecting Lines (between close nodes)
  const lineIndices = [];
  const maxDistance = 6.2;
  const maxDistanceSq = maxDistance * maxDistance;

  for (let i = 0; i < particleCount; i++) {
    for (let j = i + 1; j < particleCount; j++) {
      const dx = basePositions[i].x - basePositions[j].x;
      const dy = basePositions[i].y - basePositions[j].y;
      const dz = basePositions[i].z - basePositions[j].z;
      const distSq = dx * dx + dy * dy + dz * dz;

      if (distSq < maxDistanceSq) {
        lineIndices.push(i, j);
      }
    }
  }

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  lineGeometry.setIndex(lineIndices);

  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x10b981,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineSegments);

  // Mouse Interactivity with smooth damping
  let mouseTargetX = 0;
  let mouseTargetY = 0;
  let mouseCurrentX = 0;
  let mouseCurrentY = 0;

  function onMouseMove(e) {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    mouseTargetX = x * 0.8;
    mouseTargetY = y * 0.6;
  }
  window.addEventListener('mousemove', onMouseMove, { passive: true });

  // Handle Resize safely
  function onResize() {
    width = Math.max(heroSection.clientWidth || window.innerWidth, 320);
    height = Math.max(heroSection.clientHeight || window.innerHeight, 320);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  }
  window.addEventListener('resize', onResize, { passive: true });

  // Performance: Pause when tab is hidden or scrolled out of view
  let isIntersecting = true;
  let isTabActive = true;
  let animId = null;

  const observer = new IntersectionObserver((entries) => {
    isIntersecting = entries[0].isIntersecting;
  }, { threshold: 0.05 });
  observer.observe(heroSection);

  document.addEventListener('visibilitychange', () => {
    isTabActive = !document.hidden;
  });

  // WebGL Context Loss Safety
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    if (animId) cancelAnimationFrame(animId);
  }, false);

  canvas.addEventListener('webglcontextrestored', () => {
    animate();
  }, false);

  const clock = new THREE.Clock();

  function animate() {
    animId = requestAnimationFrame(animate);

    if (!isIntersecting || !isTabActive) return;

    const time = clock.getElapsedTime();

    // Lerp mouse
    mouseCurrentX += (mouseTargetX - mouseCurrentX) * 0.04;
    mouseCurrentY += (mouseTargetY - mouseCurrentY) * 0.04;

    // Gentle global scene rotation
    scene.rotation.y = time * 0.035 + mouseCurrentX * 0.25;
    scene.rotation.x = Math.sin(time * 0.025) * 0.08 + mouseCurrentY * 0.2;

    // Organic wave pulsation on particle coordinates
    const posAttr = particleGeometry.attributes.position;
    const posArr = posAttr.array;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const base = basePositions[i];
      // Subtle organic harmonic wave
      posArr[i3 + 1] = base.y + Math.sin(time * 0.6 + base.x * 0.2) * 0.45;
      posArr[i3] = base.x + Math.cos(time * 0.4 + base.y * 0.2) * 0.25;
    }
    posAttr.needsUpdate = true;
    lineGeometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  animate();
}

/* ==========================================================================
   2. GSAP & SCROLLTRIGGER ORCHESTRATION
   ========================================================================== */
function initGSAPAnimations() {
  // 1. Hero Entrance Sequence
  const heroTL = gsap.timeline({ defaults: { ease: 'power3.out' } });

  heroTL
    .from('header nav', {
      y: -20,
      opacity: 0,
      duration: 0.75,
      delay: 0.1
    })
    .from('.status-badge', {
      scale: 0.85,
      opacity: 0,
      duration: 0.5,
      ease: 'back.out(1.5)'
    }, '-=0.35')
    .from('.hero-title', {
      y: 30,
      opacity: 0,
      duration: 0.85
    }, '-=0.3')
    .from('.hero-desc', {
      y: 20,
      opacity: 0,
      duration: 0.7
    }, '-=0.5')
    .from('.hero-actions .btn', {
      y: 18,
      opacity: 0,
      stagger: 0.08,
      duration: 0.55
    }, '-=0.4')
    .from('.portrait-wrapper', {
      scale: 0.94,
      y: 25,
      opacity: 0,
      duration: 0.9,
      ease: 'power2.out'
    }, '-=0.75');

  // Subtle floating idle loop on portrait
  gsap.to('.portrait-wrapper', {
    y: '-=8',
    duration: 3.0,
    ease: 'sine.inOut',
    yoyo: true,
    repeat: -1,
    delay: 1.2
  });

  if (!window.ScrollTrigger) return;

  // 2. Metrics Counter Animation
  ScrollTrigger.create({
    trigger: '.metrics-section',
    start: 'top 85%',
    once: true,
    onEnter: () => {
      // Metric 1: "5"
      const num1 = document.querySelectorAll('.metric-num')[0];
      if (num1) {
        gsap.fromTo(num1, { innerText: 0 }, {
          innerText: 5,
          duration: 1.2,
          ease: 'power2.out',
          snap: { innerText: 1 }
        });
      }

      // Metric 2: "10+"
      const num2 = document.querySelectorAll('.metric-num')[1];
      if (num2) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: 10,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            num2.innerText = Math.floor(obj.val) + '+';
          }
        });
      }

      // Stagger items
      gsap.from('.metric-item', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power2.out'
      });
    }
  });

  // 3. Section Header Reveals
  gsap.utils.toArray('.section-header').forEach(header => {
    gsap.from(header.children, {
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 25,
      opacity: 0,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power2.out'
    });
  });

  // 4. Project Cards Stagger with clearProps (prevents clash with filter tabs)
  ScrollTrigger.batch('.project-card', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      gsap.from(batch, {
        y: 35,
        opacity: 0,
        stagger: 0.08,
        duration: 0.65,
        ease: 'power2.out',
        onComplete: () => {
          gsap.set(batch, { clearProps: 'transform,opacity' });
        }
      });
    }
  });

  // 5. 3D Technical Breakdown Section Handle Pulse
  ScrollTrigger.create({
    trigger: '#3d',
    start: 'top 75%',
    once: true,
    onEnter: () => {
      gsap.fromTo('.comparison-slider', {
        scale: 1
      }, {
        scale: 1.2,
        duration: 0.45,
        repeat: 2,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 0.2
      });
    }
  });

  // 6. Skills Grid Stagger
  ScrollTrigger.create({
    trigger: '.skills-grid',
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.from('.skill-card', {
        y: 28,
        opacity: 0,
        stagger: 0.12,
        duration: 0.75,
        ease: 'power2.out'
      });
    }
  });

  // 7. Contact Box Scale In
  gsap.from('.contact-box', {
    scrollTrigger: {
      trigger: '#contact',
      start: 'top 82%',
      toggleActions: 'play none none none'
    },
    scale: 0.95,
    y: 25,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out'
  });
}

/* ==========================================================================
   3. RESTRAINED MAGNETIC BUTTON HOVER EFFECT
   ========================================================================== */
function initMagneticButtons() {
  // Only enable on desktop mouse/fine pointer
  if (!window.matchMedia('(pointer: fine)').matches || window.innerWidth < 1024) return;

  const buttons = document.querySelectorAll('.btn-primary, .btn-fiverr, .status-badge');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.2,
        y: y * 0.2,
        duration: 0.25,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.45,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });
}
