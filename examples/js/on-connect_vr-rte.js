var user_seat;
// render function
var render;

checkSeatInURL();

function checkSeatInURL() {
	// get seat num parameter from URL
	const paramsString = document.location.search;
	const searchParams = new URLSearchParams(paramsString);
	const seatNums = Object.keys(userPositions);
	
	if (seatNums.length && seatNums.includes(searchParams.get("seat"))){
		user_seat = searchParams.get("seat");
		//addControls();
	}
}


var cameraOptions={ camera :  'change' };
var micOptions={ mic :  'change' };

async function addControls() {
	if (!user_seat) return;

  const gui = new dat.GUI( {  width: 400 });

    var cams =  await AgoraRTC.getCameras();
    var cam2 = {};
     cam2['change']='change';
    cams.forEach(cam => {
       cam2[cam.label]=cam.deviceId;
    });

    var mics =  await AgoraRTC.getMicrophones();
    var mic2 = {};
     mic2['change']='change';

    mics.forEach(mic => {
          mic2[mic.label]=mic.deviceId;
     });


    gui.add( cameraOptions, 'camera', cam2).onChange(
            function() {
            if (cameraOptions.camera=='change') return;
                if (localTracks && localTracks.videoTrack) {
                        localTracks.videoTrack.setDevice(cameraOptions.camera);

                        const constraints = {
                        video: { width: 640, height: 480, deviceId: cameraOptions.camera },
                        audio: false
                         };

                         navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
                         window.lvmyvideo.srcObject = stream;
                         window.lvmyvideo.play();
                        });
                } else {
                        cameraOptions.camera='change';
                }
            }
        );

    gui.add( micOptions,'mic', mic2).onChange(
            function() {
            if (micOptions.mic=='change') return;
                if (localTracks && localTracks.audioTrack) {
                        localTracks.audioTrack.setDevice(micOptions.mic);
                } else {
                        micOptions.mic='change';
                }
            }
        );

  gui.close();
  }



/* enable video streaming if seat parameter in URL */
function toggleVideoStreaming(scene) {	

	if (user_seat) {
		scene.setAttribute('networked-scene', {
		  app: '010f1d7fd17146be9a8b1a92b7260a79',
	      room: "{'name':'vrsa', 'vbg0':'true', 'showLocal': 'true'}",
	      adapter: 'agorartc',
	      audio: true,
	      video: true,
    	});
	}
	// connect to room after determining if the seat parameter is set in the URL
	scene.emit('connect');
}

function set_player_position() {
	/* Avatar positioning */
	console.log(user_seat)
	sitOnChair();

	async function sitOnChair() {
		const posArr = userPositions[user_seat];
		//video_player.setAttribute('material', 'shader: transparent-video');
		const player_avatar = document.querySelector("#player_video_avatar");
		const player_avatar_obj = player_avatar.object3D;

		console.log(user_seat)
		player_avatar.setAttribute('seat', user_seat);
		const video_player = await waitForElm('.agora_video_player');
		player_avatar.setAttribute('material', 'src', '#' + video_player.id);
		player_avatar.setAttribute('material', 'shader', 'chromakey');
		player_avatar.setAttribute('material', 'alphaTest', '0.5');
		//player_avatar_obj.renderOrder = 1;
		// delay to prevent show background of user video
		setTimeout(()=> {
			player_avatar.setAttribute('visible', true);
		}, 2000);

		player_avatar_obj.position.set(posArr.x, posArr.y, posArr.z);
	}

	function getOffChair(id) {
		//delete userSeats[id];
	}	
}

function startProcessVideo() {

	const videoUI = document.querySelector(".videoUI");
	videoUI.style.display = 'block';
	// --------- here I capture my own stream in order to transmit it as I want ----

	const constraints = {
		video: { width: 640, height: 480 },
	};

	// Get my camera stream (to do some processing before capturing to canvas
	window.lvmyvideo = document.createElement('video');
	navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
		console.log(stream)
		window.lvmyvideo.srcObject = stream;
		window.lvmyvideo.play();	
		set_player_position();	
	});

	// Process my stream
	var canvasElementSecret = document.getElementById('canvas_secret');
	var canvasCtxSecret = canvasElementSecret.getContext('2d');

	var canvasStream;
	let r,g,b;

	(function loop() {
	        canvasCtxSecret.drawImage(window.lvmyvideo, 0, 0, 800, 600);
	        if (render) {
	        	render();
	        }
	        requestAnimationFrame(loop);
	        //setTimeout(loop, 1000 / 30); // drawing at 30fps
	   }
	)();	
}

function onConnect(evt){
	console.log('On connected to NAF -', new Date());
	console.log('clientConnected event. clientId =', evt.detail);

	document.body.addEventListener('clientConnected', function (evt) {
		const clientID = evt.detail.clientId;
		console.log('clientConnected event. clientID = ', clientID );
	});	

	document.body.addEventListener('entityCreated', function (evt) {
    	const createdElem = evt.detail.el;
    	// show another user video if user's element has seat attribute 
    	// and it's different from this user seat

    	if (createdElem.className == 'screenPlane' && 
    		user_seat === createdElem.getAttribute('seat')
    		) {
    		createdElem.object3D.renderOrder = 0;
    		createdElem.setAttribute('visible', false);
    	}
    });

	if (user_seat) {
		startProcessVideo();
	}		
}

