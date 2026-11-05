/**
 * Ansh Jha Portfolio — High-Performance 3D WebGL & GSAP Engine
 * Features:
 * 1. Interactive 3D Holographic Gyroscope Core & Volumetric Galaxy (Three.js WebGL)
 * 2. Live Interactive 3D Procedural Mesh & Shader Lab (Three.js PBR)
 * 3. Real-Time 3D Perspective Card Tilt with Specular Sheen (Apple / Linear style)
 * 4. Spatial Ambient Glow Light Follower
 * 5. Silky GSAP ScrollTrigger & Magnetic Micro-Interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Three.js 3D Interactive Hero
  if (typeof THREE !== 'undefined') {
    initThreeJSHero();
    initThreeJSLab();
  }

  // 2. Initialize 3D Spatial UI & Card Tilt
  init3DCardTilt();
  initSpatialAmbientGlow();

  // 3. Initialize GSAP & ScrollTrigger Animations
  if (typeof gsap !== 'undefined') {
    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }
    initGSAPAnimations();
    initMagneticButtons();
  }
});

/* ==========================================================================
   1. THREE.JS INTERACTIVE 3D HERO CANVAS (WIREFRAME ICOSAHEDRON & CORE)
   ========================================================================== */
function initThreeJSHero() {
  const canvas = document.getElementById('hero-three-canvas');
  const heroSection = document.getElementById('home');
  if (!canvas || !heroSection) return;

  // Safe dimensions
  let width = Math.max(heroSection.clientWidth || window.innerWidth, 320);
  let height = Math.max(heroSection.clientHeight || window.innerHeight, 320);

  // WebGL Renderer
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.warn('WebGL not supported:', err);
    return;
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  // Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
  camera.position.z = 24;

  // Orbiting dynamic point lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
  scene.add(ambientLight);

  const emeraldLight = new THREE.PointLight(0x10b981, 3.4, 50);
  emeraldLight.position.set(10, 8, 12);
  scene.add(emeraldLight);

  const cyanLight = new THREE.PointLight(0x38bdf8, 2.8, 50);
  cyanLight.position.set(-12, -8, 8);
  scene.add(cyanLight);

  // 3D Geometry: Futuristic Wireframe Icosahedron & Glowing Inner Core
  const icosaGroup = new THREE.Group();

  // Outer Wireframe Lattice
  const outerGeom = new THREE.IcosahedronGeometry(7.5, 2);
  const outerMat = new THREE.MeshStandardMaterial({
    color: 0x52525b,
    wireframe: true,
    transparent: true,
    opacity: 0.32,
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
    emissiveIntensity: 0.55,
    roughness: 0.25,
    metalness: 0.75,
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
    size: 0.14,
    transparent: true,
    opacity: 0.55
  });
  const particleSystem = new THREE.Points(particleGeom, particleMat);
  scene.add(particleSystem);

  // Positioned directly behind the profile picture (pfp)
  function updateIcosaPosition() {
    if (window.innerWidth < 768) {
      icosaGroup.position.set(0, -3, -8);
      icosaGroup.scale.set(0.7, 0.7, 0.7);
    } else {
      icosaGroup.position.set(7.5, 0.5, -4);
      icosaGroup.scale.set(1, 1, 1);
    }
  }
  updateIcosaPosition();
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

  // Handle Resize
  function onResize() {
    width = Math.max(heroSection.clientWidth || window.innerWidth, 320);
    height = Math.max(heroSection.clientHeight || window.innerHeight, 320);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    updateIcosaPosition();
  }
  window.addEventListener('resize', onResize, { passive: true });

  // Performance: Pause when offscreen or hidden
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
   2. THREE.JS INTERACTIVE 3D WEBGL SHADER & MESH LAB
   ========================================================================== */
function initThreeJSLab() {
  const canvas = document.getElementById('weblab-canvas');
  const container = document.querySelector('.weblab-container');
  if (!canvas || !container) return;

  let width = container.clientWidth || 600;
  let height = container.clientHeight || 480;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (err) {
    console.warn('WebGL lab initialization error:', err);
    return;
  }

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 11);

  // Lighting Suite
  const ambient = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
  dirLight.position.set(6, 12, 8);
  scene.add(dirLight);

  const greenLight = new THREE.PointLight(0x10b981, 3.0, 30);
  greenLight.position.set(-8, -6, 6);
  scene.add(greenLight);

  const blueLight = new THREE.PointLight(0x38bdf8, 2.5, 30);
  blueLight.position.set(8, -6, 6);
  scene.add(blueLight);

  // Geometries Library
  const geoKnot = new THREE.TorusKnotGeometry(2.3, 0.65, 128, 32, 2, 3); // 4,096 verts
  const geoCrystal = new THREE.IcosahedronGeometry(2.9, 1);               // 1,280 verts
  const geoPoly = new THREE.OctahedronGeometry(3.1, 2);                  // 2,560 verts
  const geometries = [
    { geo: geoKnot, name: 'TORUS KNOT', verts: '4,096' },
    { geo: geoCrystal, name: 'CYBER CRYSTAL', verts: '1,280' },
    { geo: geoPoly, name: 'OCTAHEDRON', verts: '2,560' }
  ];
  let currentGeoIndex = 0;

  // Shader Materials Library
  const materials = {
    chrome: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.08,
      flatShading: false
    }),
    emerald: new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x047857,
      emissiveIntensity: 0.45,
      roughness: 0.15,
      metalness: 0.85,
      flatShading: true
    }),
    wireframe: new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true
    }),
    magma: new THREE.MeshStandardMaterial({
      color: 0x18181b,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.55,
      roughness: 0.85,
      metalness: 0.25,
      flatShading: true
    })
  };
  let activeShaderKey = 'chrome';

  // Mesh Setup
  const meshGroup = new THREE.Group();
  scene.add(meshGroup);

  const mainMesh = new THREE.Mesh(geometries[0].geo, materials[activeShaderKey]);
  meshGroup.add(mainMesh);

  // Wireframe Overlay mesh
  const wireOverlayMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    wireframe: true,
    transparent: true,
    opacity: 0.35,
    visible: false
  });
  const wireOverlayMesh = new THREE.Mesh(geometries[0].geo, wireOverlayMat);
  meshGroup.add(wireOverlayMesh);

  // HUD Elements
  const polyHud = document.getElementById('weblab-polycount');
  const fpsHud = document.getElementById('weblab-fps');
  if (polyHud) polyHud.textContent = `VERTICES: ${geometries[0].verts}`;

  // Interactive Orbit Controls
  let isDraggingLab = false;
  let prevLabPointer = { x: 0, y: 0 };
  let labAngularVel = { x: 0, y: 0 };
  let autoRotate = true;

  canvas.addEventListener('pointerdown', (e) => {
    isDraggingLab = true;
    prevLabPointer = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('pointermove', (e) => {
    if (!isDraggingLab) return;
    const deltaX = e.clientX - prevLabPointer.x;
    const deltaY = e.clientY - prevLabPointer.y;
    labAngularVel.y = deltaX * 0.007;
    labAngularVel.x = deltaY * 0.007;
    meshGroup.rotation.y += labAngularVel.y;
    meshGroup.rotation.x += labAngularVel.x;
    prevLabPointer = { x: e.clientX, y: e.clientY };
  }, { passive: true });

  window.addEventListener('pointerup', () => {
    isDraggingLab = false;
  });

  // Scroll to zoom
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    camera.position.z += e.deltaY * 0.008;
    camera.position.z = Math.max(7, Math.min(18, camera.position.z));
  }, { passive: false });

  // Shader Preset Buttons
  const shaderBtns = document.querySelectorAll('.shader-btn[data-shader]');
  shaderBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      shaderBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeShaderKey = btn.getAttribute('data-shader');
      if (materials[activeShaderKey]) {
        mainMesh.material = materials[activeShaderKey];
      }
    });
  });

  // Toggle Wireframe Button
  const wireBtn = document.getElementById('btn-toggle-wire');
  let wireActive = false;
  if (wireBtn) {
    wireBtn.addEventListener('click', () => {
      wireActive = !wireActive;
      wireOverlayMat.visible = wireActive;
      wireBtn.classList.toggle('active', wireActive);
      wireBtn.textContent = `📐 Wireframe: ${wireActive ? 'ON' : 'OFF'}`;
    });
  }

  // Toggle Auto-Rotate Button
  const rotateBtn = document.getElementById('btn-toggle-rotate');
  if (rotateBtn) {
    rotateBtn.addEventListener('click', () => {
      autoRotate = !autoRotate;
      rotateBtn.classList.toggle('active', autoRotate);
      rotateBtn.textContent = `🔄 Auto-Rotate: ${autoRotate ? 'ON' : 'OFF'}`;
    });
  }

  // Switch Mesh Button
  const switchMeshBtn = document.getElementById('btn-switch-mesh');
  if (switchMeshBtn) {
    switchMeshBtn.addEventListener('click', () => {
      currentGeoIndex = (currentGeoIndex + 1) % geometries.length;
      const targetGeo = geometries[currentGeoIndex];
      mainMesh.geometry = targetGeo.geo;
      wireOverlayMesh.geometry = targetGeo.geo;
      if (polyHud) polyHud.textContent = `VERTICES: ${targetGeo.verts}`;
    });
  }

  // Reset Camera View Button
  const resetBtn = document.getElementById('btn-reset-cam');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (typeof gsap !== 'undefined') {
        gsap.to(camera.position, { z: 11, duration: 0.5, ease: 'power2.out' });
        gsap.to(meshGroup.rotation, { x: 0, y: 0, duration: 0.6, ease: 'power2.out' });
      } else {
        camera.position.z = 11;
        meshGroup.rotation.set(0, 0, 0);
      }
    });
  }

  // Handle Resize safely
  function resizeLab() {
    if (!container) return;
    width = container.clientWidth || 600;
    height = container.clientHeight || 480;
    if (width <= 0 || height <= 0) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  }
  window.addEventListener('resize', resizeLab, { passive: true });

  // Hook into tab switches so it resizes when weblab is activated
  const weblabTabBtn = document.getElementById('tab-btn-weblab');
  if (weblabTabBtn) {
    weblabTabBtn.addEventListener('click', () => {
      setTimeout(resizeLab, 50);
    });
  }

  // Render Loop & FPS Monitor
  let frameCount = 0;
  let lastTime = performance.now();
  let isLabVisible = false;

  const labObserver = new IntersectionObserver((entries) => {
    isLabVisible = entries[0].isIntersecting;
  }, { threshold: 0.05 });
  labObserver.observe(container);

  function animateLab() {
    requestAnimationFrame(animateLab);
    if (!isLabVisible || document.hidden) return;

    // Auto rotate and momentum
    if (autoRotate && !isDraggingLab) {
      meshGroup.rotation.y += 0.01;
      meshGroup.rotation.x += 0.005;
    } else if (!isDraggingLab) {
      meshGroup.rotation.y += labAngularVel.y;
      meshGroup.rotation.x += labAngularVel.x;
      labAngularVel.y *= 0.95;
      labAngularVel.x *= 0.95;
    }

    renderer.render(scene, camera);

    // Compute FPS
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / (now - lastTime));
      if (fpsHud) fpsHud.textContent = `${fps} FPS`;
      frameCount = 0;
      lastTime = now;
    }
  }

  animateLab();
}

