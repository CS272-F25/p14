const canvas = document.getElementById("blackjack-canvas");
canvas.width = 1280;
canvas.height = 720;

const context = canvas.getContext("2d");

const usernameInput = document.getElementById("username-input")

// Initalize game variables
const MIN_BET = 50;
const STARTING_CHIPS = 200;
const SUITS = ["spades", "clubs", "diamonds", "hearts"];
const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

// visual
const CARD_WIDTH = 96;
const CARD_HEIGHT = 144;
const CARD_GAP = 110;
const DECK_POS = { x: 120, y: 140 }
const HIT_BUTTON_POS = { x: 420, y: 630, w: 160, h: 60 }
const STAND_BUTTON_POS = { x: 700, y: 630, w: 160, h: 60 }
const NEW_BUTTON_POS = { x: 980, y: 630, w: 230, h: 60 }
const QUIT_BUTTON_POS = { x: 70, y: 630, w: 230, h: 60 }
const SUBMIT_BUTTON_POS = { x: 390, y: 630, w: 230, h: 60 }
const RESTART_BUTTON_POS = { x: 660, y: 630, w: 230, h: 60 }
const cardImages = {};
// let imagesLoaded = false;

let deck = [];
let playerHand = [];
let dealerHand = [];
let hideDealer = true;
let chips = STARTING_CHIPS;
let roundsPlayed = 0
let gamestate = "player"
let animating = false;
let quitMenu = false;
let submitting = false;
const FADE_TIME = 150;

/**
 * Load images from file into memory.
 * @param {Function} onDone Function to execute on complete
 */
function loadImages(onDone) {
    let remaining = SUITS.length * VALUES.length + 1;

    function done() {
        remaining--;
        if (remaining === 0) {
            if (onDone) {
                onDone();
            }
        }
    }

    // faces
    for (let suit of SUITS) {
        for (let value of VALUES) {
            const img = new Image();
            img.src = `images/game3/cards/card-${suit}-${value}.png`;
            img.onload = done;
            img.onerror = done;
            cardImages[`${suit}_${value}`] = img;
        }
    }

    // back
    const back = new Image();
    back.src = `images/game3/cards/card-back.png`;
    back.onload = done;
    back.onerror = done;
    cardImages.back = back;
}

/**
 * Open the quit menu
 */
function quitToMenu() {
    if (animating) {
        return
    }

    quitMenu = true;
    gamestate = "quit";
    hideDealer = false;

    usernameInput.focus();

    draw();
}

/**
 * Submit the player's score to the firestore database
 */
function submitScore() {
    // Prevents multiple submissions
    if (submitting || animating) {
        return;
    }

    // Discards bad scores
    const USERNAME = usernameInput.value.trim()
    if (chips <= 200 || !validateUsername(USERNAME)) {
        return;
    }

    submitting = true;

    // insecure but ¯\_(ツ)_/¯ no backend
    fetch("https://firestore.googleapis.com/v1/projects/lis-472-leaderboard/databases/(default)/documents/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:
            JSON.stringify({
                fields: {
                    username: { stringValue: USERNAME },
                    score: { integerValue: String(chips) },
                    gameID: { stringValue: "game3" }
                }
            })
    }).then(res => {
        if (!res.ok) {
            return res.text().then(msg => {
                console.error(`${res.status}: ${msg}`)
            })
        }
        return res.json();
    }).finally(() => {
        newGame();
    })
}

/**
 * Initialize a new game
 */
function newGame() {
    if (animating) {
        return;
    }

    submitting = false;

    roundsPlayed = 0;
    chips = STARTING_CHIPS;

    quitMenu = false;
    deck = shuffle(generateDeck());
    startRound();
}

/**
 * Initializes a deck containing tuples of all possible cards
 * @returns {[{suit:string, value:string}]} Generated deck with tuples for every card in the form {suit, value}
 */
function generateDeck() {
    deck = [];
    for (let suit of SUITS) {
        for (let value of VALUES) {
            deck.push({ suit, value });
        }
    }
    return deck;
}

