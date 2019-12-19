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
    let stations = await getAllStations();

    const promises = stations.map(async station => {
        try {
            station.wheelchairAccess = await getStationAccessibilityById(
                station.id
            );

            // Update in airtable
            await base("All Stations").update(station.id, {
                "wheelchairAccess": station.wheelchairAccess
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

.stop-accessibility > ul:nth-child(2) > li:nth-child(1)

module.exports = {
    getStationAccessibilityById,
    getAllStations,
    updateAllStations
};
