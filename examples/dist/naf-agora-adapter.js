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
        if (senders[i].track && (senders[i].track.kind == 'audio' || senders[i].track.kind == 'video')) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtb2NhcERhdGEiLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZVZpZGVvRmlsdGVyZWQiLCJlbmFibGVBdWRpbyIsImVuYWJsZUF2YXRhciIsImxvY2FsVHJhY2tzIiwidmlkZW9UcmFjayIsImF1ZGlvVHJhY2siLCJ0b2tlbiIsImNsaWVudElkIiwidWlkIiwidmJnIiwidmJnMCIsInNob3dMb2NhbCIsInZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UiLCJleHRlbnNpb24iLCJwcm9jZXNzb3IiLCJwaXBlUHJvY2Vzc29yIiwidHJhY2siLCJwaXBlIiwicHJvY2Vzc29yRGVzdGluYXRpb24iLCJzZXJ2ZXJUaW1lUmVxdWVzdHMiLCJ0aW1lT2Zmc2V0cyIsImF2Z1RpbWVPZmZzZXQiLCJhZ29yYUNsaWVudCIsInNldFBlZXJPcGVuTGlzdGVuZXIiLCJjbGllbnRDb25uZWN0aW9uIiwiZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZCIsInNldFBlZXJDbG9zZWRMaXN0ZW5lciIsImlzQ2hyb21lIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwiaW5kZXhPZiIsIm9sZFJUQ1BlZXJDb25uZWN0aW9uIiwiUlRDUGVlckNvbm5lY3Rpb24iLCJQcm94eSIsImNvbnN0cnVjdCIsInRhcmdldCIsImFyZ3MiLCJsZW5ndGgiLCJwdXNoIiwiZW5jb2RlZEluc2VydGFibGVTdHJlYW1zIiwicGMiLCJvbGRTZXRDb25maWd1cmF0aW9uIiwicHJvdG90eXBlIiwic2V0Q29uZmlndXJhdGlvbiIsImFyZ3VtZW50cyIsImFwcGx5IiwiQ3VzdG9tRGF0YURldGVjdG9yIiwiQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50Iiwic2V0U2VydmVyVXJsIiwidXJsIiwic2V0U29ja2V0VXJsIiwic2V0QXBwIiwiYXBwTmFtZSIsInNldFJvb20iLCJqc29uIiwicmVwbGFjZSIsIm9iaiIsIkpTT04iLCJwYXJzZSIsIm5hbWUiLCJBZ29yYVJUQyIsImxvYWRNb2R1bGUiLCJTZWdQbHVnaW4iLCJqb2luUm9vbSIsInNldFdlYlJ0Y09wdGlvbnMiLCJvcHRpb25zIiwiZW5hYmxlRGF0YUNoYW5uZWxzIiwiZGF0YWNoYW5uZWwiLCJ2aWRlbyIsImF1ZGlvIiwiZW5hYmxlVmlkZW9SZWNlaXZlIiwiZW5hYmxlQXVkaW9SZWNlaXZlIiwic2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyIsInN1Y2Nlc3NMaXN0ZW5lciIsImZhaWx1cmVMaXN0ZW5lciIsImNvbm5lY3RTdWNjZXNzIiwiY29ubmVjdEZhaWx1cmUiLCJzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciIsIm9jY3VwYW50TGlzdGVuZXIiLCJyb29tTmFtZSIsIm9jY3VwYW50cyIsInByaW1hcnkiLCJzZXREYXRhQ2hhbm5lbExpc3RlbmVycyIsIm9wZW5MaXN0ZW5lciIsImNsb3NlZExpc3RlbmVyIiwibWVzc2FnZUxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIiLCJzZXRQZWVyTGlzdGVuZXIiLCJ1cGRhdGVUaW1lT2Zmc2V0IiwiY2xpZW50U2VudFRpbWUiLCJEYXRlIiwibm93IiwiZmV0Y2giLCJkb2N1bWVudCIsImxvY2F0aW9uIiwiaHJlZiIsIm1ldGhvZCIsImNhY2hlIiwidGhlbiIsInJlcyIsInByZWNpc2lvbiIsInNlcnZlclJlY2VpdmVkVGltZSIsImhlYWRlcnMiLCJnZXQiLCJnZXRUaW1lIiwiY2xpZW50UmVjZWl2ZWRUaW1lIiwic2VydmVyVGltZSIsInRpbWVPZmZzZXQiLCJyZWR1Y2UiLCJhY2MiLCJvZmZzZXQiLCJzZXRUaW1lb3V0IiwiY29ubmVjdCIsIlByb21pc2UiLCJhbGwiLCJyZXNvbHZlIiwicmVqZWN0IiwiX2Nvbm5lY3QiLCJfIiwiX215Um9vbUpvaW5UaW1lIiwiX2dldFJvb21Kb2luVGltZSIsImNvbm5lY3RBZ29yYSIsImNhdGNoIiwic2hvdWxkU3RhcnRDb25uZWN0aW9uVG8iLCJjbGllbnQiLCJyb29tSm9pblRpbWUiLCJzdGFydFN0cmVhbUNvbm5lY3Rpb24iLCJjYWxsIiwiY2FsbGVyIiwibWVkaWEiLCJOQUYiLCJ3cml0ZSIsImVycm9yQ29kZSIsImVycm9yVGV4dCIsImVycm9yIiwid2FzQWNjZXB0ZWQiLCJjbG9zZVN0cmVhbUNvbm5lY3Rpb24iLCJoYW5ndXAiLCJjcmVhdGVFbmNvZGVyIiwic2VuZGVyIiwic3RyZWFtcyIsImNyZWF0ZUVuY29kZWRTdHJlYW1zIiwidGV4dEVuY29kZXIiLCJUZXh0RW5jb2RlciIsInRoYXQiLCJ0cmFuc2Zvcm1lciIsIlRyYW5zZm9ybVN0cmVhbSIsInRyYW5zZm9ybSIsImNodW5rIiwiY29udHJvbGxlciIsIm1vY2FwIiwiZW5jb2RlIiwiZnJhbWUiLCJkYXRhIiwiVWludDhBcnJheSIsImJ5dGVMZW5ndGgiLCJzZXQiLCJieXRlcyIsImdldEludEJ5dGVzIiwiaSIsIm1hZ2ljSW5kZXgiLCJjaGFyQ29kZUF0IiwiYnVmZmVyIiwiZW5xdWV1ZSIsInJlYWRhYmxlIiwicGlwZVRocm91Z2giLCJwaXBlVG8iLCJ3cml0YWJsZSIsIndvcmtlciIsIldvcmtlciIsIm9ubWVzc2FnZSIsImV2ZW50Iiwic2VuZGVyVHJhbnNmb3JtIiwiUlRDUnRwU2NyaXB0VHJhbnNmb3JtIiwicG9ydCIsInNlbmRlckNoYW5uZWwiLCJwb3J0MiIsInBvcnQxIiwid2F0ZXJtYXJrSW5wdXQiLCJnZXRFbGVtZW50QnlJZCIsInBvc3RNZXNzYWdlIiwid2F0ZXJtYXJrIiwiY3JlYXRlRGVjb2RlciIsInJlY2VpdmVyIiwidGV4dERlY29kZXIiLCJUZXh0RGVjb2RlciIsInZpZXciLCJEYXRhVmlldyIsIm1hZ2ljRGF0YSIsIm1hZ2ljIiwibWFnaWNTdHJpbmciLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJtb2NhcExlbiIsImdldFVpbnQzMiIsImZyYW1lU2l6ZSIsIm1vY2FwQnVmZmVyIiwiZGVjb2RlIiwicmVtb3RlTW9jYXAiLCJBcnJheUJ1ZmZlciIsInJlY2VpdmVyVHJhbnNmb3JtIiwicmVjZWl2ZXJDaGFubmVsIiwiZSIsInNlbmREYXRhIiwiZGF0YVR5cGUiLCJzZW5kRGF0YUd1YXJhbnRlZWQiLCJzZW5kRGF0YVdTIiwiYnJvYWRjYXN0RGF0YSIsInJvb21PY2N1cGFudHMiLCJnZXRSb29tT2NjdXBhbnRzQXNNYXAiLCJyb29tT2NjdXBhbnQiLCJteUVhc3lydGNpZCIsImJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIiwiZGVzdGluYXRpb24iLCJ0YXJnZXRSb29tIiwiZ2V0Q29ubmVjdFN0YXR1cyIsInN0YXR1cyIsIklTX0NPTk5FQ1RFRCIsImFkYXB0ZXJzIiwiTk9UX0NPTk5FQ1RFRCIsIkNPTk5FQ1RJTkciLCJnZXRNZWRpYVN0cmVhbSIsInN0cmVhbU5hbWUiLCJoYXMiLCJhdWRpb1Byb21pc2UiLCJ3YXJuIiwicHJvbWlzZSIsInZpZGVvUHJvbWlzZSIsInN0cmVhbVByb21pc2UiLCJzZXRNZWRpYVN0cmVhbSIsInN0cmVhbSIsImNsaWVudE1lZGlhU3RyZWFtcyIsImF1ZGlvVHJhY2tzIiwiZ2V0QXVkaW9UcmFja3MiLCJhdWRpb1N0cmVhbSIsIk1lZGlhU3RyZWFtIiwiZm9yRWFjaCIsImFkZFRyYWNrIiwidmlkZW9UcmFja3MiLCJnZXRWaWRlb1RyYWNrcyIsInZpZGVvU3RyZWFtIiwieCIsImFkZExvY2FsTWVkaWFTdHJlYW0iLCJpZCIsInJlZ2lzdGVyM3JkUGFydHlMb2NhbE1lZGlhU3RyZWFtIiwiT2JqZWN0Iiwia2V5cyIsImFkZFN0cmVhbVRvQ2FsbCIsInJlbW92ZUxvY2FsTWVkaWFTdHJlYW0iLCJjbG9zZUxvY2FsTWVkaWFTdHJlYW0iLCJlbmFibGVNaWNyb3Bob25lIiwiZW5hYmxlZCIsImVuYWJsZUNhbWVyYSIsImRpc2Nvbm5lY3QiLCJoYW5kbGVVc2VyUHVibGlzaGVkIiwidXNlciIsIm1lZGlhVHlwZSIsImhhbmRsZVVzZXJVbnB1Ymxpc2hlZCIsImNyZWF0ZUNsaWVudCIsIm1vZGUiLCJjb2RlYyIsInNldENsaWVudFJvbGUiLCJvbiIsInN1YnNjcmliZSIsInBsYXkiLCJfbWVkaWFTdHJlYW1UcmFjayIsInF1ZXJ5U2VsZWN0b3IiLCJzcmNPYmplY3QiLCJlbmNfaWQiLCJfcDJwQ2hhbm5lbCIsImNvbm5lY3Rpb24iLCJwZWVyQ29ubmVjdGlvbiIsInJlY2VpdmVycyIsImdldFJlY2VpdmVycyIsImNhcHR1cmVTdHJlYW0iLCJqb2luIiwiY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2siLCJjcmVhdGVDdXN0b21WaWRlb1RyYWNrIiwibWVkaWFTdHJlYW1UcmFjayIsImNyZWF0ZUNhbWVyYVZpZGVvVHJhY2siLCJlbmNvZGVyQ29uZmlnIiwiY2FtcyIsImdldENhbWVyYXMiLCJsYWJlbCIsImRldmljZUlkIiwic2V0RGV2aWNlIiwiaW1nRWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJpbmplY3QiLCJzZXRPcHRpb25zIiwiZW5hYmxlIiwiYmFja2dyb3VuZCIsInNyYyIsIlZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uIiwicmVnaXN0ZXJFeHRlbnNpb25zIiwiY3JlYXRlUHJvY2Vzc29yIiwiaW5pdCIsInR5cGUiLCJjb2xvciIsInB1Ymxpc2giLCJzZW5kZXJzIiwiZ2V0U2VuZGVycyIsImtpbmQiLCJteVJvb21JZCIsImpvaW5UaW1lIiwiZ2V0U2VydmVyVGltZSIsInJlZ2lzdGVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7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QVgsQ0FBaUJnUyxJQUFqQixJQUF5QixPQUF6QixJQUFvQ0YsUUFBUTlJLENBQVIsRUFBV2hKLEtBQVgsQ0FBaUJnUyxJQUFqQixJQUF5QixPQUFsRixDQUFKLEVBQWlHO0FBQy9GLGVBQUtySyxhQUFMLENBQW1CbUssUUFBUTlJLENBQVIsQ0FBbkI7QUFDRDtBQUNGO0FBQ0Y7O0FBRUQ7QUFFRDs7QUFFRDs7OztBQUlBLFFBQU0xQyxRQUFOLENBQWUzQyxjQUFmLEVBQStCQyxjQUEvQixFQUErQztBQUM3QyxRQUFJcUUsT0FBTyxJQUFYOztBQUVBLFVBQU1BLEtBQUsvSixPQUFMLENBQWErSCxPQUFiLENBQXFCZ0MsS0FBSzNKLEdBQTFCLEVBQStCcUYsY0FBL0IsRUFBK0NDLGNBQS9DLENBQU47O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkQ7O0FBRUQ2QyxtQkFBaUJsSCxRQUFqQixFQUEyQjtBQUN6QixRQUFJMFMsV0FBVyxLQUFLMVQsSUFBcEIsQ0FEeUIsQ0FDQztBQUMxQixRQUFJMlQsV0FBVyxLQUFLaFUsT0FBTCxDQUFhZ08scUJBQWIsQ0FBbUMrRixRQUFuQyxFQUE2QzFTLFFBQTdDLEVBQXVEdUgsWUFBdEU7QUFDQSxXQUFPb0wsUUFBUDtBQUNEOztBQUVEQyxrQkFBZ0I7QUFDZCxXQUFPeE4sS0FBS0MsR0FBTCxLQUFhLEtBQUt2RSxhQUF6QjtBQUNEO0FBcHZCbUI7O0FBdXZCdEI4RyxJQUFJd0YsUUFBSixDQUFheUYsUUFBYixDQUFzQixVQUF0QixFQUFrQ3BVLGVBQWxDOztBQUVBcVUsT0FBT0MsT0FBUCxHQUFpQnRVLGVBQWpCLEMiLCJmaWxlIjoibmFmLWFnb3JhLWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsImNsYXNzIEFnb3JhUnRjQWRhcHRlciB7XG5cbiAgY29uc3RydWN0b3IoZWFzeXJ0Yykge1xuICAgIFxuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25zdHJ1Y3RvciBcIiwgZWFzeXJ0Yyk7XG5cbiAgICB0aGlzLmVhc3lydGMgPSBlYXN5cnRjIHx8IHdpbmRvdy5lYXN5cnRjO1xuICAgIHRoaXMuYXBwID0gXCJkZWZhdWx0XCI7XG4gICAgdGhpcy5yb29tID0gXCJkZWZhdWx0XCI7XG4gICAgdGhpcy51c2VyaWQgPSAwO1xuICAgIHRoaXMuYXBwaWQgPSBudWxsO1xuICAgIHRoaXMubW9jYXBEYXRhPVwiXCI7XG5cbiAgICB0aGlzLm1lZGlhU3RyZWFtcyA9IHt9O1xuICAgIHRoaXMucmVtb3RlQ2xpZW50cyA9IHt9O1xuICAgIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLmVuYWJsZVZpZGVvID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVBdWRpbyA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXZhdGFyID0gZmFsc2U7XG5cbiAgICB0aGlzLmxvY2FsVHJhY2tzID0geyB2aWRlb1RyYWNrOiBudWxsLCBhdWRpb1RyYWNrOiBudWxsIH07XG4gICAgd2luZG93LmxvY2FsVHJhY2tzID0gdGhpcy5sb2NhbFRyYWNrcztcbiAgICB0aGlzLnRva2VuID0gbnVsbDtcbiAgICB0aGlzLmNsaWVudElkID0gbnVsbDtcbiAgICB0aGlzLnVpZCA9IG51bGw7XG4gICAgdGhpcy52YmcgPSBmYWxzZTtcbiAgICB0aGlzLnZiZzAgPSBmYWxzZTtcbiAgICB0aGlzLnNob3dMb2NhbCA9IGZhbHNlO1xuICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IG51bGw7XG4gICAgdGhpcy5leHRlbnNpb24gPSBudWxsO1xuICAgIHRoaXMucHJvY2Vzc29yID0gbnVsbDtcbiAgICB0aGlzLnBpcGVQcm9jZXNzb3IgPSAodHJhY2ssIHByb2Nlc3NvcikgPT4ge1xuICAgICAgdHJhY2sucGlwZShwcm9jZXNzb3IpLnBpcGUodHJhY2sucHJvY2Vzc29yRGVzdGluYXRpb24pO1xuICAgIH1cblxuXG4gICAgdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPSAwO1xuICAgIHRoaXMudGltZU9mZnNldHMgPSBbXTtcbiAgICB0aGlzLmF2Z1RpbWVPZmZzZXQgPSAwO1xuICAgIHRoaXMuYWdvcmFDbGllbnQgPSBudWxsO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJPcGVuTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgY29uc3QgY2xpZW50Q29ubmVjdGlvbiA9IHRoaXMuZWFzeXJ0Yy5nZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkKGNsaWVudElkKTtcbiAgICAgIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF0gPSBjbGllbnRDb25uZWN0aW9uO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJDbG9zZWRMaXN0ZW5lcihjbGllbnRJZCA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5yZW1vdGVDbGllbnRzW2NsaWVudElkXTtcbiAgICB9KTtcblxuICAgIHRoaXMuaXNDaHJvbWUgPSAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdGaXJlZm94JykgPT09IC0xICYmIG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQ2hyb21lJykgPiAtMSk7XG5cbiAgICBpZiAodGhpcy5pc0Nocm9tZSkge1xuICAgICAgd2luZG93Lm9sZFJUQ1BlZXJDb25uZWN0aW9uID0gUlRDUGVlckNvbm5lY3Rpb247XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBuZXcgUHJveHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLCB7XG4gICAgICAgIGNvbnN0cnVjdDogZnVuY3Rpb24gKHRhcmdldCwgYXJncykge1xuICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFyZ3NbMF1bXCJlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXNcIl0gPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goeyBlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXM6IHRydWUgfSk7XG4gICAgICAgICAgfVxuICAgICAgXG4gICAgICAgICAgY29uc3QgcGMgPSBuZXcgd2luZG93Lm9sZFJUQ1BlZXJDb25uZWN0aW9uKC4uLmFyZ3MpO1xuICAgICAgICAgIHJldHVybiBwYztcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgY29uc3Qgb2xkU2V0Q29uZmlndXJhdGlvbiA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0Q29uZmlndXJhdGlvbjtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0Q29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGFyZ3NbMF1bXCJlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXNcIl0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyZ3MucHVzaCh7IGVuY29kZWRJbnNlcnRhYmxlU3RyZWFtczogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgXG4gICAgICAgIG9sZFNldENvbmZpZ3VyYXRpb24uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9O1xuICAgIH1cbiAgICBcbiAgICAvLyBjdXN0b20gZGF0YSBhcHBlbmQgcGFyYW1zXG4gICAgdGhpcy5DdXN0b21EYXRhRGV0ZWN0b3IgPSAnQUdPUkFNT0NBUCc7XG4gICAgdGhpcy5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgPSA0O1xuXG4gICAgd2luZG93LkFnb3JhUnRjQWRhcHRlcj10aGlzO1xuICAgIFxuICB9XG5cbiAgc2V0U2VydmVyVXJsKHVybCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJVcmwgXCIsIHVybCk7XG4gICAgdGhpcy5lYXN5cnRjLnNldFNvY2tldFVybCh1cmwpO1xuICB9XG5cbiAgc2V0QXBwKGFwcE5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0QXBwIFwiLCBhcHBOYW1lKTtcbiAgICB0aGlzLmFwcCA9IGFwcE5hbWU7XG4gICAgdGhpcy5hcHBpZCA9IGFwcE5hbWU7XG4gIH1cblxuICBhc3luYyBzZXRSb29tKGpzb24pIHtcbiAgICBqc29uID0ganNvbi5yZXBsYWNlKC8nL2csICdcIicpO1xuICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgdGhpcy5yb29tID0gb2JqLm5hbWU7XG5cbiAgICBpZiAob2JqLnZiZyAmJiBvYmoudmJnPT0ndHJ1ZScgKSB7ICAgICAgXG4gICAgICB0aGlzLnZiZyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai52YmcwICYmIG9iai52YmcwPT0ndHJ1ZScgKSB7XG4gICAgICB0aGlzLnZiZzAgPSB0cnVlO1xuICAgICAgQWdvcmFSVEMubG9hZE1vZHVsZShTZWdQbHVnaW4sIHt9KTtcbiAgICB9XG5cbiAgICBpZiAob2JqLmVuYWJsZUF2YXRhciAmJiBvYmouZW5hYmxlQXZhdGFyPT0ndHJ1ZScgKSB7XG4gICAgICB0aGlzLmVuYWJsZUF2YXRhciA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai5zaG93TG9jYWwgICYmIG9iai5zaG93TG9jYWw9PSd0cnVlJykge1xuICAgICAgdGhpcy5zaG93TG9jYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmouZW5hYmxlVmlkZW9GaWx0ZXJlZCAmJiBvYmouZW5hYmxlVmlkZW9GaWx0ZXJlZD09J3RydWUnICkge1xuICAgICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5lYXN5cnRjLmpvaW5Sb29tKHRoaXMucm9vbSwgbnVsbCk7XG4gIH1cblxuICAvLyBvcHRpb25zOiB7IGRhdGFjaGFubmVsOiBib29sLCBhdWRpbzogYm9vbCwgdmlkZW86IGJvb2wgfVxuICBzZXRXZWJSdGNPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0V2ViUnRjT3B0aW9ucyBcIiwgb3B0aW9ucyk7XG4gICAgLy8gdGhpcy5lYXN5cnRjLmVuYWJsZURlYnVnKHRydWUpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVEYXRhQ2hhbm5lbHMob3B0aW9ucy5kYXRhY2hhbm5lbCk7XG5cbiAgICAvLyB1c2luZyBBZ29yYVxuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBvcHRpb25zLnZpZGVvO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBvcHRpb25zLmF1ZGlvO1xuXG4gICAgLy8gbm90IGVhc3lydGNcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvUmVjZWl2ZShmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvUmVjZWl2ZShmYWxzZSk7XG4gIH1cblxuICBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzKHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMgXCIsIHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKTtcbiAgICB0aGlzLmNvbm5lY3RTdWNjZXNzID0gc3VjY2Vzc0xpc3RlbmVyO1xuICAgIHRoaXMuY29ubmVjdEZhaWx1cmUgPSBmYWlsdXJlTGlzdGVuZXI7XG4gIH1cblxuICBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudExpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFJvb21PY2N1cGFudExpc3RlbmVyIFwiLCBvY2N1cGFudExpc3RlbmVyKTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihmdW5jdGlvbiAocm9vbU5hbWUsIG9jY3VwYW50cywgcHJpbWFyeSkge1xuICAgICAgb2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudHMpO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMob3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldERhdGFDaGFubmVsTGlzdGVuZXJzICBcIiwgb3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIob3Blbkxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyKGNsb3NlZExpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckxpc3RlbmVyKG1lc3NhZ2VMaXN0ZW5lcik7XG4gIH1cblxuICB1cGRhdGVUaW1lT2Zmc2V0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyB1cGRhdGVUaW1lT2Zmc2V0IFwiKTtcbiAgICBjb25zdCBjbGllbnRTZW50VGltZSA9IERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG5cbiAgICByZXR1cm4gZmV0Y2goZG9jdW1lbnQubG9jYXRpb24uaHJlZiwgeyBtZXRob2Q6IFwiSEVBRFwiLCBjYWNoZTogXCJuby1jYWNoZVwiIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgIHZhciBwcmVjaXNpb24gPSAxMDAwO1xuICAgICAgdmFyIHNlcnZlclJlY2VpdmVkVGltZSA9IG5ldyBEYXRlKHJlcy5oZWFkZXJzLmdldChcIkRhdGVcIikpLmdldFRpbWUoKSArIHByZWNpc2lvbiAvIDI7XG4gICAgICB2YXIgY2xpZW50UmVjZWl2ZWRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIHZhciBzZXJ2ZXJUaW1lID0gc2VydmVyUmVjZWl2ZWRUaW1lICsgKGNsaWVudFJlY2VpdmVkVGltZSAtIGNsaWVudFNlbnRUaW1lKSAvIDI7XG4gICAgICB2YXIgdGltZU9mZnNldCA9IHNlcnZlclRpbWUgLSBjbGllbnRSZWNlaXZlZFRpbWU7XG5cbiAgICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzKys7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA8PSAxMCkge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzLnB1c2godGltZU9mZnNldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzW3RoaXMuc2VydmVyVGltZVJlcXVlc3RzICUgMTBdID0gdGltZU9mZnNldDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gdGhpcy50aW1lT2Zmc2V0cy5yZWR1Y2UoKGFjYywgb2Zmc2V0KSA9PiBhY2MgKz0gb2Zmc2V0LCAwKSAvIHRoaXMudGltZU9mZnNldHMubGVuZ3RoO1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPiAxMCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlVGltZU9mZnNldCgpLCA1ICogNjAgKiAxMDAwKTsgLy8gU3luYyBjbG9jayBldmVyeSA1IG1pbnV0ZXMuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbm5lY3QoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3QgXCIpO1xuICAgIFByb21pc2UuYWxsKFt0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY29ubmVjdChyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pXSkudGhlbigoW18sIGNsaWVudElkXSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3RlZCBcIiArIGNsaWVudElkKTtcbiAgICAgIHRoaXMuY2xpZW50SWQgPSBjbGllbnRJZDtcbiAgICAgIHRoaXMuX215Um9vbUpvaW5UaW1lID0gdGhpcy5fZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKTtcbiAgICAgIHRoaXMuY29ubmVjdEFnb3JhKCk7XG4gICAgICB0aGlzLmNvbm5lY3RTdWNjZXNzKGNsaWVudElkKTtcbiAgICB9KS5jYXRjaCh0aGlzLmNvbm5lY3RGYWlsdXJlKTtcbiAgfVxuXG4gIHNob3VsZFN0YXJ0Q29ubmVjdGlvblRvKGNsaWVudCkge1xuICAgIHJldHVybiB0aGlzLl9teVJvb21Kb2luVGltZSA8PSBjbGllbnQucm9vbUpvaW5UaW1lO1xuICB9XG5cbiAgc3RhcnRTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbiBcIiwgY2xpZW50SWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5jYWxsKGNsaWVudElkLCBmdW5jdGlvbiAoY2FsbGVyLCBtZWRpYSkge1xuICAgICAgaWYgKG1lZGlhID09PSBcImRhdGFjaGFubmVsXCIpIHtcbiAgICAgICAgTkFGLmxvZy53cml0ZShcIlN1Y2Nlc3NmdWxseSBzdGFydGVkIGRhdGFjaGFubmVsIHRvIFwiLCBjYWxsZXIpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvckNvZGUsIGVycm9yVGV4dCkge1xuICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm9yVGV4dCk7XG4gICAgfSwgZnVuY3Rpb24gKHdhc0FjY2VwdGVkKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIndhcyBhY2NlcHRlZD1cIiArIHdhc0FjY2VwdGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlU3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjbG9zZVN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuaGFuZ3VwKGNsaWVudElkKTtcbiAgfVxuXG4gIGFzeW5jICBjcmVhdGVFbmNvZGVyKHNlbmRlcikge1xuXG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIGNvbnN0IHN0cmVhbXMgPSBzZW5kZXIuY3JlYXRlRW5jb2RlZFN0cmVhbXMoKTtcbiAgICAgIGNvbnN0IHRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgICB2YXIgdGhhdD10aGlzO1xuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKHtcbiAgICAgICAgdHJhbnNmb3JtKGNodW5rLCBjb250cm9sbGVyKSB7XG4gICAgICAgICAgY29uc3QgbW9jYXAgPSB0ZXh0RW5jb2Rlci5lbmNvZGUodGhhdC5tb2NhcERhdGEpO1xuICAgICAgICAgIGNvbnN0IGZyYW1lID0gY2h1bmsuZGF0YTtcbiAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICBkYXRhLnNldChuZXcgVWludDhBcnJheShmcmFtZSksIDApO1xuICAgICAgICAgIGRhdGEuc2V0KG1vY2FwLCBmcmFtZS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgICB2YXIgYnl0ZXMgPSB0aGF0LmdldEludEJ5dGVzKG1vY2FwLmJ5dGVMZW5ndGgpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgZGF0YVtmcmFtZS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIGldID0gYnl0ZXNbaV07XG4gICAgICAgICAgfVxuICBcbiAgICAgICAgICAvLyBTZXQgbWFnaWMgc3RyaW5nIGF0IHRoZSBlbmRcbiAgICAgICAgICBjb25zdCBtYWdpY0luZGV4ID0gZnJhbWUuYnl0ZUxlbmd0aCArIG1vY2FwLmJ5dGVMZW5ndGggKyB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkYXRhW21hZ2ljSW5kZXggKyBpXSA9IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNodW5rLmRhdGEgPSBkYXRhLmJ1ZmZlcjtcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmspO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgXG4gICAgICBzdHJlYW1zLnJlYWRhYmxlLnBpcGVUaHJvdWdoKHRyYW5zZm9ybWVyKS5waXBlVG8oc3RyZWFtcy53cml0YWJsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIoJ3NjcmlwdC10cmFuc2Zvcm0td29ya2VyLmpzJyk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdyZWdpc3RlcmVkJykge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIFxuICAgICAgY29uc3Qgc2VuZGVyVHJhbnNmb3JtID0gbmV3IFJUQ1J0cFNjcmlwdFRyYW5zZm9ybSh3b3JrZXIsIHsgbmFtZTogJ291dGdvaW5nJywgcG9ydDogc2VuZGVyQ2hhbm5lbC5wb3J0MiB9LCBbc2VuZGVyQ2hhbm5lbC5wb3J0Ml0pO1xuICAgICAgc2VuZGVyVHJhbnNmb3JtLnBvcnQgPSBzZW5kZXJDaGFubmVsLnBvcnQxO1xuICAgICAgc2VuZGVyLnRyYW5zZm9ybSA9IHNlbmRlclRyYW5zZm9ybTtcbiAgXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdzdGFydGVkJykge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIFxuICAgICAgY29uc3Qgd2F0ZXJtYXJrSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnd2F0ZXJtYXJrJyk7XG4gICAgICBzZW5kZXJDaGFubmVsLnBvcnQxLnBvc3RNZXNzYWdlKHsgd2F0ZXJtYXJrOiB0aGlzLm1vY2FwRGF0YSB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVEZWNvZGVyKHJlY2VpdmVyLGNsaWVudElkKSB7XG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIGNvbnN0IHN0cmVhbXMgPSByZWNlaXZlci5jcmVhdGVFbmNvZGVkU3RyZWFtcygpO1xuICAgICAgY29uc3QgdGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICAgIHZhciB0aGF0PXRoaXM7XG5cbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybVN0cmVhbSh7XG4gICAgICAgIHRyYW5zZm9ybShjaHVuaywgY29udHJvbGxlcikge1xuICAgICAgICAgIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcoY2h1bmsuZGF0YSk7ICBcbiAgICAgICAgICBjb25zdCBtYWdpY0RhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLCBjaHVuay5kYXRhLmJ5dGVMZW5ndGggLSB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgsIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCk7XG4gICAgICAgICAgbGV0IG1hZ2ljID0gW107XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbWFnaWMucHVzaChtYWdpY0RhdGFbaV0pO1xuXG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBtYWdpY1N0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoLi4ubWFnaWMpO1xuICAgICAgICAgIGlmIChtYWdpY1N0cmluZyA9PT0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IpIHtcbiAgICAgICAgICAgIGNvbnN0IG1vY2FwTGVuID0gdmlldy5nZXRVaW50MzIoY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gKHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKSwgZmFsc2UpO1xuICAgICAgICAgICAgY29uc3QgZnJhbWVTaXplID0gY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gKG1vY2FwTGVuICsgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgKyAgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICAgIGNvbnN0IG1vY2FwQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YSwgZnJhbWVTaXplLCBtb2NhcExlbik7XG4gICAgICAgICAgICBjb25zdCBtb2NhcCA9IHRleHREZWNvZGVyLmRlY29kZShtb2NhcEJ1ZmZlcikgICAgICAgIFxuICAgICAgICAgICAgd2luZG93LnJlbW90ZU1vY2FwKG1vY2FwK1wiLFwiK2NsaWVudElkKTtcbiAgICAgICAgICAvLyAgY29uc29sZS5lcnJvcihtb2NhcCk7ICAgICAgICBcbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gY2h1bmsuZGF0YTtcbiAgICAgICAgICAgIGNodW5rLmRhdGEgPSBuZXcgQXJyYXlCdWZmZXIoZnJhbWVTaXplKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhKTtcbiAgICAgICAgICAgIGRhdGEuc2V0KG5ldyBVaW50OEFycmF5KGZyYW1lLCAwLCBmcmFtZVNpemUpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGNodW5rKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBzdHJlYW1zLnJlYWRhYmxlLnBpcGVUaHJvdWdoKHRyYW5zZm9ybWVyKS5waXBlVG8oc3RyZWFtcy53cml0YWJsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIoJ3NjcmlwdC10cmFuc2Zvcm0td29ya2VyLmpzJyk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdyZWdpc3RlcmVkJykge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIFxuICAgICAgY29uc3QgcmVjZWl2ZXJUcmFuc2Zvcm0gPSBuZXcgUlRDUnRwU2NyaXB0VHJhbnNmb3JtKHdvcmtlciwgeyBuYW1lOiAnaW5jb21pbmcnLCBwb3J0OiByZWNlaXZlckNoYW5uZWwucG9ydDIgfSwgW3JlY2VpdmVyQ2hhbm5lbC5wb3J0Ml0pO1xuICAgICAgcmVjZWl2ZXJUcmFuc2Zvcm0ucG9ydCA9IHJlY2VpdmVyQ2hhbm5lbC5wb3J0MTtcbiAgICAgIHJlY2VpdmVyLnRyYW5zZm9ybSA9IHJlY2VpdmVyVHJhbnNmb3JtO1xuICAgICAgcmVjZWl2ZXJUcmFuc2Zvcm0ucG9ydC5vbm1lc3NhZ2UgPSBlID0+IHtcbiAgICAgICAgd2luZG93LnJlbW90ZU1vY2FwKGUuZGF0YStcIixcIitjbGllbnRJZCk7XG4gICAgICB9O1xuICBcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3N0YXJ0ZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0gIFxuICBzZW5kRGF0YShjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGEgXCIsIGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgLy8gc2VuZCB2aWEgd2VicnRjIG90aGVyd2lzZSBmYWxsYmFjayB0byB3ZWJzb2NrZXRzXG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBzZW5kRGF0YUd1YXJhbnRlZWQoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNlbmREYXRhR3VhcmFudGVlZCBcIiwgY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGFXUyhjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgYnJvYWRjYXN0RGF0YShkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIHJvb21PY2N1cGFudHMgPSB0aGlzLmVhc3lydGMuZ2V0Um9vbU9jY3VwYW50c0FzTWFwKHRoaXMucm9vbSk7XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGtleXMgb2YgdGhlIGVhc3lydGMgcm9vbSBvY2N1cGFudHMgbWFwLlxuICAgIC8vIGdldFJvb21PY2N1cGFudHNBc0FycmF5IHVzZXMgT2JqZWN0LmtleXMgd2hpY2ggYWxsb2NhdGVzIG1lbW9yeS5cbiAgICBmb3IgKHZhciByb29tT2NjdXBhbnQgaW4gcm9vbU9jY3VwYW50cykge1xuICAgICAgaWYgKHJvb21PY2N1cGFudHNbcm9vbU9jY3VwYW50XSAmJiByb29tT2NjdXBhbnQgIT09IHRoaXMuZWFzeXJ0Yy5teUVhc3lydGNpZCkge1xuICAgICAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICAgICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKHJvb21PY2N1cGFudCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIGRlc3RpbmF0aW9uID0geyB0YXJnZXRSb29tOiB0aGlzLnJvb20gfTtcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGFXUyhkZXN0aW5hdGlvbiwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRDb25uZWN0U3RhdHVzIFwiLCBjbGllbnRJZCk7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKTtcblxuICAgIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLklTX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5JU19DT05ORUNURUQ7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuTk9UX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5DT05ORUNUSU5HO1xuICAgIH1cbiAgfVxuXG4gIGdldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW1OYW1lID0gXCJhdWRpb1wiKSB7XG5cbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICAvLyBpZiAoIHN0cmVhbU5hbWUgPSBcImF1ZGlvXCIpIHtcbiAgICAvL3N0cmVhbU5hbWUgPSBcImJvZF9hdWRpb1wiO1xuICAgIC8vfVxuXG4gICAgaWYgKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSAmJiB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYEFscmVhZHkgaGFkICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYFdhaXRpbmcgb24gJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBhdWRpb3x2aWRlbyBhbGlhc1xuICAgICAgaWYgKCF0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmhhcyhjbGllbnRJZCkpIHtcbiAgICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB7fTtcblxuICAgICAgICBjb25zdCBhdWRpb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gQXVkaW8gRXJyb3JgLCBlKSk7XG5cbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucHJvbWlzZSA9IGF1ZGlvUHJvbWlzZTtcblxuICAgICAgICBjb25zdCB2aWRlb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gVmlkZW8gRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnByb21pc2UgPSB2aWRlb1Byb21pc2U7XG5cbiAgICAgICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5zZXQoY2xpZW50SWQsIHBlbmRpbmdNZWRpYVJlcXVlc3RzKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG5cbiAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHBlbmRpbmdNZWRpYVJlcXVlc3RzIHdpdGggc3RyZWFtTmFtZVxuICAgICAgaWYgKCFwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSkge1xuICAgICAgICBjb25zdCBzdHJlYW1Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIFwiJHtzdHJlYW1OYW1lfVwiIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5wcm9taXNlID0gc3RyZWFtUHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKVtzdHJlYW1OYW1lXS5wcm9taXNlO1xuICAgIH1cbiAgfVxuXG4gIHNldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpOyAvLyByZXR1cm4gdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIGVudHJ5IGluIHRoZSBNYXBcbiAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICBpZiAoc3RyZWFtTmFtZSA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAvLyBTYWZhcmkgZG9lc24ndCBsaWtlIGl0IHdoZW4geW91IHVzZSBhIG1peGVkIG1lZGlhIHN0cmVhbSB3aGVyZSBvbmUgb2YgdGhlIHRyYWNrcyBpcyBpbmFjdGl2ZSwgc28gd2VcbiAgICAgIC8vIHNwbGl0IHRoZSB0cmFja3MgaW50byB0d28gc3RyZWFtcy5cbiAgICAgIC8vIEFkZCBtZWRpYVN0cmVhbXMgYXVkaW8gc3RyZWFtTmFtZSBhbGlhc1xuICAgICAgY29uc3QgYXVkaW9UcmFja3MgPSBzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKTtcbiAgICAgIGlmIChhdWRpb1RyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXVkaW9UcmFja3MuZm9yRWFjaCh0cmFjayA9PiBhdWRpb1N0cmVhbS5hZGRUcmFjayh0cmFjaykpO1xuICAgICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBzZXRNZWRpYVN0cmVhbSBcImF1ZGlvXCIgYWxpYXMgRXJyb3JgLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGF1ZGlvIGFsaWFzIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyB2aWRlbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCB2aWRlb1RyYWNrcyA9IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpO1xuICAgICAgaWYgKHZpZGVvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2aWRlb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHZpZGVvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwidmlkZW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gdmlkZW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjbGllbnRNZWRpYVN0cmVhbXNbc3RyZWFtTmFtZV0gPSBzdHJlYW07XG5cbiAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGJ5IFN0cmVhbU5hbWUgaWYgaXQgZXhpc3RzLlxuICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzICYmIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnJlc29sdmUoc3RyZWFtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRJbnRCeXRlcyh4KSB7XG4gICAgdmFyIGJ5dGVzID0gW107XG4gICAgdmFyIGkgPSB0aGlzLkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDtcbiAgICBkbyB7XG4gICAgICBieXRlc1stLWldID0geCAmICgyNTUpO1xuICAgICAgeCA9IHggPj4gODtcbiAgICB9IHdoaWxlIChpKVxuICAgIHJldHVybiBieXRlcztcbiAgfVxuXG4gIGFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGFkZExvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgZWFzeXJ0YyA9IHRoaXMuZWFzeXJ0YztcbiAgICBzdHJlYW1OYW1lID0gc3RyZWFtTmFtZSB8fCBzdHJlYW0uaWQ7XG4gICAgdGhpcy5zZXRNZWRpYVN0cmVhbShcImxvY2FsXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgZWFzeXJ0Yy5yZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpO1xuXG4gICAgLy8gQWRkIGxvY2FsIHN0cmVhbSB0byBleGlzdGluZyBjb25uZWN0aW9uc1xuICAgIE9iamVjdC5rZXlzKHRoaXMucmVtb3RlQ2xpZW50cykuZm9yRWFjaChjbGllbnRJZCA9PiB7XG4gICAgICBpZiAoZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSAhPT0gZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICAgIGVhc3lydGMuYWRkU3RyZWFtVG9DYWxsKGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyByZW1vdmVMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW1OYW1lKTtcbiAgICB0aGlzLmVhc3lydGMuY2xvc2VMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpO1xuICAgIGRlbGV0ZSB0aGlzLm1lZGlhU3RyZWFtc1tcImxvY2FsXCJdW3N0cmVhbU5hbWVdO1xuICB9XG5cbiAgZW5hYmxlTWljcm9waG9uZShlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGVuYWJsZU1pY3JvcGhvbmUgXCIsIGVuYWJsZWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpO1xuICB9XG5cbiAgZW5hYmxlQ2FtZXJhKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlQ2FtZXJhIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQ2FtZXJhKGVuYWJsZWQpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZGlzY29ubmVjdCBcIik7XG4gICAgdGhpcy5lYXN5cnRjLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZVVzZXJQdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7IH1cblxuICBoYW5kbGVVc2VyVW5wdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJVblB1Ymxpc2hlZCBcIik7XG4gIH1cblxuICBhc3luYyBjb25uZWN0QWdvcmEoKSB7XG4gICAgLy8gQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHBsYXkgcmVtb3RlIHRyYWNrcyB3aGVuIHJlbW90ZSB1c2VyIHB1Ymxpc2hlcy5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgfHwgdGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcInJ0Y1wiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJoMjY0XCIgfSk7XG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LnNldENsaWVudFJvbGUoXCJob3N0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwiaDI2NFwiIH0pO1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIH1cblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLWpvaW5lZFwiLCBhc3luYyAodXNlcikgPT4ge1xuICAgICAgY29uc29sZS53YXJuKFwidXNlci1qb2luZWRcIiwgdXNlcik7XG4gICAgfSk7XG4gICAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItcHVibGlzaGVkXCIsIGFzeW5jICh1c2VyLCBtZWRpYVR5cGUpID0+IHtcblxuICAgICAgbGV0IGNsaWVudElkID0gdXNlci51aWQ7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZCBcIiArIGNsaWVudElkICsgXCIgXCIgKyBtZWRpYVR5cGUsIHRoYXQuYWdvcmFDbGllbnQpO1xuICAgICAgYXdhaXQgdGhhdC5hZ29yYUNsaWVudC5zdWJzY3JpYmUodXNlciwgbWVkaWFUeXBlKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkMiBcIiArIGNsaWVudElkICsgXCIgXCIgKyB0aGF0LmFnb3JhQ2xpZW50KTtcblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGF0LnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG4gICAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcblxuICAgICAgICBjb25zdCBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIuYXVkaW9UcmFjayBcIiwgdXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgLy9hdWRpb1N0cmVhbS5hZGRUcmFjayh1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMuYXVkaW8gPSBhdWRpb1N0cmVhbTtcbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHZpZGVvU3RyZWFtID0gbnVsbDtcbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLnZpZGVvVHJhY2sgXCIsIHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIHZpZGVvU3RyZWFtLmFkZFRyYWNrKHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy52aWRlbyA9IHZpZGVvU3RyZWFtO1xuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgICAvL3VzZXIudmlkZW9UcmFja1xuICAgICAgfVxuXG4gICAgICBpZiAoY2xpZW50SWQgPT0gJ0NDQycpIHtcbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlkZW8zNjBcIikuc3JjT2JqZWN0PXZpZGVvU3RyZWFtO1xuICAgICAgICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdmlkZW9TdHJlYW0pO1xuICAgICAgICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc3JjT2JqZWN0PSB1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2s7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zcmNPYmplY3QgPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGNsaWVudElkID09ICdEREQnKSB7XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICB1c2VyLnZpZGVvVHJhY2sucGxheShcInZpZGVvMzYwXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICB1c2VyLmF1ZGlvVHJhY2sucGxheSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgICAgbGV0IGVuY19pZDtcbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgZW5jX2lkPXVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjay5pZDtcbiAgICAgICBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVuY19pZD11c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2suaWQ7XG4gICAgICB9XG4gICAgXG4gICAgICAvL2NvbnNvbGUud2FybihtZWRpYVR5cGUsZW5jX2lkKTsgICAgXG4gICAgICBjb25zdCBwYyA9dGhpcy5hZ29yYUNsaWVudC5fcDJwQ2hhbm5lbC5jb25uZWN0aW9uLnBlZXJDb25uZWN0aW9uO1xuICAgICAgY29uc3QgcmVjZWl2ZXJzID0gcGMuZ2V0UmVjZWl2ZXJzKCk7ICBcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVjZWl2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChyZWNlaXZlcnNbaV0udHJhY2sgJiYgcmVjZWl2ZXJzW2ldLnRyYWNrLmlkPT09ZW5jX2lkICkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIk1hdGNoXCIsbWVkaWFUeXBlLGVuY19pZCk7XG4gICAgICAgICAgdGhpcy5jcmVhdGVEZWNvZGVyKHJlY2VpdmVyc1tpXSxjbGllbnRJZCk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuXG4gICAgfSk7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci11bnB1Ymxpc2hlZFwiLCB0aGF0LmhhbmRsZVVzZXJVbnB1Ymxpc2hlZCk7XG5cbiAgICBjb25zb2xlLmxvZyhcImNvbm5lY3QgYWdvcmEgXCIpO1xuICAgIC8vIEpvaW4gYSBjaGFubmVsIGFuZCBjcmVhdGUgbG9jYWwgdHJhY2tzLiBCZXN0IHByYWN0aWNlIGlzIHRvIHVzZSBQcm9taXNlLmFsbCBhbmQgcnVuIHRoZW0gY29uY3VycmVudGx5LlxuICAgIC8vIG9cblxuXG4gICAgaWYgKHRoaXMuZW5hYmxlQXZhdGFyKSB7XG4gICAgICB2YXIgc3RyZWFtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNcIikuY2FwdHVyZVN0cmVhbSgzMCk7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLFxuICAgICAgICBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDdXN0b21WaWRlb1RyYWNrKHsgbWVkaWFTdHJlYW1UcmFjazogc3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF0gfSldKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkICYmIHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIHZhciBzdHJlYW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc19zZWNyZXRcIikuY2FwdHVyZVN0cmVhbSgzMCk7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFt0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUN1c3RvbVZpZGVvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXSB9KV0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soeyBlbmNvZGVyQ29uZmlnOiAnNDgwcF8yJyB9KV0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICAvLyBKb2luIHRoZSBjaGFubmVsLlxuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksIEFnb3JhUlRDLmNyZWF0ZUNhbWVyYVZpZGVvVHJhY2soXCIzNjBwXzRcIildKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5hYmxlQXVkaW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgLy8gSm9pbiB0aGUgY2hhbm5lbC5cbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpXSk7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJjcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFja1wiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51c2VyaWQgPSBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCk7XG4gICAgfVxuXG5cbiAgICAvLyBzZWxlY3QgZmFjZXRpbWUgY2FtZXJhIGlmIGV4aXN0c1xuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmICF0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQpIHtcbiAgICAgIGxldCBjYW1zID0gYXdhaXQgQWdvcmFSVEMuZ2V0Q2FtZXJhcygpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjYW1zW2ldLmxhYmVsLmluZGV4T2YoXCJGYWNlVGltZVwiKSA9PSAwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzZWxlY3QgRmFjZVRpbWUgY2FtZXJhXCIsIGNhbXNbaV0uZGV2aWNlSWQpO1xuICAgICAgICAgIGF3YWl0IHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5zZXREZXZpY2UoY2Ftc1tpXS5kZXZpY2VJZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnNob3dMb2NhbCkge1xuICAgICAgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnBsYXkoXCJsb2NhbC1wbGF5ZXJcIik7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBPTEQgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcwICYmIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaykge1xuICAgICAgY29uc3QgaW1nRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgaW1nRWxlbWVudC5vbmxvYWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJTRUcgSU5JVCBcIiwgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKTtcbiAgICAgICAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UgPSBhd2FpdCBTZWdQbHVnaW4uaW5qZWN0KHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaywgXCIvYXNzZXRzL3dhc21zMFwiKS5jYXRjaChjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklURURcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlLnNldE9wdGlvbnMoeyBlbmFibGU6IHRydWUsIGJhY2tncm91bmQ6IGltZ0VsZW1lbnQgfSk7XG4gICAgICB9O1xuICAgICAgaW1nRWxlbWVudC5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBUUFBQUFEQ0FJQUFBQTdsam1SQUFBQUQwbEVRVlI0WG1OZytNK0FRRGc1QU9rOUMvVmtvbXpZQUFBQUFFbEZUa1N1UW1DQyc7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBOZXcgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcgJiYgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKSB7XG5cbiAgICAgIHRoaXMuZXh0ZW5zaW9uID0gbmV3IFZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uKCk7XG4gICAgICBBZ29yYVJUQy5yZWdpc3RlckV4dGVuc2lvbnMoW3RoaXMuZXh0ZW5zaW9uXSk7XG4gICAgICB0aGlzLnByb2Nlc3NvciA9IHRoaXMuZXh0ZW5zaW9uLmNyZWF0ZVByb2Nlc3NvcigpO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3IuaW5pdChcIi9hc3NldHMvd2FzbXNcIik7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGlwZSh0aGlzLnByb2Nlc3NvcikucGlwZSh0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucHJvY2Vzc29yRGVzdGluYXRpb24pO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3Iuc2V0T3B0aW9ucyh7IHR5cGU6ICdjb2xvcicsIGNvbG9yOiBcIiMwMGZmMDBcIiB9KTtcbiAgICAgIGF3YWl0IHRoaXMucHJvY2Vzc29yLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIHdpbmRvdy5sb2NhbFRyYWNrcyA9IHRoaXMubG9jYWxUcmFja3M7XG5cbiAgICAvLyBQdWJsaXNoIHRoZSBsb2NhbCB2aWRlbyBhbmQgYXVkaW8gdHJhY2tzIHRvIHRoZSBjaGFubmVsLlxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8gfHwgdGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgIGlmICh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spXG4gICAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spO1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaylcbiAgICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjayk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwicHVibGlzaCBzdWNjZXNzXCIpO1xuICAgICAgY29uc3QgcGMgPXRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHNlbmRlcnMgPSBwYy5nZXRTZW5kZXJzKCk7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc2VuZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VuZGVyc1tpXS50cmFjayAmJiAoc2VuZGVyc1tpXS50cmFjay5raW5kID09ICdhdWRpbycgfHwgc2VuZGVyc1tpXS50cmFjay5raW5kID09ICd2aWRlbycgKSkge1xuICAgICAgICAgIHRoaXMuY3JlYXRlRW5jb2RlcihzZW5kZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfSAgICAgIFxuICAgIH1cblxuICAgIC8vIFJUTVxuXG4gIH1cblxuICAvKipcbiAgICogUHJpdmF0ZXNcbiAgICovXG5cbiAgYXN5bmMgX2Nvbm5lY3QoY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgYXdhaXQgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG5cbiAgICAvKlxuICAgICAgIHRoaXMuZWFzeXJ0Yy5zZXRTdHJlYW1BY2NlcHRvcih0aGlzLnNldE1lZGlhU3RyZWFtLmJpbmQodGhpcykpO1xuICAgICAgIHRoaXMuZWFzeXJ0Yy5zZXRPblN0cmVhbUNsb3NlZChmdW5jdGlvbihjbGllbnRJZCwgc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgICAgIGRlbGV0ZSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV07XG4gICAgICB9KTtcbiAgICAgICBpZiAodGhhdC5lYXN5cnRjLmF1ZGlvRW5hYmxlZCB8fCB0aGF0LmVhc3lydGMudmlkZW9FbmFibGVkKSB7XG4gICAgICAgIG5hdmlnYXRvci5tZWRpYURldmljZXMuZ2V0VXNlck1lZGlhKHtcbiAgICAgICAgICB2aWRlbzogdGhhdC5lYXN5cnRjLnZpZGVvRW5hYmxlZCxcbiAgICAgICAgICBhdWRpbzogdGhhdC5lYXN5cnRjLmF1ZGlvRW5hYmxlZFxuICAgICAgICB9KS50aGVuKFxuICAgICAgICAgIGZ1bmN0aW9uKHN0cmVhbSkge1xuICAgICAgICAgICAgdGhhdC5hZGRMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgXCJkZWZhdWx0XCIpO1xuICAgICAgICAgICAgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbihlcnJvckNvZGUsIGVycm1lc2cpIHtcbiAgICAgICAgICAgIE5BRi5sb2cuZXJyb3IoZXJyb3JDb2RlLCBlcnJtZXNnKTtcbiAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGF0LmVhc3lydGMuY29ubmVjdCh0aGF0LmFwcCwgY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKTtcbiAgICAgIH1cbiAgICAgICovXG4gIH1cblxuICBfZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKSB7XG4gICAgdmFyIG15Um9vbUlkID0gdGhpcy5yb29tOyAvL05BRi5yb29tO1xuICAgIHZhciBqb2luVGltZSA9IHRoaXMuZWFzeXJ0Yy5nZXRSb29tT2NjdXBhbnRzQXNNYXAobXlSb29tSWQpW2NsaWVudElkXS5yb29tSm9pblRpbWU7XG4gICAgcmV0dXJuIGpvaW5UaW1lO1xuICB9XG5cbiAgZ2V0U2VydmVyVGltZSgpIHtcbiAgICByZXR1cm4gRGF0ZS5ub3coKSArIHRoaXMuYXZnVGltZU9mZnNldDtcbiAgfVxufVxuXG5OQUYuYWRhcHRlcnMucmVnaXN0ZXIoXCJhZ29yYXJ0Y1wiLCBBZ29yYVJ0Y0FkYXB0ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFnb3JhUnRjQWRhcHRlcjtcbiJdLCJzb3VyY2VSb290IjoiIn0=