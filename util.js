const fetch = require('node-fetch');

/***
 * @param {int} id The Player's ID
 */

async function getNameFromID(id) {
    try{
        const response = await fetch(`https://accounts.rec.net/account/${id}`);
        const json = await response.json();

        if (json.errors) throw new Error(json.errors);

        return json.username;
    } catch(e) {
        console.error(e)
        return "*(unknown)*";
    }
}

//Export functions for use
module.exports = { getNameFromID }