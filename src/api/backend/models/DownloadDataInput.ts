/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type DownloadDataInput = {
    /**
     * Inclusive start date
     */
    startDate: string;
    /**
     * Exclusive end date
     */
    endDate: string;
    /**
     * Number of minutes between each sample (.g 2d/120 = 24 intervals)
     */
    samplingInterval: number;
    /**
     * Address of the pool to which you want to fetch data from. (e.g. USDC-ETH 0.3%)
     */
    poolAddress: string;
    /**
     * Chain IDs to fetch data from
     */
    chainId: number;
    /**
     * File name to save on server (only supported extension is .json)
     */
    fileName: string;
};

