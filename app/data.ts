export type Service = {
  name: string;
  description: string;
  duration: string;
  price: string;
  scene: string;
};

export type Photographer = {
  name: string;
  handle: string;
  specialty: string;
  location: string;
  rating: string;
  bookings: string;
  image: string;
  status: "Winner" | "Testing" | "Killed";
};

export const services: Service[] = [
  {
    name: "Chup ca nhan",
    description: "Bo anh chan dung, profile, sinh nhat hoac concept rieng.",
    duration: "90 phut",
    price: "Tu 850K",
    scene: "Ngoai troi / studio",
  },
  {
    name: "Chup doi",
    description: "Anh couple tu nhien, tinh te, co huong dan pose chi tiet.",
    duration: "2 gio",
    price: "Tu 1.6M",
    scene: "Ngoai troi",
  },
  {
    name: "Chup ki yeu",
    description: "Goi theo lop, nhom ban, co timeline va dieu phoi ngay chup.",
    duration: "Nua ngay",
    price: "Tu 3.5M",
    scene: "Truong / studio",
  },
  {
    name: "Chup nhom",
    description: "Team branding, gia dinh, ban be voi bo cuc gan ket.",
    duration: "2 gio",
    price: "Tu 2.2M",
    scene: "Studio",
  },
  {
    name: "Chup su kien",
    description: "Hoi nghi, sinh nhat, khai truong, talkshow va private event.",
    duration: "Theo gio",
    price: "Tu 1.2M/gio",
    scene: "Dia diem su kien",
  },
  {
    name: "Chup hinh cuoi",
    description: "Pre-wedding va ngay cuoi voi moodboard rieng cho tung cap doi.",
    duration: "Ca ngay",
    price: "Tu 8M",
    scene: "Ngoai troi / studio",
  },
];

export const photographers: Photographer[] = [
  {
    name: "Linh Tran",
    handle: "@linhframes",
    specialty: "Chan dung editorial",
    location: "Ho Chi Minh",
    rating: "4.98",
    bookings: "218 lich",
    status: "Winner",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Minh Khang",
    handle: "@khangvisual",
    specialty: "Cuoi va couple",
    location: "Da Lat",
    rating: "4.95",
    bookings: "176 lich",
    status: "Testing",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "An Nguyen",
    handle: "@an.archive",
    specialty: "Su kien va ki yeu",
    location: "Ha Noi",
    rating: "4.91",
    bookings: "149 lich",
    status: "Winner",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=80",
  },
];

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/photographers", label: "Photographer" },
  { href: "/booking-detail", label: "Dat lich" },
  { href: "/photo-ai", label: "Photo AI" },
  { href: "/messages", label: "Tin nhan" },
  { href: "/about", label: "Ve chung toi" },
];

export const dashboardLinks = [
  { href: "/user-profile", label: "Ho so nguoi dung" },
  { href: "/photographer-profile", label: "Ho so photographer" },
  { href: "/booking-history", label: "Lich su dat lich" },
  { href: "/profile-detail", label: "Chi tiet ho so" },
  { href: "/notifications", label: "Thong bao" },
];
