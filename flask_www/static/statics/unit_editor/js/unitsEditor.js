function unitsEditorInit(el, opt) {
    let is_focus = false;

    // let el = document.querySelector(`${selector}`); //여기서는 selector === new-editor
    const exit_el = el.querySelector('.units-exit');
    const unitsEditor = el.querySelector('.units-editor');
    const unitsContent = el.querySelector('.units-content');

    const overlayContainer = el.querySelector('#overlay-container');
    let mediaWidthInitPercentage = '70%';


    const unitsEditorBtnAll = el.querySelectorAll('button');
    Array.from(unitsEditorBtnAll).forEach(function (button, index) {
        button.setAttribute('type', 'button');
    });

    document.addEventListener('keydown', function (e) {
        if (e.key && e.key === 'Escape') {
            let sliderContainer = document.querySelector('.slider-container');
            if (sliderContainer.style.display === 'block') {
                selectAllInit();
            }
        }
        if (e.key && e.key === 'Enter') {
            // document.activeElement !== unitsContent ==> focus 가 에디터 안에 없다는 의미
            if (document.activeElement !== unitsContent || unitsContent.querySelector('.selected')) {
                let selectedMedia = document.querySelector('.selected');
                let newDiv = document.createElement('DIV');
                let brTag = document.createElement('BR');
                newDiv.append(brTag);
                if (selectedMedia) {
                    selectedMedia.after(newDiv);
                    elementAutoClick (newDiv); // for overlay reposition
                    newDiv.tabIndex = '1';
                    newDiv.focus(); // 있어도 의미없다.
                    // newDiv.style.outline = 'none';
                    // setTimeout(function () {
                    //     newDiv.focus();
                    // }, 100);
                    // console.log("document.activeElement", document.activeElement);
                }
                else {
                    unitsContent.append(newDiv);
                    elementAutoClick (newDiv); // for overlay reposition
                    newDiv.tabIndex = '1';
                    newDiv.focus(); // 있어도 의미없다.
                    // newDiv.style.outline = 'none';
                    // setTimeout(function () {
                    //     newDiv.focus();
                    // }, 100);
                    // console.log("document.activeElement", document.activeElement);
                }


            }
        }
    });

    unitsContent.addEventListener('keydown', e => {
        if (e.key && e.key === 'Escape') {
            exit_el.focus();
            let slider = document.querySelector('#slider');
            let slider_value = document.querySelector('#slider_value');
            if (slider.style.display === 'block') {
                setSliderInit();
            }
        }
        if (e.key && e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '    ');
            return;
        }
        if (e.key && e.code === 'Space') {
            let slider = document.querySelector('#slider');
            // let slider_value = document.querySelector('#slider_value');
            // if (slider.style.display === 'block') {
            //     setSliderInit();
            // }
            console.log('space', slider)
        }
        if (e.key || (e.key && (e.key === 'Enter' ||
                      e.key === 'Backspace' ||
                      e.key === 'Delete' ||
                     (e.ctrlKey && e.key === 'z')))) {
            const mediaOverlaysAll = overlayContainer.querySelectorAll('.overlay');
            mediaOverlaysAllReposition(mediaOverlaysAll);
            elementAutoClick (e.target);
        }


    });

    // unitsContent.addEventListener('keyup', clone_content);
    // 타자 칠때마다 hidden textarea 인 html_content 에 clone_content 된다."
    // 이것은 죽이고, submit 할 때 일괄적으로 할수 있게 변경.

    unitsContent.addEventListener('focus', () => {
        is_focus = true;
    });
    unitsContent.addEventListener('focusout', () => {
        is_focus = false;
    });
    document.addEventListener('click', function (e){
        const mediaResizeSelectedTagsAll = document.querySelectorAll('.selected');
        mediaResizeSelectedTagsAll.forEach(function (selectedTag, index) {
            if (selectedTag) {
                if (!e.target.classList.contains('overlay')) {
                    if (e.target.tagName !== 'TEXTAREA') {
                        if (e.target !== document.querySelector('#slider')) {
                            selectAllInit();
                        }
                    }
                }
            }
        });
    });

    if (opt.image_alt !== false) {
        unitsContent.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'TEXTAREA') {
                imageAltChange(e);
            } else {
                imageAltDestroy();
            }
        });
        unitsEditor.addEventListener('click', imageAltEdit);
    }

    const heading_btns = el.querySelectorAll('.units-heading');
    if (opt.heading !== false) {
        for (let i = 0; i < heading_btns.length; i++) {
            heading_btns[i].addEventListener('click', heading);
        }
    }

    const font_size_btns = el.querySelectorAll('.units-font-size');
    if (opt.font_size !== false) {
        for (let i = 0; i < font_size_btns.length; i++) {
            font_size_btns[i].addEventListener('click', font_size);
        }
    }

    const color_input = el.querySelector('.units-color-input');
    const hilite_input = el.querySelector('.units-hilite-input');
    const color_btn = el.querySelector('.units-color');
    const hilite_btn = el.querySelector('.units-hilite');
    if (opt.color !== false) {
        color_btn.addEventListener('click', color);
        color_btn.querySelector('i').style.color = color_input.value;
        hilite_btn.addEventListener('click', hilite);
        hilite_btn.querySelector('i').style.color = hilite_input.value;
    }

    const bold_btn = el.querySelector('.units-bold');
    const italic_btn = el.querySelector('.units-italic');
    const underline_btn = el.querySelector('.units-underline');
    const stroke_btn = el.querySelector('.units-stroke');
    if (opt.font_style !== false) {
        bold_btn.addEventListener('click', bold);
        italic_btn.addEventListener('click', italic);
        underline_btn.addEventListener('click', underline);
        stroke_btn.addEventListener('click', stroke);
    }

    const unorderd_list_btn = el.querySelector('.units-ul');
    const orderd_list_btn = el.querySelector('.units-ol');
    if (opt.list !== false) {
        unorderd_list_btn.addEventListener('click', unorderdList)
        orderd_list_btn.addEventListener('click', orderdList);
    }

    const align_btns = el.querySelectorAll('.units-align');
    if (opt.align !== false) {
        for (let i = 0; i < align_btns.length; i++) {
            align_btns[i].addEventListener('click', align);
        }
    }

    const link_btn = el.querySelector('.units-link');
    const unlink_btn = el.querySelector('.units-unlink');
    const image_btn = el.querySelector('.units-image');
    const video_btn = el.querySelector('.units-video');
    if (opt.attachment !== false) {
        link_btn.addEventListener('click', link);
        unlink_btn.addEventListener('click', unLink);
        const mediaTagsAll = unitsContent.querySelectorAll('.media');
        const mediaOverlaysAll = overlayContainer.querySelectorAll('.overlay');
        // image_btn.addEventListener('click',unitsImageInputTagCreate);
        // video_btn.addEventListener('click',videoInsert);
        image_btn.addEventListener('click', function () {
            if (image_btn.classList.contains('inactivated') || video_btn.classList.contains('inactivated')) {
                alert('크기조정 완료후 가능해요! 최소 혹은 빈여백 클릭!');
                // mediaOverlaySelectInit(mediaOverlaysAll);
                // mediaSelectInit(mediaTagsAll);
                // setSliderInit();
            } else {
                unitsImageInputTagCreate();
            }
        });

        video_btn.addEventListener('click', function () {
            if (image_btn.classList.contains('inactivated') || video_btn.classList.contains('inactivated')) {
                alert('크기조정 완료후 가능해요! 최소 혹은 빈여백 클릭!');
                // mediaOverlaySelectInit(mediaOverlaysAll);
                // mediaSelectInit(mediaTagsAll);
                // setSliderInit();
            } else {
                console.log('videoInsert();')
                videoInsert();
            }
        });

    }

    const html_check = el.querySelector('.units-html-check');
    const html_content = el.querySelector('.units-html-content'); // hidden textarea
    if (opt.html !== false) {
        html_check.addEventListener('click', html_edit);
        html_content.addEventListener('keyup', clone_html_content);
    }

    const redoBtn = el.querySelector('.units-redo');
    const undoBtn = el.querySelector('.units-undo');
    const clearBtn = el.querySelector('.units-clear');
    if (opt.cancel !== false) {
        redoBtn.addEventListener('click', redo);
        undoBtn.addEventListener('click', undo);
        clearBtn.addEventListener('click', editorClear, false);
    }

    function heading(e) {
        let heading = e.currentTarget.dataset.heading;
        document.execCommand('formatBlock', false, `<${heading}>`)
    }

    function font_size(e) {
        let font_size = e.currentTarget.dataset.fontSize;
        let selObj = window.getSelection();
        let selectedText = selObj.toString();
        if (selectedText) {
            document.execCommand('insertHTML', false, `<span style="font-size:${font_size}">${selectedText}</span>`);
        }
    }

    function color() {
        document.execCommand('foreColor', false, color_input.value)
    }

    function hilite() {
        document.execCommand('hiliteColor', false, hilite_input.value)
    }

    function bold() {
        document.execCommand('bold');
    }

    function italic() {
        document.execCommand('italic');
    }

    function underline() {
        document.execCommand('underline');
    }

    function stroke() {
        document.execCommand('strikeThrough');
    }

    function unorderdList() {
        document.execCommand('insertUnorderedList')
    }

    function orderdList() {
        document.execCommand('insertOrderedList')
    }

    function align(e) {
        let align = e.currentTarget.dataset.align;
        switch (align) {
            case "left":
                document.execCommand('justifyLeft');
                break;
            case "center":
                document.execCommand('justifyCenter');
                break;
            case "right":
                document.execCommand('justifyRight');
                break;
            default:
                return false;
        }
    }

    function link() {
        const selObj = window.getSelection();
        const selectedText = selObj.toString();
        if (selectedText === "") {
            let url = prompt("사이트 URL을 입력하세요.");
            if (url !== "" && url != null) {
                document.execCommand('insertHTML', false, `<a href="http://${url}" target="_blank" title="${url}">${url}</a>`);
            }
        } else {
            let url = prompt("사이트 URL을 입력하세요.");
            if (url !== "" && url != null) {
                document.execCommand('insertHTML', false, `<a href="http://${url}" target="_blank" title="${url}">${selectedText}</a>`);
            }
        }
    }

    function unLink() {
        document.execCommand("unlink", false, "");
    }

    function redo() {
        document.execCommand("redo", false, "");
    }

    function undo() {
        document.execCommand("undo", false, "");
    }

    function editorClear() {
        unitsContent.innerHTML = '';
        document.getElementById('slider').style.display = 'none';
        document.getElementById('slider_value').style.display = 'none';
    }

    function unitsImageInputTagCreate() {
        const temp_input = document.querySelector('.units-temp-image-input');
        temp_input && temp_input.remove();

        let image_input = document.createElement('input');
        image_input.setAttribute('type', 'file');
        image_input.setAttribute('accept', 'image/*');
        image_input.setAttribute('class', 'units-temp-image-input units-hide');
        image_input.setAttribute('multiple', true);
        document.body.append(image_input); // for ios
        image_input.click();
        image_input.addEventListener("change", function () {
            const image_files = this.files;
            if (opt.image_save === undefined) {
                unitsImageInsertPreview(image_files)
            } else {
                unitsImageInsertPreviewSave(image_files);
            }
        })
    }

    function unitsImageInsertPreview(files) {
        if (is_focus === false) {
            unitsContent.focus();
        }
        for (let i = 0; i < files.length; i++) {
            // let src = URL.createObjectURL(files[i]);
            // document.execCommand('insertImage',false, src);
            // 아래로 변경
            const reader = new FileReader();
            reader.onload = function (e) {
                let oldImgTag = document.querySelector('[src="' + `${reader.result}` + '"]')
                if (oldImgTag) {
                    alert('같은 이미지가 있어요!')
                } else {
                    document.execCommand('insertImage', false, `${reader.result}`);
                    let newImgTag = document.querySelector('[src="' + `${reader.result}` + '"]')

                    let newImgTagDataFileName = files[i].name;
                    let randomStringId = new Date().getTime().toString(36) + '?' + i + ':' + Math.random().toString(36).substring(2, 11);
                    let randomStringDataId = i + ':' + new Date().getTime().toString(36) + '?' + Math.random().toString(36).substring(2, 11);

                    newMediaTagBasicStyle(newImgTag, randomStringId, randomStringDataId, mediaWidthInitPercentage);
                    // newImgTag.style.position = 'relative';
                    newImgTag.classList.add('image');
                    newImgTag.setAttribute('data-file-name', `${newImgTagDataFileName}`)
                    newImgTag.style.height = 'auto';

                    // newImgTag.outerHTML = "<div>" + newImgTag.outerHTML + "</div>";

                    let newMediaOverlay = mediaOverlayCreate(randomStringDataId);
                    newMediaOverlay.classList.add('image');

                    newImgTag.onload = function () {
                        mediaOverlayStyleAppend(newMediaOverlay, overlayContainer);

                        const mediaOverlaysAll = overlayContainer.querySelectorAll('.overlay');
                        mediaOverlaysAllReposition(mediaOverlaysAll);
                    }
                }
            };
            reader.readAsDataURL(files[i]);
        }

    }

    function unitsImageInsertPreviewSave(files) {
        if (is_focus === false) {
            unitsContent.focus();
        }
        let json_datas = [];
        for (let i = 0; i < files.length; i++) {
            const image_file = files[i];
            let src = URL.createObjectURL(image_file);
            const timestamp = +new Date() + i;
            const units_img = `<img src="${src}" alt="" class="units-image-uploading" data-timestamp="${timestamp}">`
            document.execCommand('insertHTML', false, units_img);
            const json_data = {
                image: image_file,
                timestamp: timestamp
            }
            json_datas.push(json_data);
        }
        opt.image_save(json_datas);
    }

    function elementAutoClick (element) {
        let count = 0;
        let targetAutoClick = setInterval(function () {
            element.click(); // overlay reposition
            count++;
            if (count === 2) {
                clearInterval(targetAutoClick);
            }
        }, 10);
        // setTimeout(function () {
        //     element.tabIndex = '-1';
        //     element.focus();
        // }, 100);
        console.log("document.activeElement", document.activeElement);

    }

    function imageAltTextAreaApply(imgTag, dataId) {
        let textarea = document.createElement('textarea');
        textarea.setAttribute('class', 'units-image-alt');
        textarea.setAttribute('placeholder', '이미지 설명글');
        textarea.classList.add('selected'); // 추가 // 최종본 숨기기는 css에서 조절한다. unitsEditor.css:151 .units-image-alt{display:none}
        textarea.setAttribute('data-alt-id', `${dataId}`); // 추가
        textarea.innerText = imgTag.alt;
        textarea.addEventListener('focusout', imageAltChange)
        textarea.addEventListener('keydown', imagAltAutoHeight)
        textarea.addEventListener('keyup', imagAltAutoHeight)
        imgTag.after(textarea);
        let textarea_height = textarea.scrollHeight;
        // textarea.style.width = imgTag.clientWidth + 'px'; //추가
        textarea.style.width = ((imgTag.offsetWidth+15)/unitsEditor.offsetWidth)*100 + '%';
        textarea.style.height = textarea_height + 'px';
        textarea.style.margin = '-0.3rem auto 0.5rem auto'; //추가
    }

    function imageAltEdit(e, file, newImgTag) {
        const mediaTagsAll = unitsContent.querySelectorAll('.media');
        const mediaOverlaysAll = overlayContainer.querySelectorAll('.overlay');
        console.log('무슨 이벤트이지? imageAltEdit e.target', e.target)

        if (e.target.onload !== null) { // 추가, 이미지 로드할 때 쓰인다. 여기서는 사용하지 않음
            if (file) {
                console.log("if (e.target.onload !== null.onload) e.target", e.target.onload)
                console.log(file)
                console.log(file.length)
                console.log(newImgTag)
                let newImgTagDataId = newImgTag.getAttribute('data-id'); // 추가
                imageAltTextAreaApply(newImgTag, newImgTagDataId);  //최종본 변경

            } else { // 이미지 로드 없지만,  이미지 클릭할 때(newImgTag.onload = function () 는 거친다.)
                console.log("if (e.target.onload !== null) e.target.onload", e.target.onload)
                console.log(file)  // newImgTag.onload = function () check
                const old_textarea = document.querySelector('.units-image-alt');
                old_textarea && old_textarea.remove();
            }
        }
        if ((mediaTagsAll.length !== 0) && (e.target.tagName === 'SPAN' ||
            e.target.tagName === 'BUTTON' ||
            e.target.tagName === 'UL' ||
            e.target.tagName === 'LI' ||
            e.target.tagName === 'I' ||
            e.target.getAttribute('id') === 'slider' ||
            e.target.getAttribute('class') === 'slider-box')) {
            console.log("e.target::: toolbar, specially video insert button // slider-related tag")
        } else if (e.target.onload === null && e.target.tagName !== 'TEXTAREA') {
            selectAllInit();

            if (e.target.onload === null && (e.target.classList.contains('overlay') || e.target.tagName === 'FIGURE')) {
                if (e.target.classList.contains('image')) {
                    mediaSelectInit(mediaTagsAll);
                    mediaOverlaySelectInit(mediaOverlaysAll);
                    console.log("e.target.classList.contains('overlay')", e.target)
                    if (e.target.classList.contains('overlay')) {
                        let targetOverlay = e.target;
                        let targetOverlayDataId = targetOverlay.getAttribute('data-overlay-id');
                        console.log("targetOverlayDataId", targetOverlayDataId)
                        let targetImgTag = document.querySelector('[data-id="' + targetOverlayDataId + '"]')
                        targetImgTag.classList.add('units-alt-editing')
                        imageAltTextAreaApply(targetImgTag, targetOverlayDataId);

                        mediaAndOverlaySelect(targetOverlay, targetImgTag);
                        mediaOverlayTopReposition(mediaTagsAll);
                        mediaOverlaysAllReposition(mediaOverlaysAll);
                    }

                } else if (e.target.classList.contains('iframe')) {
                    console.log('iframe')
                    mediaSelectInit(mediaTagsAll);
                    mediaOverlaySelectInit(mediaOverlaysAll);
                    let targetOverlay = e.target;
                    let targetOverlayId = targetOverlay.getAttribute('data-overlay-id');
                    let targetIframeTag = document.querySelector('[data-id="' + targetOverlayId + '"]')
                    mediaAndOverlaySelect(targetOverlay, targetIframeTag);
                    mediaOverlayTopReposition(mediaTagsAll);
                    mediaOverlaysAllReposition(mediaOverlaysAll);
                }

            }
        }
    }

    function imagAltAutoHeight(e) {
        e.target.style.height = 'auto';
        e.target.style.height = e.target.scrollHeight + 'px';
    }

    function imageAltChange(e) {
        let textAreaDataAltId = e.target.getAttribute('data-alt-id');
        let alt_editing = unitsContent.querySelector('[data-id="' + textAreaDataAltId + '"]');//'.units-alt-editing')
        alt_editing.alt = e.target.value

        alt_editing.classList.remove('units-alt-editing')
        // const old_textarea = document.querySelector('.units-image-alt');
        // old_textarea && old_textarea.remove();
    }

    function imageAltDestroy() {
        let alt_editing = unitsContent.querySelector('.units-alt-editing')
        if (alt_editing) {
            alt_editing.classList.remove('units-alt-editing');
        }
        const old_textarea = document.querySelector('.units-image-alt');
        old_textarea && old_textarea.remove();
    }

    function videoInsert() {
        let url = prompt("비디오 링크를 입력하세요. 유튜브, 비메오 가능");
        if (url !== "" && url != null) {
            url = url.replace("https://youtu.be/", "https://www.youtube.com/embed/");
            url = url.replace("watch?v=", "embed/");
            url = url.replace('https://vimeo.com', 'https://player.vimeo.com/video');
            if (is_focus === false) {
                unitsContent.focus();
            }
            let oldIframeTag = document.querySelector('[src="' + `${url}` + '"]')
            if (oldIframeTag) {
                alert('같은 동영상이 있어요!');
            } else {
                const insertIframeHtml = `<iframe src="${url}" frameborder="0" allowfullscreen="true"></iframe>`;
                document.execCommand('insertHTML', false, `${insertIframeHtml}`);
                // document.execCommand('insertHTML', false, `<iframe title="video player" src="${url}" frameborder="0" allowfullscreen="true" onload="iframeHeightResize(this)"></iframe>`);
                let newIframeTag = document.querySelector('[src="' + `${url}` + '"]');

                // let newIframeTag = document.createElement('iframe');
                let randomStringId = new Date().getTime().toString(36) + ':' + Math.random().toString(36).substring(2, 11);
                let randomStringDataId = new Date().getTime().toString(36) + '?' + Math.random().toString(36).substring(2, 11);
                newMediaTagBasicStyle(newIframeTag, randomStringId, randomStringDataId, mediaWidthInitPercentage);
                newIframeTag.setAttribute('title', 'video player');
                newIframeTag.classList.add('iframe');
                // newIframeTag.style.position = 'relative';
                // newIframeTag.style.pointerEvents = 'none';
                newIframeTag.style.height = (newIframeTag.offsetWidth * 0.5625) + 'px';

                let newMediaOverlay = mediaOverlayCreate(randomStringDataId);
                newMediaOverlay.classList.add('iframe');
                mediaOverlayStyleAppend(newMediaOverlay, overlayContainer);

                const mediaOverlaysAll = overlayContainer.querySelectorAll('.overlay');
                mediaOverlaysAllReposition(mediaOverlaysAll);
            }

        }
    }

    function clone_content() {
        console.log("clone_content // 타자 칠때마다 hidden textarea 인 html_content에 clone 된다.")
        html_content.value = unitsContent.innerHTML;

        console.log('hidden textarea 에 복사된 내용', html_content.value)
        return true;
    }

    function clone_html_content() {
        console.log("clone_html_content")
        alert("clone_html_content")
        unitsContent.innerHTML = html_content.value;
        alert("clone_html_content end")
    }

    function html_edit() {
        if (html_check.checked) {
            clone_content();
            html_content.classList.remove('units-hide');
        } else {
            clone_html_content();
            html_content.classList.add('units-hide');
        }
    }

    window.addEventListener('resize', mediaOverlayHeightAllResizePerViewportChange)
}

