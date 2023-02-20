
// device constants
const WIDTH = 1920;
const HEIGHT = 1080;

const SMOOTHING = 0.75;
const SMOOTHING2 = 0.1;
const VISTHRESH = 0.9;

// pose constants
// https://google.github.io/mediapipe/solutions/pose.html#pose-landmark-model-blazepose-ghum-3d
const LEFTSHOULDER = 11;
const RIGHTSHOULDER = 12;
const LEFTELBOW = 13;
const RIGHTELBOW = 14;
const LEFTWRIST = 15;
const RIGHTWRIST = 16;
const LEFTPINKY = 17;
const RIGHTPINKY = 18;
const LEFTINDEX = 19;
const RIGHTINDEX = 20;
const LEFTHIP = 23;
const RIGHTHIP = 24;
const LEFTKNEE = 25;
const RIGHTKNEE = 26;
const LEFTANKLE = 29; //27;
const RIGHTANKLE = 30; //28;
const LEFTFOOT = 31;
const RIGHTFOOT = 32;

// hand constants
const WRIST = 0;
const INDEX1 = 5;
const MIDDLE1 = 9;
const RING1 = 13;
const PINKY1 = 17;

// face constants
// https://raw.githubusercontent.com/tensorflow/tfjs-models/master/face-landmarks-detection/mesh_map.jpg
const NOSE = 1;
const NASAL = 4;       // 1 point above nose
const LEFT = 454;      // left most point
const RIGHT = 234;     // right most point
const TOP = 10;        // top most point                       
const BOT = 152;       // bot most point

let skeleton, hips, spine, neckBone, morphTargets, morphDict;
let leftShoulderBone, leftElbowBone, leftWristBone, rightShoulderBone, rightElbowBone, rightWristBone;
let leftHipBone, leftKneeBone, leftAnkleBone, leftFootBone, rightHipBone, rightKneeBone, rightAnkleBone, rightFootBone;
let leftHandBones, rightHandBones;

function storePoses(name) {
    skeleton.traverse(function (object) {
        object.userData[name] = {
            position: object.position.clone(),
            quaternion: object.quaternion.clone()
        };
    });
}

function lerpPoses(name, t) {
    skeleton.traverse(function (object) {
        object.position.lerp(object.userData[name].position, t);
        object.quaternion.slerp(object.userData[name].quaternion, t);
    });
}

const eyelashNames = ["default", "Eyelashes", "Ch22_Eyelashes"];
window.avatar;

export async function Avatar(name, loader, scale) {
    let avatar = (await loader.loadAsync(`${name}.glb`)).scene;
    return AvatarSetup(avatar, scale);
}

