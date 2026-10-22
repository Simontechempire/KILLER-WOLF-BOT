const axios = require("axios")

module.exports = {

  // Runtime
  runtime: (seconds) => {
    seconds = Number(seconds)
    let d = Math.floor(seconds / (3600 * 24))
    let h = Math.floor(seconds % (3600 * 24) / 3600)
    let m = Math.floor(seconds % 3600 / 60)
    let s = Math.floor(seconds % 60)
    let dDisplay = d > 0 ? d + (d == 1 ? " day, " : " days, ") : ""
    let hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : ""
    let mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : ""
    let sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : ""
    return dDisplay + hDisplay + mDisplay + sDisplay
  },

  // Fetch JSON
  fetchJson: async (url) => {
    let res = await axios.get(url)
    return res.data
  },

  // Is URL
  isUrl: (url) => {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%+.~#?&/=]*)/, 'gi'))
  },

  // Picture to link (Silent Wolf method - Catbox)
  picToLink: async (buffer) => {
    const FormData = require("form-data")
    let form = new FormData()
    form.append("reqtype", "fileupload")
    form.append("fileToUpload", buffer, "image.jpg")
    let res = await axios.post("https://catbox.moe/user/api.php", form, {
      headers: form.getHeaders()
    })
    return res.data // direct link
  }
}
