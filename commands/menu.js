// MENU.JS - KILLER WOLF XMD V2 PRO MAX - FIXED
module.exports = {
  name: "menu",
  command: ["menu", "help", "list", "commands"],
  category: "general",
  desc: "Show bot menu",
  async execute(sock, msg, ctx) {
    const { from, config, commands, prefix, runtime, moment } = ctx
    const uptime = runtime ? runtime(process.uptime()) : `${Math.floor(process.uptime()/60)}m`
    
    // Group commands by folder/category
    const categories = {}
    for(let [key, cmd] of commands) {
      if(!cmd.name) continue
      let cat = cmd.category || "other"
      if(!categories[cat]) categories[cat] = []
      if(!categories[cat].some(c=> c.name===cmd.name)) categories[cat].push(cmd)
    }

    let menuText = `*🐺 KILLER WOLF XMD V2 PRO MAX*\n`
    menuText += `*By Simon tech inc*\n\n`
    menuText += `╭─ *BOT INFO*\n`
    menuText += `│ *Name:* ${config.botName}\n`
    menuText += `│ *Prefix:* ${prefix} ${config.prefa ? config.prefa.join(" ") : ""}\n`
    menuText += `│ *Owner:* ${config.ownerNumber || config.owner[0]}\n`
    menuText += `│ *Mode:* ${config.mode}\n`
    menuText += `│ *Uptime:* ${uptime}\n`
    menuText += `│ *Time:* ${moment ? moment().tz("Africa/Lagos").format("YYYY-MM-DD HH:mm:ss") : new Date().toLocaleString()}\n`
    menuText += `│ *Commands:* ${[...new Set([...commands.values()].map(c=>c.name))].length} Unique | ${commands.size} Aliases\n`
    menuText += `╰────────────────\n\n`

    for(let cat in categories) {
      menuText += `*╭─ ${cat.toUpperCase()} (${categories[cat].length})*\n`
      for(let c of categories[cat].sort((a,b)=>a.name.localeCompare(b.name))) {
        menuText += `│ *${prefix}${c.name}* ${c.desc ? `- ${c.desc}` : ""}\n`
      }
      menuText += `*╰─*\n\n`
    }

    menuText += `*Powered by KILLER WOLF XMD 🐺*`

    // Try send with image
    try {
      await sock.sendMessage(from, {
        image: { url: config.banner || "https://i.ibb.co/ynjDCV9L/killer-wolf.jpg" },
        caption: menuText
      }, { quoted: msg })
    } catch {
      await sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }
  }
                              }
