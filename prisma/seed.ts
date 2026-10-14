// prisma/seed.ts
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  ACTIONS,
  FEATURES,
  ROLE_DEFAULT,
  ROLE_SUPER_ADMIN,
} from "../src/lib/constants";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "superadmin@mail.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "superadmin#123";

async function main() {
  // 1. Role
  const superAdminRole = await prisma.role.upsert({
    where: { name: ROLE_SUPER_ADMIN },
    update: {},
    create: { name: ROLE_SUPER_ADMIN, desc: "Akses penuh ke semua fitur" },
  });

  const defaultRole = await prisma.role.upsert({
    where: { name: ROLE_DEFAULT },
    update: {},
    create: {
      name: ROLE_DEFAULT,
      desc: "Role default untuk pendaftaran mandiri",
    },
  });

  // 2. Feature
  const features = [];
  for (const f of FEATURES) {
    const feature = await prisma.feature.upsert({
      where: { key: f.key },
      update: { availableActions: [...ACTIONS] },
      create: { ...f, availableActions: [...ACTIONS] },
    });
    features.push(feature);
  }

  // 3. Role permission
  for (const feature of features) {
    // Super Admin: semua true, dipaksa true setiap seed dijalankan
    await prisma.rolePermission.upsert({
      where: {
        roleId_featureId: { roleId: superAdminRole.id, featureId: feature.id },
      },
      update: { isRead: true, isAdd: true, isEdit: true, isDelete: true },
      create: {
        roleId: superAdminRole.id,
        featureId: feature.id,
        isRead: true,
        isAdd: true,
        isEdit: true,
        isDelete: true,
      },
    });

    // Role User: baris dibuat dengan semua false, tidak menimpa kalau sudah diubah admin
    await prisma.rolePermission.upsert({
      where: {
        roleId_featureId: { roleId: defaultRole.id, featureId: feature.id },
      },
      update: {},
      create: { roleId: defaultRole.id, featureId: feature.id },
    });
  }

  // 4. Akun Super Admin
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {},
    create: {
      name: "Super Admin",
      email: ADMIN_EMAIL,
      password: await bcrypt.hash(ADMIN_PASSWORD, 12),
      roleId: superAdminRole.id,
    },
  });

  console.log("Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
