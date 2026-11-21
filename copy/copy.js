// Копирование email
function copyToClipboard(element) {
    const email = element.dataset.email;

    navigator.clipboard.writeText(email).then(function () {
        const tooltip = element.querySelector('.tooltip');
        tooltip.classList.add('show-tooltip');

        setTimeout(() => {
            tooltip.classList.remove('show-tooltip');
        }, 2000);

    }, function (err) {
        console.error('Не удалось скопировать: ', err);
        alert('Не удалось скопировать email');
    });
}