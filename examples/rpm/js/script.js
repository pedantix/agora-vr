// Avatar SDK

let self_loading = true;
let camera;
const subdomain = 'demo'; // Replace with your custom subdomain
const frame = document.getElementById('frame');
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

function isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  }

var avatar_style = getParameterByName("avatar");
if (!avatar_style) {
    avatar_style = 'rpm';
}
var mediapipe = getParameterByName("mediapipe");

async function subscribe(event) {
    const json = parse(event);
    if (json?.source !== 'readyplayerme') {
        return;
    }
    //console.error(json);
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
        //https://models.readyplayer.me/6429ca28a5da014d03a67079.json
        console.log(`Avatar URL: ${json.data.url}`);
        let jl=json.data.url.replace(".glb",".json");
        const respJson = await fetch(jl).then(r => r.json());
        local_body_gender=respJson.outfitGender;
        console.error('avatar local_body_gender',local_body_gender);

        document.getElementById('frame').hidden = true;
        let v = json.data.url + "?morphTargets=ARKit,eyeLookDownLeft,eyeLookDownRight,eyeLookUpLeft,eyeLookUpRight,eyeLookInLeft,eyeLookInRight,eyeLookOutLeft,eyeLookOutRight,tongueOut";
        MorphData = {};
        self_loading = true;
        document.getElementById('touchmouse').setAttribute('visible','true');
        document.getElementById('loadeye').setAttribute('visible','true');
        document.getElementById('loading').setAttribute('visible','true');

        document.getElementById('player').setAttribute('player-info', 'gltfmodel', v);
        document.getElementById("self-view").setAttribute('gltf-model', v);
     }

    // Get user id
    if (json.eventName === 'v1.user.set') {
        console.log(`User with id ${json.data.id} set: ${JSON.stringify(json)}`);
    }

    //console.warn("json", json);
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


/*
function swivelHead(obj, roll, yaw, pitch) {
    if (avatar_style == 'rpm') {
        let head_rotation_x = 0.1 + 0.6 * -2 * pitch;
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
        let head_rotation_z = -0.15 + 0.6 * 3 * pitch;
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
    } else if (avatar_style == 'nico') {
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
*/

let rpm_blendshapes = ["browDownLeft", "browDownRight", "browInnerUp", "browOuterUpLeft", "browOuterUpRight", "cheekPuff", "cheekSquintLeft", "cheekSquintRight", "eyeBlinkLeft", "eyeBlinkRight", "eyeLookDownLeft", "eyeLookDownRight", "eyeLookInLeft", "eyeLookInRight", "eyeLookOutLeft", "eyeLookOutRight", "eyeLookUpLeft", "eyeLookUpRight", "eyeSquintLeft", "eyeSquintRight", "eyeWideLeft", "eyeWideRight", "jawForward", "jawLeft", "jawOpen", "jawRight", "mouthClose", "mouthDimpleLeft", "mouthDimpleRight", "mouthFrownLeft", "mouthFrownRight", "mouthFunnel", "mouthLeft", "mouthLowerDownLeft", "mouthLowerDownRight", "mouthPressLeft", "mouthPressRight", "mouthPucker", "mouthRight", "mouthRollLower", "mouthRollUpper", "mouthShrugLower", "mouthShrugUpper", "mouthSmileLeft", "mouthSmileRight", "mouthStretchLeft", "mouthStretchRight", "mouthUpperUpLeft", "mouthUpperUpRight", "noseSneerLeft", "noseSneerRight", "tongueOut"];
let BS_YAW=52;
let BS_PITCH=53;
let BS_ROLL=54;
let BS_TOTAL_COUNT=55;

let BODY_GENDER=55; // extra
let BODY_ANIM=56; // extra

//map string to pos
let rpm_blendshape_location_map={};
for (let i=0; i<rpm_blendshapes.length;i++){
    rpm_blendshape_location_map[rpm_blendshapes[i]]=i;
}

