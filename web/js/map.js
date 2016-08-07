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
    geom.computeVertexNormals();
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

  let latestSamusUpdate = {};
  let samus;
  {
    let samusGeom = new THREE.SphereGeometry(1, 15, 15);
    let samusMat = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF
    });
    samus = new THREE.Mesh(samusGeom, samusMat);
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

  let worlds = {};
  let currentWorld = null;

  electron.ipcRenderer.on('depRead', (event, data) => {
    let world = worlds[currentWorld];
    if (world) {
      data.owners.forEach(owner => {
        let area = world.rooms[owner.mrea];
        if (area) {
          area.refCount += 1;
        }
      })
    }
  });

  electron.ipcRenderer.on('primeDump', (event, data) => {
    latestSamusUpdate = data;
    samus.position.set(data.pos[0], data.pos[1], data.pos[2]);
    camera.position.set(data.pos[0], data.pos[1], data.pos[2] + 100);
    camera.lookAt(samus.position);

    function showIfNonZero(itemID, imageID) {
      var img = $(`#${imageID}`);
      if (data.inventory[itemID * 2 + 1] > 0) {
        if (!img.is(":visible")) {
          console.log(`Showing ${itemID} ${imageID}`);
          img.show();
        }
      } else {
        if (img.is(":visible")) {
          console.log(`Hiding ${itemID} ${imageID}`);
          img.hide();
        }
      }
    }

    showIfNonZero(0x0F, "img-space-jump");

    showIfNonZero(0x10, "img-morph-ball");
    showIfNonZero(0x12, "img-boost-ball");
    showIfNonZero(0x13, "img-spider-ball");

    showIfNonZero(0x06, "img-bombs");
    showIfNonZero(0x07, "img-power-bombs");

    showIfNonZero(0x0A, "img-charge-beam");
    showIfNonZero(0x02, "img-wave-beam");
    showIfNonZero(0x01, "img-ice-beam");
    showIfNonZero(0x03, "img-plasma-beam");

    showIfNonZero(0x0B, "img-super-missile");
    showIfNonZero(0x1C, "img-wavebuster");
    showIfNonZero(0x0E, "img-ice-spreader");
    showIfNonZero(0x08, "img-flamethrower");

    showIfNonZero(0x16, "img-varia-suit");
    showIfNonZero(0x15, "img-gravity-suit");
    showIfNonZero(0x17, "img-phazon-suit");

    showIfNonZero(0x09, "img-thermal-visor");
    showIfNonZero(0x0D, "img-xray-visor");
  });

  electron.ipcRenderer.on('pakRead', (event, data) => {
    let pak = data.pak.toLowerCase();
    if (pak == "metroid1.pak") {
      showWorld("158efe17");
    } else if (pak == "metroid2.pak") {
      showWorld("83f6ff6f");
    } else if (pak == "metroid3.pak") {
      showWorld("a8be6291");
    } else if (pak == "metroid4.pak") {
      showWorld("39f2de28");
    } else if (pak == "metroid5.pak") {
      showWorld("b1ac4d65");
    } else if (pak == "metroid6.pak") {
      showWorld("3ef8237c");
    } else if (pak == "metroid7.pak") {
      showWorld("c13b09d1");
    } else if (pak == "metroid8.pak") {
      showWorld("13d79165");
    }
  });

  function showWorld(id) {
    if (currentWorld == id) return;
    console.log("Showing world " + id);
    currentWorld = id;
    for (let world in worlds) {
      scene.remove(worlds[world].object);
    }
    scene.add(worlds[id].object);
  }

  let vertShader;
  let fragShader;

  //TODO: less dumb. Promises, maybe?
  $.get("../shaders/geom.vert", data => {
    vertShader = data;
    $.get("../shaders/geom.frag", data => {
      fragShader = data;
      loadAndAddWorld("3ef8237c");
      loadAndAddWorld("13d79165");
      loadAndAddWorld("39f2de28");
      loadAndAddWorld("83f6ff6f");
      loadAndAddWorld("158efe17");
      loadAndAddWorld("a8be6291");
      loadAndAddWorld("b1ac4d65");
      loadAndAddWorld("c13b09d1");
      showWorld("3ef8237c");
    })
  });

  function loadAndAddWorld(id) {
    let rooms = {};
    let object = new THREE.Object3D();
    worlds[id] = {
      rooms: rooms,
      object: object
    };
    loadWorld(id, (world, areaID, geom, area) => {
      const color = new THREE.Color(Math.floor(Math.random() * 0xFFFFFF));
      let uniforms = {
        hotness: {value: 0.0},
        lightDirection: {value: new THREE.Vector3(0, 0.1, 1)},
        ambientColor: {value: color.multiplyScalar(0.2)},
        directionalColor: {value: color}
      };
      const mat = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: vertShader,
        fragmentShader: fragShader,
      });
      const mesh = new THREE.Mesh(geom, mat);

      const bbMat = new THREE.LineBasicMaterial({
        color: color,
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

      object.add(mesh);
      object.add(bbMesh);

      rooms[areaID] = {
        mesh: mesh,
        area: area,
        bbMesh: bbMesh,
        refCount: 0,
        hotness: 0,
        uniforms: uniforms
      };
      console.log("Loaded room " + areaID);
    });
  }

  camera.position.z = 100;
  camera.position.x = 100;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  function resize() {
    renderer.setSize(canvasWrapper.offsetWidth, canvasWrapper.offsetHeight, true);
    camera.aspect = canvasWrapper.offsetWidth / canvasWrapper.offsetHeight;
  }

  function updateAreaHotness() {
    let world = worlds[currentWorld];
    if (world) {
      for (let roomID in world.rooms) {
        if (world.rooms.hasOwnProperty(roomID)) {
          let room = world.rooms[roomID];
          if (room.refCount > 30) {
            room.refCount = 30;
          } else if (room.refCount > 0) {
            room.refCount -= 0.1;
            room.hotness += 0.1;
          }

          if (room.area.index == (latestSamusUpdate || {}).room) {
            room.hotness += 0.2;
          }

          if (room.hotness > 2) {
            room.hotness = 2;
          } else if (room.hotness > 0) {
            room.hotness -= 0.03;
          }

          let hotness = (room.hotness / 20);
          room.uniforms.hotness.value = hotness;
          room.mesh.material.uniforms = room.uniforms;
        }
      }
    }
  }

  resize();
  $(window).resize(resize);

  let frame = 0;
  (function render() {
    stats.update();
    frame++;
    updateAreaHotness();
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    // camera.position.x = Math.sin(frame / 500) * 500;
    // camera.position.y = Math.cos(frame / 500) * 500;
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  })();
});
