const fetch = require('node-fetch');

/***
 * @param {int} id The Players ID
 */
async function getPlayerNameFromID(id) {
    try{
        const response = await fetch(`https://accounts.rec.net/account/${id}`);
        const json = await response.json();

        if (json.errors) throw json.errors;

        return json.username;
    } catch(e) {
        console.error(e)
        return "*(unknown)*";
    }
}

/***
 * @param {string} name The Players name
 */
async function getPlayerIDFromName(name) {
    try{
        const response = await fetch(`https://accounts.rec.net/account?username=${name}`);
        const json = await response.json();

        if (json.errors) throw json.errors;

        return json.accountId;
    } catch(e) {
        console.error(e)
        return "*(unknown)*";
    }
}

/***
 * @param {int} id The room ID
 */
async function getRoomNameFromID(id) {
    try{
        const response = await fetch(`https://rooms.rec.net/rooms/bulk?Id=${id}`);
        const json = await response.json();

        if (json.title) throw json.title;
        if (json.length == 0) return null;

        return `^${json[0].Name}`;
    } catch(e) {
        console.error(e)
        return null;
    }
}

//Export functions for use
module.exports = { getPlayerIDFromName, getPlayerNameFromID, getRoomNameFromID }