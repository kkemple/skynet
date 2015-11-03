exports.up = function(knex) {
  return knex.schema.
    createTable('emails', function (t) {
      t.increments('id').primary()
      t.integer('user_id').notNullable()
      t.integer('bot_id').notNullable()
      t.boolean('active').defaultTo(true)
      t.text('email').notNullable()
      t.json('extra_data', true)
      t.timestamps()
    })
}

exports.down = function(knex) {
  return knex.schema.dropTable('emails')
}
