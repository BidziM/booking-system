import { Test, TestingModule } from '@nestjs/testing';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { generateSeats } from './utils/generateSeats';
import teatrPlan from '../../teatrPlan.json';

// describe('PerformanceController', () => {
//   let controller: PerformanceController;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [PerformanceController],
//       providers: [PerformanceService],
//     }).compile();

//     controller = module.get<PerformanceController>(PerformanceController);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });
// });

describe('createPerformanceSeats', () => {
  test('generate seats', () => {
    expect(generateSeats(teatrPlan, 1)).toBe(Array);
  });
});
