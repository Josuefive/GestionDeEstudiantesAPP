// hash.js
const bcrypt = require('bcrypt');
const saltRounds = 10;

const passEstudiante = 'estudiante123';
const passProfe1 = 'admin123';
const passProfe2 = 'profesor123';

// Hashear la contraseña de estudiante
bcrypt.hash(passEstudiante, saltRounds, (err, hashEstudiante) => {
    if (err) throw err;
    console.log("Hash para 'estudiante123':");
    console.log(hashEstudiante);
    console.log("\n");
});

// Hashear la contraseña de profe 1
bcrypt.hash(passProfe1, saltRounds, (err, hashProfe1) => {
    if (err) throw err;
    console.log("Hash para 'admin123':");
    console.log(hashProfe1);
    console.log("\n");
});

// Hashear la contraseña de profe 2
bcrypt.hash(passProfe2, saltRounds, (err, hashProfe2) => {
    if (err) throw err;
    console.log("Hash para 'profesor123':");
    console.log(hashProfe2);
    console.log("\n");
});