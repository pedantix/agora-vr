/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports) {

class AgoraRtcAdapter {

  constructor(easyrtc) {
    console.log("BW73 constructor ", easyrtc);

    this.easyrtc = easyrtc || window.easyrtc;
    this.app = "default";
    this.room = "default";
    this.userid = 0;
    this.appid = null;

    this.mediaStreams = {};
    this.remoteClients = {};
    this.pendingMediaRequests = new Map();

    this.enableVideo = false;
    this.enableAudio = false;
    this.enableAvatar = false;

    this.localTracks = { videoTrack: null, audioTrack: null };
    this.token = null;
    this.clientId = null;
    this.uid = null;
    this.vbg = false;
    this.showLocal = false;
    this.virtualBackgroundInstance = null;
    this.denoiser = null;
    this.processor = null;
    this.pipeProcessor = (track, processor) => {
      track.pipe(processor).pipe(track.processorDestination);
    };

    this.serverTimeRequests = 0;
    this.timeOffsets = [];
    this.avgTimeOffset = 0;
    this.agoraClient = null;
    //AgoraRTC.loadModule(SegPlugin, {});

    this.easyrtc.setPeerOpenListener(clientId => {
      const clientConnection = this.easyrtc.getPeerConnectionByUserId(clientId);
      this.remoteClients[clientId] = clientConnection;
    });

    this.easyrtc.setPeerClosedListener(clientId => {
      delete this.remoteClients[clientId];
    });
  }

  setServerUrl(url) {
    console.log("BW73 setServerUrl ", url);
    this.easyrtc.setSocketUrl(url);
  }

  setApp(appName) {
    console.log("BW73 setApp ", appName);
    this.app = appName;
    this.appid = appName;
  }

  async setRoom(json) {
    json = json.replace(/'/g, '"');
    const obj = JSON.parse(json);
    this.room = obj.name;

    if (obj.vbg) {
      this.vbg = obj.vbg;
      if (this.vbg) {
        //AgoraRTC.loadModule(SegPlugin, {});
      }
    }

    if (obj.enableAvatar) {
      this.enableAvatar = obj.enableAvatar;
    }

    if (obj.showLocal) {
      this.showLocal = obj.showLocal;
    }
    this.easyrtc.joinRoom(this.room, null);
  }

  // options: { datachannel: bool, audio: bool, video: bool }
  setWebRtcOptions(options) {
    console.log("BW73 setWebRtcOptions ", options);
    // this.easyrtc.enableDebug(true);
    this.easyrtc.enableDataChannels(options.datachannel);

    // using Agora
    this.enableVideo = options.video;
    this.enableAudio = options.audio;

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

    this.easyrtc.setRoomOccupantListener(function (roomName, occupants, primary) {
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

    return fetch(document.location.href, { method: "HEAD", cache: "no-cache" }).then(res => {
      var precision = 1000;
      var serverReceivedTime = new Date(res.headers.get("Date")).getTime() + precision / 2;
      var clientReceivedTime = Date.now();
      var serverTime = serverReceivedTime + (clientReceivedTime - clientSentTime) / 2;
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
    Promise.all([this.updateTimeOffset(), new Promise((resolve, reject) => {
      this._connect(resolve, reject);
    })]).then(([_, clientId]) => {
      console.log("BW73 connected " + clientId);
      this.clientId = clientId;
      this._myRoomJoinTime = this._getRoomJoinTime(clientId);
      this.connectAgora();
      this.connectSuccess(clientId);
    }).catch(this.connectFailure);
  }

  shouldStartConnectionTo(client) {
    return this._myRoomJoinTime <= client.roomJoinTime;
  }

  startStreamConnection(clientId) {
    console.log("BW73 startStreamConnection ", clientId);
    this.easyrtc.call(clientId, function (caller, media) {
      if (media === "datachannel") {
        NAF.log.write("Successfully started datachannel to ", caller);
      }
    }, function (errorCode, errorText) {
      NAF.log.error(errorCode, errorText);
    }, function (wasAccepted) {
      // console.log("was accepted=" + wasAccepted);
    });
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
    console.log("BW73 sendDataGuaranteed ", clientId, dataType, data);
    this.easyrtc.sendDataWS(clientId, dataType, data);
  }

  broadcastData(dataType, data) {
    console.log("BW73 broadcastData ", dataType, data);
    var roomOccupants = this.easyrtc.getRoomOccupantsAsMap(this.room);

    // Iterate over the keys of the easyrtc room occupants map.
    // getRoomOccupantsAsArray uses Object.keys which allocates memory.
    for (var roomOccupant in roomOccupants) {
      if (roomOccupants[roomOccupant] && roomOccupant !== this.easyrtc.myEasyrtcid) {
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
        }).catch(e => NAF.log.warn(`${clientId} getMediaStream "${streamName}" Error`, e));
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
        } catch (e) {
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
        } catch (e) {
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
    Object.keys(this.remoteClients).forEach(clientId => {
      if (easyrtc.getConnectStatus(clientId) !== easyrtc.NOT_CONNECTED) {
        easyrtc.addStreamToCall(clientId, streamName);
      }
    });
  }

  removeLocalMediaStream(streamName) {
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

  async handleUserPublished(user, mediaType) {}

  handleUserUnpublished(user, mediaType) {
    console.log("BW73 handleUserUnPublished ");
  }

  async connectAgora() {
    // Add an event listener to play remote tracks when remote user publishes.
    var that = this;

    if (this.enableVideo || this.enableAudio) {
      this.agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    } else {
      this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    }

    this.agoraClient.on("user-published", async (user, mediaType) => {

      let clientId = user.uid;
      console.log("BW73 handleUserPublished " + clientId + " " + mediaType, that.agoraClient);
      await that.agoraClient.subscribe(user, mediaType);
      console.log("BW73 handleUserPublished2 " + clientId + " " + that.agoraClient);

      const pendingMediaRequests = that.pendingMediaRequests.get(clientId);
      const clientMediaStreams = that.mediaStreams[clientId] = that.mediaStreams[clientId] || {};

      if (mediaType === 'audio') {
        const audioStream = new MediaStream();
        console.log("user.audioTrack ", user.audioTrack._mediaStreamTrack);
        audioStream.addTrack(user.audioTrack._mediaStreamTrack);
        clientMediaStreams.audio = audioStream;
        if (pendingMediaRequests) pendingMediaRequests.audio.resolve(audioStream);
      }

      if (mediaType === 'video') {
        const videoStream = new MediaStream();
        console.log("user.videoTrack ", user.videoTrack._mediaStreamTrack);
        videoStream.addTrack(user.videoTrack._mediaStreamTrack);
        clientMediaStreams.video = videoStream;
        if (pendingMediaRequests) pendingMediaRequests.video.resolve(videoStream);
        //user.videoTrack
      }
    });

    this.agoraClient.on("user-unpublished", that.handleUserUnpublished);

    console.log("connect agora ");
    // Join a channel and create local tracks. Best practice is to use Promise.all and run them concurrently.
    // o


    if (this.enableAvatar) {
      var stream = document.getElementById("canvas").captureStream(30);
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: stream.getVideoTracks()[0] })]);
    } else if (this.enableVideo && this.enableAudio) {
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack({ encoderConfig: '360p_4' })]);
    } else if (this.enableVideo) {
      [this.userid, this.localTracks.videoTrack] = await Promise.all([
      // Join the channel.
      this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createCameraVideoTrack("360p_4")]);
    } else if (this.enableAudio) {
      [this.userid, this.localTracks.audioTrack] = await Promise.all([
      // Join the channel.
      this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack()]);
    } else {
      this.userid = await this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null);
    }

    if (this.enableVideo && this.showLocal) {
      this.localTracks.videoTrack.play("local-player");
    }

    // select facetime camera if exists
    let cams = await AgoraRTC.getCameras();
    for (var i = 0; i < cams.length; i++) {
      if (cams[i].label.indexOf("FaceTime") == 0) {
        console.log("select FaceTime camera", cams[i].deviceId);
        await this.localTracks.videoTrack.setDevice(cams[i].deviceId);
      }
    }

    // Enable virtual background
    if (this.enableVideo && this.vbg && this.localTracks.videoTrack) {

      this.denoiser = this.denoiser || (await (async () => {
        let denoiser = new VirtualBackgroundExtension();
        AgoraRTC.registerExtensions([denoiser]);
        return denoiser;
      })());

      this.processor = this.processor || (await (async () => {
        let processor = this.denoiser.createProcessor();
        processor.eventBus.on("PERFORMANCE_WARNING", () => {
          console.warn("VBR Performance warning");
        });
        try {
          await processor.init("/assets/wasms");
        } catch (error) {
          console.error(error);
          processor = null;
        }
        return processor;
      })());

      await this.pipeProcessor(this.localTracks.videoTrack, this.processor);
      await this.processor.setOptions({ type: 'color', color: "#00ff00" });

      // var that=this;
      //  setTimeout(function(){that.processor.enable()}, 10000);
      //  setTimeout(function(){ that.pipeProcessor(that.localTracks.videoTrack, that.processor)}, 10000);
      await this.processor.enable();

      /* // old method
             const imgElement = document.createElement('img');
             imgElement.onload = async () => {
               if (!this.virtualBackgroundInstance) {
                 console.log("SEG INIT ", this.localTracks.videoTrack);
                 this.virtualBackgroundInstance = await SegPlugin.inject(this.localTracks.videoTrack, "/assets/wasms").catch(console.error);
                 console.log("SEG INITED");
               }
               this.virtualBackgroundInstance.setOptions({ enable: true, background: imgElement });
             };
             imgElement.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAD0lEQVR4XmNg+M+AQDg5AOk9C/VkomzYAAAAAElFTkSuQmCC';
      */
    }

    // Publish the local video and audio tracks to the channel.
    if (this.enableVideo || this.enableAudio || this.enableAvatar) {
      await this.agoraClient.publish(Object.values(this.localTracks));
      console.log("publish success");
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
    var joinTime = this.easyrtc.getRoomOccupantsAsMap(myRoomId)[clientId].roomJoinTime;
    return joinTime;
  }

  getServerTime() {
    return Date.now() + this.avgTimeOffset;
  }
}

NAF.adapters.register("agorartc", AgoraRtcAdapter);

module.exports = AgoraRtcAdapter;

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZUF1ZGlvIiwiZW5hYmxlQXZhdGFyIiwibG9jYWxUcmFja3MiLCJ2aWRlb1RyYWNrIiwiYXVkaW9UcmFjayIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJzaG93TG9jYWwiLCJ2aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlIiwiZGVub2lzZXIiLCJwcm9jZXNzb3IiLCJwaXBlUHJvY2Vzc29yIiwidHJhY2siLCJwaXBlIiwicHJvY2Vzc29yRGVzdGluYXRpb24iLCJzZXJ2ZXJUaW1lUmVxdWVzdHMiLCJ0aW1lT2Zmc2V0cyIsImF2Z1RpbWVPZmZzZXQiLCJhZ29yYUNsaWVudCIsInNldFBlZXJPcGVuTGlzdGVuZXIiLCJjbGllbnRDb25uZWN0aW9uIiwiZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZCIsInNldFBlZXJDbG9zZWRMaXN0ZW5lciIsInNldFNlcnZlclVybCIsInVybCIsInNldFNvY2tldFVybCIsInNldEFwcCIsImFwcE5hbWUiLCJzZXRSb29tIiwianNvbiIsInJlcGxhY2UiLCJvYmoiLCJKU09OIiwicGFyc2UiLCJuYW1lIiwiam9pblJvb20iLCJzZXRXZWJSdGNPcHRpb25zIiwib3B0aW9ucyIsImVuYWJsZURhdGFDaGFubmVscyIsImRhdGFjaGFubmVsIiwidmlkZW8iLCJhdWRpbyIsImVuYWJsZVZpZGVvUmVjZWl2ZSIsImVuYWJsZUF1ZGlvUmVjZWl2ZSIsInNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMiLCJzdWNjZXNzTGlzdGVuZXIiLCJmYWlsdXJlTGlzdGVuZXIiLCJjb25uZWN0U3VjY2VzcyIsImNvbm5lY3RGYWlsdXJlIiwic2V0Um9vbU9jY3VwYW50TGlzdGVuZXIiLCJvY2N1cGFudExpc3RlbmVyIiwicm9vbU5hbWUiLCJvY2N1cGFudHMiLCJwcmltYXJ5Iiwic2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMiLCJvcGVuTGlzdGVuZXIiLCJjbG9zZWRMaXN0ZW5lciIsIm1lc3NhZ2VMaXN0ZW5lciIsInNldERhdGFDaGFubmVsT3Blbkxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyIiwic2V0UGVlckxpc3RlbmVyIiwidXBkYXRlVGltZU9mZnNldCIsImNsaWVudFNlbnRUaW1lIiwiRGF0ZSIsIm5vdyIsImZldGNoIiwiZG9jdW1lbnQiLCJsb2NhdGlvbiIsImhyZWYiLCJtZXRob2QiLCJjYWNoZSIsInRoZW4iLCJyZXMiLCJwcmVjaXNpb24iLCJzZXJ2ZXJSZWNlaXZlZFRpbWUiLCJoZWFkZXJzIiwiZ2V0IiwiZ2V0VGltZSIsImNsaWVudFJlY2VpdmVkVGltZSIsInNlcnZlclRpbWUiLCJ0aW1lT2Zmc2V0IiwicHVzaCIsInJlZHVjZSIsImFjYyIsIm9mZnNldCIsImxlbmd0aCIsInNldFRpbWVvdXQiLCJjb25uZWN0IiwiUHJvbWlzZSIsImFsbCIsInJlc29sdmUiLCJyZWplY3QiLCJfY29ubmVjdCIsIl8iLCJfbXlSb29tSm9pblRpbWUiLCJfZ2V0Um9vbUpvaW5UaW1lIiwiY29ubmVjdEFnb3JhIiwiY2F0Y2giLCJzaG91bGRTdGFydENvbm5lY3Rpb25UbyIsImNsaWVudCIsInJvb21Kb2luVGltZSIsInN0YXJ0U3RyZWFtQ29ubmVjdGlvbiIsImNhbGwiLCJjYWxsZXIiLCJtZWRpYSIsIk5BRiIsIndyaXRlIiwiZXJyb3JDb2RlIiwiZXJyb3JUZXh0IiwiZXJyb3IiLCJ3YXNBY2NlcHRlZCIsImNsb3NlU3RyZWFtQ29ubmVjdGlvbiIsImhhbmd1cCIsInNlbmREYXRhIiwiZGF0YVR5cGUiLCJkYXRhIiwic2VuZERhdGFHdWFyYW50ZWVkIiwic2VuZERhdGFXUyIsImJyb2FkY2FzdERhdGEiLCJyb29tT2NjdXBhbnRzIiwiZ2V0Um9vbU9jY3VwYW50c0FzTWFwIiwicm9vbU9jY3VwYW50IiwibXlFYXN5cnRjaWQiLCJicm9hZGNhc3REYXRhR3VhcmFudGVlZCIsImRlc3RpbmF0aW9uIiwidGFyZ2V0Um9vbSIsImdldENvbm5lY3RTdGF0dXMiLCJzdGF0dXMiLCJJU19DT05ORUNURUQiLCJhZGFwdGVycyIsIk5PVF9DT05ORUNURUQiLCJDT05ORUNUSU5HIiwiZ2V0TWVkaWFTdHJlYW0iLCJzdHJlYW1OYW1lIiwiaGFzIiwiYXVkaW9Qcm9taXNlIiwiZSIsIndhcm4iLCJwcm9taXNlIiwidmlkZW9Qcm9taXNlIiwic2V0Iiwic3RyZWFtUHJvbWlzZSIsInNldE1lZGlhU3RyZWFtIiwic3RyZWFtIiwiY2xpZW50TWVkaWFTdHJlYW1zIiwiYXVkaW9UcmFja3MiLCJnZXRBdWRpb1RyYWNrcyIsImF1ZGlvU3RyZWFtIiwiTWVkaWFTdHJlYW0iLCJmb3JFYWNoIiwiYWRkVHJhY2siLCJ2aWRlb1RyYWNrcyIsImdldFZpZGVvVHJhY2tzIiwidmlkZW9TdHJlYW0iLCJhZGRMb2NhbE1lZGlhU3RyZWFtIiwiaWQiLCJyZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbSIsIk9iamVjdCIsImtleXMiLCJhZGRTdHJlYW1Ub0NhbGwiLCJyZW1vdmVMb2NhbE1lZGlhU3RyZWFtIiwiY2xvc2VMb2NhbE1lZGlhU3RyZWFtIiwiZW5hYmxlTWljcm9waG9uZSIsImVuYWJsZWQiLCJlbmFibGVDYW1lcmEiLCJkaXNjb25uZWN0IiwiaGFuZGxlVXNlclB1Ymxpc2hlZCIsInVzZXIiLCJtZWRpYVR5cGUiLCJoYW5kbGVVc2VyVW5wdWJsaXNoZWQiLCJ0aGF0IiwiQWdvcmFSVEMiLCJjcmVhdGVDbGllbnQiLCJtb2RlIiwiY29kZWMiLCJvbiIsInN1YnNjcmliZSIsIl9tZWRpYVN0cmVhbVRyYWNrIiwiZ2V0RWxlbWVudEJ5SWQiLCJjYXB0dXJlU3RyZWFtIiwiam9pbiIsImNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrIiwiY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayIsIm1lZGlhU3RyZWFtVHJhY2siLCJjcmVhdGVDYW1lcmFWaWRlb1RyYWNrIiwiZW5jb2RlckNvbmZpZyIsInBsYXkiLCJjYW1zIiwiZ2V0Q2FtZXJhcyIsImkiLCJsYWJlbCIsImluZGV4T2YiLCJkZXZpY2VJZCIsInNldERldmljZSIsIlZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uIiwicmVnaXN0ZXJFeHRlbnNpb25zIiwiY3JlYXRlUHJvY2Vzc29yIiwiZXZlbnRCdXMiLCJpbml0Iiwic2V0T3B0aW9ucyIsInR5cGUiLCJjb2xvciIsImVuYWJsZSIsInB1Ymxpc2giLCJ2YWx1ZXMiLCJteVJvb21JZCIsImpvaW5UaW1lIiwiZ2V0U2VydmVyVGltZSIsInJlZ2lzdGVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwyQkFBMkIsMEJBQTBCLEVBQUU7UUFDdkQsaUNBQWlDLGVBQWU7UUFDaEQ7UUFDQTtRQUNBOztRQUVBO1FB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TixJQUFwQixDQUR5QixDQUNDO0FBQzFCLFFBQUl3TixXQUFXLEtBQUs3TixPQUFMLENBQWF1SSxxQkFBYixDQUFtQ3FGLFFBQW5DLEVBQTZDek0sUUFBN0MsRUFBdURnRyxZQUF0RTtBQUNBLFdBQU8wRyxRQUFQO0FBQ0Q7O0FBRURDLGtCQUFnQjtBQUNkLFdBQU9oSixLQUFLQyxHQUFMLEtBQWEsS0FBSy9DLGFBQXpCO0FBQ0Q7QUFyaEJtQjs7QUF3aEJ0QndGLElBQUl3QixRQUFKLENBQWErRSxRQUFiLENBQXNCLFVBQXRCLEVBQWtDak8sZUFBbEM7O0FBRUFrTyxPQUFPQyxPQUFQLEdBQWlCbk8sZUFBakIsQyIsImZpbGUiOiJuYWYtYWdvcmEtYWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LmpzXCIpO1xuIiwiY2xhc3MgQWdvcmFSdGNBZGFwdGVyIHtcblxuICBjb25zdHJ1Y3RvcihlYXN5cnRjKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNvbnN0cnVjdG9yIFwiLCBlYXN5cnRjKTtcblxuICAgIHRoaXMuZWFzeXJ0YyA9IGVhc3lydGMgfHwgd2luZG93LmVhc3lydGM7XG4gICAgdGhpcy5hcHAgPSBcImRlZmF1bHRcIjtcbiAgICB0aGlzLnJvb20gPSBcImRlZmF1bHRcIjtcbiAgICB0aGlzLnVzZXJpZCA9IDA7XG4gICAgdGhpcy5hcHBpZCA9IG51bGw7XG5cbiAgICB0aGlzLm1lZGlhU3RyZWFtcyA9IHt9O1xuICAgIHRoaXMucmVtb3RlQ2xpZW50cyA9IHt9O1xuICAgIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLmVuYWJsZVZpZGVvID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVBdWRpbyA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXZhdGFyID0gZmFsc2U7XG5cbiAgICB0aGlzLmxvY2FsVHJhY2tzID0geyB2aWRlb1RyYWNrOiBudWxsLCBhdWRpb1RyYWNrOiBudWxsIH07XG4gICAgdGhpcy50b2tlbiA9IG51bGw7XG4gICAgdGhpcy5jbGllbnRJZCA9IG51bGw7XG4gICAgdGhpcy51aWQgPSBudWxsO1xuICAgIHRoaXMudmJnID0gZmFsc2U7XG4gICAgdGhpcy5zaG93TG9jYWwgPSBmYWxzZTtcbiAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UgPSBudWxsO1xuIHRoaXMuZGVub2lzZXIgPSBudWxsO1xuIHRoaXMucHJvY2Vzc29yID0gbnVsbDtcbiB0aGlzLnBpcGVQcm9jZXNzb3IgPSAodHJhY2ssIHByb2Nlc3NvcikgPT4ge1xuICB0cmFjay5waXBlKHByb2Nlc3NvcikucGlwZSh0cmFjay5wcm9jZXNzb3JEZXN0aW5hdGlvbik7XG4gfVxuXG5cbiAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA9IDA7XG4gICAgdGhpcy50aW1lT2Zmc2V0cyA9IFtdO1xuICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IDA7XG4gICAgdGhpcy5hZ29yYUNsaWVudCA9IG51bGw7XG4gICAgLy9BZ29yYVJUQy5sb2FkTW9kdWxlKFNlZ1BsdWdpbiwge30pO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJPcGVuTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgY29uc3QgY2xpZW50Q29ubmVjdGlvbiA9IHRoaXMuZWFzeXJ0Yy5nZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkKGNsaWVudElkKTtcbiAgICAgIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF0gPSBjbGllbnRDb25uZWN0aW9uO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJDbG9zZWRMaXN0ZW5lcihjbGllbnRJZCA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5yZW1vdGVDbGllbnRzW2NsaWVudElkXTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldFNlcnZlclVybCh1cmwpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0U2VydmVyVXJsIFwiLCB1cmwpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXRTb2NrZXRVcmwodXJsKTtcbiAgfVxuXG4gIHNldEFwcChhcHBOYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldEFwcCBcIiwgYXBwTmFtZSk7XG4gICAgdGhpcy5hcHAgPSBhcHBOYW1lO1xuICAgIHRoaXMuYXBwaWQgPSBhcHBOYW1lO1xuICB9XG5cbiAgYXN5bmMgc2V0Um9vbShqc29uKSB7XG4gICAganNvbiA9IGpzb24ucmVwbGFjZSgvJy9nLCAnXCInKTtcbiAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKGpzb24pO1xuICAgIHRoaXMucm9vbSA9IG9iai5uYW1lO1xuXG4gICAgaWYgKG9iai52YmcpIHtcbiAgICAgICB0aGlzLnZiZyA9IG9iai52Ymc7XG4gICAgICAgaWYgKHRoaXMudmJnKSB7XG4gICAgICAgICAgLy9BZ29yYVJUQy5sb2FkTW9kdWxlKFNlZ1BsdWdpbiwge30pO1xuICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob2JqLmVuYWJsZUF2YXRhcikge1xuICAgICAgdGhpcy5lbmFibGVBdmF0YXIgPSBvYmouZW5hYmxlQXZhdGFyO1xuICAgIH1cblxuICAgIGlmIChvYmouc2hvd0xvY2FsKSB7XG4gICAgICB0aGlzLnNob3dMb2NhbCA9IG9iai5zaG93TG9jYWw7XG4gICAgfVxuICAgIHRoaXMuZWFzeXJ0Yy5qb2luUm9vbSh0aGlzLnJvb20sIG51bGwpO1xuICB9XG5cbiAgLy8gb3B0aW9uczogeyBkYXRhY2hhbm5lbDogYm9vbCwgYXVkaW86IGJvb2wsIHZpZGVvOiBib29sIH1cbiAgc2V0V2ViUnRjT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFdlYlJ0Y09wdGlvbnMgXCIsIG9wdGlvbnMpO1xuICAgIC8vIHRoaXMuZWFzeXJ0Yy5lbmFibGVEZWJ1Zyh0cnVlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlRGF0YUNoYW5uZWxzKG9wdGlvbnMuZGF0YWNoYW5uZWwpO1xuXG4gICAgLy8gdXNpbmcgQWdvcmFcbiAgICB0aGlzLmVuYWJsZVZpZGVvID0gb3B0aW9ucy52aWRlbztcbiAgICB0aGlzLmVuYWJsZUF1ZGlvID0gb3B0aW9ucy5hdWRpbztcblxuICAgIC8vIG5vdCBlYXN5cnRjXG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQXVkaW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVWaWRlb1JlY2VpdmUoZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpb1JlY2VpdmUoZmFsc2UpO1xuICB9XG5cbiAgc2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyhzdWNjZXNzTGlzdGVuZXIsIGZhaWx1cmVMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzIFwiLCBzdWNjZXNzTGlzdGVuZXIsIGZhaWx1cmVMaXN0ZW5lcik7XG4gICAgdGhpcy5jb25uZWN0U3VjY2VzcyA9IHN1Y2Nlc3NMaXN0ZW5lcjtcbiAgICB0aGlzLmNvbm5lY3RGYWlsdXJlID0gZmFpbHVyZUxpc3RlbmVyO1xuICB9XG5cbiAgc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIob2NjdXBhbnRMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciBcIiwgb2NjdXBhbnRMaXN0ZW5lcik7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIoZnVuY3Rpb24gKHJvb21OYW1lLCBvY2N1cGFudHMsIHByaW1hcnkpIHtcbiAgICAgIG9jY3VwYW50TGlzdGVuZXIob2NjdXBhbnRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldERhdGFDaGFubmVsTGlzdGVuZXJzKG9wZW5MaXN0ZW5lciwgY2xvc2VkTGlzdGVuZXIsIG1lc3NhZ2VMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXREYXRhQ2hhbm5lbExpc3RlbmVycyAgXCIsIG9wZW5MaXN0ZW5lciwgY2xvc2VkTGlzdGVuZXIsIG1lc3NhZ2VMaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldERhdGFDaGFubmVsT3Blbkxpc3RlbmVyKG9wZW5MaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldERhdGFDaGFubmVsQ2xvc2VMaXN0ZW5lcihjbG9zZWRMaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJMaXN0ZW5lcihtZXNzYWdlTGlzdGVuZXIpO1xuICB9XG5cbiAgdXBkYXRlVGltZU9mZnNldCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgdXBkYXRlVGltZU9mZnNldCBcIik7XG4gICAgY29uc3QgY2xpZW50U2VudFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGZldGNoKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYsIHsgbWV0aG9kOiBcIkhFQURcIiwgY2FjaGU6IFwibm8tY2FjaGVcIiB9KS50aGVuKHJlcyA9PiB7XG4gICAgICB2YXIgcHJlY2lzaW9uID0gMTAwMDtcbiAgICAgIHZhciBzZXJ2ZXJSZWNlaXZlZFRpbWUgPSBuZXcgRGF0ZShyZXMuaGVhZGVycy5nZXQoXCJEYXRlXCIpKS5nZXRUaW1lKCkgKyBwcmVjaXNpb24gLyAyO1xuICAgICAgdmFyIGNsaWVudFJlY2VpdmVkVGltZSA9IERhdGUubm93KCk7XG4gICAgICB2YXIgc2VydmVyVGltZSA9IHNlcnZlclJlY2VpdmVkVGltZSArIChjbGllbnRSZWNlaXZlZFRpbWUgLSBjbGllbnRTZW50VGltZSkgLyAyO1xuICAgICAgdmFyIHRpbWVPZmZzZXQgPSBzZXJ2ZXJUaW1lIC0gY2xpZW50UmVjZWl2ZWRUaW1lO1xuXG4gICAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cysrO1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPD0gMTApIHtcbiAgICAgICAgdGhpcy50aW1lT2Zmc2V0cy5wdXNoKHRpbWVPZmZzZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aW1lT2Zmc2V0c1t0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyAlIDEwXSA9IHRpbWVPZmZzZXQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IHRoaXMudGltZU9mZnNldHMucmVkdWNlKChhY2MsIG9mZnNldCkgPT4gYWNjICs9IG9mZnNldCwgMCkgLyB0aGlzLnRpbWVPZmZzZXRzLmxlbmd0aDtcblxuICAgICAgaWYgKHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID4gMTApIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgNSAqIDYwICogMTAwMCk7IC8vIFN5bmMgY2xvY2sgZXZlcnkgNSBtaW51dGVzLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb25uZWN0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25uZWN0IFwiKTtcbiAgICBQcm9taXNlLmFsbChbdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2Nvbm5lY3QocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KV0pLnRoZW4oKFtfLCBjbGllbnRJZF0pID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25uZWN0ZWQgXCIgKyBjbGllbnRJZCk7XG4gICAgICB0aGlzLmNsaWVudElkID0gY2xpZW50SWQ7XG4gICAgICB0aGlzLl9teVJvb21Kb2luVGltZSA9IHRoaXMuX2dldFJvb21Kb2luVGltZShjbGllbnRJZCk7XG4gICAgICB0aGlzLmNvbm5lY3RBZ29yYSgpO1xuICAgICAgdGhpcy5jb25uZWN0U3VjY2VzcyhjbGllbnRJZCk7XG4gICAgfSkuY2F0Y2godGhpcy5jb25uZWN0RmFpbHVyZSk7XG4gIH1cblxuICBzaG91bGRTdGFydENvbm5lY3Rpb25UbyhjbGllbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fbXlSb29tSm9pblRpbWUgPD0gY2xpZW50LnJvb21Kb2luVGltZTtcbiAgfVxuXG4gIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzdGFydFN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuY2FsbChjbGllbnRJZCwgZnVuY3Rpb24gKGNhbGxlciwgbWVkaWEpIHtcbiAgICAgIGlmIChtZWRpYSA9PT0gXCJkYXRhY2hhbm5lbFwiKSB7XG4gICAgICAgIE5BRi5sb2cud3JpdGUoXCJTdWNjZXNzZnVsbHkgc3RhcnRlZCBkYXRhY2hhbm5lbCB0byBcIiwgY2FsbGVyKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAoZXJyb3JDb2RlLCBlcnJvclRleHQpIHtcbiAgICAgIE5BRi5sb2cuZXJyb3IoZXJyb3JDb2RlLCBlcnJvclRleHQpO1xuICAgIH0sIGZ1bmN0aW9uICh3YXNBY2NlcHRlZCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJ3YXMgYWNjZXB0ZWQ9XCIgKyB3YXNBY2NlcHRlZCk7XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZVN0cmVhbUNvbm5lY3Rpb24oY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY2xvc2VTdHJlYW1Db25uZWN0aW9uIFwiLCBjbGllbnRJZCk7XG4gICAgdGhpcy5lYXN5cnRjLmhhbmd1cChjbGllbnRJZCk7XG4gIH1cblxuICBzZW5kRGF0YShjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGEgXCIsIGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgLy8gc2VuZCB2aWEgd2VicnRjIG90aGVyd2lzZSBmYWxsYmFjayB0byB3ZWJzb2NrZXRzXG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBzZW5kRGF0YUd1YXJhbnRlZWQoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNlbmREYXRhR3VhcmFudGVlZCBcIiwgY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGFXUyhjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgYnJvYWRjYXN0RGF0YShkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIHJvb21PY2N1cGFudHMgPSB0aGlzLmVhc3lydGMuZ2V0Um9vbU9jY3VwYW50c0FzTWFwKHRoaXMucm9vbSk7XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGtleXMgb2YgdGhlIGVhc3lydGMgcm9vbSBvY2N1cGFudHMgbWFwLlxuICAgIC8vIGdldFJvb21PY2N1cGFudHNBc0FycmF5IHVzZXMgT2JqZWN0LmtleXMgd2hpY2ggYWxsb2NhdGVzIG1lbW9yeS5cbiAgICBmb3IgKHZhciByb29tT2NjdXBhbnQgaW4gcm9vbU9jY3VwYW50cykge1xuICAgICAgaWYgKHJvb21PY2N1cGFudHNbcm9vbU9jY3VwYW50XSAmJiByb29tT2NjdXBhbnQgIT09IHRoaXMuZWFzeXJ0Yy5teUVhc3lydGNpZCkge1xuICAgICAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICAgICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKHJvb21PY2N1cGFudCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIGRlc3RpbmF0aW9uID0geyB0YXJnZXRSb29tOiB0aGlzLnJvb20gfTtcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGFXUyhkZXN0aW5hdGlvbiwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRDb25uZWN0U3RhdHVzIFwiLCBjbGllbnRJZCk7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKTtcblxuICAgIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLklTX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5JU19DT05ORUNURUQ7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuTk9UX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5DT05ORUNUSU5HO1xuICAgIH1cbiAgfVxuXG4gIGdldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW1OYW1lID0gXCJhdWRpb1wiKSB7XG5cbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW1OYW1lKTtcblxuICAgIGlmICh0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gJiYgdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdKSB7XG4gICAgICBOQUYubG9nLndyaXRlKGBBbHJlYWR5IGhhZCAke3N0cmVhbU5hbWV9IGZvciAke2NsaWVudElkfWApO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBOQUYubG9nLndyaXRlKGBXYWl0aW5nIG9uICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG5cbiAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHBlbmRpbmdNZWRpYVJlcXVlc3RzIHdpdGggYXVkaW98dmlkZW8gYWxpYXNcbiAgICAgIGlmICghdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5oYXMoY2xpZW50SWQpKSB7XG4gICAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0ge307XG5cbiAgICAgICAgY29uc3QgYXVkaW9Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIEF1ZGlvIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5wcm9taXNlID0gYXVkaW9Qcm9taXNlO1xuXG4gICAgICAgIGNvbnN0IHZpZGVvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBWaWRlbyBFcnJvcmAsIGUpKTtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucHJvbWlzZSA9IHZpZGVvUHJvbWlzZTtcblxuICAgICAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLnNldChjbGllbnRJZCwgcGVuZGluZ01lZGlhUmVxdWVzdHMpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBzdHJlYW1OYW1lXG4gICAgICBpZiAoIXBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gXCIke3N0cmVhbU5hbWV9XCIgRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnByb21pc2UgPSBzdHJlYW1Qcm9taXNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpW3N0cmVhbU5hbWVdLnByb21pc2U7XG4gICAgfVxuICB9XG5cbiAgc2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7IC8vIHJldHVybiB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm8gZW50cnkgaW4gdGhlIE1hcFxuICAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICAgIGlmIChzdHJlYW1OYW1lID09PSAnZGVmYXVsdCcpIHtcbiAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IGxpa2UgaXQgd2hlbiB5b3UgdXNlIGEgbWl4ZWQgbWVkaWEgc3RyZWFtIHdoZXJlIG9uZSBvZiB0aGUgdHJhY2tzIGlzIGluYWN0aXZlLCBzbyB3ZVxuICAgICAgLy8gc3BsaXQgdGhlIHRyYWNrcyBpbnRvIHR3byBzdHJlYW1zLlxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyBhdWRpbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCBhdWRpb1RyYWNrcyA9IHN0cmVhbS5nZXRBdWRpb1RyYWNrcygpO1xuICAgICAgaWYgKGF1ZGlvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IGF1ZGlvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwiYXVkaW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYXVkaW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIHZpZGVvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IHZpZGVvVHJhY2tzID0gc3RyZWFtLmdldFZpZGVvVHJhY2tzKCk7XG4gICAgICBpZiAodmlkZW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZpZGVvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gdmlkZW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gc2V0TWVkaWFTdHJlYW0gXCJ2aWRlb1wiIGFsaWFzIEVycm9yYCwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSB2aWRlbyBhbGlhcyBpZiBpdCBleGlzdHMuXG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsaWVudE1lZGlhU3RyZWFtc1tzdHJlYW1OYW1lXSA9IHN0cmVhbTtcblxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYnkgU3RyZWFtTmFtZSBpZiBpdCBleGlzdHMuXG4gICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMgJiYgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0ucmVzb2x2ZShzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGFkZExvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgZWFzeXJ0YyA9IHRoaXMuZWFzeXJ0YztcbiAgICBzdHJlYW1OYW1lID0gc3RyZWFtTmFtZSB8fCBzdHJlYW0uaWQ7XG4gICAgdGhpcy5zZXRNZWRpYVN0cmVhbShcImxvY2FsXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgZWFzeXJ0Yy5yZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpO1xuXG4gICAgLy8gQWRkIGxvY2FsIHN0cmVhbSB0byBleGlzdGluZyBjb25uZWN0aW9uc1xuICAgIE9iamVjdC5rZXlzKHRoaXMucmVtb3RlQ2xpZW50cykuZm9yRWFjaChjbGllbnRJZCA9PiB7XG4gICAgICBpZiAoZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSAhPT0gZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICAgIGVhc3lydGMuYWRkU3RyZWFtVG9DYWxsKGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyByZW1vdmVMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW1OYW1lKTtcbiAgICB0aGlzLmVhc3lydGMuY2xvc2VMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpO1xuICAgIGRlbGV0ZSB0aGlzLm1lZGlhU3RyZWFtc1tcImxvY2FsXCJdW3N0cmVhbU5hbWVdO1xuICB9XG5cbiAgZW5hYmxlTWljcm9waG9uZShlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGVuYWJsZU1pY3JvcGhvbmUgXCIsIGVuYWJsZWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpO1xuICB9XG5cbiAgZW5hYmxlQ2FtZXJhKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlQ2FtZXJhIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQ2FtZXJhKGVuYWJsZWQpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZGlzY29ubmVjdCBcIik7XG4gICAgdGhpcy5lYXN5cnRjLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZVVzZXJQdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7fVxuXG4gIGhhbmRsZVVzZXJVbnB1Ymxpc2hlZCh1c2VyLCBtZWRpYVR5cGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclVuUHVibGlzaGVkIFwiKTtcbiAgfVxuXG4gIGFzeW5jIGNvbm5lY3RBZ29yYSgpIHtcbiAgICAvLyBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gcGxheSByZW1vdGUgdHJhY2tzIHdoZW4gcmVtb3RlIHVzZXIgcHVibGlzaGVzLlxuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIHRoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcInJ0Y1wiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci1wdWJsaXNoZWRcIiwgYXN5bmMgKHVzZXIsIG1lZGlhVHlwZSkgPT4ge1xuXG4gICAgICBsZXQgY2xpZW50SWQgPSB1c2VyLnVpZDtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkIFwiICsgY2xpZW50SWQgKyBcIiBcIiArIG1lZGlhVHlwZSwgdGhhdC5hZ29yYUNsaWVudCk7XG4gICAgICBhd2FpdCB0aGF0LmFnb3JhQ2xpZW50LnN1YnNjcmliZSh1c2VyLCBtZWRpYVR5cGUpO1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJQdWJsaXNoZWQyIFwiICsgY2xpZW50SWQgKyBcIiBcIiArIHRoYXQuYWdvcmFDbGllbnQpO1xuXG4gICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoYXQucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTtcbiAgICAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICBjb25zdCBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIuYXVkaW9UcmFjayBcIiwgdXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgYXVkaW9TdHJlYW0uYWRkVHJhY2sodXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucmVzb2x2ZShhdWRpb1N0cmVhbSk7XG4gICAgICB9XG5cbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgY29uc3QgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLnZpZGVvVHJhY2sgXCIsIHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIHZpZGVvU3RyZWFtLmFkZFRyYWNrKHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy52aWRlbyA9IHZpZGVvU3RyZWFtO1xuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgICAvL3VzZXIudmlkZW9UcmFja1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItdW5wdWJsaXNoZWRcIiwgdGhhdC5oYW5kbGVVc2VyVW5wdWJsaXNoZWQpO1xuXG4gICAgY29uc29sZS5sb2coXCJjb25uZWN0IGFnb3JhIFwiKTtcbiAgICAvLyBKb2luIGEgY2hhbm5lbCBhbmQgY3JlYXRlIGxvY2FsIHRyYWNrcy4gQmVzdCBwcmFjdGljZSBpcyB0byB1c2UgUHJvbWlzZS5hbGwgYW5kIHJ1biB0aGVtIGNvbmN1cnJlbnRseS5cbiAgICAvLyBvXG5cblxuIGlmICh0aGlzLmVuYWJsZUF2YXRhcikge1xuICAgICAgICB2YXIgc3RyZWFtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNcIikuY2FwdHVyZVN0cmVhbSgzMCk7XG4gICAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUN1c3RvbVZpZGVvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXSB9KV0pO1xuIH1cbiBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLFxuICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayh7ZW5jb2RlckNvbmZpZzogJzM2MHBfNCd9KV0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgLy8gSm9pbiB0aGUgY2hhbm5lbC5cbiAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayhcIjM2MHBfNFwiKV0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgLy8gSm9pbiB0aGUgY2hhbm5lbC5cbiAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVzZXJpZCA9IGF3YWl0IHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnNob3dMb2NhbCkge1xuICAgICAgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnBsYXkoXCJsb2NhbC1wbGF5ZXJcIik7XG4gICAgfVxuXHQgIFxuICAgIC8vIHNlbGVjdCBmYWNldGltZSBjYW1lcmEgaWYgZXhpc3RzXG4gICAgbGV0IGNhbXMgPSBhd2FpdCBBZ29yYVJUQy5nZXRDYW1lcmFzKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoY2Ftc1tpXS5sYWJlbC5pbmRleE9mKFwiRmFjZVRpbWVcIikgPT0gMCkge1xuXHRjb25zb2xlLmxvZyhcInNlbGVjdCBGYWNlVGltZSBjYW1lcmFcIixjYW1zW2ldLmRldmljZUlkICk7XG4gICAgXHRhd2FpdCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2suc2V0RGV2aWNlKGNhbXNbaV0uZGV2aWNlSWQpO1xuICAgICAgfVxuICAgIH1cblx0ICBcblxuICAgIC8vIEVuYWJsZSB2aXJ0dWFsIGJhY2tncm91bmRcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZyAmJiB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcblxuIHRoaXMuZGVub2lzZXIgPSB0aGlzLmRlbm9pc2VyIHx8IChhd2FpdCAoYXN5bmMgKCk9PntcbiAgICBsZXQgZGVub2lzZXIgPSBuZXcgVmlydHVhbEJhY2tncm91bmRFeHRlbnNpb24oKTtcbiAgICBBZ29yYVJUQy5yZWdpc3RlckV4dGVuc2lvbnMoW2Rlbm9pc2VyXSk7XG4gICAgcmV0dXJuIGRlbm9pc2VyO1xuICB9KSgpKVxuXG4gdGhpcy5wcm9jZXNzb3IgPSB0aGlzLnByb2Nlc3NvciB8fCAoYXdhaXQgKGFzeW5jICgpPT57XG4gICAgbGV0IHByb2Nlc3NvciA9IHRoaXMuZGVub2lzZXIuY3JlYXRlUHJvY2Vzc29yKClcbiAgICBwcm9jZXNzb3IuZXZlbnRCdXMub24oXCJQRVJGT1JNQU5DRV9XQVJOSU5HXCIsICgpID0+IHtcbiAgICAgIGNvbnNvbGUud2FybihcIlZCUiBQZXJmb3JtYW5jZSB3YXJuaW5nXCIpO1xuICAgIH0pXG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHByb2Nlc3Nvci5pbml0KFwiL2Fzc2V0cy93YXNtc1wiKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgICBwcm9jZXNzb3IgPSBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gcHJvY2Vzc29yO1xuICB9KSgpKTtcblxuIGF3YWl0IHRoaXMucGlwZVByb2Nlc3Nvcih0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2ssIHRoaXMucHJvY2Vzc29yKTtcbiBhd2FpdCB0aGlzLnByb2Nlc3Nvci5zZXRPcHRpb25zKHsgdHlwZTogJ2NvbG9yJywgY29sb3I6XCIjMDBmZjAwXCJ9KTtcblxuIC8vIHZhciB0aGF0PXRoaXM7XG4gLy8gIHNldFRpbWVvdXQoZnVuY3Rpb24oKXt0aGF0LnByb2Nlc3Nvci5lbmFibGUoKX0sIDEwMDAwKTtcbiAvLyAgc2V0VGltZW91dChmdW5jdGlvbigpeyB0aGF0LnBpcGVQcm9jZXNzb3IodGhhdC5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLCB0aGF0LnByb2Nlc3Nvcil9LCAxMDAwMCk7XG4gYXdhaXQgdGhpcy5wcm9jZXNzb3IuZW5hYmxlKCk7XG5cblx0LyogLy8gb2xkIG1ldGhvZFxuICAgICAgICBjb25zdCBpbWdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICAgIGltZ0VsZW1lbnQub25sb2FkID0gYXN5bmMgKCkgPT4ge1xuICAgICAgICAgIGlmICghdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklUIFwiLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spO1xuICAgICAgICAgICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlID0gYXdhaXQgU2VnUGx1Z2luLmluamVjdCh0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2ssIFwiL2Fzc2V0cy93YXNtc1wiKS5jYXRjaChjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU0VHIElOSVRFRFwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlLnNldE9wdGlvbnMoeyBlbmFibGU6IHRydWUsIGJhY2tncm91bmQ6IGltZ0VsZW1lbnQgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGltZ0VsZW1lbnQuc3JjID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCxpVkJPUncwS0dnb0FBQUFOU1VoRVVnQUFBQVFBQUFBRENBSUFBQUE3bGptUkFBQUFEMGxFUVZSNFhtTmcrTStBUURnNUFPazlDL1Zrb216WUFBQUFBRWxGVGtTdVFtQ0MnO1xuXHQqL1xuICAgIH1cblxuICAgIC8vIFB1Ymxpc2ggdGhlIGxvY2FsIHZpZGVvIGFuZCBhdWRpbyB0cmFja3MgdG8gdGhlIGNoYW5uZWwuXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gfHwgdGhpcy5lbmFibGVBdWRpbyB8fCB0aGlzLmVuYWJsZUF2YXRhcikge1xuICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKE9iamVjdC52YWx1ZXModGhpcy5sb2NhbFRyYWNrcykpO1xuICAgICAgY29uc29sZS5sb2coXCJwdWJsaXNoIHN1Y2Nlc3NcIik7XG4gICAgfVxuXG4gIH1cblxuICAvKipcbiAgICogUHJpdmF0ZXNcbiAgICovXG5cbiAgYXN5bmMgX2Nvbm5lY3QoY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgYXdhaXQgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG5cbiAgICAvKlxuICAgICAgIHRoaXMuZWFzeXJ0Yy5zZXRTdHJlYW1BY2NlcHRvcih0aGlzLnNldE1lZGlhU3RyZWFtLmJpbmQodGhpcykpO1xuICAgICAgIHRoaXMuZWFzeXJ0Yy5zZXRPblN0cmVhbUNsb3NlZChmdW5jdGlvbihjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV07XG4gICAgICB9KTtcbiAgICAgICBpZiAodGhhdC5lYXN5cnRjLmF1ZGlvRW5hYmxlZCB8fCB0aGF0LmVhc3lydGMudmlkZW9FbmFibGVkKSB7XG4gICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHtcbiAgICAgICAgICB2aWRlbzogdGhhdC5lYXN5cnRjLnZpZGVvRW5hYmxlZCxcbiAgICAgICAgICBhdWRpbzogdGhhdC5lYXN5cnRjLmF1ZGlvRW5hYmxlZFxuICAgICAgICB9KS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgICAgdGhhdC5hZGRMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgXCJkZWZhdWx0XCIpO1xuICAgICAgICAgICAgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnJvckNvZGUsIGVycm1lc2cpIHtcbiAgICAgICAgICAgIE5BRi5sb2cuZXJyb3IoZXJyb3JDb2RlLCBlcnJtZXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICAgIH1cbiAgICAgICovXG4gIH1cblxuICBfZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKSB7XG4gICAgdmFyIG15Um9vbUlkID0gdGhpcy5yb29tOyAvL05BRi5yb29tO1xuICAgIHZhciBqb2luVGltZSA9IHRoaXMuZWFzeXJ0Yy5nZXRSb29tT2NjdXBhbnRzQXNNYXAobXlSb29tSWQpW2NsaWVudElkXS5yb29tSm9pblRpbWU7XG4gICAgcmV0dXJuIGpvaW5UaW1lO1xuICB9XG5cbiAgZ2V0U2VydmVyVGltZSgpIHtcbiAgICByZXR1cm4gRGF0ZS5ub3coKSArIHRoaXMuYXZnVGltZU9mZnNldDtcbiAgfVxufVxuXG5OQUYuYWRhcHRlcnMucmVnaXN0ZXIoXCJhZ29yYXJ0Y1wiLCBBZ29yYVJ0Y0FkYXB0ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFnb3JhUnRjQWRhcHRlcjtcbiJdLCJzb3VyY2VSb290IjoiIn0=