import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { DeviceCommandService } from './device-command.service';
import { UsersService } from 'src/users/users.service';
import { AttendanceGateway } from 'src/attendance/attendance.gateway';

@Controller('api/device-command')
export class DeviceCommandController {
  constructor(
    private devices: DeviceCommandService,
    private users: UsersService,
    private gateway: AttendanceGateway,
  ) {}

  @Post('request-enroll')
  async requestEnroll(
    @Body() body: { deviceId: string; userCode: string; action: string },
  ) {
    await this.devices.requestEnroll(body.deviceId, body.userCode, body.action);
    return { message: 'Đăng kí thành công' };
  }

  @Get('request-enroll')
  async findRequestEnroll(@Query('deviceId') deviceId: string) {
    const res = await this.devices.findRequestEnroll(deviceId);
    return res;
  }

  @Post('enroll-result')
  async enrollResult(
    @Body() body: { deviceId: string; status: string; fingerprintId: number },
  ) {
    if (body.status === 'SUCCESS') {
      const res = await this.devices.findRequestEnroll(body.deviceId);
      const userCode = res?.userCode;

      if (userCode) {
        await this.users.assignFingerprint(userCode, body.fingerprintId);
        await this.devices.requestEnroll(body.deviceId, userCode, 'NONE');
        this.gateway.emitFingerprint({
          fingerprintId: body.fingerprintId,
          userCode,
        });
      }
    }

    return { ok: true };
  }
}
