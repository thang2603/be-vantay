import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from './schema/attendance.schema';
import { UsersService } from 'src/users/users.service';
import { AttendanceGateway } from './attendance.gateway';
import { SearchAttendanceDto } from './dto/search-attendance.dto';
import * as ExcelJS from 'exceljs';
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

  async findAll(query: SearchAttendanceDto) {
    const { userName, fromDate, toDate, page = '1', limit = '10' } = query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const pipeline: any[] = [];

    /* =====================
     🔍 MATCH (TIME TRƯỚC)
     ===================== */
    const match: any = {};

    // filter theo khoảng ngày
    if (fromDate || toDate) {
      match.time = {};

      if (fromDate) {
        match.time.$gte = new Date(`${fromDate}T00:00:00.000Z`);
      }

      if (toDate) {
        match.time.$lte = new Date(`${toDate}T23:59:59.999Z`);
      }
    }

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    /* =====================
     👤 JOIN USER
     ===================== */
    pipeline.push(
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
    );

    /* =====================
     🔍 SEARCH USER NAME
     ===================== */
    if (userName?.trim()) {
      pipeline.push({
        $match: {
          'user.name': {
            $regex: userName.trim(),
            $options: 'i',
          },
        },
      });
    }

    /* =====================
     📊 SORT + PAGE
     ===================== */
    pipeline.push({ $sort: { time: -1 } });
    pipeline.push({ $skip: skip }, { $limit: limitNum });

    /* =====================
     🚀 QUERY + COUNT
     ===================== */
    const countPipeline = pipeline.filter(
      (stage) => !('$skip' in stage) && !('$limit' in stage),
    );

    const [data, total] = await Promise.all([
      this.model.aggregate(pipeline),
      this.model.aggregate([...countPipeline, { $count: 'total' }]),
    ]);

    const totalRecords = total[0]?.total || 0;

    return {
      data,
      pagination: {
        total: totalRecords,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalRecords / limitNum),
      },
    };
  }

  async exportExcel(query: SearchAttendanceDto): Promise<Buffer> {
    const { userName, fromDate, toDate } = query;

    const pipeline: any[] = [];

    /* ========= FILTER TIME ========= */
    const match: any = {};

    if (fromDate || toDate) {
      match.time = {};

      if (fromDate) {
        match.time.$gte = new Date(`${fromDate}T00:00:00.000Z`);
      }

      if (toDate) {
        match.time.$lte = new Date(`${toDate}T23:59:59.999Z`);
      }
    }

    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }

    /* ========= JOIN USER ========= */
    pipeline.push(
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
    );

    /* ========= FILTER USER NAME ========= */
    if (userName?.trim()) {
      pipeline.push({
        $match: {
          'user.name': { $regex: userName.trim(), $options: 'i' },
        },
      });
    }

    pipeline.push({ $sort: { time: 1 } });

    const data = await this.model.aggregate(pipeline);

    /* ========= CREATE EXCEL ========= */
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Attendance');

    sheet.columns = [
      { header: 'Họ và tên', key: 'name', width: 25 },
      { header: 'Cấp bậc', key: 'rank', width: 25 },
      { header: 'Chức vụ', key: 'position', width: 25 },
      { header: 'Đơn vị', key: 'department', width: 20 },
      { header: 'Thời gian', key: 'time', width: 25 },
    ];

    // style header
    sheet.getRow(1).font = { bold: true };

    data.forEach((item) => {
      sheet.addRow({
        name: item.user?.name || '',
        rank: item.user?.rank || '',
        position: item.user?.position || '',
        department: item.user?.department || '',
        time: item.time ? new Date(item.time).toLocaleString('vi-VN') : '',
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
