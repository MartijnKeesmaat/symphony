const canvas = document.querySelector('#c');
const renderer = new THREE.WebGLRenderer({ canvas });

const fov = 75;
const aspect = 2; // the canvas default
const near = 0.1;
const far = 5;
const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.z = 2;

const scene = new THREE.Scene();
const boxWidth = 1;
const boxHeight = 1;
const boxDepth = 1;
const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
const fragmentShader = `
  #include <common>

  uniform vec3 iResolution;
  uniform float iTime;
  uniform sampler2D iChannel0;

  // By Daedelus: https://www.shadertoy.com/user/Daedelus
  // license: Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.
  #define TIMESCALE 0.25 
  #define TILES 2
  #define COLOR 0.7, 1.6, 2.8

  void mainImage( out vec4 fragColor, in vec2 fragCoord )
  {
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv.x *= iResolution.x / iResolution.y;
    
    vec4 noise = texture2D(iChannel0, floor(uv * float(TILES)) / float(TILES));
    float p = 1.0 - mod(noise.r + noise.g + noise.b + iTime * float(TIMESCALE), 1.0);
    p = min(max(p * 3.0 - 1.8, 0.1), 2.0);
    
    vec2 r = mod(uv * float(TILES), 1.0);
    r = vec2(pow(r.x - 0.5, 2.0), pow(r.y - 0.5, 2.0));
    p *= 1.0 - pow(min(1.0, 12.0 * dot(r, r)), 2.0);
    
    fragColor = vec4(COLOR, 1.0) * p;
  }

  varying vec2 vUv;

  void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
  }
  `;
const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `;

const loader = new THREE.TextureLoader();
const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/bayer.png');
texture.minFilter = THREE.NearestFilter;
texture.magFilter = THREE.NearestFilter;
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
const uniforms = {
  iTime: { value: 0 },
  iResolution: { value: new THREE.Vector3(1, 1, 1) },
  iChannel0: { value: texture }
};
const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms
});
function makeInstance(geometry, x) {
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  cube.position.x = x;

  return cube;
}

const cubes = [makeInstance(geometry, 0), makeInstance(geometry, -2), makeInstance(geometry, 2)];

function resizeRendererToDisplaySize(renderer) {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
  }
  return needResize;
}

let speedSpeed = 1;

function render(time) {
  if (resizeRendererToDisplaySize(renderer)) {
    const canvas = renderer.domElement;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  time *= 0.001; // convert to seconds
  cubes.forEach((cube, ndx) => {
    const speed = 0.2 + ndx * 0.01;
    const rot = time * speed;
    cube.rotation.x = rot * (speedSpeed * 0.05);
    cube.rotation.y = rot * (speedSpeed * 0.05);
    cube.position.y = Math.cos(rot * 5);
  });
  uniforms.iTime.value = time;
  // if (!animating) {
  // }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
function onMouseMove(e) {
  e.preventDefault();

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  // update the picking ray with the camera and mouse position
  raycaster.setFromCamera(mouse, camera);

  // calculate objects intersecting the picking ray
  const intersects = raycaster.intersectObjects(scene.children);
  // if (intersects.length > 0) animating = true;
  // else animating = false;

  for (var i = 0; i < intersects.length; i++) {
    speedSpeed++;
    // intersects[i].object.rotation.x += 0.03;
    // console.log(intersects[i].object.rotation.x);
  }
  // intersects.object.rotation.x = 0;

  // for (let i = 0; i < intersects.length; i++) {
  //   // intersects[i].object.material.color.set(0xff0000);
  //   this.tl = new TimelineMax();
  //   this.tl.to(intersects[i].object.scale, 1, { x: 2, ease: Expo.easeOut });
  //   this.tl.to(intersects[i].object.scale, 0.5, { x: 0.5, ease: Expo.easeOut });
  //   // this.tl.to(intersects[i].object.rotation, 0.5, { y: Math.PI * 0.5, ease: Expo.easeOut }, '=-1.5');
  // }
}

window.addEventListener('mousemove', onMouseMove);
