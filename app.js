
(function () {
  // Set our main variables
  let scene,
    renderer,
    camera,
    model,                              // Our character
    head,                               // Reference to the head bone in the skeleton
    chest,                               // Reference to the Upperchest bone in the skeleton
    possibleAnims,                      // Animations found in our file
    mixer,                              // THREE.js animations mixer
    idle,                               // Idle, the default state our character returns to
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
    // const backgroundColor = textures;
    scene = new THREE.Scene();
    // scene.background = new THREE.Color(backgroundColor)
    // scene.fog = new THREE.Fog(0xdeb773, 1, 100)
    const loaders = new THREE.CubeTextureLoader();
    const textures = loaders.load([
      './resources/posx.jpg',
      './resources/negx.jpg',
      './resources/posy.jpg',
      './resources/negy.jpg',
      './resources/posz.jpg',
      './resources/negz.jpg',
    ]);
    scene.background = textures;


    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.shadowMap.enabled = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    /**
     * Import the Hardin Model  
     */
    // const MODEL_PATH = 'Hardin.glb'
    const MODEL_PATH = 'Hardin_Final_V1.glb'
    const loader = new THREE.GLTFLoader();
    loader.load(
      MODEL_PATH,
      function (gltf) {
        model = gltf.scene;

        let fileAnimations = gltf.animations

        loaderAnim.remove();

        mixer = new THREE.AnimationMixer(model);

        let clips = fileAnimations.filter(val => val.name !== 'idle');

        possibleAnims = clips.map(val => {
          let clip = THREE.AnimationClip.findByName(clips, val.name);
          clip.tracks.splice(3, 3);
          clip.tracks.splice(9, 3);
          clip = mixer.clipAction(clip);
          return clip;
        }
        );


        const idleAnim = THREE.AnimationClip.findByName(fileAnimations, 'idle');


        idleAnim.tracks.splice(3, 3);
        idleAnim.tracks.splice(12, 3);

        idle = mixer.clipAction(idleAnim);

        idle.play()


        // A lot is going to happen here
        // console.log(gltf)


        model.traverse(o => {
          if (o.isBone) {
            //use the console log to find bones you want to move 
            // console.log(o.name);
          }

          if (o.isMesh) {
            o.castShadow = true;
            o.receiveShadow = true;
          }

          //decide the bones you want to control
          if (o.isBone && o.name === 'mixamorigHead') {
            head = o;
          }
          if (o.isBone && o.name === 'mixamorigSpine') {
            chest = o;
          }
        });


        model.scale.set(7, 7, 7)
        model.position.y = -11;
        model.position.z = 7;

        scene.add(model)
      },
      undefined, // We don't need this function
      function (error) {
        console.error(error);
      }
    );


    /**
      * WoodPanel_Model
      */
    loader.load(
      '/info_stand.glb',
      (infostand) => {
        infomodel = infostand.scene;
        // scene.add(infomodel.children[0])
        infomodel.scale.set(6.5, 6.5, 6.5)
        infomodel.position.z = 8
        infomodel.position.y = -11
        infomodel.position.x = 25.4

        scene.add(infomodel)
      }
    );
    // info.position.y = 5;



    /**
       * Camera_Default
       */
    camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    //Default camera position, comment out when editing camera
    camera.position.z = 32;
    camera.position.x = 0;
    camera.position.y = -3;

    //Placement camera for model edits
    // camera.position.z = 50;
    // camera.position.x = 0;
    // camera.position.y = -3;

    /**
       * Camera Animation Left
       */
    const buttonL = $(".buttonLeft");
    let buttonLeft = false;

    buttonL.click(() => {
      // camera.position.x = buttonLeft ? 0 : -30;
      gsap.to(camera.position, {
        duration: 3,
        x: buttonLeft ? 0 : -30,
        // ease: "power3.in"

      })
      buttonL[0].innterHTML = buttonLeft ? 'go left' : 'go back';
      buttonLeft = !buttonLeft;
    })

    /**
     * Camera Animation Right anim
     */
    const tl = gsap.timeline()

    const buttonR = $(".buttonRight");
    let buttonRight = false;

    buttonR.click(() => {
      // camera.position.x = buttonLeft ? 0 : -30;
      tl.to(camera.position, {
        duration: 3,
        x: buttonRight ? 0 : 30,
        // ease: "power3.in"
      })

      // .to(camera.position, {
      //   duration: 3,
      //   z: buttonRight ? 32 : 18,
      //   y: buttonRight ? -3 : -2
      //   // ease: "power3.in"
      // })

      buttonR[0].innterHTML = buttonRight ? 'go right' : 'go back';
      buttonRight = !buttonRight;

    })

    /**
   *Lighting
   */
    // let hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.61);
    // hemiLight.position.set(0, 50, 0);
    // scene.add(hemiLight);


    const SpotLight = new THREE.SpotLight(0xffffff)
    scene.add(SpotLight)
    SpotLight.position.set(-100, 10, 0);
    SpotLight.castShadow = true;
    SpotLight.angle = 0.05;

    let d = 13.25;
    let dirLight = new THREE.DirectionalLight(0xffffff, 1.54);
    dirLight.position.set(-2, 2.5, 2);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 1500;
    dirLight.shadow.camera.left = d * -1;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = d * -1;
    // Add directional Light to scene
    scene.add(dirLight);

    let dirLight2 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight2.position.set(0, .5, 5);
    scene.add(dirLight2)


    const image = new Image()
    const texture = new THREE.Texture(image);
    image.onload = () => {
      texture.needsUpdate = true
    }
    image.src = "./resources/floor_wood.jpg"




    // Floor
    let floorGeometry = new THREE.PlaneGeometry(180, 40, 1, 1);
    let floorMaterial = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 0,
    });

    let floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -0.5 * Math.PI; // This is 90 degrees by the way
    floor.receiveShadow = true;
    floor.position.y = -11;
    floor.position.z = 8;
    scene.add(floor);


  }

  //Renderer & Animation?
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

  // console.log(scene)
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
  //Top event listener is for desktop and the bottom is for touchscreens
  window.addEventListener('click', e => raycast(e));
  window.addEventListener('touchend', e => raycast(e, true));

  function raycast(e, touch = false) {
    var mouse = {};
    if (touch) {
      mouse.x = 2 * (e.changedTouches[0].clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.changedTouches[0].clientY / window.innerHeight);
    } else {
      mouse.x = 2 * (e.clientX / window.innerWidth) - 1;
      mouse.y = 1 - 2 * (e.clientY / window.innerHeight);
    }
    // update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    var intersects = raycaster.intersectObjects(scene.children, true);
    // console.log(scene.children)

    if (intersects[0]) {
      var object = intersects[0].object;
      // console.log(scene)

      if (object.name === '') {

        if (!currentlyAnimating) {
          currentlyAnimating = true;
          playOnClick();
        }
      }
    }
  }
  function playOnClick() {
    let anim = Math.floor(Math.random() * possibleAnims.length) + 0;
    playModifierAnimation(idle, 0.25, possibleAnims[anim], 0.25);
  }


  //This blends the animation from idle to something else
  function playModifierAnimation(from, fSpeed, to, tSpeed) {
    //Reset the "to" animation. The animation that is about to play
    to.setLoop(THREE.LoopOnce);
    to.reset();
    to.play();
    //each clip action has a method cross fade too. Responsible for blending
    from.crossFadeTo(to, fSpeed, true);


    setTimeout(function () {
      //Return to idle
      from.enabled = true;
      //Crossfade to idle
      to.crossFadeTo(from, tSpeed, true);
      //Make current animation false again
      currentlyAnimating = false;
    }, to._clip.duration * 1000 - ((tSpeed + fSpeed) * 1000));
  }

  //Listens for mouse movement, gets mouse position, then moves joints that have capped off
  // the angles they can move at. 
  document.addEventListener('mousemove', function (e) {
    let mousecoords = getMousePos(e);
    if (head && chest) {
      //Here you can control which joints are being moved
      moveJoint(mousecoords, head, 50);
      moveJoint(mousecoords, chest, 30);
    }
  });

  function getMousePos(e) {
    return { x: e.clientX, y: e.clientY };
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
      dx = ((degreeLimit * xPercentage) / 100) * -1;
    }
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
