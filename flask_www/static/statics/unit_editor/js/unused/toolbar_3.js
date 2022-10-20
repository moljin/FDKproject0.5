document.addEventListener("DOMContentLoaded", function () {
    const isGroupDivAll = document.querySelectorAll(".units-btn-group.is-subgroup");

    const attachmentGroupBtn = document.querySelector(".units-more-plus");
    const attachmentGroupBtnI = document.querySelector(".units-more-plus > i");
    const attachmentGroupDiv = document.querySelector(".attachment-group");
    const attachmentGroupChildBtn = document.querySelectorAll('.attachment-group button');
    mobileMenuShow(attachmentGroupBtn, attachmentGroupDiv);

    const alignGroupBtn = document.querySelector(".units-more-hamburg");
    const alignGroupDiv = document.querySelector(".align-group");
    const alignGroupChildBtn = document.querySelectorAll('.align-group button');
    mobileMenuShow(alignGroupBtn, alignGroupDiv);

    const uoListGroupBtn = document.querySelector(".sort-group");
    const uoListGroupDiv = document.querySelector(".uo-list-group");
    const uoListGroupChildBtn = document.querySelectorAll('.uo-list-group button');
    mobileMenuShow(uoListGroupBtn, uoListGroupDiv);

    const fontStyleGroupBtn = document.querySelector(".ellipsis-group");
    const fontStyleGroupDiv = document.querySelector(".fontStyle-group");
    const fontStyleGroupChildBtn = document.querySelectorAll('.fontStyle-group button');
    mobileMenuShow(fontStyleGroupBtn, fontStyleGroupDiv);

    const headingFontSizeGroupBtn = document.querySelector(".keyboard-group");
    const headingFontSizeGroupDiv = document.querySelector(".heading-font-size-group");
    const isSubgroupAdd = document.querySelector(".heading-font-size-group.is-subgroup-add");
    const fontHeadingBtn = document.querySelector(".units-fontHeading-btn");
    const fontSizeBtn = document.querySelector(".units-fontSize-btn");
    const headingFontSizeGroupChildDiv = document.querySelectorAll('.heading-font-size-group div');
    mobileMenuShow(headingFontSizeGroupBtn, headingFontSizeGroupDiv);

    function mobileMenuShow(groupBtn, groupDiv) {
        groupBtn.addEventListener('click', function (e) {
            if (groupDiv) {
                groupDiv.slideToggle(300);
                isGroupDivAll.forEach(function (isGroup) {
                    if (isGroup.style.display !== "none" && isGroup !== groupDiv && isGroup.classList.contains('div-drop')) {
                        isGroup.slideUp(300);
                    }
                    if (isSubgroupAdd.style.display !== "none" && isSubgroupAdd !== groupDiv && isSubgroupAdd.classList.contains('div-drop')) {
                        isSubgroupAdd.slideUp(300);
                    }

                });
            } else {
                console.log("else")
            }

            groupDiv.classList.add('div-drop');
            if (groupDiv.classList.contains('heading-font-size-group')) {
                console.log('heading-font-size-group')
                groupDiv.style.cssText = `position: absolute;
                display: flex !important;
                top: 60px !important;
                left: 7px;
                border-radius: 0 0 5px 5px !important`;
                groupDiv.children[0].style.cssText = `border-radius: 0 0 0 5px`;
                groupDiv.children[1].style.cssText = `border-radius: 0 0 5px 0`;
            } else {
                groupDiv.style.cssText = `position: absolute;
                                    display: flex;
                                    top: 58px !important;
                                    right: 7px;
                                    padding-left: 7px !important;
                                    border-radius: 0 0 5px 5px`;
            }

        });

    }

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('more-btn')) {
            console.log("OK more-btn", e.target)
        } else {
            isGroupDivAll.forEach(function (isGroup) {
                if (isGroup.style.display !== "none" && isGroup.classList.contains('div-drop')) {
                    isGroup.slideUp(300);
                }
                if (isSubgroupAdd.classList.contains('div-drop') && ((!e.target.classList.contains("tab-btn")))) {
                    isSubgroupAdd.slideUp(300);
                }
            });
        }

    });


});
