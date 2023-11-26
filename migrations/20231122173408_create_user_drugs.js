exports.up = function(knex) {
  return knex.schema.createTable('user_drugs', table => {
      table.increments('id').primary();
      table.integer('user_id').unsigned().notNullable();
      table.foreign('user_id').references('users.id');
      table.string('drug_name').notNullable();
      table.string('rxNormId');
      table.string('strength');
      table.string('reminder_frequency');
      table.text('reminder_times');
      table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('user_drugs');
};
