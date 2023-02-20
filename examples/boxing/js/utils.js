var user_seat;
var room = '';
var appid = '';
var max_seats = 4;
var avatar_seat;
var cameraOptions = { camera: 'change' };
var micOptions = { mic: 'change' };
var showLocalVideo=false;
var testSnitch = null;



async function addControls() {
    if (!user_seat) return;
    const gui = new dat.GUI({ width: 400 });

    var cams = await AgoraRTC.getCameras();
    var cam2 = {};
    cam2['change'] = 'change';
    cams.forEach(cam => {
        cam2[cam.label] = cam.deviceId;
    });

    var mics = await AgoraRTC.getMicrophones();
    var mic2 = {};
    mic2['change'] = 'change';

    mics.forEach(mic => {
        mic2[mic.label] = mic.deviceId;
    });


    gui.add(cameraOptions, 'camera', cam2).onChange(
        function () {
            if (cameraOptions.camera == 'change') return;
            if (localTracks && localTracks.videoTrack) {
                
                const constraints = {
                    video: { width: 640, height: 480, deviceId: cameraOptions.camera },
                    audio: false
                };
                navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                    window.lvmyvideo.srcObject = stream;
                    window.lvmyvideo.play();
                });
                if (localTracks.videoTrack.setDevice) {
                 localTracks.videoTrack.setDevice(cameraOptions.camera);
                }
            } else {
                cameraOptions.camera = 'change';
            }
        }
    );

    gui.add(micOptions, 'mic', mic2).onChange(
        function () {
            if (micOptions.mic == 'change') return;
            if (localTracks && localTracks.audioTrack) {
                localTracks.audioTrack.setDevice(micOptions.mic);
            } else {
                micOptions.mic = 'change';
            }
        }
    );

    gui.close();
}






function showTextOnBlackScreen() {
    document.getElementById('displayNameInputContainer').classList.add('show');
//     const enterText = document.createElement("h1");
//     enterText.innerText = "Click to Enter";
//     enterText.classList.add('enterText');
//     const loader = document.querySelector('.loader');
//     loader.style.display = 'none';
//     document.body.appendChild(enterText);
}

function enterScene() {
    const scene = document.querySelector('a-scene');
    const videoEl = document.getElementById("BackScreen");
    const enterVRButt = document.querySelector(".a-enter-vr");
    const guiControls = document.querySelector(".close-bottom");
    const enterText = document.querySelector(".enterText");
    let displayNameInput = document.querySelector("#displayNameInput").value;

    setCookie('stage', displayNameInput);

    scene.style.display = "block";
    if (guiControls) {
        guiControls.style.display = 'block';
    }
    enterVRButt.style.display = 'block';

    // enterText.parentNode.removeChild(enterText);
    // connect to network scene and start loading networked objects
    scene.emit('connect');
    try {
        if (typeof startCall === 'function') {
            startCall();
        }
    } catch (e) {
        console.error(e)
    }

    if (document.querySelector("#chloe") && document.querySelector("#chloe").object3D  && document.querySelector("#chloe").object3D.children[0] && document.querySelector("#chloe").object3D.children[0].material)
    {
        /*
        document.querySelector("#chloe").object3D.children[0].material.color.b=1.4;
        document.querySelector("#chloe").object3D.children[0].material.color.g=1.6;
        document.querySelector("#chloe").object3D.children[0].material.color.r=2.2;
        */

        document.querySelector("#chloe").object3D.children[0].material.color.b=1.1;
        document.querySelector("#chloe").object3D.children[0].material.color.g=1.3;
        document.querySelector("#chloe").object3D.children[0].material.color.r=1.6;
        document.querySelector("#chloe").emit("ryskplay");
    }
   
    
    //hologramComponent.contrast=1;
    //hologramComponent.material = new THREE.MeshBasicMaterial({map: hologram.map})  
/*

    // Switch material
    //hologramComponent.material = new THREE.MeshBasicMaterial()

    hologramComponent.material = new THREE.ShaderMaterial({
        vertexShader:  hologramComponent.material.vertexShader,
        fragmentShader:  hologramComponent.material.fragmentShader,
        transparent: true,
        uniforms: hologramComponent.material.uniforms,
        lights: true
    })
     uniforms: {
      color: { value: new THREE.Color(0xffffff) },
      lightDirection: { value: new THREE.Vector3(1.0, 1.0, 1.0).normalize() },
      map: new THREE.Uniform(hologramComponent.map),
      
    },
*/
/*
const material = new THREE.ShaderMaterial({
    uniforms: hologramComponent.material.uniforms,
    fragmentShader: hologramComponent.material.fragmentShader,
    vertexShader: hologramComponent.material.vertexShader,
    lights: false
  });

  window.material=material;
  hologramComponent.material=material;
  */
 
  const hologramComponent = document.querySelector('#hologram').components.hologram;
 /*
  hologramComponent.material = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL1,
    vertexShader: document.getElementById('vertex_shader').textContent,
    fragmentShader: document.getElementById('f_lit').textContent,
    transparent: true,
    uniforms: {
        deltaTime: new THREE.Uniform(0),
        opacity: new THREE.Uniform(1.0),
        contrast: new THREE.Uniform(0.95),
        map: new THREE.Uniform(hologramComponent.map),
        lights: true
    },
})

hologramComponent.material = new THREE.ShaderMaterial({
    fragmentShader: hologramComponent.material.fragmentShader,
    vertexShader: hologramComponent.material.vertexShader,
    transparent: true,
    uniforms: {
        deltaTime: new THREE.Uniform(0),
        opacity: new THREE.Uniform(1.0),
        contrast: new THREE.Uniform(0.95),
        map: new THREE.Uniform(hologramComponent.map),
        lights: true
    },
    lights: false,
  });
   */
    ///add Q and E keyboard shortcuts to rotate left/right
    document.addEventListener('keypress', (event) => {
        var name = event.key;
        var code = event.code;
        
        switch(code) {
          case 'KeyE':
            document.getElementById("camera-rig").object3D.rotation.y -= Math.PI/16;
            break;
          case 'KeyQ':
            document.getElementById("camera-rig").object3D.rotation.y += Math.PI/16;
            break;
        }
      }, false);
}