var mocap_frames=[]
var mocap_delta=10;
var mocap_forward=40;
var mocap_latency=100;
let remote_arrivals={};
var remote_arrivals_min_time=5000;

function remoteMocap(bs_csv) {
    let blendshapes_values = bs_csv.split(',');
    let remoteClient=blendshapes_values[blendshapes_values.length-1];
    //let t=remote_arrivals[remoteClient];
    let d=Date.now();
    /*
    if (!t) {
        remote_arrivals[remoteClient]=d;
        return;
    }
        if (d-t<remote_arrivals_min_time) {
        console.log("too early for "+remoteClient);
    }

*/
    if (!glb_loaded[remoteClient])
        return;


    // different streams per remote 
    //console.log("bs_csv",bs_csv.length);

    //remoteMocapProcess(bs_csv);
    //return;
    let item={};
    item[0]=Date.now();
    item[1]=blendshapes_values;

    mocap_frames.push(item);
  //  console.log("counting xs length "+mocap_frames.length+" "+ item[0]);
    /*
    while (mocap_frames.length>mocap_forward) {
      console.log("shifting xs "+mocap_frames.length+" "+ item[0]);
      mocap_frames.shift();
    }*/
}

setInterval(remoteMocapOut, mocap_delta);

function remoteMocapOut() {
    if (!mocap_frames.length)
        return;

    let d=Date.now();
    while (mocap_frames.length && d-(mocap_frames[0][0])>=mocap_latency){
      //  console.log("shifting "+mocap_frames[0][0]+" length "+mocap_frames.length);
        let item=mocap_frames.shift();
        //console.log("processing now with latency of ",d,(d-item[0]));
        remoteMocapProcess(item[1]);
    }
}

//let win_anim=0;
// iOS ArKit52
function remoteMocapProcess(blendshapes_values) {

    let remoteClient=blendshapes_values[blendshapes_values.length-1];
    let nn=document.querySelectorAll('[networked-audio-source]');
    for (let n=0; n<nn.length; n++) {
        if (nn[n].components['networked'] && 
            nn[n].components['networked'].data && 
            nn[n].components['networked'].data.owner==remoteClient) {
            //console.log("match ",remoteClient);
            let obj=nn[n].components['networked'].el.object3D;
            try {
              applyMocap(obj,blendshapes_values,-1);    
            } catch (e) {
              //  console.log(e);
            }

            try {
                applyPose(obj);    
              } catch (e) {
                //  console.log(e);
              }

              try {
               // console.log("remoteMocap",blendshapes_values[BODY_ANIM],blendshapes_values);
                applyAnim(obj,blendshapes_values[BODY_GENDER],blendshapes_values[BODY_ANIM]);    
              } catch (e) {
                //  console.log(e);
              }
              
            break;
        }
    }    
}

//document.querySelectorAll('[networked-audio-source]')[1].components['networked'].el.object3D.traverse((o) => {if (o.type == 'Bone') {if (o.name == 'RightArm') {window.RightArm=o} console.log(o.name)}})
function handlePoseMocap(bs_csv) {
    console.log(bs_csv);
}

window.handlePoseMocap = handlePoseMocap;

// iOS ArKit52
function handleMocap(bs_csv) {
    //console.log(Date.now());
    
    console.log("handleMocap "+bs_csv);
    if (window.AgoraRtcAdapter && window.AgoraRtcAdapter.sendMocap)    
    {
        let bs_csv_extra=bs_csv+","+local_body_gender+","+local_body_anim;
        window.AgoraRtcAdapter.sendMocap(bs_csv_extra);
    }
    let blendshapes_values = bs_csv.split(',');
    let obj = document.getElementById("self-view").object3D;
    applyMocap(obj, blendshapes_values,1);
}

let x=false;
let gltf_anims_male;
let gltf_anims_female;


async function loadAnimations(){
    let loader = new THREE.GLTFLoader();
    gltf_anims_female = (await loader.loadAsync('./assets/FemaleRPMAnims.glb'));
    gltf_anims_male = (await loader.loadAsync('./assets/MaleRPMAnims.glb'));
}

