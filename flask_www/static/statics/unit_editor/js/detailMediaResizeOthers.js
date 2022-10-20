const iframes = document.querySelectorAll('iframe');
const detailContainer = document.querySelector('#detail-container');
const images = detailContainer.querySelectorAll('img');
let mediaWidthInitPercentage = '70%';

function imageAltDisplayInit() {
    images.forEach(function (imgTag, index) {
        let imgAlt = imgTag.getAttribute('alt');
        if (imgAlt) {
            let imgDataId = imgTag.getAttribute('data-id');
            let imgAltDiv = document.createElement('DIV');
            imgAltDiv.setAttribute('class', 'image-alt');
            imgAltDiv.setAttribute('data-alt-id', `${imgDataId}`);
            imgAltDiv.style.marginTop = '-0.25rem';
            imgAltDiv.style.width = mediaWidthInitPercentage;
            imgAltDiv.style.padding = '5px 10px';
            imgAltDiv.style.border = 'solid 1px #d2d2d2';
            imgAltDiv.style.display = 'block';
            imgAltDiv.style.marginLeft = 'auto';
            imgAltDiv.style.marginRight = 'auto';
            // imgAltDiv.style.width = imgTag.clientWidth + 'px';
            imgAltDiv.style.width = (imgTag.offsetWidth/detailContainer.offsetWidth)*100 + '%';
            imgAltDiv.style.height = 'auto';
            imgAltDiv.innerText = imgAlt;
            imgTag.after(imgAltDiv);

        }



    });
}
imageAltDisplayInit();

let imgAltDivsAll = detailContainer.querySelectorAll('.image-alt');
function detailPageMediaMobileResize() {
    if (window.matchMedia('(min-width: 0px) and (max-width: 960px)').matches) {
        iframes.forEach(function (iframe) {
            iframe.style.width = '100%';
            iframe.style.height = (iframe.offsetWidth * 0.5625) + 'px';
            iframe.style.textAlign = 'center';
        });
        images.forEach(function (image) {

            // image.style.textAlign = 'center';
            image.style.width = '100%';
            image.style.height = 'auto';
            // image.style.textAlign = 'center';
        });
        imgAltDivsAll.forEach(function (imgAlt) {
            imgAlt.style.width = '100%';
            imgAlt.style.height = 'auto';
        });


    }
    else if (window.matchMedia('(min-width: 960px)').matches) {
            iframes.forEach(function (iframe) {
                // iframe.style.width = mediaWidthInitPercentage;
                iframe.style.height = (iframe.offsetWidth * 0.5625) + 'px';
                iframe.style.textAlign = 'center';
            });
            images.forEach(function (image) {
                // image.style.width = mediaWidthInitPercentage;
                // image.style.height = 'auto';
                // image.style.margin = '0 auto';
                // image.style.textAlign = 'center';
            });
            imgAltDivsAll.forEach(function (imgAlt) {
            // imgAlt.style.width = mediaWidthInitPercentage;
            // imgAlt.style.height = 'auto';
            // image.style.textAlign = 'center';
        });
    }


}

// Register
window.addEventListener('resize', detailPageMediaMobileResize, false);
// Initialization
detailPageMediaMobileResize();

