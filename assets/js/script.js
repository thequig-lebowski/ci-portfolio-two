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
 * Test funciont to build out a grid of cards,
 * size of which is depending on a user input
 */
function buildGrid(numOfRows) {
    console.log("building grid...", numOfRows);

    // clear the board of any old game instances 
    $(".card-back").remove();

    //Declare an empty array to store the generated html 
    let grid = [];

    //Calculate total number of cards
    let numOfCards = (numOfRows * numOfRows) / 2;

    // generate html with nested for loops because we need two of each card
    for (let i = 0; i < numOfCards; i++) {
        for (let j = 0; j < 2; j++) {
            grid = `${grid}
                        <div class="card-back">
                            <img class="back-image" src="assets/images/cardback.png" alt="back of playing card"/>
                        </div>
                    `;
        }
    }


    // Set variable in css to display grid correctly 
    $(":root").get(0).style.setProperty("--num-of-rows", numOfRows);

    $(".game-grid").append(grid);
}


/**
 * We read the current
 * game level from the css variable and use it to generate a new
 * instance of the game at the same level.
 */
function resetGame() {

    let currentLevel = $(":root").css("--num-of-rows");
    console.log("game reset", currentLevel);
    buildGrid(currentLevel);
}