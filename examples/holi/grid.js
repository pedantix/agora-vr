
import  * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';

const skyColor = 0x44aa44;
const groundColor = 0x44aa44;

export function Grid(worldDim) {
    let world = new THREE.Object3D();

    // lights
    const amLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
    world.add(amLight);

    const dirLight = new THREE.DirectionalLight(0xFFFFFF);
    dirLight.position.set(0, 1, 1);
    world.add(dirLight);

    // ground
    /*
    const geometry = new THREE.PlaneGeometry(worldDim, worldDim);
    const material = new THREE.MeshLambertMaterial({color: groundColor, side: THREE.BackSide});
    const plane = new THREE.Mesh(geometry, material);
    plane.rotateX(Math.PI / 2);
    world.add(plane);
*/
    /*
    const grid = new THREE.GridHelper(worldDim, worldDim / 100, 0x000000, 0x000000);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    world.add(grid);
*/
    return [world, skyColor];
}