function onConnect(){
	console.error('On connected to NAF -', new Date());
}

document.addEventListener("DOMContentLoaded", function(){
	document.body.addEventListener('clientConnected', function (evt) {
	  console.error('clientConnected event. clientId =', evt.detail);
	});	


  // --------- here I capture my own stream in order to transmit it as I want ----
  const constraints = {
    video: true,
  };

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


	var ggg=99;

	let userSeats = {};

	function sitOnChair(avatarObj3D,id) {
		var posArr=userPositions.pop();
		if (posArr) {
			userSeats[id]=posArr;		
			avatarObj3D.position.x = posArr[0];
			avatarObj3D.position.y = posArr[1];
			avatarObj3D.position.z = posArr[2];
		} else {
			console.error("there is no chairs for new user");
		}
	}

	function getOffChair(id) {
		userPositions.push(userSeats[id]);
		delete userSeats[id];
	}

	document.body.addEventListener('entityCreated', function (evt) {
	    let createdElem = evt.detail.el;

	    if (createdElem.className == 'avatar' && createdElem.id) {
	    	let aplane_video = createdElem.querySelector("#screenPlane");
			let id=createdElem.firstUpdateData.networkId;
	    	sitOnChair(createdElem.object3D, id);    	
      		setTimeout(()=> {
      			aplane_video.setAttribute("visible", "true");
      		}, 2000);
	    }	   
	});

	document.body.addEventListener('entityRemoved', function(evt) {
	    var id=evt.detail.networkId;
	    if (id && userSeats[id]) {
	    	getOffChair(id);
	    }	
    });
});

