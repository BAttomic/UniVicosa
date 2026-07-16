/**
 * Seeds the database with rich, realistic fake data.
 * Run:
 *   npx tsx scripts/seed.ts vicosa
 *   npx tsx scripts/seed.ts brasil
 *
 * Produces: users (buyers, operators, organizers with full PF/PJ profiles),
 * events with multiple scheduled lots ("lotes"), waitlists for events that are
 * "almost on sale", impulsionamentos (boosts), and orders/tickets/check-ins for metrics.
 */
import bcrypt from "bcryptjs";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { customAlphabet } from "nanoid";
import { connectDB } from "@/lib/db";
import Event from "@/modules/events/models/event.model";
import EventStaff from "@/modules/events/models/event-staff.model";
import Lot from "@/modules/events/models/lot.model";
import TicketType from "@/modules/events/models/ticket-type.model";
import Waitlist from "@/modules/events/models/waitlist.model";
import Boost from "@/modules/events/models/boost.model";
import User from "@/modules/identity/models/user.model";
import Order from "@/modules/orders/models/order.model";
import Ticket from "@/modules/tickets/models/ticket.model";
import CheckinLog from "@/modules/tickets/models/checkin-log.model";
import { BOOST_PACKAGES } from "@/lib/boost-packages";

// Inlined here (instead of importing the ticket repository) so the seed does not
// transitively load lib/env, which validates env vars at import time — before
// dotenv.config() below has populated process.env.
const ticketCode = customAlphabet("1234567890abcdef", 32);
function generateCode(): string {
  return ticketCode();
}
function generateSecret(code: string, ownerId: string): string {
  const window = Math.floor(Date.now() / (30 * 1000));
  return crypto
    .createHmac("sha256", process.env.TICKET_HMAC_SECRET ?? "seed-secret")
    .update(`${code}:${ownerId}:${window}`)
    .digest("hex");
}

// --- Brazilian document/contact generators (with valid check digits) ---------
function randomDigits(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * 10));
}
function cpfCheckDigit(digits: number[]): number {
  const factorStart = digits.length + 1;
  const sum = digits.reduce((acc, digit, index) => acc + digit * (factorStart - index), 0);
  const remainder = (sum * 10) % 11;
  return remainder === 10 ? 0 : remainder;
}
function generateCpf(): string {
  const base = randomDigits(9);
  const d1 = cpfCheckDigit(base);
  const d2 = cpfCheckDigit([...base, d1]);
  return [...base, d1, d2].join("").replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}
function cnpjCheckDigit(digits: number[]): number {
  const weights = digits.length === 12
    ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const sum = digits.reduce((acc, digit, index) => acc + digit * weights[index]!, 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}
function generateCnpj(): string {
  const base = [...randomDigits(8), 0, 0, 0, 1]; // matriz 0001
  const d1 = cnpjCheckDigit(base);
  const d2 = cnpjCheckDigit([...base, d1]);
  return [...base, d1, d2].join("").replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}
function randomPhone(ddd = "31"): string {
  const digits = randomDigits(8).join("");
  return `(${ddd}) 9${digits.slice(0, 4)}-${digits.slice(4)}`;
}
function pick<T>(items: T[], index: number): T {
  return items[index % items.length]!;
}
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
// RNG determinístico → dataset realista e reproduzível entre execuções.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
// (impulsionamentos usam BOOST_PACKAGES diretamente)
const FIRST_NAMES = ["Ana", "Bruno", "Carla", "Diego", "Elisa", "Felipe", "Gabriela", "Hugo", "Isabela", "João", "Karina", "Lucas", "Mariana", "Nathan", "Olívia", "Pedro", "Rafael", "Sofia", "Thiago", "Vinícius", "Yasmin", "Amanda", "Breno", "Camila", "Daniel", "Eduarda", "Fernando", "Giovana", "Heitor", "Ingrid", "Júlia", "Larissa", "Murilo", "Natália", "Otávio", "Paula", "Renato", "Sabrina", "Tatiana", "Vitor"];
const LAST_NAMES = ["Silva", "Souza", "Oliveira", "Santos", "Pereira", "Lima", "Costa", "Ferreira", "Rodrigues", "Almeida", "Nascimento", "Carvalho", "Gomes", "Martins", "Rocha", "Ribeiro", "Alves", "Monteiro", "Mendes", "Barbosa", "Freitas", "Cardoso", "Teixeira", "Araújo", "Correia"];
const DDDS = ["11", "21", "31", "41", "48", "51", "61", "71", "81", "85"];
// Compradores extras para volume "de produção". E-mail indexado garante unicidade.
function generateBuyers(count: number, rng: () => number): SeedUser[] {
  const out: SeedUser[] = [];
  for (let i = 0; i < count; i += 1) {
    const first = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)]!;
    const last = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)]!;
    const handle = `${first}.${last}.${i + 1}`.toLowerCase().normalize("NFD").replace(/[^a-z0-9.]/g, "");
    out.push({
      email: `${handle}@cliente.ticketflow.com`,
      name: `${first} ${last}`,
      role: "buyer",
      cpf: generateCpf(),
      phone: randomPhone(pick(DDDS, i)),
    });
  }
  return out;
}
// Peso de cada tipo de ingresso na demanda (Inteira vende muito mais que VIP).
function ticketTypeWeight(name: string): number {
  if (name === "Inteira") return 6;
  if (name === "Meia-entrada") return 3;
  if (name === "VIP") return 1;
  return 2;
}

type SeedScenario = "vicosa" | "brasil";
// Global access is "admin" vs regular "buyer"; operator is granted per-event.
type Role = "admin" | "buyer";

type OrganizerProfile = {
  personType: "pf" | "pj";
  legalName: string;
  tradeName?: string;
  document: string;
  responsibleName: string;
  phone: string;
  address: { cep: string; street: string; number: string; complement?: string; district: string; city: string; state: string };
  pixKey?: string;
};

type SeedUser = {
  email: string;
  name: string;
  role: Role;
  cpf?: string;
  phone?: string;
  organizerProfile?: OrganizerProfile;
};

type SeedVenue = {
  name: string;
  address: string;
  city: string;
  state: string;
};

type SeedEvent = {
  organizerIndex: number;
  title: string;
  slug: string;
  description: string;
  venue: SeedVenue;
  startsInDays: number; // negativo = evento passado/encerrado
  startOffsetHours?: number; // sobrepõe startsInDays p/ timing fino (ex.: acontecendo agora)
  durationHours: number;
  status: "published" | "draft" | "finished";
  img: string; // palavras-chave de tema (reservadas p/ capas temáticas; a capa atual usa Picsum por slug)
  sizeFactor?: number; // multiplies ticket capacity (mega events sell far more)
  featured?: boolean; // patrocinado: ganha destaque na home/listagem
  comingSoon?: boolean; // vendas ainda não abriram → fila de espera
};

// Janela temporal do evento em relação a "agora": passado (encerrado),
// acontecendo agora (live) ou futuro. Define o perfil de vendas/check-in.
type EventTemporal = "past" | "live" | "future";

for (const envFile of [".env.local", ".env", ".env.example"]) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

const scenario = normalizeScenario(process.argv[2]);
const SALT = 12;
const DAY_MS = 24 * 60 * 60 * 1000;

// IDs reais e válidos do Picsum (obtidos de /v2/list). Um ID distinto por evento
// garante uma foto de capa única — diferente de usar ?seed, que pode colidir no
// pool finito do serviço.
const PICSUM_IDS = [
  60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79,
  80, 81, 82, 83, 84, 85, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 98, 99, 100, 101,
  102, 103, 104, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122,
];

