"use strict"
/*jshint esversion: 6 */

/*
function _cancelPay() {
    jQuery.ajax({
      "url": "{환불요청을 받을 서비스 URL}", // 예: http://www.myservice.com/payments/cancel
      "type": "POST",
      "contentType": "application/json",
      "data": JSON.stringify({
        "merchant_uid": "{결제건의 주문번호}", // 예: ORD20180131-0000011
        "cancel_request_amount": 2000, // 환불금액
        "reason": "테스트 결제 환불" // 환불사유
        "refund_holder": "홍길동", // [가상계좌 환불시 필수입력] 환불 수령계좌 예금주
        "refund_bank": "88" // [가상계좌 환불시 필수입력] 환불 수령계좌 은행코드(예: KG이니시스의 경우 신한은행은 88번)
        "refund_account": "56211105948400" // [가상계좌 환불시 필수입력] 환불 수령계좌 번호
      }),
      "dataType": "json"
    });
  }
  */
orderCancelPayInit();
function orderCancelPayInit() {
    const cancelPayBtn = document.querySelector("#cancel-pay");
    cancelPayBtn.addEventListener("click", function (e){
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
}
