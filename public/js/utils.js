// ============= DISEÑO ======================================================================
// aplica un radio equivalente a 1/7 del largo más corto.
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

// aplica un radio a todo los elementos de la lista dada.
export function radiusToAll(list, measurement=7) {
    for(const item of list) radius(item, measurement);
}
// ===========================================================================================




// ================= COMPORTAMIENTO ==========================================================
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

// mostrar|ocultar el elemento.
export function showElement(e) { if(e) e.classList.remove('hidden'); }
export function hideElement(e) { if(e) e.classList.add('hidden'); }

// actualiza el estado en el grupo completo.
export function updateSelectState(o) {
    if (o.select.value) {
        o.label.classList.add('active', 'correct');
        o.select.classList.add('correct');
        o.icon.classList.remove('hidden');
        o.state = true;
    } else {
        o.label.classList.remove('correct', 'active');
        o.select.classList.remove('correct');
        o.icon.classList.add('hidden');
        o.state = false;

        // Quita "active" solo si no tiene foco
        if (document.activeElement !== o.select) {
            o.label.classList.remove('active');
        }
    }
}

// actualiza el estado en el grupo completo.
export function updateInputState(o, condition) {
    if(o.input.value==='') {
        o.label.classList.remove('correct', 'error');
        o.input.classList.remove('correct', 'error');
        o.icon.classList.add('hidden');
        o.p.classList.add('hidden');
        o.state = false;
        return;
    }

    if(condition.regex.test(o.input.value)) {
        o.label.classList.remove('error');
        o.label.classList.add('correct');
        o.input.classList.remove('error');
        o.input.classList.add('correct');
        o.icon.classList.remove('hidden', 'fa-times');
        o.icon.classList.add('fa-check');
        o.p.classList.add('hidden');
        o.state = true;
    } else {
        o.label.classList.remove('correct');
        o.label.classList.add('error');
        o.input.classList.remove('correct');
        o.input.classList.add('error');
        o.icon.classList.remove('hidden', 'fa-check');
        o.icon.classList.add('fa-times');
        o.p.textContent = condition.error_message;
        o.p.classList.remove('hidden');
        o.state = false;
    }
}
// ===========================================================================================




// ================= CONTROL DE DATOS ========================================================
export function checkObjectState(object) {
    const isInputType = 'input' in Object.values(object)[0];

    for (const key in object) {
        const item = object[key];
        const required = isInputType
        ? item.input.required
        : item.select.required;

        if (required && !item.state) return false;
    }

    return true;
}
// ===========================================================================================