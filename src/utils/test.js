import {Jsonwebtoken} from "./tokennezer/jsonwebtoken";

let value = Jsonwebtoken.encrypt("test").encryptedData;
console.log(value);
