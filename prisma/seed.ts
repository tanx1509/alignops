import {
  AchievementStatus,
  AppRole,
  ApprovalAction,
  AuditAction,
  AuditEntityType,
  CheckinWindowStatus,
  CheckinWindowType,
  CycleStatus,
  EscalationLevel,
  EscalationStatus,
  EscalationTriggerType,
  GoalSheetStatus,
  GoalSource,
  GoalStatus,
  MeasurementDirection,
  NotificationStatus,
  NotificationType,
  OrgUnitStatus,
  OrgUnitType,
  PrismaClient,
  RoleAssignmentStatus,
  SharedGoalStatus,
  UomType,
} from "@prisma/client";

const prisma = new PrismaClient();

const id = (value: number) =>
  `00000000-0000-4000-8000-${value.toString().padStart(12, "0")}`;

const dt = (value: string) => new Date(`${value}T00:00:00.000Z`);

const adminId = id(1);
const companyId = id(101);
const peopleId = id(102);
const salesId = id(103);
const operationsId = id(104);
const productId = id(105);
const cycleId = id(201);

const users = [
  {
    id: adminId,
    email: "aditi.rao@alignops.local",
    employeeCode: "AO-0001",
    fullName: "Aditi Rao",
    title: "Head of People Operations",
    primaryOrgUnitId: peopleId,
    role: AppRole.ADMIN,
  },
  {
    id: id(2),
    email: "manav.shah@alignops.local",
    employeeCode: "AO-0101",
    fullName: "Manav Shah",
    title: "Sales Manager",
    primaryOrgUnitId: salesId,
    role: AppRole.MANAGER,
  },
  {
    id: id(3),
    email: "kavya.nair@alignops.local",
    employeeCode: "AO-0201",
    fullName: "Kavya Nair",
    title: "Operations Manager",
    primaryOrgUnitId: operationsId,
    role: AppRole.MANAGER,
  },
  {
    id: id(4),
    email: "rohan.mehta@alignops.local",
    employeeCode: "AO-0301",
    fullName: "Rohan Mehta",
    title: "Product Manager",
    primaryOrgUnitId: productId,
    role: AppRole.MANAGER,
  },
  {
    id: id(11),
    email: "nisha.iyer@alignops.local",
    employeeCode: "AO-0111",
    fullName: "Nisha Iyer",
    title: "Enterprise Sales Executive",
    primaryOrgUnitId: salesId,
    role: AppRole.EMPLOYEE,
  },
  {
    id: id(12),
    email: "arjun.menon@alignops.local",
    employeeCode: "AO-0112",
    fullName: "Arjun Menon",
    title: "Channel Sales Executive",
    primaryOrgUnitId: salesId,
    role: AppRole.EMPLOYEE,
  },
  {
    id: id(13),
    email: "priya.kapoor@alignops.local",
    employeeCode: "AO-0113",
    fullName: "Priya Kapoor",
    title: "Inside Sales Specialist",
    primaryOrgUnitId: salesId,
    role: AppRole.EMPLOYEE,
  },
  {
    id: id(14),
    email: "karan.bedi@alignops.local",
    employeeCode: "AO-0114",
    fullName: "Karan Bedi",
    title: "Key Accounts Associate",
    primaryOrgUnitId: salesId,
    role: AppRole.EMPLOYEE,
  },
  {
    id: id(21),
    email: "meera.joshi@alignops.local",
    employeeCode: "AO-0211",
    fullName: "Meera Joshi",
    title: "Regional Operations Lead",
    primaryOrgUnitId: operationsId,
    role: AppRole.EMPLOYEE,
  },
  {
    id: id(22),
    email: "dev.singh@alignops.local",
    employeeCode: "AO-0212",
    fullName: "Dev Singh",
    title: "Service Operations Analyst",
    primaryOrgUnitId: operationsId,
    role: AppRole.EMPLOYEE,
  },
  {
    id: id(23),
    email: "isha.patel@alignops.local",
    employeeCode: "AO-0213",
    fullName: "Isha Patel",
    title: "Installations Coordinator",
    primaryOrgUnitId: operationsId,
    role: AppRole.EMPLOYEE,
  },
  {
    id: id(24),
    email: "varun.reddy@alignops.local",
    employeeCode: "AO-0214",
    fullName: "Varun Reddy",
    title: "Quality Operations Associate",
    primaryOrgUnitId: operationsId,
    role: AppRole.EMPLOYEE,
  },
  {
    id: id(31),
    email: "tara.sen@alignops.local",
    employeeCode: "AO-0311",
    fullName: "Tara Sen",
    title: "Product Analyst",
    primaryOrgUnitId: productId,
    role: AppRole.EMPLOYEE,
  },
  {
    id: id(32),
    email: "aman.gupta@alignops.local",
    employeeCode: "AO-0312",
    fullName: "Aman Gupta",
    title: "Firmware Engineer",
    primaryOrgUnitId: productId,
    role: AppRole.EMPLOYEE,
  },
  {
    id: id(33),
    email: "sanya.malhotra@alignops.local",
    employeeCode: "AO-0313",
    fullName: "Sanya Malhotra",
    title: "QA Engineer",
    primaryOrgUnitId: productId,
    role: AppRole.EMPLOYEE,
  },
  {
    id: id(34),
    email: "kabir.ali@alignops.local",
    employeeCode: "AO-0314",
    fullName: "Kabir Ali",
    title: "Product Operations Associate",
    primaryOrgUnitId: productId,
    role: AppRole.EMPLOYEE,
  },
];

