// const stations = require("./nsw-train-stations.js");
// const tenStations = require("./ten.js");
var Xray = require("x-ray");
var x = Xray();
const Airtable = require("airtable");
Airtable.configure({
    endpointUrl: "https://api.airtable.com",
    apiKey: process.env.GOOD_INTERNET_AIRTABLE_API_KEY
});
const base = Airtable.base(process.env.STATIONS_BASE_ID);

var accessibilityRegex = new RegExp("(is not wheelchair accessible)", "g");

async function updateAllStations() {
    // Get all stations
    let stations = await getALlStationData();

    const promises = stations.map(async station => {
        try {
            station.fields.wheelchairAccess = await getStationAccessibilityById(
                station.fields.id
            );

            // Update in airtable
            await base("All Stations").update(station.id, {
                "wheelchairAccess": station.fields.wheelchairAccess
            });

        } catch (error) {
            console.log(`Error finding accessibility ${station.id}: ${error}`);
        }
    });
    const result = await Promise.all(promises);
    return result;
}

async function getAllStations() {
    try {
        let records = await base("All Stations")
            .select({
                view: "Grid view"
            })
            .all();
        return records.map((record) => {
            return {
                "id": record.fields.id,
                "name": record.fields.name,
                "wheelchairAccess": record.fields.wheelchairAccess
            }
        });
    } catch (error) {
        throw error;
    }
}

// async function getAllStations() {
//     // TODO: Change this to all stations
//     const promises = stations.map(async station => {
//         try {
//             const stationAccess = await getStationAccessibilityById(station.id);
//             return {
//                 id: station.id,
//                 name: station.station,
//                 wheelchairAccess: stationAccess
//             };
//         } catch (error) {
//             console.log(`Error finding accessibility ${station.id}: ${error}`);
//             return {
//                 id: station.id,
//                 name: station.station,
//                 wheelchairAccess: false
//             };
//         }
//     });

//     const result = await Promise.all(promises);

//     return result;
// }

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
                console.log(
                    `Station name ${stationName} has id: ${station.id}`
                );
                return Promise.resolve(station.id);
            }
        }

        return Promise.reject(
            `Station name: ${stationName} could not be found`
        );
    } catch (error) {
        return Promise.reject(error.message);
    }
}

module.exports = {
    getStationAccessibilityById,
    getAllStations,
    getStationId,
    updateAllStations
};
