if (String(window.location).includes('replit') && String(window.location).includes('?newRepl')) {
    document.querySelector('[data-cy="header-new-repl-btn"]').click()
    setTimeout(function() {
        // document.querySelector('[data-cy="create-repl-title-input"]').disabled = false
        document.querySelector('[data-cy="create-repl-title-input"]').placeholder = 'Name your DevPortal Repl'
    }, 400)
    setTimeout(function() {
        document.querySelector('[data-cy="create-repl-title-input"]').placeholder = 'Name your DevPortal Repl'
    }, 1000)
}