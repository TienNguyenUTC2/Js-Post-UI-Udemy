import postApi from './api/postApi';
import { initPagination, initSearch, renderPostList, renderPagination, toast } from './utils';

async function handleFilerChange(filterName, filterValue) {
  const url = new URL(window.location);
  if (filterName) url.searchParams.set(filterName, filterValue);
  //reset page
  if (filterName === 'title_like') url.searchParams.set('_page', 1);
  history.pushState({}, '', url);

  //fetch API
  //re-render post list
  const { data, pagination } = await postApi.getAll(url.searchParams);
  renderPostList('postList', data);
  renderPagination('pagination', pagination);
}

function registerPostDeleteEvent() {
  document.addEventListener('post-delete', async (event) => {
    try {
      const post = event.detail;
      const message = `Are you sure to remoev post "${post.title}" ?`;
      if (window.confirm(message)) {
        await postApi.remove(post.id);
        await handleFilerChange();

        toast.success('Remove post successfully !');
      }
    } catch (error) {
      console.log('faild to remove post', error);
      toast.error(error.message);
    }

    //call API to remove post by id
    //refetch data
  });
}

(async () => {
  try {
    const url = new URL(window.location);

    //update search params if needed
    if (!url.searchParams.get('_page')) url.searchParams.set('_page', 1);
    if (!url.searchParams.get('_limit')) url.searchParams.set('_limit', 6);
    history.pushState({}, '', url);

    const queryParams = url.searchParams;

    registerPostDeleteEvent();

    initPagination({
      elementId: 'pagination',
      defaultParams: queryParams,
      onchange: (page) => handleFilerChange('_page', page),
    });
    initSearch({
      elementId: 'searchInput',
      defaultParams: queryParams,
      onchange: (value) => handleFilerChange('title_like', value),
    });
    const { data, pagination } = await postApi.getAll(queryParams);

    renderPostList('postList', data);
    renderPagination('pagination', pagination);
  } catch (error) {
    console.log('get all failed', error);
  }
})();
