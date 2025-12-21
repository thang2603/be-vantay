import { Body, Controller, Get, Post } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

@Controller('api/attendance')
export class AttendanceController {
  constructor(private attendanceService: AttendanceService) {}

  @Post()
  checkin(@Body() body: { deviceId: string; fingerprintId: number }) {
    console.log(body);
    return this.attendanceService.checkin(body.deviceId, body.fingerprintId);
  }

  @Get()
  findAll() {
    return this.attendanceService.findAll();
  }
}
