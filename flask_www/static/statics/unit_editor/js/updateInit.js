"use strict"

unitsEditorUpdateInit();

function unitsEditorUpdateInit() {
    const unitsSubject = document.querySelector("#title");
    const unitsContent = document.querySelector(".units-content");
    unitsSubject.value = Units_Subject;
    unitsContent.innerHTML = Editable_Content;

    const el = document.querySelector('.new-editor');
    const oldMediaTagsAll = unitsContent.querySelectorAll('.media');
    const overlayContainer = el.querySelector('#overlay-container');

    Array.from(oldMediaTagsAll).forEach(function (mediaTag, index) {
        let mediaTagDataId = mediaTag.getAttribute('data-id');

        if (mediaTag.tagName === 'IMG') {
            let newMediaOverlay = mediaOverlayCreate(mediaTagDataId);
            newMediaOverlay.classList.add('image');

            mediaTag.onload = function () {
                mediaOverlayStyleAppend(newMediaOverlay, overlayContainer);
                const mediaOverlaysAll = overlayContainer.querySelectorAll('.overlay');
                mediaOverlaysAllReposition(mediaOverlaysAll);
            };
        }
        else if (mediaTag.tagName === 'IFRAME') {
            mediaTag.style.height = (mediaTag.offsetWidth * 0.5625) + 'px';
            let newMediaOverlay = mediaOverlayCreate(mediaTagDataId);
            newMediaOverlay.classList.add('iframe');

            mediaOverlayStyleAppend(newMediaOverlay, overlayContainer);
            const mediaOverlaysAll = overlayContainer.querySelectorAll('.overlay');
            mediaOverlaysAllReposition(mediaOverlaysAll);
        }
    });

}

function mediaOverlayCreate(randomStringDataId) {
    let newMediaOverlay = document.createElement('div');
    newMediaOverlay.setAttribute('data-overlay-id', `${randomStringDataId}`);
    newMediaOverlay.setAttribute('class', 'overlay');
    // newMediaOverlay.setAttribute('contenteditable', 'false');
    return newMediaOverlay;
}

function mediaOverlayStyleAppend(newMediaOverlay, overlayContainer) {
    newMediaOverlay.style.background = 'green'; //green  transparent
    newMediaOverlay.style.opacity = '0.3';
    newMediaOverlay.style.position = 'absolute';
    newMediaOverlay.style.zIndex = "3";
    console.log("newMediaOverlay", newMediaOverlay)
    overlayContainer.appendChild(newMediaOverlay);
    console.log("overlayContainer", overlayContainer)
}

function mediaOverlayMediaTagMatchingBind(mediaOverlay, mediaTag) {
    console.log("mediaOverlayMediaTagMatchingBind")
    let unitsEditor = document.querySelector(".units-editor");
    if (mediaTag) {
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



