 "use strict"
 /*jshint esversion: 6 */
 accountsDeleteInit();
 function accountsDeleteInit() {
     try { //registered self
         const accountsDeleteBtn = document.querySelector("#accounts-delete-btn");
         accountsDeleteBtn.addEventListener('click', function (e) {
             e.preventDefault();
             let _id = document.querySelector("#account_id").value;
             accountsDelete(_id);

         }, false);

     } catch (e) {
         // console.log(e);
     }

     try { //admin
         const userDeleteBtn = document.querySelector("#user-delete-btn");
         console.log("userDeleteBtn", userDeleteBtn)
         userDeleteBtn.addEventListener('click', function (e) {
             e.preventDefault();
             let _id = document.querySelector("#user_id").value;
             accountsDelete(_id);

         }, false);

     } catch (e) {
        // console.log(e);
    }

    try { //admin accounts list check delete
        const checkAllBox = document.querySelector("#all-check");
        const checkBoxList = document.querySelectorAll(".single");

        checkAllBox.addEventListener("change", function (e) {
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
        checkedDeleteBtn.addEventListener("click", function (e) {
            e.preventDefault();
            Array.from(checkBoxList).forEach(function (checkBox) {
                if (checkBox.checked) {
                    let _id = Number(checkBox.getAttribute("id"));
                    accountsDelete(_id);
                }
            });

        });
    } catch (e) {
        // console.log(e);
    }

 }

function accountsDelete (_id) {
    console.log("_id", _id)
    let formData = new FormData();
    formData.append("_id", _id);
    let request = $.ajax({
                url: accountsDeleteAjax,
                type: 'POST',
                data: formData,
                headers: {"X-CSRFToken": CSRF_TOKEN,},
                dataType: 'json',
                async: false,
                cache: false,
                contentType: false,
                processData: false,

                success: function (response) {
                    if (response.error) {
                        alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + response.error);
                    } else {
                        console.log('Account delete success');
                        window.location.href = response.redirect_url;
                    }
                },
                error: function (err) {
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });
}