const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore } = require("@whiskeysockets/baileys")
const P = require("pino")
const fs = require("fs")
const config = require("./config.js")

// LOAD COMMANDS (plugin folder)
const commands = new Map()
const cmdFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"))
for (let file of cmdFiles) {
  let cmd = require(`./commands/${file}`)
  commands.set(cmd.name, cmd)
}
console.log(`[KILLER WOLF] Loaded ${commands.size} commands`)

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(config.sessionName)

  const sock = makeWASocket({
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P().child({ level: "fatal" }))
    },
    logger: P({ level: "silent" }),
    browser: ["Killer Wolf", "Chrome", "1.0"],
    markOnlineOnConnect: true
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === "close") {
      let reason = lastDisconnect?.error?.output?.statusCode
      if (reason !== DisconnectReason.loggedOut) {
        console.log("[RECONNECT] Killer Wolf reconnecting...")
        startBot()
      } else {
        console.log("[LOGGED OUT] Delete session folder")
      }
    } else if (connection === "open") {
      console.log(`[CONNECTED] ${config.botName} is online`)
      // Send owner online message
      await sock.sendMessage(config.ownerNumber + "@s.whatsapp.net", { text: `*${config.botName} Connected ✅*\nPrefix: ${config.prefix}\nHost: Render/Railway` })
    }
  })

  sock.ev.on("messages.upsert", async (m) => {
    try {
      let msg = m.messages[0]
      if (!msg.message) return
      if (msg.key.fromMe) return
      
      const from = msg.key.remoteJid
      const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || ""
      
      // SILENT WOLF PREFIX CHECK
      if (!body.startsWith(config.prefix)) return
      
      const args = body.slice(config.prefix.length).trim().split(/ +/)
      const cmdName = args.shift().toLowerCase()
      
      // Find command
      let cmd = commands.get(cmdName)
      if (!cmd) return

      // Execute command
      await cmd.execute(sock, msg, args, { from, config })

    } catch (e) {
      console.log("[ERROR]", e)
    }
  })
}

startBot()

// Keep alive for Render
require("http").createServer((_, res) => res.end("KILLER WOLF BOT ONLINE")).listen(config.port, () => console.log(`[SERVER] Port ${config.port}`))
