InitPostPay();
function InitPostPay() {
    const sellerInfoTitle = document.querySelector(".shop-info.upper .label .title");
    const sellerInfo = document.querySelector(".shop-info.upper .seller");
    sellerInfoTitle.addEventListener("click", function (e){
        sellerInfo.classList.toggle("active");
    }, false);
}