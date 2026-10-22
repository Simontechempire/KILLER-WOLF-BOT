// 🐺👑 KILLER WOLF XMD - INDEX.JS V2 PRO MAX - STABLE + REAL 100 CMDS + ANTI-CRASH
const { default: makeWASocket, DisconnectReason, makeCacheableSignalKeyStore, useMultiFileAuthState, jidDecode } = require("@whiskeysockets/baileys")
const P = require("pino")
const fs = require("fs")
const path = require("path")
const express = require("express")
const moment = require("moment-timezone")

// ===== CONFIG SAFE =====
let config
try { config = require("./config.js") } catch { config = { botName: "KILLER WOLF XMD", prefix: ".", prefa: [".", "/", "!", "#"], ownerNumber: "2349166265317", owner: ["2349166265317"], port: process.env.PORT || 3000, mode: "public", version: "2.0.0 PRO MAX" } }
config.prefa = config.prefa || [config.prefix || ".", ".", "!", "#", "/"]
config.port = config.port || process.env.PORT || 3000

// ===== GLOBAL =====
global.config = config
global.wolfDB = global.wolfDB || { auto: { view: true, like: true, online: true, typing: false, recording: false, react: false, bio: false }, anti: {}, welcome: {}, goodbye: {}, warns: {}, deleted: {}, antivv: {} }
global.banned = global.banned || []
global.wolfStart = Date.now()

function loadDB() {
  try {
    const dbPath = path.join(__dirname, "database")
    if(!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true })
    const files = ["auto.json","anti.json","warns.json","welcome.json","goodbye.json","banned.json","antivv.json"]
    for(let f of files) {
      let fp = path.join(dbPath, f)
      if(fs.existsSync(fp)) {
        let data = JSON.parse(fs.readFileSync(fp))
        if(f==="auto.json") global.wolfDB.auto = { ...global.wolfDB.auto, ...data }
        if(f==="anti.json") global.wolfDB.anti = data
        if(f==="warns.json") global.wolfDB.warns = data
        if(f==="welcome.json") global.wolfDB.welcome = data
        if(f==="goodbye.json") global.wolfDB.goodbye = data
        if(f==="banned.json") global.banned = data
        if(f==="antivv.json") global.wolfDB.antivv = data
      }
    }
  } catch(e){ console.log("[DB LOAD ERR]", e.message) }
}
function saveDB() {
  try {
    const dbPath = path.join(__dirname, "database")
    fs.writeFileSync(path.join(dbPath, "auto.json"), JSON.stringify(global.wolfDB.auto, null, 2))
    fs.writeFileSync(path.join(dbPath, "anti.json"), JSON.stringify(global.wolfDB.anti, null, 2))
    fs.writeFileSync(path.join(dbPath, "warns.json"), JSON.stringify(global.wolfDB.warns, null, 2))
    fs.writeFileSync(path.join(dbPath, "welcome.json"), JSON.stringify(global.wolfDB.welcome, null, 2))
    fs.writeFileSync(path.join(dbPath, "goodbye.json"), JSON.stringify(global.wolfDB.goodbye, null, 2))
    fs.writeFileSync(path.join(dbPath, "banned.json"), JSON.stringify(global.banned, null, 2))
    fs.writeFileSync(path.join(dbPath, "antivv.json"), JSON.stringify(global.wolfDB.antivv, null, 2))
  } catch{}
}
loadDB()
setInterval(saveDB, 15000)

