// матрицы расстановок кораблей
var computerMatrix, playerMatrix;

// блоки с полями боя
var containerField;
var playerField, computerField;
var canvasPlayerField, canvasComputerField;
var playerFieldContext, computerFieldContext;

// размеры поля боя
var fieldWidth = 500;
var fieldHeight = 500;

// размеры частицы корабля
var partShipWidth = 50;
var partShipHeight = 50;

// чей ход?
var gameStep;       // 0 - игрок, 1 - компьютер
var containerGameStep;

// счетчик потопленных кораблей для каждого игрока
var playerPoints;
var computerPoints;

// таймер для игры компьютера
var timerId;

// имя игрока
var name;

window.onload = function () {
    var menu = document.getElementById("mainMenu");
    var container = document.createElement("div");
    container.id = "menuContainer";
    menu.appendChild(container);

    var infoCanvas = document.createElement("canvas");
    infoCanvas.width = "365";
    var infoCtx = infoCanvas.getContext("2d");
    infoCtx.fillStyle = "grey";
    infoCtx.fillRect(0, 35, partShipWidth, partShipHeight);
    infoCtx.strokeStyle = "black";
    infoCtx.font = "italic 10pt Arial";
    infoCtx.strokeText("Промах", 0, 30);
    container.appendChild(infoCanvas);

    var gradient = infoCtx.createRadialGradient(98 + partShipWidth/2, 35 + partShipHeight/2, 5, 98 + partShipWidth/2, 35 + partShipHeight/2, partShipWidth/2);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'red');
    infoCtx.fillStyle = gradient;
    infoCtx.fillRect(98, 35, partShipWidth, partShipHeight);
    infoCtx.strokeStyle = "black";
    infoCtx.font = "italic 10pt Arial";
    infoCtx.strokeText("Поврежден", 90, 30)
    container.appendChild(infoCanvas);

    infoCtx.fillStyle = "red";
    infoCtx.fillRect(198, 35, partShipWidth, partShipHeight);
    infoCtx.strokeStyle = "black";
    infoCtx.font = "italic 10pt Arial";
    infoCtx.strokeText("Потоплен", 190, 30)
    container.appendChild(infoCanvas);

    infoCtx.fillStyle = "black";
    infoCtx.fillRect(295, 35, partShipWidth, partShipHeight);
    infoCtx.strokeStyle = "black";
    infoCtx.font = "italic 10pt Arial";
    infoCtx.strokeText("Не поврежден", 275, 30)
    container.appendChild(infoCanvas);

    infoCtx.strokeStyle = "black";
    infoCtx.font = "bold 20pt Arial";
    infoCtx.fillText("Состояния клеток поля боя", 0, 110)
};

function initGame(playerName) {
    if (!containerField) {
        name = playerName;
        document.getElementById("mainMenu").style.display = "none";

        // контейнер для двух canvas полей и игровой информации
        containerField = document.createElement("div");
        containerField.className = "containerField";
        document.body.appendChild(containerField);

        // информация о ходе
        gameStep = Math.floor(Math.random() * 2);
        containerGameStep = document.createElement("p");
        containerGameStep.id = "gameStep";
        containerField.appendChild(containerGameStep);

        // поле игрока
        playerField = document.createElement("div");
        playerField.id = "playerField";
        playerField.className = "field";
        containerField.appendChild(playerField);
        var player = document.createElement("p");
        player.innerText = "Поле игрока " + playerName;
        playerField.appendChild(player);

        canvasPlayerField = document.createElement("canvas");
        canvasPlayerField.id = "canvasPlayerField";
        canvasPlayerField.width = fieldWidth + 1;
        canvasPlayerField.height = fieldHeight + 1;
        playerField.appendChild(canvasPlayerField);
        playerFieldContext = canvasPlayerField.getContext("2d");

        // поле компьютера
        computerField = document.createElement("div");
        computerField.id = "computerField";
        computerField.className = "field";
        containerField.appendChild(computerField);
        var computer = document.createElement("p");
        computer.innerText = "Поле игрока Компьютер";
        computerField.appendChild(computer);

        canvasComputerField = document.createElement("canvas");
        canvasComputerField.id = "canvasComputerField";
        canvasComputerField.width = fieldWidth + 1;
        canvasComputerField.height = fieldHeight + 1;
        computerField.appendChild(canvasComputerField);
        computerFieldContext = canvasComputerField.getContext("2d");

        // отрисовка разметки
        drawFields(playerFieldContext);
        drawFields(computerFieldContext);

        // генерация кнопки для расстановки кораблей
        var generateButtonContainer = document.createElement("div");
        generateButtonContainer.id = "generateButtonContainer";
        var generateButton = document.createElement("button");
        generateButton.id = "generateButton";
        generateButton.innerText = "Расставить корабли";
        generateButton.addEventListener("click", function () {
            gameStep = Math.floor(Math.random() * 2);
            if (!gameStep) {
                containerGameStep.innerText = "Ваш ход";
            } else {
                containerGameStep.innerText = "Компьютер ходит";
            }
            playerFieldContext.clearRect(0, 0, fieldWidth, fieldHeight);
            computerFieldContext.clearRect(0, 0, fieldWidth, fieldHeight);
            drawFields(playerFieldContext);
            drawFields(computerFieldContext);
            playerMatrix = generateMatrix();
            computerMatrix = generateMatrix();
            drawShips(playerMatrix, playerFieldContext);
            playerPoints = computerPoints = 0;
            attackInfo.isAttack = false;
            if (gameStep) {
                timerId = setInterval( computerWalks, 1500);
            } else {
                clearInterval(timerId);
            }
            canvasComputerField.addEventListener("click", computerFieldOnClick, false);
        });
        generateButtonContainer.appendChild(generateButton);
        document.body.appendChild(generateButtonContainer);
    }
}

