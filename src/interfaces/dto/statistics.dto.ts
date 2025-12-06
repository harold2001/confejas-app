export interface UserStatisticsDto {
  totalUsers: number;
  usersArrived: number;
  usersNotArrived: number;

  // Gender statistics
  maleCount: number;
  femaleCount: number;

  // Church membership
  churchMembersCount: number;
  nonChurchMembersCount: number;

  // User status
  activeUsers: number;
  replacedUsers: number;

  // Medical statistics
  usersWithMedicalCondition: number;
  usersWithMedicalTreatment: number;

  // Blood type statistics
  bloodTypeStatistics: {
    type: string;
    count: number;
  }[];

  // Shirt size statistics
  shirtSizeStatistics: {
    size: string;
    count: number;
  }[];

  // Age range statistics
  ageRangeStatistics: {
    range: string;
    count: number;
  }[];
  averageAge: number;

  // Company statistics
  companyStatistics: {
    companyId: string;
    companyName: string;
    userCount: number;
    users: {
      id: string;
      firstName: string;
      paternalLastName: string;
      maternalLastName: string;
    }[];
  }[];

  // Stake statistics
  stakeStatistics: {
    stakeId: string;
    stakeName: string;
    userCount: number;
    churchMembersCount: number;
    maleCount: number;
    femaleCount: number;
    arrivedCount: number;
  }[];
}
