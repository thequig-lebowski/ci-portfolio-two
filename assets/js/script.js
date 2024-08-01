/**
 * Globals
 */
let firstCard;
let secondCard;
let countdown;

/**
 * Wait for DOM to finish loading
 */
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded");

    let buttons = document.getElementsByTagName("button");

    for (let button of buttons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-type") === "easy") {
                buildGrid(4, 60);
                console.log("easy game set")
            } else if (this.getAttribute("data-type") === "difficult") {
                buildGrid(6, 200);
                console.log("difficult game set")
            } else if (this.getAttribute("data-type") === "reset") {
                resetGame();
            } else {
                alert(`data-type ${this.getAttribute("data-type")} not recognised.`);
            }
        })

    }

    buildGrid(4, 60);
})


/**
 * Build either a large or small grid of cards depending on the game level
 * This function takes an argument; 4 for 'easy', 6 for 'difficult'
 */
function buildGrid(numOfRows, time) {
    console.log("building grid...", numOfRows);

    // clear the board of any old game instances 
    $(".card-container").remove();

    // Set time on countdown
    clearInterval(countdown);
    $("#time-remain").text(time);

    // Set moves counter to '0'
    $("#total-moves").text('0');

    //Declare an empty array to store the generated html 
    let grid = [];

    //Calculate total number of cards
    let numOfCards = (numOfRows * numOfRows) / 2;

    // generate html with nested for loops because we need two of each card
    for (let i = 0; i < numOfCards; i++) {
        for (let j = 0; j < 2; j++) {
            grid = `${grid}
                        <div class="card-container" data-cardNumber="${i + 1}">
                            <div class="card card-back">
                                <img class="back-image" src="assets/images/cardback.png" alt="back of card"/>
                            </div>
                            <div class="card card-front">
                                <img class="front-image" src="assets/images/sock_${i + 1}.png" alt="sock playing card"/>
                            </div>
                        </div>
                    `;
        }
    }


    // Set variable in css to display grid correctly 
    $(":root").get(0).style.setProperty("--num-of-rows", numOfRows);

    $(".game-grid").append(grid);

    let cardDeck = $('.card-container').toArray();
    // shuffleCards(cardDeck);
    addMyListeners(cardDeck);
    // countdownTimer();
}


/**
 * We read the current game level from the css variable
 * and use it to generate a new instance of the game at the same level.
 */
function resetGame() {

    let currentLevel = $(":root").css("--num-of-rows");
    console.log("current level", currentLevel);

    // clearInterval(countdown);
    if (currentLevel == 4) {
        $('[data-type="easy"]').trigger('click');
        console.log("clicking easy");
    } else {
        $('[data-type="difficult"]').trigger('click');
        console.log("clicking difficult");

    }
    // buildGrid(currentLevel, 5);
}

/**
 * Shuffle function. Creates an array of divs with class card-container
 * and assigns the 'order' style property with a random value to each div.
 */
function shuffleCards(cardDeck) {

    // creat an array of the cards to be shuffled

    console.log("cardDeck is a ", typeof cardDeck);
    // console.log(cardDeck[3]);

    // Durstenfeld variation of the Fisher-Yates shuffle
    for (let i = cardDeck.length - 1; i > 0; i--) {
        let randomIndex = Math.floor(Math.random() * (i + 1));
        cardDeck[randomIndex].style.order = i;
        cardDeck[i].style.order = randomIndex;
    }
}


/**
 * Set the timer time based on game level
 * and then countdown to 0 while updating it 
 * to the HTML. Pass 'false' as the second param
 * to stop the timer
 */
function countdownTimer() {
    let time = $("#time-remain").text();
    console.log(time);

    countdown = setInterval(() => {
        time--;
        $("#time-remain").text(time);
        if (time === 0) {
            console.log("timed out");
            clearInterval(countdown);
            //Game over
        }
    }, 1000);

}

/**
 * Add event listeners to all the cards
 * and starts the countdown timer as soon as
 * the first card is clicke
 */
function addMyListeners(cardDeck) {
    cardDeck.forEach(card => {
        card.addEventListener("click", () => {
            flipCard(card);
            if ($('.card-container.flipped').length === 1) {
                countdownTimer();
            }
        });
    });
}


/**
 * flip card by adding class 'flipped' to parent div
 * then check to see if two flipped cards match
 */
function flipCard(card) {
    //Check to see if the card is already flipped
    if (!card.classList.contains("flipped")) {
        card.classList.add("flipped");

        // get number of divs with 'flipped' class % 2 
        // to decide if this is first flip or second
        let flipFlop = $('.card-container.flipped').length;
        console.log("Number of cards currently flipped ", flipFlop);

        if (flipFlop % 2) {
            firstCard = card;
            console.log("first card ", firstCard);
        } else {
            secondCard = card;
            incrementFlipCounter();
            console.log("second card ", secondCard);

            checkMatchedPairs(firstCard, secondCard);
        }
    }
}

/**
 * Update the number of gueses the user has made
 * write it to the DOM
 */
function incrementFlipCounter() {
    let flips = $("#total-moves").text();
    flips++;
    $("#total-moves").text(flips);
    return;
}

/**
 * Check pairs
 */
function checkMatchedPairs(firstCard, secondCard) {

    //grab the card "value" to be checked against other flipped cards
    let cardValueOne = firstCard.getAttribute('data-cardNumber');
    let cardValueTwo = secondCard.getAttribute('data-cardNumber');
    // console.log("card values ", cardValueOne, cardValueTwo)

    if (cardValueOne === cardValueTwo) {
        console.log("match!");
        checkForGameWin();
    } else {
        setTimeout(() => {
            firstCard.classList.remove("flipped");
            setTimeout(() => {
                secondCard.classList.remove("flipped");
            }, 150)
        }, 900);
    }
}

/**
 * Check for total number of pairs - 2 by counting "flipped"
 * classes. Auto match the last pair, pause time etc
 */
function checkForGameWin() {
    let totalPairs = $('.card-container').toArray().length;
    let matchedPairs = $('.flipped').toArray().length;

    if (matchedPairs < totalPairs - 2) {
        return;
    } else {
        // Flip remaining pair of cards
        let unflipped = $('.card-container:not(.flipped)');
        setTimeout(() => {
            clearInterval(countdown);

            console.log("flip last pair");
            unflipped[0].classList.add('flipped');
            setTimeout(() => {
                unflipped[1].classList.add('flipped');
            }, 150);

        }, 300);
    }

}
