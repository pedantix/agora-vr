function startProcessVideo() {

	const videoUI = document.querySelector(".videoUI");
	videoUI.style.display = 'block';
	// --------- here I capture my own stream in order to transmit it as I want ----

	const constraints = {
		video: { width: 640, height: 480 },
	};
	set_player_position();
	// Get my camera stream (to do some processing before capturing to canvas
	const myvideo = document.createElement('video');
	navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
		myvideo.srcObject = stream;
		myvideo.play();	
		
	});

	// Process my stream
	var canvasElementSecret = document.getElementById('canvas_secret');
	var canvasCtxSecret = canvasElementSecret.getContext('2d');

	var canvasStream;
	let r,g,b;

	(function loop() {
	        canvasCtxSecret.drawImage(myvideo, 0, 0, 800, 600);
	        requestAnimationFrame(loop);
	        //setTimeout(loop, 1000 / 30); // drawing at 30fps
	   }
	)();	
}
