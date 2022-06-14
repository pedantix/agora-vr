/* global NAF */
const NoOpAdapter = require('./NoOpAdapter');

class AgoraRtcAdapter extends NoOpAdapter {

  constructor(easyrtc) {
     console.log("BW73 constructor ", easyrtc);
    super();

    this.easyrtc = easyrtc || window.easyrtc;
    this.app = "default";
    this.room = "default";
    this.userid=0;
    this.appid=null;

    this.mediaStreams = {};
    this.remoteClients = {};
    this.pendingMediaRequests = new Map();

    this.enableVideo=false;
    this.enableAudio=false;

    this.localTracks = { videoTrack: null, audioTrack: null };
    this.token=null;
    this.clientId=null;
    this.uid=null;
    this.vbg=false;
    this.virtualBackgroundInstance=null;
	 
    this.serverTimeRequests = 0;
    this.timeOffsets = [];
    this.avgTimeOffset = 0;
    this.agoraClient= AgoraRTC.createClient({mode: "rtc", codec: "vp8"});
    AgoraRTC.loadModule(SegPlugin, {});


    this.easyrtc.setPeerOpenListener((clientId) => {
      const clientConnection = this.easyrtc.getPeerConnectionByUserId(clientId);
      this.remoteClients[clientId] = clientConnection;
    });

    this.easyrtc.setPeerClosedListener((clientId) => {
      delete this.remoteClients[clientId];
    });
  }

  setServerUrl(url) {
     console.log("BW73 setServerUrl ", url);
    this.easyrtc.setSocketUrl(url);
  }

  setBob(bob) {
	  alert(bob);
  }

