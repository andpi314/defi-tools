/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CreateUserInput } from '../models/CreateUserInput';
import type { DownloadDataInput } from '../models/DownloadDataInput';
import type { GetSwapsInput } from '../models/GetSwapsInput';
import type { SimulationSettingsInput } from '../models/SimulationSettingsInput';
import type { UpdateUserInput } from '../models/UpdateUserInput';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class DefaultClient {

    /**
     * @returns any
     * @throws ApiError
     */
    public static authorizationControllerLogin(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/authorization/login',
        });
    }

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static authorizationControllerCreate(
        requestBody: CreateUserInput,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/authorization',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param id
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static authorizationControllerUpdate(
        id: string,
        requestBody: UpdateUserInput,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/authorization/{id}',
            path: {
                'id': id,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static authorizationControllerFindOne(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/authorization/{id}',
        });
    }

    /**
     * @param id
     * @returns any
     * @throws ApiError
     */
    public static authorizationControllerRemove(
        id: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/authorization/{id}',
            path: {
                'id': id,
            },
        });
    }

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static simulationNew(
        requestBody: GetSwapsInput,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/simulation/new',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static downloadData(
        requestBody: DownloadDataInput,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/simulation/downloadData',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @returns any
     * @throws ApiError
     */
    public static rollingWindow(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/simulation/rollingWindow',
        });
    }

    /**
     * @param requestBody
     * @returns any
     * @throws ApiError
     */
    public static rollingWindowHedgeBot(
        requestBody: SimulationSettingsInput,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/simulation/rollingWindow/hedge-bot',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
