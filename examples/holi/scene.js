
import  * as THREE from 'https://cdn.skypack.dev/three@0.132.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from 'https://cdn.skypack.dev/three@0.132.2/examples/jsm/loaders/FBXLoader.js';
import { Avatar } from './avatar.js';
import { Grid } from './grid.js';

const canvasWidthOffset = 1;
const worldDim = 1600;

let renderer, camera, scene, loader, avatar, world, skyColor;
let user;

export async function init() {
    window.addEventListener('resize', onWindowResize);
    renderer = new THREE.WebGLRenderer( { antialias: true, canvas: avatar_canvas } );
    
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasWidthOffset * (window.innerWidth/2), window.innerHeight);
    renderer.shadowMap.enabled = true;

    // camera
    camera = new THREE.PerspectiveCamera(45, canvasWidthOffset * (window.innerWidth/2) / window.innerHeight, 1, 2000);
    camera.position.set(0, 300, 700);

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target = new THREE.Vector3(0, 200, 0);
    controls.update();

    // scene
    scene = new THREE.Scene();
    loader = new FBXLoader();

    let avatarName = "remy";

    // avatar
    avatar = await Avatar(avatarName, loader);
    scene.add(avatar);
    [world, skyColor] = Grid(worldDim, loader);
    scene.add(world);
    scene.background = new THREE.Color(skyColor);
    window.avatar=avatar;
    window.scene=scene;
}

function onWindowResize() {
    camera.aspect = canvasWidthOffset *(window.innerWidth/2) / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvasWidthOffset * (window.innerWidth/2), window.innerHeight);
}

export function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// BUG: choosing a different avatar before current avatar has loaded does not override selection
// button UI overrides, avatar model should too
export async function updateAvatar(name) {
    if (avatar) {
        avatar.removeFromParent();
        avatar = null;

        avatar = await Avatar(name, loader);
        scene.add(avatar);

        if (user) {
            const res = await fetch('api/update-avatar', {
                method: 'POST',
                body: JSON.stringify({username: JSON.parse(user).user, avatarName: name}),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (res.status != 200) {
                alert("Avatar update failure.");
            }
        }
    }
}