  setApp(appName) {
     console.log("BW73 setApp ", appName);
    this.app = appName;
    this.appid = appName;
  }

async setRoom(json) {
    json=json.replace(/'/g, '"');
    const obj = JSON.parse(json);
    this.room = obj.name;
    this.vbg=obj.vbg;
    this.easyrtc.joinRoom(this.room, null);
  }

  // options: { datachannel: bool, audio: bool, video: bool }
  setWebRtcOptions(options) {
     console.log("BW73 setWebRtcOptions ", options);
    // this.easyrtc.enableDebug(true);
    this.easyrtc.enableDataChannels(options.datachannel);

    // using Agora

	
    // not easyrtc
    this.easyrtc.enableVideo(false);
    this.easyrtc.enableAudio(false);
    this.easyrtc.enableVideoReceive(false);
    this.easyrtc.enableAudioReceive(false);
  }

  setServerConnectListeners(successListener, failureListener) {
     console.log("BW73 setServerConnectListeners ", successListener, failureListener);
    this.connectSuccess = successListener;
    this.connectFailure = failureListener;
  }

  setRoomOccupantListener(occupantListener) {
     console.log("BW73 setRoomOccupantListener ", occupantListener);
	  
    this.easyrtc.setRoomOccupantListener(function(
      roomName,
      occupants,
      primary
    ) {
      occupantListener(occupants);
    });
  }

  setDataChannelListeners(openListener, closedListener, messageListener) {
     console.log("BW73 setDataChannelListeners  ", openListener, closedListener, messageListener);
    this.easyrtc.setDataChannelOpenListener(openListener);
    this.easyrtc.setDataChannelCloseListener(closedListener);
    this.easyrtc.setPeerListener(messageListener);
  }

  updateTimeOffset() {
     console.log("BW73 updateTimeOffset ");
    const clientSentTime = Date.now() + this.avgTimeOffset;

    return fetch(document.location.href, { method: "HEAD", cache: "no-cache" })
      .then(res => {
        var precision = 1000;
        var serverReceivedTime = new Date(res.headers.get("Date")).getTime() + (precision / 2);
        var clientReceivedTime = Date.now();
        var serverTime = serverReceivedTime + ((clientReceivedTime - clientSentTime) / 2);
        var timeOffset = serverTime - clientReceivedTime;

        this.serverTimeRequests++;

        if (this.serverTimeRequests <= 10) {
          this.timeOffsets.push(timeOffset);
        } else {
          this.timeOffsets[this.serverTimeRequests % 10] = timeOffset;
        }

        this.avgTimeOffset = this.timeOffsets.reduce((acc, offset) => acc += offset, 0) / this.timeOffsets.length;

        if (this.serverTimeRequests > 10) {
          setTimeout(() => this.updateTimeOffset(), 5 * 60 * 1000); // Sync clock every 5 minutes.
        } else {
          this.updateTimeOffset();
        }
      });
  }

  connect() {
     console.log("BW73 connect ");
    Promise.all([
      this.updateTimeOffset(),
      new Promise((resolve, reject) => {
        this._connect(resolve, reject);
      })
    ]).then(([_, clientId]) => {
     console.log("BW73 connected "+clientId);
      this.clientId=clientId;
      this._myRoomJoinTime = this._getRoomJoinTime(clientId);
      this.connectAgora();
      this.connectSuccess(clientId);
    }).catch(this.connectFailure);
  }

  shouldStartConnectionTo(client) {
    return this._myRoomJoinTime <= client.roomJoinTime;
  }

  startStreamConnection(clientId) {
    console.log("BW73 startStreamConnection ",  clientId);
    this.easyrtc.call(
      clientId,
      function(caller, media) {
        if (media === "datachannel") {
          NAF.log.write("Successfully started datachannel to ", caller);
        }
      },
      function(errorCode, errorText) {
        NAF.log.error(errorCode, errorText);
      },
      function(wasAccepted) {
        // console.log("was accepted=" + wasAccepted);
      }
    );
  }

  closeStreamConnection(clientId) {
     console.log("BW73 closeStreamConnection ", clientId);
    this.easyrtc.hangup(clientId);
  }

  sendData(clientId, dataType, data) {
     console.log("BW73 sendData ", clientId, dataType, data);
    // send via webrtc otherwise fallback to websockets
    this.easyrtc.sendData(clientId, dataType, data);
  }

  sendDataGuaranteed(clientId, dataType, data) {
     console.log("BW73 sendDataGuaranteed ", clientId,  dataType, data);
    this.easyrtc.sendDataWS(clientId, dataType, data);
  }

  broadcastData(dataType, data) {
     console.log("BW73 broadcastData ", dataType, data);
    var roomOccupants = this.easyrtc.getRoomOccupantsAsMap(this.room);

    // Iterate over the keys of the easyrtc room occupants map.
    // getRoomOccupantsAsArray uses Object.keys which allocates memory.
    for (var roomOccupant in roomOccupants) {
      if (
        roomOccupants[roomOccupant] &&
        roomOccupant !== this.easyrtc.myEasyrtcid
      ) {
        // send via webrtc otherwise fallback to websockets
        this.easyrtc.sendData(roomOccupant, dataType, data);
      }
    }
  }

  broadcastDataGuaranteed(dataType, data) {
     console.log("BW73 broadcastDataGuaranteed ", dataType, data);
    var destination = { targetRoom: this.room };
    this.easyrtc.sendDataWS(destination, dataType, data);
  }

  getConnectStatus(clientId) {
    console.log("BW73 getConnectStatus ", clientId);
    var status = this.easyrtc.getConnectStatus(clientId);

    if (status == this.easyrtc.IS_CONNECTED) {
      return NAF.adapters.IS_CONNECTED;
    } else if (status == this.easyrtc.NOT_CONNECTED) {
      return NAF.adapters.NOT_CONNECTED;
    } else {
      return NAF.adapters.CONNECTING;
    }
  }

  getMediaStream(clientId, streamName = "audio") {

     console.log("BW73 getMediaStream ", clientId, streamName);

    if (this.mediaStreams[clientId] && this.mediaStreams[clientId][streamName]) {
      NAF.log.write(`Already had ${streamName} for ${clientId}`);
      return Promise.resolve(this.mediaStreams[clientId][streamName]);
    } else {
      NAF.log.write(`Waiting on ${streamName} for ${clientId}`);

      // Create initial pendingMediaRequests with audio|video alias
      if (!this.pendingMediaRequests.has(clientId)) {
        const pendingMediaRequests = {};

        const audioPromise = new Promise((resolve, reject) => {
          pendingMediaRequests.audio = { resolve, reject };
        }).catch(e => NAF.log.warn(`${clientId} getMediaStream Audio Error`, e));
        pendingMediaRequests.audio.promise = audioPromise;

        const videoPromise = new Promise((resolve, reject) => {
          pendingMediaRequests.video = { resolve, reject };
        }).catch(e => NAF.log.warn(`${clientId} getMediaStream Video Error`, e));
        pendingMediaRequests.video.promise = videoPromise;

        this.pendingMediaRequests.set(clientId, pendingMediaRequests);
      }

      const pendingMediaRequests = this.pendingMediaRequests.get(clientId);

      // Create initial pendingMediaRequests with streamName
      if (!pendingMediaRequests[streamName]) {
        const streamPromise = new Promise((resolve, reject) => {
          pendingMediaRequests[streamName] = { resolve, reject };
        }).catch(e => NAF.log.warn(`${clientId} getMediaStream "${streamName}" Error`, e))
        pendingMediaRequests[streamName].promise = streamPromise;
      }

      return this.pendingMediaRequests.get(clientId)[streamName].promise;
    }
  }

  setMediaStream(clientId, stream, streamName) {
    console.log("BW73 setMediaStream ", clientId, stream, streamName);
    const pendingMediaRequests = this.pendingMediaRequests.get(clientId); // return undefined if there is no entry in the Map
    const clientMediaStreams = this.mediaStreams[clientId] = this.mediaStreams[clientId] || {};

    if (streamName === 'default') {
      // Safari doesn't like it when you use a mixed media stream where one of the tracks is inactive, so we
      // split the tracks into two streams.
      // Add mediaStreams audio streamName alias
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length > 0) {
        const audioStream = new MediaStream();
        try {
          audioTracks.forEach(track => audioStream.addTrack(track));
          clientMediaStreams.audio = audioStream;
        } catch(e) {
          NAF.log.warn(`${clientId} setMediaStream "audio" alias Error`, e);
        }

        // Resolve the promise for the user's media stream audio alias if it exists.
        if (pendingMediaRequests) pendingMediaRequests.audio.resolve(audioStream);
      }

      // Add mediaStreams video streamName alias
      const videoTracks = stream.getVideoTracks();
      if (videoTracks.length > 0) {
        const videoStream = new MediaStream();
        try {
          videoTracks.forEach(track => videoStream.addTrack(track));
          clientMediaStreams.video = videoStream;
        } catch(e) {
          NAF.log.warn(`${clientId} setMediaStream "video" alias Error`, e);
        }

        // Resolve the promise for the user's media stream video alias if it exists.
        if (pendingMediaRequests) pendingMediaRequests.video.resolve(videoStream);
      }
    } else {
      clientMediaStreams[streamName] = stream;

      // Resolve the promise for the user's media stream by StreamName if it exists.
      if (pendingMediaRequests && pendingMediaRequests[streamName]) {
        pendingMediaRequests[streamName].resolve(stream);
      }
    }
  }

