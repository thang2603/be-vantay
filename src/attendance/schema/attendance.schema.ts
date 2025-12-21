import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
@Schema({ timestamps: true })
export class Attendance extends Document {
  @Prop()
  userCode: string;

  @Prop()
  fingerprintId: number;

  @Prop()
  deviceId: string;

  @Prop()
  time: Date;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
