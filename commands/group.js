// 🐺👥 KILLER WOLF BOT - GROUP FILE V2 PRO MAX - 50 CMDS REAL
module.exports = {
  command: ['kick','add','promote','demote','tagall','hidetag','admins','groupinfo','mute','unmute','open','close','revoke','newlink','resetlink','invite','join','leave','setname','setdesc','setsubject','setgrouppic','getgrouppic','groupname','groupdesc','membercount','members','listonline','listadmin','listmember','everyone','tagadmin','tagmember','kickall','promoteall','demoteall','group','antidelete','welcome','goodbye','setwelcome','setgoodbye','delwelcome','delgoodbye','approve','reject','requests','poll','vote','gstatus','grouplink'],

  execute: async (sock, m, { command, text, reply }) => {
    const isGroup = m.key.remoteJid.endsWith('@g.us')
    if (!isGroup) return reply(`👥 This command is for groups only!\n\n🐺`)

    let metadata
    try { metadata = await sock.groupMetadata(m.key.remoteJid) } catch { metadata = { participants: [], subject: 'Unknown', desc: '' } }
    const participants = metadata.participants || []
    const isAdmin = (jid) => participants.find(p => p.id === jid)?.admin
    const sender = m.key.participant || m.key.remoteJid
    const senderAdmin = isAdmin(sender)
    const botId = sock.user.id.split(':')[0] + '@s.whatsapp.net'
    const botAdmin = isAdmin(botId) || participants.find(p => p.id.includes(sock.user.id.split('@')[0]))?.admin

    global.wolfDB = global.wolfDB || { welcome: {}, goodbye: {}, antidelete: {} }

    try {
      // ========== KICK ==========
      if (command === 'kick') {
        if(!botAdmin) return reply(`❌ Bot not admin!`)
        if(!senderAdmin) return reply(`❌ Admin only!`)
        const mentioned = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        const target = mentioned || (text ? text.replace(/[^0-9]/g,'') + '@s.whatsapp.net' : null)
        if (!target) return reply(`Usage: .kick @user`)
        await sock.groupParticipantsUpdate(m.key.remoteJid, [target], 'remove')
        return reply(`✅ Kicked @${target.split('@')[0]}`, { mentions: [target] })
      }

      if (command === 'add') {
        if(!botAdmin) return reply(`❌ Bot not admin`)
        if (!text) return reply(`Usage: .add 234xxx`)
        const user = text.replace(/[^0-9]/g,'') + '@s.whatsapp.net'
        await sock.groupParticipantsUpdate(m.key.remoteJid, [user], 'add')
        return reply(`✅ Added ${text}`)
      }

      if (command === 'promote') {
        const user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if (!user) return reply(`Tag user: .promote @user`)
        await sock.groupParticipantsUpdate(m.key.remoteJid, [user], 'promote')
        return reply(`✅ Promoted @${user.split('@')[0]} to admin`, { mentions: [user] })
      }

      if (command === 'demote') {
        const user = m.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
        if (!user) return reply(`Tag user: .demote @user`)
        await sock.groupParticipantsUpdate(m.key.remoteJid, [user], 'demote')
        return reply(`✅ Demoted @${user.split('@')[0]}`, { mentions: [user] })
      }

      // ========== TAGALL ==========
      if (command === 'tagall' || command === 'everyone') {
        let txt = `📢 *${metadata.subject || 'GROUP'} TAGALL*\n\n`
        if(text) txt += `${text}\n\n`
        txt += `👥 Members: ${participants.length}\n\n`
        participants.forEach((p,i)=> txt += `${i+1}. @${p.id.split('@')[0]}\n`)
        await sock.sendMessage(m.key.remoteJid, { text: txt, mentions: participants.map(p=>p.id) }, { quoted: m })
        return
      }

      if (command === 'hidetag') {
        const msg = text || '🐺 KILLER WOLF - HIDETAG'
        await sock.sendMessage(m.key.remoteJid, { text: msg, mentions: participants.map(p=>p.id) }, { quoted: m })
        return
      }

      if (command === 'admins' || command === 'listadmin') {
        const admins = participants.filter(p=>p.admin)
        let txt = `👑 *ADMINS - ${metadata.subject}*\n\nTotal: ${admins.length}\n\n`
        admins.forEach((a,i)=> txt += `${i+1}. @${a.id.split('@')[0]} - ${a.admin}\n`)
        await sock.sendMessage(m.key.remoteJid, { text: txt, mentions: admins.map(a=>a.id) }, { quoted: m })
        return
      }

      // ========== INFO ==========
      if (command === 'groupinfo') {
        return reply(`👥 *GROUP INFO - PRO*\n\nName: ${metadata.subject}\nID: ${metadata.id}\nOwner: ${metadata.owner ? '@'+metadata.owner.split('@')[0] : 'Unknown'}\nMembers: ${participants.length}\nAdmins: ${participants.filter(p=>p.admin).length}\nCreated: ${new Date(metadata.creation*1000).toLocaleString()}\nAnnounce: ${metadata.announce ? 'Closed' : 'Open'}\nLocked: ${metadata.restrict ? 'Locked' : 'Unlocked'}\nDesc: ${metadata.desc || 'None'}\n\n🐺`)
      }

      if (command === 'groupname' || command === 'groupname') {
        if(command === 'groupname' && !text) return reply(`📛 Name: ${metadata.subject}\n\nUsage: .groupname New Name`)
        // If command is groupname with text, set it (handled below)
      }

      if (command === 'membercount' || command === 'members' || command === 'listmember' || command === 'listonline' || command === 'listadmin') {
        if(command === 'membercount' || command === 'members') return reply(`👥 Members: ${participants.length}`)
        if(command === 'listmember') {
          let txt = `👥 *ALL MEMBERS - ${metadata.subject}*\n\n`
          participants.forEach((p,i)=> txt += `${i+1}. @${p.id.split('@')[0]} ${p.admin ? '(ADMIN)' : ''}\n`)
          await sock.sendMessage(m.key.remoteJid, { text: txt, mentions: participants.map(p=>p.id) }, { quoted: m })
          return
        }
        if(command === 'listonline') {
          let online = participants.slice(0,10)
          return reply(`🟢 *ONLINE (Sample)*\n\n${online.map(p=>`@${p.id.split('@')[0]}`).join('\n')}\n\nTotal: ${participants.length}`, { mentions: online.map(p=>p.id) })
        }
      }

      // ========== MUTE/OPEN ==========
      if (command === 'mute' || command === 'close' || command === 'group') {
        if(!botAdmin) return reply(`❌ Bot not admin`)
        await sock.groupSettingUpdate(m.key.remoteJid, 'announcement')
        return reply(`🔒 Group closed - Only admins can send messages`)
      }
      if (command === 'unmute' || command === 'open') {
        if(!botAdmin) return reply(`❌ Bot not admin`)
        await sock.groupSettingUpdate(m.key.remoteJid, 'not_announcement')
        return reply(`🔓 Group opened - All members can send messages`)
      }

      // ========== LINKS ==========
      if (['revoke','newlink','resetlink','invite','grouplink'].includes(command)) {
        if(!botAdmin) return reply(`❌ Bot not admin`)
        await sock.groupRevokeInvite(m.key.remoteJid)
        const code = await sock.groupInviteCode(m.key.remoteJid)
        return reply(`🔗 *NEW GROUP LINK*\n\nhttps://chat.whatsapp.com/${code}\n\n🐺 KILLER WOLF XMD`)
      }

      if (command === 'join') {
        if (!text.includes('chat.whatsapp.com')) return reply(`Usage: .join <group link>`)
        const code = text.split('chat.whatsapp.com/')[1]
        await sock.groupAcceptInvite(code)
        return reply(`✅ Joined group!`)
      }

      if (command === 'leave') {
        await sock.groupLeave(m.key.remoteJid)
        return
      }

      // ========== SETNAME/DESC/DP ==========
      if (command === 'setname' || command === 'setsubject' || command === 'groupname') {
        if (!text && command !== 'groupname') return reply(`Usage: .${command} <new name>`)
        if(text) {
          await sock.groupUpdateSubject(m.key.remoteJid, text)
          return reply(`✅ Group name changed to: ${text}`)
        }
      }

      if (command === 'setdesc' || command === 'groupdesc') {
        if(!text && command === 'groupdesc') return reply(`📝 Desc: ${metadata.desc || 'None'}`)
        if (!text) return reply(`Usage: .setdesc <new description>`)
        await sock.groupUpdateDescription(m.key.remoteJid, text)
        return reply(`✅ Description updated!`)
      }

      if (command === 'setgrouppic' || command === 'groupdp') {
        if(command === 'groupdp' && !m.message.imageMessage && !m.message.extendedTextMessage?.contextInfo?.quotedMessage) {
          try {
            const url = await sock.profilePictureUrl(m.key.remoteJid, 'image')
            await sock.sendMessage(m.key.remoteJid, { image: { url }, caption: `🖼️ Group DP - ${metadata.subject}` }, { quoted: m })
            return
          } catch { return reply(`❌ No group DP`) }
        }
        const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage
        const buf = await sock.downloadMediaMessage(quoted ? { message: quoted } : m).catch(()=>null)
        if (!buf) return reply(`Reply image with .setgrouppic`)
        await sock.updateProfilePicture(m.key.remoteJid, buf)
        return reply(`✅ Group DP updated! 🐺`)
      }

      if (command === 'getgrouppic') {
        try {
          const url = await sock.profilePictureUrl(m.key.remoteJid, 'image')
          await sock.sendMessage(m.key.remoteJid, { image: { url }, caption: `🖼️ Group DP` }, { quoted: m })
        } catch { reply(`❌ No group DP`) }
        return
      }

      // ========== TAGADMIN ==========
      if (command === 'tagadmin') {
        const admins = participants.filter(p=>p.admin)
        await sock.sendMessage(m.key.remoteJid, { text: `👑 Tag Admins: ${text}\n\n${admins.map(a=>`@${a.id.split('@')[0]}`).join(' ')}`, mentions: admins.map(a=>a.id) }, { quoted: m })
        return
      }
      if (command === 'tagmember') {
        await sock.sendMessage(m.key.remoteJid, { text: `👥 ${text}`, mentions: participants.map(p=>p.id) }, { quoted: m })
        return
      }

      // ========== KICKALL PROMOTEALL ==========
      if (command === 'kickall') {
        if (!text.includes('CONFIRM')) return reply(`⚠️ DANGER! Type .kickall CONFIRM to kick all members`)
        for (let p of participants) {
          if (!p.admin) await sock.groupParticipantsUpdate(m.key.remoteJid, [p.id], 'remove').catch(()=>{})
        }
        return reply(`✅ All non-admins kicked`)
      }
      if (command === 'promoteall') {
        for (let p of participants) await sock.groupParticipantsUpdate(m.key.remoteJid, [p.id], 'promote').catch(()=>{})
        return reply(`✅ All promoted`)
      }
      if (command === 'demoteall') {
        for (let p of participants.filter(p=>p.admin && !p.id.includes(sock.user.id))) await sock.groupParticipantsUpdate(m.key.remoteJid, [p.id], 'demote').catch(()=>{})
        return reply(`✅ All demoted`)
      }

      // ========== WELCOME/GOODBYE ==========
      if (['welcome','goodbye','setwelcome','setgoodbye','delwelcome','delgoodbye','antidelete'].includes(command)) {
        if (command === 'setwelcome') {
          if (!text) return reply(`Usage: .setwelcome Hi @user welcome to @group`)
          global.wolfDB.welcome[m.key.remoteJid] = text
          return reply(`✅ Welcome set: ${text}`)
        }
        if (command === 'setgoodbye') {
          global.wolfDB.goodbye[m.key.remoteJid] = text
          return reply(`✅ Goodbye set: ${text}`)
        }
        if (command === 'delwelcome') { delete global.wolfDB.welcome[m.key.remoteJid]; return reply(`✅ Welcome deleted`) }
        if (command === 'delgoodbye') { delete global.wolfDB.goodbye[m.key.remoteJid]; return reply(`✅ Goodbye deleted`) }
        if (command === 'welcome') return reply(`Welcome: ${global.wolfDB.welcome[m.key.remoteJid] || 'Not set'}\nUsage: .setwelcome hi @user welcome`)
        if (command === 'goodbye') return reply(`Goodbye: ${global.wolfDB.goodbye[m.key.remoteJid] || 'Not set'}`)
        if (command === 'antidelete') {
          global.wolfDB.antidelete[m.key.remoteJid] = text === 'on' || !global.wolfDB.antidelete[m.key.remoteJid]
          return reply(`🛡️ Antidelete ${global.wolfDB.antidelete[m.key.remoteJid] ? 'ON' : 'OFF'}`)
        }
      }

      // ========== REQUESTS ==========
      if (['approve','reject','requests'].includes(command)) {
        if (command === 'requests') {
          const reqs = await sock.groupRequestParticipantsList(m.key.remoteJid).catch(()=>[])
          return reply(`📩 Pending: ${reqs.length}\n\n${reqs.map(r=>r.jid).join('\n') || 'None'}`)
        }
        if (command === 'approve') {
          const reqs = await sock.groupRequestParticipantsList(m.key.remoteJid)
          for (let r of reqs) await sock.groupRequestParticipantsUpdate(m.key.remoteJid, [r.jid], 'approve')
          return reply(`✅ Approved ${reqs.length}`)
        }
        if (command === 'reject') {
          const reqs = await sock.groupRequestParticipantsList(m.key.remoteJid)
          for (let r of reqs) await sock.groupRequestParticipantsUpdate(m.key.remoteJid, [r.jid], 'reject')
          return reply(`❌ Rejected ${reqs.length}`)
        }
      }

      // ========== POLL ==========
      if (command === 'poll') {
        if (!text.includes('|')) return reply(`Usage: .poll Question | Option1 | Option2`)
        const [q, ...opts] = text.split('|').map(s=>s.trim())
        await sock.sendMessage(m.key.remoteJid, { poll: { name: q, values: opts, selectableCount: 1 } }, { quoted: m })
        return
      }
      if (command === 'gstatus') {
        return reply(`✅ Group Status - ${metadata.subject}\nMembers: ${participants.length}\nAdmins: ${participants.filter(p=>p.admin).length}\n\n🐺`)
      }

    } catch (e) {
      reply(`❌ Group Error: ${e.message}\nBot needs admin! 🐺`)
    }
  }
      }