// ===== LOAD COMMANDS - PROPER =====
const commands = new Map()
const cmdPath = path.join(__dirname, "commands")
function loadCommands() {
  commands.clear()
  if (!fs.existsSync(cmdPath)) fs.mkdirSync(cmdPath, { recursive: true })
  let totalFiles = 0, unique = new Set()
  const walk = (dir) => {
    for(let file of fs.readdirSync(dir)) {
      let full = path.join(dir, file)
      if(fs.statSync(full).isDirectory()) { walk(full); continue }
      if(!file.endsWith(".js")) continue
      try {
        delete require.cache[require.resolve(full)]
        let cmd = require(full)
        if(!cmd) continue
        let names = []
        if(cmd.name) names.push(cmd.name.toLowerCase())
        if(Array.isArray(cmd.command)) names.push(...cmd.command.map(c=>c.toLowerCase()))
        if(Array.isArray(cmd.alias)) names.push(...cmd.alias.map(c=>c.toLowerCase()))
        if(names.length===0) names = [path.basename(file, ".js").toLowerCase()]
        for(let n of names) {
          if(!n) continue
          commands.set(n, cmd)
          unique.add(cmd.name || n)
        }
        totalFiles++
      } catch(e){ console.log(`[CMD ERR] ${file}: ${e.message}`) }
    }
  }
  walk(cmdPath)
  console.log(`\x1b[31m╭── [ KILLER WOLF CMDS ] ──\x1b[0m`)
  console.log(`\x1b[31m│ Files: ${totalFiles} | Unique Cmds: ${unique.size} | Aliases: ${commands.size}\x1b[0m`)
  console.log(`\x1b[31m╰───────────────────────────\x1b[0m`)
}
loadCommands()
global.reloadCommands = loadCommands

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

function runtime(sec) {
  sec = Number(sec); let d=Math.floor(sec/(3600*24)), h=Math.floor(sec%(3600*24)/3600), m=Math.floor(sec%3600/60), s=Math.floor(sec%60)
  return `${d?d+"d ":""}${h?h+"h ":""}${m?m+"m ":""}${s}s`.trim()||"0s"
}