async function playAnim(obj,gender,anim_index){
    if (!obj) {
        return;
    }

    if (!gltf_anims_female || !gltf_anims_male) {
        await loadAnimations();
    }
    let gltf_anims;
    if (gender=='feminine') {
        gltf_anims=gltf_anims_female;
    } else {
        gltf_anims=gltf_anims_male;
    }
    let anim_clip = gltf_anims.animations[anim_index]; 
    if (!anim_clip)
        return;
    const mixer_model = obj.children[0];
    if (mixer_model.el.object3D.kanimation_mixer_ord==anim_index) {
        return;
    }
    mixer_model.el.object3D.kanimation_mixer = new THREE.AnimationMixer(mixer_model);
    mixer_model.el.object3D.kanimation_mixer_ord=anim_index;
    const action = mixer_model.el.object3D.kanimation_mixer.clipAction(anim_clip);
    action.play();
}

let animObj;
async function applyAnim(obj,gender,anim_index){
    playAnim(obj,gender,anim_index);
}

AFRAME.registerComponent('animate', {
    schema: {
        enabled: {default: false}
    },
    init: function () {
        this.el.setAttribute('animation-mixer', {
          clip: '*',
          loop: 'repeat',
          crossFadeDuration: 0.5,
        })
    },
    tick: function tick(t, dt) {
      if (this.el.object3D.kanimation_mixer && !isNaN(dt)) {
          this.el.object3D.kanimation_mixer.update(dt / 1000);
        //  console.log(this.el.object3D.kanimation_mixer._actions.length, this.el.object3D.kanimation_mixer._actions[0])
      }
        
    }
});


function applyPose(obj){
    if (!obj || self_loading) {
        return;
    }
    /*
    LeftShoulder: 
106.93, 86.916, 22.384

LeftArm: 
85.722, 9.463, 0.925

LeftForeArm:  
0.556, 2.650, 18.417

LeftHandThumb1: 
15.883, 13.571, 39.602


RightShoulder: 
106.93, -86.916, -22.384

RightArm: 
85.722, -9.463, -0.925

RightForeArm:  
0.556, -2.650, -18.417

RightHandThumb1: 
15.883, -13.571, -39.602

    getBone(obj, 'RightShoulder').rotation.set(THREE.Math.degToRad(106.93), THREE.Math.degToRad(-86.916),THREE.Math.degToRad( -22.384));
    getBone(obj, 'RightArm').rotation.set(THREE.Math.degToRad(85.722),THREE.Math.degToRad(-9.463),THREE.Math.degToRad(-0.925));
    getBone(obj, 'RightForeArm').rotation.set(THREE.Math.degToRad(0.556),THREE.Math.degToRad( -2.650), THREE.Math.degToRad(-18.417));
    getBone(obj, 'RightHandThumb1').rotation.set(THREE.Math.degToRad(15.883), THREE.Math.degToRad(-13.571), THREE.Math.degToRad(-39.602));

    */
   /*
    getBone(obj, 'RightShoulder').rotation.set(106.93, -86.916, -22.384);
    getBone(obj, 'RightArm').rotation.set(85.722, -9.463, -0.925);
    getBone(obj, 'RightForeArm').rotation.set(0.556, -2.650, -18.417);
    getBone(obj, 'RightHandThumb1').rotation.set(15.883, -13.571, -39.602);


    console.log('RightShoulder',getBone(obj,'RightShoulder').rotation);
    console.log('RightArm',getBone(obj,'RightArm').rotation);
    console.log('RightForeArm',getBone(obj,'RightForeArm').rotation);
    console.log('RightHandThumb1',getBone(obj,'RightHandThumb1').rotation);
*/
}

