const orderModal = document.getElementById('order-modal');
const orderForm = document.getElementById('order-form');
const orderProductInput = document.getElementById('order-product');
const orderProductName = document.getElementById('order-product-name');
const orderError = document.getElementById('order-error');
const orderSuccess = document.getElementById('order-success');
const orderButtons = document.querySelectorAll('[data-product]');
const closeButtons = [document.getElementById('order-close'), document.getElementById('order-cancel')];
const ipButton = document.getElementById('ip-copy');
const agreeCheckbox = document.getElementById('order-agree');
const submitButton = document.getElementById('order-submit');
const cartCount = document.getElementById('cart-count');
const cartList = document.getElementById('cart-list');
const cartEmpty = document.getElementById('cart-empty');
const cartTotalRow = document.getElementById('cart-total-row');
const cartTotal = document.getElementById('cart-total');
const cartOrder = document.getElementById('cart-order');
const CART_KEY = 'lightworld-cart';
const quickView = document.getElementById('quick-view');
const quickIcon = document.getElementById('quick-view-icon');
const quickTitle = document.getElementById('quick-view-title');
const quickPrice = document.getElementById('quick-view-price');
const quickContent = document.getElementById('quick-view-content');
const quickCart = document.getElementById('quick-view-cart');
const quickClose = document.getElementById('quick-view-close');

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    return [];
  }
}

function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (error) {
    return;
  }
}

function updateCartCount() {
  if (!cartCount) {
    return;
  }
  const total = loadCart().reduce(function (sum, item) {
    return sum + item.qty;
  }, 0);
  cartCount.textContent = total;
  cartCount.hidden = total === 0;
}

function addToCart(id, name, price) {
  const cart = loadCart();
  const item = cart.find(function (entry) {
    return entry.id === id;
  });
  if (item) {
    item.qty += 1;
  } else {
    cart.push({ id: id, name: name, price: price, qty: 1 });
  }
  saveCart(cart);
  updateCartCount();
}

function renderCart() {
  const cart = loadCart();
  cartList.innerHTML = '';
  let sum = 0;

  cart.forEach(function (item) {
    sum += item.price * item.qty;
    const row = document.createElement('li');
    row.className = 'cart__item';
    row.innerHTML =
      '<span class="cart__name"></span>' +
      '<div class="cart__qty">' +
      '<button class="cart__qty-button" type="button" data-action="minus" aria-label="Убрать одну штуку">−</button>' +
      '<span class="cart__qty-value">' + item.qty + '</span>' +
      '<button class="cart__qty-button" type="button" data-action="plus" aria-label="Добавить ещё одну">+</button>' +
      '</div>' +
      '<span class="cart__price">' + item.price * item.qty + ' руб.</span>' +
      '<button class="cart__remove" type="button" data-action="remove" aria-label="Удалить из корзины">×</button>';
    row.querySelector('.cart__name').textContent = item.name;
    row.dataset.id = item.id;
    cartList.appendChild(row);
  });

  const isEmpty = cart.length === 0;
  cartEmpty.hidden = !isEmpty;
  cartList.hidden = isEmpty;
  cartTotalRow.hidden = isEmpty;
  cartOrder.hidden = isEmpty;
  cartTotal.textContent = sum;
}

updateCartCount();

document.addEventListener('click', function (event) {
  const button = event.target.closest('[data-cart-id]');
  if (!button) {
    return;
  }
  addToCart(button.dataset.cartId, button.dataset.cartName, Number(button.dataset.cartPrice));
  button.textContent = 'Добавлено';
  setTimeout(function () {
    button.textContent = 'В корзину';
  }, 1200);
});

if (cartList) {
  renderCart();

  cartList.addEventListener('click', function (event) {
    const button = event.target.closest('button');
    if (!button) {
      return;
    }
    const id = button.closest('.cart__item').dataset.id;
    let cart = loadCart();
    const item = cart.find(function (entry) {
      return entry.id === id;
    });

    if (button.dataset.action === 'plus') {
      item.qty += 1;
    } else if (button.dataset.action === 'minus') {
      item.qty -= 1;
    }
    if (button.dataset.action === 'remove' || item.qty === 0) {
      cart = cart.filter(function (entry) {
        return entry.id !== id;
      });
    }

    saveCart(cart);
    updateCartCount();
    renderCart();
  });
}

