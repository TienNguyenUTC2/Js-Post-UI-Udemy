import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';
export const toast = {
  info(message) {
    Toastify({
      text: message,
      duration: 3000,
      gravity: 'top', // `top` or `bottom`
      position: 'right', // `left`, `center` or `right`
      close: true,
      style: {
        background: '#29b6f6',
      },
      onClick: function () {}, // Callback after click
    }).showToast(message);
  },

  success(message) {
    Toastify({
      text: message,
      duration: 3000,
      gravity: 'top', // `top` or `bottom`
      position: 'right', // `left`, `center` or `right`
      close: true,
      style: {
        background: '#66bb6a',
      },
      onClick: function () {}, // Callback after click
    }).showToast();
  },

  error(message) {
    Toastify({
      text: message,
      duration: 3000,
      gravity: 'top', // `top` or `bottom`
      position: 'right', // `left`, `center` or `right`
      close: true,
      style: {
        background: '#f44336',
      },
      onClick: function () {}, // Callback after click
    }).showToast();
  },
};
