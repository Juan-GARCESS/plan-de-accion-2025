import bcrypt from "bcryptjs";

const hash = "$2a$10$z0vX.kmF3QmvT9YbIY3Z2eB2N4L3FhT5JGZDz/.oZQKPOI4sZ8B8W"; // hash de Admin123
const password = "Admin123";

bcrypt.compare(password, hash).then(result => {
  console.log("¿Coincide la contraseña?", result);
}).catch(err => console.error(err));
