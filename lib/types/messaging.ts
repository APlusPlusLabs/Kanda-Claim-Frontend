export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: string;
  read: boolean;
  vehicle?: { make: string; model: string; plateNumber: string; garage: string };
  garage?: { name: string; address: string };
}