export async function AvatarSetup(avatar, avatar_scale) {
    // scale the avatar without touching avatar.scale
    //,,  (avatar);
    avatar.traverse(function(object) {
        if(object.skeleton) {
            object.skeleton.pose();
            object.skeleton.bones.forEach(function(bone) {
                bone.matrixWorld.scale({ x: 1 / avatar_scale, y: 1 / avatar_scale, z: 1 / avatar_scale });
            });
            object.skeleton.calculateInverses();
        }
    });
    avatar.traverse(function(object) {
        object.position.multiplyScalar(avatar_scale);
    });

    window.avatar = avatar;
    // Skinned Mesh
    let skinnedMesh = avatar.getObjectByName("Body");


    if (skinnedMesh) {
        morphTargets = skinnedMesh.morphTargetInfluences;
        morphDict = skinnedMesh.morphTargetDictionary;
    }

    // Skeleton / Bone
    skeleton = avatar.getObjectByName("mixamorigHips");
    hips = new THREE.Object3D(); //skeleton.add(hips);

    storePoses("original");
    storePoses("target");

    avatar.updateMatrixWorld = function(force) {
        lerpPoses("target", 0.6);
        THREE.Object3D.prototype.updateMatrixWorld.call(this, force);
    };

    spine = avatar.getObjectByName("mixamorigSpine");
    neckBone = skeleton.getObjectByName("mixamorigHead");

    leftShoulderBone = skeleton.getObjectByName("mixamorigRightArm");
    leftElbowBone = leftShoulderBone.getObjectByName("mixamorigRightForeArm");
    leftWristBone = leftElbowBone.getObjectByName("mixamorigRightHand");
    rightShoulderBone = skeleton.getObjectByName("mixamorigLeftArm");
    rightElbowBone = rightShoulderBone.getObjectByName("mixamorigLeftForeArm");
    rightWristBone = rightElbowBone.getObjectByName("mixamorigLeftHand");

    leftHipBone = skeleton.getObjectByName("mixamorigRightUpLeg");
    leftKneeBone = leftHipBone.getObjectByName("mixamorigRightLeg");
    leftAnkleBone = leftKneeBone.getObjectByName("mixamorigRightFoot");
    leftFootBone = leftAnkleBone.getObjectByName("mixamorigRightToe_End");
    rightHipBone = skeleton.getObjectByName("mixamorigLeftUpLeg");
    rightKneeBone = rightHipBone.getObjectByName("mixamorigLeftLeg");
    rightAnkleBone = rightKneeBone.getObjectByName("mixamorigLeftFoot");
    rightFootBone = rightAnkleBone.getObjectByName("mixamorigLeftToe_End");

    leftHandBones = [
        leftWristBone,
        leftWristBone.getObjectByName("mixamorigRightHandThumb1"),
        leftWristBone.getObjectByName("mixamorigRightHandThumb2"),
        leftWristBone.getObjectByName("mixamorigRightHandThumb3"),
        leftWristBone.getObjectByName("mixamorigRightHandThumb4"),
        leftWristBone.getObjectByName("mixamorigRightHandIndex1"),
        leftWristBone.getObjectByName("mixamorigRightHandIndex2"),
        leftWristBone.getObjectByName("mixamorigRightHandIndex3"),
        leftWristBone.getObjectByName("mixamorigRightHandIndex4"),
        leftWristBone.getObjectByName("mixamorigRightHandMiddle1"),
        leftWristBone.getObjectByName("mixamorigRightHandMiddle2"),
        leftWristBone.getObjectByName("mixamorigRightHandMiddle3"),
        leftWristBone.getObjectByName("mixamorigRightHandMiddle4"),
        leftWristBone.getObjectByName("mixamorigRightHandRing1"),
        leftWristBone.getObjectByName("mixamorigRightHandRing2"),
        leftWristBone.getObjectByName("mixamorigRightHandRing3"),
        leftWristBone.getObjectByName("mixamorigRightHandRing4"),
        leftWristBone.getObjectByName("mixamorigRightHandPinky1"),
        leftWristBone.getObjectByName("mixamorigRightHandPinky2"),
        leftWristBone.getObjectByName("mixamorigRightHandPinky3"),
        leftWristBone.getObjectByName("mixamorigRightHandPinky4")
    ]

    rightHandBones = [
        rightWristBone,
        rightWristBone.getObjectByName("mixamorigLeftHandThumb1"),
        rightWristBone.getObjectByName("mixamorigLeftHandThumb2"),
        rightWristBone.getObjectByName("mixamorigLeftHandThumb3"),
        rightWristBone.getObjectByName("mixamorigLeftHandThumb4"),
        rightWristBone.getObjectByName("mixamorigLeftHandIndex1"),
        rightWristBone.getObjectByName("mixamorigLeftHandIndex2"),
        rightWristBone.getObjectByName("mixamorigLeftHandIndex3"),
        rightWristBone.getObjectByName("mixamorigLeftHandIndex4"),
        rightWristBone.getObjectByName("mixamorigLeftHandMiddle1"),
        rightWristBone.getObjectByName("mixamorigLeftHandMiddle2"),
        rightWristBone.getObjectByName("mixamorigLeftHandMiddle3"),
        rightWristBone.getObjectByName("mixamorigLeftHandMiddle4"),
        rightWristBone.getObjectByName("mixamorigLeftHandRing1"),
        rightWristBone.getObjectByName("mixamorigLeftHandRing2"),
        rightWristBone.getObjectByName("mixamorigLeftHandRing3"),
        rightWristBone.getObjectByName("mixamorigLeftHandRing4"),
        rightWristBone.getObjectByName("mixamorigLeftHandPinky1"),
        rightWristBone.getObjectByName("mixamorigLeftHandPinky2"),
        rightWristBone.getObjectByName("mixamorigLeftHandPinky3"),
        rightWristBone.getObjectByName("mixamorigLeftHandPinky4")
    ]

    // hide eyelashes for now cus they render weirdly
    eyelashNames.forEach((name) => {
        let eyelash = avatar.getObjectByName(name);
        if (eyelash) {
            eyelash.visible = false;
            return;
        }
    });

    avatar.traverse(function (child) {
        if (child.isMesh) {
            child.castShadow = true;
             child.receiveShadow = false;
        }
    });

    return avatar;
}

