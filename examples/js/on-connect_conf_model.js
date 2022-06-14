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
	}
}

/* enable video streaming if seat parameter in URL */
function toggleVideoStreaming(ascene) {
	const scene = document.querySelector('a-scene');	
	if (user_seat) {
		scene.setAttribute('networked-scene', {
		  app: '010f1d7fd17146be9a8b1a92b7260a79',
	      room: "{'name':'vr', 'vbg0':'true', 'showLocal': 'true'}",
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
	console.error(user_seat)
	sitOnChair();	

	async function sitOnChair() {
		const posArr = userPositions[user_seat];
		//video_player.setAttribute('material', 'shader: transparent-video');
		const player_avatar = document.querySelector("#player_video_avatar");
		const player_avatar_obj = player_avatar.object3D;

		console.error(user_seat)
		player_avatar.setAttribute('seat', user_seat);
		const video_player = await waitForElm('.agora_video_player');
		player_avatar.setAttribute('material', 'src', '#' + video_player.id);
		player_avatar.setAttribute('material', 'shader', 'chromakey');
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
	const myvideo = document.createElement('video');
	navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
		myvideo.srcObject = stream;
		myvideo.play();	
		set_player_position();	
	});

	// Process my stream
	var canvasElementSecret = document.getElementById('canvas_secret');
	var canvasCtxSecret = canvasElementSecret.getContext('2d');

	var canvasStream;
	let r,g,b;

	(function loop() {
	        canvasCtxSecret.drawImage(myvideo, 0, 0, 800, 600);
	        if (render) {
	        	render();
	        }
	        requestAnimationFrame(loop);
	        //setTimeout(loop, 1000 / 30); // drawing at 30fps
	   }
	)();	
}

function onConnect(evt){
	console.error('On connected to NAF -', new Date());
	console.error('clientConnected event. clientId =', evt.detail);

	document.body.addEventListener('clientConnected', function (evt) {
		const clientID = evt.detail.clientId;
		console.error('clientConnected event. clientID = ', clientID );
	});	

	document.body.addEventListener('entityCreated', function (evt) {
    	const createdElem = evt.detail.el;
    	// show another user video if user's element has seat attribute 
    	// and it's different from this user seat

    	if (createdElem.className == 'screenPlane' && 
    		user_seat === parseInt(createdElem.getAttribute('seat'))
    		) {
    		createdElem.setAttribute('visible', false);
    	}
    });

	if (user_seat) {
		startProcessVideo();
	}
		
}

window.addEventListener('DOMContentLoaded', (event) => {
	const scene = document.querySelector('a-scene');
	const renderer = scene.renderer;

	renderer.physicallyCorrectLights = true;
	//renderer.outputEncoding = THREE.sRGBEncoding;
	//renderer.toneMapping = THREE.ReinhardToneMapping;
	renderer.toneMappingExposure = 3;
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;

	const room = document.getElementById('room');
    room.addEventListener('model-loaded', (event) => {

    	toggleVideoStreaming(scene);

    	room_scene = event.target.object3D;
    	const backscreen_obj = room_scene.getObjectByName("BackScreen");
    	const video = document.getElementById('wall-video');
    	const videoTexture = new THREE.VideoTexture( video );

		videoTexture.minFilter = THREE.LinearFilter;
		videoTexture.magFilter = THREE.LinearFilter;
		videoTexture.encoding = THREE.sRGBEncoding;
		videoTexture.format = THREE.RGBAFormat;
		const backscreen_material = new THREE.MeshStandardMaterial( {map: videoTexture, side: THREE.DoubleSide} );
		backscreen_obj.material = backscreen_material;
		//backscreen_obj.material.map = videoTexture;
		video.play();
		videoTexture.dispose();

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
    })
});
