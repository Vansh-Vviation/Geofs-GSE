(function () {
    const modelUrl = "https://raw.githubusercontent.com/Vansh-Vviation/Geofs-GSE/refs/heads/main/CaterringNA%20(1).gltf";
    let naCaterEntities = [];
    let cubeOffset = 0;
    const maxHeight = 5.7;

    if (!window.geofs || !geofs.api?.viewer?.entities) {
        console.error("GeoFS API unavailable.");
        return;
    }

    const viewer = geofs.api.viewer;

    function spawnCateringTruck() {
        const heading = parseFloat(document.getElementById("headingInputNA").value) || 0;
        const lateralOffset = (parseFloat(document.getElementById("lateralOffsetInputNA").value) || 15) * 0.000009;
        const forwardOffset = (parseFloat(document.getElementById("forwardOffsetInputNA").value) || 0) * 0.000009;
        const aircraftPos = geofs.aircraft.instance.llaLocation;
        const adjustedAlt = aircraftPos[2] - 3.0; // 10 feet lower than aircraft

        const lat = aircraftPos[0] + lateralOffset * Math.cos(heading + Math.PI / 2) + forwardOffset * Math.cos(heading);
        const lon = aircraftPos[1] + lateralOffset * Math.sin(heading + Math.PI / 2) + forwardOffset * Math.sin(heading);

        const orientation = Cesium.Transforms.headingPitchRollQuaternion(
            Cesium.Cartesian3.fromDegrees(lon, lat, adjustedAlt),
            new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(heading + 180), 0, 0)
        );

        const truck = viewer.entities.add({
            name: "North American Catering Truck",
            position: Cesium.Cartesian3.fromDegrees(lon, lat, adjustedAlt),
            model: {
                uri: modelUrl,
                scale: 0.04,
                minimumPixelSize: 32,
                nodeTransformations: {
                    "Cube.002": { translation: new Cesium.Cartesian3(0, 0, 0) },
                    "Cube.004": { translation: new Cesium.Cartesian3(0, 0, 0) },
                    "Cube.001": { rotation: Cesium.Quaternion.IDENTITY },
                    "Cube.003": { rotation: Cesium.Quaternion.IDENTITY },
                },
            },
            orientation: orientation,
        });

        naCaterEntities.push(truck);
    }

    function updateCubeHeight(height) {
        if (naCaterEntities.length === 0) return;
        const truck = naCaterEntities[naCaterEntities.length - 1];
        cubeOffset = Math.min(height, maxHeight);
        truck.model.nodeTransformations["Cube.002"].translation = new Cesium.Cartesian3(0, 0, cubeOffset);

        let cube004Height = 0;
        if (cubeOffset > 1.25) cube004Height = (cubeOffset - 1.25 - 0.05) * 3;
        truck.model.nodeTransformations["Cube.004"].translation = new Cesium.Cartesian3(0, 0, cube004Height);

        const rotationRatio = cubeOffset / maxHeight;
        const rotationQuat001 = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, Cesium.Math.toRadians(50 * rotationRatio));
        const rotationQuat003 = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, Cesium.Math.toRadians(-50 * rotationRatio));
        truck.model.nodeTransformations["Cube.001"].rotation = rotationQuat001;
        truck.model.nodeTransformations["Cube.003"].rotation = rotationQuat003;
    }

    function despawnCateringTruck() {
        if (naCaterEntities.length === 0) return;
        const truck = naCaterEntities.pop();
        viewer.entities.remove(truck);
    }

    // GUI
    const gui = document.createElement("div");
    gui.id = "naCaterGuiContainer";
    gui.style = "position:absolute;top:10px;right:150px;background:rgba(0,0,0,0.7);padding:10px;border-radius:5px;color:white;z-index:9999;";

    gui.innerHTML = `
        <h4>NA Catering Control</h4>
        Heading:<br/><input id="headingInputNA" type="number" value="0"><br/>
        Lateral Offset (m):<br/><input id="lateralOffsetInputNA" type="number" value="15"><br/>
        Forward Offset (m):<br/><input id="forwardOffsetInputNA" type="number" value="0"><br/>
        Cube Height:<br/><input id="heightSliderNA" type="range" min="0" max="${maxHeight}" step="0.1" value="0"><span id="heightValueNA">0</span>m<br/><br/>
        <button id="spawnNATruck">Spawn</button>
        <button id="despawnNATruck">Despawn</button>
    `;

    document.body.appendChild(gui);

    document.getElementById("heightSliderNA").oninput = (e) => {
        document.getElementById("heightValueNA").textContent = e.target.value;
        updateCubeHeight(parseFloat(e.target.value));
    };

    document.getElementById("spawnNATruck").onclick = spawnCateringTruck;
    document.getElementById("despawnNATruck").onclick = despawnCateringTruck;
})();
