// MEU-APP-CHAMADOS-BACKEND/src/database/migrations/[timestamp]_add_apr_fields_to_servicos.js
exports.up = function(knex) {
    return knex.schema.table('servicos', function(table) {
        table.timestamp('inicio_apr');
        table.json('apr_respostas').defaultTo('{}');
        table.boolean('apr_completa').defaultTo(false);
    });
};

exports.down = function(knex) {
    return knex.schema.table('servicos', function(table) {
        table.dropColumn('inicio_apr');
        table.dropColumn('apr_respostas');
        table.dropColumn('apr_completa');
    });
};