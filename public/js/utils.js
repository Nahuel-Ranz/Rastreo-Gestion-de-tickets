// aplica un radio equivalente a 1/7 del largo más corto
// entre la altura y la anchura.
export function radius(e, measurement=7) {
    const smaller = e.offsetHeight<e.offsetWidth
        ? e.offsetHeight
        : e.offsetWidth;
    e.style.borderRadius = (smaller/measurement)+ "px";
}

// ajusta los 3 elementos principales para ocupar correctamente la pantalla completa.
export function fitToScreen(header, main, footer) {
    const headerHeight=header.offsetHeight;
    const footerHeight=footer.offsetHeight;
    const vh=window.innerHeight;

    main.style.marginTop = headerHeight+ "px";
    main.style.minHeight = (vh-(headerHeight+footerHeight))+ "px";
}

// cierra todos los menus desplegados en la página.
export function closeDropdowns() {
    document.querySelectorAll('.dropdownList').forEach(list => list.classList.add('hidden'));
}

// closes all dropdown menus except the one indicated.
export function closeDropdownsExcept(list) {
    document.querySelectorAll('.dropdownList').forEach(l => {
        if(list !== l) l.classList.add('hidden');
    });
}

// aplica un radio a todo los elementos de la lista dada.
export function radiusToAll(list, measurement=7) {
    for(const item of list) radius(item, measurement);
}

// abre modal.
export function showElement(id) {
    const modal = document.getElementById(id);
    if(modal) modal.classList.remove('hidden');
}

// cierra modal
export function hideElement(id) {
    const modal = document.getElementById(id);
    if(modal) modal.classList.add('hidden');
}