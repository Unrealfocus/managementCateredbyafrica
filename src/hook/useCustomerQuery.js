import useInfiniteCustomers from './useInfinityQuery';
import CustomersAPI from '../services/customerService';

export const useInfiniteCustomerList = (search = '') =>
    useInfiniteCustomers(CustomersAPI.list, search);

export const useInfiniteOrderPlaced = (search = '') =>
    useInfiniteCustomers(CustomersAPI.orderPlaced, search);

export const useInfiniteOrderNotPlaced = (search = '') =>
    useInfiniteCustomers(CustomersAPI.orderNotPlaced, search);