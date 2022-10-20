uikitUnitsEditorInit();
function uikitUnitsEditorInit () {
    const toolbarContainer = document.querySelector(".toolbar-container");
    const unitsToolbar = document.querySelector(".units-toolbar");

    const headingFontSizeGroupDiv = document.querySelector(".heading-font-size-group");
    const headingGroupDiv = document.querySelector(".heading-group");
    const fontSizeGroupDiv = document.querySelector(".fontSize-group");

    const fontStyleGroupDiv = document.querySelector(".fontStyle-group");
    const uoListGroupDiv = document.querySelector(".uo-list-group");
    const alignGroupDiv = document.querySelector(".align-group");
    const attachmentGroupDiv = document.querySelector(".attachment-group");

    const headingFontSizeGroupDivChildBtn = document.querySelectorAll(".heading-font-size-group button");
    const headingGroupDivChildBtn = document.querySelectorAll(".heading-group button");
    const fontSizeGroupDivChildBtn = document.querySelectorAll(".fontSize-group button");

    const fontStyleGroupDivChildBtn = document.querySelectorAll(".fontStyle-group button");
    const uoListGroupDivChildBtn = document.querySelectorAll(".uo-list-group button");
    const alignGroupDivChildBtn = document.querySelectorAll(".align-group button");
    const attachmentGroupDivChildBtn = document.querySelectorAll(".attachment-group button");

    const headingFontSizeKeyboardGroupBtn = document.querySelector(".keyboard-group");
    const fontStyleEllipsisGroupBtn = document.querySelector(".ellipsis-group");
    const uoListSortGroupBtn = document.querySelector(".sort-group");
    const alignHamburgGroupBtn = document.querySelector(".hamburg-group");
    const attachmentPlusGroupBtn = document.querySelector(".plus-group");

    attachmentPlusGroupBtn.addEventListener("click", function (e) {
        attachmentGroupDiv.slideDown(500);
        attachmentGroupDivChildBtn.forEach(function (btn) {
             btn.slideDown(500);
         });
        unitsToolbar.style.cssText = `position: relative`;
        attachmentGroupDiv.style.cssText = `position: absolute;
                                        display: flex;
                                        top: 58px !important;
                                        right: 0;
                                        padding-left: 7px !important;
                                        border-radius: 0 0 5px 5px`;

    });


}

