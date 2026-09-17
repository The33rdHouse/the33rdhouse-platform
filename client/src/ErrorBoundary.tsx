import { Component, type ReactNode } from "react";
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="recovery">
        <h1>Console could not display this page</h1>
        <p>Your server records have not been changed by this display error.</p>
        <button onClick={() => location.reload()}>Reload console</button>
      </main>
    ) : (
      this.props.children
    );
  }
}
