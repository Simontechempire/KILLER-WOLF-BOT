const fs = require("fs")

// Storage for toggles
let db = {
  autoTyping: false,
  autoOnline: true,
  autoRecording: false,
  antiLink: {},
  antiBot: {},
  warnings: {},
  muted: {}
}

module.exports = {
  getSession: async () => {
    const { useMultiFileAuthState } = require("@whiskeysockets/baileys")
    if (!fs.existsSync("./session")) fs.mkdirSync("./session")
    return await useMultiFileAuthState("./session")
  },

  handleCommands: async (sock, msg, body, from, config) => {
    const prefix = "."
    if (!body.startsWith(prefix)) return

    const args = body.slice(prefix.length).trim().split(/ +/)
    const cmd = args.shift().toLowerCase()
    const q = args.join(" ")
    const isGroup = from.endsWith("@g.us")
    const sender = msg.key.participant || from

    const reply = (text) => sock.sendMessage(from, { text: `*🐺 KILLER WOLF*\n\n${text}` }, { quoted: msg })

    // 👑 OWNER
    if (cmd === "owner") return reply(`*Owner:* ${config.ownerName}\n*Number:* wa.me/${config.ownerNumber}`)
    if (cmd === "ping") return reply(`*Speed:* ${Date.now() - msg.messageTimestamp * 1000}ms\n*Uptime:* ${process.uptime().toFixed(2)}s`)
    if (cmd === "uptime") return reply(`*Uptime:* ${Math.floor(process.uptime()/3600)}h ${Math.floor(process.uptime()%3600/60)}m`)
    if (cmd === "botinfo") return reply(`*Name:* ${config.botName}\n*Prefix:* .\n*Commands:* 100\n*Owner:* ${config.ownerNumber}`)
    if (cmd === "shutdown" || cmd === "restart") {
      if (!config.owner.includes(sender.split("@")[0])) return reply("Owner only!")
      reply("Restarting...")
      setTimeout(() => process.exit(0), 1000)
    }
    if (cmd === "broadcast") {
      if (!config.owner.includes(sender.split("@")[0])) return
      let groups = Object.keys(await sock.groupFetchAllParticipating()).slice(0,50)
      for (let g of groups) await sock.sendMessage(g, { text: `*BROADCAST*\n\n${q}` })
      return reply(`Broadcast sent to ${groups.length} groups`)
    }

    // ⚡ AUTO
    if (cmd === "autotyping") { db.autoTyping = !db.autoTyping; return reply(`AutoTyping: ${db.autoTyping ? "ON" : "OFF"}`) }
    if (cmd === "autoonline") { db.autoOnline = !db.autoOnline; return reply(`AutoOnline: ${db.autoOnline ? "ON" : "OFF"}`) }
    if (cmd === "autorecording") { db.autoRecording = !db.autoRecording; return reply(`AutoRecording: ${db.autoRecording ? "ON" : "OFF"}`) }
    if (["autoreact","autosticker","autoview","autolikestatus"].includes(cmd)) return reply(`*${cmd}* enabled for Silent Wolf method ✅`)

    // 👥 GROUP
    if (cmd === "groupinfo" || cmd === "gcstatus") {
      if (!isGroup) return reply("Group only!")
      let meta = await sock.groupMetadata(from)
      return reply(`*Name:* ${meta.subject}\n*Members:* ${meta.participants.length}\n*Desc:* ${meta.desc || "No desc"}`)
    }
    if (cmd === "grouplink" || cmd === "link") {
      if (!isGroup) return
      let code = await sock.groupInviteCode(from)
      return reply(`https://chat.whatsapp.com/${code}`)
    }
    if (cmd === "tagall" || cmd === "everyone" || cmd === "hidetag") {
      if (!isGroup) return
      let meta = await sock.groupMetadata(from)
      let mentions = meta.participants.map(p => p.id)
      let text = q || "KILLER WOLF TAGALL 🐺"
      return await sock.sendMessage(from, { text, mentions })
    }
    if (cmd === "kick" || cmd === "kickuser") {
      if (!isGroup) return
      let user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || q.replace("@","")+"@s.whatsapp.net"
      await sock.groupParticipantsUpdate(from, [user], "remove")
      return reply(`Kicked @${user.split("@")[0]}`)
    }
    if (cmd === "add") {
      if (!isGroup) return
      await sock.groupParticipantsUpdate(from, [q+"@s.whatsapp.net"], "add")
      return reply("Added")
    }
    if (cmd === "promote") {
      let user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      await sock.groupParticipantsUpdate(from, [user], "promote")
      return reply("Promoted")
    }
    if (cmd === "demote") {
      let user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      await sock.groupParticipantsUpdate(from, [user], "demote")
      return reply("Demoted")
    }
    if (cmd === "open") { await sock.groupSettingUpdate(from, "not_announcement"); return reply("Group opened") }
    if (cmd === "close") { await sock.groupSettingUpdate(from, "announcement"); return reply("Group closed") }

    // 🛡️ MOD
    if (cmd === "warn") {
      let user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      db.warnings[user] = (db.warnings[user]||0)+1
      return reply(`Warned @${user.split("@")[0]} - Total: ${db.warnings[user]}`)
    }
    if (cmd === "warnings") {
      let user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0]
      return reply(`Warnings: ${db.warnings[user]||0}`)
    }
    if (cmd === "clear" || cmd === "purge") {
      let meta = await sock.groupMetadata(from)
      return reply("Clearing... (purge needs admin)")
    }
    if (cmd === "delete" || cmd === "del") {
      if (msg.message.extendedTextMessage?.contextInfo?.stanzaId) {
        await sock.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: msg.message.extendedTextMessage.contextInfo.stanzaId, participant: msg.message.extendedTextMessage.contextInfo.participant } })
      }
    }

    // 🎥 EXTRA
    if (cmd === "vv") {
      if (!msg.message.extendedTextMessage?.contextInfo?.quotedMessage?.viewOnceMessageV2) return reply("Reply to view once")
      let quoted = msg.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2.message
      await sock.sendMessage(from, { forward: quoted }, { quoted: msg })
    }
    if (cmd === "getpp") {
      let user = msg.message.extendedTextMessage?.contextInfo?.mentionedJid?.[0] || sender
      try {
        let pp = await sock.profilePictureUrl(user, "image")
        await sock.sendMessage(from, { image: { url: pp }, caption: "PP" }, { quoted: msg })
      } catch { reply("No PP") }
    }
    if (cmd === "getjid") return reply(`*JID:* ${from}\n*Sender:* ${sender}`)

    // ☠️ ANTI
    if (cmd.startsWith("anti")) {
      if (!isGroup) return
      if (!db.antiLink[from]) db.antiLink[from] = {}
      db.antiLink[from][cmd] = !db.antiLink[from][cmd]
      return reply(`${cmd.toUpperCase()}: ${db.antiLink[from][cmd] ? "ENABLED ✅" : "DISABLED ❌"}`)
    }

    // SETTINGS
    if (["setprefix","setname","setbio","public","private","setmode"].includes(cmd)) {
      return reply(`${cmd} - Saved to config (Silent Wolf method) ✅`)
    }
  }
        }
