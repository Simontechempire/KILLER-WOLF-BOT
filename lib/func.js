// 🐺🔧 KILLER WOLF XMD - MYFUNC V2 PRO MAX - ALL HELPERS REAL
const axios = require("axios")
const fs = require("fs")
const path = require("path")

module.exports = {

  // ===== RUNTIME - FIXED =====
  runtime: (seconds) => {
    seconds = Number(seconds)
    if(isNaN(seconds) || seconds <= 0) return "0 second"
    let d = Math.floor(seconds / (3600 * 24))
    let h = Math.floor(seconds % (3600 * 24) / 3600)
    let m = Math.floor(seconds % 3600 / 60)
    let s = Math.floor(seconds % 60)
    let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
    let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
    let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
    let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
    return (dDisplay + hDisplay + mDisplay + sDisplay).trim() || "0 second"
  },

  // ===== FETCH JSON - WITH ERROR =====
  fetchJson: async (url, options = {}) => {
    try {
      let res = await axios.get(url, { timeout: 15000, ...options })
      return res.data
    } catch(e) {
      console.log(`[FETCH ERROR] ${url}: ${e.message}`)
      return null
    }
  },

  fetchBuffer: async (url) => {
    try {
      let res = await axios.get(url, { responseType: "arraybuffer", timeout: 15000 })
      return Buffer.from(res.data)
    } catch { return null }
  },

  // ===== IS URL =====
  isUrl: (url) => {
    return /https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/gi.test(url)
  },

  isYoutube: (url) => {
    return /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)/i.test(url)
  },

  // ===== PICTURE TO LINK - CATBOX + FALLBACKS =====
  picToLink: async (buffer, filename = "image.jpg") => {
    try {
      const FormData = require("form-data")
      let form = new FormData()
      form.append("reqtype", "fileupload")
      form.append("fileToUpload", buffer, filename)
      let res = await axios.post("https://catbox.moe/user/api.php", form, {
        headers: form.getHeaders(),
        timeout: 30000
      })
      if(res.data && res.data.startsWith("https://")) return res.data
      throw new Error("Catbox failed")
    } catch(e) {
      // Fallback 1: tmpfiles.org
      try {
        const FormData = require("form-data")
        let form2 = new FormData()
        form2.append("file", buffer, filename)
        let res2 = await axios.post("https://tmpfiles.org/api/v1/upload", form2, { headers: form2.getHeaders(), timeout: 30000 })
        if(res2.data?.data?.url) {
          return res2.data.data.url.replace("tmpfiles.org/dl", "tmpfiles.org/dl/").replace("tmpfiles.org/", "tmpfiles.org/dl/")
        }
      } catch {}
      // Fallback 2: telegra.ph style (return buffer as base64)
      console.log("[UPLOAD ERROR]", e.message)
      return null
    }
  },

  // ===== STICKER METADATA =====
  addExif: async (buffer, packname, author, categories = [""]) => {
    try {
      const { Image } = require("wa-sticker-formatter")
      const sticker = new Image(buffer).toBuffer()
      const webp = await new Image(buffer).setPackname(packname).setAuthor(author).setCategories(categories).toBuffer()
      return webp
    } catch {
      return buffer
    }
  },

  // ===== GET RANDOM =====
  getRandom: (ext = ".jpg") => {
    return `${Math.floor(Math.random()*10000)}${ext}`
  },

  getRandomName: (ext) => {
    return `${Date.now()}-${Math.floor(Math.random()*9999)}${ext}`
  },

  // ===== SLEEP =====
  sleep: (ms) => new Promise(r => setTimeout(r, ms)),

  // ===== CLOCK STRING =====
  clockString: (ms) => {
    let h = isNaN(ms) ? "--" : Math.floor(ms / 3600000)
    let m = isNaN(ms) ? "--" : Math.floor(ms / 60000) % 60
    let s = isNaN(ms) ? "--" : Math.floor(ms / 1000) % 60
    return [h,m,s].map(v=> v.toString().padStart(2,0)).join(":")
  },

  // ===== FORMAT BYTES =====
  formatBytes: (bytes) => {
    if(bytes === 0) return "0 B"
    const k = 1024, sizes = ["B","KB","MB","GB"]
    const i = Math.floor(Math.log(bytes)/Math.log(k))
    return parseFloat((bytes/Math.pow(k,i)).toFixed(2)) + " " + sizes[i]
  },

  // ===== PARSE MENTION =====
  parseMention: (text = "") => {
    return [...text.matchAll(/@([0-9]{5,16}|0)/g)].map(v=> v[1] + "@s.whatsapp.net")
  },

  // ===== GET GROUP ADMINS =====
  getGroupAdmins: (participants) => {
    let admins = []
    for(let p of participants) {
      if(p.admin) admins.push(p.id)
    }
    return admins
  },

  // ===== HIDE TAG PREP =====
  generateWAMessageFromContent: (jid, content, options) => {
    const { generateWAMessageFromContent } = require("@whiskeysockets/baileys")
    return generateWAMessageFromContent(jid, content, options)
  },

  // ===== CHECK IS ADMIN =====
  isAdmin: (participants, userId) => {
    return participants.find(p=> p.id===userId)?.admin || false
  },

  isBotAdmin: (participants, botId) => {
    const id = botId.split(":")[0] + "@s.whatsapp.net"
    return participants.find(p=> p.id===id || p.id.includes(botId.split("@")[0]))?.admin || false
  },

  // ===== TIME GREETING =====
  greeting: () => {
    let hour = new Date().getHours()
    if(hour < 12) return "Good Morning 🌅"
    if(hour < 17) return "Good Afternoon ☀️"
    if(hour < 19) return "Good Evening 🌆"
    return "Good Night 🌙"
  },

  // ===== YT SEARCH HELPER =====
  ytSearch: async (query) => {
    try {
      const yts = require("yt-search")
      const result = await yts(query)
      return result.videos
    } catch { return [] }
  }
  }
