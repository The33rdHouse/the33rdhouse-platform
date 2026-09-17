import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./identity";
export const consoleApplications = pgTable("console_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  applicantUserId: text("applicant_user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  requestedRole: text("requested_role").notNull(),
  termsVersion: text("terms_version").notNull(),
  acceptedAt: timestamp("accepted_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  status: text("status").default("PENDING_REVIEW").notNull(),
});
