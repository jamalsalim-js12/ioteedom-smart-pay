import { MODULE_IDS } from "@ioteedom/shared";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class MePropertyDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty()
  address!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty({ enum: ["home", "estate"] })
  kind!: "home" | "estate";
}

export class MeMembershipDto {
  @ApiProperty({ enum: ["owner", "manager"] })
  role!: "owner" | "manager";

  @ApiProperty()
  accountId!: string;

  @ApiProperty()
  accountName!: string;

  @ApiProperty({ enum: ["home", "estate"] })
  accountKind!: "home" | "estate";

  @ApiProperty({ enum: ["invited", "active", "suspended"] })
  status!: "invited" | "active" | "suspended";

  @ApiPropertyOptional({ nullable: true, type: String, format: "date-time" })
  onboardedAt!: string | null;

  @ApiProperty({
    type: "object",
    additionalProperties: { type: "boolean" },
    example: Object.fromEntries(MODULE_IDS.map((id) => [id, id === "ecg" || id === "water"])),
  })
  modules!: Record<string, boolean>;

  @ApiProperty({ type: [MePropertyDto] })
  properties!: MePropertyDto[];
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

  @ApiProperty({ example: "024 412 8891" })
  phoneDisplay!: string;

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

  @ApiProperty({ example: "020 000 0001" })
  phoneDisplay!: string;

  @ApiProperty({ enum: ["superadmin", "support"] })
  role!: "superadmin" | "support";

  @ApiProperty()
  mustChangePin!: boolean;
}
