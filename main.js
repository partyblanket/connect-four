
(function(){
    var board = $('#board')
    var player
    var arrow
    var wins = []
    var state
    var boardCol = 7
    var boardRow = 6
    var pcPlayer = null

    setStartScreen()

    function setStartScreen () {
        $(document).off().on('keyup',function(e){
            if(e.originalEvent.key === 'Enter'){
                $('#start').css('display','none')
                resetBoard()
            }
        }).on('click',function(e){
            if(e.target.className === 'redgreen'){
                if(e.target.id === 'yellow' && pcPlayer === '2'){
                    pcPlayer = '1'
                }

                $('#start').css('display','none')
                resetBoard(e.target.id)
            }else if(e.target.className === 'option'){
                if(e.target.id === 'col'){
                    if(boardCol === 15) {
                        boardCol = 6
                    }
                    e.target.innerText = ++boardCol
                    document.documentElement.style.setProperty("--colNum", boardCol);
                }else if(e.target.id === 'row'){
                    if(boardRow === 15) {
                        boardCol = 5
                    }
                    e.target.innerText = ++boardRow
                    document.documentElement.style.setProperty("--rowNum", boardRow);
                }
            }else if(e.target.id === 'pc') {
                pcPlayer = '2'
                $('#start').css('display','none')
                resetBoard()
            }
        })

    }
    function pcPlay () {
        play(decideMove())
    }



    function decideMove () {
        var board = JSON.parse(JSON.stringify(state))
        var move = checkWinningMove(board)
        var nonLosingMoves = checkForLosingMove(board, player)
        console.log(nonLosingMoves);
        if(nonLosingMoves.length > 0){
            var randomNonLodingMove = Math.floor(Math.random() * nonLosingMoves.length)
            move = nonLosingMoves[randomNonLodingMove][1]
        }
        if(typeof move !== 'number') {
            var valid = false
            while(valid === false){
                move = Math.floor(Math.random()*7)
                if(typeof findRow(move) === 'number') {
                    valid = true
                }
            }
        }
        var tryAgain = true
        var tries = 0
        return move
    }

    function checkWinningMove(board, pl = player) {
        var c = 0
        for(c;c < boardCol;c++){
            var r = findRow(c,board)
            if(typeof r === 'number'){
                var updatedboard = JSON.parse(JSON.stringify(board))
                updatedboard[r][c] = pl
                if(checkForWin(r,c,updatedboard,pl)){
                    return c
                }
            }
        }
        return null
    }

    function checkForLosingMove (board, pl) {
        var possibleMoves = []
        var opponent
        pl === '2' ? opponent = '1' : opponent = '2'
        for(var c = 0; c < boardCol; c++) {
            var row = findRow(c,board)
            if(typeof row === 'number') {
                var newBoard = JSON.parse(JSON.stringify(board));
                newBoard[row][c] = pl;
                var check = checkWinningMove(newBoard,opponent);
                if(check === null){
                    possibleMoves.push([row,c])
                }
            }
        }

        return possibleMoves
    }

    function resetBoard (colour = 'red') {
        state = [...Array(boardRow)].map(function() {
            return Array(boardCol).fill(" ")
        });
        board.off().on('mousemove',function(e){
            var colOver = e.target.id % boardCol
            if(!Number.isNaN(colOver) && colOver !== arrow) {
                arrow = colOver
                moveArrow()
            }
        }).on('mouseup', function(e){
            if($(e.target).hasClass('slot')) {
                play(arrow)
            }
        })

        $(document).off().on('keyup', function(e){
            var key = e.originalEvent.key;
            if(key === 'ArrowLeft'){
                if(arrow > 0) {
                    arrow--
                    moveArrow()
                }
            }else if(key === 'ArrowRight'){
                if(arrow < boardCol - 1) {
                    arrow++
                    moveArrow()
                }
            }else if(key === 'ArrowDown' || key === 'Enter' || key === ' '){
                play(arrow)
            }
        }).on('mouseup', function (e){
            if(e.target.id === "reset") {
                $('#start').css('display','inherit')
                setStartScreen()
            }
        })
        wins = []
        player = '1'
        if(colour === 'yellow'){
            player = '2'
        }

        arrow = 0
        var arrows = `<div class="arrow-down"></div>`.repeat(boardCol)
        $('#arrows').empty().append(arrows)
        $('body').css('background-color', 'white')
        drawBoard()
        moveArrow()
    }

    function moveArrow(){
        if (player === '1'){
            $('.arrow-down').removeClass('selectedOne selectedTwo').eq(arrow).addClass('selectedOne')
        }else{
            $('.arrow-down').removeClass('selectedOne selectedTwo').eq(arrow).addClass('selectedTwo')
        }
    }

    function play (col) {
        var row = findRow(col)
        if(row === false) {
            return false
        }
        updateState([row,col],player)
        drawBoard()
        checkForWin(row, col, state,player)
        win()
        player === '1' ? player = '2' : player = '1'
        moveArrow()
        setTimeout(function(){
            if(player === pcPlayer && wins.length === 0 ) {
                pcPlay()
            }
        },350)
    }

    function updateState (coords,entry){
        state[coords[0]][coords[1]] = entry
    }

    function findRow (cl, st = state) {
        if(st[0][cl] !== " "){
            return false
        }
        for(var row = boardRow - 1; row > -1; row--) {
            if (st[row][cl] === " ") {
                break;
            }
        }
        return row
    }

    function checkForWin (r, c, board,pl) {
        var win = false
        var row = checkRow(r,c, board,pl)
        if (row) {
            win = true;
            if (pl === player){
                wins.push(row)
            }
        }
        var col = checkCol(r,c, board,pl)
        if(col) {
            win = true;
            if(pl === player){
                wins.push(col)
            }
        }
        var dr = checkDiagRight(r,c, board,pl)
        if(dr) {
            win = true;
            if(pl === player){
                wins.push(dr)
            }
        }
        var dl = checkDiagLeft(r,c, board,pl)
        if(dl) {
            win = true;
            if(pl === player){
                wins.push(dl)
            }
        }
        return win
    }

    function checkRow(row,col,board,pl) {
        if (boardRow - row < 4) {
            return
        }
        var line = [row+"-"+col]
        for (var i = 0; i < 3; i++) {
            if(board[++row][col] === pl) {
                line.push(row+"-"+col)
            }else{
                break
            }
        }
        if(line.length > 3 ){
            return line
        }
    }

    function checkCol(row,col,board,pl) {
        var line = []
        var index = col - 3 < 0 ? 0 : col - 3
        var endIndex = col + 3 > boardCol ? boardCol : col + 3
        for (index; index <= endIndex; index++) {
            if(board[row][index] === pl) {
                line.push(row+"-"+index)
            }else{
                if(line.length > 3 ){
                    break;
                }else{
                    line = []
                }
            }
        }

        if(line.length > 3 ){
            return line
        }
    }

    function checkDiagRight (row,col,board,pl) {
        var startCoor = [row,col]
        var endCoor = [row,col]
        for (var i = 3; i > 0; i--) {
            if (board[row-i] && board[0][col-i]) {
                startCoor = [row-i,col-i]
                break;
            }
        }
        for (var i = 3; i > 0; i--) {
            if (board[row+i] && board[0][col+i]) {
                endCoor = [row+i,col+i]
                break;
            }
        }
        var maxLength = endCoor[0] - startCoor[0] + 1
        if(maxLength < 4){
            return
        }

        var line = [];
        for (var i = 0; i <maxLength;i++) {
            if(board[startCoor[0]+i][startCoor[1]+i] === pl) {
                line.push((startCoor[0]+i)+"-"+(startCoor[1]+i))
            }else{
                if(line.length > 3 ){
                    break;
                }else{
                    line = []
                }
            }
        }
        if(line.length > 3 ){
            return line
        }
    }

    function checkDiagLeft (row,col,board,pl) {
        var startCoor = [row,col]
        var endCoor = [row,col]
        for (var i = 3; i > 0; i--) {
            if (board[row-i] && board[0][col+i]) {
                startCoor = [row-i,col+i]
                break;
            }
        }
        for (var i = 3; i > 0; i--) {
            if (board[row+i] && board[0][col-i]) {
                endCoor = [row+i,col-i]
                break;
            }
        }
        var maxLength = endCoor[0] - startCoor[0] + 1
        if(maxLength < 4){
            return
        }
        var line = [];
        for (var i = 0; i <maxLength;i++) {
            if(board[(startCoor[0]+i)][startCoor[1]-i] === pl) {
                line.push((startCoor[0]+i)+"-"+(startCoor[1]-i))
            }else{
                if(line.length > 3 ){
                    break;
                }else{
                    line = []
                }
            }
        }
        if(line.length > 3 ){
            return line
        }
    }

    function win (winner = '1') {
        if(wins.length > 0){
            $('body').css('background-color', 'pink')
            drawWin()
            board.off()
            $(document).off().on('keyup',function(e){
                if(e.originalEvent.key === 'Enter'){
                    $('.winner').remove()
                    resetBoard()
                }
            })
        }
    }

    function drawWin(){
        wins.flat().forEach(function(el) {
            var coorArr = el.split('-')
            state[coorArr[0]][coorArr[1]] = 'W'
        })
        var winner
        if(pcPlayer === null){
            player === '1' ? winner = 'Red wins' : winner = 'Yellow wins'
        }else{
            player === pcPlayer ? winner = 'PC wins' : winner = 'YOU win'
        }
        var winDiv = `<div class="winner"><h1>${winner}!!</h1><br><br><h4>(press enter to restart)</h4></div>`
        $('.board-outer').append(winDiv)
        drawBoard()
        console.log(wins);
    }

    function drawBoard () {
        var id = 0
        board.empty()
        var toDraw = ''
        state.forEach(function (row) {
            row.forEach(function(slot) {
                if(slot === '1'){
                    toDraw += `<div class="slot one" id=${id++}></div>`
                }else if(slot === '2'){
                    toDraw += `<div class="slot two" id=${id++}></div>`
                }else if(slot === 'W'){
                    toDraw += `<div class="slot win" id=${id++}></div>`
                }else{
                    toDraw += `<div class="slot" id=${id++}></div>`
                }
            })
        })
        board.append(toDraw)
    }

})()
