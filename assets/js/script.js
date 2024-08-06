/**
 * Globals
 */
let firstCard;
let secondCard;
let countdown = 0;


/**
 * Wait for DOM to finish loading
 */
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded");
    displayModal(".welcome-modal");
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
            }
            // else {
            // alert(`data-type ${this.getAttribute("data-type")} not recognised.`);
            // }
        });
    }
    // countdownTimer(false);
    buildGrid(4, 60);
})

/**
 * Modal toggle on and off
 */
function displayModal(myModal) {
    // select all children of dialog and and set to display:none to clear previous popups
    $(`.modal`).children().css("display", "none");

    $(`${myModal}`).css("display", "block");
    let modal = document.querySelector(`.modal`);
    console.log("modal", modal);
    modal.showModal();

    // let currentModal = document.querySelector(`${myModal}`);
    // let modalButtons = currentModal.getElementsByTagName("button");
    // console.log("modal buttons = ", modalButtons);
    // for (let item of modalButtons) {
    //     item.addEventListener("click", function () {
    //         if (this.getElementsByClassName("close-button")) {
    //             modal.close();
    //             console.log("close dialog",item.classList);
    //             resetGame();
    //         } else if (this.getElementsByClassName("leader-board-button")) {
    //             console.log("leader board button press", item.classList);
    //         } 
    //     })
    // }


    let closeModal = document.querySelector(`${myModal} > .close-button`);
    closeModal.addEventListener("click", () => {
        modal.close();
        resetGame();
    });

    // let leaderBoard = document.querySelector(`${myModal} > .leader-board-button`);
    // leaderBoard.addEventListener("click", () => {
    //     console.log("leader board button press!");
    // });
}

/**
 * Build either a large or small grid of cards depending on the game level
 * This function takes an argument; 4 for 'easy', 6 for 'difficult'
 */
