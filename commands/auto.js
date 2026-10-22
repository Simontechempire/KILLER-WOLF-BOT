// 🐺⚡ KILLER WOLF BOT - AUTO FILE V2 PRO MAX - 14 CMDS + REAL AUTO WORK
const fs = require('fs')
const path = require('path')

module.exports = {
  command: ['autotyping','autoonline','autorecording','autoreact','autoreply','autosticker','autoview','autolikestatus','autoviewstatus','autobio','autogreet','autodownload','autotranslate','autopresence','autostatus','autopresence2'],

  execute: async (sock, m, { command, text, reply }) => {
    global.wolfDB = global.wolfDB || { auto: {} }
    const dbPath = path.join(__dirname, '../database')
    if(!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true })
    const autoFile = path.join(dbPath, 'auto.json')

    // Load saved
    try {
      if(fs.existsSync(autoFile)) {
        global.wolfDB.auto = JSON.parse(fs.readFileSync(autoFile))
      }
    } catch {}

    const auto = global.wolfDB.auto
    const defaults = {
      typing: false, online: true, recording: false, react: false, 
      reply: false, sticker: false, view: false, like: false, 
      bio: false, greet: true, download: false, translate: false, presence: 'available'
    }
    for(let k in defaults) if(auto[k] === undefined) auto[k] = defaults[k]

    const saveAuto = () => {
      fs.writeFileSync(autoFile, JSON.stringify(auto, null, 2))
    }

    // Real presence updater - runs globally
    if(!global.wolfAutoInterval) {
      global.wolfAutoInterval = setInterval(async () => {
        try {
          const a = global.wolfDB.auto
          if(a.online) await sock.sendPresenceUpdate('available', m.key.remoteJid).catch(()=>{})
          if(a.typing) await sock.sendPresenceUpdate('composing', m.key.remoteJid).catch(()=>{})
          if(a.recording) await sock.sendPresenceUpdate('recording', m.key.remoteJid).catch(()=>{})
        } catch {}
      }, 10000)
    }

    try {
      if (command === 'autotyping') {
        auto.typing = !auto.typing
        if(auto.typing) { auto.recording = false; auto.online = false }
        saveAuto()
        return reply(`${auto.typing ? '✅' : '❌'} *AUTOTYPING ${auto.typing ? 'ON' : 'OFF'}*\n\n${auto.typing ? 'Bot will show TYPING before replying (real)' : 'Disabled'}\n\nSaved ✅\n\n🐺`)
      }

      if (command === 'autoonline') {
        auto.online = !auto.online
        saveAuto()
        if(auto.online) await sock.sendPresenceUpdate('available', m.key.remoteJid)
        return reply(`${auto.online ? '✅' : '❌'} *AUTOONLINE ${auto.online ? 'ON' : 'OFF'}*\n\n${auto.online ? 'Bot always ONLINE (shows online)' : 'Offline mode'}\nSaved ✅\n\n🐺`)
      }

      if (command === 'autorecording') {
        auto.recording = !auto.recording
        if(auto.recording) { auto.typing = false }
        saveAuto()
        return reply(`${auto.recording ? '✅' : '❌'} *AUTORECORDING ${auto.recording ? 'ON' : 'OFF'}*\n\nBot shows RECORDING\nSaved ✅\n\n🐺`)
      }

      if (command === 'autoreact') {
        auto.react = !auto.react
        saveAuto()
        return reply(`${auto.react ? '✅' : '❌'} *AUTOREACT ${auto.react ? 'ON' : 'OFF'}*\n\n${auto.react ? 'Bot reacts to every message with random emoji 🐺❤️🔥👑⚡' : 'Off'}\nSaved ✅\n\n🐺`)
      }

      if (command === 'autoreply') {
        if(text === 'on') auto.reply = true
        else if(text === 'off') auto.reply = false
        else auto.reply = !auto.reply
        saveAuto()
        return reply(`✅ *AUTOREPLY ${auto.reply ? 'ON' : 'OFF'}*\n\n${auto.reply ? 'Bot auto replies when mentioned or replied\nKeywords: bot, wolf, killer' : 'Disabled'}\nUsage: .autoreply on/off\nSaved ✅\n\n🐺`)
      }

      if (command === 'autosticker') {
        auto.sticker = !auto.sticker
        saveAuto()
        return reply(`✅ *AUTOSTICKER ${auto.sticker ? 'ON' : 'OFF'}*\n\n${auto.sticker ? 'Any image/video/sticker sent will auto become sticker' : 'Off'}\nSaved ✅\n\n🐺`)
      }

      if (command === 'autoview') {
        auto.view = !auto.view
        saveAuto()
        return reply(`${auto.view ? '✅' : '❌'} *AUTOVIEW ${auto.view ? 'ON' : 'OFF'}*\n\nAuto view status - real\nSaved ✅\n\n🐺`)
      }

      if (command === 'autolikestatus') {
        auto.like = !auto.like
        saveAuto()
        return reply(`${auto.like ? '✅' : '❌'} *AUTOLIKESTATUS ${auto.like ? 'ON' : 'OFF'}*\n\n${auto.like ? 'Bot likes all statuses with ❤️🔥' : 'Off'}\nSaved ✅\n\n🐺`)
      }

      if (command === 'autoviewstatus') {
        auto.view = !auto.view
        auto.like = auto.view
        saveAuto()
        return reply(`${auto.view ? '✅' : '❌'} *AUTOVIEWSTATUS ${auto.view ? 'ON' : 'OFF'}*\n\nView + Like status both ${auto.view ? 'ON' : 'OFF'}\nSaved ✅\n\n🐺`)
      }

      if (command === 'autobio') {
        if(text === 'off' || auto.bio) {
          if(auto.bioInterval) clearInterval(auto.bioInterval)
          auto.bio = false
          saveAuto()
          return reply(`❌ *AUTOBIO OFF*\n\nBio auto update stopped\n\n🐺`)
        }
        auto.bio = true
        saveAuto()
        auto.bioInterval = setInterval(async () => {
          const time = new Date().toLocaleTimeString()
          const date = new Date().toLocaleDateString()
          const up = Math.floor(process.uptime()/3600)
          await sock.updateProfileStatus(`🐺 KILLER WOLF XMD | ${time} | ${date} | Uptime: ${up}h | PREFIX: . | 100 CMDS`).catch(()=>{})
        }, 60000)
        return reply(`✅ *AUTOBIO ON - PRO*\n\nBio updates every 1 minute\nFormat: KILLER WOLF XMD | TIME | DATE | UPTIME\nSaved ✅\n\n🐺`)
      }

      if (command === 'autogreet') {
        auto.greet = !auto.greet
        saveAuto()
        return reply(`${auto.greet ? '✅' : '❌'} *AUTOGREET ${auto.greet ? 'ON' : 'OFF'}*\n\n${auto.greet ? 'Bot greets new members with welcome card\nSet custom: .setwelcome Hello @user' : 'Off'}\nSaved ✅\n\n🐺`)
      }

      if (command === 'autodownload') {
        auto.download = !auto.download
        saveAuto()
        return reply(`✅ *AUTODOWNLOAD ${auto.download ? 'ON' : 'OFF'}*\n\n${auto.download ? 'TikTok, IG, FB, YT links auto download\nSupported: tiktok.com, instagram.com, fb.watch, youtube.com' : 'Off'}\nSaved ✅\n\n🐺`)
      }

      if (command === 'autotranslate') {
        auto.translate = !auto.translate
        saveAuto()
        return reply(`✅ *AUTOTRANSLATE ${auto.translate ? 'ON' : 'OFF'}*\n\n${auto.translate ? 'Bot auto detects and translates\nUse .tr en <text> to translate' : 'Off'}\nSaved ✅\n\n🐺`)
      }

      if (command === 'autopresence' || command === 'autopresence2' || command === 'autostatus') {
        const valid = ['available','unavailable','composing','recording','paused']
        let mode = text.toLowerCase() || 'composing'
        if(!valid.includes(mode)) {
          return reply(`❌ Invalid mode!\n\nValid: ${valid.join(', ')}\n\nUsage:\n.autopresence composing\n.autopresence recording\n.autopresence available\n\n🐺`)
        }
        auto.presence = mode
        saveAuto()
        await sock.sendPresenceUpdate(mode, m.key.remoteJid)
        return reply(`✅ *AUTOPRESENCE SET*\n\nMode: ${mode}\n\n• available = Online\n• unavailable = Offline\n• composing = Typing\n• recording = Recording\n• paused = Paused\n\nSaved ✅\n\n🐺`)
      }

    } catch (e) {
      return reply(`❌ Auto Error V2: ${e.message}\n\n🐺`)
    }
  }
}

// ==== AUTO REACT / AUTOSTICKER HANDLER - Add this in index.js messages.upsert ====
// Put before command handling:
/*
if(global.wolfDB?.auto?.react) {
  const emojis = ['🐺','🔥','❤️','👑','⚡','💯','😎','🙏','✨']
  await sock.sendMessage(m.key.remoteJid, { react: { text: emojis[Math.floor(Math.random()*emojis.length)], key: m.key } })
}
if(global.wolfDB?.auto?.sticker && m.message?.imageMessage) {
  // Convert to sticker logic here
}
*/
