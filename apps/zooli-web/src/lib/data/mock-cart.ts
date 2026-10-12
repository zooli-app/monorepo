import type { Cart } from '@/lib/types';

export const mockCart: Cart = {
  items: [
    { id: 'ci-1', name: 'Andhra Chicken Biryani', description: 'Spicy dum biryani with raita', priceInr: 180, quantity: 2, vendorName: 'Hotel Srinivasa Grand', category: 'food' },
    { id: 'ci-2', name: 'Gulab Jamun (6 pcs)', description: 'Soft, syrup-soaked dessert', priceInr: 60, quantity: 1, vendorName: 'Hotel Srinivasa Grand', category: 'food' },
    { id: 'ci-3', name: 'Masala Papad', description: 'Crispy with toppings', priceInr: 30, quantity: 2, vendorName: 'Hotel Srinivasa Grand', category: 'food' },
  ],
  subtotalInr: 480,
  discountInr: 40,
  deliveryFeeInr: 25,
  totalInr: 465,
};
