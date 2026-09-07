export type PrincipalKind = "user" | "staff";

export type AuthPrincipal = {
  id: string;
  kind: PrincipalKind;
  name: string;
  phone: string;
  mustChangePin: boolean;
  status: "active" | "suspended";
};
