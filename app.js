(function() {
    // Set our main variables
    let scene,  
      renderer,
      camera,
      model,                              // Our character
      head,                               // Reference to the head bone in the skeleton
      chest,                               // Reference to the Upperchest bone in the skeleton
    //   possibleAnims,                      // Animations found in our file
      mixer,                              // THREE.js animations mixer
    //   idle,                               // Idle, the default state our character returns to
      clock = new THREE.Clock(),          // Used for anims, which run to a clock instead of frame rate 
      currentlyAnimating = false,         // Used to check whether characters neck is being used in another anim
      raycaster = new THREE.Raycaster(),  // Used to detect the click on our character
      loaderAnim = document.getElementById('js-loader');
      

      init(); 

function init() {

    /**
   * Set the scene  
   */

    const canvas = document.querySelector('#c')
    const backgroundColor = 0xf1f1f1;
    scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor)
    scene.fog = new THREE.Fog(backgroundColor, 60,100)

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

  /**
   * Import the model  
   */
    const MODEL_PATH = 'Hardin.glb'
    const loader = new THREE.GLTFLoader();


loader.load(
  MODEL_PATH,
  function(gltf) {
    loaderAnim.remove();
    mixer = new THREE.AnimationMixer(model);

   // A lot is going to happen here
   console.log(gltf)
   model = gltf.scene;

   model.traverse(o => {
    if (o.isBone) {
        //use the console log to find bones you want to move 
        console.log(o.name);
      }

       if (o.isMesh) {
           o.castShadow = true; 
           o.receiveShadow = true; 
       }

       //decide the bones you want to control
       if (o.isBone && o.name === 'head') { 
        head = o;
      }
      if (o.isBone && o.name === 'chestUpper') { 
        chest = o;
      }
   });


   model.scale.set(7,7,7)
   model.position.y=-11;
   scene.add(model)
  },
  undefined, // We don't need this function
  function(error) {
    console.error(error);
  }
);


/**
   * Camera
   */
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
    );

    camera.position.z = 30;
    camera.position.x = 0;
    camera.position.y = -3;


    /**
   *Lighting
   */
    let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    hemiLight.position.set(0,50,0);

    scene.add(hemiLight);

    let d = 8.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 0.54);
    dirLight.position.set(-8,12,8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024,1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    // Add directional Light to scene
    scene.add(dirLight);

    // Floor
let floorGeometry = new THREE.PlaneGeometry(5000, 5000, 1, 1);
let floorMaterial = new THREE.MeshPhongMaterial({
  color: 0xeeeeee,
  shininess: 0,
});

let floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
floor.receiveShadow = true;
floor.position.y = -11;
scene.add(floor);


}


function update() {
    if (mixer) {
        mixer.update(clock.getDelta());
      }
    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }
    renderer.render(scene, camera);
    requestAnimationFrame(update);
  }
  update();

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    let width = window.innerWidth;
    let height = window.innerHeight;
    let canvasPixelWidth = canvas.width / window.devicePixelRatio;
    let canvasPixelHeight = canvas.height / window.devicePixelRatio;
  
    const needResize =
      canvasPixelWidth !== width || canvasPixelHeight !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  //Listens for mouse movement, gets mouse position, then moves joints that have capped off
  // the angles they can move at. 
  document.addEventListener('mousemove', function(e){
    let mousecoords = getMousePos(e);
    if (head && chest) {
        //Here you can control which joints are being moved
        moveJoint(mousecoords, head, 50); 
        moveJoint(mousecoords, chest, 30);
    }
});

function getMousePos(e) {
    return {x: e.clientX, y: e.clientY};
}

function moveJoint(mouse, joint, degreeLimit) {
    let degrees = getMouseDegrees(mouse.x, mouse.y, degreeLimit);
    joint.rotation.y = THREE.Math.degToRad(degrees.x);
joint.rotation.x = THREE.Math.degToRad(degrees.y);
}

// Get mousedegrees function looks at the top, bottom, left, and right of the screen and tells you
// where the mouse is relative to the x and y axis
function getMouseDegrees(x, y, degreeLimit) {
    let dx = 0,
        dy = 0,
        xdiff,
        xPercentage,
        ydiff,
        yPercentage;
  
    let w = { x: window.innerWidth, y: window.innerHeight };
  
    // Left (Rotates neck left between 0 and -degreeLimit)
    
     // 1. If cursor is in the left half of screen
    if (x <= w.x / 2) {
      // 2. Get the difference between middle of screen and cursor position
      xdiff = w.x / 2 - x;  
      // 3. Find the percentage of that difference (percentage toward edge of screen)
      xPercentage = (xdiff / (w.x / 2)) * 100;
      // 4. Convert that to a percentage of the maximum rotation we allow for the neck
      dx = ((degreeLimit * xPercentage) / 100) * -1; }
  // Right (Rotates neck right between 0 and degreeLimit)
    if (x >= w.x / 2) {
      xdiff = x - w.x / 2;
      xPercentage = (xdiff / (w.x / 2)) * 100;
      dx = (degreeLimit * xPercentage) / 100;
    }
    // Up (Rotates neck up between 0 and -degreeLimit)
    if (y <= w.y / 2) {
      ydiff = w.y / 2 - y;
      yPercentage = (ydiff / (w.y / 2)) * 100;
      // Note that I cut degreeLimit in half when she looks up
      dy = (((degreeLimit * 0.5) * yPercentage) / 100) * -1;
      }
    
    // Down (Rotates neck down between 0 and degreeLimit)
    if (y >= w.y / 2) {
      ydiff = y - w.y / 2;
      yPercentage = (ydiff / (w.y / 2)) * 100;
      dy = (degreeLimit * yPercentage) / 100;
    }
    return { x: dx, y: dy };
  }


    
    })(); // Don't add anything below this line