// Side-effect imports: each of these calls registerStepComponent() at
// module scope. Importing this ONE file (from main.tsx, before the app
// renders) guarantees every known ui_component is registered regardless of
// which page mounts first.
import "@/features/application/consumer-lender-apply/consumer-lender-apply.steps";
