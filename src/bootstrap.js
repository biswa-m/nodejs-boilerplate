const User = require("./models/user");

const createAdmin = async () => {
  // eslint-disable-next-line consistent-return
  User.findOne({ role: "admin" }, (err, res) => {
    if (err) {
      debug("error finding admin user \n", err);
    } else {
      if (res) {
        debug("admin user exists \n Admin Email ", res.email, "\n");

        return true;
      }

      const admin = new User({
        email: "admin@myapp.com",
        first_name: "Admin",
        is_verified: true,
        last_name: "User",
        password: "SJF9230lslf",
        role: "admin",
      });

      return admin
        .save()
        .then((response) => {
          debug("Admin user created \n", JSON.stringify(response), "\r\n");

          return true;
        })
        .catch((e) => {
          debug("Error creating admin user", e);

          return true;
        });
    }
  });
};

module.exports = {
  createAdmin,
};