function resetBone(bone, updateMatrices) {
    if(bone.userData.original) {
        bone.position.copy(bone.userData.original.position);
        bone.quaternion.copy(bone.userData.original.quaternion);
        if(updateMatrices) {
            bone.updateMatrixWorld();
        }
    }
}

function orientLimb(target0, target1, target2, bone0, bone1, bone2, axis, angle, hint) {
    if(hint) {
        // make sure the limb is not bent unnaturaly
        const t1 = target1.clone().multiplyScalar(2).sub(target0).sub(target2).normalize();
        const fix = 5 * Math.max(0, 0.05 - t1.dot(hint));
        target1 = target1.clone().addScaledVector(hint, fix);
    }

    resetBone(bone1); resetBone(bone0, true);

    // move the whole thing so that bone0 is at target0
    skeleton.position.add(
        target0.clone().sub(
            bone0.getWorldPosition(new THREE.Vector3())
        )
    );
    skeleton.updateMatrixWorld();

    // point bone0 so that bone1 points towards target1
    bone0.quaternion.multiply(new THREE.Quaternion().setFromUnitVectors(
        bone0.worldToLocal(bone1.getWorldPosition(new THREE.Vector3())).normalize(),
        bone0.worldToLocal(target1.clone()).normalize()
    ));
    bone0.updateMatrixWorld();

    if(!bone2) return;

    // bend the knee(elbow) in a physically possible way
    bone1.rotateOnWorldAxis(axis, angle);
    bone1.updateMatrixWorld();

    // twist bone0 so that bone2 is aligned with targer1-target2
    let targetDirection = bone0.worldToLocal(target2.clone()).sub(
        bone0.worldToLocal(target1)
    );
    let bone1Position = bone0.worldToLocal(bone1.getWorldPosition(new THREE.Vector3()));
    targetDirection = bone1Position.clone().cross(targetDirection);
    targetDirection.cross(bone1Position).normalize();

    let boneDirection = bone0.worldToLocal(bone2.getWorldPosition(new THREE.Vector3())).sub(
        bone1Position
    );
    boneDirection = bone1Position.clone().cross(boneDirection);
    boneDirection.cross(bone1Position).normalize();

    bone0.quaternion.multiply(new THREE.Quaternion().setFromUnitVectors(
        boneDirection, targetDirection
    ));
    bone0.updateMatrixWorld();

    // bend the knee(elbow) properly now
    bone1.quaternion.multiply(new THREE.Quaternion().setFromUnitVectors(
        bone1.worldToLocal(bone2.getWorldPosition(new THREE.Vector3())).normalize(),
        bone1.worldToLocal(target2.clone()).normalize()
    ));
    bone1.updateMatrixWorld();
}

