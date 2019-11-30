const stations = require("../nsw-train-stations.js");
const tenStations = require('../ten.js');
var Xray = require("x-ray");
var x = Xray();

var accessibilityRegex = new RegExp("(is not wheelchair accessible)", "g");

async function getAllStations() {
    try {
        // TODO: Change this to all stations 
        const promises = stations.map(async station => {
            try {
                const stationAccess = await getStationAccessibilityById(
                    station.id
                );
                return {
                    id: station.id,
                    name: station.station,
                    wheelchairAccess: stationAccess
                };
            } catch (error) {
                console.log(error)
            }           
        });

        const result = await Promise.all(promises);

        return result;
    } catch (e) {
        return Promise.reject(e.message);
    }
}

async function getStationAccessibilityById(stationId) {
    try {
        console.log("Finding accessibility of station: " + stationId);
        var results = await x(
            `https://transportnsw.info/stop?q=${stationId}`,
            "#main-content",
            [
                {
                    accessibility: ".stop-accessibility ul li:nth-child(1)"
                }
            ]
        );

        if (accessibilityRegex.test(results[0].accessibility)) {
            return Promise.resolve(false);
        } else {
            return Promise.resolve(true);
        }
    } catch (error) {
        console.log(error);
    }
}

async function getStationId(stationName) {
    try {
        for (let station of stations) {
            if (station.alt.toLowerCase() === stationName.toLowerCase()) {
                console.log(`Station name ${stationName} has id: ${station.id}`)
                return Promise.resolve(station.id);
            }
        }

        return Promise.reject(`Station name: ${stationName} could not be found`);
    } catch (error) {
        return Promise.reject(error.message);
    }
}

module.exports = {
    getStationAccessibilityById,
    getAllStations,
    getStationId
};
