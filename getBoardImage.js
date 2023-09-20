const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * Generates and saves a PNG of the given board.
 * @param {String} path A path to a file.
 * @param {String[]} board An array of strings as the board.
 * @returns {} 
 */
async function getBoardImage(path, board) {
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
                  <title>Styled Squares</title>
                  <style>
                  /* Set the background to transparent */
                  body {
                      background-color: transparent;
                  }
        
                  .square {
                      border-radius: 8px;
                      color: #6aafff;
                      text-shadow: 0 0.01em 0.5em #60aaff;
                      background: 0;
                      border: 2px solid #60aaff;
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
        
                  .square:hover {
                      transition: background-color 0.3s ease-in-out;
                      background-color: #ffffff10;
                  }
        
                  .board-row:after {
                      clear: both;
                      content: "";
                      display: table;
                  }
                  </style>
              </head>
              <body>
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
            const screenshot = await page.screenshot({ type: 'png', omitBackground: true, clip: { x: 5, y: 10, width: 180, height: 180 } });
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
