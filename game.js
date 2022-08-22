const tableDiv = document.getElementsByClassName("table")[0];
const pieces = document.getElementsByClassName("pieces");
const gameOverPanel = document.getElementsByClassName("panel")[0];
const startGamePanel = document.getElementsByClassName("panel")[1];
let allSlots = [[],[],[],[],[],[]];
const game = {
    turn:1,
    tableConfiguration: [[],[],[],[],[],[]],
    playersScore:[0,0],
    totalPiecesPlayed:0,
    pieceSelected:0,
    isPlayerVsBot:true
}
const bot = {
    remainingPieces:[1,2,3,4,5,6,7,8,9,10],
}
const resetGame = ()=>{
    gameOverPanel.classList.add("hide");
    game.totalPiecesPlayed = 0;
    game.pieceSelected = 0;
    game.tableConfiguration = [[],[],[],[],[],[]];
    allSlots = [[],[],[],[],[],[]];
    game.turn = game.turn == 1?0:1;
    bot.remainingPieces=[1,2,3,4,5,6,7,8,9,10],
    initializeTableConfiguration();
    createTableLines();
    createPlayersPieces();
    if(game.isPlayerVsBot && game.turn == 1){
        botPlay();
    }
    refreshPiecesDisplayStateOnMob();
}
const initializeTableConfiguration = ()=>{
    let tempTBase=0;
    while (tempTBase < 6) {
        for (let i = 0; i < 6-tempTBase; i++) {
            game.tableConfiguration[tempTBase].push({player:0,id:0});
        }
        tempTBase++;
    }
}
const setIsPlayingWithBot = (isPlaying)=>{
    game.isPlayerVsBot = isPlaying;
    startGamePanel.classList.add("hide");
}
const createTableLines = ()=>{
    tempTBase=0;
    tableDiv.textContent="";
    while (tempTBase < 6) {
        const lineDiv = document.createElement("div");
        lineDiv.classList.add("line");
        for (let i = 0; i < 6-tempTBase; i++) {
            const button = document.createElement("button");
            button.classList.add("cell"); 
            button.setAttribute("id", [tempTBase,i]);
            button.addEventListener("click", choosePieceSlot);
            allSlots[tempTBase].push(button);
            lineDiv.appendChild(button);
        }
        tableDiv.appendChild(lineDiv);
        tempTBase++;
    }
}
const createPlayersPieces = ()=>{
    pieces[0].textContent = "";
    pieces[1].textContent = "";
    for (let i = 1; i <= 10; i++) {
        const button = document.createElement("button");
        button.classList.add("cell"); 
        button.classList.add("playerOneCell"); 
        button.textContent = `${i}`;    
        button.setAttribute("player", 0);
        button.setAttribute("id", i);
        button.addEventListener("click", selectPiece);
        pieces[0].appendChild(button);
    }
    for (let i = 1; i <= 10; i++) {
        const button = document.createElement("button");
        button.classList.add("cell"); 
        button.classList.add("playerTwoCell");
        button.textContent = `${i}`;
        button.setAttribute("player", 1);
        button.setAttribute("id", i);
        button.addEventListener("click", selectPiece);
        pieces[1].appendChild(button);
    }
}
const selectPiece = (e,buttonId=false)=>{
    if(!buttonId){
        let _button = e.target;
        if(_button.getAttribute("player") == game.turn){
            game.pieceSelected = _button.getAttribute("id");
        }
    }else{
        game.pieceSelected = buttonId;
    }
}
const choosePieceSlot = (e,buttonId=false)=>{
    let _slot = "";
    if(!buttonId) 
        _slot = e.target.getAttribute("id").split(",");
    else _slot = buttonId.split(",");
    if(game.tableConfiguration[_slot[0]][_slot[1]].id == 0 && game.pieceSelected != 0){
        game.tableConfiguration[_slot[0]][_slot[1]] = {player:game.turn,id:game.pieceSelected}
        allSlots[_slot[0]][_slot[1]].textContent = `${game.pieceSelected}`;
        allSlots[_slot[0]][_slot[1]].classList.add(game.turn==0?"playerOneCell":"playerTwoCell");
        pieces[game.turn].childNodes[game.pieceSelected-1].classList.add("disabled");
        game.turn = game.turn == 0 ? 1:0;
        game.pieceSelected = 0;
        game.totalPiecesPlayed++;
        if(game.totalPiecesPlayed >= 20){
            for(let lineSlotIndex=0;lineSlotIndex<game.tableConfiguration.length;lineSlotIndex++){
                let blackHolePosition = false
                for (let i = 0; i < game.tableConfiguration[lineSlotIndex].length; i++) {
                    if(game.tableConfiguration[lineSlotIndex][i].id == 0){
                        blackHolePosition = [lineSlotIndex,i];
                        break;
                    }
                }
                if(blackHolePosition != false){
                    const res = calculateScore(blackHolePosition);
                    endGame(res);
                    break;
                }
            }
        }else{
            if(game.isPlayerVsBot && game.turn == 1){
                setTimeout(botPlay,500);
            }
        }
        refreshPiecesDisplayStateOnMob();
    }
}
const refreshPiecesDisplayStateOnMob = ()=>{
    if(game.turn == 0){
        pieces[0].classList.remove("hideMob");
        pieces[1].classList.add("hideMob");
    }else{
        pieces[0].classList.add("hideMob");
        pieces[1].classList.remove("hideMob");
    }
}
const botPlay=()=>{
    let item = RandomRange(0,bot.remainingPieces.length);
    selectPiece("",bot.remainingPieces[item]);
    choosePieceSlot("",getEmptySlot());
    bot.remainingPieces.splice(item, 1);
}
const calculateScore = (emptySlot = [0,0])=>{
    const lineAbove = emptySlot[0]-1;
    const lineBelow = emptySlot[0]+1;
    const leftSide = emptySlot[1]-1;
    const rightSide = emptySlot[1]+1;
    const playersLostPoints = [0,0];
    const sumLostPoints = (slotInfo)=>{
        playersLostPoints[parseInt(slotInfo.player)] += parseInt(slotInfo.id); 
    }
    if(lineAbove >= 0){
        sumLostPoints(game.tableConfiguration[lineAbove][emptySlot[1]]);
        if(emptySlot[1]+1 < game.tableConfiguration[lineAbove].length)
            sumLostPoints(game.tableConfiguration[lineAbove][emptySlot[1]+1]);
    }
    if(lineBelow <= 5){
        if(emptySlot[1]-1 >= 0)
            sumLostPoints(game.tableConfiguration[lineBelow][emptySlot[1]-1]);
        if(emptySlot[1] < game.tableConfiguration[lineBelow].length)
            sumLostPoints(game.tableConfiguration[lineBelow][emptySlot[1]]);
    }
    if(leftSide >= 0){
        sumLostPoints(game.tableConfiguration[emptySlot[0]][leftSide]);
    }
    if(rightSide < game.tableConfiguration[emptySlot[0]].length ){
        sumLostPoints(game.tableConfiguration[emptySlot[0]][rightSide]);
    }
    return playersLostPoints;
}
const endGame = (playersLostPoints)=>{
    const playersScoreText = document.getElementsByClassName("playerScore");
    const winnerText = document.getElementsByClassName("winner")[0];
    const endGameSubText = document.getElementsByClassName("endGameSubtitle")[0];
    const playerVictoryTimes = document.getElementsByClassName("score");
    playersScoreText[0].textContent = "-"+playersLostPoints[0];
    playersScoreText[1].textContent = "-"+playersLostPoints[1];
    if(playersLostPoints[0] < playersLostPoints[1]){
        winnerText.textContent = "Player One Won!";
        endGameSubText.textContent = "Player Two had more points sucked into the black hole, so he lost!";
        game.playersScore[0]++;
    }else if(playersLostPoints[0] > playersLostPoints[1]){
        winnerText.textContent = "Player Two Won!";
        endGameSubText.textContent = "Player One had more points sucked into the black hole, so he lost!";
        game.playersScore[1]++;
    }else {
        winnerText.textContent = "DRAW!";
        endGameSubText.textContent = "";
    }
    playerVictoryTimes[0].textContent = game.playersScore[0];
    playerVictoryTimes[1].textContent = game.playersScore[1];
    gameOverPanel.classList.remove("hide");

}
const getEmptySlot = ()=>{
    //Try to get a random slot
    let randomI = RandomRange(0,game.tableConfiguration.length);
    let randomJ = RandomRange(0,game.tableConfiguration[randomI].length);
    if(game.tableConfiguration[randomI][randomJ].id == 0){
        return `${randomI},${randomJ}`;
    }
    for(let i=0;i<game.tableConfiguration.length;i++){
        for (let j = 0; j < game.tableConfiguration[i].length; j++) {
            if(game.tableConfiguration[i][j].id == 0){
                return `${i},${j}`;
            }
        }
    }
}
function RandomRange(min,max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

resetGame();