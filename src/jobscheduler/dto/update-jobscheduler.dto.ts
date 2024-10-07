import { PartialType } from '@nestjs/mapped-types';
import { CreateJobschedulerDto } from './create-jobscheduler.dto';

export class UpdateJobschedulerDto extends PartialType(CreateJobschedulerDto) {
  id: number;
}
