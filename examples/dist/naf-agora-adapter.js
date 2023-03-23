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
    this.mocapData = "";

    this.mediaStreams = {};
    this.remoteClients = {};
    this.pendingMediaRequests = new Map();

    this.enableVideo = false;
    this.enableVideoFiltered = false;
    this.enableAudio = false;
    this.enableAvatar = false;

    this.localTracks = { videoTrack: null, audioTrack: null };
    window.localTracks = this.localTracks;
    this.token = null;
    this.clientId = null;
    this.uid = null;
    this.vbg = false;
    this.vbg0 = false;
    this.showLocal = false;
    this.virtualBackgroundInstance = null;
    this.extension = null;
    this.processor = null;
    this.pipeProcessor = (track, processor) => {
      track.pipe(processor).pipe(track.processorDestination);
    };

    this.serverTimeRequests = 0;
    this.timeOffsets = [];
    this.avgTimeOffset = 0;
    this.agoraClient = null;

    this.easyrtc.setPeerOpenListener(clientId => {
      const clientConnection = this.easyrtc.getPeerConnectionByUserId(clientId);
      this.remoteClients[clientId] = clientConnection;
    });

    this.easyrtc.setPeerClosedListener(clientId => {
      delete this.remoteClients[clientId];
    });

    this.isChrome = navigator.userAgent.indexOf('Firefox') === -1 && navigator.userAgent.indexOf('Chrome') > -1;

    if (this.isChrome) {
      window.oldRTCPeerConnection = RTCPeerConnection;
      window.RTCPeerConnection = new Proxy(window.RTCPeerConnection, {
        construct: function (target, args) {
          if (args.length > 0) {
            args[0]['encodedInsertableStreams'] = true;
          } else {
            args.push({ 'encodedInsertableStreams': true });
          }
          let pc = new window.oldRTCPeerConnection(args[0]);
          return pc;
        }
      });
    }

    // custom data append params
    this.CustomDataDetector = 'AGORAMOCAP';
    this.CustomDatLengthByteCount = 4;

    window.AgoraRtcAdapter = this;
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

    if (obj.vbg && obj.vbg == 'true') {
      this.vbg = true;
    }

    if (obj.vbg0 && obj.vbg0 == 'true') {
      this.vbg0 = true;
      AgoraRTC.loadModule(SegPlugin, {});
    }

    if (obj.enableAvatar && obj.enableAvatar == 'true') {
      this.enableAvatar = true;
    }

    if (obj.showLocal && obj.showLocal == 'true') {
      this.showLocal = true;
    }

    if (obj.enableVideoFiltered && obj.enableVideoFiltered == 'true') {
      this.enableVideoFiltered = true;
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

  async createEncoder(sender) {

    if (this.isChrome) {
      const streams = sender.createEncodedStreams();
      const textEncoder = new TextEncoder();
      var that = this;
      const transformer = new TransformStream({
        transform(chunk, controller) {
          const mocap = textEncoder.encode(that.mocapData);
          const frame = chunk.data;
          const data = new Uint8Array(chunk.data.byteLength + mocap.byteLength + that.CustomDatLengthByteCount + that.CustomDataDetector.length);
          data.set(new Uint8Array(frame), 0);
          data.set(mocap, frame.byteLength);
          var bytes = that.getIntBytes(mocap.byteLength);
          for (let i = 0; i < that.CustomDatLengthByteCount; i++) {
            data[frame.byteLength + mocap.byteLength + i] = bytes[i];
          }

          // Set magic string at the end
          const magicIndex = frame.byteLength + mocap.byteLength + that.CustomDatLengthByteCount;
          for (let i = 0; i < that.CustomDataDetector.length; i++) {
            data[magicIndex + i] = that.CustomDataDetector.charCodeAt(i);
          }
          chunk.data = data.buffer;
          controller.enqueue(chunk);
        }
      });

      streams.readable.pipeThrough(transformer).pipeTo(streams.writable);
    } else {
      const worker = new Worker('script-transform-worker.js');
      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'registered') {
          resolve();
        }
      });

      const senderTransform = new RTCRtpScriptTransform(worker, { name: 'outgoing', port: senderChannel.port2 }, [senderChannel.port2]);
      senderTransform.port = senderChannel.port1;
      sender.transform = senderTransform;

      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'started') {
          resolve();
        }
      });

      const watermarkInput = document.getElementById('watermark');
      senderChannel.port1.postMessage({ watermark: this.mocapData });
    }
  }

  async createDecoder(receiver, clientId) {
    if (this.isChrome) {
      const streams = receiver.createEncodedStreams();
      const textDecoder = new TextDecoder();
      var that = this;

      const transformer = new TransformStream({
        transform(chunk, controller) {
          const view = new DataView(chunk.data);
          const magicData = new Uint8Array(chunk.data, chunk.data.byteLength - that.CustomDataDetector.length, that.CustomDataDetector.length);
          let magic = [];
          for (let i = 0; i < that.CustomDataDetector.length; i++) {
            magic.push(magicData[i]);
          }
          let magicString = String.fromCharCode(...magic);
          if (magicString === that.CustomDataDetector) {
            const mocapLen = view.getUint32(chunk.data.byteLength - (that.CustomDatLengthByteCount + that.CustomDataDetector.length), false);
            const frameSize = chunk.data.byteLength - (mocapLen + that.CustomDatLengthByteCount + that.CustomDataDetector.length);
            const mocapBuffer = new Uint8Array(chunk.data, frameSize, mocapLen);
            const mocap = textDecoder.decode(mocapBuffer);
            window.remoteMocap(mocap + "," + clientId);
            //  console.error(mocap);        
            const frame = chunk.data;
            chunk.data = new ArrayBuffer(frameSize);
            const data = new Uint8Array(chunk.data);
            data.set(new Uint8Array(frame, 0, frameSize));
          }
          controller.enqueue(chunk);
        }
      });
      streams.readable.pipeThrough(transformer).pipeTo(streams.writable);
    } else {
      const worker = new Worker('script-transform-worker.js');
      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'registered') {
          resolve();
        }
      });

      const receiverTransform = new RTCRtpScriptTransform(worker, { name: 'incoming', port: receiverChannel.port2 }, [receiverChannel.port2]);
      receiverTransform.port = receiverChannel.port1;
      receiver.transform = receiverTransform;
      receiverTransform.port.onmessage = e => {
        window.remoteMocap(e.data + "," + clientId);
      };

      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'started') {
          resolve();
        }
      });
    }
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
    // if ( streamName = "audio") {
    //streamName = "bod_audio";
    //}

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

  getIntBytes(x) {
    var bytes = [];
    var i = this.CustomDatLengthByteCount;
    do {
      bytes[--i] = x & 255;
      x = x >> 8;
    } while (i);
    return bytes;
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

    this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    if (this.enableVideoFiltered || this.enableVideo || this.enableAudio) {
      //this.agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      //this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
      this.agoraClient.setClientRole("host");
    } else {
      //this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "h264" });
      //this.agoraClient = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
    }

    this.agoraClient.on("user-joined", async user => {
      console.warn("user-joined", user);
    });
    this.agoraClient.on("user-published", async (user, mediaType) => {

      let clientId = user.uid;
      console.log("BW73 handleUserPublished " + clientId + " " + mediaType, that.agoraClient);
      await that.agoraClient.subscribe(user, mediaType);
      console.log("BW73 handleUserPublished2 " + clientId + " " + that.agoraClient);

      const pendingMediaRequests = that.pendingMediaRequests.get(clientId);
      const clientMediaStreams = that.mediaStreams[clientId] = that.mediaStreams[clientId] || {};

      if (mediaType === 'audio') {
        user.audioTrack.play();

        const audioStream = new MediaStream();
        console.log("user.audioTrack ", user.audioTrack._mediaStreamTrack);
        //audioStream.addTrack(user.audioTrack._mediaStreamTrack);
        clientMediaStreams.audio = audioStream;
        if (pendingMediaRequests) pendingMediaRequests.audio.resolve(audioStream);
      }

      let videoStream = null;
      if (mediaType === 'video') {
        videoStream = new MediaStream();
        console.log("user.videoTrack ", user.videoTrack._mediaStreamTrack);
        videoStream.addTrack(user.videoTrack._mediaStreamTrack);
        clientMediaStreams.video = videoStream;
        if (pendingMediaRequests) pendingMediaRequests.video.resolve(videoStream);
        //user.videoTrack
      }

      if (clientId == 'CCC') {
        if (mediaType === 'video') {
          // document.getElementById("video360").srcObject=videoStream;
          //document.querySelector("#video360").setAttribute("src", videoStream);
          //document.querySelector("#video360").setAttribute("src", user.videoTrack._mediaStreamTrack);
          //document.querySelector("#video360").srcObject= user.videoTrack._mediaStreamTrack;
          document.querySelector("#video360").srcObject = videoStream;
          document.querySelector("#video360").play();
        }
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      }
      if (clientId == 'DDD') {
        if (mediaType === 'video') {
          user.videoTrack.play("video360");
        }
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
      }

      let enc_id;
      if (mediaType === 'audio') {
        enc_id = user.audioTrack._mediaStreamTrack.id;
      } else {
        enc_id = user.videoTrack._mediaStreamTrack.id;
      }

      //console.warn(mediaType,enc_id);    
      /*
      const pc =this.agoraClient._p2pChannel.connection.peerConnection;
      const receivers = pc.getReceivers();  
      for (let i = 0; i < receivers.length; i++) {
        if (receivers[i].track && receivers[i].track.id===enc_id ) {
          console.warn("Match",mediaType,enc_id);
          this.createDecoder(receivers[i],clientId);
      }
      }
      */
    });

    this.agoraClient.on("user-unpublished", that.handleUserUnpublished);

    console.log("connect agora ");
    // Join a channel and create local tracks. Best practice is to use Promise.all and run them concurrently.
    // o


    if (this.enableAvatar) {
      var stream = document.getElementById("canvas").captureStream(30);
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: stream.getVideoTracks()[0] })]);
    } else if (this.enableVideoFiltered && this.enableAudio) {
      var stream = document.getElementById("canvas_secret").captureStream(30);
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCustomVideoTrack({ mediaStreamTrack: stream.getVideoTracks()[0] })]);
    } else if (this.enableVideo && this.enableAudio) {
      [this.userid, this.localTracks.audioTrack, this.localTracks.videoTrack] = await Promise.all([this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack(), AgoraRTC.createCameraVideoTrack({ encoderConfig: '480p_2' })]);
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

    // select facetime camera if exists
    if (this.enableVideo && !this.enableVideoFiltered) {
      let cams = await AgoraRTC.getCameras();
      for (var i = 0; i < cams.length; i++) {
        if (cams[i].label.indexOf("FaceTime") == 0) {
          console.log("select FaceTime camera", cams[i].deviceId);
          await this.localTracks.videoTrack.setDevice(cams[i].deviceId);
        }
      }
    }

    if (this.enableVideo && this.showLocal) {
      this.localTracks.videoTrack.play("local-player");
    }

    // Enable virtual background OLD Method
    if (this.enableVideo && this.vbg0 && this.localTracks.videoTrack) {
      const imgElement = document.createElement('img');
      imgElement.onload = async () => {
        if (!this.virtualBackgroundInstance) {
          console.log("SEG INIT ", this.localTracks.videoTrack);
          this.virtualBackgroundInstance = await SegPlugin.inject(this.localTracks.videoTrack, "/assets/wasms0").catch(console.error);
          console.log("SEG INITED");
        }
        this.virtualBackgroundInstance.setOptions({ enable: true, background: imgElement });
      };
      imgElement.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAIAAAA7ljmRAAAAD0lEQVR4XmNg+M+AQDg5AOk9C/VkomzYAAAAAElFTkSuQmCC';
    }

    // Enable virtual background New Method
    if (this.enableVideo && this.vbg && this.localTracks.videoTrack) {

      this.extension = new VirtualBackgroundExtension();
      AgoraRTC.registerExtensions([this.extension]);
      this.processor = this.extension.createProcessor();
      await this.processor.init("/assets/wasms");
      this.localTracks.videoTrack.pipe(this.processor).pipe(this.localTracks.videoTrack.processorDestination);
      await this.processor.setOptions({ type: 'color', color: "#00ff00" });
      await this.processor.enable();
    }

    window.localTracks = this.localTracks;

    // Publish the local video and audio tracks to the channel.
    if (this.enableVideo || this.enableAudio || this.enableAvatar) {
      if (this.localTracks.audioTrack) await this.agoraClient.publish(this.localTracks.audioTrack);
      if (this.localTracks.videoTrack) await this.agoraClient.publish(this.localTracks.videoTrack);

      console.log("publish success");
      /*
      const pc =this.agoraClient._p2pChannel.connection.peerConnection;
      const senders = pc.getSenders();
      let i = 0;
      for (i = 0; i < senders.length; i++) {
        if (senders[i].track && (senders[i].track.kind == 'audio' || senders[i].track.kind == 'video' )) {
          this.createEncoder(senders[i]);
        }
      } 
      */
    }

    // RTM
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtb2NhcERhdGEiLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZVZpZGVvRmlsdGVyZWQiLCJlbmFibGVBdWRpbyIsImVuYWJsZUF2YXRhciIsImxvY2FsVHJhY2tzIiwidmlkZW9UcmFjayIsImF1ZGlvVHJhY2siLCJ0b2tlbiIsImNsaWVudElkIiwidWlkIiwidmJnIiwidmJnMCIsInNob3dMb2NhbCIsInZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UiLCJleHRlbnNpb24iLCJwcm9jZXNzb3IiLCJwaXBlUHJvY2Vzc29yIiwidHJhY2siLCJwaXBlIiwicHJvY2Vzc29yRGVzdGluYXRpb24iLCJzZXJ2ZXJUaW1lUmVxdWVzdHMiLCJ0aW1lT2Zmc2V0cyIsImF2Z1RpbWVPZmZzZXQiLCJhZ29yYUNsaWVudCIsInNldFBlZXJPcGVuTGlzdGVuZXIiLCJjbGllbnRDb25uZWN0aW9uIiwiZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZCIsInNldFBlZXJDbG9zZWRMaXN0ZW5lciIsImlzQ2hyb21lIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwiaW5kZXhPZiIsIm9sZFJUQ1BlZXJDb25uZWN0aW9uIiwiUlRDUGVlckNvbm5lY3Rpb24iLCJQcm94eSIsImNvbnN0cnVjdCIsInRhcmdldCIsImFyZ3MiLCJsZW5ndGgiLCJwdXNoIiwicGMiLCJDdXN0b21EYXRhRGV0ZWN0b3IiLCJDdXN0b21EYXRMZW5ndGhCeXRlQ291bnQiLCJzZXRTZXJ2ZXJVcmwiLCJ1cmwiLCJzZXRTb2NrZXRVcmwiLCJzZXRBcHAiLCJhcHBOYW1lIiwic2V0Um9vbSIsImpzb24iLCJyZXBsYWNlIiwib2JqIiwiSlNPTiIsInBhcnNlIiwibmFtZSIsIkFnb3JhUlRDIiwibG9hZE1vZHVsZSIsIlNlZ1BsdWdpbiIsImpvaW5Sb29tIiwic2V0V2ViUnRjT3B0aW9ucyIsIm9wdGlvbnMiLCJlbmFibGVEYXRhQ2hhbm5lbHMiLCJkYXRhY2hhbm5lbCIsInZpZGVvIiwiYXVkaW8iLCJlbmFibGVWaWRlb1JlY2VpdmUiLCJlbmFibGVBdWRpb1JlY2VpdmUiLCJzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzIiwic3VjY2Vzc0xpc3RlbmVyIiwiZmFpbHVyZUxpc3RlbmVyIiwiY29ubmVjdFN1Y2Nlc3MiLCJjb25uZWN0RmFpbHVyZSIsInNldFJvb21PY2N1cGFudExpc3RlbmVyIiwib2NjdXBhbnRMaXN0ZW5lciIsInJvb21OYW1lIiwib2NjdXBhbnRzIiwicHJpbWFyeSIsInNldERhdGFDaGFubmVsTGlzdGVuZXJzIiwib3Blbkxpc3RlbmVyIiwiY2xvc2VkTGlzdGVuZXIiLCJtZXNzYWdlTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbE9wZW5MaXN0ZW5lciIsInNldERhdGFDaGFubmVsQ2xvc2VMaXN0ZW5lciIsInNldFBlZXJMaXN0ZW5lciIsInVwZGF0ZVRpbWVPZmZzZXQiLCJjbGllbnRTZW50VGltZSIsIkRhdGUiLCJub3ciLCJmZXRjaCIsImRvY3VtZW50IiwibG9jYXRpb24iLCJocmVmIiwibWV0aG9kIiwiY2FjaGUiLCJ0aGVuIiwicmVzIiwicHJlY2lzaW9uIiwic2VydmVyUmVjZWl2ZWRUaW1lIiwiaGVhZGVycyIsImdldCIsImdldFRpbWUiLCJjbGllbnRSZWNlaXZlZFRpbWUiLCJzZXJ2ZXJUaW1lIiwidGltZU9mZnNldCIsInJlZHVjZSIsImFjYyIsIm9mZnNldCIsInNldFRpbWVvdXQiLCJjb25uZWN0IiwiUHJvbWlzZSIsImFsbCIsInJlc29sdmUiLCJyZWplY3QiLCJfY29ubmVjdCIsIl8iLCJfbXlSb29tSm9pblRpbWUiLCJfZ2V0Um9vbUpvaW5UaW1lIiwiY29ubmVjdEFnb3JhIiwiY2F0Y2giLCJzaG91bGRTdGFydENvbm5lY3Rpb25UbyIsImNsaWVudCIsInJvb21Kb2luVGltZSIsInN0YXJ0U3RyZWFtQ29ubmVjdGlvbiIsImNhbGwiLCJjYWxsZXIiLCJtZWRpYSIsIk5BRiIsIndyaXRlIiwiZXJyb3JDb2RlIiwiZXJyb3JUZXh0IiwiZXJyb3IiLCJ3YXNBY2NlcHRlZCIsImNsb3NlU3RyZWFtQ29ubmVjdGlvbiIsImhhbmd1cCIsImNyZWF0ZUVuY29kZXIiLCJzZW5kZXIiLCJzdHJlYW1zIiwiY3JlYXRlRW5jb2RlZFN0cmVhbXMiLCJ0ZXh0RW5jb2RlciIsIlRleHRFbmNvZGVyIiwidGhhdCIsInRyYW5zZm9ybWVyIiwiVHJhbnNmb3JtU3RyZWFtIiwidHJhbnNmb3JtIiwiY2h1bmsiLCJjb250cm9sbGVyIiwibW9jYXAiLCJlbmNvZGUiLCJmcmFtZSIsImRhdGEiLCJVaW50OEFycmF5IiwiYnl0ZUxlbmd0aCIsInNldCIsImJ5dGVzIiwiZ2V0SW50Qnl0ZXMiLCJpIiwibWFnaWNJbmRleCIsImNoYXJDb2RlQXQiLCJidWZmZXIiLCJlbnF1ZXVlIiwicmVhZGFibGUiLCJwaXBlVGhyb3VnaCIsInBpcGVUbyIsIndyaXRhYmxlIiwid29ya2VyIiwiV29ya2VyIiwib25tZXNzYWdlIiwiZXZlbnQiLCJzZW5kZXJUcmFuc2Zvcm0iLCJSVENSdHBTY3JpcHRUcmFuc2Zvcm0iLCJwb3J0Iiwic2VuZGVyQ2hhbm5lbCIsInBvcnQyIiwicG9ydDEiLCJ3YXRlcm1hcmtJbnB1dCIsImdldEVsZW1lbnRCeUlkIiwicG9zdE1lc3NhZ2UiLCJ3YXRlcm1hcmsiLCJjcmVhdGVEZWNvZGVyIiwicmVjZWl2ZXIiLCJ0ZXh0RGVjb2RlciIsIlRleHREZWNvZGVyIiwidmlldyIsIkRhdGFWaWV3IiwibWFnaWNEYXRhIiwibWFnaWMiLCJtYWdpY1N0cmluZyIsIlN0cmluZyIsImZyb21DaGFyQ29kZSIsIm1vY2FwTGVuIiwiZ2V0VWludDMyIiwiZnJhbWVTaXplIiwibW9jYXBCdWZmZXIiLCJkZWNvZGUiLCJyZW1vdGVNb2NhcCIsIkFycmF5QnVmZmVyIiwicmVjZWl2ZXJUcmFuc2Zvcm0iLCJyZWNlaXZlckNoYW5uZWwiLCJlIiwic2VuZERhdGEiLCJkYXRhVHlwZSIsInNlbmREYXRhR3VhcmFudGVlZCIsInNlbmREYXRhV1MiLCJicm9hZGNhc3REYXRhIiwicm9vbU9jY3VwYW50cyIsImdldFJvb21PY2N1cGFudHNBc01hcCIsInJvb21PY2N1cGFudCIsIm15RWFzeXJ0Y2lkIiwiYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQiLCJkZXN0aW5hdGlvbiIsInRhcmdldFJvb20iLCJnZXRDb25uZWN0U3RhdHVzIiwic3RhdHVzIiwiSVNfQ09OTkVDVEVEIiwiYWRhcHRlcnMiLCJOT1RfQ09OTkVDVEVEIiwiQ09OTkVDVElORyIsImdldE1lZGlhU3RyZWFtIiwic3RyZWFtTmFtZSIsImhhcyIsImF1ZGlvUHJvbWlzZSIsIndhcm4iLCJwcm9taXNlIiwidmlkZW9Qcm9taXNlIiwic3RyZWFtUHJvbWlzZSIsInNldE1lZGlhU3RyZWFtIiwic3RyZWFtIiwiY2xpZW50TWVkaWFTdHJlYW1zIiwiYXVkaW9UcmFja3MiLCJnZXRBdWRpb1RyYWNrcyIsImF1ZGlvU3RyZWFtIiwiTWVkaWFTdHJlYW0iLCJmb3JFYWNoIiwiYWRkVHJhY2siLCJ2aWRlb1RyYWNrcyIsImdldFZpZGVvVHJhY2tzIiwidmlkZW9TdHJlYW0iLCJ4IiwiYWRkTG9jYWxNZWRpYVN0cmVhbSIsImlkIiwicmVnaXN0ZXIzcmRQYXJ0eUxvY2FsTWVkaWFTdHJlYW0iLCJPYmplY3QiLCJrZXlzIiwiYWRkU3RyZWFtVG9DYWxsIiwicmVtb3ZlTG9jYWxNZWRpYVN0cmVhbSIsImNsb3NlTG9jYWxNZWRpYVN0cmVhbSIsImVuYWJsZU1pY3JvcGhvbmUiLCJlbmFibGVkIiwiZW5hYmxlQ2FtZXJhIiwiZGlzY29ubmVjdCIsImhhbmRsZVVzZXJQdWJsaXNoZWQiLCJ1c2VyIiwibWVkaWFUeXBlIiwiaGFuZGxlVXNlclVucHVibGlzaGVkIiwiY3JlYXRlQ2xpZW50IiwibW9kZSIsImNvZGVjIiwic2V0Q2xpZW50Um9sZSIsIm9uIiwic3Vic2NyaWJlIiwicGxheSIsIl9tZWRpYVN0cmVhbVRyYWNrIiwicXVlcnlTZWxlY3RvciIsInNyY09iamVjdCIsImVuY19pZCIsImNhcHR1cmVTdHJlYW0iLCJqb2luIiwiY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2siLCJjcmVhdGVDdXN0b21WaWRlb1RyYWNrIiwibWVkaWFTdHJlYW1UcmFjayIsImNyZWF0ZUNhbWVyYVZpZGVvVHJhY2siLCJlbmNvZGVyQ29uZmlnIiwiY2FtcyIsImdldENhbWVyYXMiLCJsYWJlbCIsImRldmljZUlkIiwic2V0RGV2aWNlIiwiaW1nRWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJpbmplY3QiLCJzZXRPcHRpb25zIiwiZW5hYmxlIiwiYmFja2dyb3VuZCIsInNyYyIsIlZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uIiwicmVnaXN0ZXJFeHRlbnNpb25zIiwiY3JlYXRlUHJvY2Vzc29yIiwiaW5pdCIsInR5cGUiLCJjb2xvciIsInB1Ymxpc2giLCJteVJvb21JZCIsImpvaW5UaW1lIiwiZ2V0U2VydmVyVGltZSIsInJlZ2lzdGVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNB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S2xULE9BQUwsQ0FBYTBOLHFCQUFiLENBQW1DdUYsUUFBbkMsRUFBNkM1UixRQUE3QyxFQUF1RGlILFlBQXRFO0FBQ0EsV0FBTzRLLFFBQVA7QUFDRDs7QUFFREMsa0JBQWdCO0FBQ2QsV0FBT2hOLEtBQUtDLEdBQUwsS0FBYSxLQUFLakUsYUFBekI7QUFDRDtBQTV1Qm1COztBQSt1QnRCd0csSUFBSXdGLFFBQUosQ0FBYWlGLFFBQWIsQ0FBc0IsVUFBdEIsRUFBa0N0VCxlQUFsQzs7QUFFQXVULE9BQU9DLE9BQVAsR0FBaUJ4VCxlQUFqQixDIiwiZmlsZSI6Im5hZi1hZ29yYS1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCJjbGFzcyBBZ29yYVJ0Y0FkYXB0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKGVhc3lydGMpIHtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29uc3RydWN0b3IgXCIsIGVhc3lydGMpO1xuXG4gICAgdGhpcy5lYXN5cnRjID0gZWFzeXJ0YyB8fCB3aW5kb3cuZWFzeXJ0YztcbiAgICB0aGlzLmFwcCA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMucm9vbSA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMudXNlcmlkID0gMDtcbiAgICB0aGlzLmFwcGlkID0gbnVsbDtcbiAgICB0aGlzLm1vY2FwRGF0YT1cIlwiO1xuXG4gICAgdGhpcy5tZWRpYVN0cmVhbXMgPSB7fTtcbiAgICB0aGlzLnJlbW90ZUNsaWVudHMgPSB7fTtcbiAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5lbmFibGVWaWRlbyA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZUF2YXRhciA9IGZhbHNlO1xuXG4gICAgdGhpcy5sb2NhbFRyYWNrcyA9IHsgdmlkZW9UcmFjazogbnVsbCwgYXVkaW9UcmFjazogbnVsbCB9O1xuICAgIHdpbmRvdy5sb2NhbFRyYWNrcyA9IHRoaXMubG9jYWxUcmFja3M7XG4gICAgdGhpcy50b2tlbiA9IG51bGw7XG4gICAgdGhpcy5jbGllbnRJZCA9IG51bGw7XG4gICAgdGhpcy51aWQgPSBudWxsO1xuICAgIHRoaXMudmJnID0gZmFsc2U7XG4gICAgdGhpcy52YmcwID0gZmFsc2U7XG4gICAgdGhpcy5zaG93TG9jYWwgPSBmYWxzZTtcbiAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UgPSBudWxsO1xuICAgIHRoaXMuZXh0ZW5zaW9uID0gbnVsbDtcbiAgICB0aGlzLnByb2Nlc3NvciA9IG51bGw7XG4gICAgdGhpcy5waXBlUHJvY2Vzc29yID0gKHRyYWNrLCBwcm9jZXNzb3IpID0+IHtcbiAgICAgIHRyYWNrLnBpcGUocHJvY2Vzc29yKS5waXBlKHRyYWNrLnByb2Nlc3NvckRlc3RpbmF0aW9uKTtcbiAgICB9XG5cblxuICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID0gMDtcbiAgICB0aGlzLnRpbWVPZmZzZXRzID0gW107XG4gICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gMDtcbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gbnVsbDtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyT3Blbkxpc3RlbmVyKGNsaWVudElkID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudENvbm5lY3Rpb24gPSB0aGlzLmVhc3lydGMuZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZChjbGllbnRJZCk7XG4gICAgICB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdID0gY2xpZW50Q29ubmVjdGlvbjtcbiAgICB9KTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyQ2xvc2VkTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF07XG4gICAgfSk7XG5cbiAgICB0aGlzLmlzQ2hyb21lID0gKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignRmlyZWZveCcpID09PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0Nocm9tZScpID4gLTEpO1xuXG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIHdpbmRvdy5vbGRSVENQZWVyQ29ubmVjdGlvbiA9IFJUQ1BlZXJDb25uZWN0aW9uO1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gbmV3IFByb3h5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwge1xuICAgICAgICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uICh0YXJnZXQsIGFyZ3MpIHtcbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhcmdzWzBdWydlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXMnXSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaCh7ICdlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXMnOiB0cnVlIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgcGMgPSBuZXcgd2luZG93Lm9sZFJUQ1BlZXJDb25uZWN0aW9uKGFyZ3NbMF0pO1xuICAgICAgICAgIHJldHVybiBwYztcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH1cbiAgICBcbiAgICAvLyBjdXN0b20gZGF0YSBhcHBlbmQgcGFyYW1zXG4gICAgdGhpcy5DdXN0b21EYXRhRGV0ZWN0b3IgPSAnQUdPUkFNT0NBUCc7XG4gICAgdGhpcy5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgPSA0O1xuXG4gICAgd2luZG93LkFnb3JhUnRjQWRhcHRlcj10aGlzO1xuICAgIFxuICB9XG5cbiAgc2V0U2VydmVyVXJsKHVybCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJVcmwgXCIsIHVybCk7XG4gICAgdGhpcy5lYXN5cnRjLnNldFNvY2tldFVybCh1cmwpO1xuICB9XG5cbiAgc2V0QXBwKGFwcE5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0QXBwIFwiLCBhcHBOYW1lKTtcbiAgICB0aGlzLmFwcCA9IGFwcE5hbWU7XG4gICAgdGhpcy5hcHBpZCA9IGFwcE5hbWU7XG4gIH1cblxuICBhc3luYyBzZXRSb29tKGpzb24pIHtcbiAgICBqc29uID0ganNvbi5yZXBsYWNlKC8nL2csICdcIicpO1xuICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgdGhpcy5yb29tID0gb2JqLm5hbWU7XG5cbiAgICBpZiAob2JqLnZiZyAmJiBvYmoudmJnPT0ndHJ1ZScgKSB7ICAgICAgXG4gICAgICB0aGlzLnZiZyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai52YmcwICYmIG9iai52YmcwPT0ndHJ1ZScgKSB7XG4gICAgICB0aGlzLnZiZzAgPSB0cnVlO1xuICAgICAgQWdvcmFSVEMubG9hZE1vZHVsZShTZWdQbHVnaW4sIHt9KTtcbiAgICB9XG5cbiAgICBpZiAob2JqLmVuYWJsZUF2YXRhciAmJiBvYmouZW5hYmxlQXZhdGFyPT0ndHJ1ZScgKSB7XG4gICAgICB0aGlzLmVuYWJsZUF2YXRhciA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai5zaG93TG9jYWwgICYmIG9iai5zaG93TG9jYWw9PSd0cnVlJykge1xuICAgICAgdGhpcy5zaG93TG9jYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmouZW5hYmxlVmlkZW9GaWx0ZXJlZCAmJiBvYmouZW5hYmxlVmlkZW9GaWx0ZXJlZD09J3RydWUnICkge1xuICAgICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5lYXN5cnRjLmpvaW5Sb29tKHRoaXMucm9vbSwgbnVsbCk7XG4gIH1cblxuICAvLyBvcHRpb25zOiB7IGRhdGFjaGFubmVsOiBib29sLCBhdWRpbzogYm9vbCwgdmlkZW86IGJvb2wgfVxuICBzZXRXZWJSdGNPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0V2ViUnRjT3B0aW9ucyBcIiwgb3B0aW9ucyk7XG4gICAgLy8gdGhpcy5lYXN5cnRjLmVuYWJsZURlYnVnKHRydWUpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVEYXRhQ2hhbm5lbHMob3B0aW9ucy5kYXRhY2hhbm5lbCk7XG5cbiAgICAvLyB1c2luZyBBZ29yYVxuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBvcHRpb25zLnZpZGVvO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBvcHRpb25zLmF1ZGlvO1xuXG4gICAgLy8gbm90IGVhc3lydGNcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvUmVjZWl2ZShmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvUmVjZWl2ZShmYWxzZSk7XG4gIH1cblxuICBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzKHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMgXCIsIHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKTtcbiAgICB0aGlzLmNvbm5lY3RTdWNjZXNzID0gc3VjY2Vzc0xpc3RlbmVyO1xuICAgIHRoaXMuY29ubmVjdEZhaWx1cmUgPSBmYWlsdXJlTGlzdGVuZXI7XG4gIH1cblxuICBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudExpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFJvb21PY2N1cGFudExpc3RlbmVyIFwiLCBvY2N1cGFudExpc3RlbmVyKTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihmdW5jdGlvbiAocm9vbU5hbWUsIG9jY3VwYW50cywgcHJpbWFyeSkge1xuICAgICAgb2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudHMpO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMob3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldERhdGFDaGFubmVsTGlzdGVuZXJzICBcIiwgb3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIob3Blbkxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyKGNsb3NlZExpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckxpc3RlbmVyKG1lc3NhZ2VMaXN0ZW5lcik7XG4gIH1cblxuICB1cGRhdGVUaW1lT2Zmc2V0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyB1cGRhdGVUaW1lT2Zmc2V0IFwiKTtcbiAgICBjb25zdCBjbGllbnRTZW50VGltZSA9IERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG5cbiAgICByZXR1cm4gZmV0Y2goZG9jdW1lbnQubG9jYXRpb24uaHJlZiwgeyBtZXRob2Q6IFwiSEVBRFwiLCBjYWNoZTogXCJuby1jYWNoZVwiIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgIHZhciBwcmVjaXNpb24gPSAxMDAwO1xuICAgICAgdmFyIHNlcnZlclJlY2VpdmVkVGltZSA9IG5ldyBEYXRlKHJlcy5oZWFkZXJzLmdldChcIkRhdGVcIikpLmdldFRpbWUoKSArIHByZWNpc2lvbiAvIDI7XG4gICAgICB2YXIgY2xpZW50UmVjZWl2ZWRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIHZhciBzZXJ2ZXJUaW1lID0gc2VydmVyUmVjZWl2ZWRUaW1lICsgKGNsaWVudFJlY2VpdmVkVGltZSAtIGNsaWVudFNlbnRUaW1lKSAvIDI7XG4gICAgICB2YXIgdGltZU9mZnNldCA9IHNlcnZlclRpbWUgLSBjbGllbnRSZWNlaXZlZFRpbWU7XG5cbiAgICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzKys7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA8PSAxMCkge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzLnB1c2godGltZU9mZnNldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzW3RoaXMuc2VydmVyVGltZVJlcXVlc3RzICUgMTBdID0gdGltZU9mZnNldDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gdGhpcy50aW1lT2Zmc2V0cy5yZWR1Y2UoKGFjYywgb2Zmc2V0KSA9PiBhY2MgKz0gb2Zmc2V0LCAwKSAvIHRoaXMudGltZU9mZnNldHMubGVuZ3RoO1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPiAxMCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlVGltZU9mZnNldCgpLCA1ICogNjAgKiAxMDAwKTsgLy8gU3luYyBjbG9jayBldmVyeSA1IG1pbnV0ZXMuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbm5lY3QoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3QgXCIpO1xuICAgIFByb21pc2UuYWxsKFt0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY29ubmVjdChyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pXSkudGhlbigoW18sIGNsaWVudElkXSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3RlZCBcIiArIGNsaWVudElkKTtcbiAgICAgIHRoaXMuY2xpZW50SWQgPSBjbGllbnRJZDtcbiAgICAgIHRoaXMuX215Um9vbUpvaW5UaW1lID0gdGhpcy5fZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKTtcbiAgICAgIHRoaXMuY29ubmVjdEFnb3JhKCk7XG4gICAgICB0aGlzLmNvbm5lY3RTdWNjZXNzKGNsaWVudElkKTtcbiAgICB9KS5jYXRjaCh0aGlzLmNvbm5lY3RGYWlsdXJlKTtcbiAgfVxuXG4gIHNob3VsZFN0YXJ0Q29ubmVjdGlvblRvKGNsaWVudCkge1xuICAgIHJldHVybiB0aGlzLl9teVJvb21Kb2luVGltZSA8PSBjbGllbnQucm9vbUpvaW5UaW1lO1xuICB9XG5cbiAgc3RhcnRTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbiBcIiwgY2xpZW50SWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5jYWxsKGNsaWVudElkLCBmdW5jdGlvbiAoY2FsbGVyLCBtZWRpYSkge1xuICAgICAgaWYgKG1lZGlhID09PSBcImRhdGFjaGFubmVsXCIpIHtcbiAgICAgICAgTkFGLmxvZy53cml0ZShcIlN1Y2Nlc3NmdWxseSBzdGFydGVkIGRhdGFjaGFubmVsIHRvIFwiLCBjYWxsZXIpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvckNvZGUsIGVycm9yVGV4dCkge1xuICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm9yVGV4dCk7XG4gICAgfSwgZnVuY3Rpb24gKHdhc0FjY2VwdGVkKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIndhcyBhY2NlcHRlZD1cIiArIHdhc0FjY2VwdGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlU3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjbG9zZVN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuaGFuZ3VwKGNsaWVudElkKTtcbiAgfVxuXG4gIGFzeW5jICBjcmVhdGVFbmNvZGVyKHNlbmRlcikge1xuXG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIGNvbnN0IHN0cmVhbXMgPSBzZW5kZXIuY3JlYXRlRW5jb2RlZFN0cmVhbXMoKTtcbiAgICAgIGNvbnN0IHRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgICB2YXIgdGhhdD10aGlzO1xuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKHtcbiAgICAgICAgdHJhbnNmb3JtKGNodW5rLCBjb250cm9sbGVyKSB7XG4gICAgICAgICAgY29uc3QgbW9jYXAgPSB0ZXh0RW5jb2Rlci5lbmNvZGUodGhhdC5tb2NhcERhdGEpO1xuICAgICAgICAgIGNvbnN0IGZyYW1lID0gY2h1bmsuZGF0YTtcbiAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICBkYXRhLnNldChuZXcgVWludDhBcnJheShmcmFtZSksIDApO1xuICAgICAgICAgIGRhdGEuc2V0KG1vY2FwLCBmcmFtZS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgICB2YXIgYnl0ZXMgPSB0aGF0LmdldEludEJ5dGVzKG1vY2FwLmJ5dGVMZW5ndGgpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgZGF0YVtmcmFtZS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIGldID0gYnl0ZXNbaV07XG4gICAgICAgICAgfVxuICBcbiAgICAgICAgICAvLyBTZXQgbWFnaWMgc3RyaW5nIGF0IHRoZSBlbmRcbiAgICAgICAgICBjb25zdCBtYWdpY0luZGV4ID0gZnJhbWUuYnl0ZUxlbmd0aCArIG1vY2FwLmJ5dGVMZW5ndGggKyB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkYXRhW21hZ2ljSW5kZXggKyBpXSA9IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNodW5rLmRhdGEgPSBkYXRhLmJ1ZmZlcjtcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmspO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgXG4gICAgICBzdHJlYW1zLnJlYWRhYmxlLnBpcGVUaHJvdWdoKHRyYW5zZm9ybWVyKS5waXBlVG8oc3RyZWFtcy53cml0YWJsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIoJ3NjcmlwdC10cmFuc2Zvcm0td29ya2VyLmpzJyk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdyZWdpc3RlcmVkJykge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIFxuICAgICAgY29uc3Qgc2VuZGVyVHJhbnNmb3JtID0gbmV3IFJUQ1J0cFNjcmlwdFRyYW5zZm9ybSh3b3JrZXIsIHsgbmFtZTogJ291dGdvaW5nJywgcG9ydDogc2VuZGVyQ2hhbm5lbC5wb3J0MiB9LCBbc2VuZGVyQ2hhbm5lbC5wb3J0Ml0pO1xuICAgICAgc2VuZGVyVHJhbnNmb3JtLnBvcnQgPSBzZW5kZXJDaGFubmVsLnBvcnQxO1xuICAgICAgc2VuZGVyLnRyYW5zZm9ybSA9IHNlbmRlclRyYW5zZm9ybTtcbiAgXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdzdGFydGVkJykge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIFxuICAgICAgY29uc3Qgd2F0ZXJtYXJrSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2F0ZXJtYXJrJyk7XG4gICAgICBzZW5kZXJDaGFubmVsLnBvcnQxLnBvc3RNZXNzYWdlKHsgd2F0ZXJtYXJrOiB0aGlzLm1vY2FwRGF0YSB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVEZWNvZGVyKHJlY2VpdmVyLGNsaWVudElkKSB7XG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIGNvbnN0IHN0cmVhbXMgPSByZWNlaXZlci5jcmVhdGVFbmNvZGVkU3RyZWFtcygpO1xuICAgICAgY29uc3QgdGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICAgIHZhciB0aGF0PXRoaXM7XG5cbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybVN0cmVhbSh7XG4gICAgICAgIHRyYW5zZm9ybShjaHVuaywgY29udHJvbGxlcikge1xuICAgICAgICAgIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcoY2h1bmsuZGF0YSk7ICBcbiAgICAgICAgICBjb25zdCBtYWdpY0RhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLCBjaHVuay5kYXRhLmJ5dGVMZW5ndGggLSB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgsIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCk7XG4gICAgICAgICAgbGV0IG1hZ2ljID0gW107XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbWFnaWMucHVzaChtYWdpY0RhdGFbaV0pO1xuXG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBtYWdpY1N0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoLi4ubWFnaWMpO1xuICAgICAgICAgIGlmIChtYWdpY1N0cmluZyA9PT0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IpIHtcbiAgICAgICAgICAgIGNvbnN0IG1vY2FwTGVuID0gdmlldy5nZXRVaW50MzIoY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gKHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKSwgZmFsc2UpO1xuICAgICAgICAgICAgY29uc3QgZnJhbWVTaXplID0gY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gKG1vY2FwTGVuICsgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgKyAgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICAgIGNvbnN0IG1vY2FwQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YSwgZnJhbWVTaXplLCBtb2NhcExlbik7XG4gICAgICAgICAgICBjb25zdCBtb2NhcCA9IHRleHREZWNvZGVyLmRlY29kZShtb2NhcEJ1ZmZlcikgICAgICAgIFxuICAgICAgICAgICAgd2luZG93LnJlbW90ZU1vY2FwKG1vY2FwK1wiLFwiK2NsaWVudElkKTtcbiAgICAgICAgICAvLyAgY29uc29sZS5lcnJvcihtb2NhcCk7ICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gY2h1bmsuZGF0YTtcbiAgICAgICAgICAgIGNodW5rLmRhdGEgPSBuZXcgQXJyYXlCdWZmZXIoZnJhbWVTaXplKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhKTtcbiAgICAgICAgICAgIGRhdGEuc2V0KG5ldyBVaW50OEFycmF5KGZyYW1lLCAwLCBmcmFtZVNpemUpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGNodW5rKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBzdHJlYW1zLnJlYWRhYmxlLnBpcGVUaHJvdWdoKHRyYW5zZm9ybWVyKS5waXBlVG8oc3RyZWFtcy53cml0YWJsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIoJ3NjcmlwdC10cmFuc2Zvcm0td29ya2VyLmpzJyk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdyZWdpc3RlcmVkJykge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIFxuICAgICAgY29uc3QgcmVjZWl2ZXJUcmFuc2Zvcm0gPSBuZXcgUlRDUnRwU2NyaXB0VHJhbnNmb3JtKHdvcmtlciwgeyBuYW1lOiAnaW5jb21pbmcnLCBwb3J0OiByZWNlaXZlckNoYW5uZWwucG9ydDIgfSwgW3JlY2VpdmVyQ2hhbm5lbC5wb3J0Ml0pO1xuICAgICAgcmVjZWl2ZXJUcmFuc2Zvcm0ucG9ydCA9IHJlY2VpdmVyQ2hhbm5lbC5wb3J0MTtcbiAgICAgIHJlY2VpdmVyLnRyYW5zZm9ybSA9IHJlY2VpdmVyVHJhbnNmb3JtO1xuICAgICAgcmVjZWl2ZXJUcmFuc2Zvcm0ucG9ydC5vbm1lc3NhZ2UgPSBlID0+IHtcbiAgICAgICAgd2luZG93LnJlbW90ZU1vY2FwKGUuZGF0YStcIixcIitjbGllbnRJZCk7XG4gICAgICB9O1xuICBcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3N0YXJ0ZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0gIFxuICBzZW5kRGF0YShjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGEgXCIsIGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgLy8gc2VuZCB2aWEgd2VicnRjIG90aGVyd2lzZSBmYWxsYmFjayB0byB3ZWJzb2NrZXRzXG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBzZW5kRGF0YUd1YXJhbnRlZWQoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNlbmREYXRhR3VhcmFudGVlZCBcIiwgY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGFXUyhjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgYnJvYWRjYXN0RGF0YShkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIHJvb21PY2N1cGFudHMgPSB0aGlzLmVhc3lydGMuZ2V0Um9vbU9jY3VwYW50c0FzTWFwKHRoaXMucm9vbSk7XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGtleXMgb2YgdGhlIGVhc3lydGMgcm9vbSBvY2N1cGFudHMgbWFwLlxuICAgIC8vIGdldFJvb21PY2N1cGFudHNBc0FycmF5IHVzZXMgT2JqZWN0LmtleXMgd2hpY2ggYWxsb2NhdGVzIG1lbW9yeS5cbiAgICBmb3IgKHZhciByb29tT2NjdXBhbnQgaW4gcm9vbU9jY3VwYW50cykge1xuICAgICAgaWYgKHJvb21PY2N1cGFudHNbcm9vbU9jY3VwYW50XSAmJiByb29tT2NjdXBhbnQgIT09IHRoaXMuZWFzeXJ0Yy5teUVhc3lydGNpZCkge1xuICAgICAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICAgICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKHJvb21PY2N1cGFudCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIGRlc3RpbmF0aW9uID0geyB0YXJnZXRSb29tOiB0aGlzLnJvb20gfTtcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGFXUyhkZXN0aW5hdGlvbiwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRDb25uZWN0U3RhdHVzIFwiLCBjbGllbnRJZCk7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKTtcblxuICAgIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLklTX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5JU19DT05ORUNURUQ7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuTk9UX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5DT05ORUNUSU5HO1xuICAgIH1cbiAgfVxuXG4gIGdldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW1OYW1lID0gXCJhdWRpb1wiKSB7XG5cbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICAvLyBpZiAoIHN0cmVhbU5hbWUgPSBcImF1ZGlvXCIpIHtcbiAgICAvL3N0cmVhbU5hbWUgPSBcImJvZF9hdWRpb1wiO1xuICAgIC8vfVxuXG4gICAgaWYgKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSAmJiB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYEFscmVhZHkgaGFkICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYFdhaXRpbmcgb24gJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBhdWRpb3x2aWRlbyBhbGlhc1xuICAgICAgaWYgKCF0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmhhcyhjbGllbnRJZCkpIHtcbiAgICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB7fTtcblxuICAgICAgICBjb25zdCBhdWRpb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gQXVkaW8gRXJyb3JgLCBlKSk7XG5cbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucHJvbWlzZSA9IGF1ZGlvUHJvbWlzZTtcblxuICAgICAgICBjb25zdCB2aWRlb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gVmlkZW8gRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnByb21pc2UgPSB2aWRlb1Byb21pc2U7XG5cbiAgICAgICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5zZXQoY2xpZW50SWQsIHBlbmRpbmdNZWRpYVJlcXVlc3RzKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG5cbiAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHBlbmRpbmdNZWRpYVJlcXVlc3RzIHdpdGggc3RyZWFtTmFtZVxuICAgICAgaWYgKCFwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSkge1xuICAgICAgICBjb25zdCBzdHJlYW1Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIFwiJHtzdHJlYW1OYW1lfVwiIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5wcm9taXNlID0gc3RyZWFtUHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKVtzdHJlYW1OYW1lXS5wcm9taXNlO1xuICAgIH1cbiAgfVxuXG4gIHNldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpOyAvLyByZXR1cm4gdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIGVudHJ5IGluIHRoZSBNYXBcbiAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICBpZiAoc3RyZWFtTmFtZSA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAvLyBTYWZhcmkgZG9lc24ndCBsaWtlIGl0IHdoZW4geW91IHVzZSBhIG1peGVkIG1lZGlhIHN0cmVhbSB3aGVyZSBvbmUgb2YgdGhlIHRyYWNrcyBpcyBpbmFjdGl2ZSwgc28gd2VcbiAgICAgIC8vIHNwbGl0IHRoZSB0cmFja3MgaW50byB0d28gc3RyZWFtcy5cbiAgICAgIC8vIEFkZCBtZWRpYVN0cmVhbXMgYXVkaW8gc3RyZWFtTmFtZSBhbGlhc1xuICAgICAgY29uc3QgYXVkaW9UcmFja3MgPSBzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKTtcbiAgICAgIGlmIChhdWRpb1RyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXVkaW9UcmFja3MuZm9yRWFjaCh0cmFjayA9PiBhdWRpb1N0cmVhbS5hZGRUcmFjayh0cmFjaykpO1xuICAgICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBzZXRNZWRpYVN0cmVhbSBcImF1ZGlvXCIgYWxpYXMgRXJyb3JgLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGF1ZGlvIGFsaWFzIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyB2aWRlbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCB2aWRlb1RyYWNrcyA9IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpO1xuICAgICAgaWYgKHZpZGVvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2aWRlb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHZpZGVvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwidmlkZW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gdmlkZW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjbGllbnRNZWRpYVN0cmVhbXNbc3RyZWFtTmFtZV0gPSBzdHJlYW07XG5cbiAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGJ5IFN0cmVhbU5hbWUgaWYgaXQgZXhpc3RzLlxuICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzICYmIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnJlc29sdmUoc3RyZWFtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRJbnRCeXRlcyh4KSB7XG4gICAgdmFyIGJ5dGVzID0gW107XG4gICAgdmFyIGkgPSB0aGlzLkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDtcbiAgICBkbyB7XG4gICAgICBieXRlc1stLWldID0geCAmICgyNTUpO1xuICAgICAgeCA9IHggPj4gODtcbiAgICB9IHdoaWxlIChpKVxuICAgIHJldHVybiBieXRlcztcbiAgfVxuXG4gIGFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGFkZExvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgZWFzeXJ0YyA9IHRoaXMuZWFzeXJ0YztcbiAgICBzdHJlYW1OYW1lID0gc3RyZWFtTmFtZSB8fCBzdHJlYW0uaWQ7XG4gICAgdGhpcy5zZXRNZWRpYVN0cmVhbShcImxvY2FsXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgZWFzeXJ0Yy5yZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpO1xuXG4gICAgLy8gQWRkIGxvY2FsIHN0cmVhbSB0byBleGlzdGluZyBjb25uZWN0aW9uc1xuICAgIE9iamVjdC5rZXlzKHRoaXMucmVtb3RlQ2xpZW50cykuZm9yRWFjaChjbGllbnRJZCA9PiB7XG4gICAgICBpZiAoZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSAhPT0gZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICAgIGVhc3lydGMuYWRkU3RyZWFtVG9DYWxsKGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyByZW1vdmVMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW1OYW1lKTtcbiAgICB0aGlzLmVhc3lydGMuY2xvc2VMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpO1xuICAgIGRlbGV0ZSB0aGlzLm1lZGlhU3RyZWFtc1tcImxvY2FsXCJdW3N0cmVhbU5hbWVdO1xuICB9XG5cbiAgZW5hYmxlTWljcm9waG9uZShlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGVuYWJsZU1pY3JvcGhvbmUgXCIsIGVuYWJsZWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpO1xuICB9XG5cbiAgZW5hYmxlQ2FtZXJhKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlQ2FtZXJhIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQ2FtZXJhKGVuYWJsZWQpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZGlzY29ubmVjdCBcIik7XG4gICAgdGhpcy5lYXN5cnRjLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZVVzZXJQdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7IH1cblxuICBoYW5kbGVVc2VyVW5wdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJVblB1Ymxpc2hlZCBcIik7XG4gIH1cblxuICBhc3luYyBjb25uZWN0QWdvcmEoKSB7XG4gICAgLy8gQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHBsYXkgcmVtb3RlIHRyYWNrcyB3aGVuIHJlbW90ZSB1c2VyIHB1Ymxpc2hlcy5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgfHwgdGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcInJ0Y1wiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJoMjY0XCIgfSk7XG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LnNldENsaWVudFJvbGUoXCJob3N0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwiaDI2NFwiIH0pO1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIH1cblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLWpvaW5lZFwiLCBhc3luYyAodXNlcikgPT4ge1xuICAgICAgY29uc29sZS53YXJuKFwidXNlci1qb2luZWRcIiwgdXNlcik7XG4gICAgfSk7XG4gICAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItcHVibGlzaGVkXCIsIGFzeW5jICh1c2VyLCBtZWRpYVR5cGUpID0+IHtcblxuICAgICAgbGV0IGNsaWVudElkID0gdXNlci51aWQ7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZCBcIiArIGNsaWVudElkICsgXCIgXCIgKyBtZWRpYVR5cGUsIHRoYXQuYWdvcmFDbGllbnQpO1xuICAgICAgYXdhaXQgdGhhdC5hZ29yYUNsaWVudC5zdWJzY3JpYmUodXNlciwgbWVkaWFUeXBlKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkMiBcIiArIGNsaWVudElkICsgXCIgXCIgKyB0aGF0LmFnb3JhQ2xpZW50KTtcblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGF0LnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG4gICAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcblxuICAgICAgICBjb25zdCBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIuYXVkaW9UcmFjayBcIiwgdXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgLy9hdWRpb1N0cmVhbS5hZGRUcmFjayh1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMuYXVkaW8gPSBhdWRpb1N0cmVhbTtcbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHZpZGVvU3RyZWFtID0gbnVsbDtcbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLnZpZGVvVHJhY2sgXCIsIHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIHZpZGVvU3RyZWFtLmFkZFRyYWNrKHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy52aWRlbyA9IHZpZGVvU3RyZWFtO1xuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgICAvL3VzZXIudmlkZW9UcmFja1xuICAgICAgfVxuXG4gICAgICBpZiAoY2xpZW50SWQgPT0gJ0NDQycpIHtcbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlkZW8zNjBcIikuc3JjT2JqZWN0PXZpZGVvU3RyZWFtO1xuICAgICAgICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdmlkZW9TdHJlYW0pO1xuICAgICAgICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc3JjT2JqZWN0PSB1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2s7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zcmNPYmplY3QgPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGNsaWVudElkID09ICdEREQnKSB7XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICB1c2VyLnZpZGVvVHJhY2sucGxheShcInZpZGVvMzYwXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICB1c2VyLmF1ZGlvVHJhY2sucGxheSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgICAgbGV0IGVuY19pZDtcbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgZW5jX2lkPXVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjay5pZDtcbiAgICAgICBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVuY19pZD11c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2suaWQ7XG4gICAgICB9XG4gICAgXG4gICAgICAvL2NvbnNvbGUud2FybihtZWRpYVR5cGUsZW5jX2lkKTsgICAgXG4gICAgICAvKlxuICAgICAgY29uc3QgcGMgPXRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHJlY2VpdmVycyA9IHBjLmdldFJlY2VpdmVycygpOyAgXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlY2VpdmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocmVjZWl2ZXJzW2ldLnRyYWNrICYmIHJlY2VpdmVyc1tpXS50cmFjay5pZD09PWVuY19pZCApIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJNYXRjaFwiLG1lZGlhVHlwZSxlbmNfaWQpO1xuICAgICAgICAgIHRoaXMuY3JlYXRlRGVjb2RlcihyZWNlaXZlcnNbaV0sY2xpZW50SWQpO1xuICAgICAgfVxuXG4gICAgfVxuICAgICovXG4gICAgXG5cbiAgICB9KTtcblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLXVucHVibGlzaGVkXCIsIHRoYXQuaGFuZGxlVXNlclVucHVibGlzaGVkKTtcblxuICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdCBhZ29yYSBcIik7XG4gICAgLy8gSm9pbiBhIGNoYW5uZWwgYW5kIGNyZWF0ZSBsb2NhbCB0cmFja3MuIEJlc3QgcHJhY3RpY2UgaXMgdG8gdXNlIFByb21pc2UuYWxsIGFuZCBydW4gdGhlbSBjb25jdXJyZW50bHkuXG4gICAgLy8gb1xuXG5cbiAgICBpZiAodGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgIHZhciBzdHJlYW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUN1c3RvbVZpZGVvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXSB9KV0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgdmFyIHN0cmVhbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzX3NlY3JldFwiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW3RoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdIH0pXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayh7IGVuY29kZXJDb25maWc6ICc0ODBwXzInIH0pXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayhcIjM2MHBfNFwiKV0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCldKTsgICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51c2VyaWQgPSBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCk7XG4gICAgfVxuXG5cbiAgICAvLyBzZWxlY3QgZmFjZXRpbWUgY2FtZXJhIGlmIGV4aXN0c1xuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmICF0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQpIHtcbiAgICAgIGxldCBjYW1zID0gYXdhaXQgQWdvcmFSVEMuZ2V0Q2FtZXJhcygpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjYW1zW2ldLmxhYmVsLmluZGV4T2YoXCJGYWNlVGltZVwiKSA9PSAwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzZWxlY3QgRmFjZVRpbWUgY2FtZXJhXCIsIGNhbXNbaV0uZGV2aWNlSWQpO1xuICAgICAgICAgIGF3YWl0IHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5zZXREZXZpY2UoY2Ftc1tpXS5kZXZpY2VJZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnNob3dMb2NhbCkge1xuICAgICAgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnBsYXkoXCJsb2NhbC1wbGF5ZXJcIik7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBPTEQgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcwICYmIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaykge1xuICAgICAgY29uc3QgaW1nRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgaW1nRWxlbWVudC5vbmxvYWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJTRUcgSU5JVCBcIiwgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKTtcbiAgICAgICAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UgPSBhd2FpdCBTZWdQbHVnaW4uaW5qZWN0KHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaywgXCIvYXNzZXRzL3dhc21zMFwiKS5jYXRjaChjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklURURcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlLnNldE9wdGlvbnMoeyBlbmFibGU6IHRydWUsIGJhY2tncm91bmQ6IGltZ0VsZW1lbnQgfSk7XG4gICAgICB9O1xuICAgICAgaW1nRWxlbWVudC5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBUUFBQUFEQ0FJQUFBQTdsam1SQUFBQUQwbEVRVlI0WG1OZytNK0FRRGc1QU9rOUMvVmtvbXpZQUFBQUFFbEZUa1N1UW1DQyc7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBOZXcgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcgJiYgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKSB7XG5cbiAgICAgIHRoaXMuZXh0ZW5zaW9uID0gbmV3IFZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uKCk7XG4gICAgICBBZ29yYVJUQy5yZWdpc3RlckV4dGVuc2lvbnMoW3RoaXMuZXh0ZW5zaW9uXSk7XG4gICAgICB0aGlzLnByb2Nlc3NvciA9IHRoaXMuZXh0ZW5zaW9uLmNyZWF0ZVByb2Nlc3NvcigpO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3IuaW5pdChcIi9hc3NldHMvd2FzbXNcIik7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGlwZSh0aGlzLnByb2Nlc3NvcikucGlwZSh0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucHJvY2Vzc29yRGVzdGluYXRpb24pO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3Iuc2V0T3B0aW9ucyh7IHR5cGU6ICdjb2xvcicsIGNvbG9yOiBcIiMwMGZmMDBcIiB9KTtcbiAgICAgIGF3YWl0IHRoaXMucHJvY2Vzc29yLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIHdpbmRvdy5sb2NhbFRyYWNrcyA9IHRoaXMubG9jYWxUcmFja3M7XG5cbiAgICAvLyBQdWJsaXNoIHRoZSBsb2NhbCB2aWRlbyBhbmQgYXVkaW8gdHJhY2tzIHRvIHRoZSBjaGFubmVsLlxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8gfHwgdGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgIGlmICh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spXG4gICAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spO1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaylcbiAgICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjayk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwicHVibGlzaCBzdWNjZXNzXCIpO1xuICAgICAgLypcbiAgICAgIGNvbnN0IHBjID10aGlzLmFnb3JhQ2xpZW50Ll9wMnBDaGFubmVsLmNvbm5lY3Rpb24ucGVlckNvbm5lY3Rpb247XG4gICAgICBjb25zdCBzZW5kZXJzID0gcGMuZ2V0U2VuZGVycygpO1xuICAgICAgbGV0IGkgPSAwO1xuICAgICAgZm9yIChpID0gMDsgaSA8IHNlbmRlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbmRlcnNbaV0udHJhY2sgJiYgKHNlbmRlcnNbaV0udHJhY2sua2luZCA9PSAnYXVkaW8nIHx8IHNlbmRlcnNbaV0udHJhY2sua2luZCA9PSAndmlkZW8nICkpIHtcbiAgICAgICAgICB0aGlzLmNyZWF0ZUVuY29kZXIoc2VuZGVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH0gXG4gICAgICAqLyAgICAgXG4gICAgfVxuXG4gICAgLy8gUlRNXG5cbiAgfVxuXG4gIC8qKlxuICAgKiBQcml2YXRlc1xuICAgKi9cblxuICBhc3luYyBfY29ubmVjdChjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICBhd2FpdCB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcblxuICAgIC8qXG4gICAgICAgdGhpcy5lYXN5cnRjLnNldFN0cmVhbUFjY2VwdG9yKHRoaXMuc2V0TWVkaWFTdHJlYW0uYmluZCh0aGlzKSk7XG4gICAgICAgdGhpcy5lYXN5cnRjLnNldE9uU3RyZWFtQ2xvc2VkKGZ1bmN0aW9uKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXTtcbiAgICAgIH0pO1xuICAgICAgIGlmICh0aGF0LmVhc3lydGMuYXVkaW9FbmFibGVkIHx8IHRoYXQuZWFzeXJ0Yy52aWRlb0VuYWJsZWQpIHtcbiAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoe1xuICAgICAgICAgIHZpZGVvOiB0aGF0LmVhc3lydGMudmlkZW9FbmFibGVkLFxuICAgICAgICAgIGF1ZGlvOiB0aGF0LmVhc3lydGMuYXVkaW9FbmFibGVkXG4gICAgICAgIH0pLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB0aGF0LmFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBcImRlZmF1bHRcIik7XG4gICAgICAgICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycm9yQ29kZSwgZXJybWVzZykge1xuICAgICAgICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm1lc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuICAgICAgfVxuICAgICAgKi9cbiAgfVxuXG4gIF9nZXRSb29tSm9pblRpbWUoY2xpZW50SWQpIHtcbiAgICB2YXIgbXlSb29tSWQgPSB0aGlzLnJvb207IC8vTkFGLnJvb207XG4gICAgdmFyIGpvaW5UaW1lID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcChteVJvb21JZClbY2xpZW50SWRdLnJvb21Kb2luVGltZTtcbiAgICByZXR1cm4gam9pblRpbWU7XG4gIH1cblxuICBnZXRTZXJ2ZXJUaW1lKCkge1xuICAgIHJldHVybiBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuICB9XG59XG5cbk5BRi5hZGFwdGVycy5yZWdpc3RlcihcImFnb3JhcnRjXCIsIEFnb3JhUnRjQWRhcHRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gQWdvcmFSdGNBZGFwdGVyO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==