export const vendor = {
  id: "v1", name: "Hotel Paradise", ownerName: "Ravi Kumar",
  email: "owner@paradise.in", phone: "+91 9800001111",
  alternatePhone: "+91 9800002222",
  category: "Food & Beverages", zone: "Dhone",
  rating: 4.7, totalReviews: 284, totalOrders: 1284,
  revenue: 480000, commissionRate: 15,
  status: "active" as const, isOpen: true,
  address: "Main Road, Near Bus Stand, Dhone, Andhra Pradesh - 518220",
  gstin: "37AAGCP1234N1ZN",
  fssaiLicense: "10020042007150",
  bankName: "State Bank of India",
  accountNumber: "XXXX XXXX 4521",
  ifsc: "SBIN0020149",
  joinedAt: "2024-01-15T00:00:00Z",
  openTime: "08:00",
  closeTime: "22:00",
  preparationTime: 25,
  minOrderValue: 150,
  deliveryRadius: 5,
};

export type OrderStatus = "new" | "accepted" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled";

export interface OrderItem { name: string; qty: number; price: number; }
export interface Order {
  id: string; customer: string; phone: string;
  items: OrderItem[]; total: number; commission: number; net: number;
  status: OrderStatus; address: string; paymentMethod: string;
  createdAt: string; zone: string; notes?: string; riderId?: string;
}

const T = (m: number) => new Date(Date.now() - m * 60000).toISOString();

export const orders: Order[] = [
  { id:"ZL-9001", customer:"Ramesh Kumar", phone:"+91 9876543210", items:[{name:"Chicken Biryani",qty:2,price:180},{name:"Raita",qty:2,price:30}], total:420, commission:63, net:357, status:"new", address:"Ward 3, Near Temple, Dhone", paymentMethod:"UPI", createdAt:T(2), zone:"Dhone" },
  { id:"ZL-9002", customer:"Swathi Reddy", phone:"+91 9876543211", items:[{name:"Veg Thali",qty:1,price:120},{name:"Lassi",qty:2,price:40}], total:200, commission:30, net:170, status:"new", address:"Colony Road, Dhone", paymentMethod:"Cash", createdAt:T(5), zone:"Dhone" },
  { id:"ZL-9003", customer:"Vijay Mohan", phone:"+91 9876543212", items:[{name:"Mutton Curry",qty:1,price:220},{name:"Naan",qty:4,price:20}], total:300, commission:45, net:255, status:"preparing", address:"Bus Stand Area, Dhone", paymentMethod:"Card", createdAt:T(18), zone:"Dhone" },
  { id:"ZL-9004", customer:"Priya Singh", phone:"+91 9876543213", items:[{name:"Paneer Masala",qty:2,price:160},{name:"Roti",qty:4,price:15}], total:380, commission:57, net:323, status:"ready", address:"Zafar Nagar, Dhone", paymentMethod:"UPI", createdAt:T(30), zone:"Dhone" },
  { id:"ZL-9005", customer:"Arun Babu", phone:"+91 9876543214", items:[{name:"Fish Fry",qty:2,price:200}], total:400, commission:60, net:340, status:"out_for_delivery", address:"Teachers Colony, Dhone", paymentMethod:"UPI", createdAt:T(45), zone:"Dhone" },
  { id:"ZL-9006", customer:"Meena Devi", phone:"+91 9876543215", items:[{name:"Chicken Biryani",qty:1,price:180},{name:"Coke",qty:2,price:40}], total:260, commission:39, net:221, status:"delivered", address:"RTC Colony, Dhone", paymentMethod:"Cash", createdAt:T(80), zone:"Dhone" },
  { id:"ZL-9007", customer:"Kiran Kumar", phone:"+91 9876543216", items:[{name:"Veg Biryani",qty:3,price:150}], total:450, commission:68, net:382, status:"delivered", address:"Near Hospital, Dhone", paymentMethod:"UPI", createdAt:T(120), zone:"Dhone" },
  { id:"ZL-9008", customer:"Lakshmi Bai", phone:"+91 9876543217", items:[{name:"Mutton Biryani",qty:2,price:210}], total:420, commission:63, net:357, status:"cancelled", address:"Old Town, Dhone", paymentMethod:"Card", createdAt:T(95), zone:"Dhone", notes:"Customer not reachable" },
  { id:"ZL-9009", customer:"Suresh T.", phone:"+91 9876543218", items:[{name:"Chicken Curry",qty:1,price:180},{name:"Naan",qty:6,price:20}], total:300, commission:45, net:255, status:"delivered", address:"New Colony, Dhone", paymentMethod:"UPI", createdAt:T(150), zone:"Dhone" },
  { id:"ZL-9010", customer:"Deepa Rani", phone:"+91 9876543219", items:[{name:"Paneer Biryani",qty:2,price:170}], total:340, commission:51, net:289, status:"delivered", address:"Civil Lines, Dhone", paymentMethod:"Cash", createdAt:T(180), zone:"Dhone" },
  { id:"ZL-9011", customer:"Rahul Nair", phone:"+91 9876543220", items:[{name:"Chicken 65",qty:1,price:160},{name:"Veg Biryani",qty:1,price:150}], total:310, commission:47, net:263, status:"delivered", address:"Park Street, Dhone", paymentMethod:"UPI", createdAt:T(210), zone:"Dhone" },
  { id:"ZL-9012", customer:"Anita Rao", phone:"+91 9876543221", items:[{name:"Veg Thali",qty:2,price:120}], total:240, commission:36, net:204, status:"delivered", address:"Garden Colony, Dhone", paymentMethod:"Wallet", createdAt:T(240), zone:"Dhone" },
];

