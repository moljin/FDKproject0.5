 "use strict"
 /*jshint esversion: 6 */
 accountsDeleteInit();
 function accountsDeleteInit() {
     try {
         const accountsDeleteBtn = document.querySelector("#accounts-delete-btn");
         accountsDeleteBtn.addEventListener('click', function (e) {
             e.preventDefault();
             let _id = document.querySelector("#account_id").value;
             accountsDelete(_id);
             // let _id = document.querySelector("#user_id").value;
             // console.log("_id", _id)
             // let formData = new FormData();
             // formData.append("_id", _id);
             // let request = $.ajax({
             //             url: accountsDeleteAjax,
             //             type: 'POST',
             //             data: formData,
             //             headers: {"X-CSRFToken": CSRF_TOKEN,},
             //             dataType: 'json',
             //             async: false,
             //             cache: false,
             //             contentType: false,
             //             processData: false,
             //
             //             success: function (response) {
             //                 if (response.error) {
             //                     alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + response.error);
             //                 } else {
             //                     console.log('Account delete success');
             //                     window.location.href = response.redirect_url;
             //                 }
             //             },
             //             error: function (err) {
             //                 alert('내부 오류가 발생하였습니다.\n' + err);
             //             }
             //         });


         }, false);

     } catch (e) {
         // console.log(e);
     }

     try {
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