export const yearlyRidesQuery = `
SELECT
strftime('%Y', start_time) as year,
COUNT(*) as trips
FROM 
parquet_scan('all_trips.parquet')
GROUP BY
year
ORDER BY 
year ASC;
`;