/**
 * Randomly shuffles a provided deck using the Fisher-Yates shuffling algorithm.
 * @param {[{suit:string, value:string}]} deckIn The deck to shuffle
 * @returns {[{suit:string, value:string}]} A shuffled deck
 */
function shuffle(deckIn) {
    // If the deck is too small to shuffle at all, add a new deck
    if (deckIn.length <= 8) {
        let newDeck = generateDeck()
        deckIn = deckIn.concat(newDeck);
    }

    // Fisher-Yates shuffle algorithm
    for (let i = deckIn.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // random index between 0 and i

        // swap elements and positions i and j
        let tmp = deckIn[i]
        deckIn[i] = deckIn[j]
        deckIn[j] = tmp
    }
    return deckIn;
}

/**
 * Evaluate the value of a given hand.
 * @param {[{suit:string, value:string}]} hand Hand to evaluate
 * @returns {number} The numerical value of a hand
 */
function evaluateHand(hand) {
    let totalValue = 0;
    let aceCount = 0;

    for (let card of hand) {
        if (card.value === "A") { // Add 11 for each ace to start
            totalValue += 11;
            aceCount++;
        } else if (["K", "Q", "J"].includes(card.value)) { // face cards worth 10
            totalValue += 10;
        } else { // Convert number cards to number
            totalValue += Number(card.value);
        }
    }

    // Convert aces to 1s if they would cause the player to be over 21 as 11s
    while (totalValue > 21 && aceCount > 0) {
        totalValue -= 10;
        aceCount--;
    }

    return totalValue;
}

/**
 * Initialise a card's visual information
 * @param {{suit:string, value:string}} card Object representing a card
 * @param {number} x X position of the card
 * @param {number} y Y position of the card
 * @param {boolean} faceUp Whether the card is face down or face up
 */
function initCard(card, x, y, faceUp) {
    card.x = x;
    card.y = y;
    card.alpha = 0; // Start invisible
    card.faceUp = faceUp;
}

/**
 * Toggles opacity off for each card in set
 * @param {[{x:number, y:number, alpha:number, faceUp:boolean, suit:string, value:string}]} cards List of card objects to toggle
 */
function fadeOut(cards) {
    cards.forEach(card => {
        card.alpha = 0
    });
}

/**
 * Toggles opacity on for each card in set
 * @param {[{x:number, y:number, alpha:number, faceUp:boolean, suit:string, value:string}]} cards List of card objects to toggle
 */
function fadeIn(cards) {
    cards.forEach(card => {
        card.alpha = 1
    });
}

/**
 * Lays out each card in a hand based on the x and y of the center
 * @param {[{suit:string, value:string}]} hand Hand to lay out
 * @param {number} centerX Target x position of the center of the hand
 * @param {number} y Target y position of the hand
 */
function layoutHand(hand, centerX, y) {
    const startX = centerX - ((hand.length - 1) * CARD_GAP) / 2 // position of first card
    for (let i = 0; i < hand.length; i++) { // lay out each card
        hand[i].x = startX + i * CARD_GAP;
        hand[i].y = y;
    }
}

/**
 * Draw the next card in the deck, or create a new one if necessary
 * @returns Next card from the deck
 */
function drawCard() {
    if (deck.length === 0) {
        deck = shuffle(generateDeck())
    }
    return deck.pop()
}

/**
 * Deal a card to the given hand and location.
 * @param {[{suit:string, value:string}]} hand Hand to send the card to
 * @param {boolean} faceUp Whether the card should be face up or not
 * @param {number} centerX X position of the center of the card
 * @param {number} y Y position of the center of the card
 * @param {function} callback Callback function to execute on complete
 */
function dealToHand(hand, faceUp, centerX, y, callback) {
    if (animating) {
        return;
    }
    animating = true;
    fadeOut(hand);

    // Timeout for animation
    setTimeout(() => {
        const card = drawCard();
        initCard(card, DECK_POS.x, DECK_POS.y, faceUp)
        hand.push(card);

        layoutHand(hand, centerX, y)
        fadeIn(hand);

        setTimeout(() => {
            animating = false;
            if (callback) {
                callback();
            }
            draw();
        }, FADE_TIME);
    }, FADE_TIME);

    draw();
}