export interface MenuItem {
  id: string; name: string; category: string; price: number;
  description: string; isVeg: boolean; isAvailable: boolean;
  isPopular?: boolean; prepTime: number; orders: number; image?: string;
}

export const menuItems: MenuItem[] = [
  { id:"m1",  name:"Chicken Biryani",  category:"Biryani",  price:180, description:"Aromatic basmati rice with tender chicken pieces", isVeg:false, isAvailable:true,  isPopular:true,  prepTime:25, orders:284 },
  { id:"m2",  name:"Veg Biryani",      category:"Biryani",  price:150, description:"Seasonal vegetables in fragrant saffron rice",    isVeg:true,  isAvailable:true,  isPopular:true,  prepTime:20, orders:198 },
  { id:"m3",  name:"Mutton Biryani",   category:"Biryani",  price:210, description:"Slow-cooked tender mutton with basmati rice",     isVeg:false, isAvailable:true,  isPopular:false, prepTime:35, orders:142 },
  { id:"m4",  name:"Paneer Biryani",   category:"Biryani",  price:170, description:"Cottage cheese cubes in fragrant biryani",       isVeg:true,  isAvailable:true,  isPopular:false, prepTime:22, orders:96  },
  { id:"m5",  name:"Chicken Curry",    category:"Curries",  price:180, description:"Spicy Andhra style chicken curry",               isVeg:false, isAvailable:true,  isPopular:true,  prepTime:20, orders:167 },
  { id:"m6",  name:"Mutton Curry",     category:"Curries",  price:220, description:"Rich mutton in aromatic onion-tomato gravy",     isVeg:false, isAvailable:true,  isPopular:false, prepTime:30, orders:89  },
  { id:"m7",  name:"Paneer Masala",    category:"Curries",  price:160, description:"Creamy paneer in tomato-onion masala",           isVeg:true,  isAvailable:true,  isPopular:false, prepTime:18, orders:73  },
  { id:"m8",  name:"Dal Tadka",        category:"Curries",  price:100, description:"Yellow lentils tempered with spices",            isVeg:true,  isAvailable:true,  isPopular:false, prepTime:15, orders:54  },
  { id:"m9",  name:"Veg Thali",        category:"Thali",    price:120, description:"Complete meal with rice, dal, sabzi & roti",     isVeg:true,  isAvailable:true,  isPopular:true,  prepTime:15, orders:201 },
  { id:"m10", name:"Non-Veg Thali",    category:"Thali",    price:180, description:"Rice, chicken curry, dal, salad & roti",         isVeg:false, isAvailable:true,  isPopular:false, prepTime:20, orders:145 },
  { id:"m11", name:"Fish Fry",         category:"Starters", price:200, description:"Fresh fish marinated and fried crispy",          isVeg:false, isAvailable:false, isPopular:false, prepTime:20, orders:54  },
  { id:"m12", name:"Chicken 65",       category:"Starters", price:160, description:"Classic Andhra style chicken starter",           isVeg:false, isAvailable:true,  isPopular:true,  prepTime:15, orders:132 },
  { id:"m13", name:"Gobi Manchurian",  category:"Starters", price:120, description:"Crispy cauliflower in Indo-Chinese sauce",       isVeg:true,  isAvailable:true,  isPopular:false, prepTime:12, orders:87  },
  { id:"m14", name:"Naan",             category:"Breads",   price:20,  description:"Soft leavened bread from tandoor",               isVeg:true,  isAvailable:true,  isPopular:false, prepTime:8,  orders:410 },
  { id:"m15", name:"Roti",             category:"Breads",   price:15,  description:"Whole wheat bread",                              isVeg:true,  isAvailable:true,  isPopular:false, prepTime:5,  orders:320 },
  { id:"m16", name:"Parotta",          category:"Breads",   price:20,  description:"Layered flaky flatbread",                        isVeg:true,  isAvailable:true,  isPopular:false, prepTime:8,  orders:180 },
  { id:"m17", name:"Lassi",            category:"Drinks",   price:40,  description:"Sweet chilled yogurt drink",                     isVeg:true,  isAvailable:true,  isPopular:false, prepTime:3,  orders:178 },
  { id:"m18", name:"Coke",             category:"Drinks",   price:40,  description:"300ml chilled Coca-Cola",                        isVeg:true,  isAvailable:true,  isPopular:false, prepTime:1,  orders:245 },
  { id:"m19", name:"Raita",            category:"Sides",    price:30,  description:"Chilled yogurt with cucumber",                   isVeg:true,  isAvailable:true,  isPopular:false, prepTime:3,  orders:156 },
  { id:"m20", name:"Salad",            category:"Sides",    price:40,  description:"Fresh garden salad with lemon dressing",         isVeg:true,  isAvailable:true,  isPopular:false, prepTime:5,  orders:98  },
];

