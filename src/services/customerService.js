// src/services/customerService.js
import { createAPI } from './baseService';

const api = createAPI();

// Use page number as cursor (your API uses ?page=)
export const list = (search = '', page = 1) =>
    api.get('/api/customers/list', { search, page });

export const orderPlaced = (search = '', page = 1) =>
    api.get('/api/customers/order_place/list', { search, page });

export const orderNotPlaced = (search = '', page = 1) =>
    api.get('/api/customers/order_not_place/list', { search, page });

export default {
    list,
    orderPlaced,
    orderNotPlaced,
};