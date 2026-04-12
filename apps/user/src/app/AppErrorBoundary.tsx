import { HttpStatusScreen } from "@fins/ui-kit";
import { Component, type ErrorInfo, type ReactNode } from "react";

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type State = { hasError: boolean; detailText?: string };

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, detailText: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <HttpStatusScreen
          code="500"
          detailText={this.state.detailText}
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
