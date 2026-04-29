import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Users table
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.string('phone').nullable();
    table.enum('role', ['owner', 'manager', 'staff']).defaultTo('owner');
    table.enum('subscription_tier', ['free', 'starter', 'pro', 'agency']).defaultTo('free');
    table.string('stripe_customer_id').nullable();
    table.string('stripe_subscription_id').nullable();
    table.timestamp('subscription_ends_at').nullable();
    table.boolean('is_active').defaultTo(true);
    table.timestamp('email_verified_at').nullable();
    table.string('refresh_token').nullable();
    table.timestamps(true, true);
  });

  // Businesses table
  await knex.schema.createTable('businesses', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('slug').unique().notNullable();
    table.text('description').nullable();
    table.string('category').nullable();
    table.string('phone').nullable();
    table.string('email').nullable();
    table.string('website').nullable();
    table.string('address').nullable();
    table.string('city').nullable();
    table.string('state').nullable();
    table.string('country').nullable();
    table.string('postal_code').nullable();
    table.string('logo_url').nullable();
    table.string('timezone').defaultTo('UTC');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  // Connected platforms table
  await knex.schema.createTable('connected_platforms', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('business_id').references('id').inTable('businesses').onDelete('CASCADE');
    table.enum('platform', ['google', 'yelp', 'trustpilot', 'facebook', 'tripadvisor']).notNullable();
    table.string('platform_business_id').nullable();
    table.string('platform_url').nullable();
    table.text('access_token_encrypted').nullable();
    table.text('refresh_token_encrypted').nullable();
    table.timestamp('token_expires_at').nullable();
    table.boolean('is_connected').defaultTo(true);
    table.decimal('current_rating', 3, 2).nullable();
    table.integer('total_reviews').defaultTo(0);
    table.timestamp('last_synced_at').nullable();
    table.timestamps(true, true);

    table.unique(['business_id', 'platform']);
  });

  // Reviews table
  await knex.schema.createTable('reviews', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('business_id').references('id').inTable('businesses').onDelete('CASCADE');
    table.uuid('platform_id').references('id').inTable('connected_platforms').onDelete('SET NULL').nullable();
    table.enum('platform', ['google', 'yelp', 'trustpilot', 'facebook', 'tripadvisor', 'manual']).notNullable();
    table.string('platform_review_id').nullable();
    table.string('reviewer_name').nullable();
    table.string('reviewer_avatar_url').nullable();
    table.integer('rating').notNullable();
    table.text('review_text').nullable();
    table.enum('sentiment', ['positive', 'neutral', 'negative']).nullable();
    table.decimal('sentiment_score', 5, 4).nullable();
    table.boolean('is_responded').defaultTo(false);
    table.timestamp('reviewed_at').notNullable();
    table.timestamps(true, true);

    table.index(['business_id', 'platform']);
    table.index(['business_id', 'sentiment']);
    table.index(['business_id', 'reviewed_at']);
  });

  // Review responses table
  await knex.schema.createTable('review_responses', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('review_id').references('id').inTable('reviews').onDelete('CASCADE');
    table.text('response_text').notNullable();
    table.boolean('is_ai_generated').defaultTo(false);
    table.enum('tone', ['professional', 'friendly', 'empathetic', 'formal']).defaultTo('professional');
    table.enum('status', ['draft', 'sent', 'published']).defaultTo('draft');
    table.timestamp('sent_at').nullable();
    table.timestamps(true, true);
  });

  // Review requests table
  await knex.schema.createTable('review_requests', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('business_id').references('id').inTable('businesses').onDelete('CASCADE');
    table.string('customer_name').notNullable();
    table.string('customer_email').nullable();
    table.string('customer_phone').nullable();
    table.enum('channel', ['email', 'sms', 'qr']).notNullable();
    table.enum('status', ['pending', 'sent', 'opened', 'completed']).defaultTo('pending');
    table.string('review_link').nullable();
    table.string('qr_code_url').nullable();
    table.timestamp('sent_at').nullable();
    table.timestamp('opened_at').nullable();
    table.timestamp('completed_at').nullable();
    table.timestamps(true, true);
  });

  // Analytics snapshots table
  await knex.schema.createTable('analytics_snapshots', (table) => {
    table.uuid('id').primary().defaultTo(knex.fn.uuid());
    table.uuid('business_id').references('id').inTable('businesses').onDelete('CASCADE');
    table.date('snapshot_date').notNullable();
    table.decimal('avg_rating', 3, 2).nullable();
    table.integer('total_reviews').defaultTo(0);
    table.integer('new_reviews').defaultTo(0);
    table.integer('positive_reviews').defaultTo(0);
    table.integer('neutral_reviews').defaultTo(0);
    table.integer('negative_reviews').defaultTo(0);
    table.integer('responded_reviews').defaultTo(0);
    table.integer('review_requests_sent').defaultTo(0);
    table.integer('review_requests_completed').defaultTo(0);
    table.decimal('response_rate', 5, 2).nullable();
    table.jsonb('platform_breakdown').nullable();
    table.timestamps(true, true);

    table.unique(['business_id', 'snapshot_date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('analytics_snapshots');
  await knex.schema.dropTableIfExists('review_requests');
  await knex.schema.dropTableIfExists('review_responses');
  await knex.schema.dropTableIfExists('reviews');
  await knex.schema.dropTableIfExists('connected_platforms');
  await knex.schema.dropTableIfExists('businesses');
  await knex.schema.dropTableIfExists('users');
}
