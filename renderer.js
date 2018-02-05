// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
/**
 *@author Silviu-Ioan Vilcu
 */

var mathjs = require("mathjs");
var BigNumber = require("bignumber.js");
var fs = require("fs");

//Globals
var p = new BigNumber(61);
var q = new BigNumber(53);

function gcd_rec(a, b) {
  if (b) {
      return gcd_rec(b, a % b);
  } else {
      return Math.abs(a);
  }
}

function findE2(totient) {
  let e = 2;
  let g = gcd_rec(e, totient);
  while (g != 1) {
    e = Math.floor(Math.random() * (totient - 2 + 1)) + 2;
    g = gcd_rec(e, totient);
  }
  return e;
}

function modInverse(a, b) {
  a %= b;
  for (var x = 1; x < b; x++) {
    if ((a * x) % b == 1) {
      return x;
    }
  }
}

function generateKeys() {
  let a = p.minus(1);
  let b = q.minus(1);
  let totient = a.multipliedBy(b);
  let pr = p.multipliedBy(q);
  let e = findE2(totient);
  let d = modInverse(e, totient);
  return {
    publicKey: e,
    privateKey: d,
    pro: pr
  };
}

function RSAImplementation() {
  this.keys = generateKeys();
}

RSAImplementation.prototype.encrypt = function(toEncrypt) {
  let result = BigNumber(toEncrypt)
    .pow(this.keys.publicKey)
    .mod(this.keys.pro);
  return result;
};

RSAImplementation.prototype.decrypt = function(toDecrypt) {
  let result = BigNumber(toDecrypt)
    .pow(this.keys.privateKey)
    .mod(this.keys.pro);
  return result;
};

RSAImplementation.prototype.generateKeys = function() {
  this.keys = generateKeys();
};

var encrypt = document.querySelector("#encrypt");
var decrypt = document.querySelector("#decrypt");
var public = document.querySelector("#public");
var private = document.querySelector("#private");
var generate = document.querySelector("#generate");
var file = document.querySelector("#file-asm-path");
var view = document.querySelector('#view');

var pi = document.querySelector("#p");
var qi = document.querySelector("#q");

pi.value = 61;
qi.value = 53;

p = new BigNumber(pi.value);
q = new BigNumber(qi.value);

var rsa = new RSAImplementation();

public.value = rsa.keys.publicKey;
private.value = rsa.keys.privateKey;

generate.addEventListener("click", function() {
  p = new BigNumber(pi.value);
  q = new BigNumber(qi.value);
  rsa.generateKeys();
  public.value = rsa.keys.publicKey;
  private.value = rsa.keys.privateKey;
});

encrypt.addEventListener("click", function() {
  let path = file.files[0].path;
  let encryptedDecimalArray = [];
  let encryptedDataHex = "";
  fs.stat(path, function(e, stats) {
    fs.open(path, "r", function(status, fd) {
      if (status) {
        console.log(status.message);
        console.log(fd);
        return;
      }
      var buffer = new Buffer(stats.size);
      fs.read(fd, buffer, 0, stats.size, 0, function(err, num) {
        var decimalArray = [...buffer];
        for (let v of decimalArray) {
          encryptedDecimalArray.push(rsa.encrypt(v).c[0]);
        }
        for (let v of encryptedDecimalArray) {
          encryptedDataHex += ("000000000000000" + v.toString(16)).substr(-16);
        }
        let bufe = Buffer.from(encryptedDataHex, "hex");
        var filename = path
          .split("\\")
          .pop()
          .split("/")
          .pop();
        fs.writeFile("./" + filename + ".vilcu", bufe, function(e, r) {
          alert("Criptarea s-a incehiat cu succes!");
        });
      });
    });
  });
  file.value = "";
});

decrypt.addEventListener("click", function() {
  let path = file.files[0].path;
  let encryptedDecimalArray = [];
  let encryptedDataHex = "";
  fs.stat(path, function(e, stats) {
    fs.open(path, "r", function(status, fd) {
      if (status) {
        console.log(status.message);
        console.log(fd);
        return;
      }
      var buffer = new Buffer(stats.size);
      fs.read(fd, buffer, 0, stats.size, 0, function(err, num) {
        let toDecryptHexa = "";
        let hexBuffer = buffer.toString("hex", 0, num);
        var arrays = hexBuffer.match(/.{1,16}/g);
        for (let d of arrays) {
          toDecryptHexa += rsa.decrypt(parseInt(d, 16)).toString(16);
        }
        let bufe = Buffer.from(toDecryptHexa, "hex");
        var filename = path
          .split("\\")
          .pop()
          .split("/");
        fs.writeFile("./" + filename + ".decrypted", bufe, function(e, r) {
          alert("Decriptarea s-a incehiat cu succes!");
        });
      });
    });
  });
});

//Test
//var rsa = new RSAImplementation();
