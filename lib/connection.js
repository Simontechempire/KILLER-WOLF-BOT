// 🐺🔌 KILLER WOLF XMD - CONNECTION.JS V2 PRO MAX - ALL HELPERS
const { jidDecode, downloadMediaMessage } = require("@whiskeysockets/baileys")
const fs = require("fs")
const path = require("path")

module.exports = {
  // ===== DECODE JID - FIXED =====
  decodeJid: (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jidDecode(jid) || {}
      return decode.user && decode.server ? decode.user + "@" + decode.server : jid
    } else return jid
  },

  // ===== GET GROUP ADMINS - FIXED =====
  getGroupAdmins: (participants) => {
    let admins = []
    for (let i of participants) {
      if (i.admin === "admin" || i.admin === "superadmin" || i.admin === true) admins.push(i.id)
    }
    return admins
  },

  // ===== CHECK ADMIN =====
  isAdmin: (participants, userId) => {
    if(!participants || !userId) return false
    const clean = userId.split(":")[0] + "@s.whatsapp.net"
    return participants.some(p => (p.id === userId || p.id === clean || p.id.includes(userId.split("@")[0])) && p.admin)
  },

  isBotAdmin: (participants, botId) => {
    if(!participants || !botId) return false
    const botNum = botId.split(":")[0]
    return participants.some(p => p.id.includes(botNum) && p.admin)
  },

  // ===== PARSE MESSAGE TYPE =====
  getMessageType: (message) => {
    if(!message) return ""
    return Object.keys(message)[0]
  },

  getBody: (message) => {
    if(!message) return ""
    let type = Object.keys(message)[0]
    if(type === "conversation") return message.conversation
    if(type === "extendedTextMessage") return message.extendedTextMessage.text
    if(type === "imageMessage") return message.imageMessage.caption || ""
    if(type === "videoMessage") return message.videoMessage.caption || ""
    return ""
  },

  // ===== GET QUOTED =====
  getQuoted: (message) => {
    return message?.extendedTextMessage?.contextInfo?.quotedMessage || null
  },

  getQuotedParticipant: (message) => {
    return message?.extendedTextMessage?.contextInfo?.participant || null
  },

  getQuotedId: (message) => {
    return message?.extendedTextMessage?.contextInfo?.stanzaId || null
  },

  // ===== DOWNLOAD MEDIA - REAL =====
  downloadMedia: async (sock, message, type = "buffer") => {
    try {
      const buffer = await downloadMediaMessage(message, type, {}, { logger: undefined, reuploadRequest: sock.updateMediaMessage })
      return buffer
    } catch(e) {
      console.log("[DOWNLOAD MEDIA ERROR]", e.message)
      return null
    }
  },

  // ===== SAVE FILE =====
  saveFile: (buffer, filename, folder = "./tmp") => {
    try {
      if(!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true })
      const fullPath = path.join(folder, filename)
      fs.writeFileSync(fullPath, buffer)
      return fullPath
    } catch { return null }
  },

  // ===== SEND TEXT WITH MENTIONS =====
  sendWithMentions: async (sock, jid, text, mentions = []) => {
    // Auto extract mentions from text @123...
    const autoMentions = [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v=> v[1] + "@s.whatsapp.net")
    const allMentions = [...new Set([...mentions, ...autoMentions])]
    await sock.sendMessage(jid, { text, mentions: allMentions })
  },

  // ===== GROUP METADATA SAFE =====
  getGroupMetadata: async (sock, jid) => {
    try {
      return await sock.groupMetadata(jid)
    } catch(e) {
      return { id: jid, subject: "Unknown", participants: [], owner: null }
    }
  },

  // ===== PROFILE PIC =====
  getProfilePic: async (sock, jid) => {
    try {
      return await sock.profilePictureUrl(jid, "image")
    } catch {
      return "https://i.ibb.co/ynjDCV9L/killer-wolf.jpg"
    }
  },

  // ===== CONTACT VCard =====
  createVCard: (name, number) => {
    return `BEGIN:VCARD\nVERSION:3.0\nFN:${name}\nTEL;type=CELL;type=VOICE;waid=${number}:${number}\nEND:VCARD`
  }
      }
