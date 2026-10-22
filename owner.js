// 🐺👑 KILLER WOLF BOT - OWNER FILE - 15 CMDS REAL
module.exports = {
  command: ['owner','setowner','setprefix','setname','setbio','setpp','shutdown','restart','broadcast','ban','unban','block','unblock','join','leave'],

  execute: async (sock, m, { command, text, reply }) => {
    const sender = m.key.participant || m.key.remoteJid
    const isGroup = m.key.remoteJid.endsWith('@g.us')

    try {
      // .owner - Send owner contact
      if (command === 'owner') {
        await sock.sendMessage(m.key.remoteJid, {
          contacts: {
            displayName: "KILLER WOLF OWNER",
            contacts: [{
              vcard: `BEGIN:VCARD\nVERSION:3.0\nFN:Simon Tech Inc\nORG:Simon Tech;\nTEL;type=CELL;type=VOICE;waid=2349166265317:+2349166265317\nEND:VCARD`
            }]
          }
        }, { quoted: m })
        return reply(`👑 *KILLER WOLF OWNER*\n\nName: Simon Tech\nNumber: 2349166265317\nBot: KILLER WOLF\n\nwa.me/2349166265317\n\n🐺`)
      }

      // .setowner
      if (command === 'setowner') {
        if (!text) return reply(`Usage: .setowner 2349166265317`)
        global.config = global.config || {}
        global.config.ownerNumber = text.replace(/[^0-9]/g,'')
        return reply(`✅ Owner set to ${text}\n\n🐺`)
      }

      // .setprefix
      if (command === 'setprefix') {
        if (!text) return reply(`Usage: .setprefix .\nCurrent: .`)
        global.config.prefa = [text]
        return reply(`✅ Prefix changed to: ${text}\n\nExample: ${text}ping\n\n🐺`)
      }

      // .setname
      if (command === 'setname') {
        if (!text) return reply(`Usage: .setname KILLER WOLF`)
        await sock.updateProfileName(text)
        return reply(`✅ Bot name changed to: ${text}\n\n🐺`)
      }

      // .setbio
      if (command === 'setbio') {
        if (!text) return reply(`Usage: .setbio I am Killer Wolf Bot`)
        await sock.updateProfileStatus(text)
        return reply(`✅ Bio changed to: ${text}\n\n🐺`)
      }

      // .setpp - Set bot profile pic
      if (command === 'setpp') {
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage
        const direct = m.message?.imageMessage
        if (!quoted && !direct) return reply(`❌ Reply an image with .setpp\n\nExample: Reply image + .setpp\n\n🐺`)
        const buffer = await sock.downloadMediaMessage(
          quoted ? { message: { imageMessage: quoted } } : m
        )
        await sock.updateProfilePicture(sock.user.id, buffer)
        return reply(`✅ Profile picture updated!\n\n🐺`)
      }

      // .shutdown / .restart
      if (command === 'shutdown') {
        await reply(`🔴 Shutting down KILLER WOLF BOT...\n\nGoodbye 🐺`)
        setTimeout(() => process.exit(0), 2000)
        return
      }
      if (command === 'restart') {
        await reply(`♻️ Restarting KILLER WOLF BOT...\n\nWait 5 seconds 🐺`)
        setTimeout(() => process.exit(0), 2000)
        return
      }

      // .broadcast
      if (command === 'broadcast') {
        if (!text) return reply(`Usage: .broadcast Hello everyone`)
        const groups = await sock.groupFetchAllParticipating()
        const ids = Object.keys(groups)
        await reply(`📢 Broadcasting to ${ids.length} groups...`)
        let sent = 0
        for (let id of ids) {
          await sock.sendMessage(id, { text: `*🔥 KILLER WOLF BROADCAST*\n\n${text}\n\n🐺` }).then(()=> sent++).catch(()=>{})
          await new Promise(r=> setTimeout(r, 1000))
        }
        return reply(`✅ Broadcast done!\nSent: ${sent}/${ids.length}\n\n🐺`)
      }

      // .ban / .unban
      if (command === 'ban') {
        if (!text) return reply(`Usage: .ban 234xxx or reply user`)
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || text.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
        global.banned = global.banned || []
        global.banned.push(target)
        return reply(`✅ Banned @${target.split('@')[0]}\n\n🐺`, { mentions: [target] })
      }
      if (command === 'unban') {
        const target = text.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
        global.banned = (global.banned || []).filter(x => x !== target && x !== text)
        return reply(`✅ Unbanned ${text}\n\n🐺`)
      }

      // .block / .unblock
      if (command === 'block') {
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || text.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
        if (!target) return reply(`Usage: .block @user or number`)
        await sock.updateBlockStatus(target, 'block')
        return reply(`✅ Blocked @${target.split('@')[0]}\n\n🐺`, { mentions: [target] })
      }
      if (command === 'unblock') {
        if (!text) return reply(`Usage: .unblock 234xxx`)
        const target = text.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
        await sock.updateBlockStatus(target, 'unblock')
        return reply(`✅ Unblocked ${text}\n\n🐺`)
      }

      // .join
      if (command === 'join') {
        if (!text.includes('chat.whatsapp.com')) return reply(`Usage: .join https://chat.whatsapp.com/xxxx`)
        const code = text.split('chat.whatsapp.com/')[1].trim()
        await sock.groupAcceptInvite(code)
        return reply(`✅ Joined group via link!\n\n🐺`)
      }

      // .leave
      if (command === 'leave') {
        if (!isGroup) return reply(`❌ Group only command!\n\n🐺`)
        await reply(`👋 Leaving group...\n\nBye 🐺`)
        await sock.groupLeave(m.key.remoteJid)
        return
      }

    } catch (e) {
      return reply(`❌ Owner Error: ${e.message}\n\n🐺 Make sure bot is admin for some actions`)
    }
  }
}
