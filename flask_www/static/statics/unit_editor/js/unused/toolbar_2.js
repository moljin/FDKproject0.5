 "use strict"

 mobileMenuToggleInit();

 function mobileMenuToggleInit() {
     const unitsBtnGroupAll = document.querySelectorAll(".units-btn-group.is-subgroup");

     const attachmentGroupBtn = document.querySelector(".units-more-plus");
     const attachmentGroupDiv = document.querySelector(".attachment-group");
     const attachmentGroupChildBtn = document.querySelectorAll('.attachment-group button');
     // mobileMenuShow(attachmentGroupBtn, attachmentGroupDiv, attachmentGroupChildBtn, unitsBtnGroupAll);
     // mobileMenuHide(attachmentGroupBtn, attachmentGroupDiv, attachmentGroupChildBtn, unitsBtnGroupAll);

     const alignGroupBtn = document.querySelector(".units-more-hamburg");
     const alignGroupDiv = document.querySelector(".align-group");
     const alignGroupChildBtn = document.querySelectorAll('.align-group button');
     // mobileMenuShow(alignGroupBtn, alignGroupDiv, alignGroupChildBtn, unitsBtnGroupAll);
     // mobileMenuHide(alignGroupBtn, alignGroupDiv, alignGroupChildBtn, unitsBtnGroupAll);

     const uoListGroupBtn = document.querySelector(".sort-group");
     const uoListGroupDiv = document.querySelector(".uo-list-group");
     const uoListGroupChildBtn = document.querySelectorAll('.uo-list-group button');
     // mobileMenuShow(uoListGroupBtn, uoListGroupDiv, uoListGroupChildBtn, unitsBtnGroupAll);
     // mobileMenuHide(uoListGroupBtn, uoListGroupDiv, uoListGroupChildBtn, unitsBtnGroupAll);

     const fontStyleGroupBtn = document.querySelector(".ellipsis-group");
     const fontStyleGroupDiv = document.querySelector(".fontStyle-group");
     const fontStyleGroupChildBtn = document.querySelectorAll('.fontStyle-group button');
     // mobileMenuShow(fontStyleGroupBtn, fontStyleGroupDiv, fontStyleGroupChildBtn, unitsBtnGroupAll);
     // mobileMenuHide(fontStyleGroupBtn, fontStyleGroupDiv, fontStyleGroupChildBtn, unitsBtnGroupAll);

     // const headingFontSizeGroupBtn = document.querySelector(".keyboard-group");
     // const headingFontSizeGroupDiv = document.querySelector(".heading-font-size-group");
     // const headingFontSizeGroupChildDiv = document.querySelectorAll('.heading-font-size-group div');

 }

 function mobileMenuShow(groupBtn, groupDiv, groupChildBtn, btnGroupAll) {
     groupBtn.addEventListener('click', function (e) {
         console.log("mobileMenuShow groupBtn", groupBtn)
         console.log("mobileMenuShow e.target", e.target)
         if (groupDiv) {
             groupDiv.slideToggle(300);
             btnGroupAll.forEach(function (btnGroup) {
                 if (btnGroup.style.display !== "none" && btnGroup !== groupDiv) {
                     btnGroup.slideUp(300);
                     console.log("foreach")
                 }

             });
         } else {
             console.log("else")
         }


         groupDiv.style.cssText = `position: absolute;
                                    display: flex;
                                    top: 58px !important;
                                    right: 7px;
                                    padding-left: 7px !important;
                                    border-radius: 0 0 5px 5px`;

         // if (groupDiv.style.display !== "none") {
         //     groupDiv.slideUp(300);
         // }
     });
 }


 // function mobileMenuHide(groupBtn, groupDiv, groupChildBtn, btnGroupAll) {
     document.addEventListener('click', function (e) {
         console.log("mobileMenuHide : e.target.parentNode.parentNode", e.target.parentNode.parentNode)
         console.log("mobileMenuHide : e.target.parentNode", e.target.parentNode)
         console.log("mobileMenuHide : e.target", e.target)
         if (e.target.classList.contains('units-more-plus') || e.target.parentNode.classList.contains('units-more-plus')) {
             const attachmentGroupBtn = document.querySelector(".units-more-plus");
             const attachmentGroupDiv = document.querySelector(".attachment-group");
             const attachmentGroupChildBtn = document.querySelectorAll('.attachment-group button');
                 attachmentGroupDiv.slideToggle(300);
                 btnGroupAll.forEach(function (btnGroup) {
                     if (btnGroup.style.display !== "none" && btnGroup !== groupDiv) {
                         btnGroup.slideUp(300);
                         console.log("foreach")
                     }

                 });



             groupDiv.style.cssText = `position: absolute;
                                    display: flex;
                                    top: 58px !important;
                                    right: 7px;
                                    padding-left: 7px !important;
                                    border-radius: 0 0 5px 5px`;
         } else {
             btnGroupAll.forEach(function (btnGroup) {
                 if (btnGroup.style.display !== "none") {
                     btnGroup.slideUp(300);
                 }
             });
         }
     });
 // }

 function realShow(groupBtn, groupDiv, groupChildBtn) {
     console.log("OK")
 }

/*
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
*/

