AFRAME.registerComponent("set-metalness-roughness", {
    init: function() {
        this.el.addEventListener("model-loaded", e => {
            let mesh = this.el.getObject3D("mesh")
            mesh.traverse(node => {
                if (!node.material) return;
                node.material.metalness = 0.5
                node.material.roughness = 0
            })
        })
    }
})