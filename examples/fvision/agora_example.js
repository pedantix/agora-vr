/* Copyright (C) Omnivor, Inc - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * 
 * BY USING OR ACCESSING THIS SOFTWARE YOU AGREE AS FOLLOWS: 
 * 
 * THIS SOFTWARE IS PROVIDED BY OMNIVOR, INC. (“OMNIVOR”) ”AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL OMNIVOR BE LIABLE FOR ANY DIRECT, INDIRECT INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION: HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * 
 * YOU MAY NOT COPY THIS FILE OR THE CONTENTS THEREOF, EXCEPT AS REASONABLY NECESSARY TO VIEW CONTENT PRESENTED TO YOU BY AN AUTHORIZED LICENSEE OF OMNIVOR FOR YOUR OWN PERSONAL AND NON-COMMERCIAL USE.
 * 
 * THIS SOFTWARE INCLUDES PROPRIETARY, TRADE SECRET-INFORMATION OF OMNIVOR. YOU AGREE NOT TO USE THIS SOFTWARE FOR THE PURPOSE OF DEVELOPING ANY PRODUCT OR SERVICE THAT COMPETES WITH THE SOFTWARE OR OMNIVOR PRODUCTS OR TECHNOLOGY.
 * 
 * 
 */
 
class AgoraExample {
    constructor() {
        // If the current browser is not supported, bail out early.
        const supportedBrowser = OmniUtils.checkBrowserSupport();
        if (!supportedBrowser) {
            console.error('Unsupported browser.');
            return;
        }

        this.callManager = null;

        this.aframeRenderer=null;

        this.el=null;

        // This will hold containers for each remote volumetric participant.
        // This is just an example of how you can manage remote participants,
        // but the remote participant bookkeeping can be implemented in any
        // way to suit your specific needs.
        this.volumetricParticipants = [];

        // This will hold containers for each non-volumetric participant.
        this.audioParticipants = []

        //this.setupTHREE();
        this.setupUI();

        // Begin the render loop for updating the THREE.js scene and any holograms.
        //.renderLoop();
    }

    // Initialize the UI, register button click handlers, etc...
    setupUI() {
        this.roomNameInput = document.getElementById('room-input');
        this.connectButton = document.getElementById('connect-button');
        this.disconnectButton = document.getElementById('disconnect-button');

        this.connectButton.disabled = true;
        this.disconnectButton.disabled = true;

        this.roomNameInput.oninput = () => {
            if (this.roomNameInput.value.length > 0) {
                this.connectButton.disabled = false;
            } else {
                this.connectButton.disabled = true;
            }
        };

        this.connectButton.onclick = () => {
            this.connectButton.disabled = true;
            this.roomNameInput.disabled = true;

            // Connect to the call
            this.connect();

            this.disconnectButton.disabled = false;
        };

        this.disconnectButton.onclick = async () => {
            this.disconnectButton.disabled = true;

            // Disconnect from the call
            await this.disconnect();
        };
    }