async function startBot() {
  const { state, saveCreds } = await getAuth()
  const sock = makeWASocket({
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, P().child({ level: "fatal" })) },
    logger: P({ level: "silent" }),
    browser: ["Killer Wolf", "Chrome", "1.0"],
    markOnlineOnConnect: global.wolfDB.auto.online !== false,
    syncFullHistory: false,
    printQRInTerminal: false,
    getMessage: async (key) => { return global.wolfDB.deleted?.[key.id]?.content ? { conversation: "deleted" } : undefined }
  })
  sock.ev.on("creds.update", saveCreds)

  // Connection
  sock.ev.on("connection.update", async (u) => {
    const { connection, lastDisconnect } = u
    if(connection==="close") {
      const code = lastDisconnect?.error?.output?.statusCode
      console.log(`[CLOSED] ${code} | ${DisconnectReason[code] || code}`)
      if(code !== DisconnectReason.loggedOut) setTimeout(startBot, 3000)
      else console.log("[LOGGED OUT] Delete session/ and re-pair with: node pair.js")
    }
    if(connection==="open") {
      console.log(`\n🐺 ${config.botName} CONNECTED - ${moment().tz("Africa/Lagos").format("HH:mm:ss")} ✅\nPrefix: ${config.prefa.join(" ")} | Mode: ${config.mode} | Owner: ${config.owner.join(",")}\n`)
      try {
        await sock.sendMessage(config.owner[0]+"@s.whatsapp.net", { text: `*🐺 ${config.botName} ONLINE ✅*\n\n*Prefix:* ${config.prefa[0]}\n*Commands:* ${commands.size} aliases (${[...new Set([...commands.values()].map(c=>c.name))].length} unique)\n*Mode:* ${config.mode}\n*Uptime:* ${runtime(process.uptime())}\n*Time:* ${moment().tz("Africa/Lagos").format("YYYY-MM-DD HH:mm:ss")}\n\n*Type:* ${config.prefa[0]}menu\n\n🐺 KILLER WOLF XMD V2` })
      } catch{}
      if(global.wolfDB.auto.bio) {
        setInterval(async()=>{
          try {
            let gCount = Object.keys(await sock.groupFetchAllParticipating().catch(()=>({}))).length
            await sock.updateProfileStatus(`🐺 ${config.botName} | ${moment().tz("Africa/Lagos").format("HH:mm")} | ${gCount} Groups | ${config.prefa[0]}menu | V2`)
          } catch{}
        }, 60000)
      }
    }
  })

  // ===== ANTIDELETE STORE =====
  sock.ev.on("messages.upsert", async (chat) => {
    try {
      let msg = chat.messages[0]
      if(!msg || !msg.message) return
      let type = Object.keys(msg.message)[0]
      if(["protocolMessage","senderKeyDistributionMessage"].includes(type)) return // skip
      let from = msg.key.remoteJid
      let sender = msg.key.participant || from
      let isGroup = from.endsWith("@g.us")

      // Save for antidelete if enabled
      if(global.wolfDB.anti?.[from]?.antidelete || global.wolfDB.antivv?.[from]) {
        global.wolfDB.deleted[msg.key.id] = { content: msg.message, jid: from, sender, time: Date.now(), key: msg.key, type }
        if(Object.keys(global.wolfDB.deleted).length>300) delete global.wolfDB.deleted[Object.keys(global.wolfDB.deleted)[0]]
      }

      // ===== STATUS - AUTO VIEW + LIKE =====
      if(from==="status@broadcast") {
        if(global.wolfDB.auto.view) await sock.readMessages([msg.key]).catch(()=>{})
        if(global.wolfDB.auto.like) {
          let emojis = ["🔥","❤️","🐺","👑","💯","⚡","😍","🫡"]
          await sock.sendMessage(from, { react: { text: emojis[Math.floor(Math.random()*emojis.length)], key: msg.key } }, { statusJidList: [sender] }).catch(async()=>{ await sock.sendMessage(from, { react: { text: "🔥", key: msg.key } }).catch(()=>{}) })
        }
        return
      }

      // ===== ANTIVV - VIEWONCE REVEAL =====
      if((msg.message.viewOnceMessage || msg.message.viewOnceMessageV2 || msg.message.viewOnceMessageV2Extension) && global.wolfDB.antivv?.[from]) {
        try {
          let vv = msg.message.viewOnceMessage || msg.message.viewOnceMessageV2 || msg.message.viewOnceMessageV2Extension
          let inner = vv.message || vv
          let caption = inner.imageMessage?.caption || inner.videoMessage?.caption || "*ViewOnce Revealed*"
          await sock.sendMessage(from, { text: `👁️ *ANTI-VV REVEALED*\n👤 @${sender.split("@")[0]}\n\n${caption}`, mentions:[sender] }, { quoted: msg })
          await sock.sendMessage(from, { forward: { key: msg.key, message: vv } }).catch(()=>{})
        } catch{}
      }

      // ===== ANTI ENGINE =====
      let anti = global.wolfDB.anti?.[from]
      if(anti && isGroup && !msg.key.fromMe) {
        let body = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || ""
        try {
          let meta = await sock.groupMetadata(from).catch(()=>null)
          if(meta) {
            let isAdmin = !!meta.participants.find(p=> p.id===sender || p.id===jidDecode(sender)?.user+"@s.whatsapp.net" || p.id.includes(sender.split("@")[0]))?.admin
            let botJid = sock.user.id.split(":")[0]+"@s.whatsapp.net"
            let botAdmin = !!meta.participants.find(p=> p.id===botJid || p.id.includes(sock.user.id.split(":")[0]))?.admin
            if(!isAdmin && botAdmin && body) {
              // Antilink
              if((anti.antilink || anti.antilinkkick || anti.antilinkwarn) && /(chat\.whatsapp\.com\/|https?:\/\/|www\.|wa\.me\/|t\.me\/|instagram\.com|tiktok\.com|facebook\.com)/i.test(body)) {
                await sock.sendMessage(from, { delete: msg.key }).catch(()=>{})
                if(anti.antilinkkick) await sock.groupParticipantsUpdate(from, [sender], "remove").catch(()=>{})
                else {
                  global.wolfDB.warns[from] = global.wolfDB.warns[from] || {}
                  global.wolfDB.warns[from][sender] = (global.wolfDB.warns[from][sender]||0)+1
                  if(global.wolfDB.warns[from][sender]>=3) { await sock.groupParticipantsUpdate(from,[sender],"remove").catch(()=>{}); delete global.wolfDB.warns[from][sender] }
                  else await sock.sendMessage(from, { text: `⚠️ @${sender.split("@")[0]} No links! Warn ${global.wolfDB.warns[from][sender]}/3`, mentions:[sender] })
                }
              }
              if(anti.antibadword && (anti.words||["fuck","shit"]).some(w=> body.toLowerCase().includes(w.toLowerCase()))) await sock.sendMessage(from, { delete: msg.key }).catch(()=>{})
              if(anti.antisticker && msg.message.stickerMessage) await sock.sendMessage(from, { delete: msg.key }).catch(()=>{})
              if(anti.antitag && (msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.length>5 || msg.message.extendedTextMessage?.contextInfo?.isForwarded)) await sock.sendMessage(from, { delete: msg.key }).catch(()=>{})
            }
          }
        } catch{}
      }

      // ===== PRESENCE + AUTO REACT =====
      if(global.wolfDB.auto.typing) await sock.sendPresenceUpdate('composing', from).catch(()=>{})
      if(global.wolfDB.auto.recording) await sock.sendPresenceUpdate('recording', from).catch(()=>{})
      if(global.wolfDB.auto.react && !isGroup) {
        let em = ['🐺','🔥','❤️','👑']; await sock.sendMessage(from, { react: { text: em[Math.floor(Math.random()*em.length)], key: msg.key } }).catch(()=>{})
      }

      // ===== COMMAND =====
      let b = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || ""
      if(!b) return
      if(global.banned.includes(sender) || global.banned.includes(from)) return
      let pref = config.prefa.find(p=> b.startsWith(p))
      if(!pref) return
      if(config.mode==="private" && !config.owner.includes(sender.split("@")[0]) && !config.owner.includes(jidDecode(sender)?.user)) return

      let args = b.slice(pref.length).trim().split(/ +/)
      let cmdName = args.shift()?.toLowerCase()
      if(!cmdName) return
      let text = args.join(" ")
      let cmd = commands.get(cmdName)
      if(!cmd) return

      console.log(`\x1b[31m[CMD]\x1b[0m ${cmdName} | ${sender.split("@")[0]} | ${isGroup ? from : "private"} | ${text.slice(0,20)}`)

      const reply = async (txt, opt={}) => {
        return await sock.sendMessage(from, { text: txt, ...opt }, { quoted: msg })
      }

      // Context
      const ctx = {
        command: cmdName, text, args, reply, from, sender,
        isGroup, isAdmin: false, isBotAdmin: false, isOwner: config.owner.includes(sender.split("@")[0]),
        prefix: pref, config, commands,
        sock, msg,
        runtime, moment
      }

      try {
        if(isGroup) {
          try {
            let meta = await sock.groupMetadata(from)
            ctx.groupMetadata = meta
            ctx.isAdmin = !!meta.participants.find(p=> p.id===sender || p.id.includes(sender.split("@")[0]))?.admin
            ctx.isBotAdmin = !!meta.participants.find(p=> p.id.includes(sock.user.id.split(":")[0]))?.admin
          } catch{}
        }
        // Support both signatures
        if(cmd.execute) {
          if(cmd.execute.length >=4) await cmd.execute(sock, msg, args, { from, sender, isGroup, config, commands, reply, text, prefix: pref, runtime })
          else await cmd.execute(sock, msg, ctx)
        } else if(cmd.run) await cmd.run(ctx)
      } catch(e){
        console.log("[CMD EXEC ERR]", e)
        await reply(`❌ Error: ${e.message}`).catch(()=>{})
      }

    } catch(e){ console.log("[MSG ERR]", e.message) }
  })

  // ===== ANTI-DELETE RECOVERY (protocol) =====
  sock.ev.on("messages.update", async(updates)=>{
    for(let u of updates) {
      if(u.update.message===null && u.key) {
        let saved = global.wolfDB.deleted?.[u.key.id]
        if(saved && global.wolfDB.anti?.[saved.jid]?.antidelete) {
          try {
            await sock.sendMessage(saved.jid, { text: `🛡️ *ANTIDELETE*\n👤 @${saved.sender.split("@")[0]} deleted a message`, mentions:[saved.sender] })
            if(saved.content) await sock.sendMessage(saved.jid, { forward: { key: saved.key, message: saved.content } })
          } catch{}
        }
      }
    }
  })

  // ===== WELCOME / GOODBYE =====
  sock.ev.on("group-participants.update", async (ev)=>{
    try {
      let { id, participants, action } = ev
      if(action==="add" && global.wolfDB.welcome[id]) {
        let meta = await sock.groupMetadata(id).catch(()=>({subject:id}))
        let txt = global.wolfDB.welcome[id].replace(/@user/g, `@${participants[0].split("@")[0]}`).replace(/@group/g, meta.subject).replace(/@desc/g, meta.desc||"")
        await sock.sendMessage(id, { text: txt, mentions: participants })
      }
      if(action==="remove" && global.wolfDB.goodbye[id]) {
        let txt = global.wolfDB.goodbye[id].replace(/@user/g, `@${participants[0].split("@")[0]}`)
        await sock.sendMessage(id, { text: txt, mentions: participants })
      }
    } catch{}
  })

  // ===== CALL REJECT (optional) =====
  sock.ev.on("call", async(calls)=>{
    for(let call of calls) {
      if(global.wolfDB.auto.anticall) {
        await sock.rejectCall(call.id, call.from).catch(()=>{})
        await sock.sendMessage(call.from, { text: "*📵 Call rejected - Bot doesn't accept calls*" })
      }
    }
  })

  return sock
}

