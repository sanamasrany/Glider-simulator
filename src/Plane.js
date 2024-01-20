import Wing from './Wing.js';
import * as THREE from 'three'
export default class Plane {
    wings = [];
    nose;
    wheels = [];
    rightTip;
    leftTip;
    backTip;
    upTip;
    noseTip;
    wheelsTips;
    m;
    eng;
    Idelta;
    // distx;
    // disty;
    // distz;
    pos;
    x;
    y;
    z;
    velocity;
    angularVelo;
    totalForce;
    totalTorque;
    constructor(x, y, z, pos, rightTip, leftTip, backTip, upTip, noseTip, wheelsTips, m, v, an, pitch, roll, yaw) {
        this.eng = new THREE.Vector3();
        for (var i = 0; i < 7; i++)
            this.wings.push(new Wing());
        this.x = new THREE.Vector3(x.x, x.y, x.z);
        this.y = new THREE.Vector3(y.x, y.y, y.z);
        this.z = new THREE.Vector3(z.x, z.y, z.z);
        this.pos = new THREE.Vector3(pos.x, pos.y, pos.z);
        this.velocity = new THREE.Vector3(v.x, v.y, v.z);
        this.angularVelo = new THREE.Vector3(an.x, an.y, an.z);
        this.set(m, rightTip, leftTip, backTip, upTip, noseTip, wheelsTips, pitch, roll, yaw);
    }
    set(m, rightTip, leftTip, backTip, upTip, noseTip, wheelsTips, pitch, roll, yaw) {
        this.nose = new THREE.Vector3(this.z.x, this.z.y, this.z.z);
        this.nose.multiplyScalar(noseTip.z);
        this.wheels = [];
        for (var i = 0; i < wheelsTips.length; i++) {
            var tempX = new THREE.Vector3(this.x.x, this.x.y, this.x.z);
            var tempY = new THREE.Vector3(this.y.x, this.y.y, this.y.z);
            var tempZ = new THREE.Vector3(this.z.x, this.z.y, this.z.z);
            tempX.multiplyScalar(wheelsTips[i].x);
            tempY.multiplyScalar(wheelsTips[i].y);
            tempZ.multiplyScalar(wheelsTips[i].z);
            var tttt = new THREE.Vector3();
            this.wheels.push(new THREE.Vector3().addVectors(tempX, tttt.addVectors(tempY, tempZ)));
            // this.wheels.push(new THREE.Vector3(wheelsTips[i].x, wheelsTips[i].y, wheelsTips[i].z));
        }
        // this.distx = distx;
        // this.disty = disty;
        // this.distz = distz;
        this.totalForce = new THREE.Vector3(0, 0, 0);
        this.totalTorque = new THREE.Vector3(0, 0, 0);
        this.m = m;
        var ans = new THREE.Vector3();
        var ans2 = new THREE.Vector3();
        var axis = new THREE.Vector3(this.x.x, this.x.y, this.x.z);
        axis.multiplyScalar(-1);
        //1) mainWing 
        ans.set(0, 0, 0);
        this.wings[0].set(this.y, 15, 0.1, ans, axis, 0); //try set area to 100 .. why? try a stall!

        //2) left aileron
        ans.set(this.x.x, this.x.y, this.x.z);
        ans.multiplyScalar(leftTip.x);
        this.wings[1].set(this.y, 2, roll + 0.1, ans, axis, 0);

        //3) right aileron
        ans.set(this.x.x, this.x.y, this.x.z);
        ans.multiplyScalar(rightTip.x);
        this.wings[2].set(this.y, 2, -roll + 0.1, ans, axis, 0);

        //4) horizontal stabilizer
        ans.set(this.z.x, this.z.y, this.z.z);
        ans.multiplyScalar(backTip.z);
        this.wings[3].set(this.y, 2, 0, ans, axis, 0);

        //5) elevators
        this.wings[4].set(this.y, 1, pitch, ans, axis, 0);

        ans2.set(this.y.x, this.y.y, this.y.z);
        ans2.multiplyScalar(upTip.y);
        ans.addVectors(ans, ans2);
        //6) vertical stabilizer
        this.wings[5].set(this.x, 2, 0, ans, this.y, 1);

        //7) rudder
        this.wings[6].set(this.x, 2, yaw, ans, this.y, 1);

    }

