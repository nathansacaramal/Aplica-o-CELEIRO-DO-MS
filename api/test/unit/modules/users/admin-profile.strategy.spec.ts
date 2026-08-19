import { AdminProfileStrategy } from "@/modules/users/infra/profile/admin-profile.strategy";
import Admin from "@/modules/users/infra/model/admin-model";
import { UserEntity } from "@/modules/users/domain/entities/user.entity";

jest.mock("@/modules/users/infra/model/admin-model", () => ({
  __esModule: true,
  default: {
    destroy: jest.fn(),
    create: jest.fn(),
  },
}));

describe("AdminProfileStrategy", () => {
  const tx = {} as any;
  const user = new UserEntity({
    id: 9,
    name: "Admin",
    email: "a@b.com",
    password: "h",
    role: "Admin",
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("removeProfile chama Admin.destroy", async () => {
    const sut = new AdminProfileStrategy();
    await sut.removeProfile(9, tx);
    expect(Admin.destroy).toHaveBeenCalledWith({
      where: { userId: 9 },
      transaction: tx,
    });
  });

  it("createProfile chama Admin.create com userId e name", async () => {
    const sut = new AdminProfileStrategy();
    await sut.createProfile({
      user,
      payload: {},
      transaction: tx,
    });
    expect(Admin.create).toHaveBeenCalledWith({ userId: 9, name: "Admin" }, { transaction: tx });
  });
});
