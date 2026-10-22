const { default: makeWASocket, DisconnectReason, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const P = require("pino")
const fs = require("fs")
const path = require("path")
const express = require("express")
const config = require("./config.js")
const { getSession } = require("./lib/handler.js")

// Load Commands
const commands = new Map()
const commandsPath = path.join(__dirname, "commands")
if (fs.existsSync(commandsPath)) {
  const files = fs.readdirSync(commandsPath)
  for (let file of files) {
    if (!file.endsWith(".js")) continue
    try {
      const cmdFiles = fs.readdirSync(path.join(commandsPath, file)).length ? fs.readdirSync(path.join(commandsPath, file)) : [file]
      // Support both commands/*.js and commands/folder/*.js
      if (fs.statSync(path.join(commandsPath, file)).isDirectory()) {
        for (let f of fs.readdirSync(path.join(commandsPath, file))) {
          if (!f.endsWith(".js")) continue
          let cmd = require(path.join(commandsPath, file, f))
          if (cmd.name) commands.set(cmd.name, cmd)
        }
      } else {
        let cmd = require(path.join(commandsPath, file))
        if (cmd.name) commands.set(cmd.name, cmd)
      }
    } catch {}
  }
}
console.log(`[KILLER WOLF] Loaded ${commands.size} commands`)

async function startBot() {
  const { state, saveCreds } = await getSession()

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P().child({ level: "fatal" }))
    },
    logger: P({ level: "silent" }),
    browser: ["Killer Wolf", "Chrome", "1.0"],
    markOnlineOnConnect: true,
    syncFullHistory: false
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log("[RECONNECT] Restarting...")
        startBot()
      } else {
        console.log("[LOGGED OUT] Delete session/ folder and re-pair")
      }
    } else if (connection === "open") {
      console.log(`[ONLINE] ${config.botName} CONNECTED ✅`)
      try {
        await sock.sendMessage(config.ownerNumber + "@s.whatsapp.net", {
          text: `*${config.botName} ONLINE ✅*\n\n*Prefix:* ${config.prefix}\n*Commands:* ${commands.size}\n*Host:* Render/Railway\n*Method:* Silent Wolf`,
          contextInfo: { forwardingScore: 999, isForwarded: true }
        })
      } catch {}
    }
  })

  sock.ev.on("messages.upsert", async (m) => {
    try {
      let msg = m.messages[0]
      if (!msg.message) return
      if (msg.key.fromMe) return

      const from = msg.key.remoteJid
      const type = Object.keys(msg.message)[0]
      const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || ""

      // Prefix check - Silent Wolf uses /
      let prefix = config.prefa.find(p => body.startsWith(p))
      if (!prefix) return

      const args = body.slice(prefix.length).trim().split(/ +/)
      const cmdName = args.shift().toLowerCase()

      let cmd = commands.get(cmdName)
      if (!cmd) return

      console.log(`[CMD] ${cmdName} from ${from}`)
      await cmd.execute(sock, msg, args, { from, config, commands })

    } catch (e) {
      console.log("[MSG ERROR]", e)
    }
  })
}

startBot()

// Web Server for Render Dashboard
const app = express()
app.use(express.static(path.join(__dirname, "public")))
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"))
})
app.get("/ping", (req, res) => res.send("KILLER WOLF ONLINE"))

app.listen(config.port, () => {
  console.log(`[WEB] Dashboard running on port ${config.port}`)
})
