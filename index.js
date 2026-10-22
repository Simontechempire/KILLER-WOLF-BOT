// 🐺👑 KILLER WOLF XMD - INDEX.JS V2 PRO MAX - FIXED + REAL ENGINE
const { default: makeWASocket, DisconnectReason, makeCacheableSignalKeyStore, useMultiFileAuthState, downloadMediaMessage } = require("@whiskeysockets/baileys")
const P = require("pino")
const fs = require("fs")
const path = require("path")
const express = require("express")

// ===== CONFIG SAFE LOAD =====
let config
try { config = require("./config.js") } catch { config = { botName: "KILLER WOLF XMD", prefix: ".", prefa: ["."], ownerNumber: "2349166265317", owner: ["2349166265317"], port: 3000, mode: "public" } }
config.prefa = config.prefa || [config.prefix || ".", ".", "!", "#"]
config.botName = config.botName || "KILLER WOLF XMD"
config.owner = config.owner || [config.ownerNumber || "2349166265317"]

// ===== GLOBAL DB =====
global.config = config
global.wolfDB = global.wolfDB || { auto: { view: false, like: false, online: true, typing: false }, anti: {}, welcome: {}, goodbye: {}, warns: {}, deleted: {} }
global.banned = global.banned || []

// Load saved DB
try {
  const dbPath = path.join(__dirname, "database")
  if(!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true })
  if(fs.existsSync(path.join(dbPath, "config.json"))) {
    const saved = JSON.parse(fs.readFileSync(path.join(dbPath, "config.json")))
    global.config = { ...config, ...saved }
  }
  if(fs.existsSync(path.join(dbPath, "auto.json"))) global.wolfDB.auto = JSON.parse(fs.readFileSync(path.join(dbPath, "auto.json")))
  if(fs.existsSync(path.join(dbPath, "anti.json"))) global.wolfDB.anti = JSON.parse(fs.readFileSync(path.join(dbPath, "anti.json")))
  if(fs.existsSync(path.join(dbPath, "warns.json"))) global.wolfDB.warns = JSON.parse(fs.readFileSync(path.join(dbPath, "warns.json")))
} catch {}

// ===== LOAD COMMANDS - FIXED =====
const commands = new Map()
const commandsPath = path.join(__dirname, "commands")

function loadCommands() {
  if (!fs.existsSync(commandsPath)) fs.mkdirSync(commandsPath, { recursive: true })
  const files = fs.readdirSync(commandsPath)
  let count = 0
  for (let file of files) {
    const full = path.join(commandsPath, file)
    try {
      if (fs.statSync(full).isDirectory()) {
        for (let f of fs.readdirSync(full)) {
          if (!f.endsWith(".js")) continue
          delete require.cache[require.resolve(path.join(full, f))]
          let cmd = require(path.join(full, f))
          // Support both styles: cmd.name and cmd.command[]
          if (cmd.name) { commands.set(cmd.name, cmd); count++ }
          if (cmd.command && Array.isArray(cmd.command)) {
            for(let c of cmd.command) { commands.set(c, cmd); count++ }
          }
        }
      } else {
        if (!file.endsWith(".js")) continue
        delete require.cache[require.resolve(full)]
        let cmd = require(full)
        if (cmd.name) { commands.set(cmd.name, cmd); count++ }
        if (cmd.command && Array.isArray(cmd.command)) {
          for(let c of cmd.command) { commands.set(c, cmd); count++ }
        }
      }
    } catch (e) { console.log(`[CMD ERROR] ${file}:`, e.message) }
  }
  console.log(`[KILLER WOLF] Loaded ${count} command entries (${commands.size} unique) ✅`)
}
loadCommands()

// ===== SESSION =====
async function getAuth() {
  try {
    const { getSession } = require("./lib/handler.js")
    return await getSession()
  } catch {
    const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, "session"))
    return { state, saveCreds }
  }
}

