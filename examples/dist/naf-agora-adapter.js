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
    if (mocap == this.mocapData) {
      console.log("blank");
      mocap = "";
    }
    this.mocapData = mocap;
    if (!this.isChrome) {

      if (this.logo++ > 50) {
        //console.warn("send",mocap);
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
          //   console.warn("wahoo in from ",clientId);
          this.logi = 0;
        }
        if (e.data.length > 0) {
          window.remoteMocap(e.data + "," + clientId);
        }
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
    }

    if (this._vad_exceedCount > this._vad_exceedCountThreshold) {
      //AgoraRTCUtilEvents.emit("VoiceActivityDetected", this._vad_exceedCount);
      this._vad_exceedCount = 0;
      window._state_stop_at = Date.now();
      console.error("VAD ", Date.now() - window._state_stop_at);
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
      return;
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

    console.log("connect agora AGORAMOCAP ");
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
      /*
      if (this.localTracks.audioTrack)
        await this.agoraClient.publish(this.localTracks.audioTrack);
      if (this.localTracks.videoTrack)
        await this.agoraClient.publish(this.localTracks.videoTrack);
      */
      console.log("publish success");
      /*
      const pc =this.agoraClient._p2pChannel.connection.peerConnection;
      const senders = pc.getSenders();
      let i = 0;
      for (i = 0; i < senders.length; i++) {
        if (senders[i].track && (senders[i].track.kind == 'audio')){//} || senders[i].track.kind == 'video' )) {
         // this.createEncoder(senders[i]);
         console.log("AGORAMOCAP SKIPs")
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtb2NhcERhdGEiLCJsb2dpIiwibG9nbyIsIm1lZGlhU3RyZWFtcyIsInJlbW90ZUNsaWVudHMiLCJwZW5kaW5nTWVkaWFSZXF1ZXN0cyIsIk1hcCIsImVuYWJsZVZpZGVvIiwiZW5hYmxlVmlkZW9GaWx0ZXJlZCIsImVuYWJsZUF1ZGlvIiwiZW5hYmxlQXZhdGFyIiwibG9jYWxUcmFja3MiLCJ2aWRlb1RyYWNrIiwiYXVkaW9UcmFjayIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJ2YmcwIiwic2hvd0xvY2FsIiwidmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSIsImV4dGVuc2lvbiIsInByb2Nlc3NvciIsInBpcGVQcm9jZXNzb3IiLCJ0cmFjayIsInBpcGUiLCJwcm9jZXNzb3JEZXN0aW5hdGlvbiIsInNlcnZlclRpbWVSZXF1ZXN0cyIsInRpbWVPZmZzZXRzIiwiYXZnVGltZU9mZnNldCIsImFnb3JhQ2xpZW50Iiwic2V0UGVlck9wZW5MaXN0ZW5lciIsImNsaWVudENvbm5lY3Rpb24iLCJnZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkIiwic2V0UGVlckNsb3NlZExpc3RlbmVyIiwiaXNDaHJvbWUiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJpbmRleE9mIiwib2xkUlRDUGVlckNvbm5lY3Rpb24iLCJSVENQZWVyQ29ubmVjdGlvbiIsIlByb3h5IiwiY29uc3RydWN0IiwidGFyZ2V0IiwiYXJncyIsImxlbmd0aCIsInB1c2giLCJlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXMiLCJwYyIsIm9sZFNldENvbmZpZ3VyYXRpb24iLCJwcm90b3R5cGUiLCJzZXRDb25maWd1cmF0aW9uIiwiYXJndW1lbnRzIiwiYXBwbHkiLCJDdXN0b21EYXRhRGV0ZWN0b3IiLCJDdXN0b21EYXRMZW5ndGhCeXRlQ291bnQiLCJzZW5kZXJDaGFubmVsIiwiTWVzc2FnZUNoYW5uZWwiLCJyZWNlaXZlckNoYW5uZWwiLCJyX3JlY2VpdmVyIiwicl9jbGllbnRJZCIsIl92YWRfYXVkaW9UcmFjayIsIl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uRnJlcXVlbmN5IiwiX3ZhZF9NYXhBdWRpb1NhbXBsZXMiLCJfdmFkX01heEJhY2tncm91bmROb2lzZUxldmVsIiwiX3ZhZF9TaWxlbmNlT2ZmZXNldCIsIl92YWRfYXVkaW9TYW1wbGVzQXJyIiwiX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQiLCJfdmFkX2V4Y2VlZENvdW50IiwiX3ZhZF9leGNlZWRDb3VudFRocmVzaG9sZCIsIl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGRMb3ciLCJfdm9pY2VBY3Rpdml0eURldGVjdGlvbkludGVydmFsIiwic2V0U2VydmVyVXJsIiwidXJsIiwic2V0U29ja2V0VXJsIiwic2V0QXBwIiwiYXBwTmFtZSIsInNldFJvb20iLCJqc29uIiwicmVwbGFjZSIsIm9iaiIsIkpTT04iLCJwYXJzZSIsIm5hbWUiLCJBZ29yYVJUQyIsImxvYWRNb2R1bGUiLCJTZWdQbHVnaW4iLCJqb2luUm9vbSIsInNldFdlYlJ0Y09wdGlvbnMiLCJvcHRpb25zIiwiZW5hYmxlRGF0YUNoYW5uZWxzIiwiZGF0YWNoYW5uZWwiLCJ2aWRlbyIsImF1ZGlvIiwiZW5hYmxlVmlkZW9SZWNlaXZlIiwiZW5hYmxlQXVkaW9SZWNlaXZlIiwic2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyIsInN1Y2Nlc3NMaXN0ZW5lciIsImZhaWx1cmVMaXN0ZW5lciIsImNvbm5lY3RTdWNjZXNzIiwiY29ubmVjdEZhaWx1cmUiLCJzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciIsIm9jY3VwYW50TGlzdGVuZXIiLCJyb29tTmFtZSIsIm9jY3VwYW50cyIsInByaW1hcnkiLCJzZXREYXRhQ2hhbm5lbExpc3RlbmVycyIsIm9wZW5MaXN0ZW5lciIsImNsb3NlZExpc3RlbmVyIiwibWVzc2FnZUxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIiLCJzZXRQZWVyTGlzdGVuZXIiLCJ1cGRhdGVUaW1lT2Zmc2V0IiwiY2xpZW50U2VudFRpbWUiLCJEYXRlIiwibm93IiwiZmV0Y2giLCJkb2N1bWVudCIsImxvY2F0aW9uIiwiaHJlZiIsIm1ldGhvZCIsImNhY2hlIiwidGhlbiIsInJlcyIsInByZWNpc2lvbiIsInNlcnZlclJlY2VpdmVkVGltZSIsImhlYWRlcnMiLCJnZXQiLCJnZXRUaW1lIiwiY2xpZW50UmVjZWl2ZWRUaW1lIiwic2VydmVyVGltZSIsInRpbWVPZmZzZXQiLCJyZWR1Y2UiLCJhY2MiLCJvZmZzZXQiLCJzZXRUaW1lb3V0IiwiY29ubmVjdCIsIlByb21pc2UiLCJhbGwiLCJyZXNvbHZlIiwicmVqZWN0IiwiX2Nvbm5lY3QiLCJfIiwiX215Um9vbUpvaW5UaW1lIiwiX2dldFJvb21Kb2luVGltZSIsImNvbm5lY3RBZ29yYSIsImNhdGNoIiwic2hvdWxkU3RhcnRDb25uZWN0aW9uVG8iLCJjbGllbnQiLCJyb29tSm9pblRpbWUiLCJzdGFydFN0cmVhbUNvbm5lY3Rpb24iLCJjYWxsIiwiY2FsbGVyIiwibWVkaWEiLCJOQUYiLCJ3cml0ZSIsImVycm9yQ29kZSIsImVycm9yVGV4dCIsImVycm9yIiwid2FzQWNjZXB0ZWQiLCJjbG9zZVN0cmVhbUNvbm5lY3Rpb24iLCJoYW5ndXAiLCJzZW5kTW9jYXAiLCJtb2NhcCIsInBvcnQxIiwicG9zdE1lc3NhZ2UiLCJ3YXRlcm1hcmsiLCJjcmVhdGVFbmNvZGVyIiwic2VuZGVyIiwic3RyZWFtcyIsImNyZWF0ZUVuY29kZWRTdHJlYW1zIiwidGV4dEVuY29kZXIiLCJUZXh0RW5jb2RlciIsInRoYXQiLCJ0cmFuc2Zvcm1lciIsIlRyYW5zZm9ybVN0cmVhbSIsInRyYW5zZm9ybSIsImNodW5rIiwiY29udHJvbGxlciIsImVuY29kZSIsImZyYW1lIiwiZGF0YSIsIlVpbnQ4QXJyYXkiLCJieXRlTGVuZ3RoIiwic2V0IiwiYnl0ZXMiLCJnZXRJbnRCeXRlcyIsImkiLCJtYWdpY0luZGV4IiwiY2hhckNvZGVBdCIsImJ1ZmZlciIsImVucXVldWUiLCJyZWFkYWJsZSIsInBpcGVUaHJvdWdoIiwicGlwZVRvIiwid3JpdGFibGUiLCJ3b3JrZXIiLCJXb3JrZXIiLCJvbm1lc3NhZ2UiLCJldmVudCIsInNlbmRlclRyYW5zZm9ybSIsIlJUQ1J0cFNjcmlwdFRyYW5zZm9ybSIsInBvcnQiLCJwb3J0MiIsInJlY3JlYXRlRGVjb2RlciIsImNyZWF0ZURlY29kZXIiLCJyZWNlaXZlciIsInRleHREZWNvZGVyIiwiVGV4dERlY29kZXIiLCJ2aWV3IiwiRGF0YVZpZXciLCJtYWdpY0RhdGEiLCJtYWdpYyIsIm1hZ2ljU3RyaW5nIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwibW9jYXBMZW4iLCJnZXRVaW50MzIiLCJmcmFtZVNpemUiLCJtb2NhcEJ1ZmZlciIsImRlY29kZSIsInJlbW90ZU1vY2FwIiwiQXJyYXlCdWZmZXIiLCJ3YXJuIiwicmVjZWl2ZXJUcmFuc2Zvcm0iLCJlIiwic2VuZERhdGEiLCJkYXRhVHlwZSIsInNlbmREYXRhR3VhcmFudGVlZCIsInNlbmREYXRhV1MiLCJicm9hZGNhc3REYXRhIiwicm9vbU9jY3VwYW50cyIsImdldFJvb21PY2N1cGFudHNBc01hcCIsInJvb21PY2N1cGFudCIsIm15RWFzeXJ0Y2lkIiwiYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQiLCJkZXN0aW5hdGlvbiIsInRhcmdldFJvb20iLCJnZXRDb25uZWN0U3RhdHVzIiwic3RhdHVzIiwiSVNfQ09OTkVDVEVEIiwiYWRhcHRlcnMiLCJOT1RfQ09OTkVDVEVEIiwiQ09OTkVDVElORyIsImdldE1lZGlhU3RyZWFtIiwic3RyZWFtTmFtZSIsImhhcyIsImF1ZGlvUHJvbWlzZSIsInByb21pc2UiLCJ2aWRlb1Byb21pc2UiLCJzdHJlYW1Qcm9taXNlIiwic2V0TWVkaWFTdHJlYW0iLCJzdHJlYW0iLCJjbGllbnRNZWRpYVN0cmVhbXMiLCJhdWRpb1RyYWNrcyIsImdldEF1ZGlvVHJhY2tzIiwiYXVkaW9TdHJlYW0iLCJNZWRpYVN0cmVhbSIsImZvckVhY2giLCJhZGRUcmFjayIsInZpZGVvVHJhY2tzIiwiZ2V0VmlkZW9UcmFja3MiLCJ2aWRlb1N0cmVhbSIsIngiLCJhZGRMb2NhbE1lZGlhU3RyZWFtIiwiaWQiLCJyZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbSIsIk9iamVjdCIsImtleXMiLCJhZGRTdHJlYW1Ub0NhbGwiLCJyZW1vdmVMb2NhbE1lZGlhU3RyZWFtIiwiY2xvc2VMb2NhbE1lZGlhU3RyZWFtIiwiZW5hYmxlTWljcm9waG9uZSIsImVuYWJsZWQiLCJlbmFibGVDYW1lcmEiLCJkaXNjb25uZWN0IiwiaGFuZGxlVXNlclB1Ymxpc2hlZCIsInVzZXIiLCJtZWRpYVR5cGUiLCJoYW5kbGVVc2VyVW5wdWJsaXNoZWQiLCJnZXRJbnB1dExldmVsIiwiYW5hbHlzZXIiLCJfc291cmNlIiwidm9sdW1lTGV2ZWxBbmFseXNlciIsImFuYWx5c2VyTm9kZSIsImJ1ZmZlckxlbmd0aCIsImZyZXF1ZW5jeUJpbkNvdW50IiwiZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEiLCJ2YWx1ZXMiLCJhdmVyYWdlIiwiTWF0aCIsImZsb29yIiwidm9pY2VBY3Rpdml0eURldGVjdGlvbiIsIl9lbmFibGVkIiwiYXVkaW9MZXZlbCIsInJlbW92ZWQiLCJzaGlmdCIsInJlbW92ZWRJbmRleCIsInNwbGljZSIsInNvcnQiLCJhIiwiYiIsImJhY2tncm91bmQiLCJfc3RhdGVfc3RvcF9hdCIsImNyZWF0ZUNsaWVudCIsIm1vZGUiLCJjb2RlYyIsInNldENsaWVudFJvbGUiLCJvbiIsInN1YnNjcmliZSIsInBsYXkiLCJfbWVkaWFTdHJlYW1UcmFjayIsInF1ZXJ5U2VsZWN0b3IiLCJzcmNPYmplY3QiLCJlbmNfaWQiLCJfcDJwQ2hhbm5lbCIsImNvbm5lY3Rpb24iLCJwZWVyQ29ubmVjdGlvbiIsInJlY2VpdmVycyIsImdldFJlY2VpdmVycyIsImdldEVsZW1lbnRCeUlkIiwiY2FwdHVyZVN0cmVhbSIsImpvaW4iLCJjcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjayIsImNyZWF0ZUN1c3RvbVZpZGVvVHJhY2siLCJtZWRpYVN0cmVhbVRyYWNrIiwiY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayIsImVuY29kZXJDb25maWciLCJzZXRJbnRlcnZhbCIsImNhbXMiLCJnZXRDYW1lcmFzIiwibGFiZWwiLCJkZXZpY2VJZCIsInNldERldmljZSIsImltZ0VsZW1lbnQiLCJjcmVhdGVFbGVtZW50Iiwib25sb2FkIiwiaW5qZWN0Iiwic2V0T3B0aW9ucyIsImVuYWJsZSIsInNyYyIsIlZpcnR1YWxCYWNrZ3JvdW5kRXh0ZW5zaW9uIiwicmVnaXN0ZXJFeHRlbnNpb25zIiwiY3JlYXRlUHJvY2Vzc29yIiwiaW5pdCIsInR5cGUiLCJjb2xvciIsIm15Um9vbUlkIiwiam9pblRpbWUiLCJnZXRTZXJ2ZXJUaW1lIiwicmVnaXN0ZXIiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7OztRQUdBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSwwQ0FBMEMsZ0NBQWdDO1FBQzFFO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0Esd0RBQXdELGtCQUFrQjtRQUMxRTtRQUNBLGlEQUFpRCxjQUFjO1FBQy9EOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQSx5Q0FBeUMsaUNBQWlDO1FBQzFFLGdIQUFnSCxtQkFBbUIsRUFB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QUFqRCxFQUErRDtBQUM3RDs7Ozs7O0FBTUFqQixjQUFRQyxHQUFSLENBQVksaUJBQVo7QUFDQTs7Ozs7Ozs7Ozs7QUFXRDs7QUFFRDtBQUVEOztBQUVEOzs7O0FBSUEsUUFBTW9KLFFBQU4sQ0FBZTNDLGNBQWYsRUFBK0JDLGNBQS9CLEVBQStDO0FBQzdDLFFBQUkwRSxPQUFPLElBQVg7QUFDQSxVQUFNQSxLQUFLdEwsT0FBTCxDQUFhaUosT0FBYixDQUFxQnFDLEtBQUtsTCxHQUExQixFQUErQnVHLGNBQS9CLEVBQStDQyxjQUEvQyxDQUFOO0FBQ0Q7O0FBRUQ2QyxtQkFBaUJsSSxRQUFqQixFQUEyQjtBQUN6QixRQUFJNlUsV0FBVyxLQUFLL1YsSUFBcEIsQ0FEeUIsQ0FDQztBQUMxQixRQUFJZ1csV0FBVyxLQUFLclcsT0FBTCxDQUFhaVAscUJBQWIsQ0FBbUNtSCxRQUFuQyxFQUE2QzdVLFFBQTdDLEVBQXVEdUksWUFBdEU7QUFDQSxXQUFPdU0sUUFBUDtBQUNEOztBQUVEQyxrQkFBZ0I7QUFDZCxXQUFPM08sS0FBS0MsR0FBTCxLQUFhLEtBQUt2RixhQUF6QjtBQUNEO0FBeDFCbUI7O0FBMjFCdEI4SCxJQUFJdUYsUUFBSixDQUFhNkcsUUFBYixDQUFzQixVQUF0QixFQUFrQ3pXLGVBQWxDOztBQUVBMFcsT0FBT0MsT0FBUCxHQUFpQjNXLGVBQWpCLEMiLCJmaWxlIjoibmFmLWFnb3JhLWFkYXB0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL3NyYy9pbmRleC5qc1wiKTtcbiIsImNsYXNzIEFnb3JhUnRjQWRhcHRlciB7XG5cbiAgY29uc3RydWN0b3IoZWFzeXJ0Yykge1xuICAgIFxuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25zdHJ1Y3RvciBcIiwgZWFzeXJ0Yyk7XG5cbiAgICB0aGlzLmVhc3lydGMgPSBlYXN5cnRjIHx8IHdpbmRvdy5lYXN5cnRjO1xuICAgIHRoaXMuYXBwID0gXCJkZWZhdWx0XCI7XG4gICAgdGhpcy5yb29tID0gXCJkZWZhdWx0XCI7XG4gICAgdGhpcy51c2VyaWQgPSAwO1xuICAgIHRoaXMuYXBwaWQgPSBudWxsO1xuICAgIHRoaXMubW9jYXBEYXRhPVwiXCI7XG4gICAgdGhpcy5sb2dpPTA7XG4gICAgdGhpcy5sb2dvPTA7XG4gICAgdGhpcy5tZWRpYVN0cmVhbXMgPSB7fTtcbiAgICB0aGlzLnJlbW90ZUNsaWVudHMgPSB7fTtcbiAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzID0gbmV3IE1hcCgpO1xuXG4gICAgdGhpcy5lbmFibGVWaWRlbyA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCA9IGZhbHNlO1xuICAgIHRoaXMuZW5hYmxlQXVkaW8gPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZUF2YXRhciA9IGZhbHNlO1xuXG4gICAgdGhpcy5sb2NhbFRyYWNrcyA9IHsgdmlkZW9UcmFjazogbnVsbCwgYXVkaW9UcmFjazogbnVsbCB9O1xuICAgIHdpbmRvdy5sb2NhbFRyYWNrcyA9IHRoaXMubG9jYWxUcmFja3M7XG4gICAgdGhpcy50b2tlbiA9IG51bGw7XG4gICAgdGhpcy5jbGllbnRJZCA9IG51bGw7XG4gICAgdGhpcy51aWQgPSBudWxsO1xuICAgIHRoaXMudmJnID0gZmFsc2U7XG4gICAgdGhpcy52YmcwID0gZmFsc2U7XG4gICAgdGhpcy5zaG93TG9jYWwgPSBmYWxzZTtcbiAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UgPSBudWxsO1xuICAgIHRoaXMuZXh0ZW5zaW9uID0gbnVsbDtcbiAgICB0aGlzLnByb2Nlc3NvciA9IG51bGw7XG4gICAgdGhpcy5waXBlUHJvY2Vzc29yID0gKHRyYWNrLCBwcm9jZXNzb3IpID0+IHtcbiAgICAgIHRyYWNrLnBpcGUocHJvY2Vzc29yKS5waXBlKHRyYWNrLnByb2Nlc3NvckRlc3RpbmF0aW9uKTtcbiAgICB9XG5cbiAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA9IDA7XG4gICAgdGhpcy50aW1lT2Zmc2V0cyA9IFtdO1xuICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IDA7XG4gICAgdGhpcy5hZ29yYUNsaWVudCA9IG51bGw7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlck9wZW5MaXN0ZW5lcihjbGllbnRJZCA9PiB7XG4gICAgICBjb25zdCBjbGllbnRDb25uZWN0aW9uID0gdGhpcy5lYXN5cnRjLmdldFBlZXJDb25uZWN0aW9uQnlVc2VySWQoY2xpZW50SWQpO1xuICAgICAgdGhpcy5yZW1vdGVDbGllbnRzW2NsaWVudElkXSA9IGNsaWVudENvbm5lY3Rpb247XG4gICAgfSk7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0UGVlckNsb3NlZExpc3RlbmVyKGNsaWVudElkID0+IHtcbiAgICAgIGRlbGV0ZSB0aGlzLnJlbW90ZUNsaWVudHNbY2xpZW50SWRdO1xuICAgIH0pO1xuXG4gICAgdGhpcy5pc0Nocm9tZSA9IChuYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ0ZpcmVmb3gnKSA9PT0gLTEgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdDaHJvbWUnKSA+IC0xKTtcblxuICAgIGlmICh0aGlzLmlzQ2hyb21lKSB7XG4gICAgICB3aW5kb3cub2xkUlRDUGVlckNvbm5lY3Rpb24gPSBSVENQZWVyQ29ubmVjdGlvbjtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbiA9IG5ldyBQcm94eSh3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24sIHtcbiAgICAgICAgY29uc3RydWN0OiBmdW5jdGlvbiAodGFyZ2V0LCBhcmdzKSB7XG4gICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgYXJnc1swXVtcImVuY29kZWRJbnNlcnRhYmxlU3RyZWFtc1wiXSA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaCh7IGVuY29kZWRJbnNlcnRhYmxlU3RyZWFtczogdHJ1ZSB9KTtcbiAgICAgICAgICB9XG4gICAgICBcbiAgICAgICAgICBjb25zdCBwYyA9IG5ldyB3aW5kb3cub2xkUlRDUGVlckNvbm5lY3Rpb24oLi4uYXJncyk7XG4gICAgICAgICAgcmV0dXJuIHBjO1xuICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgICBjb25zdCBvbGRTZXRDb25maWd1cmF0aW9uID0gd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRDb25maWd1cmF0aW9uO1xuICAgICAgd2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLnByb3RvdHlwZS5zZXRDb25maWd1cmF0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBjb25zdCBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICBpZiAoYXJncy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgYXJnc1swXVtcImVuY29kZWRJbnNlcnRhYmxlU3RyZWFtc1wiXSA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYXJncy5wdXNoKHsgZW5jb2RlZEluc2VydGFibGVTdHJlYW1zOiB0cnVlIH0pO1xuICAgICAgICB9XG4gICAgICBcbiAgICAgICAgb2xkU2V0Q29uZmlndXJhdGlvbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgIH07XG4gICAgfVxuICAgIFxuICAgIC8vIGN1c3RvbSBkYXRhIGFwcGVuZCBwYXJhbXNcbiAgICB0aGlzLkN1c3RvbURhdGFEZXRlY3RvciA9ICdBR09SQU1PQ0FQJztcbiAgICB0aGlzLkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudCA9IDQ7XG4gICAgdGhpcy5zZW5kZXJDaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsO1xuICAgIHRoaXMucmVjZWl2ZXJDaGFubmVsO1xuICAgIHRoaXMucl9yZWNlaXZlcj1udWxsO1xuICAgIHRoaXMucl9jbGllbnRJZD1udWxsO1xuXG4gICAgdGhpcy5fdmFkX2F1ZGlvVHJhY2sgPSBudWxsO1xuICAgIHRoaXMuX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25GcmVxdWVuY3kgPSAxNTA7XG4gIFxuICAgIHRoaXMuX3ZhZF9NYXhBdWRpb1NhbXBsZXMgPSA0MDA7XG4gICAgdGhpcy5fdmFkX01heEJhY2tncm91bmROb2lzZUxldmVsID0gMzA7XG4gICAgdGhpcy5fdmFkX1NpbGVuY2VPZmZlc2V0ID0gMTA7XG4gICAgdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyciA9IFtdO1xuICAgIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQgPSBbXTtcbiAgICB0aGlzLl92YWRfZXhjZWVkQ291bnQgPSAwO1xuICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudFRocmVzaG9sZCA9IDI7XG4gICAgdGhpcy5fdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkTG93ID0gMTtcbiAgICB0aGlzLl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uSW50ZXJ2YWw7XG5cblxuICAgIFxuICAgIHdpbmRvdy5BZ29yYVJ0Y0FkYXB0ZXI9dGhpcztcbiAgICBcbiAgfVxuXG4gIHNldFNlcnZlclVybCh1cmwpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0U2VydmVyVXJsIFwiLCB1cmwpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXRTb2NrZXRVcmwodXJsKTtcbiAgfVxuXG4gIHNldEFwcChhcHBOYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldEFwcCBcIiwgYXBwTmFtZSk7XG4gICAgdGhpcy5hcHAgPSBhcHBOYW1lO1xuICAgIHRoaXMuYXBwaWQgPSBhcHBOYW1lO1xuICB9XG5cbiAgYXN5bmMgc2V0Um9vbShqc29uKSB7XG4gICAganNvbiA9IGpzb24ucmVwbGFjZSgvJy9nLCAnXCInKTtcbiAgICBjb25zdCBvYmogPSBKU09OLnBhcnNlKGpzb24pO1xuICAgIHRoaXMucm9vbSA9IG9iai5uYW1lO1xuXG4gICAgaWYgKG9iai52YmcgJiYgb2JqLnZiZz09J3RydWUnICkgeyAgICAgIFxuICAgICAgdGhpcy52YmcgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmoudmJnMCAmJiBvYmoudmJnMD09J3RydWUnICkge1xuICAgICAgdGhpcy52YmcwID0gdHJ1ZTtcbiAgICAgIEFnb3JhUlRDLmxvYWRNb2R1bGUoU2VnUGx1Z2luLCB7fSk7XG4gICAgfVxuXG4gICAgaWYgKG9iai5lbmFibGVBdmF0YXIgJiYgb2JqLmVuYWJsZUF2YXRhcj09J3RydWUnICkge1xuICAgICAgdGhpcy5lbmFibGVBdmF0YXIgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmIChvYmouc2hvd0xvY2FsICAmJiBvYmouc2hvd0xvY2FsPT0ndHJ1ZScpIHtcbiAgICAgIHRoaXMuc2hvd0xvY2FsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAob2JqLmVuYWJsZVZpZGVvRmlsdGVyZWQgJiYgb2JqLmVuYWJsZVZpZGVvRmlsdGVyZWQ9PSd0cnVlJyApIHtcbiAgICAgIHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCA9IHRydWU7XG4gICAgfVxuICAgIHRoaXMuZWFzeXJ0Yy5qb2luUm9vbSh0aGlzLnJvb20sIG51bGwpO1xuICB9XG5cbiAgLy8gb3B0aW9uczogeyBkYXRhY2hhbm5lbDogYm9vbCwgYXVkaW86IGJvb2wsIHZpZGVvOiBib29sIH1cbiAgc2V0V2ViUnRjT3B0aW9ucyhvcHRpb25zKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFdlYlJ0Y09wdGlvbnMgXCIsIG9wdGlvbnMpO1xuICAgIC8vIHRoaXMuZWFzeXJ0Yy5lbmFibGVEZWJ1Zyh0cnVlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlRGF0YUNoYW5uZWxzKG9wdGlvbnMuZGF0YWNoYW5uZWwpO1xuXG4gICAgLy8gdXNpbmcgQWdvcmFcbiAgICB0aGlzLmVuYWJsZVZpZGVvID0gb3B0aW9ucy52aWRlbztcbiAgICB0aGlzLmVuYWJsZUF1ZGlvID0gb3B0aW9ucy5hdWRpbztcblxuICAgIC8vIG5vdCBlYXN5cnRjXG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZVZpZGVvKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQXVkaW8oZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVWaWRlb1JlY2VpdmUoZmFsc2UpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVBdWRpb1JlY2VpdmUoZmFsc2UpO1xuICB9XG5cbiAgc2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyhzdWNjZXNzTGlzdGVuZXIsIGZhaWx1cmVMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRTZXJ2ZXJDb25uZWN0TGlzdGVuZXJzIFwiLCBzdWNjZXNzTGlzdGVuZXIsIGZhaWx1cmVMaXN0ZW5lcik7XG4gICAgdGhpcy5jb25uZWN0U3VjY2VzcyA9IHN1Y2Nlc3NMaXN0ZW5lcjtcbiAgICB0aGlzLmNvbm5lY3RGYWlsdXJlID0gZmFpbHVyZUxpc3RlbmVyO1xuICB9XG5cbiAgc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIob2NjdXBhbnRMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciBcIiwgb2NjdXBhbnRMaXN0ZW5lcik7XG5cbiAgICB0aGlzLmVhc3lydGMuc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIoZnVuY3Rpb24gKHJvb21OYW1lLCBvY2N1cGFudHMsIHByaW1hcnkpIHtcbiAgICAgIG9jY3VwYW50TGlzdGVuZXIob2NjdXBhbnRzKTtcbiAgICB9KTtcbiAgfVxuXG4gIHNldERhdGFDaGFubmVsTGlzdGVuZXJzKG9wZW5MaXN0ZW5lciwgY2xvc2VkTGlzdGVuZXIsIG1lc3NhZ2VMaXN0ZW5lcikge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXREYXRhQ2hhbm5lbExpc3RlbmVycyAgXCIsIG9wZW5MaXN0ZW5lciwgY2xvc2VkTGlzdGVuZXIsIG1lc3NhZ2VMaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldERhdGFDaGFubmVsT3Blbkxpc3RlbmVyKG9wZW5MaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldERhdGFDaGFubmVsQ2xvc2VMaXN0ZW5lcihjbG9zZWRMaXN0ZW5lcik7XG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJMaXN0ZW5lcihtZXNzYWdlTGlzdGVuZXIpO1xuICB9XG5cbiAgdXBkYXRlVGltZU9mZnNldCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgdXBkYXRlVGltZU9mZnNldCBcIik7XG4gICAgY29uc3QgY2xpZW50U2VudFRpbWUgPSBEYXRlLm5vdygpICsgdGhpcy5hdmdUaW1lT2Zmc2V0O1xuXG4gICAgcmV0dXJuIGZldGNoKGRvY3VtZW50LmxvY2F0aW9uLmhyZWYsIHsgbWV0aG9kOiBcIkhFQURcIiwgY2FjaGU6IFwibm8tY2FjaGVcIiB9KS50aGVuKHJlcyA9PiB7XG4gICAgICB2YXIgcHJlY2lzaW9uID0gMTAwMDtcbiAgICAgIHZhciBzZXJ2ZXJSZWNlaXZlZFRpbWUgPSBuZXcgRGF0ZShyZXMuaGVhZGVycy5nZXQoXCJEYXRlXCIpKS5nZXRUaW1lKCkgKyBwcmVjaXNpb24gLyAyO1xuICAgICAgdmFyIGNsaWVudFJlY2VpdmVkVGltZSA9IERhdGUubm93KCk7XG4gICAgICB2YXIgc2VydmVyVGltZSA9IHNlcnZlclJlY2VpdmVkVGltZSArIChjbGllbnRSZWNlaXZlZFRpbWUgLSBjbGllbnRTZW50VGltZSkgLyAyO1xuICAgICAgdmFyIHRpbWVPZmZzZXQgPSBzZXJ2ZXJUaW1lIC0gY2xpZW50UmVjZWl2ZWRUaW1lO1xuXG4gICAgICB0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cysrO1xuXG4gICAgICBpZiAodGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPD0gMTApIHtcbiAgICAgICAgdGhpcy50aW1lT2Zmc2V0cy5wdXNoKHRpbWVPZmZzZXQpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50aW1lT2Zmc2V0c1t0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyAlIDEwXSA9IHRpbWVPZmZzZXQ7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuYXZnVGltZU9mZnNldCA9IHRoaXMudGltZU9mZnNldHMucmVkdWNlKChhY2MsIG9mZnNldCkgPT4gYWNjICs9IG9mZnNldCwgMCkgLyB0aGlzLnRpbWVPZmZzZXRzLmxlbmd0aDtcblxuICAgICAgaWYgKHRoaXMuc2VydmVyVGltZVJlcXVlc3RzID4gMTApIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLnVwZGF0ZVRpbWVPZmZzZXQoKSwgNSAqIDYwICogMTAwMCk7IC8vIFN5bmMgY2xvY2sgZXZlcnkgNSBtaW51dGVzLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb25uZWN0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25uZWN0IFwiKTtcbiAgICBQcm9taXNlLmFsbChbdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHRoaXMuX2Nvbm5lY3QocmVzb2x2ZSwgcmVqZWN0KTtcbiAgICB9KV0pLnRoZW4oKFtfLCBjbGllbnRJZF0pID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBjb25uZWN0ZWQgXCIgKyBjbGllbnRJZCk7XG4gICAgICB0aGlzLmNsaWVudElkID0gY2xpZW50SWQ7XG4gICAgICB0aGlzLl9teVJvb21Kb2luVGltZSA9IHRoaXMuX2dldFJvb21Kb2luVGltZShjbGllbnRJZCk7XG4gICAgICB0aGlzLmNvbm5lY3RBZ29yYSgpO1xuICAgICAgdGhpcy5jb25uZWN0U3VjY2VzcyhjbGllbnRJZCk7XG4gICAgfSkuY2F0Y2godGhpcy5jb25uZWN0RmFpbHVyZSk7XG4gIH1cblxuICBzaG91bGRTdGFydENvbm5lY3Rpb25UbyhjbGllbnQpIHtcbiAgICByZXR1cm4gdGhpcy5fbXlSb29tSm9pblRpbWUgPD0gY2xpZW50LnJvb21Kb2luVGltZTtcbiAgfVxuXG4gIHN0YXJ0U3RyZWFtQ29ubmVjdGlvbihjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzdGFydFN0cmVhbUNvbm5lY3Rpb24gXCIsIGNsaWVudElkKTtcbiAgICB0aGlzLmVhc3lydGMuY2FsbChjbGllbnRJZCwgZnVuY3Rpb24gKGNhbGxlciwgbWVkaWEpIHtcbiAgICAgIGlmIChtZWRpYSA9PT0gXCJkYXRhY2hhbm5lbFwiKSB7XG4gICAgICAgIE5BRi5sb2cud3JpdGUoXCJTdWNjZXNzZnVsbHkgc3RhcnRlZCBkYXRhY2hhbm5lbCB0byBcIiwgY2FsbGVyKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbiAoZXJyb3JDb2RlLCBlcnJvclRleHQpIHtcbiAgICAgIE5BRi5sb2cuZXJyb3IoZXJyb3JDb2RlLCBlcnJvclRleHQpO1xuICAgIH0sIGZ1bmN0aW9uICh3YXNBY2NlcHRlZCkge1xuICAgICAgLy8gY29uc29sZS5sb2coXCJ3YXMgYWNjZXB0ZWQ9XCIgKyB3YXNBY2NlcHRlZCk7XG4gICAgfSk7XG4gIH1cblxuICBjbG9zZVN0cmVhbUNvbm5lY3Rpb24oY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY2xvc2VTdHJlYW1Db25uZWN0aW9uIFwiLCBjbGllbnRJZCk7XG4gICAgdGhpcy5lYXN5cnRjLmhhbmd1cChjbGllbnRJZCk7XG4gIH1cblxuICBzZW5kTW9jYXAobW9jYXApIHtcbiAgICBpZiAobW9jYXA9PXRoaXMubW9jYXBEYXRhKXtcbiAgICAgIGNvbnNvbGUubG9nKFwiYmxhbmtcIik7XG4gICAgICBtb2NhcD1cIlwiO1xuICAgIH1cbiAgICB0aGlzLm1vY2FwRGF0YT1tb2NhcDtcbiAgICBpZiAoIXRoaXMuaXNDaHJvbWUpIHtcblxuICAgICAgaWYgKHRoaXMubG9nbysrPjUwKSB7XG4gICAgICAgIC8vY29uc29sZS53YXJuKFwic2VuZFwiLG1vY2FwKTtcbiAgICAgICAgdGhpcy5sb2dvPTA7XG4gICAgICB9XG4gICAgICB0aGlzLnNlbmRlckNoYW5uZWwucG9ydDEucG9zdE1lc3NhZ2UoeyB3YXRlcm1hcms6IG1vY2FwIH0pO1xuICAgIH1cbiAgfVxuXG4gIGFzeW5jIGNyZWF0ZUVuY29kZXIoc2VuZGVyKSB7XG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIGNvbnN0IHN0cmVhbXMgPSBzZW5kZXIuY3JlYXRlRW5jb2RlZFN0cmVhbXMoKTtcbiAgICAgIGNvbnN0IHRleHRFbmNvZGVyID0gbmV3IFRleHRFbmNvZGVyKCk7XG4gICAgICB2YXIgdGhhdD10aGlzO1xuICAgICAgY29uc3QgdHJhbnNmb3JtZXIgPSBuZXcgVHJhbnNmb3JtU3RyZWFtKHtcbiAgICAgICAgdHJhbnNmb3JtKGNodW5rLCBjb250cm9sbGVyKSB7XG4gICAgICAgICAgY29uc3QgbW9jYXAgPSB0ZXh0RW5jb2Rlci5lbmNvZGUodGhhdC5tb2NhcERhdGEpO1xuICAgICAgICAgIHRoYXQubW9jYXBEYXRhPVwiXCI7XG4gICAgICAgICAgY29uc3QgZnJhbWUgPSBjaHVuay5kYXRhO1xuICAgICAgICAgIGNvbnN0IGRhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLmJ5dGVMZW5ndGggKyBtb2NhcC5ieXRlTGVuZ3RoICsgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgKyB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpO1xuICAgICAgICAgIGRhdGEuc2V0KG5ldyBVaW50OEFycmF5KGZyYW1lKSwgMCk7XG4gICAgICAgICAgZGF0YS5zZXQobW9jYXAsIGZyYW1lLmJ5dGVMZW5ndGgpO1xuICAgICAgICAgIHZhciBieXRlcyA9IHRoYXQuZ2V0SW50Qnl0ZXMobW9jYXAuYnl0ZUxlbmd0aCk7XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDsgaSsrKSB7XG4gICAgICAgICAgICBkYXRhW2ZyYW1lLmJ5dGVMZW5ndGggKyBtb2NhcC5ieXRlTGVuZ3RoICsgaV0gPSBieXRlc1tpXTtcbiAgICAgICAgICB9XG4gIFxuICAgICAgICAgIC8vIFNldCBtYWdpYyBzdHJpbmcgYXQgdGhlIGVuZFxuICAgICAgICAgIGNvbnN0IG1hZ2ljSW5kZXggPSBmcmFtZS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50O1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGRhdGFbbWFnaWNJbmRleCArIGldID0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2h1bmsuZGF0YSA9IGRhdGEuYnVmZmVyO1xuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjaHVuayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICBcbiAgICAgIHN0cmVhbXMucmVhZGFibGUucGlwZVRocm91Z2godHJhbnNmb3JtZXIpLnBpcGVUbyhzdHJlYW1zLndyaXRhYmxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRoYXQ9dGhpcztcbiAgICAgIGNvbnN0IHdvcmtlciA9IG5ldyBXb3JrZXIoJy9kaXN0L3NjcmlwdC10cmFuc2Zvcm0td29ya2VyLmpzJyk7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdyZWdpc3RlcmVkJykge1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBjb25zdCBzZW5kZXJUcmFuc2Zvcm0gPSBuZXcgUlRDUnRwU2NyaXB0VHJhbnNmb3JtKHdvcmtlciwgeyBuYW1lOiAnb3V0Z29pbmcnLCBwb3J0OiB0aGF0LnNlbmRlckNoYW5uZWwucG9ydDIgfSwgW3RoYXQuc2VuZGVyQ2hhbm5lbC5wb3J0Ml0pO1xuICAgICAgc2VuZGVyVHJhbnNmb3JtLnBvcnQgPSB0aGF0LnNlbmRlckNoYW5uZWwucG9ydDE7XG4gICAgICBzZW5kZXIudHJhbnNmb3JtID0gc2VuZGVyVHJhbnNmb3JtO1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB3b3JrZXIub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5kYXRhID09PSAnc3RhcnRlZCcpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQxLnBvc3RNZXNzYWdlKHsgd2F0ZXJtYXJrOiB0aGF0Lm1vY2FwRGF0YSB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyByZWNyZWF0ZURlY29kZXIoKXtcbiAgICB0aGlzLmNyZWF0ZURlY29kZXIodGhpcy5yX3JlY2VpdmVyLHRoaXMucl9jbGllbnRJZCk7XG4gIH1cblxuICBhc3luYyBjcmVhdGVEZWNvZGVyKHJlY2VpdmVyLGNsaWVudElkKSB7XG4gICAgaWYgKHRoaXMuaXNDaHJvbWUpIHtcbiAgICAgIGNvbnN0IHN0cmVhbXMgPSByZWNlaXZlci5jcmVhdGVFbmNvZGVkU3RyZWFtcygpO1xuICAgICAgY29uc3QgdGV4dERlY29kZXIgPSBuZXcgVGV4dERlY29kZXIoKTtcbiAgICAgIHZhciB0aGF0PXRoaXM7XG5cbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybVN0cmVhbSh7XG4gICAgICAgIHRyYW5zZm9ybShjaHVuaywgY29udHJvbGxlcikge1xuICAgICAgICAgIGNvbnN0IHZpZXcgPSBuZXcgRGF0YVZpZXcoY2h1bmsuZGF0YSk7ICBcbiAgICAgICAgICBjb25zdCBtYWdpY0RhdGEgPSBuZXcgVWludDhBcnJheShjaHVuay5kYXRhLCBjaHVuay5kYXRhLmJ5dGVMZW5ndGggLSB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgsIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCk7XG4gICAgICAgICAgbGV0IG1hZ2ljID0gW107XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgbWFnaWMucHVzaChtYWdpY0RhdGFbaV0pO1xuXG4gICAgICAgICAgfVxuICAgICAgICAgIGxldCBtYWdpY1N0cmluZyA9IFN0cmluZy5mcm9tQ2hhckNvZGUoLi4ubWFnaWMpO1xuICAgICAgICAgIGlmIChtYWdpY1N0cmluZyA9PT0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IpIHtcbiAgICAgICAgICAgIGNvbnN0IG1vY2FwTGVuID0gdmlldy5nZXRVaW50MzIoY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gKHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKSwgZmFsc2UpO1xuICAgICAgICAgICAgY29uc3QgZnJhbWVTaXplID0gY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gKG1vY2FwTGVuICsgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgKyAgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICAgIGNvbnN0IG1vY2FwQnVmZmVyID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YSwgZnJhbWVTaXplLCBtb2NhcExlbik7XG4gICAgICAgICAgICBjb25zdCBtb2NhcCA9IHRleHREZWNvZGVyLmRlY29kZShtb2NhcEJ1ZmZlcikgICAgICAgIFxuICAgICAgICAgICAgaWYgKG1vY2FwLmxlbmd0aD4wKSB7XG4gICAgICAgICAgICAgIHdpbmRvdy5yZW1vdGVNb2NhcChtb2NhcCtcIixcIitjbGllbnRJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBmcmFtZSA9IGNodW5rLmRhdGE7XG4gICAgICAgICAgICBjaHVuay5kYXRhID0gbmV3IEFycmF5QnVmZmVyKGZyYW1lU2l6ZSk7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YSk7XG4gICAgICAgICAgICBkYXRhLnNldChuZXcgVWludDhBcnJheShmcmFtZSwgMCwgZnJhbWVTaXplKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnRyb2xsZXIuZW5xdWV1ZShjaHVuayk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgc3RyZWFtcy5yZWFkYWJsZS5waXBlVGhyb3VnaCh0cmFuc2Zvcm1lcikucGlwZVRvKHN0cmVhbXMud3JpdGFibGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlY2VpdmVyQ2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcbiAgICAgIHZhciB0aGF0PXRoaXM7XG4gICAgICBjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyKCcvZGlzdC9zY3JpcHQtdHJhbnNmb3JtLXdvcmtlci5qcycpO1xuXG4gICAgICBjb25zb2xlLndhcm4oXCJpbmNvbWluZyAxXCIsY2xpZW50SWQsd29ya2VyKTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3JlZ2lzdGVyZWQnKSB7XG4gICAgICAgICAgXG4gICAgICAgICAgY29uc29sZS53YXJuKFwiaW5jb21pbmcgMmFcIixjbGllbnRJZCxldmVudC5kYXRhICk7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUud2FybihcImluY29taW5nIDJcIixjbGllbnRJZCxldmVudC5kYXRhICk7XG4gICAgICB9KTtcbiAgXG4gICAgICBjb25zb2xlLndhcm4oXCJpbmNvbWluZyAzXCIgLGNsaWVudElkKTtcblxuICAgICAgY29uc3QgcmVjZWl2ZXJUcmFuc2Zvcm0gPSBuZXcgUlRDUnRwU2NyaXB0VHJhbnNmb3JtKHdvcmtlciwgeyBuYW1lOiAnaW5jb21pbmcnLCBwb3J0OiB0aGF0LnJlY2VpdmVyQ2hhbm5lbC5wb3J0MiB9LCBbdGhhdC5yZWNlaXZlckNoYW5uZWwucG9ydDJdKTtcbiAgICAgIFxuICAgICAgY29uc29sZS53YXJuKFwiaW5jb21pbmcgNFwiLGNsaWVudElkLHJlY2VpdmVyVHJhbnNmb3JtICk7XG5cbiAgICAgIHJlY2VpdmVyVHJhbnNmb3JtLnBvcnQgPSB0aGF0LnJlY2VpdmVyQ2hhbm5lbC5wb3J0MTtcbiAgICAgIHJlY2VpdmVyLnRyYW5zZm9ybSA9IHJlY2VpdmVyVHJhbnNmb3JtO1xuICAgICAgcmVjZWl2ZXJUcmFuc2Zvcm0ucG9ydC5vbm1lc3NhZ2UgPSBlID0+IHtcbiAgICAgICAgLy9jb25zb2xlLndhcm4oXCJ3YWhvbyBpblwiLGUpO1xuICAgICAgICBpZiAodGhpcy5sb2dpKys+NTApIHtcbiAgICAgICAvLyAgIGNvbnNvbGUud2FybihcIndhaG9vIGluIGZyb20gXCIsY2xpZW50SWQpO1xuICAgICAgICAgIHRoaXMubG9naT0wO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlLmRhdGEubGVuZ3RoPjApIHtcbiAgICAgICAgICB3aW5kb3cucmVtb3RlTW9jYXAoZS5kYXRhK1wiLFwiK2NsaWVudElkKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgXG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdzdGFydGVkJykge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcImluY29taW5nIDVhXCIsY2xpZW50SWQsZXZlbnQuZGF0YSApO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLndhcm4oXCJpbmNvbWluZyA1XCIsY2xpZW50SWQsZXZlbnQuZGF0YSApO1xuXG4gICAgICB9KTtcbiAgICAgIGNvbnNvbGUud2FybihcImluY29taW5nIDZcIixjbGllbnRJZCApO1xuICAgIH1cbiAgfSAgXG4gIHNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZW5kRGF0YSBcIiwgY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGEoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgfVxuXG4gIHNlbmREYXRhR3VhcmFudGVlZChjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGFHdWFyYW50ZWVkIFwiLCBjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBicm9hZGNhc3REYXRhKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGJyb2FkY2FzdERhdGEgXCIsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB2YXIgcm9vbU9jY3VwYW50cyA9IHRoaXMuZWFzeXJ0Yy5nZXRSb29tT2NjdXBhbnRzQXNNYXAodGhpcy5yb29tKTtcblxuICAgIC8vIEl0ZXJhdGUgb3ZlciB0aGUga2V5cyBvZiB0aGUgZWFzeXJ0YyByb29tIG9jY3VwYW50cyBtYXAuXG4gICAgLy8gZ2V0Um9vbU9jY3VwYW50c0FzQXJyYXkgdXNlcyBPYmplY3Qua2V5cyB3aGljaCBhbGxvY2F0ZXMgbWVtb3J5LlxuICAgIGZvciAodmFyIHJvb21PY2N1cGFudCBpbiByb29tT2NjdXBhbnRzKSB7XG4gICAgICBpZiAocm9vbU9jY3VwYW50c1tyb29tT2NjdXBhbnRdICYmIHJvb21PY2N1cGFudCAhPT0gdGhpcy5lYXN5cnRjLm15RWFzeXJ0Y2lkKSB7XG4gICAgICAgIC8vIHNlbmQgdmlhIHdlYnJ0YyBvdGhlcndpc2UgZmFsbGJhY2sgdG8gd2Vic29ja2V0c1xuICAgICAgICB0aGlzLmVhc3lydGMuc2VuZERhdGEocm9vbU9jY3VwYW50LCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQoZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQgXCIsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB2YXIgZGVzdGluYXRpb24gPSB7IHRhcmdldFJvb206IHRoaXMucm9vbSB9O1xuICAgIHRoaXMuZWFzeXJ0Yy5zZW5kRGF0YVdTKGRlc3RpbmF0aW9uLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBnZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGdldENvbm5lY3RTdGF0dXMgXCIsIGNsaWVudElkKTtcbiAgICB2YXIgc3RhdHVzID0gdGhpcy5lYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpO1xuXG4gICAgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuSVNfQ09OTkVDVEVEKSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLklTX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2UgaWYgKHN0YXR1cyA9PSB0aGlzLmVhc3lydGMuTk9UX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5OT1RfQ09OTkVDVEVEO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gTkFGLmFkYXB0ZXJzLkNPTk5FQ1RJTkc7XG4gICAgfVxuICB9XG5cbiAgZ2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbU5hbWUgPSBcImF1ZGlvXCIpIHtcblxuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuICAgIC8vIGlmICggc3RyZWFtTmFtZSA9IFwiYXVkaW9cIikge1xuICAgIC8vc3RyZWFtTmFtZSA9IFwiYm9kX2F1ZGlvXCI7XG4gICAgLy99XG5cbiAgICBpZiAodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdICYmIHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSkge1xuICAgICAgTkFGLmxvZy53cml0ZShgQWxyZWFkeSBoYWQgJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcbiAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5tZWRpYVN0cmVhbXNbY2xpZW50SWRdW3N0cmVhbU5hbWVdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgTkFGLmxvZy53cml0ZShgV2FpdGluZyBvbiAke3N0cmVhbU5hbWV9IGZvciAke2NsaWVudElkfWApO1xuXG4gICAgICAvLyBDcmVhdGUgaW5pdGlhbCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyB3aXRoIGF1ZGlvfHZpZGVvIGFsaWFzXG4gICAgICBpZiAoIXRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuaGFzKGNsaWVudElkKSkge1xuICAgICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHt9O1xuXG4gICAgICAgIGNvbnN0IGF1ZGlvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBBdWRpbyBFcnJvcmAsIGUpKTtcblxuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5wcm9taXNlID0gYXVkaW9Qcm9taXNlO1xuXG4gICAgICAgIGNvbnN0IHZpZGVvUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlbyA9IHsgcmVzb2x2ZSwgcmVqZWN0IH07XG4gICAgICAgIH0pLmNhdGNoKGUgPT4gTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBnZXRNZWRpYVN0cmVhbSBWaWRlbyBFcnJvcmAsIGUpKTtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucHJvbWlzZSA9IHZpZGVvUHJvbWlzZTtcblxuICAgICAgICB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLnNldChjbGllbnRJZCwgcGVuZGluZ01lZGlhUmVxdWVzdHMpO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBzdHJlYW1OYW1lXG4gICAgICBpZiAoIXBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIGNvbnN0IHN0cmVhbVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gXCIke3N0cmVhbU5hbWV9XCIgRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnByb21pc2UgPSBzdHJlYW1Qcm9taXNlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpW3N0cmVhbU5hbWVdLnByb21pc2U7XG4gICAgfVxuICB9XG5cbiAgc2V0TWVkaWFTdHJlYW0oY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRNZWRpYVN0cmVhbSBcIiwgY2xpZW50SWQsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7IC8vIHJldHVybiB1bmRlZmluZWQgaWYgdGhlcmUgaXMgbm8gZW50cnkgaW4gdGhlIE1hcFxuICAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICAgIGlmIChzdHJlYW1OYW1lID09PSAnZGVmYXVsdCcpIHtcbiAgICAgIC8vIFNhZmFyaSBkb2Vzbid0IGxpa2UgaXQgd2hlbiB5b3UgdXNlIGEgbWl4ZWQgbWVkaWEgc3RyZWFtIHdoZXJlIG9uZSBvZiB0aGUgdHJhY2tzIGlzIGluYWN0aXZlLCBzbyB3ZVxuICAgICAgLy8gc3BsaXQgdGhlIHRyYWNrcyBpbnRvIHR3byBzdHJlYW1zLlxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyBhdWRpbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCBhdWRpb1RyYWNrcyA9IHN0cmVhbS5nZXRBdWRpb1RyYWNrcygpO1xuICAgICAgaWYgKGF1ZGlvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBhdWRpb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IGF1ZGlvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwiYXVkaW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYXVkaW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgbWVkaWFTdHJlYW1zIHZpZGVvIHN0cmVhbU5hbWUgYWxpYXNcbiAgICAgIGNvbnN0IHZpZGVvVHJhY2tzID0gc3RyZWFtLmdldFZpZGVvVHJhY2tzKCk7XG4gICAgICBpZiAodmlkZW9UcmFja3MubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHZpZGVvVHJhY2tzLmZvckVhY2godHJhY2sgPT4gdmlkZW9TdHJlYW0uYWRkVHJhY2sodHJhY2spKTtcbiAgICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gc2V0TWVkaWFTdHJlYW0gXCJ2aWRlb1wiIGFsaWFzIEVycm9yYCwgZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXNvbHZlIHRoZSBwcm9taXNlIGZvciB0aGUgdXNlcidzIG1lZGlhIHN0cmVhbSB2aWRlbyBhbGlhcyBpZiBpdCBleGlzdHMuXG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNsaWVudE1lZGlhU3RyZWFtc1tzdHJlYW1OYW1lXSA9IHN0cmVhbTtcblxuICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gYnkgU3RyZWFtTmFtZSBpZiBpdCBleGlzdHMuXG4gICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMgJiYgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0pIHtcbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHNbc3RyZWFtTmFtZV0ucmVzb2x2ZShzdHJlYW0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGdldEludEJ5dGVzKHgpIHtcbiAgICB2YXIgYnl0ZXMgPSBbXTtcbiAgICB2YXIgaSA9IHRoaXMuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50O1xuICAgIGRvIHtcbiAgICAgIGJ5dGVzWy0taV0gPSB4ICYgKDI1NSk7XG4gICAgICB4ID0geCA+PiA4O1xuICAgIH0gd2hpbGUgKGkpXG4gICAgcmV0dXJuIGJ5dGVzO1xuICB9XG5cbiAgYWRkTG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgYWRkTG9jYWxNZWRpYVN0cmVhbSBcIiwgc3RyZWFtLCBzdHJlYW1OYW1lKTtcbiAgICBjb25zdCBlYXN5cnRjID0gdGhpcy5lYXN5cnRjO1xuICAgIHN0cmVhbU5hbWUgPSBzdHJlYW1OYW1lIHx8IHN0cmVhbS5pZDtcbiAgICB0aGlzLnNldE1lZGlhU3RyZWFtKFwibG9jYWxcIiwgc3RyZWFtLCBzdHJlYW1OYW1lKTtcbiAgICBlYXN5cnRjLnJlZ2lzdGVyM3JkUGFydHlMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbSwgc3RyZWFtTmFtZSk7XG5cbiAgICAvLyBBZGQgbG9jYWwgc3RyZWFtIHRvIGV4aXN0aW5nIGNvbm5lY3Rpb25zXG4gICAgT2JqZWN0LmtleXModGhpcy5yZW1vdGVDbGllbnRzKS5mb3JFYWNoKGNsaWVudElkID0+IHtcbiAgICAgIGlmIChlYXN5cnRjLmdldENvbm5lY3RTdGF0dXMoY2xpZW50SWQpICE9PSBlYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgICAgZWFzeXJ0Yy5hZGRTdHJlYW1Ub0NhbGwoY2xpZW50SWQsIHN0cmVhbU5hbWUpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgcmVtb3ZlTG9jYWxNZWRpYVN0cmVhbShzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHJlbW92ZUxvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbU5hbWUpO1xuICAgIHRoaXMuZWFzeXJ0Yy5jbG9zZUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtTmFtZSk7XG4gICAgZGVsZXRlIHRoaXMubWVkaWFTdHJlYW1zW1wibG9jYWxcIl1bc3RyZWFtTmFtZV07XG4gIH1cblxuICBlbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlTWljcm9waG9uZSBcIiwgZW5hYmxlZCk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZU1pY3JvcGhvbmUoZW5hYmxlZCk7XG4gIH1cblxuICBlbmFibGVDYW1lcmEoZW5hYmxlZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBlbmFibGVDYW1lcmEgXCIsIGVuYWJsZWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVDYW1lcmEoZW5hYmxlZCk7XG4gIH1cblxuICBkaXNjb25uZWN0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBkaXNjb25uZWN0IFwiKTtcbiAgICB0aGlzLmVhc3lydGMuZGlzY29ubmVjdCgpO1xuICB9XG5cbiAgYXN5bmMgaGFuZGxlVXNlclB1Ymxpc2hlZCh1c2VyLCBtZWRpYVR5cGUpIHsgfVxuXG4gIGhhbmRsZVVzZXJVbnB1Ymxpc2hlZCh1c2VyLCBtZWRpYVR5cGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclVuUHVibGlzaGVkIFwiKTtcbiAgfVxuXG4gICBnZXRJbnB1dExldmVsKHRyYWNrKSB7XG4gICAgdmFyIGFuYWx5c2VyID0gdHJhY2suX3NvdXJjZS52b2x1bWVMZXZlbEFuYWx5c2VyLmFuYWx5c2VyTm9kZTtcbiAgICAvL3ZhciBhbmFseXNlciA9IHRyYWNrLl9zb3VyY2UuYW5hbHlzZXJOb2RlO1xuICAgIGNvbnN0IGJ1ZmZlckxlbmd0aCA9IGFuYWx5c2VyLmZyZXF1ZW5jeUJpbkNvdW50O1xuICAgIHZhciBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyTGVuZ3RoKTtcbiAgICBhbmFseXNlci5nZXRCeXRlRnJlcXVlbmN5RGF0YShkYXRhKTtcbiAgICB2YXIgdmFsdWVzID0gMDtcbiAgICB2YXIgYXZlcmFnZTtcbiAgICB2YXIgbGVuZ3RoID0gZGF0YS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzICs9IGRhdGFbaV07XG4gICAgfVxuICAgIGF2ZXJhZ2UgPSBNYXRoLmZsb29yKHZhbHVlcyAvIGxlbmd0aCk7XG4gICAgcmV0dXJuIGF2ZXJhZ2U7XG4gIH1cblxuICAgdm9pY2VBY3Rpdml0eURldGVjdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuX3ZhZF9hdWRpb1RyYWNrIHx8ICF0aGlzLl92YWRfYXVkaW9UcmFjay5fZW5hYmxlZClcbiAgICAgIHJldHVybjtcblxuICAgIHZhciBhdWRpb0xldmVsID0gdGhpcy5nZXRJbnB1dExldmVsKHRoaXMuX3ZhZF9hdWRpb1RyYWNrKTtcbiAgICBpZiAoYXVkaW9MZXZlbCA8PSB0aGlzLl92YWRfTWF4QmFja2dyb3VuZE5vaXNlTGV2ZWwpIHtcbiAgICAgIGlmICh0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyLmxlbmd0aCA+PSB0aGlzLl92YWRfTWF4QXVkaW9TYW1wbGVzKSB7XG4gICAgICAgIHZhciByZW1vdmVkID0gdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0Fyci5zaGlmdCgpO1xuICAgICAgICB2YXIgcmVtb3ZlZEluZGV4ID0gdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZC5pbmRleE9mKHJlbW92ZWQpO1xuICAgICAgICBpZiAocmVtb3ZlZEluZGV4ID4gLTEpIHtcbiAgICAgICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLnNwbGljZShyZW1vdmVkSW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyLnB1c2goYXVkaW9MZXZlbCk7XG4gICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLnB1c2goYXVkaW9MZXZlbCk7XG4gICAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgICB9XG4gICAgdmFyIGJhY2tncm91bmQgPSBNYXRoLmZsb29yKDMgKiB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkW01hdGguZmxvb3IodGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZC5sZW5ndGggLyAyKV0gLyAyKTtcbiAgICBpZiAoYXVkaW9MZXZlbCA+IGJhY2tncm91bmQgKyB0aGlzLl92YWRfU2lsZW5jZU9mZmVzZXQpIHtcbiAgICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudCsrO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl92YWRfZXhjZWVkQ291bnQgPSAwO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl92YWRfZXhjZWVkQ291bnQgPiB0aGlzLl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGRMb3cpIHtcbiAgICAgIC8vQWdvcmFSVENVdGlsRXZlbnRzLmVtaXQoXCJWb2ljZUFjdGl2aXR5RGV0ZWN0ZWRGYXN0XCIsIHRoaXMuX3ZhZF9leGNlZWRDb3VudCk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3ZhZF9leGNlZWRDb3VudCA+IHRoaXMuX3ZhZF9leGNlZWRDb3VudFRocmVzaG9sZCkge1xuICAgICAgLy9BZ29yYVJUQ1V0aWxFdmVudHMuZW1pdChcIlZvaWNlQWN0aXZpdHlEZXRlY3RlZFwiLCB0aGlzLl92YWRfZXhjZWVkQ291bnQpO1xuICAgICAgdGhpcy5fdmFkX2V4Y2VlZENvdW50ID0gMDtcbiAgICAgIHdpbmRvdy5fc3RhdGVfc3RvcF9hdD1EYXRlLm5vdygpO1xuICAgICAgY29uc29sZS5lcnJvcihcIlZBRCBcIixEYXRlLm5vdygpLXdpbmRvdy5fc3RhdGVfc3RvcF9hdCk7XG4gICAgfVxuXG4gIH1cblxuICBhc3luYyBjb25uZWN0QWdvcmEoKSB7XG4gICAgLy8gQWRkIGFuIGV2ZW50IGxpc3RlbmVyIHRvIHBsYXkgcmVtb3RlIHRyYWNrcyB3aGVuIHJlbW90ZSB1c2VyIHB1Ymxpc2hlcy5cbiAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgfHwgdGhpcy5lbmFibGVWaWRlbyB8fCB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcInJ0Y1wiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJoMjY0XCIgfSk7XG4gICAgICB0aGlzLmFnb3JhQ2xpZW50LnNldENsaWVudFJvbGUoXCJob3N0XCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwiaDI2NFwiIH0pO1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcInZwOFwiIH0pO1xuICAgIH1cblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLWpvaW5lZFwiLCBhc3luYyAodXNlcikgPT4ge1xuICAgICAgY29uc29sZS53YXJuKFwidXNlci1qb2luZWRcIiwgdXNlcik7XG4gICAgfSk7XG4gICAgdGhpcy5hZ29yYUNsaWVudC5vbihcInVzZXItcHVibGlzaGVkXCIsIGFzeW5jICh1c2VyLCBtZWRpYVR5cGUpID0+IHtcbiAgICAgIHJldHVybjtcbiAgICAgIGxldCBjbGllbnRJZCA9IHVzZXIudWlkO1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJQdWJsaXNoZWQgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgbWVkaWFUeXBlLCB0aGF0LmFnb3JhQ2xpZW50KTtcbiAgICAgIGF3YWl0IHRoYXQuYWdvcmFDbGllbnQuc3Vic2NyaWJlKHVzZXIsIG1lZGlhVHlwZSk7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgaGFuZGxlVXNlclB1Ymxpc2hlZDIgXCIgKyBjbGllbnRJZCArIFwiIFwiICsgdGhhdC5hZ29yYUNsaWVudCk7XG5cbiAgICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhhdC5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpO1xuICAgICAgY29uc3QgY2xpZW50TWVkaWFTdHJlYW1zID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdID0gdGhhdC5tZWRpYVN0cmVhbXNbY2xpZW50SWRdIHx8IHt9O1xuXG4gICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG5cbiAgICAgICAgY29uc3QgYXVkaW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJ1c2VyLmF1ZGlvVHJhY2sgXCIsIHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIC8vYXVkaW9TdHJlYW0uYWRkVHJhY2sodXNlci5hdWRpb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLmF1ZGlvID0gYXVkaW9TdHJlYW07XG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucmVzb2x2ZShhdWRpb1N0cmVhbSk7XG4gICAgICB9XG5cbiAgICAgIGxldCB2aWRlb1N0cmVhbSA9IG51bGw7XG4gICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgIHZpZGVvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidXNlci52aWRlb1RyYWNrIFwiLCB1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICB2aWRlb1N0cmVhbS5hZGRUcmFjayh1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICBjbGllbnRNZWRpYVN0cmVhbXMudmlkZW8gPSB2aWRlb1N0cmVhbTtcbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy52aWRlby5yZXNvbHZlKHZpZGVvU3RyZWFtKTtcbiAgICAgICAgLy91c2VyLnZpZGVvVHJhY2tcbiAgICAgIH1cblxuICAgICAgaWYgKGNsaWVudElkID09ICdDQ0MnKSB7XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICd2aWRlbycpIHtcbiAgICAgICAgICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInZpZGVvMzYwXCIpLnNyY09iamVjdD12aWRlb1N0cmVhbTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc2V0QXR0cmlidXRlKFwic3JjXCIsIHZpZGVvU3RyZWFtKTtcbiAgICAgICAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc2V0QXR0cmlidXRlKFwic3JjXCIsIHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNyY09iamVjdD0gdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrO1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikuc3JjT2JqZWN0ID0gdmlkZW9TdHJlYW07XG4gICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChjbGllbnRJZCA9PSAnREREJykge1xuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgdXNlci52aWRlb1RyYWNrLnBsYXkoXCJ2aWRlbzM2MFwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgICAgdXNlci5hdWRpb1RyYWNrLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICAgIGxldCBlbmNfaWQ9J25hJztcbiAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgZW5jX2lkPXVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjay5pZDsgICAgICAgXG4gICAgICB9IGVsc2Uge1xuICAgICAgIC8vIGVuY19pZD11c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2suaWQ7XG4gICAgICB9XG4gICAgXG4gICAgICAvL2NvbnNvbGUud2FybihtZWRpYVR5cGUsZW5jX2lkKTsgICAgXG4gICAgICBjb25zdCBwYyA9dGhpcy5hZ29yYUNsaWVudC5fcDJwQ2hhbm5lbC5jb25uZWN0aW9uLnBlZXJDb25uZWN0aW9uO1xuICAgICAgY29uc3QgcmVjZWl2ZXJzID0gcGMuZ2V0UmVjZWl2ZXJzKCk7ICBcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVjZWl2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChyZWNlaXZlcnNbaV0udHJhY2sgJiYgcmVjZWl2ZXJzW2ldLnRyYWNrLmlkPT09ZW5jX2lkICkge1xuICAgICAgICAgIGNvbnNvbGUud2FybihcIk1hdGNoXCIsbWVkaWFUeXBlLGVuY19pZCk7XG4gICAgICAgICAgdGhpcy5yX3JlY2VpdmVyPXJlY2VpdmVyc1tpXTtcbiAgICAgICAgICB0aGlzLnJfY2xpZW50SWQ9Y2xpZW50SWQ7XG4gICAgICAgICAgdGhpcy5jcmVhdGVEZWNvZGVyKHRoaXMucl9yZWNlaXZlcix0aGlzLnJfY2xpZW50SWQpO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICB9KTtcblxuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLXVucHVibGlzaGVkXCIsIHRoYXQuaGFuZGxlVXNlclVucHVibGlzaGVkKTtcblxuICAgIGNvbnNvbGUubG9nKFwiY29ubmVjdCBhZ29yYSBBR09SQU1PQ0FQIFwiKTtcbiAgICAvLyBKb2luIGEgY2hhbm5lbCBhbmQgY3JlYXRlIGxvY2FsIHRyYWNrcy4gQmVzdCBwcmFjdGljZSBpcyB0byB1c2UgUHJvbWlzZS5hbGwgYW5kIHJ1biB0aGVtIGNvbmN1cnJlbnRseS5cbiAgICAvLyBvXG5cblxuICAgIGlmICh0aGlzLmVuYWJsZUF2YXRhcikge1xuICAgICAgdmFyIHN0cmVhbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpLmNhcHR1cmVTdHJlYW0oMzApO1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdIH0pXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCAmJiB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICB2YXIgc3RyZWFtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW52YXNfc2VjcmV0XCIpLmNhcHR1cmVTdHJlYW0oMzApO1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDdXN0b21WaWRlb1RyYWNrKHsgbWVkaWFTdHJlYW1UcmFjazogc3RyZWFtLmdldFZpZGVvVHJhY2tzKClbMF0gfSldKTtcbiAgICB9XG4gICAgZWxzZSBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaywgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLFxuICAgICAgICBBZ29yYVJUQy5jcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjaygpLCBBZ29yYVJUQy5jcmVhdGVDYW1lcmFWaWRlb1RyYWNrKHsgZW5jb2RlckNvbmZpZzogJzQ4MHBfMicgfSldKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8pIHtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrXSA9IGF3YWl0IFByb21pc2UuYWxsKFtcbiAgICAgICAgLy8gSm9pbiB0aGUgY2hhbm5lbC5cbiAgICAgICAgdGhpcy5hZ29yYUNsaWVudC5qb2luKHRoaXMuYXBwaWQsIHRoaXMucm9vbSwgdGhpcy50b2tlbiB8fCBudWxsLCB0aGlzLmNsaWVudElkIHx8IG51bGwpLCBBZ29yYVJUQy5jcmVhdGVDYW1lcmFWaWRlb1RyYWNrKFwiMzYwcF80XCIpXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZUF1ZGlvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKV0pO1xuICAgICAgICAvL2NvbnNvbGUubG9nKFwiY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2tcIik7XG4gICAgICAgIHRoaXMuX3ZhZF9hdWRpb1RyYWNrID0gdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrO1xuICAgICAgICBpZiAoIXRoaXMuX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25JbnRlcnZhbCkge1xuICAgICAgICAgIHRoaXMuX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25JbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudm9pY2VBY3Rpdml0eURldGVjdGlvbigpO1xuICAgICAgICAgIH0sIHRoaXMuX3ZvaWNlQWN0aXZpdHlEZXRlY3Rpb25GcmVxdWVuY3kpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVzZXJpZCA9IGF3YWl0IHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKTtcbiAgICB9XG5cblxuICAgIC8vIHNlbGVjdCBmYWNldGltZSBjYW1lcmEgaWYgZXhpc3RzXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgIXRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCkge1xuICAgICAgbGV0IGNhbXMgPSBhd2FpdCBBZ29yYVJUQy5nZXRDYW1lcmFzKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbXNbaV0ubGFiZWwuaW5kZXhPZihcIkZhY2VUaW1lXCIpID09IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInNlbGVjdCBGYWNlVGltZSBjYW1lcmFcIiwgY2Ftc1tpXS5kZXZpY2VJZCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnNldERldmljZShjYW1zW2ldLmRldmljZUlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMuc2hvd0xvY2FsKSB7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGxheShcImxvY2FsLXBsYXllclwiKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE9MRCBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZzAgJiYgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKSB7XG4gICAgICBjb25zdCBpbWdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICBpbWdFbGVtZW50Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklUIFwiLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spO1xuICAgICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IGF3YWl0IFNlZ1BsdWdpbi5pbmplY3QodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLCBcIi9hc3NldHMvd2FzbXMwXCIpLmNhdGNoKGNvbnNvbGUuZXJyb3IpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiU0VHIElOSVRFRFwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2Uuc2V0T3B0aW9ucyh7IGVuYWJsZTogdHJ1ZSwgYmFja2dyb3VuZDogaW1nRWxlbWVudCB9KTtcbiAgICAgIH07XG4gICAgICBpbWdFbGVtZW50LnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFRQUFBQURDQUlBQUFBN2xqbVJBQUFBRDBsRVFWUjRYbU5nK00rQVFEZzVBT2s5Qy9Wa29tellBQUFBQUVsRlRrU3VRbUNDJztcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE5ldyBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZyAmJiB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcblxuICAgICAgdGhpcy5leHRlbnNpb24gPSBuZXcgVmlydHVhbEJhY2tncm91bmRFeHRlbnNpb24oKTtcbiAgICAgIEFnb3JhUlRDLnJlZ2lzdGVyRXh0ZW5zaW9ucyhbdGhpcy5leHRlbnNpb25dKTtcbiAgICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5leHRlbnNpb24uY3JlYXRlUHJvY2Vzc29yKCk7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3Nvci5pbml0KFwiL2Fzc2V0cy93YXNtc1wiKTtcbiAgICAgIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5waXBlKHRoaXMucHJvY2Vzc29yKS5waXBlKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5wcm9jZXNzb3JEZXN0aW5hdGlvbik7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3Nvci5zZXRPcHRpb25zKHsgdHlwZTogJ2NvbG9yJywgY29sb3I6IFwiIzAwZmYwMFwiIH0pO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3IuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgd2luZG93LmxvY2FsVHJhY2tzID0gdGhpcy5sb2NhbFRyYWNrcztcblxuICAgIC8vIFB1Ymxpc2ggdGhlIGxvY2FsIHZpZGVvIGFuZCBhdWRpbyB0cmFja3MgdG8gdGhlIGNoYW5uZWwuXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gfHwgdGhpcy5lbmFibGVBdWRpbyB8fCB0aGlzLmVuYWJsZUF2YXRhcikge1xuICAgICAgLypcbiAgICAgIGlmICh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spXG4gICAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spO1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaylcbiAgICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjayk7XG4gICAgICAqL1xuICAgICAgY29uc29sZS5sb2coXCJwdWJsaXNoIHN1Y2Nlc3NcIik7XG4gICAgICAvKlxuICAgICAgY29uc3QgcGMgPXRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHNlbmRlcnMgPSBwYy5nZXRTZW5kZXJzKCk7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc2VuZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VuZGVyc1tpXS50cmFjayAmJiAoc2VuZGVyc1tpXS50cmFjay5raW5kID09ICdhdWRpbycpKXsvL30gfHwgc2VuZGVyc1tpXS50cmFjay5raW5kID09ICd2aWRlbycgKSkge1xuICAgICAgICAgLy8gdGhpcy5jcmVhdGVFbmNvZGVyKHNlbmRlcnNbaV0pO1xuICAgICAgICAgY29uc29sZS5sb2coXCJBR09SQU1PQ0FQIFNLSVBzXCIpXG4gICAgICAgIH1cbiAgICAgIH0gXG4gICAgICAqLyAgICAgXG4gICAgfVxuXG4gICAgLy8gUlRNXG5cbiAgfVxuXG4gIC8qKlxuICAgKiBQcml2YXRlc1xuICAgKi9cblxuICBhc3luYyBfY29ubmVjdChjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgYXdhaXQgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG4gIH1cblxuICBfZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKSB7XG4gICAgdmFyIG15Um9vbUlkID0gdGhpcy5yb29tOyAvL05BRi5yb29tO1xuICAgIHZhciBqb2luVGltZSA9IHRoaXMuZWFzeXJ0Yy5nZXRSb29tT2NjdXBhbnRzQXNNYXAobXlSb29tSWQpW2NsaWVudElkXS5yb29tSm9pblRpbWU7XG4gICAgcmV0dXJuIGpvaW5UaW1lO1xuICB9XG5cbiAgZ2V0U2VydmVyVGltZSgpIHtcbiAgICByZXR1cm4gRGF0ZS5ub3coKSArIHRoaXMuYXZnVGltZU9mZnNldDtcbiAgfVxufVxuXG5OQUYuYWRhcHRlcnMucmVnaXN0ZXIoXCJhZ29yYXJ0Y1wiLCBBZ29yYVJ0Y0FkYXB0ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFnb3JhUnRjQWRhcHRlcjtcbiJdLCJzb3VyY2VSb290IjoiIn0=