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
        const heading = parseFloat(document.getElementById("headingInput").value) || 0;
        const lateralOffset = (parseFloat(document.getElementById("lateralOffsetInput").value) || 15) * 0.000009; // Convert meters to degrees
        const forwardOffset = (parseFloat(document.getElementById("forwardOffsetInput").value) || 0) * 0.000009; // Convert meters to degrees

        // Get the aircraft's current position and altitude
        const aircraftPos = geofs.aircraft.instance.llaLocation;
        const aircraftLat = aircraftPos[0];
        const aircraftLon = aircraftPos[1];
        const aircraftAlt = aircraftPos[2]; // This is the aircraft's altitude

        // Set the truck's spawn altitude 6.2 meters lower than the aircraft's altitude
        const adjustedAlt = aircraftAlt - 6.2;

        const lat = aircraftLat + lateralOffset * Math.cos(heading + Math.PI / 2) + forwardOffset * Math.cos(heading);
        const lon = aircraftLon + lateralOffset * Math.sin(heading + Math.PI / 2) + forwardOffset * Math.sin(heading);

        const adjustedHeading = Cesium.Math.toRadians(heading + 180); // Add 180 degrees to the heading
        const headingPitchRoll = new Cesium.HeadingPitchRoll(adjustedHeading, 0, 0);
        const orientation = Cesium.Transforms.headingPitchRollQuaternion(
            Cesium.Cartesian3.fromDegrees(lon, lat, adjustedAlt),
            headingPitchRoll
        );

        const cateringTruckEntity = viewer.entities.add({
            name: "Catering Truck",
            position: Cesium.Cartesian3.fromDegrees(lon, lat, adjustedAlt), // Spawn 6.2 meters lower than aircraft altitude
            model: {
                uri: modelUrl,
                scale: 0.04, // Set scale to 0.04
                minimumPixelSize: 32,
                nodeTransformations: {
                    "Cube.002": {
                        translation: new Cesium.Cartesian3(0, 0, 0), // Initial position
                    },
                    "Cube.004": {
                        translation: new Cesium.Cartesian3(0, 0, 0), // Initial position
                    },
                    "Cube.001": {
                        rotation: Cesium.Quaternion.IDENTITY, // Initial rotation
                    },
                    "Cube.003": {
                        rotation: Cesium.Quaternion.IDENTITY, // Initial rotation
                    },
                },
            },
            orientation: orientation,
        });

        cateringTruckEntities.push(cateringTruckEntity); // Add truck to the list
        console.log("Catering truck spawned.");
    }

    function updateCubeHeight(height) {
        if (cateringTruckEntities.length > 0) {
            const latestTruck = cateringTruckEntities[cateringTruckEntities.length - 1];

            if (latestTruck && latestTruck.model.nodeTransformations) {
                // Ensure height does not exceed maxHeight
                height = Math.min(height, maxHeight);

                cubeOffset = height;
                latestTruck.model.nodeTransformations["Cube.002"].translation = new Cesium.Cartesian3(0, 0, height);

                // Update Cube.004: Only raise Cube.004 after Cube.002 surpasses 1.25 meters
                let cube004Height = 0;
                if (height > 1.25) {
                    // Start Cube.004 0.05 meters lower, then raise it 3 times faster after 1.25 meters
                    cube004Height = (height - 1.25 - 0.05) * 3; // Subtract 0.05 for the initial offset
                }
                latestTruck.model.nodeTransformations["Cube.004"].translation = new Cesium.Cartesian3(0, 0, cube004Height);

                // Calculate rotations for Cube.001 and Cube.003 based on height
                const rotationRatio = height / maxHeight; // Ratio between the height and max height (5.7 meters)

                // Calculate rotation angles for Cube.001 and Cube.003
                const rotationAngle001 = 50 * rotationRatio; // +50 degrees for Cube.001
                const rotationAngle003 = -50 * rotationRatio;  // -50 degrees for Cube.003

                // Convert the rotation angles to radians
                const rotationRadians001 = Cesium.Math.toRadians(rotationAngle001);
                const rotationRadians003 = Cesium.Math.toRadians(rotationAngle003);

                // Apply rotations
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
            const truckToRemove = cateringTruckEntities.pop(); // Remove the most recent truck
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
    guiContainer.style.zIndex = "9999"; // Ensure the GUI is above other elements

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
        <button id="despawnTruck">Despawn Truck</button>
    `;
    document.body.appendChild(guiContainer);

    // Slider Event Listener
    const heightSlider = document.getElementById("heightSlider");
    const heightValue = document.getElementById("heightValue");
    heightSlider.addEventListener("input", (event) => {
        const height = parseFloat(event.target.value);
        heightValue.textContent = height.toFixed(1);
        updateCubeHeight(height);
    });

    // Button Event Listeners
    document.getElementById("spawnTruck").addEventListener("click", spawnCateringTruck);
    document.getElementById("despawnTruck").addEventListener("click", despawnCateringTruck);
})();