async function startBot() {
  const { state, saveCreds } = await getAuth()

  const sock = makeWASocket({
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P().child({ level: "fatal", stream: "store" })) },
    logger: P({ level: "silent" }),
    browser: ["Killer Wolf", "Chrome", "1.0"],
    markOnlineOnConnect: global.wolfDB.auto.online !== false,
    syncFullHistory: false,
    printQRInTerminal: false,
  })

  sock.ev.on("creds.update", saveCreds)

  sock.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === "close") {
      const reason = lastDisconnect?.error?.output?.statusCode
      console.log(`[CLOSED] Reason: ${reason}`)
      if (reason !== DisconnectReason.loggedOut) {
        console.log("[RECONNECT] Restarting in 3s...")
        setTimeout(startBot, 3000)
      } else {
        console.log("[LOGGED OUT] Delete session/ folder and re-pair")
      }
    } else if (connection === "open") {
      console.log(`[ONLINE] ${global.config.botName} CONNECTED ✅`)
      try {
        await sock.sendMessage(global.config.owner[0] + "@s.whatsapp.net", {
          text: `*🐺 ${global.config.botName} ONLINE ✅*\n\n*Prefix:* ${global.config.prefa[0]}\n*Commands:* 100\n*Mode:* ${global.config.mode}\n*Owner:* ${global.config.owner.join(", ")}\n*Uptime:* ${Math.floor(process.uptime()/60)}m\n\n*Type:* ${global.config.prefa[0]}menu\n\n🐺 KILLER WOLF XMD`
        })
      } catch {}
      // Auto bio interval
      if(global.wolfDB.auto.bio) {
        setInterval(async () => {
          await sock.updateProfileStatus(`🐺 ${global.config.botName} | ${new Date().toLocaleTimeString()} | ${Object.keys(await sock.groupFetchAllParticipating().catch(()=>({}))).length} Groups | ${global.config.prefa[0]}menu`).catch(()=>{})
        }, 60000)
      }
    }
  })

  // ===== ANTI-DELETE RECOVERY =====
  sock.ev.on("messages.update", async (updates) => {
    for(let update of updates) {
      if(update.update.message === null && update.key) { // deleted
        const saved = global.wolfDB.deleted?.[update.key.id]
        if(saved && global.wolfDB.anti?.[saved.jid]?.antidelete) {
          try {
            await sock.sendMessage(saved.jid, { text: `🛡️ *ANTIDELETE RECOVERED*\n\n👤 @${saved.sender.split('@')[0]}\n🕒 ${new Date(saved.time).toLocaleString()}\n\n*Recovering message...*`, mentions: [saved.sender] })
            if(saved.content) await sock.sendMessage(saved.jid, { forward: { key: saved.key, message: saved.content } })
          } catch {}
        }
      }
    }
  })

  sock.ev.on("messages.upsert", async (m) => {
    try {
      let msg = m.messages[0]
      if (!msg.message) return
      if (msg.key.fromMe) return
      const from = msg.key.remoteJid
      const sender = msg.key.participant || from
      const isGroup = from.endsWith("@g.us")

      // ===== AUTO DB SAVE MESSAGE FOR ANTIDELETE =====
      if(global.wolfDB.anti?.[from]?.antidelete) {
        global.wolfDB.deleted[msg.key.id] = { content: msg.message, jid: from, sender, time: Date.now(), key: msg.key }
        // Keep only 100
        if(Object.keys(global.wolfDB.deleted).length > 100) delete global.wolfDB.deleted[Object.keys(global.wolfDB.deleted)[0]]
      }

      // ===== AUTO VIEW STATUS =====
      if(msg.key.remoteJid === "status@broadcast" && global.wolfDB.auto.view) {
        await sock.readMessages([msg.key]).catch(()=>{})
        if(global.wolfDB.auto.like) await sock.sendMessage(from, { react: { text: "🔥", key: msg.key } }).catch(()=>{})
      }

      // ===== ANTI ENGINE - REAL =====
      const anti = global.wolfDB.anti?.[from]
      if(anti && isGroup) {
        const body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || ""
        let meta, isAdmin = false, botAdmin = false
        try {
          meta = await sock.groupMetadata(from)
          isAdmin = !!meta.participants.find(p=> p.id===sender)?.admin
          botAdmin = !!meta.participants.find(p=> p.id.includes(sock.user.id.split(':')[0]))?.admin
        } catch {}
        if(!isAdmin && botAdmin && body) {
          // Antilink
          if((anti.antilink || anti.antilinkkick || anti.antilinkwarn) && /(chat\.whatsapp\.com|https?:\/\/|www\.|wa\.me|t\.me|instagram\.com|tiktok\.com)/i.test(body)) {
            await sock.sendMessage(from, { delete: msg.key }).catch(()=>{})
            if(anti.antilinkkick) await sock.groupParticipantsUpdate(from, [sender], "remove").catch(()=>{})
            else if(anti.antilinkwarn) {
              global.wolfDB.warns[from] = global.wolfDB.warns[from] || {}
              global.wolfDB.warns[from][sender] = global.wolfDB.warns[from][sender] || { count: 0, reasons: [] }
              global.wolfDB.warns[from][sender].count++
              await sock.sendMessage(from, { text: `⚠️ @${sender.split('@')[0]} Links not allowed! Warn ${global.wolfDB.warns[from][sender].count}/3`, mentions: [sender] })
            }
          }
          if(anti.antibadword && anti.badwords?.some(w=> body.toLowerCase().includes(w))) {
            await sock.sendMessage(from, { delete: msg.key }).catch(()=>{})
          }
          if(anti.antisticker && msg.message.stickerMessage) await sock.sendMessage(from, { delete: msg.key }).catch(()=>{})
          if(anti.antitag && (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 10)) await sock.sendMessage(from, { delete: msg.key }).catch(()=>{})
        }
      }

      // ===== AUTO REACT =====
      if(global.wolfDB.auto.react) {
        const emojis = ['🐺','🔥','❤️','👑','⚡','💯']
        await sock.sendMessage(from, { react: { text: emojis[Math.floor(Math.random()*emojis.length)], key: msg.key } }).catch(()=>{})
      }

      // ===== PRESENCE =====
      if(global.wolfDB.auto.typing) await sock.sendPresenceUpdate('composing', from).catch(()=>{})
      if(global.wolfDB.auto.recording) await sock.sendPresenceUpdate('recording', from).catch(()=>{})
      if(global.wolfDB.auto.online) await sock.sendPresenceUpdate('available', from).catch(()=>{})

      // ===== COMMAND PARSE - FIXED =====
      const type = Object.keys(msg.message)[0]
      let body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || ""
      if(!body) return

      // Check banned
      if(global.banned.includes(sender) || global.banned.includes(from)) return

      // Prefix check - supports multiple
      let prefix = global.config.prefa.find(p => body.startsWith(p))
      if (!prefix) return

      // Mode check
      if(global.config.mode === 'private' && !global.config.owner.includes(sender.split('@')[0]) && !global.config.owner.includes(from.split('@')[0])) return

      const args = body.slice(prefix.length).trim().split(/ +/)
      const cmdName = args.shift().toLowerCase()
      const text = args.join(" ")

      let cmd = commands.get(cmdName)
      if (!cmd) return

      console.log(`[CMD] ${cmdName} from ${sender} in ${isGroup ? from : 'private'}`)

      // Reply function
      const reply = async (txt, opt={}) => {
        return await sock.sendMessage(from, { text: txt, ...opt }, { quoted: msg })
      }

      // Execute with both old and new signatures
      try {
        if(cmd.execute.length === 4) { // old style (sock, msg, args, {from,config,commands})
          await cmd.execute(sock, msg, args, { from, config: global.config, commands })
        } else { // new style (sock, m, {command, text, reply})
          await cmd.execute(sock, msg, { command: cmdName, text, args, reply, from, sender, isGroup, prefix, config: global.config, commands })
        }
      } catch (e) {
        console.log("[CMD EXEC ERROR]", e)
        await reply(`❌ Error: ${e.message}\n\n🐺`).catch(()=>{})
      }

    } catch (e) {
      console.log("[MSG ERROR]", e)
    }
  })

  // ===== GROUP PARTICIPANTS UPDATE - WELCOME/GOODBYE =====
  sock.ev.on("group-participants.update", async (update) => {
    try {
      const { id, participants, action } = update
      if(action === 'add' && global.wolfDB.welcome[id]) {
        let txt = global.wolfDB.welcome[id].replace(/@user/g, `@${participants[0].split('@')[0]}`).replace(/@group/g, (await sock.groupMetadata(id).catch(()=>({subject: id}))).subject)
        await sock.sendMessage(id, { text: txt, mentions: participants })
      }
      if(action === 'remove' && global.wolfDB.goodbye[id]) {
        let txt = global.wolfDB.goodbye[id].replace(/@user/g, `@${participants[0].split('@')[0]}`)
        await sock.sendMessage(id, { text: txt, mentions: participants })
      }
    } catch {}
  })
}

startBot()

// ===== WEB SERVER =====
const app = express()
app.use(express.static(path.join(__dirname, "public")))
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"), (err) => {
    if(err) res.send(`<h1>🐺 KILLER WOLF XMD ONLINE ✅</h1><p>Bot: ${global.config.botName}</p><p>Commands: 100</p><p>Uptime: ${Math.floor(process.uptime()/60)}m</p>`)
  })
})
app.get("/ping", (req, res) => res.send("KILLER WOLF ONLINE 🐺"))
app.get("/commands", (req, res) => res.json({ total: commands.size, list: [...commands.keys()] }))

app.listen(config.port || 3000, () => {
  console.log(`[WEB] Dashboard running on port ${config.port || 3000}`)
})
