// 🐺 lib/handler.js - KILLER WOLF XMD V3 FINAL - SESSION ONLY + DB SAVE
const fs = require("fs")
const path = require("path")
const { useMultiFileAuthState } = require("@whiskeysockets/baileys")

async function getSession() {
  const sessionPath = path.join(__dirname, "../session")
  const dbPath = path.join(__dirname, "../database")
  
  if(!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true })
  if(!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true })

  // ===== RENDER ENV SESSION - BASE64 =====
  if(process.env.SESSION && process.env.SESSION.trim().length > 100) {
    try {
      let b64 = process.env.SESSION.trim().replace(/[\n\r\s]/g, "")
      // Handle if someone pasted with quotes
      b64 = b64.replace(/^["']|["']$/g, "")
      
      let buff = Buffer.from(b64, "base64")
      let content = buff.toString("utf-8")
      
      // Validate JSON
      let parsed = JSON.parse(content)
      if(!parsed.noiseKey) throw new Error("Invalid creds.json")

      fs.writeFileSync(path.join(sessionPath, "creds.json"), content)
      console.log(`[SESSION] ✅ Loaded from ENV - ${b64.length} chars`)
    } catch(e) {
      console.log(`[SESSION ENV ERROR] ${e.message}`)
      console.log("[TIP] Regenerate: node -e \"console.log(require('fs').readFileSync('./session/creds.json').toString('base64'))\"")
    }
  }

  // ===== MEGA SESSION (optional) =====
  if(process.env.SESSION_ID && process.env.SESSION_ID.includes("~")) {
    try {
      const { File } = require("megajs")
      let megaId = process.env.SESSION_ID.split("~")[1] || process.env.SESSION_ID.split("KILLER~")[1]
      if(megaId) {
        console.log("[SESSION] Downloading Mega...")
        const file = File.fromURL(`https://mega.nz/file/${megaId}`)
        const data = await new Promise((res, rej) => {
          file.loadAttributes((err) => {
            if(err) return rej(err)
            file.download((err, d) => {
              if(err) return rej(err)
              let buffers = []
              d.on("data", c => buffers.push(c))
              d.on("end", () => res(Buffer.concat(buffers)))
            })
          })
        })
        fs.writeFileSync(path.join(sessionPath, "creds.json"), data)
        console.log("[SESSION] ✅ Mega session loaded")
      }
    } catch(e) {
      console.log("[MEGA ERROR]", e.message)
    }
  }

  // ===== CHECK =====
  let credsFile = path.join(sessionPath, "creds.json")
  if(!fs.existsSync(credsFile)) {
    console.log("\n╔══════════════════════════════════╗")
    console.log("║ ❌ NO SESSION FOUND!             ║")
    console.log("║ Run: node pair.js 234... --fresh ║")
    console.log("╚══════════════════════════════════╝\n")
  } else {
    console.log("[SESSION] Local creds.json found ✅")
  }

  const { state, saveCreds } = await useMultiFileAuthState(sessionPath)
  return { state, saveCreds }
}

module.exports = { getSession }
