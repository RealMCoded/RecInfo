const fetch = require('node-fetch');

/***
 * @param {int} id The Players ID
 */
async function getPlayerNameFromID(id) {
    try{
        const response = await fetch(`https://apim.rec.net/accounts/account/${id}`);
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
        const response = await fetch(`https://apim.rec.net/accounts/account?username=${name}`);
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

/***
 * @param {int} flags Identity flags
 */
async function decodeFlags(flags) {
    //TODO: Figure out how to decode this!
    return flags;
}

/***
 * @param {int} flags Pronoun flags
 */
async function decodePronouns(flags) {
    //TODO: Figure out how to decode this!
    
    return flags;
}

function randomColor(){
    return Math.floor(Math.random()*16777215).toString(16);
}

/***
 * @param {int} number Max number
 */
function random(number) {
    return Math.floor(Math.random() * number)
}

//Export functions for use
module.exports = { getPlayerIDFromName, getPlayerNameFromID, getRoomNameFromID, randomColor, random }