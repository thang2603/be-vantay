import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class DeviceCommand extends Document {
  @Prop()
  deviceId: string;

  @Prop({ enum: ['NONE', 'ENROLL'], default: 'NONE' })
  action: string;

  @Prop()
  fingerprintId: number;

  @Prop()
  userCode: string;
}

export const DeviceCommandSchema = SchemaFactory.createForClass(DeviceCommand);
