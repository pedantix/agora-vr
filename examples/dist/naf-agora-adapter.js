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
    this.mocapPrevData = "";
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

    this._vad_audioTrack = null;
    this._voiceActivityDetectionFrequency = 150;

    this._vad_MaxAudioSamples = 400;
    this._vad_MaxBackgroundNoiseLevel = 30;
    this._vad_SilenceOffeset = 10;
    this._vad_audioSamplesArr = [];
    this._vad_audioSamplesArrSorted = [];
    this._vad_exceedCount = 0;
    this._vad_exceedCountThreshold = 2;
    this._vad_exceedCountThresholdLow = 1;
    this._voiceActivityDetectionInterval;

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
    if (mocap == this.mocapPrevData) {
      //   console.log("blank");
      mocap = "";
    }

    // set to blank after sending
    if (this.mocapData === "") {
      this.mocapData = mocap;
    }

    if (!this.isChrome) {
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
          that.mocapPrevData = that.mocapData;
          that.mocapData = "";
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

      senderTransform.port.onmessage = e => {
        if (e.data == "CLEAR") {
          that.mocapPrevData = that.mocapData;
          that.mocapData = "";
        }
      };

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
            if (mocap.length > 0) {
              window.remoteMocap(mocap + "," + clientId);
            }
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
      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'registered') {

          resolve();
        }
      });

      const receiverTransform = new RTCRtpScriptTransform(worker, { name: 'incoming', port: that.receiverChannel.port2 }, [that.receiverChannel.port2]);

      receiverTransform.port = that.receiverChannel.port1;
      receiver.transform = receiverTransform;
      receiverTransform.port.onmessage = e => {
        if (e.data.length > 0) {
          window.remoteMocap(e.data + "," + clientId);
        }
      };

      await new Promise(resolve => worker.onmessage = event => {
        if (event.data === 'started') {
          //  console.warn("incoming 5a",clientId,event.data );
          resolve();
        }
        //   console.warn("incoming 5",clientId,event.data );
      });
      //  console.warn("incoming 6",clientId );
    }
  }
  sendData(clientId, dataType, data) {
    //  console.log("BW73 sendData ", clientId, dataType, data);
    // send via webrtc otherwise fallback to websockets
    this.easyrtc.sendData(clientId, dataType, data);
  }

  sendDataGuaranteed(clientId, dataType, data) {
    //  console.log("BW73 sendDataGuaranteed ", clientId, dataType, data);
    this.easyrtc.sendDataWS(clientId, dataType, data);
  }

  broadcastData(dataType, data) {
    return this.broadcastDataGuaranteed(dataType, data);
    /*
    console.log("BW73 broadcastData ", dataType, data);
    var roomOccupants = this.easyrtc.getRoomOccupantsAsMap(this.room);
     // Iterate over the keys of the easyrtc room occupants map.
    // getRoomOccupantsAsArray uses Object.keys which allocates memory.
    for (var roomOccupant in roomOccupants) {
      if (roomOccupants[roomOccupant] && roomOccupant !== this.easyrtc.myEasyrtcid) {
        // send via webrtc otherwise fallback to websockets
        try {
          this.easyrtc.sendData(roomOccupant, dataType, data);
        } catch (e) {
           console.error("sendData",e);
        }
      }
    }
    */
  }

  broadcastDataGuaranteed(dataType, data) {
    // console.log("BW73 broadcastDataGuaranteed ", dataType, data);
    var destination = { targetRoom: this.room };
    this.easyrtc.sendDataWS(destination, dataType, data);
  }

  getConnectStatus(clientId) {
    //  console.log("BW73 getConnectStatus ", clientId);
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

  getInputLevel(track) {
    var analyser = track._source.volumeLevelAnalyser.analyserNode;
    //var analyser = track._source.analyserNode;
    const bufferLength = analyser.frequencyBinCount;
    var data = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(data);
    var values = 0;
    var average;
    var length = data.length;
    for (var i = 0; i < length; i++) {
      values += data[i];
    }
    average = Math.floor(values / length);
    return average;
  }

  voiceActivityDetection() {
    if (!this._vad_audioTrack || !this._vad_audioTrack._enabled) return;

    var audioLevel = this.getInputLevel(this._vad_audioTrack);
    if (audioLevel <= this._vad_MaxBackgroundNoiseLevel) {
      if (this._vad_audioSamplesArr.length >= this._vad_MaxAudioSamples) {
        var removed = this._vad_audioSamplesArr.shift();
        var removedIndex = this._vad_audioSamplesArrSorted.indexOf(removed);
        if (removedIndex > -1) {
          this._vad_audioSamplesArrSorted.splice(removedIndex, 1);
        }
      }
      this._vad_audioSamplesArr.push(audioLevel);
      this._vad_audioSamplesArrSorted.push(audioLevel);
      this._vad_audioSamplesArrSorted.sort((a, b) => a - b);
    }
    var background = Math.floor(3 * this._vad_audioSamplesArrSorted[Math.floor(this._vad_audioSamplesArrSorted.length / 2)] / 2);
    if (audioLevel > background + this._vad_SilenceOffeset) {
      this._vad_exceedCount++;
    } else {
      this._vad_exceedCount = 0;
    }

    if (this._vad_exceedCount > this._vad_exceedCountThresholdLow) {
      //AgoraRTCUtilEvents.emit("VoiceActivityDetectedFast", this._vad_exceedCount);
      window._state_stop_at = Date.now();
      // console.error("VADl ",Date.now()-window._state_stop_at);
    }

    if (this._vad_exceedCount > this._vad_exceedCountThreshold) {
      //AgoraRTCUtilEvents.emit("VoiceActivityDetected", this._vad_exceedCount);
      this._vad_exceedCount = 0;
      window._state_stop_at = Date.now();
      //   console.error("VAD ",Date.now()-window._state_stop_at);
    }
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

      let enc_id = 'na';
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
      let audio_track;
      if (window.gum_stream) {
        // avoid double allow iOs

        audio_track = AgoraRTC.createCustomAudioTrack({ mediaStreamTrack: window.gum_stream.getAudioTracks()[0] });
        console.warn(audio_track, "audio_track");
      } else {
        audio_track = AgoraRTC.createMicrophoneAudioTrack();
      }

      [this.userid, this.localTracks.audioTrack] = await Promise.all([
      // Join the channel.
      this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), audio_track]);
      //console.log("createMicrophoneAudioTrack");
      this._vad_audioTrack = this.localTracks.audioTrack;
      if (!this._voiceActivityDetectionInterval) {
        this._voiceActivityDetectionInterval = setInterval(() => {
          this.voiceActivityDetection();
        }, this._voiceActivityDetectionFrequency);
      }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtb2NhcERhdGEiLCJtb2NhcFByZXZEYXRhIiwibG9naSIsImxvZ28iLCJtZWRpYVN0cmVhbXMiLCJyZW1vdGVDbGllbnRzIiwicGVuZGluZ01lZGlhUmVxdWVzdHMiLCJNYXAiLCJlbmFibGVWaWRlbyIsImVuYWJsZVZpZGVvRmlsdGVyZWQiLCJlbmFibGVBdWRpbyIsImVuYWJsZUF2YXRhciIsImxvY2FsVHJhY2tzIiwidmlkZW9UcmFjayIsImF1ZGlvVHJhY2siLCJ0b2tlbiIsImNsaWVudElkIiwidWlkIiwidmJnIiwidmJnMCIsInNob3dMb2NhbCIsInZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UiLCJleHRlbnNpb24iLCJwcm9jZXNzb3IiLCJwaXBlUHJvY2Vzc29yIiwidHJhY2siLCJwaXBlIiwicHJvY2Vzc29yRGVzdGluYXRpb24iLCJzZXJ2ZXJUaW1lUmVxdWVzdHMiLCJ0aW1lT2Zmc2V0cyIsImF2Z1RpbWVPZmZzZXQiLCJhZ29yYUNsaWVudCIsInNldFBlZXJPcGVuTGlzdGVuZXIiLCJjbGllbnRDb25uZWN0aW9uIiwiZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZCIsInNldFBlZXJDbG9zZWRMaXN0ZW5lciIsImlzQ2hyb21lIiwibmF2aWdhdG9yIiwidXNlckFnZW50IiwiaW5kZXhPZiIsIm9sZFJUQ1BlZXJDb25uZWN0aW9uIiwiUlRDUGVlckNvbm5lY3Rpb24iLCJQcm94eSIsImNvbnN0cnVjdCIsInRhcmdldCIsImFyZ3MiLCJsZW5ndGgiLCJwdXNoIiwiZW5jb2RlZEluc2VydGFibGVTdHJlYW1zIiwicGMiLCJvbGRTZXRDb25maWd1cmF0aW9uIiwicHJvdG90eXBlIiwic2V0Q29uZmlndXJhdGlvbiIsImFyZ3VtZW50cyIsImFwcGx5IiwiQ3VzdG9tRGF0YURldGVjdG9yIiwiQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50Iiwic2VuZGVyQ2hhbm5lbCIsIk1lc3NhZ2VDaGFubmVsIiwicmVjZWl2ZXJDaGFubmVsIiwicl9yZWNlaXZlciIsInJfY2xpZW50SWQiLCJfdmFkX2F1ZGlvVHJhY2siLCJfdm9pY2VBY3Rpdml0eURldGVjdGlvbkZyZXF1ZW5jeSIsIl92YWRfTWF4QXVkaW9TYW1wbGVzIiwiX3ZhZF9NYXhCYWNrZ3JvdW5kTm9pc2VMZXZlbCIsIl92YWRfU2lsZW5jZU9mZmVzZXQiLCJfdmFkX2F1ZGlvU2FtcGxlc0FyciIsIl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkIiwiX3ZhZF9leGNlZWRDb3VudCIsIl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGQiLCJfdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkTG93IiwiX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25JbnRlcnZhbCIsInNldFNlcnZlclVybCIsInVybCIsInNldFNvY2tldFVybCIsInNldEFwcCIsImFwcE5hbWUiLCJzZXRSb29tIiwianNvbiIsInJlcGxhY2UiLCJvYmoiLCJKU09OIiwicGFyc2UiLCJuYW1lIiwiQWdvcmFSVEMiLCJsb2FkTW9kdWxlIiwiU2VnUGx1Z2luIiwiam9pblJvb20iLCJzZXRXZWJSdGNPcHRpb25zIiwib3B0aW9ucyIsImVuYWJsZURhdGFDaGFubmVscyIsImRhdGFjaGFubmVsIiwidmlkZW8iLCJhdWRpbyIsImVuYWJsZVZpZGVvUmVjZWl2ZSIsImVuYWJsZUF1ZGlvUmVjZWl2ZSIsInNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMiLCJzdWNjZXNzTGlzdGVuZXIiLCJmYWlsdXJlTGlzdGVuZXIiLCJjb25uZWN0U3VjY2VzcyIsImNvbm5lY3RGYWlsdXJlIiwic2V0Um9vbU9jY3VwYW50TGlzdGVuZXIiLCJvY2N1cGFudExpc3RlbmVyIiwicm9vbU5hbWUiLCJvY2N1cGFudHMiLCJwcmltYXJ5Iiwic2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMiLCJvcGVuTGlzdGVuZXIiLCJjbG9zZWRMaXN0ZW5lciIsIm1lc3NhZ2VMaXN0ZW5lciIsInNldERhdGFDaGFubmVsT3Blbkxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyIiwic2V0UGVlckxpc3RlbmVyIiwidXBkYXRlVGltZU9mZnNldCIsImNsaWVudFNlbnRUaW1lIiwiRGF0ZSIsIm5vdyIsImZldGNoIiwiZG9jdW1lbnQiLCJsb2NhdGlvbiIsImhyZWYiLCJtZXRob2QiLCJjYWNoZSIsInRoZW4iLCJyZXMiLCJwcmVjaXNpb24iLCJzZXJ2ZXJSZWNlaXZlZFRpbWUiLCJoZWFkZXJzIiwiZ2V0IiwiZ2V0VGltZSIsImNsaWVudFJlY2VpdmVkVGltZSIsInNlcnZlclRpbWUiLCJ0aW1lT2Zmc2V0IiwicmVkdWNlIiwiYWNjIiwib2Zmc2V0Iiwic2V0VGltZW91dCIsImNvbm5lY3QiLCJQcm9taXNlIiwiYWxsIiwicmVzb2x2ZSIsInJlamVjdCIsIl9jb25uZWN0IiwiXyIsIl9teVJvb21Kb2luVGltZSIsIl9nZXRSb29tSm9pblRpbWUiLCJjb25uZWN0QWdvcmEiLCJjYXRjaCIsInNob3VsZFN0YXJ0Q29ubmVjdGlvblRvIiwiY2xpZW50Iiwicm9vbUpvaW5UaW1lIiwic3RhcnRTdHJlYW1Db25uZWN0aW9uIiwiY2FsbCIsImNhbGxlciIsIm1lZGlhIiwiTkFGIiwid3JpdGUiLCJlcnJvckNvZGUiLCJlcnJvclRleHQiLCJlcnJvciIsIndhc0FjY2VwdGVkIiwiY2xvc2VTdHJlYW1Db25uZWN0aW9uIiwiaGFuZ3VwIiwic2VuZE1vY2FwIiwibW9jYXAiLCJwb3J0MSIsInBvc3RNZXNzYWdlIiwid2F0ZXJtYXJrIiwiY3JlYXRlRW5jb2RlciIsInNlbmRlciIsInN0cmVhbXMiLCJjcmVhdGVFbmNvZGVkU3RyZWFtcyIsInRleHRFbmNvZGVyIiwiVGV4dEVuY29kZXIiLCJ0aGF0IiwidHJhbnNmb3JtZXIiLCJUcmFuc2Zvcm1TdHJlYW0iLCJ0cmFuc2Zvcm0iLCJjaHVuayIsImNvbnRyb2xsZXIiLCJlbmNvZGUiLCJmcmFtZSIsImRhdGEiLCJVaW50OEFycmF5IiwiYnl0ZUxlbmd0aCIsInNldCIsImJ5dGVzIiwiZ2V0SW50Qnl0ZXMiLCJpIiwibWFnaWNJbmRleCIsImNoYXJDb2RlQXQiLCJidWZmZXIiLCJlbnF1ZXVlIiwicmVhZGFibGUiLCJwaXBlVGhyb3VnaCIsInBpcGVUbyIsIndyaXRhYmxlIiwid29ya2VyIiwiV29ya2VyIiwib25tZXNzYWdlIiwiZXZlbnQiLCJzZW5kZXJUcmFuc2Zvcm0iLCJSVENSdHBTY3JpcHRUcmFuc2Zvcm0iLCJwb3J0IiwicG9ydDIiLCJlIiwicmVjcmVhdGVEZWNvZGVyIiwiY3JlYXRlRGVjb2RlciIsInJlY2VpdmVyIiwidGV4dERlY29kZXIiLCJUZXh0RGVjb2RlciIsInZpZXciLCJEYXRhVmlldyIsIm1hZ2ljRGF0YSIsIm1hZ2ljIiwibWFnaWNTdHJpbmciLCJTdHJpbmciLCJmcm9tQ2hhckNvZGUiLCJtb2NhcExlbiIsImdldFVpbnQzMiIsImZyYW1lU2l6ZSIsIm1vY2FwQnVmZmVyIiwiZGVjb2RlIiwicmVtb3RlTW9jYXAiLCJBcnJheUJ1ZmZlciIsInJlY2VpdmVyVHJhbnNmb3JtIiwic2VuZERhdGEiLCJkYXRhVHlwZSIsInNlbmREYXRhR3VhcmFudGVlZCIsInNlbmREYXRhV1MiLCJicm9hZGNhc3REYXRhIiwiYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQiLCJkZXN0aW5hdGlvbiIsInRhcmdldFJvb20iLCJnZXRDb25uZWN0U3RhdHVzIiwic3RhdHVzIiwiSVNfQ09OTkVDVEVEIiwiYWRhcHRlcnMiLCJOT1RfQ09OTkVDVEVEIiwiQ09OTkVDVElORyIsImdldE1lZGlhU3RyZWFtIiwic3RyZWFtTmFtZSIsImhhcyIsImF1ZGlvUHJvbWlzZSIsIndhcm4iLCJwcm9taXNlIiwidmlkZW9Qcm9taXNlIiwic3RyZWFtUHJvbWlzZSIsInNldE1lZGlhU3RyZWFtIiwic3RyZWFtIiwiY2xpZW50TWVkaWFTdHJlYW1zIiwiYXVkaW9UcmFja3MiLCJnZXRBdWRpb1RyYWNrcyIsImF1ZGlvU3RyZWFtIiwiTWVkaWFTdHJlYW0iLCJmb3JFYWNoIiwiYWRkVHJhY2siLCJ2aWRlb1RyYWNrcyIsImdldFZpZGVvVHJhY2tzIiwidmlkZW9TdHJlYW0iLCJ4IiwiYWRkTG9jYWxNZWRpYVN0cmVhbSIsImlkIiwicmVnaXN0ZXIzcmRQYXJ0eUxvY2FsTWVkaWFTdHJlYW0iLCJPYmplY3QiLCJrZXlzIiwiYWRkU3RyZWFtVG9DYWxsIiwicmVtb3ZlTG9jYWxNZWRpYVN0cmVhbSIsImNsb3NlTG9jYWxNZWRpYVN0cmVhbSIsImVuYWJsZU1pY3JvcGhvbmUiLCJlbmFibGVkIiwiZW5hYmxlQ2FtZXJhIiwiZGlzY29ubmVjdCIsImhhbmRsZVVzZXJQdWJsaXNoZWQiLCJ1c2VyIiwibWVkaWFUeXBlIiwiaGFuZGxlVXNlclVucHVibGlzaGVkIiwiZ2V0SW5wdXRMZXZlbCIsImFuYWx5c2VyIiwiX3NvdXJjZSIsInZvbHVtZUxldmVsQW5hbHlzZXIiLCJhbmFseXNlck5vZGUiLCJidWZmZXJMZW5ndGgiLCJmcmVxdWVuY3lCaW5Db3VudCIsImdldEJ5dGVGcmVxdWVuY3lEYXRhIiwidmFsdWVzIiwiYXZlcmFnZSIsIk1hdGgiLCJmbG9vciIsInZvaWNlQWN0aXZpdHlEZXRlY3Rpb24iLCJfZW5hYmxlZCIsImF1ZGlvTGV2ZWwiLCJyZW1vdmVkIiwic2hpZnQiLCJyZW1vdmVkSW5kZXgiLCJzcGxpY2UiLCJzb3J0IiwiYSIsImIiLCJiYWNrZ3JvdW5kIiwiX3N0YXRlX3N0b3BfYXQiLCJjcmVhdGVDbGllbnQiLCJtb2RlIiwiY29kZWMiLCJzZXRDbGllbnRSb2xlIiwib24iLCJzdWJzY3JpYmUiLCJwbGF5IiwiX21lZGlhU3RyZWFtVHJhY2siLCJxdWVyeVNlbGVjdG9yIiwic3JjT2JqZWN0IiwiZW5jX2lkIiwiX3AycENoYW5uZWwiLCJjb25uZWN0aW9uIiwicGVlckNvbm5lY3Rpb24iLCJyZWNlaXZlcnMiLCJnZXRSZWNlaXZlcnMiLCJnZXRFbGVtZW50QnlJZCIsImNhcHR1cmVTdHJlYW0iLCJqb2luIiwiY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2siLCJjcmVhdGVDdXN0b21WaWRlb1RyYWNrIiwibWVkaWFTdHJlYW1UcmFjayIsImNyZWF0ZUNhbWVyYVZpZGVvVHJhY2siLCJlbmNvZGVyQ29uZmlnIiwiYXVkaW9fdHJhY2siLCJndW1fc3RyZWFtIiwiY3JlYXRlQ3VzdG9tQXVkaW9UcmFjayIsInNldEludGVydmFsIiwiY2FtcyIsImdldENhbWVyYXMiLCJsYWJlbCIsImRldmljZUlkIiwic2V0RGV2aWNlIiwiaW1nRWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJvbmxvYWQiLCJpbmplY3QiLCJzZXRPcHRpb25zIiwiZW5hYmxlIiwic3JjIiwiVmlydHVhbEJhY2tncm91bmRFeHRlbnNpb24iLCJyZWdpc3RlckV4dGVuc2lvbnMiLCJjcmVhdGVQcm9jZXNzb3IiLCJpbml0IiwidHlwZSIsImNvbG9yIiwicHVibGlzaCIsInNlbmRlcnMiLCJnZXRTZW5kZXJzIiwia2luZCIsIm15Um9vbUlkIiwiam9pblRpbWUiLCJnZXRSb29tT2NjdXBhbnRzQXNNYXAiLCJnZXRTZXJ2ZXJUaW1lIiwicmVnaXN0ZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNB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QnNVLElBQWpCLElBQXlCLE9BQWxELEVBQTJEO0FBQUM7QUFDMUQsZUFBS3RMLGFBQUwsQ0FBbUJvTCxRQUFRaEssQ0FBUixDQUFuQjtBQUNEO0FBQ0Y7QUFDRjs7QUFFRDtBQUVEOztBQUVEOzs7O0FBSUEsUUFBTTlDLFFBQU4sQ0FBZTNDLGNBQWYsRUFBK0JDLGNBQS9CLEVBQStDO0FBQzdDLFFBQUkwRSxPQUFPLElBQVg7QUFDQSxVQUFNQSxLQUFLdkwsT0FBTCxDQUFha0osT0FBYixDQUFxQnFDLEtBQUtuTCxHQUExQixFQUErQndHLGNBQS9CLEVBQStDQyxjQUEvQyxDQUFOO0FBQ0Q7O0FBRUQ2QyxtQkFBaUJsSSxRQUFqQixFQUEyQjtBQUN6QixRQUFJZ1YsV0FBVyxLQUFLblcsSUFBcEIsQ0FEeUIsQ0FDQztBQUMxQixRQUFJb1csV0FBVyxLQUFLelcsT0FBTCxDQUFhMFcscUJBQWIsQ0FBbUNGLFFBQW5DLEVBQTZDaFYsUUFBN0MsRUFBdUR1SSxZQUF0RTtBQUNBLFdBQU8wTSxRQUFQO0FBQ0Q7O0FBRURFLGtCQUFnQjtBQUNkLFdBQU8vTyxLQUFLQyxHQUFMLEtBQWEsS0FBS3ZGLGFBQXpCO0FBQ0Q7QUF0MkJtQjs7QUF5MkJ0QjhILElBQUlrRixRQUFKLENBQWFzSCxRQUFiLENBQXNCLFVBQXRCLEVBQWtDOVcsZUFBbEM7O0FBRUErVyxPQUFPQyxPQUFQLEdBQWlCaFgsZUFBakIsQyIsImZpbGUiOiJuYWYtYWdvcmEtYWRhcHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vc3JjL2luZGV4LmpzXCIpO1xuIiwiY2xhc3MgQWdvcmFSdGNBZGFwdGVyIHtcblxuICBjb25zdHJ1Y3RvcihlYXN5cnRjKSB7XG4gICAgXG4gICAgY29uc29sZS5sb2coXCJCVzczIGNvbnN0cnVjdG9yIFwiLCBlYXN5cnRjKTtcblxuICAgIHRoaXMuZWFzeXJ0YyA9IGVhc3lydGMgfHwgd2luZG93LmVhc3lydGM7XG4gICAgdGhpcy5hcHAgPSBcImRlZmF1bHRcIjtcbiAgICB0aGlzLnJvb20gPSBcImRlZmF1bHRcIjtcbiAgICB0aGlzLnVzZXJpZCA9IDA7XG4gICAgdGhpcy5hcHBpZCA9IG51bGw7XG4gICAgdGhpcy5tb2NhcERhdGE9XCJcIjtcbiAgICB0aGlzLm1vY2FwUHJldkRhdGE9XCJcIjtcbiAgICB0aGlzLmxvZ2k9MDtcbiAgICB0aGlzLmxvZ289MDtcbiAgICB0aGlzLm1lZGlhU3RyZWFtcyA9IHt9O1xuICAgIHRoaXMucmVtb3RlQ2xpZW50cyA9IHt9O1xuICAgIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMgPSBuZXcgTWFwKCk7XG5cbiAgICB0aGlzLmVuYWJsZVZpZGVvID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVBdWRpbyA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXZhdGFyID0gZmFsc2U7XG5cbiAgICB0aGlzLmxvY2FsVHJhY2tzID0geyB2aWRlb1RyYWNrOiBudWxsLCBhdWRpb1RyYWNrOiBudWxsIH07XG4gICAgd2luZG93LmxvY2FsVHJhY2tzID0gdGhpcy5sb2NhbFRyYWNrcztcbiAgICB0aGlzLnRva2VuID0gbnVsbDtcbiAgICB0aGlzLmNsaWVudElkID0gbnVsbDtcbiAgICB0aGlzLnVpZCA9IG51bGw7XG4gICAgdGhpcy52YmcgPSBmYWxzZTtcbiAgICB0aGlzLnZiZzAgPSBmYWxzZTtcbiAgICB0aGlzLnNob3dMb2NhbCA9IGZhbHNlO1xuICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IG51bGw7XG4gICAgdGhpcy5leHRlbnNpb24gPSBudWxsO1xuICAgIHRoaXMucHJvY2Vzc29yID0gbnVsbDtcbiAgICB0aGlzLnBpcGVQcm9jZXNzb3IgPSAodHJhY2ssIHByb2Nlc3NvcikgPT4ge1xuICAgICAgdHJhY2sucGlwZShwcm9jZXNzb3IpLnBpcGUodHJhY2sucHJvY2Vzc29yRGVzdGluYXRpb24pO1xuICAgIH1cblxuICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID0gMDtcbiAgICB0aGlzLnRpbWVPZmZzZXRzID0gW107XG4gICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gMDtcbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gbnVsbDtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyT3Blbkxpc3RlbmVyKGNsaWVudElkID0+IHtcbiAgICAgIGNvbnN0IGNsaWVudENvbm5lY3Rpb24gPSB0aGlzLmVhc3lydGMuZ2V0UGVlckNvbm5lY3Rpb25CeVVzZXJJZChjbGllbnRJZCk7XG4gICAgICB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdID0gY2xpZW50Q29ubmVjdGlvbjtcbiAgICB9KTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyQ2xvc2VkTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgZGVsZXRlIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF07XG4gICAgfSk7XG5cbiAgICB0aGlzLmlzQ2hyb21lID0gKG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignRmlyZWZveCcpID09PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0Nocm9tZScpID4gLTEpO1xuXG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIHdpbmRvdy5vbGRSVENQZWVyQ29ubmVjdGlvbiA9IFJUQ1BlZXJDb25uZWN0aW9uO1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uID0gbmV3IFByb3h5KHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiwge1xuICAgICAgICBjb25zdHJ1Y3Q6IGZ1bmN0aW9uICh0YXJnZXQsIGFyZ3MpIHtcbiAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBhcmdzWzBdW1wiZW5jb2RlZEluc2VydGFibGVTdHJlYW1zXCJdID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXJncy5wdXNoKHsgZW5jb2RlZEluc2VydGFibGVTdHJlYW1zOiB0cnVlIH0pO1xuICAgICAgICAgIH1cbiAgICAgIFxuICAgICAgICAgIGNvbnN0IHBjID0gbmV3IHdpbmRvdy5vbGRSVENQZWVyQ29ubmVjdGlvbiguLi5hcmdzKTtcbiAgICAgICAgICByZXR1cm4gcGM7XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIGNvbnN0IG9sZFNldENvbmZpZ3VyYXRpb24gPSB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldENvbmZpZ3VyYXRpb247XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24ucHJvdG90eXBlLnNldENvbmZpZ3VyYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNvbnN0IGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBhcmdzWzBdW1wiZW5jb2RlZEluc2VydGFibGVTdHJlYW1zXCJdID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBhcmdzLnB1c2goeyBlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXM6IHRydWUgfSk7XG4gICAgICAgIH1cbiAgICAgIFxuICAgICAgICBvbGRTZXRDb25maWd1cmF0aW9uLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgfTtcbiAgICB9XG4gICAgXG4gICAgLy8gY3VzdG9tIGRhdGEgYXBwZW5kIHBhcmFtc1xuICAgIHRoaXMuQ3VzdG9tRGF0YURldGVjdG9yID0gJ0FHT1JBTU9DQVAnO1xuICAgIHRoaXMuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ID0gNDtcbiAgICB0aGlzLnNlbmRlckNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgdGhpcy5yZWNlaXZlckNoYW5uZWw7XG4gICAgdGhpcy5yX3JlY2VpdmVyPW51bGw7XG4gICAgdGhpcy5yX2NsaWVudElkPW51bGw7XG5cbiAgICB0aGlzLl92YWRfYXVkaW9UcmFjayA9IG51bGw7XG4gICAgdGhpcy5fdm9pY2VBY3Rpdml0eURldGVjdGlvbkZyZXF1ZW5jeSA9IDE1MDtcbiAgXG4gICAgdGhpcy5fdmFkX01heEF1ZGlvU2FtcGxlcyA9IDQwMDtcbiAgICB0aGlzLl92YWRfTWF4QmFja2dyb3VuZE5vaXNlTGV2ZWwgPSAzMDtcbiAgICB0aGlzLl92YWRfU2lsZW5jZU9mZmVzZXQgPSAxMDtcbiAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyID0gW107XG4gICAgdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZCA9IFtdO1xuICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudCA9IDA7XG4gICAgdGhpcy5fdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkID0gMjtcbiAgICB0aGlzLl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGRMb3cgPSAxO1xuICAgIHRoaXMuX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25JbnRlcnZhbDtcblxuXG4gICAgXG4gICAgd2luZG93LkFnb3JhUnRjQWRhcHRlcj10aGlzO1xuICAgIFxuICB9XG5cbiAgc2V0U2VydmVyVXJsKHVybCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJVcmwgXCIsIHVybCk7XG4gICAgdGhpcy5lYXN5cnRjLnNldFNvY2tldFVybCh1cmwpO1xuICB9XG5cbiAgc2V0QXBwKGFwcE5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0QXBwIFwiLCBhcHBOYW1lKTtcbiAgICB0aGlzLmFwcCA9IGFwcE5hbWU7XG4gICAgdGhpcy5hcHBpZCA9IGFwcE5hbWU7XG4gIH1cblxuICBhc3luYyBzZXRSb29tKGpzb24pIHtcbiAgICBqc29uID0ganNvbi5yZXBsYWNlKC8nL2csICdcIicpO1xuICAgIGNvbnN0IG9iaiA9IEpTT04ucGFyc2UoanNvbik7XG4gICAgdGhpcy5yb29tID0gb2JqLm5hbWU7XG5cbiAgICBpZiAob2JqLnZiZyAmJiBvYmoudmJnPT0ndHJ1ZScgKSB7ICAgICAgXG4gICAgICB0aGlzLnZiZyA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai52YmcwICYmIG9iai52YmcwPT0ndHJ1ZScgKSB7XG4gICAgICB0aGlzLnZiZzAgPSB0cnVlO1xuICAgICAgQWdvcmFSVEMubG9hZE1vZHVsZShTZWdQbHVnaW4sIHt9KTtcbiAgICB9XG5cbiAgICBpZiAob2JqLmVuYWJsZUF2YXRhciAmJiBvYmouZW5hYmxlQXZhdGFyPT0ndHJ1ZScgKSB7XG4gICAgICB0aGlzLmVuYWJsZUF2YXRhciA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai5zaG93TG9jYWwgICYmIG9iai5zaG93TG9jYWw9PSd0cnVlJykge1xuICAgICAgdGhpcy5zaG93TG9jYWwgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmouZW5hYmxlVmlkZW9GaWx0ZXJlZCAmJiBvYmouZW5hYmxlVmlkZW9GaWx0ZXJlZD09J3RydWUnICkge1xuICAgICAgdGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgdGhpcy5lYXN5cnRjLmpvaW5Sb29tKHRoaXMucm9vbSwgbnVsbCk7XG4gIH1cblxuICAvLyBvcHRpb25zOiB7IGRhdGFjaGFubmVsOiBib29sLCBhdWRpbzogYm9vbCwgdmlkZW86IGJvb2wgfVxuICBzZXRXZWJSdGNPcHRpb25zKG9wdGlvbnMpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0V2ViUnRjT3B0aW9ucyBcIiwgb3B0aW9ucyk7XG4gICAgLy8gdGhpcy5lYXN5cnRjLmVuYWJsZURlYnVnKHRydWUpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVEYXRhQ2hhbm5lbHMob3B0aW9ucy5kYXRhY2hhbm5lbCk7XG5cbiAgICAvLyB1c2luZyBBZ29yYVxuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBvcHRpb25zLnZpZGVvO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBvcHRpb25zLmF1ZGlvO1xuXG4gICAgLy8gbm90IGVhc3lydGNcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvUmVjZWl2ZShmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvUmVjZWl2ZShmYWxzZSk7XG4gIH1cblxuICBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzKHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMgXCIsIHN1Y2Nlc3NMaXN0ZW5lciwgZmFpbHVyZUxpc3RlbmVyKTtcbiAgICB0aGlzLmNvbm5lY3RTdWNjZXNzID0gc3VjY2Vzc0xpc3RlbmVyO1xuICAgIHRoaXMuY29ubmVjdEZhaWx1cmUgPSBmYWlsdXJlTGlzdGVuZXI7XG4gIH1cblxuICBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudExpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFJvb21PY2N1cGFudExpc3RlbmVyIFwiLCBvY2N1cGFudExpc3RlbmVyKTtcblxuICAgIHRoaXMuZWFzeXJ0Yy5zZXRSb29tT2NjdXBhbnRMaXN0ZW5lcihmdW5jdGlvbiAocm9vbU5hbWUsIG9jY3VwYW50cywgcHJpbWFyeSkge1xuICAgICAgb2NjdXBhbnRMaXN0ZW5lcihvY2N1cGFudHMpO1xuICAgIH0pO1xuICB9XG5cbiAgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMob3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldERhdGFDaGFubmVsTGlzdGVuZXJzICBcIiwgb3Blbkxpc3RlbmVyLCBjbG9zZWRMaXN0ZW5lciwgbWVzc2FnZUxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIob3Blbkxpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0RGF0YUNoYW5uZWxDbG9zZUxpc3RlbmVyKGNsb3NlZExpc3RlbmVyKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckxpc3RlbmVyKG1lc3NhZ2VMaXN0ZW5lcik7XG4gIH1cblxuICB1cGRhdGVUaW1lT2Zmc2V0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyB1cGRhdGVUaW1lT2Zmc2V0IFwiKTtcbiAgICBjb25zdCBjbGllbnRTZW50VGltZSA9IERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG5cbiAgICByZXR1cm4gZmV0Y2goZG9jdW1lbnQubG9jYXRpb24uaHJlZiwgeyBtZXRob2Q6IFwiSEVBRFwiLCBjYWNoZTogXCJuby1jYWNoZVwiIH0pLnRoZW4ocmVzID0+IHtcbiAgICAgIHZhciBwcmVjaXNpb24gPSAxMDAwO1xuICAgICAgdmFyIHNlcnZlclJlY2VpdmVkVGltZSA9IG5ldyBEYXRlKHJlcy5oZWFkZXJzLmdldChcIkRhdGVcIikpLmdldFRpbWUoKSArIHByZWNpc2lvbiAvIDI7XG4gICAgICB2YXIgY2xpZW50UmVjZWl2ZWRUaW1lID0gRGF0ZS5ub3coKTtcbiAgICAgIHZhciBzZXJ2ZXJUaW1lID0gc2VydmVyUmVjZWl2ZWRUaW1lICsgKGNsaWVudFJlY2VpdmVkVGltZSAtIGNsaWVudFNlbnRUaW1lKSAvIDI7XG4gICAgICB2YXIgdGltZU9mZnNldCA9IHNlcnZlclRpbWUgLSBjbGllbnRSZWNlaXZlZFRpbWU7XG5cbiAgICAgIHRoaXMuc2VydmVyVGltZVJlcXVlc3RzKys7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA8PSAxMCkge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzLnB1c2godGltZU9mZnNldCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnRpbWVPZmZzZXRzW3RoaXMuc2VydmVyVGltZVJlcXVlc3RzICUgMTBdID0gdGltZU9mZnNldDtcbiAgICAgIH1cblxuICAgICAgdGhpcy5hdmdUaW1lT2Zmc2V0ID0gdGhpcy50aW1lT2Zmc2V0cy5yZWR1Y2UoKGFjYywgb2Zmc2V0KSA9PiBhY2MgKz0gb2Zmc2V0LCAwKSAvIHRoaXMudGltZU9mZnNldHMubGVuZ3RoO1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPiAxMCkge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMudXBkYXRlVGltZU9mZnNldCgpLCA1ICogNjAgKiAxMDAwKTsgLy8gU3luYyBjbG9jayBldmVyeSA1IG1pbnV0ZXMuXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbm5lY3QoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3QgXCIpO1xuICAgIFByb21pc2UuYWxsKFt0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgdGhpcy5fY29ubmVjdChyZXNvbHZlLCByZWplY3QpO1xuICAgIH0pXSkudGhlbigoW18sIGNsaWVudElkXSkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGNvbm5lY3RlZCBcIiArIGNsaWVudElkKTtcbiAgICAgIHRoaXMuY2xpZW50SWQgPSBjbGllbnRJZDtcbiAgICAgIHRoaXMuX215Um9vbUpvaW5UaW1lID0gdGhpcy5fZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKTtcbiAgICAgIHRoaXMuY29ubmVjdEFnb3JhKCk7XG4gICAgICB0aGlzLmNvbm5lY3RTdWNjZXNzKGNsaWVudElkKTtcbiAgICB9KS5jYXRjaCh0aGlzLmNvbm5lY3RGYWlsdXJlKTtcbiAgfVxuXG4gIHNob3VsZFN0YXJ0Q29ubmVjdGlvblRvKGNsaWVudCkge1xuICAgIHJldHVybiB0aGlzLl9teVJvb21Kb2luVGltZSA8PSBjbGllbnQucm9vbUpvaW5UaW1lO1xuICB9XG5cbiAgc3RhcnRTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbiBcIiwgY2xpZW50SWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5jYWxsKGNsaWVudElkLCBmdW5jdGlvbiAoY2FsbGVyLCBtZWRpYSkge1xuICAgICAgaWYgKG1lZGlhID09PSBcImRhdGFjaGFubmVsXCIpIHtcbiAgICAgICAgTkFGLmxvZy53cml0ZShcIlN1Y2Nlc3NmdWxseSBzdGFydGVkIGRhdGFjaGFubmVsIHRvIFwiLCBjYWxsZXIpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uIChlcnJvckNvZGUsIGVycm9yVGV4dCkge1xuICAgICAgTkFGLmxvZy5lcnJvcihlcnJvckNvZGUsIGVycm9yVGV4dCk7XG4gICAgfSwgZnVuY3Rpb24gKHdhc0FjY2VwdGVkKSB7XG4gICAgICAvLyBjb25zb2xlLmxvZyhcIndhcyBhY2NlcHRlZD1cIiArIHdhc0FjY2VwdGVkKTtcbiAgICB9KTtcbiAgfVxuXG4gIGNsb3NlU3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjbG9zZVN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuaGFuZ3VwKGNsaWVudElkKTtcbiAgfVxuXG4gIHNlbmRNb2NhcChtb2NhcCkge1xuICAgIGlmIChtb2NhcD09dGhpcy5tb2NhcFByZXZEYXRhKXtcbiAgIC8vICAgY29uc29sZS5sb2coXCJibGFua1wiKTtcbiAgICAgIG1vY2FwPVwiXCI7XG4gICAgfVxuXG4gICAgLy8gc2V0IHRvIGJsYW5rIGFmdGVyIHNlbmRpbmdcbiAgICBpZiAodGhpcy5tb2NhcERhdGE9PT1cIlwiKSB7XG4gICAgICB0aGlzLm1vY2FwRGF0YT1tb2NhcDtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIHRoaXMuc2VuZGVyQ2hhbm5lbC5wb3J0MS5wb3N0TWVzc2FnZSh7IHdhdGVybWFyazogbW9jYXAgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgY3JlYXRlRW5jb2RlcihzZW5kZXIpIHtcbiAgICBpZiAodGhpcy5pc0Nocm9tZSkge1xuICAgICAgY29uc3Qgc3RyZWFtcyA9IHNlbmRlci5jcmVhdGVFbmNvZGVkU3RyZWFtcygpO1xuICAgICAgY29uc3QgdGV4dEVuY29kZXIgPSBuZXcgVGV4dEVuY29kZXIoKTtcbiAgICAgIHZhciB0aGF0PXRoaXM7XG4gICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IG5ldyBUcmFuc2Zvcm1TdHJlYW0oe1xuICAgICAgICB0cmFuc2Zvcm0oY2h1bmssIGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICBjb25zdCBtb2NhcCA9IHRleHRFbmNvZGVyLmVuY29kZSh0aGF0Lm1vY2FwRGF0YSk7XG4gICAgICAgICAgdGhhdC5tb2NhcFByZXZEYXRhPXRoYXQubW9jYXBEYXRhO1xuICAgICAgICAgIHRoYXQubW9jYXBEYXRhPVwiXCI7XG4gICAgICAgICAgY29uc3QgZnJhbWUgPSBjaHVuay5kYXRhO1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLmJ5dGVMZW5ndGggKyBtb2NhcC5ieXRlTGVuZ3RoICsgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgKyB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpO1xuICAgICAgICAgIGRhdGEuc2V0KG5ldyBVaW50OEFycmF5KGZyYW1lKSwgMCk7XG4gICAgICAgICAgZGF0YS5zZXQobW9jYXAsIGZyYW1lLmJ5dGVMZW5ndGgpO1xuICAgICAgICAgIHZhciBieXRlcyA9IHRoYXQuZ2V0SW50Qnl0ZXMobW9jYXAuYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBkYXRhW2ZyYW1lLmJ5dGVMZW5ndGggKyBtb2NhcC5ieXRlTGVuZ3RoICsgaV0gPSBieXRlc1tpXTtcbiAgICAgICAgICB9XG4gIFxuICAgICAgICAgIC8vIFNldCBtYWdpYyBzdHJpbmcgYXQgdGhlIGVuZFxuICAgICAgICAgIGNvbnN0IG1hZ2ljSW5kZXggPSBmcmFtZS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50O1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRhdGFbbWFnaWNJbmRleCArIGldID0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2h1bmsuZGF0YSA9IGRhdGEuYnVmZmVyO1xuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjaHVuayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICBcbiAgICAgIHN0cmVhbXMucmVhZGFibGUucGlwZVRocm91Z2godHJhbnNmb3JtZXIpLnBpcGVUbyhzdHJlYW1zLndyaXRhYmxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRoYXQ9dGhpcztcbiAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIoJy9kaXN0L3NjcmlwdC10cmFuc2Zvcm0td29ya2VyLmpzJyk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdyZWdpc3RlcmVkJykge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjb25zdCBzZW5kZXJUcmFuc2Zvcm0gPSBuZXcgUlRDUnRwU2NyaXB0VHJhbnNmb3JtKHdvcmtlciwgeyBuYW1lOiAnb3V0Z29pbmcnLCBwb3J0OiB0aGF0LnNlbmRlckNoYW5uZWwucG9ydDIgfSwgW3RoYXQuc2VuZGVyQ2hhbm5lbC5wb3J0Ml0pO1xuICAgICAgc2VuZGVyVHJhbnNmb3JtLnBvcnQgPSB0aGF0LnNlbmRlckNoYW5uZWwucG9ydDE7XG4gICAgICBzZW5kZXIudHJhbnNmb3JtID0gc2VuZGVyVHJhbnNmb3JtO1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB3b3JrZXIub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5kYXRhID09PSAnc3RhcnRlZCcpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBzZW5kZXJUcmFuc2Zvcm0ucG9ydC5vbm1lc3NhZ2UgPSBlID0+IHtcbiAgICAgICAgaWYgKGUuZGF0YT09XCJDTEVBUlwiKSB7XG4gICAgICAgICAgdGhhdC5tb2NhcFByZXZEYXRhPXRoYXQubW9jYXBEYXRhO1xuICAgICAgICAgIHRoYXQubW9jYXBEYXRhPVwiXCI7XG4gICAgICAgIH0gICAgICAgXG4gICAgICB9OyBcbiAgIFxuXG4gICAgICAgICAgXG4gICAgICB0aGF0LnNlbmRlckNoYW5uZWwucG9ydDEucG9zdE1lc3NhZ2UoeyB3YXRlcm1hcms6IHRoYXQubW9jYXBEYXRhIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIHJlY3JlYXRlRGVjb2Rlcigpe1xuICAgIHRoaXMuY3JlYXRlRGVjb2Rlcih0aGlzLnJfcmVjZWl2ZXIsdGhpcy5yX2NsaWVudElkKTtcbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZURlY29kZXIocmVjZWl2ZXIsY2xpZW50SWQpIHtcbiAgICBpZiAodGhpcy5pc0Nocm9tZSkge1xuICAgICAgY29uc3Qgc3RyZWFtcyA9IHJlY2VpdmVyLmNyZWF0ZUVuY29kZWRTdHJlYW1zKCk7XG4gICAgICBjb25zdCB0ZXh0RGVjb2RlciA9IG5ldyBUZXh0RGVjb2RlcigpO1xuICAgICAgdmFyIHRoYXQ9dGhpcztcblxuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKHtcbiAgICAgICAgdHJhbnNmb3JtKGNodW5rLCBjb250cm9sbGVyKSB7XG4gICAgICAgICAgY29uc3QgdmlldyA9IG5ldyBEYXRhVmlldyhjaHVuay5kYXRhKTsgIFxuICAgICAgICAgIGNvbnN0IG1hZ2ljRGF0YSA9IG5ldyBVaW50OEFycmF5KGNodW5rLmRhdGEsIGNodW5rLmRhdGEuYnl0ZUxlbmd0aCAtIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCwgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICBsZXQgbWFnaWMgPSBbXTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBtYWdpYy5wdXNoKG1hZ2ljRGF0YVtpXSk7XG5cbiAgICAgICAgICB9XG4gICAgICAgICAgbGV0IG1hZ2ljU3RyaW5nID0gU3RyaW5nLmZyb21DaGFyQ29kZSguLi5tYWdpYyk7XG4gICAgICAgICAgaWYgKG1hZ2ljU3RyaW5nID09PSB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvcikge1xuICAgICAgICAgICAgY29uc3QgbW9jYXBMZW4gPSB2aWV3LmdldFVpbnQzMihjaHVuay5kYXRhLmJ5dGVMZW5ndGggLSAodGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgKyB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpLCBmYWxzZSk7XG4gICAgICAgICAgICBjb25zdCBmcmFtZVNpemUgPSBjaHVuay5kYXRhLmJ5dGVMZW5ndGggLSAobW9jYXBMZW4gKyB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudCArICB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpO1xuICAgICAgICAgICAgY29uc3QgbW9jYXBCdWZmZXIgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLCBmcmFtZVNpemUsIG1vY2FwTGVuKTtcbiAgICAgICAgICAgIGNvbnN0IG1vY2FwID0gdGV4dERlY29kZXIuZGVjb2RlKG1vY2FwQnVmZmVyKSAgICAgICAgXG4gICAgICAgICAgICBpZiAobW9jYXAubGVuZ3RoPjApIHtcbiAgICAgICAgICAgICAgd2luZG93LnJlbW90ZU1vY2FwKG1vY2FwK1wiLFwiK2NsaWVudElkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGZyYW1lID0gY2h1bmsuZGF0YTtcbiAgICAgICAgICAgIGNodW5rLmRhdGEgPSBuZXcgQXJyYXlCdWZmZXIoZnJhbWVTaXplKTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhKTtcbiAgICAgICAgICAgIGRhdGEuc2V0KG5ldyBVaW50OEFycmF5KGZyYW1lLCAwLCBmcmFtZVNpemUpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29udHJvbGxlci5lbnF1ZXVlKGNodW5rKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBzdHJlYW1zLnJlYWRhYmxlLnBpcGVUaHJvdWdoKHRyYW5zZm9ybWVyKS5waXBlVG8oc3RyZWFtcy53cml0YWJsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMucmVjZWl2ZXJDaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsO1xuICAgICAgdmFyIHRoYXQ9dGhpcztcbiAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIoJy9kaXN0L3NjcmlwdC10cmFuc2Zvcm0td29ya2VyLmpzJyk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdyZWdpc3RlcmVkJykge1xuICAgICAgICAgIFxuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIFxuICAgICAgY29uc3QgcmVjZWl2ZXJUcmFuc2Zvcm0gPSBuZXcgUlRDUnRwU2NyaXB0VHJhbnNmb3JtKHdvcmtlciwgeyBuYW1lOiAnaW5jb21pbmcnLCBwb3J0OiB0aGF0LnJlY2VpdmVyQ2hhbm5lbC5wb3J0MiB9LCBbdGhhdC5yZWNlaXZlckNoYW5uZWwucG9ydDJdKTtcblxuICAgICAgcmVjZWl2ZXJUcmFuc2Zvcm0ucG9ydCA9IHRoYXQucmVjZWl2ZXJDaGFubmVsLnBvcnQxO1xuICAgICAgcmVjZWl2ZXIudHJhbnNmb3JtID0gcmVjZWl2ZXJUcmFuc2Zvcm07XG4gICAgICByZWNlaXZlclRyYW5zZm9ybS5wb3J0Lm9ubWVzc2FnZSA9IGUgPT4ge1xuICAgICAgICBpZiAoZS5kYXRhLmxlbmd0aD4wKSB7XG4gICAgICAgICAgd2luZG93LnJlbW90ZU1vY2FwKGUuZGF0YStcIixcIitjbGllbnRJZCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gIFxuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB3b3JrZXIub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5kYXRhID09PSAnc3RhcnRlZCcpIHtcbiAgICAgICAgLy8gIGNvbnNvbGUud2FybihcImluY29taW5nIDVhXCIsY2xpZW50SWQsZXZlbnQuZGF0YSApO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAvLyAgIGNvbnNvbGUud2FybihcImluY29taW5nIDVcIixjbGllbnRJZCxldmVudC5kYXRhICk7XG5cbiAgICAgIH0pO1xuICAgIC8vICBjb25zb2xlLndhcm4oXCJpbmNvbWluZyA2XCIsY2xpZW50SWQgKTtcbiAgICB9XG4gIH0gIFxuICBzZW5kRGF0YShjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgLy8gIGNvbnNvbGUubG9nKFwiQlc3MyBzZW5kRGF0YSBcIiwgY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGEoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIHNlbmREYXRhR3VhcmFudGVlZChjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgLy8gIGNvbnNvbGUubG9nKFwiQlc3MyBzZW5kRGF0YUd1YXJhbnRlZWQgXCIsIGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhV1MoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIGJyb2FkY2FzdERhdGEoZGF0YVR5cGUsIGRhdGEpIHtcbiAgICByZXR1cm4gdGhpcy5icm9hZGNhc3REYXRhR3VhcmFudGVlZChkYXRhVHlwZSwgZGF0YSk7XG4gICAgLypcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYnJvYWRjYXN0RGF0YSBcIiwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHZhciByb29tT2NjdXBhbnRzID0gdGhpcy5lYXN5cnRjLmdldFJvb21PY2N1cGFudHNBc01hcCh0aGlzLnJvb20pO1xuXG4gICAgLy8gSXRlcmF0ZSBvdmVyIHRoZSBrZXlzIG9mIHRoZSBlYXN5cnRjIHJvb20gb2NjdXBhbnRzIG1hcC5cbiAgICAvLyBnZXRSb29tT2NjdXBhbnRzQXNBcnJheSB1c2VzIE9iamVjdC5rZXlzIHdoaWNoIGFsbG9jYXRlcyBtZW1vcnkuXG4gICAgZm9yICh2YXIgcm9vbU9jY3VwYW50IGluIHJvb21PY2N1cGFudHMpIHtcbiAgICAgIGlmIChyb29tT2NjdXBhbnRzW3Jvb21PY2N1cGFudF0gJiYgcm9vbU9jY3VwYW50ICE9PSB0aGlzLmVhc3lydGMubXlFYXN5cnRjaWQpIHtcbiAgICAgICAgLy8gc2VuZCB2aWEgd2VicnRjIG90aGVyd2lzZSBmYWxsYmFjayB0byB3ZWJzb2NrZXRzXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKHJvb21PY2N1cGFudCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJzZW5kRGF0YVwiLGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgICovXG4gIH1cblxuICBicm9hZGNhc3REYXRhR3VhcmFudGVlZChkYXRhVHlwZSwgZGF0YSkge1xuICAgLy8gY29uc29sZS5sb2coXCJCVzczIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIGRlc3RpbmF0aW9uID0geyB0YXJnZXRSb29tOiB0aGlzLnJvb20gfTtcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGFXUyhkZXN0aW5hdGlvbiwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkge1xuICAvLyAgY29uc29sZS5sb2coXCJCVzczIGdldENvbm5lY3RTdGF0dXMgXCIsIGNsaWVudElkKTtcbiAgICB2YXIgc3RhdHVzID0gdGhpcy5lYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpO1xuXG4gICAgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuSVNfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLklTX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuTk9UX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5OT1RfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLkNPTk5FQ1RJTkc7XG4gICAgfVxuICB9XG5cbiAgZ2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbU5hbWUgPSBcImF1ZGlvXCIpIHtcblxuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuICAgIC8vIGlmICggc3RyZWFtTmFtZSA9IFwiYXVkaW9cIikge1xuICAgIC8vc3RyZWFtTmFtZSA9IFwiYm9kX2F1ZGlvXCI7XG4gICAgLy99XG5cbiAgICBpZiAodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdICYmIHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSkge1xuICAgICAgTkFGLmxvZy53cml0ZShgQWxyZWFkeSBoYWQgJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgTkFGLmxvZy53cml0ZShgV2FpdGluZyBvbiAke3N0cmVhbU5hbWV9IGZvciAke2NsaWVudElkfWApO1xuXG4gICAgICAvLyBDcmVhdGUgaW5pdGlhbCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyB3aXRoIGF1ZGlvfHZpZGVvIGFsaWFzXG4gICAgICBpZiAoIXRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuaGFzKGNsaWVudElkKSkge1xuICAgICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHt9O1xuXG4gICAgICAgIGNvbnN0IGF1ZGlvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBBdWRpbyBFcnJvcmAsIGUpKTtcblxuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5wcm9taXNlID0gYXVkaW9Qcm9taXNlO1xuXG4gICAgICAgIGNvbnN0IHZpZGVvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBWaWRlbyBFcnJvcmAsIGUpKTtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucHJvbWlzZSA9IHZpZGVvUHJvbWlzZTtcblxuICAgICAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLnNldChjbGllbnRJZCwgcGVuZGluZ01lZGlhUmVxdWVzdHMpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBzdHJlYW1OYW1lXG4gICAgICBpZiAoIXBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gXCIke3N0cmVhbU5hbWV9XCIgRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnByb21pc2UgPSBzdHJlYW1Qcm9taXNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpW3N0cmVhbU5hbWVdLnByb21pc2U7XG4gICAgfVxuICB9XG5cbiAgc2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7IC8vIHJldHVybiB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm8gZW50cnkgaW4gdGhlIE1hcFxuICAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICAgIGlmIChzdHJlYW1OYW1lID09PSAnZGVmYXVsdCcpIHtcbiAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IGxpa2UgaXQgd2hlbiB5b3UgdXNlIGEgbWl4ZWQgbWVkaWEgc3RyZWFtIHdoZXJlIG9uZSBvZiB0aGUgdHJhY2tzIGlzIGluYWN0aXZlLCBzbyB3ZVxuICAgICAgLy8gc3BsaXQgdGhlIHRyYWNrcyBpbnRvIHR3byBzdHJlYW1zLlxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyBhdWRpbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCBhdWRpb1RyYWNrcyA9IHN0cmVhbS5nZXRBdWRpb1RyYWNrcygpO1xuICAgICAgaWYgKGF1ZGlvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IGF1ZGlvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwiYXVkaW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYXVkaW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIHZpZGVvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IHZpZGVvVHJhY2tzID0gc3RyZWFtLmdldFZpZGVvVHJhY2tzKCk7XG4gICAgICBpZiAodmlkZW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZpZGVvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gdmlkZW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gc2V0TWVkaWFTdHJlYW0gXCJ2aWRlb1wiIGFsaWFzIEVycm9yYCwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSB2aWRlbyBhbGlhcyBpZiBpdCBleGlzdHMuXG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsaWVudE1lZGlhU3RyZWFtc1tzdHJlYW1OYW1lXSA9IHN0cmVhbTtcblxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYnkgU3RyZWFtTmFtZSBpZiBpdCBleGlzdHMuXG4gICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMgJiYgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0ucmVzb2x2ZShzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldEludEJ5dGVzKHgpIHtcbiAgICB2YXIgYnl0ZXMgPSBbXTtcbiAgICB2YXIgaSA9IHRoaXMuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50O1xuICAgIGRvIHtcbiAgICAgIGJ5dGVzWy0taV0gPSB4ICYgKDI1NSk7XG4gICAgICB4ID0geCA+PiA4O1xuICAgIH0gd2hpbGUgKGkpXG4gICAgcmV0dXJuIGJ5dGVzO1xuICB9XG5cbiAgYWRkTG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYWRkTG9jYWxNZWRpYVN0cmVhbSBcIiwgc3RyZWFtLCBzdHJlYW1OYW1lKTtcbiAgICBjb25zdCBlYXN5cnRjID0gdGhpcy5lYXN5cnRjO1xuICAgIHN0cmVhbU5hbWUgPSBzdHJlYW1OYW1lIHx8IHN0cmVhbS5pZDtcbiAgICB0aGlzLnNldE1lZGlhU3RyZWFtKFwibG9jYWxcIiwgc3RyZWFtLCBzdHJlYW1OYW1lKTtcbiAgICBlYXN5cnRjLnJlZ2lzdGVyM3JkUGFydHlMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgc3RyZWFtTmFtZSk7XG5cbiAgICAvLyBBZGQgbG9jYWwgc3RyZWFtIHRvIGV4aXN0aW5nIGNvbm5lY3Rpb25zXG4gICAgT2JqZWN0LmtleXModGhpcy5yZW1vdGVDbGllbnRzKS5mb3JFYWNoKGNsaWVudElkID0+IHtcbiAgICAgIGlmIChlYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpICE9PSBlYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgICAgZWFzeXJ0Yy5hZGRTdHJlYW1Ub0NhbGwoY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHJlbW92ZUxvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbU5hbWUpO1xuICAgIHRoaXMuZWFzeXJ0Yy5jbG9zZUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtTmFtZSk7XG4gICAgZGVsZXRlIHRoaXMubWVkaWFTdHJlYW1zW1wibG9jYWxcIl1bc3RyZWFtTmFtZV07XG4gIH1cblxuICBlbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlTWljcm9waG9uZSBcIiwgZW5hYmxlZCk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCk7XG4gIH1cblxuICBlbmFibGVDYW1lcmEoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBlbmFibGVDYW1lcmEgXCIsIGVuYWJsZWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVDYW1lcmEoZW5hYmxlZCk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBkaXNjb25uZWN0IFwiKTtcbiAgICB0aGlzLmVhc3lydGMuZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlVXNlclB1Ymxpc2hlZCh1c2VyLCBtZWRpYVR5cGUpIHsgfVxuXG4gIGhhbmRsZVVzZXJVbnB1Ymxpc2hlZCh1c2VyLCBtZWRpYVR5cGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclVuUHVibGlzaGVkIFwiKTtcbiAgfVxuXG4gICBnZXRJbnB1dExldmVsKHRyYWNrKSB7XG4gICAgdmFyIGFuYWx5c2VyID0gdHJhY2suX3NvdXJjZS52b2x1bWVMZXZlbEFuYWx5c2VyLmFuYWx5c2VyTm9kZTtcbiAgICAvL3ZhciBhbmFseXNlciA9IHRyYWNrLl9zb3VyY2UuYW5hbHlzZXJOb2RlO1xuICAgIGNvbnN0IGJ1ZmZlckxlbmd0aCA9IGFuYWx5c2VyLmZyZXF1ZW5jeUJpbkNvdW50O1xuICAgIHZhciBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyTGVuZ3RoKTtcbiAgICBhbmFseXNlci5nZXRCeXRlRnJlcXVlbmN5RGF0YShkYXRhKTtcbiAgICB2YXIgdmFsdWVzID0gMDtcbiAgICB2YXIgYXZlcmFnZTtcbiAgICB2YXIgbGVuZ3RoID0gZGF0YS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzICs9IGRhdGFbaV07XG4gICAgfVxuICAgIGF2ZXJhZ2UgPSBNYXRoLmZsb29yKHZhbHVlcyAvIGxlbmd0aCk7XG4gICAgcmV0dXJuIGF2ZXJhZ2U7XG4gIH1cblxuICAgdm9pY2VBY3Rpdml0eURldGVjdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX3ZhZF9hdWRpb1RyYWNrIHx8ICF0aGlzLl92YWRfYXVkaW9UcmFjay5fZW5hYmxlZClcbiAgICAgIHJldHVybjtcblxuICAgIHZhciBhdWRpb0xldmVsID0gdGhpcy5nZXRJbnB1dExldmVsKHRoaXMuX3ZhZF9hdWRpb1RyYWNrKTtcbiAgICBpZiAoYXVkaW9MZXZlbCA8PSB0aGlzLl92YWRfTWF4QmFja2dyb3VuZE5vaXNlTGV2ZWwpIHtcbiAgICAgIGlmICh0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyLmxlbmd0aCA+PSB0aGlzLl92YWRfTWF4QXVkaW9TYW1wbGVzKSB7XG4gICAgICAgIHZhciByZW1vdmVkID0gdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0Fyci5zaGlmdCgpO1xuICAgICAgICB2YXIgcmVtb3ZlZEluZGV4ID0gdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZC5pbmRleE9mKHJlbW92ZWQpO1xuICAgICAgICBpZiAocmVtb3ZlZEluZGV4ID4gLTEpIHtcbiAgICAgICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLnNwbGljZShyZW1vdmVkSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyLnB1c2goYXVkaW9MZXZlbCk7XG4gICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLnB1c2goYXVkaW9MZXZlbCk7XG4gICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgICB9XG4gICAgdmFyIGJhY2tncm91bmQgPSBNYXRoLmZsb29yKDMgKiB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkW01hdGguZmxvb3IodGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZC5sZW5ndGggLyAyKV0gLyAyKTtcbiAgICBpZiAoYXVkaW9MZXZlbCA+IGJhY2tncm91bmQgKyB0aGlzLl92YWRfU2lsZW5jZU9mZmVzZXQpIHtcbiAgICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudCsrO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl92YWRfZXhjZWVkQ291bnQgPSAwO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl92YWRfZXhjZWVkQ291bnQgPiB0aGlzLl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGRMb3cpIHtcbiAgICAgIC8vQWdvcmFSVENVdGlsRXZlbnRzLmVtaXQoXCJWb2ljZUFjdGl2aXR5RGV0ZWN0ZWRGYXN0XCIsIHRoaXMuX3ZhZF9leGNlZWRDb3VudCk7XG4gICAgICB3aW5kb3cuX3N0YXRlX3N0b3BfYXQ9RGF0ZS5ub3coKTtcbiAgICAgLy8gY29uc29sZS5lcnJvcihcIlZBRGwgXCIsRGF0ZS5ub3coKS13aW5kb3cuX3N0YXRlX3N0b3BfYXQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl92YWRfZXhjZWVkQ291bnQgPiB0aGlzLl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGQpIHtcbiAgICAgIC8vQWdvcmFSVENVdGlsRXZlbnRzLmVtaXQoXCJWb2ljZUFjdGl2aXR5RGV0ZWN0ZWRcIiwgdGhpcy5fdmFkX2V4Y2VlZENvdW50KTtcbiAgICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudCA9IDA7XG4gICAgICB3aW5kb3cuX3N0YXRlX3N0b3BfYXQ9RGF0ZS5ub3coKTtcbiAgIC8vICAgY29uc29sZS5lcnJvcihcIlZBRCBcIixEYXRlLm5vdygpLXdpbmRvdy5fc3RhdGVfc3RvcF9hdCk7XG4gICAgfVxuXG4gIH1cblxuICBhc3luYyBjb25uZWN0QWdvcmEoKSB7XG4gICAgLy8gQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHBsYXkgcmVtb3RlIHRyYWNrcyB3aGVuIHJlbW90ZSB1c2VyIHB1Ymxpc2hlcy5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgfHwgdGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcInJ0Y1wiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJoMjY0XCIgfSk7XG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LnNldENsaWVudFJvbGUoXCJob3N0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwiaDI2NFwiIH0pO1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIH1cblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLWpvaW5lZFwiLCBhc3luYyAodXNlcikgPT4ge1xuICAgICAgY29uc29sZS53YXJuKFwidXNlci1qb2luZWRcIiwgdXNlcik7XG4gICAgfSk7XG4gICAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItcHVibGlzaGVkXCIsIGFzeW5jICh1c2VyLCBtZWRpYVR5cGUpID0+IHtcblxuICAgICAgbGV0IGNsaWVudElkID0gdXNlci51aWQ7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZCBcIiArIGNsaWVudElkICsgXCIgXCIgKyBtZWRpYVR5cGUsIHRoYXQuYWdvcmFDbGllbnQpO1xuICAgICAgYXdhaXQgdGhhdC5hZ29yYUNsaWVudC5zdWJzY3JpYmUodXNlciwgbWVkaWFUeXBlKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkMiBcIiArIGNsaWVudElkICsgXCIgXCIgKyB0aGF0LmFnb3JhQ2xpZW50KTtcblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGF0LnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG4gICAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGF0Lm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcblxuICAgICAgICBjb25zdCBhdWRpb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIuYXVkaW9UcmFjayBcIiwgdXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgLy9hdWRpb1N0cmVhbS5hZGRUcmFjayh1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMuYXVkaW8gPSBhdWRpb1N0cmVhbTtcbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgbGV0IHZpZGVvU3RyZWFtID0gbnVsbDtcbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLnZpZGVvVHJhY2sgXCIsIHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIHZpZGVvU3RyZWFtLmFkZFRyYWNrKHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy52aWRlbyA9IHZpZGVvU3RyZWFtO1xuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgICAvL3VzZXIudmlkZW9UcmFja1xuICAgICAgfVxuXG4gICAgICBpZiAoY2xpZW50SWQgPT0gJ0NDQycpIHtcbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidmlkZW8zNjBcIikuc3JjT2JqZWN0PXZpZGVvU3RyZWFtO1xuICAgICAgICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdmlkZW9TdHJlYW0pO1xuICAgICAgICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zZXRBdHRyaWJ1dGUoXCJzcmNcIiwgdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc3JjT2JqZWN0PSB1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2s7XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zcmNPYmplY3QgPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGNsaWVudElkID09ICdEREQnKSB7XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICB1c2VyLnZpZGVvVHJhY2sucGxheShcInZpZGVvMzYwXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICB1c2VyLmF1ZGlvVHJhY2sucGxheSgpO1xuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgICAgbGV0IGVuY19pZD0nbmEnO1xuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICBlbmNfaWQ9dXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrLmlkOyAgICAgICBcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgLy8gZW5jX2lkPXVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjay5pZDtcbiAgICAgIH1cbiAgICBcbiAgICAgIC8vY29uc29sZS53YXJuKG1lZGlhVHlwZSxlbmNfaWQpOyAgICBcbiAgICAgIGNvbnN0IHBjID10aGlzLmFnb3JhQ2xpZW50Ll9wMnBDaGFubmVsLmNvbm5lY3Rpb24ucGVlckNvbm5lY3Rpb247XG4gICAgICBjb25zdCByZWNlaXZlcnMgPSBwYy5nZXRSZWNlaXZlcnMoKTsgIFxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZWNlaXZlcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHJlY2VpdmVyc1tpXS50cmFjayAmJiByZWNlaXZlcnNbaV0udHJhY2suaWQ9PT1lbmNfaWQgKSB7XG4gICAgICAgICAgY29uc29sZS53YXJuKFwiTWF0Y2hcIixtZWRpYVR5cGUsZW5jX2lkKTtcbiAgICAgICAgICB0aGlzLnJfcmVjZWl2ZXI9cmVjZWl2ZXJzW2ldO1xuICAgICAgICAgIHRoaXMucl9jbGllbnRJZD1jbGllbnRJZDtcbiAgICAgICAgICB0aGlzLmNyZWF0ZURlY29kZXIodGhpcy5yX3JlY2VpdmVyLHRoaXMucl9jbGllbnRJZCk7XG4gICAgICB9XG4gICAgfVxuICAgIFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItdW5wdWJsaXNoZWRcIiwgdGhhdC5oYW5kbGVVc2VyVW5wdWJsaXNoZWQpO1xuXG4gICAgY29uc29sZS5sb2coXCJjb25uZWN0IGFnb3JhIFwiKTtcbiAgICAvLyBKb2luIGEgY2hhbm5lbCBhbmQgY3JlYXRlIGxvY2FsIHRyYWNrcy4gQmVzdCBwcmFjdGljZSBpcyB0byB1c2UgUHJvbWlzZS5hbGwgYW5kIHJ1biB0aGVtIGNvbmN1cnJlbnRseS5cbiAgICAvLyBvXG5cblxuICAgIGlmICh0aGlzLmVuYWJsZUF2YXRhcikge1xuICAgICAgdmFyIHN0cmVhbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpLmNhcHR1cmVTdHJlYW0oMzApO1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdIH0pXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCAmJiB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICB2YXIgc3RyZWFtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNfc2VjcmV0XCIpLmNhcHR1cmVTdHJlYW0oMzApO1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDdXN0b21WaWRlb1RyYWNrKHsgbWVkaWFTdHJlYW1UcmFjazogc3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF0gfSldKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLFxuICAgICAgICBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDYW1lcmFWaWRlb1RyYWNrKHsgZW5jb2RlckNvbmZpZzogJzQ4MHBfMicgfSldKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgLy8gSm9pbiB0aGUgY2hhbm5lbC5cbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVDYW1lcmFWaWRlb1RyYWNrKFwiMzYwcF80XCIpXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICBsZXQgYXVkaW9fdHJhY2s7XG4gICAgICBpZiAod2luZG93Lmd1bV9zdHJlYW0pIHsgLy8gYXZvaWQgZG91YmxlIGFsbG93IGlPc1xuICAgICAgICBcbiAgICAgICAgYXVkaW9fdHJhY2s9QWdvcmFSVEMuY3JlYXRlQ3VzdG9tQXVkaW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHdpbmRvdy5ndW1fc3RyZWFtLmdldEF1ZGlvVHJhY2tzKClbMF19KTtcbiAgICAgICAgY29uc29sZS53YXJuKGF1ZGlvX3RyYWNrLFwiYXVkaW9fdHJhY2tcIik7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgYXVkaW9fdHJhY2s9QWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKVxuICAgICAgfVxuICAgICAgXG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgYXVkaW9fdHJhY2tdKTtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhcImNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrXCIpO1xuICAgICAgICB0aGlzLl92YWRfYXVkaW9UcmFjayA9IHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaztcbiAgICAgICAgaWYgKCF0aGlzLl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uSW50ZXJ2YWwpIHtcbiAgICAgICAgICB0aGlzLl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZvaWNlQWN0aXZpdHlEZXRlY3Rpb24oKTtcbiAgICAgICAgICB9LCB0aGlzLl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uRnJlcXVlbmN5KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy51c2VyaWQgPSBhd2FpdCB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCk7XG4gICAgfVxuXG5cbiAgICAvLyBzZWxlY3QgZmFjZXRpbWUgY2FtZXJhIGlmIGV4aXN0c1xuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmICF0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQpIHtcbiAgICAgIGxldCBjYW1zID0gYXdhaXQgQWdvcmFSVEMuZ2V0Q2FtZXJhcygpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjYW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChjYW1zW2ldLmxhYmVsLmluZGV4T2YoXCJGYWNlVGltZVwiKSA9PSAwKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJzZWxlY3QgRmFjZVRpbWUgY2FtZXJhXCIsIGNhbXNbaV0uZGV2aWNlSWQpO1xuICAgICAgICAgIGF3YWl0IHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5zZXREZXZpY2UoY2Ftc1tpXS5kZXZpY2VJZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnNob3dMb2NhbCkge1xuICAgICAgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnBsYXkoXCJsb2NhbC1wbGF5ZXJcIik7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBPTEQgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcwICYmIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaykge1xuICAgICAgY29uc3QgaW1nRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgICAgaW1nRWxlbWVudC5vbmxvYWQgPSBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmICghdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJTRUcgSU5JVCBcIiwgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKTtcbiAgICAgICAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UgPSBhd2FpdCBTZWdQbHVnaW4uaW5qZWN0KHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaywgXCIvYXNzZXRzL3dhc21zMFwiKS5jYXRjaChjb25zb2xlLmVycm9yKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklURURcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlLnNldE9wdGlvbnMoeyBlbmFibGU6IHRydWUsIGJhY2tncm91bmQ6IGltZ0VsZW1lbnQgfSk7XG4gICAgICB9O1xuICAgICAgaW1nRWxlbWVudC5zcmMgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFBUUFBQUFEQ0FJQUFBQTdsam1SQUFBQUQwbEVRVlI0WG1OZytNK0FRRGc1QU9rOUMvVmtvbXpZQUFBQUFFbEZUa1N1UW1DQyc7XG4gICAgfVxuXG4gICAgLy8gRW5hYmxlIHZpcnR1YWwgYmFja2dyb3VuZCBOZXcgTWV0aG9kXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy52YmcgJiYgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKSB7XG5cbiAgICAgIHRoaXMuZXh0ZW5zaW9uID0gbmV3IFZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uKCk7XG4gICAgICBBZ29yYVJUQy5yZWdpc3RlckV4dGVuc2lvbnMoW3RoaXMuZXh0ZW5zaW9uXSk7XG4gICAgICB0aGlzLnByb2Nlc3NvciA9IHRoaXMuZXh0ZW5zaW9uLmNyZWF0ZVByb2Nlc3NvcigpO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3IuaW5pdChcIi9hc3NldHMvd2FzbXNcIik7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGlwZSh0aGlzLnByb2Nlc3NvcikucGlwZSh0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucHJvY2Vzc29yRGVzdGluYXRpb24pO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3Iuc2V0T3B0aW9ucyh7IHR5cGU6ICdjb2xvcicsIGNvbG9yOiBcIiMwMGZmMDBcIiB9KTtcbiAgICAgIGF3YWl0IHRoaXMucHJvY2Vzc29yLmVuYWJsZSgpO1xuICAgIH1cblxuICAgIHdpbmRvdy5sb2NhbFRyYWNrcyA9IHRoaXMubG9jYWxUcmFja3M7XG5cbiAgICAvLyBQdWJsaXNoIHRoZSBsb2NhbCB2aWRlbyBhbmQgYXVkaW8gdHJhY2tzIHRvIHRoZSBjaGFubmVsLlxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvIHx8IHRoaXMuZW5hYmxlQXVkaW8gfHwgdGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgIGlmICh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spXG4gICAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spO1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaylcbiAgICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjayk7XG5cbiAgICAgIGNvbnNvbGUubG9nKFwicHVibGlzaCBzdWNjZXNzXCIpO1xuICAgICAgY29uc3QgcGMgPXRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHNlbmRlcnMgPSBwYy5nZXRTZW5kZXJzKCk7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc2VuZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VuZGVyc1tpXS50cmFjayAmJiAoc2VuZGVyc1tpXS50cmFjay5raW5kID09ICdhdWRpbycpKXsvL30gfHwgc2VuZGVyc1tpXS50cmFjay5raW5kID09ICd2aWRlbycgKSkge1xuICAgICAgICAgIHRoaXMuY3JlYXRlRW5jb2RlcihzZW5kZXJzW2ldKTtcbiAgICAgICAgfVxuICAgICAgfSAgICAgIFxuICAgIH1cblxuICAgIC8vIFJUTVxuXG4gIH1cblxuICAvKipcbiAgICogUHJpdmF0ZXNcbiAgICovXG5cbiAgYXN5bmMgX2Nvbm5lY3QoY29ubmVjdFN1Y2Nlc3MsIGNvbm5lY3RGYWlsdXJlKSB7XG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuICAgIGF3YWl0IHRoYXQuZWFzeXJ0Yy5jb25uZWN0KHRoYXQuYXBwLCBjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpO1xuICB9XG5cbiAgX2dldFJvb21Kb2luVGltZShjbGllbnRJZCkge1xuICAgIHZhciBteVJvb21JZCA9IHRoaXMucm9vbTsgLy9OQUYucm9vbTtcbiAgICB2YXIgam9pblRpbWUgPSB0aGlzLmVhc3lydGMuZ2V0Um9vbU9jY3VwYW50c0FzTWFwKG15Um9vbUlkKVtjbGllbnRJZF0ucm9vbUpvaW5UaW1lO1xuICAgIHJldHVybiBqb2luVGltZTtcbiAgfVxuXG4gIGdldFNlcnZlclRpbWUoKSB7XG4gICAgcmV0dXJuIERhdGUubm93KCkgKyB0aGlzLmF2Z1RpbWVPZmZzZXQ7XG4gIH1cbn1cblxuTkFGLmFkYXB0ZXJzLnJlZ2lzdGVyKFwiYWdvcmFydGNcIiwgQWdvcmFSdGNBZGFwdGVyKTtcblxubW9kdWxlLmV4cG9ydHMgPSBBZ29yYVJ0Y0FkYXB0ZXI7XG4iXSwic291cmNlUm9vdCI6IiJ9