const managersByOrgUnit = new Map([
  [salesId, id(2)],
  [operationsId, id(3)],
  [productId, id(4)],
]);

const sharedGoals = [
  {
    id: id(301),
    orgUnitId: salesId,
    title: "Improve revenue quality from priority accounts",
    description: "Department KPI shared across sales contributors; achievement is tracked through the primary owner goal.",
    thrustArea: "Revenue Growth",
    uomType: UomType.NUMERIC,
    direction: MeasurementDirection.INCREASE_IS_BETTER,
    targetNumeric: "10000000.00",
    targetDate: null,
    primaryOwnerId: id(11),
  },
  {
    id: id(302),
    orgUnitId: operationsId,
    title: "Reduce service resolution turnaround time",
    description: "Department KPI shared across operations contributors; lower turnaround time is better.",
    thrustArea: "Operational Excellence",
    uomType: UomType.NUMERIC,
    direction: MeasurementDirection.DECREASE_IS_BETTER,
    targetNumeric: "24.00",
    targetDate: null,
    primaryOwnerId: id(21),
  },
  {
    id: id(303),
    orgUnitId: productId,
    title: "Launch reliability release by committed deadline",
    description: "Department KPI shared across product contributors and synchronized from the primary owner goal.",
    thrustArea: "Product Reliability",
    uomType: UomType.TIMELINE,
    direction: MeasurementDirection.DATE_DEADLINE,
    targetNumeric: null,
    targetDate: dt("2027-01-31"),
    primaryOwnerId: id(31),
  },
];

const employeeUsers = users.filter((user) => user.role === AppRole.EMPLOYEE);

