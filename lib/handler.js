const { useMultiFileAuthState } = require("@whiskeysockets/baileys")
const fs = require("fs")

async function getSession() {
  // Silent Wolf session - auto create folder if no dey
  if (!fs.existsSync("./session")) {
    fs.mkdirSync("./session")
    console.log("[SESSION] Created session folder")
  }

  const { state, saveCreds } = await useMultiFileAuthState("./session")
  return { state, saveCreds }
}

module.exports = { getSession }
