"use strict"
/*jshint esversion: 6 */
document.addEventListener("DOMContentLoaded", function () {

    const newEditor = document.querySelector('.new-editor');
    const unitsEditor = newEditor.querySelector(".units-editor");
    const unitsContent = newEditor.querySelector(".units-content");
    const sublistDivAll = newEditor.querySelectorAll('.units-btn .units-btn-sublist');
    const sublistDivDropAll = newEditor.querySelectorAll(".units-btn-sublist.div-drop");
    const isSubGroupDivDropAll = newEditor.querySelectorAll(".units-btn-group.is-subgroup.div-drop");
    const overlayContainer = newEditor.querySelector('#overlay-container');

    const isGroupDivAll = newEditor.querySelectorAll(".units-btn-group.is-subgroup");

    const attachmentGroupBtn = newEditor.querySelector(".units-more-plus");
    const attachmentGroupDiv = newEditor.querySelector(".attachment-group");

    const alignGroupBtn = newEditor.querySelector(".units-more-hamburg");
    const alignGroupDiv = newEditor.querySelector(".align-group");

    const uoListGroupBtn = newEditor.querySelector(".units-more-sort");
    const uoListGroupDiv = newEditor.querySelector(".uo-list-group");

    const fontStyleGroupBtn = newEditor.querySelector(".units-more-ellipsis");
    const fontStyleGroupDiv = newEditor.querySelector(".fontStyle-group");

    const headingFontSizeGroupBtn = newEditor.querySelector(".units-more-keyboard");
    const headingFontSizeGroupDiv = newEditor.querySelector(".heading-font-size-group");
    const isSubgroupHfs = newEditor.querySelector(".heading-font-size-group.is-subgroup.hfs");

    function sublistDropDown(e) {
        let clientWidth = clientWidthSize(); /*클릭이벤트 함수안에 넣으면, 클릭시 브라우저 크기 반영*/
        console.log("sublistDropDown :: e.target: ", e.target);
        let pairedSiblingBtnList = e.target.nextElementSibling;
        if (pairedSiblingBtnList) {
            pairedSiblingBtnList.slideToggle(0);
            sublistDivAll.forEach(function (sublistDiv) {
                if (sublistDiv.style.display !== "none" && sublistDiv !== pairedSiblingBtnList) {
                    sublistDiv.slideUp(0);
                    sublistDiv.classList.remove('div-drop');

                }
            });
            console.log("sublistDropDown clientWidth", clientWidth);
            if (560 < clientWidth) {
                isGroupDivAll.forEach(function (isSubGroup) {
                    if (isSubGroup.classList.contains('div-drop')) {
                        isSubGroup.slideUp(0);
                        isSubGroup.classList.remove('div-drop');
                    }
                });
            }
            else if (clientWidth <= 560) {
                console.log("sublistDropDown clientWidth <= 560");
            }

            if (!pairedSiblingBtnList.classList.contains('div-drop')) {
                pairedSiblingBtnList.classList.add('div-drop');
                if (document.querySelector(".keyboard-group").style.display !== "none") {
                    unitsContent.style.cssText = `margin-top: 120px`;
                } else {
                    unitsContent.style.cssText = `margin-top: 63px`;
                }
                mediaOverlayAllReposition();
            } else {
                console.log("else div-drop");
                pairedSiblingBtnList.classList.remove('div-drop');
                if (document.querySelector(".keyboard-group").style.display !== "none") {
                    unitsContent.style.cssText = `margin-top: 63px`;
                    console.log("if");
                } else {
                    console.log("else");
                    unitsContent.style.cssText = `margin-top: 0`;
                }
                mediaOverlayAllReposition();
            }

        } else {
            let parentPairedSiblingBtnList = e.target.parentElement.nextElementSibling;
            console.log("parentPairedSiblingBtnList", parentPairedSiblingBtnList);
        }
    }

    function moreBtnMatchingDivReturn(e) {
        if ((e.target === attachmentGroupBtn) || (e.target.parentElement === attachmentGroupBtn)) {
            return attachmentGroupDiv;
        } else if ((e.target === alignGroupBtn) || (e.target.parentElement === alignGroupBtn)) {
            return alignGroupDiv;
        } else if ((e.target === uoListGroupBtn) || (e.target.parentElement === uoListGroupBtn)) {
            return uoListGroupDiv;
        } else if ((e.target === fontStyleGroupBtn) || (e.target.parentElement === fontStyleGroupBtn)) {
            return fontStyleGroupDiv;
        } else if ((e.target === headingFontSizeGroupBtn) || (e.target.parentElement === headingFontSizeGroupBtn)) {
            return headingFontSizeGroupDiv;
        }
    }

    function moreBtnDropDown(e) {
        let clientWidth = clientWidthSize(); /*클릭이벤트 함수안에 넣으면, 클릭시 브라우저 크기 반영*/
        console.log("moreBtnDropDown clientWidth", clientWidth);
        if (clientWidth <= 920) {
            let groupDiv = moreBtnMatchingDivReturn(e);
            if (groupDiv) {
                groupDiv.slideToggle(0);
                isGroupDivAll.forEach(function (isGroup) {
                    if (isGroup.style.display !== "none" && isGroup !== groupDiv && isGroup.classList.contains('div-drop')) {
                        isGroup.slideUp(0);
                        isGroup.classList.remove("div-drop");
                    } else {
                        // isGroup.classList.remove("div-drop");
                        console.log("isGroup.style.display === 'none' No Handler");
                    }
                });

                sublistDivAll.forEach(function (sublistDiv) {
                    if (sublistDiv.classList.contains('div-drop')) {
                        sublistDiv.slideUp(0);
                        sublistDiv.classList.remove('div-drop');
                    }
                });

                if (groupDiv.classList.contains('div-drop')) {
                    console.log("1111 groupDiv.classList.contains('div-drop')");
                    groupDiv.classList.remove('div-drop');
                    unitsContent.style.cssText = `margin-top: 0`;
                    mediaOverlayAllReposition();

                } else {
                    console.log("1111 !!!!! groupDiv.classList.contains('div-drop')");
                    groupDiv.classList.add('div-drop');
                    unitsContent.style.cssText = `margin-top: 63px !important`;
                    mediaOverlayAllReposition();
                }


            } else {
                console.log("else");
            }

            if (groupDiv.classList.contains('heading-font-size-group')) {
                groupDiv.style.cssText = `position: absolute;
                                        display: flex !important;
                                        top: 59px !important;
                                        left: 7px;
                                        border-top: solid 1px white;
                                        border-radius: 0 0 5px 5px !important`;
                groupDiv.children[0].style.cssText = `border-radius: 0 0 0 5px`;
                groupDiv.children[1].style.cssText = `border-radius: 0 0 5px 0`;
            } else {
                groupDiv.style.cssText = `position: absolute;
                                        display: block;
                                        top: 57px !important;
                                        right: 7px;
                                        padding-left: 7px !important;
                                        border-radius: 0 0 5px 5px;
                                        border-top: solid 1px white;
                                        // transition: all ease-in-out 0.3s !important;
                                        `;
            }
        }

    }

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('sublist-btn') || e.target.classList.contains('more-btn')) {
            if (e.target.classList.contains('sublist-btn')) {
                sublistDropDown(e);
            } else if (e.target.classList.contains('more-btn')) {
                moreBtnDropDown(e);
            }
        } else {
            if (sublistDivDropAll) {
                console.log("else sublist-btn이외 클릭");
                sublistDivAll.forEach(function (sublistDiv) {
                    if (sublistDiv.style.display !== "none" && sublistDiv.classList.contains('div-drop')) {
                        console.log("sublistDiv.style.display !== 'none'");
                        sublistDiv.slideUp(0);
                        sublistDiv.classList.remove("div-drop");
                        unitsContent.style.cssText = `margin-top: 0`;
                        mediaOverlayAllReposition();
                    }
                });
            }
            if (isSubGroupDivDropAll) {
                console.log("else more-btn이외 클릭");
                isGroupDivAll.forEach(function (isGroup) {
                    if (isGroup.style.display !== "none" && isGroup.classList.contains('div-drop')) {
                        isGroup.slideUp(0);
                        console.log("isGroup.style.display !== 'none'");
                        isGroup.classList.remove("div-drop");
                        unitsContent.style.cssText = `margin-top: 0`;
                    }
                    mediaOverlayAllReposition();

                });
                // if (isSubgroupHfs.classList.contains('div-drop') && ((!e.target.classList.contains("sublist-btn")))) {
                //     // 이 if 문은 없어도 될 것 같은데... 죽여도 버그가 없는 거 같다.... sublistDiv 를 먼저 슬라이드업시켜버리니까...
                //     console.log("isSubgroupHfs.style.display !== 'none'");
                //     isSubgroupHfs.slideUp(0);
                //     isSubgroupHfs.classList.remove("div-drop");
                //     unitsContent.style.cssText = `margin-top: 0`;
                // }
            }
        }
    });

    function clientWidthSize() {
        console.log("document.documentElement.clientWidth", document.documentElement.clientWidth)
        return document.documentElement.clientWidth;

    }
    window.addEventListener("resize", clientWidthSize);
    clientWidthSize();
    console.log("clientWidthSize 화면로드시 브라우저 크기 반영", clientWidthSize());

    function mediaOverlayAllReposition() {
        const mediaOverlaysAll = overlayContainer.querySelectorAll('.overlay');
        if (mediaOverlaysAll) {
            mediaOverlaysAll.forEach(function (mediaOverlay) {
                let mediaOverlayId = mediaOverlay.getAttribute('data-overlay-id');
                let mediaTag = document.querySelector('[data-id="' + mediaOverlayId + '"]');
                mediaOverlay.style.top = (mediaTag.offsetTop / unitsEditor.offsetHeight) * 100 + '%';
                mediaOverlay.style.left = (mediaTag.offsetLeft / unitsEditor.offsetWidth) * 100 + '%';
                mediaOverlay.style.width = (mediaTag.offsetWidth / unitsEditor.offsetWidth) * 100 + '%';
                mediaOverlay.style.height = (mediaTag.offsetHeight / unitsEditor.offsetHeight) * 100 + '%';
            });
        }
    }



});