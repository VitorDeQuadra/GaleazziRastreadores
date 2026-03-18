/* ═══════════════════════════════════════════
   satellite.js — GLB no Hero (ES Module)
═══════════════════════════════════════════ */

import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

var container = document.getElementById('three-container');
if (container) {

  function getSize() {
    return {
      w: container.offsetWidth  || container.parentElement.offsetWidth  || 500,
      h: container.offsetHeight || 500
    };
  }

  var size = getSize();
  /* Renderiza em 160% do container para preencher o canvas expandido via CSS */
  var SCALE = 1.6;

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, size.w / size.h, 0.1, 1000);
  camera.position.set(0, 0, 4.8);

  var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping         = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;
  renderer.setSize(size.w * SCALE, size.h * SCALE);
  container.appendChild(renderer.domElement);

  renderer.domElement.style.width  = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';

  scene.add(new THREE.AmbientLight(0xffffff, 6));

  var keyLight = new THREE.DirectionalLight(0xfff4e0, 8);
  keyLight.position.set(5, 8, 5);
  scene.add(keyLight);

  var fillLight = new THREE.DirectionalLight(0xd0e8ff, 6);
  fillLight.position.set(-5, 2, 3);
  scene.add(fillLight);

  var rimLight = new THREE.PointLight(0xe8950a, 3.5, 28);
  rimLight.position.set(3, -3, -3);
  scene.add(rimLight);

  var topLight = new THREE.DirectionalLight(0xffffff, 4);
  topLight.position.set(0, 10, 2);
  scene.add(topLight);

  // Luz lateral para iluminar os painéis solares
  var panelLight = new THREE.DirectionalLight(0xc0c0c0, 10);
  panelLight.position.set(10, 0, 2);
  scene.add(panelLight);

  var panelLight2 = new THREE.DirectionalLight(0xc0c0c0, 10);
  panelLight2.position.set(-10, 0, 2);
  scene.add(panelLight2);

  var starPos = new Float32Array(400 * 3);
  for (var i = 0; i < starPos.length; i++) starPos[i] = (Math.random() - 0.5) * 36;
  var starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  var stars = new THREE.Points(starGeo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.05, transparent: true, opacity: 0.6 }));
  scene.add(stars);

  var satellite = null;
  var loader = new GLTFLoader();

  loader.load(
    'assets/satelite/space_satellite.glb',
    function(gltf) {
      satellite = gltf.scene;
      var box    = new THREE.Box3().setFromObject(satellite);
      var center = box.getCenter(new THREE.Vector3());
      var size3  = box.getSize(new THREE.Vector3()).length();
      satellite.position.sub(center);
      satellite.scale.setScalar(3.0 / size3);
      satellite.rotation.z = 0.6;
      satellite.rotation.x = 0.18;
      scene.add(satellite);
      satellite.rotation.y = Math.PI * 2;
      var t = 0;
      var appear = setInterval(function() {
        t = Math.min(t + 0.014, 1);
        satellite.rotation.y = Math.PI * 2 * (1 - (1 - Math.pow(1 - t, 3)));
        if (t >= 1) clearInterval(appear);
      }, 16);
      window.dispatchEvent(new CustomEvent('satellite:ready'));
    },
    function(xhr) {
      if (xhr.total) console.log('Satelite: ' + Math.round(xhr.loaded / xhr.total * 100) + '%');
    },
    function(err) {
      console.warn('GLB erro, usando fallback:', err.message || err);
      var group = new THREE.Group();
      var bodyMat  = new THREE.MeshStandardMaterial({ color: 0x1a3558, metalness: 0.88, roughness: 0.15, emissive: 0x001122, emissiveIntensity: 0.25 });
      var goldMat  = new THREE.MeshStandardMaterial({ color: 0xe8950a, metalness: 0.95, roughness: 0.08, emissive: 0x3d2500, emissiveIntensity: 0.3 });
      var panelMat = new THREE.MeshStandardMaterial({ color: 0x0a3d6f, metalness: 0.9, roughness: 0.12, emissive: 0x001a44, emissiveIntensity: 0.3 });
      group.add(new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.5, 0.5), bodyMat));
      [-1.0, 1.0].forEach(function(x) {
        var panel = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.6), panelMat);
        panel.position.set(x, 0, 0);
        group.add(panel);
        var wire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.9, 0.062, 0.6)), new THREE.LineBasicMaterial({ color: 0x1a5080 }));
        wire.position.set(x, 0, 0);
        group.add(wire);
      });
      var dish = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.05, 0.1, 20, 1, true), goldMat);
      dish.position.set(0, 0.42, 0);
      group.add(dish);
      var haste = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.35, 8), goldMat);
      haste.position.y = 0.22;
      group.add(haste);
      satellite = group;
      scene.add(satellite);
      console.log('Fallback procedural criado.');
      
    }
  );

  var tiltX = 0, tiltY = 0;
  container.addEventListener('mousemove', function(e) {
    var r = container.getBoundingClientRect();
    tiltY =  ((e.clientX - r.left) / r.width  - 0.5) * 0.35;
    tiltX = -((e.clientY - r.top)  / r.height - 0.5) * 0.28;
  });

  window.addEventListener('resize', function() {
    var s = getSize();
    camera.aspect = s.w / s.h;
    camera.updateProjectionMatrix();
    renderer.setSize(s.w * SCALE, s.h * SCALE);
  });

  var frame = 0;
  (function render() {
    requestAnimationFrame(render);
    frame += 0.007;
    if (satellite) {
      satellite.rotation.y += 0.004;
      satellite.rotation.x += (tiltX + 0.18 - satellite.rotation.x) * 0.06;
      satellite.rotation.z  = -0.6 + Math.sin(frame * 0.6) * 0.12;
      satellite.position.y  = Math.sin(frame) * 0.18;
      satellite.position.x  = Math.sin(frame * 0.4) * 0.25;
    }
    rimLight.intensity = 1.5 + Math.sin(frame * 1.4) * 0.4;
    stars.rotation.y  += 0.0005;
    renderer.render(scene, camera);
  })();

  console.log('satellite.js iniciado.');
}