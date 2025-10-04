// applies a radius equivalent to 1/5 of the shorter length
// between its height and its width.
export function radius(e) {
    const smaller = e.offsetHeight<e.offsetWidth
        ? e.offsetHeight
        : e.offsetWidth;
    
    e.style.borderRadius = (smaller/5)+ "px";
}

// ajusts the three main elements to correctly fill the full screen.
export function fitToScreen(header, main, footer) {
    const headerHeight=header.offsetHeight;
    const footerHeight=footer.offsetHeight;
    const vh=window.innerHeight;

    main.style.marginTop = headerHeight+ "px";
    main.style.minHeight = (vh-(headerHeight+footerHeight))+ "px";
    main.textContent = main.style.minHeight; // delete this.
}