if (orderModal) {
  function openOrder(productName) {
    orderForm.reset();
    submitButton.disabled = true;
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
}

if (orderForm) {
  agreeCheckbox.addEventListener('change', function () {
    submitButton.disabled = !agreeCheckbox.checked;
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

    if (cartList) {
      saveCart([]);
      updateCartCount();
      renderCart();
      cartOrder.hidden = false;
    }
  });
}

if (quickView) {
  function openQuickView(card) {
    const details = card.querySelector('.details');
    const cartButton = card.querySelector('[data-cart-id]');
    quickIcon.src = card.querySelector('.product-card__icon').src;
    quickTitle.textContent = card.querySelector('.product-card__title').textContent;
    quickPrice.innerHTML = card.querySelector('.product-card__price').innerHTML;
    quickContent.innerHTML = details.innerHTML;
    quickCart.hidden = cartButton === null;
    if (cartButton) {
      quickCart.dataset.cartId = cartButton.dataset.cartId;
      quickCart.dataset.cartName = cartButton.dataset.cartName;
      quickCart.dataset.cartPrice = cartButton.dataset.cartPrice;
    }
    quickView.showModal();
  }

  document.querySelectorAll('.product-card--interactive').forEach(function (card) {
    card.addEventListener('click', function (event) {
      if (event.target.closest('[data-cart-id]')) {
        return;
      }
      openQuickView(card);
    });

    card.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' && event.target === card) {
        openQuickView(card);
      }
    });
  });

  quickClose.addEventListener('click', function () {
    quickView.close();
  });

  quickView.addEventListener('click', function (event) {
    if (event.target === quickView) {
      quickView.close();
    }
  });
}

const filtersForm = document.getElementById('filters');

if (filtersForm) {
  const catalogGrid = document.querySelector('.products--catalog');
  const catalogCards = Array.from(catalogGrid.querySelectorAll('.product-card'));
  const catalogEmpty = document.getElementById('catalog-empty');

  function applyFilters() {
    const query = filtersForm.elements.search.value.trim().toLowerCase();
    const category = filtersForm.elements.category.value;
    const sort = filtersForm.elements.sort.value;
    let visibleCount = 0;

    catalogCards.forEach(function (card) {
      const title = card.querySelector('.product-card__title').textContent.toLowerCase();
      const isMatch = (category === 'all' || card.dataset.category === category) && title.includes(query);
      card.hidden = !isMatch;
      if (isMatch) {
        visibleCount += 1;
      }
    });

    const sortedCards = catalogCards.slice();
    if (sort === 'cheap') {
      sortedCards.sort(function (a, b) {
        return a.dataset.price - b.dataset.price;
      });
    } else if (sort === 'expensive') {
      sortedCards.sort(function (a, b) {
        return b.dataset.price - a.dataset.price;
      });
    }
    sortedCards.forEach(function (card) {
      catalogGrid.appendChild(card);
    });

    catalogEmpty.hidden = visibleCount > 0;
  }

  filtersForm.addEventListener('input', applyFilters);

  filtersForm.addEventListener('submit', function (event) {
    event.preventDefault();
  });

  filtersForm.addEventListener('reset', function () {
    setTimeout(applyFilters, 0);
  });
}

const tagButtons = document.querySelectorAll('.tags__button');

if (tagButtons.length > 0) {
  const posts = document.querySelectorAll('.post');

  tagButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const tag = button.dataset.tag;

      tagButtons.forEach(function (item) {
        const isActive = item === button;
        item.classList.toggle('tags__button--active', isActive);
        item.setAttribute('aria-pressed', isActive);
      });

      posts.forEach(function (post) {
        post.hidden = tag !== 'all' && post.dataset.tag !== tag;
      });
    });
  });
}

const revealItems = document.querySelectorAll('[data-reveal]');

if (revealItems.length > 0 && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal--visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealItems.forEach(function (item) {
    item.classList.add('reveal');
    revealObserver.observe(item);
  });
}

if (ipButton) {
  ipButton.addEventListener('click', function () {
    const hint = ipButton.querySelector('.ip-copy__hint');
    navigator.clipboard.writeText('play.lightworld.su').then(function () {
      hint.textContent = 'Скопировано';
    }).catch(function () {
      hint.textContent = 'Ошибка';
    });
  });
}
