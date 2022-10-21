function getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    var ret= decodeURIComponent(results[2].replace(/\+/g, ' '));
    if (ret && ret.length>0)
      return ret;
    else
      return null;
  }

var appid = getParameterByName("appid");// "20b7c51ff4c644ab80cf5a4e646b0537";
var room = getParameterByName("channel");
var clientId =  getParameterByName("uid");
var token = null;
var agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

async function agoraPublish() {
  await agoraClient.join(appid, room, token || null, clientId || null);
  var audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
  var stream = document.getElementById("avatar_canvas").captureStream(30);
  var videoTrack = AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: stream.getVideoTracks()[0] })
  await agoraClient.publish([videoTrack,audioTrack]);
}

async function agoraUnpublish() {
  await agoraClient.unpublish();
  await agoraClient.leave();      
}

window.addEventListener('load', function () {
  var publishing = false;
  const pubButton = document.getElementById("publish");
  pubButton.addEventListener("click", () => {
    if (publishing) {
      agoraUnpublish();
      pubButton.innerHTML = "Publish";          
      publishing = false;
    } else {
      agoraPublish()
      pubButton.innerHTML = "Stop";
      publishing = true;
    }
  });

  var hiding = false;
  const panelButton = document.getElementById("panel");
  const cp = document.getElementById("control-panel");
  panelButton.addEventListener("click", () => {
    if (hiding) {
      cp.style.display="block";
      panelButton.innerHTML = "Hide Controls";          
      hiding = false;
    } else {
      cp.style.display="none";
      panelButton.innerHTML = "Show Controls";
      hiding = true;
    }
  });

});
