import { resetForm, submitForm } from '/js/formEvents.js';

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

// aplica radius a todos los elementos visibles de los formularios
export function radiusToEntireForm(form) {
    const labels = form.querySelectorAll('label');
    const inputs = form.querySelectorAll('input');
    const selects = form.querySelectorAll('select');
    const buttons = form.querySelectorAll('button');

    if(form) radius(form, 20);
    if(labels) radiusToAll(labels);
    if(inputs) radiusToAll(inputs);
    if(selects) radiusToAll(selects);
    if(buttons) radiusToAll(buttons);
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

export function fillObjectStates(form) {
    const inputs = form.querySelectorAll('input');
    const selects = form.querySelectorAll('select');
    if(inputs) fillInputStates(inputs);
    if(selects) fillSelectStates(selects);
}

function fillInputStates(inputs) {
    const groups = [];
    inputs.forEach( i => groups.push( i.parentElement.parentElement ));

    groups.forEach( g => {
        const input = g.querySelector('input');
        const label = g.querySelector('label');
        const icon = g.querySelector('i');
        const errorMessage = g.querySelector('p.message');
        const originalErrorMessage = errorMessage.textContent;
        const regex =  parseRegex(g.querySelector('p.regex').textContent.trim());
        inputStates[input.id] = {
            state: false, input, label, icon, errorMessage, originalErrorMessage, regex
        };

        input.addEventListener('input', () => {
            updateInputState(inputStates[input.id]);
            if(input.id === 'password') {
                inputStates['re-password'].regex = new RegExp(`^${input.value}$`);
                updateInputState(inputStates['re-password']);
                inputStates['token'].state = true;
            }
        });
    });
}

function fillSelectStates(selects) {
    const groups = [];
    selects.forEach( s => groups.push( s.parentElement ));

    groups.forEach( g => {
        const select = g.querySelector('select');
        const label = g.querySelector('label');
        const icon = g.querySelector('i');
        selectStates[select.id] = {
            state:false, select, label, icon
        }

        select.addEventListener('focus', () => label.classList.add('active'));
        select.addEventListener('blur', () => updateSelectState(selectStates[select.id]));
        select.addEventListener('change', () => updateSelectState(selectStates[select.id]));

        
        updateSelectState(selectStates[select.id]);
    });
}

// actualiza el estado en el grupo completo.
export function updateSelectState(o) {
    if (o.select.value) {
        o.label.classList.add('active', 'correct');
        o.select.classList.add('correct');
        showElement(o.icon);
        o.state = true;
    } else {
        o.label.classList.remove('correct', 'active');
        o.select.classList.remove('correct');
        hideElement(o.icon);
        o.state = false;

        // Quita "active" solo si no tiene foco
        if (document.activeElement !== o.select) {
            o.label.classList.remove('active');
        }
    }
}

// actualiza el estado en el grupo completo.
export function updateInputState(o) {
    if(o.input.value==='') {
        o.label.classList.remove('correct', 'error');
        o.input.classList.remove('correct', 'error');
        hideElement(o.icon);
        hideElement(o.errorMessage);
        o.state = false;
        return;
    }

    if(o.regex.test(o.input.value)) {
        o.label.classList.remove('error');
        o.label.classList.add('correct');
        o.input.classList.remove('error');
        o.input.classList.add('correct');
        o.icon.classList.remove('hidden', 'fa-times');
        o.icon.classList.add('fa-check');
        hideElement(o.errorMessage);
        o.state = true;
    } else {
        o.label.classList.remove('correct');
        o.label.classList.add('error');
        o.input.classList.remove('correct');
        o.input.classList.add('error');
        o.icon.classList.remove('hidden', 'fa-check');
        o.icon.classList.add('fa-times');
        o.errorMessage.textContent = o.originalErrorMessage;
        showElement(o.errorMessage);
        o.state = false;
    }
}
// ===========================================================================================




// ================= CONTROL DE DATOS ========================================================
export function parseRegex(reg) {
    const m = reg.match(/^\/(.+)\/([a-z]*)$/i);
    if(!m) throw new Error(`Formato de RegExp inválido: ${reg}`);
    return new RegExp(m[1], m[2]);
}

export function checkObjectState(object, form) {
    if(!object || Object.keys(object).length === 0) return true;

    const names = Array.from(form.elements)
        .map(e => e.name)
        .filter(name => name);

    const firstItem = Object.values(object)[0];
    const isInputType = firstItem && 'input' in firstItem;

    for (const key in object) {
        if(names.includes(key)) {
            const item = object[key];
            const required = isInputType
            ? item.input.required
            : item.select.required;

            if (required && !item.state) return false;
        }
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
export function formHandler(form) {
    if(!window.inputStates) window.inputStates = {};
    if(!window.selectStates) window.selectStates = {};
    
    radiusToEntireForm(form);
    fillObjectStates(form);
    form.addEventListener('submit', (e) => submitForm(e, form));
    form.addEventListener('reset', () => resetForm());
}