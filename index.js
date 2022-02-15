const id = e => document.getElementById(e);
const queryAll = e => document.querySelectorAll(e);
let length;
let caretPos
let regexQuery;

let computeMode = true //try to determine the word
//if false, then try to get as much information to help us determine the word
function toggleComputeMode() {
    let e = id('toggleComputeMode')
    if (computeMode) {
        computeMode = false
        e.style.border = 'red solid 2px'
        e.innerHTML = 'Toggle Compute Mode (Compute Mode Off)'
    } else {
        computeMode = true
        e.style.border = '1px solid #ffb3b3'
        e.innerHTML = 'Toggle Compute Mode (Compute Mode On)'

    }
}
id('toggleComputeMode').addEventListener('click', toggleComputeMode)
function getLettersFromHTML() {
    regexQuery = allInputs.map((e, i) => {
        let val = e.value;
        return val ?
            computeMode ?
                val :
                `[^${val}]` :
            allInputsNotLetters[i].value ?
                `[^${allInputsNotLetters[i].value}]` :
                '.';
    }).join('')
    if (!computeMode) {
        let illegalChars = []
        allInputs.forEach(e => {
            illegalChars.push(`(?!.+^${e.value})`)
        })
        regexQuery = illegalChars.join('') + regexQuery
    }
}
let allInputs = [];
let allInputsNotLetters = [];

let lengthPromptInProgres = false;
function getLength() {
    lengthPromptInProgres = true
    return new Promise(res => {
        let lenOverlay
        function finish() {
            length = parseInt(document.querySelector('.overlayContainer input').value)
            if (isNaN(length)) {
                let warning = document.createElement('p')
                warning.innerHTML = 'Cannot accept this length'
                lenOverlay.appendChild(warning)

                setTimeout(_ => warning.remove(), 1500)
            } else {
                document.removeEventListener('keyup', keyEvent)
                document.querySelector('.promptLen').remove()
                lengthPromptInProgres = false
                res()
            }
        }
        function keyEvent(e) {
            e.key === 'Enter' && finish()
        }
        let newDiv = document.createElement('div')
        newDiv.classList.add('promptLen')
        lenOverlay = document.createElement('div')
        lenOverlay.classList.add('overlayContainer')

        let descriptor = document.createElement('h2')
        descriptor.innerHTML = 'Word Length'
        lenOverlay.appendChild(descriptor)

        let input = document.createElement('input')
        lenOverlay.appendChild(input)

        let submit = document.createElement('button')
        submit.id = 'submitButton'
        submit.innerHTML = 'Submit'
        submit.addEventListener('click', finish)
        lenOverlay.appendChild(submit)

        newDiv.appendChild(lenOverlay)

        document.body.insertBefore(newDiv, document.body.firstChild)

        input.focus()
        document.addEventListener('keyup', keyEvent)
    })
}
async function promptLength() {
    queryAll('#knownLetters input, #knownIllegalLetters input').forEach(e => e.remove());
    await getLength();
    allInputs = [];
    allInputsNotLetters = [];
    wordCache = engWords.split('\n').filter(e => e.length == length);

    for (let i = 0; i < length; i++) {
        let wordInput = document.createElement('input');
        wordInput.classList.add('letter');
        wordInput.style.border = ` 2px dashed rgb(105, 224, 115)`
        allInputs.push(wordInput);
        id("knownLetters").appendChild(wordInput);

        let notInput = document.createElement('input');
        notInput.style.border = `2px dashed rgb(223, 221, 26)`
        notInput.classList.add('letter');
        [notInput, wordInput].forEach(e => {
            e.addEventListener('focus', f => {
                e.style.transform = 'scale(1.3)'
                currentFocus = i

                let bounding = e.getBoundingClientRect()
                let newDiv = document.createElement('div')
                newDiv.classList.add('explodeScaleOutThing')

                newDiv.style.left = `${(bounding.right + bounding.left) / 2 - 17.5}px`
                newDiv.style.top = `${(bounding.top + bounding.bottom) / 2 - 17.5}px`
                console.log(e.style.borderColor)
                newDiv.style.backgroundColor = e.style.borderColor

                id('front').appendChild(newDiv)

                setTimeout(_ => {
                    newDiv.style.transform = 'scale(10)'
                    newDiv.style.opacity = 0
                })
                setTimeout(_ => {
                    newDiv.remove()
                }, 1300)
            })
            e.addEventListener('focusout', f => {
                e.style.transform = 'scale(1)'
            })
            e.addEventListener('keydown', function (f) {
                caretPos = this.selectionStart;
                oldValue = wordInput.value
            })
        })
        allInputsNotLetters.push(notInput);

        let oldValue
        wordInput.addEventListener('keyup', e => {
            if (e.key.match(/^[a-z]$/)) wordInput.value = e.key
        })
        id("knownIllegalLetters").appendChild(notInput);
    }
}
promptLength();
id('changeLength').addEventListener('click', promptLength);
let lastTime
let wordCache = []

