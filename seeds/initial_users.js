const casual = require('casual');

const users = [];
for (let i = 0; i < 10; i++) {
  users.push({
    googleId: casual.uuid,      
    name: casual.full_name,    
    email: casual.email,        
    password: casual.password,  
    avatar_url: casual.url,     
    phone: casual.phone        
  });
}

exports.seed = function(knex) {
  return knex('users').del()
    .then(function () {
      return knex('users').insert(users);
    });
};
