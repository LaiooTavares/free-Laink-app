exports.up = function(knex) {
  return knex.schema.table('pontos', function(table) {
    // Usamos decimal para uma boa precisão de GPS
    table.decimal('latitude', 9, 6); 
    table.decimal('longitude', 9, 6);
  });
};

exports.down = function(knex) {
  return knex.schema.table('pontos', function(table) {
    table.dropColumn('latitude');
    table.dropColumn('longitude');
  });
};