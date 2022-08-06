import dayjs from 'dayjs';
import postApi from './api/postApi';
import { registerLightbox, setTextContent } from './utils';

function renderPostDetail(post) {
  if (!post) return;

  //render title
  setTextContent(document, '#postDetailTitle', post.title);
  //render des
  setTextContent(document, '#postDetailDescription', post.description);
  //render author
  setTextContent(document, '#postDetailAuthor', post.author);
  //render updateAt
  setTextContent(
    document,
    '#postDetailTimeSpan',
    `- ${dayjs(post.updatedAt).format('DD/MM/YYYY HH:mm')}`
  );
  //render img
  const heroImg = document.getElementById('postHeroImage');
  if (heroImg) {
    heroImg.style.backgroundImage = `url(${post.imageUrl})`;
    heroImg.addEventListener('error', () => {
      heroImg.style.backgroundImage = 'https://via.placeholder.com/1368x400?text=thumbnail';
    });
  }
  //render edit page link
  const editPageLink = document.getElementById('goToEditPageLink');
  if (editPageLink) {
    editPageLink.href = `/add-edit-post.html?id=${post.id}`;
    //   editPageLink.textContent = 'Edit Post';
    editPageLink.innerHTML = '<i class="fas fa-edit"></i> Edit Post';
  }
}

(async () => {
  registerLightbox({
    modelId: 'lightbox',
    imgSelector: 'img[data-id="lightboxImg"]',
    prevSelector: 'button[data-id="lightboxPrev"]',
    nextSelector: 'button[data-id="lightboxNext"]',
  });
  //get post id from URL
  //fetch post detail API
  //render post detail
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const postId = searchParams.get('id');
    if (!postId) {
      console.log('post not found');
      return;
    }
    const post = await postApi.getById(postId);
    renderPostDetail(post);
  } catch (error) {
    console.log('failed to fetch post detail', error);
  }
})();
