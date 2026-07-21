export interface Area {
  id: string;
  name: string;
  title: string;
  blurb: string;
}

/** Áreas transversales a los tres niveles. */
export const AREAS: Area[] = [
  {
    id: "ingles",
    name: "Inglés",
    title: "Educación bilingüe certificada",
    blurb:
      "Desde sala de 2 hasta 5.º año, con certificación oficial y exámenes internacionales de la Universidad de Cambridge.",
  },
  {
    id: "pastoral",
    name: "Pastoral",
    title: "La fe, vivida en comunidad",
    blurb:
      "Catequesis en los tres niveles, celebraciones con las familias y un grupo misionero con más de veinte años de historia.",
  },
  {
    id: "doe",
    name: "Orientación Escolar",
    title: "Acompañar cada trayectoria",
    blurb:
      "Un equipo que trabaja con alumnos, docentes y familias para que cada chico aprenda y crezca a su manera.",
  },
  {
    id: "educacion-fisica",
    name: "Educación Física",
    title: "Jugar limpio, crecer sanos",
    blurb:
      "Deporte curricular y extracurricular en el campo de deportes de Garín: atletismo, hockey, rugby, fútbol, vóley y más.",
  },
  {
    id: "tecnologia",
    name: "Tecnología",
    title: "Pensamiento computacional",
    blurb:
      "Aulas equipadas, gabinete de tecnología y alianzas con Digital House y Google for Education.",
  },
];
