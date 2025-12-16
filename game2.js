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
    },
    {
        question: "What gets bigger when more is taken away?",
        scramble: "leho",
        answer: "hole"
    },
    {
        question: "Where does today come before yesterday?",
        scramble: "yndtciaori",
        answer: "dictionary"
    },
    {
        question: "What has words, but never speaks?",
        scramble: "kboo",
        answer: "book"
    },
    {
        question: "What has many teeth, but can't bite?",
        scramble: "mcbo",
        answer: "comb"
    },
    {
        question: "What building has the most stories?",
        scramble: "birlayr",
        answer: "library"
    },
]

const SCENE_TEXT = ["You stumble upon a mysterious cave, filled with ancient symbols and an air of excitement. A booming voice, familiar yet otherworldly, calls out your name. Frightened, you stay silent, but the voice continues: 'In the depths of this cave lies an incredible treasure. But in order to reach the treasure, you must prove your fortitude of mind!'",
    "You are a few steps into the cave... the darkness is looming around you and you feel trepidation, yet vast potential. You can see a glint coming from deep within the cave. You want more than anything to answer and proceed.",
    "You are almost upon the treasure, but it is still out of your grasp. You feel unsteady, breathless, but ready for what comes next.",
    "A glorious light blinds your eyes. The treasure is almost upon you and... TODO: finish this",
    "TODO: completion scene"
]; //TODO: finish object

const resultText = document.getElementById("result");
const sceneText = document.getElementById("scene");
const riddleText = document.getElementById("riddle");
const answerText = document.getElementById("answer");
let riddleInput = null; //assigned a value on each click of submit

const bgMusic = new Audio("sounds/cave.mp3"); // credit: "Wizard Rider" by Sonican, via pixabay
bgMusic.loop = true;
bgMusic.volume = 0.3;

let currStage = 0;
let riddleNumber = null;

function startGame() {
    if (currStage != 0) {
        alert("You've already started!");
        return;
    }
    bgMusic.play();
    currStage = 0;
    moveForward();
}

function moveForward() {
    if (currStage == 4) {
        congratulate();
        alert("curr stage is 4");
    } else {
        sceneText.innerText = SCENE_TEXT[currStage];
        riddleNumber = Math.floor((Math.random() * 15));
        printRiddle(riddleNumber);
    }
}

function printRiddle(riddleNumber) {

    riddleText.innerText = RIDDLE_LIST[riddleNumber].question;
    answerText.innerText = "Scrambled answer: " + RIDDLE_LIST[riddleNumber].scramble;
    
}

function skip() {
    resultText.innerText = "Skipped!";
    moveBackward();

    let lastRiddle = riddleNumber;
    let newRiddle = null;

    //so you don't get the same riddle when you clicked skip
    while (newRiddle == lastRiddle || newRiddle == null) {
        newRiddle = Math.floor((Math.random() * 15));
    }

    printRiddle(riddleNumber);

}

function moveBackward() {
    alert("oh no! an obstacle!");
    currStage -= 1;
    sceneText.innerText = SCENE_TEXT[currStage];
}

function congratulate() {
    alert("congratulations!");
}

function checkAnswer() {
    let riddleInput = document.getElementById("riddle-input").value;
    alert(riddleInput);
    submitted = true;
   
    let isCorrect = (riddleInput == RIDDLE_LIST[riddleNumber].answer);

    if (isCorrect) {
        currStage += 1;
        resultText.innerText = "Correct!";
        moveForward();
    } else {
        resultText.innerText = "Incorrect! Try again, or press skip to forfeit a point and move on."
        moveBackward();
    }
}

//**
// pseudocode
// print the intro text or whatever
// print riddle function (generate a random number and print the riddle for that number)
// while (riddle count is less than 7) {
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