function newMediaTagBasicStyle(newMediaTag, randomStringId, randomStringDataId, mediaWidthInitPercentage) {
    newMediaTag.setAttribute("class", "media");
    newMediaTag.setAttribute("id", `${randomStringId}`);
    newMediaTag.setAttribute('data-id', `${randomStringDataId}`);
    if (window.matchMedia('(min-width: 0px) and (max-width: 960px)').matches) {
        newMediaTag.style.width = '100%';
    }
    else if (window.matchMedia('(min-width: 960px)').matches) {
        newMediaTag.style.width = mediaWidthInitPercentage; // '100%';  mediaWidthInitPercentage
    }
    // newMediaTag.style.width = mediaWidthInitPercentage; // '100%';  mediaWidthInitPercentage
    newMediaTag.style.display = 'block';
    newMediaTag.style.marginTop = '0.25rem';
    newMediaTag.style.marginBottom = '0.25rem';
    newMediaTag.style.marginLeft = 'auto';
    newMediaTag.style.marginRight = 'auto';
}

function mediaOverlayCreate(randomStringDataId) {
    let newMediaOverlay = document.createElement('div');
    newMediaOverlay.setAttribute('data-overlay-id', `${randomStringDataId}`);
    newMediaOverlay.setAttribute('class', 'overlay');
    // newMediaOverlay.setAttribute('contenteditable', 'false');
    return newMediaOverlay;
}

