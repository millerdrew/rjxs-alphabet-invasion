"use strict";
exports.__esModule = true;
console.clear();
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var randomLetter = function () { return String.fromCharCode(Math.random() * ('z'.charCodeAt(0) - 'a'.charCodeAt(0)) + 'a'.charCodeAt(0)); };
var levelChangeThreshold = 20;
var speedAdjust = 50;
var endThreshold = 15;
var gameWidth = 30;
var intervalSubject = new rxjs_1.BehaviorSubject(600);
var letters$ = intervalSubject.pipe(operators_1.switchMap(function (i) { return rxjs_1.interval(i)
    .pipe(operators_1.scan(function (letters) { return ({
    intrvl: i,
    ltrs: [({
            letter: randomLetter(),
            yPos: Math.floor(Math.random() * gameWidth)
        })].concat(letters.ltrs)
}); }, { ltrs: [], intrvl: 0 })); }));
var keys$ = rxjs_1.fromEvent(document, 'keydown')
    .pipe(operators_1.startWith({ key: '' }), operators_1.map(function (e) { return e.key; }));
var renderGame = function (state) { return (document.body.innerHTML = "Score: " + state.score + ", Level: " + state.level + " <br/>",
    state.letters.forEach(function (l) { return document.body.innerHTML +=
        '&nbsp'.repeat(l.yPos) + l.letter + '<br/>'; }),
    document.body.innerHTML +=
        '<br/>'.repeat(endThreshold - state.letters.length - 1) + '-'.repeat(gameWidth)); };
var renderGameOver = function () { return document.body.innerHTML += '<br/>GAME OVER!'; };
var noop = function () { };
var game$ = rxjs_1.combineLatest(keys$, letters$).pipe(operators_1.scan(function (state, _a) {
    var key = _a[0], letters = _a[1];
    return (letters.ltrs[letters.ltrs.length - 1]
        && letters.ltrs[letters.ltrs.length - 1].letter === key
        ? (state.score = state.score + 1, letters.ltrs.pop())
        : noop,
        state.score > 0 && state.score % levelChangeThreshold === 0
            ? (letters.ltrs = [],
                state.level = state.level + 1,
                state.score = state.score + 1,
                intervalSubject.next(letters.intrvl - speedAdjust))
            : noop,
        ({ score: state.score, letters: letters.ltrs, level: state.level }));
}, { score: 0, letters: [], level: 1 }), operators_1.takeWhile(function (state) { return state.letters.length < endThreshold; }));
game$.subscribe(renderGame, noop, renderGameOver);
