export const tripsByDayQuery = `
SELECT
DAYOFWEEK(start_time) as day,
DAYNAME(start_time) as dayname,
COUNT(*) as trips
FROM
    parquet_scan('all_trips.parquet')
WHERE
    strftime('%Y', start_time) = '2023'
GROUP BY
    day, dayname
ORDER BY
    day ASC;
`;