// отрисовка клеток
function drawFields(fieldContext) {
    for (var x = 0; x <= fieldWidth; x += partShipWidth) {
        fieldContext.moveTo(x + 0.5, 0);
        fieldContext.lineTo(x + 0.5, fieldWidth);
    }
    for (var y = 0; y <= fieldHeight; y += partShipHeight) {
        fieldContext.moveTo(0, y + 0.5);
        fieldContext.lineTo(fieldHeight, y + 0.5);
    }
    fieldContext.strokeStyle = "#cccccc";
    fieldContext.stroke();
}

// рисование кораблей
function drawShips(matrix, context) {
    context.fillStyle = "black";
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            if (matrix[i][j] == 1) {
                var x = i * partShipWidth;
                var y = j * partShipHeight;
                context.fillRect(x, y, partShipWidth, partShipHeight);
            }
        }
    }
}

// рисование промаха
function drawMisfire(context, cellX, cellY) {
    var x = cellX * partShipWidth;
    var y = cellY * partShipHeight;
    context.fillStyle = "grey";
    context.fillRect(x, y, partShipWidth, partShipHeight);
    if (gameStep) {
        computerMatrix[cellX][cellY] = 5;
        containerGameStep.innerText = "Компьютер ходит";
    } else {
        playerMatrix[cellX][cellY] = 5;
        containerGameStep.innerText = "Ваш ход";
    }
}

// рисование попадания
function drawHit(context, cellX, cellY) {
    var x = cellX * partShipWidth;
    var y = cellY * partShipHeight;
    var gradient = context.createRadialGradient(x + partShipWidth/2, y + partShipHeight/2, 5, x + partShipWidth/2, y+partShipHeight/2, partShipWidth/2);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, 'red');
    context.fillStyle = gradient;
    context.fillRect(x, y, partShipWidth, partShipHeight);
    if (gameStep) {
        playerMatrix[cellX][cellY] = 3;
    } else {
        computerMatrix[cellX][cellY] = 3;
    }
}

// рисование уничтожения
function drawDeath(context, cellX, cellY, axis) {
    // 0 - вертикальный корабль, 1 - горизонтальный
    var x = cellX * partShipWidth;
    var y = cellY * partShipHeight;
    context.fillStyle = "red";
    context.fillRect(x, y, partShipWidth, partShipHeight);
    if (gameStep) {
        playerMatrix[cellX][cellY] = 4;
        if (axis === 0) {
            playerMatrix[cellX - 1][cellY] = 5;
            playerMatrix[cellX - 1][cellY + 1] = 5;
            playerMatrix[cellX - 1][cellY - 1] = 5;
            playerMatrix[cellX + 1][cellY] = 5;
            playerMatrix[cellX + 1][cellY + 1] = 5;
            playerMatrix[cellX + 1][cellY - 1] = 5;
        } else if (axis === 1) {
            playerMatrix[cellX][cellY - 1] = 5;
            playerMatrix[cellX - 1][cellY - 1] = 5;
            playerMatrix[cellX + 1][cellY - 1] = 5;
            playerMatrix[cellX][cellY + 1] = 5;
            playerMatrix[cellX - 1][cellY + 1] = 5;
            playerMatrix[cellX + 1][cellY + 1] = 5;
        }
    } else {
        computerMatrix[cellX][cellY] = 4;
    }
}