function compute() {
    let t0 = performance.now()
    queryAll('#possibleWords p, #comWords p').forEach(e => e.remove());
    getLettersFromHTML();

    let lettersNotIn = {};
    let lettersIn = {};
    queryAll('#knownIllegalLetters input').forEach(f => {
        f.value.split('').forEach(e => {
            lettersIn[e] = 1
        })
    })
    let letters = [];
    queryAll('#knownLetters input').forEach(e => e.value && letters.push(e.value));
    id("illegalLetters").value.split('').forEach(e => {
        lettersNotIn.hasOwnProperty(e) ? lettersNotIn[e]++ : lettersNotIn[e] = 1;
        if ((lettersIn.hasOwnProperty(e) || letters.includes(e)) && lettersNotIn[e] < 2) {
            lettersNotIn[e] = 2;
        }
    })
    let lettersFromInput = []
    if (!computeMode) {
        queryAll('#knownLetters input').forEach(e => {
            e.value.split('').forEach(f => {
                lettersFromInput.push(f)
                lettersNotIn[f] = 1
            })
        })
    }
    let compiledRegex = new RegExp(`^${regexQuery}$`, 'mgi')
    //partialResults = engWords.match(compiledRegex)
    partialResults = wordCache.filter(e => e.match(compiledRegex)) //much slower method, but ensures that newlines won't be unexpected
    function includeTimes(word, phrase) {
        let index = 0;
        let times = 0;
        while (word.indexOf(phrase, index) !== -1) {
            index = word.indexOf(phrase, index) + 1;
            times++;
        }
        return times;
    }

    if (partialResults) {
        let results = partialResults.filter(e => {
            for (let item in lettersIn) {
                if (/* includeTimes(e, item) < lettersIn[item] */ !e.includes(item)) return false;
            }
            for (let item in lettersNotIn) {
                if (lettersFromInput.includes(item) && !computeMode) {
                    if (e.includes(item)) return false;
                }
                if (/* includeTimes(e, item) >= 1 */ e.includes(item) && !letters.includes(item) && !lettersIn.hasOwnProperty(item)) {
                    if (e.includes(item)) return false;
                }
            }
            return true;
        })
        if (!computeMode) {
            //remove words with duplicate letters in not compute mode
            results = results.filter(e => {
                let letters = []
                for (let letter of e.split('')) {
                    if (letters.includes(letter)) return false
                    letters.push(letter)
                }
                return true
            })
        }
        postProcess(results)
        lastTime = performance.now() - t0;
        id('computeTime').innerHTML = `Request completed in ${lastTime}MS.`;
    } else {
        id('addWords').innerHTML = `No words found`;
    }
}
function computeWordsWithLetters() {
    let t0 = performance.now()
    queryAll('#possibleWords p, #comWords p').forEach(e => e.remove());
    let allLetters = document.querySelector('#inclusiveWords input').value.split('')
    let results = engWords.split('\n').filter(e => allLetters.every(f => e.includes(f)) && e.length == length)
    postProcess(results)
    id('computeTime').innerHTML = `Request completed in ${performance.now() - t0}MS.`
}
function postProcess(results) {
    //then, compute how much 'points' each word is worth by seeing if it has the most common letters
    //the more common its letters are, the more likely it is for us to stumble into a letter that is yellow or green
    results = results.map(e => {
        let letterScore = 0
        let lettersEncountered = []
        e.split('').forEach(f => {
            if (!lettersEncountered.includes(f)) letterScore += isNaN(Math.floor(letterCount[f] / 100)) ? 0 : Math.floor(letterCount[f] / 100)
            lettersEncountered.push(f)
        })
        return [e, letterScore]
    })
    let resultsCommonWords = []
    for (let i = 0; i < results.length; i++) { //move most common words into their separate array
        if (commonWords.has(results[i][0])) {
            resultsCommonWords.push(results[i])
            results.splice(i, 1)
        }
    }
    //counting sort remaining results from high to low
    function sort(arr) {
        let output = [];
        output.length = arr.length;

        let max = 0;
        arr.forEach(f => { if (f[1] > max) max = f[1] });
        let count = [];
        count.length = max + 1;
        count.fill(0);

        arr.forEach(f => count[f[1]]++);
        for (let i = 1; i < count.length; i++) count[i] += count[i - 1];
        for (let i = arr.length - 1; i >= 0; i--) {
            output[count[arr[i][1]] - 1] = arr[i];
            count[arr[i][1]]--;
        }

        let returnVal = []
        for (let i = 0; i < output.length; i++) returnVal.unshift(output[i]);
        return returnVal
    }
    results = sort(results);

    let wordsDiv = id('possibleWords');
    for (let i = 0; i < 75 && i < results.length; i++) {
        let newp = document.createElement('p');
        try {
            newp.innerHTML = `${results[i][0]}(Score: ${results[i][1]})`;
        } catch { console.log(results, i) }
        wordsDiv.appendChild(newp);
    }

    resultsCommonWords = sort(resultsCommonWords)
    let comWords = id('comWords')
    for (let i = 0; i < 50 && i < resultsCommonWords.length; i++) {
        let newp = document.createElement('p');
        newp.innerHTML = `${resultsCommonWords[i][0]}(Score: ${resultsCommonWords[i][1]})`;
        newp.style.borderColor = 'blue';
        comWords.appendChild(newp);
    }
    id('comWordsInfo').innerHTML = `${resultsCommonWords.length} common words, ${resultsCommonWords.length - 50 < 0 ?
        resultsCommonWords.length :
        50
        } shown`
    id('addWords').innerHTML = results.length >= 75 ? `And ${results.length - 75} more words not shown` : `${results.length} words shown`;

}
/**
 * removes elements that are changed and make the program ready for the next word to guess
 * @returns void
 */
