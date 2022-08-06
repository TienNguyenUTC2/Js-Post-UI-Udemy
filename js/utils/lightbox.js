function showModel(modelElement) {
  var modal = new window.bootstrap.Modal(modelElement);
  if (modal) modal.show();
}

export function registerLightbox({ modelId, imgSelector, prevSelector, nextSelector }) {
  const modelElement = document.getElementById(modelId);
  if (!modelElement) return;
  //check if this model is registered or not
  if (modelElement.dataset.registered) return;

  //selector
  const imgElement = modelElement.querySelector(imgSelector);
  const prevButton = modelElement.querySelector(prevSelector);
  const nextButton = modelElement.querySelector(nextSelector);

  if (!imgElement || !prevButton || !nextButton) return;

  let imgList = [];
  let currentIndex = 0;

  function showImgAtIndex(index) {
    imgElement.src = imgList[index].src;
  }
  //handle click for all imgs ->event delegation
  //img click -> find all img with the same album
  //determine index of selected img
  document.addEventListener('click', (event) => {
    const { target } = event;
    if (target.tagName !== 'IMG' || !target.dataset.album) return;
    imgList = document.querySelectorAll(`img[data-album="${target.dataset.album}"]`);
    currentIndex = [...imgList].findIndex((x) => x === target);

    //show img at index
    showImgAtIndex(currentIndex);
    //show model
    showModel(modelElement);
  });
  //handle prev/next click
  prevButton.addEventListener('click', () => {
    //shwo prev img of current album
    currentIndex = (currentIndex - 1 + imgList.length) % imgList.length;
    showImgAtIndex(currentIndex);
  });
  nextButton.addEventListener('click', () => {
    //shwo next img of current album
    currentIndex = (currentIndex + 1) % imgList.length;
    showImgAtIndex(currentIndex);
  });

  //mark this model is already registered
  modelElement.dataset.registered = 'true';
}
