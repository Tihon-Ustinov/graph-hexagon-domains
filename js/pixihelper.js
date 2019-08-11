let canvas = renderer = new PIXI.Renderer({
        // antialias: true, // сглаживание, разкоментируйте для включения (увеличивает время рендера)
        backgroundColor: 0xEFEFEF,
        preserveDrawingBuffer: true
    });
const  app = new PIXI.Application({
    autoStart: false
});
app.renderer = canvas;
document.getElementById('poleCanvas').appendChild(app.view);
function createHexagon(x, y, size, color, value, name) {
    let container = new PIXI.Container();
    let hex = createSimpleHexagon(x + 2.5, y + 3,size - 3, color, 1);
    // Разкоментируйте эти строчки если хотите рисовать обводку (увеличивает время рендера)
    // let border = createSimpleHexagon(x, y, size, 0x000, 0);
    // container.addChild(border);
    container.addChild(hex);
    let inputField = createInput(x + 3, y + 3, value, size - 3);
    container.addChild(inputField);
    container.buttonMode = true;
    container.interactive = true;
    container.cursor = "pointer";
    container.name = name;
    container.on('click', hexClick);
    app.stage.addChild(container);
    return container;
}
function hexClick(e) {
    let baseRenderTexture = new PIXI.BaseRenderTexture();
    let renderTexture = new PIXI.RenderTexture(baseRenderTexture);
    let textInput =  this.children.find(v => v.constructor.name === "PixiTextInput");
    if (textInput) {
        textInput.text = parseInt(textInput.text) === 0 ? 1 : 0;
        textInput.focus();
    }
    app.render(this, renderTexture);
}
function createSimpleHexagon(x, y, size, color, zIndex = 0) {
    let hex = new PIXI.Graphics();
    hex.beginFill(color);
    hex.drawPolygon (getPathHexagon(size));
    hex.endFill();
    hex.position = new PIXI.Point(x, y);
    hex.zIndex = zIndex;
    return hex;
}
function createInput(x, y, value, size) {
    let inputField = new PixiTextInput(value,{
        x: x,
        y: y,
        zIndex: 10,
        fontSize: size,
        height: size / 2,
        width: size / 2,
        align: "center",
    });
    inputField.background = false;
    inputField.width = size;
    inputField.caret.position = new PIXI.Point(x + size/2, y + size/2);
    inputField.children.forEach(value => {
        value.position = new PIXI.Point(x + size/2, y + size/2);
    });
    return inputField;
}
//переопределил чтобы не обрабатывать другие кнопки кроме 1, 0, arrowUp, arrowDown
PixiTextInput.prototype.onKeyEvent = function(e){
    switch (e.key) {
        case "1":
        case "ArrowUp":
            this.setText("1");
            break;
        case "0":
        case "ArrowDown":
            this.setText("0");
            break;
        default:
            this.setText("0");
            break;
    }
    this.focus();
    app.render();
    return false;
};
function getPathHexagon(size) {
    let height = size * 2;
    let width = height * Math.sqrt(3) / 2;
    let arr = [];
    arr.push(new PIXI.Point(width / 2, 0));
    arr.push(new PIXI.Point(width, height / 4));
    arr.push(new PIXI.Point(width, height * 3 / 4));
    arr.push(new PIXI.Point(width / 2, height));
    arr.push(new PIXI.Point(0, height * 3 / 4));
    arr.push(new PIXI.Point(0, height / 4));
    return arr;

}
