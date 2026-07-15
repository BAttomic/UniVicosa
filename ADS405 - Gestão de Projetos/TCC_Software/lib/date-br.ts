import { formatInTimeZone } from "date-fns-tz";
import { ptBR } from "date-fns/locale";

// Fuso de Brasília. Datas/horas são exibidas sempre em horário de Brasília,
// independentemente do fuso do servidor/container (Node usa o ICU embutido,
// então não depende do pacote tzdata nem da variável TZ da imagem).
export const TZ_BR = "America/Sao_Paulo";

export function formatBR(date: Date | string | number, pattern: string): string {
  return formatInTimeZone(new Date(date), TZ_BR, pattern, { locale: ptBR });
}
