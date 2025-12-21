import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from './schema/attendance.schema';
import { UsersService } from 'src/users/users.service';
import { AttendanceGateway } from './attendance.gateway';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectModel(Attendance.name)
    private model: Model<Attendance>,
    private users: UsersService,
    private gateway: AttendanceGateway,
  ) {}

  async checkin(deviceId: string, fingerprintId: number) {
    const user = await this.users.findByFingerprint(fingerprintId);
    if (!user) return;
    const record = {
      userCode: user.userCode,
      fingerprintId,
      deviceId,
      time: new Date(),
    };
    this.gateway.emitAttendance(record);
    return this.model.create(record);
  }
  async findAll() {
    return this.model.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'userCode',
          foreignField: 'userCode',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);
  }
}