function applyMocap(obj, blendshapes_values,mirror){
    if (!obj || self_loading) {
        return;
    }

    //blendshapes_values[rpm_blendshape_location_map['tongueOut']]=blendshapes_values[rpm_blendshape_location_map['tongueOut']]*0.8; // tongue
    for (let i = 0; i < rpm_blendshapes.length; i++) {
        playMorphTarget(obj, rpm_blendshapes[i], blendshapes_values[i]);
    }

    let head = getBone(obj, 'head');
    let neck = getBone(obj, 'neck');

    let pitch = headLimit(blendshapes_values[BS_PITCH]);
    let yaw = headLimit(blendshapes_values[BS_YAW]);
    let roll = headLimit(blendshapes_values[BS_ROLL]);

    if (avatar_style == 'rpm') {
        head.rotation.x = 0.6 * pitch;
        neck.rotation.x = 0.4 * pitch;
        head.rotation.y = mirror*0.6 * yaw;
        neck.rotation.y = mirror*0.4 * yaw;
        head.rotation.z = mirror*0.6 * roll;
        neck.rotation.z = mirror*0.4 * roll;
    } else if (avatar_style == 'mh') {
        head.rotation.x = 0.6 * roll;
        neck.rotation.x = 0.4 * roll;
        head.rotation.y = -0.6 * yaw;
        neck.rotation.y = -0.4 * yaw;
        head.rotation.z = -0.6 * pitch;
        neck.rotation.z = -0.4 * pitch;
    } else if (avatar_style == 'nico') {
        head.rotation.x = -0.6 * roll;
        neck.rotation.x = - 0.4 * roll;
        head.rotation.y = 0.6 * yaw;
        neck.rotation.y = 0.4 * yaw;
        head.rotation.z = -0.1 + 0.6 * pitch;
        neck.rotation.z = -0.1 + 0.4 * pitch;
    }

}

/*
Arkit 
Mediapipe
*/
let last_pitch=0;
let last_roll=0;
let last_yaw=0;

