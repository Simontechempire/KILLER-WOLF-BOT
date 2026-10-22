// SILENT WOLF PAIR CODE METHOD
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const P = require("pino")
const fs = require("fs")

async function generateSession() {
  const { state, saveCreds } = await useMultiFileAuthState("./session")
  
  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P().child({ level: "fatal" }))
    },
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Killer Wolf", "Chrome", "1.0"]
  })

  // ENTER YOUR NUMBER HERE WITHOUT + 
  let phoneNumber = "2349166265317"

  if (!sock.authState.creds.registered) {
    console.log("[PAIR] Requesting pair code for:", phoneNumber)
    setTimeout(async () => {
      let code = await sock.requestPairingCode(phoneNumber)
      console.log(`\n\n================================
YOUR PAIR CODE: ${code}

Go to WhatsApp > Linked Devices > Link with phone number
Enter this code: ${code}
\n\n`)
    }, 3000)
  }

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (update) => {
    const { connection } = update
    if (connection === "open") {
      console.log("[PAIRED] Session saved to ./session/creds.json ✅")
      console.log("Now you can deploy to Render!")
      // Keep file, delete pair.js after
      await new Promise(r => setTimeout(r, 3000))
      process.exit(0)
    }
  })
}

generateSession()