// отлавливание кликов по полю компьютера
function computerFieldOnClick(e) {
    var cellX, cellY;

    if (!gameStep) {
        // игрок ходит
        clearInterval(timerId);
        checkCursorPosition(e);
        if (computerMatrix[cellX][cellY] === 1) {
            // попадание
            var checkDeath = isDead(computerMatrix, cellX, cellY);
            switch (checkDeath) {
                case 1:
                    drawDeath(computerFieldContext, cellX, cellY);
                    playerPoints++;
                    break;
                case 2:
                    drawDeath(computerFieldContext, cellX, cellY);
                    if (computerMatrix[cellX-1][cellY] === 3) {
                        cellX = cellX - 1;
                    } else if (computerMatrix[cellX+1][cellY] === 3) {
                        cellX = cellX + 1;
                    } else if (computerMatrix[cellX][cellY-1] === 3) {
                        cellY = cellY - 1;
                    } else if (computerMatrix[cellX][cellY+1] === 3) {
                        cellY = cellY + 1;
                    }
                    drawDeath(computerFieldContext, cellX, cellY);
                    playerPoints++;
                    break;
                case 3:
                    drawDeath(computerFieldContext, cellX, cellY);
                    var cellXArray = [];
                    var cellYArray = [];
                    if (computerMatrix[cellX-1][cellY] === 3) {
                        cellXArray.push(cellX - 1);
                        if (computerMatrix[cellX-2][cellY] === 3) {
                            cellXArray.push(cellX-2);
                        } else {
                            cellXArray.push(cellX+1);
                        }
                    } else if (computerMatrix[cellX+1][cellY] === 3) {
                        cellXArray.push(cellX+1);
                        cellXArray.push(cellX+2);
                    } else if (computerMatrix[cellX][cellY-1] === 3) {
                        cellYArray.push(cellY-1);
                        if (computerMatrix[cellX][cellY-2] === 3) {
                            cellYArray.push(cellY-2);
                        } else {
                            cellYArray.push(cellY+1);
                        }
                    } else {
                        cellYArray.push(cellY+1);
                        cellYArray.push(cellY+2);
                    }

                    if (cellXArray.length!=0) {
                        for (var i = 0; i < cellXArray.length; i++) {
                            cellX = cellXArray[i];
                            drawDeath(computerFieldContext, cellX, cellY);
                        }
                    } else {
                        for (var i = 0; i < cellYArray.length; i++) {
                            cellY = cellYArray[i];
                            drawDeath(computerFieldContext, cellX, cellY);
                        }
                    }
                    playerPoints++;
                    break;
                case 4:
                    drawDeath(computerFieldContext, cellX, cellY);
                    var cellXArray = [];
                    var cellYArray = [];
                    if (computerMatrix[cellX-1][cellY] === 3) {
                        cellXArray.push(cellX - 1);
                        if (computerMatrix[cellX-2][cellY] === 3) {
                            cellXArray.push(cellX - 2);
                            if (computerMatrix[cellX-3][cellY] === 3) {
                                cellXArray.push(cellX - 3);
                            } else {
                                cellXArray.push(cellX + 1);
                            }
                        } else {
                            cellXArray.push(cellX + 1);
                            cellXArray.push(cellX + 2);
                        }
                    } else if (computerMatrix[cellX+1][cellY] === 3) {
                        cellXArray.push(cellX + 1);
                        cellXArray.push(cellX + 2);
                        cellXArray.push(cellX + 3);
                    } else if (computerMatrix[cellX][cellY-1] === 3) {
                        cellYArray.push(cellY-1);
                        if (computerMatrix[cellX][cellY-2] === 3) {
                            cellYArray.push(cellY-2);
                            if (computerMatrix[cellX][cellY-3] === 3) {
                                cellYArray.push(cellY-3);
                            } else {
                                cellYArray.push(cellY+1);
                            }
                        } else {
                            cellYArray.push(cellY+1);
                            cellYArray.push(cellY+2);
                        }
                    } else {
                        cellYArray.push(cellY + 1);
                        cellYArray.push(cellY + 2);
                        cellYArray.push(cellY + 3);
                    }

                    if (cellXArray.length!=0) {
                        for (var i = 0; i < cellXArray.length; i++) {
                            cellX = cellXArray[i];
                            drawDeath(computerFieldContext, cellX, cellY);
                        }
                    } else {
                        for (var i = 0; i < cellYArray.length; i++) {
                            cellY = cellYArray[i];
                            drawDeath(computerFieldContext, cellX, cellY);
                        }
                    }
                    playerPoints++;
                    break;
                default:
                    // подбит
                    drawHit(computerFieldContext, cellX, cellY);
            }
            if (isGameOver()) {
                canvasComputerField.removeEventListener("click", computerFieldOnClick);
                clearInterval(timerId);
            }
        } else if (computerMatrix[cellX][cellY] === 0 || computerMatrix[cellX][cellY] === 2) {
                // промах
                gameStep = 1;
                drawMisfire(computerFieldContext, cellX, cellY);
                timerId = setInterval(computerWalks, 1500);
        }
    }

    // отлавливание курсора
    function checkCursorPosition(e) {
        if (e.pageX != undefined && e.pageY != undefined) {
            cellX = e.pageX;
            cellY = e.pageY;
        }
        else {
            cellX = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            cellY = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        cellX -= canvasComputerField.offsetLeft;
        cellY -= canvasComputerField.offsetTop;
        cellX = Math.min(cellX, fieldWidth);
        cellY = Math.min(cellY, fieldHeight);
        cellX = Math.floor(cellX/partShipWidth);
        cellY = Math.floor(cellY/partShipHeight);
    }
}

// информация о текущей атаке компьютера
var attackInfo = {
    isAttack: false,
    xAttack: undefined,
    yAttack: undefined,
    aim: ""         // left, right, up, down
}
// ход компьютера
function computerWalks() {
    var checkDeath;
    var cellX, cellY;

    if (gameStep) {
        if (!attackInfo.isAttack) {
            // новая атака
            cellX = Math.floor(Math.random() * 10);
            cellY = Math.floor(Math.random() * 10);
            while (playerMatrix[cellX][cellY] === 5 || playerMatrix[cellX][cellY] === 4) {
                // 5 - соседние клетки потопленного корабля, 4 - потопленный корабль
                cellX = Math.floor(Math.random() * 10);
                cellY = Math.floor(Math.random() * 10);
            }

            if (playerMatrix[cellX][cellY] === 1) {
                // попадание
                checkDeath = isDead(playerMatrix, cellX, cellY);
                switch (checkDeath) {
                    case 1:
                        // потоплен однопалубный
                        drawDeath(playerFieldContext, cellX, cellY, 0);
                        playerMatrix[cellX][cellY - 1] = 5;
                        playerMatrix[cellX][cellY + 1] = 5;
                        computerPoints++;
                        break;
                    default:
                        // попадание в составной корабль
                        attackInfo.isAttack = true;
                        attackInfo.xAttack = cellX;
                        attackInfo.yAttack = cellY;
                        if (left()) {
                            attackInfo.aim = "left";
                        } else if (right()) {
                            attackInfo.aim = "right";
                        } else if (up()) {
                            attackInfo.aim = "up";
                        } else if (down()) {
                            attackInfo.aim = "down";
                        }
                        drawHit(playerFieldContext, cellX, cellY);
                }
            } else {
                if (playerMatrix[cellX][cellY] === 0 || playerMatrix[cellX][cellY] === 2) {
                    // промах
                    gameStep = 0;
                    drawMisfire(playerFieldContext, cellX, cellY);
                }
            }
        } else {
            // продолжать атаку
            switch (attackInfo.aim) {
                case "left":
                    cellX = attackInfo.xAttack;
                    cellY = attackInfo.yAttack;
                    if (playerMatrix[cellX - 1][cellY] === 0 || playerMatrix[cellX - 1][cellY] === 2 || playerMatrix[cellX - 1][cellY] === 5) {
                        // промах или компьютер не должен туда стрелять
                        if (playerMatrix[cellX - 1][cellY] !== 5) {
                            // промах
                            gameStep = 0;
                            drawMisfire(playerFieldContext, cellX - 1, cellY);
                        }

                        if (right()) {
                            if (playerMatrix[cellX + 1][cellY] === 3) {
                                cellX += 1;
                                if (playerMatrix[cellX + 1][cellY] === 3) {
                                    cellX += 1;
                                }
                            }
                            attackInfo.aim = "right";
                        } else if (up()) {
                            attackInfo.aim = "up";
                        } else if (down()) {
                            attackInfo.aim = "down";
                        }
                        attackInfo.xAttack = cellX;
                        attackInfo.yAttack = cellY;
                    } else if (playerMatrix[cellX - 1][cellY] === 1) {
                        // попал и продолжает стрелять
                        cellX = cellX - 1;
                        attackInfo.xAttack = cellX;
                        attackInfo.yAttack = cellY;
                        checkDeath = isDead(playerMatrix, cellX, cellY);
                        switch (checkDeath) {
                            case 2:
                                playerMatrix[cellX - 1][cellY] = 5;
                                playerMatrix[cellX + 2][cellY] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 1);
                                drawDeath(playerFieldContext, cellX + 1, cellY, 1);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            case 3:
                                playerMatrix[cellX - 1][cellY] = 5;
                                playerMatrix[cellX + 3][cellY] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 1);
                                drawDeath(playerFieldContext, cellX + 1, cellY, 1);
                                drawDeath(playerFieldContext, cellX + 2, cellY, 1);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            case 4:
                                playerMatrix[cellX - 1][cellY] = 5;
                                playerMatrix[cellX + 4][cellY] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 1);
                                drawDeath(playerFieldContext, cellX + 1, cellY, 1);
                                drawDeath(playerFieldContext, cellX + 2, cellY, 1);
                                drawDeath(playerFieldContext, cellX + 3, cellY, 1);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            default:
                                // лишь попадание
                                drawHit(playerFieldContext, cellX, cellY);
                                if (left()) {
                                    attackInfo.aim = "left";
                                } else if (right()) {
                                    if (playerMatrix[cellX + 1][cellY] === 3) {
                                        cellX += 1;
                                        if (playerMatrix[cellX + 1][cellY] === 3) {
                                            cellX += 1;
                                        }
                                    }
                                    attackInfo.aim = "right";
                                }
                                attackInfo.xAttack = cellX;
                                attackInfo.yAttack = cellY;
                        }
                    }
                    break;
                case "right":
                    cellX = attackInfo.xAttack;
                    cellY = attackInfo.yAttack;
                    if (playerMatrix[cellX + 1][cellY] === 0 || playerMatrix[cellX + 1][cellY] === 2 || playerMatrix[cellX + 1][cellY] === 5) {
                        // промах или компьютер не должен туда стрелять
                        if (playerMatrix[cellX + 1][cellY] !== 5) {
                            // промах
                            gameStep = 0;
                            drawMisfire(playerFieldContext, cellX + 1, cellY);
                        }
                        if (up()) {
                            attackInfo.aim = "up";
                        } else if (down()) {
                            attackInfo.aim = "down";
                        }
                    } else if (playerMatrix[cellX + 1][cellY] === 1) {
                        // попадание
                        cellX = cellX + 1;
                        attackInfo.xAttack = cellX;
                        attackInfo.yAttack = cellY;
                        checkDeath = isDead(playerMatrix, cellX, cellY);
                        switch (checkDeath) {
                            case 2:
                                playerMatrix[cellX + 1][cellY] = 5;
                                playerMatrix[cellX - 2][cellY] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 1);
                                drawDeath(playerFieldContext, cellX - 1, cellY, 1);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            case 3:
                                playerMatrix[cellX + 1][cellY] = 5;
                                playerMatrix[cellX - 3][cellY] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 1);
                                drawDeath(playerFieldContext, cellX - 1, cellY, 1);
                                drawDeath(playerFieldContext, cellX - 2, cellY, 1);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            case 4:
                                playerMatrix[cellX + 1][cellY] = 5;
                                playerMatrix[cellX - 4][cellY] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 1);
                                drawDeath(playerFieldContext, cellX - 1, cellY, 1);
                                drawDeath(playerFieldContext, cellX - 2, cellY, 1);
                                drawDeath(playerFieldContext, cellX - 3, cellY, 1);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            default:
                                // лишь попадание
                                drawHit(playerFieldContext, cellX, cellY);
                                if (right()) {
                                    attackInfo.aim = "right";
                                }
                        }
                    }
                    break;
                case "up":
                    cellX = attackInfo.xAttack;
                    cellY = attackInfo.yAttack;
                    if (playerMatrix[cellX][cellY - 1] === 0 || playerMatrix[cellX][cellY - 1] === 2 || playerMatrix[cellX][cellY - 1] === 5) {
                        // промах или компьютер не должен туда стрелять
                        if (playerMatrix[cellX][cellY - 1] !== 5) {
                            // промах
                            gameStep = 0;
                            drawMisfire(playerFieldContext, cellX, cellY - 1);
                        }

                        if (down()) {
                            if (playerMatrix[cellX][cellY + 1] === 3) {
                                cellY += 1;
                                if (playerMatrix[cellX][cellY + 1] === 3) {
                                    cellY += 1;
                                }
                            }
                            attackInfo.aim = "down";
                        }
                        attackInfo.xAttack = cellX;
                        attackInfo.yAttack = cellY;
                    } else if (playerMatrix[cellX][cellY - 1] === 1) {
                        // попал
                        cellY = cellY - 1;
                        attackInfo.xAttack = cellX;
                        attackInfo.yAttack = cellY;
                        checkDeath = isDead(playerMatrix, cellX, cellY);
                        switch (checkDeath) {
                            case 2:
                                playerMatrix[cellX][cellY - 1] = 5;
                                playerMatrix[cellX][cellY + 2] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 0);
                                drawDeath(playerFieldContext, cellX, cellY + 1, 0);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            case 3:
                                playerMatrix[cellX][cellY - 1] = 5;
                                playerMatrix[cellX][cellY + 3] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 0);
                                drawDeath(playerFieldContext, cellX, cellY + 1, 0);
                                drawDeath(playerFieldContext, cellX, cellY + 2, 0);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            case 4:
                                playerMatrix[cellX][cellY - 1] = 5;
                                playerMatrix[cellX][cellY + 4] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 0);
                                drawDeath(playerFieldContext, cellX, cellY + 1, 0);
                                drawDeath(playerFieldContext, cellX, cellY + 2, 0);
                                drawDeath(playerFieldContext, cellX, cellY + 3, 0);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            default:
                                // лишь попадание
                                drawHit(playerFieldContext, cellX, cellY);
                                if (up()) {
                                    attackInfo.aim = "up";
                                } else if (down()) {
                                    if (playerMatrix[cellX][cellY + 1] === 3) {
                                        cellY += 1;
                                        if (playerMatrix[cellX][cellY + 1] === 3) {
                                            cellY += 1;
                                        }
                                    }
                                    attackInfo.aim = "down";
                                }
                                attackInfo.xAttack = cellX;
                                attackInfo.yAttack = cellY;
                        }
                    }
                    break;
                case "down":
                    cellX = attackInfo.xAttack;
                    cellY = attackInfo.yAttack;
                    if (playerMatrix[cellX][cellY + 1] === 1) {
                        // попал
                        cellY = cellY + 1;
                        attackInfo.xAttack = cellX;
                        attackInfo.yAttack = cellY;
                        checkDeath = isDead(playerMatrix, cellX, cellY);
                        switch (checkDeath) {
                            case 2:
                                playerMatrix[cellX][cellY - 2] = 5;
                                playerMatrix[cellX][cellY + 1] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 0);
                                drawDeath(playerFieldContext, cellX, cellY - 1, 0);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            case 3:
                                playerMatrix[cellX][cellY - 3] = 5;
                                playerMatrix[cellX][cellY + 1] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 0);
                                drawDeath(playerFieldContext, cellX, cellY - 1, 0);
                                drawDeath(playerFieldContext, cellX, cellY - 2, 0);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            case 4:
                                playerMatrix[cellX][cellY - 4] = 5;
                                playerMatrix[cellX][cellY + 1] = 5;
                                drawDeath(playerFieldContext, cellX, cellY, 0);
                                drawDeath(playerFieldContext, cellX, cellY - 1, 0);
                                drawDeath(playerFieldContext, cellX, cellY - 2, 0);
                                drawDeath(playerFieldContext, cellX, cellY - 3, 0);
                                computerPoints++;
                                attackInfo.isAttack = false;
                                break;
                            default:
                                // лишь попадание
                                drawHit(playerFieldContext, cellX, cellY);
                                if (down()) {
                                    attackInfo.aim = "down";
                                }
                        }
                    }
                    break;

            }
        }
        if (isGameOver()) {
            canvasComputerField.removeEventListener("click", computerFieldOnClick);
            clearInterval(timerId);
        }
    }

    function left() {
        return (cellX > 0 && playerMatrix[cellX - 1][cellY] !== 5)
    }
    function right() {
        return (cellX < 9 && playerMatrix[cellX + 1][cellY] !== 5)
    }
    function up() {
        return (cellY > 0 && playerMatrix[cellX][cellY - 1] !== 5)
    }
    function down() {
        return (cellY < 9  && playerMatrix[cellX][cellY + 1] !== 5)
    }
}


