"use strict"
/*jshint esversion: 6 */
const coverImageSubmitBtn = document.querySelector("#cover-img-submit");
coverImageSubmitBtn.addEventListener('click', function (e) {
    e.preventDefault();
    let cover_img1 = document.querySelector("#cover_image1").files[0];
    let cover_img2 = document.querySelector("#cover_image2").files[0];
    let cover_img3 = document.querySelector("#cover_image3").files[0];
    let deleteModalBtn = document.querySelector(".account_cover-img-modal-delete-btn");
    let formData = new FormData();
    formData.append("cover_img1", cover_img1);
    formData.append("cover_img2", cover_img2);
    formData.append("cover_img3", cover_img3);

    let request = $.ajax({
                url: accountCoverImageSaveAjax,
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
                        console.log('image_1_path ==> ', response.image_1_path);
                        console.log('image_2_path ==> ', response.image_2_path);
                        console.log('image_3_path ==> ', response.image_3_path);
                        const image1PathTag = document.querySelector("#image_1_path");
                        const image2PathTag = document.querySelector("#image_2_path");
                        const image3PathTag = document.querySelector("#image_3_path");
                        if (response.image_1_path) {
                            let image_1_path = response.image_1_path;
                            image1PathTag.setAttribute("src", "/" + image_1_path);
                        }
                        if (response.image_2_path) {
                            let image_2_path = response.image_2_path;
                            image2PathTag.setAttribute("src", "/" + image_2_path);
                        }
                        if (response.image_3_path) {
                            let image_3_path = response.image_3_path;
                            image3PathTag.setAttribute("src", "/" + image_3_path);
                        }

                        deleteModalBtn.classList.remove('inactive');
                        deleteModalBtn.style.display = "block";
                        deleteModalBtn.setAttribute("href", "#account_cover_img_delete_modal-container");
                    }
                },
                error: function (err) {
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });

}, false);


const coverImageDeleteBtn = document.querySelector("#cover-img-delete-btn");
coverImageDeleteBtn.addEventListener('click', function (e) {
    e.preventDefault();
    let deleteModalBtn = document.querySelector(".account_cover-img-modal-delete-btn");
    let request = $.ajax({
                url: accountCoverImageDeleteAjax,
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
                        const image1PathTag = document.querySelector("#image_1_path");
                        const image2PathTag = document.querySelector("#image_2_path");
                        const image3PathTag = document.querySelector("#image_3_path");
                        image1PathTag.setAttribute("src", response.none_image_path);
                        image2PathTag.setAttribute("src", response.none_image_path);
                        image3PathTag.setAttribute("src", response.none_image_path);
                        deleteModalBtn.classList.add('inactive');
                        deleteModalBtn.style.display = "none";
                        deleteModalBtn.removeAttribute("href");
                        console.log('success delete');

                    }
                },
                error: function (err) {
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });

}, false);