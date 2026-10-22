// 🐺📜 KILLER WOLF BOT - MENU FILE V2 PRO MAX - 100 CMDS LIST

module.exports = {
  command: ['menu','help','allmenu','commands','list','cmd','cmds','killer','wolfmenu','botmenu'],

  execute: async (sock, m, { command, text, reply }) => {
    const from = m.key.remoteJid
    const isGroup = from.endsWith('@g.us')
    const pushname = m.pushName || 'User'
    const botName = global.config?.botName || 'KILLER WOLF XMD'
    const prefix = global.config?.prefa?.[0] || '.'
    const ownerName = global.config?.ownerName || 'Simon Tech'
    const mode = global.config?.mode || 'public'
    const banner = global.config?.banner || 'https://i.ibb.co/3Yf5v5y/wolf.jpg'
    const uptime = Math.floor(process.uptime() / 60)

    const totalCmds = 100
    const date = new Date().toLocaleDateString()
    const time = new Date().toLocaleTimeString()

    // Menu design
    const menuText = `
╭━───━───━───━───━╮
┃ 🐺 *${botName.toUpperCase()}* 🐺
┃ ⚡ *100 COMMANDS* ⚡
╰━───━───━───━───━╯

┏━━━〔 *USER INFO* 〕━━━┓
┃ 👤 Name: ${pushname}
┃ 📱 JID: ${from.split('@')[0]}
┃ 👥 Chat: ${isGroup ? 'Group' : 'Private'}
┃ 🕒 Time: ${time}
┃ 📅 Date: ${date}
┃ ⏱️ Uptime: ${uptime}m
┗━━━━━━━━━━━━━━━━━━┛

┏━━━〔 *BOT INFO* 〕━━━┓
┃ 🤖 Bot: ${botName}
┃ 👑 Owner: ${ownerName}
┃ 🔣 Prefix: ${prefix}
┃ 🌐 Mode: ${mode}
┃ 📦 Total Cmds: ${totalCmds}
┃ 🔥 Version: 2.0 PRO MAX
┗━━━━━━━━━━━━━━━━━━┛

*${prefix}menu for full list*

┏━━━〔 👑 *OWNER* 〕━━━┓
┃ ${prefix}owner - Owner contact
┃ ${prefix}setowner 234xxx - Add owner
┃ ${prefix}setprefix . - Set prefix
┃ ${prefix}setname BotName - Set name
┃ ${prefix}setbio Text - Set bio
┃ ${prefix}setpp - Reply image set pp
┃ ${prefix}shutdown - Shutdown bot
┃ ${prefix}restart - Restart bot
┃ ${prefix}broadcast Text - Bc to groups
┃ ${prefix}ban @user - Ban user
┃ ${prefix}unban 234xxx - Unban
┃ ${prefix}block @user - Block
┃ ${prefix}unblock 234xxx - Unblock
┃ ${prefix}join link - Join group
┃ ${prefix}leave - Leave group
┗━━━━━━━━━━━━━━━━━━┛

┏━━━〔 ⚡ *AUTO* 〕━━━┓
┃ ${prefix}autotyping - Auto typing ON/OFF
┃ ${prefix}autoonline - Always online
┃ ${prefix}autorecording - Recording
┃ ${prefix}autoreact - React msgs
┃ ${prefix}autoreply - Auto reply mention
┃ ${prefix}autosticker - Auto sticker
┃ ${prefix}autoview - Auto view status
┃ ${prefix}autolikestatus - Like status
┃ ${prefix}autoviewstatus - View+Like
┃ ${prefix}autobio - Auto bio time
┃ ${prefix}autogreet - Greet new members
┃ ${prefix}autodownload - Auto download links
┃ ${prefix}autotranslate - Auto translate
┃ ${prefix}autopresence typing - Set presence
┗━━━━━━━━━━━━━━━━━━┛

┏━━━〔 👥 *GROUP* 〕━━━┓
┃ ${prefix}groupinfo - Group info
┃ ${prefix}grouplink - Get invite link
┃ ${prefix}revoke - Reset link
┃ ${prefix}kick @user - Kick
┃ ${prefix}add 234xxx - Add user
┃ ${prefix}promote @user - Make admin
┃ ${prefix}demote @user - Remove admin
┃ ${prefix}tagall Text - Tag all
┃ ${prefix}hidetag Text - Hide tag
┃ ${prefix}everyone Text - Tag everyone
┃ ${prefix}groupname NewName - Set name
┃ ${prefix}groupdesc Text - Set desc
┃ ${prefix}groupdp - Reply image set group dp
┃ ${prefix}open - Open group
┃ ${prefix}close - Close group
┗━━━━━━━━━━━━━━━━━━┛

┏━━━〔 🛡️ *MODERATOR* 〕━━━┓
┃ ${prefix}warn @user - Warn user
┃ ${prefix}unwarn @user - Remove warn
┃ ${prefix}warnings @user - Check warns
┃ ${prefix}mute - Mute group
┃ ${prefix}unmute - Unmute
┃ ${prefix}kickuser @user - Kick user
┃ ${prefix}banuser @user - Ban user
┃ ${prefix}unbanuser @user - Unban
┃ ${prefix}clear - Clear chats
┃ ${prefix}delete - Reply msg to delete
┃ ${prefix}purge - Purge msgs
┃ ${prefix}resetwarn @user - Reset warns
┃ ${prefix}lock - Lock group info
┃ ${prefix}unlock - Unlock
┃ ${prefix}modstatus - Mod status
┗━━━━━━━━━━━━━━━━━━┛

┏━━━〔 ⚙️ *BOT SETTINGS* 〕━━━┓
┃ ${prefix}getprefix - Get prefix
┃ ${prefix}setmode public/private
┃ ${prefix}public - Public mode
┃ ${prefix}private - Private mode
┃ ${prefix}settimezone Africa/Lagos
┃ ${prefix}setlanguage en
┃ ${prefix}setownername Name
┃ ${prefix}setfooter Footer text
┃ ${prefix}setpackname Pack name
┃ ${prefix}setauthor Author name
┃ ${prefix}setmenu Style
┃ ${prefix}setcmdlog on/off
┃ ${prefix}setstatus Text
┃ ${prefix}botinfo - Bot info
┃ ${prefix}uptime - Uptime
┗━━━━━━━━━━━━━━━━━━┛

┏━━━〔 🎥 *VV & EXTRA* 〕━━━┓
┃ ${prefix}vv - Reply viewonce to open
┃ ${prefix}welcome on/off - Welcome
┃ ${prefix}goodbye on/off - Goodbye
┃ ${prefix}togstatus - Toggle status
┃ ${prefix}ping - Ping speed
┃ ${prefix}speed - Speed test
┃ ${prefix}getpp @user - Get pp
┃ ${prefix}getjid - Get chat JID
┃ ${prefix}save - Reply msg save to DM
┃ ${prefix}vvinfo - VV info
┃ ${prefix}report Text - Report to owner
┃ ${prefix}request Text - Request feature
┃ ${prefix}gcstatus - Group status
┗━━━━━━━━━━━━━━━━━━┛

┏━━━〔 ☠️ *ANTI* 〕━━━┓
┃ ${prefix}antilink on/off - Anti link
┃ ${prefix}antibot on/off - Anti bot
┃ ${prefix}antispam - Anti spam
┃ ${prefix}antitag - Anti tag
┃ ${prefix}antidelete - Anti delete
┃ ${prefix}antiviewonce - Anti viewonce
┃ ${prefix}antisticker - Anti sticker
┃ ${prefix}antinsfw - Anti NSFW
┃ ${prefix}antibadword - Bad words
┃ ${prefix}antiflood - Anti flood
┃ ${prefix}antiraid - Anti raid
┃ ${prefix}antimute - Anti mute
┃ ${prefix}antigmention - Anti gmention
┃ ${prefix}antilinkkick - Kick link sender
┃ ${prefix}antilinkwarn - Warn link sender
┗━━━━━━━━━━━━━━━━━━┛

╭━───━───━───━───━╮
┃ 🐺 *KILLER WOLF XMD*
┃ 👑 Owner: ${ownerName}
┃ 📞 wa.me/2349166265317
┃ 🔥 100 CMDS | PRO MAX
┃ ⚡ Prefix: ${prefix}
╰━───━───━───━───━╯

*Type ${prefix}ping to check speed!*
`

    try {
      // Try with banner image
      if (command === 'menu' || command === 'wolfmenu' || command === 'botmenu') {
        await sock.sendMessage(from, {
          image: { url: banner },
          caption: menuText
        }, { quoted: m })
      } else if (command === 'help
