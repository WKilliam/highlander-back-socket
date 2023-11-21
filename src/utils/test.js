let timerValue = 20;

const CanAction = {
    START_GAME: 'START_GAME',
    WHO_TURN: 'WHO_TURN',
    START_TURN: 'START_TURN',
    SEND_DICE: 'SEND_DICE',
    CHOOSE_MOVE: 'CHOOSE_MOVE',
    MOVE: 'MOVE',
    END_MOVE: 'END_MOVE',
    END_TURN: 'END_TURN',
};

let timer;
let isChooseMoveCompleted = false;

function performAction(currentAction) {
    switch (currentAction) {
        case CanAction.START_GAME:
            console.log('Action : START_GAME');
            break;
        case CanAction.WHO_TURN:
            console.log('Action : WHO_TURN');
            break;
        case CanAction.START_TURN:
            console.log('Action : START_TURN');
            break;
        case CanAction.SEND_DICE:
            console.log('Action : SEND_DICE');
            break;
        case CanAction.CHOOSE_MOVE:
            console.log('Action : CHOOSE_MOVE');
            break;
        case CanAction.MOVE:
            console.log('Action : MOVE');
            break;
        case CanAction.END_MOVE:
            console.log('Action : END_MOVE');
            break;
        case CanAction.END_TURN:
            console.log('Action : END_TURN');
            timerValue = 20;
            startTimer();
            // setTimeout(() => startCountdown(), 1000);
            break;
        default:
            break;
    }
}

function startTimer() {
    const actions = Object.keys(CanAction);
    let currentIndex = 0;

    timer = setInterval(() => {
        console.log(`Temps restant : ${timerValue} seconde(s) - Action : ${actions[currentIndex]}`);

        if (timerValue === 0) {
            clearInterval(timer);
            console.log('Temps écoulé !');
            performAction(CanAction.END_TURN);
        } else if (actions[currentIndex] === CanAction.CHOOSE_MOVE && !isChooseMoveCompleted) {
            // Ne fait rien tant que isChooseMoveCompleted est false
            // Reste à l'action CHOOSE_MOVE jusqu'à ce que le chrono soit à 0 ou que la variable devienne true
            console.log('Choix du mouvement en cours...')
            console.log('timerValue : ', timerValue);
            timerValue--;
        } else {
            performAction(actions[currentIndex]);
            currentIndex = (currentIndex + 1) % actions.length;
            timerValue--;
        }
    }, 1000);

    console.log('Chronomètre lancé...');
}

let isInitialCountdownStarted = false;

function startCountdown() {
    if (!isInitialCountdownStarted) {
        isInitialCountdownStarted = true;
        let initialTimer = 5;

        const initialCountdown = setInterval(() => {
            console.log(`Initial Countdown : ${initialTimer} seconde(s) avant le lancement du chronomètre...`);

            if (initialTimer === 0) {
                clearInterval(initialCountdown);
                startTimer();
            }

            initialTimer--;
        }, 1000);
    }
}

startCountdown();
