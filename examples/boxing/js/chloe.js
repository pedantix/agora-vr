
import * as ddd from "./MantisRYSK.min.js";
  
let scene = document.querySelector('a-scene');

let ryskObj = new Rysk.RYSKUrl("http://localhost:5832/stage/assets/chloe_battle_v4.mp4", "http://localhost:5832/stage/assets/chloe_battle_syk.mp4");
ryskObj.run().then(mesh => { //add mesh to the scene
    mesh.visible = true;
    mesh.material.toneMapped = false;
    let el = document.createElement("a-entity");
    el.setAttribute("vvol", "true");
    el.object3D = mesh;
    scene.appendChild(el);
    el.setAttribute('position',{x: 1, y: 1, z: 1 }); 
    el.setAttribute('scale',{x: 10, y: 10, z: 10 }); 
    el.setAttribute('rotation', {x: 0, y: 60, z: 0});
    ryskObj.play();    
});
ryskObj.play();
window.ryskObj=ryskObj;