  addLocalMediaStream(stream, streamName) {
     console.log("BW73 addLocalMediaStream ", stream, streamName);
    const easyrtc = this.easyrtc;
    streamName = streamName || stream.id;
    this.setMediaStream("local", stream, streamName);
    easyrtc.register3rdPartyLocalMediaStream(stream, streamName);

    // Add local stream to existing connections
    Object.keys(this.remoteClients).forEach((clientId) => {
      if (easyrtc.getConnectStatus(clientId) !== easyrtc.NOT_CONNECTED) {
        easyrtc.addStreamToCall(clientId, streamName);
      }
    });
  }

  removeLocalMediaStream(streamName) 
	{
     console.log("BW73 removeLocalMediaStream ", streamName);
    this.easyrtc.closeLocalMediaStream(streamName);
    delete this.mediaStreams["local"][streamName];
  }

  enableMicrophone(enabled) {
     console.log("BW73 enableMicrophone ", enabled);
    this.easyrtc.enableMicrophone(enabled);
  }

  enableCamera(enabled) {
     console.log("BW73 enableCamera ", enabled);
    this.easyrtc.enableCamera(enabled);
  }

  disconnect() {
     console.log("BW73 disconnect ");
    this.easyrtc.disconnect();
  }

async handleUserPublished(user, mediaType) {


}

