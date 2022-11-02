var config = {
    mainTitle: {
        label: '****Hams\'s Script for Crash*******',
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
        value: currency.amount / 1000,
        type: 'number'
    },
    maxBaseBet: {
        label: '',
        value: currency.maxAmount / 1024,
        type: 'number'
    }
}

const TEST = false;
const RESOLUTION = 600;

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

// var ScriptHistory = [];
// var ScriptHistoryHeader = ['Date', 'Cashed At', 'Crash', 'GameId', 'Hash', 'Odds', 'Wager'];

// ScriptHistory.push(ScriptHistoryHeader);
var CrashHistory = [];
var LastCrash;

function main() {


    console.clear();

    //Greeting
    showGreetingMessage();
    if (CurrentBalance > BaseBet * RESOLUTION)
        updateBaseBet();

    // console.log(currency);
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

        // updateHistory();


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
        // console.log('We Won ' + CurrentBet * CurrentMultiplier);
        // console.log('Profit: ' + TotalProfit);
        // console.log('CoinLost: ' + CoinLost);
    } else {
        log.error('We lost ' + CurrentBet);
        log.info('Profit: ' + TotalProfit);
        log.info('CoinLost: ' + CoinLost);
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
    CurrentMultiplier = 2;



    if (CurrentPayout > 1) {
        // updateBaseBet();
        if (CurrentBalance > BaseBet * RESOLUTION) {
            updateBaseBet();
        } else {
            CurrentBet = BaseBet;
        }

    } else {
        if (ContinueLost < 6) {
            CurrentBet *= 2;
        } else {
            CurrentBet = BaseBet;
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
        // console.log('Your amount too small');
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

function ExportToCsv(fileName) {
    let csv = '';
    ScriptHistory.forEach(array => {
        csv += array.join(',') + '\n';
    })

    let csvUrl = 'data:text/csv;charset=utf-8,' + encodeURI(csv);

    let hiddenElement = document.createElement('a');
    hiddenElement.href = csvUrl;
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName + '.csv';
    hiddenElement.click();

    //init ScriptHistory
    ScriptHistory = [];
    ScriptHistory.push(ScriptHistoryHeader);
}

function LogForCSV(cashedAt, crash, gameId, hash, odds, wager) {
    let current_time = new Date();
    let formatted_date = current_time.getFullYear() + '-' + (current_time.getMonth() + 1) + '-' + current_time.getDate() + ' ' + current_time.getHours() + ':' + current_time.getMinutes() + ':' + current_time.getSeconds();
    let entry = [formatted_date, cashedAt, crash, gameId, hash, odds, wager];
    ScriptHistory.push(entry);
}






function crashPredict() {

}