export interface Attendance {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  department: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:mm or empty
  checkOut: string; // HH:mm or empty
  workingHours: number; // calculated hours
  status: 'Present' | 'Absent' | 'Late' | 'Work From Home';
}
