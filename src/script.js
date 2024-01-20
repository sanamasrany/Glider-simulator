import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import gsap from 'gsap'
import * as dat from 'dat.gui'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { BloomEffect, EffectComposer, EffectPass, RenderPass, GodRaysEffect, SMAAEffect } from "postprocessing";
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

const gui = new dat.GUI({ width: 400 })
    //gui.hide()
    // Canvas
const canvas = document.querySelector('canvas.webgl')
    // Scene
const scene = new THREE.Scene()
    //Sizes
const sizes = {
        width: window.innerWidth,
        height: window.innerHeight
    }
    //camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000000)
camera.infiniteProjection = true;
camera.position.set(0, 50, 0)
scene.add(camera)
    //render
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.shadowMap.enabled = true;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 2.3;
// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
    //Lights
let hemiLight = new THREE.HemisphereLight(0xffa95c, 0x080820, 0.5);
scene.add(hemiLight);
let light = new THREE.SpotLight(0xffa95c, 0.6, 0, Math.PI); //0xffa95c
light.position.set(0, 1000, 500)
light.castShadow = true;
light.shadow.bias = -0.001;
light.shadow.mapSize.width = 1024 * 4;
light.shadow.mapSize.height = 1024 * 4;
scene.add(light);
const texturelouder = new THREE.TextureLoader()
let materialArray9 = [];
let texture_ft9 = texturelouder.load('sky/yonder_ft.jpg');
let texture_bk9 = texturelouder.load('sky/yonder_bk.jpg');
let texture_up9 = texturelouder.load('sky/yonder_up.jpg');
let texture_dn9 = texturelouder.load('sky/yonder_dn.jpg');
let texture_rt9 = texturelouder.load('sky/yonder_rt.jpg');
let texture_lf9 = texturelouder.load('sky/yonder_lf.jpg');

materialArray9.push(new THREE.MeshBasicMaterial({ map: texture_ft9 })); //
materialArray9.push(new THREE.MeshBasicMaterial({ map: texture_bk9 }));
materialArray9.push(new THREE.MeshBasicMaterial({ map: texture_up9 }));
materialArray9.push(new THREE.MeshBasicMaterial({ map: texture_dn9 }));
materialArray9.push(new THREE.MeshBasicMaterial({ map: texture_rt9 }));
materialArray9.push(new THREE.MeshBasicMaterial({ map: texture_lf9 })); //

for (let i = 0; i < 6; i++)
    materialArray9[i].side = THREE.BackSide;

let skyb = new THREE.BoxGeometry(10000, 13000, 17500);
let skybm = new THREE.Mesh(skyb, materialArray9);
skybm.position.y = 1200;
skybm.position.z = 6500;
scene.add(skybm);
let skyboxGeo = new THREE.BoxGeometry(8000, 4000, 8000);
let skybox = new THREE.Mesh(skyboxGeo, materialArray9);
skybox.position.z = 2000;
skybox.position.y = 600;
skybox.receiveShadow = true;
scene.add(skybox);
// foge 
scene.fog = new THREE.FogExp2(0xDFE9F3, 0.0006)
    // sun 
let sungeo = new THREE.CircleGeometry(220, 50)
let sunMat = new THREE.MeshBasicMaterial({ color: 0xffccaa }) //
let sun = new THREE.Mesh(sungeo, sunMat)
sun.position.set(2000, 1500, 5500);
sun.rotation.y = Math.PI
sun.scale.setX(1.2);
//sun.scale.setY(2);
scene.add(sun);
let composer;
let godraysfeffect = new GodRaysEffect(camera, sun, {
    resolutionScale: 1,
    density: 1,
    decay: 0.95, //
    weight: 0.9, //0.9
    samples: 15,
    blur: 5,
    clampMax: 1,
})
let renderpass = new RenderPass(scene, camera);
let effectpass = new EffectPass(camera, godraysfeffect);
effectpass.renderToScreen = false;

