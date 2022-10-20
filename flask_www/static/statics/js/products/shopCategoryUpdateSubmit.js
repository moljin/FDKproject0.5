"use strict"
/*jshint esversion: 6 */
shopCategoryUpdateInit();

function shopCategoryUpdateInit() {
    try {
        const shopTitleCheckBtn = document.querySelector("#shoptitle-check-btn");
        shopTitleCheckBtn.addEventListener('click', function (e) {
            e.preventDefault();
            let shopcategory_title = document.querySelector("#shopcategory-title").value;
            let _id = document.querySelector("#shopcategory_id").value;
            console.log("shopcategory_title", shopcategory_title)
            let formData = new FormData();
            formData.append("title", shopcategory_title);
            formData.append("_id", _id);
            let request = $.ajax({
                url: existingShopcategoryCheckAjax,
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
                        const flashAlert_div = document.querySelector(".shop-update-alert");
                        if (response.flash_message) {
                            flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="subscribe-alert">
                                                        <div class="alert alert-danger" role="alert">` + response.flash_message + `</div>
                                                        <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`
                            // window.location.reload();
                        } else {
                            flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="subscribe-alert">
                                                        <div class="alert alert-danger" role="alert">사용 가능합니다.</div>
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
        const shopUpdateSubmit = document.querySelector("#shop-update-submit");
        shopUpdateSubmit.addEventListener('click', function (e) {
            // shopTitleCheckBtn.click();
            e.preventDefault();
            let shopcategory_title = document.querySelector("#shopcategory-title").value;
            let shopcategory_content = document.querySelector("#shopcategory-content").value;
            let meta_description = document.querySelector("#meta_description").value;
            let formData = new FormData();
            formData.append("title", shopcategory_title);
            formData.append("content", shopcategory_content);
            formData.append("meta_description", meta_description);

            let request = $.ajax({
                url: shopCategoryUpdateAjax,
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
                        const flashAlert_div = document.querySelector(".shop-update-alert");
                        if (response.flash_message === "동일한 상점타이틀이 존재합니다.") {
                            flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="subscribe-alert">
                                                        <div class="alert alert-danger" role="alert">` + response.flash_message + `</div>
                                                        <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`
                        } else {
                            if (response.checked_message) {
                                flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="subscribe-alert">
                                                        <div class="alert alert-danger" role="alert">` + response.checked_message + `</div>
                                                        <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`
                            } else {
                                const shopTitleTag = document.querySelector("#shop-title");
                                const shopContent = document.querySelector("#shop-content");
                                const shopMetaDescription = document.querySelector("#shop-meta-description");

                                shopTitleTag.innerHTML = response.shopcategory_title;
                                shopContent.innerHTML = response.shopcategory_content;
                                shopMetaDescription.innerHTML = response.meta_description;
                                // window.location.reload();
                                document.querySelector("#shop-create-update-modal").classList.add("uk-modal-close");
                                setTimeout(ukModalCloseClassRemove, 500);
                                // 스크롤바를 염두에 둔것: 사용할 수 있도록(display.none 방식으로는 스크롤바 에러발생)
                                // document.querySelector("#shop-create-update-modal").classList.remove("uk-modal-close");
                                // document.querySelector("#shop-create-update-modal").style.display = "none";
                            }
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
        const shopCategoryDeleteBtn = document.querySelector("#shop-delete-btn");
        shopCategoryDeleteBtn.addEventListener('click', function (e) {
            e.preventDefault();
            let _id = document.querySelector("#shopcategory_id").value;
            console.log("_id", _id)
            shopCategoryDelete(_id);

        }, false);
    } catch (e) {
        // console.log(e);
    }

    try { //admin shopCategory list check delete
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
                    shopCategoryDelete(_id);
                }
            });

        });
    } catch (e) {
        // console.log(e);
    }

    function ukModalCloseClassRemove() {
        document.querySelector('#shop-create-update-modal').classList.remove('uk-modal-close');
    }


}

function shopCategoryDelete(_id) {
    let formData = new FormData();
    formData.append("_id", _id);
    let request = $.ajax({
        url: shopCategoryDeleteAjax,
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
                console.log('ShopCategory delete success');
                // similar behavior as an HTTP redirect
                // window.location.replace("http://stackoverflow.com");

                // similar behavior as clicking on a link
                // window.location.href = "http://stackoverflow.com";
                window.location.href = response.redirect_url;
            }
        },
        error: function (err) {
            alert('내부 오류가 발생하였습니다.\n' + err);
        }
    });
}