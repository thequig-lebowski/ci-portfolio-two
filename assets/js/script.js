// Wait for DOM to finish loading

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM loaded");

    let buttons = document.getElementsByTagName("button");

    for (let button of buttons) {
        button.addEventListener("click", function () {
            if (this.getAttribute("data-type") === "easy") {
                buildGrid(4);
                console.log("easy game set")
            } else if (this.getAttribute("data-type") === "difficult") {
                buildGrid(6);
                console.log("difficult game set")
            } else if (this.getAttribute("data-type") === "reset") {
                resetGame();
            } else {
                alert(`data-type ${this.getAttribute("data-type")} not recognised.`);
            }
        })

    }

    buildGrid(4);
})


/**
 * Build either a large or small grid of cards depending on the game level
 * This function takes an argument; 4 for 'easy', 6 for 'difficult'
 */
function buildGrid(numOfRows) {
    console.log("building grid...", numOfRows);

    // clear the board of any old game instances 
    $(".card-container").remove();

    //Declare an empty array to store the generated html 
    let grid = [];

    //Calculate total number of cards
    let numOfCards = (numOfRows * numOfRows) / 2;

    // generate html with nested for loops because we need two of each card
    for (let i = 0; i < numOfCards; i++) {
        for (let j = 0; j < 2; j++) {
            grid = `${grid}
                        <div class="card-container">
                            <div class="card-front">
                                <img class="front-image" src="assets/images/sock_${i + 1}.png" alt="sock playing card"/>
                            </div>
                        </div>
                    `;
        }
    }


    // Set variable in css to display grid correctly 
    $(":root").get(0).style.setProperty("--num-of-rows", numOfRows);

    $(".game-grid").append(grid);

    shuffleCards();
}


/**
 * We read the current game level from the css variable
 * and use it to generate a new instance of the game at the same level.
 */
function resetGame() {

    let currentLevel = $(":root").css("--num-of-rows");
    console.log("game reset", currentLevel);
    buildGrid(currentLevel);
}

/**
 * Shuffle function. Creates an array of divs with class card-container
 * and assigns the 'order' style property with a random value to each div.
 */
function shuffleCards() {

    // creat an array of the cards to be shuffled
    let cardDeck = $('.card-container');
    console.log(cardDeck.length);

    // Durstenfeld variation of the Fisher-Yates shuffle
    // 
    for ( let i = cardDeck.length - 1; i > 0; i--) {
         let randomIndex = Math.floor(Math.random() * (i + 1));
         cardDeck[randomIndex].style.order = i;
         cardDeck[i].style.order = randomIndex;    
    }
}