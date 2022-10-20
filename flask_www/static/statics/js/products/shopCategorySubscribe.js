"use strict"
/*jshint esversion: 6 */
SubscribeInit();
function SubscribeInit () {
    try {
        const shopSubscribeSubmit = document.querySelector("#shop-subscribe-submit");
        shopSubscribeSubmit.addEventListener('click', function (e) {
            e.preventDefault();
            let request = $.ajax({
                url: shopCategorySubscribeAjax,
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
                        const flashAlert_div = document.querySelector(".subscribe-alert");
                        if (response.checked_message) {
                            flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="subscribe-alert">
                                                    <div class="alert alert-danger" role="alert">` + response.checked_message + `</div>
                                                    <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`;
                        } else {
                            // window.location.reload();
                            document.querySelector("#shop-subscribe-submit").style.display = "none";
                            document.querySelector("#subscribing-btn").style.display = "block";

                            let count = response.subscribe_count + 2653;
                            let countSpan = document.querySelector(".shop-item.viewcount-subscribe-container > div > div.ml-15 > span");
                            countSpan.innerHTML = `구독: ` + count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + `명`;
                        }

                    }
                },
                error: function (err) {
                    console.log(err)
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });


        }, false);


        const shopSubscribeCancelBtn = document.querySelector("#subscribe-cancel-btn");
        shopSubscribeCancelBtn.addEventListener('click', function (e) {
            e.preventDefault();
            let request = $.ajax({
                url: shopCategorySubscribeCancelAjax,
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
                        // window.location.reload();
                        document.querySelector("#shop-subscribe-submit").style.display = "block";
                        document.querySelector("#subscribing-btn").style.display = "none";
                        /*
                        flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="subscribe-alert">
                                                <div class="alert alert-danger" role="alert">` + response.flash_message + `</div>
                                                <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`;
                        */

                        let count = response.subscribe_count + 2653;
                        let countSpan = document.querySelector(".shop-item.viewcount-subscribe-container > div > div.ml-15 > span");
                        countSpan.innerHTML = `구독: ` + count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') + `명`;
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


}