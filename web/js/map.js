"use strict";
const electron = require('electron');

function minimizeWindow() {
  const remote = require('remote');
  const BrowserWindow = remote.require('browser-window');
  const window = BrowserWindow.getFocusedWindow();
  window.minimize();
}

function closeWindow() {
  const remote = require('remote');
  const BrowserWindow = remote.require('browser-window');
  const window = BrowserWindow.getFocusedWindow();
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
        geom.faces.push(new THREE.Face3(
          Number(split[1]) - 1, Number(split[2]) - 1, Number(split[3]) - 1,
          null,
          new THREE.Color(Number(split[4]), Number(split[5]), Number(split[6]))
        ));
      }
    }
    geom.computeBoundingBox();
    geom.computeFaceNormals();
    // geom.computeVertexNormals();
    callback(world, area, geom);
  }, 'text');
}

function clamp(v, min, max) {
  if (v < min) {
    return min;
  } else if (v > max) {
    return max;
  } else {
    return v;
  }
}

$(() => {
  const stats = new Stats();

  document.body.appendChild(stats.dom);

  const canvasWrapper = document.getElementById('canvas-wrapper');
  const canvas = document.getElementById('render-canvas');
  const scene = new THREE.Scene();
  let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 3000);
  camera.up = new THREE.Vector3(0, 0, 1);
  let samusCam = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 1, 3000);

  let samusCamHelper = new THREE.CameraHelper(samusCam);
  scene.add(samusCam);
  scene.add(samusCamHelper);

  let camYaw = 0;
  let camPitch = 0;
  let camDist = 5;
  let mouseDown = null;
  canvas.addEventListener('mousedown', e => {
    mouseDown = e;
  });
  canvas.addEventListener('mouseup', () => {
    mouseDown = null
  });
  canvas.addEventListener('mousemove', e => {
    if (mouseDown) {
      let x = e.movementX;
      let y = e.movementY;
      camPitch = clamp(camPitch + y * 0.01, -Math.PI / 2 + 0.01, Math.PI / 2 - 0.01);
      camYaw = (camYaw - x * 0.01) % (2 * Math.PI);
    }
  });
  canvas.addEventListener('wheel', e => {
    camDist = clamp(camDist + ((camDist / 2) * (e.deltaY / 500)), 1, 500);
  });

  let latestSamusUpdate = {};
  let samusBox;
  let samusSphere;
  let velLine;
  {
    let samusGeom = new THREE.BoxGeometry(1, 1, 1);
    let samusMat = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF
    });
    samusBox = new THREE.Mesh(samusGeom, samusMat);
    samusBox.castShadow = true;
  }
  {
    let samusGeom = new THREE.SphereGeometry(1, 32, 32);
    let samusMat = new THREE.MeshPhongMaterial({
      color: 0xFFFFFF
    });
    samusSphere = new THREE.Mesh(samusGeom, samusMat);
    samusSphere.castShadow = true;
  }
  {
    let velGeom = new THREE.Geometry();
    velGeom.vertices.push(
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(1, 1, 1)
    );
    let velMat = new THREE.LineBasicMaterial({
      color: 0xFFFFFF,
      depthTest: false,
      lights: false,
    });
    velLine = new THREE.Line(velGeom, velMat);
    velLine.renderOrder = 999;
    velLine.frustumCulled = false;
  }
  scene.add(samusBox);
  scene.add(samusSphere);
  scene.add(velLine);
  samusBox.position.set(0, 0, 0);
  samusSphere.position.set(0, 0, 0);
  velLine.geometry.vertices[0].set(0, 0, 0);
  velLine.geometry.vertices[1].set(0, 0, 0);
  velLine.geometry.verticesNeedUpdate = true;


  const renderer = new THREE.WebGLRenderer({
    canvas: canvas
  });
  renderer.autoClear = false;
  renderer.sortObjects = true;
  renderer.shadowMap.enabled = true;

  const ambientLight = new THREE.AmbientLight(0x222222);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);


  const pointLight = new THREE.PointLight(0xFFFFFF, 0.5);
  pointLight.position.set(0, 0.1, 1);
  pointLight.castShadow = true;
  pointLight.shadowDarkness = 1;
  scene.add(pointLight);

  let worlds = {};
  let currentWorld = null;


  const intArray = new Int32Array(1);
  const floatArray = new Float32Array(intArray.buffer);

  function itf(val) {
    if (val % 1 !== 0) {
      return val;
    }
    intArray[0] = val;
    return floatArray[0];
  }

  function updateCamera() {
    let camVec = new THREE.Vector3(
      Math.cos(camYaw) * Math.cos(camPitch),
      Math.sin(camYaw) * Math.cos(camPitch),
      Math.sin(camPitch)
    );
    camVec = camVec.normalize().multiplyScalar(camDist);

    camera.position.set(
      samusSphere.position.x + camVec.x,
      samusSphere.position.y + camVec.y,
      samusSphere.position.z + camVec.z
    );
    camera.lookAt(samusSphere.position);
  }

  electron.ipcRenderer.on('showConnectPrompt', () => {
    smalltalk.prompt('Connect to Wii', 'Enter ip[:port] or host[:port] (default port: 43673)', localStorage['lastIpPort'])
      .then(function(ipPort) {
        localStorage['lastIpPort'] = ipPort;
        let split = ipPort.split(':');
        let ip = split[0];
        let port = split.length >= 2 ? Number(split[1]) : 43673;
        electron.ipcRenderer.send('connectToWii', ip, port);
      }, function() {
        console.log('cancel');
      });
  });

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
    const player = data.player_raw;
    const camData = data.camera;
    const isMorphed = player["morph_state"] == 1/* || player["morph_state"] == 2*/;

    const pos = player.translation.map(itf);
    const vel = player.velocity.map(itf);
    const orient = player.orientation;
    const aabb = player.collision_primitive.map(itf);
    const bbXDim = aabb[3] - aabb[0];
    const bbYDim = aabb[4] - aabb[1];
    const bbZDim = aabb[5] - aabb[2];
    samusBox.position.set(
      pos[0] + aabb[0] + bbXDim / 2,
      pos[1] + aabb[1] + bbYDim / 2,
      pos[2] + aabb[2] + bbZDim / 2
    );
    samusBox.scale.set(bbXDim, bbYDim, bbZDim);
    let morphPrimitive = player.morphball.collision_primitive;
    samusSphere.position.set(
      pos[0] + itf(morphPrimitive.origin[0]),
      pos[1] + itf(morphPrimitive.origin[1]),
      pos[2] + itf(morphPrimitive.origin[2])
    );
    samusSphere.scale.set(
      morphPrimitive.radius,
      morphPrimitive.radius,
      morphPrimitive.radius
    );

    let verticalOffset = isMorphed ? morphPrimitive.radius : bbZDim / 2;

    pointLight.position.set(pos[0] + 1, pos[1], pos[2] + 10);

    function renderVec(vec) {
      return vec.map(v => itf(v).toFixed(3));
    }

    samusBox.visible = !isMorphed;
    samusSphere.visible = isMorphed;


    velLine.geometry.vertices[0].set(0, 0, 0);
    velLine.geometry.vertices[1].set(vel[0] / 10, vel[1] / 10, vel[2] / 10);
    velLine.geometry.verticesNeedUpdate = true;
    velLine.position.set(pos[0], pos[1], pos[2] + verticalOffset);

    {
      let cam = isMorphed ? camData.ball : camData.first_person;

      let camTransform = new THREE.Matrix4().set(
        cam.transform[0], cam.transform[1], cam.transform[2], cam.transform[3],
        cam.transform[4], cam.transform[5], cam.transform[6], cam.transform[7],
        cam.transform[8], cam.transform[9], cam.transform[10], cam.transform[11],
        0, 0, 0, 1
      );

      let camPos = new THREE.Vector3();
      let camQuat = new THREE.Quaternion();
      let camScale = new THREE.Vector3();
      camTransform.decompose(camPos, camQuat, camScale);
      let fixQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
      camQuat = camQuat.multiply(fixQuat);

      samusCam.fov = cam.current_fov;
      samusCam.aspect = cam.aspect;
      samusCam.near = cam.znear;
      samusCam.far = cam.zfar;
      samusCam.position.copy(camPos);
      samusCam.quaternion.copy(camQuat);
      samusCam.updateProjectionMatrix();
    }

    updateCamera();

    let camStats = '';