function clear() {
    queryAll('#knownLetters input, #illegalLetters, #knownIllegalLetters input').forEach(e => e.value = '');
    queryAll('#possibleWords p').forEach(e => e.remove());
    id('addWords').innerHTML = '';
}
id('submitSearch').addEventListener('click', compute);
let currentFocus = null;
function focusCursor(key) {
    try {
    document.activeElement.value = document.activeElement.value.match(/[^\s]/g).join('')
    } catch {
        document.activeElement.value = ''
    }
    if (document.activeElement.id !== 'illegalLetters') {
        if (currentFocus !== null) {
            if (currentFocus <= allInputs.length - 1) {
                if (document.activeElement.parentNode.id == 'knownLetters') {
                    key === 'Backspace' ? currentFocus >= 1 && caretPos === 0 && currentFocus-- : currentFocus < allInputs.length - 1 && currentFocus++;
                    if (key === 'ArrowLeft') currentFocus -= 2;
                    if (key === 'Backspace') allInputs[currentFocus].value = '';
                } else {
                    if (key === ' ' && currentFocus < allInputs.length - 1) currentFocus++
                    if (key === 'Backspace' && currentFocus >= 1 && caretPos === 0) {
                        currentFocus--
                    } else if (key === 'ArrowLeft') {
                        currentFocus--
                    } else if (key === 'ArrowRight') currentFocus++
                }
                try {
                    document.activeElement.parentNode.id == 'knownLetters' ?
                        allInputs[currentFocus ?? 0].focus() :
                        allInputsNotLetters[currentFocus ?? 0].focus()
                } catch { }
            }
        } else {
            allInputs[0].focus();
        }
    }
}
let siteInfo = JSON.parse(window.localStorage.getItem('siteInfo')) ?? {
    visitedTimes: 1
}
if (siteInfo.visitedTimes > 3) document.querySelector('#pageBottom p').innerHTML = ''
siteInfo.visitedTimes++
window.localStorage.setItem('siteInfo', JSON.stringify(siteInfo))

document.addEventListener('keypress', e => e.key === 'Enter' && !document.activeElement.parentNode.classList.contains('overlayContainer') && compute());
document.querySelector('#inclusiveWords button').addEventListener('click', computeWordsWithLetters)
document.addEventListener('keyup', e => {
    if (!document.activeElement.parentNode.classList.contains('overlayContainer'))
        e.key === 'Escape' ?
            clear() :
            e.key.toLowerCase() === 'c' && document.activeElement.tagName !== 'INPUT' ?
                toggleComputeMode() :
                e.key.toLowerCase() == 'i' && document.activeElement.tagName !== 'INPUT' ?
                    computeWordsWithLetters() :
                    (['Backspace', 'ArrowLeft', 'ArrowRight'].includes(e.key) ||
                        /^[a-z\s]$/i.test(e.key)) &&
                    !['illegalLetters', 'lettersInWord', 'inclusiveWordsInput'].includes(document.activeElement.id)
                    && focusCursor(e.key);
});

const bg = id('bgAnimation');
let allBG = [];

let time = performance.now();

