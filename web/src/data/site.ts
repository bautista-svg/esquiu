export const SITE = {
  name: "Colegio Esquiú",
  tagline: "Mucho más que un colegio, una comunidad",
  url: "https://www.colegioesquiu.edu.ar",
  founded: 1957,
  email: "institucionales@colegioesquiu.edu.ar",
  phone: "+54 11 4784-3222",
  phoneHref: "tel:+541147843222",
  instagram: "https://www.instagram.com/colegioesquiu",
  address: {
    street: "11 de Septiembre de 1888 1240",
    neighborhood: "Belgrano",
    city: "Ciudad Autónoma de Buenos Aires",
    zip: "C1426BKK",
    country: "Argentina",
  },
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Colegio+Esqui%C3%BA%2C+11+de+Septiembre+de+1888+1240%2C+CABA",
} as const;

export interface NavItem {
  label: string;
  href: string;
}

/** Navegación principal (el resto de las páginas vive en el footer). */
export const NAV: NavItem[] = [
  { label: "Proyecto educativo", href: "/proyecto-educativo" },
  { label: "Áreas", href: "/areas" },
  { label: "Equipo", href: "/equipo" },
  { label: "Exalumnos", href: "/exalumnos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Contacto", href: "/contacto" },
];

/** Navegación completa para menú móvil y footer. */
export const NAV_FULL: NavItem[] = [
  { label: "Inicio", href: "/" },
  ...NAV,
  { label: "Exalumnos", href: "/exalumnos" },
  { label: "Servicios", href: "/servicios" },
  { label: "Admisiones", href: "/admisiones" },
];

export const PORTALS = [
  {
    name: "Handing",
    description: "Comunicaciones de Nivel Inicial y Primario",
    href: "https://esquiu.handing.co/users/sign_in",
  },
  {
    name: "Acadeu",
    description: "Plataforma académica del Nivel Secundario",
    href: "https://plataforma.acadeu.com/i",
  },
  {
    name: "Intranet",
    description: "Gestión administrativa para familias",
    href: "https://intranetesquiu.southmsnet.com.ar/Account/Login",
  },
  {
    name: "Manual de uniformes",
    description: "Documento oficial con el detalle por nivel (PDF)",
    href: "https://www.colegioesquiu.edu.ar/_files/ugd/23920b_d98b3aab986e49849d6d4b83e9167041.pdf",
  },
] as const;
