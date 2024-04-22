// scripts/download-from-s3-public.js

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const url =
	'https://city-bike-share.s3.ap-southeast-2.amazonaws.com/all_trips_february_2024.parquet';
const outputPath = path.join(__dirname, '../static/local', 'all_trips.parquet');

const downloadFile = async () => {
	try {
		const response = await fetch(url);
		if (!response.ok) throw new Error(`Failed to fetch file: ${response.statusText}`);

		const fileStream = fs.createWriteStream(outputPath);

		if (!response.body) {
			return 'No repsonse from file';
		}
		response.body.pipe(fileStream);

		fileStream.on('error', (err) => {
			console.error('Error writing file', err);
		});

		fileStream.on('finish', () => {
			console.log(`File downloaded successfully from S3 to ${outputPath}`);
		});
	} catch (err) {
		console.error('Error downloading file from S3', err);
	}
};

downloadFile();
