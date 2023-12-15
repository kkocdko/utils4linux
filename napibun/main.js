const native = require("./dist/native.node");
const args = [...Array(20).keys()];
console.log(JSON.stringify(args));
console.log(native.foo(...args));
