// Silent Wolf connection helper
module.exports = {
  // Decode JID
  decodeJid: (jid) => {
    if (!jid) return jid
    if (/:\d+@/gi.test(jid)) {
      let decode = jid.split(":")[0] + "@s.whatsapp.net"
      return decode
    } else return jid
  },

  // Get group admins
  getGroupAdmins: (participants) => {
    let admins = []
    for (let i of participants) {
      if (i.admin === "admin" || i.admin === "superadmin") admins.push(i.id)
    }
    return admins
  }
}
