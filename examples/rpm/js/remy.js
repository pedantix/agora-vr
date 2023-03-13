import { Avatar, setPose } from './avatar.js';
  
let scene = document.querySelector('a-scene');
let loader = new THREE.GLTFLoader();

let avatar ;
 
var appid = getParameterByName("appid");
var room = getParameterByName("room");
var clientId = null; // getParameterByName("uid");
var rtmClient = null;
var rtmChannel = null;
var loggedIn = false;

function receiveRTM(senderId, text) {
    if  (text.startsWith('MOCAP')) {
      var msplit = text.split("###");
      var name= msplit[1];
      var paa =  JSON.parse(msplit[2]);
      var zaa =  JSON.parse(msplit[3]);
      //if (window.PAA) {
        setPose(paa, zaa);
      //} 
     // console.log(paa);
     } 
  }

// Agora RTM with VAD Control
async function initRTM() {
  rtmClient = await AgoraRTM.createInstance(appid, { logFilter: AgoraRTM.LOG_FILTER_OFF });
  
  rtmClient.on('ConnectionStateChanged', (newState, reason) => {
  });

    rtmClient.on('MessageFromPeer', ({ text }, senderId) => {
      receiveRTM(senderId, text);
    });
 
  rtmClient.login({ token: null, uid: "22a" }).then(() => {
    rtmChannel = rtmClient.createChannel(room);
    rtmChannel.join().then(() => {
      rtmChannel.on('ChannelMessage', ({ text }, senderId) => {
        receiveRTM(senderId, text);
      });
      loggedIn=true;
    }).catch(error => {
      console.warn('AgoraRTM client join failure', error);
    });
  }).catch(error => {
    console.warn('AgoraRTM client login failure', error);
  });
}



initRTM();    