composer = new EffectComposer(renderer)
composer.addPass(renderpass)
composer.addPass(effectpass)
    //models 



const gltfl = new GLTFLoader()
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('/draco/')
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)
    //mountain
let moun = new THREE.Object3D();
gltfLoader.load(
    'models/snowmountain2/scene.gltf',
    (gltf) => {

        gltf.scene.scale.set(40, 40, 40)

        gltf.scene.position.set(0, -1000, 1900)
        moun = gltf.scene

        gltf.scene.traverse(function(node) {

            if (node.type === 'Mesh') {
                node.castShadow = true;
                node.receiveShadow = true
                node.geometry.computeVertexNormals();
            }

        });
        gltf.scene.castShadow = true
        scene.add(gltf.scene)
    }
)

gltfl.load(
    'models/airport/scene.gltf',

    (gltf) => {

        gltf.scene.scale.set(0.25, 0.25, 0.25)
        gltf.scene.rotation.y = Math.PI / 2
        gltf.scene.position.set(+300, 1000, -1000) //-200
        scene.add(gltf.scene)



    }
)

gltfl.load(
    'models/spool/scene.gltf',

    (gltf) => {

        gltf.scene.scale.set(700, 700, 700)
        gltf.scene.rotation.z = Math.PI / 2;
        gltf.scene.position.set(+230, +1010, -800)
        scene.add(gltf.scene)
    }
)


//reponsiveness
window.addEventListener('resize', () => {
        // Update sizes
        sizes.width = window.innerWidth
        sizes.height = window.innerHeight

        // Update camera
        camera.aspect = sizes.width / sizes.height
        camera.updateProjectionMatrix()

        // Update renderer
        renderer.setSize(sizes.width, sizes.height)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    })
    // plane BBox
    // cube 1
const cube1 = new THREE.Mesh(new THREE.BoxGeometry(60, 10, 10), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube1.position.set(0, 200, -1000);
cube1.castShadow = true
cube1.receiveShadow = true

let cube1BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube1BB.setFromObject(cube1)


// cube 2

const cube2 = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 50), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube2.position.set(0, 200, -1000);
cube2.castShadow = true
cube2.receiveShadow = true

let cube2BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube2BB.setFromObject(cube2);

scene.add(cube1, cube2);

// mountain BBox

