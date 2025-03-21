export type UseCase = {
  id: string;
  name: string;
  description: string;
  status: 'Not Started' | 'Grooming' | 'Development' | 'UAT' | 'PRD' | 'Blocked';
  createdAt: Date;
  updatedAt: Date;
  dataScienceDeveloper: string;
  dataScienceManager: string;
  techProductManager: string;
  mle: string;
  version: number;
  requirements: string[];
}; 