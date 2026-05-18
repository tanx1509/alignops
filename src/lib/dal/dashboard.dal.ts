import {
  CheckinWindowStatus,
  CycleStatus,
  GoalSheetStatus,
} from '@prisma/client'

import { prisma } from '@/lib/db/prisma'

export async function getEmployeeOperatingSystem(employeeId: string) {
  const sheet = await prisma.goalSheet.findFirst({
    where: {
      deletedAt: null,
      employeeId,
    },
    include: {
      approvalEvents: {
        include: {
          actor: {
            select: {
              fullName: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
      cycle: {
        include: {
          checkinWindows: {
            orderBy: {
              sequence: 'asc',
            },
          },
        },
      },
      goals: {
        include: {
          achievementUpdates: {
            include: {
              checkinWindow: {
                select: {
                  name: true,
                  sequence: true,
                },
              },
            },
            orderBy: {
              submittedAt: 'desc',
            },
          },
          sharedGoalLink: {
            include: {
              sharedGoalDefinition: {
                select: {
                  description: true,
                  direction: true,
                  targetDate: true,
                  targetNumeric: true,
                  thrustArea: true,
                  title: true,
                  uomType: true,
                },
              },
            },
          },
        },
        orderBy: {
          sortOrder: 'asc',
        },
        where: {
          deletedAt: null,
        },
      },
      manager: {
        select: {
          fullName: true,
          title: true,
        },
      },
      orgUnit: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return sheet
}

export async function getEmployeeCheckInDesk(employeeId: string) {
  const sheet = await getEmployeeOperatingSystem(employeeId)

  if (!sheet) {
    return null
  }

  const openWindow =
    sheet.cycle.checkinWindows.find((window) => window.status === CheckinWindowStatus.OPEN) ??
    sheet.cycle.checkinWindows[0] ??
    null

  return {
    openWindow,
    sheet,
  }
}

export async function getManagerOperatingQueue(managerId: string) {
  const [sheets, escalations, notifications] = await Promise.all([
    prisma.goalSheet.findMany({
      where: {
        deletedAt: null,
        managerId,
      },
      include: {
        approvalEvents: {
          include: {
            actor: {
              select: {
                fullName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 3,
        },
        cycle: {
          include: {
            checkinWindows: {
              orderBy: {
                sequence: 'asc',
              },
            },
          },
        },
        employee: {
          select: {
            employeeCode: true,
            fullName: true,
            title: true,
          },
        },
        goals: {
          include: {
            achievementUpdates: {
              orderBy: {
                submittedAt: 'desc',
              },
              take: 1,
            },
            sharedGoalLink: {
              include: {
                sharedGoalDefinition: {
                  select: {
                    description: true,
                    direction: true,
                    targetDate: true,
                    targetNumeric: true,
                    thrustArea: true,
                    title: true,
                    uomType: true,
                  },
                },
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
          where: {
            deletedAt: null,
          },
        },
        orgUnit: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          status: 'desc',
        },
        {
          updatedAt: 'desc',
        },
      ],
    }),
    prisma.escalationEvent.findMany({
      where: {
        managerId,
        status: {
          in: ['OPEN', 'ACKNOWLEDGED'],
        },
      },
      include: {
        employee: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        dueAt: 'asc',
      },
      take: 6,
    }),
    prisma.notification.findMany({
      where: {
        recipientId: managerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 5,
    }),
  ])

  return {
    escalations,
    notifications,
    sheets,
  }
}

export async function getAdminControlTower() {
  const [sheets, cycles, orgUnits, auditLogs, escalations] = await Promise.all([
    prisma.goalSheet.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        approvalEvents: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
        cycle: {
          select: {
            code: true,
            checkinWindows: {
              orderBy: {
                sequence: 'asc',
              },
            },
            endsAt: true,
            name: true,
            startsAt: true,
            status: true,
          },
        },
        employee: {
          select: {
            fullName: true,
            title: true,
          },
        },
        goals: {
          include: {
            achievementUpdates: {
              include: {
                checkinWindow: {
                  select: {
                    name: true,
                    sequence: true,
                  },
                },
              },
              orderBy: {
                submittedAt: 'desc',
              },
            },
            sharedGoalLink: {
              include: {
                sharedGoalDefinition: {
                  select: {
                    description: true,
                    direction: true,
                    targetDate: true,
                    targetNumeric: true,
                    thrustArea: true,
                    title: true,
                    uomType: true,
                  },
                },
              },
            },
          },
          where: {
            deletedAt: null,
          },
        },
        manager: {
          select: {
            fullName: true,
          },
        },
        orgUnit: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    }),
    prisma.cycle.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: {
        startsAt: 'desc',
      },
    }),
    prisma.orgUnit.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        members: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    }),
    prisma.auditLog.findMany({
      include: {
        actor: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    }),
    prisma.escalationEvent.findMany({
      where: {
        status: {
          in: ['OPEN', 'ACKNOWLEDGED'],
        },
      },
      include: {
        employee: {
          select: {
            fullName: true,
          },
        },
        manager: {
          select: {
            fullName: true,
          },
        },
      },
      orderBy: {
        dueAt: 'asc',
      },
      take: 12,
    }),
  ])

  const activeCycle = cycles.find((cycle) => cycle.status === CycleStatus.ACTIVE) ?? cycles[0] ?? null

  return {
    activeCycle,
    auditLogs,
    cycles,
    escalations,
    orgUnits,
    sheets,
  }
}

export function getStatusCount(
  sheets: Array<{ status: GoalSheetStatus }>,
  status: GoalSheetStatus,
) {
  return sheets.filter((sheet) => sheet.status === status).length
}