function onResultsFaceMesh(results) {
    document.body.classList.add('loaded');
    canvasCtx.save();
    canvasCtx.clearRect(0, 0, out.width, out.height);
    canvasCtx.drawImage(results.image, 0, 0, out.width, out.height);
    let obj = document.getElementById("self-view").object3D;
    if (results.multiFaceLandmarks && obj && getBone(obj, 'head')) {
        for (const landmarks of results.multiFaceLandmarks) {

            var newArray = [];
            /*
            newArray.push(landmarks[NOSE]);
            newArray.push(landmarks[NASAL]);
            newArray.push(landmarks[LEFT]);
            newArray.push(landmarks[RIGHT]);
            newArray.push(landmarks[TOP]);
            newArray.push(landmarks[BOTTOM]);
*/
            newArray.push(landmarks[LEFT_LIP]);
            newArray.push(landmarks[RIGHT_LIP]);
            newArray.push(landmarks[TOP_LIP]);
            newArray.push(landmarks[BOTTOM_LIP]);
  /*
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
*/
            //swivelHead(obj, landmarks[LEFT].y - landmarks[RIGHT].y, landmarks[LEFT].z - landmarks[RIGHT].z, landmarks[TOP].z - landmarks[BOTTOM].z);
            let blendshapes=new Array(BS_TOTAL_COUNT).fill(0);
            /*
            let blendshapes=[];
            for (var i = 0; i < BS_TOTAL_COUNT; i++) {
                blendshapes.push(0);
            }*/

            let pitch=landmarks[TOP].z - landmarks[BOTTOM].z;
            let yaw=landmarks[LEFT].z - landmarks[RIGHT].z;
            let roll=landmarks[LEFT].y - landmarks[RIGHT].y;

            let delta_pitch=pitch-last_pitch;
            let delta_yaw=yaw-last_yaw;
            let delta_roll=roll-last_roll;

            let delta_head=Math.sqrt(delta_pitch * delta_pitch + delta_yaw * delta_yaw + delta_roll * delta_roll);

       //     console.log("delta",delta_head);
            if (delta_head<0.01) {
                pitch=last_pitch;
                yaw=last_yaw;
                roll=last_roll;
            } else {
                last_pitch=pitch;
                last_yaw=yaw;
                last_roll=roll;
            }
  
            // keep same if too small change
            blendshapes[BS_PITCH]=-2*(pitch);
            blendshapes[BS_YAW]=3*(yaw);
            blendshapes[BS_ROLL]=-3*(roll);

            let jaw_open= 8 * ldistance(landmarks[BOTTOM_LIP], landmarks[TOP_LIP]); // (landmarks[BOTTOM_LIP].y - landmarks[TOP_LIP].y);
            blendshapes[rpm_blendshape_location_map['jawOpen']]=jaw_open;
            
            if (avatar_style=='nico') {
                if (jaw_open > 0.4) {
                    blendshapes[rpm_blendshape_location_map['tongueOut']]=1;
                }
                else {
                    blendshapes[rpm_blendshape_location_map['tongueOut']]=0;
                }
            }
            blendshapes[rpm_blendshape_location_map['mouthSmileLeft']]= 10 * ldistance(landmarks[BOTTOM_LIP], landmarks[LEFT_LIP]);
            blendshapes[rpm_blendshape_location_map['mouthSmileRight']]= 10 * ldistance(landmarks[BOTTOM_LIP],landmarks[RIGHT_LIP]);

            //console.log(landmarks[BOTTOM_LIP].y-landmarks[LEFT_LIP].y);
            let top = ldistance(landmarks[TOP], landmarks[CENTER_BELOW_NOSE]);
            let left = ldistance(landmarks[LEFT_BROW_UP], landmarks[LEFT_BROW_DOWN]);
            let center = ldistance(landmarks[CENTER_BROW_UP], landmarks[CENTER_BROW_DOWN]);
            let right = ldistance(landmarks[RIGHT_BROW_UP], landmarks[RIGHT_BROW_DOWN]);

            let left_eye = ldistance(landmarks[LEFT_EYE_UP], landmarks[LEFT_EYE_DOWN]);
            let left_eye_h = ldistance(landmarks[LEFT_EYE_LEFT], landmarks[LEFT_EYE_RIGHT]);
            let right_eye = ldistance(landmarks[RIGHT_EYE_UP], landmarks[RIGHT_EYE_DOWN]);
            let right_eye_h = ldistance(landmarks[RIGHT_EYE_LEFT], landmarks[RIGHT_EYE_RIGHT]);
           // console.log(right_eye/right_eye_h,left_eye/left_eye_h);
            let left_eye_ratio=left_eye/left_eye_h;
            let right_eye_ratio=right_eye/right_eye_h;

            //console.log(left_eye_ratio,right_eye_ratio);
            blendshapes[rpm_blendshape_location_map['eyeBlinkLeft']]= (0.42-left_eye_ratio)*20;
            blendshapes[rpm_blendshape_location_map['eyeSquintLeft']]= (0.42-left_eye_ratio)*20;
            blendshapes[rpm_blendshape_location_map['eyeWideLeft']]= (left_eye_ratio-0.42)*7;

            blendshapes[rpm_blendshape_location_map['eyeBlinkRight']]= (0.42-right_eye_ratio)*20;
            blendshapes[rpm_blendshape_location_map['eyeSquintRight']]= (0.42-right_eye_ratio)*20;
            blendshapes[rpm_blendshape_location_map['eyeWideRight']]= (right_eye_ratio-0.42)*7;
            
            let facesize = TOP - CENTER_BELOW_NOSE;
            let left_up = (20 * (left - (0.14 * top / 0.46)))
            let right_up = (20 * (right - (0.14 * top / 0.46)))
            let center_up = (20 * (center - (0.14 * top / 0.46)))
            // console.log(3000*positiveOrZero((landmarks[LEFT_BROW_UP].y-landmarks[LEFT].y)/facesize-0.001),((landmarks[LEFT_BROW_UP].y-landmarks[LEFT].y)/facesize),(landmarks[RIGHT_BROW_UP].y-landmarks[RIGHT].y)/facesize);
            blendshapes[rpm_blendshape_location_map['browInnerUp']]=left_up;
            blendshapes[rpm_blendshape_location_map['browOuterUpLeft']]=left_up;
            blendshapes[rpm_blendshape_location_map['browOuterUpRight']]=right_up;        
            
            handleMocap(blendshapes.join());
            drawLandmarks(canvasCtx, newArray, { color: '#FF10F0', lineWidth: 2, radius: 2 });
            drawConnectors(canvasCtx, landmarks, FACEMESH_FACE_OVAL, {color:  '#FF6700', lineWidth: 1});
        }
    }
    canvasCtx.restore();
}