function mediaOverlayStyleAppend(newMediaOverlay, overlayContainer) {
    newMediaOverlay.style.background = 'transparent'; //green  transparent // 최종본에서는 죽인다.
    // newMediaOverlay.style.opacity = '0.3';  // 최종본에서는 죽인다.
    newMediaOverlay.style.position = 'absolute';
    newMediaOverlay.style.zIndex = "3";
    overlayContainer.appendChild(newMediaOverlay);
}

function setSliderPercentages(percentages) {
    document.getElementById('slider').value = percentages;
    document.getElementById('slider_value').innerHTML = percentages + '%';
}

function setSlider(percentages) { // 여기는 첫 셋팅, mediaResize 안에거는 변하는 값에 관한 것이다.
    document.querySelector('.slider-container').classList.add('selected');
    document.querySelector(".units-content").style.cssText = `margin-top: 43px`;
    // document.querySelector('.slider-box-border-bottom').classList.add('selected');
    setSliderPercentages(percentages);

    let imageInsertBtn = document.querySelector('button.units-image');
    let videoInsertBtn = document.querySelector('button.units-video');
    imageInsertBtn.classList.add('inactivated');
    imageInsertBtn.setAttribute('title', '사이즈 조정 완료후에 가능해요.');
    videoInsertBtn.classList.add('inactivated');
    videoInsertBtn.setAttribute('title', '사이즈 조정 완료후에 가능해요.');

    const createSubmitBtn = document.querySelector('#form-submit');
    createSubmitBtn.classList.add('inactivated');
    createSubmitBtn.type = "button";
    createSubmitBtn.setAttribute('title', '사이즈 조정 완료후에 저장하세요.');
}

