"use strict"
/*jshint esversion: 6 */

orderCancelPayInit();
function orderCancelPayInit() {
    try {
        const cancelPayBtn = document.querySelector("#cancel-pay");
        cancelPayBtn.addEventListener("click", function (e) {
            const merchant_uid = document.querySelector("#merchant-uid").value;
            const cancel_amount = document.querySelector("#cancel-amount").value;
            const pay_type = document.querySelector("#pay-type").value;
            const cancel_reason = document.querySelector("#cancel-reason").value;
            /* // 추후 가상계좌/계좌이체 사용시 추가
            const refund_holder = document.querySelector("#refund-holder").value;
            const refund_bank = document.querySelector("#refund-bank").value;
            const refund_account = document.querySelector("#refund-account").value;
            */
            let formData = new FormData();
            formData.append("merchant_uid", merchant_uid);
            formData.append("cancel_amount", cancel_amount);
            formData.append("pay_type", pay_type);
            formData.append("cancel_reason", cancel_reason);
            /* // 추후 가상계좌/계좌이체 사용시 추가
            formData.append("refund_holder", refund_holder);
            formData.append("refund_bank", refund_bank);
            formData.append("refund_account", refund_account);
            */
            let request = $.ajax({
                url: cancelPayAjax,
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
                        if (response._success === "success") {
                            const flashAlert_div = document.querySelector(".cancel-pay-alert");
                            flashAlert_div.style.display = "block";
                            flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="check-alert">
                                                                <div class="alert alert-danger" role="alert">` + response.flash_message + `</div>
                                                                <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`;

                            const closeBtn = document.querySelector(".cancel-pay-alert .flashes .uk-alert-close");
                            closeBtn.addEventListener("click", function (e) {
                                flashAlert_div.style.display = "none";
                            }, false);
                        }
                        console.log("success", response._success)
                    }
                },
                error: function (err) {
                    console.log(err)
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });
        }, false);
    } catch (err) {

        // console.log(err)

    }

}
