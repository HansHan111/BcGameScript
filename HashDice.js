var config = {
    mainTitle: {
        label: '****Hams\'s Script for HashDice*******',
        type: 'title'
    },
    auto: {
        label: '',
        value: 'Script',
        type: 'radio',
        options: [
            {
                value: 'Script',
                label: 'Script chooses BaseBet'
            },
            {
                value: 'Player',
                label: 'Player chooses BaseBet'
            }
        ]
    },
    baseBet: {
        label: '',
        value: currency.amount / 4096,
        type: 'number'
    },
    maxBaseBet: {
        label: '',
        value: currency.maxAmount / 4096,
        type: 'number'
    }
}

const TEST = false;
const BrokenCount_1 = 6;
const BrokenCount_2 = 4;
const RESOLUTION = Math.pow(2, BrokenCount_1 + BrokenCount_2 + 1);
var BrokenState = 0;
var isBroken = false;

var StartTime = new Date();

var StartBalance = currency.amount;
var CurrentBalance = StartBalance;
var EndBalance = 0;

var GameCount = 0;

var TotalProfit = 0;
var ProfitForMin = 0;
var CoinLost = 0;


var BaseBet = 0;
var CurrentBet = 0;
var LastBet = 0;
var CurrentPayout = 2;
var CurrentMultiplier = 1;
var ContinueLost = 0;

var CrashHistory = [];
var LastCrash;



function main() {
    // console.log(currency);
    showGreetingMessage();

    // BaseBet = config.baseBet.value;
    // CurrentBet = BaseBet;
    CurrentMultiplier = 1.98
    if (CurrentPayout > 1 || isBroken)
        updateBaseBet();

    if (isBroken) {
        isBroken = false;
    }

    game.onBet = function () {
        log.success('-----------------------');
        log.success('starting game');
        log.success('-----------------------');
        // console.log('-----------------------');
        // console.log('starting game');
        // console.log('-----------------------');

        checkStop();
        calcBetAndPayout();


        GameCount++;

        if (CurrentMultiplier > 1) {
            // console.log('[Betting] ' + CurrentBet.toFixed(7) + ' at ' + CurrentMultiplier + 'x');
            log.info('[Betting] ' + CurrentBet.toFixed(7) + ' at ' + CurrentMultiplier + 'x');

            game.bet(CurrentBet, CurrentMultiplier).then(function (payout) {
                // console.log('[Payout] ' + payout);
                CurrentPayout = payout;
                updateState();
                // console.log(CurrentBalance)
                showGameResultMessage();
            })
        } else {
            // console.log('[Betting] No Bet');
            log.info('[Betting] No Bet');
        }
    }
}

function showGameResultMessage() {
    if (CurrentPayout > 1) {
        log.success('We Won ' + CurrentBet * CurrentMultiplier);
        log.info('Profit: ' + TotalProfit);
        log.info('CoinLost: ' + CoinLost);
        log.info('BrokeState: ' + BrokenState);
        // console.log('We Won ' + CurrentBet * CurrentMultiplier);
        // console.log('Profit: ' + TotalProfit);
        // console.log('CoinLost: ' + CoinLost);
    } else {
        log.error('We lost ' + CurrentBet);
        log.info('Profit: ' + TotalProfit);
        log.info('CoinLost: ' + CoinLost);
        log.info('BrokeState: ' + BrokenState);
        // console.log('We lost ' + CurrentBet);
        // console.log('Profit: ' + TotalProfit);
        // console.log('CoinLost: ' + CoinLost);
    }
}

function updateState() {
    if (CurrentPayout > 1) {
        //update CurrentBalance
        CurrentBalance = CurrentBalance - CurrentBet + CurrentBet * CurrentMultiplier;
        //update TotalProfit
        TotalProfit += CurrentBet * (CurrentMultiplier - 1) - CoinLost;
        //update CoinLost
        CoinLost = 0;

        ContinueLost = 0;

        if (BrokenState == 1) {
            BrokenState = 2;
        } else {
            BrokenState = 0;
        }
    } else {
        //update CurrentBalance
        CurrentBalance = CurrentBalance - CurrentBet;
        //update TotalProfit
        //update CoinLost
        CoinLost += CurrentBet;

        ContinueLost++
    }
}

function calcBetAndPayout() { //TODO: update algorithm
    CurrentMultiplier = 1.98;



    if (CurrentPayout > 1) {
        // updateBaseBet();
        if (CurrentBalance > BaseBet * RESOLUTION) {
            updateBaseBet();
        } else {
            CurrentBet = BaseBet;
        }

        if (BrokenState == 2) {
            CurrentBet *= Math.pow(2, BrokenCount_1);
        }
    } else {
        if (BrokenState == 2) {
            if (ContinueLost < BrokenCount_2) {
                CurrentBet *= 2
            } else {
                CurrentBet = BaseBet;
                BrokenState = 0;
                isBroken = true;
            }
        } else {
            if (ContinueLost < BrokenCount_1) {
                CurrentBet *= 2;
            } else {
                CurrentBet = currency.minAmount;
                if (BrokenState == 0) {
                    BrokenState = 1;
                }
            }
        }

    }

}

function showGreetingMessage() {
    log.success('***********Running Script*********');
}

function updateBaseBet() {
    BaseBet = CurrentBalance / RESOLUTION; //TODO: set in config
    if (BaseBet < currency.minAmount) {
        log.error('Your amount too small'); //TODO:
        log.error(currency.minAmount)
        game.stop();
    }
    if (BaseBet > config.maxBaseBet.value) {
        BaseBet = config.maxBaseBet.value;
    }
    config.baseBet.value = BaseBet;
    CurrentBet = BaseBet;
}

function updateHistory() { //TODO
    LastCrash = game.history[0].crash;
    CrashHistory.unshift(LastCrash);
    if (CrashHistory.length > 999) {
        CrashHistory.pop();
    }
    if (TEST) {
        if (CrashHistory.length % 5 == 0) {
            // console.log(CrashHistory);
        }
    }



}

function checkStop() { //TODO
    // if (CoinLost > CurrentBalance) {
    //     game.stop();
    // }
    // if (CurrentBalance > 100) {
    //     game.stop();
    // }
    // if (CurrentBalance < 5) {
    //     game.stop();
    // }
}