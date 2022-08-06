import { randomNumber, setBackgroundImage, setFielValue, setTextContent } from './common';
import * as yup from 'yup';

const ImageSource = {
  PICSUM: 'picsum',
  UPLOAD: 'upload',
};

function setFormValue(form, formValues) {
  setFielValue(form, '[name="title"]', formValues?.title);
  setFielValue(form, '[name="author"]', formValues?.author);
  setFielValue(form, '[name="description"]', formValues?.description);
  setFielValue(form, '[name="imageUrl"]', formValues?.imageUrl); //hiden field
  setBackgroundImage(document, '#postHeroImage', formValues?.imageUrl);
}

function getFormValues(form) {
  const formValues = {};

  //S1: query each input and ad to values object
  // ['title', 'author', 'description', 'imageUrl'].forEach((name) => {
  //   const field = form.querySelector(`[name="${name}"]`);
  //   if (field) formValues[name] = field.value;
  // });

  //S2 using form data
  const data = new FormData(form);
  for (const [key, value] of data) {
    formValues[key] = value;
  }
  return formValues;
}

function getPostSchema() {
  return yup.object().shape({
    title: yup.string().required('vui lòng ko bỏ trống '),
    author: yup
      .string()
      .required('vui lòng ko bỏ trống')
      .test(
        'ít nhất 2 từ',
        'vui lòng nhập 2 từ',
        (value) => value.split(' ').filter((x) => !!x && x.length >= 3).length >= 2
      ),
    description: yup.string(),
    imageSource: yup
      .string()
      .required('please select an image source')
      .oneOf([ImageSource.PICSUM, ImageSource.UPLOAD], 'invalid image source'),

    imageUrl: yup.string().when('imageSource', {
      is: ImageSource.PICSUM,
      then: yup
        .string()
        .required('Please random a background image')
        .url('Please enter a valid URL'),
    }),
    image: yup.mixed().when('imageSource', {
      is: ImageSource.UPLOAD,
      then: yup
        .mixed()
        .test('required', 'Please select an image to upload', (value) => Boolean(value?.name))
        .test('max-3mb', 'The image is too large (max 3mb)', (file) => {
          const fileSize = file?.size || 0;
          const MAX_SIZE = 1000 * 1024; //10kb
          return fileSize <= MAX_SIZE;
        }),
    }),
  });
}

function setFieldError(form, name, error) {
  const element = form.querySelector(`[name="${name}"]`);
  if (element) {
    element.setCustomValidity(error);
    setTextContent(element.parentElement, '.invalid-feedback', error);
  }
}

async function validatePostForm(form, formValues) {
  try {
    //reset previous errors
    ['title', 'author', 'imageUrl', 'imageSource', 'image'].forEach((name) =>
      setFieldError(form, name, '')
    );

    //start validation
    const schema = getPostSchema();
    await schema.validate(formValues, { abortEarly: false });
  } catch (error) {
    const errorLog = {};

    if (error.name === 'ValidationError' && Array.isArray(error.inner)) {
      for (const validdationError of error.inner) {
        const name = validdationError.path;

        if (errorLog[name]) continue;
        //set field error and mark as logged
        setFieldError(form, name, validdationError.message);
        errorLog[name] = true;
      }
    }
  }
  //add was-validated class to form element
  const isValid = form.checkValidity();
  if (!isValid) form.classList.add('was-validated');
  return isValid;
}

async function validateFormField(form, formValues, name) {
  try {
    //clear previous error
    setFieldError(form, name, '');

    const schema = getPostSchema();
    await schema.validateAt(name, formValues);
  } catch (error) {
    setFieldError(form, name, error.message);
  }
  const field = form.querySelector(`[name="${name}"]`);
  if (field && !field.checkValidity()) {
    field.parentElement.classList.add('was-validated');
  }
}

function showLoading(form) {
  const button = form.querySelector('[name="submit"]');

  if (button) {
    button.disabled = true;
    button.textContent = 'Saving...';
  }
}
function hideLoading(form) {
  const button = form.querySelector('[name="submit"]');

  if (button) {
    button.disabled = false;
    button.textContent = 'Save';
  }
}

function initRandomImage(form) {
  const randomButton = document.getElementById('postChangeImage');
  if (!randomButton) return;
  randomButton.addEventListener('click', () => {
    //random id
    //build URL
    const imageUrl = `https://picsum.photos/id/${randomNumber(1000)}/1368/400`;
    //set imageUrl input+bg
    setFielValue(form, '[name="imageUrl"]', imageUrl); //hiden field
    setBackgroundImage(document, '#postHeroImage', imageUrl);
  });
}

function renderImageSourceControl(form, selectedValue) {
  const controlList = form.querySelectorAll('[data-id="imageSource"]');

  controlList.forEach((control) => {
    control.hidden = control.dataset.imageSource !== selectedValue;
  });
}

function initRadioImageSource(form) {
  const radioList = form.querySelectorAll('[name="imageSource"]');
  radioList.forEach((radio) => {
    radio.addEventListener('change', (event) => renderImageSourceControl(form, event.target.value));
  });
}

function initUploadImage(form) {
  const uploadImage = form.querySelector('[name="image"]');
  if (!uploadImage) return;

  uploadImage.addEventListener('change', (event) => {
    // console.log('selected file', event.target.files[0]);
    //get selected file
    //preview file
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setBackgroundImage(document, '#postHeroImage', imageUrl);

      validateFormField(
        form,
        {
          imageSource: ImageSource.UPLOAD,
          image: file,
        },
        'image'
      );
    }
  });
}

function initValidationOnChange(form) {
  ['title', 'author'].forEach((name) => {
    const field = form.querySelector(`[name="${name}"]`);
    if (field) {
      field.addEventListener('input', (event) => {
        const newValue = event.target.value;
        validateFormField(form, { [name]: newValue }, name);
      });
    }
  });
}
export function initPostForm({ formId, defaultValues, onSubmit }) {
  const form = document.getElementById(formId);
  if (!form) return;
  setFormValue(form, defaultValues);

  let submiting = false;
  setFormValue(form, defaultValues);
  //init event
  initRandomImage(form);
  initRadioImageSource(form);
  initUploadImage(form);
  initValidationOnChange(form);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (submiting) {
      return;
    }
    showLoading(form);
    submiting = true;
    //get form values
    const formValues = getFormValues(form);
    formValues.id = defaultValues.id;
    //validation
    //if vaild trigger submit callback
    //otherwise,show validation errors
    const isValid = await validatePostForm(form, formValues);
    if (isValid) await onSubmit?.(formValues);

    //always hide loading
    hideLoading(form);
    submiting = false;
  });
}
