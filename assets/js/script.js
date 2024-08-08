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
    displayModal(".welcome-modal");
    let buttons = document.getElementsByTagName("button");

    for (let button of buttons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-type") === "easy") {
                // Remove, as 'small-gap' is only needed for the difficult game
                $('.game-grid').removeClass('small-gap');
                buildGrid(4, 60);
            } else if (this.getAttribute("data-type") === "difficult") {
                buildGrid(6, 200);
                addQueryClass();
            } else if (this.getAttribute("data-type") === "reset") {
                resetGame();
            }
        });
    }
    buildGrid(4, 60);
});

/**
 * Modal toggle on and off
 */
function displayModal(myModal) {
    // select all children of dialog and and set to display:none to clear previous popups
    $(`.modal`).children().css("display", "none");
    // target the correct div inside the modal to be diplayed
    $(`${myModal}`).css("display", "block");
    let modal = document.querySelector(`.modal`);
    modal.showModal();

    let closeModal = document.querySelector(`${myModal} > .close-button`);
    closeModal.addEventListener("click", () => {
        resetGame();
        modal.classList.add('close');
        // borrowed code to close dialog after animation
        modal.addEventListener('animationend', () => {
            modal.classList.remove('close');
            modal.close();
        }, { once: true }); // this prevents buhs when re-opeing modal
    });
}

/**
 * Build either a large or small grid of cards depending on the game level
 * This function takes an argument; 4 for 'easy', 6 for 'difficult'
 */
function buildGrid(numOfRows, time) {
    // clear the board of any old game instances 
    $(".card-container").remove();

    // Set time on countdown
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
    // Place all the generated html
    $(".game-grid").append(grid);

    let cardDeck = $('.card-container').toArray();
    shuffleCards(cardDeck);
    addMyListeners(cardDeck);
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

    if (currentLevel == 4) {
        $('[data-type="easy"]').trigger('click');
    } else {
        $('[data-type="difficult"]').trigger('click');
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
    clearInterval(countdown);
    if (toggle) {
        countdown = setInterval(() => {
            time--;
            $("#time-remain").text(time);
            if (time === 0) {
                clearInterval(countdown);
                displayModal(".game-over");
            }
        }, 1000);
    } else {
        clearInterval(countdown);
    }
}

/**
 * Add event listeners to all the cards
 * and starts the countdown timer as soon as
 * the first card is clicke
 */
function addMyListeners(cardDeck) {
    cardDeck.forEach(card => {
        card.addEventListener("click", () => {
            unflipCards(10);
            flipCard(card);
            if ($('.card-container.flipped').length === 1) {
                countdownTimer(true);
            }
        });
        // JS version of css :hover so that it can be paused
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

        card.setAttribute('data-guess', 'guess');

        // get number of divs with 'flipped' class % 2 
        // to decide if this is first flip or second
        let flipFlop = $('.card-container.flipped').length;

        if (flipFlop % 2) {
            firstCard = card;
        } else {
            secondCard = card;
            incrementFlipCounter();
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
 * Check if the two currently selected cards are a match
 * unflip them if not or animate match and check game win if 
 * they are
 */
function checkMatchedPairs(checkFirst, checkSecond) {
    //grab the card "value" to be checked against other flipped cards
    let cardValueOne = checkFirst.getAttribute('data-cardNumber');
    let cardValueTwo = checkSecond.getAttribute('data-cardNumber');

    if (cardValueOne === cardValueTwo) {
        checkFirst.removeAttribute('data-guess');
        checkSecond.removeAttribute('data-guess');
        // experimental bit here...
        checkFirst.setAttribute('data-guess', 'match');
        checkSecond.setAttribute('data-guess', 'match');
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
    }, 900);
}

/**
 * Simply unflip incorrect gueses
 */
function unflipCards(flipTimeout) {
    let wrongGuesses = $('[data-guess="guess"]');
    if (wrongGuesses.length >= 2) {
        setTimeout(() => {
            wrongGuesses[0].classList.remove("flipped");
            setTimeout(() => {
                wrongGuesses[1].classList.remove("flipped");
                wrongGuesses[0].removeAttribute("data-guess");
                wrongGuesses[1].removeAttribute("data-guess");
            }, 150);
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
        // remove border from last pair
        addSelected(unflipped[0], unflipped[1]);
        setTimeout(() => {
            unflipped[0].classList.add('flipped');
            setTimeout(() => {
                unflipped[1].classList.add('flipped');
            }, 150);
        }, 300);
        getScoreBord();
        //Set a delay for the matched-pair-animation on the final pair
        setTimeout(() => {
            unflipped[0].classList.add('animate-matched-pair');
            setTimeout(() => {
                unflipped[1].classList.add('animate-matched-pair');
            }, 150);
        }, 650);
        setTimeout(() => {
            displayModal(".winner");
        }, 1500);
        countdownTimer(false);
    }
}

/**
 * Get's all relevent score data and writes it to winner modal 
 */
function getScoreBord() {
    let gridLevel = $(":root").css("--num-of-rows");
    let totalMoves = $('#total-moves').text();
    let timeRemain = $('#time-remain').text();
    let totalTime = 200;
    let totalMatches = 18;
    //We can infer the total time and number of matches based off gridLevel.
    if(gridLevel == 4) {
        totalTime = 60;
        totalMatches = 8;
    } 

    let elapsedTime = totalTime - timeRemain;
    $('#time-left').text(elapsedTime);
    $('#total-of-pairs').text(totalMatches);
    $('#num-of-moves').text(totalMoves);
}

/**
 * Add classes only when difficult game is selected so that it responds differently
 * to the easy game.
 */
function addQueryClass() {
    //Add class to image to be targeted by media queries
    $('.front-image').addClass('small-card');
    $('.back-image').addClass('small-card');
    //Add class to game-grid for grid gaps to be targeted by mq's
    $('.game-grid').addClass('small-gap');
}