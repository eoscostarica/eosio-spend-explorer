CREATE OR REPLACE VIEW "public"."categorized_expenses_by_delegate" AS 
 SELECT expenses.election,
    expenses.delegate_payer,
    sum(expenses.amount) AS amount,
    sum(expenses.usd_total) AS usd_total,
    avg(expenses.exchange_rate) AS exchange_rate,
    expenses.delegate_level
   FROM transaction_by_category_and_election expenses
  WHERE (((expenses.type)::text = 'expense'::text) AND ((expenses.category)::text <> 'uncategorized'::text))
  GROUP BY expenses.election, expenses.delegate_payer, expenses.delegate_level;
