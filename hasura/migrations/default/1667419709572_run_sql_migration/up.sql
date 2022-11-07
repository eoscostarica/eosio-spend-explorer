CREATE OR REPLACE VIEW "public"."percent_by_delegates_incomes" AS 
 SELECT incomes_by_delegates.recipient,
    incomes_by_delegates.election,
    (COALESCE(( SELECT sum(historic_incomes.eos_claimed) AS sum
           FROM historic_incomes
          WHERE ((historic_incomes.election = incomes_by_delegates.election) AND ((historic_incomes.recipient)::text = (incomes_by_delegates.recipient)::text))), (0)::numeric) / total.amount) AS eos_claimed,
    (COALESCE(( SELECT sum(historic_incomes.eos_unclaimed) AS sum
           FROM historic_incomes
          WHERE ((historic_incomes.election = incomes_by_delegates.election) AND ((historic_incomes.recipient)::text = (incomes_by_delegates.recipient)::text))), (0)::numeric) / total.amount) AS eos_unclaimed,
    (COALESCE(( SELECT sum(historic_incomes.usd_claimed) AS sum
           FROM historic_incomes
          WHERE ((historic_incomes.election = incomes_by_delegates.election) AND ((historic_incomes.recipient)::text = (incomes_by_delegates.recipient)::text))), (0)::numeric) / total.usd_total) AS usd_claimed,
    (COALESCE(( SELECT sum(historic_incomes.usd_unclaimed) AS sum
           FROM historic_incomes
          WHERE ((historic_incomes.election = incomes_by_delegates.election) AND ((historic_incomes.recipient)::text = (incomes_by_delegates.recipient)::text))), (0)::numeric) / total.usd_total) AS usd_unclaimed
   FROM (historic_incomes incomes_by_delegates
     JOIN total_by_election total ON ((total.election = incomes_by_delegates.election)))
WHERE ((total.type)::text = 'expense'::text)
  GROUP BY incomes_by_delegates.election, total.usd_total, total.amount, incomes_by_delegates.recipient
  ORDER BY incomes_by_delegates.election;