    // Create a new CallManager and join a call.
    connect() {
        // Room name corresponds to IAgoraRTCClient's channel name.
        const roomName = this.roomNameInput.value;

        // Display name is not currently used, but should be a non-empty string.
        const displayName = "User";

        // The AgoraCallManager handles creating/joining a call 
        // and emits events for call state changes.
        this.callManager = new AgoraCallManager(roomName, displayName);

        // Register event handlers for all the CallManager events.
        this.callManager.addListener(CallManager.LOCAL_STREAM_ADDED,
            this.onLocalStreamAdded, this);
        this.callManager.addListener(CallManager.REMOTE_PARTICIPANT_JOINED,
            this.onRemoteParticipantJoined, this);
        this.callManager.addListener(CallManager.REMOTE_PARTICIPANT_LEFT,
            this.onRemoteParticipantLeft, this);
        this.callManager.addListener(CallManager.REMOTE_STREAM_UPDATED,
            this.onRemoteStreamUpdated, this);
        this.callManager.addListener(CallManager.STRUCTURE_DATA_RECEIVED,
            this.onStructureDataReceived, this);
        this.callManager.addListener(CallManager.REMOTE_PARTICIPANT_SPEAKING,
            this.onRemoteParticipantSpeaking, this);
        this.callManager.addListener(CallManager.EMOJI_RECEIVED,
            this.onEmojiReceived, this);
        this.callManager.addListener(CallManager.METADATA_RECEIVED,
            this.onMetadataReceived, this);
        this.callManager.addListener(CallManager.DISCONNECTED,
            this.onDisconnected, this);

        // Connect to the call using the following config:
        //
        // enableAudio:     Specifies whether audio from the default mic should be published.
        // 
        // enableVideo and 
        // sendVolumetric:  Specifies whether volumetric video should be published. 
        //                  Currently both of these options must be true if video
        //                  is to be published, and only volumetric video is supported.
        //                  Sending 2D video (e.g. from a webcam) is not currently
        //                  supported, but in the future it will be supported by
        //                  setting 'enableVideo' to true and 'sendVolumetric' to false.
        //
        // videoCodec:      Specify either CallManager.CODEC_VP8 or CallManager.CODEC_H264.
        //                  This parameter is ignored if not publishing video.
        const callConfig = {
            enableAudio: true,
            enableVideo: false,
            sendVolumetric: false,
            videoCodec: CallManager.CODEC_VP8
        };

        // Actually create and connect to the call.
        this.callManager.connect(callConfig);
    }

    async disconnect() {
        // Cleanup remote participants before disconnecting.
        const ids = this.callManager.getRemoteParticipantIds();
        for (const id of ids) {
            this.cleanupVideo(id);
            this.cleanupAudio(id);
        }

        // Begin the disconnect process. Final cleanup can be
        // done in the onDisconnected event handler.
        await this.callManager.disconnect();
    }

    // Called when the call has been configured and joined and our local media
    // is set up. If publishing volumetric video, this stream can be used (in
    // conjunction with onStructureDataReceived) to render the local hologram.
    onLocalStreamAdded(localStream, audioOnly) {
        // Since this demo does not publish volumetric video,
        // we don't need to do anything with the local stream.
    }

    // Called when a remote participant joins the call. This will only be
    // called if the remote participant is publishing media. If a participant
    // joins the call without publishing audio or video, they can view the call
    // but other participants will not be notified. 'sendingVolumetric' is a
    // boolean indicating whether the participant will be publishing volumetric
    // video or will just be publishing audio.
    onRemoteParticipantJoined(participantId, displayName, sendingVolumetric) {
        // Create the appropriate container for the newly added participant.
        if (sendingVolumetric) {
            const participant = {
                id: participantId,
                container: null, // Will contain a THREE.js object used to position the hologram in the scene.
                formaRenderer: null // Will contain the Forma Vision renderer once this participant's stream is ready.
            };
            this.volumetricParticipants.push(participant);
        } else {
            const participant = {
                id: participantId,
                audio: null // Will contain an audio element to play the remote participants audio.
            };
            this.audioParticipants.push(participant);
        }
    }

    // Called when a remote participant leaves the call.
    onRemoteParticipantLeft(participantId) {
        // Remove any audio-only resources.
        this.cleanupAudio(participantId);

        // Remove the Forma Vision renderer and its mesh from the scene.
        this.cleanupVideo(participantId);

        // Update the layout of the remaining holograms.
        this.updatePositions();
    }

