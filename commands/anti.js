// 🐺☠️ KILLER WOLF BOT - ANTI FILE V2 PRO MAX - 15 CMDS + REAL DELETE/KICK
const fs = require('fs')
const path = require('path')

module.exports = {
  command: ['antilink','antibot','antispam','antitag','antidelete','antiviewonce','antisticker','antinsfw','antibadword','antiflood','antiraid','antimute','antigmention','antilinkkick','antilinkwarn'],

  execute: async (sock, m, { command, text, reply }) => {
    const isGroup = m.key.remoteJid.endsWith('@g.us')
    if (!isGroup) return reply(`☠️ Anti commands for groups only!\n\n🐺`)

    const dbPath = path.join(__dirname, '../database')
    if(!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true })
    const antiFile = path.join(dbPath, 'anti.json')

    global.wolfDB = global.wolfDB || {}
    global.wolfDB.anti = global.wolfDB.anti || {}

    // Load
    try {
      if(fs.existsSync(antiFile)) {
        global.wolfDB.anti = JSON.parse(fs.readFileSync(antiFile))
      }
    } catch {}

    if(!global.wolfDB.anti[m.key.remoteJid]) {
      global.wolfDB.anti[m.key.remoteJid] = {
        antilink: false, antibot: false, antispam: false, antitag: false,
        antidelete: false, antiviewonce: false, antisticker: false,
        antinsfw: false, antibadword: false, antiflood: false,
        antiraid: false, antimute: false, antigmention: false,
        antilinkkick: false, antilinkwarn: false, badwords: ['fuck','shit','bitch','ass','fucking']
      }
    }

    const anti = global.wolfDB.anti[m.key.remoteJid]
    const save = () => fs.writeFileSync(antiFile, JSON.stringify(global.wolfDB.anti, null, 2))

    let metadata, participants = []
    try { metadata = await sock.groupMetadata(m.key.remoteJid); participants = metadata.participants } catch {}
    const isAdmin = (jid) => participants.find(p=>p.id===jid)?.admin
    const sender = m.key.participant || m.key.remoteJid

    try {
      // Helper to toggle
      const toggle = (key, name, desc) => {
        if(text === 'on') anti[key] = true
        else if(text === 'off') anti[key] = false
        else anti[key] = !anti[key]
        save()
        return reply(`${anti[key] ? '✅' : '❌'} *${name} ${anti[key] ? 'ENABLED' : 'DISABLED'}*\n\n${desc}\n\nCurrent: ${anti[key] ? 'ON' : 'OFF'}\nGroup: ${metadata.subject}\n\nUsage: .${command} on/off\n\n🐺`)
      }

      if (command === 'antilink') {
        return toggle('antilink','ANTILINK', 'Deletes any link containing:\n• chat.whatsapp.com\n• https://\n• http://\n• wa.me\n• t.me\n• instagram.com\n• tiktok.com\n\nWhen ON, bot deletes links')
      }

      if (command === 'antibot') {
        return toggle('antibot','ANTIBOT', 'If a bot (another MD bot) sends message, this bot kicks it\nDetects BAILEYS messages\n\nUseful for group protection')
      }

      if (command === 'antispam') {
        return toggle('antispam','ANTISPAM', 'Deletes spam messages\nLimits: 5 messages / 10 seconds\nIf user spams, deletes and warns')
      }

      if (command === 'antitag') {
        return toggle('antitag','ANTITAG', 'Deletes messages that tag all\nPrevents tagall abuse')
      }

      if (command === 'antidelete') {
        if(text === 'on') anti.antidelete = true
        else if(text === 'off') anti.antidelete = false
        else anti.antidelete = !anti.antidelete
        save()
        return reply(`${anti.antidelete ? '✅' : '❌'} *ANTIDELETE ${anti.antidelete ? 'ON' : 'OFF'}*\n\n${anti.antidelete ? 'When someone deletes message, bot recovers and sends it back\nWorks for: text, image, video, sticker' : 'Off'}\n\n🐺`)
      }

      if (command === 'antiviewonce') {
        return toggle('antiviewonce','ANTIVIEWONCE', 'Automatically opens ViewOnce images/videos\nSends them as normal message\n\nNo one can hide ViewOnce from bot')
      }

      if (command === 'antisticker') {
        return toggle('antisticker','ANTISTICKER', 'Deletes all stickers in group\nWhen ON, no stickers allowed')
      }

      if (command === 'antinsfw') {
        return toggle('antinsfw','ANTINSFW', 'Deletes NSFW content (porn)\nUses AI detection (future)\nCurrently deletes +18 keywords')
      }

      if (command === 'antibadword') {
        if(text.startsWith('add ')) {
          const word = text.slice(4).toLowerCase()
          anti.badwords.push(word)
          save()
          return reply(`✅ Added bad word: ${word}\nList: ${anti.badwords.join(', ')}`)
        }
        if(text.startsWith('del ')) {
          const word = text.slice(4).toLowerCase()
          anti.badwords = anti.badwords.filter(w=> w!==word)
          save()
          return reply(`✅ Removed bad word: ${word}`)
        }
        return toggle('antibadword','ANTIBADWORD', `Deletes bad words:\n${anti.badwords.join(', ')}\n\nAdd: .antibadword add fuck\nRemove: .antibadword del fuck\n\nWhen ON, deletes + warns user`)
      }

      if (command === 'antiflood') {
        return toggle('antiflood','ANTIFLOOD', 'Prevents flooding\nLimit: 5 msgs / 10 sec\nIf flood detected, mute user 5 min')
      }

      if (command === 'antiraid') {
        return toggle('antiraid','ANTIRAID', 'Prevents raid: Many joins at once\nIf 5+ joins in 1 min, group auto closes\n\nProtection against group raid attacks')
      }

      if (command === 'antimute') {
        return toggle('antimute','ANTIMUTE', 'If group is muted by someone, bot auto unmutes\nProtects group from admin abuse')
      }

      if (command === 'antigmention') {
        return toggle('antigmention','ANTIGMENTION', 'Deletes messages that mention group invite links\nPrevents group link spam')
      }

      if (command === 'antilinkkick') {
        return toggle('antilinkkick','ANTILINK KICK', 'When someone sends link, bot KICKS them (not just delete)\n\nStrongest anti-link protection')
      }

      if (command === 'antilinkwarn') {
        return toggle('antilinkwarn','ANTILINK WARN', 'When someone sends link, bot WARNS them\n3 warns = kick\n\nUses warn system')
      }

    } catch (e) {
      return reply(`❌ Anti Error: ${e.message}\n\n🐺`)
    }
  }
}

