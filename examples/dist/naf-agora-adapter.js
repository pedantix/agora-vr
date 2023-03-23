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
            args[0]["encodedInsertableStreams"] = true;
          } else {
            args.push({ encodedInsertableStreams: true });
          }

          const pc = new window.oldRTCPeerConnection(...args);
          return pc;
        }
      });
      const oldSetConfiguration = window.RTCPeerConnection.prototype.setConfiguration;
      window.RTCPeerConnection.prototype.setConfiguration = function () {
        const args = arguments;
        if (args.length > 0) {
          args[0]["encodedInsertableStreams"] = true;
        } else {
          args.push({ encodedInsertableStreams: true });
        }

        oldSetConfiguration.apply(this, args);
      };
    }

    // custom data append params
    this.CustomDataDetector = 'AGORAMOCAP';
    this.CustomDatLengthByteCount = 4;
    this.senderChannel = new MessageChannel();
    this.receiverChannel = new MessageChannel();
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
      var that = this;
      const worker = new Worker('/dist/script-transform-worker.js');
      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'registered') {
          resolve();
        }
      });
      const senderTransform = new RTCRtpScriptTransform(worker, { name: 'outgoing', port: that.senderChannel.port2 }, [that.senderChannel.port2]);
      senderTransform.port = that.senderChannel.port1;
      sender.transform = senderTransform;
      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'started') {
          resolve();
        }
      });
      that.senderChannel.port1.postMessage({ watermark: that.mocapData });
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
      var that = this;
      const worker = new Worker('/dist/script-transform-worker.js');
      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'registered') {
          resolve();
        }
      });

      const receiverTransform = new RTCRtpScriptTransform(worker, { name: 'incoming', port: that.receiverChannel.port2 }, [that.receiverChannel.port2]);
      receiverTransform.port = that.receiverChannel.port1;
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
      const pc = this.agoraClient._p2pChannel.connection.peerConnection;
      const receivers = pc.getReceivers();
      for (let i = 0; i < receivers.length; i++) {
        if (receivers[i].track && receivers[i].track.id === enc_id) {
          console.warn("Match", mediaType, enc_id);
          this.createDecoder(receivers[i], clientId);
        }
      }
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
      console.error("createMicrophoneAudioTrack");
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
      const pc = this.agoraClient._p2pChannel.connection.peerConnection;
      const senders = pc.getSenders();
      let i = 0;
      for (i = 0; i < senders.length; i++) {
        if (senders[i].track && senders[i].track.kind == 'audio') {
          //} || senders[i].track.kind == 'video' )) {
          this.createEncoder(senders[i]);
        }
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtb2NhcERhdGEiLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZVZpZGVvRmlsdGVyZWQiLCJlbmFibGVBdWRpbyIsImVuYWJsZUF2YXRhciIsImxvY2FsVHJhY2tzIiwidmlkZW9UcmFjayIsImF1ZGlvVHJhY2siLCJ0b2tlbiIsImNsaWVudElkIiwidWlkIiwidmJnIiwidmJnMCIsInNob3dMb2NhbCIsInZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UiLCJleHRlbnNpb24iLCJwcm9jZXNzb3IiLCJwaXBlUHJvY2Vzc29yIiwidHJhY2siLCJwaXBlIiwicHJvY2Vzc29yRGVzdGluYXRpb24iLCJzZXJ2ZXJUaW1lUmVxdWVzdHMiLCJ0aW1lT2Zmc2V0cyIsImF2Z1RpbWVPZmZzZXQiLCJhZ29yYUNsaWVudCIsInNldFBlZXJPcGVuTGlzdGVuZXIiLCJjbGllbnRDb25uZWN0aW9uIiwiZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZCIsInNldFBlZXJDbG9zZWRMaXN0ZW5lciIsImlzQ2hyb21lIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwiaW5kZXhPZiIsIm9sZFJUQ1BlZXJDb25uZWN0aW9uIiwiUlRDUGVlckNvbm5lY3Rpb24iLCJQcm94eSIsImNvbnN0cnVjdCIsInRhcmdldCIsImFyZ3MiLCJsZW5ndGgiLCJwdXNoIiwiZW5jb2RlZEluc2VydGFibGVTdHJlYW1zIiwicGMiLCJvbGRTZXRDb25maWd1cmF0aW9uIiwicHJvdG90eXBlIiwic2V0Q29uZmlndXJhdGlvbiIsImFyZ3VtZW50cyIsImFwcGx5IiwiQ3VzdG9tRGF0YURldGVjdG9yIiwiQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50Iiwic2VuZGVyQ2hhbm5lbCIsIk1lc3NhZ2VDaGFubmVsIiwicmVjZWl2ZXJDaGFubmVsIiwic2V0U2VydmVyVXJsIiwidXJsIiwic2V0U29ja2V0VXJsIiwic2V0QXBwIiwiYXBwTmFtZSIsInNldFJvb20iLCJqc29uIiwicmVwbGFjZSIsIm9iaiIsIkpTT04iLCJwYXJzZSIsIm5hbWUiLCJBZ29yYVJUQyIsImxvYWRNb2R1bGUiLCJTZWdQbHVnaW4iLCJqb2luUm9vbSIsInNldFdlYlJ0Y09wdGlvbnMiLCJvcHRpb25zIiwiZW5hYmxlRGF0YUNoYW5uZWxzIiwiZGF0YWNoYW5uZWwiLCJ2aWRlbyIsImF1ZGlvIiwiZW5hYmxlVmlkZW9SZWNlaXZlIiwiZW5hYmxlQXVkaW9SZWNlaXZlIiwic2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyIsInN1Y2Nlc3NMaXN0ZW5lciIsImZhaWx1cmVMaXN0ZW5lciIsImNvbm5lY3RTdWNjZXNzIiwiY29ubmVjdEZhaWx1cmUiLCJzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciIsIm9jY3VwYW50TGlzdGVuZXIiLCJyb29tTmFtZSIsIm9jY3VwYW50cyIsInByaW1hcnkiLCJzZXREYXRhQ2hhbm5lbExpc3RlbmVycyIsIm9wZW5MaXN0ZW5lciIsImNsb3NlZExpc3RlbmVyIiwibWVzc2FnZUxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIiLCJzZXRQZWVyTGlzdGVuZXIiLCJ1cGRhdGVUaW1lT2Zmc2V0IiwiY2xpZW50U2VudFRpbWUiLCJEYXRlIiwibm93IiwiZmV0Y2giLCJkb2N1bWVudCIsImxvY2F0aW9uIiwiaHJlZiIsIm1ldGhvZCIsImNhY2hlIiwidGhlbiIsInJlcyIsInByZWNpc2lvbiIsInNlcnZlclJlY2VpdmVkVGltZSIsImhlYWRlcnMiLCJnZXQiLCJnZXRUaW1lIiwiY2xpZW50UmVjZWl2ZWRUaW1lIiwic2VydmVyVGltZSIsInRpbWVPZmZzZXQiLCJyZWR1Y2UiLCJhY2MiLCJvZmZzZXQiLCJzZXRUaW1lb3V0IiwiY29ubmVjdCIsIlByb21pc2UiLCJhbGwiLCJyZXNvbHZlIiwicmVqZWN0IiwiX2Nvbm5lY3QiLCJfIiwiX215Um9vbUpvaW5UaW1lIiwiX2dldFJvb21Kb2luVGltZSIsImNvbm5lY3RBZ29yYSIsImNhdGNoIiwic2hvdWxkU3RhcnRDb25uZWN0aW9uVG8iLCJjbGllbnQiLCJyb29tSm9pblRpbWUiLCJzdGFydFN0cmVhbUNvbm5lY3Rpb24iLCJjYWxsIiwiY2FsbGVyIiwibWVkaWEiLCJOQUYiLCJ3cml0ZSIsImVycm9yQ29kZSIsImVycm9yVGV4dCIsImVycm9yIiwid2FzQWNjZXB0ZWQiLCJjbG9zZVN0cmVhbUNvbm5lY3Rpb24iLCJoYW5ndXAiLCJjcmVhdGVFbmNvZGVyIiwic2VuZGVyIiwic3RyZWFtcyIsImNyZWF0ZUVuY29kZWRTdHJlYW1zIiwidGV4dEVuY29kZXIiLCJUZXh0RW5jb2RlciIsInRoYXQiLCJ0cmFuc2Zvcm1lciIsIlRyYW5zZm9ybVN0cmVhbSIsInRyYW5zZm9ybSIsImNodW5rIiwiY29udHJvbGxlciIsIm1vY2FwIiwiZW5jb2RlIiwiZnJhbWUiLCJkYXRhIiwiVWludDhBcnJheSIsImJ5dGVMZW5ndGgiLCJzZXQiLCJieXRlcyIsImdldEludEJ5dGVzIiwiaSIsIm1hZ2ljSW5kZXgiLCJjaGFyQ29kZUF0IiwiYnVmZmVyIiwiZW5xdWV1ZSIsInJlYWRhYmxlIiwicGlwZVRocm91Z2giLCJwaXBlVG8iLCJ3cml0YWJsZSIsIndvcmtlciIsIldvcmtlciIsIm9ubWVzc2FnZSIsImV2ZW50Iiwic2VuZGVyVHJhbnNmb3JtIiwiUlRDUnRwU2NyaXB0VHJhbnNmb3JtIiwicG9ydCIsInBvcnQyIiwicG9ydDEiLCJwb3N0TWVzc2FnZSIsIndhdGVybWFyayIsImNyZWF0ZURlY29kZXIiLCJyZWNlaXZlciIsInRleHREZWNvZGVyIiwiVGV4dERlY29kZXIiLCJ2aWV3IiwiRGF0YVZpZXciLCJtYWdpY0RhdGEiLCJtYWdpYyIsIm1hZ2ljU3RyaW5nIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwibW9jYXBMZW4iLCJnZXRVaW50MzIiLCJmcmFtZVNpemUiLCJtb2NhcEJ1ZmZlciIsImRlY29kZSIsInJlbW90ZU1vY2FwIiwiQXJyYXlCdWZmZXIiLCJyZWNlaXZlclRyYW5zZm9ybSIsImUiLCJzZW5kRGF0YSIsImRhdGFUeXBlIiwic2VuZERhdGFHdWFyYW50ZWVkIiwic2VuZERhdGFXUyIsImJyb2FkY2FzdERhdGEiLCJyb29tT2NjdXBhbnRzIiwiZ2V0Um9vbU9jY3VwYW50c0FzTWFwIiwicm9vbU9jY3VwYW50IiwibXlFYXN5cnRjaWQiLCJicm9hZGNhc3REYXRhR3VhcmFudGVlZCIsImRlc3RpbmF0aW9uIiwidGFyZ2V0Um9vbSIsImdldENvbm5lY3RTdGF0dXMiLCJzdGF0dXMiLCJJU19DT05ORUNURUQiLCJhZGFwdGVycyIsIk5PVF9DT05ORUNURUQiLCJDT05ORUNUSU5HIiwiZ2V0TWVkaWFTdHJlYW0iLCJzdHJlYW1OYW1lIiwiaGFzIiwiYXVkaW9Qcm9taXNlIiwid2FybiIsInByb21pc2UiLCJ2aWRlb1Byb21pc2UiLCJzdHJlYW1Qcm9taXNlIiwic2V0TWVkaWFTdHJlYW0iLCJzdHJlYW0iLCJjbGllbnRNZWRpYVN0cmVhbXMiLCJhdWRpb1RyYWNrcyIsImdldEF1ZGlvVHJhY2tzIiwiYXVkaW9TdHJlYW0iLCJNZWRpYVN0cmVhbSIsImZvckVhY2giLCJhZGRUcmFjayIsInZpZGVvVHJhY2tzIiwiZ2V0VmlkZW9UcmFja3MiLCJ2aWRlb1N0cmVhbSIsIngiLCJhZGRMb2NhbE1lZGlhU3RyZWFtIiwiaWQiLCJyZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbSIsIk9iamVjdCIsImtleXMiLCJhZGRTdHJlYW1Ub0NhbGwiLCJyZW1vdmVMb2NhbE1lZGlhU3RyZWFtIiwiY2xvc2VMb2NhbE1lZGlhU3RyZWFtIiwiZW5hYmxlTWljcm9waG9uZSIsImVuYWJsZWQiLCJlbmFibGVDYW1lcmEiLCJkaXNjb25uZWN0IiwiaGFuZGxlVXNlclB1Ymxpc2hlZCIsInVzZXIiLCJtZWRpYVR5cGUiLCJoYW5kbGVVc2VyVW5wdWJsaXNoZWQiLCJjcmVhdGVDbGllbnQiLCJtb2RlIiwiY29kZWMiLCJzZXRDbGllbnRSb2xlIiwib24iLCJzdWJzY3JpYmUiLCJwbGF5IiwiX21lZGlhU3RyZWFtVHJhY2siLCJxdWVyeVNlbGVjdG9yIiwic3JjT2JqZWN0IiwiZW5jX2lkIiwiX3AycENoYW5uZWwiLCJjb25uZWN0aW9uIiwicGVlckNvbm5lY3Rpb24iLCJyZWNlaXZlcnMiLCJnZXRSZWNlaXZlcnMiLCJnZXRFbGVtZW50QnlJZCIsImNhcHR1cmVTdHJlYW0iLCJqb2luIiwiY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2siLCJjcmVhdGVDdXN0b21WaWRlb1RyYWNrIiwibWVkaWFTdHJlYW1UcmFjayIsImNyZWF0ZUNhbWVyYVZpZGVvVHJhY2siLCJlbmNvZGVyQ29uZmlnIiwiY2FtcyIsImdldENhbWVyYXMiLCJsYWJlbCIsImRldmljZUlkIiwic2V0RGV2aWNlIiwiaW1nRWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJpbmplY3QiLCJzZXRPcHRpb25zIiwiZW5hYmxlIiwiYmFja2dyb3VuZCIsInNyYyIsIlZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uIiwicmVnaXN0ZXJFeHRlbnNpb25zIiwiY3JlYXRlUHJvY2Vzc29yIiwiaW5pdCIsInR5cGUiLCJjb2xvciIsInB1Ymxpc2giLCJzZW5kZXJzIiwiZ2V0U2VuZGVycyIsImtpbmQiLCJteVJvb21JZCIsImpvaW5UaW1lIiwiZ2V0U2VydmVyVGltZSIsInJlZ2lzdGVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7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QjtBQUNBLFVBQUk1SSxJQUFJLENBQVI7QUFDQSxXQUFLQSxJQUFJLENBQVQsRUFBWUEsSUFBSTJJLFFBQVF6USxNQUF4QixFQUFnQzhILEdBQWhDLEVBQXFDO0FBQ25DLFlBQUkySSxRQUFRM0ksQ0FBUixFQUFXbkosS0FBWCxJQUFxQjhSLFFBQVEzSSxDQUFSLEVBQVduSixLQUFYLENBQWlCZ1MsSUFBakIsSUFBeUIsT0FBbEQsRUFBMkQ7QUFBQztBQUMxRCxlQUFLbEssYUFBTCxDQUFtQmdLLFFBQVEzSSxDQUFSLENBQW5CO0FBQ0Q7QUFDRjtBQUNGOztBQUVEO0FBRUQ7O0FBRUQ7Ozs7QUFJQSxRQUFNMUMsUUFBTixDQUFlM0MsY0FBZixFQUErQkMsY0FBL0IsRUFBK0M7QUFDN0MsUUFBSXFFLE9BQU8sSUFBWDs7QUFFQSxVQUFNQSxLQUFLbEssT0FBTCxDQUFha0ksT0FBYixDQUFxQmdDLEtBQUs5SixHQUExQixFQUErQndGLGNBQS9CLEVBQStDQyxjQUEvQyxDQUFOOztBQUVBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0JEOztBQUVENkMsbUJBQWlCckgsUUFBakIsRUFBMkI7QUFDekIsUUFBSTBTLFdBQVcsS0FBSzFULElBQXBCLENBRHlCLENBQ0M7QUFDMUIsUUFBSTJULFdBQVcsS0FBS2hVLE9BQUwsQ0FBYStOLHFCQUFiLENBQW1DZ0csUUFBbkMsRUFBNkMxUyxRQUE3QyxFQUF1RDBILFlBQXRFO0FBQ0EsV0FBT2lMLFFBQVA7QUFDRDs7QUFFREMsa0JBQWdCO0FBQ2QsV0FBT3JOLEtBQUtDLEdBQUwsS0FBYSxLQUFLMUUsYUFBekI7QUFDRDtBQWh2Qm1COztBQW12QnRCaUgsSUFBSW9GLFFBQUosQ0FBYTBGLFFBQWIsQ0FBc0IsVUFBdEIsRUFBa0NwVSxlQUFsQzs7QUFFQXFVLE9BQU9DLE9BQVAsR0FBaUJ0VSxlQUFqQixDIiwiZmlsZSI6Im5hZi1hZ29yYS1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCJjbGFzcyBBZ29yYVJ0Y0FkYXB0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKGVhc3lydGMpIHtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29uc3RydWN0b3IgXCIsIGVhc3lydGMpO1xuXG4gICAgdGhpcy5lYXN5cnRjID0gZWFzeXJ0YyB8fCB3aW5kb3cuZWFzeXJ0YztcbiAgICB0aGlzLmFwcCA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMucm9vbSA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMudXNlcmlkID0gMDtcbiAgICB0aGlzLmFwcGlkID0gbnVsbDtcbiAgICB0aGlzLm1vY2FwRGF0YT1cIlwiO1xuXG4gICAgdGhpcy5tZWRpYVN0cmVhbXMgPSB7fTtcbiAgICB0aGlzLnJlbW90ZUNsaWVudHMgPSB7fTtcbiAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5lbmFibGVWaWRlbyA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZUF2YXRhciA9IGZhbHNlO1xuXG4gICAgdGhpcy5sb2NhbFRyYWNrcyA9IHsgdmlkZW9UcmFjazogbnVsbCwgYXVkaW9UcmFjazogbnVsbCB9O1xuICAgIHdpbmRvdy5sb2NhbFRyYWNrcyA9IHRoaXMubG9jYWxUcmFja3M7XG4gICAgdGhpcy50b2tlbiA9IG51bGw7XG4gICAgdGhpcy5jbGllbnRJZCA9IG51bGw7XG4gICAgdGhpcy51aWQgPSBudWxsO1xuICAgIHRoaXMudmJnID0gZmFsc2U7XG4gICAgdGhpcy52YmcwID0gZmFsc2U7XG4gICAgdGhpcy5zaG93TG9jYWwgPSBmYWxzZTtcbiAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UgPSBudWxsO1xuICAgIHRoaXMuZXh0ZW5zaW9uID0gbnVsbDtcbiAgICB0aGlzLnByb2Nlc3NvciA9IG51bGw7XG4gICAgdGhpcy5waXBlUHJvY2Vzc29yID0gKHRyYWNrLCBwcm9jZXNzb3IpID0+IHtcbiAgICAgIHRyYWNrLnBpcGUocHJvY2Vzc29yKS5waXBlKHRyYWNrLnByb2Nlc3NvckRlc3RpbmF0aW9uKTtcbiAgICB9XG5cblxuICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID0gMDtcbiAgICB0aGlzLnRpbWVPZmZzZXRzID0gW107XG4gICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gMDtcbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gbnVsbDtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyT3Blbkxpc3RlbmVyKGNsaWVudElkID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudENvbm5lY3Rpb24gPSB0aGlzLmVhc3lydGMuZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZChjbGllbnRJZCk7XG4gICAgICB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdID0gY2xpZW50Q29ubmVjdGlvbjtcbiAgICB9KTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyQ2xvc2VkTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF07XG4gICAgfSk7XG5cbiAgICB0aGlzLmlzQ2hyb21lID0gKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignRmlyZWZveCcpID09PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0Nocm9tZScpID4gLTEpO1xuXG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIHdpbmRvdy5vbGRSVENQZWVyQ29ubmVjdGlvbiA9IFJUQ1BlZXJDb25uZWN0aW9uO1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gbmV3IFByb3h5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwge1xuICAgICAgICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uICh0YXJnZXQsIGFyZ3MpIHtcbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhcmdzWzBdW1wiZW5jb2RlZEluc2VydGFibGVTdHJlYW1zXCJdID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJncy5wdXNoKHsgZW5jb2RlZEluc2VydGFibGVTdHJlYW1zOiB0cnVlIH0pO1xuICAgICAgICAgIH1cbiAgICAgIFxuICAgICAgICAgIGNvbnN0IHBjID0gbmV3IHdpbmRvdy5vbGRSVENQZWVyQ29ubmVjdGlvbiguLi5hcmdzKTtcbiAgICAgICAgICByZXR1cm4gcGM7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IG9sZFNldENvbmZpZ3VyYXRpb24gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldENvbmZpZ3VyYXRpb247XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldENvbmZpZ3VyYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhcmdzWzBdW1wiZW5jb2RlZEluc2VydGFibGVTdHJlYW1zXCJdID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhcmdzLnB1c2goeyBlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXM6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgIFxuICAgICAgICBvbGRTZXRDb25maWd1cmF0aW9uLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgLy8gY3VzdG9tIGRhdGEgYXBwZW5kIHBhcmFtc1xuICAgIHRoaXMuQ3VzdG9tRGF0YURldGVjdG9yID0gJ0FHT1JBTU9DQVAnO1xuICAgIHRoaXMuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ID0gNDtcbiAgICB0aGlzLnNlbmRlckNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgdGhpcy5yZWNlaXZlckNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgd2luZG93LkFnb3JhUnRjQWRhcHRlcj10aGlzO1xuICAgIFxuICB9XG5cbiAgc2V0U2VydmVyVXJsKHVybCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJVcmwgXCIsIHVybCk7XG4gICAgdGhpcy5lYXN5cnRjLnNldFNvY2tldFVybCh1cmwpO1xuICB9XG5cbiAgc2V0QXBwKGFwcE5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0QXBwIFwiLCBhcHBOYW1lKTtcbiAgICB0aGlzLmFwcCA9IGFwcE5hbWU7XG4gICAgdGhpcy5hcHBpZCA9IGFwcE5hbWU7XG4gIH1cblxuICBhc3luYyBzZXRSb29tKGpzb24pIHtcbiAgICBqc29uID0ganNvbi5yZXBsYWNlKC8nL2csICdcIicpO1xuICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgdGhpcy5yb29tID0gb2JqLm5hbWU7XG5cbiAgICBpZiAob2JqLnZiZyAmJiBvYmoudmJnPT0ndHJ1ZScgKSB7ICAgICAgXG4gICAgICB0aGlzLnZiZyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai52YmcwICYmIG9iai52YmcwPT0ndHJ1ZScgKSB7XG4gICAgICB0aGlzLnZiZzAgPSB0cnVlO1xuICAgICAgQWdvcmFSVEMubG9hZE1vZHVsZShTZWdQbHVnaW4sIHt9KTtcbiAgICB9XG5cbiAgICBpZiAob2JqLmVuYWJsZUF2YXRhciAmJiBvYmouZW5hYmxlQXZhdGFyPT0ndHJ1ZScgKSB7XG4gICAgICB0aGlzLmVuYWJsZUF2YXRhciA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai5zaG93TG9jYWwgICYmIG9iai5zaG93TG9jYWw9PSd0cnVlJykge1xuICAgICAgdGhpcy5zaG93TG9jYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmouZW5hYmxlVmlkZW9GaWx0ZXJlZCAmJiBvYmouZW5hYmxlVmlkZW9GaWx0ZXJlZD09J3RydWUnICkge1xuICAgICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5lYXN5cnRjLmpvaW5Sb29tKHRoaXMucm9vbSwgbnVsbCk7XG4gIH1cblxuICAvLyBvcHRpb25zOiB7IGRhdGFjaGFubmVsOiBib29sLCBhdWRpbzogYm9vbCwgdmlkZW86IGJvb2wgfVxuICBzZXRXZWJSdGNPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0V2ViUnRjT3B0aW9ucyBcIiwgb3B0aW9ucyk7XG4gICAgLy8gdGhpcy5lYXN5cnRjLmVuYWJsZURlYnVnKHRydWUpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVEYXRhQ2hhbm5lbHMob3B0aW9ucy5kYXRhY2hhbm5lbCk7XG5cbiAgICAvLyB1c2luZyBBZ29yYVxuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBvcHRpb25zLnZpZGVvO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBvcHRpb25zLmF1ZGlvO1xuXG4gICAgLy8gbm90IGVhc3lydGNcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvUmVjZWl2ZShmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvUmVjZWl2ZShmYWxzZSk7XG4gIH1cblxuICBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzKHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMgXCIsIHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKTtcbiAgICB0aGlzLmNvbm5lY3RTdWNjZXNzID0gc3VjY2Vzc0xpc3RlbmVyO1xuICAgIHRoaXMuY29ubmVjdEZhaWx1cmUgPSBmYWlsdXJlTGlzdGVuZXI7XG4gIH1cblxuICBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudExpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFJvb21PY2N1cGFudExpc3RlbmVyIFwiLCBvY2N1cGFudExpc3RlbmVyKTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihmdW5jdGlvbiAocm9vbU5hbWUsIG9jY3VwYW50cywgcHJpbWFyeSkge1xuICAgICAgb2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudHMpO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMob3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldERhdGFDaGFubmVsTGlzdGVuZXJzICBcIiwgb3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIob3Blbkxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyKGNsb3NlZExpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckxpc3RlbmVyKG1lc3NhZ2VMaXN0ZW5lcik7XG4gIH1cblxuICB1cGRhdGVUaW1lT2Zmc2V0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyB1cGRhdGVUaW1lT2Zmc2V0IFwiKTtcbiAgICBjb25zdCBjbGllbnRTZW50VGltZSA9IERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG5cbiAgICByZXR1cm4gZmV0Y2goZG9jdW1lbnQubG9jYXRpb24uaHJlZiwgeyBtZXRob2Q6IFwiSEVBRFwiLCBjYWNoZTogXCJuby1jYWNoZVwiIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgIHZhciBwcmVjaXNpb24gPSAxMDAwO1xuICAgICAgdmFyIHNlcnZlclJlY2VpdmVkVGltZSA9IG5ldyBEYXRlKHJlcy5oZWFkZXJzLmdldChcIkRhdGVcIikpLmdldFRpbWUoKSArIHByZWNpc2lvbiAvIDI7XG4gICAgICB2YXIgY2xpZW50UmVjZWl2ZWRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIHZhciBzZXJ2ZXJUaW1lID0gc2VydmVyUmVjZWl2ZWRUaW1lICsgKGNsaWVudFJlY2VpdmVkVGltZSAtIGNsaWVudFNlbnRUaW1lKSAvIDI7XG4gICAgICB2YXIgdGltZU9mZnNldCA9IHNlcnZlclRpbWUgLSBjbGllbnRSZWNlaXZlZFRpbWU7XG5cbiAgICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzKys7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA8PSAxMCkge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzLnB1c2godGltZU9mZnNldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzW3RoaXMuc2VydmVyVGltZVJlcXVlc3RzICUgMTBdID0gdGltZU9mZnNldDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gdGhpcy50aW1lT2Zmc2V0cy5yZWR1Y2UoKGFjYywgb2Zmc2V0KSA9PiBhY2MgKz0gb2Zmc2V0LCAwKSAvIHRoaXMudGltZU9mZnNldHMubGVuZ3RoO1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPiAxMCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlVGltZU9mZnNldCgpLCA1ICogNjAgKiAxMDAwKTsgLy8gU3luYyBjbG9jayBldmVyeSA1IG1pbnV0ZXMuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbm5lY3QoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3QgXCIpO1xuICAgIFByb21pc2UuYWxsKFt0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY29ubmVjdChyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pXSkudGhlbigoW18sIGNsaWVudElkXSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3RlZCBcIiArIGNsaWVudElkKTtcbiAgICAgIHRoaXMuY2xpZW50SWQgPSBjbGllbnRJZDtcbiAgICAgIHRoaXMuX215Um9vbUpvaW5UaW1lID0gdGhpcy5fZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKTtcbiAgICAgIHRoaXMuY29ubmVjdEFnb3JhKCk7XG4gICAgICB0aGlzLmNvbm5lY3RTdWNjZXNzKGNsaWVudElkKTtcbiAgICB9KS5jYXRjaCh0aGlzLmNvbm5lY3RGYWlsdXJlKTtcbiAgfVxuXG4gIHNob3VsZFN0YXJ0Q29ubmVjdGlvblRvKGNsaWVudCkge1xuICAgIHJldHVybiB0aGlzLl9teVJvb21Kb2luVGltZSA8PSBjbGllbnQucm9vbUpvaW5UaW1lO1xuICB9XG5cbiAgc3RhcnRTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbiBcIiwgY2xpZW50SWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5jYWxsKGNsaWVudElkLCBmdW5jdGlvbiAoY2FsbGVyLCBtZWRpYSkge1xuICAgICAgaWYgKG1lZGlhID09PSBcImRhdGFjaGFubmVsXCIpIHtcbiAgICAgICAgTkFGLmxvZy53cml0ZShcIlN1Y2Nlc3NmdWxseSBzdGFydGVkIGRhdGFjaGFubmVsIHRvIFwiLCBjYWxsZXIpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvckNvZGUsIGVycm9yVGV4dCkge1xuICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm9yVGV4dCk7XG4gICAgfSwgZnVuY3Rpb24gKHdhc0FjY2VwdGVkKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIndhcyBhY2NlcHRlZD1cIiArIHdhc0FjY2VwdGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlU3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjbG9zZVN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuaGFuZ3VwKGNsaWVudElkKTtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUVuY29kZXIoc2VuZGVyKSB7XG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIGNvbnN0IHN0cmVhbXMgPSBzZW5kZXIuY3JlYXRlRW5jb2RlZFN0cmVhbXMoKTtcbiAgICAgIGNvbnN0IHRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgICB2YXIgdGhhdD10aGlzO1xuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKHtcbiAgICAgICAgdHJhbnNmb3JtKGNodW5rLCBjb250cm9sbGVyKSB7XG4gICAgICAgICAgY29uc3QgbW9jYXAgPSB0ZXh0RW5jb2Rlci5lbmNvZGUodGhhdC5tb2NhcERhdGEpO1xuICAgICAgICAgIGNvbnN0IGZyYW1lID0gY2h1bmsuZGF0YTtcbiAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICBkYXRhLnNldChuZXcgVWludDhBcnJheShmcmFtZSksIDApO1xuICAgICAgICAgIGRhdGEuc2V0KG1vY2FwLCBmcmFtZS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgICB2YXIgYnl0ZXMgPSB0aGF0LmdldEludEJ5dGVzKG1vY2FwLmJ5dGVMZW5ndGgpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgZGF0YVtmcmFtZS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIGldID0gYnl0ZXNbaV07XG4gICAgICAgICAgfVxuICBcbiAgICAgICAgICAvLyBTZXQgbWFnaWMgc3RyaW5nIGF0IHRoZSBlbmRcbiAgICAgICAgICBjb25zdCBtYWdpY0luZGV4ID0gZnJhbWUuYnl0ZUxlbmd0aCArIG1vY2FwLmJ5dGVMZW5ndGggKyB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkYXRhW21hZ2ljSW5kZXggKyBpXSA9IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNodW5rLmRhdGEgPSBkYXRhLmJ1ZmZlcjtcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmspO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgXG4gICAgICBzdHJlYW1zLnJlYWRhYmxlLnBpcGVUaHJvdWdoKHRyYW5zZm9ybWVyKS5waXBlVG8oc3RyZWFtcy53cml0YWJsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0aGF0PXRoaXM7XG4gICAgICBjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyKCcvZGlzdC9zY3JpcHQtdHJhbnNmb3JtLXdvcmtlci5qcycpO1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB3b3JrZXIub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5kYXRhID09PSAncmVnaXN0ZXJlZCcpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3Qgc2VuZGVyVHJhbnNmb3JtID0gbmV3IFJUQ1J0cFNjcmlwdFRyYW5zZm9ybSh3b3JrZXIsIHsgbmFtZTogJ291dGdvaW5nJywgcG9ydDogdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQyIH0sIFt0aGF0LnNlbmRlckNoYW5uZWwucG9ydDJdKTtcbiAgICAgIHNlbmRlclRyYW5zZm9ybS5wb3J0ID0gdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQxO1xuICAgICAgc2VuZGVyLnRyYW5zZm9ybSA9IHNlbmRlclRyYW5zZm9ybTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3N0YXJ0ZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoYXQuc2VuZGVyQ2hhbm5lbC5wb3J0MS5wb3N0TWVzc2FnZSh7IHdhdGVybWFyazogdGhhdC5tb2NhcERhdGEgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY3JlYXRlRGVjb2RlcihyZWNlaXZlcixjbGllbnRJZCkge1xuICAgIGlmICh0aGlzLmlzQ2hyb21lKSB7XG4gICAgICBjb25zdCBzdHJlYW1zID0gcmVjZWl2ZXIuY3JlYXRlRW5jb2RlZFN0cmVhbXMoKTtcbiAgICAgIGNvbnN0IHRleHREZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgICB2YXIgdGhhdD10aGlzO1xuXG4gICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IG5ldyBUcmFuc2Zvcm1TdHJlYW0oe1xuICAgICAgICB0cmFuc2Zvcm0oY2h1bmssIGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KGNodW5rLmRhdGEpOyAgXG4gICAgICAgICAgY29uc3QgbWFnaWNEYXRhID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YSwgY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoLCB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpO1xuICAgICAgICAgIGxldCBtYWdpYyA9IFtdO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG1hZ2ljLnB1c2gobWFnaWNEYXRhW2ldKTtcblxuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgbWFnaWNTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLm1hZ2ljKTtcbiAgICAgICAgICBpZiAobWFnaWNTdHJpbmcgPT09IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yKSB7XG4gICAgICAgICAgICBjb25zdCBtb2NhcExlbiA9IHZpZXcuZ2V0VWludDMyKGNodW5rLmRhdGEuYnl0ZUxlbmd0aCAtICh0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudCArIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCksIGZhbHNlKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYW1lU2l6ZSA9IGNodW5rLmRhdGEuYnl0ZUxlbmd0aCAtIChtb2NhcExlbiArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCk7XG4gICAgICAgICAgICBjb25zdCBtb2NhcEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGNodW5rLmRhdGEsIGZyYW1lU2l6ZSwgbW9jYXBMZW4pO1xuICAgICAgICAgICAgY29uc3QgbW9jYXAgPSB0ZXh0RGVjb2Rlci5kZWNvZGUobW9jYXBCdWZmZXIpICAgICAgICBcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdGVNb2NhcChtb2NhcCtcIixcIitjbGllbnRJZCk7XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGNodW5rLmRhdGE7XG4gICAgICAgICAgICBjaHVuay5kYXRhID0gbmV3IEFycmF5QnVmZmVyKGZyYW1lU2l6ZSk7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YSk7XG4gICAgICAgICAgICBkYXRhLnNldChuZXcgVWludDhBcnJheShmcmFtZSwgMCwgZnJhbWVTaXplKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjaHVuayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgc3RyZWFtcy5yZWFkYWJsZS5waXBlVGhyb3VnaCh0cmFuc2Zvcm1lcikucGlwZVRvKHN0cmVhbXMud3JpdGFibGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdGhhdD10aGlzO1xuICAgICAgY29uc3Qgd29ya2VyID0gbmV3IFdvcmtlcignL2Rpc3Qvc2NyaXB0LXRyYW5zZm9ybS13b3JrZXIuanMnKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3JlZ2lzdGVyZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgXG4gICAgICBjb25zdCByZWNlaXZlclRyYW5zZm9ybSA9IG5ldyBSVENSdHBTY3JpcHRUcmFuc2Zvcm0od29ya2VyLCB7IG5hbWU6ICdpbmNvbWluZycsIHBvcnQ6IHRoYXQucmVjZWl2ZXJDaGFubmVsLnBvcnQyIH0sIFt0aGF0LnJlY2VpdmVyQ2hhbm5lbC5wb3J0Ml0pO1xuICAgICAgcmVjZWl2ZXJUcmFuc2Zvcm0ucG9ydCA9IHRoYXQucmVjZWl2ZXJDaGFubmVsLnBvcnQxO1xuICAgICAgcmVjZWl2ZXIudHJhbnNmb3JtID0gcmVjZWl2ZXJUcmFuc2Zvcm07XG4gICAgICByZWNlaXZlclRyYW5zZm9ybS5wb3J0Lm9ubWVzc2FnZSA9IGUgPT4ge1xuICAgICAgICB3aW5kb3cucmVtb3RlTW9jYXAoZS5kYXRhK1wiLFwiK2NsaWVudElkKTtcbiAgICAgIH07XG4gIFxuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB3b3JrZXIub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5kYXRhID09PSAnc3RhcnRlZCcpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSAgXG4gIHNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZW5kRGF0YSBcIiwgY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGEoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIHNlbmREYXRhR3VhcmFudGVlZChjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGFHdWFyYW50ZWVkIFwiLCBjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBicm9hZGNhc3REYXRhKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGJyb2FkY2FzdERhdGEgXCIsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB2YXIgcm9vbU9jY3VwYW50cyA9IHRoaXMuZWFzeXJ0Yy5nZXRSb29tT2NjdXBhbnRzQXNNYXAodGhpcy5yb29tKTtcblxuICAgIC8vIEl0ZXJhdGUgb3ZlciB0aGUga2V5cyBvZiB0aGUgZWFzeXJ0YyByb29tIG9jY3VwYW50cyBtYXAuXG4gICAgLy8gZ2V0Um9vbU9jY3VwYW50c0FzQXJyYXkgdXNlcyBPYmplY3Qua2V5cyB3aGljaCBhbGxvY2F0ZXMgbWVtb3J5LlxuICAgIGZvciAodmFyIHJvb21PY2N1cGFudCBpbiByb29tT2NjdXBhbnRzKSB7XG4gICAgICBpZiAocm9vbU9jY3VwYW50c1tyb29tT2NjdXBhbnRdICYmIHJvb21PY2N1cGFudCAhPT0gdGhpcy5lYXN5cnRjLm15RWFzeXJ0Y2lkKSB7XG4gICAgICAgIC8vIHNlbmQgdmlhIHdlYnJ0YyBvdGhlcndpc2UgZmFsbGJhY2sgdG8gd2Vic29ja2V0c1xuICAgICAgICB0aGlzLmVhc3lydGMuc2VuZERhdGEocm9vbU9jY3VwYW50LCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQoZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQgXCIsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB2YXIgZGVzdGluYXRpb24gPSB7IHRhcmdldFJvb206IHRoaXMucm9vbSB9O1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGRlc3RpbmF0aW9uLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBnZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGdldENvbm5lY3RTdGF0dXMgXCIsIGNsaWVudElkKTtcbiAgICB2YXIgc3RhdHVzID0gdGhpcy5lYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpO1xuXG4gICAgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuSVNfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLklTX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuTk9UX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5OT1RfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLkNPTk5FQ1RJTkc7XG4gICAgfVxuICB9XG5cbiAgZ2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbU5hbWUgPSBcImF1ZGlvXCIpIHtcblxuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuICAgIC8vIGlmICggc3RyZWFtTmFtZSA9IFwiYXVkaW9cIikge1xuICAgIC8vc3RyZWFtTmFtZSA9IFwiYm9kX2F1ZGlvXCI7XG4gICAgLy99XG5cbiAgICBpZiAodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdICYmIHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSkge1xuICAgICAgTkFGLmxvZy53cml0ZShgQWxyZWFkeSBoYWQgJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgTkFGLmxvZy53cml0ZShgV2FpdGluZyBvbiAke3N0cmVhbU5hbWV9IGZvciAke2NsaWVudElkfWApO1xuXG4gICAgICAvLyBDcmVhdGUgaW5pdGlhbCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyB3aXRoIGF1ZGlvfHZpZGVvIGFsaWFzXG4gICAgICBpZiAoIXRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuaGFzKGNsaWVudElkKSkge1xuICAgICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHt9O1xuXG4gICAgICAgIGNvbnN0IGF1ZGlvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBBdWRpbyBFcnJvcmAsIGUpKTtcblxuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5wcm9taXNlID0gYXVkaW9Qcm9taXNlO1xuXG4gICAgICAgIGNvbnN0IHZpZGVvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBWaWRlbyBFcnJvcmAsIGUpKTtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucHJvbWlzZSA9IHZpZGVvUHJvbWlzZTtcblxuICAgICAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLnNldChjbGllbnRJZCwgcGVuZGluZ01lZGlhUmVxdWVzdHMpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBzdHJlYW1OYW1lXG4gICAgICBpZiAoIXBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gXCIke3N0cmVhbU5hbWV9XCIgRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnByb21pc2UgPSBzdHJlYW1Qcm9taXNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpW3N0cmVhbU5hbWVdLnByb21pc2U7XG4gICAgfVxuICB9XG5cbiAgc2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7IC8vIHJldHVybiB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm8gZW50cnkgaW4gdGhlIE1hcFxuICAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICAgIGlmIChzdHJlYW1OYW1lID09PSAnZGVmYXVsdCcpIHtcbiAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IGxpa2UgaXQgd2hlbiB5b3UgdXNlIGEgbWl4ZWQgbWVkaWEgc3RyZWFtIHdoZXJlIG9uZSBvZiB0aGUgdHJhY2tzIGlzIGluYWN0aXZlLCBzbyB3ZVxuICAgICAgLy8gc3BsaXQgdGhlIHRyYWNrcyBpbnRvIHR3byBzdHJlYW1zLlxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyBhdWRpbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCBhdWRpb1RyYWNrcyA9IHN0cmVhbS5nZXRBdWRpb1RyYWNrcygpO1xuICAgICAgaWYgKGF1ZGlvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IGF1ZGlvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwiYXVkaW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYXVkaW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIHZpZGVvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IHZpZGVvVHJhY2tzID0gc3RyZWFtLmdldFZpZGVvVHJhY2tzKCk7XG4gICAgICBpZiAodmlkZW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZpZGVvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gdmlkZW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gc2V0TWVkaWFTdHJlYW0gXCJ2aWRlb1wiIGFsaWFzIEVycm9yYCwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSB2aWRlbyBhbGlhcyBpZiBpdCBleGlzdHMuXG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsaWVudE1lZGlhU3RyZWFtc1tzdHJlYW1OYW1lXSA9IHN0cmVhbTtcblxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYnkgU3RyZWFtTmFtZSBpZiBpdCBleGlzdHMuXG4gICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMgJiYgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0ucmVzb2x2ZShzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldEludEJ5dGVzKHgpIHtcbiAgICB2YXIgYnl0ZXMgPSBbXTtcbiAgICB2YXIgaSA9IHRoaXMuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50O1xuICAgIGRvIHtcbiAgICAgIGJ5dGVzWy0taV0gPSB4ICYgKDI1NSk7XG4gICAgICB4ID0geCA+PiA4O1xuICAgIH0gd2hpbGUgKGkpXG4gICAgcmV0dXJuIGJ5dGVzO1xuICB9XG5cbiAgYWRkTG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYWRkTG9jYWxNZWRpYVN0cmVhbSBcIiwgc3RyZWFtLCBzdHJlYW1OYW1lKTtcbiAgICBjb25zdCBlYXN5cnRjID0gdGhpcy5lYXN5cnRjO1xuICAgIHN0cmVhbU5hbWUgPSBzdHJlYW1OYW1lIHx8IHN0cmVhbS5pZDtcbiAgICB0aGlzLnNldE1lZGlhU3RyZWFtKFwibG9jYWxcIiwgc3RyZWFtLCBzdHJlYW1OYW1lKTtcbiAgICBlYXN5cnRjLnJlZ2lzdGVyM3JkUGFydHlMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgc3RyZWFtTmFtZSk7XG5cbiAgICAvLyBBZGQgbG9jYWwgc3RyZWFtIHRvIGV4aXN0aW5nIGNvbm5lY3Rpb25zXG4gICAgT2JqZWN0LmtleXModGhpcy5yZW1vdGVDbGllbnRzKS5mb3JFYWNoKGNsaWVudElkID0+IHtcbiAgICAgIGlmIChlYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpICE9PSBlYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgICAgZWFzeXJ0Yy5hZGRTdHJlYW1Ub0NhbGwoY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHJlbW92ZUxvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbU5hbWUpO1xuICAgIHRoaXMuZWFzeXJ0Yy5jbG9zZUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtTmFtZSk7XG4gICAgZGVsZXRlIHRoaXMubWVkaWFTdHJlYW1zW1wibG9jYWxcIl1bc3RyZWFtTmFtZV07XG4gIH1cblxuICBlbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlTWljcm9waG9uZSBcIiwgZW5hYmxlZCk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCk7XG4gIH1cblxuICBlbmFibGVDYW1lcmEoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBlbmFibGVDYW1lcmEgXCIsIGVuYWJsZWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVDYW1lcmEoZW5hYmxlZCk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBkaXNjb25uZWN0IFwiKTtcbiAgICB0aGlzLmVhc3lydGMuZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlVXNlclB1Ymxpc2hlZCh1c2VyLCBtZWRpYVR5cGUpIHsgfVxuXG4gIGhhbmRsZVVzZXJVbnB1Ymxpc2hlZCh1c2VyLCBtZWRpYVR5cGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclVuUHVibGlzaGVkIFwiKTtcbiAgfVxuXG4gIGFzeW5jIGNvbm5lY3RBZ29yYSgpIHtcbiAgICAvLyBBZGQgYW4gZXZlbnQgbGlzdGVuZXIgdG8gcGxheSByZW1vdGUgdHJhY2tzIHdoZW4gcmVtb3RlIHVzZXIgcHVibGlzaGVzLlxuICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgIHRoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwidnA4XCIgfSk7XG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCB8fCB0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwicnRjXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcImgyNjRcIiB9KTtcbiAgICAgIHRoaXMuYWdvcmFDbGllbnQuc2V0Q2xpZW50Um9sZShcImhvc3RcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJoMjY0XCIgfSk7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwidnA4XCIgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItam9pbmVkXCIsIGFzeW5jICh1c2VyKSA9PiB7XG4gICAgICBjb25zb2xlLndhcm4oXCJ1c2VyLWpvaW5lZFwiLCB1c2VyKTtcbiAgICB9KTtcbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci1wdWJsaXNoZWRcIiwgYXN5bmMgKHVzZXIsIG1lZGlhVHlwZSkgPT4ge1xuXG4gICAgICBsZXQgY2xpZW50SWQgPSB1c2VyLnVpZDtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkIFwiICsgY2xpZW50SWQgKyBcIiBcIiArIG1lZGlhVHlwZSwgdGhhdC5hZ29yYUNsaWVudCk7XG4gICAgICBhd2FpdCB0aGF0LmFnb3JhQ2xpZW50LnN1YnNjcmliZSh1c2VyLCBtZWRpYVR5cGUpO1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJQdWJsaXNoZWQyIFwiICsgY2xpZW50SWQgKyBcIiBcIiArIHRoYXQuYWdvcmFDbGllbnQpO1xuXG4gICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoYXQucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTtcbiAgICAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICB1c2VyLmF1ZGlvVHJhY2sucGxheSgpO1xuXG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidXNlci5hdWRpb1RyYWNrIFwiLCB1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICAvL2F1ZGlvU3RyZWFtLmFkZFRyYWNrKHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICBsZXQgdmlkZW9TdHJlYW0gPSBudWxsO1xuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIudmlkZW9UcmFjayBcIiwgdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgdmlkZW9TdHJlYW0uYWRkVHJhY2sodXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICAgIC8vdXNlci52aWRlb1RyYWNrXG4gICAgICB9XG5cbiAgICAgIGlmIChjbGllbnRJZCA9PSAnQ0NDJykge1xuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2aWRlbzM2MFwiKS5zcmNPYmplY3Q9dmlkZW9TdHJlYW07XG4gICAgICAgICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2aWRlb1N0cmVhbSk7XG4gICAgICAgICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNldEF0dHJpYnV0ZShcInNyY1wiLCB1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zcmNPYmplY3Q9IHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjaztcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNyY09iamVjdCA9IHZpZGVvU3RyZWFtO1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikucGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICB1c2VyLmF1ZGlvVHJhY2sucGxheSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY2xpZW50SWQgPT0gJ0RERCcpIHtcbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgIHVzZXIudmlkZW9UcmFjay5wbGF5KFwidmlkZW8zNjBcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuXG4gICAgICBsZXQgZW5jX2lkO1xuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICBlbmNfaWQ9dXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrLmlkOyAgICAgICBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVuY19pZD11c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2suaWQ7XG4gICAgICB9XG4gICAgXG4gICAgICAvL2NvbnNvbGUud2FybihtZWRpYVR5cGUsZW5jX2lkKTsgICAgXG4gICAgICBjb25zdCBwYyA9dGhpcy5hZ29yYUNsaWVudC5fcDJwQ2hhbm5lbC5jb25uZWN0aW9uLnBlZXJDb25uZWN0aW9uO1xuICAgICAgY29uc3QgcmVjZWl2ZXJzID0gcGMuZ2V0UmVjZWl2ZXJzKCk7ICBcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVjZWl2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChyZWNlaXZlcnNbaV0udHJhY2sgJiYgcmVjZWl2ZXJzW2ldLnRyYWNrLmlkPT09ZW5jX2lkICkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIk1hdGNoXCIsbWVkaWFUeXBlLGVuY19pZCk7XG4gICAgICAgICAgdGhpcy5jcmVhdGVEZWNvZGVyKHJlY2VpdmVyc1tpXSxjbGllbnRJZCk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuXG4gICAgfSk7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci11bnB1Ymxpc2hlZFwiLCB0aGF0LmhhbmRsZVVzZXJVbnB1Ymxpc2hlZCk7XG5cbiAgICBjb25zb2xlLmxvZyhcImNvbm5lY3QgYWdvcmEgXCIpO1xuICAgIC8vIEpvaW4gYSBjaGFubmVsIGFuZCBjcmVhdGUgbG9jYWwgdHJhY2tzLiBCZXN0IHByYWN0aWNlIGlzIHRvIHVzZSBQcm9taXNlLmFsbCBhbmQgcnVuIHRoZW0gY29uY3VycmVudGx5LlxuICAgIC8vIG9cblxuXG4gICAgaWYgKHRoaXMuZW5hYmxlQXZhdGFyKSB7XG4gICAgICB2YXIgc3RyZWFtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNcIikuY2FwdHVyZVN0cmVhbSgzMCk7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLFxuICAgICAgICBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDdXN0b21WaWRlb1RyYWNrKHsgbWVkaWFTdHJlYW1UcmFjazogc3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF0gfSldKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkICYmIHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIHZhciBzdHJlYW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc19zZWNyZXRcIikuY2FwdHVyZVN0cmVhbSgzMCk7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFt0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUN1c3RvbVZpZGVvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXSB9KV0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soeyBlbmNvZGVyQ29uZmlnOiAnNDgwcF8yJyB9KV0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soXCIzNjBwXzRcIildKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgLy8gSm9pbiB0aGUgY2hhbm5lbC5cbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpXSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJjcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFja1wiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51c2VyaWQgPSBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCk7XG4gICAgfVxuXG5cbiAgICAvLyBzZWxlY3QgZmFjZXRpbWUgY2FtZXJhIGlmIGV4aXN0c1xuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmICF0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQpIHtcbiAgICAgIGxldCBjYW1zID0gYXdhaXQgQWdvcmFSVEMuZ2V0Q2FtZXJhcygpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjYW1zW2ldLmxhYmVsLmluZGV4T2YoXCJGYWNlVGltZVwiKSA9PSAwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzZWxlY3QgRmFjZVRpbWUgY2FtZXJhXCIsIGNhbXNbaV0uZGV2aWNlSWQpO1xuICAgICAgICAgIGF3YWl0IHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5zZXREZXZpY2UoY2Ftc1tpXS5kZXZpY2VJZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnNob3dMb2NhbCkge1xuICAgICAgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnBsYXkoXCJsb2NhbC1wbGF5ZXJcIik7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBPTEQgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcwICYmIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaykge1xuICAgICAgY29uc3QgaW1nRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgaW1nRWxlbWVudC5vbmxvYWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJTRUcgSU5JVCBcIiwgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKTtcbiAgICAgICAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UgPSBhd2FpdCBTZWdQbHVnaW4uaW5qZWN0KHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaywgXCIvYXNzZXRzL3dhc21zMFwiKS5jYXRjaChjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklURURcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlLnNldE9wdGlvbnMoeyBlbmFibGU6IHRydWUsIGJhY2tncm91bmQ6IGltZ0VsZW1lbnQgfSk7XG4gICAgICB9O1xuICAgICAgaW1nRWxlbWVudC5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBUUFBQUFEQ0FJQUFBQTdsam1SQUFBQUQwbEVRVlI0WG1OZytNK0FRRGc1QU9rOUMvVmtvbXpZQUFBQUFFbEZUa1N1UW1DQyc7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBOZXcgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcgJiYgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKSB7XG5cbiAgICAgIHRoaXMuZXh0ZW5zaW9uID0gbmV3IFZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uKCk7XG4gICAgICBBZ29yYVJUQy5yZWdpc3RlckV4dGVuc2lvbnMoW3RoaXMuZXh0ZW5zaW9uXSk7XG4gICAgICB0aGlzLnByb2Nlc3NvciA9IHRoaXMuZXh0ZW5zaW9uLmNyZWF0ZVByb2Nlc3NvcigpO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3IuaW5pdChcIi9hc3NldHMvd2FzbXNcIik7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGlwZSh0aGlzLnByb2Nlc3NvcikucGlwZSh0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucHJvY2Vzc29yRGVzdGluYXRpb24pO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3Iuc2V0T3B0aW9ucyh7IHR5cGU6ICdjb2xvcicsIGNvbG9yOiBcIiMwMGZmMDBcIiB9KTtcbiAgICAgIGF3YWl0IHRoaXMucHJvY2Vzc29yLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIHdpbmRvdy5sb2NhbFRyYWNrcyA9IHRoaXMubG9jYWxUcmFja3M7XG5cbiAgICAvLyBQdWJsaXNoIHRoZSBsb2NhbCB2aWRlbyBhbmQgYXVkaW8gdHJhY2tzIHRvIHRoZSBjaGFubmVsLlxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8gfHwgdGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgIGlmICh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spXG4gICAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spO1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaylcbiAgICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjayk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwicHVibGlzaCBzdWNjZXNzXCIpO1xuICAgICAgY29uc3QgcGMgPXRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHNlbmRlcnMgPSBwYy5nZXRTZW5kZXJzKCk7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc2VuZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VuZGVyc1tpXS50cmFjayAmJiAoc2VuZGVyc1tpXS50cmFjay5raW5kID09ICdhdWRpbycpKXsvL30gfHwgc2VuZGVyc1tpXS50cmFjay5raW5kID09ICd2aWRlbycgKSkge1xuICAgICAgICAgIHRoaXMuY3JlYXRlRW5jb2RlcihzZW5kZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfSAgICAgIFxuICAgIH1cblxuICAgIC8vIFJUTVxuXG4gIH1cblxuICAvKipcbiAgICogUHJpdmF0ZXNcbiAgICovXG5cbiAgYXN5bmMgX2Nvbm5lY3QoY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgYXdhaXQgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG5cbiAgICAvKlxuICAgICAgIHRoaXMuZWFzeXJ0Yy5zZXRTdHJlYW1BY2NlcHRvcih0aGlzLnNldE1lZGlhU3RyZWFtLmJpbmQodGhpcykpO1xuICAgICAgIHRoaXMuZWFzeXJ0Yy5zZXRPblN0cmVhbUNsb3NlZChmdW5jdGlvbihjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV07XG4gICAgICB9KTtcbiAgICAgICBpZiAodGhhdC5lYXN5cnRjLmF1ZGlvRW5hYmxlZCB8fCB0aGF0LmVhc3lydGMudmlkZW9FbmFibGVkKSB7XG4gICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHtcbiAgICAgICAgICB2aWRlbzogdGhhdC5lYXN5cnRjLnZpZGVvRW5hYmxlZCxcbiAgICAgICAgICBhdWRpbzogdGhhdC5lYXN5cnRjLmF1ZGlvRW5hYmxlZFxuICAgICAgICB9KS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgICAgdGhhdC5hZGRMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgXCJkZWZhdWx0XCIpO1xuICAgICAgICAgICAgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnJvckNvZGUsIGVycm1lc2cpIHtcbiAgICAgICAgICAgIE5BRi5sb2cuZXJyb3IoZXJyb3JDb2RlLCBlcnJtZXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICAgIH1cbiAgICAgICovXG4gIH1cblxuICBfZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKSB7XG4gICAgdmFyIG15Um9vbUlkID0gdGhpcy5yb29tOyAvL05BRi5yb29tO1xuICAgIHZhciBqb2luVGltZSA9IHRoaXMuZWFzeXJ0Yy5nZXRSb29tT2NjdXBhbnRzQXNNYXAobXlSb29tSWQpW2NsaWVudElkXS5yb29tSm9pblRpbWU7XG4gICAgcmV0dXJuIGpvaW5UaW1lO1xuICB9XG5cbiAgZ2V0U2VydmVyVGltZSgpIHtcbiAgICByZXR1cm4gRGF0ZS5ub3coKSArIHRoaXMuYXZnVGltZU9mZnNldDtcbiAgfVxufVxuXG5OQUYuYWRhcHRlcnMucmVnaXN0ZXIoXCJhZ29yYXJ0Y1wiLCBBZ29yYVJ0Y0FkYXB0ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFnb3JhUnRjQWRhcHRlcjtcbiJdLCJzb3VyY2VSb290IjoiIn0=