const U = User as unknown as { insertMany(d: Array<SeedUser & { passwordHash: string; emailVerifiedAt?: Date }>): Promise<Array<{ _id: { toString(): string }; name: string; email: string }>>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number> };
const Ev = Event as unknown as { create(d: Array<unknown>): Promise<void>; deleteMany(f: any): Promise<void>; find(f: any): Promise<Array<{ _id: { toString(): string }; slug: string; organizerId: string; status: string }>>; countDocuments(): Promise<number> };
const TT = TicketType as unknown as { create(d: Array<unknown>): Promise<void>; deleteMany(f: any): Promise<void>; find(f: any): Promise<Array<{ _id: { toString(): string }; name: string; price: number; totalQuantity: number }>>; findByIdAndUpdate(id: string, data: any, options?: any): Promise<unknown>; bulkWrite(ops: any[]): Promise<unknown>; countDocuments(): Promise<number> };
const L = Lot as unknown as { create(d: Array<unknown> | Record<string, unknown>): Promise<void>; deleteMany(f: any): Promise<void>; find(f: any): Promise<Array<{ _id: { toString(): string }; name: string; price: number; quantity: number; startsAt?: Date; endsAt?: Date; active: boolean }>>; findByIdAndUpdate(id: string, data: any, options?: any): Promise<unknown>; bulkWrite(ops: any[]): Promise<unknown>; countDocuments(): Promise<number> };
const ES = EventStaff as unknown as { create(d: Record<string, unknown>): Promise<unknown>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number> };
const WL = Waitlist as unknown as { create(d: Record<string, unknown>): Promise<unknown>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number> };
const Bo = Boost as unknown as { insertMany(d: Array<Record<string, unknown>>): Promise<unknown>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number> };
const Ord = Order as unknown as { create(d: Record<string, unknown>): Promise<{ _id: { toString(): string } }>; insertMany(d: Array<Record<string, unknown>>, options?: Record<string, unknown>): Promise<Array<{ _id: { toString(): string } }>>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number> };
const Tk = Ticket as unknown as { create(d: Record<string, unknown>): Promise<{ _id: { toString(): string } }>; insertMany(d: Array<Record<string, unknown>>): Promise<Array<{ _id: { toString(): string } }>>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number> };
const CL = CheckinLog as unknown as { create(d: Record<string, unknown>): Promise<unknown>; insertMany(d: Array<Record<string, unknown>>): Promise<unknown>; deleteMany(f: any): Promise<void>; countDocuments(): Promise<number> };

function normalizeScenario(value: string | undefined): SeedScenario {
  return value === "brasil" ? "brasil" : "vicosa";
}

function baseUsers(): SeedUser[] {
  // Indices matter: scenario events reference organizer 1 and 2 by index.
  return [
    { email: "admin@ticketflow.com", name: "Admin", role: "admin", cpf: generateCpf(), phone: randomPhone() }, // 0
    {
      email: "organizer1@ticketflow.com",
      name: "Marina Organizadora",
      role: "buyer", // 1 — owns events
      cpf: generateCpf(),
      phone: randomPhone("31"),
      organizerProfile: {
        personType: "pj",
        legalName: "Marina Produções e Eventos LTDA",
        tradeName: "Marina Eventos",
        document: generateCnpj(),
        responsibleName: "Marina Souza Lima",
        phone: randomPhone("31"),
        address: { cep: "36570-000", street: "Avenida Peter Henry Rolfs", number: "250", complement: "Sala 3", district: "Centro", city: "Viçosa", state: "MG" },
        pixKey: "financeiro@marinaeventos.com.br",
      },
    },
    {
      email: "organizer2@ticketflow.com",
      name: "Bruno Organizador",
      role: "buyer", // 2 — owns events
      cpf: generateCpf(),
      phone: randomPhone("21"),
      organizerProfile: {
        personType: "pf",
        legalName: "Bruno Almeida Carvalho",
        document: generateCpf(),
        responsibleName: "Bruno Almeida Carvalho",
        phone: randomPhone("21"),
        address: { cep: "20040-002", street: "Rua da Assembleia", number: "100", district: "Centro", city: "Rio de Janeiro", state: "RJ" },
        pixKey: generateCpf(),
      },
    },
    { email: "buyer1@ticketflow.com", name: "Carla Compradora", role: "buyer", cpf: generateCpf(), phone: randomPhone("31") }, // 3
    { email: "buyer2@ticketflow.com", name: "Diego Comprador", role: "buyer", cpf: generateCpf(), phone: randomPhone("11") }, // 4
    { email: "buyer3@ticketflow.com", name: "Elisa Compradora", role: "buyer", cpf: generateCpf(), phone: randomPhone("31") }, // 5
    { email: "buyer4@ticketflow.com", name: "Felipe Martins", role: "buyer", cpf: generateCpf(), phone: randomPhone("11") }, // 6
    { email: "buyer5@ticketflow.com", name: "Gabriela Nunes", role: "buyer", cpf: generateCpf(), phone: randomPhone("31") }, // 7
    { email: "operator@ticketflow.com", name: "Otávio Operador", role: "buyer", cpf: generateCpf(), phone: randomPhone("31") }, // 8 — operator via EventStaff
  ];
}

