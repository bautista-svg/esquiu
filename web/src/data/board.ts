export interface BoardMember {
  role: string;
  name: string;
}

/** Comisión Directiva 2025 — cargos ad honorem ejercidos por padres socios. */
export const BOARD: BoardMember[] = [
  { role: "Presidente", name: "Patricio Matías Pérez Bertana" },
  { role: "Vicepresidente", name: "Juan Manuel Santagada" },
  { role: "Secretaria", name: "María Amparo Gauci" },
  { role: "Prosecretario", name: "Carlos Martín Parodi" },
  { role: "Tesorera", name: "Ma. Paola San Martín" },
  { role: "Protesorero", name: "Juan Ignacio D'Osualdo" },
  { role: "Vocal titular", name: "Santiago Roberto Vena" },
  { role: "Vocal titular", name: "María del Pilar Agüero" },
  { role: "Vocal titular", name: "María Florencia Martínez Camera" },
  { role: "Comisión Revisora de Cuentas", name: "Alejandro Gerardo Spadone" },
  { role: "Comisión Revisora de Cuentas", name: "Francisco Tomás Quinos" },
];
