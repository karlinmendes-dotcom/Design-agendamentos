/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as agendamentos from "../agendamentos.js";
import type * as atendente from "../atendente.js";
import type * as barbearias from "../barbearias.js";
import type * as barbeiros from "../barbeiros.js";
import type * as clientes from "../clientes.js";
import type * as configuracoes from "../configuracoes.js";
import type * as crons from "../crons.js";
import type * as datasBloqueadas from "../datasBloqueadas.js";
import type * as gemini from "../gemini.js";
import type * as horarios from "../horarios.js";
import type * as midias from "../midias.js";
import type * as push from "../push.js";
import type * as pushTokens from "../pushTokens.js";
import type * as seed from "../seed.js";
import type * as servicos from "../servicos.js";
import type * as storage from "../storage.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  agendamentos: typeof agendamentos;
  atendente: typeof atendente;
  barbearias: typeof barbearias;
  barbeiros: typeof barbeiros;
  clientes: typeof clientes;
  configuracoes: typeof configuracoes;
  crons: typeof crons;
  datasBloqueadas: typeof datasBloqueadas;
  gemini: typeof gemini;
  horarios: typeof horarios;
  midias: typeof midias;
  push: typeof push;
  pushTokens: typeof pushTokens;
  seed: typeof seed;
  servicos: typeof servicos;
  storage: typeof storage;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
