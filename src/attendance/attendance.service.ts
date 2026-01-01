import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from './schema/attendance.schema';
import { UsersService } from 'src/users/users.service';
import { AttendanceGateway } from './attendance.gateway';
import { SearchAttendanceDto } from './dto/search-attendance.dto';

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
  // async findAll() {
  //   return this.model.aggregate([
  //     {
  //       $lookup: {
  //         from: 'users',
  //         localField: 'userCode',
  //         foreignField: 'userCode',
  //         as: 'user',
  //       },
  //     },
  //     {
  //       $unwind: {
  //         path: '$user',
  //         preserveNullAndEmptyArrays: true,
  //       },
  //     },
  //   ]);
  // }

  // attendance.service.ts
  async findAll(query: SearchAttendanceDto) {
    const { userName, page = '1', limit = '10' } = query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline: any[] = [
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
    ];

    // 🔍 search theo tên user
    if (typeof userName === 'string' && userName.trim() !== '') {
      pipeline.push({
        $match: {
          'user.name': { $regex: userName.trim(), $options: 'i' },
        },
      });
    }

    // 📊 sort
    pipeline.push({ $sort: { time: -1 } });

    // 📄 pagination
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    // 🚀 chạy query + count
    const [data, total] = await Promise.all([
      this.model.aggregate(pipeline),
      this.model.aggregate([
        ...pipeline.filter(
          (stage) => !('$skip' in stage) && !('$limit' in stage),
        ),
        { $count: 'total' },
      ]),
    ]);

    return {
      data,
      pagination: {
        total: total[0]?.total || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((total[0]?.total || 0) / limitNum),
      },
    };
  }
}
