"use strict";
const electron = require('electron');

function minimizeWindow() {
    var remote = require('remote');
    var BrowserWindow = remote.require('browser-window');
    var window = BrowserWindow.getFocusedWindow();
    window.minimize();
}

function closeWindow() {
    var remote = require('remote');
    var BrowserWindow = remote.require('browser-window');
    var window = BrowserWindow.getFocusedWindow();
    window.close();
}

function loadWorld(world, callback) {
    $.get(`../models/${world}.MLVL/areas.json`, data => {
        for (let i in data) {
            if (data.hasOwnProperty(i)) {
                loadRoom(world, i, (world, area, geom) => {
                    callback(world, area, geom, data[i]);
                });
            }
        }
    }, 'json')
}

function loadRoom(world, area, callback) {
    $.get(`../models/${world}.MLVL/${area}.MREA.obj`, data => {
        let lines = data.split('\n');
        let geom = new THREE.Geometry();
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line[0] == '#') {
                continue;
            } else if (line[0] == 'v') {
                let split = line.split(' ');
                geom.vertices.push(new THREE.Vector3(Number(split[1]), Number(split[2]), Number(split[3])));
            } else if (line[0] == 'f') {
                let split = line.split(' ');
                geom.faces.push(new THREE.Face3(Number(split[1]) - 1, Number(split[2]) - 1, Number(split[3]) - 1));
            }
        }
        geom.computeBoundingBox();
        geom.computeFaceNormals();
        // geom.computeVertexNormals();
        callback(world, area, geom);
    }, 'text');
}

$(() => {
    const stats = new Stats();

    document.body.appendChild(stats.dom);

    const canvasWrapper = document.getElementById('canvas-wrapper');
    const canvas = document.getElementById('render-canvas');
    const scene = new THREE.Scene();
    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
    camera.up = new THREE.Vector3(0, 0, 1);

    let controls = new THREE.OrbitControls(camera, canvas);
    //controls.addEventListener( 'change', render ); // add this only if there is no animation loop (requestAnimationFrame)
    controls.enableDamping = true;
    controls.dampingFactor = 1;
    controls.enableZoom = true;

    let samus;
    {
        let samusGeom = new THREE.SphereGeometry(1, 15, 15);
        let samusMat = new THREE.MeshPhongMaterial({
            color: 0xFFFFFF
        });
        samus = new THREE.Mesh(samusGeom, samusMat);

        electron.ipcRenderer.on('primeDump', (event, data) => {
            samus.position.set(data.pos[0], data.pos[1], data.pos[2]);
            // camera.position.set(data.pos[0], data.pos[1], data.pos[2] + 100);
            // camera.lookAt(samus.position);
        });
    }
    scene.add(samus);
    samus.position.set(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas
    });

    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    directionalLight.position.set(0, 0.1, 1).normalize();
    scene.add(directionalLight);

    let rooms = {};
    // Magmoor: 3ef8237c
    // Chozo: 83f6ff6f
    loadWorld("83f6ff6f", (world, areaID, geom, area) => {
        const mat = new THREE.MeshPhongMaterial({
            color: Math.floor(Math.random() * 0xFFFFFF)
        });
        const mesh = new THREE.Mesh(geom, mat);

        const bbMat = new THREE.LineBasicMaterial({
            color: mat.color,
            linewidth: 5
        });
        let transform = area.transform;
        const transformMatrix = new THREE.Matrix4();
        transformMatrix.set(
            transform[0], transform[1], transform[2], transform[3],
            transform[4], transform[5], transform[6], transform[7],
            transform[8], transform[9], transform[10], transform[11],
            0, 0, 0, 1
        );
        const bbGeom = new THREE.Geometry();
        {
            let bb = area.boundingBox;
            let x1 = bb[0];
            let y1 = bb[1];
            let z1 = bb[2];
            let x2 = bb[3];
            let y2 = bb[4];
            let z2 = bb[5];
            [
                //X side 1
                new THREE.Vector3(x1, y1, z1),
                new THREE.Vector3(x1, y1, z2),
                new THREE.Vector3(x1, y2, z2),
                new THREE.Vector3(x1, y2, z1),
                new THREE.Vector3(x1, y1, z1),
                //X side 2
                new THREE.Vector3(x2, y1, z1),
                new THREE.Vector3(x2, y1, z2),
                new THREE.Vector3(x2, y2, z2),
                new THREE.Vector3(x2, y2, z1),
                new THREE.Vector3(x2, y1, z1),
                //Missing Line 1
                new THREE.Vector3(x2, y1, z2),
                new THREE.Vector3(x1, y1, z2),
                //Missing Line 2
                new THREE.Vector3(x1, y2, z2),
                new THREE.Vector3(x2, y2, z2),
                //Missing Line 3
                new THREE.Vector3(x2, y2, z1),
                new THREE.Vector3(x1, y2, z1)

            ].map(v => v.applyMatrix4(transformMatrix))
                .forEach(v => bbGeom.vertices.push(v));
        }
        const bbMesh = new THREE.Line(bbGeom, bbMat);

        scene.add(mesh);
        scene.add(bbMesh);

        rooms[areaID] = {
            mesh: mesh,
            area: area,
            bbMesh: bbMesh
        };
    });

    camera.position.z = 100;
    camera.position.x = 100;
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    function resize() {
        renderer.setSize(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight, true);
        camera.aspect = canvasWrapper.offsetWidth / canvasWrapper.offsetHeight;
    }

    resize();
    $(window).resize(resize);

    let frame = 0;
    (function render() {
        stats.update();
        frame++;
        // camera.lookAt(new THREE.Vector3(0, 0, 0));
        // camera.position.x = Math.sin(frame / 500) * 500;
        // camera.position.y = Math.cos(frame / 500) * 500;
        renderer.render(scene, camera);
        requestAnimationFrame(render);
    })();
});
