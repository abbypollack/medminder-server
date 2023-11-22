exports.seed = function(knex) {
  return knex('users').del()
    .then(function () {
      return knex('users').insert([
        {
          googleId: '123', 
          name: 'John Doe', 
          email: 'johndoe@example.com', 
          password: 'hashed_password', 
          avatar_url: 'http://example.com/avatar.jpg',
          phone: '1234567890'
        },
      ]);
    });
};
