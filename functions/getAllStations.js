const lib = require("../lib.js");


exports.handler = async (event, context) => {
    try {
        const result = await lib.getAllStations();

        return {
            statusCode: 200,
            body: JSON.stringify(result)
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify({message: `Error occured ${e.message}`})
        };
    }
};