function selectAllInit () {
    const unitsContent = document.querySelector('.units-content');
    const overlayContainer = document.querySelector('#overlay-container');
    const old_textarea = unitsContent.querySelector('.units-image-alt');
    const mediaTagsAll = unitsContent.querySelectorAll('.media');
    const mediaOverlaysAll = overlayContainer.querySelectorAll('.overlay');

    old_textarea && old_textarea.remove();
    mediaSelectInit(mediaTagsAll);
    mediaOverlaySelectInit(mediaOverlaysAll);
    setSliderInit()
    mediaOverlayTopReposition(mediaTagsAll);
    mediaOverlaysAllReposition(mediaOverlaysAll);
}

function setSliderInit() {
    document.querySelector('.slider-container').classList.remove('selected');
    document.querySelector(".units-content").style.cssText = `margin-top: 0`;
    // document.querySelector('.slider-box-border-bottom').classList.remove('selected');

    let imageInsertBtn = document.querySelector('button.units-image');
    let videoInsertBtn = document.querySelector('button.units-video');
    imageInsertBtn.classList.remove('inactivated');
    imageInsertBtn.removeAttribute('title')
    videoInsertBtn.classList.remove('inactivated');
    videoInsertBtn.removeAttribute('title');

    const createSubmitBtn = document.querySelector('#form-submit');
    createSubmitBtn.classList.remove('inactivated');
    createSubmitBtn.type = "submit";
    createSubmitBtn.removeAttribute('title');
}

