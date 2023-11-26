exports.up = function(knex) {
    return knex.schema.createTable('user_drug_logs', table => {
        table.increments('id').primary();
        table.integer('user_drug_id').unsigned().notNullable();
        table.foreign('user_drug_id').references('user_drugs.id');
        table.boolean('taken').defaultTo(false);
        table.string('action').notNullable(); // 'taken' or 'skipped'
        table.datetime('action_time').defaultTo(knex.fn.now());
        table.timestamps(true, true);
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('user_drug_logs');
  };
  