// Eventos nacionais famosos (vários nichos) — nomes reais, fotos reais via LoremFlickr.
function nationalEvents(): SeedEvent[] {
  return [
    // --- Grandes festivais de música ---
    { organizerIndex: 1, title: "Rock in Rio", slug: "rock-in-rio", description: "Um dos maiores festivais de música do mundo, no Parque Olímpico do Rio.", venue: { name: "Parque Olímpico", address: "Av. Embaixador Abelardo Bueno, s/n", city: "Rio de Janeiro", state: "RJ" }, startsInDays: 30, durationHours: 12, status: "published", img: "rock,in,rio,music,festival", sizeFactor: 20, featured: true },
    { organizerIndex: 2, title: "Lollapalooza Brasil", slug: "lollapalooza-brasil", description: "Festival de música alternativa e pop no Autódromo de Interlagos.", venue: { name: "Autódromo de Interlagos", address: "Av. Sen. Teotônio Vilela, 261", city: "São Paulo", state: "SP" }, startsInDays: 44, durationHours: 11, status: "published", img: "lollapalooza,music,festival,crowd", sizeFactor: 16, featured: true },
    { organizerIndex: 1, title: "The Town", slug: "the-town-festival", description: "Megafestival com palcos para múltiplos estilos musicais em São Paulo.", venue: { name: "Autódromo de Interlagos", address: "Av. Sen. Teotônio Vilela, 261", city: "São Paulo", state: "SP" }, startsInDays: 58, durationHours: 12, status: "published", img: "music,festival,stage,crowd", sizeFactor: 16, comingSoon: true },
    { organizerIndex: 2, title: "Tomorrowland Brasil", slug: "tomorrowland-brasil", description: "Edição brasileira do festival de música eletrônica mais famoso do mundo.", venue: { name: "Parque Maeda", address: "Estrada do Cinturão Verde, s/n", city: "Itu", state: "SP" }, startsInDays: 72, durationHours: 12, status: "published", img: "tomorrowland,edm,festival,lights", sizeFactor: 14 },
    { organizerIndex: 1, title: "João Rock", slug: "joao-rock", description: "Festival que celebra a música brasileira em Ribeirão Preto.", venue: { name: "Parque Permanente de Exposições", address: "Av. Mário Andreazza, s/n", city: "Ribeirão Preto", state: "SP" }, startsInDays: 36, durationHours: 10, status: "published", img: "rock,festival,brazil,concert", sizeFactor: 6 },
    { organizerIndex: 2, title: "Festival de Verão de Salvador", slug: "festival-verao-salvador", description: "Tradicional festival de música na Arena Fonte Nova.", venue: { name: "Arena Fonte Nova", address: "Ladeira da Fonte das Pedras, s/n", city: "Salvador", state: "BA" }, startsInDays: 50, durationHours: 10, status: "published", img: "summer,festival,concert,brazil", sizeFactor: 8 },
    { organizerIndex: 1, title: "Planeta Atlântida", slug: "planeta-atlantida", description: "Um dos maiores festivais do Sul do país, no litoral gaúcho.", venue: { name: "SABA", address: "Estrada do Mar, km 0,5", city: "Xangri-lá", state: "RS" }, startsInDays: 64, durationHours: 11, status: "published", img: "music,festival,beach,crowd", sizeFactor: 8 },

    // --- Carnaval & Réveillon ---
    { organizerIndex: 2, title: "Carnaval do Rio de Janeiro", slug: "carnaval-rio-de-janeiro", description: "O maior desfile de escolas de samba do planeta, na Sapucaí.", venue: { name: "Sambódromo Marquês de Sapucaí", address: "R. Marquês de Sapucaí, s/n", city: "Rio de Janeiro", state: "RJ" }, startsInDays: 26, durationHours: 9, status: "published", img: "carnival,rio,samba,parade", sizeFactor: 20, featured: true },
    { organizerIndex: 1, title: "Carnaval de Salvador", slug: "carnaval-salvador", description: "O maior carnaval de rua do mundo, com trios elétricos no circuito Barra-Ondina.", venue: { name: "Circuito Barra-Ondina", address: "Orla da Barra", city: "Salvador", state: "BA" }, startsInDays: 26, durationHours: 10, status: "published", img: "carnival,salvador,brazil,party", sizeFactor: 18 },
    { organizerIndex: 2, title: "Carnaval de Olinda e Recife", slug: "carnaval-olinda-recife", description: "Frevo, maracatu e bonecos gigantes nas ladeiras históricas.", venue: { name: "Marco Zero", address: "Bairro do Recife", city: "Recife", state: "PE" }, startsInDays: 26, durationHours: 9, status: "published", img: "carnival,frevo,brazil,party", sizeFactor: 14 },
    { organizerIndex: 1, title: "Réveillon de Copacabana", slug: "reveillon-copacabana", description: "Uma das maiores queimas de fogos do mundo, na orla carioca.", venue: { name: "Praia de Copacabana", address: "Av. Atlântica, s/n", city: "Rio de Janeiro", state: "RJ" }, startsInDays: 90, durationHours: 6, status: "published", img: "newyear,fireworks,beach,night", sizeFactor: 20 },

    // --- Shows internacionais ---
    { organizerIndex: 2, title: "Coldplay — Music of the Spheres", slug: "coldplay-music-of-the-spheres", description: "A turnê mundial do Coldplay com show de luzes e pulseiras de LED.", venue: { name: "Estádio do Morumbis", address: "Praça Roberto Gomes Pedrosa, 1", city: "São Paulo", state: "SP" }, startsInDays: 40, durationHours: 4, status: "published", img: "coldplay,concert,stadium,lights", sizeFactor: 12, featured: true },
    { organizerIndex: 1, title: "Madonna — The Celebration Tour", slug: "madonna-celebration-tour", description: "O show histórico e gratuito que reuniu multidões em Copacabana.", venue: { name: "Praia de Copacabana", address: "Av. Atlântica, s/n", city: "Rio de Janeiro", state: "RJ" }, startsInDays: 20, durationHours: 3, status: "published", img: "concert,crowd,stage,pop", sizeFactor: 20 },
    { organizerIndex: 2, title: "Taylor Swift — The Eras Tour", slug: "taylor-swift-eras-tour", description: "A turnê recordista de público chega ao Allianz Parque.", venue: { name: "Allianz Parque", address: "Av. Francisco Matarazzo, 1705", city: "São Paulo", state: "SP" }, startsInDays: 60, durationHours: 4, status: "published", img: "concert,stadium,pop,lights", sizeFactor: 10, comingSoon: true },

    // --- Sertanejo & rodeio ---
    { organizerIndex: 1, title: "Festa do Peão de Barretos", slug: "festa-peao-barretos", description: "O maior rodeio da América Latina e palco dos grandes nomes do sertanejo.", venue: { name: "Parque do Peão", address: "Rod. Brigadeiro Faria Lima, km 428", city: "Barretos", state: "SP" }, startsInDays: 54, durationHours: 10, status: "published", img: "rodeo,country,sertanejo,horse", sizeFactor: 10 },
    { organizerIndex: 2, title: "Jaguariúna Rodeo Festival", slug: "jaguariuna-rodeo-festival", description: "Rodeio e shows sertanejos que reúnem público de todo o estado.", venue: { name: "Parque dos Sonhos", address: "Rod. Prof. Zeferino Vaz, km 4", city: "Jaguariúna", state: "SP" }, startsInDays: 48, durationHours: 9, status: "draft", img: "rodeo,country,festival,horse", sizeFactor: 8 },

    // --- Música eletrônica & baladas ---
    { organizerIndex: 1, title: "Green Valley", slug: "green-valley", description: "Eleita diversas vezes a melhor balada do mundo, em Balneário Camboriú.", venue: { name: "Green Valley", address: "Rua 3650, s/n", city: "Balneário Camboriú", state: "SC" }, startsInDays: 16, durationHours: 8, status: "published", img: "nightclub,party,club,dj", sizeFactor: 4 },
    { organizerIndex: 2, title: "Warung Day Festival", slug: "warung-day-festival", description: "Música eletrônica à beira-mar em um dos clubs mais famosos do país.", venue: { name: "Warung Beach Club", address: "Rua 1158, s/n", city: "Itajaí", state: "SC" }, startsInDays: 38, durationHours: 12, status: "published", img: "beach,club,electronic,party", sizeFactor: 5 },
    { organizerIndex: 1, title: "D-Edge São Paulo", slug: "d-edge-sao-paulo", description: "Templo da música eletrônica paulistana, com line-up internacional.", venue: { name: "D-Edge", address: "Al. Olga, 170", city: "São Paulo", state: "SP" }, startsInDays: 12, durationHours: 8, status: "published", img: "nightclub,dj,neon,party", sizeFactor: 3 },

    // --- Geek, games & cultura pop ---
    { organizerIndex: 2, title: "CCXP — Comic Con Experience", slug: "ccxp-comic-con-experience", description: "Maior festival de cultura pop do mundo, com painéis, cosplay e novidades.", venue: { name: "São Paulo Expo", address: "Rod. dos Imigrantes, km 1,5", city: "São Paulo", state: "SP" }, startsInDays: 70, durationHours: 10, status: "published", img: "cosplay,convention,geek,comics", sizeFactor: 12, featured: true },
    { organizerIndex: 1, title: "Brasil Game Show", slug: "brasil-game-show", description: "A maior feira de games da América Latina.", venue: { name: "Expo Center Norte", address: "R. José Bernardo Pinto, 333", city: "São Paulo", state: "SP" }, startsInDays: 62, durationHours: 9, status: "published", img: "gaming,esports,games,convention", sizeFactor: 8 },

    // --- Cultura, literatura & tradições ---
    { organizerIndex: 2, title: "FLIP — Festa Literária de Paraty", slug: "flip-paraty", description: "Principal evento literário do país, no centro histórico de Paraty.", venue: { name: "Centro Histórico de Paraty", address: "Centro Histórico", city: "Paraty", state: "RJ" }, startsInDays: 46, durationHours: 8, status: "published", img: "books,literary,reading,festival", sizeFactor: 3 },
    { organizerIndex: 1, title: "Oktoberfest de Blumenau", slug: "oktoberfest-blumenau", description: "A maior festa alemã das Américas, na Vila Germânica.", venue: { name: "Parque Vila Germânica", address: "R. Alberto Stein, 199", city: "Blumenau", state: "SC" }, startsInDays: 80, durationHours: 10, status: "published", img: "oktoberfest,beer,germany,festival", sizeFactor: 12 },
    { organizerIndex: 2, title: "Círio de Nazaré", slug: "cirio-de-nazare", description: "Uma das maiores procissões religiosas do mundo, em Belém.", venue: { name: "Basílica de Nazaré", address: "Praça Justo Chermont, s/n", city: "Belém", state: "PA" }, startsInDays: 96, durationHours: 8, status: "published", img: "procession,faith,religious,crowd", sizeFactor: 15 },
    { organizerIndex: 1, title: "Festival de Inverno de Campos do Jordão", slug: "festival-inverno-campos-do-jordao", description: "O maior festival de música clássica da América Latina.", venue: { name: "Auditório Claudio Santoro", address: "Av. Dr. Luís Arrobas Martins, 1880", city: "Campos do Jordão", state: "SP" }, startsInDays: 52, durationHours: 6, status: "published", img: "classical,orchestra,winter,music", sizeFactor: 4, comingSoon: true },

    // --- Esportivo ---
    { organizerIndex: 2, title: "GP de São Paulo de Fórmula 1", slug: "gp-sao-paulo-formula-1", description: "A etapa brasileira da Fórmula 1, no lendário Autódromo de Interlagos.", venue: { name: "Autódromo de Interlagos", address: "Av. Sen. Teotônio Vilela, 261", city: "São Paulo", state: "SP" }, startsInDays: 88, durationHours: 8, status: "published", img: "formula1,racing,grandprix,motorsport", sizeFactor: 14, featured: true },
    { organizerIndex: 1, title: "UFC Rio", slug: "ufc-rio", description: "Noite de lutas do UFC com astros do MMA na Farmasi Arena.", venue: { name: "Farmasi Arena", address: "Av. Embaixador Abelardo Bueno, 3401", city: "Rio de Janeiro", state: "RJ" }, startsInDays: 42, durationHours: 6, status: "published", img: "mma,fight,arena,boxing", sizeFactor: 8 },
    { organizerIndex: 2, title: "Corrida de São Silvestre", slug: "corrida-sao-silvestre", description: "A tradicional corrida de rua que fecha o ano na Avenida Paulista.", venue: { name: "Avenida Paulista", address: "Av. Paulista, s/n", city: "São Paulo", state: "SP" }, startsInDays: 92, durationHours: 5, status: "published", img: "marathon,running,race,city", sizeFactor: 12 },

    // --- Tecnologia & negócios ---
    { organizerIndex: 1, title: "Campus Party Brasil", slug: "campus-party-brasil", description: "A maior experiência de tecnologia, inovação e cultura digital do país.", venue: { name: "São Paulo Expo", address: "Rod. dos Imigrantes, km 1,5", city: "São Paulo", state: "SP" }, startsInDays: 34, durationHours: 12, status: "published", img: "technology,hackathon,innovation,computer", sizeFactor: 6 },
    { organizerIndex: 2, title: "Web Summit Rio", slug: "web-summit-rio", description: "Edição brasileira de uma das maiores conferências de tecnologia do mundo.", venue: { name: "Riocentro", address: "Av. Salvador Allende, 6555", city: "Rio de Janeiro", state: "RJ" }, startsInDays: 56, durationHours: 10, status: "published", img: "conference,startup,technology,summit", sizeFactor: 8, comingSoon: true },

    // --- Gastronomia ---
    { organizerIndex: 1, title: "Restaurant Week São Paulo", slug: "restaurant-week-sao-paulo", description: "Festival gastronômico com menus especiais nos melhores restaurantes.", venue: { name: "Diversos restaurantes", address: "Vários endereços", city: "São Paulo", state: "SP" }, startsInDays: 22, durationHours: 6, status: "draft", img: "gourmet,restaurant,food,dining", sizeFactor: 5 },
  ];
}

