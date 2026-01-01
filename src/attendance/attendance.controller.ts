import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { SearchAttendanceDto } from './dto/search-attendance.dto';

@Controller('api/attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  checkin(@Body() body: { deviceId: string; fingerprintId: number }) {
    console.log(body);
    return this.attendanceService.checkin(body.deviceId, body.fingerprintId);
  }

  @Get()
  findAll(@Query() query: SearchAttendanceDto) {
    return this.attendanceService.findAll(query);
  }
}
