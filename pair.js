// 🐺🔐 KILLER WOLF XMD - PAIR.JS V2 PRO MAX - PAIR CODE + QR FALLBACK
const { default: makeWASocket, useMultiFileAuthState, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const P = require("pino")
const fs = require("fs")
const path = require("path")
const readline = require("readline")

// Ask number if not provided
function askNumber() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => {
    rl.question("\n🐺 Enter your WhatsApp number with country code (e.g. 2349166265317): ", ans => {
      rl.close()
      resolve(ans.trim())
    })
  })
}

async function startPair() {
  let phoneNumber = process.argv[2] || process.env.PAIRING_NUMBER || ""

  if(!phoneNumber) {
    phoneNumber = await askNumber()
  }

  phoneNumber = phoneNumber.replace(/[^0-9]/g, "")

  if(phoneNumber.length < 10) {
    console.log("❌ Invalid number. Use format: 2349166265317 (no +)")
    process.exit(1)
  }

  console.log(`
╔════════════════════════════════════════╗
║  🐺 KILLER WOLF XMD PAIRING V2       ║
║  Number: ${phoneNumber.padEnd(24)}║
║  Method: Pairing Code (8 digits)    ║
╚════════════════════════════════════════╝
`)

  const sessionPath = path.join(__dirname, "session")
  if(!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })

  // Clean old creds if you want fresh
  if(process.argv.includes("--fresh")) {
    fs.rmSync(sessionPath, { recursive: true, force: true })
    fs.mkdirSync(sessionPath, { recursive: true })
    console.log("[FRESH] Old session deleted")
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P().child({ level: "fatal" }))
    },
    logger: P({ level: "silent" }),
    printQRInTerminal: false,
    browser: ["Killer Wolf", "Chrome", "1.0"]
  })

  sock.ev.on("creds.update", saveCreds)

  if (!sock.authState.creds.registered) {
    console.log(`[PAIR] Waiting 3s for socket...`)
    await new Promise(r => setTimeout(r, 3500))

    try {
      let code = await sock.requestPairingCode(phoneNumber)
      code = code?.match(/.{1,4}/g)?.join("-") || code

      console.log(`
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🔑 YOUR PAIR CODE: ${code.padEnd(18)}┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  1. Open WhatsApp                    ┃
┃  2. Settings > Linked Devices        ┃
┃  3. Link a device                    ┃
┃  4. Link with phone number           ┃
┃  5. Enter code: ${code}       ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

⏳ Waiting for connection...

`)

      // Auto copy hint for Termux
      try { require("child_process").execSync(`echo ${code} | termux-clipboard-set 2>/dev/null`); console.log("[COPIED] Code copied to clipboard ✅") } catch {}

    } catch (e) {
      console.log("[PAIR ERROR]", e.message)
      console.log("Possible fixes:")
      console.log("- Number must be on WhatsApp")
      console.log("- Use number without +")
      console.log("- Try again in 1 min (rate limit)")
      console.log("- Or use QR method: node qr.js")
    }
  } else {
    console.log("[PAIRED] Already registered ✅")
    console.log("[INFO] If you want fresh pair, run: node pair.js --fresh")
  }

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update

    if (connection === "open") {
      console.log(`
╔════════════════════════════════╗
║  ✅ PAIRED SUCCESSFULLY!       ║
╠════════════════════════════════╣
║  Session saved:                ║
║  ./session/creds.json          ║
║                                ║
║  NEXT STEPS:                   ║
║  1. Don't delete session/      ║
║  2. Run: npm start             ║
║  3. For Render: upload session ║
║     OR set SESSION env base64  ║
╚════════════════════════════════╝
`)

      // Show base64 for easy Render deploy
      try {
        const creds = fs.readFileSync(path.join(sessionPath, "creds.json"))
        const b64 = creds.toString("base64")
        console.log(`\n[RENDER ENV] Add this to Render > Environment > SESSION:\n${b64.slice(0,100)}... (full length ${b64.length})\nFull base64 saved to session-base64.txt`)
        fs.writeFileSync(path.join(__dirname, "session-base64.txt"), b64)
      } catch {}

      await new Promise(r => setTimeout(r, 4000))
      process.exit(0)
    }

    if (connection === "close") {
      const code = lastDisconnect?.error?.output?.statusCode
      console.log(`[CLOSED] Code: ${code}`)
      if(code === 401) {
        console.log("[LOGGED OUT] Delete session and re-pair: node pair.js --fresh")
      } else if(code !== 408) {
        console.log("[RETRY] Reconnecting in 5s...")
      }
    }
  })
}

startPair().catch(e => console.log("[FATAL]", e))
