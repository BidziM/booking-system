import { Test, TestingModule } from '@nestjs/testing';
import { JobschedulerService } from './jobscheduler.service';

describe('JobschedulerService', () => {
  let service: JobschedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobschedulerService],
    }).compile();

    service = module.get<JobschedulerService>(JobschedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
