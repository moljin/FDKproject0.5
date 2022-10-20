productDeleteInit();
function productDeleteInit () {
    const productDeleteBtn = document.querySelector("#product-delete-btn");
    productDeleteBtn.addEventListener("click", function (e){
        e.preventDefault();
        let _id = document.querySelector("#pd-id").value;
        productDelete(_id);
    }, false);
}

function productDelete(_id) {
    let formData = new FormData();
    formData.append("_id", _id);
    let request = $.ajax({
        url: productDeleteAjax,
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
                console.log('Profile delete success');
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