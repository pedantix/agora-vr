// Avatar SDK
const subdomain = 'demo'; // Replace with your custom subdomain
const frame = document.getElementById('frame');
frame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi`;
window.addEventListener('message', subscribe);
document.addEventListener('message', subscribe);

function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    var ret = decodeURIComponent(results[2].replace(/\+/g, ' '));
    if (ret && ret.length > 0)
        return ret;
    else
        return null;
}

var mediapipe = getParameterByName("mediapipe");

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
        let v = json.data.url + "?morphTargets=ARKit,eyeLookDownLeft,eyeLookDownRight,eyeLookUpLeft,eyeLookUpRight,eyeLookInLeft,eyeLookInRight,eyeLookOutLeft,eyeLookOutRight,tongueOut";
        MorphData = {};
        document.getElementById('player').setAttribute('player-info', 'gltfmodel', v);
        document.getElementById("self-view").setAttribute('gltf-model', v);
        //   document.getElementById('player').setAttribute('player-info', 'gltfmodel', json.data.url+"?"+Math.random());           
        //   document.getElementById("self-view").setAttribute('gltf-model',  json.data.url+"?"+Math.random());           
    }

    // Get user id
    if (json.eventName === 'v1.user.set') {
        console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`);
    }

    console.warn("json", json);
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
const BOTTOM = 152;       // bot most point
const LEFT_LIP = 78;      // left most point
const RIGHT_LIP = 308;     // right most point
const TOP_LIP = 13;      // left most point
const BOTTOM_LIP = 14;
const LEFT_BROW_UP = 105;
//const LEFT_BROW_DOWN = 223;  
const LEFT_BROW_DOWN = 229;
const CENTER_BROW_UP = 9;
const CENTER_BROW_DOWN = 168;
const RIGHT_BROW_UP = 334;
//const RIGHT_BROW_DOWN = 443;  
const RIGHT_BROW_DOWN = 449;

const CENTER_BELOW_NOSE = 164;

const RIGHT_EYE_UP = 386;
const RIGHT_EYE_DOWN = 374;
const RIGHT_EYE_LEFT = 362;
const RIGHT_EYE_RIGHT = 359;

const LEFT_EYE_UP = 159;
const LEFT_EYE_DOWN = 145;
const LEFT_EYE_LEFT = 130;
const LEFT_EYE_RIGHT = 133;
function ldistance(x, y) {
    deltaX = x.x - y.x;
    deltaY = x.y - y.y;
    deltaZ = x.z - y.z;

    return Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

}