const ball = new THREE.Mesh(new THREE.SphereGeometry(5), new THREE.MeshBasicMaterial({
    color: 'magenta', depthTest: false, transparent: true
}));

export function setPose(poseLandmarks, poseWorldLandmarks) {
    let userJoints = [];

    poseWorldLandmarks.forEach((landmark) => {
        userJoints.push(new THREE.Vector3(landmark.x, landmark.y, landmark.z).negate());
        
    });

    let rightShoulderVis = poseWorldLandmarks[RIGHTSHOULDER].visibility;
    let leftShoulderVis = poseWorldLandmarks[LEFTSHOULDER].visibility;
    let rightHipVis = poseWorldLandmarks[RIGHTHIP].visibility;
    let leftHipVis = poseWorldLandmarks[LEFTHIP].visibility;

    storePoses("current");

    // get last world position of them feet before any bones were moved
    let lastRightFootPosW = rightFootBone.getWorldPosition(new THREE.Vector3);
    let lastLeftFootPosW = leftFootBone.getWorldPosition(new THREE.Vector3);

    resetBone(hips);
    resetBone(leftHipBone);
    resetBone(rightHipBone);

    // REQUIRED: both shoulders must be visible to track upperbody
    if (rightShoulderVis > VISTHRESH && leftShoulderVis > VISTHRESH) {
        // shoulder local coordinate system
        // positive directions: x - leftShoulder -> rightShoulder,
        //                      y - hip -> shoulder,
        //                      z - user -> camera
        let shoulderX = userJoints[RIGHTSHOULDER].clone().sub(userJoints[LEFTSHOULDER]).normalize();
        let shoulderY = userJoints[RIGHTSHOULDER].clone().lerp(userJoints[LEFTSHOULDER], 0.5).normalize();
        let shoulderZ = shoulderX.clone().cross(shoulderY).normalize();

        // make sure X is at 90 degrees to Y
        shoulderX = shoulderY.clone().cross(shoulderZ).normalize();

        // adjust userJoints scale
        const ratio =
            rightShoulderBone.getWorldPosition(new THREE.Vector3()).distanceTo(
            leftShoulderBone.getWorldPosition(new THREE.Vector3())
        ) / userJoints[RIGHTSHOULDER].distanceTo(
            userJoints[LEFTSHOULDER]
        );
        userJoints.forEach((v, i) => {
            v.multiplyScalar(ratio);

            if(!poseLandmarks) {
                // debug joints
                let bi = window.scene.getObjectByName('ball_' + i);
                if(!bi) {
                    bi = ball.clone(); bi.name = 'ball_' + i; window.scene.add(bi);
                }
        
                bi.position.copy(v);
                bi.position.y += 100;
            }
        });

        // torso direction
        /*
        skeleton.matrix
            .makeBasis(shoulderX, shoulderY, shoulderZ)
            .setPosition(skeleton.position)
            .decompose(skeleton.position, skeleton.quaternion, skeleton.scale);
            */
        spine.matrix.makeBasis(shoulderX, shoulderY, shoulderZ);

        shoulderY.multiplyScalar(0.5); shoulderY.y += 0.5;
        shoulderZ = shoulderX.clone().cross(shoulderY).normalize();
        shoulderX = shoulderY.clone().cross(shoulderZ).normalize();
        skeleton.matrix.makeBasis(shoulderX, shoulderY, shoulderZ);
        skeleton.quaternion.setFromRotationMatrix(skeleton.matrix);

        spine.matrixWorld.copy(skeleton.matrix);
        spine.matrix.multiply(spine.matrixWorld.invert());
        spine.quaternion.setFromRotationMatrix(spine.matrix);

        skeleton.updateMatrixWorld();

        // wave arms around
        const down = new THREE.Vector3(0, -1, 0);
        if(poseWorldLandmarks[RIGHTWRIST].visibility > VISTHRESH) orientLimb(
            userJoints[RIGHTSHOULDER], userJoints[RIGHTELBOW], userJoints[RIGHTWRIST],
            rightShoulderBone, rightElbowBone, rightWristBone,
            new THREE.Vector3(0, 1, 0), -1.3, down
        );

        if(poseWorldLandmarks[LEFTWRIST].visibility > VISTHRESH) orientLimb(
            userJoints[LEFTSHOULDER], userJoints[LEFTELBOW], userJoints[LEFTWRIST],
            leftShoulderBone, leftElbowBone, leftWristBone,
            new THREE.Vector3(0, 1, 0), +1.3, down
        );
    }

    let hipX = new THREE.Vector3(), hipY = hipX.clone(), hipZ = hipX.clone();
    hips.matrixWorld.extractBasis (hipX, hipY, hipZ);

    // REQUIRED: both hips must be visible to track lowerbody
    // (these seem to come with lower visibility values)
    const VISTHRESH2 = 0.8 * VISTHRESH;
    if (rightHipVis > VISTHRESH2 && leftHipVis > VISTHRESH2) {

        // hip local coordinate system
        // positive directions: x - leftHip -> rightHip,
        //                      y - always up (so that legs do not tilt),
        //                      z - user -> camera
        hipX = userJoints[RIGHTHIP].clone().sub(userJoints[LEFTHIP]).normalize();
        hipY.set(0, 1, 0);
        hipZ = hipX.clone().cross(hipY).normalize();

        // make sure X is at 90 degrees to Y
        hipX = hipY.clone().cross(hipZ).normalize();
    }

        // hips direction
        // (use hips.matrixXX as temp matrices; they will auto-reset)
        // (assumes hips.matrix has 0 translation)
        hips.matrixWorld.copyPosition(hips.matrix).invert();
        hips.matrix.makeBasis(hipX, hipY, hipZ).multiply(hips.matrixWorld);
        const hipsQuaternion = new THREE.Quaternion();
        hipsQuaternion.setFromRotationMatrix(hips.matrix);

        // but let's not rotate hips too far (~30 degrees max)
        hips.quaternion.rotateTowards(hipsQuaternion, 0.5);

    if (rightHipVis > VISTHRESH2 && leftHipVis > VISTHRESH2) {

        resetBone(leftHipBone);
        leftHipBone.quaternion.copy(hips.quaternion);
        leftHipBone.position.applyQuaternion(hips.quaternion);
        leftHipBone.updateMatrixWorld();

        resetBone(rightHipBone);
        rightHipBone.quaternion.copy(hips.quaternion);
        rightHipBone.position.applyQuaternion(hips.quaternion);
        rightHipBone.updateMatrixWorld();

        // dangle them legs
        if(poseWorldLandmarks[RIGHTANKLE].visibility > VISTHRESH2) {
            orientLimb(
                userJoints[RIGHTHIP], userJoints[RIGHTKNEE], userJoints[RIGHTANKLE],
                rightHipBone, rightKneeBone, rightAnkleBone,
                new THREE.Vector3(1, 0, 0), +1.3, hipZ
            );
            orientLimb(
                userJoints[RIGHTANKLE], userJoints[RIGHTFOOT], null,
                rightAnkleBone, rightFootBone
            );
        }

        if(poseWorldLandmarks[LEFTANKLE].visibility > VISTHRESH2) {
            orientLimb(
                userJoints[LEFTHIP], userJoints[LEFTKNEE], userJoints[LEFTANKLE],
                leftHipBone, leftKneeBone, leftAnkleBone,
                new THREE.Vector3(1, 0, 0), +1.3, hipZ
            );
            orientLimb(
                userJoints[LEFTANKLE], userJoints[LEFTFOOT], null,
                leftAnkleBone, leftFootBone
            );
        }
    }

        // current feet positions
        skeleton.updateMatrixWorld(true);
        let rightFootPosW = rightFootBone.getWorldPosition(new THREE.Vector3);
        let leftFootPosW = leftFootBone.getWorldPosition(new THREE.Vector3);

        if (rightFootPosW.y < leftFootPosW.y) {
            // right foot on the ground - keep it that way
            lastRightFootPosW.y = 0;
            skeleton.position.add(lastRightFootPosW).sub(rightFootPosW);
        } else {
            // left foot on the ground - keep it that way
            lastLeftFootPosW.y = 0;
            skeleton.position.add(lastLeftFootPosW).sub(leftFootPosW);
        }

        // in case things go wrong, pull the skeleton back to where it was
        skeleton.position.lerp(skeleton.userData.original.position,
            // try to make sure that he does not go off-screen
            0.5
        );

    storePoses("target");
    lerpPoses("current", 1);
}

