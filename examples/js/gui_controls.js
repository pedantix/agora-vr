
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