function individualGoalTemplates(orgUnitId: string) {
  if (orgUnitId === salesId) {
    return [
      {
        title: "Improve qualified pipeline conversion",
        description: "Increase opportunity-to-win conversion for priority segments.",
        thrustArea: "Revenue Growth",
        uomType: UomType.PERCENTAGE,
        direction: MeasurementDirection.INCREASE_IS_BETTER,
        targetNumeric: "18.00",
        targetDate: null,
        weightage: "40.00",
      },
      {
        title: "Maintain zero discount exception breaches",
        description: "Avoid unauthorized discount exceptions.",
        thrustArea: "Governance",
        uomType: UomType.ZERO_BASED,
        direction: MeasurementDirection.ZERO_IS_SUCCESS,
        targetNumeric: "0.00",
        targetDate: null,
        weightage: "30.00",
      },
    ];
  }

  if (orgUnitId === operationsId) {
    return [
      {
        title: "Reduce installation rework rate",
        description: "Lower avoidable rework across assigned installation cohorts.",
        thrustArea: "Operational Excellence",
        uomType: UomType.PERCENTAGE,
        direction: MeasurementDirection.DECREASE_IS_BETTER,
        targetNumeric: "5.00",
        targetDate: null,
        weightage: "40.00",
      },
      {
        title: "Maintain zero safety incidents",
        description: "No reportable safety incidents in assigned operations.",
        thrustArea: "Safety",
        uomType: UomType.ZERO_BASED,
        direction: MeasurementDirection.ZERO_IS_SUCCESS,
        targetNumeric: "0.00",
        targetDate: null,
        weightage: "30.00",
      },
    ];
  }

  return [
    {
      title: "Reduce defect escape rate",
      description: "Reduce customer-visible defect escapes for assigned product areas.",
      thrustArea: "Product Reliability",
      uomType: UomType.NUMERIC,
      direction: MeasurementDirection.DECREASE_IS_BETTER,
      targetNumeric: "8.00",
      targetDate: null,
      weightage: "40.00",
    },
    {
      title: "Complete roadmap milestone by committed date",
      description: "Deliver assigned milestone by the committed delivery date.",
      thrustArea: "Execution Discipline",
      uomType: UomType.TIMELINE,
      direction: MeasurementDirection.DATE_DEADLINE,
      targetNumeric: null,
      targetDate: dt("2026-12-15"),
      weightage: "30.00",
    },
  ];
}

function sheetFinalStatus(index: number) {
  if (index < 8) return GoalSheetStatus.APPROVED_LOCKED;
  if (index < 10) return GoalSheetStatus.SUBMITTED;
  return GoalSheetStatus.DRAFT;
}

