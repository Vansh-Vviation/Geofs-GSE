// ==UserScript==
// @name         GeoFS Ground Vehicles GUI
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Loads or reopens the European High-Catering GUI inside GeoFS from external script logic only (cleaned up, no extra buttons). Author: You
// @match        https://www.geo-fs.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const waitForUI = setInterval(() => {
        const uiBottom = document.querySelector(".geofs-ui-bottom");
        if (uiBottom) {
            clearInterval(waitForUI);
            if (document.getElementById("groundVehiclesToggleButton")) return;

            // Create "Ground Vehicles" button
            const toggleButton = document.createElement("button");
            toggleButton.id = "groundVehiclesToggleButton";
            toggleButton.innerText = "Ground Vehicles";
            toggleButton.style.margin = "5px";
            toggleButton.style.padding = "5px 10px";
            toggleButton.style.fontSize = "14px";
            toggleButton.style.cursor = "pointer";
            toggleButton.style.zIndex = "1000";
            uiBottom.appendChild(toggleButton);

            // Mini GUI container
            const guiContainer = document.createElement("div");
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

            // European High-Catering loader/reopener
            const euroCaterButton = document.createElement("button");
            euroCaterButton.innerText = "European High-Catering";
            euroCaterButton.style.padding = "6px 12px";
            euroCaterButton.style.fontSize = "14px";
            euroCaterButton.style.cursor = "pointer";

            euroCaterButton.onclick = () => {
                const existingGUI = document.getElementById("cateringGuiContainer");

                if (existingGUI) {
                    existingGUI.style.display = "block";
                    alert("Catering GUI reopened.");
                } else {
                    fetch("https://raw.githubusercontent.com/Vansh-Vviation/Geofs-GSE_MAJOR_UPDATE/refs/heads/main/EuroCaterHighTest.js")
                        .then(response => response.text())
                        .then(script => {
                            try {
                                new Function(script)();
                                alert("Catering GUI loaded.");
                            } catch (e) {
                                alert("Script error: " + e.message);
                            }
                        })
                        .catch(err => alert("Failed to load script: " + err.message));
                }
            };

            guiContainer.appendChild(euroCaterButton);
            document.body.appendChild(guiContainer);

            // Show/hide Ground Vehicles GUI
            toggleButton.onclick = () => {
                guiContainer.style.display = guiContainer.style.display === "none" ? "flex" : "none";
            };
        }
    }, 1000);
})();