 handleUserUnpublished(user, mediaType) {
    console.log("BW73 handleUserUnPublished ");
}

async connectAgora() {
  // Add an event listener to play remote tracks when remote user publishes.
  var that=this;
  //this.agoraClient.on("user-published", that.handleUserPublished);
  this.agoraClient.on("user-published", async (user, mediaType) => {

   let clientId = user.uid;
   console.log("BW73 handleUserPublished "+clientId+" "+mediaType,that.agoraClient);
   await that.agoraClient.subscribe(user, mediaType);
   console.log("BW73 handleUserPublished2 "+clientId+" "+that.agoraClient);

   const pendingMediaRequests = that.pendingMediaRequests.get(clientId); 
   const clientMediaStreams = that.mediaStreams[clientId] = that.mediaStreams[clientId] || {};

  if (mediaType === 'audio') {
     const audioStream = new MediaStream();
     console.log("user.audioTrack ",user.audioTrack._mediaStreamTrack);
     audioStream.addTrack(user.audioTrack._mediaStreamTrack);
     clientMediaStreams.audio = audioStream;
     if (pendingMediaRequests) pendingMediaRequests.audio.resolve(audioStream);
  } 

  if (mediaType === 'video') {
     const videoStream = new MediaStream();
     console.log("user.videoTrack ",user.videoTrack._mediaStreamTrack);
     videoStream.addTrack(user.videoTrack._mediaStreamTrack);
     clientMediaStreams.video = videoStream;
     if (pendingMediaRequests) pendingMediaRequests.video.resolve(videoStream);
	  //user.videoTrack
  } 

});

  this.agoraClient.on("user-unpublished", that.handleUserUnpublished);

  console.log("connect agora ");
  // Join a channel and create local tracks. Best practice is to use Promise.all and run them concurrently.
  [ this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack ] = await Promise.all([
    // Join the channel.
    this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null),
    // Create tracks to the local microphone and camera.
    AgoraRTC.createMicrophoneAudioTrack(),
    AgoraRTC.createCameraVideoTrack("360p_4")
  ]);

   await this.agoraClient.publish(Object.values(this.localTracks));
   console.log("publish success");

  // Publish the local video and audio tracks to the channel.
  if ( this.vbg &&  this.localTracks.videoTrack) {
      const imgElement = document.createElement('img');
      imgElement.onload = async() => {
        if (!this.virtualBackgroundInstance) {
	  console.log("SEG INIT ",this.localTracks.videoTrack);
          this.virtualBackgroundInstance = await SegPlugin.inject(this.localTracks.videoTrack, "/assets/wasms").catch(console.error);
	  console.log("SEG INITED");
        }
        this.virtualBackgroundInstance.setOptions({enable: true, background: imgElement});
      }
     imgElement.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAD0lEQVR4XmNg+M+AQDg5AOk9C/VkomzYAAAAAElFTkSuQmCC';
  } 
}

  /**
   * Privates
   */

  async _connect(connectSuccess, connectFailure) {
    var that = this;

  await that.easyrtc.connect(that.app, connectSuccess, connectFailure);


 	/*

    this.easyrtc.setStreamAcceptor(this.setMediaStream.bind(this));

    this.easyrtc.setOnStreamClosed(function(clientId, stream, streamName) {
      delete this.mediaStreams[clientId][streamName];
    });

    if (that.easyrtc.audioEnabled || that.easyrtc.videoEnabled) {
      navigator.mediaDevices.getUserMedia({
        video: that.easyrtc.videoEnabled,
        audio: that.easyrtc.audioEnabled
      }).then(
        function(stream) {
          that.addLocalMediaStream(stream, "default");
          that.easyrtc.connect(that.app, connectSuccess, connectFailure);
        },
        function(errorCode, errmesg) {
          NAF.log.error(errorCode, errmesg);
        }
      );
    } else {
      that.easyrtc.connect(that.app, connectSuccess, connectFailure);
    }
    */
  }

  _getRoomJoinTime(clientId) {
    var myRoomId = this.room; //NAF.room;
    var joinTime = this.easyrtc.getRoomOccupantsAsMap(myRoomId)[clientId]
      .roomJoinTime;
    return joinTime;
  }

  getServerTime() {
    return Date.now() + this.avgTimeOffset;
  }
}

module.exports = AgoraRtcAdapter;
