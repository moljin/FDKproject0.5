"use strict"
/*jshint esversion: 6 */
document.addEventListener("DOMContentLoaded", function () {
    let newEditor = document.querySelector('.new-editor');
    const subBtnSublistDivAll = newEditor.querySelectorAll('.units-btn .units-btn-sublist'); // ul tab-panel 메뉴리스트

    function toolbarSubBtnListOpenFunc(e) {
        console.log("e.target.nextElementSibling", e.target.nextElementSibling)
        let pairedSiblingBtnList = e.target.nextElementSibling;
        if (pairedSiblingBtnList) {
            pairedSiblingBtnList.slideToggle(0);
            subBtnSublistDivAll.forEach(function (sublistDiv) {
                if (sublistDiv.style.display !== "none" && sublistDiv !== pairedSiblingBtnList) {
                    sublistDiv.slideUp(0);
                }
            });
            if (!pairedSiblingBtnList.classList.contains('div-drop')) {
                pairedSiblingBtnList.classList.add('div-drop');
                document.querySelector(".units-content").style.cssText = `margin-top: 120px`;
            }
            else {
                pairedSiblingBtnList.classList.remove('div-drop');
                document.querySelector(".units-content").style.cssText = `margin-top: 0`;
            }
        }
        // else {
        //     let parentPairedSiblingBtnList = e.target.parentElement.nextElementSibling;
        //     console.log("parentPairedSiblingBtnList", parentPairedSiblingBtnList)
        //     parentPairedSiblingBtnList.slideToggle(350);
        //     subBtnSublistDivAll.forEach(function (sublistDiv) {
        //         if (sublistDiv.style.display !== "none" && sublistDiv !== parentPairedSiblingBtnList) {
        //             sublistDiv.slideUp(200);
        //         }
        //     });
        // }
    }

    const isGroupDivAll = document.querySelectorAll(".units-btn-group.is-subgroup");

    const attachmentGroupBtn = document.querySelector(".plus-group");
    const attachmentGroupDiv = document.querySelector(".attachment-group");
    const attachmentGroupChildBtn = document.querySelectorAll('.attachment-group button');
    mobileMenuShow(attachmentGroupBtn, attachmentGroupDiv, attachmentGroupChildBtn);

    const alignGroupBtn = document.querySelector(".hamburg-group");
    const alignGroupDiv = document.querySelector(".align-group");
    const alignGroupChildBtn = document.querySelectorAll('.align-group button');
    mobileMenuShow(alignGroupBtn, alignGroupDiv, alignGroupChildBtn);

    const uoListGroupBtn = document.querySelector(".sort-group");
    const uoListGroupDiv = document.querySelector(".uo-list-group");
    const uoListGroupChildBtn = document.querySelectorAll('.uo-list-group button');
    mobileMenuShow(uoListGroupBtn, uoListGroupDiv, uoListGroupChildBtn);

    const fontStyleGroupBtn = document.querySelector(".ellipsis-group");
    const fontStyleGroupDiv = document.querySelector(".fontStyle-group");
    const fontStyleGroupChildBtn = document.querySelectorAll('.fontStyle-group button');
    mobileMenuShow(fontStyleGroupBtn, fontStyleGroupDiv, fontStyleGroupChildBtn);

    const headingFontSizeGroupBtn = document.querySelector(".keyboard-group");
    const headingFontSizeGroupDiv = document.querySelector(".heading-font-size-group");
    const isSubgroupAdd = document.querySelector(".heading-font-size-group.is-subgroup-add");
    const fontHeadingBtn = document.querySelector(".units-fontHeading-btn");
    const fontSizeBtn = document.querySelector(".units-fontSize-btn");
    const headingFontSizeGroupChildDiv = document.querySelectorAll('.heading-font-size-group > div');
    mobileMenuShow(headingFontSizeGroupBtn, headingFontSizeGroupDiv, headingFontSizeGroupChildDiv);

    function mobileMenuShow(groupBtn, groupDiv, groupChildDiv) {
        groupBtn.addEventListener('click', function (e) {
            if (groupDiv) {
                groupDiv.slideToggle(0);
                isGroupDivAll.forEach(function (isGroup) {
                    if (isGroup.style.display !== "none" && isGroup !== groupDiv && isGroup.classList.contains('div-drop')) {
                        isGroup.slideUp(0);
                        isGroup.classList.remove("div-drop");
                    }
                });
                if (isSubgroupAdd.style.display !== "none" && isSubgroupAdd !== groupDiv && isSubgroupAdd.classList.contains('div-drop')) {
                        isSubgroupAdd.slideUp(0);
                        isSubgroupAdd.classList.remove("div-drop");
                    }
                // if (groupDiv.classList.contains('div-drop')) {
                //     groupDiv.classList.remove('div-drop');
                // }

            } else {
                console.log("else")
            }

            if (!groupDiv.classList.contains('div-drop')) {
                groupDiv.classList.add('div-drop');
                document.querySelector(".units-content").style.cssText = `margin-top: 63px`;
                mediaOverlayAllReposition();

            }
            else {
                groupDiv.classList.remove('div-drop');
                document.querySelector(".units-content").style.cssText = `margin-top: 0`;
                mediaOverlayAllReposition();
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
            toolbarSubBtnListOpenFunc(e);
        } else {
            subBtnSublistDivAll.forEach(function (sublistDiv) {
                if (sublistDiv.style.display !== "none") {
                    sublistDiv.slideUp(0);
                }
            });
        }

        if (e.target.classList.contains('more-btn')) {
            console.log("OK more-btn", e.target)
        } else {
            isGroupDivAll.forEach(function (isGroup) {
                if (isGroup.style.display !== "none" && isGroup.classList.contains('div-drop')) {
                    isGroup.slideUp(0);
                    isGroup.classList.remove("div-drop");
                    document.querySelector(".units-content").style.cssText = `margin-top: 0`;
                }
                mediaOverlayAllReposition();

            });
            if (isSubgroupAdd.classList.contains('div-drop') && ((!e.target.classList.contains("tab-btn")))) {
                    isSubgroupAdd.slideUp(0);
                    isSubgroupAdd.classList.remove("div-drop");
                    document.querySelector(".units-content").style.cssText = `margin-top: 0`;
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


});