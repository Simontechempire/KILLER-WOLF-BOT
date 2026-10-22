// 🐺⚙️ KILLER WOLF BOT - BOTSETTINGS FILE V2 PRO MAX - 15 CMDS REAL
const fs = require('fs')
const path = require('path')

module.exports = {
  command: ['getprefix','setmode','public','private','settimezone','setlanguage','setownername','setfooter','setpackname','setauthor','setmenu','setcmdlog','setstatus','botinfo','uptime','mode','getmode'],

  execute: async (sock, m, { command, text, reply }) => {
    const dbPath = path.join(__dirname, '../database')
    if(!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true })
    global.config = global.config || { prefa: ['.'], mode: 'public', owner: ['2349166265317'], botName: 'KILLER WOLF XMD', ownerName: 'Simon Tech' }
    const save = () => fs.writeFileSync(path.join(dbPath, 'config.json'), JSON.stringify(global.config, null, 2))

    try {
      if(command === 'getprefix') return reply(`🔣 Current prefix: ${global.config.prefa?.[0] || '.'}\n\nChange: .setprefix !\n\n🐺`)

      if(command === 'setmode' || command === 'mode') {
        if(!text) return reply(`Usage: .setmode public/private\n\nCurrent: ${global.config.mode}\n\n🐺`)
        if(!['public','private','self'].includes(text.toLowerCase())) return reply(`Invalid! Use public or private`)
        global.config.mode = text.toLowerCase()
        save()
        return reply(`✅ Mode set to ${text}\n\n${text==='public' ? 'Everyone can use bot' : 'Only owner can use bot'}\n\n🐺`)
      }
      if(command === 'public') { global.config.mode='public'; save(); return reply(`✅ PUBLIC MODE - Everyone can use bot 🐺`) }
      if(command === 'private' || command === 'private') { global.config.mode='private'; save(); return reply(`✅ PRIVATE MODE - Owner only 🐺`) }
      if(command === 'getmode') return reply(`🌐 Mode: ${global.config.mode}`)

      if(command === 'settimezone') {
        if(!text) return reply(`Usage: .settimezone Africa/Lagos\nCurrent: ${global.config.timezone || 'Africa/Lagos'}`)
        global.config.timezone = text; save(); return reply(`✅ Timezone: ${text}`)
      }
      if(command === 'setlanguage') {
        global.config.language = text || 'en'; save(); return reply(`✅ Language: ${global.config.language}`)
      }
      if(command === 'setownername') {
        if(!text) return reply(`Usage: .setownername Simon Tech`)
        global.config.ownerName = text; save(); return reply(`✅ Owner name: ${text}`)
      }
      if(command === 'setfooter') {
        global.config.footer = text || 'KILLER WOLF XMD'; save(); return reply(`✅ Footer: ${global.config.footer}`)
      }
      if(command === 'setpackname') {
        global.config.packname = text || 'KILLER WOLF'; save(); return reply(`✅ Packname: ${text}\nFor stickers`)
      }
      if(command === 'setauthor') {
        global.config.author = text || 'Simon Tech'; save(); return reply(`✅ Author: ${text}\nFor stickers`)
      }
      if(command === 'setmenu') {
        if(!text) return reply(`Usage: .setmenu 1/2/3\n1 = Box design\n2 = List design\n3 = Simple`)
        global.config.menuStyle = text; save(); return reply(`✅ Menu style: ${text}`)
      }
      if(command === 'setcmdlog') {
        global.config.cmdlog = text === 'on'; save(); return reply(`✅ CmdLog: ${global.config.cmdlog ? 'ON' : 'OFF'}\nShows command logs in console`)
      }
      if(command === 'setstatus') {
        if(!text) return reply(`Usage: .setstatus I am Killer Wolf Bot`)
        await sock.updateProfileStatus(text); return reply(`✅ Status set: ${text}`)
      }
      if(command === 'botinfo') {
        return reply(`🤖 *BOT INFO PRO*\n\nName: ${global.config.botName}\nOwner: ${global.config.ownerName}\nOwner Numbers: ${global.config.owner.join(', ')}\nPrefix: ${global.config.prefa}\nMode: ${global.config.mode}\nTimezone: ${global.config.timezone || 'Africa/Lagos'}\nLanguage: ${global.config.language || 'en'}\nFooter: ${global.config.footer || 'KILLER WOLF'}\nPackname: ${global.config.packname || 'KILLER WOLF'}\nMenu: ${global.config.menuStyle || '1'}\nUptime: ${Math.floor(process.uptime()/3600)}h\nRAM: ${Math.floor(process.memoryUsage().heapUsed/1024/1024)}MB\n\n🐺`)
      }
      if(command === 'uptime') {
        const up = process.uptime()
        const h = Math.floor(up/3600), m = Math.floor(up%3600/60), s = Math.floor(up%60)
        return reply(`⏱️ *UPTIME*\n\n${h}h ${m}m ${s}s\nStarted: ${new Date(Date.now() - up*1000).toLocaleString()}\n\n🐺`)
      }
    } catch(e) { reply(`❌ Settings Error: ${e.message}`) }
  }
          }
