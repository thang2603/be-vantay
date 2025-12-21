import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schema/users.schema';
import { Model } from 'mongoose';
import { type UserDto } from 'src/share/types/users.dto';
import { UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}
  async create(dto: UserDto) {
    const created = new this.model(dto);
    return created.save();
  }

  async findAll() {
    return this.model.find();
  }

  async findOne(userCode: string) {
    return this.model.findOne({ userCode });
  }

  async assignFingerprint(userCode: string, fingerprintId: number) {
    return this.model.updateOne({ userCode }, { fingerprintId });
  }

  async findByFingerprint(fingerprintId: number) {
    return this.model.findOne({ fingerprintId });
  }
  async updateUser(userCode: string, updateDto: UpdateUserDto) {
    return this.model.findOneAndUpdate(
      { userCode },
      {
        $set: updateDto,
      },
      {
        new: true,
        runValidators: true,
      },
    );
  }
}
