let F = function (n) { this.a = n }
let f = function () { return this.a }
let fs = function () { "use strict"; return this.a }
let value = new F(12)

console.log(fs())