"use strict"
/*jshint esversion: 6 */
document.addEventListener("DOMContentLoaded", function () {

    const newEditor = document.querySelector('.new-editor');
    const headingFontSizeSublistDivAll = newEditor.querySelectorAll('.units-btn .units-btn-sublist');
    const unitsContent = document.querySelector(".units-content");
    const bodyClientWidth = document.body.clientWidth;

    function headingFontSizeOpenFunc(e) {
        let pairedSiblingBtnList = e.target.nextElementSibling;
        if (pairedSiblingBtnList) {
            pairedSiblingBtnList.slideToggle(0);
            headingFontSizeSublistDivAll.forEach(function (sublistDiv) {
                if (sublistDiv.style.display !== "none" && sublistDiv !== pairedSiblingBtnList) {
                    sublistDiv.slideUp(0);
                    sublistDiv.classList.remove('div-drop');

                }
            });

            // if (bodyClientWidth <= 560) {
                if (!pairedSiblingBtnList.classList.contains('div-drop')) {
                    pairedSiblingBtnList.classList.add('div-drop');
                    if (document.querySelector(".keyboard-group").style.display !== "none") {
                        unitsContent.style.cssText = `margin-top: 120px`;
                    } else {
                        unitsContent.style.cssText = `margin-top: 63px`;
                    }
                    mediaOverlayAllReposition();
                } else {
                    pairedSiblingBtnList.classList.remove('div-drop');
                    if (document.querySelector(".keyboard-group").style.display !== "none") {
                        unitsContent.style.cssText = `margin-top: 63px`;
                    } else {
                        unitsContent.style.cssText = `margin-top: 0`;
                    }
                    mediaOverlayAllReposition();
                }
            // }
            // else {
            //     console.log("560 < bodyClientWidth")
            //     if (!pairedSiblingBtnList.classList.contains('div-drop')) {
            //         pairedSiblingBtnList.classList.add('div-drop');
            //         unitsContent.style.cssText = `margin-top: 63px`;
            //         mediaOverlayAllReposition();
            //     } else {
            //         pairedSiblingBtnList.classList.remove('div-drop');
            //         unitsContent.style.cssText = `margin-top: 0`;
            //         mediaOverlayAllReposition();
            //     }
            // }


        }
        else {
            let parentPairedSiblingBtnList = e.target.parentElement.nextElementSibling;
            console.log("parentPairedSiblingBtnList", parentPairedSiblingBtnList)
            // parentPairedSiblingBtnList.slideToggle(350);
            // subBtnSublistDivAll.forEach(function (sublistDiv) {
            //     if (sublistDiv.style.display !== "none" && sublistDiv !== parentPairedSiblingBtnList) {
            //         sublistDiv.slideUp(200);
            //         parentPairedSiblingBtnList.classList.remove('div-drop');
            //         unitsContent.style.cssText = `margin-top: 0`;
            //         mediaOverlayAllReposition();
            //     }
            // });
        }
    }

    const isGroupDivAll = document.querySelectorAll(".units-btn-group.is-subgroup");

    const attachmentGroupBtn = document.querySelector(".plus-group");
    const attachmentGroupDiv = document.querySelector(".attachment-group");
    const attachmentGroupChildBtn = document.querySelectorAll('.attachment-group button');
    mobileMenuOpenFunc(attachmentGroupBtn, attachmentGroupDiv, attachmentGroupChildBtn);

    const alignGroupBtn = document.querySelector(".hamburg-group");
    const alignGroupDiv = document.querySelector(".align-group");
    const alignGroupChildBtn = document.querySelectorAll('.align-group button');
    mobileMenuOpenFunc(alignGroupBtn, alignGroupDiv, alignGroupChildBtn);

    const uoListGroupBtn = document.querySelector(".sort-group");
    const uoListGroupDiv = document.querySelector(".uo-list-group");
    const uoListGroupChildBtn = document.querySelectorAll('.uo-list-group button');
    mobileMenuOpenFunc(uoListGroupBtn, uoListGroupDiv, uoListGroupChildBtn);

    const fontStyleGroupBtn = document.querySelector(".ellipsis-group");
    const fontStyleGroupDiv = document.querySelector(".fontStyle-group");
    const fontStyleGroupChildBtn = document.querySelectorAll('.fontStyle-group button');
    mobileMenuOpenFunc(fontStyleGroupBtn, fontStyleGroupDiv, fontStyleGroupChildBtn);

    const headingFontSizeGroupBtn = document.querySelector(".keyboard-group");
    const headingFontSizeGroupDiv = document.querySelector(".heading-font-size-group");
    const isSubgroupAdd = document.querySelector(".heading-font-size-group.is-subgroup-add");
    const fontHeadingBtn = document.querySelector(".units-fontHeading-btn");
    const fontSizeBtn = document.querySelector(".units-fontSize-btn");
    const headingFontSizeGroupChildDiv = document.querySelectorAll('.heading-font-size-group > div');
    mobileMenuOpenFunc(headingFontSizeGroupBtn, headingFontSizeGroupDiv, headingFontSizeGroupChildDiv);

    function mobileMenuOpenFunc(groupBtn, groupDiv, groupChildDiv) {
        groupBtn.addEventListener('click', function (e) {

            console.log("groupBtn.querySelector('.more-btn'", groupBtn.querySelector(".more-btn"))
            if (groupDiv) {
                groupDiv.slideToggle(0);
                isGroupDivAll.forEach(function (isGroup) {
                    if (isGroup.style.display !== "none" && isGroup !== groupDiv && isGroup.classList.contains('div-drop')) {
                        isGroup.slideUp(0);
                        isGroup.classList.remove("div-drop");
                    }
                    else {
                        // isGroup.classList.remove("div-drop");
                        console.log("isGroup.style.display === 'none'")
                    }
                });
                if (bodyClientWidth <= 920) {
                    console.log("groupBtn+':has(button.more-btn)'", groupBtn+':has(button.more-btn)')
                    // 이미지가 있을때 여기서 작동
                    if (groupDiv.classList.contains('div-drop')) {
                        console.log("1111 groupDiv.classList.contains('div-drop')")
                        groupDiv.classList.remove('div-drop');
                        unitsContent.style.cssText = `margin-top: 0`;
                        mediaOverlayAllReposition();

                    } else {
                        console.log("1111 !!!!! groupDiv.classList.contains('div-drop')")
                        groupDiv.classList.add('div-drop');
                        unitsContent.style.cssText = `margin-top: 63px !important`;
                        mediaOverlayAllReposition();
                    }

                }

            } else {
                console.log("else")
            }

            if (groupDiv.classList.contains('heading-font-size-group')) {
                groupDiv.style.cssText = `position: absolute;
                                        display: flex !important;
                                        top: 60px !important;
                                        left: 7px;
                                        border-radius: 0 0 5px 5px !important`;
                groupDiv.children[0].style.cssText = `border-radius: 0 0 0 5px`;
                groupDiv.children[1].style.cssText = `border-radius: 0 0 5px 0`;
            } else {
                groupDiv.style.cssText = `position: absolute;
                                        display: block;
                                        top: 58px !important;
                                        right: 7px;
                                        padding-left: 7px !important;
                                        border-radius: 0 0 5px 5px;
                                        // transition: all ease-in-out 0.3s !important;
                                        `;
            }

        });

    }

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('tab-btn')) {
            headingFontSizeOpenFunc(e);
        } else {
            headingFontSizeSublistDivAll.forEach(function (sublistDiv) {
                if (sublistDiv.style.display !== "none" && sublistDiv.classList.contains('div-drop')) {
                    sublistDiv.slideUp(0);
                    sublistDiv.classList.remove("div-drop");
                    unitsContent.style.cssText = `margin-top: 0`;
                    console.log("subBtnSublistDivAll.forEach(function (sublistDiv)")
                    mediaOverlayAllReposition();
                }
            });
        }

        if (e.target.classList.contains('more-btn')) {
            console.log("OK more-btn, e.target", e.target.parentNode.parentNode)
            // 이미지가 없을때 여기서 작동
             divDropOnOff();
        } else {
            console.log("Not more-btn", e.target)
            isGroupDivAll.forEach(function (isGroup) {
                if (isGroup.style.display !== "none" && isGroup.classList.contains('div-drop')) {
                    isGroup.slideUp(0);
                    console.log("isGroup.style.display !== 'none'")
                    isGroup.classList.remove("div-drop");
                    unitsContent.style.cssText = `margin-top: 0`;
                }
                mediaOverlayAllReposition();

            });
            if (isSubgroupAdd.classList.contains('div-drop') && ((!e.target.classList.contains("tab-btn")))) {
                    isSubgroupAdd.slideUp(0);
                    isSubgroupAdd.classList.remove("div-drop");
                    unitsContent.style.cssText = `margin-top: 0`;
                }
        }

    });



    function mediaOverlayAllReposition() {
        const unitsEditor = document.querySelector(".units-editor");
        const overlayContainer = document.querySelector('#overlay-container');
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

    function divDropOnOff_1() {
        let divDropAll = document.querySelectorAll(".div-drop");
        console.log("divDropAll", divDropAll);
        divDropAll.forEach(function (divDrop) {
            console.log(divDrop)
            divDrop.classList.remove("div-drop");
            divDrop.slideUp(0);
        });

    }
    function divDropOnOff () {
        console.log(document.querySelector(".div-drop"));
        let dropGroupDiv = document.querySelector(".div-drop");
        try {
            if (dropGroupDiv.classList.contains('div-drop') === null) {
                unitsContent.style.cssText = `margin-top: 0`;
                console.log("3333 groupDiv.classList.contains('div-drop') === null")
                console.log("unitsContent.style.cssText = `margin-top: 0`;")
                mediaOverlayAllReposition();

            } else {
                unitsContent.style.cssText = `margin-top: 63px !important`;
                console.log("3333 groupDiv.classList.contains('div-drop') 있을때")
                console.log("unitsContent.style.cssText = `margin-top: 63px !important`; ")
                mediaOverlayAllReposition();
            }

        } catch (err) {
            console.log("catch err:: ", err);
        }

    }


});