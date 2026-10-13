const orderModal = document.getElementById('order-modal');
const orderForm = document.getElementById('order-form');
const orderProductInput = document.getElementById('order-product');
const orderProductName = document.getElementById('order-product-name');
const orderError = document.getElementById('order-error');
const orderSuccess = document.getElementById('order-success');
const orderButtons = document.querySelectorAll('[data-product]');
const closeButtons = [document.getElementById('order-close'), document.getElementById('order-cancel')];
const ipButton = document.getElementById('ip-copy');

function openOrder(productName) {
  orderForm.reset();
  orderForm.hidden = false;
  orderSuccess.hidden = true;
  orderError.textContent = '';
  orderForm.querySelectorAll('.form__input--invalid').forEach(function (field) {
    field.classList.remove('form__input--invalid');
  });
  orderProductInput.value = productName;
  orderProductName.textContent = productName;
  orderModal.showModal();
}

function closeOrder() {
  orderModal.close();
}

orderButtons.forEach(function (button) {
  button.addEventListener('click', function () {
    openOrder(button.dataset.product);
  });
});

closeButtons.forEach(function (button) {
  button.addEventListener('click', closeOrder);
});

orderModal.addEventListener('click', function (event) {
  if (event.target === orderModal) {
    closeOrder();
  }
});

orderForm.addEventListener('input', function (event) {
  event.target.classList.remove('form__input--invalid');
  orderError.textContent = '';
});

orderForm.addEventListener('submit', function (event) {
  event.preventDefault();
  let firstInvalid = null;

  Array.from(orderForm.elements).forEach(function (field) {
    if (field.willValidate && !field.checkValidity()) {
      field.classList.add('form__input--invalid');
      if (firstInvalid === null) {
        firstInvalid = field;
      }
    }
  });

  if (firstInvalid !== null) {
    orderError.textContent = 'Проверь поля, отмеченные красным: все обязательные, ник латиницей, телефон в формате +79001234567.';
    firstInvalid.focus();
    return;
  }

  orderForm.hidden = true;
  orderSuccess.hidden = false;
});

ipButton.addEventListener('click', function () {
  const hint = ipButton.querySelector('.ip-copy__hint');
  navigator.clipboard.writeText('play.lightworld.su').then(function () {
    hint.textContent = 'Скопировано';
  }).catch(function () {
    hint.textContent = 'Ошибка';
  });
});