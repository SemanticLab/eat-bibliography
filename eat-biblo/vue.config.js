// The site is served from https://semlab.io/eat-bibliography/ out of the repository's docs folder.
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/eat-bibliography/' : '/',
  outputDir: '../docs'
}
