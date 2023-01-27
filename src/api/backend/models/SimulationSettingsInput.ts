/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { HedgeBotSimulationScenarioInput } from './HedgeBotSimulationScenarioInput';

export type SimulationSettingsInput = {
    /**
     * Simulation start at
     */
    startDate: string;
    /**
     * Simulation end at
     */
    endDate: string;
    /**
     * Time in hours to project the simulation (e.g. 168h = 1 week / 7 days)
     */
    windowLength: number;
    /**
     * Rolling time in hours, distance between start of two sequential windows
     */
    rollingTime: number;
    /**
     * List of scenarios
     */
    scenarios: Array<HedgeBotSimulationScenarioInput>;
};

