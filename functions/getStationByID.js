const lib = require("./lib.js");

// Erskine 10101324
// Central 10101100

exports.handler = async (event, context) => {
    try {
        const stationId = event.queryStringParameters.id;

        const stationAccess = await lib.getStationAccessibilityById(stationId);

        return {
            statusCode: 200,
            body: JSON.stringify({
                id: stationId,
                wheelchairAccess: stationAccess
            })
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Error occured ${e.message}` })
        }
    }
};