// Eventos da região de Viçosa (MG) — aparecem como "mais próximos" na home.
function vicosaRegionEvents(): SeedEvent[] {
  return [
    { organizerIndex: 1, title: "Festival Universitário de Viçosa", slug: "festival-universitario-vicosa", description: "Evento estudantil com música, praça de alimentação e atrações regionais.", venue: { name: "Campus UFV", address: "Av. Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 6, durationHours: 7, status: "published", img: "university,festival,students,party", sizeFactor: 2, featured: true },
    { organizerIndex: 2, title: "Circuito Cultural UFV", slug: "circuito-cultural-ufv", description: "Programação cultural da UFV com palestras, arte e música.", venue: { name: "Campus UFV", address: "Av. Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 12, durationHours: 6, status: "published", img: "culture,university,art,music" },
    { organizerIndex: 1, title: "Festival de Sabores de Viçosa", slug: "festival-sabores-vicosa", description: "Gastronomia mineira e experiências locais no centro da cidade.", venue: { name: "Praça Silviano Brandão", address: "Centro", city: "Viçosa", state: "MG" }, startsInDays: 18, durationHours: 6, status: "published", img: "food,festival,gastronomy,fair" },
    { organizerIndex: 2, title: "Feira Tecnológica da Zona da Mata", slug: "feira-tecnologica-zona-da-mata", description: "Inovação, software e empreendedorismo no ecossistema de Viçosa.", venue: { name: "Espaço Acadêmico UFV", address: "Av. Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 24, durationHours: 8, status: "published", img: "technology,fair,innovation,startup" },
    { organizerIndex: 1, title: "Arraial da UFV", slug: "arraial-ufv", description: "A festa junina mais animada da cidade, com quadrilha e comidas típicas.", venue: { name: "Campus UFV", address: "Av. Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 30, durationHours: 7, status: "published", img: "bonfire,party,night,festival", sizeFactor: 2 },
    { organizerIndex: 2, title: "Festival de Inverno de Viçosa", slug: "festival-inverno-vicosa", description: "Música, teatro e artes nas noites frias de Viçosa.", venue: { name: "Centro Cultural", address: "Centro", city: "Viçosa", state: "MG" }, startsInDays: 28, durationHours: 6, status: "published", img: "winter,music,night,festival" },
    { organizerIndex: 1, title: "Feira Gastronômica de Coimbra", slug: "feira-gastronomica-coimbra", description: "Sabores típicos da Zona da Mata na vizinha Coimbra.", venue: { name: "Praça Central", address: "Centro", city: "Coimbra", state: "MG" }, startsInDays: 33, durationHours: 5, status: "published", img: "food,fair,street,gastronomy" },
    { organizerIndex: 2, title: "Encontro Sertanejo de Teixeiras", slug: "encontro-sertanejo-teixeiras", description: "Show sertanejo que reúne a região na vizinha Teixeiras.", venue: { name: "Parque de Exposições", address: "Centro", city: "Teixeiras", state: "MG" }, startsInDays: 40, durationHours: 7, status: "published", img: "sertanejo,country,music,show", sizeFactor: 2 },
    { organizerIndex: 1, title: "Mostra Cultural de Araponga", slug: "mostra-cultural-araponga", description: "Música e artes para a cidade serrana próxima a Viçosa.", venue: { name: "Centro Cultural de Araponga", address: "Centro", city: "Araponga", state: "MG" }, startsInDays: 36, durationHours: 5, status: "published", img: "culture,art,music,fair" },
    { organizerIndex: 2, title: "Show da Virada de Viçosa", slug: "show-da-virada-vicosa", description: "A grande festa de réveillon da cidade, com shows e queima de fogos.", venue: { name: "Parque do Cristo", address: "Centro", city: "Viçosa", state: "MG" }, startsInDays: 45, durationHours: 6, status: "published", img: "newyear,fireworks,show,concert", sizeFactor: 3, comingSoon: true },
    { organizerIndex: 1, title: "Forró Universitário de Viçosa", slug: "forro-universitario-vicosa", description: "Noite de forró pé de serra com as melhores bandas da região.", venue: { name: "Quadra Coberta UFV", address: "Av. Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 8, durationHours: 6, status: "published", img: "forro,dance,music,party" },
    { organizerIndex: 2, title: "Festa do Café de Canaã", slug: "festa-do-cafe-canaa", description: "Celebração da colheita do café com música, feira e culinária local.", venue: { name: "Praça da Matriz", address: "Centro", city: "Canaã", state: "MG" }, startsInDays: 10, durationHours: 5, status: "published", img: "coffee,fair,countryside,festival" },
    { organizerIndex: 1, title: "Feira do Livro de Ponte Nova", slug: "feira-livro-ponte-nova", description: "Encontro literário com autores mineiros, oficinas e sebos.", venue: { name: "Centro Cultural", address: "Centro", city: "Ponte Nova", state: "MG" }, startsInDays: 13, durationHours: 8, status: "published", img: "books,reading,fair,culture" },
    { organizerIndex: 2, title: "Arena Sertaneja de Ervália", slug: "arena-sertaneja-ervalia", description: "Grande show sertanejo na vizinha Ervália.", venue: { name: "Parque de Exposições", address: "Centro", city: "Ervália", state: "MG" }, startsInDays: 16, durationHours: 7, status: "published", img: "sertanejo,country,show,music", sizeFactor: 2 },
    { organizerIndex: 1, title: "Festival de Cajuri em Festa", slug: "festival-cajuri-em-festa", description: "Programação comunitária com atrações para toda a família em Cajuri.", venue: { name: "Praça Central de Cajuri", address: "Centro", city: "Cajuri", state: "MG" }, startsInDays: 20, durationHours: 5, status: "published", img: "festival,fair,party,music" },
    { organizerIndex: 2, title: "Mateada Cultural de Paula Cândido", slug: "mateada-cultural-paula-candido", description: "Música, dança e tradições da roça na vizinha Paula Cândido.", venue: { name: "Centro Cultural", address: "Centro", city: "Paula Cândido", state: "MG" }, startsInDays: 26, durationHours: 5, status: "published", img: "culture,music,art,fair" },
  ];
}

// Eventos "acontecendo agora" e nos próximos dias — exercitam o destaque de
// proximidade (badge "Acontecendo agora"/"Em breve") na vitrine e na listagem.
function liveAndImminentEvents(): SeedEvent[] {
  return [
    { organizerIndex: 1, title: "Festival Acontecendo Agora — Viçosa", slug: "festival-acontecendo-agora-vicosa", description: "Festival universitário em andamento neste momento no campus da UFV.", venue: { name: "Campus UFV", address: "Av. Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 0, startOffsetHours: -2, durationHours: 8, status: "published", img: "festival,live,students,party", sizeFactor: 2, featured: true },
    { organizerIndex: 2, title: "Feira Universitária de Hoje", slug: "feira-universitaria-hoje", description: "Feira de empreendedorismo acontecendo agora no Espaço Acadêmico.", venue: { name: "Espaço Acadêmico UFV", address: "Av. Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: 0, startOffsetHours: -1, durationHours: 6, status: "published", img: "fair,live,innovation,students" },
    { organizerIndex: 1, title: "Show de Amanhã em Viçosa", slug: "show-de-amanha-vicosa", description: "Grande show na cidade já amanhã — últimos ingressos disponíveis.", venue: { name: "Parque do Cristo", address: "Centro", city: "Viçosa", state: "MG" }, startsInDays: 1, durationHours: 5, status: "published", img: "concert,night,show,music", sizeFactor: 2, featured: true },
    { organizerIndex: 2, title: "Stand-up Comedy — Esta Semana", slug: "standup-comedy-esta-semana", description: "Noite de comédia stand-up no centro cultural, daqui a poucos dias.", venue: { name: "Centro Cultural", address: "Centro", city: "Viçosa", state: "MG" }, startsInDays: 3, durationHours: 3, status: "published", img: "comedy,standup,theater,night" },
  ];
}

// Eventos já encerrados, distribuídos ao longo dos últimos ~12 meses. Geram
// histórico de pedidos pagos, ingressos utilizados e check-ins — base para os
// comparativos temporais do Analytics e para o histórico do comprador.
function pastEvents(): SeedEvent[] {
  return [
    { organizerIndex: 1, title: "Virada Cultural de Viçosa 2025", slug: "virada-cultural-vicosa-2025", description: "Edição já encerrada da virada cultural, com shows e teatro de rua.", venue: { name: "Praça Silviano Brandão", address: "Centro", city: "Viçosa", state: "MG" }, startsInDays: -18, durationHours: 8, status: "finished", img: "culture,street,music,festival", sizeFactor: 2 },
    { organizerIndex: 2, title: "Festival de Calouros UFV", slug: "festival-calouros-ufv", description: "Recepção dos calouros com música ao vivo — evento encerrado.", venue: { name: "Quadra Coberta UFV", address: "Av. Peter Henry Rolfs, s/n", city: "Viçosa", state: "MG" }, startsInDays: -42, durationHours: 6, status: "finished", img: "students,party,music,university" },
    { organizerIndex: 1, title: "Turnê Nacional 2025 — São Paulo", slug: "turne-nacional-2025-sp", description: "Apresentação da turnê nacional no Allianz Parque, já realizada.", venue: { name: "Allianz Parque", address: "Av. Francisco Matarazzo, 1705", city: "São Paulo", state: "SP" }, startsInDays: -76, durationHours: 4, status: "finished", img: "concert,stadium,tour,lights", sizeFactor: 8 },
    { organizerIndex: 2, title: "Congresso de Tecnologia 2025", slug: "congresso-tecnologia-2025", description: "Conferência de inovação e software já encerrada em Belo Horizonte.", venue: { name: "Expominas", address: "Av. Amazonas, 6200", city: "Belo Horizonte", state: "MG" }, startsInDays: -134, durationHours: 9, status: "finished", img: "conference,technology,innovation,summit", sizeFactor: 4 },
    { organizerIndex: 1, title: "Festival de Verão 2025 — Salvador", slug: "festival-verao-2025-salvador", description: "Edição encerrada do festival de verão na Arena Fonte Nova.", venue: { name: "Arena Fonte Nova", address: "Ladeira da Fonte das Pedras, s/n", city: "Salvador", state: "BA" }, startsInDays: -205, durationHours: 10, status: "finished", img: "summer,festival,concert,beach", sizeFactor: 6 },
    { organizerIndex: 2, title: "Réveillon 2025 — Copacabana", slug: "reveillon-2025-copacabana", description: "Festa de réveillon na orla carioca, já realizada.", venue: { name: "Praia de Copacabana", address: "Av. Atlântica, s/n", city: "Rio de Janeiro", state: "RJ" }, startsInDays: -298, durationHours: 6, status: "finished", img: "newyear,fireworks,beach,night", sizeFactor: 9 },
    { organizerIndex: 1, title: "Festival de Inverno 2024 — Campos do Jordão", slug: "festival-inverno-2024-campos", description: "Temporada de música clássica encerrada no ano passado.", venue: { name: "Auditório Claudio Santoro", address: "Av. Dr. Luís Arrobas Martins, 1880", city: "Campos do Jordão", state: "SP" }, startsInDays: -356, durationHours: 6, status: "finished", img: "classical,orchestra,winter,music", sizeFactor: 4 },
  ];
}

function scenarioEvents(currentScenario: SeedScenario): SeedEvent[] {
  // "vicosa": experiência completa — acontecendo agora + região de Viçosa (mais
  //   próximos) + grandes eventos nacionais + histórico encerrado.
  // "brasil": foco nos eventos nacionais famosos (com alguns regionais e o
  //   histórico encerrado ao final).
  if (currentScenario === "brasil") {
    return [...liveAndImminentEvents().slice(0, 2), ...nationalEvents(), ...vicosaRegionEvents().slice(0, 4), ...pastEvents()];
  }
  return [...liveAndImminentEvents(), ...vicosaRegionEvents(), ...nationalEvents(), ...pastEvents()];
}

// (sem patrocinadores B2B — a receita de "promoções" vem dos impulsionamentos)

const WAITLIST_NAMES = [
  { name: "Lucas Pereira", email: "lucas.pereira@example.com" },
  { name: "Mariana Costa", email: "mariana.costa@example.com" },
  { name: "Rafael Oliveira", email: "rafael.oliveira@example.com" },
  { name: "Beatriz Santos", email: "beatriz.santos@example.com" },
  { name: "Thiago Rocha", email: "thiago.rocha@example.com" },
];

type LotPlan = { name: string; priceFactor: number; qtyFactor: number; startsAt: Date; endsAt: Date };

// Builds 1-3 scheduled lots. "open" → first lot is on sale now; "soon" → the
// first lot only opens in a few days (so the event is "almost on sale" and
// surfaces a waitlist instead).
function buildLotPlans(eventStartsAt: Date, now: Date, mode: "open" | "soon"): LotPlan[] {
  const eventTime = eventStartsAt.getTime();
  const base = mode === "open" ? now.getTime() - 3 * DAY_MS : now.getTime() + 6 * DAY_MS;
  const raw = [
    { name: mode === "open" ? "1º Lote (Promocional)" : "Pré-venda (1º Lote)", priceFactor: 0.8, qtyFactor: 0.4, start: 0, end: 8 * DAY_MS },
    { name: "2º Lote", priceFactor: 1.0, qtyFactor: 0.4, start: 8 * DAY_MS, end: 20 * DAY_MS },
    { name: "3º Lote (Última chance)", priceFactor: 1.25, qtyFactor: 0.2, start: 20 * DAY_MS, end: 40 * DAY_MS },
  ];

  const plans: LotPlan[] = [];
  for (const item of raw) {
    const startsAt = base + item.start;
    if (startsAt >= eventTime) continue; // a lot can't open after the event
    const endsAt = Math.min(base + item.end, eventTime);
    plans.push({ name: item.name, priceFactor: item.priceFactor, qtyFactor: item.qtyFactor, startsAt: new Date(startsAt), endsAt: new Date(endsAt) });
  }

  if (plans.length === 0) {
    plans.push({ name: mode === "open" ? "Lote Único" : "Pré-venda", priceFactor: 0.9, qtyFactor: 1, startsAt: new Date(base), endsAt: eventStartsAt });
  }
  return plans;
}

function isActiveNow(lot: { startsAt?: Date; endsAt?: Date; active: boolean }, now: Date): boolean {
  if (!lot.active) return false;
  if (lot.startsAt && new Date(lot.startsAt).getTime() > now.getTime()) return false;
  if (lot.endsAt && new Date(lot.endsAt).getTime() < now.getTime()) return false;
  return true;
}

function scenarioLabel(currentScenario: SeedScenario): string {
  return currentScenario === "brasil" ? "Brasil" : "Viçosa";
}

async function seed() {
  await connectDB();
  console.log(`Seeding ${scenarioLabel(scenario)} data...`);

  await Promise.all([
    U.deleteMany({}),
    Ev.deleteMany({}),
    TT.deleteMany({}),
    L.deleteMany({}),
    ES.deleteMany({}),
    WL.deleteMany({}),
    Bo.deleteMany({}),
    Ord.deleteMany({}),
    Tk.deleteMany({}),
    CL.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("Password123!", SALT);
  // Contas semeadas já entram com o e-mail verificado, para não aparecerem como
  // pendentes na demonstração (o fluxo de verificação roda só em cadastros reais).
  const emailVerifiedAt = new Date();
  // Built once so the CPF/phone we store on orders matches the inserted users
  // (insertMany preserves order, so users[i] corresponds to seedUsers[i]).
  const seedUsers = baseUsers();
  const users = await U.insertMany(seedUsers.map((user) => ({ ...user, passwordHash, emailVerifiedAt })));

  // Compradores extras (volume de produção), além das contas fixas de login.
  const rng = mulberry32(20260625);
  const extraBuyerSeeds = generateBuyers(60, rng);
  const extraBuyerDocs = await U.insertMany(extraBuyerSeeds.map((user) => ({ ...user, passwordHash, emailVerifiedAt })));

  const now = new Date();
  const modeBySlug = new Map<string, "open" | "soon">();
  const temporalBySlug = new Map<string, EventTemporal>(); // passado / agora / futuro
  const sizeBySlug = new Map<string, number>(); // capacidade relativa (mega eventos vendem muito mais)
  const ticketTypeBlueprint = [
    { name: "Inteira", description: "Ingresso inteiro.", price: 5000, totalQuantity: 250, maxPerOrder: 6 },
    { name: "Meia-entrada", description: "Ingresso com desconto (estudantes, idosos e PCD).", price: 2500, totalQuantity: 120, maxPerOrder: 5 },
    { name: "VIP", description: "Área premium com open bar e acesso exclusivo.", price: 15000, totalQuantity: 60, maxPerOrder: 3 },
  ];

  const eventsToCreate = scenarioEvents(scenario).map((event, index) => {
    const startsAt = new Date(now);
    if (typeof event.startOffsetHours === "number") {
      startsAt.setTime(now.getTime() + event.startOffsetHours * 60 * 60 * 1000);
    } else {
      startsAt.setDate(startsAt.getDate() + event.startsInDays);
    }
    const endsAt = new Date(startsAt.getTime() + event.durationHours * 60 * 60 * 1000);
    const organizer = users[event.organizerIndex];

    if (!organizer) {
      throw new Error(`Invalid organizer index for seed event: ${event.title}`);
    }

    const mode: "open" | "soon" = event.comingSoon ? "soon" : "open";
    modeBySlug.set(event.slug, mode);
    sizeBySlug.set(event.slug, event.sizeFactor ?? 1);

    // Classifica a janela temporal a partir das datas calculadas.
    const temporal: EventTemporal =
      endsAt.getTime() < now.getTime() ? "past" : startsAt.getTime() <= now.getTime() ? "live" : "future";
    temporalBySlug.set(event.slug, temporal);

    return {
      organizerId: organizer._id.toString(),
      title: event.title,
      slug: event.slug,
      description: event.description,
      venue: event.venue,
      startsAt,
      endsAt,
      // Foto de capa única por evento: ID específico do Picsum (CDN, sem rate-limit).
      // LoremFlickr foi descartado por repetir a mesma foto em páginas com muitas
      // imagens; ?seed do Picsum também podia colidir, então usamos /id/ distinto.
      coverImageUrl: `https://picsum.photos/id/${PICSUM_IDS[index % PICSUM_IDS.length]!}/1200/675`,
      featured: Boolean(event.featured) && event.status === "published",
      status: event.status,
    };
  });

  await Ev.create(eventsToCreate);
  const events = await Ev.find({});

  // --- Ticket types + scheduled lots -----------------------------------------
  let lotCount = 0;
  for (const eventDoc of events) {
    const eventId = eventDoc._id.toString();
    const startsAt = new Date(eventsToCreate.find((event) => event.slug === eventDoc.slug)!.startsAt);
    const mode = modeBySlug.get(eventDoc.slug) ?? "open";
    const temporal = temporalBySlug.get(eventDoc.slug) ?? "future";
    const size = sizeBySlug.get(eventDoc.slug) ?? 1;

    await TT.create(
      ticketTypeBlueprint.map((type) => ({
        eventId,
        name: type.name,
        description: type.description,
        price: type.price,
        totalQuantity: Math.round(type.totalQuantity * size),
        maxPerOrder: type.maxPerOrder,
        soldQuantity: 0,
      })),
    );

    const ticketTypes = await TT.find({ eventId });
    for (const ticketType of ticketTypes) {
      // Eventos encerrados receberam um único lote histórico (já inativo) que
      // abrigou todas as vendas anteriores ao evento.
      if (temporal === "past") {
        await L.create({
          ticketTypeId: ticketType._id.toString(),
          name: "Lote Único",
          price: ticketType.price,
          quantity: ticketType.totalQuantity,
          soldQuantity: 0,
          startsAt: new Date(startsAt.getTime() - 30 * DAY_MS),
          endsAt: startsAt,
          active: false,
        });
        lotCount += 1;
        continue;
      }

      const plans = buildLotPlans(startsAt, now, mode);
      for (const plan of plans) {
        await L.create({
          ticketTypeId: ticketType._id.toString(),
          name: plan.name,
          price: Math.round(ticketType.price * plan.priceFactor),
          quantity: Math.max(1, Math.round(ticketType.totalQuantity * plan.qtyFactor)),
          soldQuantity: 0,
          startsAt: plan.startsAt,
          endsAt: plan.endsAt,
          active: true,
        });
        lotCount += 1;
      }
    }
  }

  // --- Per-event operators (EventStaff) ---------------------------------------
  const [, organizer1, organizer2, buyer1, buyer2, buyer3, buyer4, buyer5, operator] = users;
  if (!organizer1 || !organizer2 || !buyer1 || !buyer2 || !buyer3 || !buyer4 || !buyer5 || !operator) {
    throw new Error("Seed users missing.");
  }
  const organizer1Id = organizer1._id.toString();

  for (const event of events.slice(0, 5)) {
    await ES.create({ eventId: event._id.toString(), userId: operator._id.toString(), role: "operator", addedBy: event.organizerId });
  }
  const marinaEvent = events.find((event) => event.organizerId === organizer1Id);
  if (marinaEvent) {
    await ES.create({ eventId: marinaEvent._id.toString(), userId: organizer2._id.toString(), role: "operator", addedBy: marinaEvent.organizerId });
  }

  // --- Waitlist for "coming soon" events --------------------------------------
  const buyersForWaitlist: SeedUser[] = [seedUsers[3]!, seedUsers[4]!, seedUsers[5]!];
  let waitlistCount = 0;
  for (const eventDoc of events) {
    if (modeBySlug.get(eventDoc.slug) !== "soon") continue;
    const entries = [
      ...buyersForWaitlist.map((buyer) => ({ name: buyer.name, email: buyer.email, phone: buyer.phone })),
      ...WAITLIST_NAMES.slice(0, 3).map((person) => ({ name: person.name, email: person.email, phone: randomPhone() })),
    ];
    for (const entry of entries) {
      try {
        await WL.create({ eventId: eventDoc._id.toString(), name: entry.name, email: entry.email, phone: entry.phone, status: "waiting" });
        waitlistCount += 1;
      } catch (err: unknown) {
        // Índice único (eventId,userId) trata guests (userId null) como colisão — ignora duplicados de guest.
        if ((err as { code?: number })?.code !== 11000) throw err;
      }
    }
  }

  // --- Impulsionamentos (boosts) dos eventos em destaque ----------------------
  // O organizador paga para destacar o próprio evento; é a receita de "promoções".
  const featuredEvents = events.filter((event) => eventsToCreate.find((created) => created.slug === event.slug)?.featured);
  const boostDocs: Record<string, unknown>[] = [];
  for (let eventIndex = 0; eventIndex < featuredEvents.length; eventIndex += 1) {
    const eventDoc = featuredEvents[eventIndex]!;
    const count = 1 + (eventIndex % 2); // 1-2 impulsionamentos por evento
    for (let boostIndex = 0; boostIndex < count; boostIndex += 1) {
      const pkg = pick([...BOOST_PACKAGES], eventIndex + boostIndex);
      const startsAt = new Date(now.getTime() - (boostIndex + 1) * DAY_MS);
      boostDocs.push({
        eventId: eventDoc._id.toString(),
        organizerId: eventDoc.organizerId,
        packageId: pkg.id,
        packageLabel: pkg.label,
        amount: pkg.amount,
        durationDays: pkg.durationDays,
        status: "active",
        paymentIntentId: `boost_seed_${eventDoc.slug}_${boostIndex}`,
        startsAt,
        expiresAt: new Date(startsAt.getTime() + pkg.durationDays * DAY_MS),
      });
    }
  }
  if (boostDocs.length) await Bo.insertMany(boostDocs);
  const boostCount = boostDocs.length;

  // --- Orders + tickets + check-ins (escala de produção) ----------------------
  const paymentMethods = ["pix", "credit_card", "boleto"] as const;

  // Pool de compradores: contas fixas de login + compradores gerados.
  const buyerPool = [
    { doc: buyer1, seed: seedUsers[3]! },
    { doc: buyer2, seed: seedUsers[4]! },
    { doc: buyer3, seed: seedUsers[5]! },
    { doc: buyer4, seed: seedUsers[6]! },
    { doc: buyer5, seed: seedUsers[7]! },
    ...extraBuyerDocs.map((doc, index) => ({ doc, seed: extraBuyerSeeds[index]! })),
  ];

  // Eventos que receberam vendas: encerrados (histórico) + publicados com 1º
  // lote à venda agora (inclui os "acontecendo agora").
  const sellableEvents = events.filter((event) => {
    const temporal = temporalBySlug.get(event.slug) ?? "future";
    if (temporal === "past") return true;
    return event.status === "published" && modeBySlug.get(event.slug) === "open";
  });
  const startsBySlug = new Map(eventsToCreate.map((event) => [event.slug, event.startsAt.getTime()]));

  type OrderMeta = { issue: boolean; temporal: EventTemporal; checkinProb: number; eventStartMs: number; eventId: string; ticketTypeId: string; ownerId: string; quantity: number };
  const orderDocs: Record<string, unknown>[] = [];
  const orderMeta: OrderMeta[] = [];
  const ttIncOps: any[] = [];
  const lotIncOps: any[] = [];

  // Distribuição de status por janela temporal: eventos passados quase não têm
  // pedidos pendentes (já se resolveram); futuros/agora seguem o funil normal.
  function pickStatus(value: number, temporal: EventTemporal): "paid" | "pending" | "expired" | "cancelled" {
    if (temporal === "past") {
      if (value < 0.9) return "paid";
      if (value < 0.96) return "cancelled";
      return "expired";
    }
    if (value < 0.8) return "paid";
    if (value < 0.89) return "pending";
    if (value < 0.96) return "expired";
    return "cancelled";
  }

  let orderSeq = 0;
  for (const eventDoc of sellableEvents) {
    const eventId = eventDoc._id.toString();
    const temporal = temporalBySlug.get(eventDoc.slug) ?? "future";
    const eventStartMs = startsBySlug.get(eventDoc.slug) ?? now.getTime();
    // Probabilidade de check-in: alto em eventos encerrados, médio nos que
    // acontecem agora, baixo nos próximos (≤14 dias) e zero nos distantes.
    const checkinProb =
      temporal === "past" ? 0.85 : temporal === "live" ? 0.5 : (eventStartMs - now.getTime()) / DAY_MS <= 14 ? 0.3 : 0;

    const ticketTypes = await TT.find({ eventId });
    const typeInfos: Array<{ tt: any; lot: any; unitPrice: number; remaining: number; lotRemaining: number; soldTT: number; soldLot: number }> = [];
    for (const ticketType of ticketTypes) {
      const lots = await L.find({ ticketTypeId: ticketType._id.toString() });
      // Passados usam o lote histórico (já inativo); os demais, o lote ativo agora.
      const lot = temporal === "past" ? lots[0] : lots.find((candidate) => isActiveNow(candidate, now));
      if (!lot) continue;
      typeInfos.push({
        tt: ticketType,
        lot,
        unitPrice: Number(lot.price),
        remaining: Number(ticketType.totalQuantity),
        lotRemaining: Number(lot.quantity),
        soldTT: 0,
        soldLot: 0,
      });
    }
    if (typeInfos.length === 0) continue;

    const totalWeight = typeInfos.reduce((sum, info) => sum + ticketTypeWeight(info.tt.name), 0);
    const size = sizeBySlug.get(eventDoc.slug) ?? 1;
    const targetOrders = clamp(Math.round((8 + size * 2.2) * (0.85 + rng() * 0.4)), 6, 70);

    for (let k = 0; k < targetOrders; k += 1) {
      // escolha ponderada do tipo de ingresso (Inteira > Meia > VIP)
      let roll = rng() * totalWeight;
      let info = typeInfos[0]!;
      for (const candidate of typeInfos) {
        roll -= ticketTypeWeight(candidate.tt.name);
        if (roll <= 0) { info = candidate; break; }
      }

      const status = pickStatus(rng(), temporal);
      const maxPer = Math.min(Number(info.tt.maxPerOrder ?? 5), 4);
      let quantity = 1 + Math.floor(rng() * rng() * maxPer); // 1..maxPer, enviesado para baixo

      if (status === "paid") {
        const available = Math.min(info.remaining - info.soldTT, info.lotRemaining - info.soldLot);
        if (available <= 0) continue; // lote esgotado → pula este pedido pago
        quantity = Math.min(quantity, available);
      }

      const subtotal = info.unitPrice * quantity;
      const serviceFee = Math.round(subtotal * 0.05);
      const buyer = pick(buyerPool, orderSeq + k);

      // Datas coerentes com a janela temporal: passados compram antes do evento;
      // futuros/agora compram nos últimos ~30 dias.
      const createdAt =
        temporal === "past"
          ? new Date(eventStartMs - (2 + rng() * 33) * DAY_MS)
          : new Date(now.getTime() - rng() * 30 * DAY_MS);
      const paidAt = status === "paid" ? createdAt : undefined;
      const expiresAt =
        temporal === "past"
          ? new Date(createdAt.getTime() + 15 * 60 * 1000)
          : new Date(now.getTime() + (status === "expired" ? -60 : 15) * 60 * 1000);

      orderDocs.push({
        buyerId: buyer.doc._id.toString(),
        eventId,
        items: [{ ticketTypeId: info.tt._id.toString(), lotId: info.lot._id.toString(), quantity, unitPrice: info.unitPrice }],
        payer: { name: buyer.seed.name, cpf: buyer.seed.cpf ?? generateCpf(), email: buyer.seed.email, phone: buyer.seed.phone },
        paymentMethod: pick([...paymentMethods], k),
        serviceFee,
        totalAmount: subtotal + serviceFee,
        status,
        paymentIntentId: `seed_${eventDoc.slug}_${orderSeq + k}`,
        expiresAt,
        paidAt,
        createdAt,
        updatedAt: paidAt ?? createdAt,
      });
      orderMeta.push({
        issue: status === "paid",
        temporal,
        checkinProb,
        eventStartMs,
        eventId,
        ticketTypeId: info.tt._id.toString(),
        ownerId: buyer.doc._id.toString(),
        quantity,
      });

      if (status === "paid") {
        info.soldTT += quantity;
        info.soldLot += quantity;
      }
    }
    orderSeq += targetOrders;

    for (const info of typeInfos) {
      if (info.soldTT > 0) {
        ttIncOps.push({ updateOne: { filter: { _id: info.tt._id }, update: { $inc: { soldQuantity: info.soldTT } } } });
        lotIncOps.push({ updateOne: { filter: { _id: info.lot._id }, update: { $inc: { soldQuantity: info.soldLot } } } });
      }
    }
  }

  // Inserções em lote — rápidas mesmo contra um banco remoto. Desligamos os
  // timestamps automáticos para preservar o createdAt histórico que definimos.
  const insertedOrders = await Ord.insertMany(orderDocs, { timestamps: false });

  const ticketDocs: Record<string, unknown>[] = [];
  for (let i = 0; i < insertedOrders.length; i += 1) {
    const meta = orderMeta[i]!;
    if (!meta.issue) continue;
    for (let q = 0; q < meta.quantity; q += 1) {
      const code = generateCode();
      const used = meta.checkinProb > 0 && rng() < meta.checkinProb;
      // Check-in de evento passado ocorre durante o evento; nos atuais, há poucas horas.
      const usedAt = used
        ? meta.temporal === "past"
          ? new Date(meta.eventStartMs + rng() * 4 * 60 * 60 * 1000)
          : new Date(now.getTime() - Math.floor(rng() * 6 * 60 * 60 * 1000))
        : undefined;
      ticketDocs.push({
        orderId: insertedOrders[i]!._id.toString(),
        eventId: meta.eventId,
        ticketTypeId: meta.ticketTypeId,
        ownerId: meta.ownerId,
        code,
        secret: generateSecret(code, meta.ownerId),
        status: used ? "used" : "valid",
        usedAt,
        usedBy: used ? operator._id.toString() : undefined,
      });
    }
  }
  const insertedTickets = ticketDocs.length ? await Tk.insertMany(ticketDocs) : [];

  const checkinDocs: Record<string, unknown>[] = [];
  for (let i = 0; i < insertedTickets.length; i += 1) {
    if (ticketDocs[i]!.status !== "used") continue;
    checkinDocs.push({
      ticketId: insertedTickets[i]!._id.toString(),
      operatorId: operator._id.toString(),
      eventId: ticketDocs[i]!.eventId,
      occurredAt: ticketDocs[i]!.usedAt,
      offline: i % 2 === 0,
      deviceId: "seed-scanner",
    });
  }
  if (checkinDocs.length) await CL.insertMany(checkinDocs);

  if (ttIncOps.length) await TT.bulkWrite(ttIncOps);
  if (lotIncOps.length) await L.bulkWrite(lotIncOps);

  // --- Cortesias (ingressos gratuitos, sem valor monetário) -------------------
  // Pedidos marcados com paymentIntentId "comp_": totalAmount/serviceFee = 0, de
  // modo que não entram na receita do Analytics, mas alimentam a aba Cortesias.
  const courtesyBuyers = [buyer1, buyer2, buyer3, buyer4, buyer5];
  const courtesyEvents = events
    .filter((event) => event.status === "published" && modeBySlug.get(event.slug) === "open")
    .slice(0, 8);
  let courtesyOrderCount = 0;
  let courtesyTicketCount = 0;
  for (let ci = 0; ci < courtesyEvents.length; ci += 1) {
    const eventDoc = courtesyEvents[ci]!;
    const ticketTypes = await TT.find({ eventId: eventDoc._id.toString() });
    if (ticketTypes.length === 0) continue;
    const handouts = 1 + (ci % 3); // 1-3 cortesias por evento
    for (let h = 0; h < handouts; h += 1) {
      const ticketType = ticketTypes[h % ticketTypes.length]!;
      const lots = await L.find({ ticketTypeId: ticketType._id.toString() });
      const lot = lots.find((candidate) => isActiveNow(candidate, now)) ?? lots[0];
      if (!lot) continue;
      const recipient = pick(courtesyBuyers, ci + h);
      const quantity = 1 + (h % 2); // 1-2 ingressos por cortesia
      const order = await Ord.create({
        buyerId: recipient._id.toString(),
        eventId: eventDoc._id.toString(),
        items: [{ ticketTypeId: ticketType._id.toString(), lotId: lot._id.toString(), quantity, unitPrice: 0 }],
        serviceFee: 0,
        totalAmount: 0,
        status: "paid",
        paymentIntentId: `comp_seed_${eventDoc.slug}_${h}`,
        expiresAt: new Date(now.getTime()),
        paidAt: new Date(now.getTime() - Math.floor(rng() * 10 * DAY_MS)),
      });
      const courtesyTickets: Record<string, unknown>[] = [];
      for (let q = 0; q < quantity; q += 1) {
        const code = generateCode();
        courtesyTickets.push({
          orderId: order._id.toString(),
          eventId: eventDoc._id.toString(),
          ticketTypeId: ticketType._id.toString(),
          ownerId: recipient._id.toString(),
          code,
          secret: generateSecret(code, recipient._id.toString()),
          status: "valid",
        });
      }
      await Tk.insertMany(courtesyTickets);
      await TT.findByIdAndUpdate(ticketType._id.toString(), { $inc: { soldQuantity: quantity } }, { new: true });
      await L.findByIdAndUpdate(lot._id.toString(), { $inc: { soldQuantity: quantity } }, { new: true });
      courtesyOrderCount += 1;
      courtesyTicketCount += quantity;
    }
  }

  const orderCount = orderDocs.length + courtesyOrderCount;
  const ticketCount = ticketDocs.length + courtesyTicketCount;
  const checkinCount = checkinDocs.length;

  console.log(
    "Seeded:",
    await U.countDocuments(), "users,",
    await Ev.countDocuments(), "events,",
    await TT.countDocuments(), "ticket types,",
    lotCount, "lots,",
    await ES.countDocuments(), "staff,",
    waitlistCount, "waitlist,",
    boostCount, "boosts,",
    orderCount, "orders,",
    ticketCount, "tickets,",
    checkinCount, "check-ins,",
    courtesyOrderCount, "cortesias",
  );
  console.log(`Scenario: ${scenarioLabel(scenario)}`);
  console.log("Login: any seeded e-mail (e.g. buyer1@ticketflow.com) — senha Password123!");
  console.log("Done.");
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
