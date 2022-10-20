"use strict"
/*jshint esversion: 6 */
promotionsInit();
function promotionsInit(){
    try {
        const couponCodeCheckBtn = document.querySelector("#coupon-code-check-btn");
        couponCodeCheckBtn.addEventListener('click', function (e) {
            e.preventDefault();
            let profile_id = document.querySelector("#profile_id").value;
            let coupon_id = document.querySelector("#coupon_id").value;
            let code = document.querySelector("#code").value;

            let formData = new FormData();
            formData.append("profile_id", profile_id);
            formData.append("coupon_id", coupon_id);
            formData.append("code", code);
            let request = $.ajax({
                url: couponCodeCheckAjax,
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
                        const flashAlert_div = document.querySelector(".code-check-alert");
                        flashAlertDivInnerHtml(flashAlert_div, response);

                        const closeBtn = document.querySelector(".code-check-alert .flashes .uk-alert-close");
                        flashAlertDivDisplayNone (flashAlert_div, closeBtn);

                    }
                },
                error: function (err) {
                    console.log(err);
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });
        }, false);
    } catch (e) {
        // console.log(e);
    }

    // try { // coupon  apply
    //     const couponApplyBtn = document.querySelector("#coupon-apply");
    //     couponApplyBtn.addEventListener("click", function (e) {
    //         e.preventDefault();
    //         const cartId = document.querySelector("#cart-id").value;
    //         const couponCode = document.querySelector("#coupon-code").value;
    //
    //         let formData = new FormData();
    //         formData.append("cart_id", cartId);
    //         formData.append("code", couponCode);
    //         let request = $.ajax({
    //             url: addCouponAjax,
    //             type: 'POST',
    //             data: formData,
    //             headers: {"X-CSRFToken": CSRF_TOKEN,},
    //             dataType: 'json',
    //             async: false,
    //             cache: false,
    //             contentType: false,
    //             processData: false,
    //
    //             success: function (response) {
    //                 if (response.error) {
    //                     alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + response.error);
    //                 } else {
    //                     if (response.used_coupon_id) {
    //                         const usedCouponContainer = document.querySelector(".usedcoupon-container");
    //                         const usedCouponLabel = document.querySelector(".usedcoupon-container .label");
    //                         // usedCouponLabel.style.display = "flex";
    //                         const insertHtml = `<div class="each" id="each-` + response.used_coupon_id + `">
    //                                                 <div class="code uk-width-expand">` + response.used_coupon_code + `
    //                                                     <span class="period"> &nbsp;(` + response.used_coupon_use_from + `~` + response.used_coupon_use_to + `)</span>
    //                                                 </div>
    //                                                 <div class="amount-button">
    //                                                     <div class="amount">` + intComma(response.used_coupon_amount) + `원</div>
    //                                                     <div class="button">
    //                                                         <button class="uk-button uk-button-default coupon-cancel-btn" type="button" uk-toggle="target: #usedcoupon-cancel-modal-` + response.used_coupon_id + `" data-used-coupon-id="` + response.used_coupon_id + `">적용취소</button>
    //                                                     </div>
    //                                                 </div>
    //
    //                                                 <div id="usedcoupon-cancel-modal-` + response.used_coupon_id + `" class="usedcoupon-cancel-modal uk-flex-top" data-usedcoupon-id="` + response.used_coupon_id + `" uk-modal>
    //                                                     <div class="uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
    //                                                         <button class="uk-modal-close-default" type="button" uk-close></button>
    //                                                         쿠폰 적용을 취소하시겠어요?
    //                                                         <div class="btn uk-align-right">
    //                                                             <div class="uk-inline">
    //                                                                 <button class="uk-button uk-button-default uk-modal-close" type="button">취소</button>
    //                                                             </div>
    //                                                             <div class="delete-btn uk-inline ml-15">
    //                                                                 <button id="coupon-cancel-btn-` + response.used_coupon_id + `" class="uk-button uk-button-default uk-modal-close" type="button">삭제</button>
    //                                                             </div>
    //                                                         </div>
    //                                                     </div>
    //                                                 </div>
    //                                             </div>`;
    //                         usedCouponContainer.insertAdjacentHTML('beforeend', insertHtml);
    //
    //                         couponPointPriceInnerHtml(response);
    //
    //                         const flashAlert_div = document.querySelector(".coupon-point-alert");
    //                         flashAlertDivInnerHtml(flashAlert_div, response);
    //
    //                         const closeBtn = document.querySelector(".coupon-point-alert .flashes .uk-alert-close");
    //                         flashAlertDivDisplayNone (flashAlert_div, closeBtn);
    //                     } else {
    //                         const flashAlert_div = document.querySelector(".coupon-point-alert");
    //                         flashAlertDivInnerHtml(flashAlert_div, response);
    //
    //                         const closeBtn = document.querySelector(".coupon-point-alert .flashes .uk-alert-close");
    //                         flashAlertDivDisplayNone (flashAlert_div, closeBtn);
    //                     }
    //
    //
    //                 }
    //             },
    //             error: function (err) {
    //                 console.log(err)
    //                 alert('내부 오류가 발생하였습니다.\n' + err);
    //             }
    //         });
    //     }, false);
    //
    //     // point apply
    //     const pointApplyBtn = document.querySelector("#point-apply");
    //     pointApplyBtn.addEventListener("click", function (e){
    //         e.preventDefault();
    //         const cartId = document.querySelector("#cart-id").value;
    //         const usedPoint = document.querySelector("#used-point").value;
    //
    //         let formData = new FormData();
    //         formData.append("cart_id", cartId);
    //         formData.append("used_point", usedPoint);
    //         let request = $.ajax({
    //             url: applyPointAjax,
    //             type: 'POST',
    //             data: formData,
    //             headers: {"X-CSRFToken": CSRF_TOKEN,},
    //             dataType: 'json',
    //             async: false,
    //             cache: false,
    //             contentType: false,
    //             processData: false,
    //
    //             success: function (response) {
    //                 if (response.error) {
    //                     alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + response.error);
    //                 } else {
    //                     if (response.point_log_id) {
    //                         const appliedCpGroupTag = document.querySelector(".cp-group.applied");
    //                         appliedCpGroupTag.innerHTML = `<div class="point-log">
    //                                                         <div class="label">할인 적용포인트</div>
    //                                                         <input type="hidden" name="cart_point_log_id" value="` + response.point_log_id + `">
    //                                                         <div class="cancel" uk-grid>
    //                                                             <div><span id="applied-used-point">` + intComma(response.used_point) + `</span>점</div>
    //                                                             <div class="button"><button type="button" class="uk-button uk-button-default point-cancel-btn" uk-toggle="target: #usedpoint-cancel-modal-` + response.point_log_id + `" data-point-log-id="` + response.point_log_id + `">적용취소</button></div>
    //                                                         </div>
    //                                                     </div>
    //                                                     <div id="usedpoint-cancel-modal-` + response.point_log_id + `" class="usedpoint-cancel-modal uk-flex-top" uk-modal>
    //                                                         <div class="uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
    //                                                             <button class="uk-modal-close-default" type="button" uk-close></button>
    //                                                             포인트 적용을 취소하시겠어요?
    //                                                             <div class="btn uk-align-right">
    //                                                                 <div class="uk-inline">
    //                                                                     <button class="uk-button uk-button-default uk-modal-close" type="button">취소</button>
    //                                                                 </div>
    //                                                                 <div class="delete-btn uk-inline ml-15">
    //                                                                     <button id="point-cancel-btn-` + response.point_log_id + `" class="uk-button uk-button-default uk-modal-close" type="button">삭제</button>
    //                                                                 </div>
    //                                                             </div>
    //                                                         </div>
    //                                                     </div>`;
    //
    //                         couponPointPriceInnerHtml(response);
    //
    //                         const flashAlert_div = document.querySelector(".coupon-point-alert");
    //                         flashAlertDivInnerHtml(flashAlert_div, response);
    //
    //                         const closeBtn = document.querySelector(".coupon-point-alert .flashes .uk-alert-close");
    //                         flashAlertDivDisplayNone (flashAlert_div, closeBtn);
    //                     } else {
    //                         const flashAlert_div = document.querySelector(".coupon-point-alert");
    //                         flashAlertDivInnerHtml(flashAlert_div, response);
    //
    //                         const closeBtn = document.querySelector(".coupon-point-alert .flashes .uk-alert-close");
    //                         flashAlertDivDisplayNone (flashAlert_div, closeBtn);
    //                     }
    //
    //
    //                 }
    //             },
    //             error: function (err) {
    //                 console.log(err)
    //                 alert('내부 오류가 발생하였습니다.\n' + err);
    //             }
    //         });
    //     }, false);
    //
    // } catch (e) {
    //     // console.log(e);
    // }
    //
    // /*coupon cancel*/
    // const usedCouponContainer = document.querySelector(".usedcoupon-container");
    // usedCouponContainer.addEventListener("click", function (e){
    //     const usedCouponCancelModalAll = document.querySelectorAll(".usedcoupon-cancel-modal");
    //     usedCouponCancelModalAll.forEach(function (usedCouponCancelModal, idx) {
    //         const cartId = document.querySelector("#cart-id").value;
    //         let _id = usedCouponCancelModal.getAttribute("data-usedcoupon-id");
    //         let couponCancelBtn = document.querySelector('[id="coupon-cancel-btn-' + `${_id}` + '"]');
    //         couponCancelBtn.addEventListener("click", function (ev) {
    //             ev.preventDefault();
    //             let formData = new FormData();
    //             formData.append("cart_id", cartId);
    //             formData.append("_id", _id);
    //
    //             let request = $.ajax({
    //                 url: cancelCouponAjax,
    //                 type: 'POST',
    //                 data: formData,
    //                 headers: {"X-CSRFToken": CSRF_TOKEN,},
    //                 dataType: 'json',
    //                 async: false,
    //                 cache: false,
    //                 contentType: false,
    //                 processData: false,
    //
    //                 success: function (response) {
    //                     if (response.error) {
    //                         alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + response.error);
    //                     } else {
    //                         if (response.unnecessary_ajax) {
    //                             console.log(response.unnecessary_ajax);
    //                         }
    //                         if (response.flash_message) {
    //                             let eachUsedCouponTag = document.querySelector('[id="each-' + `${_id}` + '"]');
    //                             let usedCouponCancelModal = document.querySelector('[id="usedcoupon-cancel-modal-' + `${_id}` + '"]');
    //                             eachUsedCouponTag.remove();
    //                             usedCouponCancelModal.remove();
    //
    //                             const eachAll = document.querySelectorAll(".each");
    //                             const usedCouponSpan = document.querySelector(".usedcoupon-span");
    //                             if (eachAll.length === 0) {
    //                                 if (usedCouponSpan) {
    //                                     usedCouponSpan.remove();
    //                                 }
    //                             }
    //
    //                             couponPointPriceInnerHtml(response);
    //
    //                             const flashAlert_div = document.querySelector(".coupon-point-alert");
    //                             flashAlertDivInnerHtml(flashAlert_div, response);
    //
    //                             const closeBtn = document.querySelector(".coupon-point-alert .flashes .uk-alert-close");
    //                             flashAlertDivDisplayNone(flashAlert_div, closeBtn);
    //                         }
    //
    //                     }
    //                 },
    //                 error: function (err) {
    //                     alert('내부 오류가 발생하였습니다.\n' + err);
    //                 }
    //             });
    //         }, false);
    //
    //     });
    // }, false);
    //
    // /*point cancel*/
    // const usedPointContainer = document.querySelector(".usedpoint-container");
    // usedPointContainer.addEventListener("click", function (e){
    //     let target = e.target;
    //     if (target.classList.contains("point-cancel-btn")) {
    //         // // ajax 중복호출 막기위해...
    //         if(isPromotionRun === true) {
    //             return;
    //         }
    //         isPromotionRun = true;
    //         const cartId = document.querySelector("#cart-id").value;
    //         let _id = target.getAttribute("data-point-log-id");
    //         let pointCancelBtn = document.querySelector('[id="point-cancel-btn-' + `${_id}` + '"]');
    //         pointCancelBtn.addEventListener("click", function (ev) {
    //             ev.preventDefault();
    //             let formData = new FormData();
    //             formData.append("cart_id", cartId);
    //             formData.append("cart_point_log_id", _id);
    //
    //             let request = $.ajax({
    //                 url: cancelPointAjax,
    //                 type: 'POST',
    //                 data: formData,
    //                 headers: {"X-CSRFToken": CSRF_TOKEN,},
    //                 dataType: 'json',
    //                 async: false,
    //                 cache: false,
    //                 contentType: false,
    //                 processData: false,
    //
    //                 success: function (response) {
    //                     isPromotionRun = false;
    //                     if (response.error) {
    //                         alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + response.error);
    //                     } else {
    //                         const pointLogTag = document.querySelector(".point-log");
    //                         const usedPointCancelModal = document.querySelector('[id="usedpoint-cancel-modal-' + `${_id}` + '"]');
    //                         pointLogTag.remove();
    //                         usedPointCancelModal.remove();
    //
    //                         couponPointPriceInnerHtml(response);
    //
    //                         const flashAlert_div = document.querySelector(".coupon-point-alert");
    //                         flashAlertDivInnerHtml(flashAlert_div, response);
    //
    //                         const closeBtn = document.querySelector(".coupon-point-alert .flashes .uk-alert-close");
    //                         flashAlertDivDisplayNone (flashAlert_div, closeBtn);
    //
    //                     }
    //                 },
    //                 error: function (err) {
    //                     alert('내부 오류가 발생하였습니다.\n' + err);
    //                 }
    //             });
    //         }, false);
    //
    //     }
    //
    // }, false);



}

