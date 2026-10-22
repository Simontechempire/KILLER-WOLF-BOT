// 🐺🎥 KILLER WOLF BOT - VV & EXTRA FILE V2 PRO MAX - 13 CMDS REAL
const fs = require('fs')
const path = require('path')

module.exports = {
  command: ['vv','vv2','viewonce','togstatus','welcome','goodbye','ping','speed','getpp','getprofilepic','getjid','save','vvinfo','report','request','gcstatus','runtime'],

  execute: async (sock, m, { command, text, reply }) => {
    const from = m.key.remoteJid
    const sender = m.key.participant || from
    global.wolfDB = global.wolfDB || { welcome: {}, goodbye: {} }

    try {
      // ===== VV REAL - Opens ViewOnce =====
      if (['vv','vv2','viewonce'].includes(command)) {
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage
        if(!quoted) return reply(`❌ Reply a ViewOnce message with .vv\n\nHow:\n1. Reply viewonce image/video\n2. Type .vv\n\n🐺`)

        const type = quoted.viewOnceMessageV2 ? Object.keys(quoted.viewOnceMessageV2.message)[0] : Object.keys(quoted)[0]
        const msg = quoted.viewOnceMessageV2 ? quoted.viewOnceMessageV2.message[type] : quoted[type] || quoted

        // Detect if it's already not viewonce but user thinks
        const isViewOnce = quoted.viewOnceMessage || quoted.viewOnceMessageV2 || msg?.viewOnce

        try {
          const buffer = await sock.downloadMediaMessage({ message: quoted.viewOnceMessageV2 ? quoted.viewOnceMessageV2 : quoted }, 'buffer')
          if(!buffer) return reply(`❌ Failed to download ViewOnce`)

          if(type.includes('image') || msg.mimetype?.includes('image')) {
            await sock.sendMessage(from, { image: buffer, caption: `🐺 *KILLER WOLF - VIEWONCE OPENED*\n\n✅ Recovered successfully\nType: Image\nFrom: @${m.message.extendedTextMessage?.contextInfo?.participant?.split('@')[0] || 'Unknown'}\n\n🐺`, mentions: [m.message.extendedTextMessage?.contextInfo?.participant].filter(Boolean) }, { quoted: m })
          } else if(type.includes('video') || msg.mimetype?.includes('video')) {
            await sock.sendMessage(from, { video: buffer, caption: `🐺 *VIEWONCE VIDEO OPENED*\n\n✅ Recovered\n\n🐺` }, { quoted: m })
          } else if(type.includes('audio')) {
            await sock.sendMessage(from, { audio: buffer, mimetype: 'audio/mp4', ptt: true }, { quoted: m })
          } else {
            await sock.sendMessage(from, { image: buffer, caption: `🐺 ViewOnce Opened 🐺` }, { quoted: m })
          }
          return
        } catch(e) {
          // Try alternative method
          try {
            const altBuf = await sock.downloadMediaMessage(m.message.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2 ? { message: { viewOnceMessageV2: m.message.extendedTextMessage.contextInfo.quotedMessage } } : { message: { imageMessage: quoted.imageMessage || quoted.videoMessage } }, 'buffer')
            if(altBuf) {
              await sock.sendMessage(from, { image: altBuf, caption: `🐺 VIEWONCE RECOVERED (ALT) 🐺` }, { quoted: m })
              return
            }
          } catch {}
          return reply(`❌ VV Error: ${e.message}\n\nNote: Baileys sometimes fails - make sure bot is latest version\n\n🐺`)
        }
      }

      if (command === 'togstatus') {
        global.wolfDB.status = !global.wolfDB.status
        return reply(`✅ Status toggled: ${global.wolfDB.status ? 'ON' : 'OFF'}`)
      }

      if (command === 'welcome') {
        const status = global.wolfDB.welcome[from] ? `ON: ${global.wolfDB.welcome[from]}` : 'OFF'
        if(text === 'on') return reply(`Use .setwelcome Hi @user welcome to @group`)
        if(text === 'off') { delete global.wolfDB.welcome[from]; return reply(`❌ Welcome OFF`) }
        return reply(`🎉 Welcome: ${status}\n\nUsage:\n.setwelcome Hello @user\n.delwelcome`)
      }

      if (command === 'goodbye') {
        const status = global.wolfDB.goodbye[from] ? `ON: ${global.wolfDB.goodbye[from]}` : 'OFF'
        return reply(`👋 Goodbye: ${status}\n\nUsage:\n.setgoodbye Bye @user\n.delgoodbye`)
      }

      if (command === 'ping' || command === 'speed') {
        const start = Date.now()
        const msg = await sock.sendMessage(from, { text: `🏓 Pinging...` }, { quoted: m })
        const ping = Date.now() - start
        await sock.sendMessage(from, { text: `🐺 *KILLER WOLF SPEED*\n\n🏓 Ping: ${ping}ms\n⚡ Speed: ${ping < 100 ? 'Super Fast 🚀' : ping < 300 ? 'Fast ⚡' : 'Medium 🐢'}\n⏱️ Uptime: ${Math.floor(process.uptime()/60)}m\n📅 ${new Date().toLocaleString()}\n\n🐺`, edit: msg.key })
        return
      }

      if (command === 'getpp' || command === 'getprofilepic') {
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (text ? text.replace(/[^0-9]/g,'') + '@s.whatsapp.net' : sender)
        try {
          const url = await sock.profilePictureUrl(target, 'image')
          await sock.sendMessage(from, { image: { url }, caption: `🖼️ PP of @${target.split('@')[0]}\n\n🐺`, mentions: [target] }, { quoted: m })
        } catch { reply(`❌ No PP or private`) }
        return
      }

      if (command === 'getjid') {
        return reply(`🆔 *JID INFO*\n\nChat JID: ${from}\nSender JID: ${sender}\n${from.endsWith('@g.us') ? `Group JID: ${from}\nParticipants: ${(await sock.groupMetadata(from).catch(()=>({participants:[]}))).participants.length}` : ''}\n\n🐺`)
      }

      if (command === 'save') {
        const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage
        if(!quoted) return reply(`Reply a message with .save to save to your DM`)
        await sock.sendMessage(sock.user.id, { forward: { message: quoted, key: { remoteJid: from } } })
        await sock.sendMessage(sock.user.id, { text: `💾 Saved from ${from}\nSender: @${sender.split('@')[0]}`, mentions: [sender] })
        return reply(`✅ Saved to your DM (Saved Messages)\n\n🐺`)
      }

      if (command === 'vvinfo') {
        return reply(`🎥 *VV INFO - KILLER WOLF*\n\nWhat is ViewOnce?\n• Image/video that can be viewed once\n• Disappears after viewing\n\nWhat does .vv do?\n• Recovers viewonce\n• Sends as normal image/video\n• Can save forever\n\nCommands:\n• .vv - Reply viewonce\n• .vv2 - Alternative method\n\nNote: Must reply the viewonce message\n\n🐺`)
      }

      if (command === 'report' || command === 'request') {
        if(!text) return reply(`Usage: .${command} Your message here\n\nWill send to owner`)
        const owner = global.config?.owner?.[0] || '2349166265317'
        await sock.sendMessage(owner + '@s.whatsapp.net', { text: `📩 *${command.toUpperCase()} FROM USER*\n\nFrom: @${sender.split('@')[0]}\nGroup: ${from}\nMessage: ${text}\n\n🐺`, mentions: [sender] })
        return reply(`✅ ${command} sent to owner!\n\nOwner will reply soon\n\n🐺`)
      }

      if (command === 'gcstatus' || command === 'gstatus' || command === 'runtime') {
        const groups = await sock.groupFetchAllParticipating().catch(()=>({}))
        return reply(`📊 *KILLER WOLF STATUS*\n\nBot: ${global.config?.botName || 'KILLER WOLF'}\nUptime: ${Math.floor(process.uptime()/3600)}h ${Math.floor(process.uptime()%3600/60)}m\nGroups: ${Object.keys(groups).length}\nMode: ${global.config?.mode || 'public'}\nPrefix: ${global.config?.prefa?.[0] || '.'}\nRAM: ${Math.floor(process.memoryUsage().heapUsed/1024/1024)} MB\n\n🐺`)
      }

    } catch(e) { reply(`❌ Extra Error: ${e.message}`) }
  }
}
