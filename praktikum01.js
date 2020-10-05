"use strict";

function findTag (text){
    let isToken = false;
    let token = "";
    for (let i = 0; i < text.length; ++i){
        if (text[i] === "<") {
            isToken = true;
        } else if (text[i] === ">") {
            isToken = false;
            return token;
        } else if (isToken){
            token = token.concat(text[i]);
        }
    }
}

module.exports = { findTag }

function fibo(n){
    if (n === 0) return 0;
    if (n === 1) return 1;
    return fibo(n-1) + fibo(n-2);
}

function fibo2(n){
    let g = (1 + Math.sqrt(5))/2
    return Math.round(Math.pow(g, n)/Math.sqrt(5));
}

console.log(findTag("<header>Text</header"));
console.log(findTag("blabla <br> blabla"));

let times = 55
console.time("fibo");
console.log(fibo(times));
console.timeEnd("fibo");

console.time("fibo2");
console.log(fibo2(times));
console.timeEnd("fibo2");