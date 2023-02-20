
//// LookAt component modified to rotate only the object Y axis

var debug = AFRAME.utils.debug;
var coordinates = AFRAME.utils.coordinates;

var warn = debug('components:look-at:warn');
var isCoordinates = coordinates.isCoordinates || coordinates.isCoordinate;


const lookAtComponentModified = {
    schema: {
      default: '',

      parse(value) {
        // A static position to look at.
        if (isCoordinates(value) || typeof value === 'object') {
          return coordinates.parse(value)
        }
        // A selector to a target entity.
        return value
      },

      stringify(data) {
        if (typeof data === 'object') {
          return coordinates.stringify(data)
        }
        return data
      },
    },

    init() {
      this.target3D = null
      this.vector = new THREE.Vector3()
    },


    update() {
      const self = this
      const target = self.data
      const {object3D} = self.el
      let targetEl

      // No longer looking at anything (i.e., look-at="").
      if (!target || (typeof target === 'object' && !Object.keys(target).length)) {
        return self.remove()
      }

      // Look at a position.
      if (typeof target === 'object') {
        return object3D.lookAt(new THREE.Vector3(target.x, target.y, target.z))
      }

      // Assume target is a string.
      // Query for the element, grab its object3D, then register a behavior on the scene to
      // track the target on every tick.
      targetEl = self.el.sceneEl.querySelector(target)
      if (!targetEl) {
        warn(`"${target}" does not point to a valid entity to look-at`)
        return
      }
      if (!targetEl.hasLoaded) {
        return targetEl.addEventListener('loaded', () => {
          self.beginTracking(targetEl)
        })
      }
      return self.beginTracking(targetEl)
    },

    tick: (function () {
      const vec3 = new THREE.Vector3()

      return function (t) {
        // Track target object position. Depends on parent object keeping global transforms up
        // to state with updateMatrixWorld(). In practice, this is handled by the renderer.
        let target
        const {target3D} = this
        const {object3D} = this.el
        let {vector} = this

        if (target3D) {
          target3D.getWorldPosition(vec3)
          if (this.el.getObject3D('camera')) {
            // Flip the vector to -z, looking away from target for camera entities. When using
            // lookat from THREE camera objects, this is applied for you, but since the camera is
            // nested into a Object3D, we need to apply this manually.
            // vector.subVectors(object3D.position, vec3).add(object3D.position);
          } else {
            vector = vec3
          }
          
          object3D.lookAt(vector.x, 2, vector.z)
        }
      }
    }()),

    beginTracking(targetEl) {
      this.target3D = targetEl.object3D
    },
}

export {lookAtComponentModified}