// dto/search-attendance.dto.ts

export class SearchAttendanceDto {
  userName?: string;
  fromDate?: string; // yyyy-MM-dd
  toDate?: string; // yyyy-MM-dd
  page?: string;
  limit?: string;
}
