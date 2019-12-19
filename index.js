require('dotenv').config();
const polka = require("polka");
const lib = require("./lib.js");


async function getAllStations(req, res, next) {
    try {
        const result = await lib.getAllStations();

        res.end(JSON.stringify(result));
    } catch (e) {
        throw e;
    }
}

async function updateAllStations(req,res,next) {
    try {
        const result = await lib.updateAllStations();    
    } catch (error) {
        res.end(error.message);
    }
    
    res.end("All updated");
}

async function getStationByID(req, res, next) {
    try {
        const stationId = req.query.id;

        const stationAccess = await lib.getStationAccessibilityById(stationId);

        res.end(
            JSON.stringify({
                id: stationId,
                wheelchairAccess: stationAccess
            })
        );
    } catch (e) {
        throw e;
    }
}

polka()
    .get("/getAllStations", getAllStations)
    .get("/getStationByID", getStationByID)
    .get("/updateAllStations", updateAllStations)
    .listen(3000, err => {
        if (err) throw err;
        console.log(`> Running on localhost:3000`);
    });
