// 🐺👑 KILLER WOLF XMD - CONFIG V2 PRO MAX - RENDER + RAILWAY + ENV SUPPORT
const fs = require('fs')

module.exports = {
  // ===== BOT INFO - Auto from ENV =====
  botName: process.env.BOT_NAME || "KILLER WOLF XMD",
  ownerName: process.env.OWNER_NAME || "Simon tech inc",
  ownerNumber: process.env.OWNER_NUMBER || "2349166265317",
  
  // ===== PREFIX - Supports multiple =====
  prefix: process.env.PREFIX || "/",
  prefa: (process.env.PREFIXES ? process.env.PREFIXES.split(",") : ["/", ".", "!", "#", process.env.PREFIX || "/"]).filter((v,i,a)=> a.indexOf(v)===i),

  // ===== BANNER & IMAGES =====
  banner: process.env.BANNER || "https://i.ibb.co/ynjDCV9L/killer-wolf.jpg",
  menuImage: process.env.MENU_IMAGE || "https://i.ibb.co/ynjDCV9L/killer-wolf.jpg",
  ownerImage: process.env.OWNER_IMAGE || "https://i.ibb.co/ynjDCV9L/killer-wolf.jpg",

  // ===== FOOTER & STICKER =====
  footer: process.env.FOOTER || "© Simon tech inc | Killer Wolf XMD",
  packName: process.env.PACKNAME || "Killer Wolf Bot",
  author: process.env.AUTHOR || "Simon tech inc | 100 CMDS",

  // ===== SESSION - RENDER + RAILWAY READY =====
  sessionName: process.env.SESSION_NAME || "session",
  sessionId: process.env.SESSION_ID || "", // For Mega session ID
  authFolder: process.env.AUTH_FOLDER || "./session",
  port: process.env.PORT || 3000,

  // ===== OWNER & MODS =====
  owner: (process.env.OWNERS ? process.env.OWNERS.split(",") : ["2349166265317"]).map(n=> n.replace(/[^0-9]/g,"")),
  mods: (process.env.MODS ? process.env.MODS.split(",") : []).map(n=> n.replace(/[^0-9]/g,"")),
  prems: (process.env.PREMS ? process.env.PREMS.split(",") : []),

  // ===== BOT SETTINGS =====
  mode: process.env.MODE || "public", // public / private / self
  language: process.env.LANGUAGE || "en",
  timezone: process.env.TIMEZONE || "Africa/Lagos",
  menuStyle: process.env.MENU_STYLE || "1", // 1 = box, 2 = list, 3 = simple

  // ===== AUTO SETTINGS =====
  autoRead: process.env.AUTO_READ === "true" ? true : false,
  autoTyping: process.env.AUTO_TYPING === "true" ? true : false,
  autoRecording: process.env.AUTO_RECORDING === "true" ? true : false,
  autoOnline: process.env.AUTO_ONLINE === "true" ? true : true,
  autoReact: process.env.AUTO_REACT === "true" ? true : false,
  autoViewStatus: process.env.AUTO_VIEW_STATUS === "true" ? true : true,
  autoLikeStatus: process.env.AUTO_LIKE_STATUS === "true" ? true : true,

  // ===== ANTI SETTINGS - Default OFF =====
  antiLink: process.env.ANTI_LINK === "true" ? true : false,
  antiBadword: process.env.ANTI_BADWORD === "true" ? true : false,
  antiDelete: process.env.ANTI_DELETE === "true" ? true : false,
  antiBot: process.env.ANTI_BOT === "true" ? true : false,

  // ===== WELCOME/GOODBYE =====
  welcome: process.env.WELCOME === "true" ? true : true,
  goodbye: process.env.GOODBYE === "true" ? true : false,

  // ===== DATABASE =====
  mongoUrl: process.env.MONGO_URL || process.env.MONGODB_URL || "", // For Mongo session save
  database: process.env.DATABASE || "json", // json or mongo

  // ===== API KEYS (for downloader etc) =====
  apiKeys: {
    xteam: process.env.XTEAM_API || "",
    lolhuman: process.env.LOLHUMAN_API || "",
    zenz: process.env.ZENZ_API || "",
  },

  // ===== PAIRING =====
  pairingNumber: process.env.PAIRING_NUMBER || "", // For pair code: 2349166265317
  usePairing: process.env.USE_PAIRING === "true" ? true : false, // true = use pairing code, false = QR

  // ===== LOGGING =====
  cmdLog: process.env.CMD_LOG === "true" ? true : true,

  // ===== VERSION =====
  version: "2.0.0 PRO MAX",
  totalCommands: 100,
}

// ===== AUTO CREATE DATABASE FOLDER =====
try {
  const dbPath = require('path').join(__dirname, "database")
  if(!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true })
} catch {}

// ===== LOG CONFIG ON START =====
console.log(`
╭━───━───━───━───━╮
┃ 🐺 KILLER WOLF CONFIG V2
┃ Bot: ${module.exports.botName}
┃ Owner: ${module.exports.ownerName} - ${module.exports.ownerNumber}
┃ Prefix: ${module.exports.prefa.join(" ")}
┃ Mode: ${module.exports.mode}
┃ Port: ${module.exports.port}
┃ Total Cmds: ${module.exports.totalCommands}
┃ Version: ${module.exports.version}
╰━───━───━───━───━╯
`)
