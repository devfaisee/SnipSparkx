require('dotenv').config();
const bcrypt = require('bcryptjs');

const pass = "admin123";
const hash = process.env.ADMIN_PASS_HASH;
const user = process.env.ADMIN_USER;

console.log("Loaded User:", user);
console.log("Loaded Hash:", hash);

if (!hash) {
    console.error("Error: ADMIN_PASS_HASH is missing from environment.");
} else {
    bcrypt.compare(pass, hash).then(res => {
        console.log(`Password '${pass}' matches hash: ${res}`);
    }).catch(err => {
        console.error("Error comparing:", err);
    });
}
