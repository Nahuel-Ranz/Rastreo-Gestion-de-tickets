const pickr = document.getElementById('birth');
const inputs = document.getElementsByTagName('input');
const selected = document.querySelectorAll('.choices')

Object.keys(inputStates).forEach( key => {
    console.log(inputStates[key].state);
});

Object.keys(selectStates).forEach( key => {
    console.log(selectStates[key].state);
});