// src/api/mock/MockEquipmentApi.js
import { BaseApiService } from '../base/BaseApiService.js';

export class MockEquipmentApi extends BaseApiService {
    constructor() {
        super('/equipment');
    }

    async getPanels() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    brand: 'Longhi',
                    power: 545,
                    price: 400,
                    warranty: '25 Years'
                },
                {
                    id: 2,
                    brand: 'Canada Solar',
                    power: 580,
                    price: 57,
                    warranty: '25 Years',
                    default: true
                },
                {
                    id: 3,
                    brand: 'Longi',
                    power: 545,
                    price: 34,
                    warranty: '25 Years'
                }
            ]
        };
    }

    async getInverters() {
        return {
            success: true,
            data: [
                {
                    id: 1,
                    brand: 'Maxpower',
                    power: 5,
                    price: 100000,
                    warranty: '10 Years'
                },
                {
                    id: 2,
                    brand: 'Maxpower',
                    power: 8,
                    price: 170000,
                    warranty: '10 Years'
                },
                {
                    id: 3,
                    brand: 'Maxpower',
                    power: 10,
                    price: 200000,
                    warranty: '10 Years'
                },
                {
                    id: 4,
                    brand: 'Maxpower',
                    power: 15,
                    price: 250000,
                    warranty: '10 Years'
                }
            ]
        };
    }
}