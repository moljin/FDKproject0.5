optionCheckListInit();
function optionCheckListInit () {
    const formSummitBtn = document.querySelector("#form-submit");

    formSummitBtn.addEventListener("click", function (e){
        const opIdAll = document.querySelectorAll('[name="op_id"]');
        console.log(opIdAll)
        const opDisplayCheckAll = document.querySelectorAll(".op-display-input");
        const opOrderCheckAll = document.querySelectorAll(".op-order-input");
        let totalList = [];
        let opIdList = [];
        let dataList = [];
        let data1 = {}; //object 만들기
        let data2 = {}; //object 만들기
        let data3 = {}; //object 만들기
        opIdAll.forEach(function (opId, idx, arr){
           // console.log(idx, opId.value, arr)
            data1.idx = idx;
           dataList.push(data1) ;
           // alert("alert")
            opIdList.push(opId.value)
        });
        let opDisplayCheckList = [];
        opDisplayCheckAll.forEach(function (opDisplay, idx, arr) {
            // console.log(idx, opDisplay.checked, arr)
            data1.op_display = opDisplay.checked;
            dataList.push(data1) ;
            // alert("alert")
            opDisplayCheckList.push(opDisplay.checked)
        });
        let opOrderCheckList = [];
        opOrderCheckAll.forEach(function (opOrder, idx, arr) {
            // console.log(idx, opOrder.checked, arr)
            data1.op_order = opOrder.checked;
            dataList.push(data1) ;
            // alert("alert")
            opOrderCheckList.push(opOrder.checked)
        });
        console.log("opIdList", opIdList)
        totalList.push(opIdList);

        console.log("opDisplayCheckList", opDisplayCheckList)
        totalList.push(opDisplayCheckList);

        console.log("opOrderCheckList", opOrderCheckList)
        totalList.push(opOrderCheckList);

        console.log("totalList", totalList)
        totalList.forEach(function (items, ix){
            console.log(ix)
            console.log(items)
            items.forEach(function (item, idx){
                let ddata = {};
                console.log("item", item)
                console.log("idx", idx)
            });


        });
        console.log(data1)
        var dataListJsonData = JSON.stringify(dataList) ;
        console.log(dataListJsonData)
        let paramList = {
            "paramList": JSON.stringify(totalList)
        };

        let request = $.ajax({
            url: checkListPostTest,
            type: 'POST',
            data: totalList,
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
                    console.log('Account delete success');
                    // window.location.href = response.redirect_url;
                }
            },
            error: function (err) {
                alert('내부 오류가 발생하였습니다.\n' + err);
            }
        });
        alert("alert")
    }, false);
}