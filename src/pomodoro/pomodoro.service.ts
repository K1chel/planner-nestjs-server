import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { PomodoroRoundDto, PomodoroSessionDto } from './dto/pomodoro.dto';

@Injectable()
export class PomodoroService {
  constructor(private readonly prisma: PrismaService) {}

  async getTodaySession(userId: string) {
    const today = new Date().toISOString().split('T')[0];

    return this.prisma.pomodoroSession.findFirst({
      where: {
        createdAt: { gte: new Date(today) },
        userId,
      },
      include: {
        rounds: {
          orderBy: { id: 'desc' },
        },
      },
    });
  }

  async create(userId: string) {
    const todaySession = await this.getTodaySession(userId);

    if (todaySession) return;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { intervalsCount: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return this.prisma.pomodoroSession.create({
      data: {
        rounds: {
          createMany: {
            data: Array.from({ length: user.intervalsCount }, () => ({
              totalSeconds: 0,
            })),
          },
        },
        user: {
          connect: { id: userId },
        },
      },
      include: {
        rounds: true,
      },
    });
  }

  async update(
    dto: Partial<PomodoroSessionDto>,
    pomodoroId: string,
    userId: string,
  ) {
    return this.prisma.pomodoroSession.update({
      where: {
        id: pomodoroId,
        userId,
      },
      data: dto,
    });
  }

  async updateRound(dto: Partial<PomodoroRoundDto>, roundId: string) {
    const round = await this.getRoundById(roundId);

    if (!round) throw new NotFoundException('Round not found');

    return this.prisma.pomodoroRound.update({
      where: { id: roundId },
      data: dto,
    });
  }

  async deleteSession(sessionId: string, userId: string) {
    const session = await this.getSessionById(sessionId);

    if (!session) throw new NotFoundException('Session not found');

    return this.prisma.pomodoroSession.delete({
      where: {
        id: sessionId,
        userId,
      },
    });
  }

  async getRoundById(roundId: string) {
    return this.prisma.pomodoroRound.findUnique({
      where: { id: roundId },
    });
  }

  async getSessionById(sessionId: string) {
    return this.prisma.pomodoroSession.findUnique({
      where: { id: sessionId },
    });
  }
}
