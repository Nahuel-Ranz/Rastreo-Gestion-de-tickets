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

// normalización de los datos del formulario
export function normalizeFormData(form) {
	const formData = new FormData(form);
	const entries = Object.fromEntries(formData.entries());
	const data = {};

	// Normaliza inputs y selects (text, email, number, select, textarea, file)
	for (const [key, value] of Object.entries(entries)) {
		
		if (typeof value === "string") {
			data[key] = value.trim() === "" ? null : value.trim();
			continue;
		}

		if (value instanceof File) {
			data[key] = value.size === 0 ? null : value;
			continue;
		}

		data[key] = value;
	}

	// CHECKBOXES y RADIOS (no siempre aparecen en FormData)
	const inputs = form.querySelectorAll("input");

	inputs.forEach(input => {
		if (!input.name) return; // ignorar inputs sin name

		if (input.type === "checkbox") {
			const group = form.querySelectorAll(`input[name="${input.name}"]`);
			if (group.length > 1) {
				// Varios checkboxes con el mismo name → array de valores seleccionados
				const checked = Array.from(group)
					.filter(i => i.checked)
					.map(i => i.value);
				data[input.name] = checked.length > 0 ? checked : null;
			} else {
				// Checkbox único → booleano
				data[input.name] = input.checked;
			}
		}

		if (input.type === "radio") {
			// Solo guarda el seleccionado o null
			const checked = form.querySelector(`input[name="${input.name}"]:checked`);
			data[input.name] = checked ? checked.value : null;
		}
	});

	// Conversión de strings a tipos reales, respetando el tipo de input
	for (const key in data) {
		const val = data[key];

		if (typeof val === "string") {
			const input = form.querySelector(`[name="${CSS.escape(key)}"]`);

			if (val === "true") data[key] = true;
			else if (val === "false") data[key] = false;
			else if (input && input.type === "number" && val.trim() !== "") {
				const parsed = Number(val);
				data[key] = isNaN(parsed) ? val : parsed;
			}
		}
	}

	return data;
}
// ===========================================================================================