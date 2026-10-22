// 🐺👑 KILLER WOLF XMD - INDEX.JS V3 FINAL - REAL PAIR API + STABLE
const { default: makeWASocket, DisconnectReason, makeCacheableSignalKeyStore, useMultiFileAuthState, jidDecode } = require("@whiskeysockets/baileys")
const P = require("pino")
const fs = require("fs")
const path = require("path")
const express = require("express")
const moment = require("moment-timezone")

let config
try { config = require("./config.js") } catch { config = { botName: "KILLER WOLF XMD", prefix: ".", prefa: [".","/","!","#"], ownerNumber: "2349166265317", owner: ["2349166265317"], port: process.env.PORT || 3000, mode: "public", version: "V3 PRO MAX", banner: "https://i.ibb.co/ynjDCV9L/killer-wolf.jpg" } }
config.prefa = config.prefa || [config.prefix || ".", ".", "!", "#", "/"]
config.port = config.port || process.env.PORT || 3000
global.config = config
global.wolfDB = global.wolfDB || { auto: { view: true, like: true, online: true, typing: false, recording: false, react: false }, anti: {}, welcome: {}, goodbye: {}, warns: {}, deleted: {}, antivv: {} }
global.banned = global.banned || []
global.wolfStart = Date.now()

const commands = new Map()
const cmdPath = path.join(__dirname, "commands")
function loadCommands(){
  commands.clear()
  if (!fs.existsSync(cmdPath)) fs.mkdirSync(cmdPath, { recursive: true })
  let totalFiles=0, unique=new Set()
  const walk=(dir)=>{ for(let file of fs.readdirSync(dir)){ let full=path.join(dir,file); if(fs.statSync(full).isDirectory()){walk(full);continue} if(!file.endsWith(".js")) continue; try{ delete require.cache[require.resolve(full)]; let cmd=require(full); if(!cmd) continue; let names=[]; if(cmd.name) names.push(cmd.name.toLowerCase()); if(Array.isArray(cmd.command)) names.push(...cmd.command.map(c=>c.toLowerCase())); if(Array.isArray(cmd.alias)) names.push(...cmd.alias.map(c=>c.toLowerCase())); if(names.length===0) names=[path.basename(file,".js").toLowerCase()]; for(let n of names){ if(!n) continue; commands.set(n,cmd); unique.add(cmd.name||n) } totalFiles++ }catch(e){ console.log(`[CMD ERR] ${file}: ${e.message}`) } } }
  walk(cmdPath)
  console.log(`\x1b[31m╭── [ KILLER WOLF CMDS ] ──\x1b[0m`)
  console.log(`\x1b[31m│ Files: ${totalFiles} | Unique: ${unique.size} | Aliases: ${commands.size}\x1b[0m`)
  console.log(`\x1b[31m╰───────────────────────\x1b[0m`)
}
loadCommands()
global.reloadCommands=loadCommands

async function getAuth(){
  try{ const { getSession }=require("./lib/handler.js"); return await getSession() }catch{ const { state, saveCreds }=await useMultiFileAuthState(path.join(__dirname,"session")); return { state, saveCreds } }
}
function runtime(sec){ sec=Number(sec); let d=Math.floor(sec/(3600*24)), h=Math.floor(sec%(3600*24)/3600), m=Math.floor(sec%3600/60), s=Math.floor(sec%60); return `${d?d+"d ":""}${h?h+"h ":""}${m?m+"m ":""}${s}s`.trim()||"0s" }

