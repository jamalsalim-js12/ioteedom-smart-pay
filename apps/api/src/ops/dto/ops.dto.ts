import { MODULE_IDS } from "@ioteedom/shared";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsIn, IsObject, IsString, MinLength } from "class-validator";

export class InviteOwnerDto {
  @ApiProperty({ example: "Kwame Boateng" })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ example: "024 555 0100" })
  @IsString()
  phone!: string;

  @ApiProperty({ example: "kwame@email.com" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "12 Boundary Rd, East Legon" })
  @IsString()
  @MinLength(1)
  property!: string;

  @ApiProperty({ example: "Accra" })
  @IsString()
  @MinLength(1)
  city!: string;

  @ApiProperty({ enum: ["home", "estate"] })
  @IsIn(["home", "estate"])
  kind!: "home" | "estate";

  @ApiProperty({
    type: "object",
    additionalProperties: { type: "boolean" },
    example: Object.fromEntries(MODULE_IDS.map((id) => [id, id === "ecg" || id === "water"])),
  })
  @IsObject()
  modules!: Record<string, boolean>;
}

export class OpsInviteResponseDto {
  @ApiProperty()
  accountId!: string;

  @ApiProperty()
  inviteId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  phoneDisplay!: string;

  @ApiProperty({
    description: "Temporary PIN. Shown once in ops and logged in staging. Never stored.",
  })
  pin!: string;

  @ApiProperty({ type: String, format: "date-time" })
  expiresAt!: string;

  @ApiProperty({
    type: "object",
    additionalProperties: { type: "boolean" },
  })
  modules!: Record<string, boolean>;
}

export class OpsAccountListItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  phoneDisplay!: string;

  @ApiProperty({ enum: ["home", "estate"] })
  kind!: "home" | "estate";

  @ApiProperty({ enum: ["invited", "active", "suspended"] })
  status!: "invited" | "active" | "suspended";

  @ApiPropertyOptional({ nullable: true, type: String, format: "date-time" })
  onboardedAt!: string | null;

  @ApiProperty()
  property!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty({ type: [String] })
  modules!: string[];

  @ApiProperty({
    type: "object",
    additionalProperties: { type: "boolean" },
  })
  moduleFlags!: Record<string, boolean>;

  @ApiProperty()
  units!: number;

  @ApiPropertyOptional({ nullable: true })
  lastSeen!: string | null;

  @ApiPropertyOptional({ nullable: true, type: String, format: "date-time" })
  inviteAcceptedAt!: string | null;
}

export class OpsAccountListResponseDto {
  @ApiProperty({ type: [OpsAccountListItemDto] })
  items!: OpsAccountListItemDto[];
}

export class OpsAuditItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  action!: string;

  @ApiProperty()
  actorId!: string;

  @ApiPropertyOptional({ nullable: true })
  accountId!: string | null;

  @ApiProperty()
  summary!: string;

  @ApiProperty({ type: String, format: "date-time" })
  at!: string;
}

export class OpsAuditListResponseDto {
  @ApiProperty({ type: [OpsAuditItemDto] })
  items!: OpsAuditItemDto[];
}
