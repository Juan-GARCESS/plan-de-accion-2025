import bcrypt from "bcryptjs";

const password = "Admin123";

bcrypt.hash(password, 10).then(hash => {
  console.log("Hash generado:", hash);
});
