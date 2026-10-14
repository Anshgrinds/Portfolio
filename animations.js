/**
 * Ansh Jha Portfolio — GSAP & Three.js Animation Engine
 * High-performance 3D WebGL background + cinematic GSAP ScrollTrigger orchestration
 */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure GSAP and Three.js are available
  if (typeof THREE !== 'undefined') {
    initThreeJSHero();
  }
  
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    initGSAPAnimations();
    initMagneticButtons();
    init3DCardParallax();
  }
});

/* ==========================================================================
   1. THREE.JS INTERACTIVE 3D HERO CANVAS
   ========================================================================== */
function initThreeJSHero() {
  const canvas = document.getElementById('hero-three-canvas');
  const heroSection = document.getElementById('home');
  if (!canvas || !heroSection) return;

  // Scene, Camera, Renderer
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, heroSection.clientWidth / heroSection.clientHeight, 0.1, 1000);
  camera.position.z = 24;

  const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(heroSection.clientWidth, heroSection.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const emeraldLight = new THREE.PointLight(0x10b981, 3.2, 50);
  emeraldLight.position.set(10, 8, 12);
  scene.add(emeraldLight);

  const cyanLight = new THREE.PointLight(0x38bdf8, 2.8, 50);
  cyanLight.position.set(-12, -8, 8);
  scene.add(cyanLight);

  // 3D Geometry: Futuristic Wireframe Icosahedron & Inner Core
  const icosaGroup = new THREE.Group();
  
  // Outer Wireframe Lattice
  const outerGeom = new THREE.IcosahedronGeometry(7.5, 2);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x52525b,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
    roughness: 0.2,
    metalness: 0.8
  });
  const outerMesh = new THREE.Mesh(outerGeom, outerMat);
  icosaGroup.add(outerMesh);

  // Inner Solid Core with Fresnel glow
  const innerGeom = new THREE.IcosahedronGeometry(4.2, 1);
  const innerMat = new THREE.MeshStandardMaterial({
    color: 0x18181b,
    emissive: 0x064e3b,
    emissiveIntensity: 0.45,
    roughness: 0.3,
    metalness: 0.7,
    flatShading: true
  });
  const innerMesh = new THREE.Mesh(innerGeom, innerMat);
  icosaGroup.add(innerMesh);

  // Floating Constellation Particle Field
  const particleCount = 280;
  const particleGeom = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleScales = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const r = THREE.MathUtils.randFloat(8, 28);
    const theta = THREE.MathUtils.randFloat(0, Math.PI * 2);
    const phi = THREE.MathUtils.randFloat(0, Math.PI);

    particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    particlePositions[i * 3 + 2] = r * Math.cos(phi);
    particleScales[i] = THREE.MathUtils.randFloat(0.5, 2.2);
  }

  particleGeom.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleGeom.setAttribute('scale', new THREE.BufferAttribute(particleScales, 1));

  const particleMat = new THREE.PointsMaterial({
    color: 0xa1a1aa,
    size: 0.12,
    transparent: true,
    opacity: 0.55
  });
  const particleSystem = new THREE.Points(particleGeom, particleMat);
  scene.add(particleSystem);

  // Center position biased slightly to the right behind hero image
  icosaGroup.position.set(7.5, 0.5, -4);
  scene.add(icosaGroup);

  // Mouse Interactivity with smooth lerping
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    targetMouseX = x * 1.8;
    targetMouseY = y * 1.8;
  }, { passive: true });

  // Responsive Resize
  window.addEventListener('resize', () => {
    const w = heroSection.clientWidth;
    const h = heroSection.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Mobile layout adjustment
    if (w < 768) {
      icosaGroup.position.set(0, -3, -8);
      icosaGroup.scale.set(0.7, 0.7, 0.7);
    } else {
      icosaGroup.position.set(7.5, 0.5, -4);
      icosaGroup.scale.set(1, 1, 1);
    }
  });

  if (heroSection.clientWidth < 768) {
    icosaGroup.position.set(0, -3, -8);
    icosaGroup.scale.set(0.7, 0.7, 0.7);
  }

  // Animation Loop with Visibility Optimization
  let isVisible = true;
  const observer = new IntersectionObserver((entries) => {
    isVisible = entries[0].isIntersecting;
  }, { threshold: 0.05 });
  observer.observe(heroSection);

  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    if (!isVisible) return;

    const elapsedTime = clock.getElapsedTime();

    // Lerp mouse
    currentMouseX += (targetMouseX - currentMouseX) * 0.05;
    currentMouseY += (targetMouseY - currentMouseY) * 0.05;

    // Rotate 3D Geometry
    icosaGroup.rotation.y = elapsedTime * 0.18 + currentMouseX * 0.35;
    icosaGroup.rotation.x = elapsedTime * 0.12 + currentMouseY * 0.35;
    innerMesh.rotation.y = -elapsedTime * 0.28;
    innerMesh.rotation.z = elapsedTime * 0.15;

    // Orbit point lights
    emeraldLight.position.x = Math.sin(elapsedTime * 0.8) * 14 + 5;
    emeraldLight.position.y = Math.cos(elapsedTime * 0.6) * 10;
    cyanLight.position.x = -Math.cos(elapsedTime * 0.7) * 14;
    cyanLight.position.z = Math.sin(elapsedTime * 0.5) * 10;

    // Particle field gentle drift
    particleSystem.rotation.y = elapsedTime * 0.04;
    particleSystem.rotation.x = Math.sin(elapsedTime * 0.03) * 0.1;

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
      y: -25,
      opacity: 0,
      duration: 0.85,
      delay: 0.15
    })
    .from('.status-badge', {
      scale: 0.82,
      opacity: 0,
      duration: 0.6,
      ease: 'back.out(1.7)'
    }, '-=0.4')
    .from('.hero-title', {
      y: 35,
      opacity: 0,
      duration: 0.9
    }, '-=0.35')
    .from('.hero-desc', {
      y: 25,
      opacity: 0,
      duration: 0.75
    }, '-=0.55')
    .from('.hero-actions .btn', {
      y: 20,
      opacity: 0,
      stagger: 0.1,
      duration: 0.6
    }, '-=0.45')
    .from('.portrait-wrapper', {
      scale: 0.92,
      y: 30,
      opacity: 0,
      duration: 1.0,
      ease: 'power2.out'
    }, '-=0.85');

  // Gentle floating idle animation on portrait
  gsap.to('.portrait-wrapper', {
    y: '-=10',
    duration: 3.2,
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
          duration: 1.4,
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
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            num2.innerText = Math.floor(obj.val) + '+';
          }
        });
      }

      // Stagger items
      gsap.from('.metric-item', {
        y: 25,
        opacity: 0,
        stagger: 0.12,
        duration: 0.8,
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
      y: 30,
      opacity: 0,
      stagger: 0.12,
      duration: 0.75,
      ease: 'power2.out'
    });
  });

  // 4. Project Cards Stagger
  ScrollTrigger.batch('.project-card', {
    start: 'top 88%',
    once: true,
    onEnter: (batch) => {
      gsap.from(batch, {
        y: 45,
        opacity: 0,
        stagger: 0.09,
        duration: 0.75,
        ease: 'power2.out'
      });
    }
  });

  // 5. 3D Technical Breakdown Section
  ScrollTrigger.create({
    trigger: '#3d',
    start: 'top 75%',
    once: true,
    onEnter: () => {
      // Pulse animation on comparison slider handle to invite interaction
      gsap.fromTo('.comparison-slider', {
        scale: 1
      }, {
        scale: 1.25,
        duration: 0.5,
        repeat: 3,
        yoyo: true,
        ease: 'power1.inOut',
        delay: 0.3
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
        y: 35,
        opacity: 0,
        stagger: 0.14,
        duration: 0.8,
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
    scale: 0.94,
    y: 30,
    opacity: 0,
    duration: 0.85,
    ease: 'power2.out'
  });
}

/* ==========================================================================
   3. MAGNETIC BUTTON HOVER EFFECT
   ========================================================================== */
function initMagneticButtons() {
  if (window.innerWidth < 1024) return; // Desktop mouse only

  const buttons = document.querySelectorAll('.btn-primary, .btn-fiverr, .status-badge');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      gsap.to(btn, {
        x: x * 0.28,
        y: y * 0.28,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.4)'
      });
    });
  });
}

/* ==========================================================================
   4. 3D CARD PARALLAX TILT
   ========================================================================== */
function init3DCardParallax() {
  if (window.innerWidth < 1024) return;

  const cards = document.querySelectorAll('.project-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -4.5;
      const rotateY = ((x - centerX) / centerX) * 4.5;

      gsap.to(card, {
        rotationX: rotateX,
        rotationY: rotateY,
        transformPerspective: 900,
        duration: 0.35,
        ease: 'power1.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        rotationX: 0,
        rotationY: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    });
  });
}
