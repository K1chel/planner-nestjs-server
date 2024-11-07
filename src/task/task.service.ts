import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TaskDto } from './dto/task.dto';

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  getById(taskId: string) {
    return this.prisma.task.findUnique({
      where: { id: taskId },
    });
  }

  async getAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
    });
  }

  async create(dto: TaskDto, userId: string) {
    return this.prisma.task.create({
      data: {
        ...dto,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
  }

  async update(dto: Partial<TaskDto>, taskId: string, userId: string) {
    const existingTask = await this.getById(taskId);

    if (!existingTask) throw new NotFoundException('Task not found');

    return this.prisma.task.update({
      where: { id: taskId, userId },
      data: dto,
    });
  }

  async delete(taskId: string) {
    const existingTask = await this.getById(taskId);

    if (!existingTask) throw new NotFoundException('Task not found');

    return this.prisma.task.delete({
      where: { id: taskId },
    });
  }
}
