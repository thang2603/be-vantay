import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true })
  userCode: string;

  @Prop()
  name: string;

  @Prop()
  rank: string;

  @Prop()
  position: string;

  @Prop()
  department: string;

  @Prop({ default: null })
  fingerprintId: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
