const fs = require('fs')
const allWords = fs.readFileSync('./words_alpha.txt', 'utf-8')

let illegalLetters = {}
let includesLetters = {}
let knownLetters = ''

async function getKnownLetters() {
    let length = await askQus('length')
    for (let i = 0; i < parseInt(length); i++) knownLetters += '.'
    getInfo()
}
getKnownLetters()
function includeTimes(word, phrase) {
    let index = 0
    let times = 0
    while (word.indexOf(phrase, index) !== -1) {
        index = word.indexOf(phrase, index) + 1
        times++
    }
    return times
}
function generateRegexAndSearch() {
    let negLookahead = []
    negLookahead = `(?!${negLookahead.join('|')})`
    let regex = new RegExp(`^${knownLetters}$`, 'igm')
    let partialResults = allWords.match(regex)

    try {
        return partialResults.filter(e => {
            for (let item in includesLetters) {
                if (includeTimes(e, item) < includesLetters[item]) return false
            }
            for (let item in illegalLetters) {
                if (includeTimes(e, item) == illegalLetters[item]) return false
            }
            return true
        })
    } catch {
        return "FATAL PROCESSING ERROR AHHAHAH"
    }
}
function askQus(msg) {
    return new Promise(res => {
        process.stdout.write(`${msg} `)
        function processdata(e) {
            res(e.toString().trim())
            process.stdin.removeListener('data', processdata)
        }
        process.stdin.on('data', processdata)
    })
}
async function getInfo() {
    let illegals = await askQus('illegal letters')
    let includes = await askQus('letters included')
    let knowns = await askQus('known letters')
    if (includes) {
        includes.split('').forEach(e => {
            includesLetters.hasOwnProperty(e) ? includesLetters[e]++ : includesLetters[e] = 1
        })
    }
    if (illegals) {
        illegals.split('').forEach(e => {
            illegalLetters.hasOwnProperty(e) ? illegalLetters[e]++ : illegalLetters[e] = 1
            if (includesLetters.hasOwnProperty(e) && includesLetters[e] == illegalLetters[e] - 1) {
                includesLetters[e] += 2
            } else if (includesLetters.hasOwnProperty(e) && illegalLetters[e] < 2) {
                illegalLetters[e] = 2
            }
        })
    }
    if (knowns) {
        knownLetters = knowns
    }

    console.log(generateRegexAndSearch())
    console.log(`Illegal letters: ${JSON.stringify(illegalLetters)}`)
    console.log(`Letters in the word: ${JSON.stringify(includesLetters)}`)
    getInfo()
}