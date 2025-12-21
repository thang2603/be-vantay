import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DeviceCommandModule } from './device-command/device-command.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/fingerprint'),
    UsersModule,
    DeviceCommandModule,
    AttendanceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