// проверка на полное уничтожение
function isDead(matrix, cellX, cellY) {
    // четырехпалубный уничтожен
    if (((matrix[cellX-1][cellY] === 3 && matrix[cellX-2][cellY] === 3 && matrix[cellX-3][cellY] === 3) ||
        (matrix[cellX-1][cellY] === 3 && matrix[cellX-2][cellY] === 3 && matrix[cellX+1][cellY] === 3) ||
        (matrix[cellX-1][cellY] === 3 && matrix[cellX+1][cellY] === 3 && matrix[cellX+2][cellY] === 3) ||
        (matrix[cellX+1][cellY] === 3 && matrix[cellX+2][cellY] === 3 && matrix[cellX+3][cellY] === 3)) ||
        ((matrix[cellX][cellY-1] === 3 && matrix[cellX][cellY-2] === 3 && matrix[cellX][cellY-3] === 3) ||
            (matrix[cellX][cellY-1] === 3 && matrix[cellX][cellY-2] === 3 && matrix[cellX][cellY+1] === 3) ||
            (matrix[cellX][cellY-1] === 3 && matrix[cellX][cellY+1] === 3 && matrix[cellX][cellY+2] === 3) ||
            (matrix[cellX][cellY+1] === 3 && matrix[cellX][cellY+2] === 3 && matrix[cellX][cellY+3] === 3))) {
        return 4;
    }
    // трехпалубный уничтожен
    if (((matrix[cellX-1][cellY] === 3 && matrix[cellX-2][cellY] === 3 && (matrix[cellX-3][cellY] === 2 || matrix[cellX-3][cellY] === 5) && (matrix[cellX+1][cellY] === 2 || matrix[cellX+1][cellY] === 5)) ||
        (matrix[cellX-1][cellY] === 3 && (matrix[cellX-2][cellY] === 2 || matrix[cellX-2][cellY] === 5) && matrix[cellX+1][cellY] === 3 && (matrix[cellX+2][cellY] === 2 || matrix[cellX+2][cellY] === 5)) ||
        ((matrix[cellX-1][cellY] === 2 || matrix[cellX-1][cellY] === 5) && matrix[cellX+1][cellY] === 3 && matrix[cellX+2][cellY] === 3 && (matrix[cellX+3][cellY] === 2 || matrix[cellX+3][cellY] === 5))) ||
        ((matrix[cellX][cellY-1] === 3 && matrix[cellX][cellY-2] === 3 && (matrix[cellX][cellY-3] === 2 || matrix[cellX][cellY-3] === 5) && (matrix[cellX][cellY+1] === 2 || matrix[cellX][cellY+1] === 5)) ||
            (matrix[cellX][cellY-1] === 3 && (matrix[cellX][cellY-2] === 2 || matrix[cellX][cellY-2] === 5) && matrix[cellX][cellY+1] === 3 && (matrix[cellX][cellY+2] === 2 || matrix[cellX][cellY+2] === 5)) ||
            ((matrix[cellX][cellY-1] === 2 || matrix[cellX][cellY-1] === 5) && matrix[cellX][cellY+1] === 3 && matrix[cellX][cellY+2] === 3 && (matrix[cellX][cellY+3] === 2 || matrix[cellX][cellY+3] === 5)))) {
        return 3;
    }
    // двухпалубный уничтожен
    if (((matrix[cellX-1][cellY] === 3 && (matrix[cellX-2][cellY] === 2 || matrix[cellX-2][cellY] === 5) && (matrix[cellX+1][cellY] === 2 || matrix[cellX+1][cellY] === 5)) ||
        ((matrix[cellX-1][cellY] === 2 || matrix[cellX-1][cellY] === 5) && matrix[cellX+1][cellY] === 3 && (matrix[cellX+2][cellY] === 2 || matrix[cellX+2][cellY] === 5))) ||
        ((matrix[cellX][cellY-1] === 3 && (matrix[cellX][cellY-2] === 2 || matrix[cellX][cellY-2] === 5) && (matrix[cellX][cellY+1] === 2 || matrix[cellX][cellY+1] === 5)) ||
            ((matrix[cellX][cellY-1] === 2 || matrix[cellX][cellY-1] === 5) && matrix[cellX][cellY+1] === 3 && (matrix[cellX][cellY+2] === 2 || matrix[cellX][cellY+2] === 5)))) {
        return 2;
    }
    // однопалубный уничтожен
    if ((matrix[cellX-1][cellY] === 2 || matrix[cellX-1][cellY] === 5) && (matrix[cellX][cellY-1] === 2 || matrix[cellX][cellY-1] === 5) && (matrix[cellX][cellY+1] === 2 || matrix[cellX][cellY+1] === 5) && (matrix[cellX+1][cellY] === 2 || matrix[cellX+1][cellY] === 5)) {
        return 1;
    }
}

