exports.up = function(knex) {
    return knex.schema.createTable('resolved_tickets', tbl => {
        tbl.increments();
        tbl.integer('author_id')
            .unsigned();
        tbl.integer('ticket_id')
            .unsigned()
            .notNullable()
            .unique()
        tbl.timestamp('resolved_at')
            .notNullable()
            .defaultTo(knex.fn.now());
        tbl.string('solution', 1000)
            .notNullable();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('resolved_tickets');
};