    // Called when a remote participant's stream is added or its audio/video
    // tracks are updated. For a given participant, the same stream is always
    // provided even when its tracks are updated.
    onRemoteStreamUpdated(participantId, stream) {
        // If this participant is audio-only and we have not assigned
        // a stream to its audio element, do so now.
        const audioParticipant = this.audioParticipants.find(p => p.id === participantId);
        if (audioParticipant && audioParticipant.audio === null) {
            const audio = document.createElement('audio');
            audio.autoplay = true;
            audio.muted = false;
            audio.srcObject = stream;
            audio.crossOrigin = 'anonymous';
            audioParticipant.audio = audio;
        }

        // If this is a volumetric participant and the Forma Vision
        // renderer has not been created, do so now.
        let self=this;
        const volumetricParticipant = this.volumetricParticipants.find(p => p.id === participantId);
        if (volumetricParticipant && volumetricParticipant.formaRenderer === null) {

            // Setup the Forma Vision renderer.
            const formaRenderer = new OmniRendererTHREE(this.aframeRenderer, {}, (mesh) => {
                // This callback is called when the first frame of the hologram is ready.

             //   console.warn("MESH",mesh);
                window.mesh=mesh;

                const scale = 1 / 1000.0;
                mesh.scale.set(scale, scale, scale);                
                mesh.rotation.set(4.6,6.2,7);
                self.el.object3D.add(mesh);
            });

            // Assign the MediaStream to the Forma Vision renderer.
            formaRenderer.setVideoStream(stream);

            // Autoplay.
            formaRenderer.setContentLoadedCallback(() => {
                formaRenderer.play();
            });

            // Forma Vision renderers are muted by default, so unmute
            // in order to hear the remote participant.
            formaRenderer.setVolume(1.0);
            formaRenderer.setMuted(false);

            // Now that the Forma Vision renderer is configured,
            // call 'prepare' to initialize it.
            formaRenderer.prepare();
            console.warn(2);
            volumetricParticipant.formaRenderer = formaRenderer;
        }
    }

    // Called when a structure packet is received. If the structure data is for
    // the local participant, 'participantId' will be null. Structure data is
    // used, in conjunction with video frames, to render the holograms, so this
    // data must be passed to the appropriate Forma Vision renderer.
    onStructureDataReceived(participantId, data) {
        const participant = this.volumetricParticipants.find(p => p.id === participantId);
        if (participant && participant.formaRenderer) {
            // Structure data may take one of two forms: It will either be a
            // Uint8Array containing packed data, or it will be an object
            // containing header, frame number, and frame data as properties. These
            // two types of structure data need to be handled slightly differently.
          //  console.warn(3);
            if (data instanceof Uint8Array) {
                participant.formaRenderer.addStructureData(data);
            } else {
                participant.formaRenderer.addStructureFramePreV5(data.header,
                    data.frameNum, data.frameData);
            }
        }
    }

    // Called when a remote participant starts or stops speaking.
    // 'speaking' will be a bool indicating whether the specified
    // participant is speaking.
    onRemoteParticipantSpeaking(participantId, speaking) { }

    // Called when a remote participant sends an emoji.
    // 'message' will be a string containing the emoji.
    onEmojiReceived(participantId, message) { }

    // Called when a remote participant sends a metadata message.
    // 'message' will be a json string. These messages are sent by client apps,
    // and often contain position/rotation information which can be used to
    // visualize non-volumetric participants' location in the environment.
    onMetadataReceived(participantId, message) { }

    // Called when the call has fully disconnected.
    onDisconnected() {
        // Unregister from the event handlers.
        this.callManager.removeListener(CallManager.LOCAL_STREAM_ADDED,
            this.onLocalStreamAdded, this);
        this.callManager.removeListener(CallManager.REMOTE_PARTICIPANT_JOINED,
            this.onRemoteParticipantJoined, this);
        this.callManager.removeListener(CallManager.REMOTE_PARTICIPANT_LEFT,
            this.onRemoteParticipantLeft, this);
        this.callManager.removeListener(CallManager.REMOTE_STREAM_UPDATED,
            this.onRemoteStreamUpdated, this);
        this.callManager.removeListener(CallManager.STRUCTURE_DATA_RECEIVED,
            this.onStructureDataReceived, this);
        this.callManager.removeListener(CallManager.REMOTE_PARTICIPANT_SPEAKING,
            this.onRemoteParticipantSpeaking, this);
        this.callManager.removeListener(CallManager.EMOJI_RECEIVED,
            this.onEmojiReceived, this);
        this.callManager.removeListener(CallManager.METADATA_RECEIVED,
            this.onMetadataReceived, this);
        this.callManager.removeListener(CallManager.DISCONNECTED,
            this.onDisconnected, this);

        this.callManager = null;

        // Re-enable the UI so a new call can be joined.
        this.roomNameInput.disabled = false;
        this.connectButton.disabled = false;
    }

