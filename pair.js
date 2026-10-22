// 🐺🔐 KILLER WOLF XMD - PAIR.JS V3 FINAL - PAIR + QR + BASE64 FULL
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const P = require("pino")
const fs = require("fs")
const path = require("path")
const readline = require("readline")

function askNumber() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question("\n🐺 Enter WhatsApp number (2349166265317): ", ans => {
      rl.close()
      resolve(ans.trim())
    })
  })
}

async function startPair() {
  let phoneNumber = process.argv[2] || process.env.PAIRING_NUMBER || ""
  if(!phoneNumber || phoneNumber.includes("--")) phoneNumber = await askNumber()
  phoneNumber = phoneNumber.replace(/[^0-9]/g, "")

  if(phoneNumber.length < 10) {
    console.log("❌ Use format 2349166265317 without +")
    process.exit(1)
  }

  console.log(`\n╔══════════════════════════════════╗\n║ 🐺 KILLER WOLF PAIR V3 - ${phoneNumber} ║\n╚══════════════════════════════════╝\n`)

  const sessionPath = path.join(__dirname, "session")
  if(!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })

  if(process.argv.includes("--fresh")) {
    fs.rmSync(sessionPath, { recursive: true, force: true })
    fs.mkdirSync(sessionPath, { recursive: true })
    console.log("[FRESH] Old session deleted ✅")
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P().child({ level: "fatal" }))
    },
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Killer Wolf", "Chrome", "1.0"],
    syncFullHistory: false
  })

  sock.ev.on("creds.update", saveCreds)

  if (!sock.authState.creds.registered) {
    await new Promise(r => setTimeout(r, 3000))
    try {
      let code = await sock.requestPairingCode(phoneNumber)
      code = code.match(/.{1,4}/g).join("-")
      console.log(`\n┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n┃ 🔑 CODE: ${code}               ┃\n┃ 1. WhatsApp > Linked Devices  ┃\n┃ 2. Link with phone number     ┃\n┃ 3. Enter: ${code}             ┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n⏳ Waiting...\n`)
    } catch(e) {
      console.log("[PAIR ERROR]", e.message)
      console.log("Rate limit? Wait 2 mins or try: node qr.js")
    }
  } else {
    console.log("[ALREADY PAIRED] ✅ Run npm start")
  }

  sock.ev.on("connection.update", async (u) => {
    const { connection, lastDisconnect } = u
    if(connection==="open") {
      console.log("\n✅ PAIRED SUCCESS! Generating SESSION...\n")
      await new Promise(r => setTimeout(r, 2000))
      try {
        const credsPath = path.join(sessionPath, "creds.json")
        if(fs.existsSync(credsPath)) {
          const data = fs.readFileSync(credsPath)
          const b64 = data.toString("base64")
          // SAVE FULL to file
          fs.writeFileSync(path.join(__dirname, "SESSION.b64"), b64)
          fs.writeFileSync(path.join(__dirname, "session-base64.txt"), b64)
          
          console.log("====== RENDER SESSION ENV - COPY FULL ======")
          console.log(b64)
          console.log("====== END - LENGTH: " + b64.length + " ======\n")
          console.log("✅ Also saved to SESSION.b64 and session-base64.txt")
          console.log("1. Go to Render Dashboard > Environment")
          console.log("2. Key: SESSION | Value: paste full base64")
          console.log("3. Save > Manual Deploy\n")
          console.log("LOCAL START: npm start")
        }
      } catch(e){ console.log("Base64 error", e.message) }
      setTimeout(()=> process.exit(0), 2000)
    }
    if(connection==="close") {
      let code = lastDisconnect?.error?.output?.statusCode
      let reason = lastDisconnect?.error?.output?.payload?.error || lastDisconnect?.error?.message || "Unknown"
      console.log(`[CLOSED] Code:${code} Reason:${reason}`)
      if(code===401) console.log("Logged out, run --fresh")
      else if(code===408) console.log("Timed out, run again")
    }
  })
}

startPair()