export function setFingers(handLandmarks, isRight) {
    let avatarBones = (isRight) ? rightHandBones : leftHandBones;

    // hand landmark positions
    let userJoints = [];
    handLandmarks.forEach((landmark) => {
        userJoints.push(new THREE.Vector3(landmark.x * WIDTH, -landmark.y * HEIGHT, landmark.z * WIDTH));
    });

    // hand local coordinate system
    // positive directions: x - fingers -> wrist,
    //                      y - back of hand -> world
    //                      z - pinky -> thumb
    let handX = userJoints[WRIST].clone().sub(userJoints[MIDDLE1]).normalize();
    if (isRight) handX.negate();
    let handZ = userJoints[INDEX1].clone().sub(userJoints[RING1]).normalize();
    let handY = handX.clone().cross(handZ).normalize();
    if (!isRight) handY.negate();

    let handBasis = new THREE.Matrix3().set(
        handX.x, handY.x, handZ.x,
        handX.y, handY.y, handZ.y,
        handX.z, handY.z, handZ.z
    );

    // thumb
    let xAxis = handX.clone();
    let yAxis = handY.clone();
    let zAxis = handZ.clone();
    let basis = handBasis.clone();

    // iterate thumb joints
    for (let i = 1; i < 4; i++) {
        let rot = rotateBone(userJoints[i], userJoints[i + 1], avatarBones[i + 1].position, basis);
        let angles = new THREE.Euler().setFromQuaternion(rot.normalize());

        // constrain finger rotation to x-axis, range [0, 90] degrees
        let angleX = angles.toVector3().length();
        angleX = Math.max(0, angleX);
        angleX = Math.min(Math.PI / 2, angleX);

        if (isRight) smoothRotation(avatarBones[i], angleX - 0.2 * Math.PI, 0, 0);
        else smoothRotation(avatarBones[i], angleX, 0, 0);

        updateBasis(avatarBones[i].quaternion, xAxis, yAxis, zAxis, basis);
    }

    // iterate fingers
    for (let i = 5; i <= 17; i += 4) {
        xAxis = handX.clone();
        yAxis = handY.clone();
        zAxis = handZ.clone();
        basis = handBasis.clone();

        // iterate finger joints
        for (let j = i; j < i + 3; j++) {
            let rot = rotateBone(userJoints[j], userJoints[j + 1], avatarBones[j + 1].position, basis);

            // constrain finger rotation to z-axis, range [0, 90] degrees
            let angleZ = new THREE.Euler().setFromQuaternion(rot.normalize()).z;
            angleZ = Math.max(0, angleZ);
            angleZ = Math.min(Math.PI / 2, angleZ)

            if (isRight) smoothRotation(avatarBones[j], 0, 0, -angleZ);
            else smoothRotation(avatarBones[j], 0, 0, angleZ);

            updateBasis(avatarBones[j].quaternion, xAxis, yAxis, zAxis, basis);
        }
    }
}

