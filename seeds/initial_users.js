const casual = require('casual');

const users = [];
for (let i = 0; i < 10; i++) {

  users.push({
    googleId: casual.uuid,
    firstName: casual.first_name,
    lastName: casual.last_name,
    email: casual.email,
    password: casual.password,
    phone: casual.phone
  });
}

exports.seed = function(knex) {
  return knex('users').del()
    .then(function () {
      return knex('users').insert(users);
    });
};
