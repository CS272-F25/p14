// light mode toggle
document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.getElementById("theme-toggle");
    if (toggleButton) {
        toggleButton.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
        });
    }
});

const RIDDLE_LIST =
[
    {
        question: "What walks on four legs in the morning, two legs in the afternoon, and three legs in the evening?",
        scramble: "anm",
        answer: "man"
    },
    {
        question: "What gets wetter the more it dries?",
        scramble: "wlote",
        answer: "towel"
    },
    {
        question: "I travel all around the world, yet stay in a corner. What am I?",
        scramble: "mpsat",
        answer: "stamp"
    },
    {
        question: "I'm tall when I'm young, and short when I'm old. What am I?",
        scramble: "dealnc",
        answer: "candle"
    },
    {
        question: "What is always in front of you but can't be seen?",
        scramble: "treufu",
        answer: "future"
    },
    {
        question: "What can you keep after giving to someone?",
        scramble: "rmpoeis",
        answer: "promise"
    },
    {
        question: "What goes up but never comes down?",
        scramble: "gea",
        answer: "age"
    },
    {
        question: "The more of this there is, the less you see. What is it?",
        scramble: "ksrdesna",
        answer: "darkness"
    },
    {
        question: "What has 88 keys, but can't open a single lock?",
        scramble: "npoia",
        answer: "piano:"
    },
    {
        question: "I follow you all the time and copy your every move, but you can't touch me or catch me. What am I?",
        scramble: "dahosw",
        answer: "shadow"
    }

]

const SCENE_TEXT = ["You stumble upon a mysterious cave, filled with ancient symbols and an air of excitement. A booming voice, familiar yet otherworldly, calls out your name. Frightened, you stay silent, but the voice continues: 'In the depths of this cave lies an incredible treasure. But in order to reach the treasure, you must prove your fortitude of mind!'",
]; //TODO: create object

const resultText = document.getElementById("result");
const sceneText = document.getElementById("scene");
const riddleText = document.getElementById("riddle");
const answerText = document.getElementById("answer");

const bgMusic = new Audio("sounds/cave.mp3"); // credit: "Wizard Rider" by Sonican, via pixabay
bgMusic.loop = true;
bgMusic.volume = 0.3;

let currStage = 0;

function startGame() {
    bgMusic.play();
    moveForward();
}

function moveForward() {
    sceneText.innerText = SCENE_TEXT[currStage];
    printRiddle();
}

function printRiddle() {
    riddleText.innerText = RIDDLE_LIST[1].question;
    answerText.innerText = RIDDLE_LIST[1].scramble;
}


//**
// pseudocode
// print the intro text or whatever
// print riddle function (generate a random number and print the riddle for that number)
// while (riddle count is < 7) {
// print riddle
// user answer = currAnswer
// if currAnswer = riddleAnswer {
// riddlecount ++
// print "Wonderful!"
// play cool sound
// moveForward(riddlecount)
// } else {
// print "Not quite!"
// play sad sound
// riddle count --
// moveBackward()
// move forward looks like this:
// there are seven different progressions of like almost being there making it further in
// move backward looks like this:
// random number genreates for a terrible thing to happen to you
// so print whatever the last thing was */