function headLimit(val) {
    if (val > 0.4) return 0.4;
    if (val < -0.4) return -0.4;
    return val;
}
function blendshapeLimit(val) {
    if (val > 0.9) return 0.9;
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
            if (o.name == 'Neck' || o.name == 'Neck01' || o.name == 'Neck1_M') {
                meshMorphData['neck'] = o;
            } else if (o.name == 'Head' || o.name == 'Head_M') {
                meshMorphData['head'] = o;
            } else {
                meshMorphData[o.name] = o;
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
//            var pos = o.userData.targetNames.findIndex(item => blendshape.toLowerCase() === item.toLowerCase());
            var pos = o.userData.targetNames.findIndex(item => blendshape === item);
            if (pos === -1) return;
            o.morphTargetInfluences[pos] = amount;
        }

    });
}
// female
// script.js:781 2.8858627370837384 2.214193741692381
// script.js:784 2.283948673553403 1.9150916344369762
// script.js:784 3.1112554571379354 2.3407151298180278
//script.js:786 2.158768332019335
// female 

function avatarHeight(obj) {
    var box = new THREE.Box3().setFromObject(obj);

    deltaX = box.max.x - box.min.x;
    deltaY = box.max.y - box.min.y;
    deltaZ = box.max.z - box.min.z;

    var h2= Math.sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);
   // return h2;
  //  console.error(h2,box.max.y - box.min.y);
    return h2;
    //return box.max.y - box.min.y;
}

function testBS() {
    let obj = document.getElementById("self-view").object3D;
    playMorphTarget(obj, rpm_blendshapes[51], 0);
    for (let i = 0; i < rpm_blendshapes.length; i++) {
        let s=i;
        setTimeout(()=> {
            if (s>0)
            playMorphTarget(obj, rpm_blendshapes[s-1], 0);

        playMorphTarget(obj, rpm_blendshapes[s], 1);
        console.log("setting "+rpm_blendshapes[s]);
        },1000*i);
    }
}

// animate loader
//var letters = '0123456789ABCDEF';
var letters = '0000111222333445566778899AA';
let cc = 0;
let ccinc = true;

let colori = 0;
let light_colors = ["#0009FF", "#FF0100", "#FF00B1", "#FFE300", "#00FF0D", "FF6700", "#FF6EC7"];
let disco=false;
let music =new Audio('https://cdn.pixabay.com/audio/2022/08/24/audio_6f2bece4a8.mp3');
function toggleDisco(){
    disco=!disco;
    if (disco) {
    
        music.play();
    } else {
        music.pause();
    }
}

function animateDiscoLight() {

    let light = document.getElementById("dl2");

    if (!disco){
        light.setAttribute('light', "color:#ffffee" );
        light.setAttribute('light', "intensity:0");
        return;
    }

    light.object3D.position.set(Math.random() * 10, Math.random() * 10, Math.random() * 10);    
    light.setAttribute('light', "color:" + light_colors[colori]);
    colori++;
    if (colori>light_colors.length) {1
        colori=0;
    }
    light.setAttribute('light', "intensity:" + 2+Math.random*2);
}

