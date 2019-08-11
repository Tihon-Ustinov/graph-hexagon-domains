'use strict';
class Hexagon {
    static hexagons = new Map();
    static defaultColor = "#999999";
    constructor() {
        this.id = Hexagon.hexagons.size + 1;
        this.color = Hexagon.defaultColor;
        this.on = 0;
        this.neighbourhood = [0,0,0,0,0,0];
        Hexagon.hexagons.set(this.id, this);
    }
    static clearHexagons(){
        this.hexagons.forEach((value) => {
            value.color = Hexagon.defaultColor;
            value.on = 0;
        });
    }
    static countHexBySide(hex, side){
        if (!Boolean(hex)) return 0;
        return this.countHexBySide(hex.neighbourhood[side], side) + 1;
    }
    static getHexBySide(hex, side, n = 1){
        if (n === 0) return hex;
        if (!Boolean(hex)) return null;
        return this.getHexBySide(hex.neighbourhood[side], side, --n);
    }
    static addHexBySide(currHex, side, newHex = new Hexagon()){
        currHex.neighbourhood[side] = newHex;
        let invertSide = this.roundSide(side + 3);
        newHex.neighbourhood[invertSide] = currHex;
        let prevSide = this.roundSide(side-1 );
        if (currHex.neighbourhood[prevSide]){
            newHex.neighbourhood[this.roundSide(invertSide + 1)] = currHex.neighbourhood[prevSide];
            currHex.neighbourhood[prevSide].neighbourhood[this.roundSide(side + 1)] = newHex;
            if (currHex.neighbourhood[prevSide].neighbourhood[side]){
                newHex.neighbourhood[this.roundSide(side-1)] = currHex.neighbourhood[prevSide].neighbourhood[side];
                currHex.neighbourhood[prevSide].neighbourhood[side].neighbourhood[this.roundSide(invertSide - 1)] = newHex;
            }
        }
        let nextSide = this.roundSide(side+1);
        if (currHex.neighbourhood[nextSide]){
            newHex.neighbourhood[this.roundSide(invertSide - 1)] = currHex.neighbourhood[nextSide];
            currHex.neighbourhood[nextSide].neighbourhood[this.roundSide(side - 1)] = newHex;
            if (currHex.neighbourhood[nextSide].neighbourhood[side]){
                newHex.neighbourhood[this.roundSide(side + 1)] = currHex.neighbourhood[nextSide].neighbourhood[side];
                currHex.neighbourhood[nextSide].neighbourhood[side].neighbourhood[this.roundSide(invertSide + 1)] = newHex;
            }
        }
        return newHex;
    }
    static roundSide(side){
        if (side < 6 && side >= 0) return side;
        if (side >= 6) return  side % 6;
        if (side < 0) return this.roundSide(6 + side);
    }
    static getDomain(currHex, color){
        if (currHex){
            if (currHex.on) {
                currHex.color = color;
                let summ = 1;
                for (let i = 0; i < 6; i++){
                    if (currHex.neighbourhood[i]){
                        if (currHex.neighbourhood[i].on && currHex.neighbourhood[i].color !== color)
                            summ += this.getDomain(currHex.neighbourhood[i], color);
                    }
                }
                return  summ;
            } else return 0;
        } else return 0;
    }
    static checkExit(currHex, empty = Array()){
        if (currHex === 0) return 0;
        if (currHex.on === 1) return 1;
        empty.push(currHex.id);
        let flag = 1;
        let color = "";
        for (let i = 0; i < 6; i++) {
            if (currHex.neighbourhood[i] === 0) return 0;
            if (currHex.neighbourhood[i].on === 1) {
                color = currHex.neighbourhood[i].color;
                continue;
            }
            if (empty.indexOf(currHex.neighbourhood[i].id) === -1){
                 if (this.checkExit(currHex.neighbourhood[i], empty) === 0)  flag = 0;
            }
        }
        return  flag === 0 ? 0 : color;
    }
}