function mediaOverlaySelectInit(mediaOverlaysAll) {
    Array.from(mediaOverlaysAll).forEach(function (mediaOverlay, index) {
        mediaOverlay.classList.remove('selected');
        // mediaOverlay.style.background = 'transparent'; // 최종본에서는 죽인다.
    });
}

function mediaSelectInit(mediaTagsAll) {
    Array.from(mediaTagsAll).forEach(function (mediaTag, index) {
        mediaTag.classList.remove('selected');
        mediaTag.style.border = 'none'; //기존 선택이미지 해제
    });
}

function mediaAndOverlaySelect(targetOverlay, targetMediaTag) {
    targetOverlay.classList.add('selected');
    targetMediaTag.classList.add('selected');
    targetMediaTag.style.border = 'solid #A0A0FF 3px'; //최종본 변경

    let percentages = targetMediaTag.style.width.split('%')[0];
    setSlider(percentages);
}

function mediaOverlayTopReposition(mediaTagsAll) {
    let unitsEditor = document.querySelector(".units-editor");
    Array.from(mediaTagsAll).forEach(function (mediaTag, index) {
        let mediaTagDataId = mediaTag.getAttribute('data-id');
        let mediaOverlay = document.querySelector('div[data-overlay-id="' + mediaTagDataId + '"]');
        mediaOverlay.style.top = mediaTag.offsetTop + 'px';
        // mediaOverlay.style.top = (mediaTag.offsetTop/unitsEditor.offsetHeight)*100 + '%';
    });
}

function mediaOverlayMediaTagMatchingBind(mediaOverlay, mediaTag) {
    console.log("mediaOverlayMediaTagMatchingBind")
    let unitsEditor = document.querySelector(".units-editor");
    if (mediaTag) { //px를 %로 바꿨다. 리사이즈에 적용되게...
        mediaOverlay.style.top = (mediaTag.offsetTop/unitsEditor.offsetHeight)*100 + '%';
        mediaOverlay.style.left = (mediaTag.offsetLeft/unitsEditor.offsetWidth)*100 + '%';
        mediaOverlay.style.width = (mediaTag.offsetWidth/unitsEditor.offsetWidth)*100 + '%';
        mediaOverlay.style.height = (mediaTag.offsetHeight/unitsEditor.offsetHeight)*100 + '%';

        // mediaOverlay.style.top = mediaTag.offsetTop + 'px';
        // mediaOverlay.style.left = mediaTag.offsetLeft + 'px';
        // mediaOverlay.style.width = mediaTag.clientWidth + 'px';
        // mediaOverlay.style.height = mediaTag.clientHeight + 'px';
    } else {
        mediaOverlay.remove();
    }
}

function mediaOverlaysAllReposition(mediaOverlaysAll) {
    Array.from(mediaOverlaysAll).forEach(function (mediaOverlay, index) {
        let mediaOverlayId = mediaOverlay.getAttribute('data-overlay-id');
        let mediaTag = document.querySelector('[data-id="' + mediaOverlayId + '"]');
        mediaOverlayMediaTagMatchingBind(mediaOverlay, mediaTag);
    });
}

function mediaResizeSetting(mediaOverlaysAll, selectedMediaOverlay, selectedMediaTag) {
    mediaOverlayMediaTagMatchingBind(selectedMediaOverlay, selectedMediaTag);
    console.log("media-overlay selected")
    let notSelectedMediaOverlaysAll = [];
    Array.from(mediaOverlaysAll).forEach(function (mediaOverlay, index) {
        if (!mediaOverlay.classList.contains('selected')) {
            notSelectedMediaOverlaysAll.push(mediaOverlay);
            console.log("media-overlay not selected list 로 push")
        }
    });
    Array.from(notSelectedMediaOverlaysAll).forEach(function (notSelectedMediaOverlay, index) {
        let notSelectedMediaOverlayId = notSelectedMediaOverlay.getAttribute('data-overlay-id');
        let notSelectedMediaTag = document.querySelector('[data-id="' + notSelectedMediaOverlayId + '"]');
        console.log("media-overlay not selected")
        mediaOverlayMediaTagMatchingBind(notSelectedMediaOverlay, notSelectedMediaTag);
    });
}

