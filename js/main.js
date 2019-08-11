let rootHex,
    widthN = 0,
    heightM = 0,
    depthL = 0,
    sizeHex = 20,
    trHtml = '<tr>' +
        '<td></td>' +
        '<td>${probability}</td>' +
        '<td>${countAll}</td>' +
        '<td>${countNoOne}</td>' +
        '<td>${countOn}</td>' +
        '</tr>';
$("#createPole").click(()=>{
    depthL =  $("#inputL").val();
    heightM = $("#inputM").val();
    widthN = $("#inputN").val();
    if (heightM > 30 || depthL > 30 || widthN > 30) {
        swal("", "Значение не может быть больше 30", "warning");
        return false;
    }
    if (depthL <= 0 || heightM <= 0 || widthN <= 0){
        swal("", "Все поля должны быть заполнены", "warning");
        return false;
    }
    $("#poleEdit").removeClass("hidden");
    $("#poleCanvas").hide();
    $("#loader").show();
    Hexagon.hexagons.clear();
    $("#countDomain").text(0);
    rootHex = new Hexagon();
    let currHex = rootHex;

    for (let l = 0; l < depthL - 1; l++) {
        currHex = Hexagon.addHexBySide(currHex, 3);
    }
    currHex = rootHex;
    while (currHex){
        let firstHex = currHex;
        for (let m = 0; m < heightM - 1; m++){
            currHex = Hexagon.addHexBySide(currHex, 2);
        }
        currHex = firstHex.neighbourhood[3];
    }
    currHex = rootHex;
    for (let n = 0; n < widthN - 1; n++){

        currHex = Hexagon.addHexBySide(currHex, 1);

        while (currHex.neighbourhood[3]){
            currHex = Hexagon.addHexBySide(currHex, 2);
        }
        while (currHex.neighbourhood[4].neighbourhood[3]){
            currHex = Hexagon.addHexBySide(currHex, 3);
        }
        currHex = Hexagon.getHexBySide(rootHex, 1, n+1);
    }
    setTimeout(drawPole, 1);
});
$("#machDomain").click(()=>{
    $("#poleCanvas").hide();
    $("#loader").show();
    Hexagon.clearHexagons();
    app.stage.children.forEach(container => {

        let id = parseInt(container.name.replace("container-", ""));
       if (id){
           let hex = Hexagon.hexagons.get(id);
           if (hex){
               let textInput = container.children.find(v => v.constructor.name === "PixiTextInput");
               hex.on = textInput ? parseInt(textInput.text) : 0;
           }
       }
    });
    let count = findDomain();
    let countNotLink = getEmpty();
    addRowByTable('-', count, countNotLink, Array.from(Hexagon.hexagons).filter(([k,v]) => v.on === 1).length);
    $("#countDomain").text(count);
    setTimeout(drawPole, 1);
});
$("#autoCreate").click(()=>{
    $("#poleCanvas").hide();
    $("#loader").show();
    Hexagon.clearHexagons();
    let rand = parseFloat($("#randValue").val().replace(',','.'));
    if (isNaN(rand)) {
        swal("Ошибка", "Ввидите корректное значение", "error");
        return false;
    }
    if (rand < 0.01 || rand > 0.99){
        swal("Ошибка", "Ввидите корректное значение", "error");
        return false;
    }
    Hexagon.hexagons.forEach(v =>
        v.on = getRandomInRange(1, 99) < rand * 100 ? 1 : 0
    );
    let count = findDomain();
    let countNotLink = getEmpty();
    addRowByTable(rand, count, countNotLink, Array.from(Hexagon.hexagons).filter(([k,v]) => v.on === 1).length);
    $("#countDomain").text(count);
    setTimeout(drawPole, 1);
});

function addRowByTable(probability, countAll, countNoOne, countOn) {
    if ($("#tableResultBody").children("tr").length >= 10){
        $($("#tableResultBody").children("tr")[0]).detach();
    }
    $("#tableResultBody").append(
        trHtml
        .replace("${probability}", probability)
        .replace("${countAll}", countAll)
        .replace("${countNoOne}", countNoOne)
        .replace("${countOn}", countOn)
    );
    $("#tableResultBody").children("tr").each((i, row) => {
        $($(row).children("td")[0]).text(i+1);
    });
}

function drawPole(){
    for (let i = app.stage.children.length - 1; i >= 0; i--) {
        app.stage.removeChild(app.stage.children[i]);
    }
    let currHex = rootHex;
    let widthSize = (sizeHex + Math.floor(sizeHex * 0.67));
    let heightSize = (sizeHex + Math.floor(sizeHex * 0.47));
    let firstHex = 0;
    canvas.resize((parseInt(widthN) + parseInt(widthN)) * widthSize, (parseInt(heightM) + parseInt(depthL)) * heightSize);
    for (let i = 0; currHex; i++){
        firstHex = currHex;
        let x = widthSize * (depthL * 0.5  )- i * widthSize / 2;
        let y = i * heightSize;
        while(currHex){
            createHexagon(x, y, sizeHex, `0x${currHex.color.substr(1)}`, currHex.on.toString(), `container-${currHex.id}`);
            x += widthSize;
            currHex = currHex.neighbourhood[1];
        }
        currHex = firstHex.neighbourhood[3];
    }
    currHex = firstHex.neighbourhood[2];
    for (let i = depthL; currHex; i++){
        firstHex = currHex;
        let x = widthSize * (depthL * 0.5) + i * widthSize / 2 + widthSize - depthL * widthSize;
        let y = i * heightSize;
        while(currHex){
            createHexagon(x, y, sizeHex, `0x${currHex.color.substr(1)}`, currHex.on.toString(), `container-${currHex.id}`);
            x += widthSize;
            currHex = currHex.neighbourhood[1];
        }
        currHex = firstHex.neighbourhood[2];
    }
    app.render();
    $("#loader").hide();
    $("#poleCanvas").show();
    $("#tableResult").removeClass("hidden");
}
function findDomain() {
    let count = 0;
    Hexagon.hexagons.forEach((value) => {
        if (value.on === 1 && value.color === Hexagon.defaultColor){
            let subCount = Hexagon.getDomain(value, getRandomColor());
            if (subCount > 0) {
                count++;
            }
        }
    });
    return count;
}
function getEmpty() {
    let empty = [];
    let colors = [];
    let emptyHexs = Array.from(Hexagon.hexagons).filter(([k,v]) => v.on === 0);
    for (let i = 0; i < emptyHexs.length; i++) {
        if (empty.indexOf(emptyHexs[i][0]) === -1){
            let result = Hexagon.checkExit(emptyHexs[i][1], empty);
            if (result !== 0 && colors.indexOf(result) === -1) colors.push(result);
        }
    }
    return colors.length;
}
function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
function getRandomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
