import { Link } from "react-router-dom";
import { Button } from "@craft-apex/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-4xl font-bold">404</p>
      <p className="text-muted-foreground">This page could not be found.</p>
      <Button asChild>
        <Link to="/dashboard">Back to dashboard</Link>
      </Button>
    </div>
  );
}
