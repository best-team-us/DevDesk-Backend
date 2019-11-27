exports.up = function(knex) {
    return knex.schema.createTable('helpers_tickets', tbl => {
        tbl.increments();
        tbl.integer('helper_id')
            .unsigned()
            .notNullable()
            .references('id')
            .inTable('users')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        tbl.integer('ticket_id')
            .unsigned()
            .notNullable()
            .unique()
            .references('id')
            .inTable('tickets')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('helpers_tickets');
};
