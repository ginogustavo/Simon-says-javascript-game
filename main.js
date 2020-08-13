const green = document.getElementById("green");
const red = document.getElementById("red");
const yellow = document.getElementById("yellow");
const blue = document.getElementById("blue");
const btnStart = document.getElementById("btnStart");
const levelInd = document.getElementById("levelIndicator");
const gamerInd = document.getElementById("gamerIndicator");

//Sounds
const sound_do = document.getElementById("sound_do");
const sound_re = document.getElementById("sound_re");
const sound_mi = document.getElementById("sound_mi");
const sound_fa = document.getElementById("sound_fa");

const LAST_LEVEL = 10;

/**
 * Check documentation of https://sweetalert.js.org/
 * https://cdnjs.com/libraries/sweetalert
 */

class Game {
  constructor() {
    this.start = this.start.bind(this);
    this.start();
    this.generateSequence();
    setTimeout(this.nextLevel, 500);
  }

  start() {
    //To replace the need to call in each case of chooseColor. this bind will be always we call the function.
    this.chooseColor = this.chooseColor.bind(this);
    this.nextLevel = this.nextLevel.bind(this);
    // this.nextLevel = this.nextLevel.bind(this);

    this.toggleBtnStart();

    //Adding 'hide' style, to the classes that the object has.
    // btnStart.classList.add("hide");

    this.level = 1; // when users make progress level changes
    levelInd.innerHTML = this.level;
    this.colors = {
      // instead of  red: red  (propertyName: object defined above)
      // Since both have the same name, JS allow us to just use the single name for name and value.
      green,
      red,
      yellow,
      blue,
    };

    this.sounds = {
      sound_do,
      sound_re,
      sound_mi,
      sound_fa,
    };
  }

  playSound(color) {
    switch (color) {
      case "green":
        this.sounds.sound_do.play();
        break;
      case "red":
        this.sounds.sound_re.play();
        break;
      case "yellow":
        this.sounds.sound_mi.play();
        break;
      case "blue":
        this.sounds.sound_fa.play();
        break;
    }
  }

  generateSequence() {
    //Generate array sequence
    this.sequence = new Array(LAST_LEVEL)
      .fill(0)
      .map((n) => Math.floor(Math.random() * 4));

    // map() doesn't work if elements are empty, thus we fill() the array first.
    //Math.random: return random decimal betwen 0 - 1
    //Math.floor: round to down, Ex. 3.9-> 3,  0.45-> 0

    //Optinally we can use for each
    // this.sequence = []
    // new Array(10).fill(0).forEach(n=>
    //     this.sequence.push(Math.floor(Math.random() * 4))
    // )
  }
  nextLevel() {
    this.subLevel = 0;
    this.highlightSequence();
    this.addOnclickEvents();
    // this.labelSimonTurn(false)
  }

  numberToColor(num) {
    switch (num) {
      case 0:
        return "green";
      case 1:
        return "red";
      case 2:
        return "yellow";
      case 3:
        return "blue";
    }
  }

  colorToNumber(color) {
    switch (color) {
      case "green":
        return 0;
      case "red":
        return 1;
      case "yellow":
        return 2;
      case "blue":
        return 3;
    }
  }

  highlightSequence() {
    this.labelSimonTurn(true); // Change temporalily to Simons label
    setTimeout(() => {
      this.labelSimonTurn(false);
    }, this.level * 1000); // after the iteration change to gamer turn

    for (let i = 0; i < this.level; i++) {
      //let, the value is kept during this block (for) . Always "const" before "let" before "var"
      const color = this.numberToColor(this.sequence[i]);
      setTimeout(() => this.playSound(color), 1000 * i);
      setTimeout(() => this.turnOn(color), 1000 * i); // each color turn on first in 0, 2nd in 1sec, etc
    }
  }

  turnOn(color) {
    this.colors[color].classList.add("light");
    setTimeout(() => this.turnOff(color), 500);
  }

  turnOff(color) {
    this.colors[color].classList.remove("light");
  }

  /**
   * Add Click events to the buttons.
   * It tells the browsers what functions it fires when clicked (asynchronously)
   */
  addOnclickEvents() {
    //var self = this;   .bind(self)
    this.colors.green.addEventListener("click", this.chooseColor); //<- to keep "this" as the "game" object we use bind(this)
    this.colors.red.addEventListener("click", this.chooseColor);
    this.colors.yellow.addEventListener("click", this.chooseColor);
    this.colors.blue.addEventListener("click", this.chooseColor);
  }
  removeClickEvents() {
    this.colors.green.removeEventListener("click", this.chooseColor);
    this.colors.red.removeEventListener("click", this.chooseColor);
    this.colors.yellow.removeEventListener("click", this.chooseColor);
    this.colors.blue.removeEventListener("click", this.chooseColor);
  }
  /**
   * When we using an event Manager, functions are usually called with the event parameter
   * The context changes, try using "this", which in this case is the buttons.
   */
  chooseColor(event) {
    //if we want "this" is the object game. USE bind() when adding event listener
    // console.log(
    //   "Seq: " +
    //     this.sequence +
    //     " | Level: " +
    //     this.level +
    //     " | SubLevel: " +
    //     this.subLevel
    // );

    const colorName = event.target.dataset.color;
    const colorNumber = this.colorToNumber(colorName);
    this.turnOn(colorName);
    this.playSound(colorName)
    //Compare color number with sequence in position of subLevel it is in.
    if (colorNumber === this.sequence[this.subLevel]) {
      this.subLevel++;
      if (this.subLevel === this.level) {
        this.level++;
        levelInd.innerHTML = this.level;

        //If user pass next level, remove click events (should not be able to select)
        this.removeClickEvents();

        if (this.level === LAST_LEVEL + 1) {
          this.winGame();
        } else {
          //if not last level, user has to advance
          // setTimeout(() => this.nextLevel.bind(this), 2000);
          setTimeout(this.nextLevel, 1500);
        }
      }
    } else {
      this.loseGame();
    }
  }

  winGame() {
    swal("Simon Says", "You won!", "success") // it returns a promise
      .then(this.start);
  }

  loseGame() {
    let msg = this.getSequence();
    swal("Simon Says", "You lost! :( \n\n " + msg, "error") // it returns a promise
      .then(() => {
        this.removeClickEvents();
        this.start();
      });
  }

  //When lost, show correct sequence until the current level
  getSequence() {
    let str = "Colors: \n";
    for (let i = 0; i < this.level; i++) {
      let color = this.numberToColor(this.sequence[i]);
      str += "-" + color.toUpperCase() + "\n";
    }
    return str;
  }
  //When re-start the game, clean/hide the sequence
  hideSequence() {}

  showCurrentLevel(booleanValue, level) {}

  toggleBtnStart() {
    if (btnStart.classList.contains("hide")) {
      btnStart.classList.remove("hide");
    } else {
      btnStart.classList.add("hide");
    }
  }

  labelSimonTurn(value) {
    if (value) {
      //turn of Simons
      gamerInd.classList.remove("yourTurn");
      gamerInd.classList.add("simonTurn");

      gamerInd.innerHTML = "Simons turns";
    } else {
      //Turn of you player
      gamerInd.classList.remove("simonTurn");
      gamerInd.classList.add("yourTurn");
      gamerInd.innerHTML = "Your Turn";
    }
  }
}

function startGame() {
  //   var game = new Game();
  window.game = new Game();
}
