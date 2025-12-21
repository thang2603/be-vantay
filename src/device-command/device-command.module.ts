import { Module } from '@nestjs/common';
import { DeviceCommandService } from './device-command.service';
import { DeviceCommandController } from './device-command.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DeviceCommand,
  DeviceCommandSchema,
} from './schema/device-command.schema';
import { UsersModule } from 'src/users/users.module';
import { AttendanceModule } from 'src/attendance/attendance.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DeviceCommand.name, schema: DeviceCommandSchema },
    ]),
    UsersModule,
    AttendanceModule,
  ],
  providers: [DeviceCommandService],
  controllers: [DeviceCommandController],
})
export class DeviceCommandModule {}
