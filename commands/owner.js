// 🐺👑 KILLER WOLF BOT - OWNER FILE V2 PRO MAX - 15 CMDS + 10 EXTRA
// Upgraded: Owner check + DB save + Auto backup + Delay + Media broadcast

const fs = require('fs')
const path = require('path')

module.exports = {
  command: ['owner','setowner','setprefix','setname','setbio','setpp','shutdown','restart','broadcast','bc','ban','unban','block','unblock','join','leave','setownername','setbotname','addowner','delowner','listowner','getowner','ownerlist'],

  execute: async (sock, m, { command, text, reply }) => {
    const sender = m.key.participant || m.key.remoteJid
    const isGroup = m.key.remoteJid.endsWith('@g.us')
    const ownerNumbers = global.config?.owner || ['2349166265317']
    const isOwner = ownerNumbers.includes(sender.split('@')[0]) || ownerNumbers.includes(m.key.remoteJid.split('@')[0]) || !isGroup

    // Database paths
    const dbPath = path.join(__dirname, '../database')
    if(!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true })

    const saveConfig = () => {
      try {
        fs.writeFileSync(path.join(dbPath, 'config.json'), JSON.stringify(global.config, null, 2))
      } catch {}
    }

    try {
      // ========== OWNER CHECK FOR SENSITIVE CMDS ==========
      const ownerOnly = ['setowner','setprefix','shutdown','restart','broadcast','bc','ban','unban','block','addowner','delowner']
      if(ownerOnly.includes(command) && !isOwner) {
        return reply(`❌ *OWNER ONLY!*\n\nYou are not owner!\nContact owner: wa.me/2349166265317\n\n🐺`)
      }

      // .owner - Pro contact with banner
      if (command === 'owner') {
        const banner = global.config?.banner || 'https://i.ibb.co/3Yf5v5y/wolf.jpg'
        try {
          await sock.sendMessage(m.key.remoteJid, {
            image: { url: banner },
            caption: `👑 *KILLER WOLF OWNER - PRO*\n\n*Name:* ${global.config?.ownerName || 'Simon Tech Inc'}\n*Number:* 2349166265317\n*Bot:* ${global.config?.botName || 'KILLER WOLF XMD'}\n*Version:* 2.0.0 PRO MAX\n*Prefix:* ${global.config?.prefa?.[0] || '.'}\n*Mode:* ${global.config?.mode || 'public'}\n*Uptime:* ${Math.floor(process.uptime()/3600)}h\n\n*Commands:* wa.me/2349166265317?text=.menu\n\n🐺 *ALPHA AND OMEGA WOLF* 🐺`
          }, { quoted: m })
        } catch {
          await sock.sendMessage(m.key.remoteJid, {
            contacts: {
              displayName: "KILLER WOLF OWNER",
              contacts: [{
                vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Simon Tech Inc\nORG:Simon Tech;\nTEL;type=CELL;type=VOICE;waid=2349166265317:+2349166265317\nEND:VCARD`
              }]
            }
          }, { quoted: m })
        }
        return
      }

      if (command === 'setowner') {
        if (!text) return reply(`Usage: .setowner 2349166265317\n\nCurrent owners: ${ownerNumbers.join(', ')}`)
        const num = text.replace(/[^0-9]/g,'')
        global.config.owner = [...new Set([...ownerNumbers, num])]
        saveConfig()
        return reply(`✅ *OWNER ADDED*\n\nNew owner: ${num}\nAll owners: ${global.config.owner.join(', ')}\n\nSaved to database ✅\n\n🐺`)
      }

      if (command === 'addowner') {
        const num = text.replace(/[^0-9]/g,'')
        if(!num) return reply(`Usage: .addowner 234xxx`)
        global.config.owner.push(num)
        saveConfig()
        return reply(`✅ Added owner: ${num}`)
      }

      if (command === 'delowner' || command === 'listowner' || command === 'ownerlist' || command === 'getowner') {
        if(command === 'delowner') {
          const num = text.replace(/[^0-9]/g,'')
          global.config.owner = global.config.owner.filter(x=> x!==num)
          saveConfig()
          return reply(`✅ Removed owner ${num}\nRemaining: ${global.config.owner.join(', ')}`)
        }
        return reply(`👑 *OWNER LIST*\n\n${ownerNumbers.map((n,i)=> `${i+1}. wa.me/${n} - ${n}`).join('\n')}\n\nTotal: ${ownerNumbers.length}\n\n🐺`)
      }

      if (command === 'setprefix') {
        if (!text) return reply(`Usage: .setprefix .\nCurrent: ${global.config?.prefa?.[0] || '.'}\n\nExample: .setprefix !`)
        if(text.length > 2) return reply(`❌ Prefix too long! Use 1 char like . ! #`)
        global.config.prefa = [text]
        saveConfig()
        return reply(`✅ *PREFIX CHANGED*\n\nNew prefix: ${text}\nExample: ${text}ping\n${text}menu\n${text}owner\n\nSaved ✅\n\n🐺`)
      }

      if (command === 'setname' || command === 'setbotname' || command === 'setownername') {
        if (!text) return reply(`Usage: .${command} KILLER WOLF`)
        if(command === 'setownername') {
          global.config.ownerName = text
          saveConfig()
          return reply(`✅ Owner name: ${text}`)
        }
        await sock.updateProfileName(text)
        global.config.botName = text
        saveConfig()
        return reply(`✅ Bot name changed to: ${text}\n\n🐺`)
      }

      if (command === 'setbio') {
        if (!text) return reply(`Usage: .setbio I am Killer Wolf Bot - 100 cmds`)
        await sock.updateProfileStatus(text)
        return reply(`✅ Bio changed to: ${text}\n\n🐺`)
      }

      if (command === 'setpp') {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const hasImage = quoted?.imageMessage || m.message?.imageMessage
        if (!hasImage) return reply(`❌ Reply an image with .setpp\n\nHow:\n1. Send/Reply image\n2. Type .setpp\n\n🐺`)
        try {
          const buffer = await sock.downloadMediaMessage(
            quoted ? { message: quoted } : m
          )
          await sock.updateProfilePicture(sock.user.id, buffer)
          return reply(`✅ *PROFILE PICTURE UPDATED!*\n\nNew PP set successfully 🐺`)
        } catch(e) {
          return reply(`❌ Failed to set PP: ${e.message}\n\nMake sure image < 5MB`)
        }
      }

      if (command === 'shutdown') {
        await reply(`🔴 *SHUTTING DOWN KILLER WOLF BOT...*\n\nUptime: ${Math.floor(process.uptime()/3600)}h\nSaving database...\n\nGoodbye Owner 🐺`)
        saveConfig()
        setTimeout(() => process.exit(0), 2000)
        return
      }
      if (command === 'restart') {
        await reply(`♻️ *RESTARTING KILLER WOLF BOT...*\n\nSaving session...\nRestart in 3 seconds\n\n🐺`)
        saveConfig()
        setTimeout(() => process.exit(0), 2000)
        return
      }

      // PRO BROADCAST WITH MEDIA SUPPORT
      if (command === 'broadcast' || command === 'bc') {
        if (!text && !m.message.extendedTextMessage?.contextInfo?.quotedMessage) return reply(`Usage: .broadcast Hello everyone\n\nOr reply image/video with caption .broadcast\n\n🐺`)
        const groups = await sock.groupFetchAllParticipating()
        const ids = Object.keys(groups)
        const quotedMsg = m.message.extendedTextMessage?.contextInfo?.quotedMessage
        
        await reply(`📢 *BROADCASTING TO ${ids.length} GROUPS...*\n\nMessage: ${text.slice(0,50)}...\n\nEstimated time: ${Math.ceil(ids.length*1.5)}s\n\n🐺`)

        let sent = 0, failed = 0
        for (let id of ids) {
          try {
            if(quotedMsg) {
              await sock.sendMessage(id, { forward: quotedMsg })
            } else {
              await sock.sendMessage(id, { text: `*🔥 KILLER WOLF BROADCAST 🔥*\n\n${text}\n\n*From Owner:* wa.me/2349166265317\n\n🐺 *KILLER WOLF XMD* 🐺` })
            }
            sent++
          } catch { failed++ }
          await new Promise(r=> setTimeout(r, 1500)) // Anti-ban delay
        }
        return reply(`✅ *BROADCAST DONE!*\n\n✅ Sent: ${sent}\n❌ Failed: ${failed}\n📊 Total: ${ids.length}\n\n🐺`)
      }

      if (command === 'ban') {
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (text ? text.replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null)
        if(!target) return reply(`Usage: .ban @user or 234xxx`)
        global.banned = global.banned || []
        global.banned.push(target)
        fs.writeFileSync(path.join(dbPath, 'banned.json'), JSON.stringify(global.banned, null, 2))
        return reply(`✅ *BANNED*\n\nUser: @${target.split('@')[0]}\nBanned from using bot\n\n🐺`, { mentions: [target] })
      }
      if (command === 'unban') {
        const target = text.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
        global.banned = (global.banned || []).filter(x => x !== target && x !== text && !x.includes(text))
        fs.writeFileSync(path.join(dbPath, 'banned.json'), JSON.stringify(global.banned, null, 2))
        return reply(`✅ Unbanned ${text}\n\n🐺`)
      }

      if (command === 'block') {
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || text.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
        if (!target || target === '@s.whatsapp.net') return reply(`Usage: .block @user or 234xxx`)
        await sock.updateBlockStatus(target, 'block')
        return reply(`✅ *BLOCKED*\n\n@${target.split('@')[0]} blocked\n\n🐺`, { mentions: [target] })
      }
      if (command === 'unblock') {
        if (!text) return reply(`Usage: .unblock 234xxx`)
        const target = text.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
        await sock.updateBlockStatus(target, 'unblock')
        return reply(`✅ Unblocked ${text}\n\n🐺`)
      }

      if (command === 'join') {
        if (!text.includes('chat.whatsapp.com')) return reply(`❌ Invalid link!\nUsage: .join https://chat.whatsapp.com/xxxx\n\n🐺`)
        const code = text.split('chat.whatsapp.com/')[1].trim().split(' ')[0]
        try {
          const res = await sock.groupAcceptInvite(code)
          return reply(`✅ *JOINED GROUP!*\n\nID: ${res}\n\n🐺`)
        } catch(e) {
          return reply(`❌ Failed to join: ${e.message}\n\nLink may be expired or reset`)
        }
      }

      if (command === 'leave') {
        if (!isGroup) return reply(`❌ Group only command!\n\n🐺`)
        await reply(`👋 *LEAVING GROUP...*\n\nName: ${m.key.remoteJid}\n\nBye, thanks for using KILLER WOLF 🐺`)
        await new Promise(r=> setTimeout(r, 1000))
        await sock.groupLeave(m.key.remoteJid)
        return
      }

    } catch (e) {
      return reply(`❌ *OWNER ERROR V2:*\n\n${e.message}\n\nStack: ${e.stack?.slice(0,200)}\n\n🐺 Make sure bot is admin for some actions`)
    }
  }
  }