// Game Logic

/**
 * Start the round. Initialize variables and deal cards to hands
 */
function startRound() {
    if (animating || chips < MIN_BET) {
        return;
    }

    quitMenu = false;
    playerHand = [];
    dealerHand = [];
    hideDealer = true;
    gamestate = "player";

    dealToHand(playerHand, true, canvas.width / 2, 520, () => {
        dealToHand(dealerHand, true, canvas.width / 2, 230, () => {
            dealToHand(playerHand, true, canvas.width / 2, 520, () => {
                const dealerHole = drawCard();
                initCard(dealerHole, DECK_POS.x, DECK_POS.y, false);
                dealerHand.push(dealerHole);
                layoutHand(dealerHand, canvas.width / 2, 230);
                fadeIn(dealerHand);
                draw();
            })
        })
    })
}

/**
 * Player clicks hit. If not player's turn, do nothing. Otherwise, draw a new card and end the round if it's worth more than 21.
 */
function playerHit() {
    if (animating || gamestate !== "player") {
        return
    }

    dealToHand(playerHand, true, canvas.width / 2, 520, () => {
        if (evaluateHand(playerHand) > 21) {
            endRound();
        }
    })
}

/**
 * Player clicks stand. If not player's turn, do nothing. Otherwise, start dealer's turn.
 */
function playerStand() {
    if (animating || gamestate !== "player") {
        return
    }
    dealerTurn();
}

/**
 * Dealer's turn. Reveal dealer's hidden card, and draw more until the dealer's hand is worth 17 or more.
 */
function dealerTurn() {
    gamestate = "dealer";
    hideDealer = false;
    if (dealerHand[1]) {
        dealerHand[1].faceUp = true;
    }

    function dealerStep() {
        if (evaluateHand(dealerHand) < 17) {
            dealToHand(dealerHand, true, canvas.width / 2, 230, dealerStep)
        } else {
            endRound();
        }
    }
    dealerStep();
}

/**
 * End the round. Evalute the values of each hand and compare, then add or subtract chips based on who won.
 */
function endRound() {
    gamestate = "end";

    const playerHandValue = evaluateHand(playerHand);
    const dealerHandValue = evaluateHand(dealerHand);

    if (playerHandValue > 21) {
        chips -= MIN_BET;
    } else if (dealerHandValue > 21 || playerHandValue > dealerHandValue) {
        if (playerHand.length === 2 && playerHandValue === 21) {
            chips += MIN_BET * 1.5;
        } else {
            chips += MIN_BET;
        }
    } else if (dealerHandValue > playerHandValue) {
        chips -= MIN_BET;
    }

    roundsPlayed++;
    draw();
}

// Drawing

/**
 * Draws a card on the canvas.
 * @param {{x:number, y:number, alpha:number, faceUp:boolean, suit:string, value:string}} card Card to display
 * @param {boolean} forceback Whether to force the back of the card to show
 */
function drawCardCanvas(card, forceback = false) {
    context.save();
    context.globalAlpha = card.alpha;

    const left = card.x - CARD_WIDTH / 2;
    const top = card.y - CARD_HEIGHT / 2;

    const img = (!card.faceUp || forceback) ? cardImages.back : cardImages[`${card.suit}_${card.value}`];

    if (img) {
        context.drawImage(img, left, top, CARD_WIDTH, CARD_HEIGHT);
    } else {
        // oopsie
        console.error("card not loaded.")
        context.strokeRect(left, top, CARD_WIDTH, CARD_HEIGHT)
    }

    context.restore()
}

/**
 * Draw a button on the canvas
 * @param {{x:number, y:number, w:number, h:number}} button Position information about the button
 * @param {string} text text to display on the button
 * @param {boolean} enabled whether the button should be enabled or not
 */
