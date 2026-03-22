import { HttpStatusScreen } from "@fins/ui-kit";
import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type State = { hasError: boolean };

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <HttpStatusScreen
          code="500"
          actionText="goto /index"
          onAction={() => {
            window.location.assign(`${window.location.origin}/`);
          }}
        />
      );
    }
    return this.props.children;
  }
}
