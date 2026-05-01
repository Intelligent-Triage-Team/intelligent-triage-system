const bcrypt = require("bcrypt");

bcrypt.hash("adminyoseph21", 10).then(hash => {
  console.log("ADMIN HASH:");
  console.log(hash);
});