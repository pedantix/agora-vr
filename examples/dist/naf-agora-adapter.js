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
    this.logi = 0;
    this.logo = 0;
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
    this.receiverChannel;
    this.r_receiver = null;
    this.r_clientId = null;
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

  sendMocap(mocap) {
    this.mocapData = mocap;
    if (!this.isChrome) {

      if (this.logo++ > 50) {
        console.warn("send", mocap);
        this.logo = 0;
      }
      this.senderChannel.port1.postMessage({ watermark: mocap });
    }
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

  async recreateDecoder() {
    this.createDecoder(this.r_receiver, this.r_clientId);
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
      this.receiverChannel = new MessageChannel();
      var that = this;
      const worker = new Worker('/dist/script-transform-worker.js');

      console.warn("incoming 1", clientId, worker);
      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'registered') {

          console.warn("incoming 2a", clientId, event.data);
          resolve();
        }
        console.warn("incoming 2", clientId, event.data);
      });

      console.warn("incoming 3", clientId);

      const receiverTransform = new RTCRtpScriptTransform(worker, { name: 'incoming', port: that.receiverChannel.port2 }, [that.receiverChannel.port2]);

      console.warn("incoming 4", clientId, receiverTransform);

      receiverTransform.port = that.receiverChannel.port1;
      receiver.transform = receiverTransform;
      receiverTransform.port.onmessage = e => {
        //console.warn("wahoo in",e);
        if (this.logi++ > 50) {
          console.warn("wahoo in from ", clientId);
          this.logi = 0;
        }
        window.remoteMocap(e.data + "," + clientId);
      };

      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'started') {
          console.warn("incoming 5a", clientId, event.data);
          resolve();
        }
        console.warn("incoming 5", clientId, event.data);
      });
      console.warn("incoming 6", clientId);
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

      let enc_id = 'bob';
      if (mediaType === 'audio') {
        enc_id = user.audioTrack._mediaStreamTrack.id;
      } else {}
      // enc_id=user.videoTrack._mediaStreamTrack.id;


      //console.warn(mediaType,enc_id);    
      const pc = this.agoraClient._p2pChannel.connection.peerConnection;
      const receivers = pc.getReceivers();
      for (let i = 0; i < receivers.length; i++) {
        if (receivers[i].track && receivers[i].track.id === enc_id) {
          console.warn("Match", mediaType, enc_id);
          this.r_receiver = receivers[i];
          this.r_clientId = clientId;
          this.createDecoder(this.r_receiver, this.r_clientId);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtb2NhcERhdGEiLCJsb2dpIiwibG9nbyIsIm1lZGlhU3RyZWFtcyIsInJlbW90ZUNsaWVudHMiLCJwZW5kaW5nTWVkaWFSZXF1ZXN0cyIsIk1hcCIsImVuYWJsZVZpZGVvIiwiZW5hYmxlVmlkZW9GaWx0ZXJlZCIsImVuYWJsZUF1ZGlvIiwiZW5hYmxlQXZhdGFyIiwibG9jYWxUcmFja3MiLCJ2aWRlb1RyYWNrIiwiYXVkaW9UcmFjayIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJ2YmcwIiwic2hvd0xvY2FsIiwidmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSIsImV4dGVuc2lvbiIsInByb2Nlc3NvciIsInBpcGVQcm9jZXNzb3IiLCJ0cmFjayIsInBpcGUiLCJwcm9jZXNzb3JEZXN0aW5hdGlvbiIsInNlcnZlclRpbWVSZXF1ZXN0cyIsInRpbWVPZmZzZXRzIiwiYXZnVGltZU9mZnNldCIsImFnb3JhQ2xpZW50Iiwic2V0UGVlck9wZW5MaXN0ZW5lciIsImNsaWVudENvbm5lY3Rpb24iLCJnZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkIiwic2V0UGVlckNsb3NlZExpc3RlbmVyIiwiaXNDaHJvbWUiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJpbmRleE9mIiwib2xkUlRDUGVlckNvbm5lY3Rpb24iLCJSVENQZWVyQ29ubmVjdGlvbiIsIlByb3h5IiwiY29uc3RydWN0IiwidGFyZ2V0IiwiYXJncyIsImxlbmd0aCIsInB1c2giLCJlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXMiLCJwYyIsIm9sZFNldENvbmZpZ3VyYXRpb24iLCJwcm90b3R5cGUiLCJzZXRDb25maWd1cmF0aW9uIiwiYXJndW1lbnRzIiwiYXBwbHkiLCJDdXN0b21EYXRhRGV0ZWN0b3IiLCJDdXN0b21EYXRMZW5ndGhCeXRlQ291bnQiLCJzZW5kZXJDaGFubmVsIiwiTWVzc2FnZUNoYW5uZWwiLCJyZWNlaXZlckNoYW5uZWwiLCJyX3JlY2VpdmVyIiwicl9jbGllbnRJZCIsInNldFNlcnZlclVybCIsInVybCIsInNldFNvY2tldFVybCIsInNldEFwcCIsImFwcE5hbWUiLCJzZXRSb29tIiwianNvbiIsInJlcGxhY2UiLCJvYmoiLCJKU09OIiwicGFyc2UiLCJuYW1lIiwiQWdvcmFSVEMiLCJsb2FkTW9kdWxlIiwiU2VnUGx1Z2luIiwiam9pblJvb20iLCJzZXRXZWJSdGNPcHRpb25zIiwib3B0aW9ucyIsImVuYWJsZURhdGFDaGFubmVscyIsImRhdGFjaGFubmVsIiwidmlkZW8iLCJhdWRpbyIsImVuYWJsZVZpZGVvUmVjZWl2ZSIsImVuYWJsZUF1ZGlvUmVjZWl2ZSIsInNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMiLCJzdWNjZXNzTGlzdGVuZXIiLCJmYWlsdXJlTGlzdGVuZXIiLCJjb25uZWN0U3VjY2VzcyIsImNvbm5lY3RGYWlsdXJlIiwic2V0Um9vbU9jY3VwYW50TGlzdGVuZXIiLCJvY2N1cGFudExpc3RlbmVyIiwicm9vbU5hbWUiLCJvY2N1cGFudHMiLCJwcmltYXJ5Iiwic2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMiLCJvcGVuTGlzdGVuZXIiLCJjbG9zZWRMaXN0ZW5lciIsIm1lc3NhZ2VMaXN0ZW5lciIsInNldERhdGFDaGFubmVsT3Blbkxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyIiwic2V0UGVlckxpc3RlbmVyIiwidXBkYXRlVGltZU9mZnNldCIsImNsaWVudFNlbnRUaW1lIiwiRGF0ZSIsIm5vdyIsImZldGNoIiwiZG9jdW1lbnQiLCJsb2NhdGlvbiIsImhyZWYiLCJtZXRob2QiLCJjYWNoZSIsInRoZW4iLCJyZXMiLCJwcmVjaXNpb24iLCJzZXJ2ZXJSZWNlaXZlZFRpbWUiLCJoZWFkZXJzIiwiZ2V0IiwiZ2V0VGltZSIsImNsaWVudFJlY2VpdmVkVGltZSIsInNlcnZlclRpbWUiLCJ0aW1lT2Zmc2V0IiwicmVkdWNlIiwiYWNjIiwib2Zmc2V0Iiwic2V0VGltZW91dCIsImNvbm5lY3QiLCJQcm9taXNlIiwiYWxsIiwicmVzb2x2ZSIsInJlamVjdCIsIl9jb25uZWN0IiwiXyIsIl9teVJvb21Kb2luVGltZSIsIl9nZXRSb29tSm9pblRpbWUiLCJjb25uZWN0QWdvcmEiLCJjYXRjaCIsInNob3VsZFN0YXJ0Q29ubmVjdGlvblRvIiwiY2xpZW50Iiwicm9vbUpvaW5UaW1lIiwic3RhcnRTdHJlYW1Db25uZWN0aW9uIiwiY2FsbCIsImNhbGxlciIsIm1lZGlhIiwiTkFGIiwid3JpdGUiLCJlcnJvckNvZGUiLCJlcnJvclRleHQiLCJlcnJvciIsIndhc0FjY2VwdGVkIiwiY2xvc2VTdHJlYW1Db25uZWN0aW9uIiwiaGFuZ3VwIiwic2VuZE1vY2FwIiwibW9jYXAiLCJ3YXJuIiwicG9ydDEiLCJwb3N0TWVzc2FnZSIsIndhdGVybWFyayIsImNyZWF0ZUVuY29kZXIiLCJzZW5kZXIiLCJzdHJlYW1zIiwiY3JlYXRlRW5jb2RlZFN0cmVhbXMiLCJ0ZXh0RW5jb2RlciIsIlRleHRFbmNvZGVyIiwidGhhdCIsInRyYW5zZm9ybWVyIiwiVHJhbnNmb3JtU3RyZWFtIiwidHJhbnNmb3JtIiwiY2h1bmsiLCJjb250cm9sbGVyIiwiZW5jb2RlIiwiZnJhbWUiLCJkYXRhIiwiVWludDhBcnJheSIsImJ5dGVMZW5ndGgiLCJzZXQiLCJieXRlcyIsImdldEludEJ5dGVzIiwiaSIsIm1hZ2ljSW5kZXgiLCJjaGFyQ29kZUF0IiwiYnVmZmVyIiwiZW5xdWV1ZSIsInJlYWRhYmxlIiwicGlwZVRocm91Z2giLCJwaXBlVG8iLCJ3cml0YWJsZSIsIndvcmtlciIsIldvcmtlciIsIm9ubWVzc2FnZSIsImV2ZW50Iiwic2VuZGVyVHJhbnNmb3JtIiwiUlRDUnRwU2NyaXB0VHJhbnNmb3JtIiwicG9ydCIsInBvcnQyIiwicmVjcmVhdGVEZWNvZGVyIiwiY3JlYXRlRGVjb2RlciIsInJlY2VpdmVyIiwidGV4dERlY29kZXIiLCJUZXh0RGVjb2RlciIsInZpZXciLCJEYXRhVmlldyIsIm1hZ2ljRGF0YSIsIm1hZ2ljIiwibWFnaWNTdHJpbmciLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJtb2NhcExlbiIsImdldFVpbnQzMiIsImZyYW1lU2l6ZSIsIm1vY2FwQnVmZmVyIiwiZGVjb2RlIiwicmVtb3RlTW9jYXAiLCJBcnJheUJ1ZmZlciIsInJlY2VpdmVyVHJhbnNmb3JtIiwiZSIsInNlbmREYXRhIiwiZGF0YVR5cGUiLCJzZW5kRGF0YUd1YXJhbnRlZWQiLCJzZW5kRGF0YVdTIiwiYnJvYWRjYXN0RGF0YSIsInJvb21PY2N1cGFudHMiLCJnZXRSb29tT2NjdXBhbnRzQXNNYXAiLCJyb29tT2NjdXBhbnQiLCJteUVhc3lydGNpZCIsImJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIiwiZGVzdGluYXRpb24iLCJ0YXJnZXRSb29tIiwiZ2V0Q29ubmVjdFN0YXR1cyIsInN0YXR1cyIsIklTX0NPTk5FQ1RFRCIsImFkYXB0ZXJzIiwiTk9UX0NPTk5FQ1RFRCIsIkNPTk5FQ1RJTkciLCJnZXRNZWRpYVN0cmVhbSIsInN0cmVhbU5hbWUiLCJoYXMiLCJhdWRpb1Byb21pc2UiLCJwcm9taXNlIiwidmlkZW9Qcm9taXNlIiwic3RyZWFtUHJvbWlzZSIsInNldE1lZGlhU3RyZWFtIiwic3RyZWFtIiwiY2xpZW50TWVkaWFTdHJlYW1zIiwiYXVkaW9UcmFja3MiLCJnZXRBdWRpb1RyYWNrcyIsImF1ZGlvU3RyZWFtIiwiTWVkaWFTdHJlYW0iLCJmb3JFYWNoIiwiYWRkVHJhY2siLCJ2aWRlb1RyYWNrcyIsImdldFZpZGVvVHJhY2tzIiwidmlkZW9TdHJlYW0iLCJ4IiwiYWRkTG9jYWxNZWRpYVN0cmVhbSIsImlkIiwicmVnaXN0ZXIzcmRQYXJ0eUxvY2FsTWVkaWFTdHJlYW0iLCJPYmplY3QiLCJrZXlzIiwiYWRkU3RyZWFtVG9DYWxsIiwicmVtb3ZlTG9jYWxNZWRpYVN0cmVhbSIsImNsb3NlTG9jYWxNZWRpYVN0cmVhbSIsImVuYWJsZU1pY3JvcGhvbmUiLCJlbmFibGVkIiwiZW5hYmxlQ2FtZXJhIiwiZGlzY29ubmVjdCIsImhhbmRsZVVzZXJQdWJsaXNoZWQiLCJ1c2VyIiwibWVkaWFUeXBlIiwiaGFuZGxlVXNlclVucHVibGlzaGVkIiwiY3JlYXRlQ2xpZW50IiwibW9kZSIsImNvZGVjIiwic2V0Q2xpZW50Um9sZSIsIm9uIiwic3Vic2NyaWJlIiwicGxheSIsIl9tZWRpYVN0cmVhbVRyYWNrIiwicXVlcnlTZWxlY3RvciIsInNyY09iamVjdCIsImVuY19pZCIsIl9wMnBDaGFubmVsIiwiY29ubmVjdGlvbiIsInBlZXJDb25uZWN0aW9uIiwicmVjZWl2ZXJzIiwiZ2V0UmVjZWl2ZXJzIiwiZ2V0RWxlbWVudEJ5SWQiLCJjYXB0dXJlU3RyZWFtIiwiam9pbiIsImNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrIiwiY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayIsIm1lZGlhU3RyZWFtVHJhY2siLCJjcmVhdGVDYW1lcmFWaWRlb1RyYWNrIiwiZW5jb2RlckNvbmZpZyIsImNhbXMiLCJnZXRDYW1lcmFzIiwibGFiZWwiLCJkZXZpY2VJZCIsInNldERldmljZSIsImltZ0VsZW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwib25sb2FkIiwiaW5qZWN0Iiwic2V0T3B0aW9ucyIsImVuYWJsZSIsImJhY2tncm91bmQiLCJzcmMiLCJWaXJ0dWFsQmFja2dyb3VuZEV4dGVuc2lvbiIsInJlZ2lzdGVyRXh0ZW5zaW9ucyIsImNyZWF0ZVByb2Nlc3NvciIsImluaXQiLCJ0eXBlIiwiY29sb3IiLCJwdWJsaXNoIiwic2VuZGVycyIsImdldFNlbmRlcnMiLCJraW5kIiwibXlSb29tSWQiLCJqb2luVGltZSIsImdldFNlcnZlclRpbWUiLCJyZWdpc3RlciIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3Mi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UyxRQUE3QyxFQUF1RDRILFlBQXRFO0FBQ0EsV0FBT21MLFFBQVA7QUFDRDs7QUFFREMsa0JBQWdCO0FBQ2QsV0FBT3ZOLEtBQUtDLEdBQUwsS0FBYSxLQUFLNUUsYUFBekI7QUFDRDtBQXp4Qm1COztBQTR4QnRCbUgsSUFBSXVGLFFBQUosQ0FBYXlGLFFBQWIsQ0FBc0IsVUFBdEIsRUFBa0MxVSxlQUFsQzs7QUFFQTJVLE9BQU9DLE9BQVAsR0FBaUI1VSxlQUFqQixDIiwiZmlsZSI6Im5hZi1hZ29yYS1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCJjbGFzcyBBZ29yYVJ0Y0FkYXB0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKGVhc3lydGMpIHtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29uc3RydWN0b3IgXCIsIGVhc3lydGMpO1xuXG4gICAgdGhpcy5lYXN5cnRjID0gZWFzeXJ0YyB8fCB3aW5kb3cuZWFzeXJ0YztcbiAgICB0aGlzLmFwcCA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMucm9vbSA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMudXNlcmlkID0gMDtcbiAgICB0aGlzLmFwcGlkID0gbnVsbDtcbiAgICB0aGlzLm1vY2FwRGF0YT1cIlwiO1xuICAgIHRoaXMubG9naT0wO1xuICAgIHRoaXMubG9nbz0wO1xuICAgIHRoaXMubWVkaWFTdHJlYW1zID0ge307XG4gICAgdGhpcy5yZW1vdGVDbGllbnRzID0ge307XG4gICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZUF1ZGlvID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVBdmF0YXIgPSBmYWxzZTtcblxuICAgIHRoaXMubG9jYWxUcmFja3MgPSB7IHZpZGVvVHJhY2s6IG51bGwsIGF1ZGlvVHJhY2s6IG51bGwgfTtcbiAgICB3aW5kb3cubG9jYWxUcmFja3MgPSB0aGlzLmxvY2FsVHJhY2tzO1xuICAgIHRoaXMudG9rZW4gPSBudWxsO1xuICAgIHRoaXMuY2xpZW50SWQgPSBudWxsO1xuICAgIHRoaXMudWlkID0gbnVsbDtcbiAgICB0aGlzLnZiZyA9IGZhbHNlO1xuICAgIHRoaXMudmJnMCA9IGZhbHNlO1xuICAgIHRoaXMuc2hvd0xvY2FsID0gZmFsc2U7XG4gICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlID0gbnVsbDtcbiAgICB0aGlzLmV4dGVuc2lvbiA9IG51bGw7XG4gICAgdGhpcy5wcm9jZXNzb3IgPSBudWxsO1xuICAgIHRoaXMucGlwZVByb2Nlc3NvciA9ICh0cmFjaywgcHJvY2Vzc29yKSA9PiB7XG4gICAgICB0cmFjay5waXBlKHByb2Nlc3NvcikucGlwZSh0cmFjay5wcm9jZXNzb3JEZXN0aW5hdGlvbik7XG4gICAgfVxuXG5cbiAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA9IDA7XG4gICAgdGhpcy50aW1lT2Zmc2V0cyA9IFtdO1xuICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IDA7XG4gICAgdGhpcy5hZ29yYUNsaWVudCA9IG51bGw7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlck9wZW5MaXN0ZW5lcihjbGllbnRJZCA9PiB7XG4gICAgICBjb25zdCBjbGllbnRDb25uZWN0aW9uID0gdGhpcy5lYXN5cnRjLmdldFBlZXJDb25uZWN0aW9uQnlVc2VySWQoY2xpZW50SWQpO1xuICAgICAgdGhpcy5yZW1vdGVDbGllbnRzW2NsaWVudElkXSA9IGNsaWVudENvbm5lY3Rpb247XG4gICAgfSk7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckNsb3NlZExpc3RlbmVyKGNsaWVudElkID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdO1xuICAgIH0pO1xuXG4gICAgdGhpcy5pc0Nocm9tZSA9IChuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0ZpcmVmb3gnKSA9PT0gLTEgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdDaHJvbWUnKSA+IC0xKTtcblxuICAgIGlmICh0aGlzLmlzQ2hyb21lKSB7XG4gICAgICB3aW5kb3cub2xkUlRDUGVlckNvbm5lY3Rpb24gPSBSVENQZWVyQ29ubmVjdGlvbjtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IG5ldyBQcm94eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sIHtcbiAgICAgICAgY29uc3RydWN0OiBmdW5jdGlvbiAodGFyZ2V0LCBhcmdzKSB7XG4gICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYXJnc1swXVtcImVuY29kZWRJbnNlcnRhYmxlU3RyZWFtc1wiXSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaCh7IGVuY29kZWRJbnNlcnRhYmxlU3RyZWFtczogdHJ1ZSB9KTtcbiAgICAgICAgICB9XG4gICAgICBcbiAgICAgICAgICBjb25zdCBwYyA9IG5ldyB3aW5kb3cub2xkUlRDUGVlckNvbm5lY3Rpb24oLi4uYXJncyk7XG4gICAgICAgICAgcmV0dXJuIHBjO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICBjb25zdCBvbGRTZXRDb25maWd1cmF0aW9uID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRDb25maWd1cmF0aW9uO1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRDb25maWd1cmF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgYXJnc1swXVtcImVuY29kZWRJbnNlcnRhYmxlU3RyZWFtc1wiXSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJncy5wdXNoKHsgZW5jb2RlZEluc2VydGFibGVTdHJlYW1zOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICBcbiAgICAgICAgb2xkU2V0Q29uZmlndXJhdGlvbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIC8vIGN1c3RvbSBkYXRhIGFwcGVuZCBwYXJhbXNcbiAgICB0aGlzLkN1c3RvbURhdGFEZXRlY3RvciA9ICdBR09SQU1PQ0FQJztcbiAgICB0aGlzLkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudCA9IDQ7XG4gICAgdGhpcy5zZW5kZXJDaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsO1xuICAgIHRoaXMucmVjZWl2ZXJDaGFubmVsO1xuICAgIHRoaXMucl9yZWNlaXZlcj1udWxsO1xuICAgIHRoaXMucl9jbGllbnRJZD1udWxsO1xuICAgIHdpbmRvdy5BZ29yYVJ0Y0FkYXB0ZXI9dGhpcztcbiAgICBcbiAgfVxuXG4gIHNldFNlcnZlclVybCh1cmwpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0U2VydmVyVXJsIFwiLCB1cmwpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXRTb2NrZXRVcmwodXJsKTtcbiAgfVxuXG4gIHNldEFwcChhcHBOYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldEFwcCBcIiwgYXBwTmFtZSk7XG4gICAgdGhpcy5hcHAgPSBhcHBOYW1lO1xuICAgIHRoaXMuYXBwaWQgPSBhcHBOYW1lO1xuICB9XG5cbiAgYXN5bmMgc2V0Um9vbShqc29uKSB7XG4gICAganNvbiA9IGpzb24ucmVwbGFjZSgvJy9nLCAnXCInKTtcbiAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKGpzb24pO1xuICAgIHRoaXMucm9vbSA9IG9iai5uYW1lO1xuXG4gICAgaWYgKG9iai52YmcgJiYgb2JqLnZiZz09J3RydWUnICkgeyAgICAgIFxuICAgICAgdGhpcy52YmcgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmoudmJnMCAmJiBvYmoudmJnMD09J3RydWUnICkge1xuICAgICAgdGhpcy52YmcwID0gdHJ1ZTtcbiAgICAgIEFnb3JhUlRDLmxvYWRNb2R1bGUoU2VnUGx1Z2luLCB7fSk7XG4gICAgfVxuXG4gICAgaWYgKG9iai5lbmFibGVBdmF0YXIgJiYgb2JqLmVuYWJsZUF2YXRhcj09J3RydWUnICkge1xuICAgICAgdGhpcy5lbmFibGVBdmF0YXIgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmouc2hvd0xvY2FsICAmJiBvYmouc2hvd0xvY2FsPT0ndHJ1ZScpIHtcbiAgICAgIHRoaXMuc2hvd0xvY2FsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAob2JqLmVuYWJsZVZpZGVvRmlsdGVyZWQgJiYgb2JqLmVuYWJsZVZpZGVvRmlsdGVyZWQ9PSd0cnVlJyApIHtcbiAgICAgIHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuZWFzeXJ0Yy5qb2luUm9vbSh0aGlzLnJvb20sIG51bGwpO1xuICB9XG5cbiAgLy8gb3B0aW9uczogeyBkYXRhY2hhbm5lbDogYm9vbCwgYXVkaW86IGJvb2wsIHZpZGVvOiBib29sIH1cbiAgc2V0V2ViUnRjT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFdlYlJ0Y09wdGlvbnMgXCIsIG9wdGlvbnMpO1xuICAgIC8vIHRoaXMuZWFzeXJ0Yy5lbmFibGVEZWJ1Zyh0cnVlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlRGF0YUNoYW5uZWxzKG9wdGlvbnMuZGF0YWNoYW5uZWwpO1xuXG4gICAgLy8gdXNpbmcgQWdvcmFcbiAgICB0aGlzLmVuYWJsZVZpZGVvID0gb3B0aW9ucy52aWRlbztcbiAgICB0aGlzLmVuYWJsZUF1ZGlvID0gb3B0aW9ucy5hdWRpbztcblxuICAgIC8vIG5vdCBlYXN5cnRjXG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQXVkaW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVWaWRlb1JlY2VpdmUoZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpb1JlY2VpdmUoZmFsc2UpO1xuICB9XG5cbiAgc2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyhzdWNjZXNzTGlzdGVuZXIsIGZhaWx1cmVMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzIFwiLCBzdWNjZXNzTGlzdGVuZXIsIGZhaWx1cmVMaXN0ZW5lcik7XG4gICAgdGhpcy5jb25uZWN0U3VjY2VzcyA9IHN1Y2Nlc3NMaXN0ZW5lcjtcbiAgICB0aGlzLmNvbm5lY3RGYWlsdXJlID0gZmFpbHVyZUxpc3RlbmVyO1xuICB9XG5cbiAgc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIob2NjdXBhbnRMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciBcIiwgb2NjdXBhbnRMaXN0ZW5lcik7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIoZnVuY3Rpb24gKHJvb21OYW1lLCBvY2N1cGFudHMsIHByaW1hcnkpIHtcbiAgICAgIG9jY3VwYW50TGlzdGVuZXIob2NjdXBhbnRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldERhdGFDaGFubmVsTGlzdGVuZXJzKG9wZW5MaXN0ZW5lciwgY2xvc2VkTGlzdGVuZXIsIG1lc3NhZ2VMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXREYXRhQ2hhbm5lbExpc3RlbmVycyAgXCIsIG9wZW5MaXN0ZW5lciwgY2xvc2VkTGlzdGVuZXIsIG1lc3NhZ2VMaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldERhdGFDaGFubmVsT3Blbkxpc3RlbmVyKG9wZW5MaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldERhdGFDaGFubmVsQ2xvc2VMaXN0ZW5lcihjbG9zZWRMaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJMaXN0ZW5lcihtZXNzYWdlTGlzdGVuZXIpO1xuICB9XG5cbiAgdXBkYXRlVGltZU9mZnNldCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgdXBkYXRlVGltZU9mZnNldCBcIik7XG4gICAgY29uc3QgY2xpZW50U2VudFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGZldGNoKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYsIHsgbWV0aG9kOiBcIkhFQURcIiwgY2FjaGU6IFwibm8tY2FjaGVcIiB9KS50aGVuKHJlcyA9PiB7XG4gICAgICB2YXIgcHJlY2lzaW9uID0gMTAwMDtcbiAgICAgIHZhciBzZXJ2ZXJSZWNlaXZlZFRpbWUgPSBuZXcgRGF0ZShyZXMuaGVhZGVycy5nZXQoXCJEYXRlXCIpKS5nZXRUaW1lKCkgKyBwcmVjaXNpb24gLyAyO1xuICAgICAgdmFyIGNsaWVudFJlY2VpdmVkVGltZSA9IERhdGUubm93KCk7XG4gICAgICB2YXIgc2VydmVyVGltZSA9IHNlcnZlclJlY2VpdmVkVGltZSArIChjbGllbnRSZWNlaXZlZFRpbWUgLSBjbGllbnRTZW50VGltZSkgLyAyO1xuICAgICAgdmFyIHRpbWVPZmZzZXQgPSBzZXJ2ZXJUaW1lIC0gY2xpZW50UmVjZWl2ZWRUaW1lO1xuXG4gICAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cysrO1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPD0gMTApIHtcbiAgICAgICAgdGhpcy50aW1lT2Zmc2V0cy5wdXNoKHRpbWVPZmZzZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aW1lT2Zmc2V0c1t0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyAlIDEwXSA9IHRpbWVPZmZzZXQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IHRoaXMudGltZU9mZnNldHMucmVkdWNlKChhY2MsIG9mZnNldCkgPT4gYWNjICs9IG9mZnNldCwgMCkgLyB0aGlzLnRpbWVPZmZzZXRzLmxlbmd0aDtcblxuICAgICAgaWYgKHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID4gMTApIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgNSAqIDYwICogMTAwMCk7IC8vIFN5bmMgY2xvY2sgZXZlcnkgNSBtaW51dGVzLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb25uZWN0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25uZWN0IFwiKTtcbiAgICBQcm9taXNlLmFsbChbdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2Nvbm5lY3QocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KV0pLnRoZW4oKFtfLCBjbGllbnRJZF0pID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25uZWN0ZWQgXCIgKyBjbGllbnRJZCk7XG4gICAgICB0aGlzLmNsaWVudElkID0gY2xpZW50SWQ7XG4gICAgICB0aGlzLl9teVJvb21Kb2luVGltZSA9IHRoaXMuX2dldFJvb21Kb2luVGltZShjbGllbnRJZCk7XG4gICAgICB0aGlzLmNvbm5lY3RBZ29yYSgpO1xuICAgICAgdGhpcy5jb25uZWN0U3VjY2VzcyhjbGllbnRJZCk7XG4gICAgfSkuY2F0Y2godGhpcy5jb25uZWN0RmFpbHVyZSk7XG4gIH1cblxuICBzaG91bGRTdGFydENvbm5lY3Rpb25UbyhjbGllbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fbXlSb29tSm9pblRpbWUgPD0gY2xpZW50LnJvb21Kb2luVGltZTtcbiAgfVxuXG4gIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzdGFydFN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuY2FsbChjbGllbnRJZCwgZnVuY3Rpb24gKGNhbGxlciwgbWVkaWEpIHtcbiAgICAgIGlmIChtZWRpYSA9PT0gXCJkYXRhY2hhbm5lbFwiKSB7XG4gICAgICAgIE5BRi5sb2cud3JpdGUoXCJTdWNjZXNzZnVsbHkgc3RhcnRlZCBkYXRhY2hhbm5lbCB0byBcIiwgY2FsbGVyKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAoZXJyb3JDb2RlLCBlcnJvclRleHQpIHtcbiAgICAgIE5BRi5sb2cuZXJyb3IoZXJyb3JDb2RlLCBlcnJvclRleHQpO1xuICAgIH0sIGZ1bmN0aW9uICh3YXNBY2NlcHRlZCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJ3YXMgYWNjZXB0ZWQ9XCIgKyB3YXNBY2NlcHRlZCk7XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZVN0cmVhbUNvbm5lY3Rpb24oY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY2xvc2VTdHJlYW1Db25uZWN0aW9uIFwiLCBjbGllbnRJZCk7XG4gICAgdGhpcy5lYXN5cnRjLmhhbmd1cChjbGllbnRJZCk7XG4gIH1cblxuICBzZW5kTW9jYXAobW9jYXApIHtcbiAgICB0aGlzLm1vY2FwRGF0YT1tb2NhcDtcbiAgICBpZiAoIXRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIFxuICAgICAgaWYgKHRoaXMubG9nbysrPjUwKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcInNlbmRcIixtb2NhcCk7XG4gICAgICAgIHRoaXMubG9nbz0wO1xuICAgICAgfVxuICAgICAgdGhpcy5zZW5kZXJDaGFubmVsLnBvcnQxLnBvc3RNZXNzYWdlKHsgd2F0ZXJtYXJrOiBtb2NhcCB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVFbmNvZGVyKHNlbmRlcikge1xuICAgIGlmICh0aGlzLmlzQ2hyb21lKSB7XG4gICAgICBjb25zdCBzdHJlYW1zID0gc2VuZGVyLmNyZWF0ZUVuY29kZWRTdHJlYW1zKCk7XG4gICAgICBjb25zdCB0ZXh0RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgdmFyIHRoYXQ9dGhpcztcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybVN0cmVhbSh7XG4gICAgICAgIHRyYW5zZm9ybShjaHVuaywgY29udHJvbGxlcikge1xuICAgICAgICAgIGNvbnN0IG1vY2FwID0gdGV4dEVuY29kZXIuZW5jb2RlKHRoYXQubW9jYXBEYXRhKTtcbiAgICAgICAgICBjb25zdCBmcmFtZSA9IGNodW5rLmRhdGE7XG4gICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KGNodW5rLmRhdGEuYnl0ZUxlbmd0aCArIG1vY2FwLmJ5dGVMZW5ndGggKyB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudCArIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCk7XG4gICAgICAgICAgZGF0YS5zZXQobmV3IFVpbnQ4QXJyYXkoZnJhbWUpLCAwKTtcbiAgICAgICAgICBkYXRhLnNldChtb2NhcCwgZnJhbWUuYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgdmFyIGJ5dGVzID0gdGhhdC5nZXRJbnRCeXRlcyhtb2NhcC5ieXRlTGVuZ3RoKTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50OyBpKyspIHtcbiAgICAgICAgICAgIGRhdGFbZnJhbWUuYnl0ZUxlbmd0aCArIG1vY2FwLmJ5dGVMZW5ndGggKyBpXSA9IGJ5dGVzW2ldO1xuICAgICAgICAgIH1cbiAgXG4gICAgICAgICAgLy8gU2V0IG1hZ2ljIHN0cmluZyBhdCB0aGUgZW5kXG4gICAgICAgICAgY29uc3QgbWFnaWNJbmRleCA9IGZyYW1lLmJ5dGVMZW5ndGggKyBtb2NhcC5ieXRlTGVuZ3RoICsgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQ7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZGF0YVttYWdpY0luZGV4ICsgaV0gPSB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5jaGFyQ29kZUF0KGkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjaHVuay5kYXRhID0gZGF0YS5idWZmZXI7XG4gICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGNodW5rKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIFxuICAgICAgc3RyZWFtcy5yZWFkYWJsZS5waXBlVGhyb3VnaCh0cmFuc2Zvcm1lcikucGlwZVRvKHN0cmVhbXMud3JpdGFibGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdGhhdD10aGlzO1xuICAgICAgY29uc3Qgd29ya2VyID0gbmV3IFdvcmtlcignL2Rpc3Qvc2NyaXB0LXRyYW5zZm9ybS13b3JrZXIuanMnKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3JlZ2lzdGVyZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGNvbnN0IHNlbmRlclRyYW5zZm9ybSA9IG5ldyBSVENSdHBTY3JpcHRUcmFuc2Zvcm0od29ya2VyLCB7IG5hbWU6ICdvdXRnb2luZycsIHBvcnQ6IHRoYXQuc2VuZGVyQ2hhbm5lbC5wb3J0MiB9LCBbdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQyXSk7XG4gICAgICBzZW5kZXJUcmFuc2Zvcm0ucG9ydCA9IHRoYXQuc2VuZGVyQ2hhbm5lbC5wb3J0MTtcbiAgICAgIHNlbmRlci50cmFuc2Zvcm0gPSBzZW5kZXJUcmFuc2Zvcm07XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdzdGFydGVkJykge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICB0aGF0LnNlbmRlckNoYW5uZWwucG9ydDEucG9zdE1lc3NhZ2UoeyB3YXRlcm1hcms6IHRoYXQubW9jYXBEYXRhIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlY3JlYXRlRGVjb2Rlcigpe1xuICAgIHRoaXMuY3JlYXRlRGVjb2Rlcih0aGlzLnJfcmVjZWl2ZXIsdGhpcy5yX2NsaWVudElkKTtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZURlY29kZXIocmVjZWl2ZXIsY2xpZW50SWQpIHtcbiAgICBpZiAodGhpcy5pc0Nocm9tZSkge1xuICAgICAgY29uc3Qgc3RyZWFtcyA9IHJlY2VpdmVyLmNyZWF0ZUVuY29kZWRTdHJlYW1zKCk7XG4gICAgICBjb25zdCB0ZXh0RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgICAgdmFyIHRoYXQ9dGhpcztcblxuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKHtcbiAgICAgICAgdHJhbnNmb3JtKGNodW5rLCBjb250cm9sbGVyKSB7XG4gICAgICAgICAgY29uc3QgdmlldyA9IG5ldyBEYXRhVmlldyhjaHVuay5kYXRhKTsgIFxuICAgICAgICAgIGNvbnN0IG1hZ2ljRGF0YSA9IG5ldyBVaW50OEFycmF5KGNodW5rLmRhdGEsIGNodW5rLmRhdGEuYnl0ZUxlbmd0aCAtIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCwgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICBsZXQgbWFnaWMgPSBbXTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBtYWdpYy5wdXNoKG1hZ2ljRGF0YVtpXSk7XG5cbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IG1hZ2ljU3RyaW5nID0gU3RyaW5nLmZyb21DaGFyQ29kZSguLi5tYWdpYyk7XG4gICAgICAgICAgaWYgKG1hZ2ljU3RyaW5nID09PSB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvcikge1xuICAgICAgICAgICAgY29uc3QgbW9jYXBMZW4gPSB2aWV3LmdldFVpbnQzMihjaHVuay5kYXRhLmJ5dGVMZW5ndGggLSAodGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgKyB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpLCBmYWxzZSk7XG4gICAgICAgICAgICBjb25zdCBmcmFtZVNpemUgPSBjaHVuay5kYXRhLmJ5dGVMZW5ndGggLSAobW9jYXBMZW4gKyB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudCArICB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpO1xuICAgICAgICAgICAgY29uc3QgbW9jYXBCdWZmZXIgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLCBmcmFtZVNpemUsIG1vY2FwTGVuKTtcbiAgICAgICAgICAgIGNvbnN0IG1vY2FwID0gdGV4dERlY29kZXIuZGVjb2RlKG1vY2FwQnVmZmVyKSAgICAgICAgXG4gICAgICAgICAgICB3aW5kb3cucmVtb3RlTW9jYXAobW9jYXArXCIsXCIrY2xpZW50SWQpO1xuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBjaHVuay5kYXRhO1xuICAgICAgICAgICAgY2h1bmsuZGF0YSA9IG5ldyBBcnJheUJ1ZmZlcihmcmFtZVNpemUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KGNodW5rLmRhdGEpO1xuICAgICAgICAgICAgZGF0YS5zZXQobmV3IFVpbnQ4QXJyYXkoZnJhbWUsIDAsIGZyYW1lU2l6ZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmspO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHN0cmVhbXMucmVhZGFibGUucGlwZVRocm91Z2godHJhbnNmb3JtZXIpLnBpcGVUbyhzdHJlYW1zLndyaXRhYmxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZWNlaXZlckNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgICB2YXIgdGhhdD10aGlzO1xuICAgICAgY29uc3Qgd29ya2VyID0gbmV3IFdvcmtlcignL2Rpc3Qvc2NyaXB0LXRyYW5zZm9ybS13b3JrZXIuanMnKTtcblxuICAgICAgY29uc29sZS53YXJuKFwiaW5jb21pbmcgMVwiLGNsaWVudElkLHdvcmtlcik7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdyZWdpc3RlcmVkJykge1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnNvbGUud2FybihcImluY29taW5nIDJhXCIsY2xpZW50SWQsZXZlbnQuZGF0YSApO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLndhcm4oXCJpbmNvbWluZyAyXCIsY2xpZW50SWQsZXZlbnQuZGF0YSApO1xuICAgICAgfSk7XG4gIFxuICAgICAgY29uc29sZS53YXJuKFwiaW5jb21pbmcgM1wiICxjbGllbnRJZCk7XG5cbiAgICAgIGNvbnN0IHJlY2VpdmVyVHJhbnNmb3JtID0gbmV3IFJUQ1J0cFNjcmlwdFRyYW5zZm9ybSh3b3JrZXIsIHsgbmFtZTogJ2luY29taW5nJywgcG9ydDogdGhhdC5yZWNlaXZlckNoYW5uZWwucG9ydDIgfSwgW3RoYXQucmVjZWl2ZXJDaGFubmVsLnBvcnQyXSk7XG4gICAgICBcbiAgICAgIGNvbnNvbGUud2FybihcImluY29taW5nIDRcIixjbGllbnRJZCxyZWNlaXZlclRyYW5zZm9ybSApO1xuXG4gICAgICByZWNlaXZlclRyYW5zZm9ybS5wb3J0ID0gdGhhdC5yZWNlaXZlckNoYW5uZWwucG9ydDE7XG4gICAgICByZWNlaXZlci50cmFuc2Zvcm0gPSByZWNlaXZlclRyYW5zZm9ybTtcbiAgICAgIHJlY2VpdmVyVHJhbnNmb3JtLnBvcnQub25tZXNzYWdlID0gZSA9PiB7XG4gICAgICAgIC8vY29uc29sZS53YXJuKFwid2Fob28gaW5cIixlKTtcbiAgICAgICAgaWYgKHRoaXMubG9naSsrPjUwKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwid2Fob28gaW4gZnJvbSBcIixjbGllbnRJZCk7XG4gICAgICAgICAgdGhpcy5sb2dpPTA7XG4gICAgICAgIH1cbiAgICAgICAgd2luZG93LnJlbW90ZU1vY2FwKGUuZGF0YStcIixcIitjbGllbnRJZCk7XG4gICAgICB9O1xuICBcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3N0YXJ0ZWQnKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiaW5jb21pbmcgNWFcIixjbGllbnRJZCxldmVudC5kYXRhICk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihcImluY29taW5nIDVcIixjbGllbnRJZCxldmVudC5kYXRhICk7XG5cbiAgICAgIH0pO1xuICAgICAgY29uc29sZS53YXJuKFwiaW5jb21pbmcgNlwiLGNsaWVudElkICk7XG4gICAgfVxuICB9ICBcbiAgc2VuZERhdGEoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNlbmREYXRhIFwiLCBjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIC8vIHNlbmQgdmlhIHdlYnJ0YyBvdGhlcndpc2UgZmFsbGJhY2sgdG8gd2Vic29ja2V0c1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YShjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgc2VuZERhdGFHdWFyYW50ZWVkKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZW5kRGF0YUd1YXJhbnRlZWQgXCIsIGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhV1MoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIGJyb2FkY2FzdERhdGEoZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYnJvYWRjYXN0RGF0YSBcIiwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHZhciByb29tT2NjdXBhbnRzID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcCh0aGlzLnJvb20pO1xuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBrZXlzIG9mIHRoZSBlYXN5cnRjIHJvb20gb2NjdXBhbnRzIG1hcC5cbiAgICAvLyBnZXRSb29tT2NjdXBhbnRzQXNBcnJheSB1c2VzIE9iamVjdC5rZXlzIHdoaWNoIGFsbG9jYXRlcyBtZW1vcnkuXG4gICAgZm9yICh2YXIgcm9vbU9jY3VwYW50IGluIHJvb21PY2N1cGFudHMpIHtcbiAgICAgIGlmIChyb29tT2NjdXBhbnRzW3Jvb21PY2N1cGFudF0gJiYgcm9vbU9jY3VwYW50ICE9PSB0aGlzLmVhc3lydGMubXlFYXN5cnRjaWQpIHtcbiAgICAgICAgLy8gc2VuZCB2aWEgd2VicnRjIG90aGVyd2lzZSBmYWxsYmFjayB0byB3ZWJzb2NrZXRzXG4gICAgICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YShyb29tT2NjdXBhbnQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBicm9hZGNhc3REYXRhR3VhcmFudGVlZChkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhR3VhcmFudGVlZCBcIiwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHZhciBkZXN0aW5hdGlvbiA9IHsgdGFyZ2V0Um9vbTogdGhpcy5yb29tIH07XG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhV1MoZGVzdGluYXRpb24sIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIGdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0Q29ubmVjdFN0YXR1cyBcIiwgY2xpZW50SWQpO1xuICAgIHZhciBzdGF0dXMgPSB0aGlzLmVhc3lydGMuZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCk7XG5cbiAgICBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5JU19DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuSVNfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSBpZiAoc3RhdHVzID09IHRoaXMuZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLk5PVF9DT05ORUNURUQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuQ09OTkVDVElORztcbiAgICB9XG4gIH1cblxuICBnZXRNZWRpYVN0cmVhbShjbGllbnRJZCwgc3RyZWFtTmFtZSA9IFwiYXVkaW9cIikge1xuXG4gICAgY29uc29sZS5sb2coXCJCVzczIGdldE1lZGlhU3RyZWFtIFwiLCBjbGllbnRJZCwgc3RyZWFtTmFtZSk7XG4gICAgLy8gaWYgKCBzdHJlYW1OYW1lID0gXCJhdWRpb1wiKSB7XG4gICAgLy9zdHJlYW1OYW1lID0gXCJib2RfYXVkaW9cIjtcbiAgICAvL31cblxuICAgIGlmICh0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gJiYgdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdKSB7XG4gICAgICBOQUYubG9nLndyaXRlKGBBbHJlYWR5IGhhZCAke3N0cmVhbU5hbWV9IGZvciAke2NsaWVudElkfWApO1xuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBOQUYubG9nLndyaXRlKGBXYWl0aW5nIG9uICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG5cbiAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHBlbmRpbmdNZWRpYVJlcXVlc3RzIHdpdGggYXVkaW98dmlkZW8gYWxpYXNcbiAgICAgIGlmICghdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5oYXMoY2xpZW50SWQpKSB7XG4gICAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0ge307XG5cbiAgICAgICAgY29uc3QgYXVkaW9Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIEF1ZGlvIEVycm9yYCwgZSkpO1xuXG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnByb21pc2UgPSBhdWRpb1Byb21pc2U7XG5cbiAgICAgICAgY29uc3QgdmlkZW9Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIFZpZGVvIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5wcm9taXNlID0gdmlkZW9Qcm9taXNlO1xuXG4gICAgICAgIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuc2V0KGNsaWVudElkLCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpO1xuXG4gICAgICAvLyBDcmVhdGUgaW5pdGlhbCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyB3aXRoIHN0cmVhbU5hbWVcbiAgICAgIGlmICghcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgY29uc3Qgc3RyZWFtUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBcIiR7c3RyZWFtTmFtZX1cIiBFcnJvcmAsIGUpKTtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0ucHJvbWlzZSA9IHN0cmVhbVByb21pc2U7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZClbc3RyZWFtTmFtZV0ucHJvbWlzZTtcbiAgICB9XG4gIH1cblxuICBzZXRNZWRpYVN0cmVhbShjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldE1lZGlhU3RyZWFtIFwiLCBjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKTtcbiAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTsgLy8gcmV0dXJuIHVuZGVmaW5lZCBpZiB0aGVyZSBpcyBubyBlbnRyeSBpbiB0aGUgTWFwXG4gICAgY29uc3QgY2xpZW50TWVkaWFTdHJlYW1zID0gdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdID0gdGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdIHx8IHt9O1xuXG4gICAgaWYgKHN0cmVhbU5hbWUgPT09ICdkZWZhdWx0Jykge1xuICAgICAgLy8gU2FmYXJpIGRvZXNuJ3QgbGlrZSBpdCB3aGVuIHlvdSB1c2UgYSBtaXhlZCBtZWRpYSBzdHJlYW0gd2hlcmUgb25lIG9mIHRoZSB0cmFja3MgaXMgaW5hY3RpdmUsIHNvIHdlXG4gICAgICAvLyBzcGxpdCB0aGUgdHJhY2tzIGludG8gdHdvIHN0cmVhbXMuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIGF1ZGlvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IGF1ZGlvVHJhY2tzID0gc3RyZWFtLmdldEF1ZGlvVHJhY2tzKCk7XG4gICAgICBpZiAoYXVkaW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGF1ZGlvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gYXVkaW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMuYXVkaW8gPSBhdWRpb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gc2V0TWVkaWFTdHJlYW0gXCJhdWRpb1wiIGFsaWFzIEVycm9yYCwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSBhdWRpbyBhbGlhcyBpZiBpdCBleGlzdHMuXG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucmVzb2x2ZShhdWRpb1N0cmVhbSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkZCBtZWRpYVN0cmVhbXMgdmlkZW8gc3RyZWFtTmFtZSBhbGlhc1xuICAgICAgY29uc3QgdmlkZW9UcmFja3MgPSBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKTtcbiAgICAgIGlmICh2aWRlb1RyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IHZpZGVvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdmlkZW9UcmFja3MuZm9yRWFjaCh0cmFjayA9PiB2aWRlb1N0cmVhbS5hZGRUcmFjayh0cmFjaykpO1xuICAgICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy52aWRlbyA9IHZpZGVvU3RyZWFtO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBzZXRNZWRpYVN0cmVhbSBcInZpZGVvXCIgYWxpYXMgRXJyb3JgLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIHZpZGVvIGFsaWFzIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5yZXNvbHZlKHZpZGVvU3RyZWFtKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY2xpZW50TWVkaWFTdHJlYW1zW3N0cmVhbU5hbWVdID0gc3RyZWFtO1xuXG4gICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSBieSBTdHJlYW1OYW1lIGlmIGl0IGV4aXN0cy5cbiAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cyAmJiBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSkge1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5yZXNvbHZlKHN0cmVhbSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZ2V0SW50Qnl0ZXMoeCkge1xuICAgIHZhciBieXRlcyA9IFtdO1xuICAgIHZhciBpID0gdGhpcy5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQ7XG4gICAgZG8ge1xuICAgICAgYnl0ZXNbLS1pXSA9IHggJiAoMjU1KTtcbiAgICAgIHggPSB4ID4+IDg7XG4gICAgfSB3aGlsZSAoaSlcbiAgICByZXR1cm4gYnl0ZXM7XG4gIH1cblxuICBhZGRMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBhZGRMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IGVhc3lydGMgPSB0aGlzLmVhc3lydGM7XG4gICAgc3RyZWFtTmFtZSA9IHN0cmVhbU5hbWUgfHwgc3RyZWFtLmlkO1xuICAgIHRoaXMuc2V0TWVkaWFTdHJlYW0oXCJsb2NhbFwiLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGVhc3lydGMucmVnaXN0ZXIzcmRQYXJ0eUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKTtcblxuICAgIC8vIEFkZCBsb2NhbCBzdHJlYW0gdG8gZXhpc3RpbmcgY29ubmVjdGlvbnNcbiAgICBPYmplY3Qua2V5cyh0aGlzLnJlbW90ZUNsaWVudHMpLmZvckVhY2goY2xpZW50SWQgPT4ge1xuICAgICAgaWYgKGVhc3lydGMuZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkgIT09IGVhc3lydGMuTk9UX0NPTk5FQ1RFRCkge1xuICAgICAgICBlYXN5cnRjLmFkZFN0cmVhbVRvQ2FsbChjbGllbnRJZCwgc3RyZWFtTmFtZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICByZW1vdmVMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbSBcIiwgc3RyZWFtTmFtZSk7XG4gICAgdGhpcy5lYXN5cnRjLmNsb3NlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKTtcbiAgICBkZWxldGUgdGhpcy5tZWRpYVN0cmVhbXNbXCJsb2NhbFwiXVtzdHJlYW1OYW1lXTtcbiAgfVxuXG4gIGVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBlbmFibGVNaWNyb3Bob25lIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlTWljcm9waG9uZShlbmFibGVkKTtcbiAgfVxuXG4gIGVuYWJsZUNhbWVyYShlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGVuYWJsZUNhbWVyYSBcIiwgZW5hYmxlZCk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUNhbWVyYShlbmFibGVkKTtcbiAgfVxuXG4gIGRpc2Nvbm5lY3QoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGRpc2Nvbm5lY3QgXCIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5kaXNjb25uZWN0KCk7XG4gIH1cblxuICBhc3luYyBoYW5kbGVVc2VyUHVibGlzaGVkKHVzZXIsIG1lZGlhVHlwZSkgeyB9XG5cbiAgaGFuZGxlVXNlclVucHVibGlzaGVkKHVzZXIsIG1lZGlhVHlwZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyVW5QdWJsaXNoZWQgXCIpO1xuICB9XG5cbiAgYXN5bmMgY29ubmVjdEFnb3JhKCkge1xuICAgIC8vIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0byBwbGF5IHJlbW90ZSB0cmFja3Mgd2hlbiByZW1vdGUgdXNlciBwdWJsaXNoZXMuXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkIHx8IHRoaXMuZW5hYmxlVmlkZW8gfHwgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJydGNcIiwgY29kZWM6IFwidnA4XCIgfSk7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwiaDI2NFwiIH0pO1xuICAgICAgdGhpcy5hZ29yYUNsaWVudC5zZXRDbGllbnRSb2xlKFwiaG9zdFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcImgyNjRcIiB9KTtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci1qb2luZWRcIiwgYXN5bmMgKHVzZXIpID0+IHtcbiAgICAgIGNvbnNvbGUud2FybihcInVzZXItam9pbmVkXCIsIHVzZXIpO1xuICAgIH0pO1xuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLXB1Ymxpc2hlZFwiLCBhc3luYyAodXNlciwgbWVkaWFUeXBlKSA9PiB7XG5cbiAgICAgIGxldCBjbGllbnRJZCA9IHVzZXIudWlkO1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJQdWJsaXNoZWQgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgbWVkaWFUeXBlLCB0aGF0LmFnb3JhQ2xpZW50KTtcbiAgICAgIGF3YWl0IHRoYXQuYWdvcmFDbGllbnQuc3Vic2NyaWJlKHVzZXIsIG1lZGlhVHlwZSk7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZDIgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgdGhhdC5hZ29yYUNsaWVudCk7XG5cbiAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhhdC5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpO1xuICAgICAgY29uc3QgY2xpZW50TWVkaWFTdHJlYW1zID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdIHx8IHt9O1xuXG4gICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG5cbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLmF1ZGlvVHJhY2sgXCIsIHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIC8vYXVkaW9TdHJlYW0uYWRkVHJhY2sodXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucmVzb2x2ZShhdWRpb1N0cmVhbSk7XG4gICAgICB9XG5cbiAgICAgIGxldCB2aWRlb1N0cmVhbSA9IG51bGw7XG4gICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgIHZpZGVvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidXNlci52aWRlb1RyYWNrIFwiLCB1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICB2aWRlb1N0cmVhbS5hZGRUcmFjayh1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5yZXNvbHZlKHZpZGVvU3RyZWFtKTtcbiAgICAgICAgLy91c2VyLnZpZGVvVHJhY2tcbiAgICAgIH1cblxuICAgICAgaWYgKGNsaWVudElkID09ICdDQ0MnKSB7XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpZGVvMzYwXCIpLnNyY09iamVjdD12aWRlb1N0cmVhbTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc2V0QXR0cmlidXRlKFwic3JjXCIsIHZpZGVvU3RyZWFtKTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc2V0QXR0cmlidXRlKFwic3JjXCIsIHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNyY09iamVjdD0gdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrO1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc3JjT2JqZWN0ID0gdmlkZW9TdHJlYW07XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjbGllbnRJZCA9PSAnREREJykge1xuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgdXNlci52aWRlb1RyYWNrLnBsYXkoXCJ2aWRlbzM2MFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICAgIGxldCBlbmNfaWQ9J2JvYic7XG4gICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgIGVuY19pZD11c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2suaWQ7ICAgICAgIFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAvLyBlbmNfaWQ9dXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrLmlkO1xuICAgICAgfVxuICAgIFxuICAgICAgLy9jb25zb2xlLndhcm4obWVkaWFUeXBlLGVuY19pZCk7ICAgIFxuICAgICAgY29uc3QgcGMgPXRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHJlY2VpdmVycyA9IHBjLmdldFJlY2VpdmVycygpOyAgXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlY2VpdmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocmVjZWl2ZXJzW2ldLnRyYWNrICYmIHJlY2VpdmVyc1tpXS50cmFjay5pZD09PWVuY19pZCApIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJNYXRjaFwiLG1lZGlhVHlwZSxlbmNfaWQpO1xuICAgICAgICAgIHRoaXMucl9yZWNlaXZlcj1yZWNlaXZlcnNbaV07XG4gICAgICAgICAgdGhpcy5yX2NsaWVudElkPWNsaWVudElkO1xuICAgICAgICAgIHRoaXMuY3JlYXRlRGVjb2Rlcih0aGlzLnJfcmVjZWl2ZXIsdGhpcy5yX2NsaWVudElkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG5cbiAgICB9KTtcblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLXVucHVibGlzaGVkXCIsIHRoYXQuaGFuZGxlVXNlclVucHVibGlzaGVkKTtcblxuICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdCBhZ29yYSBcIik7XG4gICAgLy8gSm9pbiBhIGNoYW5uZWwgYW5kIGNyZWF0ZSBsb2NhbCB0cmFja3MuIEJlc3QgcHJhY3RpY2UgaXMgdG8gdXNlIFByb21pc2UuYWxsIGFuZCBydW4gdGhlbSBjb25jdXJyZW50bHkuXG4gICAgLy8gb1xuXG5cbiAgICBpZiAodGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgIHZhciBzdHJlYW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUN1c3RvbVZpZGVvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXSB9KV0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgdmFyIHN0cmVhbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzX3NlY3JldFwiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW3RoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdIH0pXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayh7IGVuY29kZXJDb25maWc6ICc0ODBwXzInIH0pXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayhcIjM2MHBfNFwiKV0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCldKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihcImNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVzZXJpZCA9IGF3YWl0IHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKTtcbiAgICB9XG5cblxuICAgIC8vIHNlbGVjdCBmYWNldGltZSBjYW1lcmEgaWYgZXhpc3RzXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgIXRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCkge1xuICAgICAgbGV0IGNhbXMgPSBhd2FpdCBBZ29yYVJUQy5nZXRDYW1lcmFzKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbXNbaV0ubGFiZWwuaW5kZXhPZihcIkZhY2VUaW1lXCIpID09IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInNlbGVjdCBGYWNlVGltZSBjYW1lcmFcIiwgY2Ftc1tpXS5kZXZpY2VJZCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnNldERldmljZShjYW1zW2ldLmRldmljZUlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMuc2hvd0xvY2FsKSB7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGxheShcImxvY2FsLXBsYXllclwiKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE9MRCBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZzAgJiYgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKSB7XG4gICAgICBjb25zdCBpbWdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICBpbWdFbGVtZW50Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklUIFwiLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spO1xuICAgICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IGF3YWl0IFNlZ1BsdWdpbi5pbmplY3QodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLCBcIi9hc3NldHMvd2FzbXMwXCIpLmNhdGNoKGNvbnNvbGUuZXJyb3IpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiU0VHIElOSVRFRFwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2Uuc2V0T3B0aW9ucyh7IGVuYWJsZTogdHJ1ZSwgYmFja2dyb3VuZDogaW1nRWxlbWVudCB9KTtcbiAgICAgIH07XG4gICAgICBpbWdFbGVtZW50LnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFRQUFBQURDQUlBQUFBN2xqbVJBQUFBRDBsRVFWUjRYbU5nK00rQVFEZzVBT2s5Qy9Wa29tellBQUFBQUVsRlRrU3VRbUNDJztcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE5ldyBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZyAmJiB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcblxuICAgICAgdGhpcy5leHRlbnNpb24gPSBuZXcgVmlydHVhbEJhY2tncm91bmRFeHRlbnNpb24oKTtcbiAgICAgIEFnb3JhUlRDLnJlZ2lzdGVyRXh0ZW5zaW9ucyhbdGhpcy5leHRlbnNpb25dKTtcbiAgICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5leHRlbnNpb24uY3JlYXRlUHJvY2Vzc29yKCk7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3Nvci5pbml0KFwiL2Fzc2V0cy93YXNtc1wiKTtcbiAgICAgIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5waXBlKHRoaXMucHJvY2Vzc29yKS5waXBlKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5wcm9jZXNzb3JEZXN0aW5hdGlvbik7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3Nvci5zZXRPcHRpb25zKHsgdHlwZTogJ2NvbG9yJywgY29sb3I6IFwiIzAwZmYwMFwiIH0pO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3IuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgd2luZG93LmxvY2FsVHJhY2tzID0gdGhpcy5sb2NhbFRyYWNrcztcblxuICAgIC8vIFB1Ymxpc2ggdGhlIGxvY2FsIHZpZGVvIGFuZCBhdWRpbyB0cmFja3MgdG8gdGhlIGNoYW5uZWwuXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gfHwgdGhpcy5lbmFibGVBdWRpbyB8fCB0aGlzLmVuYWJsZUF2YXRhcikge1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaylcbiAgICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjayk7XG4gICAgICBpZiAodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKVxuICAgICAgICBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LnB1Ymxpc2godGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKTtcblxuICAgICAgY29uc29sZS5sb2coXCJwdWJsaXNoIHN1Y2Nlc3NcIik7XG4gICAgICBjb25zdCBwYyA9dGhpcy5hZ29yYUNsaWVudC5fcDJwQ2hhbm5lbC5jb25uZWN0aW9uLnBlZXJDb25uZWN0aW9uO1xuICAgICAgY29uc3Qgc2VuZGVycyA9IHBjLmdldFNlbmRlcnMoKTtcbiAgICAgIGxldCBpID0gMDtcbiAgICAgIGZvciAoaSA9IDA7IGkgPCBzZW5kZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZW5kZXJzW2ldLnRyYWNrICYmIChzZW5kZXJzW2ldLnRyYWNrLmtpbmQgPT0gJ2F1ZGlvJykpey8vfSB8fCBzZW5kZXJzW2ldLnRyYWNrLmtpbmQgPT0gJ3ZpZGVvJyApKSB7XG4gICAgICAgICAgdGhpcy5jcmVhdGVFbmNvZGVyKHNlbmRlcnNbaV0pO1xuICAgICAgICB9XG4gICAgICB9ICAgICAgXG4gICAgfVxuXG4gICAgLy8gUlRNXG5cbiAgfVxuXG4gIC8qKlxuICAgKiBQcml2YXRlc1xuICAgKi9cblxuICBhc3luYyBfY29ubmVjdChjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICBhd2FpdCB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcblxuICAgIC8qXG4gICAgICAgdGhpcy5lYXN5cnRjLnNldFN0cmVhbUFjY2VwdG9yKHRoaXMuc2V0TWVkaWFTdHJlYW0uYmluZCh0aGlzKSk7XG4gICAgICAgdGhpcy5lYXN5cnRjLnNldE9uU3RyZWFtQ2xvc2VkKGZ1bmN0aW9uKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICAgICAgZGVsZXRlIHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXTtcbiAgICAgIH0pO1xuICAgICAgIGlmICh0aGF0LmVhc3lydGMuYXVkaW9FbmFibGVkIHx8IHRoYXQuZWFzeXJ0Yy52aWRlb0VuYWJsZWQpIHtcbiAgICAgICAgbmF2aWdhdG9yLm1lZGlhRGV2aWNlcy5nZXRVc2VyTWVkaWEoe1xuICAgICAgICAgIHZpZGVvOiB0aGF0LmVhc3lydGMudmlkZW9FbmFibGVkLFxuICAgICAgICAgIGF1ZGlvOiB0aGF0LmVhc3lydGMuYXVkaW9FbmFibGVkXG4gICAgICAgIH0pLnRoZW4oXG4gICAgICAgICAgZnVuY3Rpb24oc3RyZWFtKSB7XG4gICAgICAgICAgICB0aGF0LmFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBcImRlZmF1bHRcIik7XG4gICAgICAgICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uKGVycm9yQ29kZSwgZXJybWVzZykge1xuICAgICAgICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm1lc2cpO1xuICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuICAgICAgfVxuICAgICAgKi9cbiAgfVxuXG4gIF9nZXRSb29tSm9pblRpbWUoY2xpZW50SWQpIHtcbiAgICB2YXIgbXlSb29tSWQgPSB0aGlzLnJvb207IC8vTkFGLnJvb207XG4gICAgdmFyIGpvaW5UaW1lID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcChteVJvb21JZClbY2xpZW50SWRdLnJvb21Kb2luVGltZTtcbiAgICByZXR1cm4gam9pblRpbWU7XG4gIH1cblxuICBnZXRTZXJ2ZXJUaW1lKCkge1xuICAgIHJldHVybiBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuICB9XG59XG5cbk5BRi5hZGFwdGVycy5yZWdpc3RlcihcImFnb3JhcnRjXCIsIEFnb3JhUnRjQWRhcHRlcik7XG5cbm1vZHVsZS5leHBvcnRzID0gQWdvcmFSdGNBZGFwdGVyO1xuIl0sInNvdXJjZVJvb3QiOiIifQ==