import type { ImageMetadata } from "astro";

import adrianaPremuz from "../assets/staff/adriana-premuz.png";
import carolinaPinto from "../assets/staff/carolina-pinto.png";
import fernandaMarsicovetere from "../assets/staff/fernanda-marsicovetere.png";
import giselaEsteban from "../assets/staff/gisela-esteban.png";
import ignacioRanaGomez from "../assets/staff/ignacio-rana-gomez.png";
import lucasWalton from "../assets/staff/lucas-walton.png";
import luzNievasZabala from "../assets/staff/luz-nievas-zabala.png";
import mariaArana from "../assets/staff/maria-arana.png";
import mariaJoseCastroGil from "../assets/staff/maria-jose-castro-gil.png";
import mariaLauraCastro from "../assets/staff/maria-laura-castro.png";
import pabloSanchezTerrero from "../assets/staff/pablo-sanchez-terrero.png";
import patriciaDoriaMedina from "../assets/staff/patricia-doria-medina.png";
import rosarioAvendano from "../assets/staff/rosario-avendano.png";
import silviaLavandeiraFonte from "../assets/staff/silvia-lavandeira-fonte.png";
import victoriaGarciaBouza from "../assets/staff/victoria-garcia-bouza.png";

export interface StaffMember {
  name: string;
  role: string;
  photo: ImageMetadata;
}

/** Autoridades académicas, ordenadas por jerarquía institucional. */
export const STAFF: StaffMember[] = [
  { name: "Patricia Doria Medina", role: "Rectora", photo: patriciaDoriaMedina },
  {
    name: "Silvia Lavandeira Fonte",
    role: "Directora de Nivel Inicial",
    photo: silviaLavandeiraFonte,
  },
  { name: "María Laura Castro", role: "Directora de Nivel Primario", photo: mariaLauraCastro },
  {
    name: "María José Castro Gil",
    role: "Vicedirectora de Nivel Primario",
    photo: mariaJoseCastroGil,
  },
  {
    name: "M. Victoria Garcia Bouza",
    role: "Directora de Estudios · Nivel Secundario",
    photo: victoriaGarciaBouza,
  },
  {
    name: "Carolina Pinto",
    role: "Directora de Inglés · Inicial y Primario",
    photo: carolinaPinto,
  },
  { name: "Adriana Premuz", role: "Directora de Inglés · Nivel Secundario", photo: adrianaPremuz },
  { name: "Rosario Avendaño", role: "Coordinadora del DOE", photo: rosarioAvendano },
  { name: "Lucas Walton", role: "Coordinador de Pastoral", photo: lucasWalton },
  { name: "Ignacio Raña Gómez", role: "Coordinador de Educación Física", photo: ignacioRanaGomez },
  { name: "Gisela Esteban", role: "Coordinadora de Convivencia", photo: giselaEsteban },
  { name: "María B. Arana", role: "Secretaria de Nivel Inicial", photo: mariaArana },
  {
    name: "Fernanda Marsicovetere",
    role: "Secretaria de Nivel Primario",
    photo: fernandaMarsicovetere,
  },
  { name: "Luz Nievas Zabala", role: "Secretaria de Nivel Secundario", photo: luzNievasZabala },
  { name: "Pablo Sanchez Terrero", role: "Gerente de Administración", photo: pabloSanchezTerrero },
];
