/**
 * MCP Authorization Scopes — Defines permission scopes for each MCP tool.
 *
 * Each tool requires specific scopes to execute. API keys can be configured
 * with a subset of scopes to limit tool access (least-privilege).
 */

// ============ Scope Definitions ============

/** All available MCP scopes */
export const MCP_SCOPE_LIST = [
  "read:health",
  "read:combos",
  "write:combos",
  "read:quota",
  "read:usage",
  "read:models",
  "execute:completions",
  "execute:search",
  "write:budget",
  "write:resilience",
  "pricing:write",
  "read:cache",
  "write:cache",
  "read:compression",
  "write:compression",
  "read:proxies",
] as const;

export type McpScope = (typeof MCP_SCOPE_LIST)[number];

// ============ Tool → Scope Mapping ============

/** Maps each MCP tool to its required scopes */
export const MCP_TOOL_SCOPES: Record<string, readonly McpScope[]> = {
  // Phase 1: Essential Tools
  moatazalai_get_health: ["read:health"],
  moatazalai_list_combos: ["read:combos"],
  moatazalai_get_combo_metrics: ["read:combos"],
  moatazalai_switch_combo: ["write:combos"],
  moatazalai_check_quota: ["read:quota"],
  moatazalai_route_request: ["execute:completions"],
  moatazalai_web_search: ["execute:search"],
  moatazalai_web_fetch: ["execute:search"],
  moatazalai_cost_report: ["read:usage"],
  moatazalai_list_models_catalog: ["read:models"],

  // Phase 2: Advanced Tools
  moatazalai_simulate_route: ["read:health", "read:combos"],
  moatazalai_set_budget_guard: ["write:budget"],
  moatazalai_set_resilience_profile: ["write:resilience"],
  moatazalai_test_combo: ["execute:completions", "read:combos"],
  moatazalai_get_provider_metrics: ["read:health"],
  moatazalai_best_combo_for_task: ["read:combos", "read:health"],
  moatazalai_explain_route: ["read:health", "read:usage"],
  moatazalai_get_session_snapshot: ["read:usage"],
  moatazalai_db_health_check: ["read:health", "write:resilience"],
  moatazalai_sync_pricing: ["pricing:write"],
  moatazalai_cache_stats: ["read:cache"],
  moatazalai_cache_flush: ["write:cache"],
  moatazalai_compression_status: ["read:compression"],
  moatazalai_compression_configure: ["write:compression"],
  moatazalai_set_compression_engine: ["write:compression"],
  moatazalai_list_compression_combos: ["read:compression"],
  moatazalai_compression_combo_stats: ["read:compression"],
  moatazalai_oneproxy_fetch: ["read:proxies"],
  moatazalai_oneproxy_rotate: ["read:proxies"],
  moatazalai_oneproxy_stats: ["read:proxies"],

  // Web-session pool observability (read) + lifecycle (write)
  moatazalai_pool_status: ["read:health"],
  moatazalai_pool_sessions: ["read:health"],
  moatazalai_pool_health: ["read:health"],
  moatazalai_pool_reset: ["write:resilience"],
  moatazalai_pool_warm: ["write:resilience"],
  // Stealth browser pool observability (#3368 PR7)
  moatazalai_browser_pool_status: ["read:health"],
} as const;
