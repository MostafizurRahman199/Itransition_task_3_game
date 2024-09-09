const crypto = require('crypto');
const readline = require('readline');

const args = process.argv.slice(2);

if (args.length < 3 || args.length % 2 === 0 || new Set(args).size !== args.length) {
    console.error('Error: Provide an odd number of unique moves.');
    console.error('Example: node game.js rock paper scissors');
    process.exit(1);
}

const generateKey = () => crypto.randomBytes(32).toString('hex');
const generateHMAC = (key, message) => crypto.createHmac('sha3-256', key).update(message).digest('hex');

const computerMove = () => args[Math.floor(Math.random() * args.length)];

const determineWinner = (player, computer, moves) => {
    const playerIndex = moves.indexOf(player);
    const computerIndex = moves.indexOf(computer);
    const halfLength = Math.floor(moves.length / 2);

    if (playerIndex === computerIndex) return 'Draw';

    const winningMoves = moves.slice(playerIndex + 1, playerIndex + 1 + halfLength).concat(
        moves.slice(0, Math.max(0, (playerIndex + 1 + halfLength) - moves.length))
    );

    return winningMoves.includes(computer) ? 'Win' : 'Lose';
};

const displayHelpTable = (moves) => {
    console.log('\nHelp Table:');
    const header = ['Move'].concat(moves).join(' | ');
    console.log(header);
    console.log('-'.repeat(header.length));

    moves.forEach(move => {
        const row = [move];
        moves.forEach(opponent => {
            if (move === opponent) {
                row.push('Draw');
            } else {
                const result = determineWinner(move, opponent, moves);
                row.push(result);
            }
        });
        console.log(row.join(' | '));
    });
    console.log('');
};

const playGame = () => {
    const key = generateKey();
    const computerChoice = computerMove();
    const hmac = generateHMAC(key, computerChoice);

    console.log('HMAC:', hmac);
    console.log('Available moves:');
    args.forEach((move, index) => console.log(`${index + 1} - ${move}`));
    console.log('0 - exit');
    console.log('? - help');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('Enter your move: ', (input) => {
        if (input === '?') {
            displayHelpTable(args);
            rl.close();
            return;
        }

        const playerChoiceIndex = parseInt(input) - 1;
        if (input === '0' || isNaN(playerChoiceIndex) || playerChoiceIndex < 0 || playerChoiceIndex >= args.length) {
            console.log('Invalid move. Exiting game.');
            rl.close();
            return;
        }

        const playerChoice = args[playerChoiceIndex];
        console.log('Your move:', playerChoice);
        console.log('Computer move:', computerChoice);

        const result = determineWinner(playerChoice, computerChoice, args);
        console.log(`Result: You ${result}!`);

        console.log('HMAC key:', key);
        rl.close();
    });
};

playGame();