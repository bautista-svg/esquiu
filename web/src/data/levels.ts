export interface Level {
  id: string;
  index: string;
  name: string;
  ages: string;
  schedule: string;
  summary: string;
  highlights: string[];
}

/** Los tres niveles, en el orden del recorrido escolar. */
export const LEVELS: Level[] = [
  {
    id: "inicial",
    index: "01",
    name: "Nivel Inicial",
    ages: "Salas de 2 a 5 años",
    schedule: "Jornada simple o doble según la sala",
    summary:
      "El juego como puente didáctico: cada sala acompaña el crecimiento con propuestas que despiertan la curiosidad, la autonomía y el vínculo con los demás.",
    highlights: [
      "Inglés desde sala de 2 con maestras bilingües",
      "Música, catequesis y educación física integradas",
      "Comedor propio y salida al mediodía opcional",
    ],
  },
  {
    id: "primaria",
    index: "02",
    name: "Nivel Primario",
    ages: "1.º a 7.º grado",
    schedule: "Jornada doble · 8:00 a 16:30",
    summary:
      "Doble jornada con inglés intensivo tres tardes por semana y deporte en el campo de deportes las restantes: cuerpo, mente y comunidad en equilibrio.",
    highlights: [
      "Inglés intensivo con Aprendizaje Basado en Proyectos",
      "Semana de la Literatura, MINU y Olimpíadas Matemáticas",
      "Talleres de arte, ciencias, teatro y música",
    ],
  },
  {
    id: "secundaria",
    index: "03",
    name: "Nivel Secundario",
    ages: "1.º a 5.º año",
    schedule: "Tres orientaciones · carga horaria ampliada",
    summary:
      "Ciencias Sociales y Humanidades, Ciencias Naturales o Economía y Administración, con tutoría, talleres de arte y preparación para exámenes de Cambridge.",
    highlights: [
      "Certificación oficial de Educación Bilingüe en Inglés",
      "Exámenes internacionales FCE, CAE e IGCSE",
      "Convenios y actividades con universidades",
    ],
  },
];
