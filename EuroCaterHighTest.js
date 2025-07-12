// ==UserScript==
// @name         GeoFS Ground Vehicles GUI
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Loads European High-Catering GUI inside GeoFS, managed fully by external script logic only (no extra buttons here)
// @author       You
// @match        https://www.geo-fs.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const waitForUI = setInterval(() => {
        const uiBottom = document.querySelector(".geofs-ui-bottom");
        if (uiBottom) {
            clearInterval(waitForUI);

            // Avoid duplicate buttons
            if (document.getElementById("groundVehiclesToggleButton")) return;

            // Add "Ground Vehicles" button
            const toggleButton = document.createElement("button");
            toggleButton.id = "groundVehiclesToggleButton";
            toggleButton.innerText = "Ground Vehicles";
            toggleButton.style.margin = "5px";
            toggleButton.style.padding = "5px 10px";
            toggleButton.style.fontSize = "14px";
            toggleButton.style.cursor = "pointer";
            toggleButton.style.zIndex = "1000";
            uiBottom.appendChild(toggleButton);

            // Minimal GUI container
            const guiContainer = document.createElement("div");
            guiContainer.id = "groundVehiclesGui";
            guiContainer.style.position = "absolute";
            guiContainer.style.bottom = "50px";
            guiContainer.style.left = "20px";
            guiContainer.style.background = "rgba(0,0,0,0.7)";
            guiContainer.style.padding = "10px";
            guiContainer.style.borderRadius = "8px";
            guiContainer.style.display = "none";
            guiContainer.style.flexDirection = "column";
            guiContainer.style.gap = "10px";
            guiContainer.style.zIndex = "1000";
            guiContainer.style.color = "white";

            // Euro Cater Loader button
            const euroCaterButton = document.createElement("button");
            euroCaterButton.innerText = "European High-Catering";
            euroCaterButton.style.padding = "6px 12px";
            euroCaterButton.style.fontSize = "14px";
            euroCaterButton.style.cursor = "pointer";

            euroCaterButton.onclick = () => {
                fetch("https://raw.githubusercontent.com/Vansh-Vviation/Geofs-GSE_MAJOR_UPDATE/refs/heads/main/EuroCaterHighTest.js")
                    .then(response => response.text())
                    .then(script => {
                        try {
                            new Function(script)();
                            alert("European High-Catering loaded!");
                        } catch (e) {
                            console.error("Script error:", e);
                            alert("Error: " + e.message);
                        }
                    })
                    .catch(err => {
                        console.error("Fetch failed:", err);
                        alert("Failed to load script: " + err.message);
                    });
            };

            guiContainer.appendChild(euroCaterButton);
            document.body.appendChild(guiContainer);

            // Toggle GUI show/hide
            toggleButton.onclick = () => {
                guiContainer.style.display = guiContainer.style.display === "none" ? "flex" : "none";
            };
        }
    }, 1000);
})();