    // Remove the participant from our array of audio-only
    // participants and cleanup its audio resources.
    cleanupAudio(participantId) {
        const idx = this.audioParticipants.findIndex(p => p.id === participantId);
        if (idx < 0) {
            // This participant isn't tracked in our array of audio participants.
            return;
        }

        const participant = this.audioParticipants[idx];
        this.audioParticipants.splice(idx, 1);

        // Cleanup the audio element.
        if (participant.audio) {
            participant.audio.srcObject = null;
            participant.audio = null;
        }
    }

    // Remove the volumetric participant from our array of participants
    // and cleanup its rendering and THREE.js resources.
    cleanupVideo(participantId) {
        const idx = this.volumetricParticipants.findIndex(p => p.id === participantId);
        if (idx < 0) {
            // This participant isn't tracked in our array of volumetric participants.
            return;
        }

        const participant = this.volumetricParticipants[idx];
        this.volumetricParticipants.splice(idx, 1);

        // Remove the THREE.js objects from the scene.
        if (participant.container) {
            while (participant.container.children.length > 0) {
                participant.container.remove(participant.container.children[0]);
            }
            this.scene.remove(participant.container);
        }

        // Cleanup the Forma Vision renderer.
        if (participant.formaRenderer) {
            participant.formaRenderer.dispose();
            participant.formaRenderer = null;
        }
    }

    // An example of how you might arrange multiple holograms.
    // This example arranges the holograms in a line, in alphabetical
    // order by participantId, spaced 1m apart.
    updatePositions() {
        // Arrange renderers in alphebetical order by id.
        console.warn(3);
        const participants = this.volumetricParticipants.filter(p => p.container !== null).sort((a, b) => {
            const idA = a.id.toLowerCase();
            const idB = b.id.toLowerCase();
            return (idA < idB) ? -1 : (idA > idB) ? 1 : 0;
        });

        // Arrange renderers in a line, spaced 1 meter apart (in local coordinates).
        const center = participants.length * 0.5;
        for (let i = 0; i < participants.length; i++) {
            participants[i].container.position.x = 0.5 + i - center;
        }
    }

    setRenderer(el,renderer_) {
        this.el=el;
        this.aframeRenderer=renderer_;
    }


    updateLoop(camera){
         // Update all Forma Vision renderers before rendering the THREE.js scene.
         for (let p of this.volumetricParticipants) {
            if (p.formaRenderer) {
                p.formaRenderer.update(camera);
            }
        }
    }
    // Update the THREE.js camera, all Forma Vision renderers,
    // and render the THREE.js scene.
    renderLoop() {
        const self = this;
        const loop = (time) => {
            self.cameraControls.update();

            // Update all Forma Vision renderers before rendering the THREE.js scene.
            for (let p of self.volumetricParticipants) {
                if (p.formaRenderer) {
                    p.formaRenderer.update(self.camera);
                }
            }

            self.threeRenderer.render(self.scene, self.camera);
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    // Update the THREE.js scene when the canvas resizes
    // in order to keep scaling correct.
    handleResize() {
        this.threeRenderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight, false);
        this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight
        this.camera.updateProjectionMatrix()
    }
}

window.addEventListener('DOMContentLoaded', (event) => {
    // Set the player name for Forma Vision metrics.
    Omniweb.setPlayerInfo('Agora Example');

    const app = new AgoraExample();
    window.app=app;
});


document.addEventListener('keypress', (event) => {
    var name = event.key;
    var code = event.code;

    switch (code) {
        case 'KeyE':
            document.getElementById("rig").object3D.rotation.y -= Math.PI / 16;
            break;
        case 'KeyQ':
            document.getElementById("rig").object3D.rotation.y += Math.PI / 16;
            break;
    }
}, false);
