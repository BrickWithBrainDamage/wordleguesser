const fs = require('fs')
const allWords = fs.readFileSync('./words_alpha.txt', 'utf-8')

let illegalLetters = {}
let includesLetters = {}
let knownLetters = ''
const COLORS = {
    'red': `\x1b[38;2;195;49;73m`,
    'reset': '\x1b[0m',
    'skyBlue': '\x1b[38;2;133;199;242m',
    'blueViolet': '\x1b[38;2;133;128;242m',
    'electricBlue': '\x1b[38;2;133;235;242m'
}
let length
async function getKnownLetters() {
    length = await askQus(`Length`, e => /^\d+$/.test(e), 'Input must be a number')
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
        return "Something happened. This is probably because no words match your rules"
    }
}
function askQus(msg, verification = _ => true, invalidMsg) {
    return new Promise(res => {
        process.stdout.write(`\x1b[1m${COLORS.red}${msg}?\x1b[0m `)
        function processdata(e) {
            e = e.toString().trim()
            if (verification(e)) {
                let space = ''
                for (let i = 0; i <= msg.replaceAll(/\x1b\[(\d+;?)+[a-z]/gi, '').length + e.length; i++) space += ' '
                process.stdout.write(`\x1b[1A\x1b[2K\r${COLORS.red}\x1b[1m${msg}: ${COLORS.skyBlue}${e}${COLORS.reset}\n`)
                res(e)
                process.stdin.removeListener('data', processdata)
            } else {
                process.stdout.write(`${COLORS.electricBlue}\x1b[1A\r\x1b[2KInvalid input! \x1b[1;4m${COLORS.red}${invalidMsg}${COLORS.reset} `)
            }
        }
        process.stdin.on('data', processdata)
    })
}
async function getInfo() {
    const allLetters = e => /^[a-z]+$/i.test(e) || e === ''
    let illegals = await askQus('illegal letters', allLetters, "Inputs must all be letters")
    let includes = await askQus('letters included', allLetters, "Input must all be letters")
    let knowns = await askQus('known letters \x1b[38;2;20;200;20m(green)', response => {
        if (response === '') return true
        if (response.length !== parseInt(length)) return false
        for (let item of response.split('')) {
            if (!'qwertyuiopasdfghjklzxcvbnm.'.includes(item)) return false
        }
        return true
    }, `Make sure your input is in the right format! Use . for unknown letters, this field should have a length of ${length}`)
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

    const results = generateRegexAndSearch()
    let outputStr = ''
    for (let i = 0; i < 10 && i < results.length; i++) {
        let temp = ''
        for (let j = 0; j < 10 && j + i < results.length; j++) {
            temp += `${results[i + j]}\x1b[5C`
        }
        outputStr += `${temp}\n`
    }
    console.log(`\n${COLORS.blueViolet}${outputStr}${COLORS.reset}`)
    if (results.length <= 100) {
        console.log(`${COLORS.electricBlue}${results.length} words found${COLORS.reset}`)
    } else {
        console.log(`${COLORS.electricBlue}Found \x1b[1m${results.length} words\x1b[0m${COLORS.electricBlue}, but only 100 are shown${COLORS.reset}`)
    }
    console.log(`Illegal letters: ${JSON.stringify(illegalLetters)}`)
    console.log(`Letters in the word: ${JSON.stringify(includesLetters)}`)
    getInfo()
}