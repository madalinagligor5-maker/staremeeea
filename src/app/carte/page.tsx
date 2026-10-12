import { CarteHome } from "@/components/carte/home";
import { RequireAccess } from "@/components/carte/require-access";

export default function CartePage() {
  return <RequireAccess next="/carte"><CarteHome /></RequireAccess>;
}