let lastMouseX;
let lastMouseY;
let lastObjectActive;
let lastActiveIndex;
function initBGAnimation() {
    const alphabet = 'qwertyuiopasdfghjklzxcvbnm'.split('');
    for (let i = 0; i < 50; i++) {
        let el = document.createElement('p');
        el.innerHTML = alphabet[Math.floor(Math.random() * alphabet.length)];
        bg.appendChild(el);
        let objectForEl = {
            domElement: el,
            x: Math.floor(Math.random() * window.innerWidth),
            y: Math.floor(Math.random() * window.innerHeight),
            angle: Math.floor(Math.random() * 360),
            travelMultiplier: 1
        }

        el.style.top = `${objectForEl.x}px`;
        el.style.left = `${objectForEl.y}px`;
        allBG.push(objectForEl);
    }
    requestAnimationFrame(bgAnimation);
}
document.addEventListener('mousedown', e => {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
    let i = 0
    for (let item of allBG) {
        let bounding = item.domElement.getBoundingClientRect()
        if (e.clientX < bounding.right &&
            e.clientX > bounding.x &&
            e.clientY < bounding.bottom &&
            e.clientY > bounding.top) {
            console.log(true)
            lastObjectActive = item
            lastActiveIndex = i
            lastMeasure = 0
            break
        }
        i++
    }
})
let meanMouseMovements = []
document.addEventListener('mouseup', e => {
    if (lastObjectActive) {
        let diffX = Math.abs(e.clientX - lastMouseX)
        let diffY = Math.abs(e.clientY - lastMouseY)
        diffPush(diffX, diffY)
        try {
            lastObjectActive.travelMultiplier = meanMouseMovements.reduce((acc, val) => acc + val) / meanMouseMovements.length * 3
        } catch {
            lastObjectActive.travelMultiplier = 1.2
        }
        if (lastObjectActive.travelMultiplier < 1) lastObjectActive.travelMultiplier = 1
        let lastAng = radToDeg(Math.atan(diffY / diffX))
        if (e.clientX > lastMouseX && e.clientY > lastMouseY) {
            lastAng += 90
        } else if (e.clientX < lastMouseX && e.clientY > lastMouseY) {
            lastAng += 180
        } else if (e.clientX < lastMouseX && e.clientY < lastMouseY) {
            lastAng += 270
        }
        lastObjectActive.angle = lastAng || lastObjectActive.angle
        lastObjectActive = null
        lastActiveIndex = null
    }
    lastMeasure = 0
    meanMouseMovements = []
})

let lastXmousemove
let lastYmousemove
let lastMeasure = performance.now()
function diffPush(diffX, diffY) {
    lastMeasure = performance.now()
    if (lastXmousemove) {
        let diff = Math.sqrt(
            diffX ** 2 +
            diffY ** 2) / 20
        if (diff > 0.2) meanMouseMovements.push(diff)
    }
}
document.addEventListener('mousemove', e => {
    if (performance.now() - lastMeasure > 100) {
        let diffX = Math.abs(e.clientX - lastXmousemove)
        let diffY = Math.abs(e.clientY - lastYmousemove)
        diffPush(diffX, diffY)
    }
    if (lastObjectActive) {
        lastObjectActive.x = e.x
        lastObjectActive.y = e.y
    }
    lastXmousemove = e.clientX
    lastYmousemove = e.clientY
})
initBGAnimation()
const degToRad = deg => deg * (Math.PI / 180);
const radToDeg = rad => rad * 180 / Math.PI
function bgAnimation() {
    let now = performance.now();
    let deltaTime = time - performance.now();
    time = now;
    allBG.forEach((item, index) => {
        let loopValid = true
        if (lastActiveIndex) {
            if (index === lastActiveIndex) loopValid = false
        }
        if (loopValid) {
            let { angle, x, y } = item;
            const dist = 1;
            let xTravel = Math.abs(Math.cos(degToRad(angle % 90)) / dist);
            let yTravel = Math.abs(Math.sin(degToRad(angle % 90)) / dist);

            const travelMultiplier = item.travelMultiplier;
            if (item.travelMultiplier > 1) {
                item.travelMultiplier -= 0.2
                if (item.travelMultiplier < 1) {
                    item.travelMultiplier = 1
                }
            }
            if (angle < 90) {
                x += xTravel * travelMultiplier;
                y -= yTravel * travelMultiplier;
            } else if (angle < 180) {
                x += xTravel * travelMultiplier;
                y += yTravel * travelMultiplier;
            } else if (angle < 270) {
                x -= xTravel * travelMultiplier;
                y += yTravel * travelMultiplier;
            } else {
                x -= xTravel * travelMultiplier;
                y -= yTravel * travelMultiplier;
            }

            item.x = x;
            item.y = y;

            const bounceAt = 25
            let canBounce = item.x > window.innerWidth - bounceAt ||
                item.x < bounceAt ||
                item.y < bounceAt ||
                item.y > window.innerHeight - bounceAt;
            if (item.bounced) {
                if (!canBounce) item.bounced = false;
            }
            if (canBounce && !item.bounced) {
                item.angle += 180;
                item.bounced = true;
                if (item.angle > 360) item.angle -= 360;
            }
        }
        item.domElement.style.left = `${item.x}px`;
        item.domElement.style.top = `${item.y}px`;
    })
    requestAnimationFrame(bgAnimation);
}