function onResultsFaceMesh(results) {
    document.body.classList.add('loaded');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, out.width, out.height);
    canvasCtx.drawImage(results.image, 0, 0, out.width, out.height);

    if (results.multiFaceLandmarks && getBone(document.getElementById("self-view").object3D, 'head')) {
        for (const landmarks of results.multiFaceLandmarks) {
            let obj = document.getElementById("self-view").object3D;
            var newArray = [];
            newArray.push(landmarks[NOSE]);
            newArray.push(landmarks[NASAL]);
            newArray.push(landmarks[LEFT]);
            newArray.push(landmarks[RIGHT]);
            newArray.push(landmarks[TOP]);
            newArray.push(landmarks[BOTTOM]);
            newArray.push(landmarks[LEFT_LIP]);
            newArray.push(landmarks[RIGHT_LIP]);
            newArray.push(landmarks[TOP_LIP]);
            newArray.push(landmarks[BOTTOM_LIP]);

            newArray.push(landmarks[LEFT_BROW_UP]);
            newArray.push(landmarks[LEFT_BROW_DOWN]);
            newArray.push(landmarks[CENTER_BROW_UP]);
            newArray.push(landmarks[CENTER_BROW_DOWN]);
            newArray.push(landmarks[RIGHT_BROW_UP]);
            newArray.push(landmarks[RIGHT_BROW_DOWN]);
            newArray.push(landmarks[CENTER_BELOW_NOSE]);

            newArray.push(landmarks[LEFT_EYE_UP]);
            newArray.push(landmarks[LEFT_EYE_DOWN]);
            newArray.push(landmarks[RIGHT_EYE_UP]);
            newArray.push(landmarks[RIGHT_EYE_DOWN]);


            let head_rotation_z = 0.6 * -3 * (landmarks[LEFT].y - landmarks[RIGHT].y);
            let head_rotation_y = 0.6 * 3 * (landmarks[LEFT].z - landmarks[RIGHT].z);
            let head_rotation_x = 0.4 + 0.6 * (-2 * (landmarks[TOP].z - landmarks[BOTTOM].z));

            let head = getBone(document.getElementById("self-view").object3D, 'head');

            let head_rotation_delta_z = Math.abs(head.rotation.z - head_rotation_z);
            let head_rotation_delta_y = Math.abs(head.rotation.y - head_rotation_y);
            let head_rotation_delta_x = Math.abs(head.rotation.x - head_rotation_x);

            let delta_breach = 0.007;
            if (head_rotation_delta_z > delta_breach || head_rotation_delta_y > delta_breach || head_rotation_delta_x > delta_breach) {
                //                console.log("delta",head_rotation_delta_z,head_rotation_delta_y,head_rotation_delta_x);
                head.rotation.z = head_rotation_z;
                head.rotation.y = head_rotation_y;
                head.rotation.x = head_rotation_x;
                let neck = getBone(obj, 'neck');
                neck.rotation.z = 0.4 * -3 * (landmarks[LEFT].y - landmarks[RIGHT].y);
                neck.rotation.y = 0.4 * 3 * (landmarks[LEFT].z - landmarks[RIGHT].z);
                neck.rotation.x = -0.3 + 0.4 * (-2 * (landmarks[TOP].z - landmarks[BOTTOM].z));
            }
            /*
            /*
            getBone(document.getElementById("self-view").object3D,'head').rotation.z=0.6*-3*(landmarks[LEFT].y-landmarks[RIGHT].y)  ;
            getBone(document.getElementById("self-view").object3D,'head').rotation.y=0.6*3*(landmarks[LEFT].z-landmarks[RIGHT].z)  ;
            getBone(document.getElementById("self-view").object3D,'head').rotation.x=-0.25+0.6*(-2*(landmarks[TOP].z-landmarks[BOTTOM].z))  ;
            getBone(document.getElementById("self-view").object3D,'neck').rotation.z=0.4*-3*(landmarks[LEFT].y-landmarks[RIGHT].y)  ;
            getBone(document.getElementById("self-view").object3D,'neck').rotation.y=0.4*3*(landmarks[LEFT].z-landmarks[RIGHT].z)  ;
            getBone(document.getElementById("self-view").object3D,'neck').rotation.x=-0.15+0.4*(-2*(landmarks[TOP].z-landmarks[BOTTOM].z)) ;
*/
            playMorphTarget(obj, 'jawOpen', 4 * (landmarks[BOTTOM_LIP].y - landmarks[TOP_LIP].y));
            playMorphTarget(obj, 'mouthSmileLeft', 7 * (landmarks[BOTTOM_LIP].y - landmarks[LEFT_LIP].y));
            playMorphTarget(obj, 'mouthSmileRight', 7 * (landmarks[BOTTOM_LIP].y - landmarks[RIGHT_LIP].y));

            //console.log(landmarks[BOTTOM_LIP].y-landmarks[LEFT_LIP].y);
            let top = ldistance(landmarks[TOP], landmarks[CENTER_BELOW_NOSE]);
            let left = ldistance(landmarks[LEFT_BROW_UP], landmarks[LEFT_BROW_DOWN]);
            let center = ldistance(landmarks[CENTER_BROW_UP], landmarks[CENTER_BROW_DOWN]);
            let right = ldistance(landmarks[RIGHT_BROW_UP], landmarks[RIGHT_BROW_DOWN]);

            let left_eye = ldistance(landmarks[LEFT_EYE_UP], landmarks[LEFT_EYE_DOWN]);
            let left_eye_h = ldistance(landmarks[LEFT_EYE_LEFT], landmarks[LEFT_EYE_RIGHT]);
            let right_eye = ldistance(landmarks[RIGHT_EYE_UP], landmarks[RIGHT_EYE_DOWN]);
            let right_eye_h = ldistance(landmarks[RIGHT_EYE_LEFT], landmarks[RIGHT_EYE_RIGHT]);
            console.log(
                "LEFT", left_eye_h / left_eye,
                "RIGHT", right_eye_h / right_eye
            );
            let facesize = TOP - CENTER_BELOW_NOSE;
            let left_up = (20 * (left - (0.14 * top / 0.46)))
            let right_up = (20 * (right - (0.14 * top / 0.46)))
            let center_up = (20 * (center - (0.14 * top / 0.46)))
            // console.log(3000*positiveOrZero((landmarks[LEFT_BROW_UP].y-landmarks[LEFT].y)/facesize-0.001),((landmarks[LEFT_BROW_UP].y-landmarks[LEFT].y)/facesize),(landmarks[RIGHT_BROW_UP].y-landmarks[RIGHT].y)/facesize);
            playMorphTarget(obj, 'browInnerUp', left_up);
            playMorphTarget(obj, 'browOuterUpLeft', left_up);
            playMorphTarget(obj, 'browOuterUpRight', right_up);

            /*
            playMorphTarget(obj,'browInnerUp',4000*positiveOrZero((landmarks[LEFT_BROW_UP].y-landmarks[LEFT].y)/facesize-0.001));
             playMorphTarget(obj,'browOuterUpLeft',3000*positiveOrZero((landmarks[RIGHT_BROW_UP].y-landmarks[RIGHT].y)/facesize-0.001));
             playMorphTarget(obj,'browOuterUpRight',3000*positiveOrZero((landmarks[LEFT_BROW_UP].y-landmarks[LEFT].y)/facesize-0.001));
 /*
             //            playMorphTarget(obj,'browOuterUpRight',200*((landmarks[RIGHT_BROW_UP].y-landmarks[RIGHT].y)/facesize)-0.1);
 
             //getBone(document.getElementById("self-view").object3D,'head').rotation.x=0
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

            drawLandmarks(canvasCtx, newArray, { color: '#FF10F0', lineWidth: 2, radius: 2 });
            //drawConnectors(canvasCtx, landmarks, FACEMESH_LIPS, { color: '#E0E0E0' });
        }
    }
    canvasCtx.restore();
}

function blendshapeLimit(val) {
    if (val > 1) return 1;
    if (val < 0) return 0;
    return val;
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

if (!mediapipe || mediapipe === "true") {
    const faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });

    faceMesh.setOptions({
        selfieMode: true,
        maxNumFaces: 1,
        refineLandmarks: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResultsFaceMesh);
    /*
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
    */
    const camera = new Camera(video, {
        onFrame: async () => {
            await faceMesh.send({ image: video });
            //   await pose.send({ image: video });
        },
        width: 320,
        height: 180,
        frameRate: 15
    });

}

/*
window.head.rotation.x=-0.6*blendshapes_values[52]/60;
window.head.rotation.y=0.6*blendshapes_values[53]/60;
window.head.rotation.z=0.6*blendshapes_values[54]/60;    
window.neck.rotation.x=-0.4*blendshapes_values[52]/60;
window.neck.rotation.y=0.4*blendshapes_values[53]/60;
window.neck.rotation.z=0.4*blendshapes_values[54]/60;
*/
let MorphData = {};

function getMeshMorphData(obj) {
    let meshMorphData = MorphData[obj.uuid];
    if (!meshMorphData) {
        meshMorphData = [];
        MorphData[obj.uuid] = meshMorphData
        readBlendshapesFromAvatar(meshMorphData, obj);
    }
    if (meshMorphData.length == 0) {
        delete MorphData[obj.uuid];
    }

    return meshMorphData;
}

const readBlendshapesFromAvatar = function (meshMorphData, mesh) {
    meshMorphData['bs'] = [];

    mesh.traverse((o) => {
        if (o.type == 'Bone') {
            if (o.name == 'Neck') {
                meshMorphData['neck'] = o;
            } else if (o.name == 'Head') {
                meshMorphData['head'] = o;
            }
        }

        if (o.morphTargetInfluences && o.userData.targetNames) {
            meshMorphData['bs'].push(o);
        }
        /*
              if (o.morphTargetInfluences && o.userData.targetNames) {        
                for (let i = 0; i < o.userData.targetNames.length; i++) {
                    meshMorphData[o.userData.targetNames[i]]= o.morphTargetInfluences[i];
                    o.morphTargetInfluences[i] = 0;
                }
                console.log(o.type, o.name, o);
              }
              */
    });
}

const getBone = function (obj, bone) {
    let meshMorphData = getMeshMorphData(obj);
    return meshMorphData[bone];
}

const playMorphTargetBack = function (obj, blendshape, amount) {
    let meshMorphData = getMeshMorphData(obj);
    meshMorphData[blendshape] = amount;
}


const playMorphTarget = function (obj, blendshape, amount) {
    amount = blendshapeLimit(amount);
    let meshMorphData = getMeshMorphData(obj);
    meshMorphData['bs'].map(function (o, i) {
        if (o.morphTargetInfluences && o.userData.targetNames) {
            var pos = o.userData.targetNames.findIndex(item => blendshape.toLowerCase() === item.toLowerCase());
            if (pos === -1) return;

            o.morphTargetInfluences[pos] = amount;
        }

    });
}

function avatarHeight(obj) {
    var box = new THREE.Box3().setFromObject(obj);
    return box.max.y - box.min.y;
}

let rpm_blendshapes = ["browDownLeft", "browDownRight", "browInnerUp", "browOuterUpLeft", "browOuterUpRight", "cheekPuff", "cheekSquintLeft", "cheekSquintRight", "eyeBlinkLeft", "eyeBlinkRight", "eyeLookDownLeft", "eyeLookDownRight", "eyeLookInLeft", "eyeLookInRight", "eyeLookOutLeft", "eyeLookOutRight", "eyeLookUpLeft", "eyeLookUpRight", "eyeSquintLeft", "eyeSquintRight", "eyeWideLeft", "eyeWideRight", "jawForward", "jawLeft", "jawOpen", "jawRight", "mouthClose", "mouthDimpleLeft", "mouthDimpleRight", "mouthFrownLeft", "mouthFrownRight", "mouthFunnel", "mouthLeft", "mouthLowerDownLeft", "mouthLowerDownRight", "mouthPressLeft", "mouthPressRight", "mouthPucker", "mouthRight", "mouthRollLower", "mouthRollUpper", "mouthShrugLower", "mouthShrugUpper", "mouthSmileLeft", "mouthSmileRight", "mouthStretchLeft", "mouthStretchRight", "mouthUpperUpLeft", "mouthUpperUpRight", "noseSneerLeft", "noseSneerRight", "tongueOut"];


// iOS ArKit52
function handleMocap(csv) {

    let obj = document.getElementById("self-view").object3D;
    let blendshapes_values = csv.split(',');
    for (let i = 0; i < rpm_blendshapes.length; i++) {
        playMorphTarget(obj, rpm_blendshapes[i], blendshapes_values[i]);
    }

    let head = getBone(obj, 'head');
    let neck = getBone(obj, 'neck');
    head.rotation.x = 0.6 * blendshapes_values[53];
    neck.rotation.x = 0.4 * blendshapes_values[53];
    head.rotation.y = 0.6 * blendshapes_values[52];
    neck.rotation.y = 0.4 * blendshapes_values[52];
    head.rotation.z = 0.6 * blendshapes_values[54];
    neck.rotation.z = 0.4 * blendshapes_values[54];
}

// MediaPipe
window.handleMocap = handleMocap;

document.getElementById("self-view").addEventListener('model-loaded', (e, f) => {
    let obj = document.getElementById("self-view").object3D;
    let height = avatarHeight(obj);
    console.log("avatarHeight", height);
    obj.position.set(0, (-0.1 - height), -0.25);
});


if (!mediapipe || mediapipe === "true") {
    const constraints = {
        video: { width: 320, height: 180, rameRate: 15 },
        audio: true
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        camera.start();
        document.querySelector('a-scene').emit('connect');
    });
} else {
    document.querySelector('a-scene').addEventListener('loaded', function () {
        document.querySelector('a-scene').emit('connect');
    })
    if (document.querySelector('a-scene').emit) {
        document.querySelector('a-scene').emit('connect');
    }
}