let current_size = false;
function mediaResize(percentages, slider) {
    if (slider === true && current_size === percentages) {
        return false;
    }
    current_size = percentages;
    let mediaOverlaysAll = document.querySelectorAll('div.overlay');
    let selectedMediaOverlay = document.querySelector('div.overlay.selected');

    let mediaTagsAll = document.querySelectorAll('.media');
    let selectedImage = document.querySelector('img.selected');
    let selectedImageAlt = document.querySelector('textarea.units-image-alt.selected');
    let selectedIframe = document.querySelector('iframe.selected');

    // 여기 slider 값은 변하는 값에 관한 것이다.
    if (selectedImage) {
        setSliderPercentages(percentages);
        mediaResizeSetting(mediaOverlaysAll, selectedMediaOverlay, selectedImage);
        selectedImage.style.width = percentages + '%';
        selectedImageAlt.style.width = percentages + '%';

    } else if (selectedIframe) {
        setSliderPercentages(percentages);
        mediaResizeSetting(mediaOverlaysAll, selectedMediaOverlay, selectedIframe);
        selectedIframe.style.width = percentages + '%';
        selectedIframe.style.height = (selectedIframe.offsetWidth * 0.5625) + 'px';
    }

}

function mediaOverlayHeightAllResizePerViewportChange() {
    const unitsEditors = document.querySelectorAll('.units-editor');
    Array.from(unitsEditors).forEach(function (unitsEditor, index){
        const iframeTagsAll = unitsEditor.querySelectorAll('iframe');
        const imageTagsAll = unitsEditor.querySelectorAll('img'); //추가
        const mediaTagsAll = unitsEditor.querySelectorAll('.media'); //추가
        Array.from(iframeTagsAll).forEach(function (iframeTag, index) {
            iframeTag.style.height = (iframeTag.offsetWidth * 0.5625) + 'px';
            let iframeDataId = iframeTag.getAttribute('data-id'); //추가
            let iframeOverlay = unitsEditor.querySelector('[data-overlay-id="' + iframeDataId + '"]'); //추가
            iframeOverlay.style.height = iframeTag.offsetHeight + 'px'; //추가
            mediaOverlayTopReposition(mediaTagsAll); //추가
        });
        Array.from(imageTagsAll).forEach(function (imageTag, index) {
            let imageDataId = imageTag.getAttribute('data-id'); //추가
            let imageOverlay = unitsEditor.querySelector('[data-overlay-id="' + imageDataId + '"]'); //추가
            imageOverlay.style.height = imageTag.offsetHeight + 'px'; //추가
            mediaOverlayTopReposition(mediaTagsAll); //추가
        });
    });

    // for (let i = 0; i < unitsEditors.length; i++) {
    //     const iframeTagsAll = unitsEditors[i].querySelectorAll('iframe');
    //     const imageTagsAll = unitsEditors[i].querySelectorAll('img'); //추가
    //     const mediaTagsAll = unitsEditors[i].querySelectorAll('.media'); //추가
    //     const overlayTagsAll = unitsEditors[i].querySelectorAll('.overlay'); //추가
    //     for (let j = 0; j < iframeTagsAll.length; j++) {
    //         iframeTagsAll[j].style.height = (iframeTagsAll[j].offsetWidth * 0.5625) + 'px';
    //         let iframeDataId = iframeTagsAll[j].getAttribute('data-id'); //추가
    //         let iframeOverlay = unitsEditors[i].querySelector('[data-overlay-id="' + iframeDataId + '"]'); //추가
    //         iframeOverlay.style.height = iframeTagsAll[j].offsetHeight + 'px'; //추가
    //         mediaOverlayTopReposition(mediaTagsAll); //추가
    //     }
    //     for (let n = 0; n < imageTagsAll.length; n++) { //추가
    //         let imageDataId = imageTagsAll[n].getAttribute('data-id'); //추가
    //         let imageOverlay = unitsEditors[i].querySelector('[data-overlay-id="' + imageDataId + '"]'); //추가
    //         imageOverlay.style.height = imageTagsAll[n].offsetHeight + 'px'; //추가
    //         mediaOverlayTopReposition(mediaTagsAll); //추가
    //     }
    // }

}

function iframeHeightResize(e) {
    e.style.height = (e.offsetWidth * 0.5625) + 'px';
    e.removeAttribute('onload');
}

function newUnitsEditor(selector, opt = {}) {
    let el = document.querySelector(`${selector}`);
    let inner_content = el.innerHTML;
    let units_responsive = ``;
    // const orm_id = ORM_ID;
    const csrf_token = CSRF_TOKEN;
    const home_url = HOME_URL;

    if (opt.responsive !== false) {
        units_responsive = `units-responsive` //stone-responsive  // units.css @media
    }
    let units_toolbar = ``;

    if (opt.heading_font_size !== false) {
        units_toolbar = units_toolbar + unitsHeadingFontSizeGroup
    }
    /*
    if (opt.heading !== false) {
        units_toolbar = units_toolbar + unitsHeadingGroup
    }
    if (opt.font_size !== false) {
        units_toolbar = units_toolbar + unitsFontSizeGroup
    }
    */
    if (opt.color !== false) {
        units_toolbar = units_toolbar + unitsColorGroup
    }
    if (opt.font_style !== false) {
        units_toolbar = units_toolbar + unitsFontStyleGroup
    }
    if (opt.list !== false) {
        units_toolbar = units_toolbar + unitsListGroup
    }
    if (opt.align !== false) {
        units_toolbar = units_toolbar + unitsAlignGroup
    }
    if (opt.attachment !== false) {
        units_toolbar = units_toolbar + unitsAttachmentGroup
    }
    if (opt.html !== false) {
        units_toolbar = units_toolbar + unitsHtmlGroup
    }
    if (opt.empty !== false) {
        units_toolbar = units_toolbar + unitsEmpty
    }
    if (opt.more_typing !== false) {
        units_toolbar = units_toolbar + unitsMoreTyping
    }
    if (opt.more_spell !== false) {
        units_toolbar = units_toolbar + unitsMoreSpell
    }
    if (opt.more_edit !== false) {
        units_toolbar = units_toolbar + unitsMoreEdit
    }
    if (opt.more_keyboard !== false) {
        units_toolbar = units_toolbar + unitsMoreKeyboard
    }
    if (opt.more_ellipsis !== false) {
        units_toolbar = units_toolbar + unitsMoreEllipsis
    }
    if (opt.more_sort !== false) {
        units_toolbar = units_toolbar + unitsMoreSort
    }
    if (opt.more_hamburg !== false) {
        units_toolbar = units_toolbar + unitsMoreHamburg
    }
    if (opt.more_plus !== false) {
        units_toolbar = units_toolbar + unitsMorePlus
    }
    if (opt.cancel !== false) {
        units_toolbar = units_toolbar + unitsCancelGroup
    }
    if (opt.help !== false) {
        units_toolbar = units_toolbar + unitsHelpGroup
    }
    if (opt.more_home !== false) {
        units_toolbar = units_toolbar + unitsMoreHome
    }

    el.innerHTML = `<div class="units-container">
                    
                        <div class="units-editor">
                            <div class="toolbar-slider">
                                <div class="toolbar-container">
                                    <div class="units-toolbar">${units_toolbar}</div>
                                </div>                                
                                <div class="slider-container">
                                    <div class="slider-box">
                                        <input id="slider" value="100" min="5" max="100" step="1" oninput="mediaResize(this.value, true);" type="range">
                                        <span id="slider_value">-</span><button class="ml-10 mr-5" type="button" uk-close></button>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="units-wrapper">                                
                                <div class="editable-wrapper ${units_responsive}" title="ESC키로 종료할 수 있습니다.">
                                    <div class="units-content" contentEditable="true">${inner_content}</div>
                                    <textarea class="units-html-content units-hide" name="content" id="hiddenTextarea"></textarea>
                                </div>
                            </div>                            
                            
                            <div class="overlay-container" id="overlay-container"></div>
                        </div>                        
                        
                    </div>
                    <input class="units-exit" title="에디터의 끝부분입니다. TAB키로 다음 영역으로 이동하세요.">`;

    unitsEditorInit(el, opt);
}

