(function () {
    const modelUrl = "https://raw.githubusercontent.com/Vansh-Vviation/Geofs-GSE/refs/heads/main/hiCateringEU.gltf";
    let cateringTruckEntities = []; // Array to track spawned trucks
    let cubeOffset = 0; // Tracks the height offset of Cube.002
    const maxHeight = 5.7; // Maximum height in meters (updated)

    if (!window.geofs || !geofs.api || !geofs.api.viewer || !geofs.api.viewer.entities) {
        console.error("GeoFS API or Cesium not available. Make sure you run this in GeoFS.");
        return;
    }

    const viewer = geofs.api.viewer;

    function spawnCateringTruck() {
        const heading = parseFloat(document.getElementById("headingInput")?.value) || 0;
        const lateralOffset = (parseFloat(document.getElementById("lateralOffsetInput")?.value) || 15) * 0.000009;
        const forwardOffset = (parseFloat(document.getElementById("forwardOffsetInput")?.value) || 0) * 0.000009;

        const aircraftPos = geofs.aircraft.instance.llaLocation;
        const aircraftLat = aircraftPos[0];
        const aircraftLon = aircraftPos[1];
        const aircraftAlt = aircraftPos[2];

        const adjustedAlt = aircraftAlt - 6.2;

        const lat = aircraftLat + lateralOffset * Math.cos(heading + Math.PI / 2) + forwardOffset * Math.cos(heading);
        const lon = aircraftLon + lateralOffset * Math.sin(heading + Math.PI / 2) + forwardOffset * Math.sin(heading);

        const adjustedHeading = Cesium.Math.toRadians(heading + 180);
        const headingPitchRoll = new Cesium.HeadingPitchRoll(adjustedHeading, 0, 0);
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(
            Cesium.Cartesian3.fromDegrees(lon, lat, adjustedAlt),
            headingPitchRoll
        );

        const cateringTruckEntity = viewer.entities.add({
            name: "Catering Truck",
            position: Cesium.Cartesian3.fromDegrees(lon, lat, adjustedAlt),
            model: {
                uri: modelUrl,
                scale: 0.04,
                minimumPixelSize: 32,
                nodeTransformations: {
                    "Cube.002": {
                        translation: new Cesium.Cartesian3(0, 0, 0),
                    },
                    "Cube.004": {
                        translation: new Cesium.Cartesian3(0, 0, 0),
                    },
                    "Cube.001": {
                        rotation: Cesium.Quaternion.IDENTITY,
                    },
                    "Cube.003": {
                        rotation: Cesium.Quaternion.IDENTITY,
                    },
                },
            },
            orientation: orientation,
        });

        cateringTruckEntities.push(cateringTruckEntity);
        console.log("Catering truck spawned.");
    }

    function updateCubeHeight(height) {
        if (cateringTruckEntities.length > 0) {
            const latestTruck = cateringTruckEntities[cateringTruckEntities.length - 1];

            if (latestTruck && latestTruck.model.nodeTransformations) {
                height = Math.min(height, maxHeight);

                cubeOffset = height;
                latestTruck.model.nodeTransformations["Cube.002"].translation = new Cesium.Cartesian3(0, 0, height);

                let cube004Height = 0;
                if (height > 1.25) {
                    cube004Height = (height - 1.25 - 0.05) * 3;
                }
                latestTruck.model.nodeTransformations["Cube.004"].translation = new Cesium.Cartesian3(0, 0, cube004Height);

                const rotationRatio = height / maxHeight;
                const rotationAngle001 = 50 * rotationRatio;
                const rotationAngle003 = -50 * rotationRatio;

                const rotationRadians001 = Cesium.Math.toRadians(rotationAngle001);
                const rotationRadians003 = Cesium.Math.toRadians(rotationAngle003);

                const rotationQuat001 = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, rotationRadians001);
                const rotationQuat003 = Cesium.Quaternion.fromAxisAngle(Cesium.Cartesian3.UNIT_X, rotationRadians003);

                latestTruck.model.nodeTransformations["Cube.001"].rotation = rotationQuat001;
                latestTruck.model.nodeTransformations["Cube.003"].rotation = rotationQuat003;
            } else {
                console.error("Catering truck height adjustment failed: model or nodeTransformations missing.");
            }
        }
    }

    function despawnCateringTruck() {
        if (cateringTruckEntities.length > 0) {
            const truckToRemove = cateringTruckEntities.pop();
            viewer.entities.remove(truckToRemove);
            console.log("Catering truck despawned.");
        } else {
            console.log("No catering trucks to despawn.");
        }
    }

    // GUI Setup
    const guiContainer = document.createElement("div");
    guiContainer.style.position = "absolute";
    guiContainer.style.top = "10px";
    guiContainer.style.right = "10px";
    guiContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    guiContainer.style.padding = "10px";
    guiContainer.style.borderRadius = "5px";
    guiContainer.style.color = "white";
    guiContainer.style.zIndex = "9999";

    guiContainer.innerHTML = `
        <h4>Catering Truck Control</h4>
        <label>Heading (degrees):</label><br/>
        <input id="headingInput" type="number" value="0" style="width: 100%;"><br/><br/>
        <label>Lateral Offset (meters):</label><br/>
        <input id="lateralOffsetInput" type="number" value="15" style="width: 100%;"><br/><br/>
        <label>Forward/Backward Offset (meters):</label><br/>
        <input id="forwardOffsetInput" type="number" value="0" style="width: 100%;"><br/><br/>
        <label>Cube Height (meters):</label><br/>
        <input id="heightSlider" type="range" min="0" max="5.7" step="0.1" value="0" style="width: 100%;"><br/>
        <span id="heightValue">0</span> m<br/><br/>
        <button id="spawnTruck">Spawn Truck</button><br/><br/>
        <button id="despawnTruck">Despawn Truck</button><br/><br/>
        <button id="removeGUI">Remove GUI</button>
    `;
    document.body.appendChild(guiContainer);

    // Event Listeners
    document.getElementById("spawnTruck").addEventListener("click", spawnCateringTruck);
    document.getElementById("despawnTruck").addEventListener("click", despawnCateringTruck);
    document.getElementById("removeGUI").addEventListener("click", () => {
        guiContainer.remove();
        console.log("GUI removed. Truck still active.");
    });

    const heightSlider = document.getElementById("heightSlider");
    const heightValue = document.getElementById("heightValue");
    heightSlider.addEventListener("input", (event) => {
        const height = parseFloat(event.target.value);
        heightValue.textContent = height.toFixed(1);
        updateCubeHeight(height);
    });
})();
