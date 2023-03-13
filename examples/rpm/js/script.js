// Avatar SDK
const subdomain = 'demo'; // Replace with your custom subdomain
const frame = document.getElementById('frame');
frame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi`;
window.addEventListener('message', subscribe);
document.addEventListener('message', subscribe);

function subscribe(event) {
    const json = parse(event);
    if (json?.source !== 'readyplayerme') {
        return;
    }
    // Susbribe to all events sent from Ready Player Me once frame is ready
    if (json.eventName === 'v1.frame.ready') {
        frame.contentWindow.postMessage(
            JSON.stringify({
                target: 'readyplayerme',
                type: 'subscribe',
                eventName: 'v1.**'
            }),
            '*'
        );
    }

    // Get avatar GLB URL
    if (json.eventName === 'v1.avatar.exported') {
        console.log(`Avatar URL: ${json.data.url}`);
        document.getElementById('frame').hidden = true;
        document.getElementById('player').setAttribute('player-info', 'gltfmodel', json.data.url);
        document.getElementById("self-view").setAttribute('gltf-model', json.data.url);
        //   document.getElementById('player').setAttribute('player-info', 'gltfmodel', json.data.url+"?"+Math.random());           
        //   document.getElementById("self-view").setAttribute('gltf-model',  json.data.url+"?"+Math.random());           
    }

    // Get user id
    if (json.eventName === 'v1.user.set') {
        console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`);
    }
}

function parse(event) {
    try {
        return JSON.parse(event.data);
    } catch (error) {
        return null;
    }
}

function displayIframe() {
    document.getElementById('frame').hidden = false;
}

function showSelf() {

}

function handleMocap(csv) {
    alert(csv);
}

// MediaPipe
window.handleMocap = handleMocap;
const video = document.getElementById('local_video');
const out = document.getElementById('canvas_secret');
const canvasCtx = out.getContext('2d');

var WIDTH = 1280;
var HEIGHT = 720;

function decimalToHex(d, padding) {
    var hex = Number(d).toString(16);
    padding = typeof (padding) === "undefined" || padding === null ? padding = 2 : padding;

    while (hex.length < padding) {
        hex = "0" + hex;
    }

    return hex.toUpperCase();
}

const NOSE = 1;
const NASAL = 4;       // 1 point above nose
const LEFT = 454;      // left most point
const RIGHT = 234;     // right most point
const TOP = 10;        // top most point                       
const BOT = 152;       // bot most point
const LEFT_LIP = 78;      // left most point
const RIGHT_LIP = 308;     // right most point


function onResultsFaceMesh(results) {
    document.body.classList.add('loaded');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, out.width, out.height);
    canvasCtx.drawImage(results.image, 0, 0, out.width, out.height);

    if (results.multiFaceLandmarks) {
        for (const landmarks of results.multiFaceLandmarks) {
            var newArray = [];
            newArray.push(landmarks[NOSE]);
            newArray.push(landmarks[NASAL]);
            newArray.push(landmarks[LEFT]);
            newArray.push(landmarks[RIGHT]);
            newArray.push(landmarks[TOP]);
            newArray.push(landmarks[BOT]);
            newArray.push(landmarks[LEFT_LIP]);
            newArray.push(landmarks[RIGHT_LIP]);

           // console.log("Y", landmarks[78].y-landmarks[308].y, "Z", landmarks[78].z-landmarks[308].z, landmarks[78].y-landmarks[308].y, "Z", landmarks[78].z-landmarks[308].z);
            //newArray.push(landmarks[FACEMESH_LIPS[38][0]]);

            //newArray.push(landmarks[FACEMESH_LIPS[36][0]]);
            //newArray.push(landmarks[FACEMESH_LIPS[35][0]]);
            //*/

            /*
            for (let i = 0; i < 20; i++) {
                var na = [];
                na.push(landmarks[FACEMESH_LIPS[i][0]]);
                var hex=decimalToHex(12*i,2);
                var hexout="#"+hex+hex+hex;
                drawLandmarks(canvasCtx, na, {color: hexout});
              }
            */
            //newArray.push(landmarks[FACEMESH_LIPS[40][0]]);
            //newArray.push(landmarks[FACEMESH_LIPS[5][0]]);
            //drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
                /*
            drawConnectors(canvasCtx, landmarks, FACEMESH_TESSELATION, {color: '#C0C0C070', lineWidth: 1});
            drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYE, {color: '#FF3030'});
            drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_EYEBROW, {color: '#FF3030'});
            drawConnectors(canvasCtx, landmarks, FACEMESH_RIGHT_IRIS, {color: '#FF3030'});
            drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYE, {color: '#30FF30'});
            drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_EYEBROW, {color: '#30FF30'});
            drawConnectors(canvasCtx, landmarks, FACEMESH_LEFT_IRIS, {color: '#30FF30'});
            drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color: '#E0E0E0'});
            drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, {color: '#E0E0E0'});
            */

           drawLandmarks(canvasCtx, newArray, {color: '#FF0000'});
           //drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
        }
    }
    canvasCtx.restore();
}

function onResultsPose(results) {
    if (!results.poseLandmarks) {
        console.log("no landmarks");
        return;
    }

    canvasCtx.save();
   // drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS,  { color: '#00FF00', lineWidth: 4 });
   // drawLandmarks(canvasCtx, results.poseLandmarks,  { color: '#FF0000', lineWidth: 2 });
    canvasCtx.restore();
}

video.classList.toggle('selfie', true);

const faceMesh = new FaceMesh({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
    }
});

faceMesh.setOptions({
    selfieMode: true,
    maxNumFaces: 1,
    refineLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

faceMesh.onResults(onResultsFaceMesh);

const pose = new Pose({
    locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
    }
});

pose.setOptions({
    selfieMode: true,
    modelComplexity: 1,
    smoothLandmarks: true,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

pose.onResults(onResultsPose);
const camera = new Camera(video, {
    onFrame: async () => {
        await faceMesh.send({ image: video });
        await pose.send({ image: video });
    },
    width: 640,
    height: 360
});
camera.start();