const unitsHeadingFontSizeGroup = `
<div class="units-btn-group is-subgroup hfs heading-font-size-group">
    <div class="units-btn-group heading-group">
        <span class="units-btn">
            <button class="sublist-btn units-fontHeading-btn">
                제목 크기
            </button>
            <div class="units-btn-sublist heading">
                <span class="units-btn">
                    <button class="units-heading" data-heading="h1">
                        h1
                    </button>
                </span>
                <span class="units-btn">
                    <button class="units-heading" data-heading="h2">
                        h2
                    </button>
                </span>
                <span class="units-btn">
                    <button class="units-heading" data-heading="h3">
                        h3
                    </button>
                </span>
                <span class="units-btn">
                    <button class="units-heading" data-heading="h4">
                        h4
                    </button>
                </span>
                <span class="units-btn">
                    <button class="units-heading" data-heading="h5">
                        h5
                    </button>
                </span>
                <span class="units-btn">          
                    <button class="units-heading" data-heading="h6">
                        h6
                    </button>
                </span>
            </div>
        </span>
    </div>
    
    <div class="units-btn-group fontSize-group">
        <span class="units-btn">
            <button class="sublist-btn units-fontSize-btn">
                글자 크기
            </button>
            <div class="units-btn-sublist font-size">
                <span class="units-btn">
                    <button class="units-font-size" data-font-size="2.5em">
                        40
                    </button>
                </span>
                <span class="units-btn">
                    <button class="units-font-size" data-font-size="2em">
                        32
                    </button>
                </span>
                <span class="units-btn">
                    <button class="units-font-size" data-font-size="1.75em">
                        28
                    </button>
                </span>
                <span class="units-btn">
                    <button class="units-font-size" data-font-size="1.5em">
                        24
                    </button>
                </span>
                <span class="units-btn">
                    <button class="units-font-size" data-font-size="1.25em">
                        20
                    </button>
                </span>
                <span class="units-btn">
                    <button class="units-font-size" data-font-size="1em">
                        16
                    </button>
                </span>
            </div>
        </span>
    </div>
</div>`

    /*
const unitsHeadingGroup = `
<div class="units-btn-group is-subgroup  heading-group">
    <span class="units-btn">
        <button class="tab-btn units-fontHeading-btn">
            제목 크기
        </button>
        <div class="units-btn-sublist heading">
            <span class="units-btn">
                <button class="units-heading" data-heading="h1">
                    h1
                </button>
            </span>
            <span class="units-btn">
                <button class="units-heading" data-heading="h2">
                    h2
                </button>
            </span>
            <span class="units-btn">
                <button class="units-heading" data-heading="h3">
                    h3
                </button>
            </span>
            <span class="units-btn">
                <button class="units-heading" data-heading="h4">
                    h4
                </button>
            </span>
            <span class="units-btn">
                <button class="units-heading" data-heading="h5">
                    h5
                </button>
            </span>
            <span class="units-btn">
                <button class="units-heading" data-heading="h6">
                    h6
                </button>
            </span>
        </div>
    </span>
</div>`

const unitsFontSizeGroup = `
<div class="units-btn-group is-subgroup  fontSize-group">
    <span class="units-btn">
        <button class="tab-btn units-fontSize-btn">
            글자 크기
        </button>
        <div class="units-btn-sublist font-size">
            <span class="units-btn">
                <button class="units-font-size" data-font-size="2.5em">
                    40
                </button>
            </span>
            <span class="units-btn">
                <button class="units-font-size" data-font-size="2em">
                    32
                </button>
            </span>
            <span class="units-btn">
                <button class="units-font-size" data-font-size="1.75em">
                    28
                </button>
            </span>
            <span class="units-btn">
                <button class="units-font-size" data-font-size="1.5em">
                    24
                </button>
            </span>
            <span class="units-btn">
                <button class="units-font-size" data-font-size="1.25em">
                    20
                </button>
            </span>
            <span class="units-btn">
                <button class="units-font-size" data-font-size="1em">
                    16
                </button>
            </span>
        </div>
    </span>
</div>`
*/

const unitsColorGroup = `
<div class="units-btn-group color-group">
    <span class="units-btn">
    <button class="units-color" title="글자색"><i class="fas fa-font"></i></button>
    </span>
    <span class="units-btn units-flex">
    <input type="color" class="units-color-input" value="#444444">
    </span>units-btn
    <span class="units-btn">
    <button class="units-hilite" title="배경색"><i class="fas fa-fill-drip"></i></button>
    </span>
    <span class="units-btn units-flex">
    <input type="color" class="units-hilite-input" value="#444444">
    </span>
</div>`