startBot()

// ===== WEB SERVER - WITH API =====
const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, "public")))

app.get("/", (req,res)=>{
  res.sendFile(path.join(__dirname, "public/index.html"), (err)=>{
    if(err) res.send(`<h1>🐺 ${config.botName} ONLINE ✅</h1><p>Uptime: ${runtime(process.uptime())}</p>`)
  })
})

app.get("/ping", (req,res)=> res.send("KILLER WOLF ONLINE 🐺"))
app.get("/pair", (req,res)=> res.sendFile(path.join(__dirname, "public/pair.html"), (err)=> res.send("Use: node pair.js 234xxx")))
app.get("/qr", (req,res)=> res.sendFile(path.join(__dirname, "public/qr.html"), (err)=> res.send("Use: node qr.js")))

app.get("/api/status", (req,res)=>{
  res.json({
    connected: true,
    botName: config.botName,
    owner: config.owner[0],
    ownerNumber: config.ownerNumber,
    prefix: config.prefa[0],
    prefa: config.prefa,
    totalCommands: [...new Set([...commands.values()].map(c=>c.name||""))].length,
    totalAliases: commands.size,
    list: [...new Set([...commands.values()].map(c=>c.name))],
    uptime: runtime(process.uptime()),
    uptimeSec: process.uptime(),
    runtime: runtime(Date.now()/1000 - global.wolfStart/1000),
    mode: config.mode,
    version: config.version || "2.0.0 PRO MAX",
    banner: config.banner,
    memory: `${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} MB / ${(process.memoryUsage().rss/1024/1024).toFixed(2)} MB`,
    ram: `${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} MB`,
    platform: process.platform,
    host: "RENDER",
    auto: global.wolfDB.auto,
    antiCount: Object.keys(global.wolfDB.anti).length,
    bannedCount: global.banned.length
  })
})

app.get("/commands", (req,res)=> res.json({ totalUnique: [...new Set([...commands.values()].map(c=>c.name))].length, totalAliases: commands.size, list: [...commands.keys()] }))

app.listen(config.port, ()=> console.log(`[WEB] Dashboard: http://localhost:${config.port} | /api/status ✅`))
