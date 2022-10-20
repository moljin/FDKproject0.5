"use strict"

function textAreaHeightAuto(obj) {
    obj.style.height = "1px";
    obj.style.height = (12 + obj.scrollHeight) + "px";
}