const unitsFontStyleGroup = `
<div class="units-btn-group is-subgroup fontStyle-group">
    <span class="units-btn">
    <button class="units-bold" title="굵게"><i class="fas fa-bold"></i></button>
    </span>
    <span class="units-btn">
    <button class="units-italic" title="기울임"><i class="fas fa-italic"></i></button>
    </span>
    <span class="units-btn">
    <button class="units-underline" title="밑줄"><i class="fas fa-underline"></i></button>
    </span>
    <span class="units-btn">
    <button class="units-stroke" title="취소선"><i class="fas fa-strikethrough"></i></button>
    </span>
</div>`

const unitsListGroup = `
<div class="units-btn-group is-subgroup uo-list-group">
    <span class="units-btn">
    <button class="units-ul" title="순서없는 리스트"><i class="fas fa-list-ul"></i></button>
    </span>
    <span class="units-btn">
    <button class="units-ol" title="순서있는 리스트"><i class="fas fa-list-ol"></i></button>
    </span>
</div>`

const unitsAlignGroup = `
<div class="units-btn-group is-subgroup align-group">
    <span class="units-btn">
        <button class="units-align align-lt" data-align="left" title="왼쪽 정렬"><i class="fas fa-align-left"></i></button>
    </span>
    <span class="units-btn">
        <button class="units-align align-cen" data-align="center" title="가운데 정렬"><i class="fas fa-align-center"></i></button>
    </span>
    <span class="units-btn">
        <button class="units-align align-rt" data-align="right" title="오른쪽 정렬"><i class="fas fa-align-right"></i></button>
    </span>
</div>`

const unitsAttachmentGroup = `
<div class="units-btn-group is-subgroup attachment-group">
    <span class="units-btn">
    <button class="units-image" title="이미지 삽입"><i class="far fa-images"></i></button>
    </span>
    <span class="units-btn">
    <button class="units-video" title="동영상 링크 삽입"><i class="fas fa-video"></i></button>
    </span>
    <span class="units-btn">
    <button class="units-link" title="링크"><i class="fas fa-link"></i></button>
    </span>
    <span class="units-btn">
    <button class="units-unlink" title="링크 해제"><i class="fas fa-unlink"></i></button>
    </span>
</div>`

const unitsHtmlGroup = `
<div class="units-btn-group html-group">
    <span class="units-btn">
    <button class="units-html" title="HTML 편집"><label class="units-html-check-label"><input type="checkbox"
                class="units-html-check">HTML</label></button>
    </span>
</div>`

const unitsEmpty = `<div class="units-btn-group empty-group"></div>`

const unitsCancelGroup = `
<div class="units-btn-group cancel-group">
    <span class="units-btn">
    <button class="units-redo" title="앞으로"><i class="fas fa-redo"></i></button>
    </span>
    <span class="units-btn">
    <button class="units-undo" title="뒤로"><i class="fas fa-undo"></i></button>
    </span>
    <span class="units-btn">
    <button class="units-clear" title="전체 지우기"><i class="fas fa-eraser"></i></button>
    </span>
</div>`

const unitsHelpGroup = `
<div class="units-btn-group help-group">
    <span class="units-btn">
    <button class="units-help" uk-toggle="target: #units-help" title="도움말"><i class="fas fa-question"></i></i></button>
    </span>
</div>
<div id="units-help" class="uk-flex-top" uk-modal>
    <div class="uk-modal-dialog uk-modal-body uk-margin-auto-vertical">
        <button class="uk-modal-close-default" type="button" uk-close></button>
        <h5 class="uk-modal-title">작성 팁</h5>
        <div class="mt-15">
        1. 상세페이지 이미지의 너비는 100%가 최적이고,<br>
        2. 5MB를 초과하지 말아야 합니다. <br>
        3. 이미지는 1개에 모든 정보를 넣는게 가장 효율적입니다. <br>
        4. 여러개의 이미지를 사용할 경우 적절한 순서와 배치를 해주세요. <br>
        5. 옵션상품이 있는 경우, 해당 옵션상품 이미지도 첩부하세요.
        </div>
    </div>
</div>`

// More Group/Btn
const unitsMoreTyping = `
<div class="units-btn-group typing-group more-btn-div">
    <span class="units-btn">
    <button class="units-more-typing more-btn" title="타이핑과 문단"><i class="fas fa-keyboard more-btn"></i></button>
    </span>
</div>`

const unitsMoreSpell = `
<div class="units-btn-group spell-group more-btn-div">
    <span class="units-btn">
    <button class="units-more-spell more-btn" title="타이핑과 리스트"><i class="fas fa-spell-check more-btn"></i></button>
    </span>
</div>`

const unitsMoreEdit = `
<div class="units-btn-group edit-group more-btn-div">
    <span class="units-btn">
    <button class="units-more-edit more-btn" title="제목 문자"><i class="fas fa-pencil-alt more-btn"></i></button>
    </span>
</div>`

const unitsMoreKeyboard = `
<div class="units-btn-group keyboard-group more-btn-div">
    <span class="units-btn">
    <button class="units-more-keyboard more-btn" title="제목 글자"><i class="far fa-keyboard more-btn"></i></button>
    </span>
</div>`

const unitsMoreEllipsis = `
<div class="units-btn-group ellipsis-group more-btn-div">
    <span class="units-btn">
    <button class="units-more-ellipsis more-btn" title="문자 강조"><i class="fas fa-ellipsis-h more-btn"></i></button>
    </span>
</div>`

const unitsMoreSort = `
<div class="units-btn-group sort-group more-btn-div">
    <span class="units-btn">
    <button class="units-more-sort more-btn" title="리스트"><i class="fas fa-sort more-btn"></i></button>
    </span>
</div>`

const unitsMoreHamburg = `
<div class="units-btn-group hamburg-group more-btn-div">
    <span class="units-btn">
    <button class="units-more-hamburg more-btn" title="문단 정렬"><i class="fas fa-bars more-btn"></i></button>
    </span>
</div>`

const unitsMorePlus = `
<div class="units-btn-group plus-group more-btn-div">
    <span class="units-btn">
    <button class="units-more-plus more-btn" title="이미지 등"><i class="fas fa-plus more-btn"></i></i></button>
    </span>
</div>`

const unitsMoreHome = `
<div class="units-btn-group home-group more-btn-div">
    <span class="units-btn">
    <button class="units-more-home more-btn" title="홈 메뉴"><i class="fas fa-th more-btn"></i></button>
    </span>
</div>`



