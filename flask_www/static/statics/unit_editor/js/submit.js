"use strict"
// create or update
const unitsForm = document.querySelector('#units-form');
const editorContent = document.querySelector('.units-content');
const createSubmitBtn = document.querySelector('#form-submit');
function cloneContent() {
    const hiddenTextarea = document.getElementById("hiddenTextarea");
    hiddenTextarea.value = editorContent.innerHTML;
    return true;
}

createSubmitBtn.addEventListener('click', function (e) {
    if (createSubmitBtn.classList.contains('inactivated')) {
        alert('크기조정을 완료하고 저장하세요! 최소 혹은 빈여백 클릭!');
        e.preventDefault(); // 이놈을 달아놔야 page not found 로 넘어가지 않는다. submit 버튼을 해놔도 상관없다.
        // return false;
    } else {
        unitsEditorImageListSave();  // 에디터에 base64로 로드시킨 후 한꺼번에 이미지 저장 로직
        cloneContent();
        // unitsForm.submit();
    }

}, false);

function unitsEditorImageListSave () {
    let imgTagList = editorContent.querySelectorAll('img');
    let ormIdInputTag = document.querySelector('#orm_id');
    let ormId = ormIdInputTag.getAttribute('value');
    console.log("imgTagList", imgTagList);
    imgTagList.forEach(function (imgTag, index) {

        if (imgTag.getAttribute('src').includes('base64')) {
            console.log(imgTag.getAttribute('src'));
            console.log(imgTag.getAttribute('data-file-name'));
            let fileName = imgTag.getAttribute('data-file-name');
            let imgAlt = imgTag.getAttribute('alt');
            console.log('alt', imgAlt);
            let formData = new FormData();
            let block = imgTag.getAttribute('src').split(';');
            // let contentType = block[0].split(':')[1]; // 이 경우 'image/jpeg', 'image/png', 'image/gif'
            let realData = block[1].split(',')[1]; // 이 경우 '/gj.........Tf/5z0L/2vs1lb4eGcnUco//Z'
            // let blob = base64ToBlob(realData, contentType); // 이미지의 순수 데이터를 Blob 유형으로 변환한다.
            formData.append('upload_img', realData); // 이미지의 Blob를 폼 데이터 객체에 추가
            formData.append('file_name', fileName);
            formData.append('orm_id', ormId);
            formData.append('alt', imgAlt);

            let request = $.ajax({
                url: unitsImagesSaveAjax,
                type: 'POST',
                // data: {"upload_img": blob},
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
                        console.log('image_path ==> ', response.image_path);
                        console.log('origin_filename ==> ', response.origin_filename);
                        let imgSrc = response.image_path;
                        imgTag.setAttribute('src', '/' + imgSrc);

                        // let imgDataId = imgTag.getAttribute('data-id');
                        // let imgAltDiv = document.createElement('DIV');
                        // imgAltDiv.setAttribute('data-alt-id', `${imgDataId}`);
                        // imgAltDiv.style.width = "70%"; //imgTag.offsetWidth + 'px';
                        // imgAltDiv.style.border = 'solid 1px gray';
                        // imgAltDiv.style.display = 'block';
                        // imgAltDiv.style.marginLeft = 'auto';
                        // imgAltDiv.style.marginRight = 'auto';
                        // imgAltDiv.innerText = imgAlt;
                        // imgTag.after(imgAltDiv);
                    }
                },
                error: function (err) {
                    alert('내부 오류가 발생하였습니다.\n' + err);
                }
            });
        }
        // else {
        //     let formData = new FormData();
        //     let imgSrc = imgTag.getAttribute('src');
        //     console.log("imgSrc", imgSrc)
        //     let imgAlt = imgTag.getAttribute('alt');
        //     if (imgAlt) {
        //         formData.append('src', imgSrc);
        //         formData.append('alt', imgAlt);
        //         let request = $.ajax({
        //             url: tigerImageAltUpdateAjax,
        //             type: 'POST',
        //             // data: {"upload_img": blob},
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
        //                     let imgDataId = imgTag.getAttribute('data-id');
        //                     let ResponseImgSrc = response.tiger_image_src;
        //                     let imgAlt = response.tiger_image_alt
        //                     // let imgAltDiv = document.createElement('DIV');
        //                     // imgAltDiv.setAttribute('data-alt-id', `${imgDataId}`);
        //                     // imgAltDiv.style.width = "70%"; //imgTag.offsetWidth + 'px';
        //                     // imgAltDiv.style.border = 'solid 1px gray';
        //                     // imgAltDiv.style.display = 'block';
        //                     // imgAltDiv.style.marginLeft = 'auto';
        //                     // imgAltDiv.style.marginRight = 'auto';
        //                     // imgAltDiv.innerText = imgAlt;
        //                     // imgTag.after(imgAltDiv);
        //                 }
        //             },
        //             error: function (err) {
        //                 alert('내부 오류가 발생하였습니다.\n' + err);
        //             }
        //         });
        //     }
        //
        // }

    });
}

