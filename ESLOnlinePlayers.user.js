// ==UserScript==
// @name         ESL Online Players
// @namespace    https://colbster937.dev
// @version      1.0
// @description  View online players on EaglerServerList
// @author       Colbster937
// @match        https://servers.eaglercraft.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';

    let onlinePlayers = null;
    let maxPlayers = null;
    let players = null;
    let added = false;

    function fetchPlayers() {
        if (!location.pathname.includes("/servers/")) return;
        GM_xmlhttpRequest({
            method: "GET",
            url: `https://servers.eaglercraft.com/api/servers/${window.location.pathname.split('/').pop()}`,
            onload: function(response) {
                if (response.status === 200) {
                    try {
                        const data = JSON.parse(response.responseText);
                        if (!data.data.online) {
                            players = "Server Offline"
                        } else {
                            players = `${data.data.motd.online}/${data.data.motd.max}`
                        }
                        console.log(`Online Players for ${data.data.name}: ${players}`);
                        addPlayerData();
                    } catch (error) {
                        console.error('Failed to parse data:', error);
                    }
                }
            }
        });
    }

    function addPlayerData() {
        if (!players || added) return;

        const observer = new MutationObserver((mutations, obs) => {
            added = true
            const serverInfoElement = Array.from(document.querySelectorAll('[class^="Server_flexRow__"]'))
                                   .find(row => row.querySelector('button'));

            if (serverInfoElement) {
                const serverInfoElements = serverInfoElement.querySelectorAll('[class^="Server_flexColumn__"]');
                const addressElement = Array.from(serverInfoElements).find(column => !column.querySelector('button'));

                if (addressElement) {
                    const playersElement = addressElement.cloneNode(true);
                    playersElement.querySelector('h3').textContent = "Online Players";
                    playersElement.querySelector('span').textContent = `${players}`;
                    serverInfoElement.appendChild(playersElement);
                    obs.disconnect();
                }
            }
        });

        observer.observe(document, { childList: true, subtree: true });
    }

    fetchPlayers();

    let lastUrl = location.href;
    new MutationObserver(() => {
        const currentUrl = location.href;
        if (currentUrl !== lastUrl) {
            lastUrl = currentUrl;
            added = false
            fetchPlayers();
        }
    }).observe(document, { subtree: true, childList: true });

})();
