import { Injectable, OnModuleInit } from '@nestjs/common';
//import { CreateJobschedulerDto } from './dto/create-jobscheduler.dto';
//import { UpdateJobschedulerDto } from './dto/update-jobscheduler.dto';

import { CronJobs } from './cronjobs.services';
import { PrismaService } from 'src/prisma/prisma.service';
import { SeatCronJob } from '@prisma/client';
import schedule from 'node-schedule';
import { Jobs } from './enumJobs';
import { LoggerService } from 'src/logger/logger.service';

type singleJob = {
  //Id is force to be string becouse of node-schedule library it is checking if specific name is a string
  id: string;
  name?: string;
  data: {
    status?: string;
    dateToExecute?: Date | string;
    transactionId?: number;
    type: Jobs;
  };
};

type TypeOfJobs = singleJob | SeatCronJob;

function isRawData(job: unknown): job is singleJob {
  return (job as singleJob).data !== undefined;
}

const constJobs = (): singleJob[] => [
  {
    id: 'fetchDataFromDb',
    data: {
      dateToExecute: '0 * * * *',
      type: Jobs.FETCH_DATA,
    },
  },
];

@Injectable()
export class JobschedulerService implements OnModuleInit {
  private cronClass: CronJobs;
  /**
   * Creates an instance of Jobscheduler.
   * @param {singleJob} constJobs Array of single jobs to execute
   * @param {CronJobs} cronClass Class with methods to operate on jobs
   * @memberof JobschedulerService
   **/
  constructor(private prisma: PrismaService, private logger: LoggerService) {
    this.cronClass = new CronJobs(this.prisma, this.logger);
  }
  onModuleInit() {
    this.fetchTasksFromDB();
  }
  async fetchTasksFromDB() {
    console.log('fetch from db');
    const fetchedJobs = await this.cronClass.fetchTasksFromDB();
    const taskToDo = [...constJobs(), ...this.transformJobs(fetchedJobs)];
    this.purgeAllTasks();
    taskToDo.map((task) => this.addCronTask(task));
  }
  private transformJobs(fetchedJobs: SeatCronJob[]) {
    return fetchedJobs.map(
      (data): singleJob => ({
        id: `${data.type}_${data.id}`,
        data: {
          status: data.status,
          dateToExecute: data.dateToExecute,
          transactionId: data.transactionId,
          type: Jobs[data.type],
        },
      }),
    );
  }
  public async addCronTask(job: TypeOfJobs) {
    let data;
    if (!isRawData(job)) {
      data = this.transformJobs([job])[0];
    } else {
      data = job;
    }
    const isOld = await this.checkIfAnyOldJobs(data);
    if (isOld) {
      return;
    }
    return schedule.scheduleJob(data.id, data.data.dateToExecute, () =>
      this.selectTask(data).catch((e) => console.log(e)),
    );
  }
  /**
   * @param {singleJob} job
   * @returns {boolean}
   * @description Check if there is any undone past task to run.
   */
  private async checkIfAnyOldJobs(job: singleJob): Promise<boolean> {
    try {
      //Check if date is in the past
      if (
        job.data.dateToExecute instanceof Date &&
        new Date() > job.data.dateToExecute
      ) {
        await this.selectTask(job);
        return true;
      }

      return false;
    } catch (e) {
      console.log(e);
    }
  }
  /**
   * @param {singleJob} job
   * @description Function to select whitch task to run.
   */
  private selectTask(job: singleJob) {
    switch (job.data.type) {
      case Jobs.UNLOCK_SEAT:
        return this.cronClass.UnlockSeats(job.data.transactionId);
      case Jobs.FETCH_DATA:
        return this.fetchTasksFromDB();
    }
  }
  /**
   * @param {string} id
   * @description Cancele task.
   */
  public cancelTask(id: string) {
    return schedule.scheduledJobs[id].cancel();
  }
  /**
   * @description Purge all tasks in current schedule
   */
  private purgeAllTasks() {
    for (const job in schedule.scheduledJobs) schedule.cancelJob(job);
  }
}
