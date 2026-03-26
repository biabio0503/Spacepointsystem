// API Response Types (클라이언트에서 사용)
// Prisma 모델과 호환되는 camelCase 타입

export type MembershipStatus = 'paid' | 'not_paid' | 'unknown';
export type RentalStatus = 'active' | 'returned';
export type GradeType = 'ABSOLUTE_POINTS' | 'PERCENTILE';

export interface User {
  id: string;
  studentId: string;
  name: string;
  department: string;
  phone: string;
  points: number;
  membershipFeeStatus: MembershipStatus;
  joinedAt: Date | string;
  isAdmin: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
  kakaoId: string | null;
  role: string;
}

export interface Event {
  id: string;
  title: string;
  location: string;
  date: Date | string;
  endDate: Date | string | null;
  content: string;
  imageUrls: string[];
  instagramUrl: string | null;
  points: number;
  postDate: Date | string;
  postEndDate: Date | string;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PointHistory {
  id: string;
  userId: string;
  points: number;
  reason: string;
  date: Date | string;
  createdAt: Date | string;
}

export interface RentalItem {
  id: string;
  name: string;
  category: string;
  totalStock: number;
  available: number;
  imageUrl: string | null;
  emoji: string | null;
  description: string | null;
  isActive: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Rental {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
  rentalDate: Date | string;
  returnDate: Date | string | null;
  expectedReturnDate: Date | string;
  status: RentalStatus;
  notes: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface Settings {
  id: string;
  organizationName: string;
  logoMain: string | null;
  primaryColor: string;
  secondaryColor: string;
  contactPhone: string;
  contactPerson: string;
  instagram: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GradeConfig {
  id: string;
  name: string;
  type: GradeType;
  minPoints: number;
  maxPoints: number | null;
  percentileMin: number | null;
  percentileMax: number | null;
  emoji: string;
  badgeImage: string | null;
  color: string;
  bgColor: string;
  benefit: string;
  orderIndex: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Relation Types
export interface RentalWithItem extends Rental {
  item: RentalItem;
}

export interface RentalWithUser extends Rental {
  user: Pick<User, 'studentId' | 'name' | 'department' | 'phone'>;
}

export interface UserWithRelations extends User {
  pointHistory?: PointHistory[];
  rentals?: RentalWithItem[];
}
