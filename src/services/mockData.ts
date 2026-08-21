import { User } from '../types';

// Demo mode intentionally starts with ZERO products. Customers only see phones
// that the Admin adds from the Admin Dashboard / Add Phone screen.
export const mockUsers: User[] = [
  { id:'admin_demo', name:'FULATAN Admin', email:'admin@fulatan.com', phone:'08000000000', location:'Kano', rating:5, totalSales:0, joinedAt:'2026-08-21', role:'admin' },
];

export const mockPhones = [];
export const formatPrice = (price:number): string => '₦' + price.toLocaleString('en-NG');
