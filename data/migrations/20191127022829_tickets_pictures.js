exports.up = function(knex) {
    return knex.schema.createTable('tickets_pictures', tbl => {
        tbl.increments();
        tbl.integer('ticket_id')
            .notNullable()
            .unsigned()
            .references('id')
            .inTable('tickets')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        tbl.varchar('url', 255)
            .notNullable()
            .unique();
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('tickets_pictures');
};
