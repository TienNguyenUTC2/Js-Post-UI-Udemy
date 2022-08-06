import postApi from './api/postApi';
import { initPostForm, toast } from './utils';

function removeUnusedFields(formValues) {
  const payload = { ...formValues };
  //imageSource =picsum -> remove image
  //imageSource ='upload'-> remove imageUrl

  if (payload.imageSource === 'upload') {
    delete payload.imageUrl;
  } else {
    delete payload.image;
  }

  //finally
  delete payload.imageSource;

  //remove id if it's  add mode
  if (!payload.id) delete payload.id;
  return payload;
}

function jsonToFromData(jsonObject) {
  const formData = new FormData();

  for (const key in jsonObject) {
    formData.set(key, jsonObject[key]);
  }

  return formData;
}
async function handlePostFormSubmmit(formValues) {
  try {
    const payload = removeUnusedFields(formValues);
    const formData = jsonToFromData(payload);
    // console.log('submit', { formValues, payload });

    //check add/edit mode
    // S1: based on search params (check id)
    // S2: check id in formValues
    // let savedPost = null;
    // if (formValues.id) {
    //   savedPost = await postApi.update(formValues);
    // } else {
    //   savedPost = await postApi.add(formValues);
    // }

    const savedPost = formValues.id
      ? await postApi.updateFormData(formData)
      : await postApi.addFormData(formData);
    //call API
    //show success message
    toast.success('save post successfully!');
    //redirect to detail page
    setTimeout(() => {
      window.location.assign(`/post-detail.html?id=${savedPost.id}`);
    }, 1500);
  } catch (error) {
    console.log('faild to save post', error);
    toast.error(`Error: ${error.message}`);
  }
}

(async () => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const postId = searchParams.get('id');

    let defaultValues = postId
      ? await postApi.getById(postId)
      : {
          title: '',
          description: '',
          author: '',
          imageUrl: '',
        };
    initPostForm({
      formId: 'postForm',
      defaultValues: defaultValues,
      onSubmit: handlePostFormSubmmit,
    });
  } catch (error) {
    console.log('failed to fetch post details');
  }
})();
