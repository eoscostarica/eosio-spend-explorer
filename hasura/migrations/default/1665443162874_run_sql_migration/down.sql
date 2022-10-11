-- Could not auto-generate a down migration.
-- Please write an appropriate down migration for the SQL below:
-- CREATE OR REPLACE VIEW "public"."categorized_expenses" AS
-- SELECT expenses.election,
--     sum(expenses.amount) as amount,
--     sum(expenses.usd_total) as usd_total
--    FROM total_by_category_and_election expenses
--   WHERE (((expenses.type)::text = 'expense'::text) AND ((expenses.category)::text <> 'uncategorized'::text))
--   group by expenses.election, expenses.category;
