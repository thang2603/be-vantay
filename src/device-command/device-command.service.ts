import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DeviceCommand } from './schema/device-command.schema';

@Injectable()
export class DeviceCommandService {
  constructor(
    @InjectModel(DeviceCommand.name)
    private model: Model<DeviceCommand>,
  ) {}
  async requestEnroll(deviceId: string, userCode: string, action: string) {
    return this.model.findOneAndUpdate(
      { deviceId }, // điều kiện tìm
      {
        $set: {
          action,
          userCode,
        },
      },
      {
        upsert: true, // KHÔNG có → tạo mới
        new: true, // trả về document sau khi update/insert
        setDefaultsOnInsert: true, // áp dụng default trong schema nếu tạo mới
      },
    );
  }

  async findRequestEnroll(deviceId: string) {
    return this.model.findOne({ deviceId });
  }
}
