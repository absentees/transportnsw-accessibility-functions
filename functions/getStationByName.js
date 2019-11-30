const lib = require("../lib.js");

exports.handler = async (event, context) => {
    try {
        const stationName = event.queryStringParameters.name;
        const stationId = await lib.getStationId(stationName);
        const stationAccess = await lib.getStationAccessibilityById(stationId);

        return {
            statusCode: 200,
            body: JSON.stringify({
                id: stationId,
                name: stationName,
                wheelchairAccess: stationAccess
            })
        };
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: `Error occured ${e.message}` })
        };
    }
};
