import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './schema/attendance.schema';
import { UsersModule } from 'src/users/users.module';
import { AttendanceGateway } from './attendance.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
    ]),
    UsersModule,
  ],
  providers: [AttendanceService, AttendanceGateway],
  controllers: [AttendanceController],
  exports: [AttendanceGateway],
})
export class AttendanceModule {}
