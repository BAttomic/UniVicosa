// Pacotes de impulsionamento — o organizador paga para destacar o PRÓPRIO evento
// dentro da plataforma (no estilo "impulsionar publicação"), ganhando alcance.
// Valores em centavos. Plain module para ser usado por server e client.
export const BOOST_PACKAGES = [
  { id: "essencial", label: "Essencial", amount: 4_990, durationDays: 3, reach: "Destaque na busca por 3 dias", hint: "Bom para divulgar a abertura de um lote." },
  { id: "avancado", label: "Avançado", amount: 9_990, durationDays: 7, reach: "Destaque na home e na busca por 7 dias", hint: "O equilíbrio ideal entre alcance e custo." },
  { id: "maximo", label: "Máximo", amount: 19_990, durationDays: 15, reach: "Topo da home e da busca por 15 dias", hint: "Alcance máximo na reta final de vendas." },
] as const;

export type BoostPackageId = (typeof BOOST_PACKAGES)[number]["id"];
