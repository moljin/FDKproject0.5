document.addEventListener("DOMContentLoaded", function () {
    let optionNum = document.getElementsByClassName("op-num");
    let titleInput = document.getElementsByClassName("op-title-input");
    let priceInput = document.getElementsByClassName("op-price-input");
    let stockInput = document.getElementsByClassName("op-stock-input");
    let displayInput = document.getElementsByClassName("op-display-input");
    let orderInput = document.getElementsByClassName("op-order-input");
    let cancelBtn = document.getElementsByClassName("cancel-input-btn");

    const maxInputFields = 11;
    const addInputBtn = document.querySelector(".add-input-btn");
    const productOption = document.querySelector("#add-input-btn");
    const optionFormWrapper = document.querySelector(".option-form-wrapper");
    const newInputOption = `<div class="option-form" uk-alert>
                                <div class="board-form mt-10">
                                    <div class="form-group">
                                        <label class="op-num"></label>
                                        <input type="hidden" name="op_id" value="none">
                                    </div>
                                </div>
                                <div class="board-form mt-10">
                                    <div class="form-group">
                                        <input class="uk-input op-title-input mt-5" maxlength="100" minlength="2" name="op_title" placeholder="옵션이름" required="" type="text" value="">
                                    </div>
                                </div>
                                <div class="board-form mt-10">
                                    <div class="form-group">
                                        <input class="uk-input op-price-input mt-5" name="op_price" placeholder="옵션가격" required="" type="number" value="">
                                    </div>
                                </div>
                                <div class="board-form mt-10">
                                    <div class="form-group">
                                        <input class="uk-input op-stock-input mt-5" name="op_stock" placeholder="옵션재고" required="" type="number" value="">
                                    </div>
                                </div>
                                <div class="board-form mt-10">
                                    <div class="form-group">
                                        <label for="op_available_display">전시여부</label>
                                        <input checked class="uk-checkbox op-display-input mt-2 ml-5" name="op_available_display" type="checkbox">
                            
                                        &nbsp;/&nbsp;<label for="op_available_order">주문가능</label>
                                        <input checked class="uk-checkbox op-order-input mt-2 ml-5" name="op_available_order" type="checkbox">
                            
                                        <button class="cancel-input-btn remove-input ml-7 uk-alert-close uk-close">옵션취소 <i class="fas fa-folder-minus ml-7"></i></button>
                                    </div>
                                </div>
                                <hr>
                            </div>`;
    // const newInputOption = '<div class="option-form">' +
    //     '                                <div class="board-form mt-10">' +
    //     '                                    <div class="form-group">' +
    //     '                                        <label class="op-num"></label>' +
    //     '                                        <input type="hidden" name="op_id" value="none">' +
    //     '                                    </div>' +
    //     '                                </div>'+
    //     '                                <div class="board-form mt-10">' +
    //     '                                    <div class="form-group">' +
    //     '                                        <input class="uk-input op-title-input mt-5" maxlength="100" minlength="2" name="op_title" placeholder="옵션이름" required="" type="text" value="">' +
    //     '                                    </div>' +
    //     '                                </div>' +
    //     '                                <div class="board-form mt-10">' +
    //     '                                    <div class="form-group">' +
    //     '                                        <input class="uk-input op-price-input mt-5" name="op_price" placeholder="옵션가격" required="" type="number" value="">' +
    //     '                                    </div>' +
    //     '                                </div>' +
    //     '                                <div class="board-form mt-10">' +
    //     '                                    <div class="form-group">' +
    //     '                                        <input class="uk-input op-stock-input mt-5" name="op_stock" placeholder="옵션재고" required="" type="number" value="">' +
    //     '                                    </div>' +
    //     '                                </div>' +
    //     '                                <div class="board-form mt-10">' +
    //     '                                    <div class="form-group">' +
    //     '                                        <label for="op_available_display">전시여부</label>' +
    //     '                                        <input checked="" class="uk-checkbox op-display-input mt-2 ml-5" name="op_available_display" type="checkbox">' +
    //     '                                         &nbsp;\n' +
    //     '                                    /&nbsp; <label for="op_available_order">주문가능</label>' +
    //     '                                        <input checked="" class="uk-checkbox op-order-input mt-2 ml-5" name="op_available_order" type="checkbox">' +
    //     '                                        <a href="javascript:void(0);" title="옵션추가 취소"><button class="cancel-input-btn remove-input ml-7">옵션취소 <i class="fas fa-folder-minus ml-7"></i></button></a>' +
    //     '                                    </div>' +
    //     '                                </div>' +
    //     '                                <hr>' +
    //     '                            </div>';

    let addInputCount = 1;
    addInputBtn.addEventListener("click", function (e){
        e.preventDefault();
        if (((e.target === addInputBtn) || (e.target.parentElement === addInputBtn)) && (addInputCount < maxInputFields)) {
            addInputCount++;
            optionFormWrapper.insertAdjacentHTML('beforeend', newInputOption);

            for (let i = 0; i < titleInput.length; i++) {
                optionNum[i].innerHTML = (i+1)+"번째 옵션";
                if (i===9) {
                    optionNum[i].innerHTML = "마지막 "+(i+1)+"번째"+ "옵션";
                }
                titleInput[i].id = "op-title-" +(i);
                priceInput[i].id = "op-price-" +(i);
                stockInput[i].id = "op-stock-" +(i);

                displayInput[i].id = "op-display-" +(i);
                displayInput[i].value = (i);

                orderInput[i].id = "op-order-" +(i);
                orderInput[i].value = (i);

                cancelBtn[i].id = "cancel-btn-" +(i);


            }
        }



    });


    // optionFormWrapper.addEventListener("click", function (e){
    //     e.preventDefault();
    //     if (e.target.classList.contains("remove-input")) {
    //         e.target.parentElement.parentElement.parentElement.parentElement.remove();
    //         addInputCount--;
    //     }
    //     else if (e.target.parentElement.classList.contains("remove-input")) {
    //         e.target.parentElement.parentElement.parentElement.parentElement.parentElement.remove();
    //         addInputCount--;
    //     }
    //
    // },false);


});