function animateLoading() {
    if (disco) {
        document.getElementById("rig").object3D.rotation.y -= Math.PI / 30;
    }
    if (!document.getElementById("loading")) {
        return;
    }

    if (!self_loading) {
        return;
    }
    var color = '#BF';
    for (var i = 0; i < 4; i++) {
        color += letters[cc];
    }

    if (ccinc) {
        cc++;
    }
    else {
        cc--;
    }

    if (cc >= letters.length) {
        cc--;
        ccinc = false;
    } else if (cc < 0) {
        cc++;
        ccinc = true;
    }

 //   console.warn(color);
    //document.getElementById("loading").object3D.rotation.x -= Math.PI / 64;
    document.getElementById("loadeye").object3D.rotation.z -= Math.PI / 64;
    document.getElementById("loading").setAttribute('color', color);
}
setInterval(() => {
    animateLoading();
}, 30);

/*
setInterval(() => {
    positionSelfView();
}, 1000);
*/
setInterval(() => {
    animateDiscoLight();
}, 120);



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
window.remoteMocap = remoteMocap;

function positionSelfView(){
    if (self_loading) return;
    let obj = document.getElementById("self-view").object3D;
    if (avatar_style == 'nico') {
        obj.position.set(0, -1.1, -0.7);
        obj.rotation.set(0, 0, 0);
        obj.scale.set(1.3, 1.2, 1.2);
    }
    else if (avatar_style == 'rpm') {
        //obj.position.set(0, (0.1 - height), -0.25);
        //obj.position.set(0, (0.74 - height), -0.25);
        //obj.scale.set(0.8, 0.7, 0.7);

        //obj.position.set(-0.05, (1.98 - height), -0.05);
        //obj.scale.set(0.095, 0.095, 0.095);
        //obj.rotation.set(-0.6, 0.5, -0.2);

        //obj.position.set(-0.07, (1.9 - height), -0.05);

        obj.scale.set(0.095, 0.095, 0.095);
        let height = 0.290; //avatarHeight(obj);
        if (local_body_gender=='feminine')
        {
            height = 0.278;
        }

        let w=window.innerWidth;
        console.log(w,height);
        //let extra_height=0.001;
        //console.warn(w);
        if (w<600) {
            obj.position.set(-0.02, (0.07 - height), -0.05);
            obj.rotation.set(-0.4, 0.4, -0.11);
        }
        else if (w<1300) {
            obj.position.set(-0.035, (0.072 - height), -0.05);
            obj.rotation.set(-0.4, 0.5, -0.13);
        } else if (w<1610) {
            obj.position.set(-0.08,  (0.075 - height), -0.05);
            obj.rotation.set(-0.4, 0.7, -0.18);
        } else {
            obj.position.set(-0.10, (0.08 - height), -0.05);
            obj.rotation.set(-0.4, 0.8, -0.21);
        }
 /*    
        obj.scale.set(0.095, 0.095, 0.095);
        let height = avatarHeight(obj);
        console.error(height);
        obj.position.set(-0.07, (0.06 - height), -0.05);
        obj.rotation.set(-0.4, 0.6, -0.15);

  */ 
        // keep for face work
        // obj.position.set(0, (0.35 - height),-0.4);
        // obj.rotation.set(0, 0, 0);
    }
    else if (avatar_style == 'mh') {
        obj.position.set(0, (-0.1 - height), 0);
        obj.rotation.set(-0.436, 0, 0);
        //obj.rotation.set(-0.2, 0, 0);
    }
}
document.getElementById("self-view").addEventListener('model-loaded', (e, f) => {
    if (e.target.id!="self-view")
        return;

    //    let obj = document.getElementById("self-view").object3D;
    document.getElementById('touchmouse').setAttribute('visible','false');
    document.getElementById('loadeye').setAttribute('visible','false');
    document.getElementById('loading').setAttribute('visible','false');
    document.getElementById('uiicons').style.display='block';
    
    self_loading = false;
    // spawn    
    let z=rand(1,3);
    let x=rand(0,2);
    console.error(x,z);
    document.getElementById("rig").object3D.position.set(x,0,z);
    if (z<0) {
        document.getElementById("rig").object3D.rotation.y=Math.PI;
    }
    local_pos_x=document.getElementById("rig").object3D.position.x;
    local_pos_z=document.getElementById("rig").object3D.position.z;
    
    // hide loader 
    if ( Window.sendBlendshapes) {
        Window.sendBlendshapes();        
    }

    document.querySelector('a-scene').emit('connect');
    window._state_stop_at=Date.now();
    setTimeout(() => {
        positionSelfView();
    }, 50);
    positionSelfView();
});