const cube3 = new THREE.Mesh(new THREE.BoxGeometry(8000, 500, 8000), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube3.position.set(0, -800, 2000);


let cube3BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube3BB.setFromObject(cube3);

const cube4 = new THREE.Mesh(new THREE.BoxGeometry(600, 1000, 2200), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube4.position.set(600, 0, 2200);


let cube4BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube4BB.setFromObject(cube4);

const cube5 = new THREE.Mesh(new THREE.BoxGeometry(600, 700, 2200), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube5.position.set(0, 0, 2200);


let cube5BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube5BB.setFromObject(cube5);

const cube6 = new THREE.Mesh(new THREE.BoxGeometry(600, 700, 2200), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube6.position.set(1200, 0, 2200);


let cube6BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube6BB.setFromObject(cube6);

const cube7 = new THREE.Mesh(new THREE.BoxGeometry(600, 300, 2200), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube7.position.set(-600, 0, 2200);


let cube7BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube7BB.setFromObject(cube7);

const cube8 = new THREE.Mesh(new THREE.BoxGeometry(600, 300, 1000), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube8.position.set(1800, 0, 1600);


let cube8BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube8BB.setFromObject(cube8);

const cube9 = new THREE.Mesh(new THREE.BoxGeometry(600, 600, 2200), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube9.position.set(-1200, -300, 2200);

let cube9BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube9BB.setFromObject(cube9);


const cube10 = new THREE.Mesh(new THREE.BoxGeometry(600, 600, 2000), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube10.position.set(2400, -300, 1800);

let cube10BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube10BB.setFromObject(cube10);

const cube11 = new THREE.Mesh(new THREE.BoxGeometry(600, 1300, 1300), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube11.position.set(-1800, -300, 1500);

let cube11BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube11BB.setFromObject(cube11);

const cube12 = new THREE.Mesh(new THREE.BoxGeometry(600, 1300, 1300), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube12.position.set(-2400, -600, 1500);

let cube12BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube12BB.setFromObject(cube12);

const cube13 = new THREE.Mesh(new THREE.BoxGeometry(3500, 1000, 4000), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube13.position.set(0, -600, 2000);

let cube13BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube13BB.setFromObject(cube13);

const cube14 = new THREE.Mesh(new THREE.BoxGeometry(2000, 1000, 1000), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube14.position.set(+500, -300, 600);

let cube14BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube14BB.setFromObject(cube14);

const cube15 = new THREE.Mesh(new THREE.BoxGeometry(2000, 2000, 2000), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube15.position.set(+2500, -1200, 0);

let cube15BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube15BB.setFromObject(cube15);

const cube16 = new THREE.Mesh(new THREE.BoxGeometry(2000, 1000, 1400), new THREE.MeshLambertMaterial({ transparent: true, opacity: 0 }))
cube16.position.set(+2500, -500, 0);

let cube16BB = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3())
cube16BB.setFromObject(cube16);


//try comment this:
scene.add(cube3, cube4, cube5, cube6, cube7, cube8, cube9, cube10, cube11, cube12, cube13, cube14, cube15, cube16);
// line
const material = new THREE.LineBasicMaterial({ color: 0x402F1D, });
const geometry = new THREE.BufferGeometry({}).setFromPoints([
    new THREE.Vector3(210, +1010, -800), new THREE.Vector3(200, 1004, -1450)
]);
const line = new THREE.LineSegments(geometry, material);
scene.add(line);


//animate
const clock = new THREE.Clock()


var dt = 0.01;
var pitch = 0;
var roll = 0;
var yaw = 0;

var x = new THREE.Vector3();
var y = new THREE.Vector3();
var z = new THREE.Vector3();

var pos = new THREE.Vector3();
var engF = 0;
var slowMotion = 1;
var Brakes = 0;
var prev = 0;
var condi = false;
var condi2 = false;
var cameraPosAngle = 0;
var cameraUpAngle = 0;
var cameraPos = new THREE.Vector3(0, 0, 1);


//side ui
const mmgeo = new THREE.BoxGeometry(1, 1, 1)
const mmmat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mm = new THREE.Mesh(mmgeo, mmmat)
mm.position.set(300.0, 10.0, 9.8)
var m = mm.position.x;
// var s = mm.position.y;
var g = mm.position.z;

const windgeo = new THREE.BoxGeometry(1, 1, 1)
const windat = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const wind = new THREE.Mesh(windgeo, windat)
wind.position.set(0.0, 0.0, 0.0)
wind.scale.set(1.225, 0, 0);

var wx = wind.position.x;
var wy = wind.position.y;
var wz = wind.position.z;

var p = wind.scale.x;

gui.add(mm.position, 'x', 300, 20000, 300).name('Glider Mass')
gui.add(mm.position, 'z', 0, 50, 0.1).name('Gravity')
gui.add(wind.position, 'x', -100, 100, 10).name('Wind X')
gui.add(wind.position, 'y', -100, 100, 10).name('Wind Y')
gui.add(wind.position, 'z', -100, 100, 10).name('Wind Z')
gui.add(wind.scale, 'x', 0, 3, 0.005).name('Air density')

// CONTROL keys
document.onkeydown = function(e) {

    if (e.code == "ArrowDown") {
        pitch = -0.2;
    }
    if (e.code == "ArrowUp") {
        pitch = 0.2;
    }
    if (e.code == "ArrowLeft") {
        roll = -0.2;
    }
    if (e.code == "ArrowRight") {
        roll = 0.2;
    }
    if (e.code == "Slash") {
        yaw = 0.2;
    }
    if (e.code == "Period") {
        yaw = -0.2;
    }
    if (e.code == "KeyB") {
        Brakes = 1000;
    }
    if (e.code == "KeyW") {
        engF = 10000;
    }
    if (e.code == "KeyM") {
        condi2 = !condi2;
        if (condi2)
            slowMotion = 10;
        else
            slowMotion = 1;
    }
    if (e.code == "KeyP") {
        condi = !condi;
    }

}

document.addEventListener("keyup", (event) => {
    // when you stop pressing the keyboard
    // put here the default values 
    // you can also choose exactly the key that aren't clicked at this moment

    if (event.code == "KeyB")
        Brakes = 0;

    if (event.code == "KeyW")
        engF = 0;
    if (event.code == "Period" || event.code == "Slash") {
        yaw = 0;
    }
    if (event.code == "ArrowLeft" || event.code == "ArrowRight") {
        roll = 0;
    }
    if (event.code == "ArrowUp" || event.code == "ArrowDown") {
        pitch = 0;
    }

}, false);

var text2 = document.createElement('div');
text2.style.position = 'absolute';
// if you still don't see the label, try uncommenting this
text2.style.width = 400;
text2.style.height = 400;
text2.style.backgroundColor = "black";
text2.innerHTML = "hi there!";
text2.style.color = "white"
text2.style.top = 190 + 'px';
text2.style.right = 180 + 'px';
document.body.appendChild(text2);

var text3 = document.createElement('div');
text3.style.position = 'absolute';
// if you still don't see the label, try uncommenting this
text3.style.width = 400;
text3.style.height = 400;
text3.style.backgroundColor = "black";
text3.innerHTML = "hi there!";
text3.style.color = "white"
text3.style.top = 220 + 'px';
text3.style.right = 180 + 'px';
document.body.appendChild(text3);



const listener = new THREE.AudioListener()
camera.add(listener);

const audioloader = new THREE.AudioLoader()
const backgroundmusic = new THREE.Audio(listener);
audioloader.load('particles/Soundtrack .mp3',
    function(buffer) {
        backgroundmusic.setBuffer(buffer);
        backgroundmusic.setLoop(true);
        backgroundmusic.setVolume(0.5)
        backgroundmusic.play();
    }
)
const explosionsound = new THREE.Audio(listener);
audioloader.load('particles/Chunky Explosion.mp3',
    function(buffer) {
        explosionsound.setBuffer(buffer);
        explosionsound.setLoop(false);
        explosionsound.setVolume(1.0)
    }
)

//helping pos 
let kk = new THREE.BoxGeometry(1, 1, 1);
let kkk = new THREE.MeshBasicMaterial({ color: 0xffff00 })
let left = new THREE.Mesh(kk, kkk);
// scene.add(left);

let right = new THREE.Mesh(kk, kkk);
// scene.add(right);
let head = new THREE.Mesh(kk, kkk);
scene.add(head);
let tail = new THREE.Mesh(kk, kkk);
// scene.add(tail);
let weel1 = new THREE.Mesh(kk, kkk);
// scene.add(weel1);
let weel2 = new THREE.Mesh(kk, kkk);
// scene.add(weel2);
let weel3 = new THREE.Mesh(kk, kkk);
//scene.add(weel3);
let mixer = null
var mesh1 = new THREE.Mesh(kk, kkk);

var rightTip;
var leftTip;
var backTip;
var upTip;
var noseTip;
var wheelsTips;

var preheight;
var prevelo;


if (document.getElementById("para").value == 0) {
    gltfLoader.load(
            ' models/ultralight/scene.gltf',
            (gltf) => {

                gltf.scene.traverse(function(node) {

                    if (node.type === 'Mesh') {
                        node.castShadow = true;
                        node.receiveShadow = true
                        node.geometry.computeVertexNormals();
                    }

                });
                gltf.scene.scale.set(10, 10, 10)
                mesh1 = new THREE.Group()
                mesh1.add(gltf.scene)
                mesh1.position.set(200, 500, -2000)
                mesh1.castShadow = true;
                mesh1.receiveShadow = true;
                scene.add(mesh1)

            }
        )
        //get from model.. distances for the wings ..MUST BE ACCURATE!
    var rightTip = new THREE.Vector3(-9, 0, 0);
    var leftTip = new THREE.Vector3(9, 0, 0);
    var backTip = new THREE.Vector3(0, 0, -5);
    var upTip = new THREE.Vector3(0, 2, 0);
    var noseTip = new THREE.Vector3(0, 0, 5.25);
    var wheelsTips = [
        new THREE.Vector3(1.5, -3, 1),
        new THREE.Vector3(-1.5, -3, 1),
        new THREE.Vector3(0, -3, 5)
    ];
} else if (document.getElementById("para").value == 1) {

    gltfLoader.load(

        'models/glider/scene.gltf',
        //'/scene.gltf',

        (gltf) => {

            var model = gltf.scene;

            gltf.scene.traverse(function(node) {

                if (node.type === 'Mesh') {
                    node.castShadow = true;
                    node.receiveShadow = true
                    node.geometry.computeVertexNormals();
                }

            });

            gltf.scene.rotation.y = Math.PI / 2;
            gltf.scene.scale.set(1, 1, 1)
            mesh1 = new THREE.Group()
            mesh1.add(gltf.scene)
            mesh1.position.set(0, 300, -250)

            mesh1.castShadow = true;
            mesh1.receiveShadow = true;
            scene.add(mesh1)

        }

    )

    var rightTip = new THREE.Vector3(-7, 0, 0);
    var leftTip = new THREE.Vector3(7, 0, 0);
    var backTip = new THREE.Vector3(0, 0, -3);
    var upTip = new THREE.Vector3(0, 1, 0);
    var noseTip = new THREE.Vector3(0, 0, 3);
    var wheelsTips = [
        new THREE.Vector3(0, -2, 0.5),
        new THREE.Vector3(0, -2, -3),
    ];
} else if (document.getElementById("para").value == 2) {
    gltfLoader.load(
        '/scene.gltf',


        (gltf) => {

            var model = gltf.scene;

            gltf.scene.traverse(function(node) {

                if (node.type === 'Mesh') {
                    node.castShadow = true;
                    node.receiveShadow = true
                    node.geometry.computeVertexNormals();
                }

            });

            gltf.scene.rotation.y = Math.PI / 2;
            gltf.scene.scale.set(1, 1, 1)
            mesh1 = new THREE.Group()
            mesh1.add(gltf.scene)


            mesh1.position.set(0, 300, -250)


            const b = new THREE.Box3().setFromObject(gltf.scene)
            const siz = b.getSize(new THREE.Vector3())
            mesh1.castShadow = true;
            mesh1.receiveShadow = true;

            scene.add(mesh1)
        })
    var rightTip = new THREE.Vector3(-8, 0, 0);
    var leftTip = new THREE.Vector3(8, 0, 0);
    var backTip = new THREE.Vector3(0, 0, -4);
    var upTip = new THREE.Vector3(0, 1, 0);
    var noseTip = new THREE.Vector3(0, 0, 4);
    var wheelsTips = [
        new THREE.Vector3(0, -2, 1),
        new THREE.Vector3(0, -2, -1),
    ];
} else if (document.getElementById("para").value == 3) {
    gltfLoader.load(
        ' models/hang_glider_-_low_poly/scene.gltf',


        (gltf) => {

            var model = gltf.scene;

            gltf.scene.traverse(function(node) {

                if (node.type === 'Mesh') {
                    node.castShadow = true;
                    node.receiveShadow = true
                    node.geometry.computeVertexNormals();
                }

            });

            gltf.scene.rotation.y = -Math.PI / 2;
            gltf.scene.scale.set(0.1, 0.1, 0.1)

            mesh1 = new THREE.Group()
            mesh1.add(gltf.scene)


            mesh1.position.set(0, 300, -250)


            const b = new THREE.Box3().setFromObject(gltf.scene)
            const siz = b.getSize(new THREE.Vector3())
            mesh1.castShadow = true;
            mesh1.receiveShadow = true;

            scene.add(mesh1)
        })




    var rightTip = new THREE.Vector3(-8, 0, 0);
    var leftTip = new THREE.Vector3(8, 0, 0);
    var backTip = new THREE.Vector3(0, 0, -2);
    var upTip = new THREE.Vector3(0, 5, 0);
    var noseTip = new THREE.Vector3(0, 0, 5);
    var wheelsTips = [
        new THREE.Vector3(1, -10, 0),
        new THREE.Vector3(-1, -10, 0),
    ];
}
var veloc = 0;
var physics = new Worker('./physics.mjs', { type: 'module' });
var finished = true;
physics.onmessage = function(message) {
    const data = message.data;
    mesh1.position.set(data[0].x, data[0].y, data[0].z);
    const matrix = new THREE.Matrix4();
    matrix.makeBasis(data[1], data[2], data[3]);
    // Decompose matrix into Euler angles
    const euler = new THREE.Euler();
    euler.setFromRotationMatrix(matrix, 'XYZ');
    // Set mesh rotation from Euler
    mesh1.setRotationFromEuler(euler);
    pos.set(data[4].x, data[4].y, data[4].z);
    finished = true;
    veloc = data[7];
}


let flag = false;
const tick1 = () => {

    // Call tick again on the next frame
    window.requestAnimationFrame(tick1)
    x.set(mesh1.matrixWorld.elements[0], mesh1.matrixWorld.elements[1], mesh1.matrixWorld.elements[2]);
    y.set(mesh1.matrixWorld.elements[4], mesh1.matrixWorld.elements[5], mesh1.matrixWorld.elements[6]);
    z.set(mesh1.matrixWorld.elements[8], mesh1.matrixWorld.elements[9], mesh1.matrixWorld.elements[10]);
    m = mm.position.x;
    g = mm.position.z;

    wx = wind.position.x;
    wy = wind.position.y;
    wz = wind.position.z;

    p = wind.scale.x

    var elapsedTime = clock.getElapsedTime();
    dt = elapsedTime - prev;
    dt /= slowMotion;
    var arr = [
        pitch, roll, yaw, engF, Brakes, dt, rightTip, leftTip, backTip, upTip, noseTip, wheelsTips, m, g, wx, wy, wz, p
    ];
    prev = elapsedTime;
    if (finished) {
        physics.postMessage(arr);
        finished = false;
    }













    //doesn't make sense!
    if (cube2BB.intersectsBox(cube3BB) || cube1BB.intersectsBox(cube3BB) ||
        cube2BB.intersectsBox(cube4BB) || cube1BB.intersectsBox(cube4BB) ||
        cube2BB.intersectsBox(cube5BB) || cube1BB.intersectsBox(cube5BB) ||
        cube2BB.intersectsBox(cube6BB) || cube1BB.intersectsBox(cube6BB) ||
        cube2BB.intersectsBox(cube7BB) || cube1BB.intersectsBox(cube7BB) ||
        cube2BB.intersectsBox(cube8BB) || cube1BB.intersectsBox(cube8BB) ||
        cube2BB.intersectsBox(cube9BB) || cube1BB.intersectsBox(cube9BB) ||
        cube2BB.intersectsBox(cube10BB) || cube1BB.intersectsBox(cube10BB) ||
        cube2BB.intersectsBox(cube11BB) || cube1BB.intersectsBox(cube11BB) ||
        cube2BB.intersectsBox(cube12BB) || cube1BB.intersectsBox(cube12BB) ||
        cube2BB.intersectsBox(cube13BB) || cube1BB.intersectsBox(cube13BB) ||
        cube2BB.intersectsBox(cube14BB) || cube1BB.intersectsBox(cube14BB) ||
        cube2BB.intersectsBox(cube15BB) || cube1BB.intersectsBox(cube15BB) ||
        cube2BB.intersectsBox(cube16BB) || cube1BB.intersectsBox(cube16BB) ||
        (mesh1.position.x <= -4000 && mesh1.position.x >= -4010) || (mesh1.position.x >= 4000 && mesh1.position.x <= 4010) ||
        (mesh1.position.z <= -2100 && mesh1.position.z >= -2110) || (mesh1.position.z >= 6000 && mesh1.position.z <= 6010)



    ) {

        explosionsound.play();
        gltfLoader.load(
            'models/explosion/scene.gltf',

            (gltf) => {

                mixer = new THREE.AnimationMixer(gltf.scene)

                const action = mixer.clipAction(gltf.animations[0])

                action.play()
                gltf.scene.scale.set(15, 15, 15)


                gltf.scene.position.set(mesh1.position.x, mesh1.position.y + 50, mesh1.position.z)
                scene.add(gltf.scene)


            })
        flag = true;
        camera.position.set(mesh1.position.x - 10, mesh1.position.y + 100, mesh1.position.z - 100);

    }


    // line 
    if (mesh1.position.z <= -810)
        line.geometry.setFromPoints([new THREE.Vector3(210, +1010, -800), new THREE.Vector3(mesh1.position.x, mesh1.position.y, mesh1.position.z)])


    // Update controlsS
    controls.update()
    if (flag) {
        camera.lookAt(mesh1.position.x, mesh1.position.y + 50, mesh1.position.z);
        //pos.x = 0
        mesh1.position.x = 0
        mesh1.position.y = -10000
        mesh1.position.z = 0
        text2.innerHTML = "Velocity " + "__________________" + "0" + " m/s";
        text3.innerHTML = "Height" + "__________________" + "0" + " m";

    } else if (condi) {
        camera.position.set(mesh1.position.x - 30, mesh1.position.y, mesh1.position.z);
        camera.up.set(0, 1, 0);
        camera.lookAt(mesh1.position);
    } else {

        camera.position.set(mesh1.position.x - 14 * cameraPos.x + 3 * camera.up.x, mesh1.position.y - 14 * cameraPos.y + 3 * camera.up.y, mesh1.position.z - 14 * cameraPos.z + 3 * camera.up.z);
        camera.lookAt(mesh1.position.x + z.x, mesh1.position.y + z.y, mesh1.position.z + z.z);
        text2.innerHTML = "Velocity " + "__________________" + parseInt(veloc) + " m/s";
        text3.innerHTML = "Height" + "__________________" + parseInt(mesh1.position.y + 1000) + " m";

    }

    var Ang = new THREE.Vector3().crossVectors(camera.up, y);
    var num = Ang.length();
    if (num > 1)
        num = 1;
    cameraUpAngle = Math.asin(num);
    Ang.normalize();
    camera.up.applyAxisAngle(Ang, cameraUpAngle / (20 * slowMotion));
    Ang.crossVectors(cameraPos, z);
    num = Ang.length();
    if (num > 1)
        num = 1;
    cameraPosAngle = Math.asin(num);
    Ang.normalize();
    cameraPos.applyAxisAngle(Ang, cameraPosAngle / (20 * slowMotion));

    cube1.position.set(mesh1.position.x, mesh1.position.y + 10, mesh1.position.z);
    cube1BB.copy(cube1.geometry.boundingBox).applyMatrix4(cube1.matrixWorld);
    cube2.position.set(mesh1.position.x, mesh1.position.y + 10, mesh1.position.z)
    cube2BB.copy(cube2.geometry.boundingBox).applyMatrix4(cube2.matrixWorld);

    if (mixer != null) {
        mixer.update(dt)
    }

    // Render
    composer.render(0.1);
}
tick1()