// ajax 중복호출 막기위해...
// let isPromotionRun = false;

function intComma (num) {
    return Number(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// function couponPointPriceInnerHtml (response) {
//     const prepPointSpan = document.querySelector("#prep-point");
//     prepPointSpan.innerHTML = intComma(response.prep_point);
//     const newRemainedPointSpan = document.querySelector("#new-remained-point");
//     newRemainedPointSpan.innerHTML = intComma(response.new_remained_point);
//
//     const realPayPriceInput = document.querySelector("#real-pay-price");
//     realPayPriceInput.value = response.get_total_price + response.get_total_delivery_pay;
//     const cartPayPriceSpan = document.querySelector("#cart_pay_price");
//     cartPayPriceSpan.innerHTML = intComma(response.get_total_price + response.get_total_delivery_pay);
// }
//
// function flashAlertDivInnerHtml (flashAlert_div, response) {
//     if (response.flash_message) {
//         flashAlert_div.style.display = "block";
//         flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="check-alert">
//                                                         <div class="alert alert-danger" role="alert">` + response.flash_message + `</div>
//                                                         <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`
//     } else {
//         flashAlert_div.innerHTML = `<div class="flashes" uk-alert id="check-alert">
//                                                         <div class="alert alert-danger" role="alert">사용 가능합니다.</div>
//                                                         <button class="uk-alert-close mt-5" type="button" uk-close></button></div>`
//     }
// }
//
// function flashAlertDivDisplayNone (flashAlert_div, closeBtn) {
//     closeBtn.addEventListener("click", function (e) {
//         flashAlert_div.style.display = "none";
//     }, false);
// }

