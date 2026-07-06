export function registerProvider(program) {
  program
    .command("provider [subcommand]")
    .description("Manage provider connections (use 'providers' for the full interface)")
    .allowUnknownOption()
    .allowExcessArguments()
    .action(() => {
      console.log(`
  Use \`moatazalai providers\` for the full provider management interface:

    moatazalai providers available   — show provider catalog
    moatazalai providers list        — list configured connections
    moatazalai providers test <name> — test a provider connection
    moatazalai providers test-all    — test all active connections
    moatazalai providers validate    — validate local configuration
`);
    });
}
