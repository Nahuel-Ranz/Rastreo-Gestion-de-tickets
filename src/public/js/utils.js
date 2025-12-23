// ============= DISEÑO ======================================================================
// aplica un radio equivalente a 1/7 del largo más corto.
export function radius(e, measurement=7) {
    const smaller = e.offsetHeight<e.offsetWidth
        ? e.offsetHeight
        : e.offsetWidth;
    e.style.borderRadius = (smaller/measurement)+ "px";
}

// aplica un radio a todo los elementos de la lista dada.
export function radiusToAll(list, measurement=7) {
    for(const item of list) radius(item, measurement);
}

// ajusta los 3 elementos principales para ocupar correctamente la pantalla completa.
export function fitToScreen(header, main, footer) {
    const headerHeight=header.offsetHeight;
    const footerHeight=footer.offsetHeight;
    const vh=window.innerHeight;

    main.style.marginTop = headerHeight+ "px";
    main.style.minHeight = (vh-(headerHeight+footerHeight))+ "px";
}

// ajusta los 3 elementos principales para ocupar correctamente la pantalla completa.
export function adjustModal(modal, header, main, footer) {
    const headerHeight=header.offsetHeight;
    const footerHeight=footer.offsetHeight;
    const modalHeight=modal.offsetHeight;

    main.style.marginTop = headerHeight+ "px";
    main.style.marginBottom = footerHeight+ "px";
    main.style.minHeight = (modalHeight-(headerHeight+footerHeight))+ "px";
}

// horizontal padding
export function hp(e) {
    e = getComputedStyle(e);
    return parseFloat(e.paddingLeft) + parseFloat(e.paddingRight);
}

// virtical padding
export function vp(e) {
    e = getComputedStyle(e);
    return parseFloat(e.paddingTop) + parseFloat(e.paddingBottom);
}

// ================= COMPORTAMIENTO ==========================================================
// cierra todos los menus desplegados en la página.
export function closeDropdowns() {
    document.querySelectorAll('.dropdownList').forEach(list => hideElement(list));
}

// closes all dropdown menus except the one indicated.
export function closeDropdownsExcept(list) {
    document.querySelectorAll('.dropdownList').forEach(l => {
        if(list !== l) hideElement(l);
    });
}

// mostrar|ocultar el elemento.
export function showElement(e) { if(e) e.classList.remove('hidden'); }
export function hideElement(e) { if(e) e.classList.add('hidden'); }

// crear|destruir elemento.
export function createElementAfter(e, newE) { if(e && newE) e.insertAdjacentHTML('afterend', newE); }
export function deleteElement(closer, container) {
    closer.addEventListener('click', () => container.remove());
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') container.remove();
    });
}

// ================= CONTROL DE DATOS ========================================================
export function parseRegex(reg) {
    const m = reg.match(/^\/(.+)\/([a-z]*)$/i);
    if(!m) throw new Error(`Formato de RegExp inválido: ${reg}`);
    return new RegExp(m[1], m[2]);
}

export function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}