/**
 * Global Utilities for JobPortal
 */

/**
 * Show a themed toast notification
 * @param {string} msg - Message to display
 * @param {string} type - 's' (success), 'e' (error), 'i' (info)
 */
function toast(msg, type = 's') {
    const tc = document.getElementById('tc');
    if (!tc) return;

    const div = document.createElement('div');
    div.className = 'toast-i';
    
    let icon = 'bi-check-circle-fill';
    let color = 'var(--green)';
    
    if (type === 'e') {
        icon = 'bi-exclamation-triangle-fill';
        color = 'var(--red)';
    } else if (type === 'i') {
        icon = 'bi-info-circle-fill';
        color = 'var(--purple)';
    }

    div.innerHTML = `
        <i class="bi ${icon}" style="color: ${color}"></i>
        <span>${msg}</span>
    `;

    tc.appendChild(div);

    // Auto-remove after 4s
    setTimeout(() => {
        div.style.animation = 'fadeO .4s ease forwards';
        setTimeout(() => div.remove(), 400);
    }, 4000);
}

// Global escape for dynamic HTML content
function escapeHTML(str) {
    if (!str) return '';
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
}
