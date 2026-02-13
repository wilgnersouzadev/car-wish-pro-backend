import * as bcrypt from "bcrypt";
import dataSource from "../data.source";
import { User, UserRole, CommissionType } from "../entities/user.entity";
import { Shop } from "../entities/shop.entity";

const DEFAULT_PASSWORD = "Test123!";

async function run(): Promise<void> {
  await dataSource.initialize();

  const userRepo = dataSource.getRepository(User);
  const shopRepo = dataSource.getRepository(Shop);

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  let superAdmin = await userRepo.findOne({ where: { email: "will@email.com" } });
  if (!superAdmin) {
    superAdmin = userRepo.create({
      name: "Wilgner Souza",
      email: "will@email.com",
      password: hashedPassword,
      role: UserRole.SUPER_ADMIN,
      shopId: null,
      isActive: true,
    });
    await userRepo.save(superAdmin);
    console.log("✓ Super Admin criado (will@email.com / " + DEFAULT_PASSWORD + ")");
  } else {
    console.log("- Super Admin já existe");
  }

  const shopsData = [
    { name: "Lava Rápido Centro", slug: "lava-rapido-centro" },
    { name: "Auto Wash Pro Sul", slug: "auto-wash-sul" },
    { name: "Brillo Lavagem", slug: "brillo-lavagem" },
  ];

  for (const s of shopsData) {
    let shop = await shopRepo.findOne({ where: { slug: s.slug } });
    if (!shop) {
      shop = shopRepo.create(s);
      shop = await shopRepo.save(shop);
      console.log("✓ Loja criada: " + s.name + " (slug: " + s.slug + ")");
    } else {
      console.log("- Loja já existe: " + s.name);
    }

    const adminEmail = `admin-${s.slug}@carwish.com`;
    let admin = await userRepo.findOne({ where: { email: adminEmail } });
    if (!admin) {
      admin = userRepo.create({
        name: "Admin " + s.name,
        email: adminEmail,
        password: hashedPassword,
        role: UserRole.ADMIN,
        shopId: shop.id,
        isActive: true,
        shops: [shop],
      });
      await userRepo.save(admin);
      console.log("  ✓ Admin criado: " + adminEmail + " / " + DEFAULT_PASSWORD);
    } else {
      console.log("  - Admin já existe: " + adminEmail);
    }

    const employeeEmails = [`func1-${s.slug}@carwish.com`, `func2-${s.slug}@carwish.com`];
    const employeeNames = ["Funcionário 1 - " + s.name, "Funcionário 2 - " + s.name];
    for (let i = 0; i < employeeEmails.length; i++) {
      let emp = await userRepo.findOne({ where: { email: employeeEmails[i] } });
      if (!emp) {
        emp = userRepo.create({
          name: employeeNames[i],
          email: employeeEmails[i],
          password: hashedPassword,
          role: UserRole.EMPLOYEE,
          shopId: shop.id,
          isActive: true,
          commissionType: i === 0 ? CommissionType.PERCENTAGE : CommissionType.FIXED,
          commissionValue: i === 0 ? 10 : 5,
        });
        await userRepo.save(emp);
        console.log("    ✓ Funcionário criado: " + employeeEmails[i] + " / " + DEFAULT_PASSWORD);
      } else {
        console.log("    - Funcionário já existe: " + employeeEmails[i]);
      }
    }
  }

  await dataSource.destroy();
  console.log("\nSeed concluído. Senha padrão para todos: " + DEFAULT_PASSWORD);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