/* enable video streaming if seat parameter in URL
// is bg removal required?
vbg or vbg0

*/
function toggleVideoStreaming(scene) {
    let vbgMode = 'vbg0'; 
    let vbg = false; // replace background with green
    let showLocal = false; // display self video in scene (local-player)
    let audio = false; // publish audio
    let video = false; // publish video
    let enableVideoFiltered = true; // use from canvas_secret capture stream


    // if (user_seat) {
    //     //vbg = true;
    //     vbg = false;
    //     showLocal = true; // display self 
    //     audio = true;
    //     video = true;
    // }

    vbg = false;
    showLocal = true; // display self 
    audio = true;
    video = true;
    
    scene.setAttribute('networked-scene', {
        app: appid,
        room: `{'name':'${room}', 'enableVideoFiltered': '${enableVideoFiltered}','${vbgMode}':'${vbg}', 'showLocal': '${showLocal}'}`,
        adapter: 'agorartc',
        audio: audio,
        video: video,
    });
}

function setPlayerSeatAttr() {
    const player_avatar = document.querySelector("#player_video_avatar");
    player_avatar.setAttribute('seat', user_seat);
}

function onConnect(evt) {
    console.log('On connected to NAF -', new Date());

    document.body.addEventListener('clientConnected', function (evt) {
        const clientID = evt.detail.clientId;
        console.error('clientConnected event. clientID = ', clientID);
    });

    function seatNumEngaged(newSeatNum) {
        return document.querySelector(`.screenPlane[seat='${newSeatNum}'][visible='true']`);
    }

    document.body.addEventListener('entityCreated', function (evt) {
        const createdElem = evt.detail.el;
        const newSeatNum = createdElem.getAttribute('seat');
        if (createdElem.className == 'screenPlane' &&
            newSeatNum &&
            user_seat !== newSeatNum &&
            avatar_seat != newSeatNum &&
            !seatNumEngaged(newSeatNum) &&
            newSeatNum <= max_seats
        ) {
            createdElem.setAttribute('visible', true);
        }
    });

    if (user_seat) {
        startProcessVideo();
    }
    //if there is assistant
    set_assistant_position();
}

function parseURL() {
    // get seat num parameter from URL
    const paramsString = document.location.search;
    const searchParams = new URLSearchParams(paramsString);
    const url_avatar_seat = searchParams.get("avatar_seat");

    if (searchParams.get("max_seats")) {
        max_seats = parseInt(searchParams.get("max_seats"));
    }

    const seatNums = Object.keys(userPositionGroups[max_seats]);
    if (seatNums.length && seatNums.includes(searchParams.get("seat"))) {
        user_seat = searchParams.get("seat");
        //addControls();
    }
    if (searchParams.get("room")) {
        room = searchParams.get("room");
    }
    if (searchParams.get("appid")) {
        appid = searchParams.get("appid");
    }

    if (url_avatar_seat && seatNums.includes(url_avatar_seat)) {
        avatar_seat = parseInt(url_avatar_seat);
    }

    if (searchParams.get("testSnitch")) {
        testSnitch = parseInt(searchParams.get("testSnitch"));
    }
}

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    var ret= decodeURIComponent(results[2].replace(/\+/g, ' '));
    if (ret && ret.length>0)
      return ret;
    else
      return null;
  }