function buildGrid(numOfRows, time) {
    console.log("building grid...", numOfRows);

    // clear the board of any old game instances 
    $(".card-container").remove();

    // Set time on countdown
    // clearInterval(countdown);
    countdownTimer(false);
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
 * Shuffle function. Creates an array of divs with class card-container
 * and assigns the 'order' style property with a random value to each div.
 */
function shuffleCards(cardDeck) {
    // Durstenfeld variation of the Fisher-Yates shuffle
    for (let i = cardDeck.length - 1; i > 0; i--) {
        let randomIndex = Math.floor(Math.random() * (i + 1));
        cardDeck[randomIndex].style.order = i;
        cardDeck[i].style.order = randomIndex;
    }
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
}

/**
 * Set the timer time based on game level
 * and then countdown to 0 while updating it 
 * to the HTML. Pass 'false' as the second param
 * to stop the timer
 */
function countdownTimer(toggle) {
    let time = $("#time-remain").text();
    console.log(toggle);
    clearInterval(countdown);
    if (toggle) {
        countdown = setInterval(() => {
            time--;
            $("#time-remain").text(time);
            if (time === 0) {
                clearInterval(countdown);
                console.log("clearinterval");
                displayModal(".game-over");
            }
        }, 1000);
    } else {
        clearInterval(countdown);
        console.log("countdown pausing", toggle);
    }

}

/**
 * pause timer
 */
// function pauseTimer() {
//     clearInterval(countdown);
// }


/**
 * Add event listeners to all the cards
 * and starts the countdown timer as soon as
 * the first card is clicke
 */
function addMyListeners(cardDeck) {
    console.log("cardDeck is ... ", cardDeck);
    cardDeck.forEach(card => {
        card.addEventListener("click", () => {
            console.log("clicking on a card");
            unflipCards(10);
            flipCard(card);
            if ($('.card-container.flipped').length === 1) {
                countdownTimer(true);
                // } else if ($('.card-container.flipped').length > 2) {
            }
        });
        // JS version of css :hover
        card.addEventListener("mouseover", () => {
            if (isSelectable()) {
                card.classList.add("scale");
            }
        });
        card.addEventListener("mouseleave", () => {
            card.classList.remove("scale");
        });
    });
}

/**
 * Pauses hover effect until wrong guesses are unflipped
 * returns false if there are two wrong gueses on the board
 */
function isSelectable() {
    let selectable = $('[data-guess="guess"');
    if (selectable.length === 2) {
        return false;
    } else {
        return true;
    }
}

/**
 * flip card by adding class 'flipped' to parent div
 * then check to see if two flipped cards match
 */
function flipCard(card) {

    if (!card.classList.contains("flipped") && (isSelectable() === true)) {
        card.classList.add("flipped");

        // card.children[1].classList.add('selected');
        card.setAttribute('data-guess', 'guess');

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
function checkMatchedPairs(checkFirst, checkSecond) {
    //grab the card "value" to be checked against other flipped cards
    let cardValueOne = checkFirst.getAttribute('data-cardNumber');
    let cardValueTwo = checkSecond.getAttribute('data-cardNumber');

    let cardData1 = checkFirst.getAttribute('data-guess');
    let cardData2 = checkSecond.getAttribute('data-guess');
    console.log("cardData 1 and 2", cardData1, cardData2);

    console.log("card values ", cardValueOne, cardValueTwo)

    if (cardValueOne === cardValueTwo) {
        console.log("match!");
        checkFirst.removeAttribute('data-guess');
        checkSecond.removeAttribute('data-guess');
        checkForGameWin(checkFirst, checkSecond);
        setTimeout(() => {
            checkFirst.classList.add('animate-matched-pair');
            setTimeout(() => {
                checkSecond.classList.add('animate-matched-pair');
            }, 150);
        }, 350);
        return;
    } else {
        unflipCards(900);
    }
}


/**
 * Get all currently guesed cards and add a highlight boarder to them
 * In reality the highlight colour is default but to animate it we cheat
 * it and do it a little backwards.
 */
function addSelected(card1, card2) {
    setTimeout(() => {
        card1.children[1].classList.add('selected');
        card2.children[1].classList.add('selected');
        console.log("removing selected border...");
    }, 900);
}


/**
 * Simply unflip incorrect gueses
 */
function unflipCards(flipTimeout) {
    let wrongGuesses = $('[data-guess="guess"');
    if (wrongGuesses.length >= 2) {
        setTimeout(() => {
            wrongGuesses[0].classList.remove("flipped");
            setTimeout(() => {
                wrongGuesses[1].classList.remove("flipped");
                wrongGuesses[0].removeAttribute("data-guess");
                wrongGuesses[1].removeAttribute("data-guess");
            }, 150)
        }, flipTimeout);
    }
}



/**
 * Check for total number of pairs - 2 by counting "flipped"
 * classes. Auto match the last pair, pause time etc
 */
function checkForGameWin(param1, param2) {
    addSelected(param1, param2);
    let totalPairs = $('.card-container').toArray().length;
    let matchedPairs = $('.flipped').toArray().length;

    if (matchedPairs < totalPairs - 2) {
        return;
    } else {
        // Flip remaining pair of cards
        let unflipped = $('.card-container:not(.flipped)');
        setTimeout(() => {
            console.log("flip last pair");
            unflipped[0].classList.add('flipped');
            setTimeout(() => {
                unflipped[1].classList.add('flipped');
            }, 150);
        }, 300);
        //Set a delay for the matched-pair-animation on the final pair
        setTimeout(() => {
            unflipped[0].classList.add('animate-matched-pair');
            setTimeout(() => {
                unflipped[1].classList.add('animate-matched-pair');
            }, 150);
        }, 650);
        setTimeout(() => {
            displayModal(".winner");
        }, 2000);
        // clearInterval(countdown);
        countdownTimer(false);
        console.log("clearinterval");
    }

}