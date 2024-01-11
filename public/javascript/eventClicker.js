// productClickHandler.js
document.addEventListener('DOMContentLoaded', function () {
    const productCards = document.querySelectorAll('.event');
    productCards.forEach(card => {
        card.addEventListener('click', function () {
            const productId = this.dataset.productId; // assuming you have a data attribute for product ID
            window.location.href = `/products/${productId}`;
        });
    });
});
