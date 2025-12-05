import { radius, radiusToAll } from '/js/utils.js';

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

export function radiusToEntireForm(form) {
    radius(form, 20);
    radiusToAll(form.querySelectorAll('label'));
    radiusToAll(form.querySelectorAll('input'));
    radiusToAll(form.querySelectorAll('select'));
    radiusToAll(form.querySelectorAll('button'));
}