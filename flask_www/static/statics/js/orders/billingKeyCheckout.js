"use strict"
/*jshint esversion: 6 */

billingKeyCheckoutInit();

function billingKeyCheckoutInit(){
    const IMP = window.IMP; // 생략 가능
    IMP.init('imp27746059'); // Example: imp00000000
    const billingCheckoutBtn = document.querySelector("#billing-checkout-btn");
    billingCheckoutBtn.addEventListener("click", function (ev){
        ev.preventDefault();
        const cartId = document.querySelector("#cart-id").value;
        let amount = document.querySelector("#real-pay-price").value;
        let order_id = OrderCreateAjax(ev);
        console.log("let order_id = OrderCreateAjax(ev);", order_id)
        if (order_id === false) {
            alert('주문 생성 실패\n다시 시도해주세요.');
            return false;
        }
        let merchant_id = OrderCheckoutAjax(ev, order_id, amount);
        console.log("let merchant_id = OrderCheckoutAjax(ev, order_id, amount);", merchant_id)
        billingCheckOutAjax(ev, cartId, order_id, merchant_id, amount);
        /*
        if (merchant_id !== '') {
            billingCheckOutAjax(ev, cartId, order_id, merchant_id, amount);

            IMP.request_pay({
                pg : "kcp_billing.BA001",
                merchant_uid: merchant_id,//+ new Date().getTime(),
                // name:'E-Shop product', // 매 결제마다 상품관련해서 다른이름으로 바꿀 수 있다. 지금은 저거로 고정
                name: $('input[name="item-1-name"]').val(), // 이렇게...첫 상품 적어준다.
                buyer_name: $('input[name="name"]').val(),//+" "+$('input[name="last_name"]').val(),
                buyer_email: $('input[name="email"]').val(),
                amount: amount
            }, function (rsp) {
                console.log('결제 첫단계', rsp)
                if (rsp.success) {
                    let msg = '결제가 완료되었습니다.\n';
                    //msg += '고유 ID : '+rsp.imp_uid;
                    msg += '주문 번호 : ' + rsp.merchant_uid;
                    msg += '\n결제 금액 : ' + rsp.paid_amount;
                    //console.log('rsp.paid_amount', rsp.paid_amount);
                    msg += '\n카드 승인번호 : ' + rsp.apply_num;
                    msg += '\n감사합니다.';
                    // 결제 완료후 보여줄 메시지를 이 라인에 추가 하면 된다.
                    OrderImpTransaction(e, cart_id, order_id, rsp.merchant_uid, rsp.imp_uid, rsp.paid_amount);
                    alert(msg); // 추가
                } else {
                    let msg = '결제에 실패하였습니다.';
                    msg += '에러내용 : ' + rsp.error_msg;
                    console.log(msg);
                    alert("결제가 이루어지지 않았습니다."); // 추가
                }
            });

        }
        return false;
        */


    }, false);
}

function OrderCreateAjax(e) {
    e.preventDefault();
    let orderCartId = document.querySelector("#ordercart_id").value;
    let name = document.querySelector("#user-name").value;
    let email = document.querySelector("#user-email").value;
    let phone = document.querySelector("#user-phone").value;
    let postcode = document.querySelector("#postcode").value;
    let address = document.querySelector("#address").value;
    let detailAddress = document.querySelector("#detailAddress").value;
    let extraAddress = document.querySelector("#extraAddress").value;
    let orderMemo = document.querySelector("#order-memo").value;
    let formData = new FormData();
    formData.append("ordercart_id", orderCartId);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("phonenumber", phone);
    formData.append("postal_code", postcode);
    formData.append("address", address);
    formData.append("detail_address", detailAddress);
    formData.append("extra_address", extraAddress);
    formData.append("order_memo", orderMemo);
    let order_id = '';
    let request = $.ajax({
        url: orderCreateAjax,
        type: 'POST',
        data: formData,
        headers: {"X-CSRFToken": CSRF_TOKEN,},
        dataType: 'json',
        async: false,
        cache: false,
        contentType: false,
        processData: false,
        // data: $('.order-form').serialize()
    });
    request.done(function (data) {
        if (data.order_id) {
            order_id = data.order_id;
            console.log('OrderCreateAjax order_id', order_id);
        }
    });
    request.fail(function (jqXHR, textStatus) {
        if (jqXHR.status === 404) {
            alert("페이지가 존재하지 않습니다.");
        } else if (jqXHR.status === 403) {
            alert("AjaxCreateOrder 로그인 해주세요.");
        } else {
            alert("주문 생성 실패\nAjaxCreateOrder 문제 발생.\n다시 시도해주세요.");
        }
    });
    return order_id;
}