async function main() {
  await prisma.orgUnit.upsert({
    where: { id: companyId },
    update: {},
    create: {
      id: companyId,
      code: "ATOMBERG",
      name: "Atomberg",
      type: OrgUnitType.COMPANY,
      status: OrgUnitStatus.ACTIVE,
      createdById: adminId,
      updatedById: adminId,
    },
  });

  for (const unit of [
    { id: peopleId, code: "PEOPLE", name: "People Operations", type: OrgUnitType.FUNCTION },
    { id: salesId, code: "SALES", name: "Sales", type: OrgUnitType.DEPARTMENT },
    { id: operationsId, code: "OPS", name: "Operations", type: OrgUnitType.DEPARTMENT },
    { id: productId, code: "PRODUCT", name: "Product", type: OrgUnitType.DEPARTMENT },
  ]) {
    await prisma.orgUnit.upsert({
      where: { id: unit.id },
      update: {
        code: unit.code,
        name: unit.name,
        type: unit.type,
        parentId: companyId,
        updatedById: adminId,
      },
      create: {
        ...unit,
        parentId: companyId,
        status: OrgUnitStatus.ACTIVE,
        createdById: adminId,
        updatedById: adminId,
      },
    });
  }

  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email,
        employeeCode: user.employeeCode,
        fullName: user.fullName,
        title: user.title,
        primaryOrgUnitId: user.primaryOrgUnitId,
      },
      create: {
        id: user.id,
        authProviderId: user.id,
        email: user.email,
        employeeCode: user.employeeCode,
        fullName: user.fullName,
        title: user.title,
        primaryOrgUnitId: user.primaryOrgUnitId,
      },
    });

    await prisma.roleAssignment.upsert({
      where: { id: id(1000 + Number(user.employeeCode.slice(-4))) },
      update: {
        role: user.role,
        orgUnitId: user.primaryOrgUnitId,
        status: RoleAssignmentStatus.ACTIVE,
        updatedById: adminId,
      },
      create: {
        id: id(1000 + Number(user.employeeCode.slice(-4))),
        userId: user.id,
        role: user.role,
        orgUnitId: user.primaryOrgUnitId,
        status: RoleAssignmentStatus.ACTIVE,
        startsAt: dt("2026-05-01"),
        createdById: adminId,
        updatedById: adminId,
      },
    });
  }

  for (const manager of users.filter((user) => user.role === AppRole.MANAGER)) {
    await prisma.reportingLine.upsert({
      where: {
        employeeId_managerId_effectiveFrom: {
          employeeId: manager.id,
          managerId: adminId,
          effectiveFrom: dt("2026-05-01"),
        },
      },
      update: { updatedById: adminId },
      create: {
        id: id(4000 + Number(manager.employeeCode.slice(-4))),
        employeeId: manager.id,
        managerId: adminId,
        orgUnitId: manager.primaryOrgUnitId,
        effectiveFrom: dt("2026-05-01"),
        createdById: adminId,
        updatedById: adminId,
      },
    });
  }

  for (const employee of employeeUsers) {
    const managerId = managersByOrgUnit.get(employee.primaryOrgUnitId);

    if (!managerId) {
      throw new Error(`No manager configured for ${employee.fullName}`);
    }

    await prisma.reportingLine.upsert({
      where: {
        employeeId_managerId_effectiveFrom: {
          employeeId: employee.id,
          managerId,
          effectiveFrom: dt("2026-05-01"),
        },
      },
      update: { updatedById: adminId },
      create: {
        id: id(4000 + Number(employee.employeeCode.slice(-4))),
        employeeId: employee.id,
        managerId,
        orgUnitId: employee.primaryOrgUnitId,
        effectiveFrom: dt("2026-05-01"),
        createdById: adminId,
        updatedById: adminId,
      },
    });
  }

  await prisma.cycle.upsert({
    where: { id: cycleId },
    update: {
      code: "FY2026",
      name: "FY2026 Goal Cycle",
      status: CycleStatus.ACTIVE,
      startsAt: dt("2026-05-01"),
      endsAt: dt("2027-04-30"),
      updatedById: adminId,
    },
    create: {
      id: cycleId,
      code: "FY2026",
      name: "FY2026 Goal Cycle",
      status: CycleStatus.ACTIVE,
      startsAt: dt("2026-05-01"),
      endsAt: dt("2027-04-30"),
      createdById: adminId,
      updatedById: adminId,
    },
  });

  const windows = [
    [id(211), CheckinWindowType.GOAL_SETTING, "Goal Setting", CheckinWindowStatus.OPEN, 1, "2026-05-01", "2026-06-15"],
    [id(212), CheckinWindowType.Q1, "Q1 Check-in", CheckinWindowStatus.NOT_OPEN, 2, "2026-07-01", "2026-07-31"],
    [id(213), CheckinWindowType.Q2, "Q2 Check-in", CheckinWindowStatus.NOT_OPEN, 3, "2026-10-01", "2026-10-31"],
    [id(214), CheckinWindowType.Q3, "Q3 Check-in", CheckinWindowStatus.NOT_OPEN, 4, "2027-01-01", "2027-01-31"],
    [id(215), CheckinWindowType.Q4_ANNUAL, "Q4 / Annual Check-in", CheckinWindowStatus.NOT_OPEN, 5, "2027-03-01", "2027-04-30"],
  ] as const;

  for (const [windowId, type, name, status, sequence, opensAt, closesAt] of windows) {
    await prisma.checkinWindow.upsert({
      where: { id: windowId },
      update: {
        type,
        name,
        status,
        sequence,
        opensAt: dt(opensAt),
        closesAt: dt(closesAt),
        updatedById: adminId,
      },
      create: {
        id: windowId,
        cycleId,
        type,
        name,
        status,
        sequence,
        opensAt: dt(opensAt),
        closesAt: dt(closesAt),
        createdById: adminId,
        updatedById: adminId,
      },
    });
  }

  for (const sharedGoal of sharedGoals) {
    await prisma.sharedGoalDefinition.upsert({
      where: { id: sharedGoal.id },
      update: {
        status: SharedGoalStatus.ACTIVE,
        title: sharedGoal.title,
        description: sharedGoal.description,
        thrustArea: sharedGoal.thrustArea,
        uomType: sharedGoal.uomType,
        direction: sharedGoal.direction,
        targetNumeric: sharedGoal.targetNumeric,
        targetDate: sharedGoal.targetDate,
        primaryOwnerId: sharedGoal.primaryOwnerId,
        updatedById: adminId,
      },
      create: {
        id: sharedGoal.id,
        cycleId,
        orgUnitId: sharedGoal.orgUnitId,
        status: SharedGoalStatus.ACTIVE,
        title: sharedGoal.title,
        description: sharedGoal.description,
        thrustArea: sharedGoal.thrustArea,
        uomType: sharedGoal.uomType,
        direction: sharedGoal.direction,
        targetNumeric: sharedGoal.targetNumeric,
        targetDate: sharedGoal.targetDate,
        primaryOwnerId: sharedGoal.primaryOwnerId,
        createdById: adminId,
        updatedById: adminId,
      },
    });
  }

  for (const [index, employee] of employeeUsers.entries()) {
    const managerId = managersByOrgUnit.get(employee.primaryOrgUnitId);
    const finalStatus = sheetFinalStatus(index);
    const employeeNumber = Number(employee.employeeCode.slice(-4));
    const sheetId = id(5000 + Number(employee.employeeCode.slice(-4)));
    const sharedDefinition = sharedGoals.find((goal) => goal.orgUnitId === employee.primaryOrgUnitId);

    if (!managerId || !sharedDefinition) {
      throw new Error(`Missing manager or shared goal for ${employee.fullName}`);
    }

    await prisma.goalSheet.upsert({
      where: { id: sheetId },
      update: {
        cycleId,
        employeeId: employee.id,
        managerId,
        orgUnitId: employee.primaryOrgUnitId,
        status: GoalSheetStatus.DRAFT,
        updatedById: employee.id,
      },
      create: {
        id: sheetId,
        cycleId,
        employeeId: employee.id,
        managerId,
        orgUnitId: employee.primaryOrgUnitId,
        status: GoalSheetStatus.DRAFT,
        createdById: employee.id,
        updatedById: employee.id,
      },
    });

    const sharedGoalId = id(6000 + Number(employee.employeeCode.slice(-4)) * 10 + 1);
    await prisma.goal.upsert({
      where: { id: sharedGoalId },
      update: {
        source: GoalSource.SHARED,
        status: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? GoalStatus.LOCKED : GoalStatus.ACTIVE,
        title: sharedDefinition.title,
        description: sharedDefinition.description,
        thrustArea: sharedDefinition.thrustArea,
        uomType: sharedDefinition.uomType,
        direction: sharedDefinition.direction,
        targetNumeric: sharedDefinition.targetNumeric,
        targetDate: sharedDefinition.targetDate,
        lockedAt: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? dt("2026-05-20") : null,
        weightage: "30.00",
        updatedById: employee.id,
      },
      create: {
        id: sharedGoalId,
        goalSheetId: sheetId,
        source: GoalSource.SHARED,
        status: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? GoalStatus.LOCKED : GoalStatus.ACTIVE,
        sortOrder: 1,
        title: sharedDefinition.title,
        description: sharedDefinition.description,
        thrustArea: sharedDefinition.thrustArea,
        uomType: sharedDefinition.uomType,
        direction: sharedDefinition.direction,
        targetNumeric: sharedDefinition.targetNumeric,
        targetDate: sharedDefinition.targetDate,
        weightage: "30.00",
        lockedAt: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? dt("2026-05-20") : null,
        createdById: employee.id,
        updatedById: employee.id,
      },
    });

    await prisma.sharedGoalLink.upsert({
      where: { id: id(7000 + Number(employee.employeeCode.slice(-4))) },
      update: {
        sharedGoalDefinitionId: sharedDefinition.id,
        recipientGoalId: sharedGoalId,
        recipientUserId: employee.id,
        goalSheetId: sheetId,
        isPrimaryOwnerLink: sharedDefinition.primaryOwnerId === employee.id,
        updatedById: adminId,
      },
      create: {
        id: id(7000 + Number(employee.employeeCode.slice(-4))),
        sharedGoalDefinitionId: sharedDefinition.id,
        recipientGoalId: sharedGoalId,
        recipientUserId: employee.id,
        goalSheetId: sheetId,
        acceptedAt: dt("2026-05-10"),
        isPrimaryOwnerLink: sharedDefinition.primaryOwnerId === employee.id,
        createdById: adminId,
        updatedById: adminId,
      },
    });

    if (sharedDefinition.primaryOwnerId === employee.id) {
      await prisma.sharedGoalDefinition.update({
        where: { id: sharedDefinition.id },
        data: {
          primaryOwnerGoalId: sharedGoalId,
          updatedById: adminId,
        },
      });
    }

    const individualGoals = individualGoalTemplates(employee.primaryOrgUnitId);

    for (const [goalIndex, goal] of individualGoals.entries()) {
      await prisma.goal.upsert({
        where: { id: id(6000 + Number(employee.employeeCode.slice(-4)) * 10 + goalIndex + 2) },
        update: {
          ...goal,
          source: GoalSource.INDIVIDUAL,
          status: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? GoalStatus.LOCKED : GoalStatus.ACTIVE,
          lockedAt: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? dt("2026-05-20") : null,
          updatedById: employee.id,
        },
        create: {
          id: id(6000 + Number(employee.employeeCode.slice(-4)) * 10 + goalIndex + 2),
          goalSheetId: sheetId,
          source: GoalSource.INDIVIDUAL,
          status: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? GoalStatus.LOCKED : GoalStatus.ACTIVE,
          sortOrder: goalIndex + 2,
          ...goal,
          lockedAt: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? dt("2026-05-20") : null,
          createdById: employee.id,
          updatedById: employee.id,
        },
      });
    }

    const sheetGoalIds = [
      sharedGoalId,
      ...individualGoals.map((_, goalIndex) => id(6000 + employeeNumber * 10 + goalIndex + 2)),
    ];

    if (finalStatus !== GoalSheetStatus.DRAFT) {
      for (const [goalIndex, goalId] of sheetGoalIds.entries()) {
        const baseProgress = finalStatus === GoalSheetStatus.APPROVED_LOCKED ? 58 : 28;
        const progress = Math.min(100, baseProgress + index * 3 + goalIndex * 6);
        const status =
          progress >= 92
            ? AchievementStatus.COMPLETED
            : progress > 0
              ? AchievementStatus.ON_TRACK
              : AchievementStatus.NOT_STARTED;

        await prisma.achievementUpdate.upsert({
          where: {
            goalId_checkinWindowId: {
              checkinWindowId: id(211),
              goalId,
            },
          },
          update: {
            actualNumeric: progress.toFixed(2),
            employeeComment:
              progress >= 70
                ? "Execution is on track with clear next milestones."
                : "Early progress logged; manager input requested on prioritization.",
            enteredById: employee.id,
            progressScore: progress.toFixed(2),
            status,
            submittedAt: dt("2026-05-17"),
            updatedById: employee.id,
          },
          create: {
            id: id(8800 + employeeNumber * 10 + goalIndex),
            actualNumeric: progress.toFixed(2),
            checkinWindowId: id(211),
            createdById: employee.id,
            employeeComment:
              progress >= 70
                ? "Execution is on track with clear next milestones."
                : "Early progress logged; manager input requested on prioritization.",
            enteredById: employee.id,
            goalId,
            progressScore: progress.toFixed(2),
            status,
            submittedAt: dt("2026-05-17"),
            updatedById: employee.id,
          },
        });
      }

      if (finalStatus === GoalSheetStatus.APPROVED_LOCKED) {
        await prisma.checkinComment.upsert({
          where: {
            goalSheetId_checkinWindowId_managerId: {
              checkinWindowId: id(211),
              goalSheetId: sheetId,
              managerId,
            },
          },
          update: {
            comment: "Reviewed goal-setting progress. Execution plan is credible; continue weekly updates.",
            discussionDate: dt("2026-05-18"),
            updatedById: managerId,
          },
          create: {
            id: id(8900 + employeeNumber),
            checkinWindowId: id(211),
            comment: "Reviewed goal-setting progress. Execution plan is credible; continue weekly updates.",
            createdById: managerId,
            discussionDate: dt("2026-05-18"),
            goalSheetId: sheetId,
            managerId,
            updatedById: managerId,
          },
        });
      }
    }

    if (finalStatus !== GoalSheetStatus.DRAFT) {
      await prisma.goalSheet.update({
        where: { id: sheetId },
        data: {
          status: finalStatus,
          returnedAt: finalStatus === GoalSheetStatus.SUBMITTED && index === 8 ? dt("2026-05-14") : null,
          submittedAt: dt("2026-05-12"),
          approvedAt: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? dt("2026-05-20") : null,
          approvedById: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? managerId : null,
          lockedAt: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? dt("2026-05-20") : null,
          lockReason: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? "Manager approval completed" : null,
          updatedById: finalStatus === GoalSheetStatus.APPROVED_LOCKED ? managerId : employee.id,
        },
      });

      await prisma.approvalEvent.upsert({
        where: { id: id(8000 + Number(employee.employeeCode.slice(-4)) * 10 + 1) },
        update: {},
        create: {
          id: id(8000 + Number(employee.employeeCode.slice(-4)) * 10 + 1),
          goalSheetId: sheetId,
          actorId: employee.id,
          action: ApprovalAction.SUBMITTED,
          fromStatus: GoalSheetStatus.DRAFT,
          toStatus: GoalSheetStatus.SUBMITTED,
          comment: "Submitted for manager review.",
          createdAt: dt("2026-05-12"),
        },
      });

      await prisma.auditLog.upsert({
        where: { id: id(8100 + employeeNumber * 10 + 1) },
        update: {},
        create: {
          id: id(8100 + employeeNumber * 10 + 1),
          action: AuditAction.SUBMIT,
          actorId: employee.id,
          actorRole: AppRole.EMPLOYEE,
          after: { status: GoalSheetStatus.SUBMITTED },
          before: { status: GoalSheetStatus.DRAFT },
          createdAt: dt("2026-05-12"),
          entityId: sheetId,
          entityType: AuditEntityType.GOAL_SHEET,
          reason: "Seeded goal submission for FY2026 demo cycle.",
        },
      });
    }

    if (finalStatus === GoalSheetStatus.SUBMITTED && index === 8) {
      await prisma.approvalEvent.upsert({
        where: { id: id(8000 + employeeNumber * 10 + 2) },
        update: {},
        create: {
          id: id(8000 + employeeNumber * 10 + 2),
          goalSheetId: sheetId,
          actorId: managerId,
          action: ApprovalAction.RETURNED,
          fromStatus: GoalSheetStatus.SUBMITTED,
          toStatus: GoalSheetStatus.RETURNED,
          comment: "Returned once for sharper KPI target calibration.",
          createdAt: dt("2026-05-14"),
        },
      });

      await prisma.approvalEvent.upsert({
        where: { id: id(8000 + employeeNumber * 10 + 3) },
        update: {},
        create: {
          id: id(8000 + employeeNumber * 10 + 3),
          goalSheetId: sheetId,
          actorId: employee.id,
          action: ApprovalAction.RESUBMITTED,
          fromStatus: GoalSheetStatus.RETURNED,
          toStatus: GoalSheetStatus.SUBMITTED,
          comment: "Updated KPI target and resubmitted for approval.",
          createdAt: dt("2026-05-16"),
        },
      });

      await prisma.auditLog.upsert({
        where: { id: id(8100 + employeeNumber * 10 + 2) },
        update: {},
        create: {
          id: id(8100 + employeeNumber * 10 + 2),
          action: AuditAction.RETURN,
          actorId: managerId,
          actorRole: AppRole.MANAGER,
          after: { status: GoalSheetStatus.RETURNED },
          before: { status: GoalSheetStatus.SUBMITTED },
          createdAt: dt("2026-05-14"),
          entityId: sheetId,
          entityType: AuditEntityType.GOAL_SHEET,
          reason: "KPI target required sharper calibration.",
        },
      });
    }

    if (finalStatus === GoalSheetStatus.APPROVED_LOCKED) {
      await prisma.approvalEvent.upsert({
        where: { id: id(8000 + Number(employee.employeeCode.slice(-4)) * 10 + 2) },
        update: {},
        create: {
          id: id(8000 + Number(employee.employeeCode.slice(-4)) * 10 + 2),
          goalSheetId: sheetId,
          actorId: managerId,
          action: ApprovalAction.APPROVED,
          fromStatus: GoalSheetStatus.SUBMITTED,
          toStatus: GoalSheetStatus.APPROVED_LOCKED,
          comment: "Approved and locked for FY2026.",
          createdAt: dt("2026-05-20"),
        },
      });

      await prisma.auditLog.upsert({
        where: { id: id(8100 + employeeNumber * 10 + 2) },
        update: {},
        create: {
          id: id(8100 + employeeNumber * 10 + 2),
          action: AuditAction.APPROVE,
          actorId: managerId,
          actorRole: AppRole.MANAGER,
          after: { status: GoalSheetStatus.APPROVED_LOCKED },
          before: { status: GoalSheetStatus.SUBMITTED },
          createdAt: dt("2026-05-20"),
          entityId: sheetId,
          entityType: AuditEntityType.GOAL_SHEET,
          reason: "Manager approval completed for FY2026.",
        },
      });
    }
  }

  for (const rule of [
    {
      id: id(901),
      name: "Goal submission overdue",
      triggerType: EscalationTriggerType.EMPLOYEE_GOALS_NOT_SUBMITTED,
      thresholdDays: 7,
      repeatEveryDays: 3,
      maxLevel: EscalationLevel.HR,
    },
    {
      id: id(902),
      name: "Manager approval overdue",
      triggerType: EscalationTriggerType.MANAGER_APPROVAL_OVERDUE,
      thresholdDays: 5,
      repeatEveryDays: 2,
      maxLevel: EscalationLevel.HR,
    },
    {
      id: id(903),
      name: "Quarterly check-in overdue",
      triggerType: EscalationTriggerType.QUARTERLY_CHECKIN_NOT_COMPLETED,
      thresholdDays: 3,
      repeatEveryDays: 2,
      maxLevel: EscalationLevel.HR,
    },
  ]) {
    await prisma.escalationRule.upsert({
      where: { id: rule.id },
      update: {
        ...rule,
        cycleId,
        isActive: true,
        updatedById: adminId,
      },
      create: {
        ...rule,
        cycleId,
        isActive: true,
        createdById: adminId,
        updatedById: adminId,
      },
    });
  }

  const delayedEmployee = employeeUsers[11];
  if (!delayedEmployee) {
    throw new Error("Expected 12 seeded employees for escalation sample.");
  }

  const delayedManagerId = managersByOrgUnit.get(delayedEmployee.primaryOrgUnitId);
  if (!delayedManagerId) {
    throw new Error(`No manager configured for delayed employee ${delayedEmployee.fullName}`);
  }

  const delayedSheetId = id(5000 + Number(delayedEmployee.employeeCode.slice(-4)));

  await prisma.escalationEvent.upsert({
    where: { id: id(950) },
    update: {
      status: EscalationStatus.OPEN,
      updatedById: adminId,
    },
    create: {
      id: id(950),
      ruleId: id(901),
      cycleId,
      goalSheetId: delayedSheetId,
      employeeId: delayedEmployee.id,
      managerId: delayedManagerId,
      currentLevel: EscalationLevel.MANAGER,
      status: EscalationStatus.OPEN,
      triggeredAt: dt("2026-05-16"),
      dueAt: dt("2026-05-19"),
      metadata: { reason: "Goal sheet still in draft after configured threshold." },
      createdById: adminId,
      updatedById: adminId,
    },
  });

  await prisma.notification.upsert({
    where: { id: id(960) },
    update: {
      status: NotificationStatus.UNREAD,
      updatedAt: new Date(),
    },
    create: {
      id: id(960),
      recipientId: delayedManagerId,
      actorId: adminId,
      type: NotificationType.ESCALATION,
      status: NotificationStatus.UNREAD,
      title: "Goal submission escalation",
      body: `${delayedEmployee.fullName} has not submitted their FY2026 goal sheet.`,
      linkHref: "/manager",
      entityType: AuditEntityType.ESCALATION_EVENT,
      entityId: id(950),
    },
  });

  console.log("Seed completed: 1 admin, 3 managers, 12 employees, active cycle, goal sheets, shared goals, escalation rules.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