export const menuCategories = ["Biryani", "Curries", "Thali", "Starters", "Breads", "Drinks", "Sides"];

export interface Review {
  id: string; customer: string; rating: number; comment: string;
  createdAt: string; orderId: string; reply?: string; sentiment: "positive" | "neutral" | "negative";
}

export const reviews: Review[] = [
  { id:"r1", customer:"Ramesh Kumar",  rating:5, comment:"Excellent biryani! Very fresh and tasty. Portion size is also great. Will definitely order again.", createdAt:T(60),   orderId:"ZL-8920", sentiment:"positive" },
  { id:"r2", customer:"Priya Sharma",  rating:4, comment:"Good food, decent packaging. Delivery was on time. Chicken curry was delicious.", createdAt:T(180),  orderId:"ZL-8915", reply:"Thank you Priya! We're glad you enjoyed it 🙏", sentiment:"positive" },
  { id:"r3", customer:"Vikram Mohan",  rating:5, comment:"Best chicken biryani in Dhone! Quantity is very good. The raita was perfect.", createdAt:T(360),  orderId:"ZL-8910", sentiment:"positive" },
  { id:"r4", customer:"Lakshmi Devi",  rating:3, comment:"Food was ok but took longer than expected. The naan was a bit hard. Hope to see improvement.", createdAt:T(720),  orderId:"ZL-8905", sentiment:"neutral" },
  { id:"r5", customer:"Arun Babu",     rating:5, comment:"Absolutely delicious! The mutton curry was outstanding. Best food I've had in a long time.", createdAt:T(1200), orderId:"ZL-8898", reply:"Thank you so much Arun! Your kind words mean a lot to us 😊", sentiment:"positive" },
  { id:"r6", customer:"Deepa Rani",    rating:4, comment:"Nice food, good taste. Would recommend to friends. Packaging could be improved.", createdAt:T(1800), orderId:"ZL-8892", sentiment:"positive" },
  { id:"r7", customer:"Suresh Teja",   rating:2, comment:"Order was cold when delivered. The chicken was dry. Not what I expected based on reviews.", createdAt:T(2400), orderId:"ZL-8881", sentiment:"negative" },
  { id:"r8", customer:"Kavya Reddy",   rating:5, comment:"Wonderful experience! Fresh ingredients, great taste and timely delivery. 10/10!", createdAt:T(3000), orderId:"ZL-8875", sentiment:"positive" },
];

