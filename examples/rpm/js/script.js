// Avatar SDK
let avatar_style = 'nico';
let self_loading = true;
let camera;
const subdomain = 'demo'; // Replace with your custom subdomain
const frame = document.getElementById('frame');
frame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi&bodyType=fullbody`;
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
        self_loading = true;
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



function swivelHead(obj, roll, yaw, pitch) {

    if (avatar_style == 'rpm') {
        let head_rotation_x = 0.4 + 0.6 * -2 * pitch;
        let head_rotation_y = 0.6 * 3 * yaw;
        let head_rotation_z = 0.6 * -3 * roll;

        let head = getBone(obj, 'head');
        let head_rotation_delta_z = Math.abs(head.rotation.z - head_rotation_z);
        let head_rotation_delta_y = Math.abs(head.rotation.y - head_rotation_y);
        let head_rotation_delta_x = Math.abs(head.rotation.x - head_rotation_x);
        let delta_breach = 0.012; // 0.007
        if (head_rotation_delta_z > delta_breach || head_rotation_delta_y > delta_breach || head_rotation_delta_x > delta_breach) {
            //                console.log("delta",head_rotation_delta_z,head_rotation_delta_y,head_rotation_delta_x);
            head.rotation.z = head_rotation_z;
            head.rotation.y = head_rotation_y;
            head.rotation.x = head_rotation_x;
            let neck = getBone(obj, 'neck');
            if (neck) {
                neck.rotation.x = 0.4 * -2 * pitch;
                neck.rotation.y = 0.4 * 3 * yaw;
                neck.rotation.z = 0.4 * -3 * roll;
            }
        }
    } else if (avatar_style == 'mh') {
        let head_rotation_x = 0.6 * -3 * roll;
        let head_rotation_z = -0.25 + 0.6 * 3 * pitch;
        let head_rotation_y = 0.6 * (3 * yaw);
        let head = getBone(obj, 'head');
        let head_rotation_delta_z = Math.abs(head.rotation.z - head_rotation_z);
        let head_rotation_delta_y = Math.abs(head.rotation.y - head_rotation_y);
        let head_rotation_delta_x = Math.abs(head.rotation.x - head_rotation_x);
        let delta_breach = 0.012; // 0.007
        if (head_rotation_delta_z > delta_breach || head_rotation_delta_y > delta_breach || head_rotation_delta_x > delta_breach) {
            //                console.log("delta",head_rotation_delta_z,head_rotation_delta_y,head_rotation_delta_x);
            head.rotation.z = head_rotation_z;
            head.rotation.y = head_rotation_y;
            head.rotation.x = head_rotation_x;
            let neck = getBone(obj, 'neck');
            if (neck) {
                neck.rotation.x = 0.4 * -3 * roll;
                neck.rotation.z = -0.25 + 0.4 * 3 * pitch;
                neck.rotation.y = 0.4 * (3 * yaw);
            }
        }
    }else if (avatar_style == 'nico') {
        let head_rotation_x = 0.6 * 3 * roll;
        let head_rotation_z = -0.1 + 0.6 * -3 * pitch;
        let head_rotation_y = 0.6 * (3 * yaw);
        let head = getBone(obj, 'head');
        let head_rotation_delta_z = Math.abs(head.rotation.z - head_rotation_z);
        let head_rotation_delta_y = Math.abs(head.rotation.y - head_rotation_y);
        let head_rotation_delta_x = Math.abs(head.rotation.x - head_rotation_x);
        let delta_breach = 0.012; // 0.007
        if (head_rotation_delta_z > delta_breach || head_rotation_delta_y > delta_breach || head_rotation_delta_x > delta_breach) {
            //                console.log("delta",head_rotation_delta_z,head_rotation_delta_y,head_rotation_delta_x);
            head.rotation.z = head_rotation_z;
            head.rotation.y = head_rotation_y;
            head.rotation.x = head_rotation_x;
            let neck = getBone(obj, 'neck');
            if (neck) {
                neck.rotation.x = 0.4 * 3 * roll;
                neck.rotation.z = -0.1 + 0.4 * -3 * pitch;
                neck.rotation.y = 0.4 * (3 * yaw);
            }
        }
    }
}

function onResultsFaceMesh(results) {
    document.body.classList.add('loaded');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, out.width, out.height);
    canvasCtx.drawImage(results.image, 0, 0, out.width, out.height);
    let obj = document.getElementById("self-view").object3D;
    if (results.multiFaceLandmarks && obj && getBone(obj, 'head')) {
        for (const landmarks of results.multiFaceLandmarks) {

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

            swivelHead(obj, landmarks[LEFT].y - landmarks[RIGHT].y, landmarks[LEFT].z - landmarks[RIGHT].z, landmarks[TOP].z - landmarks[BOTTOM].z);

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

            let facesize = TOP - CENTER_BELOW_NOSE;
            let left_up = (20 * (left - (0.14 * top / 0.46)))
            let right_up = (20 * (right - (0.14 * top / 0.46)))
            let center_up = (20 * (center - (0.14 * top / 0.46)))
            // console.log(3000*positiveOrZero((landmarks[LEFT_BROW_UP].y-landmarks[LEFT].y)/facesize-0.001),((landmarks[LEFT_BROW_UP].y-landmarks[LEFT].y)/facesize),(landmarks[RIGHT_BROW_UP].y-landmarks[RIGHT].y)/facesize);
            playMorphTarget(obj, 'browInnerUp', left_up);
            playMorphTarget(obj, 'browOuterUpLeft', left_up);
            playMorphTarget(obj, 'browOuterUpRight', right_up);

            drawLandmarks(canvasCtx, newArray, { color: '#FF10F0', lineWidth: 2, radius: 2 });

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
    camera = new Camera(video, {
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
        if (o.type == 'Bone' ) {
           // console.log(o.name);
            if (o.name == 'Neck' || o.name == 'Neck01' || o.name == 'Neck1_M') {
                meshMorphData['neck'] = o;
            } else if (o.name == 'Head' || o.name == 'Head_M') {
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
    if (!obj || self_loading) {
        return;
    }

    console.log(Date.now());
    let blendshapes_values = csv.split(',');
    for (let i = 0; i < rpm_blendshapes.length; i++) {
        playMorphTarget(obj, rpm_blendshapes[i], blendshapes_values[i]);
    }

    let head = getBone(obj, 'head');
    let neck = getBone(obj, 'neck');
    let pitch = blendshapes_values[53];
    let yaw = blendshapes_values[52];
    let roll = blendshapes_values[54];

    if (avatar_style == 'rpm') {
        head.rotation.x = 0.6 * pitch;
        neck.rotation.x = 0.4 * pitch;
        head.rotation.y = -0.6 * yaw;
        neck.rotation.y = -0.4 * yaw;
        head.rotation.z = -0.6 * roll;
        neck.rotation.z = -0.4 * roll;
    } else if (avatar_style == 'mh') {
        head.rotation.x = 0.6 * roll;
        neck.rotation.x = 0.4 * roll;
        head.rotation.y = -0.6 * yaw;
        neck.rotation.y = -0.4 * yaw;
        head.rotation.z = -0.6 * pitch;
        neck.rotation.z = -0.4 * pitch;     
    }else if (avatar_style == 'nico') {
        head.rotation.x = -0.6 * roll;
        neck.rotation.x = - 0.4 * roll;
        head.rotation.y = -0.6 * yaw;
        neck.rotation.y = -0.4 * yaw;
        head.rotation.z = -0.1+ 0.6 * pitch;
        neck.rotation.z = -0.1+ 0.4 * pitch;     
    }    

}

///add Q and E keyboard shortcuts to rotate left/right
document.addEventListener('keypress', (event) => {
    var name = event.key;
    var code = event.code;

    switch (code) {
        case 'KeyE':
            document.getElementById("rig").object3D.rotation.y -= Math.PI / 16;
            break;
        case 'KeyQ':
            document.getElementById("rig").object3D.rotation.y += Math.PI / 16;
            break;
    }
}, false);

// MediaPipe
window.handleMocap = handleMocap;

document.getElementById("self-view").addEventListener('model-loaded', (e, f) => {
    let obj = document.getElementById("self-view").object3D;
    let height = avatarHeight(obj);
    console.log("avatarHeight", height);
    if (avatar_style == 'nico') {
        obj.position.set(0, -1.13, -0.45);
    }
    else if (avatar_style == 'rpm') {
        obj.position.set(0, (-0.1 - height), -0.25);
    }
    else { //mh
        obj.position.set(0, (-0.1 - height), 0);
    }
    self_loading = false;
});

function init() {
    if (!mediapipe || mediapipe === "true") {
        const constraints = {
            video: { width: 320, height: 180, rameRate: 15 },
            audio: true
        };
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            camera.start();
        });
    }
    document.querySelector('a-scene').emit('connect');
}

document.querySelector('a-scene').addEventListener('loaded', function () {
    init()
})

if (document.querySelector('a-scene').emit) {
    init();
}

