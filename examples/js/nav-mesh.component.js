delete AFRAME.components['nav-mesh'];

AFRAME.registerComponent('nav-mesh', {
  schema: {
    nodeName: {type: 'string'}
  },

  init: function () {
    this.system = this.el.sceneEl.system.nav;
    this.hasLoadedNavMesh = false;
    this.nodeName = this.data.nodeName;
    this.el.addEventListener('object3dset', this.loadNavMesh.bind(this));
  },

  play: function () {
    if (!this.hasLoadedNavMesh) this.loadNavMesh();
  },

  loadNavMesh: function () {
    var self = this;
    const object = this.el.getObject3D('mesh');
    const scene = this.el.sceneEl.object3D;

    if (!object) return;

    let navMesh;
    object.traverse((node) => {
      if (node.isMesh &&
          (!self.nodeName || node.name === self.nodeName)) navMesh = node;
    });

    if (!navMesh) return;

    scene.updateMatrixWorld();
    this.system.setNavMeshGeometry(navMesh.geometry);
    this.hasLoadedNavMesh = true;
  }
});
