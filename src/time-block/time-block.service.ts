import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { TimeBlockDto } from './dto/time-block.dto';

@Injectable()
export class TimeBlockService {
  constructor(private prisma: PrismaService) {}

  async getById(timeBlockId: string) {
    return this.prisma.timeBlock.findUnique({ where: { id: timeBlockId } });
  }

  async getAll(userId: string) {
    return this.prisma.timeBlock.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });
  }

  async create(dto: TimeBlockDto, userId: string) {
    return this.prisma.timeBlock.create({
      data: {
        ...dto,
        user: { connect: { id: userId } },
      },
    });
  }

  async update(
    dto: Partial<TimeBlockDto>,
    timeBlockId: string,
    userId: string,
  ) {
    const existingTimeBlock = await this.getById(timeBlockId);

    if (!existingTimeBlock)
      throw new NotFoundException("Time block doesn't exist");

    return this.prisma.timeBlock.update({
      where: {
        id: timeBlockId,
        userId,
      },
      data: dto,
    });
  }

  async delete(timeBlockId: string, userId: string) {
    const existingTimeBlock = await this.getById(timeBlockId);

    if (!existingTimeBlock)
      throw new NotFoundException("Time block doesn't exist");

    return this.prisma.timeBlock.delete({
      where: {
        id: timeBlockId,
        userId,
      },
    });
  }

  async updateOrder(ids: string[]) {
    return this.prisma.$transaction(
      ids.map((id, order) =>
        this.prisma.timeBlock.update({
          where: { id },
          data: { order },
        }),
      ),
    );
  }
}
