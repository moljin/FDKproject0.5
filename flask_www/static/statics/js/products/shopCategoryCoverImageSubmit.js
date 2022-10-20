"use strict"
/*jshint esversion: 6 */
const coverImageSubmitBtn = document.querySelector("#cover-img-submit");
coverImageSubmitBtn.addEventListener('click', function (e) {
    e.preventDefault();
    let cover_img1 = document.querySelector("#cover_image1").files[0];
    let cover_img2 = document.querySelector("#cover_image2").files[0];
    let cover_img3 = document.querySelector("#cover_image3").files[0];
    let deleteModalBtn = document.querySelector(".shopcategory_cover-img-modal-delete-btn");
    let formData = new FormData();
    formData.append("cover_img1", cover_img1);
    formData.append("cover_img2", cover_img2);
    formData.append("cover_img3", cover_img3);

    let request = $.ajax({
                url: shopCategoryCoverImageSaveAjax,
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
                        deleteModalBtn.setAttribute("href", "#shopcategory_cover_img_delete_modal-container");
                        // document.querySelector("#shopcategory_cover_img_modal-container").style.display = "none";
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
    let deleteModalBtn = document.querySelector(".shopcategory_cover-img-modal-delete-btn");
    let request = $.ajax({
                url: shopCategoryCoverImageDeleteAjax,
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

const symbolImgSubmitBtn = document.querySelector("#symbol-img-submit-btn");
symbolImgSubmitBtn.addEventListener('click', function (e) {
    e.preventDefault();
    let symbol_image = document.querySelector("#symbol_image").files[0];
    let deleteModalBtn = document.querySelector(".symbol-img-modal-delete-btn");
    let formData = new FormData();
    formData.append("symbol_image", symbol_image);
    let request = $.ajax({
                url: symbolImageSaveAjax,
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
                        const symbolPathTag = document.querySelector("#shop-symbol-image-src");
                        let symbol_path = response.symbol_path;
                        symbolPathTag.setAttribute("src", "/" + symbol_path);
                        symbolPathTag.classList.remove('inactive');
                        symbolPathTag.style.display = "block";
                        deleteModalBtn.setAttribute("href", "#symbol_img_delete_modal-container");
                        deleteModalBtn.style.display = "block";
                        document.querySelector("#symbol_img_upload_modal-container").style.display = "none";
                    }
                },
                error: function (err) {
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });
}, false);

const symbolImgDeleteBtn = document.querySelector("#symbol-img-delete-btn");
symbolImgDeleteBtn.addEventListener('click', function (e) {
    e.preventDefault();
    let deleteModalBtn = document.querySelector(".symbol-img-modal-delete-btn");
    let request = $.ajax({
                url: symbolImageDeleteAjax,
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
                        const symbolPathTag = document.querySelector("#shop-symbol-image-src");
                        let symbol_path = response.symbol_path;
                        symbolPathTag.setAttribute("src", "/" + symbol_path);
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