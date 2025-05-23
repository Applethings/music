//self invoked function (so it doesn't pollute the global scope)
(async function () {
  const fetchLoadedImages = (querySelector, expectedNumberOfImages) => {
    console.log("Waiting for images to load...");
    return new Promise((resolve) => {
      const intervalId = setInterval(() => {
        const images = [...document.querySelectorAll(querySelector)]; //arrays are easier to work with
        if (images.length === expectedNumberOfImages && images.every(image => image.src && image.complete)) { //Musescore sometimes initializes the image without a src
          clearInterval(intervalId);
          resolve(images);
        }
      }, 500);
    })
  }

  const scrollViewSelector = "#jmuse-scroller-component";
  const pageElementSelector = `${scrollViewSelector}>.F16e6`;
  const imageElementSelector = `${pageElementSelector}>img`;

  const pageContainer = document.querySelector(scrollViewSelector);
  const allChildren = document.querySelectorAll(scrollViewSelector + ">*");
  const pages = document.querySelectorAll(pageElementSelector);

  const SCROLL_HEIGHT_PX = 10000;
  const VIEWPORT_HEIGHT_PX = 9999;

  //so all images are "visible" on the page
  for (const el of allChildren) {
    el.style.display = "none";
  }

  pageContainer.insertAdjacentHTML("beforeend", `<div style="height:${SCROLL_HEIGHT_PX}px"></div>`);
  pageContainer.style.height = VIEWPORT_HEIGHT_PX + "px";
  pageContainer.scrollTo(0, 0); //just to reset scroll real quick
  pageContainer.scrollTo(0, 1);


  const images = await fetchLoadedImages(imageElementSelector, pages.length);

  document.getElementsByTagName("html")[0].innerHTML = "";

  const style = document.createElement("style");
  style.textContent = `
    body{
      margin:0;
    }
    img{
      height:296mm; /* sometimes it overflows to the next page if it's 297mm */
    }
    @page {
      size: A4;
      margin: 0;
    }
    @media print {
      html, body {
        width: 210mm;
        height: 297mm;
      }
    }
  `;
  document.head.appendChild(style);
  for (const image of images) {
    const imageClone = document.createElement("img");
    imageClone.src = image.src;
    document.body.appendChild(imageClone);
  }

  fetchLoadedImages("img", pages.length).then(() => window.print());

})();  
