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
      //[this.userid, this.localTracks.audioTrack] = await Promise.all([
      // Join the channel.

      //  this.agoraClient.join(this.appid, this.room, this.token || null, this.clientId || null), AgoraRTC.createMicrophoneAudioTrack()]);
      console.log("createMicrophoneAudioTrack");
      /*
      this._vad_audioTrack = this.localTracks.audioTrack;
      if (!this._voiceActivityDetectionInterval) {
        this._voiceActivityDetectionInterval = setInterval(() => {
          this.voiceActivityDetection();
        }, this._voiceActivityDetectionFrequency);
      }*/
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LmpzIl0sIm5hbWVzIjpbIkFnb3JhUnRjQWRhcHRlciIsImNvbnN0cnVjdG9yIiwiZWFzeXJ0YyIsImNvbnNvbGUiLCJsb2ciLCJ3aW5kb3ciLCJhcHAiLCJyb29tIiwidXNlcmlkIiwiYXBwaWQiLCJtb2NhcERhdGEiLCJsb2dpIiwibG9nbyIsIm1lZGlhU3RyZWFtcyIsInJlbW90ZUNsaWVudHMiLCJwZW5kaW5nTWVkaWFSZXF1ZXN0cyIsIk1hcCIsImVuYWJsZVZpZGVvIiwiZW5hYmxlVmlkZW9GaWx0ZXJlZCIsImVuYWJsZUF1ZGlvIiwiZW5hYmxlQXZhdGFyIiwibG9jYWxUcmFja3MiLCJ2aWRlb1RyYWNrIiwiYXVkaW9UcmFjayIsInRva2VuIiwiY2xpZW50SWQiLCJ1aWQiLCJ2YmciLCJ2YmcwIiwic2hvd0xvY2FsIiwidmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSIsImV4dGVuc2lvbiIsInByb2Nlc3NvciIsInBpcGVQcm9jZXNzb3IiLCJ0cmFjayIsInBpcGUiLCJwcm9jZXNzb3JEZXN0aW5hdGlvbiIsInNlcnZlclRpbWVSZXF1ZXN0cyIsInRpbWVPZmZzZXRzIiwiYXZnVGltZU9mZnNldCIsImFnb3JhQ2xpZW50Iiwic2V0UGVlck9wZW5MaXN0ZW5lciIsImNsaWVudENvbm5lY3Rpb24iLCJnZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkIiwic2V0UGVlckNsb3NlZExpc3RlbmVyIiwiaXNDaHJvbWUiLCJuYXZpZ2F0b3IiLCJ1c2VyQWdlbnQiLCJpbmRleE9mIiwib2xkUlRDUGVlckNvbm5lY3Rpb24iLCJSVENQZWVyQ29ubmVjdGlvbiIsIlByb3h5IiwiY29uc3RydWN0IiwidGFyZ2V0IiwiYXJncyIsImxlbmd0aCIsInB1c2giLCJlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXMiLCJwYyIsIm9sZFNldENvbmZpZ3VyYXRpb24iLCJwcm90b3R5cGUiLCJzZXRDb25maWd1cmF0aW9uIiwiYXJndW1lbnRzIiwiYXBwbHkiLCJDdXN0b21EYXRhRGV0ZWN0b3IiLCJDdXN0b21EYXRMZW5ndGhCeXRlQ291bnQiLCJzZW5kZXJDaGFubmVsIiwiTWVzc2FnZUNoYW5uZWwiLCJyZWNlaXZlckNoYW5uZWwiLCJyX3JlY2VpdmVyIiwicl9jbGllbnRJZCIsIl92YWRfYXVkaW9UcmFjayIsIl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uRnJlcXVlbmN5IiwiX3ZhZF9NYXhBdWRpb1NhbXBsZXMiLCJfdmFkX01heEJhY2tncm91bmROb2lzZUxldmVsIiwiX3ZhZF9TaWxlbmNlT2ZmZXNldCIsIl92YWRfYXVkaW9TYW1wbGVzQXJyIiwiX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQiLCJfdmFkX2V4Y2VlZENvdW50IiwiX3ZhZF9leGNlZWRDb3VudFRocmVzaG9sZCIsIl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGRMb3ciLCJfdm9pY2VBY3Rpdml0eURldGVjdGlvbkludGVydmFsIiwic2V0U2VydmVyVXJsIiwidXJsIiwic2V0U29ja2V0VXJsIiwic2V0QXBwIiwiYXBwTmFtZSIsInNldFJvb20iLCJqc29uIiwicmVwbGFjZSIsIm9iaiIsIkpTT04iLCJwYXJzZSIsIm5hbWUiLCJBZ29yYVJUQyIsImxvYWRNb2R1bGUiLCJTZWdQbHVnaW4iLCJqb2luUm9vbSIsInNldFdlYlJ0Y09wdGlvbnMiLCJvcHRpb25zIiwiZW5hYmxlRGF0YUNoYW5uZWxzIiwiZGF0YWNoYW5uZWwiLCJ2aWRlbyIsImF1ZGlvIiwiZW5hYmxlVmlkZW9SZWNlaXZlIiwiZW5hYmxlQXVkaW9SZWNlaXZlIiwic2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyIsInN1Y2Nlc3NMaXN0ZW5lciIsImZhaWx1cmVMaXN0ZW5lciIsImNvbm5lY3RTdWNjZXNzIiwiY29ubmVjdEZhaWx1cmUiLCJzZXRSb29tT2NjdXBhbnRMaXN0ZW5lciIsIm9jY3VwYW50TGlzdGVuZXIiLCJyb29tTmFtZSIsIm9jY3VwYW50cyIsInByaW1hcnkiLCJzZXREYXRhQ2hhbm5lbExpc3RlbmVycyIsIm9wZW5MaXN0ZW5lciIsImNsb3NlZExpc3RlbmVyIiwibWVzc2FnZUxpc3RlbmVyIiwic2V0RGF0YUNoYW5uZWxPcGVuTGlzdGVuZXIiLCJzZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIiLCJzZXRQZWVyTGlzdGVuZXIiLCJ1cGRhdGVUaW1lT2Zmc2V0IiwiY2xpZW50U2VudFRpbWUiLCJEYXRlIiwibm93IiwiZmV0Y2giLCJkb2N1bWVudCIsImxvY2F0aW9uIiwiaHJlZiIsIm1ldGhvZCIsImNhY2hlIiwidGhlbiIsInJlcyIsInByZWNpc2lvbiIsInNlcnZlclJlY2VpdmVkVGltZSIsImhlYWRlcnMiLCJnZXQiLCJnZXRUaW1lIiwiY2xpZW50UmVjZWl2ZWRUaW1lIiwic2VydmVyVGltZSIsInRpbWVPZmZzZXQiLCJyZWR1Y2UiLCJhY2MiLCJvZmZzZXQiLCJzZXRUaW1lb3V0IiwiY29ubmVjdCIsIlByb21pc2UiLCJhbGwiLCJyZXNvbHZlIiwicmVqZWN0IiwiX2Nvbm5lY3QiLCJfIiwiX215Um9vbUpvaW5UaW1lIiwiX2dldFJvb21Kb2luVGltZSIsImNvbm5lY3RBZ29yYSIsImNhdGNoIiwic2hvdWxkU3RhcnRDb25uZWN0aW9uVG8iLCJjbGllbnQiLCJyb29tSm9pblRpbWUiLCJzdGFydFN0cmVhbUNvbm5lY3Rpb24iLCJjYWxsIiwiY2FsbGVyIiwibWVkaWEiLCJOQUYiLCJ3cml0ZSIsImVycm9yQ29kZSIsImVycm9yVGV4dCIsImVycm9yIiwid2FzQWNjZXB0ZWQiLCJjbG9zZVN0cmVhbUNvbm5lY3Rpb24iLCJoYW5ndXAiLCJzZW5kTW9jYXAiLCJtb2NhcCIsInBvcnQxIiwicG9zdE1lc3NhZ2UiLCJ3YXRlcm1hcmsiLCJjcmVhdGVFbmNvZGVyIiwic2VuZGVyIiwic3RyZWFtcyIsImNyZWF0ZUVuY29kZWRTdHJlYW1zIiwidGV4dEVuY29kZXIiLCJUZXh0RW5jb2RlciIsInRoYXQiLCJ0cmFuc2Zvcm1lciIsIlRyYW5zZm9ybVN0cmVhbSIsInRyYW5zZm9ybSIsImNodW5rIiwiY29udHJvbGxlciIsImVuY29kZSIsImZyYW1lIiwiZGF0YSIsIlVpbnQ4QXJyYXkiLCJieXRlTGVuZ3RoIiwic2V0IiwiYnl0ZXMiLCJnZXRJbnRCeXRlcyIsImkiLCJtYWdpY0luZGV4IiwiY2hhckNvZGVBdCIsImJ1ZmZlciIsImVucXVldWUiLCJyZWFkYWJsZSIsInBpcGVUaHJvdWdoIiwicGlwZVRvIiwid3JpdGFibGUiLCJ3b3JrZXIiLCJXb3JrZXIiLCJvbm1lc3NhZ2UiLCJldmVudCIsInNlbmRlclRyYW5zZm9ybSIsIlJUQ1J0cFNjcmlwdFRyYW5zZm9ybSIsInBvcnQiLCJwb3J0MiIsInJlY3JlYXRlRGVjb2RlciIsImNyZWF0ZURlY29kZXIiLCJyZWNlaXZlciIsInRleHREZWNvZGVyIiwiVGV4dERlY29kZXIiLCJ2aWV3IiwiRGF0YVZpZXciLCJtYWdpY0RhdGEiLCJtYWdpYyIsIm1hZ2ljU3RyaW5nIiwiU3RyaW5nIiwiZnJvbUNoYXJDb2RlIiwibW9jYXBMZW4iLCJnZXRVaW50MzIiLCJmcmFtZVNpemUiLCJtb2NhcEJ1ZmZlciIsImRlY29kZSIsInJlbW90ZU1vY2FwIiwiQXJyYXlCdWZmZXIiLCJ3YXJuIiwicmVjZWl2ZXJUcmFuc2Zvcm0iLCJlIiwic2VuZERhdGEiLCJkYXRhVHlwZSIsInNlbmREYXRhR3VhcmFudGVlZCIsInNlbmREYXRhV1MiLCJicm9hZGNhc3REYXRhIiwicm9vbU9jY3VwYW50cyIsImdldFJvb21PY2N1cGFudHNBc01hcCIsInJvb21PY2N1cGFudCIsIm15RWFzeXJ0Y2lkIiwiYnJvYWRjYXN0RGF0YUd1YXJhbnRlZWQiLCJkZXN0aW5hdGlvbiIsInRhcmdldFJvb20iLCJnZXRDb25uZWN0U3RhdHVzIiwic3RhdHVzIiwiSVNfQ09OTkVDVEVEIiwiYWRhcHRlcnMiLCJOT1RfQ09OTkVDVEVEIiwiQ09OTkVDVElORyIsImdldE1lZGlhU3RyZWFtIiwic3RyZWFtTmFtZSIsImhhcyIsImF1ZGlvUHJvbWlzZSIsInByb21pc2UiLCJ2aWRlb1Byb21pc2UiLCJzdHJlYW1Qcm9taXNlIiwic2V0TWVkaWFTdHJlYW0iLCJzdHJlYW0iLCJjbGllbnRNZWRpYVN0cmVhbXMiLCJhdWRpb1RyYWNrcyIsImdldEF1ZGlvVHJhY2tzIiwiYXVkaW9TdHJlYW0iLCJNZWRpYVN0cmVhbSIsImZvckVhY2giLCJhZGRUcmFjayIsInZpZGVvVHJhY2tzIiwiZ2V0VmlkZW9UcmFja3MiLCJ2aWRlb1N0cmVhbSIsIngiLCJhZGRMb2NhbE1lZGlhU3RyZWFtIiwiaWQiLCJyZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbSIsIk9iamVjdCIsImtleXMiLCJhZGRTdHJlYW1Ub0NhbGwiLCJyZW1vdmVMb2NhbE1lZGlhU3RyZWFtIiwiY2xvc2VMb2NhbE1lZGlhU3RyZWFtIiwiZW5hYmxlTWljcm9waG9uZSIsImVuYWJsZWQiLCJlbmFibGVDYW1lcmEiLCJkaXNjb25uZWN0IiwiaGFuZGxlVXNlclB1Ymxpc2hlZCIsInVzZXIiLCJtZWRpYVR5cGUiLCJoYW5kbGVVc2VyVW5wdWJsaXNoZWQiLCJnZXRJbnB1dExldmVsIiwiYW5hbHlzZXIiLCJfc291cmNlIiwidm9sdW1lTGV2ZWxBbmFseXNlciIsImFuYWx5c2VyTm9kZSIsImJ1ZmZlckxlbmd0aCIsImZyZXF1ZW5jeUJpbkNvdW50IiwiZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEiLCJ2YWx1ZXMiLCJhdmVyYWdlIiwiTWF0aCIsImZsb29yIiwidm9pY2VBY3Rpdml0eURldGVjdGlvbiIsIl9lbmFibGVkIiwiYXVkaW9MZXZlbCIsInJlbW92ZWQiLCJzaGlmdCIsInJlbW92ZWRJbmRleCIsInNwbGljZSIsInNvcnQiLCJhIiwiYiIsImJhY2tncm91bmQiLCJfc3RhdGVfc3RvcF9hdCIsImNyZWF0ZUNsaWVudCIsIm1vZGUiLCJjb2RlYyIsInNldENsaWVudFJvbGUiLCJvbiIsInN1YnNjcmliZSIsInBsYXkiLCJfbWVkaWFTdHJlYW1UcmFjayIsInF1ZXJ5U2VsZWN0b3IiLCJzcmNPYmplY3QiLCJlbmNfaWQiLCJfcDJwQ2hhbm5lbCIsImNvbm5lY3Rpb24iLCJwZWVyQ29ubmVjdGlvbiIsInJlY2VpdmVycyIsImdldFJlY2VpdmVycyIsImdldEVsZW1lbnRCeUlkIiwiY2FwdHVyZVN0cmVhbSIsImpvaW4iLCJjcmVhdGVNaWNyb3Bob25lQXVkaW9UcmFjayIsImNyZWF0ZUN1c3RvbVZpZGVvVHJhY2siLCJtZWRpYVN0cmVhbVRyYWNrIiwiY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayIsImVuY29kZXJDb25maWciLCJjYW1zIiwiZ2V0Q2FtZXJhcyIsImxhYmVsIiwiZGV2aWNlSWQiLCJzZXREZXZpY2UiLCJpbWdFbGVtZW50IiwiY3JlYXRlRWxlbWVudCIsIm9ubG9hZCIsImluamVjdCIsInNldE9wdGlvbnMiLCJlbmFibGUiLCJzcmMiLCJWaXJ0dWFsQmFja2dyb3VuZEV4dGVuc2lvbiIsInJlZ2lzdGVyRXh0ZW5zaW9ucyIsImNyZWF0ZVByb2Nlc3NvciIsImluaXQiLCJ0eXBlIiwiY29sb3IiLCJteVJvb21JZCIsImpvaW5UaW1lIiwiZ2V0U2VydmVyVGltZSIsInJlZ2lzdGVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IjtRQUFBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBOzs7UUFHQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMENBQTBDLGdDQUFnQztRQUMxRTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLHdEQUF3RCxrQkFBa0I7UUFDMUU7UUFDQSxpREFBaUQsY0FBYztRQUMvRDs7UUFFQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EseUNBQXlDLGlDQUFpQztRQUMxRSxnSEFBZ0gsbUJBQW1CLEVBQUU7UUFDckk7UUFDQTs7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QUF1RHVJLFlBQXRFO0FBQ0EsV0FBT3NNLFFBQVA7QUFDRDs7QUFFREMsa0JBQWdCO0FBQ2QsV0FBTzFPLEtBQUtDLEdBQUwsS0FBYSxLQUFLdkYsYUFBekI7QUFDRDtBQTExQm1COztBQTYxQnRCOEgsSUFBSXVGLFFBQUosQ0FBYTRHLFFBQWIsQ0FBc0IsVUFBdEIsRUFBa0N4VyxlQUFsQzs7QUFFQXlXLE9BQU9DLE9BQVAsR0FBaUIxVyxlQUFqQixDIiwiZmlsZSI6Im5hZi1hZ29yYS1hZGFwdGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuIFx0dmFyIGluc3RhbGxlZE1vZHVsZXMgPSB7fTtcblxuIFx0Ly8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbiBcdGZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblxuIFx0XHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcbiBcdFx0aWYoaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0pIHtcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcbiBcdFx0fVxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0aTogbW9kdWxlSWQsXG4gXHRcdFx0bDogZmFsc2UsXG4gXHRcdFx0ZXhwb3J0czoge31cbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubCA9IHRydWU7XG5cbiBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbiBcdFx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xuIFx0fVxuXG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlcyBvYmplY3QgKF9fd2VicGFja19tb2R1bGVzX18pXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm0gPSBtb2R1bGVzO1xuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZSBjYWNoZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5jID0gaW5zdGFsbGVkTW9kdWxlcztcblxuIFx0Ly8gZGVmaW5lIGdldHRlciBmdW5jdGlvbiBmb3IgaGFybW9ueSBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSBmdW5jdGlvbihleHBvcnRzLCBuYW1lLCBnZXR0ZXIpIHtcbiBcdFx0aWYoIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBuYW1lKSkge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBuYW1lLCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZ2V0dGVyIH0pO1xuIFx0XHR9XG4gXHR9O1xuXG4gXHQvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSBmdW5jdGlvbihleHBvcnRzKSB7XG4gXHRcdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuIFx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuIFx0XHR9XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG4gXHR9O1xuXG4gXHQvLyBjcmVhdGUgYSBmYWtlIG5hbWVzcGFjZSBvYmplY3RcbiBcdC8vIG1vZGUgJiAxOiB2YWx1ZSBpcyBhIG1vZHVsZSBpZCwgcmVxdWlyZSBpdFxuIFx0Ly8gbW9kZSAmIDI6IG1lcmdlIGFsbCBwcm9wZXJ0aWVzIG9mIHZhbHVlIGludG8gdGhlIG5zXG4gXHQvLyBtb2RlICYgNDogcmV0dXJuIHZhbHVlIHdoZW4gYWxyZWFkeSBucyBvYmplY3RcbiBcdC8vIG1vZGUgJiA4fDE6IGJlaGF2ZSBsaWtlIHJlcXVpcmVcbiBcdF9fd2VicGFja19yZXF1aXJlX18udCA9IGZ1bmN0aW9uKHZhbHVlLCBtb2RlKSB7XG4gXHRcdGlmKG1vZGUgJiAxKSB2YWx1ZSA9IF9fd2VicGFja19yZXF1aXJlX18odmFsdWUpO1xuIFx0XHRpZihtb2RlICYgOCkgcmV0dXJuIHZhbHVlO1xuIFx0XHRpZigobW9kZSAmIDQpICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiYgdmFsdWUuX19lc01vZHVsZSkgcmV0dXJuIHZhbHVlO1xuIFx0XHR2YXIgbnMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLnIobnMpO1xuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkobnMsICdkZWZhdWx0JywgeyBlbnVtZXJhYmxlOiB0cnVlLCB2YWx1ZTogdmFsdWUgfSk7XG4gXHRcdGlmKG1vZGUgJiAyICYmIHR5cGVvZiB2YWx1ZSAhPSAnc3RyaW5nJykgZm9yKHZhciBrZXkgaW4gdmFsdWUpIF9fd2VicGFja19yZXF1aXJlX18uZChucywga2V5LCBmdW5jdGlvbihrZXkpIHsgcmV0dXJuIHZhbHVlW2tleV07IH0uYmluZChudWxsLCBrZXkpKTtcbiBcdFx0cmV0dXJuIG5zO1xuIFx0fTtcblxuIFx0Ly8gZ2V0RGVmYXVsdEV4cG9ydCBmdW5jdGlvbiBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIG5vbi1oYXJtb255IG1vZHVsZXNcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubiA9IGZ1bmN0aW9uKG1vZHVsZSkge1xuIFx0XHR2YXIgZ2V0dGVyID0gbW9kdWxlICYmIG1vZHVsZS5fX2VzTW9kdWxlID9cbiBcdFx0XHRmdW5jdGlvbiBnZXREZWZhdWx0KCkgeyByZXR1cm4gbW9kdWxlWydkZWZhdWx0J107IH0gOlxuIFx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZUV4cG9ydHMoKSB7IHJldHVybiBtb2R1bGU7IH07XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18uZChnZXR0ZXIsICdhJywgZ2V0dGVyKTtcbiBcdFx0cmV0dXJuIGdldHRlcjtcbiBcdH07XG5cbiBcdC8vIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbFxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5vID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSkgeyByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iamVjdCwgcHJvcGVydHkpOyB9O1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuXG4gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbiBcdHJldHVybiBfX3dlYnBhY2tfcmVxdWlyZV9fKF9fd2VicGFja19yZXF1aXJlX18ucyA9IFwiLi9zcmMvaW5kZXguanNcIik7XG4iLCJjbGFzcyBBZ29yYVJ0Y0FkYXB0ZXIge1xuXG4gIGNvbnN0cnVjdG9yKGVhc3lydGMpIHtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29uc3RydWN0b3IgXCIsIGVhc3lydGMpO1xuXG4gICAgdGhpcy5lYXN5cnRjID0gZWFzeXJ0YyB8fCB3aW5kb3cuZWFzeXJ0YztcbiAgICB0aGlzLmFwcCA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMucm9vbSA9IFwiZGVmYXVsdFwiO1xuICAgIHRoaXMudXNlcmlkID0gMDtcbiAgICB0aGlzLmFwcGlkID0gbnVsbDtcbiAgICB0aGlzLm1vY2FwRGF0YT1cIlwiO1xuICAgIHRoaXMubG9naT0wO1xuICAgIHRoaXMubG9nbz0wO1xuICAgIHRoaXMubWVkaWFTdHJlYW1zID0ge307XG4gICAgdGhpcy5yZW1vdGVDbGllbnRzID0ge307XG4gICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IG5ldyBNYXAoKTtcblxuICAgIHRoaXMuZW5hYmxlVmlkZW8gPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgPSBmYWxzZTtcbiAgICB0aGlzLmVuYWJsZUF1ZGlvID0gZmFsc2U7XG4gICAgdGhpcy5lbmFibGVBdmF0YXIgPSBmYWxzZTtcblxuICAgIHRoaXMubG9jYWxUcmFja3MgPSB7IHZpZGVvVHJhY2s6IG51bGwsIGF1ZGlvVHJhY2s6IG51bGwgfTtcbiAgICB3aW5kb3cubG9jYWxUcmFja3MgPSB0aGlzLmxvY2FsVHJhY2tzO1xuICAgIHRoaXMudG9rZW4gPSBudWxsO1xuICAgIHRoaXMuY2xpZW50SWQgPSBudWxsO1xuICAgIHRoaXMudWlkID0gbnVsbDtcbiAgICB0aGlzLnZiZyA9IGZhbHNlO1xuICAgIHRoaXMudmJnMCA9IGZhbHNlO1xuICAgIHRoaXMuc2hvd0xvY2FsID0gZmFsc2U7XG4gICAgdGhpcy52aXJ0dWFsQmFja2dyb3VuZEluc3RhbmNlID0gbnVsbDtcbiAgICB0aGlzLmV4dGVuc2lvbiA9IG51bGw7XG4gICAgdGhpcy5wcm9jZXNzb3IgPSBudWxsO1xuICAgIHRoaXMucGlwZVByb2Nlc3NvciA9ICh0cmFjaywgcHJvY2Vzc29yKSA9PiB7XG4gICAgICB0cmFjay5waXBlKHByb2Nlc3NvcikucGlwZSh0cmFjay5wcm9jZXNzb3JEZXN0aW5hdGlvbik7XG4gICAgfVxuXG4gICAgdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgPSAwO1xuICAgIHRoaXMudGltZU9mZnNldHMgPSBbXTtcbiAgICB0aGlzLmF2Z1RpbWVPZmZzZXQgPSAwO1xuICAgIHRoaXMuYWdvcmFDbGllbnQgPSBudWxsO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJPcGVuTGlzdGVuZXIoY2xpZW50SWQgPT4ge1xuICAgICAgY29uc3QgY2xpZW50Q29ubmVjdGlvbiA9IHRoaXMuZWFzeXJ0Yy5nZXRQZWVyQ29ubmVjdGlvbkJ5VXNlcklkKGNsaWVudElkKTtcbiAgICAgIHRoaXMucmVtb3RlQ2xpZW50c1tjbGllbnRJZF0gPSBjbGllbnRDb25uZWN0aW9uO1xuICAgIH0pO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFBlZXJDbG9zZWRMaXN0ZW5lcihjbGllbnRJZCA9PiB7XG4gICAgICBkZWxldGUgdGhpcy5yZW1vdGVDbGllbnRzW2NsaWVudElkXTtcbiAgICB9KTtcblxuICAgIHRoaXMuaXNDaHJvbWUgPSAobmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdGaXJlZm94JykgPT09IC0xICYmIG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignQ2hyb21lJykgPiAtMSk7XG5cbiAgICBpZiAodGhpcy5pc0Nocm9tZSkge1xuICAgICAgd2luZG93Lm9sZFJUQ1BlZXJDb25uZWN0aW9uID0gUlRDUGVlckNvbm5lY3Rpb247XG4gICAgICB3aW5kb3cuUlRDUGVlckNvbm5lY3Rpb24gPSBuZXcgUHJveHkod2luZG93LlJUQ1BlZXJDb25uZWN0aW9uLCB7XG4gICAgICAgIGNvbnN0cnVjdDogZnVuY3Rpb24gKHRhcmdldCwgYXJncykge1xuICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGFyZ3NbMF1bXCJlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXNcIl0gPSB0cnVlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goeyBlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXM6IHRydWUgfSk7XG4gICAgICAgICAgfVxuICAgICAgXG4gICAgICAgICAgY29uc3QgcGMgPSBuZXcgd2luZG93Lm9sZFJUQ1BlZXJDb25uZWN0aW9uKC4uLmFyZ3MpO1xuICAgICAgICAgIHJldHVybiBwYztcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgY29uc3Qgb2xkU2V0Q29uZmlndXJhdGlvbiA9IHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0Q29uZmlndXJhdGlvbjtcbiAgICAgIHdpbmRvdy5SVENQZWVyQ29ubmVjdGlvbi5wcm90b3R5cGUuc2V0Q29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgaWYgKGFyZ3MubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGFyZ3NbMF1bXCJlbmNvZGVkSW5zZXJ0YWJsZVN0cmVhbXNcIl0gPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGFyZ3MucHVzaCh7IGVuY29kZWRJbnNlcnRhYmxlU3RyZWFtczogdHJ1ZSB9KTtcbiAgICAgICAgfVxuICAgICAgXG4gICAgICAgIG9sZFNldENvbmZpZ3VyYXRpb24uYXBwbHkodGhpcywgYXJncyk7XG4gICAgICB9O1xuICAgIH1cbiAgICBcbiAgICAvLyBjdXN0b20gZGF0YSBhcHBlbmQgcGFyYW1zXG4gICAgdGhpcy5DdXN0b21EYXRhRGV0ZWN0b3IgPSAnQUdPUkFNT0NBUCc7XG4gICAgdGhpcy5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQgPSA0O1xuICAgIHRoaXMuc2VuZGVyQ2hhbm5lbCA9IG5ldyBNZXNzYWdlQ2hhbm5lbDtcbiAgICB0aGlzLnJlY2VpdmVyQ2hhbm5lbDtcbiAgICB0aGlzLnJfcmVjZWl2ZXI9bnVsbDtcbiAgICB0aGlzLnJfY2xpZW50SWQ9bnVsbDtcblxuICAgIHRoaXMuX3ZhZF9hdWRpb1RyYWNrID0gbnVsbDtcbiAgICB0aGlzLl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uRnJlcXVlbmN5ID0gMTUwO1xuICBcbiAgICB0aGlzLl92YWRfTWF4QXVkaW9TYW1wbGVzID0gNDAwO1xuICAgIHRoaXMuX3ZhZF9NYXhCYWNrZ3JvdW5kTm9pc2VMZXZlbCA9IDMwO1xuICAgIHRoaXMuX3ZhZF9TaWxlbmNlT2ZmZXNldCA9IDEwO1xuICAgIHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnIgPSBbXTtcbiAgICB0aGlzLl92YWRfYXVkaW9TYW1wbGVzQXJyU29ydGVkID0gW107XG4gICAgdGhpcy5fdmFkX2V4Y2VlZENvdW50ID0gMDtcbiAgICB0aGlzLl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGQgPSAyO1xuICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudFRocmVzaG9sZExvdyA9IDE7XG4gICAgdGhpcy5fdm9pY2VBY3Rpdml0eURldGVjdGlvbkludGVydmFsO1xuXG5cbiAgICBcbiAgICB3aW5kb3cuQWdvcmFSdGNBZGFwdGVyPXRoaXM7XG4gICAgXG4gIH1cblxuICBzZXRTZXJ2ZXJVcmwodXJsKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNldFNlcnZlclVybCBcIiwgdXJsKTtcbiAgICB0aGlzLmVhc3lydGMuc2V0U29ja2V0VXJsKHVybCk7XG4gIH1cblxuICBzZXRBcHAoYXBwTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRBcHAgXCIsIGFwcE5hbWUpO1xuICAgIHRoaXMuYXBwID0gYXBwTmFtZTtcbiAgICB0aGlzLmFwcGlkID0gYXBwTmFtZTtcbiAgfVxuXG4gIGFzeW5jIHNldFJvb20oanNvbikge1xuICAgIGpzb24gPSBqc29uLnJlcGxhY2UoLycvZywgJ1wiJyk7XG4gICAgY29uc3Qgb2JqID0gSlNPTi5wYXJzZShqc29uKTtcbiAgICB0aGlzLnJvb20gPSBvYmoubmFtZTtcblxuICAgIGlmIChvYmoudmJnICYmIG9iai52Ymc9PSd0cnVlJyApIHsgICAgICBcbiAgICAgIHRoaXMudmJnID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAob2JqLnZiZzAgJiYgb2JqLnZiZzA9PSd0cnVlJyApIHtcbiAgICAgIHRoaXMudmJnMCA9IHRydWU7XG4gICAgICBBZ29yYVJUQy5sb2FkTW9kdWxlKFNlZ1BsdWdpbiwge30pO1xuICAgIH1cblxuICAgIGlmIChvYmouZW5hYmxlQXZhdGFyICYmIG9iai5lbmFibGVBdmF0YXI9PSd0cnVlJyApIHtcbiAgICAgIHRoaXMuZW5hYmxlQXZhdGFyID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBpZiAob2JqLnNob3dMb2NhbCAgJiYgb2JqLnNob3dMb2NhbD09J3RydWUnKSB7XG4gICAgICB0aGlzLnNob3dMb2NhbCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKG9iai5lbmFibGVWaWRlb0ZpbHRlcmVkICYmIG9iai5lbmFibGVWaWRlb0ZpbHRlcmVkPT0ndHJ1ZScgKSB7XG4gICAgICB0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgPSB0cnVlO1xuICAgIH1cbiAgICB0aGlzLmVhc3lydGMuam9pblJvb20odGhpcy5yb29tLCBudWxsKTtcbiAgfVxuXG4gIC8vIG9wdGlvbnM6IHsgZGF0YWNoYW5uZWw6IGJvb2wsIGF1ZGlvOiBib29sLCB2aWRlbzogYm9vbCB9XG4gIHNldFdlYlJ0Y09wdGlvbnMob3B0aW9ucykge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBzZXRXZWJSdGNPcHRpb25zIFwiLCBvcHRpb25zKTtcbiAgICAvLyB0aGlzLmVhc3lydGMuZW5hYmxlRGVidWcodHJ1ZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZURhdGFDaGFubmVscyhvcHRpb25zLmRhdGFjaGFubmVsKTtcblxuICAgIC8vIHVzaW5nIEFnb3JhXG4gICAgdGhpcy5lbmFibGVWaWRlbyA9IG9wdGlvbnMudmlkZW87XG4gICAgdGhpcy5lbmFibGVBdWRpbyA9IG9wdGlvbnMuYXVkaW87XG5cbiAgICAvLyBub3QgZWFzeXJ0Y1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVWaWRlbyhmYWxzZSk7XG4gICAgdGhpcy5lYXN5cnRjLmVuYWJsZUF1ZGlvKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlVmlkZW9SZWNlaXZlKGZhbHNlKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQXVkaW9SZWNlaXZlKGZhbHNlKTtcbiAgfVxuXG4gIHNldFNlcnZlckNvbm5lY3RMaXN0ZW5lcnMoc3VjY2Vzc0xpc3RlbmVyLCBmYWlsdXJlTGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0U2VydmVyQ29ubmVjdExpc3RlbmVycyBcIiwgc3VjY2Vzc0xpc3RlbmVyLCBmYWlsdXJlTGlzdGVuZXIpO1xuICAgIHRoaXMuY29ubmVjdFN1Y2Nlc3MgPSBzdWNjZXNzTGlzdGVuZXI7XG4gICAgdGhpcy5jb25uZWN0RmFpbHVyZSA9IGZhaWx1cmVMaXN0ZW5lcjtcbiAgfVxuXG4gIHNldFJvb21PY2N1cGFudExpc3RlbmVyKG9jY3VwYW50TGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0Um9vbU9jY3VwYW50TGlzdGVuZXIgXCIsIG9jY3VwYW50TGlzdGVuZXIpO1xuXG4gICAgdGhpcy5lYXN5cnRjLnNldFJvb21PY2N1cGFudExpc3RlbmVyKGZ1bmN0aW9uIChyb29tTmFtZSwgb2NjdXBhbnRzLCBwcmltYXJ5KSB7XG4gICAgICBvY2N1cGFudExpc3RlbmVyKG9jY3VwYW50cyk7XG4gICAgfSk7XG4gIH1cblxuICBzZXREYXRhQ2hhbm5lbExpc3RlbmVycyhvcGVuTGlzdGVuZXIsIGNsb3NlZExpc3RlbmVyLCBtZXNzYWdlTGlzdGVuZXIpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0RGF0YUNoYW5uZWxMaXN0ZW5lcnMgIFwiLCBvcGVuTGlzdGVuZXIsIGNsb3NlZExpc3RlbmVyLCBtZXNzYWdlTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXREYXRhQ2hhbm5lbE9wZW5MaXN0ZW5lcihvcGVuTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXREYXRhQ2hhbm5lbENsb3NlTGlzdGVuZXIoY2xvc2VkTGlzdGVuZXIpO1xuICAgIHRoaXMuZWFzeXJ0Yy5zZXRQZWVyTGlzdGVuZXIobWVzc2FnZUxpc3RlbmVyKTtcbiAgfVxuXG4gIHVwZGF0ZVRpbWVPZmZzZXQoKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHVwZGF0ZVRpbWVPZmZzZXQgXCIpO1xuICAgIGNvbnN0IGNsaWVudFNlbnRUaW1lID0gRGF0ZS5ub3coKSArIHRoaXMuYXZnVGltZU9mZnNldDtcblxuICAgIHJldHVybiBmZXRjaChkb2N1bWVudC5sb2NhdGlvbi5ocmVmLCB7IG1ldGhvZDogXCJIRUFEXCIsIGNhY2hlOiBcIm5vLWNhY2hlXCIgfSkudGhlbihyZXMgPT4ge1xuICAgICAgdmFyIHByZWNpc2lvbiA9IDEwMDA7XG4gICAgICB2YXIgc2VydmVyUmVjZWl2ZWRUaW1lID0gbmV3IERhdGUocmVzLmhlYWRlcnMuZ2V0KFwiRGF0ZVwiKSkuZ2V0VGltZSgpICsgcHJlY2lzaW9uIC8gMjtcbiAgICAgIHZhciBjbGllbnRSZWNlaXZlZFRpbWUgPSBEYXRlLm5vdygpO1xuICAgICAgdmFyIHNlcnZlclRpbWUgPSBzZXJ2ZXJSZWNlaXZlZFRpbWUgKyAoY2xpZW50UmVjZWl2ZWRUaW1lIC0gY2xpZW50U2VudFRpbWUpIC8gMjtcbiAgICAgIHZhciB0aW1lT2Zmc2V0ID0gc2VydmVyVGltZSAtIGNsaWVudFJlY2VpdmVkVGltZTtcblxuICAgICAgdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMrKztcblxuICAgICAgaWYgKHRoaXMuc2VydmVyVGltZVJlcXVlc3RzIDw9IDEwKSB7XG4gICAgICAgIHRoaXMudGltZU9mZnNldHMucHVzaCh0aW1lT2Zmc2V0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudGltZU9mZnNldHNbdGhpcy5zZXJ2ZXJUaW1lUmVxdWVzdHMgJSAxMF0gPSB0aW1lT2Zmc2V0O1xuICAgICAgfVxuXG4gICAgICB0aGlzLmF2Z1RpbWVPZmZzZXQgPSB0aGlzLnRpbWVPZmZzZXRzLnJlZHVjZSgoYWNjLCBvZmZzZXQpID0+IGFjYyArPSBvZmZzZXQsIDApIC8gdGhpcy50aW1lT2Zmc2V0cy5sZW5ndGg7XG5cbiAgICAgIGlmICh0aGlzLnNlcnZlclRpbWVSZXF1ZXN0cyA+IDEwKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy51cGRhdGVUaW1lT2Zmc2V0KCksIDUgKiA2MCAqIDEwMDApOyAvLyBTeW5jIGNsb2NrIGV2ZXJ5IDUgbWludXRlcy5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMudXBkYXRlVGltZU9mZnNldCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdCBcIik7XG4gICAgUHJvbWlzZS5hbGwoW3RoaXMudXBkYXRlVGltZU9mZnNldCgpLCBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICB0aGlzLl9jb25uZWN0KHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSldKS50aGVuKChbXywgY2xpZW50SWRdKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIkJXNzMgY29ubmVjdGVkIFwiICsgY2xpZW50SWQpO1xuICAgICAgdGhpcy5jbGllbnRJZCA9IGNsaWVudElkO1xuICAgICAgdGhpcy5fbXlSb29tSm9pblRpbWUgPSB0aGlzLl9nZXRSb29tSm9pblRpbWUoY2xpZW50SWQpO1xuICAgICAgdGhpcy5jb25uZWN0QWdvcmEoKTtcbiAgICAgIHRoaXMuY29ubmVjdFN1Y2Nlc3MoY2xpZW50SWQpO1xuICAgIH0pLmNhdGNoKHRoaXMuY29ubmVjdEZhaWx1cmUpO1xuICB9XG5cbiAgc2hvdWxkU3RhcnRDb25uZWN0aW9uVG8oY2xpZW50KSB7XG4gICAgcmV0dXJuIHRoaXMuX215Um9vbUpvaW5UaW1lIDw9IGNsaWVudC5yb29tSm9pblRpbWU7XG4gIH1cblxuICBzdGFydFN0cmVhbUNvbm5lY3Rpb24oY2xpZW50SWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc3RhcnRTdHJlYW1Db25uZWN0aW9uIFwiLCBjbGllbnRJZCk7XG4gICAgdGhpcy5lYXN5cnRjLmNhbGwoY2xpZW50SWQsIGZ1bmN0aW9uIChjYWxsZXIsIG1lZGlhKSB7XG4gICAgICBpZiAobWVkaWEgPT09IFwiZGF0YWNoYW5uZWxcIikge1xuICAgICAgICBOQUYubG9nLndyaXRlKFwiU3VjY2Vzc2Z1bGx5IHN0YXJ0ZWQgZGF0YWNoYW5uZWwgdG8gXCIsIGNhbGxlcik7XG4gICAgICB9XG4gICAgfSwgZnVuY3Rpb24gKGVycm9yQ29kZSwgZXJyb3JUZXh0KSB7XG4gICAgICBOQUYubG9nLmVycm9yKGVycm9yQ29kZSwgZXJyb3JUZXh0KTtcbiAgICB9LCBmdW5jdGlvbiAod2FzQWNjZXB0ZWQpIHtcbiAgICAgIC8vIGNvbnNvbGUubG9nKFwid2FzIGFjY2VwdGVkPVwiICsgd2FzQWNjZXB0ZWQpO1xuICAgIH0pO1xuICB9XG5cbiAgY2xvc2VTdHJlYW1Db25uZWN0aW9uKGNsaWVudElkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGNsb3NlU3RyZWFtQ29ubmVjdGlvbiBcIiwgY2xpZW50SWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5oYW5ndXAoY2xpZW50SWQpO1xuICB9XG5cbiAgc2VuZE1vY2FwKG1vY2FwKSB7XG4gICAgaWYgKG1vY2FwPT10aGlzLm1vY2FwRGF0YSl7XG4gICAgICBjb25zb2xlLmxvZyhcImJsYW5rXCIpO1xuICAgICAgbW9jYXA9XCJcIjtcbiAgICB9XG4gICAgdGhpcy5tb2NhcERhdGE9bW9jYXA7XG4gICAgaWYgKCF0aGlzLmlzQ2hyb21lKSB7XG5cbiAgICAgIGlmICh0aGlzLmxvZ28rKz41MCkge1xuICAgICAgICAvL2NvbnNvbGUud2FybihcInNlbmRcIixtb2NhcCk7XG4gICAgICAgIHRoaXMubG9nbz0wO1xuICAgICAgfVxuICAgICAgdGhpcy5zZW5kZXJDaGFubmVsLnBvcnQxLnBvc3RNZXNzYWdlKHsgd2F0ZXJtYXJrOiBtb2NhcCB9KTtcbiAgICB9XG4gIH1cblxuICBhc3luYyBjcmVhdGVFbmNvZGVyKHNlbmRlcikge1xuICAgIGlmICh0aGlzLmlzQ2hyb21lKSB7XG4gICAgICBjb25zdCBzdHJlYW1zID0gc2VuZGVyLmNyZWF0ZUVuY29kZWRTdHJlYW1zKCk7XG4gICAgICBjb25zdCB0ZXh0RW5jb2RlciA9IG5ldyBUZXh0RW5jb2RlcigpO1xuICAgICAgdmFyIHRoYXQ9dGhpcztcbiAgICAgIGNvbnN0IHRyYW5zZm9ybWVyID0gbmV3IFRyYW5zZm9ybVN0cmVhbSh7XG4gICAgICAgIHRyYW5zZm9ybShjaHVuaywgY29udHJvbGxlcikge1xuICAgICAgICAgIGNvbnN0IG1vY2FwID0gdGV4dEVuY29kZXIuZW5jb2RlKHRoYXQubW9jYXBEYXRhKTtcbiAgICAgICAgICB0aGF0Lm1vY2FwRGF0YT1cIlwiO1xuICAgICAgICAgIGNvbnN0IGZyYW1lID0gY2h1bmsuZGF0YTtcbiAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoKTtcbiAgICAgICAgICBkYXRhLnNldChuZXcgVWludDhBcnJheShmcmFtZSksIDApO1xuICAgICAgICAgIGRhdGEuc2V0KG1vY2FwLCBmcmFtZS5ieXRlTGVuZ3RoKTtcbiAgICAgICAgICB2YXIgYnl0ZXMgPSB0aGF0LmdldEludEJ5dGVzKG1vY2FwLmJ5dGVMZW5ndGgpO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRMZW5ndGhCeXRlQ291bnQ7IGkrKykge1xuICAgICAgICAgICAgZGF0YVtmcmFtZS5ieXRlTGVuZ3RoICsgbW9jYXAuYnl0ZUxlbmd0aCArIGldID0gYnl0ZXNbaV07XG4gICAgICAgICAgfVxuICBcbiAgICAgICAgICAvLyBTZXQgbWFnaWMgc3RyaW5nIGF0IHRoZSBlbmRcbiAgICAgICAgICBjb25zdCBtYWdpY0luZGV4ID0gZnJhbWUuYnl0ZUxlbmd0aCArIG1vY2FwLmJ5dGVMZW5ndGggKyB0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBkYXRhW21hZ2ljSW5kZXggKyBpXSA9IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmNoYXJDb2RlQXQoaSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNodW5rLmRhdGEgPSBkYXRhLmJ1ZmZlcjtcbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmspO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgXG4gICAgICBzdHJlYW1zLnJlYWRhYmxlLnBpcGVUaHJvdWdoKHRyYW5zZm9ybWVyKS5waXBlVG8oc3RyZWFtcy53cml0YWJsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0aGF0PXRoaXM7XG4gICAgICBjb25zdCB3b3JrZXIgPSBuZXcgV29ya2VyKCcvZGlzdC9zY3JpcHQtdHJhbnNmb3JtLXdvcmtlci5qcycpO1xuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB3b3JrZXIub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5kYXRhID09PSAncmVnaXN0ZXJlZCcpIHtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgY29uc3Qgc2VuZGVyVHJhbnNmb3JtID0gbmV3IFJUQ1J0cFNjcmlwdFRyYW5zZm9ybSh3b3JrZXIsIHsgbmFtZTogJ291dGdvaW5nJywgcG9ydDogdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQyIH0sIFt0aGF0LnNlbmRlckNoYW5uZWwucG9ydDJdKTtcbiAgICAgIHNlbmRlclRyYW5zZm9ybS5wb3J0ID0gdGhhdC5zZW5kZXJDaGFubmVsLnBvcnQxO1xuICAgICAgc2VuZGVyLnRyYW5zZm9ybSA9IHNlbmRlclRyYW5zZm9ybTtcbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlKHJlc29sdmUgPT4gd29ya2VyLm9ubWVzc2FnZSA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXZlbnQuZGF0YSA9PT0gJ3N0YXJ0ZWQnKSB7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHRoYXQuc2VuZGVyQ2hhbm5lbC5wb3J0MS5wb3N0TWVzc2FnZSh7IHdhdGVybWFyazogdGhhdC5tb2NhcERhdGEgfSk7XG4gICAgfVxuICB9XG5cbiAgYXN5bmMgcmVjcmVhdGVEZWNvZGVyKCl7XG4gICAgdGhpcy5jcmVhdGVEZWNvZGVyKHRoaXMucl9yZWNlaXZlcix0aGlzLnJfY2xpZW50SWQpO1xuICB9XG5cbiAgYXN5bmMgY3JlYXRlRGVjb2RlcihyZWNlaXZlcixjbGllbnRJZCkge1xuICAgIGlmICh0aGlzLmlzQ2hyb21lKSB7XG4gICAgICBjb25zdCBzdHJlYW1zID0gcmVjZWl2ZXIuY3JlYXRlRW5jb2RlZFN0cmVhbXMoKTtcbiAgICAgIGNvbnN0IHRleHREZWNvZGVyID0gbmV3IFRleHREZWNvZGVyKCk7XG4gICAgICB2YXIgdGhhdD10aGlzO1xuXG4gICAgICBjb25zdCB0cmFuc2Zvcm1lciA9IG5ldyBUcmFuc2Zvcm1TdHJlYW0oe1xuICAgICAgICB0cmFuc2Zvcm0oY2h1bmssIGNvbnRyb2xsZXIpIHtcbiAgICAgICAgICBjb25zdCB2aWV3ID0gbmV3IERhdGFWaWV3KGNodW5rLmRhdGEpOyAgXG4gICAgICAgICAgY29uc3QgbWFnaWNEYXRhID0gbmV3IFVpbnQ4QXJyYXkoY2h1bmsuZGF0YSwgY2h1bmsuZGF0YS5ieXRlTGVuZ3RoIC0gdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoLCB0aGF0LkN1c3RvbURhdGFEZXRlY3Rvci5sZW5ndGgpO1xuICAgICAgICAgIGxldCBtYWdpYyA9IFtdO1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhhdC5DdXN0b21EYXRhRGV0ZWN0b3IubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIG1hZ2ljLnB1c2gobWFnaWNEYXRhW2ldKTtcblxuICAgICAgICAgIH1cbiAgICAgICAgICBsZXQgbWFnaWNTdHJpbmcgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKC4uLm1hZ2ljKTtcbiAgICAgICAgICBpZiAobWFnaWNTdHJpbmcgPT09IHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yKSB7XG4gICAgICAgICAgICBjb25zdCBtb2NhcExlbiA9IHZpZXcuZ2V0VWludDMyKGNodW5rLmRhdGEuYnl0ZUxlbmd0aCAtICh0aGF0LkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudCArIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCksIGZhbHNlKTtcbiAgICAgICAgICAgIGNvbnN0IGZyYW1lU2l6ZSA9IGNodW5rLmRhdGEuYnl0ZUxlbmd0aCAtIChtb2NhcExlbiArIHRoYXQuQ3VzdG9tRGF0TGVuZ3RoQnl0ZUNvdW50ICsgIHRoYXQuQ3VzdG9tRGF0YURldGVjdG9yLmxlbmd0aCk7XG4gICAgICAgICAgICBjb25zdCBtb2NhcEJ1ZmZlciA9IG5ldyBVaW50OEFycmF5KGNodW5rLmRhdGEsIGZyYW1lU2l6ZSwgbW9jYXBMZW4pO1xuICAgICAgICAgICAgY29uc3QgbW9jYXAgPSB0ZXh0RGVjb2Rlci5kZWNvZGUobW9jYXBCdWZmZXIpICAgICAgICBcbiAgICAgICAgICAgIGlmIChtb2NhcC5sZW5ndGg+MCkge1xuICAgICAgICAgICAgICB3aW5kb3cucmVtb3RlTW9jYXAobW9jYXArXCIsXCIrY2xpZW50SWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZnJhbWUgPSBjaHVuay5kYXRhO1xuICAgICAgICAgICAgY2h1bmsuZGF0YSA9IG5ldyBBcnJheUJ1ZmZlcihmcmFtZVNpemUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyBVaW50OEFycmF5KGNodW5rLmRhdGEpO1xuICAgICAgICAgICAgZGF0YS5zZXQobmV3IFVpbnQ4QXJyYXkoZnJhbWUsIDAsIGZyYW1lU2l6ZSkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb250cm9sbGVyLmVucXVldWUoY2h1bmspO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIHN0cmVhbXMucmVhZGFibGUucGlwZVRocm91Z2godHJhbnNmb3JtZXIpLnBpcGVUbyhzdHJlYW1zLndyaXRhYmxlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5yZWNlaXZlckNoYW5uZWwgPSBuZXcgTWVzc2FnZUNoYW5uZWw7XG4gICAgICB2YXIgdGhhdD10aGlzO1xuICAgICAgY29uc3Qgd29ya2VyID0gbmV3IFdvcmtlcignL2Rpc3Qvc2NyaXB0LXRyYW5zZm9ybS13b3JrZXIuanMnKTtcblxuICAgICAgY29uc29sZS53YXJuKFwiaW5jb21pbmcgMVwiLGNsaWVudElkLHdvcmtlcik7XG4gICAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHdvcmtlci5vbm1lc3NhZ2UgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2ZW50LmRhdGEgPT09ICdyZWdpc3RlcmVkJykge1xuICAgICAgICAgIFxuICAgICAgICAgIGNvbnNvbGUud2FybihcImluY29taW5nIDJhXCIsY2xpZW50SWQsZXZlbnQuZGF0YSApO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLndhcm4oXCJpbmNvbWluZyAyXCIsY2xpZW50SWQsZXZlbnQuZGF0YSApO1xuICAgICAgfSk7XG4gIFxuICAgICAgY29uc29sZS53YXJuKFwiaW5jb21pbmcgM1wiICxjbGllbnRJZCk7XG5cbiAgICAgIGNvbnN0IHJlY2VpdmVyVHJhbnNmb3JtID0gbmV3IFJUQ1J0cFNjcmlwdFRyYW5zZm9ybSh3b3JrZXIsIHsgbmFtZTogJ2luY29taW5nJywgcG9ydDogdGhhdC5yZWNlaXZlckNoYW5uZWwucG9ydDIgfSwgW3RoYXQucmVjZWl2ZXJDaGFubmVsLnBvcnQyXSk7XG4gICAgICBcbiAgICAgIGNvbnNvbGUud2FybihcImluY29taW5nIDRcIixjbGllbnRJZCxyZWNlaXZlclRyYW5zZm9ybSApO1xuXG4gICAgICByZWNlaXZlclRyYW5zZm9ybS5wb3J0ID0gdGhhdC5yZWNlaXZlckNoYW5uZWwucG9ydDE7XG4gICAgICByZWNlaXZlci50cmFuc2Zvcm0gPSByZWNlaXZlclRyYW5zZm9ybTtcbiAgICAgIHJlY2VpdmVyVHJhbnNmb3JtLnBvcnQub25tZXNzYWdlID0gZSA9PiB7XG4gICAgICAgIC8vY29uc29sZS53YXJuKFwid2Fob28gaW5cIixlKTtcbiAgICAgICAgaWYgKHRoaXMubG9naSsrPjUwKSB7XG4gICAgICAgLy8gICBjb25zb2xlLndhcm4oXCJ3YWhvbyBpbiBmcm9tIFwiLGNsaWVudElkKTtcbiAgICAgICAgICB0aGlzLmxvZ2k9MDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZS5kYXRhLmxlbmd0aD4wKSB7XG4gICAgICAgICAgd2luZG93LnJlbW90ZU1vY2FwKGUuZGF0YStcIixcIitjbGllbnRJZCk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gIFxuICAgICAgYXdhaXQgbmV3IFByb21pc2UocmVzb2x2ZSA9PiB3b3JrZXIub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7XG4gICAgICAgIGlmIChldmVudC5kYXRhID09PSAnc3RhcnRlZCcpIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJpbmNvbWluZyA1YVwiLGNsaWVudElkLGV2ZW50LmRhdGEgKTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS53YXJuKFwiaW5jb21pbmcgNVwiLGNsaWVudElkLGV2ZW50LmRhdGEgKTtcblxuICAgICAgfSk7XG4gICAgICBjb25zb2xlLndhcm4oXCJpbmNvbWluZyA2XCIsY2xpZW50SWQgKTtcbiAgICB9XG4gIH0gIFxuICBzZW5kRGF0YShjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2VuZERhdGEgXCIsIGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgLy8gc2VuZCB2aWEgd2VicnRjIG90aGVyd2lzZSBmYWxsYmFjayB0byB3ZWJzb2NrZXRzXG4gICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKGNsaWVudElkLCBkYXRhVHlwZSwgZGF0YSk7XG4gIH1cblxuICBzZW5kRGF0YUd1YXJhbnRlZWQoY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIHNlbmREYXRhR3VhcmFudGVlZCBcIiwgY2xpZW50SWQsIGRhdGFUeXBlLCBkYXRhKTtcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGFXUyhjbGllbnRJZCwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgYnJvYWRjYXN0RGF0YShkYXRhVHlwZSwgZGF0YSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBicm9hZGNhc3REYXRhIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIHJvb21PY2N1cGFudHMgPSB0aGlzLmVhc3lydGMuZ2V0Um9vbU9jY3VwYW50c0FzTWFwKHRoaXMucm9vbSk7XG5cbiAgICAvLyBJdGVyYXRlIG92ZXIgdGhlIGtleXMgb2YgdGhlIGVhc3lydGMgcm9vbSBvY2N1cGFudHMgbWFwLlxuICAgIC8vIGdldFJvb21PY2N1cGFudHNBc0FycmF5IHVzZXMgT2JqZWN0LmtleXMgd2hpY2ggYWxsb2NhdGVzIG1lbW9yeS5cbiAgICBmb3IgKHZhciByb29tT2NjdXBhbnQgaW4gcm9vbU9jY3VwYW50cykge1xuICAgICAgaWYgKHJvb21PY2N1cGFudHNbcm9vbU9jY3VwYW50XSAmJiByb29tT2NjdXBhbnQgIT09IHRoaXMuZWFzeXJ0Yy5teUVhc3lydGNpZCkge1xuICAgICAgICAvLyBzZW5kIHZpYSB3ZWJydGMgb3RoZXJ3aXNlIGZhbGxiYWNrIHRvIHdlYnNvY2tldHNcbiAgICAgICAgdGhpcy5lYXN5cnRjLnNlbmREYXRhKHJvb21PY2N1cGFudCwgZGF0YVR5cGUsIGRhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkKGRhdGFUeXBlLCBkYXRhKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGJyb2FkY2FzdERhdGFHdWFyYW50ZWVkIFwiLCBkYXRhVHlwZSwgZGF0YSk7XG4gICAgdmFyIGRlc3RpbmF0aW9uID0geyB0YXJnZXRSb29tOiB0aGlzLnJvb20gfTtcbiAgICB0aGlzLmVhc3lydGMuc2VuZERhdGFXUyhkZXN0aW5hdGlvbiwgZGF0YVR5cGUsIGRhdGEpO1xuICB9XG5cbiAgZ2V0Q29ubmVjdFN0YXR1cyhjbGllbnRJZCkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyBnZXRDb25uZWN0U3RhdHVzIFwiLCBjbGllbnRJZCk7XG4gICAgdmFyIHN0YXR1cyA9IHRoaXMuZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKTtcblxuICAgIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLklTX0NPTk5FQ1RFRCkge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5JU19DT05ORUNURUQ7XG4gICAgfSBlbHNlIGlmIChzdGF0dXMgPT0gdGhpcy5lYXN5cnRjLk5PVF9DT05ORUNURUQpIHtcbiAgICAgIHJldHVybiBOQUYuYWRhcHRlcnMuTk9UX0NPTk5FQ1RFRDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIE5BRi5hZGFwdGVycy5DT05ORUNUSU5HO1xuICAgIH1cbiAgfVxuXG4gIGdldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW1OYW1lID0gXCJhdWRpb1wiKSB7XG5cbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZ2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICAvLyBpZiAoIHN0cmVhbU5hbWUgPSBcImF1ZGlvXCIpIHtcbiAgICAvL3N0cmVhbU5hbWUgPSBcImJvZF9hdWRpb1wiO1xuICAgIC8vfVxuXG4gICAgaWYgKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXSAmJiB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF1bc3RyZWFtTmFtZV0pIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYEFscmVhZHkgaGFkICR7c3RyZWFtTmFtZX0gZm9yICR7Y2xpZW50SWR9YCk7XG4gICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMubWVkaWFTdHJlYW1zW2NsaWVudElkXVtzdHJlYW1OYW1lXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIE5BRi5sb2cud3JpdGUoYFdhaXRpbmcgb24gJHtzdHJlYW1OYW1lfSBmb3IgJHtjbGllbnRJZH1gKTtcblxuICAgICAgLy8gQ3JlYXRlIGluaXRpYWwgcGVuZGluZ01lZGlhUmVxdWVzdHMgd2l0aCBhdWRpb3x2aWRlbyBhbGlhc1xuICAgICAgaWYgKCF0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmhhcyhjbGllbnRJZCkpIHtcbiAgICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB7fTtcblxuICAgICAgICBjb25zdCBhdWRpb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gQXVkaW8gRXJyb3JgLCBlKSk7XG5cbiAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMuYXVkaW8ucHJvbWlzZSA9IGF1ZGlvUHJvbWlzZTtcblxuICAgICAgICBjb25zdCB2aWRlb1Byb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8gPSB7IHJlc29sdmUsIHJlamVjdCB9O1xuICAgICAgICB9KS5jYXRjaChlID0+IE5BRi5sb2cud2FybihgJHtjbGllbnRJZH0gZ2V0TWVkaWFTdHJlYW0gVmlkZW8gRXJyb3JgLCBlKSk7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnByb21pc2UgPSB2aWRlb1Byb21pc2U7XG5cbiAgICAgICAgdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5zZXQoY2xpZW50SWQsIHBlbmRpbmdNZWRpYVJlcXVlc3RzKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcGVuZGluZ01lZGlhUmVxdWVzdHMgPSB0aGlzLnBlbmRpbmdNZWRpYVJlcXVlc3RzLmdldChjbGllbnRJZCk7XG5cbiAgICAgIC8vIENyZWF0ZSBpbml0aWFsIHBlbmRpbmdNZWRpYVJlcXVlc3RzIHdpdGggc3RyZWFtTmFtZVxuICAgICAgaWYgKCFwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXSkge1xuICAgICAgICBjb25zdCBzdHJlYW1Qcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdID0geyByZXNvbHZlLCByZWplY3QgfTtcbiAgICAgICAgfSkuY2F0Y2goZSA9PiBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IGdldE1lZGlhU3RyZWFtIFwiJHtzdHJlYW1OYW1lfVwiIEVycm9yYCwgZSkpO1xuICAgICAgICBwZW5kaW5nTWVkaWFSZXF1ZXN0c1tzdHJlYW1OYW1lXS5wcm9taXNlID0gc3RyZWFtUHJvbWlzZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXMucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKVtzdHJlYW1OYW1lXS5wcm9taXNlO1xuICAgIH1cbiAgfVxuXG4gIHNldE1lZGlhU3RyZWFtKGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgc2V0TWVkaWFTdHJlYW0gXCIsIGNsaWVudElkLCBzdHJlYW0sIHN0cmVhbU5hbWUpO1xuICAgIGNvbnN0IHBlbmRpbmdNZWRpYVJlcXVlc3RzID0gdGhpcy5wZW5kaW5nTWVkaWFSZXF1ZXN0cy5nZXQoY2xpZW50SWQpOyAvLyByZXR1cm4gdW5kZWZpbmVkIGlmIHRoZXJlIGlzIG5vIGVudHJ5IGluIHRoZSBNYXBcbiAgICBjb25zdCBjbGllbnRNZWRpYVN0cmVhbXMgPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gPSB0aGlzLm1lZGlhU3RyZWFtc1tjbGllbnRJZF0gfHwge307XG5cbiAgICBpZiAoc3RyZWFtTmFtZSA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAvLyBTYWZhcmkgZG9lc24ndCBsaWtlIGl0IHdoZW4geW91IHVzZSBhIG1peGVkIG1lZGlhIHN0cmVhbSB3aGVyZSBvbmUgb2YgdGhlIHRyYWNrcyBpcyBpbmFjdGl2ZSwgc28gd2VcbiAgICAgIC8vIHNwbGl0IHRoZSB0cmFja3MgaW50byB0d28gc3RyZWFtcy5cbiAgICAgIC8vIEFkZCBtZWRpYVN0cmVhbXMgYXVkaW8gc3RyZWFtTmFtZSBhbGlhc1xuICAgICAgY29uc3QgYXVkaW9UcmFja3MgPSBzdHJlYW0uZ2V0QXVkaW9UcmFja3MoKTtcbiAgICAgIGlmIChhdWRpb1RyYWNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXVkaW9UcmFja3MuZm9yRWFjaCh0cmFjayA9PiBhdWRpb1N0cmVhbS5hZGRUcmFjayh0cmFjaykpO1xuICAgICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgTkFGLmxvZy53YXJuKGAke2NsaWVudElkfSBzZXRNZWRpYVN0cmVhbSBcImF1ZGlvXCIgYWxpYXMgRXJyb3JgLCBlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGF1ZGlvIGFsaWFzIGlmIGl0IGV4aXN0cy5cbiAgICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzKSBwZW5kaW5nTWVkaWFSZXF1ZXN0cy5hdWRpby5yZXNvbHZlKGF1ZGlvU3RyZWFtKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWRkIG1lZGlhU3RyZWFtcyB2aWRlbyBzdHJlYW1OYW1lIGFsaWFzXG4gICAgICBjb25zdCB2aWRlb1RyYWNrcyA9IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpO1xuICAgICAgaWYgKHZpZGVvVHJhY2tzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgY29uc3QgdmlkZW9TdHJlYW0gPSBuZXcgTWVkaWFTdHJlYW0oKTtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICB2aWRlb1RyYWNrcy5mb3JFYWNoKHRyYWNrID0+IHZpZGVvU3RyZWFtLmFkZFRyYWNrKHRyYWNrKSk7XG4gICAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBOQUYubG9nLndhcm4oYCR7Y2xpZW50SWR9IHNldE1lZGlhU3RyZWFtIFwidmlkZW9cIiBhbGlhcyBFcnJvcmAsIGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVzb2x2ZSB0aGUgcHJvbWlzZSBmb3IgdGhlIHVzZXIncyBtZWRpYSBzdHJlYW0gdmlkZW8gYWxpYXMgaWYgaXQgZXhpc3RzLlxuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLnZpZGVvLnJlc29sdmUodmlkZW9TdHJlYW0pO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjbGllbnRNZWRpYVN0cmVhbXNbc3RyZWFtTmFtZV0gPSBzdHJlYW07XG5cbiAgICAgIC8vIFJlc29sdmUgdGhlIHByb21pc2UgZm9yIHRoZSB1c2VyJ3MgbWVkaWEgc3RyZWFtIGJ5IFN0cmVhbU5hbWUgaWYgaXQgZXhpc3RzLlxuICAgICAgaWYgKHBlbmRpbmdNZWRpYVJlcXVlc3RzICYmIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdKSB7XG4gICAgICAgIHBlbmRpbmdNZWRpYVJlcXVlc3RzW3N0cmVhbU5hbWVdLnJlc29sdmUoc3RyZWFtKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBnZXRJbnRCeXRlcyh4KSB7XG4gICAgdmFyIGJ5dGVzID0gW107XG4gICAgdmFyIGkgPSB0aGlzLkN1c3RvbURhdExlbmd0aEJ5dGVDb3VudDtcbiAgICBkbyB7XG4gICAgICBieXRlc1stLWldID0geCAmICgyNTUpO1xuICAgICAgeCA9IHggPj4gODtcbiAgICB9IHdoaWxlIChpKVxuICAgIHJldHVybiBieXRlcztcbiAgfVxuXG4gIGFkZExvY2FsTWVkaWFTdHJlYW0oc3RyZWFtLCBzdHJlYW1OYW1lKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGFkZExvY2FsTWVkaWFTdHJlYW0gXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgY29uc3QgZWFzeXJ0YyA9IHRoaXMuZWFzeXJ0YztcbiAgICBzdHJlYW1OYW1lID0gc3RyZWFtTmFtZSB8fCBzdHJlYW0uaWQ7XG4gICAgdGhpcy5zZXRNZWRpYVN0cmVhbShcImxvY2FsXCIsIHN0cmVhbSwgc3RyZWFtTmFtZSk7XG4gICAgZWFzeXJ0Yy5yZWdpc3RlcjNyZFBhcnR5TG9jYWxNZWRpYVN0cmVhbShzdHJlYW0sIHN0cmVhbU5hbWUpO1xuXG4gICAgLy8gQWRkIGxvY2FsIHN0cmVhbSB0byBleGlzdGluZyBjb25uZWN0aW9uc1xuICAgIE9iamVjdC5rZXlzKHRoaXMucmVtb3RlQ2xpZW50cykuZm9yRWFjaChjbGllbnRJZCA9PiB7XG4gICAgICBpZiAoZWFzeXJ0Yy5nZXRDb25uZWN0U3RhdHVzKGNsaWVudElkKSAhPT0gZWFzeXJ0Yy5OT1RfQ09OTkVDVEVEKSB7XG4gICAgICAgIGVhc3lydGMuYWRkU3RyZWFtVG9DYWxsKGNsaWVudElkLCBzdHJlYW1OYW1lKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHJlbW92ZUxvY2FsTWVkaWFTdHJlYW0oc3RyZWFtTmFtZSkge1xuICAgIGNvbnNvbGUubG9nKFwiQlc3MyByZW1vdmVMb2NhbE1lZGlhU3RyZWFtIFwiLCBzdHJlYW1OYW1lKTtcbiAgICB0aGlzLmVhc3lydGMuY2xvc2VMb2NhbE1lZGlhU3RyZWFtKHN0cmVhbU5hbWUpO1xuICAgIGRlbGV0ZSB0aGlzLm1lZGlhU3RyZWFtc1tcImxvY2FsXCJdW3N0cmVhbU5hbWVdO1xuICB9XG5cbiAgZW5hYmxlTWljcm9waG9uZShlbmFibGVkKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGVuYWJsZU1pY3JvcGhvbmUgXCIsIGVuYWJsZWQpO1xuICAgIHRoaXMuZWFzeXJ0Yy5lbmFibGVNaWNyb3Bob25lKGVuYWJsZWQpO1xuICB9XG5cbiAgZW5hYmxlQ2FtZXJhKGVuYWJsZWQpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZW5hYmxlQ2FtZXJhIFwiLCBlbmFibGVkKTtcbiAgICB0aGlzLmVhc3lydGMuZW5hYmxlQ2FtZXJhKGVuYWJsZWQpO1xuICB9XG5cbiAgZGlzY29ubmVjdCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkJXNzMgZGlzY29ubmVjdCBcIik7XG4gICAgdGhpcy5lYXN5cnRjLmRpc2Nvbm5lY3QoKTtcbiAgfVxuXG4gIGFzeW5jIGhhbmRsZVVzZXJQdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7IH1cblxuICBoYW5kbGVVc2VyVW5wdWJsaXNoZWQodXNlciwgbWVkaWFUeXBlKSB7XG4gICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJVblB1Ymxpc2hlZCBcIik7XG4gIH1cblxuICAgZ2V0SW5wdXRMZXZlbCh0cmFjaykge1xuICAgIHZhciBhbmFseXNlciA9IHRyYWNrLl9zb3VyY2Uudm9sdW1lTGV2ZWxBbmFseXNlci5hbmFseXNlck5vZGU7XG4gICAgLy92YXIgYW5hbHlzZXIgPSB0cmFjay5fc291cmNlLmFuYWx5c2VyTm9kZTtcbiAgICBjb25zdCBidWZmZXJMZW5ndGggPSBhbmFseXNlci5mcmVxdWVuY3lCaW5Db3VudDtcbiAgICB2YXIgZGF0YSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlckxlbmd0aCk7XG4gICAgYW5hbHlzZXIuZ2V0Qnl0ZUZyZXF1ZW5jeURhdGEoZGF0YSk7XG4gICAgdmFyIHZhbHVlcyA9IDA7XG4gICAgdmFyIGF2ZXJhZ2U7XG4gICAgdmFyIGxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlcyArPSBkYXRhW2ldO1xuICAgIH1cbiAgICBhdmVyYWdlID0gTWF0aC5mbG9vcih2YWx1ZXMgLyBsZW5ndGgpO1xuICAgIHJldHVybiBhdmVyYWdlO1xuICB9XG5cbiAgIHZvaWNlQWN0aXZpdHlEZXRlY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl92YWRfYXVkaW9UcmFjayB8fCAhdGhpcy5fdmFkX2F1ZGlvVHJhY2suX2VuYWJsZWQpXG4gICAgICByZXR1cm47XG5cbiAgICB2YXIgYXVkaW9MZXZlbCA9IHRoaXMuZ2V0SW5wdXRMZXZlbCh0aGlzLl92YWRfYXVkaW9UcmFjayk7XG4gICAgaWYgKGF1ZGlvTGV2ZWwgPD0gdGhpcy5fdmFkX01heEJhY2tncm91bmROb2lzZUxldmVsKSB7XG4gICAgICBpZiAodGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0Fyci5sZW5ndGggPj0gdGhpcy5fdmFkX01heEF1ZGlvU2FtcGxlcykge1xuICAgICAgICB2YXIgcmVtb3ZlZCA9IHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnIuc2hpZnQoKTtcbiAgICAgICAgdmFyIHJlbW92ZWRJbmRleCA9IHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQuaW5kZXhPZihyZW1vdmVkKTtcbiAgICAgICAgaWYgKHJlbW92ZWRJbmRleCA+IC0xKSB7XG4gICAgICAgICAgdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZC5zcGxpY2UocmVtb3ZlZEluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0Fyci5wdXNoKGF1ZGlvTGV2ZWwpO1xuICAgICAgdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZC5wdXNoKGF1ZGlvTGV2ZWwpO1xuICAgICAgdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZC5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gICAgfVxuICAgIHZhciBiYWNrZ3JvdW5kID0gTWF0aC5mbG9vcigzICogdGhpcy5fdmFkX2F1ZGlvU2FtcGxlc0FyclNvcnRlZFtNYXRoLmZsb29yKHRoaXMuX3ZhZF9hdWRpb1NhbXBsZXNBcnJTb3J0ZWQubGVuZ3RoIC8gMildIC8gMik7XG4gICAgaWYgKGF1ZGlvTGV2ZWwgPiBiYWNrZ3JvdW5kICsgdGhpcy5fdmFkX1NpbGVuY2VPZmZlc2V0KSB7XG4gICAgICB0aGlzLl92YWRfZXhjZWVkQ291bnQrKztcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fdmFkX2V4Y2VlZENvdW50ID0gMDtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fdmFkX2V4Y2VlZENvdW50ID4gdGhpcy5fdmFkX2V4Y2VlZENvdW50VGhyZXNob2xkTG93KSB7XG4gICAgICAvL0Fnb3JhUlRDVXRpbEV2ZW50cy5lbWl0KFwiVm9pY2VBY3Rpdml0eURldGVjdGVkRmFzdFwiLCB0aGlzLl92YWRfZXhjZWVkQ291bnQpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl92YWRfZXhjZWVkQ291bnQgPiB0aGlzLl92YWRfZXhjZWVkQ291bnRUaHJlc2hvbGQpIHtcbiAgICAgIC8vQWdvcmFSVENVdGlsRXZlbnRzLmVtaXQoXCJWb2ljZUFjdGl2aXR5RGV0ZWN0ZWRcIiwgdGhpcy5fdmFkX2V4Y2VlZENvdW50KTtcbiAgICAgIHRoaXMuX3ZhZF9leGNlZWRDb3VudCA9IDA7XG4gICAgICB3aW5kb3cuX3N0YXRlX3N0b3BfYXQ9RGF0ZS5ub3coKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJWQUQgXCIsRGF0ZS5ub3coKS13aW5kb3cuX3N0YXRlX3N0b3BfYXQpO1xuICAgIH1cblxuICB9XG5cbiAgYXN5bmMgY29ubmVjdEFnb3JhKCkge1xuICAgIC8vIEFkZCBhbiBldmVudCBsaXN0ZW5lciB0byBwbGF5IHJlbW90ZSB0cmFja3Mgd2hlbiByZW1vdGUgdXNlciBwdWJsaXNoZXMuXG4gICAgdmFyIHRoYXQgPSB0aGlzO1xuXG4gICAgdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlb0ZpbHRlcmVkIHx8IHRoaXMuZW5hYmxlVmlkZW8gfHwgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJydGNcIiwgY29kZWM6IFwidnA4XCIgfSk7XG4gICAgICAvL3RoaXMuYWdvcmFDbGllbnQgPSBBZ29yYVJUQy5jcmVhdGVDbGllbnQoeyBtb2RlOiBcImxpdmVcIiwgY29kZWM6IFwiaDI2NFwiIH0pO1xuICAgICAgdGhpcy5hZ29yYUNsaWVudC5zZXRDbGllbnRSb2xlKFwiaG9zdFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy90aGlzLmFnb3JhQ2xpZW50ID0gQWdvcmFSVEMuY3JlYXRlQ2xpZW50KHsgbW9kZTogXCJsaXZlXCIsIGNvZGVjOiBcImgyNjRcIiB9KTtcbiAgICAgIC8vdGhpcy5hZ29yYUNsaWVudCA9IEFnb3JhUlRDLmNyZWF0ZUNsaWVudCh7IG1vZGU6IFwibGl2ZVwiLCBjb2RlYzogXCJ2cDhcIiB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci1qb2luZWRcIiwgYXN5bmMgKHVzZXIpID0+IHtcbiAgICAgIGNvbnNvbGUud2FybihcInVzZXItam9pbmVkXCIsIHVzZXIpO1xuICAgIH0pO1xuICAgIHRoaXMuYWdvcmFDbGllbnQub24oXCJ1c2VyLXB1Ymxpc2hlZFwiLCBhc3luYyAodXNlciwgbWVkaWFUeXBlKSA9PiB7XG4gICAgICByZXR1cm47XG4gICAgICBsZXQgY2xpZW50SWQgPSB1c2VyLnVpZDtcbiAgICAgIGNvbnNvbGUubG9nKFwiQlc3MyBoYW5kbGVVc2VyUHVibGlzaGVkIFwiICsgY2xpZW50SWQgKyBcIiBcIiArIG1lZGlhVHlwZSwgdGhhdC5hZ29yYUNsaWVudCk7XG4gICAgICBhd2FpdCB0aGF0LmFnb3JhQ2xpZW50LnN1YnNjcmliZSh1c2VyLCBtZWRpYVR5cGUpO1xuICAgICAgY29uc29sZS5sb2coXCJCVzczIGhhbmRsZVVzZXJQdWJsaXNoZWQyIFwiICsgY2xpZW50SWQgKyBcIiBcIiArIHRoYXQuYWdvcmFDbGllbnQpO1xuXG4gICAgICBjb25zdCBwZW5kaW5nTWVkaWFSZXF1ZXN0cyA9IHRoYXQucGVuZGluZ01lZGlhUmVxdWVzdHMuZ2V0KGNsaWVudElkKTtcbiAgICAgIGNvbnN0IGNsaWVudE1lZGlhU3RyZWFtcyA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSA9IHRoYXQubWVkaWFTdHJlYW1zW2NsaWVudElkXSB8fCB7fTtcblxuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICB1c2VyLmF1ZGlvVHJhY2sucGxheSgpO1xuXG4gICAgICAgIGNvbnN0IGF1ZGlvU3RyZWFtID0gbmV3IE1lZGlhU3RyZWFtKCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwidXNlci5hdWRpb1RyYWNrIFwiLCB1c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICAvL2F1ZGlvU3RyZWFtLmFkZFRyYWNrKHVzZXIuYXVkaW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjayk7XG4gICAgICAgIGNsaWVudE1lZGlhU3RyZWFtcy5hdWRpbyA9IGF1ZGlvU3RyZWFtO1xuICAgICAgICBpZiAocGVuZGluZ01lZGlhUmVxdWVzdHMpIHBlbmRpbmdNZWRpYVJlcXVlc3RzLmF1ZGlvLnJlc29sdmUoYXVkaW9TdHJlYW0pO1xuICAgICAgfVxuXG4gICAgICBsZXQgdmlkZW9TdHJlYW0gPSBudWxsO1xuICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICB2aWRlb1N0cmVhbSA9IG5ldyBNZWRpYVN0cmVhbSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInVzZXIudmlkZW9UcmFjayBcIiwgdXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgdmlkZW9TdHJlYW0uYWRkVHJhY2sodXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrKTtcbiAgICAgICAgY2xpZW50TWVkaWFTdHJlYW1zLnZpZGVvID0gdmlkZW9TdHJlYW07XG4gICAgICAgIGlmIChwZW5kaW5nTWVkaWFSZXF1ZXN0cykgcGVuZGluZ01lZGlhUmVxdWVzdHMudmlkZW8ucmVzb2x2ZSh2aWRlb1N0cmVhbSk7XG4gICAgICAgIC8vdXNlci52aWRlb1RyYWNrXG4gICAgICB9XG5cbiAgICAgIGlmIChjbGllbnRJZCA9PSAnQ0NDJykge1xuICAgICAgICBpZiAobWVkaWFUeXBlID09PSAndmlkZW8nKSB7XG4gICAgICAgICAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ2aWRlbzM2MFwiKS5zcmNPYmplY3Q9dmlkZW9TdHJlYW07XG4gICAgICAgICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNldEF0dHJpYnV0ZShcInNyY1wiLCB2aWRlb1N0cmVhbSk7XG4gICAgICAgICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNldEF0dHJpYnV0ZShcInNyY1wiLCB1c2VyLnZpZGVvVHJhY2suX21lZGlhU3RyZWFtVHJhY2spO1xuICAgICAgICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIiN2aWRlbzM2MFwiKS5zcmNPYmplY3Q9IHVzZXIudmlkZW9UcmFjay5fbWVkaWFTdHJlYW1UcmFjaztcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiI3ZpZGVvMzYwXCIpLnNyY09iamVjdCA9IHZpZGVvU3RyZWFtO1xuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIjdmlkZW8zNjBcIikucGxheSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZWRpYVR5cGUgPT09ICdhdWRpbycpIHtcbiAgICAgICAgICB1c2VyLmF1ZGlvVHJhY2sucGxheSgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoY2xpZW50SWQgPT0gJ0RERCcpIHtcbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ3ZpZGVvJykge1xuICAgICAgICAgIHVzZXIudmlkZW9UcmFjay5wbGF5KFwidmlkZW8zNjBcIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1lZGlhVHlwZSA9PT0gJ2F1ZGlvJykge1xuICAgICAgICAgIHVzZXIuYXVkaW9UcmFjay5wbGF5KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuXG4gICAgICBsZXQgZW5jX2lkPSduYSc7XG4gICAgICBpZiAobWVkaWFUeXBlID09PSAnYXVkaW8nKSB7XG4gICAgICAgIGVuY19pZD11c2VyLmF1ZGlvVHJhY2suX21lZGlhU3RyZWFtVHJhY2suaWQ7ICAgICAgIFxuICAgICAgfSBlbHNlIHtcbiAgICAgICAvLyBlbmNfaWQ9dXNlci52aWRlb1RyYWNrLl9tZWRpYVN0cmVhbVRyYWNrLmlkO1xuICAgICAgfVxuICAgIFxuICAgICAgLy9jb25zb2xlLndhcm4obWVkaWFUeXBlLGVuY19pZCk7ICAgIFxuICAgICAgY29uc3QgcGMgPXRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHJlY2VpdmVycyA9IHBjLmdldFJlY2VpdmVycygpOyAgXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlY2VpdmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAocmVjZWl2ZXJzW2ldLnRyYWNrICYmIHJlY2VpdmVyc1tpXS50cmFjay5pZD09PWVuY19pZCApIHtcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJNYXRjaFwiLG1lZGlhVHlwZSxlbmNfaWQpO1xuICAgICAgICAgIHRoaXMucl9yZWNlaXZlcj1yZWNlaXZlcnNbaV07XG4gICAgICAgICAgdGhpcy5yX2NsaWVudElkPWNsaWVudElkO1xuICAgICAgICAgIHRoaXMuY3JlYXRlRGVjb2Rlcih0aGlzLnJfcmVjZWl2ZXIsdGhpcy5yX2NsaWVudElkKTtcbiAgICAgIH1cbiAgICB9XG4gICAgXG4gICAgfSk7XG5cbiAgICB0aGlzLmFnb3JhQ2xpZW50Lm9uKFwidXNlci11bnB1Ymxpc2hlZFwiLCB0aGF0LmhhbmRsZVVzZXJVbnB1Ymxpc2hlZCk7XG5cbiAgICBjb25zb2xlLmxvZyhcImNvbm5lY3QgYWdvcmEgQUdPUkFNT0NBUCBcIik7XG4gICAgLy8gSm9pbiBhIGNoYW5uZWwgYW5kIGNyZWF0ZSBsb2NhbCB0cmFja3MuIEJlc3QgcHJhY3RpY2UgaXMgdG8gdXNlIFByb21pc2UuYWxsIGFuZCBydW4gdGhlbSBjb25jdXJyZW50bHkuXG4gICAgLy8gb1xuXG5cbiAgICBpZiAodGhpcy5lbmFibGVBdmF0YXIpIHtcbiAgICAgIHZhciBzdHJlYW0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xuICAgICAgICB0aGlzLmFnb3JhQ2xpZW50LmpvaW4odGhpcy5hcHBpZCwgdGhpcy5yb29tLCB0aGlzLnRva2VuIHx8IG51bGwsIHRoaXMuY2xpZW50SWQgfHwgbnVsbCksXG4gICAgICAgIEFnb3JhUlRDLmNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrKCksIEFnb3JhUlRDLmNyZWF0ZUN1c3RvbVZpZGVvVHJhY2soeyBtZWRpYVN0cmVhbVRyYWNrOiBzdHJlYW0uZ2V0VmlkZW9UcmFja3MoKVswXSB9KV0pO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvRmlsdGVyZWQgJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgdmFyIHN0cmVhbSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzX3NlY3JldFwiKS5jYXB0dXJlU3RyZWFtKDMwKTtcbiAgICAgIFt0aGlzLnVzZXJpZCwgdGhpcy5sb2NhbFRyYWNrcy5hdWRpb1RyYWNrLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2tdID0gYXdhaXQgUHJvbWlzZS5hbGwoW3RoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ3VzdG9tVmlkZW9UcmFjayh7IG1lZGlhU3RyZWFtVHJhY2s6IHN0cmVhbS5nZXRWaWRlb1RyYWNrcygpWzBdIH0pXSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgdGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgW3RoaXMudXNlcmlkLCB0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2ssIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSxcbiAgICAgICAgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayh7IGVuY29kZXJDb25maWc6ICc0ODBwXzInIH0pXSk7XG4gICAgfSBlbHNlIGlmICh0aGlzLmVuYWJsZVZpZGVvKSB7XG4gICAgICBbdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICAgIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlQ2FtZXJhVmlkZW9UcmFjayhcIjM2MHBfNFwiKV0pO1xuICAgIH0gZWxzZSBpZiAodGhpcy5lbmFibGVBdWRpbykge1xuICAgICAgLy9bdGhpcy51c2VyaWQsIHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFja10gPSBhd2FpdCBQcm9taXNlLmFsbChbXG4gICAgICAgIC8vIEpvaW4gdGhlIGNoYW5uZWwuXG4gICAgICAgIFxuICAgICAgLy8gIHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKSwgQWdvcmFSVEMuY3JlYXRlTWljcm9waG9uZUF1ZGlvVHJhY2soKV0pO1xuICAgICAgICBjb25zb2xlLmxvZyhcImNyZWF0ZU1pY3JvcGhvbmVBdWRpb1RyYWNrXCIpO1xuICAgICAgICAvKlxuICAgICAgICB0aGlzLl92YWRfYXVkaW9UcmFjayA9IHRoaXMubG9jYWxUcmFja3MuYXVkaW9UcmFjaztcbiAgICAgICAgaWYgKCF0aGlzLl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uSW50ZXJ2YWwpIHtcbiAgICAgICAgICB0aGlzLl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uSW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnZvaWNlQWN0aXZpdHlEZXRlY3Rpb24oKTtcbiAgICAgICAgICB9LCB0aGlzLl92b2ljZUFjdGl2aXR5RGV0ZWN0aW9uRnJlcXVlbmN5KTtcbiAgICAgICAgfSovXG4gICAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnVzZXJpZCA9IGF3YWl0IHRoaXMuYWdvcmFDbGllbnQuam9pbih0aGlzLmFwcGlkLCB0aGlzLnJvb20sIHRoaXMudG9rZW4gfHwgbnVsbCwgdGhpcy5jbGllbnRJZCB8fCBudWxsKTtcbiAgICB9XG5cblxuICAgIC8vIHNlbGVjdCBmYWNldGltZSBjYW1lcmEgaWYgZXhpc3RzXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gJiYgIXRoaXMuZW5hYmxlVmlkZW9GaWx0ZXJlZCkge1xuICAgICAgbGV0IGNhbXMgPSBhd2FpdCBBZ29yYVJUQy5nZXRDYW1lcmFzKCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNhbXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGNhbXNbaV0ubGFiZWwuaW5kZXhPZihcIkZhY2VUaW1lXCIpID09IDApIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcInNlbGVjdCBGYWNlVGltZSBjYW1lcmFcIiwgY2Ftc1tpXS5kZXZpY2VJZCk7XG4gICAgICAgICAgYXdhaXQgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLnNldERldmljZShjYW1zW2ldLmRldmljZUlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmICh0aGlzLmVuYWJsZVZpZGVvICYmIHRoaXMuc2hvd0xvY2FsKSB7XG4gICAgICB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2sucGxheShcImxvY2FsLXBsYXllclwiKTtcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE9MRCBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZzAgJiYgdGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrKSB7XG4gICAgICBjb25zdCBpbWdFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICBpbWdFbGVtZW50Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2UpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlNFRyBJTklUIFwiLCB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spO1xuICAgICAgICAgIHRoaXMudmlydHVhbEJhY2tncm91bmRJbnN0YW5jZSA9IGF3YWl0IFNlZ1BsdWdpbi5pbmplY3QodGhpcy5sb2NhbFRyYWNrcy52aWRlb1RyYWNrLCBcIi9hc3NldHMvd2FzbXMwXCIpLmNhdGNoKGNvbnNvbGUuZXJyb3IpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiU0VHIElOSVRFRFwiKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnZpcnR1YWxCYWNrZ3JvdW5kSW5zdGFuY2Uuc2V0T3B0aW9ucyh7IGVuYWJsZTogdHJ1ZSwgYmFja2dyb3VuZDogaW1nRWxlbWVudCB9KTtcbiAgICAgIH07XG4gICAgICBpbWdFbGVtZW50LnNyYyA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQUFRQUFBQURDQUlBQUFBN2xqbVJBQUFBRDBsRVFWUjRYbU5nK00rQVFEZzVBT2s5Qy9Wa29tellBQUFBQUVsRlRrU3VRbUNDJztcbiAgICB9XG5cbiAgICAvLyBFbmFibGUgdmlydHVhbCBiYWNrZ3JvdW5kIE5ldyBNZXRob2RcbiAgICBpZiAodGhpcy5lbmFibGVWaWRlbyAmJiB0aGlzLnZiZyAmJiB0aGlzLmxvY2FsVHJhY2tzLnZpZGVvVHJhY2spIHtcblxuICAgICAgdGhpcy5leHRlbnNpb24gPSBuZXcgVmlydHVhbEJhY2tncm91bmRFeHRlbnNpb24oKTtcbiAgICAgIEFnb3JhUlRDLnJlZ2lzdGVyRXh0ZW5zaW9ucyhbdGhpcy5leHRlbnNpb25dKTtcbiAgICAgIHRoaXMucHJvY2Vzc29yID0gdGhpcy5leHRlbnNpb24uY3JlYXRlUHJvY2Vzc29yKCk7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3Nvci5pbml0KFwiL2Fzc2V0cy93YXNtc1wiKTtcbiAgICAgIHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5waXBlKHRoaXMucHJvY2Vzc29yKS5waXBlKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjay5wcm9jZXNzb3JEZXN0aW5hdGlvbik7XG4gICAgICBhd2FpdCB0aGlzLnByb2Nlc3Nvci5zZXRPcHRpb25zKHsgdHlwZTogJ2NvbG9yJywgY29sb3I6IFwiIzAwZmYwMFwiIH0pO1xuICAgICAgYXdhaXQgdGhpcy5wcm9jZXNzb3IuZW5hYmxlKCk7XG4gICAgfVxuXG4gICAgd2luZG93LmxvY2FsVHJhY2tzID0gdGhpcy5sb2NhbFRyYWNrcztcblxuICAgIC8vIFB1Ymxpc2ggdGhlIGxvY2FsIHZpZGVvIGFuZCBhdWRpbyB0cmFja3MgdG8gdGhlIGNoYW5uZWwuXG4gICAgaWYgKHRoaXMuZW5hYmxlVmlkZW8gfHwgdGhpcy5lbmFibGVBdWRpbyB8fCB0aGlzLmVuYWJsZUF2YXRhcikge1xuICAgICAgLypcbiAgICAgIGlmICh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spXG4gICAgICAgIGF3YWl0IHRoaXMuYWdvcmFDbGllbnQucHVibGlzaCh0aGlzLmxvY2FsVHJhY2tzLmF1ZGlvVHJhY2spO1xuICAgICAgaWYgKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjaylcbiAgICAgICAgYXdhaXQgdGhpcy5hZ29yYUNsaWVudC5wdWJsaXNoKHRoaXMubG9jYWxUcmFja3MudmlkZW9UcmFjayk7XG4gICAgICAqL1xuICAgICAgY29uc29sZS5sb2coXCJwdWJsaXNoIHN1Y2Nlc3NcIik7XG4gICAgICAvKlxuICAgICAgY29uc3QgcGMgPXRoaXMuYWdvcmFDbGllbnQuX3AycENoYW5uZWwuY29ubmVjdGlvbi5wZWVyQ29ubmVjdGlvbjtcbiAgICAgIGNvbnN0IHNlbmRlcnMgPSBwYy5nZXRTZW5kZXJzKCk7XG4gICAgICBsZXQgaSA9IDA7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgc2VuZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VuZGVyc1tpXS50cmFjayAmJiAoc2VuZGVyc1tpXS50cmFjay5raW5kID09ICdhdWRpbycpKXsvL30gfHwgc2VuZGVyc1tpXS50cmFjay5raW5kID09ICd2aWRlbycgKSkge1xuICAgICAgICAgLy8gdGhpcy5jcmVhdGVFbmNvZGVyKHNlbmRlcnNbaV0pO1xuICAgICAgICAgY29uc29sZS5sb2coXCJBR09SQU1PQ0FQIFNLSVBzXCIpXG4gICAgICAgIH1cbiAgICAgIH0gXG4gICAgICAqLyAgICAgXG4gICAgfVxuXG4gICAgLy8gUlRNXG5cbiAgfVxuXG4gIC8qKlxuICAgKiBQcml2YXRlc1xuICAgKi9cblxuICBhc3luYyBfY29ubmVjdChjb25uZWN0U3VjY2VzcywgY29ubmVjdEZhaWx1cmUpIHtcbiAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgYXdhaXQgdGhhdC5lYXN5cnRjLmNvbm5lY3QodGhhdC5hcHAsIGNvbm5lY3RTdWNjZXNzLCBjb25uZWN0RmFpbHVyZSk7XG4gIH1cblxuICBfZ2V0Um9vbUpvaW5UaW1lKGNsaWVudElkKSB7XG4gICAgdmFyIG15Um9vbUlkID0gdGhpcy5yb29tOyAvL05BRi5yb29tO1xuICAgIHZhciBqb2luVGltZSA9IHRoaXMuZWFzeXJ0Yy5nZXRSb29tT2NjdXBhbnRzQXNNYXAobXlSb29tSWQpW2NsaWVudElkXS5yb29tSm9pblRpbWU7XG4gICAgcmV0dXJuIGpvaW5UaW1lO1xuICB9XG5cbiAgZ2V0U2VydmVyVGltZSgpIHtcbiAgICByZXR1cm4gRGF0ZS5ub3coKSArIHRoaXMuYXZnVGltZU9mZnNldDtcbiAgfVxufVxuXG5OQUYuYWRhcHRlcnMucmVnaXN0ZXIoXCJhZ29yYXJ0Y1wiLCBBZ29yYVJ0Y0FkYXB0ZXIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFnb3JhUnRjQWRhcHRlcjtcbiJdLCJzb3VyY2VSb290IjoiIn0=