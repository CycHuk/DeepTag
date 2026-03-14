document.body.addEventListener("htmx:afterSwap", function(e) {
    if (e.target.id === "labels-container") {
        const total = document.querySelector("[name='labels_formset-TOTAL_FORMS']")
        total.value = parseInt(total.value) + 1
    }
})

function removeItemForm(index) {
    const item = document.getElementById(`labels_formset-${index}`);

    item.classList.add('hidden')
}