import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class PerformancePipeTime implements PipeTransform {
  transform(value: any) {
    if (typeof value === 'string') {
      return new Date(value).toISOString();
    }
    return value;
  }
}
