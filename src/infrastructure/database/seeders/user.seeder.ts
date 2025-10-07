import { db, closeDatabaseConnection } from '@config/database';
import { users, roles, userRoles } from '../schema/users.schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

/**
 * Seed default roles
 */
export const seedRoles = async () => {
  console.log('📝 Seeding roles...');

  const defaultRoles = [
    {
      name: 'super_admin' as const,
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      permissions: JSON.stringify([
        'system:*',
        'users:*',
        'roles:*',
        'schools:*',
        'classes:*',
        'courses:*',
        'assignments:*',
        'grades:*',
        'attendance:*',
        'reports:*',
      ]),
      isActive: true,
    },
    {
      name: 'admin' as const,
      displayName: 'Administrator',
      description: 'School-level administrative access',
      permissions: JSON.stringify([
        'users:read',
        'users:write',
        'classes:*',
        'courses:*',
        'assignments:*',
        'grades:read',
        'attendance:*',
        'reports:read',
      ]),
      isActive: true,
    },
    {
      name: 'teacher' as const,
      displayName: 'Teacher',
      description: 'Teacher access for class management',
      permissions: JSON.stringify([
        'classes:read',
        'courses:read',
        'assignments:*',
        'grades:*',
        'attendance:*',
        'students:read',
      ]),
      isActive: true,
    },
    {
      name: 'student' as const,
      displayName: 'Student',
      description: 'Student access to view materials and submit work',
      permissions: JSON.stringify([
        'classes:read',
        'courses:read',
        'assignments:read',
        'assignments:submit',
        'grades:read',
        'attendance:read',
      ]),
      isActive: true,
    },
    {
      name: 'parent' as const,
      displayName: 'Parent/Guardian',
      description: 'Parent access to view child progress',
      permissions: JSON.stringify([
        'students:read',
        'grades:read',
        'attendance:read',
        'reports:read',
      ]),
      isActive: true,
    },
  ];

  const insertedRoles = [];

  for (const role of defaultRoles) {
    // Check if role already exists
    const existing = await db.select().from(roles).where(eq(roles.name, role.name)).limit(1);

    if (existing.length === 0) {
      const [inserted] = await db.insert(roles).values(role).returning();
      console.log(`   ✓ Created role: ${role.displayName}`);
      insertedRoles.push(inserted);
    } else {
      console.log(`   ⤷ Role already exists: ${role.displayName}`);
      insertedRoles.push(existing[0]);
    }
  }

  return insertedRoles;
};

/**
 * Seed super admin user
 */
export const seedSuperAdmin = async () => {
  console.log('👤 Seeding super admin user...');

  const superAdminEmail = 'superadmin@sia.local';
  const superAdminPassword = 'SuperAdmin123!';

  // Check if super admin already exists
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, superAdminEmail))
    .limit(1);

  if (existing.length > 0) {
    console.log('   ⤷ Super admin already exists');
    return existing[0];
  }

  // Hash password
  const passwordHash = await bcrypt.hash(superAdminPassword, 12);

  // Create super admin user
  const [user] = await db
    .insert(users)
    .values({
      email: superAdminEmail,
      passwordHash,
      firstName: 'Super',
      lastName: 'Administrator',
      phoneNumber: '+6285174427553',
      isActive: true,
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
    })
    .returning();

  console.log(`   ✓ Created super admin user: ${superAdminEmail}`);

  // Assign super_admin role
  const [superAdminRole] = await db
    .select()
    .from(roles)
    .where(eq(roles.name, 'super_admin'))
    .limit(1);

  if (superAdminRole) {
    await db.insert(userRoles).values({
      userId: user.id,
      roleId: superAdminRole.id,
      assignedBy: user.id, // Self-assigned
    });
    console.log('   ✓ Assigned super_admin role');
  }

  console.log('\n🔑 Default Super Admin Credentials:');
  console.log(`   Email: ${superAdminEmail}`);
  console.log(`   Password: ${superAdminPassword}`);
  console.log('   ⚠️  Change this password in production!\n');

  return user;
};

/**
 * Seed additional test users (for development/testing)
 */
export const seedTestUsers = async () => {
  console.log('👥 Seeding test users...');

  const testUsers = [
    {
      email: 'admin@test.local',
      password: 'Admin123!',
      firstName: 'Test',
      lastName: 'Admin',
      role: 'admin',
    },
    {
      email: 'teacher@test.local',
      password: 'Teacher123!',
      firstName: 'Test',
      lastName: 'Teacher',
      role: 'teacher',
    },
    {
      email: 'student@test.local',
      password: 'Student123!',
      firstName: 'Test',
      lastName: 'Student',
      role: 'student',
    },
  ];

  for (const userData of testUsers) {
    // Check if user already exists
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, userData.email))
      .limit(1);

    if (existing.length > 0) {
      console.log(`   ⤷ User already exists: ${userData.email}`);
      continue;
    }

    // Hash password
    const passwordHash = await bcrypt.hash(userData.password, 12);

    // Create user
    const [user] = await db
      .insert(users)
      .values({
        email: userData.email,
        passwordHash,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: true,
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      })
      .returning();

    // Assign role
    const [role] = await db
      .select()
      .from(roles)
      .where(eq(roles.name, userData.role as any))
      .limit(1);

    if (role) {
      await db.insert(userRoles).values({
        userId: user.id,
        roleId: role.id,
      });
    }

    console.log(`   ✓ Created test user: ${userData.email} (${userData.role})`);
  }
};

/**
 * Main seeder function
 */
export const seedUsers = async (includeTestUsers = false) => {
  try {
    console.log('🌱 Starting user seeder...\n');

    // Seed roles first
    await seedRoles();
    console.log('');

    // Seed super admin
    await seedSuperAdmin();

    // Optionally seed test users (only in development/test)
    if (includeTestUsers) {
      console.log('');
      await seedTestUsers();
    }

    console.log('\n✅ User seeding completed successfully!');
  } catch (error) {
    console.error('\n❌ Error seeding users:', error);
    throw error;
  }
};

// Run seeder if called directly
// Check if this is the main module (ES modules)
const isMainModule = import.meta.url === `file://${process.argv[1]}`;

if (isMainModule) {
  const includeTestUsers = process.env.NODE_ENV !== 'production';

  seedUsers(includeTestUsers)
    .then(() => {
      closeDatabaseConnection();
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      closeDatabaseConnection();
      process.exit(1);
    });
}
