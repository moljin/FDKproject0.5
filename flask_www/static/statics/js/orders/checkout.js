"use strict"
/*jshint esversion: 6 */

$(function () {
    let IMP = window.IMP;
    IMP.init('imp27746059'); // iamport 가맹점 식별코드
    $('.order-form').on('submit', function (e) {
        let cart_id = $('input[name="ordercart_id"]').val();
        let amount = parseInt($('.order-form input[name="amount"]').val().replace(',', ''));
        let order_id = OrderCreateAjax(e);
        if (order_id === false) {
            alert('주문 생성 실패\n다시 시도해주세요.');
            return false;
        }
        let merchant_id = OrderCheckoutAjax(e, order_id, amount);

        if (merchant_id !== '') {
            IMP.request_pay({
                pg : "html5_inicis.INIpayTest",
                merchant_uid: merchant_id,//+ new Date().getTime(),
                // name:'E-Shop product', // 매 결제마다 상품관련해서 다른이름으로 바꿀 수 있다. 지금은 저거로 고정
                name: $('input[name="item-1-name"]').val(),
                buyer_name: $('input[name="name"]').val(),
                buyer_email: $('input[name="email"]').val(),
                amount: amount,
                m_redirect_url: location.origin + orderCompleteMobile
            }, function (rsp) {
                console.log('결제 첫단계', rsp)
                if (rsp.success) {
                    let msg = '결제가 완료되었습니다.\n';
                    //msg += '고유 ID : '+rsp.imp_uid;
                    msg += '주문 번호 : ' + rsp.merchant_uid;
                    msg += '\n결제 금액 : ' + rsp.paid_amount;
                    msg += '\n카드 승인번호 : ' + rsp.apply_num;
                    msg += '\n감사합니다.';
                    OrderImpTransaction(e, cart_id, order_id, rsp.merchant_uid, rsp.imp_uid, rsp.paid_amount);
                    alert(msg);
                } else {
                    let msg = '결제에 실패하였습니다.';
                    msg += '에러내용 : ' + rsp.error_msg;
                    console.log(msg);
                    alert("결제가 이루어지지 않았습니다.");
                }
            });
        }
        return false;
    });
});

function OrderCreateAjax(e) {
    e.preventDefault();
    let order_id = '';
    let request = $.ajax({
        method: 'POST',
        url: orderCreateAjax,
        async: false,
        data: $('.order-form').serialize()
    });
    request.done(function (data) {
        if (data.order_id) {
            order_id = data.order_id;
        }
    });
    request.fail(function (jqXHR, textStatus) {
        if (jqXHR.status === 404) {
            alert("페이지가 존재하지 않습니다.");
        } else if (jqXHR.status === 403) {
            alert("AjaxCreateOrder 로그인 해주세요.");
        } else {
            alert("AjaxCreateOrder 문제 발생.\n다시 시도해주세요.");
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

    request.done(function (data) {
        console.log('00000000 여기3 OrderCheckoutAjax "Success" data', data);
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

function OrderImpTransaction(e, cart_id, order_id, merchant_id, imp_id, amount) {
    e.preventDefault();
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

// 마이페이지 만들어서 결제리스트 만들기는 어떻게 하는 건가?