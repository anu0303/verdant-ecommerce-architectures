import { Component } from "react";
import { Link } from "react-router-dom";

export default class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("Page crashed:", error, info); }
  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="font-display text-2xl text-ink">Something went wrong on this page.</p>
          <p className="mt-2 font-body text-sm text-ink/60">
            The rest of the site is unaffected — try heading back to the shop.
          </p>
          <Link to="/shop" className="mt-6 inline-block rounded-tag bg-ink px-6 py-3 font-body text-sm text-paper hover:bg-moss">
            Back to shop
          </Link>
        </div>
      );
    }
    return this.props.children;
  }
}
