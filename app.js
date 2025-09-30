const express = require('express');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');
app.set('views', [
    path.join(__dirname, 'views/pages'),
    path.join(__dirname, 'views/partials')
]);

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended:true}));

//app.use('/leer', require('./routes/back_data'));
//app.use('/escribir', require('./routes/actions'));
app.use('/', require('./routes/views'));

app.use(require('./routes/error_handling'));

const PORT = /* process.env.PORT || */ 3000;
app.listen(PORT, () => {
    console.log(`Servidor: http://localhost:${PORT}`);
});