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
   1. THREE.JS INTERACTIVE 3D HERO GYROSCOPE & STELLAR FIELD
   ========================================================================== */
function initThreeJSHero() {
  const canvas = document.getElementById('hero-three-canvas');
  const heroSection = document.getElementById('home');
  if (!canvas || !heroSection) return;

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
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(0, 0, 24);

  // ------------------------------------------------------------------------
  // A. 3D GYROSCOPE CORE GROUP
  // ------------------------------------------------------------------------
  const gyroGroup = new THREE.Group();
  scene.add(gyroGroup);

  function updateGyroPosition() {
    if (window.innerWidth > 960) {
      gyroGroup.position.set(4.5, 0.6, 0);
    } else {
      gyroGroup.position.set(0, -0.5, -2);
    }
  }
  updateGyroPosition();

  // 1. Central Faceted Icosahedron (Solid PBR Core)
  const icoGeo = new THREE.IcosahedronGeometry(2.3, 1);
  const icoMat = new THREE.MeshStandardMaterial({
    color: 0x09090c,
    roughness: 0.15,
    metalness: 0.85,
    flatShading: true,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1
  });
  const icoMesh = new THREE.Mesh(icoGeo, icoMat);
  gyroGroup.add(icoMesh);

  // 2. Wireframe Lattice Overlay
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0x10b981,
    wireframe: true,
    transparent: true,
    opacity: 0.45
  });
  const wireMesh = new THREE.Mesh(icoGeo, wireMat);
  gyroGroup.add(wireMesh);

  // 3. Gimbal Ring 1: Cyan Orbit
  const ring1Geo = new THREE.TorusGeometry(3.6, 0.038, 16, 100);
  const ring1Mat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x38bdf8,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.9
  });
  const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
  gyroGroup.add(ring1);

  // 4. Gimbal Ring 2: Emerald Inclined Orbit
  const ring2Geo = new THREE.TorusGeometry(4.3, 0.038, 16, 100);
  const ring2Mat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x10b981,
    emissiveIntensity: 0.4,
    roughness: 0.2,
    metalness: 0.9
  });
  const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
  ring2.rotation.x = Math.PI / 3;
  gyroGroup.add(ring2);

  // 5. Gimbal Ring 3: Deep Slate Outer Horizon
  const ring3Geo = new THREE.TorusGeometry(5.0, 0.024, 16, 120);
  const ring3Mat = new THREE.MeshBasicMaterial({
    color: 0x71717a,
    transparent: true,
    opacity: 0.35
  });
  const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
  ring3.rotation.y = Math.PI / 4;
  gyroGroup.add(ring3);

  // 6. Orbiting Celestial Satellites
  const satellites = [];
  const satCount = 4;
  for (let s = 0; s < satCount; s++) {
    const satGeo = new THREE.OctahedronGeometry(0.22, 0);
    const satColor = s % 2 === 0 ? 0x10b981 : 0x38bdf8;
    const satMat = new THREE.MeshStandardMaterial({
      color: satColor,
      emissive: satColor,
      emissiveIntensity: 0.7,
      roughness: 0.15,
      metalness: 0.9
    });
    const satMesh = new THREE.Mesh(satGeo, satMat);
    gyroGroup.add(satMesh);
    satellites.push({
      mesh: satMesh,
      radius: s % 2 === 0 ? 3.6 : 4.3,
      speed: 0.7 + s * 0.25,
      offset: (s * Math.PI) / 2,
      axis: s % 2 === 0 ? 'ring1' : 'ring2'
    });
  }

  // ------------------------------------------------------------------------
  // B. 3D LIGHTS
  // ------------------------------------------------------------------------
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
  scene.add(ambientLight);

  const mouseLight = new THREE.PointLight(0x10b981, 3.2, 40);
  mouseLight.position.set(5, 5, 12);
  scene.add(mouseLight);

  const rimLight = new THREE.PointLight(0x38bdf8, 2.4, 35);
  rimLight.position.set(-14, -8, 8);
  scene.add(rimLight);

  // ------------------------------------------------------------------------
  // C. VOLUMETRIC BACKGROUND PARTICLE FIELD
  // ------------------------------------------------------------------------
  function createGlowDotTexture() {
    const c = document.createElement('canvas');
    c.width = 64;
    c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(16, 185, 129, 0.85)');
    grad.addColorStop(0.65, 'rgba(56, 189, 248, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(c);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  const particleTexture = createGlowDotTexture();
  const particleCount = 200;
  const positions = new Float32Array(particleCount * 3);
  const basePositions = [];
  const colors = new Float32Array(particleCount * 3);

  const emeraldColor = new THREE.Color(0x10b981);
  const cyanColor = new THREE.Color(0x38bdf8);
  const slateColor = new THREE.Color(0x71717a);

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 44;
    const y = (Math.random() - 0.5) * 26;
    const z = (Math.random() - 0.5) * 18 - 4;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
    basePositions.push({ x, y, z });

    const rnd = Math.random();
    const col = rnd < 0.45 ? emeraldColor : rnd < 0.75 ? slateColor : cyanColor;
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.65,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystem);

  // ------------------------------------------------------------------------
  // D. INTERACTION: CLICK & DRAG ROTATION WITH MOMENTUM
  // ------------------------------------------------------------------------
  let isDragging = false;
  let prevPointer = { x: 0, y: 0 };
  let angularVel = { x: 0.002, y: 0.004 };
  let mouseNorm = { x: 0, y: 0 };

  canvas.addEventListener('pointerdown', (e) => {
    isDragging = true;
    prevPointer = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('pointermove', (e) => {
    mouseNorm.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouseNorm.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Follow light in 3D
    mouseLight.position.x = mouseNorm.x * 16 + gyroGroup.position.x;
    mouseLight.position.y = mouseNorm.y * 10 + gyroGroup.position.y;
    mouseLight.position.z = 12;

    if (isDragging) {
      const deltaX = e.clientX - prevPointer.x;
      const deltaY = e.clientY - prevPointer.y;
      angularVel.y = deltaX * 0.006;
      angularVel.x = deltaY * 0.006;
      gyroGroup.rotation.y += angularVel.y;
      gyroGroup.rotation.x += angularVel.x;
      prevPointer = { x: e.clientX, y: e.clientY };
    }
  }, { passive: true });

  window.addEventListener('pointerup', () => {
    isDragging = false;
  });

  // Handle Resize
  function onResize() {
    width = Math.max(heroSection.clientWidth || window.innerWidth, 320);
    height = Math.max(heroSection.clientHeight || window.innerHeight, 320);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    updateGyroPosition();
  }
  window.addEventListener('resize', onResize, { passive: true });

  // Tab & Visibility Performance Sleep
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

    const time = clock.getElapsedTime();

    // Inertial rotation & friction damping
    if (!isDragging) {
      gyroGroup.rotation.y += angularVel.y;
      gyroGroup.rotation.x += angularVel.x;
      angularVel.y *= 0.965;
      angularVel.x *= 0.965;

      // Base idle drift
      gyroGroup.rotation.y += 0.003;
      gyroGroup.rotation.x += Math.sin(time * 0.5) * 0.001;
    }

    // Gimbal ring internal counter-rotations
    ring1.rotation.z = time * 0.4;
    ring2.rotation.z = -time * 0.35;
    ring3.rotation.z = time * 0.15;
    icoMesh.rotation.y = time * 0.15;
    wireMesh.rotation.y = time * 0.15;

    // Satellites orbiting
    satellites.forEach(s => {
      const angle = time * s.speed + s.offset;
      if (s.axis === 'ring1') {
        s.mesh.position.set(Math.cos(angle) * s.radius, Math.sin(angle) * s.radius, 0);
      } else {
        const x = Math.cos(angle) * s.radius;
        const y = Math.sin(angle) * s.radius * Math.cos(Math.PI / 3);
        const z = Math.sin(angle) * s.radius * Math.sin(Math.PI / 3);
        s.mesh.position.set(x, y, z);
      }
      s.mesh.rotation.x += 0.03;
      s.mesh.rotation.y += 0.04;
    });

    // Organic wave pulsation on particle cloud
    const posArr = particleGeometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const base = basePositions[i];
      posArr[i3 + 1] = base.y + Math.sin(time * 0.6 + base.x * 0.2) * 0.45;
      posArr[i3] = base.x + Math.cos(time * 0.4 + base.y * 0.2) * 0.25;
    }
    particleGeometry.attributes.position.needsUpdate = true;

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
    .from('.hero-3d-hint', {
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

  const buttons = document.querySelectorAll('.btn-primary, .btn-fiverr, .status-badge, .hero-3d-hint');

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
