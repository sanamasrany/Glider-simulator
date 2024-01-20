import * as THREE from 'three'

export default class Wing {

    initialNormal;
    normal;
    area; //
    angleWithPlane;
    pos;
    worldAirVelocity;
    coefficients;
    totalForce;
    totalTorque;
    axis;
    chord;
    // Constructor 
    constructor(initialNormal = new THREE.Vector3(), area = 0, angleWithPlane = 0, pos = new THREE.Vector3(), axis = new THREE.Vector3(), chord = 0) {
        this.set(initialNormal, area, angleWithPlane, pos, axis, chord);
    }
    set(initialNormal, area, angleWithPlane, pos, axis, chord) {
        this.chord = chord
        this.initialNormal = new THREE.Vector3(initialNormal.x, initialNormal.y, initialNormal.z);
        this.area = area;
        this.angleWithPlane = angleWithPlane;
        this.pos = new THREE.Vector3(pos.x, pos.y, pos.z);
        this.axis = new THREE.Vector3(axis.x, axis.y, axis.z);
        var vector = new THREE.Vector3(initialNormal.x, initialNormal.y, initialNormal.z);
        vector.applyAxisAngle(this.axis, this.angleWithPlane);
        this.normal = new THREE.Vector3(vector.x, vector.y, vector.z);
    }

    calculateForcesAndTorques(z, v, an, w, p) {

        var planeVelo = new THREE.Vector3(v.x, v.y, v.z);
        planeVelo.multiplyScalar(-1);
        var planeAngVelo = new THREE.Vector3(an.x, an.y, an.z);
        var crossProduct = new THREE.Vector3().crossVectors(planeAngVelo, this.pos);
        crossProduct.multiplyScalar(-1);
        var wind = new THREE.Vector3(w.x, w.y, w.z);
        this.worldAirVelocity = new THREE.Vector3();
        var ans = new THREE.Vector3();
        this.worldAirVelocity.addVectors(planeVelo, ans.addVectors(crossProduct, wind));
        // this.worldAirVelocity.set(planeVelo.x, planeVelo.y, planeVelo.z);

        let n1 = new THREE.Vector3(z.x, z.y, z.z);
        n1.applyAxisAngle(this.axis, this.angleWithPlane);
        let n2 = new THREE.Vector3(this.normal.x, this.normal.y, this.normal.z);
        let vertical = new THREE.Vector3().crossVectors(n1, n2);
        let temp = new THREE.Vector3(vertical.x, vertical.y, vertical.z);
        ans.set(this.worldAirVelocity.x, this.worldAirVelocity.y, this.worldAirVelocity.z);

        let dot = ans.dot(temp);
        temp.multiplyScalar(-dot);
        this.worldAirVelocity.addVectors(this.worldAirVelocity, temp);


        var dynamicPressure = 0.5 * p * this.worldAirVelocity.length() * this.worldAirVelocity.length();

        var angleOfAttack = 0;
        var vv2 = new THREE.Vector3();
        vv2.set(this.worldAirVelocity.x, this.worldAirVelocity.y, this.worldAirVelocity.z);
        vv2.normalize();
        var A2 = new THREE.Vector3();
        A2.set(this.normal.x, this.normal.y, this.normal.z);
        var dotProduct2 = A2.dot(vv2);
        if (dotProduct2 < -1)
            dotProduct2 = -1;
        if (dotProduct2 > 1)
            dotProduct2 = 1;
        angleOfAttack = Math.acos(dotProduct2);




        this.coefficients = new THREE.Vector3();
        this.coefficients.x = 0.8 * Math.abs(Math.sin(2 * angleOfAttack));
        this.coefficients.y = 0.02 * Math.abs(Math.sin(angleOfAttack));
        //very important:
        var stallAngle = Math.PI / 4;
        if (Math.abs(dotProduct2) > Math.abs(Math.cos(Math.PI / 2 - stallAngle))) {
            this.coefficients.x *= 0.05;
            this.coefficients.y *= 20;
        }
        this.coefficients.z = 0.01 * Math.abs(Math.sin(angleOfAttack));
        this.coefficients.z = 0;

        var dragDirection = new THREE.Vector3(this.worldAirVelocity.x, this.worldAirVelocity.y, this.worldAirVelocity.z);
        dragDirection.normalize();
        ans.set(vertical.x, vertical.y, vertical.z);
        var liftDirection = new THREE.Vector3().crossVectors(dragDirection, ans);



        var lift = new THREE.Vector3(liftDirection.x, liftDirection.y, liftDirection.z);
        lift.multiplyScalar(this.coefficients.x * dynamicPressure * this.area);

        vv2.set(liftDirection.x, liftDirection.y, liftDirection.z);
        vv2.normalize();
        A2.set(this.normal.x, this.normal.y, this.normal.z);
        var dotProduct1 = A2.dot(vv2);
        if (dotProduct1 * dotProduct2 < 0)
            lift.multiplyScalar(-1);




        var drag = new THREE.Vector3(dragDirection.x, dragDirection.y, dragDirection.z);
        drag.multiplyScalar(this.coefficients.y * dynamicPressure * this.area);
        this.totalForce = new THREE.Vector3().addVectors(lift, drag);
        this.totalTorque = new THREE.Vector3().crossVectors(this.pos, this.totalForce);



        var secondaryTorque = new THREE.Vector3(this.totalTorque.x, this.totalTorque.y, this.totalTorque.z);
        secondaryTorque.multiplyScalar(-1);
        secondaryTorque.normalize();
        secondaryTorque.multiplyScalar(this.coefficients.z * dynamicPressure * this.area * this.chord);
        this.totalTorque.addVectors(this.totalTorque, secondaryTorque);

    }



}