    manageFriction() {
        var Fr = 6000; // depends on forces vertical on the ground like W
        var FrWheels = 1000;

        var normal = new THREE.Vector3(0, 1, 0);
        var dotProduct = normal.dot(this.velocity);
        var cnt = 0;
        var res = new THREE.Vector3(normal.x, normal.y, normal.z);
        res.normalize();
        res.multiplyScalar(-dotProduct);
        var frictionDirection = new THREE.Vector3().addVectors(res, this.velocity);
        frictionDirection.multiplyScalar(-1);
        frictionDirection.normalize();
        var friction = new THREE.Vector3(frictionDirection.x, frictionDirection.y, frictionDirection.z);
        //
        var collide = false;
        var temp = new THREE.Vector3();
        var rota = false;
        var tips = [];
        for (var i = 0; i < this.wheels.length; i++)
            tips.push(this.wheels[i]);
        for (var i = 0; i < this.wings.length; i++)
            tips.push(this.wings[i].pos);
        tips.push(this.nose);
        for (var i = 0; i < tips.length; i++) {
            temp.addVectors(this.pos, tips[i]);
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (temp.y <= 1000 && temp.y >= 980 && temp.z <= -755 && temp.z >= -1450 && temp.x >= -60 && temp.x <= 300) {
                collide = true;
                // var crossProduct = new THREE.Vector3().crossVectors(this.angularVelo, tips[i]);
                // var valu = crossProduct.dot(friction);
                // if (valu < 0) {
                // rota = true;
                // var crossProduct = new THREE.Vector3().crossVectors(tips[i], friction);
                // this.totalTorque.addVectors(this.totalTorque, crossProduct);
                // }
                cnt = i;
            }

        }
        if (collide) {
            // console.log('here');
            if (cnt >= this.wheels.length)
                friction.multiplyScalar(Fr);
            else
                friction.multiplyScalar(FrWheels);

            this.totalForce.addVectors(this.totalForce, friction);

            //     if (dotProduct >= 0)
            //         friction.multiplyScalar(0);
        }
    }
    checkCollision(dt, W) {
        var newF = new THREE.Vector3(W.x, W.y, W.z);
        newF.multiplyScalar(-1);
        this.totalForce = new THREE.Vector3(0, 0, 0);
        this.totalTorque = new THREE.Vector3(0, 0, 0);
        var collide = false;
        var rota = false;
        var temp = new THREE.Vector3();
        var all = new THREE.Vector3(0, 0, 0);
        var tips = [];
        for (var i = 0; i < this.wheels.length; i++)
            tips.push(this.wheels[i]);
        for (var i = 0; i < this.wings.length; i++)
            tips.push(this.wings[i].pos);
        tips.push(this.nose);
        for (var i = 0; i < tips.length; i++) {
            temp.addVectors(this.pos, tips[i]);
            //////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (temp.y <= 1000 && temp.y >= 980 && temp.z <= -755 && temp.z >= -1450 && temp.x >= -60 && temp.x <= 300) {
                collide = true;
                // all.addVectors(all, tips[i]);
                var crossProduct = new THREE.Vector3().crossVectors(this.angularVelo, tips[i]);
                var normal = new THREE.Vector3(0, 1, 0);
                var valu = crossProduct.dot(normal);
                if (valu < 0) {
                    rota = true;
                }
            }
        }
        if (collide) {

            var R = new THREE.Vector3(0, 1, 0);
            var Rlen = R.dot(this.velocity);
            R.normalize();
            if (Rlen < 0) {
                R.multiplyScalar(-1.5 * Rlen * this.m / dt);
            } else
                R.multiplyScalar(0);
            this.totalForce.addVectors(this.totalForce, R);

            if (rota) {
                var Rt = new THREE.Vector3(this.angularVelo.x, this.angularVelo.y, this.angularVelo.z);
                Rt.normalize();
                Rt.multiplyScalar(-1.5 * this.angularVelo.length() * this.Idelta / dt);
                this.totalTorque.addVectors(this.totalTorque, Rt);

            }
            // var crossProduct = new THREE.Vector3().crossVectors(all, newF);
            // this.totalTorque.addVectors(this.totalTorque, crossProduct);


        }


    }
    calculateForcesAndTorques(wind, p) {


        for (var i = 0; i < this.wings.length; i++) {
            this.wings[i].calculateForcesAndTorques(this.z, this.velocity,
                this.angularVelo, wind, p);
            this.totalForce.addVectors(this.totalForce, this.wings[i].totalForce);
            this.totalTorque.addVectors(this.totalTorque, this.wings[i].totalTorque);
        }
    }


    updatePhysics(dt, W, engF) {
        var acc = new THREE.Vector3(0, 0, 0);
        var ans = new THREE.Vector3(0, 0, 0);

        this.eng.set(this.z.x, this.z.y, this.z.z);
        this.eng.multiplyScalar(engF);

        acc.set(this.totalForce.x, this.totalForce.y, this.totalForce.z);
        acc.addVectors(acc, W);
        acc.addVectors(acc, this.eng);
        acc.divideScalar(this.m);

        ans.set(acc.x, acc.y, acc.z);
        this.velocity.addVectors(this.velocity, ans.multiplyScalar(dt));
        ans.set(acc.x, acc.y, acc.z);
        this.pos.addVectors(this.pos, ans.multiplyScalar(0.5 * dt * dt));
        ans.set(this.velocity.x, this.velocity.y, this.velocity.z);
        this.pos.addVectors(this.pos, ans.multiplyScalar(dt));


        this.Idelta = this.m * 4 * 1.5 * 10;
        var Sig3 = this.totalTorque.length();
        var alpha3 = Sig3 / this.Idelta;
        var omega3 = alpha3 * dt;
        ans.set(this.totalTorque.x, this.totalTorque.y, this.totalTorque.z);
        ans.normalize();
        ans.multiplyScalar(omega3);
        this.angularVelo.addVectors(this.angularVelo, ans);
        ans.set(this.angularVelo.x, this.angularVelo.y, this.angularVelo.z);
        ans.normalize();
        // mesh1.rotateOnWorldAxis(ans, omega3 * dt + (0.5 * alpha3 * dt * dt));
        this.x.applyAxisAngle(ans, this.angularVelo.length() * dt + (0.5 * alpha3 * dt * dt));
        this.y.applyAxisAngle(ans, this.angularVelo.length() * dt + (0.5 * alpha3 * dt * dt));
        this.z.applyAxisAngle(ans, this.angularVelo.length() * dt + (0.5 * alpha3 * dt * dt));
        // ans.multiplyScalar(omega3);
    }



    // collisionUpdate(dt, collide, rota) {
    //     var acc = new THREE.Vector3(0, 0, 0);
    //     var ans = new THREE.Vector3(0, 0, 0);

    //     acc.set(this.totalForce.x, this.totalForce.y, this.totalForce.z);
    //     acc.divideScalar(this.m);
    //     ans.set(acc.x, acc.y, acc.z);
    //     this.velocity.addVectors(this.velocity, ans);
    //     if (collide)
    //         this.velocity.multiplyScalar(0.95);

    //     this.pos.addVectors(this.pos, ans.multiplyScalar(0.5 * dt * dt));
    //     ans.set(this.velocity.x, this.velocity.y, this.velocity.z);
    //     this.pos.addVectors(this.pos, ans.multiplyScalar(dt));


    //     this.Idelta = this.m * 4 * 1.5;
    //     var Sig3 = this.totalTorque.length();
    //     var alpha3 = Sig3 / this.Idelta;
    //     var omega3 = alpha3 * dt;
    //     ans.set(this.totalTorque.x, this.totalTorque.y, this.totalTorque.z);
    //     ans.normalize();
    //     ans.multiplyScalar(omega3);
    //     this.angularVelo.addVectors(this.angularVelo, ans);
    //     if (rota)
    //         this.angularVelo.multiplyScalar(0.95);
    //     ans.set(this.angularVelo.x, this.angularVelo.y, this.angularVelo.z);
    //     ans.normalize();
    //     // mesh1.rotateOnWorldAxis(ans, omega3 * dt + (0.5 * alpha3 * dt * dt));
    //     this.x.applyAxisAngle(ans, this.angularVelo.length() * dt + (0.5 * alpha3 * dt * dt));
    //     this.y.applyAxisAngle(ans, this.angularVelo.length() * dt + (0.5 * alpha3 * dt * dt));
    //     this.z.applyAxisAngle(ans, this.angularVelo.length() * dt + (0.5 * alpha3 * dt * dt));
    // }




}