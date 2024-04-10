export type RawTableRow = {
	day: BigInt;
	dayname: string;
	trips: BigInt;
};

export type Day = {
	dayIndex: number;
	dayName: string;
	trips: number;
};
