(function () {
    const modelUrl = "https://raw.githubusercontent.com/Vansh-Vviation/Geofs-GSE/refs/heads/main/hiCateringNA.gltf";
    const maxHeight = 5.7;
    let cateringTruckEntities = window.cateringTruckEntities || [];
    let cubeOffset = 0;

    const viewer = geofs?.api?.viewer;
    if (!viewer) return console.error("GeoFS API not available.");

    // If GUI already exists, just reopen it
    if (document.getElementById("cateringGuiContainer")) {
        document.getElementById("cateringGuiContainer").style.display = "block";
        return;
    }

    function spawnCateringTruck() {
        const heading = parseFloat(document.getElementById("headingInput")?.value) || 0;
        const lateralOffset = (parseFloat(document.getElementById("lateralOffsetInput")?.value) || 15) * 0.000009;
        const forwardOffset = (parseFloat(document.getElementById("forwardOffsetInput")?.value) || 0) * 0.000009;

        const [aircraftLat, aircraftLon, aircraftAlt] = geofs.aircraft.instance.llaLocation;
        const adjustedAlt = aircraftAlt - 3.048; // 10 feet below aircraft altitude

        const lat = aircraftLat + lateralOffset * Math.cos(heading + Math.PI / 2) + forwardOffset * Math.cos(heading);
        const lon = aircraftLon + lateralOffset * Math.sin(heading + Math.PI / 2) + forwardOffset * Math.sin(heading);

        const adjustedHeading = Cesium.Math.toRadians(heading + 180);
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(
            Cesium.Cartesian3.fromDegrees(lon, lat, adjustedAlt),
            new Cesium.HeadingPitchRoll(adjustedHeading, 0, 0)
        );

        const truck = viewer.entities.add({
            name: "Catering Truck",
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
            orientation,
        });

        cateringTruckEntities.push(truck);
        console.log("Catering truck spawned.");
    }

    function updateCubeHeight(height) {
        height = Math.min(height, maxHeight);
        cubeOffset = height;

        const latest = cateringTruckEntities[cateringTruckEntities.length - 1];
        if (!latest?.model?.nodeTransformations) return;

        latest.model.nodeTransformations["Cube.002"].translation = new Cesium.Cartesian3(0, 0, height);

        let cube004Height = 0;
        if (height > 1.25) {
            cube004Height = (height - 1.25 - 0.05) * 3;
        }
        latest.model.nodeTransformations["Cube.004"].translation = new Cesium.Cartesian3(0, 0, cube004Height);

        const rotationRatio = height / maxHeight;
        const angle001 = Cesium.Math.toRadians(50 * rotationRatio);
        const angle003 = Cesium.Math.toRadians(-50 * rotationRatio);

        latest.model.nodeTransformations["Cube.001"].rotation = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, angle001);
        latest.model.nodeTransformations["Cube.003"].rotation = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, angle003);
    }

    function despawnCateringTruck() {
        if (cateringTruckEntities.length === 0) return console.log("No trucks to remove.");
        const truck = cateringTruckEntities.pop();
        viewer.entities.remove(truck);
        console.log("Catering truck removed.");
    }

    // Build GUI
    const gui = document.createElement("div");
    gui.id = "cateringGuiContainer";
    gui.style.position = "absolute";
    gui.style.top = "10px";
    gui.style.right = "10px";
    gui.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
    gui.style.padding = "10px";
    gui.style.borderRadius = "6px";
    gui.style.color = "white";
    gui.style.zIndex = "9999";

    gui.innerHTML = `
        <h4>Catering Truck Control</h4>
        <label>Heading (°)</label><br/>
        <input id="headingInput" type="number" value="0" style="width: 100%;"><br/><br/>
        <label>Lateral Offset (m)</label><br/>
        <input id="lateralOffsetInput" type="number" value="15" style="width: 100%;"><br/><br/>
        <label>Forward Offset (m)</label><br/>
        <input id="forwardOffsetInput" type="number" value="0" style="width: 100%;"><br/><br/>
        <label>Cube Height</label><br/>
        <input id="heightSlider" type="range" min="0" max="5.7" step="0.1" value="0" style="width: 100%;">
        <span id="heightValue">0</span> m<br/><br/>
        <button id="spawnTruck">Spawn Truck</button><br/><br/>
        <button id="despawnTruck">Despawn Truck</button><br/><br/>
        <button id="hideGui">Hide UI</button>
    `;

    document.body.appendChild(gui);

    document.getElementById("spawnTruck").onclick = spawnCateringTruck;
    document.getElementById("despawnTruck").onclick = despawnCateringTruck;
    document.getElementById("hideGui").onclick = () => gui.style.display = "none";

    const slider = document.getElementById("heightSlider");
    const sliderVal = document.getElementById("heightValue");
    slider.addEventListener("input", e => {
        const val = parseFloat(e.target.value);
        sliderVal.textContent = val.toFixed(1);
        updateCubeHeight(val);
    });

    // Global exposure for GUI reuse
    window.spawnCateringTruck = spawnCateringTruck;
    window.updateCubeHeight = updateCubeHeight;
    window.despawnCateringTruck = despawnCateringTruck;
    window.cateringTruckEntities = cateringTruckEntities;
})();
