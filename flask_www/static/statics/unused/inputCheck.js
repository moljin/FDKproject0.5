 "use strict"
 /*jshint esversion: 6 */
checkBoxInit();
function checkBoxInit(){
    const checkAllBox = document.querySelector("#all-check");
    const checkBoxList = document.querySelectorAll(".single");

    checkAllBox.addEventListener("change", function (e){
        e.preventDefault();
        for (let i = 0; i < checkBoxList.length; i++) {
            checkBoxList[i].checked = this.checked;
        }
    });

    Array.from(checkBoxList).forEach(function (checkBox) {
        checkBox.addEventListener("change", function (e) {
            checkAllBox.checked = false;
        });
    });

    const checkedDeleteBtn = document.querySelector("#checked-delete-btn");
    checkedDeleteBtn.addEventListener("click", function (e){
        e.preventDefault();
        Array.from(checkBoxList).forEach(function (checkBox) {
            if (checkBox.checked) {
                let _id = Number(checkBox.getAttribute("id"));
                console.log(_id)
            }
        });
        checkedAllDelete();
    });
    function checkedAllDelete () {
        console.log("Delete")
    }

}