/* ==========================================================================
   3. REAL-TIME 3D SPATIAL CARD TILT WITH SPECULAR SHEEN
   ========================================================================== */
function init3DCardTilt() {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const tiltTargets = document.querySelectorAll('.project-card, .skill-card, .metric-item, .contact-box, .portrait-wrapper');

  tiltTargets.forEach(card => {
    let sheen = card.querySelector('.card-3d-sheen');
    if (!sheen) {
      sheen = document.createElement('div');
      sheen.className = 'card-3d-sheen';
      card.appendChild(sheen);
    }

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease-out, box-shadow 0.25s ease';
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      const maxTilt = 8.5; // subtle, luxurious angle
      const tiltX = -percentY * maxTilt;
      const tiltY = percentX * maxTilt;

      card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      // Specular sheen radial gradient
      sheen.style.background = `radial-gradient(circle 280px at ${x}px ${y}px, rgba(16, 185, 129, 0.18), rgba(56, 189, 248, 0.06) 45%, transparent 70%)`;
      sheen.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.45s ease';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      sheen.style.opacity = '0';
    });
  });
}

/* ==========================================================================
   4. SPATIAL AMBIENT GLOW LIGHT FOLLOWER
   ========================================================================== */
function initSpatialAmbientGlow() {
  const glow = document.getElementById('spatial-ambient-glow');
  if (!glow || !window.matchMedia('(pointer: fine)').matches) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let currentX = mouseX;
  let currentY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function renderGlow() {
    currentX += (mouseX - currentX) * 0.055;
    currentY += (mouseY - currentY) * 0.055;
    glow.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(renderGlow);
  }
  renderGlow();
}

/* ==========================================================================
   5. GSAP & SCROLLTRIGGER ORCHESTRATION
   ========================================================================== */
function initGSAPAnimations() {
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

  // Metrics Counter Animation
  ScrollTrigger.create({
    trigger: '.metrics-section',
    start: 'top 85%',
    once: true,
    onEnter: () => {
      const num1 = document.querySelectorAll('.metric-num')[0];
      if (num1) {
        gsap.fromTo(num1, { innerText: 0 }, {
          innerText: 5,
          duration: 1.2,
          ease: 'power2.out',
          snap: { innerText: 1 }
        });
      }

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

      gsap.from('.metric-item', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power2.out'
      });
    }
  });

  // Section Header Reveals
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

  // Project Cards Stagger
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
          gsap.set(batch, { clearProps: 'opacity' });
        }
      });
    }
  });

  // 3D Technical Breakdown Pulse
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

  // Skills Grid Stagger
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

  // Contact Box Reveal
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
   6. MAGNETIC BUTTON HOVER EFFECT
   ========================================================================== */
function initMagneticButtons() {
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