function rand(min,max){
    let b=min+Math.random()*max;
    let r=(new Date()).getMilliseconds()%2 ? 1 : -1;
    b *=r; 
    return b;
}

async function init() {
    if (isMobile()) {
        document.getElementById('touchmouse').setAttribute('value', 'Touch and pinch screen to move around');
        document.getElementById('touchmouse').object3D.position.x=-0.04;
        document.getElementById('touchmouse').object3D.scale.set(0.02,0.02,0.02);
        
    } else 
    {
        document.getElementById('touchmouse').setAttribute('value', 'Use arrow, Q, E keys to move around');
        document.getElementById('touchmouse').object3D.position.x=-0.055;
    }

    if (avatar_style == 'nico') {
        self_loading = true;
        let v = './assets/NicoARKit.glb';
        document.getElementById('player').setAttribute('player-info', 'gltfmodel', v);
        document.getElementById("self-view").setAttribute('gltf-model', v);
    }
    else if (avatar_style == 'mh') {
        self_loading = true;
        let v = './assets/VivianARKit.glb';
        document.getElementById('player').setAttribute('player-info', 'gltfmodel', v);
        document.getElementById("self-view").setAttribute('gltf-model', v);

    }
    else if (avatar_style == 'rpm') {
        frame.src = `https://${subdomain}.readyplayer.me/avatar?frameApi&bodyType=fullbody`;
        document.getElementById('frame').hidden = false;

/*
        let v = "https://models.readyplayer.me/6429ca28a5da014d03a67079.glb?morphTargets=ARKit,eyeLookDownLeft,eyeLookDownRight,eyeLookUpLeft,eyeLookUpRight,eyeLookInLeft,eyeLookInRight,eyeLookOutLeft,eyeLookOutRight,tongueOut";
        document.getElementById('player').setAttribute('player-info', 'gltfmodel', v);
        document.getElementById("self-view").setAttribute('gltf-model', v);
  */
    }

    if (!mediapipe || mediapipe === "true") {
       // console.error("getUserMedia");
       let deviceId=null;
       let cams = await AgoraRTC.getCameras();
       for (var i = 0; i < cams.length; i++) {
         if (cams[i].label.indexOf("FaceTime") == 0) {
           console.warn("select FaceTime camera", cams[i].deviceId);
           deviceId=cams[i].deviceId;   
         }
        }

        const constraints = {
            video: { 
                deviceId : deviceId ? {exact: deviceId} : {} , width: 320, height: 180, rameRate: 15 
            },
            audio: true
        };
        navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
            camera.start();
        });
    }
}

document.querySelector('a-scene').addEventListener('loaded', function () {
    init()
})

document.querySelector('a-scene').addEventListener('deviceorientationpermissiongranted', function () {
    console.log("deviceorientationpermissiongranted");
})

document.body.addEventListener('clientConnected', function (evt) {
    console.log('clientConnected event. clientId =', evt.detail.clientId, evt );
  });

document.body.addEventListener('entityCreated', function (evt) {
console.log('entityCreated event', evt.detail.el, evt);
});

document.body.addEventListener('connected', function (evt) {
console.log('connected event. clientId =', evt.detail.clientId, evt);
});

window.addEventListener('resize', function(event) {    
    //positionSelfView();
    setTimeout(() => {
        positionSelfView();
    }, 50);
}, true);