export function setMorphs(faceLandmarks) {
    if (!morphTargets) return;

    // PROCESS LANDMARKS

    // center of head
    let pL = new THREE.Vector3(faceLandmarks[LEFT].x * WIDTH, faceLandmarks[LEFT].y * HEIGHT, faceLandmarks[LEFT].z * WIDTH);
    let pR = new THREE.Vector3(faceLandmarks[RIGHT].x * WIDTH, faceLandmarks[RIGHT].y * HEIGHT, faceLandmarks[RIGHT].z * WIDTH);
    let pM = pL.lerp(pR, 0.5);

    // width and height of face
    let pT = new THREE.Vector3(faceLandmarks[TOP].x * WIDTH, faceLandmarks[TOP].y * HEIGHT, faceLandmarks[TOP].z * WIDTH);
    let pB = new THREE.Vector3(faceLandmarks[BOT].x * WIDTH, faceLandmarks[BOT].y * HEIGHT, faceLandmarks[BOT].z * WIDTH);
    let faceLenX = pR.distanceTo(pL);
    let faceLenY = pB.distanceTo(pT);

    // face plane origin
    let pN = new THREE.Vector3(faceLandmarks[NOSE].x * WIDTH, faceLandmarks[NOSE].y * HEIGHT, faceLandmarks[NOSE].z * WIDTH);

    // unit normal, face plane z-axis
    let zAxis = pN.clone().sub(pM);
    zAxis.normalize();

    // project nasal onto face plane
    let pNas = new THREE.Vector3(faceLandmarks[NASAL].x * WIDTH, faceLandmarks[NASAL].y * HEIGHT, faceLandmarks[NASAL].z * WIDTH);
    let v = pNas.clone().sub(pN);
    let dist = zAxis.dot(v);
    pNas.sub(zAxis.clone().multiplyScalar(dist));

    // face plane y-axis
    let yAxis = pNas.sub(pN);
    yAxis.normalize();

    // face plane x-axis
    let xAxis = zAxis.clone().cross(yAxis);
    xAxis.normalize();
    xAxis.negate();

    // face plane local coordinates (pX, pY)
    let facePos = [];
    for (let landmark of faceLandmarks) {
        let p = new THREE.Vector3(landmark.x * WIDTH, landmark.y * HEIGHT, landmark.z * WIDTH);

        // project point onto face plane
        v = p.sub(pN);
        let pX = xAxis.dot(v) / faceLenX;
        let pY = yAxis.dot(v) / faceLenY;
        facePos.push([pX, pY]);
    }

    // gaze direction
    let thetaX = Math.acos(zAxis.x);
    let thetaY = Math.acos(zAxis.y);
    let thetaZ = Math.acos(yAxis.x);
    let rotX = -(thetaY - Math.PI / 2) - 0.1 * Math.PI;
    let rotY = thetaX - Math.PI / 2;
    let rotZ = -(thetaZ - Math.PI / 2);
    smoothRotation(neckBone, rotX, rotY, rotZ);

    // CALCULATE MORPHS

    // eyes
    let eyeRT = facePos[27];
    let eyeRB = facePos[23];
    let eyeLT = facePos[257];
    let eyeLB = facePos[253];

    let min = 0.1;
    let max = 0.12;
    setMorphTarget("EyesWide_Left", interpolate(eyeRT[1] - eyeRB[1], min, max));
    setMorphTarget("EyesWide_Right", interpolate(eyeLT[1] - eyeLB[1], min, max));

    max = 0.095;
    setMorphTarget("Squint_Left", interpolate(eyeRT[1] - eyeRB[1], min, max));
    setMorphTarget("Squint_Right", interpolate(eyeLT[1] - eyeLB[1], min, max));

    max = 0.09;
    setMorphTarget("Blink_Left", interpolate(eyeRT[1] - eyeRB[1], min, max));
    setMorphTarget("Blink_Right", interpolate(eyeLT[1] - eyeLB[1], min, max));

    // eyebrows
    let browR = facePos[66];
    let browL = facePos[296];

    min = 0.35;
    max = 0.4;
    setMorphTarget("BrowsUp_Left", interpolate(browR[1], min, max));
    setMorphTarget("BrowsUp_Right", interpolate(browL[1], min, max));

    max = 0.33;
    setMorphTarget("BrowsDown_Left", interpolate(browR[1], min, max));
    setMorphTarget("BrowsDown_Right", interpolate(browL[1], min, max));

    // mouth
    let mouthT = facePos[13];
    let mouthB = facePos[14];
    let mouthL = facePos[308];
    let mouthR = facePos[78];

    min = 0.01;
    max = 0.15;
    setMorphTarget("MouthOpen", interpolate(mouthT[1] - mouthB[1], min, max));

    min = -0.15;
    max = -0.11;
    setMorphTarget("Midmouth_Right", interpolate(mouthR[0], min, max));
    setMorphTarget("Midmouth_Left", interpolate(mouthL[0], -min, -max));

    min = -0.22;
    max = -0.25;
    setMorphTarget("Frown_Left", interpolate(mouthR[1], min, max));
    setMorphTarget("Frown_Right", interpolate(mouthL[1], min, max));

    max = -0.18;
    setMorphTarget("Smile_Left", interpolate(mouthR[1], min, max));
    setMorphTarget("Smile_Right", interpolate(mouthL[1], min, max));

    // nose
    let noseR = facePos[129];
    let noseL = facePos[358];

    min = -0.027;
    max = -0.018;
    setMorphTarget("NoseScrunch_Left", interpolate(noseR[1], min, max));
    setMorphTarget("NoseScrunch_Right", interpolate(noseL[1], min, max));
}

