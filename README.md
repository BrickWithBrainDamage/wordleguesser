# Wordle Guesser
There are two applications listed here:
## Web App
This is probably the one to use. Opens in a web browser. Can be used offline as a HTML file without any server (i.e can be used by double clicking on index.html, no server setup required). First, enter the amount of letters a word has, this amount can be adjusted by clicking the button on the bottom of the screen. Enter the GREEN letters in the first set of boxes, the YELLOW letters in the second set, both green and yellow letters should be entered in the order that the wordle you're playing gives you (if the second box is yellow, then the second box in the app should be yellow.
<br>
**Compute Mode** can be toggled on or off by clicking the button on the bottom of the screen.
### Compute Mode
Compute mode, when set to **on** does what you want a Wordle guesser to do. It takes ALL of the clues you've given it and then spits out words that matches ALL of the clues. Compute mode is probably what you're looking for in a Wordle guesser. However, in situations like []IGHT, it doesn't give you a lot of information. It splits out lots of words ending in IGHT, but those words only give you ONE letter of information when entered. If you keep trying these words, you're eventually going to run out of guesses and lose. It would be much more efficent to try a word with 5 different letters, such as *money* or *early* to get 5 letters of information. In this case, you would want to turn compute mode **off**.
### Compute Mode Off
When compute mode is off, the app gives you guesses which can provide you with lots more information. If implemented right (which, let's face it, probably isn't), then compute mode should consistantly give you words that has 5 unique letters that give you new information. When compute mode is off, all of the inputed green letters would be treated like gray letters to ensure that they cannot get in the way of information collecting. If a 5 letter word starts with an A, then we will only get 4 letters' worth of information because we already know that the letter starts with an A; there is no need to guess that. Instead, we can generate a new word that does not include A which will give us 5 letters' worth of information.
<br>
In addition, to ensure that the maximum amount of information can be obtained, when compute mode is off all words with duplicate letters (apple, woods, moose et cetra) will not show up. This is, once again, to ensure that we can obtain more information. In the event that a word has only one p, or o, the other o  -- which can be valuable space to extract more information -- will be wasted. Therefore, it is efficent to eliminate these words to ensure that we can have out 5 letters' worth of information.
### When to use compute mode
During your first 1 - 3 rounds, you want to turn **off** compute mode to ensure you can get as much information as possible.
Once the amount of words remaining is small (5 - 50 words), OR there are no more results (compute mode disabled is a lot more strict), switch over to compute mode.
When compute mode gives you a small amount of information (1 - 2 letters) per guess (as 3 other letters are green), turn it OFF to gain more information.
Your final guess should **always come from a result delivered in compute mode**. The answer will never be delivered when compute mode is off unless you got VERY lucky and have no green letters.

## Console App
Install node.js, cd to the directory of the console app in ./console, and run node index.js
<br>
This is the first version of this app, before I moved on to the web version. This version doesn't make full use of the information (if a A is yellow, it only knows that a word contains an A, not where an A is), and is quite prone to human error. Take the following steps
<ol>
  <li>The answer is 'doubted'</li>
  <li>You enter the word 'oranges'</li>
  <li>Since you have one O, and the word has it, O comes up as yellow</li>
  <li>You enter O in words included</li>
  <li>The program gives 'monitor' as a possible word, and you enter that in</li>
  <li>The first O comes back as green (yay!), but the second o comes back as gray because 'doubted' only has one O</li>
  <li>You enter an O when the program prompts you for illegal letters because it is greyed out</li>
</ol>
Suddenly the word 'doubted' is eliminated from the words that is returned (meaning you'll never win) because it sees that any word which has an 'O' in it is greyed out, and therefore is illegal to use. Unfortunately, wordle actually indicates the SECOND O, meaning you still have an O, but the program does not know that!
