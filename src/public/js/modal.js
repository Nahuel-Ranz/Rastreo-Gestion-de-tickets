import { adjustModal, deleteElement, radius } from '/js/utils.js';
import { formHandler } from '/js/forms/formController.js';

export function initModal() {
    const container = document.getElementById('modal_container');
    if(!container) return;

    const modal = container.firstElementChild;
    closeModal(container, modal);
    layoutModal(modal);

    const modalForm = modal.querySelector('#modal_form');
    if(modalForm) formHandler(modalForm);
};

function closeModal(container, modal) {
    const closer = modal.firstElementChild;
    deleteElement(closer, container);
}

function layoutModal(modal) {
    const modalHeader=modal.querySelector('header');
    const modalBody=modal.querySelector('#modal_body');
    const modalFooter=modal.querySelector('footer');
    adjustModal(modal, modalHeader, modalBody, modalFooter);
    window.addEventListener('resize', () => {
        adjustModal(modal, modalHeader, modalBody, modalFooter);
    });

    radius(modal, 35);
}