window.addEventListener('DOMContentLoaded', (event) => {
	const scene = document.querySelector('a-scene');
	scene.addEventListener('loaded', ()=>{
		const playerCameraEl = document.querySelector('#player');
		playerCameraEl.setAttribute('camera', 'active', 'true');
		toggleVideoStreaming(scene);
	});
	const renderer = scene.renderer;

	const desk = document.getElementById('Desk');
	desk.object3D.renderOrder = 0;

	console.log(desk, desk.object3D)
	//renderer.physicallyCorrectLights = true;
	//renderer.outputEncoding = THREE.sRGBEncoding;
	//renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = 3;
	//renderer.shadowMap.enabled = true;
	//renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	const backScreen = document.getElementById('BackScreen');
    backScreen.addEventListener('model-loaded', (event) => {
    	
    	backscreen_obj = event.target.object3D;
    	const video = document.getElementById('wall-video');
    	const videoTexture = new THREE.VideoTexture( video );

		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;
		videoTexture.encoding = THREE.sRGBEncoding;
		videoTexture.format = THREE.RGBAFormat;
		const backscreen_material = new THREE.MeshStandardMaterial( {map: videoTexture, side: THREE.DoubleSide} );
		backscreen_obj.material = backscreen_material;
		video.play();
		videoTexture.dispose();
	});
	const digiFrame5 = document.getElementById('DigiFrame5');
    backScreen.addEventListener('model-loaded', (event) => {
    	
    	digiFrame5_obj = event.target.object3D;
    	const video2 = document.getElementById('wall-video2');
    	const videoTexture2 = new THREE.VideoTexture( video2 );

		videoTexture2.minFilter = THREE.LinearFilter;
		videoTexture2.magFilter = THREE.LinearFilter;
		videoTexture2.encoding = THREE.sRGBEncoding;
		videoTexture2.format = THREE.RGBAFormat;
		const digiFrame5_material = new THREE.MeshStandardMaterial( {map: videoTexture2, side: THREE.DoubleSide} );
		digiFrame5_obj.material = digiFrame5_material;
		video2.play();
		videoTexture2.dispose();
	});	
		/* Apply environment map */
		/* Loaders */
		/*const pmremGenerator = new THREE.PMREMGenerator(renderer);
		pmremGenerator.compileEquirectangularShader();

		function loadEnvMap() {
			room_scene.traverse((node) => {
	    		if (node.isMesh && node.material instanceof THREE.MeshStandardMaterial) {
	    			node.material = new THREE.MeshStandardMaterial({
	                        color: "#555",
	                        roughness: 0.1,
	                        metalness: 0.2,
	                        envMapIntensity: 0.1
	                    });
	    			node.material.envMap = newEnvMap;
		            node.material.needsUpdate = true;
		            node.castShadow = true;
		            node.receiveShadow = true;	            
	    		};
	  		});
		}

		const envTexture = new THREE.TextureLoader().load('/public/img/photo_studio.jpg', 
                function (texture) {
                	console.error("texture: ", texture);

                    exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
                    newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
					newEnvMap.encoding = THREE.sRGBEncoding;
                    console.error("newEnvMap: ", newEnvMap);
                    loadEnvMap(newEnvMap); // Add envmap once the texture has been loaded

                    //texture.dispose();
                }

			);
*/
/*		new EXRLoader()
            .setDataType(THREE.UnsignedByteType)
            .load(
                "/public/img/photo_studio512.hdr",
                function (texture) {
                	console.error("texture: ", texture);

                    exrCubeRenderTarget = pmremGenerator.fromEquirectangular(texture);
                    exrBackground = exrCubeRenderTarget.texture;
                    newEnvMap = exrCubeRenderTarget ? exrCubeRenderTarget.texture : null;
					newEnvMap.encoding = THREE.sRGBEncoding;
                    console.error("newEnvMap: ", newEnvMap);
                    loadEnvMap(newEnvMap); // Add envmap once the texture has been loaded

                    texture.dispose();
                }
            );
*/
		//const renderTarget = pmremGenerator.fromEquirectangular(envTexture);
		//const renderTarget = pmremGenerator.fromScene(scene.object3D);
		//const newEnvMap = renderTarget ? renderTarget.texture : null;
		//console.error(newEnvMap);
		//newEnvMap.encoding = THREE.sRGBEncoding;
/*
		room_scene.traverse((node) => {
    		if (node.isMesh && node.material instanceof THREE.MeshStandardMaterial) {
    			node.material = new THREE.MeshStandardMaterial({
                        color: "#555",
                        roughness: 0.1,
                        metalness: 2.0,
                        envMapIntensity: 5
                    });
    			node.material.envMap = newEnvMap;
	            node.material.needsUpdate = true;
	            node.castShadow = true;
	            node.receiveShadow = true;	            
    		};
  		});*/
  		//debugObject.envMapIntensity = 2.5
		//gui.add(debugObject, 'envMapIntensity').min(0).max(10).step(0.001).onChange(updateAllMaterials)
});
