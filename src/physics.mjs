import * as THREE from 'three'
import Plane from './Plane.js';

var p = 1.225;
var m = 300.0;
var wind = new THREE.Vector3(100, 0, 0);
var angularVelo = new THREE.Vector3(0, 0, 0);
var g = 9.8;
var v = new THREE.Vector3(0, 0, 0);
var x = new THREE.Vector3(1, 0, 0);
var y = new THREE.Vector3(0, 1, 0);
var z = new THREE.Vector3(0, 0, 1);
var pos = new THREE.Vector3(200, 1004, -1450); //-190
var W = new THREE.Vector3();
var pass = [];
var reality = 100; //100
var plano = new Plane(x, y, z, pos, pos, pos, pos, pos, pos, [pos], m, v, angularVelo, 0, 0, 0);
//1) DEBUGGING VERTICAL STABILIZER FORCES AND TORQUES AND DRAWING THEM.




self.onmessage = function(message) {
    var i = 0;
    const data = message.data;
    var pitch = data[0];
    var roll = data[1];
    var yaw = data[2];
    var engF = data[3];
    var Brakes = data[4];
    var dt2 = data[5];
    var rightTip = data[6];
    var leftTip = data[7];
    var backTip = data[8];
    var upTip = data[9];
    var noseTip = data[10];
    var wheelsTips = data[11];
    m = data[12];
    g = data[13];
    W.set(0, -m * g, 0);
    wind.set(data[14], data[15], data[16]);
    p = data[17];
    var dt = dt2 / reality;
    // console.log(plano.velocity.length());
    while (true) {
        i++;
        plano.set(m, rightTip, leftTip, backTip, upTip, noseTip, wheelsTips, pitch, roll, yaw);
        plano.calculateForcesAndTorques(wind, p);
        plano.manageFriction();
        plano.updatePhysics(dt, W, engF);
        //
        plano.checkCollision(dt, W);
        plano.updatePhysics(dt, new THREE.Vector3(0, 0, 0), 0);

        if (i >= reality - 2) {
            pass = [plano.pos, plano.x, plano.y, plano.z, plano.wings[6].pos, plano.wings[5].totalForce, plano.wings[6].totalForce, plano.velocity.length()];
            break;
        }
    }
    self.postMessage(pass);


}