// motion smoothing rotation of object by x, y, z
function smoothRotation(object, rotX, rotY, rotZ) {
    // interpolate with current values to prevent jittering
    let SMOOTHING = 0.25;
    if (rotX != 0) object.rotation.x = (1 - SMOOTHING) * object.rotation.x + SMOOTHING * rotX;
    if (rotY != 0) object.rotation.y = (1 - SMOOTHING) * object.rotation.y + SMOOTHING * rotY;
    if (rotZ != 0) object.rotation.z = (1 - SMOOTHING) * object.rotation.z + SMOOTHING * rotZ;
}

// userJoint (Vector3) - world position of joint
// userChild (Vector3) - world position of child of joint
// avatarChild (Vector3) - local position of child Bone of joint
// basis (Matrix3) - local axes at joint (in world coordinates)
// returns rotation needed at joing
function rotateBone(userJoint, userChild, avatarChild, basis) {
    // change of basis: world -> local
    let userLimb = userChild.clone().sub(userJoint).applyMatrix3(basis.invert()).normalize();
    let avatarLimb = avatarChild.clone().normalize();
    return new THREE.Quaternion().setFromUnitVectors(avatarLimb, userLimb);
}

// applies rotation to basis
function updateBasis(rotation, xAxis, yAxis, zAxis, basis) {
    xAxis.applyQuaternion(rotation);
    yAxis.applyQuaternion(rotation);
    zAxis.applyQuaternion(rotation);
    basis.set(
        xAxis.x, yAxis.x, zAxis.x,
        xAxis.y, yAxis.y, zAxis.y,
        xAxis.z, yAxis.z, zAxis.z
    );
}

// returns linear interpolation of val between min and max
// (percentage that val is between min and max)
function interpolate(val, min, max) {
    let result = (val - min) / (max - min);

    if (result < 0) return 0;
    else if (result > 1) return 1;
    else return result;
}

function setMorphTarget(target, val) {
    // interpolate with previous value to prevent jittering
    let SMOOTHING = 0.25;
    morphTargets[morphDict[target]] = (1 - SMOOTHING) * morphTargets[morphDict[target]] + SMOOTHING * val;
}
