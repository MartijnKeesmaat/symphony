function main() {
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

  	void main() {
  	gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
 	}

  varying vec2 vUv;

  void main() {
    mainImage(gl_FragColor, vUv * iResolution.xy);
  }
  `;
  const vertexShader = `
    uniform vec3 diffuse;
	void main() {
		gl_FragColor = vec4(diffuse.x, diffuse.y, diffuse.z, 1.0);
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

  function render(time) {
    time *= 0.001; // convert to seconds

    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    cubes.forEach((cube, ndx) => {
      const speed = 0.2 + ndx * 0.01;
      const rot = time * speed;
      cube.rotation.x = rot;
      cube.rotation.y = rot;
      cube.position.y = Math.cos(rot * 5);
    });

    uniforms.iTime.value = time;

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