//     let camStats = `Camera state: ${player.camera_state}`;
//     if (camData) {
//       camStats += `
// Ball:
// Watching: ${camData.ball.watched.toString(16)}
// Perspective: ${renderVec(camData.ball.perspective_raw)}
// Transform: ${renderVec(camData.ball.transform_raw)} @ ${camData.ball.transform_addr.toString(16)}
// Cam Transform: ${renderVec(camData.ball.transform_cam_raw)}
//
// First Person:
// Watching: ${camData.first_person.watched.toString(16)}
// Perspective: ${renderVec(camData.first_person.perspective_raw)}
// Transform: ${renderVec(camData.first_person.transform_raw)} @ ${camData.first_person.transform_addr.toString(16)}
// Cam Transform: ${renderVec(camData.first_person.transform_cam_raw)}
// Gun Follow: ${renderVec(camData.first_person.gun_follow_raw)}
// `;
//     }

    let horiz = Math.sqrt(
      itf(player.velocity[0]) * itf(player.velocity[0]) +
      itf(player.velocity[1]) * itf(player.velocity[1])
    );
    $("#physics").text(`${camStats}
Velocity: ${renderVec(player.velocity)}
Horiz/vert: ${horiz.toFixed(3)} ${itf(player.velocity[2]).toFixed(3)}
Ang Vel: ${renderVec(player.angular_velocity)}
Orient: ${renderVec(player.orientation)}
Translation: ${renderVec(player.translation)}
`);
    /*
    Transform:
${renderVec(player.transform.slice(0, 4))}
${renderVec(player.transform.slice(4, 8))}
${renderVec(player.transform.slice(8, 12))}
     */

    const world = data.world;
    let currentWorldString = world.mlvl.toString(16);
    showWorld(currentWorldString);
    $('#current-world').text(currentWorldString);
    let timer = player.timer;
    let seconds = (timer % 60).toFixed(3);
    let minutes = Math.floor(timer / 60) % 60;
    let hours = Math.floor(minutes / 60);

    let time = `${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    $('#timer').text(time);

    let currentWorldState = world.phase;
    let currentWorldStateString = 'Unknown';
    if (currentWorldState == 0) {
      currentWorldStateString = 'Loading';
    } else if (currentWorldState == 1) {
      currentWorldStateString = 'Loading Map';
    } else if (currentWorldState == 2) {
      currentWorldStateString = 'Loading Map Areas';
    } else if (currentWorldState == 3) {
      currentWorldStateString = 'Loading Sky Box';
    } else if (currentWorldState == 4) {
      currentWorldStateString = 'Loading Sound Groups';
    } else if (currentWorldState == 5) {
      currentWorldStateString = 'Ready';
    }
    $('#current-world-status').text(currentWorldStateString);
    $('#pos').text(pos.map(v => Number(v).toFixed(3)));
    $('#room').text(world.area.toString(16));
    // $('#resource-status').text(`${data.pool_summary.count}`);
    // {
    //   "heap_size": 17983936,
    //     "unused_count": 711,
    //     "unused_size": 14120534,
    //     "used_count": 33247,
    //     "used_size": 3810920
    // }
    function memReadable(v) {
      let k = v / 1024;
      let m = k / 1024;

      return m.toFixed(2);
    }

    $('#heap-stats').text(`${data.heap_stats.used_count}/${data.heap_stats.used_count + data.heap_stats.unused_count} ${memReadable(data.heap_stats.used_size)}M/${memReadable(data.heap_stats.heap_size)}M`);

    function showIfNonZero(itemID, imageID) {
      var img = $(`#${imageID}`);
      if (player.inventory[itemID * 2 + 1] > 0) {
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
    // if (pak == "metroid1.pak") {
    //   showWorld("158efe17");
    // } else if (pak == "metroid2.pak") {
    //   showWorld("83f6ff6f");
    // } else if (pak == "metroid3.pak") {
    //   showWorld("a8be6291");
    // } else if (pak == "metroid4.pak") {
    //   showWorld("39f2de28");
    // } else if (pak == "metroid5.pak") {
    //   showWorld("b1ac4d65");
    // } else if (pak == "metroid6.pak") {
    //   showWorld("3ef8237c");
    // } else if (pak == "metroid7.pak") {
    //   showWorld("c13b09d1");
    // } else if (pak == "metroid8.pak") {
    //   showWorld("13d79165");
    // }
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
      let r = Math.random() / 5 + 0.5;
      let g = Math.random() / 5 + 0.5;
      let b = Math.random() / 5 + 0.5;
      const color = new THREE.Color(r, g, b);
      let uniforms = {
        hotness: {value: 0.0},
        lightDirection: {value: new THREE.Vector3(0, 0.1, 1)},
        ambientColor: {value: color.multiplyScalar(0.5)},
        directionalColor: {value: color}
      };
      // const mat = new THREE.ShaderMaterial({
      //   uniforms: uniforms,
      //   vertexColors: THREE.FaceColors,
      //   vertexShader: vertShader,
      //   fragmentShader: fragShader,
      // });
      const mat = new THREE.MeshPhongMaterial({
        vertexColors: THREE.FaceColors
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.receiveShadow = true;

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
    camera.updateProjectionMatrix();
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

          //Disabled for now
          room.hotness = 1;
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
    updateCamera();
    renderer.clear();
    renderer.render(scene, camera);
    // renderer.clearDepth();
    // renderer.render(lineScene, camera);
    requestAnimationFrame(render);
  })();
});
