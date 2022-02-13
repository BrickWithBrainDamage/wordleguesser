const fs = require('fs')
const words = fs.readFileSync('./words_alpha.txt', 'utf-8')
let letterCount = {}
words.split('').forEach(e => {
    letterCount.hasOwnProperty(e) ? letterCount[e] ++ : letterCount[e] = 1
})
fs.writeFile('./letterCounts.txt', JSON.stringify(letterCount, null, 4), err => err && console.log(err))