// конец игры
function isGameOver() {
    if (playerPoints === 10) {
        containerGameStep.innerText = "Игра окончена. Победил " + name;
        return true;
    } else if (computerPoints === 10) {
        containerGameStep.innerText = "Игра окончена. Победил компьютер";
        return true;
    }
    return false;
}

// генерация матриц
function generateMatrix() {
    var matrix = [];    // 0 - пустая клетка, 1 - часть корабля, 2 - невозможность установки, 3 - подбит, 4 - потоплен, 5 - пустая клетка
    for (var i = -1; i < 11; i++) {
        matrix[i] = [];
        for (var j = -1; j < 11; j++) {
            matrix[i][j] = 0;
        }
    }

    // расстановка кораблей
    var x, y;
    var axis;     // 0 - вертикаль, 1 - горизонталь
    for (i = 0; i < 4; i++) {
        for (j = 0; j < i + 1; j++) {
            x = Math.floor(Math.random() * 10);
            y = Math.floor(Math.random() * 10);
            axis = Math.floor(Math.random() * 2);
            if (axis === 1) {
                // горизонтальное расположение
                while (!isHorAreaEmpty(4 - i)) {
                    x = Math.floor(Math.random() * 10);
                    y = Math.floor(Math.random() * 10);
                }
                buildHorShip(4 - i);
            } else {
                // вертикальное расположение
                while (!isVerAreaEmpty(4 - i)) {
                    x = Math.floor(Math.random() * 10);
                    y = Math.floor(Math.random() * 10);
                }
                buildVerShip(4 - i);
            }
        }
    }

    // проверка площадей на возможность установки корабля
    function isHorAreaEmpty(deckCount) {
        if (x + deckCount > 9) {
            return false;
        }
        // проверка всех соседних клеток
        for (var checkByX = x; checkByX < x + deckCount; checkByX++) {
            if (matrix[checkByX][y] > 0) {
                return false;
            }
        }
        return true;
    }
    function isVerAreaEmpty(deckCount) {
        if (y + deckCount > 9) {
            return false;
        }
        // проверка всех соседних клеток
        for (var checkByY = y; checkByY < y + deckCount; checkByY++) {
            if (matrix[x][checkByY] > 0) {
                return false;
            }
        }
        return true;
    }

    // установка корабля с блокировкой соседних клеток
    function buildHorShip(deckCount) {
        // блокировка левых клеток
        matrix[x-1][y] = 2;
        matrix[x-1][y+1] = 2;
        matrix[x-1][y-1] = 2;
        for (var counter = 0; counter < deckCount; counter++) {
            matrix[x][y] = 1;
            // блокировка вертикальных клеток
            matrix[x][y+1] = 2;
            matrix[x][y-1] = 2;
            x++;
        }
        // блокировка правых клеток
        matrix[x][y] = 2;
        matrix[x][y+1] = 2;
        matrix[x][y-1] = 2;
    }
    function buildVerShip(deckCount) {
        // блокировка верхних клеток
        matrix[x][y-1] = 2;
        matrix[x-1][y-1] = 2;
        matrix[x+1][y-1] = 2;
        for (var counter = 0; counter < deckCount; counter++) {
            matrix[x][y] = 1;
            // блокировка горизонтальных клеток
            matrix[x-1][y] = 2;
            matrix[x+1][y] = 2;
            y++;
        }
        // блокировка нижних клеток
        matrix[x][y] = 2;
        matrix[x-1][y] = 2;
        matrix[x+1][y] = 2;
    }

    return matrix;
}