function drawButton(button, text, enabled) {
    context.save();
    context.globalAlpha = enabled ? 1 : 0.4;
    context.strokeRect(button.x, button.y, button.w, button.h);
    context.font = "26px sans-serif"
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, button.x + button.w / 2, button.y + button.h / 2)
    context.restore();
}

/**
 * Validates a provided username string
 * @param {string} username Username to evaluate
 * @returns {boolean} True if the username validates, false otherwise
 */
function validateUsername(username) {
    return /^[\d\w]+$/.test(username) && username !== "Enter username";
}

/**
 * Draw the elements of the board
 */
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Background
    context.fillStyle = "#35654d"
    context.fillRect(0, 0, canvas.width, canvas.height)

    context.fillStyle = "#000000"

    if (!quitMenu) { // Draw playing board
        context.font = "28px sans-serif";
        context.textAlign = "left";
        context.fillText(`Chips: ${chips}`, 40, 40);
        context.fillText(`Rounds: ${roundsPlayed}`, 40, 75);

        context.textAlign = "center";
        context.fillText("Dealer", canvas.width / 2, 100)
        context.fillText("Player", canvas.width / 2, 400)

        dealerHand.forEach((c, i) => { // draw dealer's hand
            drawCardCanvas(c, hideDealer && i === 1)
        })
        playerHand.forEach((c) => { // Draw player's hand
            drawCardCanvas(c)
        })

        context.font = "24px sans-serif";
        context.fillText(`Dealer: ${hideDealer ? "?" : evaluateHand(dealerHand)}`, canvas.width / 2, 140)
        context.fillText(`Player: ${evaluateHand(playerHand)}`, canvas.width / 2, 430)

        // Buttons
        drawButton(HIT_BUTTON_POS, "Hit", gamestate === "player");
        drawButton(STAND_BUTTON_POS, "Stand", gamestate === "player");
        drawButton(NEW_BUTTON_POS, "Next Round", chips >= MIN_BET && gamestate === "end");
        drawButton(QUIT_BUTTON_POS, "Quit", !animating);

        usernameInput.style.display = "none";
    } else { // Quit menu
        context.textAlign = "center";
        context.font = "64px sans-serif";
        context.fillText("Quit Menu", canvas.width / 2, canvas.height / 2);

        context.font = "24px sans-serif";
        context.fillText(`Chips: ${chips}`, canvas.width / 2, 395);
        context.fillText(`Rounds played: ${roundsPlayed}`, canvas.width / 2, 425);
        context.fillText("Enter username:", canvas.width / 2, 460);

        // Buttons
        drawButton(SUBMIT_BUTTON_POS, "Submit Score", !animating && chips > 200);
        drawButton(RESTART_BUTTON_POS, "New Game", !animating);

        usernameInput.style.display = "block"; // Note: usernameInput is a HTML element that is hidden when not needed
    }
}

/**
 * Returns true if x,y is in rect r. Used for buttons.
 * @param {number} x X position to evalutate
 * @param {number} y Y position to evaluate
 * @param {{x:number, y:number, w:number, h:number}} r Rectangle to compare against
 * @returns {boolean} True if x,y is inside the rectangle, false otherwise
 */
function inRect(x, y, r) {
    return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h
}

// Listen for clicks and check if they're inside a button
canvas.addEventListener("click", e => {
    const x = e.offsetX;
    const y = e.offsetY;

    if (quitMenu) { // Quit menu only
        if (inRect(x, y, SUBMIT_BUTTON_POS)) {
            submitScore();
        } else if (inRect(x, y, RESTART_BUTTON_POS)) {
            newGame();
        }
    } else { // Playing board only
        if (inRect(x, y, HIT_BUTTON_POS)) {
            playerHit();
        } else if (inRect(x, y, STAND_BUTTON_POS)) {
            playerStand();
        } else if (inRect(x, y, NEW_BUTTON_POS) && gamestate === "end") {
            startRound();
        } else if (inRect(x, y, QUIT_BUTTON_POS)) {
            quitToMenu();
        }
    }


})

// Load images, create a deck, start round and draw canvas
loadImages(() => {
    deck = shuffle(generateDeck());
    startRound();
    draw();
})