import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(18, 7, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// Lights

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( ambientLight );

const spotLight = new THREE.SpotLight( 0xffffff, 0.7 );
spotLight.position.set( 2, 12, 2 );
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.decay = 1;
spotLight.distance = 0;

spotLight.castShadow = true;
spotLight.shadow.bias = -0.001;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 60;
spotLight.shadow.focus = 1;

scene.add( spotLight );
scene.add( spotLight.target );

const planeGeometry = new THREE.PlaneGeometry( 100, 100 );
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xbcbcbc });

let accel = 0.01;

// Plane

const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add( plane );

// Importing the billy model

let billy;
let mixer;
const loader = new GLTFLoader();
loader.load('assets/billy_on_bike/scene.gltf', function (gltf) {
  billy = gltf.scene;
  billy.scale.set(2, 0.6, 1);

  billy.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  mixer = new THREE.AnimationMixer( billy );
  const action = mixer.clipAction(gltf.animations[0]); // get the first (and only) animation
  action.play();

  scene.add(billy);
});

// Animation

function animate() {
  requestAnimationFrame( animate );
  renderer.render( scene, camera );
  
  if (mixer) mixer.update(0.01);

  if (billy) {
    billy.position.x -= accel * Math.sin(billy.rotation.y) * -1;
    billy.position.z += accel * Math.cos(billy.rotation.y);

    if (Math.abs(billy.position.x) > 30 || Math.abs(billy.position.z) > 30) {
      billy.position.set(0, 0, 0);
    }
    
    spotLight.target = billy;
  }
}
animate();

// Keyboard controls

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'a':
      billy.rotation.y += 0.05;
      break;
    case 'd':
      billy.rotation.y -= 0.05;
      break;
    case 'c':
      spotLight.color.setHex(Math.random() * 0xffffff);
      break;
    case 'r':
      billy.position.set(0, 0, 0);
      billy.rotation.set(0, 0, 0);
      accel = 0.01;
      break;
    case 'w':
      accel += 0.001;
      break;
    case 's':
      accel -= 0.001;
      break;
  }
});

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}, false);