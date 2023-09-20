//TODO: change color to green/red on win
//TODO: include usernames in embed 
//TODO: update user wins and keep board displayed post-win
//TODO: remove buttons on win
//IDEA: rematch button 
const { AttachmentBuilder, SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const getBoardImage = require('../../getBoardImage');

const DEBUG = false;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('game')
        .setDescription('Start game against an opponent')
        .addUserOption(option =>
            option.setName('opponent')
                .setDescription('Select an opponent')
                .setRequired(true)),
    async execute(interaction) {
        const path = './assets/screenshot.png';
        const opponent = interaction.options.getUser('opponent');
        const board = ['', '', '', '', '', '', '', '', ''];
        let isXsTurn = true;

        try {
            const screenshotPath = await getBoardImage(path, board);
            DEBUG && console.log(`Image successfully created at ${screenshotPath}.`);
        } catch (error) {
            console.error('Error creating the image:', error);
        }

        const file = new AttachmentBuilder('assets/screenshot.png');
        const boardEmbed = new EmbedBuilder()
            .setTitle('Tic-Tac-Toe Game board')
            .setImage("attachment://screenshot.png");

        const buttons = [];

        for (let i = 0; i < 9; i++) {
            buttons.push(
                new ButtonBuilder()
                    .setCustomId(`${i}`)
                    .setLabel(`${i}`)
                    .setStyle(ButtonStyle.Primary)
            );
        }

        const row1 = new ActionRowBuilder()
            .addComponents(...buttons.slice(0, 3));
        const row2 = new ActionRowBuilder()
            .addComponents(...buttons.slice(3, 6));
        const row3 = new ActionRowBuilder()
            .addComponents(...buttons.slice(6, 9));

        const response = await interaction.reply({
            embeds: [boardEmbed],
            files: [file],
            components: [row1, row2, row3],
        });

        // filter function to allow only the user and the opponent to press buttons
        const collectorFilter = i => {
            const isUser = i.user.id === interaction.user.id;
            const isOpponent = i.user.id === opponent.id;
            return isUser || isOpponent;
        };

        const collector = response.createMessageComponentCollector({
            componentType: 2, // 2 = button 
            filter: collectorFilter,
            time: 3_600_000,
        });

        collector.on('collect', async i => {
            const buttonId = parseInt(i.customId);
            if (!isNaN(buttonId) && board[buttonId] === '') {
                // Check if the button is a valid move
                if ((isXsTurn && i.user.id === interaction.user.id) || (!isXsTurn && i.user.id === opponent.id)) {

                    // Update the board with the player's move
                    if (i.user.id === interaction.user.id) {
                        board[buttonId] = 'X'; // For example, set 'X' for the player who clicked
                    } else {
                        board[buttonId] = 'O';
                    }

                    // Disable pressed button
                    const whichRow = Math.floor(buttonId / 3)
                    switch (whichRow) {
                        case 0:
                            row1.components[buttonId].setDisabled(true);
                            break;
                        case 1:
                            row2.components[buttonId - 3].setDisabled(true);
                            break;
                        case 2:
                            row3.components[buttonId - 6].setDisabled(true);
                            break;
                    }

                    // Create a new screenshot with the updated board
                    try {
                        const screenshotPath = await getBoardImage(path, board);
                        DEBUG && console.log(`Image successfully updated at ${screenshotPath}.`);
                    } catch (error) {
                        console.error('Error updating the image:', error);
                    }

                    // Update the message with the new screenshot
                    const updatedFile = new AttachmentBuilder('assets/screenshot.png');
                    await i.update({ files: [updatedFile], components: [row1, row2, row3] });

                    isXsTurn = !isXsTurn
                    // Danny's game Logic///////////////////////////
                    const winnerIndex = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [6, 4, 2], [0, 4, 8]];
                    for (let idx = 0; idx < 8; idx++) {
                        if (board[winnerIndex[idx][0]] === 'X' && board[winnerIndex[idx][1]] === 'X' && board[winnerIndex[idx][2]] === 'X') {
                            console.log('X wins');
                            break;
                        } else if (board[winnerIndex[idx][0]] === 'O' && board[winnerIndex[idx][1]] === 'O' && board[winnerIndex[idx][2]] === 'O') {
                            console.log('O wins');
                            break;
                        } else if (board.every(square => square !== '')) {
                            console.log("It's a tie");
                            break;
                        }
                    }
                    ////////////////////////////////////////////////
                }
                else {
                    await i.reply({
                        content: "It's not your turn yet!",
                        ephemeral: true, // This makes the response visible only to the user who clicked the button
                    });
                }




            } else {
                // Invalid move, send a response to the user indicating that the move is not allowed
                await i.reply({
                    content: "Invalid move. Please select an empty square.",
                    ephemeral: true, // This makes the response visible only to the user who clicked the button
                });
            }
        });
    },
};