document.addEventListener("DOMContentLoaded", function () {
    const unitsContent = document.querySelector(".units-content");

    const headingFontSizeGroupDiv = document.querySelector(".heading-font-size-group");
    const headingSubList = document.querySelector(".heading");
    const fontSizeSubList = document.querySelector(".font-size");
    const fontStyleGroupDiv = document.querySelector(".fontStyle-group");
    const uoListGroupDiv = document.querySelector(".uo-list-group");
    const alignGroupDiv = document.querySelector(".align-group");
    const attachmentGroupDiv = document.querySelector(".attachment-group");

    const typingGroup = document.querySelector(".typing-group");
    const spellGroup = document.querySelector(".spell-group");
    const editGroup = document.querySelector(".edit-group");

    const keyboardGroup = document.querySelector(".keyboard-group");
    const ellipsisGroup = document.querySelector(".ellipsis-group");
    const sortGroup = document.querySelector(".sort-group");
    const hamburgGroup = document.querySelector(".hamburg-group");
    const plusGroup = document.querySelector(".plus-group");

    function toolbarMediaQuery() {
        const bodyClientWidth = document.body.clientWidth;
        if (bodyClientWidth <= 560) {
            headingFontSizeGroupDiv.style.cssText =`display: none !important;`;
            headingSubList.style.cssText =`display: none;`;
            fontSizeSubList.style.cssText =`display: none;`;
            fontStyleGroupDiv.style.cssText =`display: none;`;
            uoListGroupDiv.style.cssText =`display: none;`;
            alignGroupDiv.style.cssText =`display: none;`;
            attachmentGroupDiv.style.cssText =`display: none;`;

            typingGroup.style.cssText = `display: none !important;`;
            spellGroup.style.cssText = `display: none !important;`;
            editGroup.style.cssText = `display: none !important;`;

            keyboardGroup.style.cssText = `display: block`;
            ellipsisGroup.style.cssText = `display: block`;
            sortGroup.style.cssText = `display: block`;
            hamburgGroup.style.cssText = `display: block`;
            plusGroup.style.cssText = `display: block`;


        }
        else if (bodyClientWidth <= 670) {
            headingFontSizeGroupDiv.style.cssText =`display: flex`;
            fontStyleGroupDiv.style.cssText =`display: none;`;
            uoListGroupDiv.style.cssText =`display: none;`;
            alignGroupDiv.style.cssText =`display: none;`;
            attachmentGroupDiv.style.cssText =`display: none;`;

            typingGroup.style.cssText = `display: none !important;`;
            spellGroup.style.cssText = `display: none !important;`;
            editGroup.style.cssText = `display: none !important;`;

            keyboardGroup.style.cssText = `display: none !important;`;
            ellipsisGroup.style.cssText = `display: block`;
            sortGroup.style.cssText = `display: block`;
            hamburgGroup.style.cssText = `display: block`;
            plusGroup.style.cssText = `display: block`;
        }
        else if (bodyClientWidth <= 700) {
            headingFontSizeGroupDiv.style.cssText =`display: flex`;
            fontStyleGroupDiv.style.cssText =`display: block;`;
            uoListGroupDiv.style.cssText =`display: none;`;
            alignGroupDiv.style.cssText =`display: none;`;
            attachmentGroupDiv.style.cssText =`display: none;`;

            typingGroup.style.cssText = `display: none !important;`;
            spellGroup.style.cssText = `display: none !important;`;
            editGroup.style.cssText = `display: none !important;`;

            keyboardGroup.style.cssText = `display: none !important;`;
            ellipsisGroup.style.cssText =`display: none;`;
            sortGroup.style.cssText = `display: block`;
            hamburgGroup.style.cssText = `display: block`;
            plusGroup.style.cssText = `display: block`;
        }
        else if (bodyClientWidth <= 760) {
            headingFontSizeGroupDiv.style.cssText =`display: flex`;
            fontStyleGroupDiv.style.cssText =`display: block;`;
            uoListGroupDiv.style.cssText =`display: block;`;
            alignGroupDiv.style.cssText =`display: none;`;
            attachmentGroupDiv.style.cssText =`display: none;`;

            typingGroup.style.cssText = `display: none !important;`;
            spellGroup.style.cssText = `display: none !important;`;
            editGroup.style.cssText = `display: none !important;`;

            keyboardGroup.style.cssText = `display: none !important;`;
            ellipsisGroup.style.cssText =`display: none;`;
            sortGroup.style.cssText =`display: none;`;
            hamburgGroup.style.cssText = `display: block`;
            plusGroup.style.cssText = `display: block`;
        }
        else if (bodyClientWidth <= 920) {
            headingFontSizeGroupDiv.style.cssText =`display: flex`;
            fontStyleGroupDiv.style.cssText =`display: block;`;
            uoListGroupDiv.style.cssText =`display: block;`;
            alignGroupDiv.style.cssText =`display: block;`;
            attachmentGroupDiv.style.cssText =`display: none;`;

            typingGroup.style.cssText = `display: none !important;`;
            spellGroup.style.cssText = `display: none !important;`;
            editGroup.style.cssText = `display: none !important;`;

            keyboardGroup.style.cssText = `display: none !important;`;
            ellipsisGroup.style.cssText =`display: none;`;
            sortGroup.style.cssText =`display: none;`;
            hamburgGroup.style.cssText =`display: none;`;
            plusGroup.style.cssText = `display: block`;
        }
        else if (921 < bodyClientWidth) {
            headingFontSizeGroupDiv.style.cssText =`display: flex`;
            fontStyleGroupDiv.style.cssText =`display: block;`;
            uoListGroupDiv.style.cssText =`display: block;`;
            alignGroupDiv.style.cssText =`display: block;`;
            attachmentGroupDiv.style.cssText =`display: block;`;

            typingGroup.style.cssText = `display: none !important;`;
            spellGroup.style.cssText = `display: none !important;`;
            editGroup.style.cssText = `display: none !important;`;

            keyboardGroup.style.cssText = `display: none !important;`;
            ellipsisGroup.style.cssText = `display: none !important;`;
            sortGroup.style.cssText = `display: none !important;`;
            hamburgGroup.style.cssText = `display: none !important;`;
            plusGroup.style.cssText = `display: none !important;`;
        }
    }

    window.addEventListener("resize", function (e) {
        toolbarMediaQuery();
        const divDropAll = document.querySelectorAll(".div-drop");
        if (divDropAll) {
            divDropAll.forEach(function (divDrop) {
                    divDrop.classList.remove("div-drop");
                    divDrop.style.display = "none";
                    unitsContent.style.cssText = `margin-top: 0`;
                });
        }
    });
    //Fire it when the page first loads:
    toolbarMediaQuery();
});