function OrderCheckoutAjax(e, order_id, amount) { //, type
    e.preventDefault();
    let merchant_id = '';
    let request = $.ajax({
        method: 'POST',
        url: orderCheckoutAjax,
        async: false,
        headers: {
            "X-CSRFToken": CSRF_TOKEN,
        },
        data: {
            order_id: order_id,
            amount: amount,
            //type:type,
        }
    });

    console.log('OrderCheckoutAjax = Success vs Fail ::: order_id, amount', request, order_id, amount)
    request.done(function (data) {
        console.log('00000000 여기3 OrderCheckoutAjax "Success or Error" data', data._message);
        // if(data.works) { // 원본::: 아래처럼해도 작동한다. 연습으로 확인
        if (data.merchant_id) {
            merchant_id = data.merchant_id;
            console.log('"OrderCheckoutAjax Success" merchant_id = data.merchant_id;', merchant_id)
        }
    });
    request.fail(function (jqXHR, textStatus) {
        if (jqXHR.status === 404) {
            alert("페이지가 존재하지 않습니다.");
        } else if (jqXHR.status === 403) {
            alert("OrderCheckoutAjax 로그인 해주세요.");
        } else {
            console.log('OrderCheckoutAjax 문제 발생.\\n다시 시도해주세요.')
            alert("OrderCheckoutAjax 문제 발생.\n다시 시도해주세요.");
            console.log('jqXHR', jqXHR);
            console.log('jqXHR.status', jqXHR.status);
            console.log('textStatus', textStatus);
        }
    });
    return merchant_id;
}

function billingCheckOutAjax(e, cartId, order_id, merchant_id, amount) {
    let card_num1 = document.querySelector("#card_num1").value;
    let card_num2 = document.querySelector("#card_num2").value;
    let card_num3 = document.querySelector("#card_num3").value;
    let card_num4 = document.querySelector("#card_num4").value;
    let expiry_num1 = document.querySelector("#expiry_num1").value;
    let expiry_num2 = document.querySelector("#expiry_num2").value;
    let birth = document.querySelector("#birth").value;
    let pwd_2digit = document.querySelector("#pwd_2digit").value;
    let customer_uid = document.querySelector("#customer_uid").value;
    let formData = new FormData();
    formData.append("card_num1", card_num1);
    formData.append("card_num2", card_num2);
    formData.append("card_num3", card_num3);
    formData.append("card_num4", card_num4);
    formData.append("expiry_num1", expiry_num1);
    formData.append("expiry_num2", expiry_num2);
    formData.append("birth", birth);
    formData.append("pwd_2digit", pwd_2digit);
    formData.append("customer_uid", customer_uid);
    formData.append("merchant_uid", merchant_id);
    formData.append("amount", amount);

    let request = $.ajax({
        url: billingKeyCheckoutAjax,
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
                console.log("success", response._success)
                console.log("billing_key_response", response.billing_key_response)
                OrderImpTransaction(e, cartId, order_id, rsp.merchant_uid, rsp.imp_uid, rsp.paid_amount);

            }
        },
        error: function (err) {
            alert('내부 오류가 발생하였습니다.\n' + err);
        }
    });
}

function OrderImpTransaction(e, cart_id, order_id, merchant_id, imp_id, amount) {
    e.preventDefault();
    //let origin_merchant_id = merchant_id.split('@')[0];
    //console.log('ImpTransaction:::origin_merchant_id:::', origin_merchant_id);
    console.log('OrderImpTransaction:::merchant_id:::', merchant_id);
    let request = $.ajax({
        method: "POST",
        url: orderImpTransaction,
        async: false,
        headers: {
            "X-CSRFToken": CSRF_TOKEN,
        },
        data: {
            cart_id: cart_id,
            order_id: order_id,
            merchant_id: merchant_id, //origin_merchant_id,
            imp_id: imp_id,
            amount: amount,
        }
    });
    request.done(function (data) {
        if (data.works) {
            console.log('윈도우 리로드 url만들면 완료된다.')
            $(location).attr('href', location.origin + orderCompleteDetailUrl + '?order_id=' + order_id);
        }
    });
    request.fail(function (jqXHR, textStatus) {
        if (jqXHR.status === 404) {
            alert("페이지가 존재하지 않습니다.");
        } else if (jqXHR.status === 403) {
            alert("OrderImpTransaction 로그인 해주세요.");
        } else {
            alert("OrderImpTransaction 문제 발생.\n다시 시도해주세요.");
            console.log('jqXHR', jqXHR);
            console.log('jqXHR.status', jqXHR.status);
            console.log('textStatus', textStatus);
        }
    });
}