async function startBot(){
  const { state, saveCreds }=await getAuth()
  const sock=makeWASocket({
    auth:{creds:state.creds, keys:makeCacheableSignalKeyStore(state.keys,P().child({level:"fatal"}))},
    logger:P({level:"silent"}), browser:["Killer Wolf","Chrome","1.0"], markOnlineOnConnect:global.wolfDB.auto.online!==false, syncFullHistory:false, printQRInTerminal:false
  })
  sock.ev.on("creds.update", saveCreds)
  sock.ev.on("connection.update", async(u)=>{
    const { connection, lastDisconnect }=u
    if(connection==="close"){ const code=lastDisconnect?.error?.output?.statusCode; console.log(`[CLOSED] ${code} | ${code}`); if(code!==DisconnectReason.loggedOut) setTimeout(startBot,3000); else console.log("[LOGGED OUT] node pair.js --fresh") }
    if(connection==="open"){ console.log(`\n🐺 ${config.botName} CONNECTED ✅ | ${moment().tz("Africa/Lagos").format("HH:mm:ss")}\n`); try{ await sock.sendMessage(config.owner[0]+"@s.whatsapp.net",{text:`*🐺 ${config.botName} ONLINE ✅*\nPrefix: ${config.prefa[0]}\nCmds: ${commands.size}\n${config.prefa[0]}menu`}) }catch{} }
  })

  sock.ev.on("messages.upsert", async(chat)=>{
    try{
      let msg=chat.messages[0]; if(!msg||!msg.message) return
      let from=msg.key.remoteJid, sender=msg.key.participant||from, isGroup=from.endsWith("@g.us")
      if(from==="status@broadcast"){ if(global.wolfDB.auto.view) await sock.readMessages([msg.key]).catch(()=>{}); return }
      let b=msg.message.conversation||msg.message.extendedTextMessage?.text||msg.message.imageMessage?.caption||msg.message.videoMessage?.caption||""; if(!b) return
      let pref=config.prefa.find(p=>b.startsWith(p)); if(!pref) return
      let args=b.slice(pref.length).trim().split(/ +/); let cmdName=args.shift()?.toLowerCase(); if(!cmdName) return
      let cmd=commands.get(cmdName); if(!cmd) return
      console.log(`[CMD] ${cmdName} | ${sender.split("@")[0]}`)
      const reply=async(txt,opt={})=> await sock.sendMessage(from,{text:txt,...opt},{quoted:msg})
      const ctx={ command:cmdName, text:args.join(" "), args, reply, from, sender, isGroup, isOwner:config.owner.includes(sender.split("@")[0]), prefix:pref, config, commands, sock, msg, runtime, moment }
      try{ if(isGroup){ try{ let meta=await sock.groupMetadata(from); ctx.groupMetadata=meta; ctx.isAdmin=!!meta.participants.find(p=>p.id===sender||p.id.includes(sender.split("@")[0]))?.admin; ctx.isBotAdmin=!!meta.participants.find(p=>p.id.includes(sock.user.id.split(":")[0]))?.admin }catch{} } if(cmd.execute) await cmd.execute(sock,msg,ctx); else if(cmd.run) await cmd.run(ctx) }catch(e){ console.log("[CMD ERR]",e); await reply(`❌ ${e.message}`).catch(()=>{}) }
    }catch(e){ console.log("[MSG ERR]",e.message) }
  })
  return sock
}
startBot()

// ===== WEB SERVER WITH REAL PAIR API =====
const app=express()
app.use(express.json())
app.use(express.static(path.join(__dirname,"public")))

app.get("/",(req,res)=>{ res.sendFile(path.join(__dirname,"public","index.html"),(err)=>{ if(err) res.send(`<h1>🐺 ${config.botName} ONLINE ✅</h1><p><a href="/api/pair?number=234...">Generate Pair</a></p>`) }) })
app.get("/ping",(req,res)=> res.send("KILLER WOLF ONLINE 🐺"))

// ===== REAL PAIR CODE API - GENERATES REAL BAILEYS 8-DIGIT CODE =====
let pairSockCache=null
app.get("/api/pair", async(req,res)=>{
  let number=req.query.number?.replace(/[^0-9]/g,"")
  if(!number||number.length<10) return res.json({ error:"Invalid number. Use 2349166265317 without +" })
  console.log(`[PAIR REQ] ${number}`)
  try{
    const sessionPath=path.join(__dirname,"session")
    if(!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath,{recursive:true})
    const { state, saveCreds }=await useMultiFileAuthState(sessionPath)
    const sock=makeWASocket({
      auth:{ creds:state.creds, keys:makeCacheableSignalKeyStore(state.keys,P().child({level:"fatal"})) },
      logger:P({level:"silent"}), printQRInTerminal:false, browser:["Killer Wolf","Chrome","1.0"]
    })
    sock.ev.on("creds.update", saveCreds)
    if(sock.authState.creds.registered){ return res.json({ error:"Already paired! Delete session folder to re-pair" }) }
    await new Promise(r=> setTimeout(r,3000))
    let rawCode=await sock.requestPairingCode(number)
    let prettyCode=rawCode?.match(/.{1,4}/g)?.join("-") || rawCode
    console.log(`[PAIR SUCCESS] ${number} => ${prettyCode}`)
    pairSockCache=sock
    // Listen for open to auto-save session
    sock.ev.on("connection.update", async(u)=>{
      if(u.connection==="open"){ console.log(`[PAIR] ${number} CONNECTED ✅`); await new Promise(r=> setTimeout(r,2000)); try{ let data=fs.readFileSync(path.join(sessionPath,"creds.json")); let b64=data.toString("base64"); fs.writeFileSync(path.join(__dirname,"SESSION.b64"),b64); console.log(`[SESSION B64 SAVED] Length ${b64.length}`) }catch{} }
    })
    return res.json({ success:true, code:prettyCode, raw:rawCode, number, message:"Enter this code in WhatsApp > Linked Devices > Link with phone number" })
  }catch(e){ console.log("[PAIR ERROR]",e.message); return res.json({ error:e.message, hint:"Wait 2 mins if rate limited, or try again" }) }
})

app.get("/api/status",(req,res)=>{
  res.json({
    connected:true, botName:config.botName, owner:config.owner[0], prefix:config.prefa[0], prefa:config.prefa,
    totalCommands:[...new Set([...commands.values()].map(c=>c.name||""))].length, totalAliases:commands.size,
    uptime:runtime(process.uptime()), mode:config.mode, version:config.version, banner:config.banner,
    memory:`${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} MB`, host:"RENDER"
  })
})

app.listen(config.port, ()=> console.log(`[WEB] http://localhost:${config.port} | /api/pair?number=234... | /api/status ✅`))
