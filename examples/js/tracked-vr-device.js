AFRAME.registerComponent('tracked-vr-device', {
  onEnterVR() {
    if (AFRAME.utils.device.isMobile()) return; // exclude e.g. cardboard, which lacks tracked controllers
    if (document.getElementById('my-tracked-vr-device')) return; // don't add them in more than once!
    
    const el = document.createElement('a-entity');
    el.removeAttribute('networked');
    el.setAttribute('networked', 'template:#camera-rig-template-oculus; attachTemplateToLocal:false');
    el.setAttribute('position', '0 3.15 4');    
    el.setAttribute('id', 'my-tracked-vr-device');
    // note that the ID will be applied to THIS client's avatar,
    // but not other connected clients,
    // and not on the machine of other connected clients
    this.el.appendChild(el);

  },
  init() {
    this.el.sceneEl.addEventListener('enter-vr', this.onEnterVR.bind(this));
    // future improvements:
    // pick up hand-controls events
    // https://github.com/aframevr/aframe/blob/b164623dfa0d2548158f4b7da06157497cd4ea29/docs/components/hand-controls.md
    // and broadcast the matching gestures to other connected clients
    // possibly trigger the animation on the model itself using animation-mixer:
    // https://github.com/n5ro/aframe-extras/tree/master/src/loaders
    // could add as 'networked-hands' component within repo
  }
})
