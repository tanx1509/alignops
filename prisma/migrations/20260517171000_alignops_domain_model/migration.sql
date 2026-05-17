-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "AppRole" AS ENUM ('EMPLOYEE', 'MANAGER', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'INVITED');

-- CreateEnum
CREATE TYPE "RoleAssignmentStatus" AS ENUM ('ACTIVE', 'REVOKED');

-- CreateEnum
CREATE TYPE "OrgUnitType" AS ENUM ('COMPANY', 'FUNCTION', 'DEPARTMENT', 'TEAM');

-- CreateEnum
CREATE TYPE "OrgUnitStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CycleStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CheckinWindowType" AS ENUM ('GOAL_SETTING', 'Q1', 'Q2', 'Q3', 'Q4_ANNUAL');

-- CreateEnum
CREATE TYPE "CheckinWindowStatus" AS ENUM ('NOT_OPEN', 'OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "GoalSheetStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'RETURNED', 'APPROVED_LOCKED', 'ADMIN_UNLOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('ACTIVE', 'LOCKED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "GoalSource" AS ENUM ('INDIVIDUAL', 'SHARED');

-- CreateEnum
CREATE TYPE "UomType" AS ENUM ('NUMERIC', 'PERCENTAGE', 'TIMELINE', 'ZERO_BASED');

-- CreateEnum
CREATE TYPE "MeasurementDirection" AS ENUM ('INCREASE_IS_BETTER', 'DECREASE_IS_BETTER', 'DATE_DEADLINE', 'ZERO_IS_SUCCESS');

-- CreateEnum
CREATE TYPE "ApprovalAction" AS ENUM ('SUBMITTED', 'RETURNED', 'RESUBMITTED', 'MANAGER_EDITED', 'APPROVED', 'ADMIN_UNLOCKED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AchievementStatus" AS ENUM ('NOT_STARTED', 'ON_TRACK', 'COMPLETED');

-- CreateEnum
CREATE TYPE "SharedGoalStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuditEntityType" AS ENUM ('USER', 'ROLE_ASSIGNMENT', 'ORG_UNIT', 'REPORTING_LINE', 'CYCLE', 'CHECKIN_WINDOW', 'GOAL_SHEET', 'GOAL', 'SHARED_GOAL_DEFINITION', 'SHARED_GOAL_LINK', 'APPROVAL_EVENT', 'ACHIEVEMENT_UPDATE', 'CHECKIN_COMMENT', 'ESCALATION_RULE', 'ESCALATION_EVENT', 'NOTIFICATION');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'SOFT_DELETE', 'SUBMIT', 'RETURN', 'APPROVE', 'LOCK', 'UNLOCK', 'ARCHIVE', 'SYNC');

-- CreateEnum
CREATE TYPE "EscalationTriggerType" AS ENUM ('EMPLOYEE_GOALS_NOT_SUBMITTED', 'MANAGER_APPROVAL_OVERDUE', 'QUARTERLY_CHECKIN_NOT_COMPLETED');

-- CreateEnum
CREATE TYPE "EscalationLevel" AS ENUM ('EMPLOYEE', 'MANAGER', 'SKIP_LEVEL', 'HR');

-- CreateEnum
CREATE TYPE "EscalationStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('GOAL_SUBMITTED', 'GOAL_RETURNED', 'GOAL_APPROVED', 'CHECKIN_REMINDER', 'ESCALATION', 'SHARED_GOAL_ASSIGNED', 'AUDIT_EXCEPTION');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('UNREAD', 'READ', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "authProviderId" TEXT,
    "email" TEXT NOT NULL,
    "employeeCode" TEXT,
    "fullName" TEXT NOT NULL,
    "title" TEXT,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "primaryOrgUnitId" UUID,
    "createdById" UUID,
    "updatedById" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_assignments" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "AppRole" NOT NULL,
    "orgUnitId" UUID,
    "status" "RoleAssignmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "startsAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_units" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgUnitType" NOT NULL,
    "status" "OrgUnitStatus" NOT NULL DEFAULT 'ACTIVE',
    "parentId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "org_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reporting_lines" (
    "id" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "managerId" UUID NOT NULL,
    "orgUnitId" UUID,
    "isPrimary" BOOLEAN NOT NULL DEFAULT true,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "reporting_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cycles" (
    "id" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CycleStatus" NOT NULL DEFAULT 'DRAFT',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "lockedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "cycles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkin_windows" (
    "id" UUID NOT NULL,
    "cycleId" UUID NOT NULL,
    "type" "CheckinWindowType" NOT NULL,
    "name" TEXT NOT NULL,
    "status" "CheckinWindowStatus" NOT NULL DEFAULT 'NOT_OPEN',
    "sequence" INTEGER NOT NULL,
    "opensAt" TIMESTAMP(3) NOT NULL,
    "closesAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "checkin_windows_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goal_sheets" (
    "id" UUID NOT NULL,
    "cycleId" UUID NOT NULL,
    "employeeId" UUID NOT NULL,
    "managerId" UUID NOT NULL,
    "orgUnitId" UUID,
    "status" "GoalSheetStatus" NOT NULL DEFAULT 'DRAFT',
    "submittedAt" TIMESTAMP(3),
    "returnedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedById" UUID,
    "lockedAt" TIMESTAMP(3),
    "unlockedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "lockReason" TEXT,
    "unlockReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "goal_sheets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" UUID NOT NULL,
    "goalSheetId" UUID NOT NULL,
    "source" "GoalSource" NOT NULL DEFAULT 'INDIVIDUAL',
    "status" "GoalStatus" NOT NULL DEFAULT 'ACTIVE',
    "sortOrder" INTEGER NOT NULL,
    "thrustArea" TEXT,
    "title" TEXT,
    "description" TEXT,
    "uomType" "UomType",
    "direction" "MeasurementDirection",
    "targetNumeric" DECIMAL(14,2),
    "targetDate" TIMESTAMP(3),
    "weightage" DECIMAL(5,2) NOT NULL,
    "lockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_goal_definitions" (
    "id" UUID NOT NULL,
    "cycleId" UUID NOT NULL,
    "orgUnitId" UUID,
    "status" "SharedGoalStatus" NOT NULL DEFAULT 'DRAFT',
    "title" TEXT NOT NULL,
    "description" TEXT,
    "thrustArea" TEXT,
    "uomType" "UomType" NOT NULL,
    "direction" "MeasurementDirection" NOT NULL,
    "targetNumeric" DECIMAL(14,2),
    "targetDate" TIMESTAMP(3),
    "primaryOwnerId" UUID,
    "primaryOwnerGoalId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "shared_goal_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shared_goal_links" (
    "id" UUID NOT NULL,
    "sharedGoalDefinitionId" UUID NOT NULL,
    "recipientGoalId" UUID NOT NULL,
    "recipientUserId" UUID NOT NULL,
    "goalSheetId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "isPrimaryOwnerLink" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "shared_goal_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "approval_events" (
    "id" UUID NOT NULL,
    "goalSheetId" UUID NOT NULL,
    "actorId" UUID NOT NULL,
    "action" "ApprovalAction" NOT NULL,
    "fromStatus" "GoalSheetStatus",
    "toStatus" "GoalSheetStatus",
    "comment" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievement_updates" (
    "id" UUID NOT NULL,
    "goalId" UUID NOT NULL,
    "checkinWindowId" UUID NOT NULL,
    "enteredById" UUID NOT NULL,
    "actualNumeric" DECIMAL(14,2),
    "actualDate" TIMESTAMP(3),
    "status" "AchievementStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progressScore" DECIMAL(7,2),
    "employeeComment" TEXT,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "achievement_updates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkin_comments" (
    "id" UUID NOT NULL,
    "goalSheetId" UUID NOT NULL,
    "checkinWindowId" UUID NOT NULL,
    "managerId" UUID NOT NULL,
    "comment" TEXT NOT NULL,
    "discussionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "checkin_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "entityType" "AuditEntityType" NOT NULL,
    "entityId" UUID NOT NULL,
    "action" "AuditAction" NOT NULL,
    "actorId" UUID,
    "actorRole" "AppRole",
    "before" JSONB,
    "after" JSONB,
    "metadata" JSONB,
    "reason" TEXT,
    "requestId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalation_rules" (
    "id" UUID NOT NULL,
    "cycleId" UUID,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerType" "EscalationTriggerType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "thresholdDays" INTEGER NOT NULL,
    "repeatEveryDays" INTEGER,
    "maxLevel" "EscalationLevel" NOT NULL DEFAULT 'HR',
    "config" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "escalation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "escalation_events" (
    "id" UUID NOT NULL,
    "ruleId" UUID,
    "cycleId" UUID NOT NULL,
    "goalSheetId" UUID,
    "checkinWindowId" UUID,
    "employeeId" UUID NOT NULL,
    "managerId" UUID,
    "currentLevel" "EscalationLevel" NOT NULL,
    "status" "EscalationStatus" NOT NULL DEFAULT 'OPEN',
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3) NOT NULL,
    "acknowledgedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" UUID,
    "resolutionNote" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdById" UUID,
    "updatedById" UUID,

    CONSTRAINT "escalation_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "recipientId" UUID NOT NULL,
    "actorId" UUID,
    "type" "NotificationType" NOT NULL,
    "status" "NotificationStatus" NOT NULL DEFAULT 'UNREAD',
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "linkHref" TEXT,
    "entityType" "AuditEntityType",
    "entityId" UUID,
    "metadata" JSONB,
    "readAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_authProviderId_key" ON "users"("authProviderId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_employeeCode_key" ON "users"("employeeCode");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE INDEX "users_primaryOrgUnitId_idx" ON "users"("primaryOrgUnitId");

-- CreateIndex
CREATE INDEX "users_fullName_idx" ON "users"("fullName");

-- CreateIndex
CREATE INDEX "role_assignments_role_status_idx" ON "role_assignments"("role", "status");

-- CreateIndex
CREATE INDEX "role_assignments_orgUnitId_role_idx" ON "role_assignments"("orgUnitId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "role_assignments_userId_role_orgUnitId_key" ON "role_assignments"("userId", "role", "orgUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "org_units_code_key" ON "org_units"("code");

-- CreateIndex
CREATE INDEX "org_units_parentId_idx" ON "org_units"("parentId");

-- CreateIndex
CREATE INDEX "org_units_type_status_idx" ON "org_units"("type", "status");

-- CreateIndex
CREATE INDEX "reporting_lines_managerId_isPrimary_idx" ON "reporting_lines"("managerId", "isPrimary");

-- CreateIndex
CREATE INDEX "reporting_lines_employeeId_effectiveFrom_effectiveTo_idx" ON "reporting_lines"("employeeId", "effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "reporting_lines_orgUnitId_idx" ON "reporting_lines"("orgUnitId");

-- CreateIndex
CREATE UNIQUE INDEX "reporting_lines_employeeId_managerId_effectiveFrom_key" ON "reporting_lines"("employeeId", "managerId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "cycles_code_key" ON "cycles"("code");

-- CreateIndex
CREATE INDEX "cycles_status_startsAt_endsAt_idx" ON "cycles"("status", "startsAt", "endsAt");

-- CreateIndex
CREATE INDEX "checkin_windows_status_opensAt_closesAt_idx" ON "checkin_windows"("status", "opensAt", "closesAt");

-- CreateIndex
CREATE UNIQUE INDEX "checkin_windows_cycleId_type_key" ON "checkin_windows"("cycleId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "checkin_windows_cycleId_sequence_key" ON "checkin_windows"("cycleId", "sequence");

-- CreateIndex
CREATE INDEX "goal_sheets_managerId_status_idx" ON "goal_sheets"("managerId", "status");

-- CreateIndex
CREATE INDEX "goal_sheets_employeeId_status_idx" ON "goal_sheets"("employeeId", "status");

-- CreateIndex
CREATE INDEX "goal_sheets_approvedById_idx" ON "goal_sheets"("approvedById");

-- CreateIndex
CREATE INDEX "goal_sheets_orgUnitId_status_idx" ON "goal_sheets"("orgUnitId", "status");

-- CreateIndex
CREATE INDEX "goal_sheets_cycleId_status_idx" ON "goal_sheets"("cycleId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "goal_sheets_cycleId_employeeId_key" ON "goal_sheets"("cycleId", "employeeId");

-- CreateIndex
CREATE INDEX "goals_goalSheetId_status_idx" ON "goals"("goalSheetId", "status");

-- CreateIndex
CREATE INDEX "goals_source_status_idx" ON "goals"("source", "status");

-- CreateIndex
CREATE INDEX "goals_thrustArea_idx" ON "goals"("thrustArea");

-- CreateIndex
CREATE UNIQUE INDEX "goals_goalSheetId_sortOrder_key" ON "goals"("goalSheetId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "shared_goal_definitions_primaryOwnerGoalId_key" ON "shared_goal_definitions"("primaryOwnerGoalId");

-- CreateIndex
CREATE INDEX "shared_goal_definitions_cycleId_status_idx" ON "shared_goal_definitions"("cycleId", "status");

-- CreateIndex
CREATE INDEX "shared_goal_definitions_orgUnitId_status_idx" ON "shared_goal_definitions"("orgUnitId", "status");

-- CreateIndex
CREATE INDEX "shared_goal_definitions_primaryOwnerId_idx" ON "shared_goal_definitions"("primaryOwnerId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_goal_links_recipientGoalId_key" ON "shared_goal_links"("recipientGoalId");

-- CreateIndex
CREATE INDEX "shared_goal_links_goalSheetId_idx" ON "shared_goal_links"("goalSheetId");

-- CreateIndex
CREATE INDEX "shared_goal_links_recipientUserId_idx" ON "shared_goal_links"("recipientUserId");

-- CreateIndex
CREATE UNIQUE INDEX "shared_goal_links_sharedGoalDefinitionId_recipientUserId_key" ON "shared_goal_links"("sharedGoalDefinitionId", "recipientUserId");

-- CreateIndex
CREATE INDEX "approval_events_goalSheetId_createdAt_idx" ON "approval_events"("goalSheetId", "createdAt");

-- CreateIndex
CREATE INDEX "approval_events_actorId_createdAt_idx" ON "approval_events"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "approval_events_action_createdAt_idx" ON "approval_events"("action", "createdAt");

-- CreateIndex
CREATE INDEX "achievement_updates_checkinWindowId_status_idx" ON "achievement_updates"("checkinWindowId", "status");

-- CreateIndex
CREATE INDEX "achievement_updates_enteredById_submittedAt_idx" ON "achievement_updates"("enteredById", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "achievement_updates_goalId_checkinWindowId_key" ON "achievement_updates"("goalId", "checkinWindowId");

-- CreateIndex
CREATE INDEX "checkin_comments_managerId_discussionDate_idx" ON "checkin_comments"("managerId", "discussionDate");

-- CreateIndex
CREATE UNIQUE INDEX "checkin_comments_goalSheetId_checkinWindowId_managerId_key" ON "checkin_comments"("goalSheetId", "checkinWindowId", "managerId");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_createdAt_idx" ON "audit_logs"("entityType", "entityId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_action_createdAt_idx" ON "audit_logs"("action", "createdAt");

-- CreateIndex
CREATE INDEX "escalation_rules_cycleId_triggerType_isActive_idx" ON "escalation_rules"("cycleId", "triggerType", "isActive");

-- CreateIndex
CREATE INDEX "escalation_rules_isActive_idx" ON "escalation_rules"("isActive");

-- CreateIndex
CREATE INDEX "escalation_events_status_dueAt_idx" ON "escalation_events"("status", "dueAt");

-- CreateIndex
CREATE INDEX "escalation_events_cycleId_status_idx" ON "escalation_events"("cycleId", "status");

-- CreateIndex
CREATE INDEX "escalation_events_employeeId_status_idx" ON "escalation_events"("employeeId", "status");

-- CreateIndex
CREATE INDEX "escalation_events_managerId_status_idx" ON "escalation_events"("managerId", "status");

-- CreateIndex
CREATE INDEX "escalation_events_ruleId_triggeredAt_idx" ON "escalation_events"("ruleId", "triggeredAt");

-- CreateIndex
CREATE INDEX "notifications_recipientId_status_createdAt_idx" ON "notifications"("recipientId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "notifications_entityType_entityId_idx" ON "notifications"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "notifications_type_createdAt_idx" ON "notifications"("type", "createdAt");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_primaryOrgUnitId_fkey" FOREIGN KEY ("primaryOrgUnitId") REFERENCES "org_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_assignments" ADD CONSTRAINT "role_assignments_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "org_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_units" ADD CONSTRAINT "org_units_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "org_units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporting_lines" ADD CONSTRAINT "reporting_lines_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporting_lines" ADD CONSTRAINT "reporting_lines_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reporting_lines" ADD CONSTRAINT "reporting_lines_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "org_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_windows" ADD CONSTRAINT "checkin_windows_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "cycles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_sheets" ADD CONSTRAINT "goal_sheets_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_sheets" ADD CONSTRAINT "goal_sheets_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_sheets" ADD CONSTRAINT "goal_sheets_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_sheets" ADD CONSTRAINT "goal_sheets_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goal_sheets" ADD CONSTRAINT "goal_sheets_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "org_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_goalSheetId_fkey" FOREIGN KEY ("goalSheetId") REFERENCES "goal_sheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_goal_definitions" ADD CONSTRAINT "shared_goal_definitions_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_goal_definitions" ADD CONSTRAINT "shared_goal_definitions_orgUnitId_fkey" FOREIGN KEY ("orgUnitId") REFERENCES "org_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_goal_definitions" ADD CONSTRAINT "shared_goal_definitions_primaryOwnerId_fkey" FOREIGN KEY ("primaryOwnerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_goal_definitions" ADD CONSTRAINT "shared_goal_definitions_primaryOwnerGoalId_fkey" FOREIGN KEY ("primaryOwnerGoalId") REFERENCES "goals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_goal_links" ADD CONSTRAINT "shared_goal_links_sharedGoalDefinitionId_fkey" FOREIGN KEY ("sharedGoalDefinitionId") REFERENCES "shared_goal_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_goal_links" ADD CONSTRAINT "shared_goal_links_recipientGoalId_fkey" FOREIGN KEY ("recipientGoalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_goal_links" ADD CONSTRAINT "shared_goal_links_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shared_goal_links" ADD CONSTRAINT "shared_goal_links_goalSheetId_fkey" FOREIGN KEY ("goalSheetId") REFERENCES "goal_sheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_events" ADD CONSTRAINT "approval_events_goalSheetId_fkey" FOREIGN KEY ("goalSheetId") REFERENCES "goal_sheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "approval_events" ADD CONSTRAINT "approval_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_updates" ADD CONSTRAINT "achievement_updates_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "goals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_updates" ADD CONSTRAINT "achievement_updates_checkinWindowId_fkey" FOREIGN KEY ("checkinWindowId") REFERENCES "checkin_windows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "achievement_updates" ADD CONSTRAINT "achievement_updates_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_comments" ADD CONSTRAINT "checkin_comments_goalSheetId_fkey" FOREIGN KEY ("goalSheetId") REFERENCES "goal_sheets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_comments" ADD CONSTRAINT "checkin_comments_checkinWindowId_fkey" FOREIGN KEY ("checkinWindowId") REFERENCES "checkin_windows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "checkin_comments" ADD CONSTRAINT "checkin_comments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_rules" ADD CONSTRAINT "escalation_rules_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "cycles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_events" ADD CONSTRAINT "escalation_events_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "escalation_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_events" ADD CONSTRAINT "escalation_events_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "cycles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_events" ADD CONSTRAINT "escalation_events_goalSheetId_fkey" FOREIGN KEY ("goalSheetId") REFERENCES "goal_sheets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_events" ADD CONSTRAINT "escalation_events_checkinWindowId_fkey" FOREIGN KEY ("checkinWindowId") REFERENCES "checkin_windows"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_events" ADD CONSTRAINT "escalation_events_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_events" ADD CONSTRAINT "escalation_events_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "escalation_events" ADD CONSTRAINT "escalation_events_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Domain guardrails Prisma cannot express directly.
ALTER TABLE "cycles"
  ADD CONSTRAINT "cycles_valid_date_range" CHECK ("endsAt" > "startsAt");

ALTER TABLE "checkin_windows"
  ADD CONSTRAINT "checkin_windows_valid_date_range" CHECK ("closesAt" > "opensAt");

ALTER TABLE "reporting_lines"
  ADD CONSTRAINT "reporting_lines_no_self_manager" CHECK ("employeeId" <> "managerId");

ALTER TABLE "role_assignments"
  ADD CONSTRAINT "role_assignments_valid_dates" CHECK ("endsAt" IS NULL OR "endsAt" > "startsAt");

ALTER TABLE "goals"
  ADD CONSTRAINT "goals_weightage_range" CHECK ("weightage" >= 10.00 AND "weightage" <= 100.00),
  ADD CONSTRAINT "goals_sort_order_range" CHECK ("sortOrder" BETWEEN 1 AND 8),
  ADD CONSTRAINT "goals_individual_target_shape" CHECK (
    "source" <> 'INDIVIDUAL'
    OR (
      "title" IS NOT NULL
      AND "uomType" IS NOT NULL
      AND "direction" IS NOT NULL
      AND (
        ("uomType" IN ('NUMERIC', 'PERCENTAGE') AND "direction" IN ('INCREASE_IS_BETTER', 'DECREASE_IS_BETTER') AND "targetNumeric" IS NOT NULL AND "targetDate" IS NULL)
        OR ("uomType" = 'TIMELINE' AND "direction" = 'DATE_DEADLINE' AND "targetDate" IS NOT NULL AND "targetNumeric" IS NULL)
        OR ("uomType" = 'ZERO_BASED' AND "direction" = 'ZERO_IS_SUCCESS' AND COALESCE("targetNumeric", 0) = 0 AND "targetDate" IS NULL)
      )
    )
  ),
  ADD CONSTRAINT "goals_shared_reference_shape" CHECK (
    "source" <> 'SHARED'
    OR (
      "thrustArea" IS NULL
      AND "title" IS NULL
      AND "description" IS NULL
      AND "uomType" IS NULL
      AND "direction" IS NULL
      AND "targetNumeric" IS NULL
      AND "targetDate" IS NULL
    )
  );

ALTER TABLE "shared_goal_definitions"
  ADD CONSTRAINT "shared_goal_definitions_target_shape" CHECK (
    ("uomType" IN ('NUMERIC', 'PERCENTAGE') AND "direction" IN ('INCREASE_IS_BETTER', 'DECREASE_IS_BETTER') AND "targetNumeric" IS NOT NULL AND "targetDate" IS NULL)
    OR ("uomType" = 'TIMELINE' AND "direction" = 'DATE_DEADLINE' AND "targetDate" IS NOT NULL AND "targetNumeric" IS NULL)
    OR ("uomType" = 'ZERO_BASED' AND "direction" = 'ZERO_IS_SUCCESS' AND COALESCE("targetNumeric", 0) = 0 AND "targetDate" IS NULL)
  );

ALTER TABLE "achievement_updates"
  ADD CONSTRAINT "achievement_updates_actual_shape" CHECK (
    ("actualNumeric" IS NULL OR "actualDate" IS NULL)
  ),
  ADD CONSTRAINT "achievement_updates_progress_range" CHECK (
    "progressScore" IS NULL OR ("progressScore" >= 0 AND "progressScore" <= 999.99)
  );

ALTER TABLE "escalation_rules"
  ADD CONSTRAINT "escalation_rules_positive_thresholds" CHECK (
    "thresholdDays" > 0 AND ("repeatEveryDays" IS NULL OR "repeatEveryDays" > 0)
  );

-- Version fields support optimistic concurrency. Application writes should still
-- filter by the observed version; this trigger guarantees every update advances it.
CREATE OR REPLACE FUNCTION increment_version_on_update()
RETURNS trigger AS $$
BEGIN
  NEW."version" = OLD."version" + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'users',
    'role_assignments',
    'org_units',
    'reporting_lines',
    'cycles',
    'checkin_windows',
    'goal_sheets',
    'goals',
    'shared_goal_definitions',
    'shared_goal_links',
    'achievement_updates',
    'checkin_comments',
    'escalation_rules',
    'escalation_events',
    'notifications'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER %I BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION increment_version_on_update()',
      table_name || '_increment_version',
      table_name
    );
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION enforce_goal_sheet_goal_limit()
RETURNS trigger AS $$
DECLARE
  active_goal_count integer;
BEGIN
  IF NEW."deletedAt" IS NULL AND NEW."status"::text NOT IN ('CANCELLED', 'ARCHIVED') THEN
    SELECT COUNT(*)
      INTO active_goal_count
      FROM "goals"
      WHERE "goalSheetId" = NEW."goalSheetId"
        AND "deletedAt" IS NULL
        AND "status"::text NOT IN ('CANCELLED', 'ARCHIVED')
        AND (TG_OP = 'INSERT' OR "id" <> NEW."id");

    IF active_goal_count >= 8 THEN
      RAISE EXCEPTION 'A goal sheet cannot contain more than 8 active goals';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goals_enforce_sheet_goal_limit
BEFORE INSERT OR UPDATE OF "goalSheetId", "status", "deletedAt"
ON "goals"
FOR EACH ROW
EXECUTE FUNCTION enforce_goal_sheet_goal_limit();

CREATE OR REPLACE FUNCTION enforce_goal_sheet_submission_rules()
RETURNS trigger AS $$
DECLARE
  active_goal_count integer;
  active_weight_sum numeric;
BEGIN
  IF NEW."status"::text IN ('SUBMITTED', 'APPROVED_LOCKED') THEN
    SELECT COUNT(*), COALESCE(SUM("weightage"), 0)
      INTO active_goal_count, active_weight_sum
      FROM "goals"
      WHERE "goalSheetId" = NEW."id"
        AND "deletedAt" IS NULL
        AND "status"::text NOT IN ('CANCELLED', 'ARCHIVED');

    IF active_goal_count < 1 THEN
      RAISE EXCEPTION 'A submitted goal sheet must contain at least one active goal';
    END IF;

    IF active_goal_count > 8 THEN
      RAISE EXCEPTION 'A submitted goal sheet cannot contain more than 8 active goals';
    END IF;

    IF active_weight_sum <> 100.00 THEN
      RAISE EXCEPTION 'A submitted goal sheet must have total active goal weightage equal to 100';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER goal_sheets_enforce_submission_rules
BEFORE INSERT OR UPDATE OF "status"
ON "goal_sheets"
FOR EACH ROW
EXECUTE FUNCTION enforce_goal_sheet_submission_rules();
