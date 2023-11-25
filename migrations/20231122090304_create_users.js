exports.up = function (knex) {
    return knex.schema.createTable('users', (table) => {
        table.increments('id').primary();
        table.string('googleId');
        table.string('firstName');
        table.string('lastName'); 
        table.string('email').unique().notNullable();
        table.string('password').notNullable();
        table.string('phone').unique().notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('users');
};
