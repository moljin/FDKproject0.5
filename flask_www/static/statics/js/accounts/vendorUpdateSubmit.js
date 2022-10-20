"use strict"
/*jshint esversion: 6 */
vendorUpdateInit();
function vendorUpdateInit() {
    try {
        const corpBrandCheckBtn = document.querySelector("#corp-brand-check-btn");
        corpBrandCheckBtn.addEventListener('click', function (e) {
            e.preventDefault();
            let corp_brand = document.querySelector("#corp_brand").value;
            let formData = new FormData();
            formData.append("corp_brand", corp_brand);
            let request = $.ajax({
                url: existingProfileCheckAjax,
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
                        const flashAlert_div = document.querySelector(".vendor-update-alert");
                        if (response.flash_message) {
                            flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="subscribe-alert">
                                                        <div class="alert alert-danger" role="alert">` + response.flash_message + `</div>
                                                        <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`
                        } else {
                            flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="subscribe-alert">
                                                        <div class="alert alert-danger" role="alert">상호명 중복체크 해주세요!</div>
                                                        <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`
                        }
                    }
                },
                error: function (err) {
                    console.log(err)
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });
        }, false);
    } catch (e) {
        // console.log(e);
    }

    try {
        const vendorUpdateSubmitBtn = document.querySelector("#vendor-update-submit");
        vendorUpdateSubmitBtn.addEventListener('click', function (e) {
            e.preventDefault();
            let corp_brand = document.querySelector("#corp_brand").value;
            let corp_email = document.querySelector("#corp_email").value;
            let corp_number = document.querySelector("#corp_number").value;
            let corp_online_marketing_number = document.querySelector("#corp_online_marketing_number").value;
            let corp_image = document.querySelector("#corp_image").files[0];
            let corp_address = document.querySelector("#corp_address").value;
            let main_phonenumber = document.querySelector("#main_phonenumber").value;
            let main_cellphone = document.querySelector("#main_cellphone").value;
            let profile_level = document.querySelector("#profile_level").value;
            let formData = new FormData();
            formData.append("corp_brand", corp_brand);
            formData.append("corp_email", corp_email);
            formData.append("corp_number", corp_number);
            formData.append("corp_online_marketing_number", corp_online_marketing_number);
            formData.append("corp_image", corp_image);
            formData.append("corp_address", corp_address);
            formData.append("main_phonenumber", main_phonenumber);
            formData.append("main_cellphone", main_cellphone);
            formData.append("level", profile_level);
            console.log(corp_brand)
            let request = $.ajax({
                url: vendorUpdateAjax,
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
                        const flashAlert_div = document.querySelector(".vendor-update-alert");
                        if (response.checked_message) {
                            flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="subscribe-alert">
                                                        <div class="alert alert-danger" role="alert">` + response.checked_message + `</div>
                                                        <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`
                        } else {
                            window.location.reload();
                        }

                    }
                },
                error: function (err) {
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });


        }, false);
    } catch (e) {
        // console.log(e);
    }

    try {
        const corpImgSubmit = document.querySelector("#corp-img-submit");
        corpImgSubmit.addEventListener('click', function (e) {
            e.preventDefault();
            let corp_image = document.querySelector("#corp_image").files[0];
            let formData = new FormData();
            formData.append("corp_image", corp_image);
            let request = $.ajax({
                url: vendorCorpImageSaveAjax,
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
                        console.log("corp_image save success", response.success_msg)
                        document.querySelector("#corp-modal-image").style.display = "none";
                    }
                },
                error: function (err) {
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });


        }, false);
    } catch (e) {
        // console.log(e);
    }

    try {
        const vendorDeleteBtn = document.querySelector("#vendor-delete-btn");
        vendorDeleteBtn.addEventListener('click', function (e) {
            e.preventDefault();
            let request = $.ajax({
                url: vendorDeleteAjax,
                type: 'POST',
                data: {},
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
                        console.log('vendor delete success');
                        window.location.reload()
                    }
                },
                error: function (err) {
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });


        }, false);
    } catch (e) {
        // console.log(e);
    }


}










