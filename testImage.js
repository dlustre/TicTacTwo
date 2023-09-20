const getBoardImage = require('./getBoardImage');

const path = './assets/screenshot.png';
const board = [1, 2, 3, 4, 5, 6, 7, 8, 9];

getBoardImage(path, board)
    .then((screenshotPath) => {
        console.log(`Image successfully created as ${screenshotPath}.`);
    })
    .catch((error) => {
        console.error('Error creating the image:', error);
    });