export const revenueWeekData = [
  { day:"Mon", revenue:12400, orders:28, target:15000 },
  { day:"Tue", revenue:18600, orders:42, target:15000 },
  { day:"Wed", revenue:15200, orders:35, target:15000 },
  { day:"Thu", revenue:22800, orders:52, target:15000 },
  { day:"Fri", revenue:28400, orders:64, target:15000 },
  { day:"Sat", revenue:34200, orders:78, target:15000 },
  { day:"Sun", revenue:24600, orders:56, target:15000 },
];

export const revenueMonthData = [
  { week:"Week 1", revenue:88000,  orders:210 },
  { week:"Week 2", revenue:102400, orders:248 },
  { week:"Week 3", revenue:96800,  orders:231 },
  { week:"Week 4", revenue:156200, orders:355 },
];

export const payoutHistory = [
  { id:"PO-0042", amount:38200,  orders:96,  period:"19–25 May 2026", status:"paid",    paidOn:"26 May 2026", utr:"SBIN26052024891" },
  { id:"PO-0041", amount:41500,  orders:104, period:"12–18 May 2026", status:"paid",    paidOn:"19 May 2026", utr:"SBIN19052024442" },
  { id:"PO-0040", amount:35800,  orders:88,  period:"05–11 May 2026", status:"paid",    paidOn:"12 May 2026", utr:"SBIN12052024318" },
  { id:"PO-0039", amount:29400,  orders:72,  period:"28 Apr–04 May",  status:"paid",    paidOn:"05 May 2026", utr:"SBIN05052024204" },
  { id:"PO-0038", amount:44100,  orders:112, period:"21–27 Apr 2026", status:"paid",    paidOn:"28 Apr 2026", utr:"SBIN28042024567" },
];

export const notifications = [
  { id:"n1", type:"order",   title:"New Order Received",         body:"ZL-9001 from Ramesh Kumar — ₹420",          time:T(2),    read:false },
  { id:"n2", type:"order",   title:"New Order Received",         body:"ZL-9002 from Swathi Reddy — ₹200",          time:T(5),    read:false },
  { id:"n3", type:"payout",  title:"Payout Processed",           body:"₹38,200 credited to your bank account",     time:T(60),   read:false },
  { id:"n4", type:"review",  title:"New Review Received",        body:"Ramesh Kumar gave you 5 stars ⭐",          time:T(80),   read:false },
  { id:"n5", type:"review",  title:"New Review Received",        body:"Lakshmi Devi gave you 3 stars ★★★",        time:T(720),  read:false },
  { id:"n6", type:"system",  title:"Store Closed Automatically", body:"Your store was auto-closed at 10:00 PM",    time:T(840),  read:true  },
  { id:"n7", type:"payout",  title:"Payout Processed",           body:"₹41,500 credited to your bank account",    time:T(1440), read:true  },
  { id:"n8", type:"system",  title:"Menu Item Out of Stock",     body:"Fish Fry marked unavailable by the system", time:T(1500), read:true  },
  { id:"n9", type:"promo",   title:"Zooli Boost Active",         body:"Your store is featured in top results today",time:T(1800),read:true  },
  { id:"n10",type:"system",  title:"Weekly Report Ready",        body:"Your performance report for last week is ready", time:T(2880),read:true },
];
