const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * Generates and saves a PNG of the given board.
 * @param {String} path A path to a file.
 * @param {String[]} board An array of strings as the board.
 * @returns {} 
 */
async function getBoardImage(path, board, isXsTurn, user1 = 'user1', user2 = 'user2', color = '') {
    return new Promise(async (resolve, reject) => {
        try {
            const browser = await puppeteer.launch({ headless: 'new' });
            const page = await browser.newPage();

            // Your HTML template
            const htmlTemplate = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link rel="preconnect" href="https://fonts.googleapis.com">
                    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                    <link href="https://fonts.googleapis.com/css2?family=Balthazar&display=swap" rel="stylesheet">
                    <title>Styled Squares</title>
                    <style>
                    /* Set the background to transparent */
                    body {
                        background-color: transparent;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        flex-direction: column;
                    }

                    h1 {
                        color: ${color ? color : '#6aafff'};
                        font-size: 30px;
                    }

                    .glow {
                        text-shadow: 0 0.01em 0.5em ${color ? color : '#6aafff'};
                    }
        
                    .square {
                        border-radius: 8px;
                        color: ${color ? color : '#6aafff'};
                        text-shadow: 0 0.01em 0.5em ${color ? color : '#6aafff'};
                        background: 0;
                        border: 2px solid ${color ? color : '#6aafff'};
                        float: left;
                        font-size: 30px;
                        font-weight: bold;
                        line-height: 48px;
                        height: 50px;
                        margin-right: 10px;
                        margin-top: 10px;
                        padding: 0;
                        text-align: center;
                        width: 50px;
                        white-space: nowrap;
                    }
        
                    .board-row:after {
                        clear: both;
                        content: "";
                        display: table;
                    }
                    </style>
                </head>
                <body>
                    <h1>
                        <span ${isXsTurn && "class=\"glow\""}>${user1}</span> vs. <span ${!isXsTurn && "class=\"glow\""}>${user2}</span>
                    </h1>
                    <div id="board">
                        <div class="board-row">
                            <button class="square">
                                1
                            </button>
                            <button class="square">
                                2
                            </button>
                            <button class="square">
                                3
                            </button>
                        </div>
                    <div class="board-row">
                        <button class="square">
                            4
                        </button>
                        <button class="square">
                            5
                        </button>
                        <button class="square">
                            6
                        </button>
                    </div>
                    <div class="board-row">
                        <button class="square">
                            7
                        </button>
                        <button class="square">
                            8
                        </button>
                        <button class="square">
                            9
                        </button>
                            </div>
                        </div>
                </body>
                </html>
            `;

            await page.setContent(htmlTemplate);

            // Use page.evaluate to modify the contents of buttons with data from given board
            await page.evaluate((board) => {
                const buttons = document.querySelectorAll('.square');
                buttons.forEach((button, index) => {
                    button.textContent = `${board[index]}`;
                });
            }, board);

            // Capture a screenshot of the modified content
            const screenshot = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 220, y: 10, width: 370, height: 300 } });
            await browser.close();

            // Save as screenshot.png
            fs.writeFile(path, screenshot, (error) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(path); // Resolve with the file path
                }
            });
        } catch (error) {
            reject(error);
        }
    });

}

// Export the function so it can be used in other files
module.exports = getBoardImage;
