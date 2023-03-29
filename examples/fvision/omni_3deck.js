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

class ThreePlayer {
    constructor(parentEl, clipId, videoUrl, bytesUrl, metadataUrl) {
        const self = this;
        this.renderLooper = null;
        self.parentEl = parentEl;
        self.scene = parentEl.sceneEl;
        // let cameraEl = document.querySelector('a-entity[camera]');
        // self.camera = cameraEl.components.camera.camera;        
        self.renderer = self.scene.renderer;
        // If the current browser is not supported, bail out early.
        // GERONIMO !
        // const supportedBrowser = OmniUtils.checkBrowserSupport();
        // if (!supportedBrowser) {
        //     return;
        // }

        const clipFunc = async () => {
            // If a clip ID is provided, use that. Otherwise check for video & bytes URLs.
            if (clipId) {
                return OmniNetwork.requestClipById(clipId);
            } else if (videoUrl && bytesUrl) {
                return OmniNetwork.requestVideoClipByUrl(videoUrl, bytesUrl, metadataUrl);
            } else {
                throw Error("Must provide a Clip ID or a Video and Bytes URL");
            }
        }


        // Asynchronously request and load the clip info. If no clip is
        // retrieved or there is an error in the request, it is handled in
        // the 'catch' block below.
        clipFunc().then((clipInfo) => {
            const metadata = clipInfo['metadata'];
            self.tileRenderer = new OmniRendererTHREE(self.renderer, metadata, (mesh) => {
                // Extract the rotation and translation parameters from the
                // metadata. Note: y and z are swapped. Transmission format
                // standard uses y as up where as our convention in our
                // rendering code is to use z as up.
                const rotation = new THREE.Euler();
                if (metadata && 'rotation' in metadata) {
                    const R = metadata['rotation'];
                    rotation.x = -OmniUtils.deg2Rad(R['x']);
                    rotation.z = -OmniUtils.deg2Rad(R['y']);
                    rotation.y = -OmniUtils.deg2Rad(R['z']);
                }

                const translation = new THREE.Vector3();
                if (metadata && 'translation' in metadata) {
                    const T = metadata['translation'];
                    translation.x = T['x'];
                    translation.z = T['y'];
                    translation.y = T['z'];
                }

                const scale = 1 / 1000.0;
                mesh.scale.set(scale, scale, scale);
                mesh.setRotationFromEuler(rotation);
                mesh.position.set(translation.x, translation.y - 0.75, translation.z);

                // Rotate the mesh into THREE's coordinate system.
                const R = new THREE.Matrix4().makeRotationFromEuler(
                    new THREE.Euler(-Math.PI / 2.0, 0.0, Math.PI));
                mesh.applyMatrix4(R);
                self.mesh = mesh;
                var bVisibleAtt = self.parentEl.getAttribute("visible");
                if (bVisibleAtt) {
                    self.parentEl.object3D.add(mesh);
                } else {
                    console.log("Not adding, not visible");
                }
            });

            const isVideo = 'videoUrl' in clipInfo;
            if (isVideo) {
                self.tileRenderer.setVideoUrl(clipInfo['videoUrl'], clipInfo['bytesUrl']);
            } else {
                self.tileRenderer.setStaticUrl(clipInfo['staticUrl'], clipInfo['bytesUrl']);
            }
            self.tileRenderer.setContentLoadedCallback(() => {
                self.tileRenderer.play();
            });
            self.tileRenderer.setVideoPlayCallback(() => {
                console.log('Video Play');
            });
            self.tileRenderer.setVideoPauseCallback(() => {
                console.log('Video Pause');
            });
            self.tileRenderer.setVideoEndedCallback(() => {
                self.tileRenderer.play();
                console.log('Video End');
            });
            self.tileRenderer.setVideoBufferingCallback((buffering) => {
                const label = document.getElementById('buffering-label');
                // if (buffering) {
                //     label.style.display = 'flex';
                // } else {
                //     label.style.display = 'none';
                // }
            });

            self.tileRenderer.prepare();
            self.startRenderLoop();
        }).catch((error) => {
            console.log(error);
        });
    }

    updateScene(parentEl) {
        const self = this;
        self.parentEl = parentEl;
        var bVisibleAtt = self.parentEl.getAttribute("visible");
        if (bVisibleAtt) {
            self.scene = parentEl.sceneEl;
            self.renderer = self.scene.renderer;
            if (self.mesh) {
                self.scene.remove(self.mesh);
                self.parentEl.object3D.add(self.mesh);
            }
        }
    }

    startRenderLoop() {
        if (this.renderLooper) {
            this.renderLooper.stopLoop();
        }
        this.renderLooper = new RenderLooper(this);
        this.renderLooper.renderLoop();
    }

    // renderLoop() {
    //     const self = this;
    //     const loop = (time) => {
    //         requestAnimationFrame(loop);

    //         // self.cameraControls.update();
    //         self.tileRenderer.update();
    //         // self.renderer.render(self.scene, self.camera);
    //     }
    //     requestAnimationFrame(loop);
    // }
}

class RenderLooper {
    constructor(threeplayer) {
        this.three = threeplayer;
        this.breakLoop = false;
        this.xrSession = null;
        this.initDocHandlers();
    }

    // set up handlers to start the XR Session animation frames
    initDocHandlers() {
        const self = this;
        this.mVRHandler = function () {
            if (!this.breakLoop) self.startXRSession();
        }
        document.querySelector('a-scene').addEventListener('enter-vr', this.mVRHandler);
    }

    /**
     * remove the 
     */
    stopLoop() {
        if (this.mVRHandler) document.querySelector('a-scene').removeEventListener('enter-vr', this.mVRHandler);
        this.breakLoop = true;
    }

    // shared rendering logic
    renderFrame(time, xrFrame) {
        this.three.tileRenderer.update();
    }

    // Assumed to be called by a user gesture event elsewhere in code.
    startXRSession() {
        const self = this;
        try{
            const manager = self.three.renderer.xr;
            // get the current XR session
            const session = manager.getSession();
            self.xrSession = session;
            const xrloop = (time, xframe) => {
                // break the loop 
                if (this.breakLoop){
                    self.xrSession = null ;
                    return ;
                }

                // if session is present, render frame
                if (self.xrSession) {
                    self.xrSession.requestAnimationFrame(xrloop)
                    self.renderFrame(time, xframe)
                }
            }
            
            // save off the self in an array of selves (there may be other three objects)
            if (!self.xrSession.hasOwnProperty("omni_3deck")){
                self.xrSession["omni_3deck"] = [];
            }
            self.xrSession["omni_3deck"].push(self);
            
            self.xrSession.addEventListener('end', self.endXRSession)
            self.xrSession.updateRenderState();
            self.xrSession.requestAnimationFrame(xrloop);
        }catch(e){
            console.error(e);
        }
    }

    /**
     * if session ended set it to null
     */
    endXRSession() {
        var objarray = this["omni_3deck"] ;
        if (objarray){
            for (var obj of objarray){
                obj.xrSession = null
            }
            this["omni_3deck"] = [];
        }
    }

    /**
     * render loop for the non XR session
     */
    renderLoop() {
        const self = this;
        const player = this.three;
        const windowloop = (time) => {
            if (self.breakLoop) {
                return;
            }
            requestAnimationFrame(windowloop);
            // if we are NOT in XR, render the frame
            if (!this.xrSession) {
                self.renderFrame(time, null)
            }
        }
        requestAnimationFrame(windowloop);
    }
}

