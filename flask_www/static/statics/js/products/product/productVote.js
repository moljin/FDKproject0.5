"use strict"
/*jshint esversion: 6 */
voteInit();
function voteInit () {
    try {
        const productVoteBtn = document.querySelector("#product-vote-btn");
        productVoteBtn.addEventListener('click', function (e) {
            e.preventDefault();
            let request = $.ajax({
                url: productVoteAjax,
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
                        const flashAlert_div = document.querySelector(".vote-alert");
                        if (response.checked_message) {
                            flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="subscribe-alert">
                                                    <div class="alert alert-danger" role="alert">` + response.checked_message + `</div>
                                                    <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`;
                        } else {
                            // window.location.reload();
                            document.querySelector("#product-vote-btn").style.display = "none";
                            document.querySelector("#product-voting-btn").style.display = "block";

                            let count = response.vote_count + 2653;
                            let countSpan = document.querySelector(".vote-count > span");
                            countSpan.innerHTML = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                        }

                    }
                },
                error: function (err) {
                    console.log(err)
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });


        }, false);


        const productVoteCancelBtn = document.querySelector("#vote-cancel-btn");
        productVoteCancelBtn.addEventListener('click', function (e) {
            e.preventDefault();
            let request = $.ajax({
                url: productVoteCancelAjax,
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
                        const flashAlert_div = document.querySelector(".vote-alert");
                        document.querySelector("#product-vote-btn").style.display = "block";
                        document.querySelector("#product-voting-btn").style.display = "none";
                        /*
                        flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="subscribe-alert">
                                                <div class="alert alert-danger" role="alert">` + response.flash_message + `</div>
                                                <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`;
                        */

                        let count = response.vote_count + 2653;
                        let countSpan = document.querySelector(".vote-count > span");
                        countSpan.innerHTML = count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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