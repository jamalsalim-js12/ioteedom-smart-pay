import { MODULE_IDS } from "@ioteedom/shared";
import { ApiProperty } from "@nestjs/swagger";

export class MeMembershipDto {
  @ApiProperty({ enum: ["owner", "manager"] })
  role!: "owner" | "manager";

  @ApiProperty()
  accountId!: string;

  @ApiProperty()
  accountName!: string;

  @ApiProperty({ enum: ["home", "estate"] })
  accountKind!: "home" | "estate";

  @ApiProperty({
    type: "object",
    additionalProperties: { type: "boolean" },
    example: Object.fromEntries(MODULE_IDS.map((id) => [id, id === "ecg" || id === "water"])),
  })
  modules!: Record<string, boolean>;
}

export class MeUserResponseDto {
  @ApiProperty({ enum: ["user"] })
  kind!: "user";

  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: "233244128891" })
  phone!: string;

  @ApiProperty()
  mustChangePin!: boolean;

  @ApiProperty({ type: [MeMembershipDto] })
  memberships!: MeMembershipDto[];
}

export class MeStaffResponseDto {
  @ApiProperty({ enum: ["staff"] })
  kind!: "staff";

  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ example: "233200000001" })
  phone!: string;

  @ApiProperty({ enum: ["superadmin", "support"] })
  role!: "superadmin" | "support";

  @ApiProperty()
  mustChangePin!: boolean;
}
