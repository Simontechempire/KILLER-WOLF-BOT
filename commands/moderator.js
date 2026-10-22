// 🐺🛡️ KILLER WOLF BOT - MODERATOR FILE V2 PRO MAX - 15 CMDS REAL
const fs = require('fs')
const path = require('path')

module.exports = {
  command: ['warn','unwarn','warnings','mute','unmute','kickuser','banuser','unbanuser','clear','delete','del','purge','resetwarn','lock','unlock','modstatus'],

  execute: async (sock, m, { command, text, reply }) => {
    const isGroup = m.key.remoteJid.endsWith('@g.us')
    if(!isGroup) return reply(`Group only 🐺`)
    const dbPath = path.join(__dirname, '../database')
    if(!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true })
    const warnFile = path.join(dbPath, 'warns.json')

    global.wolfDB = global.wolfDB || {}
    global.wolfDB.warns = global.wolfDB.warns || {}
    try { if(fs.existsSync(warnFile)) global.wolfDB.warns = JSON.parse(fs.readFileSync(warnFile)) } catch {}
    const save = () => fs.writeFileSync(warnFile, JSON.stringify(global.wolfDB.warns, null, 2))

    let metadata, participants = []
    try { metadata = await sock.groupMetadata(m.key.remoteJid); participants = metadata.participants } catch {}
    const isAdmin = (jid) => participants.find(p=>p.id===jid)?.admin
    const sender = m.key.participant || m.key.remoteJid
    const senderAdmin = isAdmin(sender)
    const botAdmin = isAdmin(sock.user.id.split(':')[0] + '@s.whatsapp.net') || participants.find(p=>p.id.includes(sock.user.id.split('@')[0]))?.admin

    try {
      // WARN SYSTEM
      if(command === 'warn') {
        if(!senderAdmin) return reply(`❌ Admin only`)
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || (text.replace(/[^0-9]/g,'') + '@s.whatsapp.net' || null)
        if(!target || target === '@s.whatsapp.net') return reply(`Usage: .warn @user reason`)
        const reason = text.split(' ').slice(1).join(' ') || 'No reason'
        if(!global.wolfDB.warns[m.key.remoteJid]) global.wolfDB.warns[m.key.remoteJid] = {}
        if(!global.wolfDB.warns[m.key.remoteJid][target]) global.wolfDB.warns[m.key.remoteJid][target] = { count: 0, reasons: [] }
        global.wolfDB.warns[m.key.remoteJid][target].count++
        global.wolfDB.warns[m.key.remoteJid][target].reasons.push({ reason, date: new Date().toLocaleString() })
        save()
        const count = global.wolfDB.warns[m.key.remoteJid][target].count
        await sock.sendMessage(m.key.remoteJid, { text: `⚠️ *WARNED*\n\nUser: @${target.split('@')[0]}\nReason: ${reason}\nWarns: ${count}/3\n\n${count>=3 ? '🚫 Reached 3 warns - Kicking!' : ''}`, mentions: [target] }, { quoted: m })
        if(count >= 3 && botAdmin) {
          await sock.groupParticipantsUpdate(m.key.remoteJid, [target], 'remove')
          delete global.wolfDB.warns[m.key.remoteJid][target]
          save()
        }
        return
      }

      if(command === 'unwarn' || command === 'resetwarn') {
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if(!target) return reply(`Tag user: .unwarn @user`)
        if(global.wolfDB.warns[m.key.remoteJid]?.[target]) {
          global.wolfDB.warns[m.key.remoteJid][target].count = Math.max(0, global.wolfDB.warns[m.key.remoteJid][target].count -1)
          if(global.wolfDB.warns[m.key.remoteJid][target].count === 0) delete global.wolfDB.warns[m.key.remoteJid][target]
          save()
          return reply(`✅ Unwarned @${target.split('@')[0]}\nRemaining: ${global.wolfDB.warns[m.key.remoteJid][target]?.count || 0}`, { mentions: [target] })
        }
        return reply(`No warns for user`)
      }

      if(command === 'warnings') {
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender
        const w = global.wolfDB.warns[m.key.remoteJid]?.[target]
        if(!w) return reply(`✅ No warnings for @${target.split('@')[0]}`, { mentions: [target] })
        return reply(`⚠️ *WARNINGS FOR @${target.split('@')[0]}*\n\nCount: ${w.count}/3\nReasons:\n${w.reasons.map((r,i)=> `${i+1}. ${r.reason} - ${r.date}`).join('\n')}`, { mentions: [target] })
      }

      if(command === 'mute') {
        if(!botAdmin) return reply(`❌ Bot not admin`)
        await sock.groupSettingUpdate(m.key.remoteJid, 'announcement')
        return reply(`🔒 Group muted - Only admins can send`)
      }
      if(command === 'unmute') {
        await sock.groupSettingUpdate(m.key.remoteJid, 'not_announcement')
        return reply(`🔓 Group unmuted - All can send`)
      }

      if(command === 'kickuser') {
        if(!botAdmin) return reply(`❌ Bot not admin`)
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if(!target) return reply(`Tag: .kickuser @user`)
        await sock.groupParticipantsUpdate(m.key.remoteJid, [target], 'remove')
        return reply(`✅ Kicked @${target.split('@')[0]}`, { mentions: [target] })
      }

      if(command === 'banuser') {
        const target = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || text.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
        global.banned = global.banned || []
        global.banned.push(target)
        return reply(`✅ Banned @${target.split('@')[0]} from bot`, { mentions: [target] })
      }
      if(command === 'unbanuser') {
        const target = text.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
        global.banned = (global.banned||[]).filter(x=> x!==target)
        return reply(`✅ Unbanned ${text}`)
      }

      if(command === 'clear') {
        return reply(`🧹 Clearing chat... (WhatsApp doesn't allow bot to clear for everyone)\n\nUse .purge to delete bot messages`)
      }

      if(command === 'delete' || command === 'del') {
        const quoted = m.message.extendedTextMessage?.contextInfo?.stanzaId
        const participant = m.message.extendedTextMessage?.contextInfo?.participant
        if(!quoted) return reply(`Reply a message with .delete to delete it`)
        await sock.sendMessage(m.key.remoteJid, { delete: { remoteJid: m.key.remoteJid, fromMe: false, id: quoted, participant } })
        return reply(`✅ Deleted`)
      }

      if(command === 'purge') {
        if(!botAdmin) return reply(`❌ Bot not admin`)
        const num = parseInt(text) || 10
        return reply(`🗑️ Purge: Would delete last ${num} bot messages (requires message history implementation)\n\nFor now use .delete to delete one by one\n\n🐺`)
      }

      if(command === 'lock') {
        await sock.groupSettingUpdate(m.key.remoteJid, 'locked')
        return reply(`🔒 Group info locked - Only admins can edit group info`)
      }
      if(command === 'unlock') {
        await sock.groupSettingUpdate(m.key.remoteJid, 'unlocked')
        return reply(`🔓 Group info unlocked - All members can edit`)
      }

      if(command === 'modstatus') {
        const warns = global.wolfDB.warns[m.key.remoteJid] || {}
        return reply(`🛡️ *MOD STATUS - ${metadata.subject}*\n\nTotal warns in group: ${Object.keys(warns).length}\nMuted: ${metadata.announce ? 'Yes' : 'No'}\nLocked: ${metadata.restrict ? 'Yes' : 'No'}\nMembers: ${participants.length}\nAdmins: ${participants.filter(p=>p.admin).length}\n\nWarned users:\n${Object.keys(warns).map(j=> `@${j.split('@')[0]}: ${warns[j].count}`).join('\n') || 'None'}\n\n🐺`, { mentions: Object.keys(warns) })
      }

    } catch(e) { reply(`❌ Mod Error: ${e.message}\nBot needs admin 🐺`) }
  }
  }
