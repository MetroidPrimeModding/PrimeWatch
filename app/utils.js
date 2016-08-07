"use strict";

module.exports = {
  getNameOfFile: function(file) {
    let typNum = parseInt(file.typ);
    let typ = String.fromCharCode(
        (typNum >> 24) & 0xFF,
        (typNum >> 16) & 0xFF,
        (typNum >> 8) & 0xFF,
        (typNum >> 0) & 0xFF
    );
    let idStr = file.id.substr(2).toLowerCase();
    while (idStr.length < 8) {
      idStr = "0" + idStr;
    }
    return idStr + "." + typ;
  },
  padId: function(id) {
    let res = id;
    while (res.length < 8) {
      res = "0" + res;
    }
    return res;
  }
};