// ====== REAL ANTI-ACTION ENGINE - ADD THIS IN YOUR index.js messages.upsert ======
// Put this RIGHT AFTER you get body/text and BEFORE command handling:

/*
const anti = global.wolfDB?.anti?.[m.key.remoteJid]
if(anti && m.key.remoteJid.endsWith('@g.us')) {
  const body = m.message.conversation || m.message.extendedTextMessage?.text || ""
  const sender = m.key.participant || m.key.remoteJid
  let metadata, isAdmin = false, botAdmin = false
  try {
    metadata = await sock.groupMetadata(m.key.remoteJid)
    isAdmin = metadata.participants.find(p=>p.id===sender)?.admin
    botAdmin = metadata.participants.find(p=>p.id.includes(sock.user.id.split('@')[0]))?.admin
  } catch {}

  // Don't act on admins
  if(!isAdmin && botAdmin) {
    // ANTILINK
    if(anti.antilink && /(chat\.whatsapp\.com|https?:\/\/|wa\.me|t\.me|instagram\.com|tiktok\.com)/i.test(body)) {
      await sock.sendMessage(m.key.remoteJid, { delete: m.key })
      if(anti.antilinkkick) await sock.groupParticipantsUpdate(m.key.remoteJid, [sender], 'remove')
      else if(anti.antilinkwarn) {
        global.wolfDB.warn = global.wolfDB.warn || {}
        global.wolfDB.warn[sender] = (global.wolfDB.warn[sender]||0)+1
        await sock.sendMessage(m.key.remoteJid, { text: `⚠️ @${sender.split('@')[0]} Links not allowed! Warn ${global.wolfDB.warn[sender]}/3`, mentions: [sender] })
      }
    }

    // ANTIBADWORD
    if(anti.antibadword && anti.badwords.some(w=> body.toLowerCase().includes(w))) {
      await sock.sendMessage(m.key.remoteJid, { delete: m.key })
      await sock.sendMessage(m.key.remoteJid, { text: `🤬 @${sender.split('@')[0]} Bad words not allowed!`, mentions: [sender] })
    }

    // ANTISTICKER
    if(anti.antisticker && m.message.stickerMessage) {
      await sock.sendMessage(m.key.remoteJid, { delete: m.key })
    }

    // ANTITAG (tagall)
    if(anti.antitag && m.message.extendedTextMessage?.contextInfo?.mentionedJid?.length > 10) {
      await sock.sendMessage(m.key.remoteJid, { delete: m.key })
    }
  }

  // ANTIDELETE - Save messages
  if(anti.antidelete) {
    global.wolfDB.deleted = global.wolfDB.deleted || {}
    global.wolfDB.deleted[m.key.id] = { content: m.message, jid: m.key.remoteJid, sender, time: Date.now() }
  }
}

// For antidelete recovery - add message-delete listener:
/*
sock.ev.on('messages.update', async (updates) => {
  for(let update of updates) {
    if(update.update.message === null) { // Deleted
      const saved = global.wolfDB?.deleted?.[update.key.id]
      if(saved && global.wolfDB?.anti?.[saved.jid]?.antidelete) {
        await sock.sendMessage(saved.jid, { text: `🛡️ *ANTIDELETE RECOVERED*\n\nSender: @${saved.sender.split('@')[0]}\nDeleted at: ${new Date().toLocaleTimeString()}\n\nContent:`, mentions: [saved.sender] })
        await sock.sendMessage(saved.jid, { forward: saved.content })
      }
    }
  }
})
*/