function sitOnChair(seat_num, video_elem, player_avatar, blue_color) {
    const userPositions = userPositionGroups[max_seats];
    const posArr = userPositions[seat_num];
    const sizeWH = userVideoSizes[max_seats];
    const player_avatar_obj = player_avatar.object3D;

    player_avatar.setAttribute('width', sizeWH);
    player_avatar.setAttribute('height', sizeWH);
    player_avatar.setAttribute('material', 'src', '#' + video_elem.id);
    if (blue_color || 1==1) {
        player_avatar.setAttribute('material', 'color', '0 0.03 0.99');
        //console.error(player_avatar)
    }

    player_avatar.setAttribute('material', 'shader', 'chromakey');
    player_avatar.setAttribute('material', 'alphaTest', '0.5');
    // delay to prevent show background of user video
    setTimeout(() => {
        player_avatar.setAttribute('visible', true);
        document.querySelector("#player_video_avatar").object3D.scale.multiply( new THREE.Vector3(-1, 1, 1));
    }, 2000);

    const avatart_material = player_avatar_obj.children[0].material;
    avatart_material.needsUpdate = true;
    avatart_material.metalness = 0.7;
    avatart_material.lights = true;
    player_avatar_obj.children[0].castShadow = false;
    player_avatar_obj.children[0].receiveShadow = true;
    player_avatar_obj.position.set(posArr.x, posArr.y, posArr.z);
}

async function set_player_position() {
    const player_avatar = document.querySelector("#player_video_avatar");
    const video_player = await waitForElm('.agora_video_player');
    sitOnChair(user_seat, video_player, player_avatar);

    document.getElementById('player').setAttribute('player-info', 'name', document.getElementById('displayNameInput').value)

    if (testSnitch > 0) {
        createSnitchArray(testSnitch);
    }
    
}

function set_assistant_position() {
    if (avatar_seat && avatar_seat != user_seat) {
        const engagedUser = document.querySelector(`.screenPlane[seat='${avatar_seat}'][visible='true']`);
        // if avatar_seat place is already taken, hide user localy
        if (engagedUser) {
            engagedUser.setAttribute("visible", "false");
        }
        const assistant_avatar = document.querySelector("#assistant_video_avatar");
        const assistant_video_player = document.querySelector('#wall-avatar');
        sitOnChair(avatar_seat, assistant_video_player, assistant_avatar, true);
    }
}

function startProcessVideo() {

    const videoUI = document.querySelector(".videoUI");
    if (showLocalVideo) {
        videoUI.style.display = 'block';
    }
    
    // --------- here I capture my own stream in order to transmit it as I want ----
    const constraints = {
        video: { width: 640, height: 480 },
    };
    set_player_position();
    // Get my camera stream (to do some processing before capturing to canvas
    const myvideo = document.createElement('video');
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        window.lvmyvideo= myvideo;
        myvideo.srcObject = stream;
        myvideo.play();

    });

    // Process my stream
    var canvasElementSecret = document.getElementById('canvas_secret');
    var canvasCtxSecret = canvasElementSecret.getContext('2d');

    var canvasStream;
    let r, g, b;

    (function loop() {
        canvasCtxSecret.drawImage(myvideo, 0, 0, 800, 600);
        requestAnimationFrame(loop);
    }
    )();
}

function waitForElm(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }
        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}




function createSnitchArray(qty) {
    const snitch = ['Snitch.obj','Snitch_v2.obj'];
    for (let i=0; i<=qty; i++) {
        let el = document.createElement("a-entity");
        let randomSnitch = Math.floor(Math.random() * 2);
        
        el.setAttribute("obj-model","obj: ./assets/"+snitch[randomSnitch]);
        el.setAttribute("scale","0.01 0.01 0.01");
        el.setAttribute("material", "color: #bd0000; alphaTest: 0.5; metalness: 0.8; roughness: 0.15; normalMap: #SnitchNormal; sphericalEnvMap: #RefProbe; src: #SnitchColor");

        let posRndX = Math.random()*20-10;

        let rndNeg = Math.round(Math.random()) * 2 - 1;
        let posRndZ = (Math.random()*3+5)*rndNeg;

        let rotRnd  = Math.random()*Math.PI-Math.PI/2;

        let posRndY = ((Math.random()*0.5+1.5));

        el.object3D.position.set(posRndX,posRndY,posRndZ);
        el.object3D.rotation.y = rotRnd;

        const name = 'u' + Math.round(Math.random() * 100);
        const nametag = document.createElement("a-entity");
        nametag.innerHTML = '<a-entity position="0 36 0" scale="40 40 40" look-at-modified="#player" ><a-plane class="nametag" rotation="0 0 0"  position="0 -1.3 0" canvas-to-text="width: 2; fontColor: #ffffff; height: 0.5; string: '+name+';"></a-plane><a-rounded position="-0.3 -1.45 -0.01" width="0.6" height="0.3" radius="0.05" color="#000000" opacity="0.6"></a-rounded></a-entity>';

        el.appendChild(nametag);

        scene.appendChild(el);

        // let avatar =  Avatar('./assets/remy.glb',loader,0.5).then(object => { 
        //     let el = document.createElement("a-obj-model");
        //     el.setAttribute("remy", "true");
        //     el.object3D = object;
        //     object.traverse((node) => {
        //       node.frustumCulled = false
        //     });
        //     el.object3D.position.x = i;
        //     scene.appendChild(el);
        // }); 
    }
}


