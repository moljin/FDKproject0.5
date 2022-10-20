"use strict"
/*jshint esversion: 6 */
imgPreviewInit();
function imgPreviewInit() {
    // profile image
    try {
        let _width = `100%`;
        let _height = `100%`;

        const profileImgInput = document.querySelector("#profile_image");
        let profileImgPreviewTag = document.querySelector('#img-preview');
        const existingProfileImagePath = document.getElementById("img-preview").getAttribute("src");
        eachImagePreview(_width, _height, profileImgInput, profileImgPreviewTag, existingProfileImagePath);
    } catch (e) {
        // console.log(e);
    }

    // business license
    try {
        let _width = `100%`;
        let _height = `auto`;

        const corpImgInput = document.querySelector("#corp_image");
        let corpImgPreviewTag = document.querySelector('#corp-img-preview');
        const existingCorpImagePath = document.getElementById("corp-img-preview").getAttribute("src");
        eachImagePreview(_width, _height, corpImgInput, corpImgPreviewTag, existingCorpImagePath);
    } catch (e) {
        // console.log(e);
    }

    // profile and shopCategory cover image
    try {
        let _width = `100%`;
        let _height = `250px`;

        const coverImgInput1 = document.querySelector("#cover_image1");
        let coverImgPreviewTag1 = document.querySelector('#cover-img1-preview');
        const existingImage1Path = document.getElementById("image_1_path").getAttribute("src");
        eachImagePreview(_width, _height, coverImgInput1, coverImgPreviewTag1, existingImage1Path);

        const coverImgInput2 = document.querySelector("#cover_image2");
        let coverImgPreviewTag2 = document.querySelector('#cover-img2-preview');
        const existingImage2Path = document.getElementById("image_2_path").getAttribute("src");
        eachImagePreview(_width, _height, coverImgInput2, coverImgPreviewTag2, existingImage2Path);

        const coverImgInput3 = document.querySelector("#cover_image3");
        let coverImgPreviewTag3 = document.querySelector('#cover-img3-preview');
        const existingImage3Path = document.getElementById("image_3_path").getAttribute("src");
        eachImagePreview(_width, _height, coverImgInput3, coverImgPreviewTag3, existingImage3Path);

    } catch (e) {
        // console.log(e);
    }

    // shopCategory symbol image
    try {
        let _width = `100%`;
        let _height = `100%`;

        const symbolImgInput = document.querySelector("#symbol_image");
        const symbolPreviewImgTag = document.querySelector("#symbol-preview");
        const existingSymbolImagePath = document.getElementById("shop-symbol-image-src").getAttribute("src");
        eachImagePreview(_width, _height, symbolImgInput, symbolPreviewImgTag, existingSymbolImagePath);

    } catch (e) {
        // console.log(e);
    }

    // admin shopCategory symbol image
    try {
        let _width = `40px`;
        let _height = `40px`;

        const symbolImgInput = document.querySelector("#admin-symbol_image");
        const symbolPreviewImgTag = document.querySelector("#admin-symbol-preview");
        const existingSymbolImagePath = document.getElementById("admin-symbol-preview").getAttribute("src");
        eachImagePreview(_width, _height, symbolImgInput, symbolPreviewImgTag, existingSymbolImagePath);

    } catch (e) {
        // console.log(e);
    }

    // admin profile-image/corp-image
    try {
        let _width = `40px`;
        let _height = `40px`;

        const adminProfileImgInput = document.querySelector("#admin-profile_image");
        let profileImgPreviewTag = document.querySelector('#admin-img-preview');
        eachImagePreview(_width, _height, adminProfileImgInput, profileImgPreviewTag, adminProfileImagePath);

        const adminCorpImgInput = document.querySelector("#admin-corp_image");
        let corpImgPreviewTag = document.querySelector('#admin-corp-img-preview');
        eachImagePreview(_width, _height, adminCorpImgInput, corpImgPreviewTag, adminCorpImagePath);

    } catch (e) {
        // console.log(e);
    }

    // admin profile-cover-image/shopcategory-cover-image
    try {
        let _width = `100%`;
        let _height = `130px`;

        const adminCoverImgInput1 = document.querySelector("#admin-cover_image1");
        let coverImgPreviewTag1 = document.querySelector('#admin-image_1_path');
        eachImagePreview(_width, _height, adminCoverImgInput1, coverImgPreviewTag1, adminImage1Path);

        const adminCoverImgInput2 = document.querySelector("#admin-cover_image2");
        let coverImgPreviewTag2 = document.querySelector('#admin-image_2_path');
        eachImagePreview(_width, _height, adminCoverImgInput2, coverImgPreviewTag2, adminImage2Path);

        const adminCoverImgInput3 = document.querySelector("#admin-cover_image3");
        let coverImgPreviewTag3 = document.querySelector('#admin-image_3_path');
        eachImagePreview(_width, _height, adminCoverImgInput3, coverImgPreviewTag3, adminImage3Path);

    } catch (e) {
        // console.log(e);
    }

}

function eachImagePreview(_width, _height, imgInput, previewTag, existingImgPath) {
    imgInput.addEventListener("change", function (e) {
        e.preventDefault();
        previewStyle(previewTag, _width, _height);

        let imgInputFile = imgInput.files[0];
        imgFileReader(previewTag, existingImgPath, imgInputFile);
    }, false);
}

function previewStyle(previewImgTag, _width, _height) {
    previewImgTag.style.cssText = ` width:` + _width + `;
                                height:` + _height + `;
                                object-fit:cover;
                                `;
}

function imgFileReader(previewImgTag, imgSrc, inputFile) {
    let reader = new FileReader();
    reader.addEventListener("load", function () {
        previewImgTag.src = reader.result;
    }, false);

    if (inputFile) {
        previewImgTag.classList.add('active');
        reader.readAsDataURL(inputFile);
    } else {
        previewImgTag.classList.remove('active');
        previewImgTag.src = imgSrc;


    }
}


