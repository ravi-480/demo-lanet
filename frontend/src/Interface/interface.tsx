// Interface/interface.ts
export interface IEvent {
  _id: string;
  name: string;
  date: string | Date;
  time: string;
  location: string;
  description: string;
  status: string;
  image: string;
  budget: {
    allocated: number;
    spent: number;
  };
  guestLimit: number;
  rsvp: {
    confirmed: number;
    total: number;
  };
  creator: string;
  attendees: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface EventDisplayProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formatCurrency: (amount: number) => string;
  getBudgetStatusColor: (allocated: number, spent: number) => string;
}



export interface IBudget {
  allocated: number;
  spent: number;
}

export interface IRSVP {
  confirmed: number;
  total: number;
}