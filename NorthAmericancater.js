(function () {
    const modelUrl = "https://raw.githubusercontent.com/Vansh-Vviation/Geofs-GSE_Main.js_released/refs/heads/main/CaterringNA%20(1).gltf";

    // GLOBAL persistence
    window.cateringTruckEntities = window.cateringTruckEntities || [];
    window.cubeOffset = window.cubeOffset || 0;
    const maxHeight002 = 3.3;
    const maxHeight004 = 2.3;
    const cube004StartHeight = 1.0;

    if (!window.geofs || !geofs.api || !geofs.api.viewer || !geofs.api.viewer.entities) {
        console.error("GeoFS API or Cesium not available.");
        return;
    }

    const viewer = geofs.api.viewer;

    window.spawnCateringTruck = function () {
        const heading = parseFloat(document.getElementById("headingInput")?.value) || 0;
        const lateralOffset = (parseFloat(document.getElementById("lateralOffsetInput")?.value) || 15) * 0.000009;
        const forwardOffset = (parseFloat(document.getElementById("forwardOffsetInput")?.value) || 0) * 0.000009;

        const aircraftPos = geofs.aircraft.instance.llaLocation;
        const aircraftLat = aircraftPos[0];
        const aircraftLon = aircraftPos[1];
        const aircraftAlt = aircraftPos[2];

        const adjustedAlt = aircraftAlt - 11.9; // ← 11.9 meters below aircraft
        const lat = aircraftLat + lateralOffset * Math.cos(heading + Math.PI / 2) + forwardOffset * Math.cos(heading);
        const lon = aircraftLon + lateralOffset * Math.sin(heading + Math.PI / 2) + forwardOffset * Math.sin(heading);
        const adjustedHeading = Cesium.Math.toRadians(heading + 180);
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(
            Cesium.Cartesian3.fromDegrees(lon, lat, adjustedAlt),
            new Cesium.HeadingPitchRoll(adjustedHeading, 0, 0)
        );

        const entity = viewer.entities.add({
            name: "Catering Truck",
            position: Cesium.Cartesian3.fromDegrees(lon, lat, adjustedAlt),
            model: {
                uri: modelUrl,
                scale: 0.02,
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

        window.cateringTruckEntities.push(entity);
        console.log("Truck spawned.");
    };

    window.updateCubeHeight = function (height) {
        const truck = window.cateringTruckEntities.at(-1);
        if (!truck || !truck.model.nodeTransformations) return;

        const clampedHeight002 = Math.min(height, maxHeight002);
        window.cubeOffset = clampedHeight002;

        truck.model.nodeTransformations["Cube.002"].translation = new Cesium.Cartesian3(0, 0, clampedHeight002);

        let cube004Height = 0;
        if (clampedHeight002 > cube004StartHeight) {
            const effectiveHeight = clampedHeight002 - cube004StartHeight;
            const maxEffectiveHeight = maxHeight002 - cube004StartHeight;
            const ratio = effectiveHeight / maxEffectiveHeight;
            cube004Height = ratio * maxHeight004;
        }
        truck.model.nodeTransformations["Cube.004"].translation = new Cesium.Cartesian3(0, 0, cube004Height);

        const rotRatio = clampedHeight002 / maxHeight002;
        const rot001 = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, Cesium.Math.toRadians(50 * rotRatio));
        const rot003 = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, Cesium.Math.toRadians(50 * rotRatio));
        truck.model.nodeTransformations["Cube.001"].rotation = rot001;
        truck.model.nodeTransformations["Cube.003"].rotation = rot003;
    };

    window.despawnCateringTruck = function () {
        const truck = window.cateringTruckEntities.pop();
        if (truck) {
            viewer.entities.remove(truck);
            console.log("Truck removed.");
        }
    };

    // Reuse GUI if already present
    let existing = document.getElementById("cateringGuiContainer");
    if (existing) {
        existing.style.display = "block";
        return;
    }

    // Create GUI
    const gui = document.createElement("div");
    gui.id = "cateringGuiContainer";
    gui.style.position = "absolute";
    gui.style.top = "10px";
    gui.style.right = "10px";
    gui.style.background = "rgba(0, 0, 0, 0.7)";
    gui.style.padding = "10px";
    gui.style.borderRadius = "5px";
    gui.style.color = "white";
    gui.style.zIndex = "9999";

    gui.innerHTML = `
        <h4>Catering Truck Control</h4>
        <label>Heading (°):</label><br/>
        <input id="headingInput" type="number" value="0" style="width: 100%;"><br/><br/>
        <label>Lateral Offset (m):</label><br/>
        <input id="lateralOffsetInput" type="number" value="15" style="width: 100%;"><br/><br/>
        <label>Forward Offset (m):</label><br/>
        <input id="forwardOffsetInput" type="number" value="0" style="width: 100%;"><br/><br/>
        <label>Cube Height (m):</label><br/>
        <input id="heightSlider" type="range" min="0" max="3.3" step="0.1" value="0" style="width: 100%;"><br/>
        <span id="heightValue">0</span> m<br/><br/>
        <button id="spawnTruck">Spawn Truck</button><br/><br/>
        <button id="despawnTruck">Despawn Truck</button><br/><br/>
        <button id="removeGUI">Hide GUI</button>
    `;

    document.body.appendChild(gui);

    document.getElementById("spawnTruck").addEventListener("click", window.spawnCateringTruck);
    document.getElementById("despawnTruck").addEventListener("click", window.despawnCateringTruck);
    document.getElementById("removeGUI").addEventListener("click", () => {
        gui.style.display = "none";
        console.log("GUI hidden (not removed)");
    });

    const slider = document.getElementById("heightSlider");
    const valueLabel = document.getElementById("heightValue");
    slider.addEventListener("input", (e) => {
        const height = parseFloat(e.target.value);
        valueLabel.textContent = height.toFixed(1);
        window.updateCubeHeight(height);
    });
})();
